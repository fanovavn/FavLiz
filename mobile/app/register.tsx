import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView,
    Platform, ScrollView, Alert, Image,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../src/context/AuthContext";
import { Colors, Spacing, FontSize, BorderRadius } from "../src/theme";

type Step = "email" | "otp" | "done";

export default function RegisterScreen() {
    const router = useRouter();
    const { register, verifyOtp } = useAuth();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!email.trim()) { Alert.alert("Lỗi", "Vui lòng nhập email"); return; }
        if (!password || password.length < 6) { Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự"); return; }
        if (password !== confirmPassword) { Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp"); return; }

        setLoading(true);
        try {
            await register(email.trim(), password);
            setStep("otp");
        } catch (err: unknown) {
            Alert.alert("Lỗi", (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim()) { Alert.alert("Lỗi", "Vui lòng nhập mã OTP"); return; }

        setLoading(true);
        try {
            await verifyOtp(email.trim(), otp.trim());
            Alert.alert("Thành công", "Tài khoản đã được tạo!", [
                { text: "OK", onPress: () => router.replace("/(tabs)") },
            ]);
        } catch (err: unknown) {
            Alert.alert("Lỗi", (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const stepIndicator = (
        <View style={styles.steps}>
            {["email", "otp", "done"].map((s, i) => {
                const isActive = step === s || (s === "email" && step !== "email") || (s === "otp" && step === "done");
                const lineActive0 = i === 0 && step !== "email";
                const lineActive1 = i === 1 && step === "done";
                return (
                    <React.Fragment key={s}>
                        <View style={isActive ? styles.stepDotActive : styles.stepDot} />
                        {i < 2 && <View style={(lineActive0 || lineActive1) ? styles.stepLineActive : styles.stepLine} />}
                    </React.Fragment>
                );
            })}
        </View>
    );

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <View style={styles.logoContainer}>
                    <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
                </View>

                <View style={styles.card}>
                    {stepIndicator}

                    {step === "email" ? (
                        <>
                            <Text style={styles.title}>Tạo tài khoản</Text>
                            <Text style={styles.subtitle}>Nhập thông tin để bắt đầu</Text>

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

                            <Text style={styles.label}>Mật khẩu</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ít nhất 6 ký tự"
                                    placeholderTextColor={Colors.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            <Text style={styles.label}>Xác nhận mật khẩu</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập lại mật khẩu"
                                    placeholderTextColor={Colors.textMuted}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity style={loading ? styles.buttonDisabled : styles.button} onPress={handleSendOtp} disabled={loading}>
                                <Text style={styles.buttonText}>{loading ? "Đang gửi..." : "Gửi mã OTP →"}</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.title}>Xác thực email</Text>
                            <Text style={styles.subtitle}>Mã OTP đã gửi đến {email}</Text>

                            <Text style={styles.label}>Mã OTP</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="key-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.otpInput}
                                    placeholder="_ _ _ _ _ _"
                                    placeholderTextColor={Colors.textMuted}
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>

                            <TouchableOpacity style={loading ? styles.buttonDisabled : styles.button} onPress={handleVerifyOtp} disabled={loading}>
                                <Text style={styles.buttonText}>{loading ? "Đang xác thực..." : "Xác thực →"}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setStep("email")} style={styles.backButton}>
                                <Ionicons name="arrow-back-outline" size={16} color={Colors.primary} />
                                <Text style={styles.linkText}> Quay lại</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Đã có tài khoản? </Text>
                    <Link href="/login" asChild>
                        <TouchableOpacity><Text style={styles.linkText}>Đăng nhập</Text></TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { flexGrow: 1, justifyContent: "center", padding: Spacing.xl },
    logoContainer: { alignItems: "center", marginBottom: Spacing.xxl },
    logo: { width: 180, height: 52 },
    card: {
        backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xxl,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
    },
    steps: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: Spacing.xl },
    stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
    stepDotActive: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
    stepLine: { width: 40, height: 2, backgroundColor: Colors.border },
    stepLineActive: { width: 40, height: 2, backgroundColor: Colors.primary },
    title: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.text, marginBottom: 4 },
    subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xl },
    label: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text, marginBottom: Spacing.xs, marginTop: Spacing.lg },
    inputContainer: {
        flexDirection: "row", alignItems: "center", backgroundColor: Colors.background,
        borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 48,
    },
    inputIcon: { marginRight: Spacing.sm },
    input: { flex: 1, fontSize: FontSize.md, color: Colors.text },
    otpInput: { flex: 1, fontSize: 24, color: Colors.text, textAlign: "center", letterSpacing: 8 },
    button: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: "center", marginTop: Spacing.xl },
    buttonDisabled: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: "center", marginTop: Spacing.xl, opacity: 0.6 },
    buttonText: { color: "#fff", fontSize: FontSize.md, fontWeight: "700" },
    backButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: Spacing.lg },
    footer: { flexDirection: "row", justifyContent: "center", marginTop: Spacing.xl },
    footerText: { fontSize: FontSize.sm, color: Colors.textSecondary },
    linkText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: "600" },
});
