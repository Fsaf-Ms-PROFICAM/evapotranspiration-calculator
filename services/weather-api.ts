/**
 * Weather API Service
 * Integrates with Open-Meteo API to fetch meteorological data and ET₀ values
 */

export interface WeatherData {
  current: {
    time: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    solarRadiation: number;
    et0: number;
  };
  hourly: {
    time: string[];
    temperature: number[];
    humidity: number[];
    windSpeed: number[];
    solarRadiation: number[];
    et0: number[];
  };
  daily: {
    time: string[];
    et0: number[];
    temperatureMax: number[];
    temperatureMin: number[];
    weatherCode: number[];
  };
}

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Fetch weather data and ET₀ from Open-Meteo API
 */
export async function fetchWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "wind_speed_10m",
      "shortwave_radiation",
      "et0_fao_evapotranspiration",
    ].join(","),
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "wind_speed_10m",
      "shortwave_radiation",
      "et0_fao_evapotranspiration",
    ].join(","),
    daily: [
      "et0_fao_evapotranspiration",
      "temperature_2m_max",
      "temperature_2m_min",
      "weather_code",
    ].join(","),
    timezone: "auto",
    forecast_days: "7",
  });

  const url = `${BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform API response to our data structure
    return {
      current: {
        time: data.current.time,
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        solarRadiation: data.current.shortwave_radiation,
        et0: data.current.et0_fao_evapotranspiration,
      },
      hourly: {
        time: data.hourly.time,
        temperature: data.hourly.temperature_2m,
        humidity: data.hourly.relative_humidity_2m,
        windSpeed: data.hourly.wind_speed_10m,
        solarRadiation: data.hourly.shortwave_radiation,
        et0: data.hourly.et0_fao_evapotranspiration,
      },
      daily: {
        time: data.daily.time,
        et0: data.daily.et0_fao_evapotranspiration,
        temperatureMax: data.daily.temperature_2m_max,
        temperatureMin: data.daily.temperature_2m_min,
        weatherCode: data.daily.weather_code,
      },
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

/**
 * Get weather icon based on WMO weather code
 * WMO Weather interpretation codes (WW)
 */
export function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️"; // Clear sky
  if (code <= 3) return "⛅"; // Partly cloudy
  if (code <= 48) return "🌫️"; // Fog
  if (code <= 57) return "🌧️"; // Drizzle
  if (code <= 67) return "🌧️"; // Rain
  if (code <= 77) return "🌨️"; // Snow
  if (code <= 82) return "🌧️"; // Rain showers
  if (code <= 86) return "🌨️"; // Snow showers
  if (code <= 99) return "⛈️"; // Thunderstorm
  return "🌤️"; // Default
}

/**
 * Get weather description based on WMO weather code
 */
export function getWeatherDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code === 51 || code === 53 || code === 55) return "Drizzle";
  if (code === 61 || code === 63 || code === 65) return "Rain";
  if (code === 71 || code === 73 || code === 75) return "Snow";
  if (code === 77) return "Snow grains";
  if (code === 80 || code === 81 || code === 82) return "Rain showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code === 95) return "Thunderstorm";
  if (code === 96 || code === 99) return "Thunderstorm with hail";
  return "Unknown";
}

/**
 * Get ET₀ level description
 */
export function getET0Level(et0: number): {
  level: string;
  color: string;
  description: string;
} {
  if (et0 < 3) {
    return {
      level: "Low",
      color: "#4CAF50",
      description: "Minimal irrigation needed",
    };
  } else if (et0 < 5) {
    return {
      level: "Moderate",
      color: "#2E7D32",
      description: "Normal irrigation requirements",
    };
  } else if (et0 < 7) {
    return {
      level: "High",
      color: "#FF9800",
      description: "Increased irrigation needed",
    };
  } else {
    return {
      level: "Very High",
      color: "#D32F2F",
      description: "Maximum irrigation required",
    };
  }
}
