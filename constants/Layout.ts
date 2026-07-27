import { Platform } from "react-native";

/**
 * Bottom sheet offset from screen bottom (for nav bar clearance).
 * Adjust ANDROID_BOTTOM_OFFSET manually if the sheet doesn't align with the nav bar on Android.
 */
export const ANDROID_BOTTOM_OFFSET = 22;
export const IOS_BOTTOM_OFFSET = 80;

export const BOTTOM_SHEET_OFFSET = Platform.select({
  android: ANDROID_BOTTOM_OFFSET,
  ios: IOS_BOTTOM_OFFSET,
  default: ANDROID_BOTTOM_OFFSET,
});

/**
 * Bottom tab bar sizing. The bar's total height is TAB_BAR_HEIGHT plus the
 * device's bottom safe-area inset (Android nav bar / iOS home indicator), and its
 * content is pushed up by that inset plus TAB_BAR_BOTTOM_GAP so the icons clear the
 * system navigation buttons with a little breathing room. See app/(tabs)/_layout.tsx.
 */
export const TAB_BAR_HEIGHT = 52;
export const TAB_BAR_BOTTOM_GAP = 2;
