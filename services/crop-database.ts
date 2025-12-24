/**
 * Crop Coefficient Database
 * Based on FAO-56 Irrigation and Drainage Paper
 * 
 * Kc values for common Brazilian agricultural crops
 * Growth stages: Initial, Development, Mid-season, Late season
 */

export interface CropData {
  id: string;
  name: string;
  namePortuguese: string;
  category: string;
  description: string;
  kcInitial: number;
  kcMid: number;
  kcEnd: number;
  maxHeight: number; // meters
  growthStages: {
    initial: number; // days
    development: number; // days
    midSeason: number; // days
    lateSeason: number; // days
  };
}

export const CROP_CATEGORIES = {
  GRAINS: "Grains & Cereals",
  LEGUMES: "Legumes & Pulses",
  FIBER: "Fiber Crops",
  SUGAR: "Sugar Crops",
  BEVERAGES: "Beverage Crops",
  FRUITS: "Fruits",
  VEGETABLES: "Vegetables",
  OILSEEDS: "Oilseeds",
} as const;

/**
 * Crop coefficient database for major Brazilian crops
 * Based on FAO-56 Table 12 and Brazilian agricultural research
 */
export const BRAZILIAN_CROPS: CropData[] = [
  // Grains & Cereals
  {
    id: "corn",
    name: "Corn (Maize)",
    namePortuguese: "Milho",
    category: CROP_CATEGORIES.GRAINS,
    description: "Field corn for grain production",
    kcInitial: 0.3,
    kcMid: 1.2,
    kcEnd: 0.35,
    maxHeight: 2.0,
    growthStages: {
      initial: 20,
      development: 35,
      midSeason: 40,
      lateSeason: 30,
    },
  },
  {
    id: "rice",
    name: "Rice",
    namePortuguese: "Arroz",
    category: CROP_CATEGORIES.GRAINS,
    description: "Paddy rice cultivation",
    kcInitial: 1.05,
    kcMid: 1.2,
    kcEnd: 0.9,
    maxHeight: 1.0,
    growthStages: {
      initial: 30,
      development: 30,
      midSeason: 60,
      lateSeason: 30,
    },
  },
  {
    id: "wheat",
    name: "Wheat",
    namePortuguese: "Trigo",
    category: CROP_CATEGORIES.GRAINS,
    description: "Spring wheat for grain",
    kcInitial: 0.3,
    kcMid: 1.15,
    kcEnd: 0.25,
    maxHeight: 1.0,
    growthStages: {
      initial: 15,
      development: 30,
      midSeason: 65,
      lateSeason: 40,
    },
  },
  {
    id: "sorghum",
    name: "Sorghum",
    namePortuguese: "Sorgo",
    category: CROP_CATEGORIES.GRAINS,
    description: "Grain sorghum",
    kcInitial: 0.3,
    kcMid: 1.0,
    kcEnd: 0.55,
    maxHeight: 1.2,
    growthStages: {
      initial: 20,
      development: 35,
      midSeason: 40,
      lateSeason: 30,
    },
  },

  // Legumes & Oilseeds
  {
    id: "soybeans",
    name: "Soybeans",
    namePortuguese: "Soja",
    category: CROP_CATEGORIES.OILSEEDS,
    description: "Most important Brazilian oilseed crop",
    kcInitial: 0.4,
    kcMid: 1.15,
    kcEnd: 0.5,
    maxHeight: 0.8,
    growthStages: {
      initial: 15,
      development: 25,
      midSeason: 50,
      lateSeason: 30,
    },
  },
  {
    id: "beans-dry",
    name: "Beans (Dry)",
    namePortuguese: "Feijão",
    category: CROP_CATEGORIES.LEGUMES,
    description: "Common dry beans",
    kcInitial: 0.4,
    kcMid: 1.15,
    kcEnd: 0.35,
    maxHeight: 0.4,
    growthStages: {
      initial: 20,
      development: 30,
      midSeason: 40,
      lateSeason: 20,
    },
  },
  {
    id: "peanuts",
    name: "Peanuts (Groundnuts)",
    namePortuguese: "Amendoim",
    category: CROP_CATEGORIES.OILSEEDS,
    description: "Groundnut cultivation",
    kcInitial: 0.4,
    kcMid: 1.15,
    kcEnd: 0.6,
    maxHeight: 0.4,
    growthStages: {
      initial: 25,
      development: 35,
      midSeason: 45,
      lateSeason: 25,
    },
  },

  // Fiber Crops
  {
    id: "cotton",
    name: "Cotton",
    namePortuguese: "Algodão",
    category: CROP_CATEGORIES.FIBER,
    description: "Cotton for fiber production",
    kcInitial: 0.35,
    kcMid: 1.15,
    kcEnd: 0.5,
    maxHeight: 1.5,
    growthStages: {
      initial: 30,
      development: 50,
      midSeason: 60,
      lateSeason: 55,
    },
  },

  // Sugar Crops
  {
    id: "sugarcane-virgin",
    name: "Sugarcane (Virgin)",
    namePortuguese: "Cana-de-açúcar (Virgem)",
    category: CROP_CATEGORIES.SUGAR,
    description: "First year sugarcane planting",
    kcInitial: 0.4,
    kcMid: 1.25,
    kcEnd: 0.75,
    maxHeight: 3.0,
    growthStages: {
      initial: 35,
      development: 60,
      midSeason: 190,
      lateSeason: 120,
    },
  },
  {
    id: "sugarcane-ratoon",
    name: "Sugarcane (Ratoon)",
    namePortuguese: "Cana-de-açúcar (Soca)",
    category: CROP_CATEGORIES.SUGAR,
    description: "Regrowth sugarcane after harvest",
    kcInitial: 0.4,
    kcMid: 1.25,
    kcEnd: 0.75,
    maxHeight: 3.0,
    growthStages: {
      initial: 25,
      development: 35,
      midSeason: 180,
      lateSeason: 150,
    },
  },

  // Beverage Crops
  {
    id: "coffee",
    name: "Coffee",
    namePortuguese: "Café",
    category: CROP_CATEGORIES.BEVERAGES,
    description: "Coffee plantation (bare ground)",
    kcInitial: 0.9,
    kcMid: 0.95,
    kcEnd: 0.95,
    maxHeight: 3.0,
    growthStages: {
      initial: 60,
      development: 90,
      midSeason: 120,
      lateSeason: 95,
    },
  },

  // Fruits
  {
    id: "banana",
    name: "Banana",
    namePortuguese: "Banana",
    category: CROP_CATEGORIES.FRUITS,
    description: "Banana plantation (1st year)",
    kcInitial: 0.5,
    kcMid: 1.1,
    kcEnd: 1.0,
    maxHeight: 4.0,
    growthStages: {
      initial: 120,
      development: 90,
      midSeason: 120,
      lateSeason: 60,
    },
  },
  {
    id: "citrus",
    name: "Citrus (Orange)",
    namePortuguese: "Laranja",
    category: CROP_CATEGORIES.FRUITS,
    description: "Orange trees with 70% canopy",
    kcInitial: 0.7,
    kcMid: 0.65,
    kcEnd: 0.7,
    maxHeight: 4.0,
    growthStages: {
      initial: 60,
      development: 90,
      midSeason: 120,
      lateSeason: 95,
    },
  },
  {
    id: "mango",
    name: "Mango",
    namePortuguese: "Manga",
    category: CROP_CATEGORIES.FRUITS,
    description: "Mango orchard",
    kcInitial: 0.75,
    kcMid: 0.8,
    kcEnd: 0.75,
    maxHeight: 5.0,
    growthStages: {
      initial: 90,
      development: 90,
      midSeason: 120,
      lateSeason: 60,
    },
  },

  // Vegetables
  {
    id: "tomato",
    name: "Tomato",
    namePortuguese: "Tomate",
    category: CROP_CATEGORIES.VEGETABLES,
    description: "Fresh market tomato",
    kcInitial: 0.6,
    kcMid: 1.15,
    kcEnd: 0.7,
    maxHeight: 0.6,
    growthStages: {
      initial: 30,
      development: 40,
      midSeason: 50,
      lateSeason: 30,
    },
  },
  {
    id: "potato",
    name: "Potato",
    namePortuguese: "Batata",
    category: CROP_CATEGORIES.VEGETABLES,
    description: "Potato cultivation",
    kcInitial: 0.5,
    kcMid: 1.15,
    kcEnd: 0.75,
    maxHeight: 0.6,
    growthStages: {
      initial: 25,
      development: 30,
      midSeason: 45,
      lateSeason: 30,
    },
  },
  {
    id: "onion-dry",
    name: "Onion (Dry)",
    namePortuguese: "Cebola",
    category: CROP_CATEGORIES.VEGETABLES,
    description: "Dry bulb onion",
    kcInitial: 0.7,
    kcMid: 1.05,
    kcEnd: 0.75,
    maxHeight: 0.4,
    growthStages: {
      initial: 15,
      development: 25,
      midSeason: 70,
      lateSeason: 40,
    },
  },
  {
    id: "cassava",
    name: "Cassava (Manioc)",
    namePortuguese: "Mandioca",
    category: CROP_CATEGORIES.VEGETABLES,
    description: "Cassava root crop (1st year)",
    kcInitial: 0.3,
    kcMid: 0.8,
    kcEnd: 0.3,
    maxHeight: 1.0,
    growthStages: {
      initial: 20,
      development: 40,
      midSeason: 90,
      lateSeason: 60,
    },
  },
];

