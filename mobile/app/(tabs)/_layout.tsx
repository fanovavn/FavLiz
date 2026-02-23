import { Tabs, Redirect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { Colors, FontSize } from "../../src/theme";
import LoadingSpinner from "../../src/components/LoadingSpinner";
import { Ionicons } from "@expo/vector-icons";
import { useShareIntent } from "../../src/hooks/useShareIntent";

export default function TabsLayout() {
    const { isLoading, isAuthenticated } = useAuth();

    if (isLoading) return <LoadingSpinner />;
    if (!isAuthenticated) return <Redirect href="/login" />;

    // Handle share intents from other apps
    useShareIntent();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.border,
                    paddingBottom: 4,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: FontSize.xs,
                    fontWeight: "600",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="items"
                options={{
                    title: "Items",
                    tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "bookmark" : "bookmark-outline"} size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="lists"
                options={{
                    title: "Lists",
                    tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "albums" : "albums-outline"} size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="tags"
                options={{
                    title: "Tags",
                    tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "pricetag" : "pricetag-outline"} size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
