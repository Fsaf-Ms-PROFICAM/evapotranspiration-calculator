/**
 * Location Storage Service
 * Manages saved locations using AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

const CURRENT_LOCATION_KEY = "@et_calculator:current_location";
const SAVED_LOCATIONS_KEY = "@et_calculator:saved_locations";

/**
 * Get current selected location
 */
export async function getCurrentLocation(): Promise<Location | null> {
  try {
    const data = await AsyncStorage.getItem(CURRENT_LOCATION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting current location:", error);
    return null;
  }
}

/**
 * Set current selected location
 */
export async function setCurrentLocation(location: Location): Promise<void> {
  try {
    await AsyncStorage.setItem(CURRENT_LOCATION_KEY, JSON.stringify(location));
  } catch (error) {
    console.error("Error setting current location:", error);
    throw error;
  }
}

/**
 * Get all saved locations
 */
export async function getSavedLocations(): Promise<Location[]> {
  try {
    const data = await AsyncStorage.getItem(SAVED_LOCATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting saved locations:", error);
    return [];
  }
}

/**
 * Add a location to saved locations
 */
export async function addSavedLocation(location: Location): Promise<void> {
  try {
    const locations = await getSavedLocations();
    
    // Check if location already exists
    const exists = locations.some(
      (loc) =>
        loc.latitude === location.latitude && loc.longitude === location.longitude
    );
    
    if (!exists) {
      locations.push(location);
      await AsyncStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(locations));
    }
  } catch (error) {
    console.error("Error adding saved location:", error);
    throw error;
  }
}

/**
 * Remove a location from saved locations
 */
export async function removeSavedLocation(location: Location): Promise<void> {
  try {
    const locations = await getSavedLocations();
    const filtered = locations.filter(
      (loc) =>
        loc.latitude !== location.latitude || loc.longitude !== location.longitude
    );
    await AsyncStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing saved location:", error);
    throw error;
  }
}

/**
 * Default locations for Brazil
 */
export const DEFAULT_BRAZIL_LOCATIONS: Location[] = [
  {
    name: "São Paulo, SP",
    latitude: -23.5505,
    longitude: -46.6333,
  },
  {
    name: "Brasília, DF",
    latitude: -15.7939,
    longitude: -47.8828,
  },
  {
    name: "Rio de Janeiro, RJ",
    latitude: -22.9068,
    longitude: -43.1729,
  },
  {
    name: "Curitiba, PR",
    latitude: -25.4284,
    longitude: -49.2733,
  },
  {
    name: "Belo Horizonte, MG",
    latitude: -19.9167,
    longitude: -43.9345,
  },
  {
    name: "Manaus, AM",
    latitude: -3.1190,
    longitude: -60.0217,
  },
  {
    name: "Porto Alegre, RS",
    latitude: -30.0346,
    longitude: -51.2177,
  },
  {
    name: "Salvador, BA",
    latitude: -12.9714,
    longitude: -38.5014,
  },
  {
    name: "Fortaleza, CE",
    latitude: -3.7172,
    longitude: -38.5433,
  },
  {
    name: "Goiânia, GO",
    latitude: -16.6869,
    longitude: -49.2648,
  },
];

/**
 * Initialize default location if none exists
 */
export async function initializeDefaultLocation(): Promise<Location> {
  const current = await getCurrentLocation();
  const saved = await getSavedLocations();
  
  if (!current) {
    // Set São Paulo as default
    const defaultLocation = DEFAULT_BRAZIL_LOCATIONS[0];
    await setCurrentLocation(defaultLocation);
  }
  
  // Pre-load all default locations if none are saved
  if (saved.length === 0) {
    for (const location of DEFAULT_BRAZIL_LOCATIONS) {
      await addSavedLocation(location);
    }
  }
  
  return current || DEFAULT_BRAZIL_LOCATIONS[0];
}
