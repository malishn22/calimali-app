import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/Colors";
import {
  BOTTOM_BAR_PADDING_TOP,
  TAB_BAR_BOTTOM_GAP,
  TAB_BAR_HEIGHT,
} from "@/constants/Layout";
import { useColorScheme } from "@/hooks/useColorScheme";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        lazy: false,
        tabBarActiveTintColor: "#FFFFFF", // Neon bright white
        tabBarShowLabel: false, // Start of tabs shouldn't have names
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: false, // Hide headers by default in tabs as we build custom ones
        tabBarStyle: {
          backgroundColor: Colors["dark"].navigationBackground,
          borderTopColor: Colors["dark"].card,
          // Inset-aware so the bar clears the Android nav buttons / iOS home
          // indicator with a small gap, instead of overlapping them.
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: BOTTOM_BAR_PADDING_TOP,
          paddingBottom: insets.bottom + TAB_BAR_BOTTOM_GAP,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="th-large" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: "Planner",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: "Routines",
          tabBarIcon: ({ color }) => <TabBarIcon name="list-ul" color={color} />,
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: "Vault",
          tabBarIcon: ({ color }) => <TabBarIcon name="hdd-o" color={color} />, // Using hdd-o as a proxy for vault/database or 'list-alt'
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
