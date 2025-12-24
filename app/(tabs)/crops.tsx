import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
import {
  BRAZILIAN_CROPS,
  calculateETc,
  calculateSeasonalWaterRequirement,
  getAllCategories,
  getCropsByCategory,
  type CropData,
} from "@/services/crop-database";
import { getCurrentLocation, initializeDefaultLocation } from "@/services/location-storage";
import { fetchWeatherData } from "@/services/weather-api";

type ViewMode = "list" | "detail";

export default function CropsScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCrop, setSelectedCrop] = useState<CropData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentET0, setCurrentET0] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>("");

  const colors = Colors[colorScheme ?? "light"];
  const categories = getAllCategories();

  // Load current ET₀ value
  useEffect(() => {
    const loadET0 = async () => {
      try {
        let location = await getCurrentLocation();
        if (!location) {
          location = await initializeDefaultLocation();
        }
        setLocationName(location.name);

        const data = await fetchWeatherData(location.latitude, location.longitude);
        setCurrentET0(data.current.et0);
      } catch (error) {
        console.error("Error loading ET₀:", error);
        setCurrentET0(4.5); // Default fallback value
      } finally {
        setLoading(false);
      }
    };

    loadET0();
  }, []);

  const handleCropSelect = (crop: CropData) => {
    setSelectedCrop(crop);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedCrop(null);
  };

  const filteredCrops = selectedCategory
    ? getCropsByCategory(selectedCategory)
    : BRAZILIAN_CROPS;

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.loadingText}>Loading crop data...</ThemedText>
      </ThemedView>
    );
  }

  if (viewMode === "detail" && selectedCrop) {
    return (
      <CropDetailView
        crop={selectedCrop}
        et0={currentET0}
        locationName={locationName}
        onBack={handleBackToList}
        colors={colors}
        insets={insets}
      />
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
          },
        ]}
      >
        <ThemedText type="title" style={{ color: colors.text }}>
          Crop Calculator
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Calculate water needs for Brazilian crops
        </ThemedText>
      </View>

      {/* Current ET₀ Display */}
      <View style={styles.et0Display}>
        <ThemedView
          style={[
            styles.et0Card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <ThemedText style={[styles.et0Label, { color: colors.textSecondary }]}>
            Current ET₀ • {locationName}
          </ThemedText>
          <View style={styles.et0ValueRow}>
            <ThemedText style={[styles.et0Value, { color: colors.tint }]}>
              {currentET0.toFixed(1)}
            </ThemedText>
            <ThemedText style={[styles.et0Unit, { color: colors.textSecondary }]}>
              mm/day
            </ThemedText>
          </View>
        </ThemedView>
      </View>

      {/* Category Filter */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <Pressable
            onPress={() => setSelectedCategory(null)}
            style={[
              styles.filterChip,
              { borderColor: colors.border },
              !selectedCategory && { backgroundColor: colors.tint, borderColor: colors.tint },
            ]}
          >
            <ThemedText
              style={[
                styles.filterChipText,
                { color: !selectedCategory ? "#FFFFFF" : colors.text },
              ]}
            >
              All Crops
            </ThemedText>
          </Pressable>
          {categories.map((category) => (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.filterChip,
                { borderColor: colors.border },
                selectedCategory === category && {
                  backgroundColor: colors.tint,
                  borderColor: colors.tint,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.filterChipText,
                  { color: selectedCategory === category ? "#FFFFFF" : colors.text },
                ]}
              >
                {category}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Crop List */}
      <FlatList
        data={filteredCrops}
        renderItem={({ item }) => (
          <CropListItem
            crop={item}
            et0={currentET0}
            onPress={() => handleCropSelect(item)}
            colors={colors}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

// Crop List Item Component
function CropListItem({
  crop,
  et0,
  onPress,
  colors,
}: {
  crop: CropData;
  et0: number;
  onPress: () => void;
  colors: any;
}) {
  const etcMid = calculateETc(et0, crop.kcMid);

  return (
    <Pressable onPress={onPress}>
      <ThemedView
        style={[styles.cropCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.cropCardHeader}>
          <View style={styles.cropInfo}>
            <ThemedText type="defaultSemiBold" style={[styles.cropName, { color: colors.text }]}>
              {crop.name}
            </ThemedText>
            <ThemedText style={[styles.cropNamePt, { color: colors.textSecondary }]}>
              {crop.namePortuguese}
            </ThemedText>
            <ThemedText style={[styles.cropCategory, { color: colors.textSecondary }]}>
              {crop.category}
            </ThemedText>
          </View>
          <View style={styles.etcDisplay}>
            <ThemedText style={[styles.etcLabel, { color: colors.textSecondary }]}>
              ETc (mid)
            </ThemedText>
            <ThemedText style={[styles.etcValue, { color: colors.tint }]}>
              {etcMid.toFixed(1)}
            </ThemedText>
            <ThemedText style={[styles.etcUnit, { color: colors.textSecondary }]}>
              mm/day
            </ThemedText>
          </View>
        </View>
        <View style={styles.kcRow}>
          <View style={styles.kcItem}>
            <ThemedText style={[styles.kcLabel, { color: colors.textSecondary }]}>
              Kc ini
            </ThemedText>
            <ThemedText style={[styles.kcValue, { color: colors.text }]}>
              {crop.kcInitial.toFixed(2)}
            </ThemedText>
          </View>
          <View style={styles.kcItem}>
            <ThemedText style={[styles.kcLabel, { color: colors.textSecondary }]}>
              Kc mid
            </ThemedText>
            <ThemedText style={[styles.kcValue, { color: colors.text }]}>
              {crop.kcMid.toFixed(2)}
            </ThemedText>
          </View>
          <View style={styles.kcItem}>
            <ThemedText style={[styles.kcLabel, { color: colors.textSecondary }]}>
              Kc end
            </ThemedText>
            <ThemedText style={[styles.kcValue, { color: colors.text }]}>
              {crop.kcEnd.toFixed(2)}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}

// Crop Detail View Component
function CropDetailView({
  crop,
  et0,
  locationName,
  onBack,
  colors,
  insets,
}: {
  crop: CropData;
  et0: number;
  locationName: string;
  onBack: () => void;
  colors: any;
  insets: any;
}) {
  const etcInitial = calculateETc(et0, crop.kcInitial);
  const etcMid = calculateETc(et0, crop.kcMid);
  const etcEnd = calculateETc(et0, crop.kcEnd);

  const seasonalData = calculateSeasonalWaterRequirement(crop, et0);

  return (
    <ScrollView
      style={[styles.detailContainer, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.detailContent,
        {
          paddingTop: Math.max(insets.top, 20) + 16,
          paddingBottom: Math.max(insets.bottom, 20) + 16,
        },
      ]}
    >
      {/* Back Button */}
      <Pressable onPress={onBack} style={styles.backButton}>
        <ThemedText style={[styles.backButtonText, { color: colors.tint }]}>
          ← Back to Crops
        </ThemedText>
      </Pressable>

      {/* Crop Header */}
      <View style={styles.detailHeader}>
        <ThemedText type="title" style={{ color: colors.text }}>
          {crop.name}
        </ThemedText>
        <ThemedText type="subtitle" style={[styles.cropNamePtLarge, { color: colors.textSecondary }]}>
          {crop.namePortuguese}
        </ThemedText>
        <View style={[styles.categoryBadge, { backgroundColor: colors.tint }]}>
          <ThemedText style={styles.categoryBadgeText}>{crop.category}</ThemedText>
        </View>
        <ThemedText style={[styles.cropDescription, { color: colors.text }]}>
          {crop.description}
        </ThemedText>
      </View>

      {/* Current Water Needs */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
          Current Water Needs
        </ThemedText>
        <ThemedText style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Based on ET₀ = {et0.toFixed(1)} mm/day at {locationName}
        </ThemedText>

        <ThemedView
          style={[
            styles.waterNeedsCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.waterNeedRow}>
            <View style={styles.waterNeedItem}>
              <ThemedText style={[styles.waterNeedLabel, { color: colors.textSecondary }]}>
                Initial Stage
              </ThemedText>
              <ThemedText style={[styles.waterNeedValue, { color: colors.tint }]}>
                {etcInitial.toFixed(1)} mm/day
              </ThemedText>
              <ThemedText style={[styles.waterNeedKc, { color: colors.textSecondary }]}>
                Kc = {crop.kcInitial.toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.waterNeedItem}>
              <ThemedText style={[styles.waterNeedLabel, { color: colors.textSecondary }]}>
                Mid-Season
              </ThemedText>
              <ThemedText style={[styles.waterNeedValue, { color: colors.tint }]}>
                {etcMid.toFixed(1)} mm/day
              </ThemedText>
              <ThemedText style={[styles.waterNeedKc, { color: colors.textSecondary }]}>
                Kc = {crop.kcMid.toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.waterNeedItem}>
              <ThemedText style={[styles.waterNeedLabel, { color: colors.textSecondary }]}>
                Late Season
              </ThemedText>
              <ThemedText style={[styles.waterNeedValue, { color: colors.tint }]}>
                {etcEnd.toFixed(1)} mm/day
              </ThemedText>
              <ThemedText style={[styles.waterNeedKc, { color: colors.textSecondary }]}>
                Kc = {crop.kcEnd.toFixed(2)}
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </View>

      {/* Growth Stages */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
          Growth Stages
        </ThemedText>

        <ThemedView
          style={[
            styles.stagesCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.stageRow}>
            <View style={styles.stageItem}>
              <View style={[styles.stageBadge, { backgroundColor: "#4CAF50" }]}>
                <ThemedText style={styles.stageBadgeText}>Initial</ThemedText>
              </View>
              <ThemedText style={[styles.stageDays, { color: colors.text }]}>
                {crop.growthStages.initial} days
              </ThemedText>
            </View>
            <View style={styles.stageItem}>
              <View style={[styles.stageBadge, { backgroundColor: "#2E7D32" }]}>
                <ThemedText style={styles.stageBadgeText}>Development</ThemedText>
              </View>
              <ThemedText style={[styles.stageDays, { color: colors.text }]}>
                {crop.growthStages.development} days
              </ThemedText>
            </View>
            <View style={styles.stageItem}>
              <View style={[styles.stageBadge, { backgroundColor: "#FF9800" }]}>
                <ThemedText style={styles.stageBadgeText}>Mid-Season</ThemedText>
              </View>
              <ThemedText style={[styles.stageDays, { color: colors.text }]}>
                {crop.growthStages.midSeason} days
              </ThemedText>
            </View>
            <View style={styles.stageItem}>
              <View style={[styles.stageBadge, { backgroundColor: "#D32F2F" }]}>
                <ThemedText style={styles.stageBadgeText}>Late</ThemedText>
              </View>
              <ThemedText style={[styles.stageDays, { color: colors.text }]}>
                {crop.growthStages.lateSeason} days
              </ThemedText>
            </View>
          </View>
          <View style={[styles.totalDays, { borderTopColor: colors.border }]}>
            <ThemedText style={[styles.totalDaysLabel, { color: colors.textSecondary }]}>
              Total Growing Season
            </ThemedText>
            <ThemedText style={[styles.totalDaysValue, { color: colors.text }]}>
              {seasonalData.totalDays} days
            </ThemedText>
          </View>
        </ThemedView>
      </View>

      {/* Seasonal Water Requirement */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
          Seasonal Water Requirement
        </ThemedText>

        <ThemedView
          style={[
            styles.seasonalCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.seasonalRow}>
            <View style={styles.seasonalItem}>
              <IconSymbol name="drop.fill" size={32} color={colors.blue} />
              <ThemedText style={[styles.seasonalValue, { color: colors.text }]}>
                {seasonalData.totalWaterMm.toFixed(0)} mm
              </ThemedText>
              <ThemedText style={[styles.seasonalLabel, { color: colors.textSecondary }]}>
                Total Water
              </ThemedText>
            </View>
            <View style={styles.seasonalItem}>
              <IconSymbol name="calendar" size={32} color={colors.textSecondary} />
              <ThemedText style={[styles.seasonalValue, { color: colors.text }]}>
                {seasonalData.dailyAverageWaterMm.toFixed(1)} mm/day
              </ThemedText>
              <ThemedText style={[styles.seasonalLabel, { color: colors.textSecondary }]}>
                Daily Average
              </ThemedText>
            </View>
          </View>
          <View style={[styles.seasonalNote, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.seasonalNoteText, { color: colors.textSecondary }]}>
              Average Kc: {seasonalData.averageKc.toFixed(2)}
            </ThemedText>
          </View>
        </ThemedView>
      </View>

      {/* Crop Characteristics */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
          Crop Characteristics
        </ThemedText>

        <ThemedView
          style={[
            styles.characteristicsCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.characteristicRow}>
            <ThemedText style={[styles.characteristicLabel, { color: colors.textSecondary }]}>
              Maximum Height
            </ThemedText>
            <ThemedText style={[styles.characteristicValue, { color: colors.text }]}>
              {crop.maxHeight.toFixed(1)} m
            </ThemedText>
          </View>
          <View style={[styles.characteristicRow, { borderTopColor: colors.border }]}>
            <ThemedText style={[styles.characteristicLabel, { color: colors.textSecondary }]}>
              Category
            </ThemedText>
            <ThemedText style={[styles.characteristicValue, { color: colors.text }]}>
              {crop.category}
            </ThemedText>
          </View>
        </ThemedView>
      </View>

      {/* Formula Explanation */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
          Calculation Formula
        </ThemedText>

        <ThemedView
          style={[
            styles.formulaCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <ThemedText style={[styles.formulaText, { color: colors.text }]}>
            ETc = Kc × ET₀
          </ThemedText>
          <ThemedText style={[styles.formulaDescription, { color: colors.textSecondary }]}>
            Where ETc is crop evapotranspiration, Kc is the crop coefficient, and ET₀ is reference
            evapotranspiration.
          </ThemedText>
        </ThemedView>
      </View>
    </ScrollView>
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
  header: {
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  et0Display: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  et0Card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  et0Label: {
    fontSize: 14,
    marginBottom: 8,
  },
  et0ValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  et0Value: {
    fontSize: 32,
    fontWeight: "bold",
  },
  et0Unit: {
    fontSize: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cropCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cropCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 16,
    marginBottom: 2,
  },
  cropNamePt: {
    fontSize: 14,
    marginBottom: 4,
  },
  cropCategory: {
    fontSize: 12,
  },
  etcDisplay: {
    alignItems: "flex-end",
  },
  etcLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  etcValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  etcUnit: {
    fontSize: 12,
  },
  kcRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  kcItem: {
    alignItems: "center",
  },
  kcLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  kcValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailContainer: {
    flex: 1,
  },
  detailContent: {
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailHeader: {
    marginBottom: 24,
  },
  cropNamePtLarge: {
    fontSize: 18,
    marginTop: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  categoryBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  cropDescription: {
    fontSize: 16,
    marginTop: 12,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  waterNeedsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  waterNeedRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  waterNeedItem: {
    alignItems: "center",
    flex: 1,
  },
  waterNeedLabel: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  waterNeedValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  waterNeedKc: {
    fontSize: 12,
  },
  stagesCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  stageRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  stageItem: {
    alignItems: "center",
    flex: 1,
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  stageBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  stageDays: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalDays: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
  },
  totalDaysLabel: {
    fontSize: 14,
  },
  totalDaysValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  seasonalCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  seasonalRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  seasonalItem: {
    alignItems: "center",
    flex: 1,
  },
  seasonalValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  seasonalLabel: {
    fontSize: 12,
  },
  seasonalNote: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  seasonalNoteText: {
    fontSize: 14,
  },
  characteristicsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  characteristicRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  characteristicLabel: {
    fontSize: 14,
  },
  characteristicValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  formulaCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  formulaText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  formulaDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
