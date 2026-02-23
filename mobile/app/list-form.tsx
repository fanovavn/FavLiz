import React, { useState, useEffect } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch,
    KeyboardAvoidingView, Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { listsApi } from "../src/api/lists";
import { Colors, Spacing, FontSize, BorderRadius } from "../src/theme";
import LoadingSpinner from "../src/components/LoadingSpinner";

export default function ListFormScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const isEdit = !!id;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isEdit) {
            listsApi.getList(id!).then((list) => {
                setName(list.name);
                setDescription(list.description || "");
                setThumbnail(list.thumbnail || "");
                setIsPublic(list.viewMode === "PUBLIC");
                setLoading(false);
            }).catch(() => { Alert.alert("Lỗi"); router.back(); });
        }
    }, []);

    const handleSave = async () => {
        if (!name.trim()) { Alert.alert("Lỗi", "Vui lòng nhập tên"); return; }
        setSaving(true);
        try {
            const data = {
                name: name.trim(),
                description: description.trim() || undefined,
                thumbnail: thumbnail.trim() || undefined,
                viewMode: isPublic ? "PUBLIC" as const : "PRIVATE" as const,
            };
            if (isEdit) { await listsApi.updateList(id!, data); }
            else { await listsApi.createList(data); }
            router.back();
        } catch (err: unknown) {
            Alert.alert("Lỗi", (err as Error).message);
        } finally { setSaving(false); }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Stack.Screen options={{ title: isEdit ? "Chỉnh sửa bộ sưu tập" : "Tạo bộ sưu tập" }} />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                    <View style={styles.form}>
                        <Text style={styles.label}>Tên bộ sưu tập *</Text>
                        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tên bộ sưu tập" placeholderTextColor={Colors.textMuted} />

                        <Text style={styles.label}>Mô tả</Text>
                        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription}
                            placeholder="Mô tả..." placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} textAlignVertical="top" />

                        <Text style={styles.label}>URL ảnh đại diện</Text>
                        <TextInput style={styles.input} value={thumbnail} onChangeText={setThumbnail}
                            placeholder="https://..." placeholderTextColor={Colors.textMuted} autoCapitalize="none" />

                        <View style={styles.switchRow}>
                            <Text style={styles.label}>Công khai</Text>
                            <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: Colors.primary }} thumbColor="#fff" />
                        </View>

                        <TouchableOpacity style={saving ? styles.saveButtonDisabled : styles.saveButton} onPress={handleSave} disabled={saving}>
                            <Text style={styles.saveButtonText}>{saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo bộ sưu tập"}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    form: { padding: Spacing.xl, paddingBottom: 60 },
    label: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.text, marginTop: Spacing.lg, marginBottom: Spacing.xs },
    input: {
        backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border,
        paddingHorizontal: Spacing.md, height: 44, fontSize: FontSize.md, color: Colors.text,
    },
    textArea: { height: 80, paddingTop: Spacing.md },
    switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: Spacing.lg },
    saveButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 16, alignItems: "center", marginTop: Spacing.xxl },
    saveButtonDisabled: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 16, alignItems: "center", marginTop: Spacing.xxl, opacity: 0.6 },
    saveButtonText: { color: "#fff", fontWeight: "700", fontSize: FontSize.lg },
});
