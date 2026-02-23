import React, { useState, useEffect } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch,
    KeyboardAvoidingView, Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { itemsApi, Item } from "../src/api/items";
import { listsApi, List } from "../src/api/lists";
import { Colors, Spacing, FontSize, BorderRadius } from "../src/theme";
import LoadingSpinner from "../src/components/LoadingSpinner";

export default function ItemFormScreen() {
    const { id, sharedUrl, sharedTitle, listId } = useLocalSearchParams<{ id?: string; sharedUrl?: string; sharedTitle?: string; listId?: string }>();
    const router = useRouter();
    const isEdit = !!id;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
    const [linkInput, setLinkInput] = useState("");
    const [attachments, setAttachments] = useState<Array<{ type: string; url: string }>>([]);
    const [userLists, setUserLists] = useState<List[]>([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        listsApi.getLists().then(setUserLists).catch(() => { });

        // Handle shared URL from other apps
        if (sharedUrl && !isEdit) {
            const url = decodeURIComponent(sharedUrl);
            const type = /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? "IMAGE" : "LINK";
            setAttachments([{ type, url }]);
            if (sharedTitle) {
                setTitle(decodeURIComponent(sharedTitle));
            }
        }

        // Pre-select list if listId is provided
        if (listId && !isEdit) {
            setSelectedListIds([listId]);
        }

        if (isEdit) {
            itemsApi.getItem(id!).then((item) => {
                setTitle(item.title);
                setDescription(item.description || "");
                setThumbnail(item.thumbnail || "");
                setIsPublic(item.viewMode === "PUBLIC");
                setTags(item.tags.map((t) => t.name));
                setSelectedListIds(item.lists.map((l) => l.id));
                setAttachments((item.attachments || []).map((a) => ({ type: a.type, url: a.url })));
                setLoading(false);
            }).catch(() => { Alert.alert("Lỗi", "Không thể tải item"); router.back(); });
        }
    }, []);

    const addTag = () => {
        const t = tagInput.trim();
        if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); }
    };

    const addLink = () => {
        const url = linkInput.trim();
        if (url) {
            const type = /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? "IMAGE" : "LINK";
            setAttachments([...attachments, { type, url }]);
            setLinkInput("");
        }
    };

    const handleSave = async () => {
        if (!title.trim()) { Alert.alert("Lỗi", "Vui lòng nhập tên"); return; }
        setSaving(true);
        try {
            const data = {
                title: title.trim(),
                description: description.trim() || undefined,
                thumbnail: thumbnail.trim() || undefined,
                viewMode: isPublic ? "PUBLIC" as const : "PRIVATE" as const,
                tagNames: tags,
                listIds: selectedListIds,
                attachments,
            };
            if (isEdit) { await itemsApi.updateItem(id!, data); }
            else { await itemsApi.createItem(data); }
            router.back();
        } catch (err: unknown) {
            Alert.alert("Lỗi", (err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Stack.Screen options={{ title: isEdit ? "Chỉnh sửa" : "Thêm mới" }} />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                    <View style={styles.form}>
                        {/* Title */}
                        <Text style={styles.label}>Tên *</Text>
                        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Tên item" placeholderTextColor={Colors.textMuted} />

                        {/* Description */}
                        <Text style={styles.label}>Mô tả / Ghi chú</Text>
                        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription}
                            placeholder="Mô tả chi tiết..." placeholderTextColor={Colors.textMuted} multiline numberOfLines={4} textAlignVertical="top" />

                        {/* Thumbnail */}
                        <Text style={styles.label}>URL ảnh đại diện</Text>
                        <TextInput style={styles.input} value={thumbnail} onChangeText={setThumbnail}
                            placeholder="https://..." placeholderTextColor={Colors.textMuted} autoCapitalize="none" />

                        {/* Tags */}
                        <Text style={styles.label}>Tags</Text>
                        <View style={styles.chipRow}>
                            {tags.map((tag) => (
                                <TouchableOpacity key={tag} style={styles.tagChip} onPress={() => setTags(tags.filter((t) => t !== tag))}>
                                    <Text style={styles.tagChipText}>{tag} ✕</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.row}>
                            <TextInput style={[styles.input, { flex: 1 }]} value={tagInput} onChangeText={setTagInput}
                                placeholder="Thêm tag..." placeholderTextColor={Colors.textMuted} onSubmitEditing={addTag} />
                            <TouchableOpacity style={styles.smallButton} onPress={addTag}>
                                <Text style={styles.smallButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Lists */}
                        <Text style={styles.label}>Bộ sưu tập</Text>
                        <View style={styles.chipRow}>
                            {userLists.map((list) => {
                                const selected = selectedListIds.includes(list.id);
                                return (
                                    <TouchableOpacity
                                        key={list.id}
                                        style={[styles.listChip, selected ? styles.listChipActive : undefined]}
                                        onPress={() => {
                                            if (selected) setSelectedListIds(selectedListIds.filter((id) => id !== list.id));
                                            else setSelectedListIds([...selectedListIds, list.id]);
                                        }}
                                    >
                                        <Text style={[styles.listChipText, selected ? styles.listChipTextActive : undefined]}>
                                            {selected ? "✓ " : ""}{list.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Attachments */}
                        <Text style={styles.label}>Links / Tệp đính kèm</Text>
                        {attachments.map((att, i) => (
                            <View key={i} style={styles.attachRow}>
                                <Text style={styles.attachIcon}>{att.type === "LINK" ? "🔗" : "📷"}</Text>
                                <Text style={styles.attachUrl} numberOfLines={1}>{att.url}</Text>
                                <TouchableOpacity onPress={() => setAttachments(attachments.filter((_, j) => j !== i))}>
                                    <Text style={styles.removeText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        <View style={styles.row}>
                            <TextInput style={[styles.input, { flex: 1 }]} value={linkInput} onChangeText={setLinkInput}
                                placeholder="Paste link..." placeholderTextColor={Colors.textMuted} autoCapitalize="none" onSubmitEditing={addLink} />
                            <TouchableOpacity style={styles.smallButton} onPress={addLink}>
                                <Text style={styles.smallButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        {/* View Mode */}
                        <View style={styles.switchRow}>
                            <Text style={styles.label}>Công khai</Text>
                            <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: Colors.primary }} thumbColor="#fff" />
                        </View>

                        {/* Save */}
                        <TouchableOpacity style={saving ? styles.saveButtonDisabled : styles.saveButton} onPress={handleSave} disabled={saving}>
                            <Text style={styles.saveButtonText}>{saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo item"}</Text>
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
    textArea: { height: 100, paddingTop: Spacing.md },
    row: { flexDirection: "row", gap: Spacing.sm, alignItems: "center" },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs, marginBottom: Spacing.sm },
    tagChip: { backgroundColor: Colors.info + "14", paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full },
    tagChipText: { fontSize: FontSize.sm, color: Colors.info, fontWeight: "600" },
    listChip: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full },
    listChipActive: { backgroundColor: Colors.primary + "14", borderColor: Colors.primary },
    listChipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
    listChipTextActive: { color: Colors.primary, fontWeight: "600" },
    smallButton: { backgroundColor: Colors.primary, width: 44, height: 44, borderRadius: BorderRadius.md, justifyContent: "center", alignItems: "center" },
    smallButtonText: { color: "#fff", fontSize: 20, fontWeight: "700" },
    attachRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, padding: Spacing.sm, backgroundColor: Colors.surface, borderRadius: BorderRadius.sm, marginBottom: 4 },
    attachIcon: { fontSize: 16 },
    attachUrl: { flex: 1, fontSize: FontSize.sm, color: Colors.info },
    removeText: { fontSize: 16, color: Colors.error, padding: 4 },
    switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: Spacing.lg },
    saveButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 16, alignItems: "center", marginTop: Spacing.xxl },
    saveButtonDisabled: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 16, alignItems: "center", marginTop: Spacing.xxl, opacity: 0.6 },
    saveButtonText: { color: "#fff", fontWeight: "700", fontSize: FontSize.lg },
});
