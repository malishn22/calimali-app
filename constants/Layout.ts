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
