import { useCallback } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/context/AuthContext";
import { useFonts } from "expo-font";
import {
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        "PlusJakartaSans-Regular": PlusJakartaSans_400Regular,
        "PlusJakartaSans-Medium": PlusJakartaSans_500Medium,
        "PlusJakartaSans-SemiBold": PlusJakartaSans_600SemiBold,
        "PlusJakartaSans-Bold": PlusJakartaSans_700Bold,
        "PlusJakartaSans-ExtraBold": PlusJakartaSans_800ExtraBold,
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
        </View>
    );
}
