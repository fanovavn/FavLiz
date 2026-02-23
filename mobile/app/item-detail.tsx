import React, { useState, useEffect } from "react";
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, Linking,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { itemsApi, Item } from "../src/api/items";
import { Colors, Spacing, FontSize, BorderRadius, getThumbnailColor } from "../src/theme";
import LoadingSpinner from "../src/components/LoadingSpinner";

export default function ItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            const data = await itemsApi.getItem(id!);
            setItem(data);
        } catch { Alert.alert("Lỗi", "Không thể tải item"); router.back(); }
        finally { setLoading(false); }
    };

    const handleDelete = () => {
        Alert.alert("Xóa item", "Bạn có chắc muốn xóa?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive", onPress: async () => {
                    try { await itemsApi.deleteItem(id!); router.back(); }
                    catch { Alert.alert("Lỗi", "Không thể xóa item"); }
                },
            },
        ]);
    };

    if (loading || !item) return <LoadingSpinner />;

    return (
        <>
            <Stack.Screen options={{ title: item.title }} />
            <ScrollView style={styles.container}>
                {/* Thumbnail */}
                {item.thumbnail ? (
                    <Image source={{ uri: item.thumbnail }} style={styles.heroImage} />
                ) : (
                    <View style={[styles.heroImage, { backgroundColor: getThumbnailColor(item.title), justifyContent: "center", alignItems: "center" }]}>
                        <Text style={styles.heroInitials}>{item.title.slice(0, 2).toUpperCase()}</Text>
                    </View>
                )}

                <View style={styles.content}>
                    {/* Title & Badge */}
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{item.title}</Text>
                        <View style={[styles.badge, item.viewMode === "PUBLIC" ? styles.badgePublic : styles.badgePrivate]}>
                            <Text style={item.viewMode === "PUBLIC" ? styles.badgeTextPublic : styles.badgeTextPrivate}>
                                {item.viewMode === "PUBLIC" ? "🌐 Công khai" : "🔒 Riêng tư"}
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    {item.description && (
                        <Text style={styles.description}>{item.description}</Text>
                    )}

                    {/* Attachments */}
                    {item.attachments && item.attachments.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📎 Links & Ảnh</Text>
                            {item.attachments.map((att) => (
                                <TouchableOpacity
                                    key={att.id}
                                    style={styles.attachment}
                                    onPress={() => att.type === "LINK" && Linking.openURL(att.url)}
                                >
                                    <Text style={styles.attachIcon}>{att.type === "LINK" ? "🔗" : "📷"}</Text>
                                    <Text style={styles.attachUrl} numberOfLines={1}>{att.url}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Lists */}
                    {item.lists && item.lists.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📋 Bộ sưu tập</Text>
                            <View style={styles.chipRow}>
                                {item.lists.map((list) => (
                                    <TouchableOpacity key={list.id} style={styles.chip} onPress={() => router.push(`/list-detail?id=${list.id}`)}>
                                        <Text style={styles.chipText}>{list.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🏷 Tags</Text>
                            <View style={styles.chipRow}>
                                {item.tags.map((tag) => (
                                    <TouchableOpacity key={tag.id} style={[styles.chip, styles.tagChip]} onPress={() => router.push(`/tag-detail?id=${tag.id}`)}>
                                        <Text style={styles.tagChipText}>#{tag.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Date */}
                    <Text style={styles.date}>📅 Tạo lúc: {new Date(item.createdAt).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}</Text>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.editButton} onPress={() => router.push(`/item-form?id=${item.id}`)}>
                            <Text style={styles.editButtonText}>✏️ Chỉnh sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Text style={styles.deleteButtonText}>🗑 Xóa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    heroImage: { width: "100%", height: 220 },
    heroInitials: { fontSize: 48, color: "#fff", fontWeight: "800" },
    content: { padding: Spacing.xl },
    titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: Spacing.sm },
    title: { flex: 1, fontSize: FontSize.xxl, fontWeight: "800", color: Colors.text },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
    badgePublic: { backgroundColor: "rgba(22,163,74,0.1)" },
    badgePrivate: { backgroundColor: "rgba(100,116,139,0.08)" },
    badgeTextPublic: { fontSize: FontSize.xs, color: Colors.success, fontWeight: "600" },
    badgeTextPrivate: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: "600" },
    description: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginTop: Spacing.lg },
    section: { marginTop: Spacing.xl },
    sectionTitle: { fontSize: FontSize.md, fontWeight: "700", color: Colors.text, marginBottom: Spacing.sm },
    attachment: {
        flexDirection: "row", alignItems: "center", gap: Spacing.sm, padding: Spacing.md,
        backgroundColor: Colors.surface, borderRadius: BorderRadius.md, marginBottom: Spacing.xs,
    },
    attachIcon: { fontSize: 18 },
    attachUrl: { flex: 1, fontSize: FontSize.sm, color: Colors.info },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
    chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, backgroundColor: Colors.primary + "14", borderRadius: BorderRadius.full },
    chipText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: "600" },
    tagChip: { backgroundColor: Colors.info + "14" },
    tagChipText: { fontSize: FontSize.sm, color: Colors.info, fontWeight: "600" },
    date: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.xl },
    actions: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.xl, marginBottom: Spacing.xxxl },
    editButton: { flex: 1, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: "center" },
    editButtonText: { color: "#fff", fontWeight: "700", fontSize: FontSize.md },
    deleteButton: { flex: 1, backgroundColor: "#FEE2E2", borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: "center" },
    deleteButtonText: { color: Colors.error, fontWeight: "700", fontSize: FontSize.md },
});
