import React, { useState, useCallback } from "react";
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Image,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { listsApi, List } from "../../src/api/lists";
import { Colors, Spacing, FontSize, BorderRadius, getThumbnailColor } from "../../src/theme";
import EmptyState from "../../src/components/EmptyState";
import LoadingSpinner from "../../src/components/LoadingSpinner";

export default function ListsTab() {
    const router = useRouter();
    const [lists, setLists] = useState<List[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLists = async () => {
        try {
            const data = await listsApi.getLists();
            setLists(data);
        } catch { /* silent */ } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchLists(); }, []));

    const renderList = ({ item }: { item: List }) => (
        <TouchableOpacity style={styles.listCard} onPress={() => router.push(`/list-detail?id=${item.id}`)} activeOpacity={0.7}>
            {item.thumbnail ? (
                <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
            ) : (
                <View style={[styles.thumb, { backgroundColor: getThumbnailColor(item.name) }]}>
                    <Ionicons name="albums-outline" size={24} color="#fff" />
                </View>
            )}
            <View style={styles.listContent}>
                <View style={styles.listHeader}>
                    <Text style={styles.listName} numberOfLines={1}>{item.name}</Text>
                    {item.isDefault && <Text style={styles.defaultBadge}>Mặc định</Text>}
                </View>
                {item.description && (
                    <Text style={styles.listDesc} numberOfLines={1}>{item.description}</Text>
                )}
                <View style={styles.listMeta}>
                    <Text style={styles.listCount}>{item.itemCount} items</Text>
                    <View style={styles.viewBadge}>
                        <Ionicons
                            name={item.viewMode === "PUBLIC" ? "globe-outline" : "lock-closed-outline"}
                            size={12}
                            color={Colors.textMuted}
                        />
                        <Text style={styles.listBadge}> {item.viewMode === "PUBLIC" ? "Công khai" : "Riêng tư"}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Bộ sưu tập ({lists.length})</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => router.push("/list-form")}>
                    <Ionicons name="add-outline" size={18} color="#fff" />
                    <Text style={styles.addButtonText}> Tạo mới</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <LoadingSpinner />
            ) : lists.length === 0 ? (
                <EmptyState icon="albums-outline" title="Chưa có bộ sưu tập nào" message="Nhấn + Tạo mới để bắt đầu" />
            ) : (
                <FlatList
                    data={lists}
                    keyExtractor={(item) => item.id}
                    renderItem={renderList}
                    contentContainerStyle={{ padding: Spacing.lg }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLists(); }} tintColor={Colors.primary} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.md,
        backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    headerTitle: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.text },
    addButton: {
        backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg,
        paddingVertical: 8, flexDirection: "row", alignItems: "center",
    },
    addButtonText: { color: "#fff", fontWeight: "700", fontSize: FontSize.sm },
    listCard: {
        flexDirection: "row", backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
        padding: Spacing.md, marginBottom: Spacing.sm,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    thumb: { width: 52, height: 52, borderRadius: BorderRadius.md, justifyContent: "center", alignItems: "center" },
    listContent: { flex: 1, marginLeft: Spacing.md, justifyContent: "center" },
    listHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
    listName: { fontSize: FontSize.md, fontWeight: "600", color: Colors.text, flex: 1 },
    defaultBadge: {
        fontSize: FontSize.xs, color: Colors.primary, backgroundColor: Colors.primary + "14",
        paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full, fontWeight: "600",
    },
    listDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
    listMeta: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginTop: 4 },
    listCount: { fontSize: FontSize.xs, color: Colors.textMuted },
    viewBadge: { flexDirection: "row", alignItems: "center" },
    listBadge: { fontSize: FontSize.xs, color: Colors.textMuted },
});
