import Colors from "@/constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  Text,
  View,
  type LayoutRectangle,
} from "react-native";
import Animated, { Easing, withTiming } from "react-native-reanimated";

export interface MoreMenuItem {
  /** Stable key for list reconciliation; omit only if labels are guaranteed unique. */
  id?: string;
  label: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
}

function menuItemRowKey(item: MoreMenuItem, index: number): string {
  if (item.id != null && item.id !== "") {
    return item.id;
  }
  return `${item.label}-${index}`;
}

interface MoreMenuButtonProps {
  menuItems: MoreMenuItem[];
  className?: string;
  /** Called when a menu item's onPress throws or rejects; defaults to console.error. */
  onMenuActionError?: (error: unknown) => void;
  /** Called when the menu is opened, before the panel is shown. */
  onOpen?: () => void;
}

const DURATION_IN = 120;
const DURATION_OUT = 100;
const CLOSE_DELAY_MS = DURATION_OUT + 40;
const MENU_ANCHOR_GAP = 6;

const easeOutCubic = Easing.bezier(0.33, 1, 0.68, 1);

const scaleIn = () => {
  "worklet";
  const config = {
    duration: DURATION_IN,
    easing: easeOutCubic,
  };
  return {
    initialValues: { opacity: 0, transform: [{ scale: 0 }] },
    animations: {
      opacity: withTiming(1, config),
      transform: [{ scale: withTiming(1, config) }],
    },
  };
};

const scaleOut = () => {
  "worklet";
  const config = {
    duration: DURATION_OUT,
    easing: easeOutCubic,
  };
  return {
    initialValues: { opacity: 1, transform: [{ scale: 1 }] },
    animations: {
      opacity: withTiming(0, config),
      transform: [{ scale: withTiming(0, config) }],
    },
  };
};

export function MoreMenuButton({
  menuItems,
  className = "",
  onMenuActionError,
  onOpen,
}: MoreMenuButtonProps) {
  const triggerRef = useRef<View>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    },
    [],
  );

  const finishCloseModal = useCallback(() => {
    setModalOpen(false);
    setAnchor(null);
    setShowPanel(false);
  }, []);

  const scheduleModalClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(finishCloseModal, CLOSE_DELAY_MS);
  }, [finishCloseModal]);

  const openMenu = () => {
    clearCloseTimer();
    onOpen?.();
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setModalOpen(true);
      requestAnimationFrame(() => setShowPanel(true));
    });
  };

  const closeMenu = useCallback(() => {
    setShowPanel(false);
    scheduleModalClose();
  }, [scheduleModalClose]);

  const runItem = async (item: MoreMenuItem) => {
    setShowPanel(false);
    scheduleModalClose();
    try {
      await Promise.resolve(item.onPress());
    } catch (error) {
      if (onMenuActionError) {
        onMenuActionError(error);
      } else {
        console.error("[MoreMenuButton] menu action failed:", error);
      }
    }
  };

  const windowWidth = Dimensions.get("window").width;
  const panelPosition =
    anchor != null
      ? {
          top: anchor.y + anchor.height + MENU_ANCHOR_GAP,
          right: windowWidth - (anchor.x + anchor.width),
        }
      : { top: 0, right: 16 };

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="More options"
          hitSlop={12}
          onPress={openMenu}
          className={`h-10 w-10 items-center justify-center rounded-full active:bg-zinc-800 ${className}`}
        >
          <FontAwesome name="ellipsis-h" size={20} color={Colors.palette.fog} />
        </Pressable>
      </View>

      <Modal
        visible={modalOpen}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeMenu}
      >
        <View className="flex-1">
          <Pressable className="absolute inset-0 bg-black/50" onPress={closeMenu} />

          {showPanel && anchor != null && (
            <Animated.View
              entering={scaleIn}
              exiting={scaleOut}
              style={{
                position: "absolute",
                top: panelPosition.top,
                right: panelPosition.right,
                transformOrigin: "top right",
              }}
              onStartShouldSetResponder={() => true}
            >
              <View className="min-w-[160px] rounded-xl border border-zinc-800 bg-zinc-900 py-1 shadow-lg">
                {menuItems.map((item, index) => (
                  <Pressable
                    key={menuItemRowKey(item, index)}
                    onPress={() => !item.disabled && runItem(item)}
                    disabled={item.disabled}
                    className={`px-5 py-3 ${item.disabled ? "" : "active:bg-zinc-800"} ${index > 0 ? "border-t border-zinc-800" : ""}`}
                  >
                    <Text className={`text-base font-semibold ${item.disabled ? "text-zinc-600" : "text-white"}`}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>
    </>
  );
}
