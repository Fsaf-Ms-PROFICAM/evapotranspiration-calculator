import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getCurrentLocation,
  setCurrentLocation,
  getSavedLocations,
  addSavedLocation,
  removeSavedLocation,
  initializeDefaultLocation,
  DEFAULT_BRAZIL_LOCATIONS,
  type Location,
} from "../location-storage";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
}));

describe("Location Storage Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentLocation", () => {
    it("should return null when no location is stored", async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
      const result = await getCurrentLocation();
      expect(result).toBeNull();
    });

    it("should return stored location", async () => {
      const mockLocation: Location = {
        name: "São Paulo, SP",
        latitude: -23.5505,
        longitude: -46.6333,
      };
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockLocation));
      
      const result = await getCurrentLocation();
      expect(result).toEqual(mockLocation);
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error("Storage error"));
      const result = await getCurrentLocation();
      expect(result).toBeNull();
    });
  });

  describe("setCurrentLocation", () => {
    it("should store location correctly", async () => {
      const location: Location = {
        name: "Brasília, DF",
        latitude: -15.7939,
        longitude: -47.8828,
      };
      
      await setCurrentLocation(location);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@et_calculator:current_location",
        JSON.stringify(location)
      );
    });
  });

  describe("getSavedLocations", () => {
    it("should return empty array when no locations are saved", async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
      const result = await getSavedLocations();
      expect(result).toEqual([]);
    });

    it("should return saved locations", async () => {
      const mockLocations: Location[] = [
        { name: "São Paulo, SP", latitude: -23.5505, longitude: -46.6333 },
        { name: "Rio de Janeiro, RJ", latitude: -22.9068, longitude: -43.1729 },
      ];
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockLocations));
      
      const result = await getSavedLocations();
      expect(result).toEqual(mockLocations);
    });
  });

  describe("addSavedLocation", () => {
    it("should add new location to saved locations", async () => {
      const existingLocations: Location[] = [
        { name: "São Paulo, SP", latitude: -23.5505, longitude: -46.6333 },
      ];
      const newLocation: Location = {
        name: "Brasília, DF",
        latitude: -15.7939,
        longitude: -47.8828,
      };
      
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(existingLocations));
      
      await addSavedLocation(newLocation);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@et_calculator:saved_locations",
        JSON.stringify([...existingLocations, newLocation])
      );
    });

    it("should not add duplicate location", async () => {
      const existingLocations: Location[] = [
        { name: "São Paulo, SP", latitude: -23.5505, longitude: -46.6333 },
      ];
      const duplicateLocation: Location = {
        name: "São Paulo, SP",
        latitude: -23.5505,
        longitude: -46.6333,
      };
      
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(existingLocations));
      
      await addSavedLocation(duplicateLocation);
      
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("removeSavedLocation", () => {
    it("should remove location from saved locations", async () => {
      const existingLocations: Location[] = [
        { name: "São Paulo, SP", latitude: -23.5505, longitude: -46.6333 },
        { name: "Brasília, DF", latitude: -15.7939, longitude: -47.8828 },
      ];
      const locationToRemove: Location = {
        name: "São Paulo, SP",
        latitude: -23.5505,
        longitude: -46.6333,
      };
      
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(existingLocations));
      
      await removeSavedLocation(locationToRemove);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "@et_calculator:saved_locations",
        JSON.stringify([existingLocations[1]])
      );
    });
  });

  describe("initializeDefaultLocation", () => {
    it("should return existing location if one exists", async () => {
      const existingLocation: Location = {
        name: "Brasília, DF",
        latitude: -15.7939,
        longitude: -47.8828,
      };
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(existingLocation));
      
      const result = await initializeDefaultLocation();
      expect(result).toEqual(existingLocation);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it("should set default location (São Paulo) if none exists", async () => {
      vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
      
      const result = await initializeDefaultLocation();
      
      expect(result).toEqual(DEFAULT_BRAZIL_LOCATIONS[0]);
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(11); // current location + saved locations
    });
  });

  describe("DEFAULT_BRAZIL_LOCATIONS", () => {
    it("should contain major Brazilian cities", () => {
      expect(DEFAULT_BRAZIL_LOCATIONS.length).toBeGreaterThan(0);
      
      const cityNames = DEFAULT_BRAZIL_LOCATIONS.map((loc) => loc.name);
      expect(cityNames).toContain("São Paulo, SP");
      expect(cityNames).toContain("Brasília, DF");
      expect(cityNames).toContain("Rio de Janeiro, RJ");
    });

    it("should have valid coordinates for all locations", () => {
      DEFAULT_BRAZIL_LOCATIONS.forEach((location) => {
        expect(location.latitude).toBeGreaterThanOrEqual(-34);
        expect(location.latitude).toBeLessThanOrEqual(6);
        expect(location.longitude).toBeGreaterThanOrEqual(-74);
        expect(location.longitude).toBeLessThanOrEqual(-34);
      });
    });
  });
});
