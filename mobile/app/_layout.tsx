import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/context/AuthContext";

export default function RootLayout() {
    return (
        <AuthProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
                <Stack.Screen name="forgot-password" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                    name="item-detail"
                    options={{ headerShown: true, title: "", headerBackTitle: "Back" }}
                />
                <Stack.Screen
                    name="item-form"
                    options={{ headerShown: true, title: "", headerBackTitle: "Back", presentation: "modal" }}
                />
                <Stack.Screen
                    name="list-detail"
                    options={{ headerShown: true, title: "", headerBackTitle: "Back" }}
                />
                <Stack.Screen
                    name="list-form"
                    options={{ headerShown: true, title: "", headerBackTitle: "Back", presentation: "modal" }}
                />
                <Stack.Screen
                    name="tag-detail"
                    options={{ headerShown: true, title: "", headerBackTitle: "Back" }}
                />
            </Stack>
        </AuthProvider>
    );
}
