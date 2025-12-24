import { describe, it, expect } from "vitest";
import {
  BRAZILIAN_CROPS,
  CROP_CATEGORIES,
  getCropById,
  getCropsByCategory,
  getAllCategories,
  calculateETc,
  getKcForDay,
  calculateSeasonalWaterRequirement,
} from "../crop-database";

describe("Crop Database", () => {
  describe("BRAZILIAN_CROPS", () => {
    it("should contain major Brazilian crops", () => {
      expect(BRAZILIAN_CROPS.length).toBeGreaterThan(0);
      
      const cropIds = BRAZILIAN_CROPS.map((crop) => crop.id);
      expect(cropIds).toContain("soybeans");
      expect(cropIds).toContain("corn");
      expect(cropIds).toContain("sugarcane-virgin");
      expect(cropIds).toContain("coffee");
      expect(cropIds).toContain("cotton");
    });

    it("should have valid Kc values for all crops", () => {
      BRAZILIAN_CROPS.forEach((crop) => {
        expect(crop.kcInitial).toBeGreaterThan(0);
        expect(crop.kcInitial).toBeLessThanOrEqual(1.5);
        
        expect(crop.kcMid).toBeGreaterThan(0);
        expect(crop.kcMid).toBeLessThanOrEqual(1.5);
        
        expect(crop.kcEnd).toBeGreaterThan(0);
        expect(crop.kcEnd).toBeLessThanOrEqual(1.5);
      });
    });

    it("should have valid growth stages for all crops", () => {
      BRAZILIAN_CROPS.forEach((crop) => {
        expect(crop.growthStages.initial).toBeGreaterThan(0);
        expect(crop.growthStages.development).toBeGreaterThan(0);
        expect(crop.growthStages.midSeason).toBeGreaterThan(0);
        expect(crop.growthStages.lateSeason).toBeGreaterThan(0);
      });
    });

    it("should have both English and Portuguese names", () => {
      BRAZILIAN_CROPS.forEach((crop) => {
        expect(crop.name).toBeTruthy();
        expect(crop.namePortuguese).toBeTruthy();
        // Some crops like Banana have the same name in both languages
        if (crop.id !== "banana") {
          expect(crop.name).not.toBe(crop.namePortuguese);
        }
      });
    });
  });

  describe("getCropById", () => {
    it("should return crop by ID", () => {
      const soybean = getCropById("soybeans");
      expect(soybean).toBeDefined();
      expect(soybean?.id).toBe("soybeans");
      expect(soybean?.name).toBe("Soybeans");
    });

    it("should return undefined for invalid ID", () => {
      const invalid = getCropById("invalid-crop-id");
      expect(invalid).toBeUndefined();
    });
  });

  describe("getCropsByCategory", () => {
    it("should return crops in Grains & Cereals category", () => {
      const grains = getCropsByCategory(CROP_CATEGORIES.GRAINS);
      expect(grains.length).toBeGreaterThan(0);
      
      grains.forEach((crop) => {
        expect(crop.category).toBe(CROP_CATEGORIES.GRAINS);
      });
    });

    it("should return crops in Oilseeds category", () => {
      const oilseeds = getCropsByCategory(CROP_CATEGORIES.OILSEEDS);
      expect(oilseeds.length).toBeGreaterThan(0);
      
      const ids = oilseeds.map((c) => c.id);
      expect(ids).toContain("soybeans");
    });

    it("should return empty array for invalid category", () => {
      const invalid = getCropsByCategory("Invalid Category");
      expect(invalid).toEqual([]);
    });
  });

  describe("getAllCategories", () => {
    it("should return all unique categories", () => {
      const categories = getAllCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain(CROP_CATEGORIES.GRAINS);
      expect(categories).toContain(CROP_CATEGORIES.OILSEEDS);
      expect(categories).toContain(CROP_CATEGORIES.SUGAR);
    });
  });

  describe("calculateETc", () => {
    it("should calculate crop evapotranspiration correctly", () => {
      const et0 = 5.0;
      const kc = 1.15;
      const etc = calculateETc(et0, kc);
      
      expect(etc).toBe(5.75);
    });

    it("should handle different ET0 and Kc values", () => {
      expect(calculateETc(4.0, 0.4)).toBeCloseTo(1.6, 2);
      expect(calculateETc(6.0, 1.2)).toBeCloseTo(7.2, 2);
      expect(calculateETc(3.5, 0.75)).toBeCloseTo(2.625, 2);
    });

    it("should return 0 when ET0 is 0", () => {
      expect(calculateETc(0, 1.15)).toBe(0);
    });
  });

  describe("getKcForDay", () => {
    const soybeans = getCropById("soybeans")!;

    it("should return Kc_ini during initial stage", () => {
      const kc = getKcForDay(soybeans, 5);
      expect(kc).toBe(soybeans.kcInitial);
    });

    it("should return Kc_mid during mid-season stage", () => {
      // Initial: 15 days, Development: 25 days
      // Mid-season starts at day 40
      const kc = getKcForDay(soybeans, 50);
      expect(kc).toBe(soybeans.kcMid);
    });

    it("should interpolate during development stage", () => {
      // Day 20 is 5 days into development (15 initial + 5)
      const kc = getKcForDay(soybeans, 20);
      
      // Should be between Kc_ini and Kc_mid
      expect(kc).toBeGreaterThan(soybeans.kcInitial);
      expect(kc).toBeLessThan(soybeans.kcMid);
    });

    it("should interpolate during late season stage", () => {
      // Initial: 15, Dev: 25, Mid: 50 = 90 days
      // Day 100 is 10 days into late season
      const kc = getKcForDay(soybeans, 100);
      
      // Should be between Kc_mid and Kc_end
      expect(kc).toBeLessThan(soybeans.kcMid);
      expect(kc).toBeGreaterThan(soybeans.kcEnd);
    });

    it("should return Kc_end for days beyond growing season", () => {
      const totalDays = 
        soybeans.growthStages.initial +
        soybeans.growthStages.development +
        soybeans.growthStages.midSeason +
        soybeans.growthStages.lateSeason;
      
      const kc = getKcForDay(soybeans, totalDays + 10);
      expect(kc).toBe(soybeans.kcEnd);
    });

    it("should handle negative days", () => {
      const kc = getKcForDay(soybeans, -5);
      expect(kc).toBe(soybeans.kcEnd);
    });
  });

  describe("calculateSeasonalWaterRequirement", () => {
    const corn = getCropById("corn")!;
    const et0 = 5.0;

    it("should calculate total growing season days correctly", () => {
      const result = calculateSeasonalWaterRequirement(corn, et0);
      
      const expectedDays =
        corn.growthStages.initial +
        corn.growthStages.development +
        corn.growthStages.midSeason +
        corn.growthStages.lateSeason;
      
      expect(result.totalDays).toBe(expectedDays);
    });

    it("should calculate average Kc correctly", () => {
      const result = calculateSeasonalWaterRequirement(corn, et0);
      
      // Average Kc should be between min and max Kc values
      const minKc = Math.min(corn.kcInitial, corn.kcMid, corn.kcEnd);
      const maxKc = Math.max(corn.kcInitial, corn.kcMid, corn.kcEnd);
      
      expect(result.averageKc).toBeGreaterThanOrEqual(minKc);
      expect(result.averageKc).toBeLessThanOrEqual(maxKc);
    });

    it("should calculate total water requirement", () => {
      const result = calculateSeasonalWaterRequirement(corn, et0);
      
      // Total water should be positive and reasonable
      expect(result.totalWaterMm).toBeGreaterThan(0);
      expect(result.totalWaterMm).toBeLessThan(10000); // Sanity check
    });

    it("should calculate daily average correctly", () => {
      const result = calculateSeasonalWaterRequirement(corn, et0);
      
      const expectedDailyAvg = result.totalWaterMm / result.totalDays;
      expect(result.dailyAverageWaterMm).toBeCloseTo(expectedDailyAvg, 2);
    });

    it("should scale with ET0", () => {
      const result1 = calculateSeasonalWaterRequirement(corn, 4.0);
      const result2 = calculateSeasonalWaterRequirement(corn, 8.0);
      
      // Doubling ET0 should approximately double water requirement
      expect(result2.totalWaterMm).toBeCloseTo(result1.totalWaterMm * 2, 0);
    });
  });

  describe("Specific Brazilian Crops", () => {
    it("should have correct data for soybeans", () => {
      const soybean = getCropById("soybeans")!;
      
      expect(soybean.namePortuguese).toBe("Soja");
      expect(soybean.category).toBe(CROP_CATEGORIES.OILSEEDS);
      expect(soybean.kcMid).toBeGreaterThan(1.0);
    });

    it("should have correct data for sugarcane", () => {
      const sugarcane = getCropById("sugarcane-virgin")!;
      
      expect(sugarcane.namePortuguese).toContain("Cana-de-açúcar");
      expect(sugarcane.category).toBe(CROP_CATEGORIES.SUGAR);
      expect(sugarcane.maxHeight).toBeGreaterThan(2.0);
    });

    it("should have correct data for coffee", () => {
      const coffee = getCropById("coffee")!;
      
      expect(coffee.namePortuguese).toBe("Café");
      expect(coffee.category).toBe(CROP_CATEGORIES.BEVERAGES);
      // Coffee has relatively stable Kc throughout season
      expect(coffee.kcInitial).toBeCloseTo(coffee.kcMid, 0.2);
    });

    it("should have correct data for beans", () => {
      const beans = getCropById("beans-dry")!;
      
      expect(beans.namePortuguese).toBe("Feijão");
      expect(beans.category).toBe(CROP_CATEGORIES.LEGUMES);
      expect(beans.kcEnd).toBeLessThan(beans.kcMid);
    });
  });
});
