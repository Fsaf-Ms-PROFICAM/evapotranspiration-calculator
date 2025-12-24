/**
 * ET Calculator Brazil - Theme Configuration
 * Agricultural-focused color palette with green accent
 */

import { Platform } from "react-native";

const primaryGreen = "#2E7D32"; // Agricultural green
const skyBlue = "#1976D2"; // Water/irrigation blue

export const Colors = {
  light: {
    text: "#212121",
    textSecondary: "#757575",
    background: "#FFFFFF",
    surface: "#F5F5F5",
    tint: primaryGreen,
    icon: "#757575",
    tabIconDefault: "#757575",
    tabIconSelected: primaryGreen,
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#D32F2F",
    blue: skyBlue,
    border: "#E0E0E0",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#B0B0B0",
    background: "#121212",
    surface: "#1E1E1E",
    tint: "#4CAF50",
    icon: "#B0B0B0",
    tabIconDefault: "#B0B0B0",
    tabIconSelected: "#4CAF50",
    success: "#66BB6A",
    warning: "#FFA726",
    error: "#EF5350",
    blue: "#42A5F5",
    border: "#2E2E2E",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