/**
 * Get crop by ID
 */
export function getCropById(id: string): CropData | undefined {
  return BRAZILIAN_CROPS.find((crop) => crop.id === id);
}

/**
 * Get crops by category
 */
export function getCropsByCategory(category: string): CropData[] {
  return BRAZILIAN_CROPS.filter((crop) => crop.category === category);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  return Object.values(CROP_CATEGORIES);
}

/**
 * Calculate crop evapotranspiration (ETc) for a specific growth stage
 * ETc = Kc × ET₀
 */
export function calculateETc(et0: number, kc: number): number {
  return et0 * kc;
}

/**
 * Get Kc value for a specific day in the growing season
 * Uses linear interpolation between growth stages
 */
export function getKcForDay(crop: CropData, dayOfSeason: number): number {
  const { initial, development, midSeason, lateSeason } = crop.growthStages;
  const totalDays = initial + development + midSeason + lateSeason;

  if (dayOfSeason < 0 || dayOfSeason > totalDays) {
    return crop.kcEnd;
  }

  // Initial stage
  if (dayOfSeason <= initial) {
    return crop.kcInitial;
  }

  // Development stage - linear interpolation from Kc_ini to Kc_mid
  if (dayOfSeason <= initial + development) {
    const daysIntoStage = dayOfSeason - initial;
    const progress = daysIntoStage / development;
    return crop.kcInitial + progress * (crop.kcMid - crop.kcInitial);
  }

  // Mid-season stage
  if (dayOfSeason <= initial + development + midSeason) {
    return crop.kcMid;
  }

  // Late season stage - linear interpolation from Kc_mid to Kc_end
  const daysIntoLateSeason = dayOfSeason - (initial + development + midSeason);
  const progress = daysIntoLateSeason / lateSeason;
  return crop.kcMid + progress * (crop.kcEnd - crop.kcMid);
}

/**
 * Calculate total water requirement for entire growing season
 */
export function calculateSeasonalWaterRequirement(
  crop: CropData,
  averageET0: number
): {
  totalDays: number;
  averageKc: number;
  totalWaterMm: number;
  dailyAverageWaterMm: number;
} {
  const { initial, development, midSeason, lateSeason } = crop.growthStages;
  const totalDays = initial + development + midSeason + lateSeason;

  // Calculate average Kc across all stages
  const avgKcInitial = crop.kcInitial;
  const avgKcDevelopment = (crop.kcInitial + crop.kcMid) / 2;
  const avgKcMid = crop.kcMid;
  const avgKcLate = (crop.kcMid + crop.kcEnd) / 2;

  const weightedKc =
    (avgKcInitial * initial +
      avgKcDevelopment * development +
      avgKcMid * midSeason +
      avgKcLate * lateSeason) /
    totalDays;

  const totalWaterMm = weightedKc * averageET0 * totalDays;
  const dailyAverageWaterMm = totalWaterMm / totalDays;

  return {
    totalDays,
    averageKc: weightedKc,
    totalWaterMm,
    dailyAverageWaterMm,
  };
}
