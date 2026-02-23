import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
    Platform, ScrollView, Alert, Image,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../src/context/AuthContext";
import { Colors, Spacing, FontSize, BorderRadius } from "../src/theme";

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
            return;
        }
        setLoading(true);
        try {
            await login(email.trim(), password);
            router.replace("/(tabs)");
        } catch (err: unknown) {
            Alert.alert("Đăng nhập thất bại", (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    <Text style={styles.title}>Chào mừng trở lại</Text>
                    <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>

                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="your@email.com"
                            placeholderTextColor={Colors.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <Text style={styles.label}>Mật khẩu</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="••••••"
                            placeholderTextColor={Colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={loading ? styles.buttonDisabled : styles.button}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Register link */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                    <Link href="/register" asChild>
                        <TouchableOpacity>
                            <Text style={styles.linkText}>Đăng ký</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { flexGrow: 1, justifyContent: "center", padding: Spacing.xl },
    logoContainer: { alignItems: "center", marginBottom: Spacing.xxxl },
    logo: { width: 180, height: 52 },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xxl,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    title: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.text, marginBottom: 4 },
    subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },
    label: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text, marginBottom: Spacing.xs, marginTop: Spacing.lg },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        height: 48,
    },
    inputIcon: { marginRight: Spacing.sm },
    input: { flex: 1, fontSize: FontSize.md, color: Colors.text },
    eyeButton: { padding: 4 },
    forgotText: { fontSize: FontSize.sm, color: Colors.primary, textAlign: "right", marginTop: Spacing.sm },
    button: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: Spacing.xl,
    },
    buttonDisabled: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: Spacing.xl,
        opacity: 0.6,
    },
    buttonText: { color: "#fff", fontSize: FontSize.md, fontWeight: "700" },
    footer: { flexDirection: "row", justifyContent: "center", marginTop: Spacing.xl },
    footerText: { fontSize: FontSize.sm, color: Colors.textSecondary },
    linkText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: "600" },
});
