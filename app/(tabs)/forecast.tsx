import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getCurrentLocation, initializeDefaultLocation, type Location } from "@/services/location-storage";
import {
  fetchWeatherData,
  getWeatherIcon,
  getWeatherDescription,
  type WeatherData,
} from "@/services/weather-api";

interface DayForecast {
  date: string;
  dayName: string;
  et0: number;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  weatherIcon: string;
  weatherDesc: string;
}

export default function ForecastScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  
  const [location, setLocation] = useState<Location | null>(null);
  const [forecasts, setForecasts] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = Colors[colorScheme ?? "light"];

  const loadForecastData = useCallback(async () => {
    try {
      setError(null);
      
      // Get or initialize location
      let currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        currentLocation = await initializeDefaultLocation();
      }
      setLocation(currentLocation);

      // Fetch weather data
      const data: WeatherData = await fetchWeatherData(
        currentLocation.latitude,
        currentLocation.longitude
      );

      // Transform daily data to forecast items
      const forecastItems: DayForecast[] = data.daily.time.map((dateStr, index) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let dayName: string;
        if (date.toDateString() === today.toDateString()) {
          dayName = "Today";
        } else if (date.toDateString() === tomorrow.toDateString()) {
          dayName = "Tomorrow";
        } else {
          dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        }

        return {
          date: dateStr,
          dayName,
          et0: data.daily.et0[index],
          tempMax: data.daily.temperatureMax[index],
          tempMin: data.daily.temperatureMin[index],
          weatherCode: data.daily.weatherCode[index],
          weatherIcon: getWeatherIcon(data.daily.weatherCode[index]),
          weatherDesc: getWeatherDescription(data.daily.weatherCode[index]),
        };
      });

      setForecasts(forecastItems);
    } catch (err) {
      console.error("Error loading forecast data:", err);
      setError("Failed to load forecast data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadForecastData();
  }, [loadForecastData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadForecastData();
  };

  const renderForecastItem = ({ item, index }: { item: DayForecast; index: number }) => {
    const isToday = index === 0;
    
    return (
      <ThemedView
        style={[
          styles.forecastCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
          isToday && { borderColor: colors.tint, borderWidth: 2 },
        ]}
        lightColor={colors.surface}
        darkColor={colors.surface}
      >
        <View style={styles.forecastHeader}>
          <View style={styles.forecastDay}>
            <ThemedText type="defaultSemiBold" style={[styles.dayName, { color: colors.text }]}>
              {item.dayName}
            </ThemedText>
            <ThemedText style={[styles.date, { color: colors.textSecondary }]}>
              {new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </ThemedText>
          </View>
          <ThemedText style={styles.weatherIcon}>{item.weatherIcon}</ThemedText>
        </View>

        <View style={styles.forecastBody}>
          <View style={styles.et0Section}>
            <ThemedText style={[styles.et0Label, { color: colors.textSecondary }]}>ET₀</ThemedText>
            <ThemedText style={[styles.et0ValueLarge, { color: colors.tint }]}>
              {item.et0.toFixed(1)}
            </ThemedText>
            <ThemedText style={[styles.et0UnitSmall, { color: colors.textSecondary }]}>
              mm/day
            </ThemedText>
          </View>

          <View style={styles.weatherDetails}>
            <ThemedText style={[styles.weatherDesc, { color: colors.textSecondary }]}>
              {item.weatherDesc}
            </ThemedText>
            <View style={styles.tempRow}>
              <ThemedText style={[styles.tempText, { color: colors.text }]}>
                {item.tempMax.toFixed(0)}°
              </ThemedText>
              <ThemedText style={[styles.tempSeparator, { color: colors.textSecondary }]}>
                /
              </ThemedText>
              <ThemedText style={[styles.tempText, { color: colors.textSecondary }]}>
                {item.tempMin.toFixed(0)}°
              </ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Loading forecast...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !location) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={[styles.errorText, { color: colors.error }]}>
          {error || "Failed to load forecast"}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 20) + 16,
            paddingHorizontal: 16,
          },
        ]}
      >
        <ThemedText type="title" style={{ color: colors.text }}>
          7-Day Forecast
        </ThemedText>
        <ThemedText style={[styles.locationText, { color: colors.textSecondary }]}>
          {location.name}
        </ThemedText>
      </View>

      <FlatList
        data={forecasts}
        renderItem={renderForecastItem}
        keyExtractor={(item) => item.date}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 16 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.tint} />
        }
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    paddingBottom: 16,
  },
  locationText: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  forecastCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  forecastHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  forecastDay: {
    flex: 1,
  },
  dayName: {
    fontSize: 18,
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
  },
  weatherIcon: {
    fontSize: 40,
  },
  forecastBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  et0Section: {
    alignItems: "center",
  },
  et0Label: {
    fontSize: 12,
    marginBottom: 4,
  },
  et0ValueLarge: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 36,
  },
  et0UnitSmall: {
    fontSize: 12,
  },
  weatherDetails: {
    flex: 1,
    gap: 8,
  },
  weatherDesc: {
    fontSize: 14,
  },
  tempRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  tempText: {
    fontSize: 20,
    fontWeight: "600",
  },
  tempSeparator: {
    fontSize: 16,
  },
});
