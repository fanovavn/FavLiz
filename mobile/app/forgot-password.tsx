import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
    Platform, ScrollView, Alert, Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { authApi } from "../src/api/auth";
import { Colors, Spacing, FontSize, BorderRadius } from "../src/theme";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim()) { Alert.alert("Lỗi", "Vui lòng nhập email"); return; }
        setLoading(true);
        try {
            await authApi.forgotPassword(email.trim());
            setSent(true);
        } catch (err: unknown) {
            Alert.alert("Lỗi", (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <View style={styles.logoContainer}>
                    <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
                </View>

                <View style={styles.card}>
                    {sent ? (
                        <>
                            <View style={styles.successIconWrap}>
                                <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
                            </View>
                            <Text style={styles.title}>Email đã gửi!</Text>
                            <Text style={styles.subtitle}>Kiểm tra hộp thư của bạn để đặt lại mật khẩu.</Text>
                            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                                <Text style={styles.buttonText}>Quay lại đăng nhập</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.title}>Quên mật khẩu</Text>
                            <Text style={styles.subtitle}>Nhập email để nhận link đặt lại mật khẩu</Text>

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
                                />
                            </View>

                            <TouchableOpacity style={loading ? styles.buttonDisabled : styles.button} onPress={handleSubmit} disabled={loading}>
                                <Text style={styles.buttonText}>{loading ? "Đang gửi..." : "Gửi email →"}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <Ionicons name="arrow-back-outline" size={16} color={Colors.primary} />
                                <Text style={styles.linkText}> Quay lại đăng nhập</Text>
                            </TouchableOpacity>
                        </>
                    )}
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
        backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xxl,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    },
    successIconWrap: { alignItems: "center", marginBottom: Spacing.lg },
    title: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.text, marginBottom: 4, textAlign: "center" },
    subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xl, textAlign: "center" },
    label: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text, marginBottom: Spacing.xs, marginTop: Spacing.lg },
    inputContainer: {
        flexDirection: "row", alignItems: "center", backgroundColor: Colors.background,
        borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 48,
    },
    inputIcon: { marginRight: Spacing.sm },
    input: { flex: 1, fontSize: FontSize.md, color: Colors.text },
    button: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: "center", marginTop: Spacing.xl },
    buttonDisabled: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: "center", marginTop: Spacing.xl, opacity: 0.6 },
    buttonText: { color: "#fff", fontSize: FontSize.md, fontWeight: "700" },
    backButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: Spacing.lg },
    linkText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: "600", textAlign: "center" },
});
