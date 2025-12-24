import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function InfoScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? "light"];

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
    >
      <ThemedText type="title" style={[styles.mainTitle, { color: colors.text }]}>
        About ET₀
      </ThemedText>

      {/* What is ET₀ */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
          What is Reference Evapotranspiration?
        </ThemedText>
        <ThemedView
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          lightColor={colors.surface}
          darkColor={colors.surface}
        >
          <ThemedText style={[styles.cardText, { color: colors.text }]}>
            Reference evapotranspiration (ET₀) represents the rate at which water would evaporate
            and transpire from a standardized vegetated surface. It is calculated using the FAO-56
            Penman-Monteith equation, which considers temperature, humidity, wind speed, and solar
            radiation.
          </ThemedText>
          <ThemedText style={[styles.cardText, { color: colors.text, marginTop: 12 }]}>
            ET₀ is measured in millimeters per day (mm/day) and serves as a reference for
            determining the water requirements of different crops. By multiplying ET₀ by a
            crop-specific coefficient, farmers can estimate how much water their crops need for
            optimal growth.
          </ThemedText>
        </ThemedView>
      </View>

      {/* How to Use */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
          How to Use This App
        </ThemedText>
        <ThemedView
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          lightColor={colors.surface}
          darkColor={colors.surface}
        >
          <View style={styles.stepItem}>
            <ThemedText style={[styles.stepNumber, { color: colors.tint }]}>1</ThemedText>
            <ThemedText style={[styles.stepText, { color: colors.text }]}>
              Select your location by tapping the location name on the Home screen
            </ThemedText>
          </View>
          <View style={styles.stepItem}>
            <ThemedText style={[styles.stepNumber, { color: colors.tint }]}>2</ThemedText>
            <ThemedText style={[styles.stepText, { color: colors.text }]}>
              View the current ET₀ value and supporting weather data
            </ThemedText>
          </View>
          <View style={styles.stepItem}>
            <ThemedText style={[styles.stepNumber, { color: colors.tint }]}>3</ThemedText>
            <ThemedText style={[styles.stepText, { color: colors.text }]}>
              Check the 7-day forecast to plan irrigation schedules
            </ThemedText>
          </View>
          <View style={styles.stepItem}>
            <ThemedText style={[styles.stepNumber, { color: colors.tint }]}>4</ThemedText>
            <ThemedText style={[styles.stepText, { color: colors.text }]}>
              Use ET₀ values with crop coefficients to calculate irrigation needs
            </ThemedText>
          </View>
        </ThemedView>
      </View>

      {/* ET₀ Ranges */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
          Understanding ET₀ Values
        </ThemedText>
        <ThemedView
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          lightColor={colors.surface}
          darkColor={colors.surface}
        >
          <View style={styles.rangeItem}>
            <View style={[styles.rangeBadge, { backgroundColor: "#4CAF50" }]}>
              <ThemedText style={styles.rangeBadgeText}>Low</ThemedText>
            </View>
            <View style={styles.rangeInfo}>
              <ThemedText style={[styles.rangeValue, { color: colors.text }]}>
                {"< 3 mm/day"}
              </ThemedText>
              <ThemedText style={[styles.rangeDesc, { color: colors.textSecondary }]}>
                Minimal irrigation needed. Typical during cool, cloudy, or humid conditions.
              </ThemedText>
            </View>
          </View>

          <View style={styles.rangeItem}>
            <View style={[styles.rangeBadge, { backgroundColor: "#2E7D32" }]}>
              <ThemedText style={styles.rangeBadgeText}>Moderate</ThemedText>
            </View>
            <View style={styles.rangeInfo}>
              <ThemedText style={[styles.rangeValue, { color: colors.text }]}>
                3-5 mm/day
              </ThemedText>
              <ThemedText style={[styles.rangeDesc, { color: colors.textSecondary }]}>
                Normal irrigation requirements. Common during mild weather conditions.
              </ThemedText>
            </View>
          </View>

          <View style={styles.rangeItem}>
            <View style={[styles.rangeBadge, { backgroundColor: "#FF9800" }]}>
              <ThemedText style={styles.rangeBadgeText}>High</ThemedText>
            </View>
            <View style={styles.rangeInfo}>
              <ThemedText style={[styles.rangeValue, { color: colors.text }]}>
                5-7 mm/day
              </ThemedText>
              <ThemedText style={[styles.rangeDesc, { color: colors.textSecondary }]}>
                Increased irrigation needed. Typical during hot, dry, or windy conditions.
              </ThemedText>
            </View>
          </View>

          <View style={styles.rangeItem}>
            <View style={[styles.rangeBadge, { backgroundColor: "#D32F2F" }]}>
              <ThemedText style={styles.rangeBadgeText}>Very High</ThemedText>
            </View>
            <View style={styles.rangeInfo}>
              <ThemedText style={[styles.rangeValue, { color: colors.text }]}>
                {"> 7 mm/day"}
              </ThemedText>
              <ThemedText style={[styles.rangeDesc, { color: colors.textSecondary }]}>
                Maximum irrigation required. Occurs during extreme heat and low humidity.
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </View>

      {/* Calculation Method */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
          Calculation Method
        </ThemedText>
        <ThemedView
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          lightColor={colors.surface}
          darkColor={colors.surface}
        >
          <ThemedText style={[styles.cardText, { color: colors.text }]}>
            This app uses the <ThemedText type="defaultSemiBold">FAO-56 Penman-Monteith</ThemedText>{" "}
            equation, which is the international standard for calculating reference
            evapotranspiration. The equation considers:
          </ThemedText>
          <View style={styles.bulletList}>
            <ThemedText style={[styles.bulletItem, { color: colors.text }]}>
              • Air temperature (maximum and minimum)
            </ThemedText>
            <ThemedText style={[styles.bulletItem, { color: colors.text }]}>
              • Relative humidity
            </ThemedText>
            <ThemedText style={[styles.bulletItem, { color: colors.text }]}>
              • Wind speed at 10 meters height
            </ThemedText>
            <ThemedText style={[styles.bulletItem, { color: colors.text }]}>
              • Solar radiation (shortwave)
            </ThemedText>
          </View>
        </ThemedView>
      </View>

      {/* Data Source */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
          Data Sources
        </ThemedText>
        <ThemedView
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          lightColor={colors.surface}
          darkColor={colors.surface}
        >
          <ThemedText style={[styles.cardText, { color: colors.text }]}>
            <ThemedText type="defaultSemiBold">Weather Data:</ThemedText> Open-Meteo API
          </ThemedText>
          <ThemedText style={[styles.cardText, { color: colors.textSecondary, marginTop: 4 }]}>
            High-resolution weather forecasts from national weather services worldwide, updated
            hourly.
          </ThemedText>

          <ThemedText style={[styles.cardText, { color: colors.text, marginTop: 16 }]}>
            <ThemedText type="defaultSemiBold">ET₀ Calculation:</ThemedText> FAO-56
            Penman-Monteith
          </ThemedText>
          <ThemedText style={[styles.cardText, { color: colors.textSecondary, marginTop: 4 }]}>
            Standard method recommended by the Food and Agriculture Organization of the United
            Nations (FAO).
          </ThemedText>
        </ThemedView>
      </View>

      {/* For Brazil */}
      <View style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
          For Brazilian Agriculture
        </ThemedText>
        <ThemedView
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          lightColor={colors.surface}
          darkColor={colors.surface}
        >
          <ThemedText style={[styles.cardText, { color: colors.text }]}>
            Brazil's diverse climate zones require careful irrigation management. ET₀ values
            typically range from 3-7 mm/day depending on the region and season:
          </ThemedText>
          <View style={styles.bulletList}>
            <ThemedText style={[styles.bulletItem, { color: colors.text }]}>
              • <ThemedText type="defaultSemiBold">Amazon region:</ThemedText> Lower ET₀ due to high
              humidity
            </ThemedText>
            <ThemedText style={[styles.bulletItem, { color: colors.text }]}>
              • <ThemedText type="defaultSemiBold">Central Brazil:</ThemedText> Higher ET₀ during
              dry season
            </ThemedText>
            <ThemedText style={[styles.bulletItem, { color: colors.text }]}>
              • <ThemedText type="defaultSemiBold">Southern regions:</ThemedText> Moderate ET₀ with
              seasonal variation
            </ThemedText>
          </View>
        </ThemedView>
      </View>

      {/* App Info */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
          ET Calculator Brazil
        </ThemedText>
        <ThemedText style={[styles.footerText, { color: colors.textSecondary }]}>
          Version 1.0.0
        </ThemedText>
      </View>
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
  mainTitle: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  stepNumber: {
    fontSize: 20,
    fontWeight: "bold",
    width: 32,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  rangeItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  rangeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 80,
    alignItems: "center",
  },
  rangeBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  rangeInfo: {
    flex: 1,
  },
  rangeValue: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  rangeDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  bulletList: {
    marginTop: 12,
    gap: 8,
  },
  bulletItem: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    paddingTop: 24,
    marginTop: 24,
    borderTopWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 14,
  },
});
