import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4A90D9",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          backgroundColor: "#0D0D1A",
          borderTopColor: "#333",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Kontrol",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>🎮</Text>
          ),
        }}
      />
    </Tabs>
  );
}
