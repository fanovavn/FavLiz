import React, { useState, useEffect } from "react";
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { listsApi, ListDetail } from "../src/api/lists";
import { Colors, Spacing, FontSize, BorderRadius, getThumbnailColor } from "../src/theme";
import ItemCard from "../src/components/ItemCard";
import LoadingSpinner from "../src/components/LoadingSpinner";
import EmptyState from "../src/components/EmptyState";

export default function ListDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [list, setList] = useState<ListDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (id) fetchList(); }, [id]);

    const fetchList = async () => {
        try { setList(await listsApi.getList(id!)); }
        catch { Alert.alert("Lỗi", "Không thể tải"); router.back(); }
        finally { setLoading(false); }
    };

    const handleDelete = () => {
        Alert.alert("Xóa bộ sưu tập", "Bạn có chắc muốn xóa?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa", style: "destructive", onPress: async () => {
                    try { await listsApi.deleteList(id!); router.back(); }
                    catch { Alert.alert("Lỗi", "Không thể xóa"); }
                },
            },
        ]);
    };

    if (loading || !list) return <LoadingSpinner />;

    return (
        <>
            <Stack.Screen options={{ title: list.name }} />
            <View style={styles.container}>
                {/* Header Card */}
                <View style={styles.headerCard}>
                    <View style={styles.headerRow}>
                        {list.thumbnail ? (
                            <Image source={{ uri: list.thumbnail }} style={styles.thumb} />
                        ) : (
                            <View style={[styles.thumb, { backgroundColor: getThumbnailColor(list.name) }]}>
                                <Text style={{ color: "#fff", fontSize: 20 }}>📋</Text>
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.listName}>{list.name}</Text>
                            <Text style={styles.listMeta}>{list.itemCount} items · {list.viewMode === "PUBLIC" ? "🌐 Công khai" : "🔒 Riêng tư"}</Text>
                        </View>
                    </View>
                    {list.description && <Text style={styles.listDesc}>{list.description}</Text>}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.editBtn} onPress={() => router.push(`/list-form?id=${list.id}`)}>
                            <Text style={styles.editBtnText}>✏️ Sửa</Text>
                        </TouchableOpacity>
                        {!list.isDefault && (
                            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                                <Text style={styles.deleteBtnText}>🗑 Xóa</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Items */}
                {list.items.length === 0 ? (
                    <EmptyState icon="📭" title="Chưa có item nào trong bộ sưu tập này" />
                ) : (
                    <FlatList
                        data={list.items}
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
    headerCard: {
        backgroundColor: Colors.surface, padding: Spacing.lg, margin: Spacing.lg, borderRadius: BorderRadius.lg,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    headerRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
    thumb: { width: 52, height: 52, borderRadius: BorderRadius.md, justifyContent: "center", alignItems: "center" },
    listName: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.text },
    listMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
    listDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.md },
    actions: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.md },
    editBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 10, alignItems: "center" },
    editBtnText: { color: "#fff", fontWeight: "700", fontSize: FontSize.sm },
    deleteBtn: { backgroundColor: "#FEE2E2", borderRadius: BorderRadius.md, paddingVertical: 10, paddingHorizontal: Spacing.lg, alignItems: "center" },
    deleteBtnText: { color: Colors.error, fontWeight: "700", fontSize: FontSize.sm },
});
