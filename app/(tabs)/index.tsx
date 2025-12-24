import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initializeDefaultLocation, getCurrentLocation, type Location } from "@/services/location-storage";
import { fetchWeatherData, getET0Level, type WeatherData } from "@/services/weather-api";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [location, setLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const colors = Colors[colorScheme ?? "light"];

  // Load location and weather data
  const loadData = useCallback(async () => {
    try {
      setError(null);
      
      // Get or initialize location
      let currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        currentLocation = await initializeDefaultLocation();
      }
      setLocation(currentLocation);

      // Fetch weather data
      const data = await fetchWeatherData(currentLocation.latitude, currentLocation.longitude);
      setWeatherData(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load weather data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh every hour
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLocationPress = () => {
    router.push("/location-settings" as any);
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Loading weather data...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !weatherData || !location) {
    return (
      <ThemedView style={styles.centered}>
        <IconSymbol name="info.circle.fill" size={48} color={colors.error} />
        <ThemedText style={[styles.errorText, { color: colors.error }]}>
          {error || "Failed to load data"}
        </ThemedText>
        <Pressable onPress={loadData} style={[styles.retryButton, { backgroundColor: colors.tint }]}>
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const et0Info = getET0Level(weatherData.current.et0);
  const formattedTime = lastUpdate
    ? lastUpdate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: Math.max(insets.top, 20) + 16,
          paddingBottom: Math.max(insets.bottom, 20) + 16,
        },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.tint} />
      }
    >
      {/* Header with location */}
      <View style={styles.header}>
        <Pressable onPress={handleLocationPress} style={styles.locationButton}>
          <IconSymbol name="location.fill" size={20} color={colors.tint} />
          <ThemedText type="subtitle" style={styles.locationName}>
            {location.name}
          </ThemedText>
        </Pressable>
      </View>

      {/* Main ET₀ Card */}
      <ThemedView
        style={[styles.et0Card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        lightColor={colors.surface}
        darkColor={colors.surface}
      >
        <View style={[styles.et0Badge, { backgroundColor: et0Info.color }]}>
          <ThemedText style={styles.et0BadgeText}>{et0Info.level}</ThemedText>
        </View>
        
        <ThemedText style={[styles.et0Value, { color: colors.text }]}>
          {weatherData.current.et0.toFixed(1)}
        </ThemedText>
        <ThemedText style={[styles.et0Unit, { color: colors.textSecondary }]}>mm/day</ThemedText>
        
        <ThemedText type="subtitle" style={[styles.et0Title, { color: colors.text }]}>
          Reference Evapotranspiration
        </ThemedText>
        
        <ThemedText style={[styles.et0Description, { color: colors.textSecondary }]}>
          {et0Info.description}
        </ThemedText>
        
        <ThemedText style={[styles.updateTime, { color: colors.textSecondary }]}>
          Updated: {formattedTime}
        </ThemedText>
      </ThemedView>

      {/* Weather Conditions Section */}
      <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
        Weather Conditions
      </ThemedText>

      {/* Temperature Card */}
      <ThemedView
        style={[styles.dataCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        lightColor={colors.surface}
        darkColor={colors.surface}
      >
        <View style={styles.dataCardHeader}>
          <IconSymbol name="thermometer" size={24} color={colors.error} />
          <ThemedText type="defaultSemiBold" style={[styles.dataCardTitle, { color: colors.text }]}>
            Temperature
          </ThemedText>
        </View>
        <ThemedText style={[styles.dataCardValue, { color: colors.text }]}>
          {weatherData.current.temperature.toFixed(1)}°C
        </ThemedText>
        <ThemedText style={[styles.dataCardSubtext, { color: colors.textSecondary }]}>
          Max: {weatherData.daily.temperatureMax[0].toFixed(1)}°C • Min:{" "}
          {weatherData.daily.temperatureMin[0].toFixed(1)}°C
        </ThemedText>
      </ThemedView>

      {/* Humidity Card */}
      <ThemedView
        style={[styles.dataCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        lightColor={colors.surface}
        darkColor={colors.surface}
      >
        <View style={styles.dataCardHeader}>
          <IconSymbol name="drop.fill" size={24} color={colors.blue} />
          <ThemedText type="defaultSemiBold" style={[styles.dataCardTitle, { color: colors.text }]}>
            Humidity
          </ThemedText>
        </View>
        <ThemedText style={[styles.dataCardValue, { color: colors.text }]}>
          {weatherData.current.humidity.toFixed(0)}%
        </ThemedText>
        <ThemedText style={[styles.dataCardSubtext, { color: colors.textSecondary }]}>
          Relative humidity at 2m
        </ThemedText>
      </ThemedView>

      {/* Wind Speed Card */}
      <ThemedView
        style={[styles.dataCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        lightColor={colors.surface}
        darkColor={colors.surface}
      >
        <View style={styles.dataCardHeader}>
          <IconSymbol name="wind" size={24} color={colors.textSecondary} />
          <ThemedText type="defaultSemiBold" style={[styles.dataCardTitle, { color: colors.text }]}>
            Wind Speed
          </ThemedText>
        </View>
        <ThemedText style={[styles.dataCardValue, { color: colors.text }]}>
          {(weatherData.current.windSpeed / 3.6).toFixed(1)} m/s
        </ThemedText>
        <ThemedText style={[styles.dataCardSubtext, { color: colors.textSecondary }]}>
          {weatherData.current.windSpeed.toFixed(1)} km/h
        </ThemedText>
      </ThemedView>

      {/* Solar Radiation Card */}
      <ThemedView
        style={[styles.dataCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        lightColor={colors.surface}
        darkColor={colors.surface}
      >
        <View style={styles.dataCardHeader}>
          <IconSymbol name="sun.max.fill" size={24} color={colors.warning} />
          <ThemedText type="defaultSemiBold" style={[styles.dataCardTitle, { color: colors.text }]}>
            Solar Radiation
          </ThemedText>
        </View>
        <ThemedText style={[styles.dataCardValue, { color: colors.text }]}>
          {weatherData.current.solarRadiation.toFixed(0)} W/m²
        </ThemedText>
        <ThemedText style={[styles.dataCardSubtext, { color: colors.textSecondary }]}>
          Shortwave radiation
        </ThemedText>
      </ThemedView>

      {/* Refresh Button */}
      <Pressable
        onPress={handleRefresh}
        style={[styles.refreshButton, { backgroundColor: colors.tint }]}
      >
        <IconSymbol name="arrow.clockwise" size={20} color="#FFFFFF" />
        <ThemedText style={styles.refreshButtonText}>Refresh Data</ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
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
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    marginBottom: 24,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationName: {
    fontSize: 20,
  },
  et0Card: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 32,
  },
  et0Badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  et0BadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  et0Value: {
    fontSize: 64,
    fontWeight: "bold",
    lineHeight: 72,
  },
  et0Unit: {
    fontSize: 20,
    marginBottom: 16,
  },
  et0Title: {
    textAlign: "center",
    marginBottom: 8,
  },
  et0Description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  updateTime: {
    fontSize: 12,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  dataCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  dataCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dataCardTitle: {
    fontSize: 16,
  },
  dataCardValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dataCardSubtext: {
    fontSize: 14,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
