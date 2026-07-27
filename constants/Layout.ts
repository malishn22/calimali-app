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

/** Top padding of the tab bar's icon band. See app/(tabs)/_layout.tsx. */
export const BOTTOM_BAR_PADDING_TOP = 10;

/**
 * Action bars (session wizard footer, live-session controls). Deliberately taller
 * than the tab bar: these hold *filled* buttons, which need to meet the 44px minimum
 * tap target and need visible clearance from the system nav bar, where the tab bar's
 * bare icons read fine much closer.
 *
 * Band = PADDING_TOP + ACTION_HEIGHT + GAP + insets.bottom.
 */
export const BOTTOM_BAR_ACTION_HEIGHT = 46;
export const BOTTOM_BAR_ACTION_GAP = 9;
export const BOTTOM_BAR_ACTION_PADDING_TOP = 9;
/** Total action-bar band (64), excluding the safe-area inset. */
export const BOTTOM_ACTION_BAR_HEIGHT =
  BOTTOM_BAR_ACTION_PADDING_TOP +
  BOTTOM_BAR_ACTION_HEIGHT +
  BOTTOM_BAR_ACTION_GAP;

/**
 * Floating action button placement. `bottom` is measured from the FAB's container,
 * which on every screen ends at the top of the bottom bar — so a single offset puts
 * the FAB at the same height on every screen.
 */
export const FAB_BOTTOM_OFFSET = 24;
export const FAB_EDGE_OFFSET = 16;
/** Scroll padding so the last row clears the FAB (offset + 56px diameter + slack). */
export const FAB_CONTENT_CLEARANCE = 88;
