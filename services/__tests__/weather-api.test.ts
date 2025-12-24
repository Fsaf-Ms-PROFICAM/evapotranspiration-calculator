import { describe, it, expect } from "vitest";
import {
  getWeatherIcon,
  getWeatherDescription,
  getET0Level,
} from "../weather-api";

describe("Weather API Service", () => {
  describe("getWeatherIcon", () => {
    it("should return sun icon for clear sky", () => {
      expect(getWeatherIcon(0)).toBe("☀️");
    });

    it("should return partly cloudy icon for codes 1-3", () => {
      expect(getWeatherIcon(1)).toBe("⛅");
      expect(getWeatherIcon(2)).toBe("⛅");
      expect(getWeatherIcon(3)).toBe("⛅");
    });

    it("should return rain icon for rain codes", () => {
      expect(getWeatherIcon(61)).toBe("🌧️");
      expect(getWeatherIcon(63)).toBe("🌧️");
      expect(getWeatherIcon(65)).toBe("🌧️");
    });

    it("should return thunderstorm icon for codes 95-99", () => {
      expect(getWeatherIcon(95)).toBe("⛈️");
      expect(getWeatherIcon(96)).toBe("⛈️");
      expect(getWeatherIcon(99)).toBe("⛈️");
    });
  });

  describe("getWeatherDescription", () => {
    it("should return correct description for clear sky", () => {
      expect(getWeatherDescription(0)).toBe("Clear sky");
    });

    it("should return correct description for partly cloudy", () => {
      expect(getWeatherDescription(2)).toBe("Partly cloudy");
    });

    it("should return correct description for rain", () => {
      expect(getWeatherDescription(61)).toBe("Rain");
    });

    it("should return correct description for thunderstorm", () => {
      expect(getWeatherDescription(95)).toBe("Thunderstorm");
    });

    it("should return unknown for invalid code", () => {
      expect(getWeatherDescription(999)).toBe("Unknown");
    });
  });

  describe("getET0Level", () => {
    it("should return Low level for ET0 < 3", () => {
      const result = getET0Level(2.5);
      expect(result.level).toBe("Low");
      expect(result.color).toBe("#4CAF50");
      expect(result.description).toBe("Minimal irrigation needed");
    });

    it("should return Moderate level for ET0 between 3-5", () => {
      const result = getET0Level(4.0);
      expect(result.level).toBe("Moderate");
      expect(result.color).toBe("#2E7D32");
      expect(result.description).toBe("Normal irrigation requirements");
    });

    it("should return High level for ET0 between 5-7", () => {
      const result = getET0Level(6.0);
      expect(result.level).toBe("High");
      expect(result.color).toBe("#FF9800");
      expect(result.description).toBe("Increased irrigation needed");
    });

    it("should return Very High level for ET0 >= 7", () => {
      const result = getET0Level(8.5);
      expect(result.level).toBe("Very High");
      expect(result.color).toBe("#D32F2F");
      expect(result.description).toBe("Maximum irrigation required");
    });

    it("should handle boundary values correctly", () => {
      expect(getET0Level(3.0).level).toBe("Moderate");
      expect(getET0Level(5.0).level).toBe("High");
      expect(getET0Level(7.0).level).toBe("Very High");
    });
  });
});
