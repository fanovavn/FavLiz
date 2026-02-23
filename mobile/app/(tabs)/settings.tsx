import React, { useState, useCallback } from "react";
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { profileApi, UserProfile } from "../../src/api/profile";
import { Colors, Spacing, FontSize, BorderRadius } from "../../src/theme";
import { LOCALE_NAMES, LOCALE_FLAGS, Locale } from "../../src/i18n";

const THEME_COLORS = [
    { name: "Hồng", value: "#E91E63" },
    { name: "Tím", value: "#7C3AED" },
    { name: "Xanh dương", value: "#2563EB" },
    { name: "Xanh lá", value: "#16A34A" },
    { name: "Cam", value: "#D97706" },
    { name: "Đỏ", value: "#DC2626" },
    { name: "Teal", value: "#0D9488" },
];

export default function SettingsTab() {
    const { user, logout, updateUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [itemsLabel, setItemsLabel] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProfile = async () => {
        try {
            const data = await profileApi.getProfile();
            setProfile(data);
            setName(data.name || "");
            setUsername(data.username || "");
            setItemsLabel(data.itemsLabel || "");
        } catch { /* silent */ } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchProfile(); }, []));

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const updated = await profileApi.updateProfile({ name: name.trim(), username: username.trim(), itemsLabel: itemsLabel.trim() || null });
            setProfile(updated);
            updateUser(updated);
            Alert.alert("Thành công", "Đã cập nhật hồ sơ");
        } catch (err: unknown) {
            Alert.alert("Lỗi", (err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) { Alert.alert("Lỗi", "Vui lòng nhập đầy đủ"); return; }
        if (newPassword.length < 6) { Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự"); return; }
        setSaving(true);
        try {
            await profileApi.changePassword(currentPassword, newPassword);
            Alert.alert("Thành công", "Đã đổi mật khẩu");
            setCurrentPassword("");
            setNewPassword("");
        } catch (err: unknown) {
            Alert.alert("Lỗi", (err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    const handleThemeChange = async (color: string) => {
        try {
            const updated = await profileApi.updateProfile({ themeColor: color });
            setProfile(updated);
            updateUser(updated);
        } catch { /* silent */ }
    };

    const handleLanguageChange = async (lang: string) => {
        try {
            const updated = await profileApi.updateProfile({ language: lang });
            setProfile(updated);
            updateUser(updated);
        } catch { /* silent */ }
    };

    const handleLogout = () => {
        Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
            { text: "Hủy", style: "cancel" },
            { text: "Đăng xuất", style: "destructive", onPress: logout },
        ]);
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfile(); }} tintColor={Colors.primary} />}
        >
            <View style={styles.header}>
                <Ionicons name="settings-outline" size={24} color={Colors.text} />
                <Text style={styles.headerTitle}> Cài đặt</Text>
            </View>

            {/* Profile Section */}
            <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                    <Ionicons name="person-outline" size={18} color={Colors.text} />
                    <Text style={styles.sectionTitle}> Hồ sơ</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.emailText}>{profile?.email}</Text>

                    <Text style={styles.label}>Tên hiển thị</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tên của bạn" placeholderTextColor={Colors.textMuted} />

                    <Text style={styles.label}>Username</Text>
                    <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="username" placeholderTextColor={Colors.textMuted} autoCapitalize="none" />

                    <Text style={styles.label}>Nhãn Items</Text>
                    <TextInput style={styles.input} value={itemsLabel} onChangeText={setItemsLabel} placeholder="VD: Công thức, Sách..." placeholderTextColor={Colors.textMuted} />

                    <TouchableOpacity style={saving ? styles.saveButtonDisabled : styles.saveButton} onPress={handleSaveProfile} disabled={saving}>
                        <Text style={styles.saveButtonText}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Theme Color */}
            <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                    <Ionicons name="color-palette-outline" size={18} color={Colors.text} />
                    <Text style={styles.sectionTitle}> Màu chủ đạo</Text>
                </View>
                <View style={styles.card}>
                    <View style={styles.colorRow}>
                        {THEME_COLORS.map((c) => {
                            const isActive = profile?.themeColor === c.value;
                            const dotStyle = {
                                width: 36, height: 36, borderRadius: 18,
                                justifyContent: "center" as const, alignItems: "center" as const,
                                backgroundColor: c.value,
                                ...(isActive ? { borderWidth: 3, borderColor: Colors.text } : {}),
                            };
                            return (
                                <TouchableOpacity
                                    key={c.value}
                                    style={dotStyle}
                                    onPress={() => handleThemeChange(c.value)}
                                >
                                    {isActive && (
                                        <Ionicons name="checkmark" size={18} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>

            {/* Language */}
            <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                    <Ionicons name="globe-outline" size={18} color={Colors.text} />
                    <Text style={styles.sectionTitle}> Ngôn ngữ</Text>
                </View>
                <View style={styles.card}>
                    {(Object.keys(LOCALE_NAMES) as Locale[]).map((lang) => (
                        <TouchableOpacity
                            key={lang}
                            style={[styles.langOption, profile?.language === lang ? styles.langOptionActive : undefined]}
                            onPress={() => handleLanguageChange(lang)}
                        >
                            <Text style={styles.langFlag}>{LOCALE_FLAGS[lang]}</Text>
                            <Text style={[styles.langText, profile?.language === lang ? styles.langTextActive : undefined]}>{LOCALE_NAMES[lang]}</Text>
                            {profile?.language === lang && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Change Password */}
            <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                    <Ionicons name="lock-closed-outline" size={18} color={Colors.text} />
                    <Text style={styles.sectionTitle}> Đổi mật khẩu</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.label}>Mật khẩu hiện tại</Text>
                    <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="••••••" placeholderTextColor={Colors.textMuted} />

                    <Text style={styles.label}>Mật khẩu mới</Text>
                    <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Ít nhất 6 ký tự" placeholderTextColor={Colors.textMuted} />

                    <TouchableOpacity style={saving ? styles.saveButtonDisabled : styles.saveButton} onPress={handleChangePassword} disabled={saving}>
                        <Text style={styles.saveButtonText}>{saving ? "Đang đổi..." : "Đổi mật khẩu"}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Logout */}
            <View style={styles.sectionBottom}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                    <Text style={styles.logoutText}> Đăng xuất</Text>
                </TouchableOpacity>
                <Text style={styles.version}>FavLiz Mobile v1.0.0</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.md,
        backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    headerTitle: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.text },
    section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
    sectionTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm },
    sectionTitle: { fontSize: FontSize.md, fontWeight: "700", color: Colors.text },
    card: {
        backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    label: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text, marginBottom: Spacing.xs, marginTop: Spacing.md },
    emailText: { fontSize: FontSize.md, color: Colors.textSecondary },
    input: {
        backgroundColor: Colors.background, borderRadius: BorderRadius.md, borderWidth: 1,
        borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 44, fontSize: FontSize.md, color: Colors.text,
    },
    saveButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 12, alignItems: "center", marginTop: Spacing.lg },
    saveButtonDisabled: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 12, alignItems: "center", marginTop: Spacing.lg, opacity: 0.6 },
    saveButtonText: { color: "#fff", fontWeight: "700", fontSize: FontSize.md },
    sectionBottom: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl, marginBottom: 60 },
    colorRow: { flexDirection: "row", gap: Spacing.md, flexWrap: "wrap" },
    colorDot: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
    colorDotActive: { borderWidth: 3, borderColor: Colors.text },
    langOption: {
        flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingVertical: Spacing.md,
        borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    langOptionActive: { backgroundColor: Colors.primary + "08" },
    langFlag: { fontSize: 24 },
    langText: { flex: 1, fontSize: FontSize.md, color: Colors.text },
    langTextActive: { fontWeight: "700", color: Colors.primary },
    logoutButton: {
        backgroundColor: "#FEE2E2", borderRadius: BorderRadius.lg, paddingVertical: 14,
        alignItems: "center", flexDirection: "row", justifyContent: "center",
    },
    logoutText: { fontSize: FontSize.md, fontWeight: "700", color: Colors.error },
    version: { textAlign: "center", marginTop: Spacing.lg, fontSize: FontSize.xs, color: Colors.textMuted },
});
