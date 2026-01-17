import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
          height: 80, // Increased for visibility on phones
          paddingTop: 10,
          paddingBottom: 20, // Added bottom padding
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
