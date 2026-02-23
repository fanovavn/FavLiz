import React, { useState, useEffect } from "react";
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity, Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { tagsApi, TagDetail } from "../src/api/tags";
import { Colors, Spacing, FontSize, BorderRadius } from "../src/theme";
import ItemCard from "../src/components/ItemCard";
import LoadingSpinner from "../src/components/LoadingSpinner";
import EmptyState from "../src/components/EmptyState";

export default function TagDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [tag, setTag] = useState<TagDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (id) fetchTag(); }, [id]);

    const fetchTag = async () => {
        try { setTag(await tagsApi.getTag(id!)); }
        catch { Alert.alert("Lỗi"); router.back(); }
        finally { setLoading(false); }
    };

    const handleDelete = () => {
        Alert.alert("Xóa tag", "Bạn có chắc muốn xóa tag này?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive", onPress: async () => {
                    try { await tagsApi.deleteTag(id!); router.back(); }
                    catch { Alert.alert("Lỗi", "Không thể xóa tag"); }
                },
            },
        ]);
    };

    if (loading || !tag) return <LoadingSpinner />;

    return (
        <>
            <Stack.Screen options={{ title: `#${tag.name}` }} />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.tagName}>#{tag.name}</Text>
                        <Text style={styles.tagMeta}>{tag.itemCount} items</Text>
                    </View>
                    <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                        <Text style={styles.deleteBtnText}>🗑 Xóa</Text>
                    </TouchableOpacity>
                </View>

                {/* Items */}
                {tag.items.length === 0 ? (
                    <EmptyState icon="🏷" title="Chưa có item nào với tag này" />
                ) : (
                    <FlatList
                        data={tag.items}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <ItemCard
                                title={item.title}
                                thumbnail={item.thumbnail}
                                viewMode={item.viewMode}
                                tags={item.tags}
                                attachmentCount={item._count?.attachments}
                                onPress={() => router.push(`/item-detail?id=${item.id}`)}
                            />
                        )}
                        contentContainerStyle={{ padding: Spacing.lg }}
                    />
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        padding: Spacing.lg, backgroundColor: Colors.surface,
        borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    tagName: { fontSize: FontSize.xl, fontWeight: "800", color: Colors.info },
    tagMeta: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
    deleteBtn: { backgroundColor: "#FEE2E2", borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 8 },
    deleteBtnText: { color: Colors.error, fontWeight: "700", fontSize: FontSize.sm },
});
