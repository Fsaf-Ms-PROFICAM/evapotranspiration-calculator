import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getCurrentLocation,
  getSavedLocations,
  setCurrentLocation,
  addSavedLocation,
  DEFAULT_BRAZIL_LOCATIONS,
  type Location,
} from "@/services/location-storage";

export default function LocationSettingsScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [currentLocation, setCurrentLocationState] = useState<Location | null>(null);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const colors = Colors[colorScheme ?? "light"];

  const loadLocations = useCallback(async () => {
    try {
      const current = await getCurrentLocation();
      const saved = await getSavedLocations();
      
      setCurrentLocationState(current);
      
      // Combine default locations with any custom saved locations
      const customLocations = saved.filter(
        (savedLoc) =>
          !DEFAULT_BRAZIL_LOCATIONS.some(
            (def) =>
              def.latitude === savedLoc.latitude && def.longitude === savedLoc.longitude
          )
      );
      
      setAllLocations([...DEFAULT_BRAZIL_LOCATIONS, ...customLocations]);
    } catch (error) {
      console.error("Error loading locations:", error);
      setAllLocations(DEFAULT_BRAZIL_LOCATIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handleSelectLocation = async (location: Location) => {
    try {
      await setCurrentLocation(location);
      await addSavedLocation(location);
      router.back();
    } catch (error) {
      console.error("Error selecting location:", error);
    }
  };

  const filteredLocations = allLocations.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderLocationItem = ({ item }: { item: Location }) => {
    const isSelected =
      currentLocation?.latitude === item.latitude &&
      currentLocation?.longitude === item.longitude;

    return (
      <Pressable
        onPress={() => handleSelectLocation(item)}
        style={[
          styles.locationItem,
          { backgroundColor: colors.surface, borderColor: colors.border },
          isSelected && { borderColor: colors.tint, borderWidth: 2 },
        ]}
      >
        <View style={styles.locationInfo}>
          <ThemedText type="defaultSemiBold" style={[styles.locationName, { color: colors.text }]}>
            {item.name}
          </ThemedText>
          <ThemedText style={[styles.locationCoords, { color: colors.textSecondary }]}>
            {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
          </ThemedText>
        </View>
        {isSelected && <IconSymbol name="checkmark" size={24} color={colors.tint} />}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 20) + 16,
            paddingHorizontal: 16,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={[styles.backButtonText, { color: colors.tint }]}>
            ← Back
          </ThemedText>
        </Pressable>
        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          Select Location
        </ThemedText>
      </View>

      {/* Current Location */}
      {currentLocation && (
        <View style={styles.currentSection}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Current Location
          </ThemedText>
          <ThemedView
            style={[
              styles.currentLocationCard,
              { backgroundColor: colors.surface, borderColor: colors.tint },
            ]}
          >
            <IconSymbol name="location.fill" size={24} color={colors.tint} />
            <View style={styles.currentLocationInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.locationName, { color: colors.text }]}>
                {currentLocation.name}
              </ThemedText>
              <ThemedText style={[styles.locationCoords, { color: colors.textSecondary }]}>
                {currentLocation.latitude.toFixed(2)}, {currentLocation.longitude.toFixed(2)}
              </ThemedText>
            </View>
          </ThemedView>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchSection}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
          Search Location
        </ThemedText>
        <View
          style={[
            styles.searchInput,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search Brazilian cities..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Locations List */}
      <View style={styles.listSection}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
          Available Locations ({filteredLocations.length})
        </ThemedText>
        <FlatList
          data={filteredLocations}
          renderItem={renderLocationItem}
          keyExtractor={(item) => `${item.latitude},${item.longitude}`}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 16 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
  },
  header: {
    paddingBottom: 16,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    marginBottom: 0,
  },
  currentSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  currentLocationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  currentLocationInfo: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    gap: 12,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 14,
  },
});
