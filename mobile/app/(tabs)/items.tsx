import React, { useState, useCallback } from "react";
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { itemsApi, Item } from "../../src/api/items";
import { Colors, Spacing, FontSize, BorderRadius } from "../../src/theme";
import ItemCard from "../../src/components/ItemCard";
import EmptyState from "../../src/components/EmptyState";
import LoadingSpinner from "../../src/components/LoadingSpinner";

const SORT_OPTIONS = [
    { key: "newest", label: "Mới nhất" },
    { key: "oldest", label: "Cũ nhất" },
    { key: "az", label: "A → Z" },
    { key: "za", label: "Z → A" },
];

export default function ItemsTab() {
    const router = useRouter();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchItems = async (p = 1, reset = true) => {
        try {
            const params: Record<string, string> = { page: String(p), pageSize: "20", sort };
            if (search.trim()) params.search = search.trim();
            const data = await itemsApi.getItems(params);
            setItems(reset ? data.items : [...items, ...data.items]);
            setTotalPages(data.totalPages);
            setTotal(data.total);
            setPage(p);
        } catch { /* silent */ } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { setLoading(true); fetchItems(1, true); }, [sort]));

    const handleSearch = () => { setLoading(true); fetchItems(1, true); };
    const handleLoadMore = () => { if (page < totalPages) fetchItems(page + 1, false); };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Items ({total})</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => router.push("/item-form")}>
                    <Ionicons name="add-outline" size={18} color="#fff" />
                    <Text style={styles.addButtonText}> Thêm mới</Text>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
                <View style={styles.searchWrap}>
                    <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm..."
                        placeholderTextColor={Colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                </View>
            </View>

            {/* Sort */}
            <View style={styles.sortRow}>
                {SORT_OPTIONS.map((opt) => (
                    <TouchableOpacity
                        key={opt.key}
                        style={[styles.sortChip, sort === opt.key ? styles.sortChipActive : undefined]}
                        onPress={() => setSort(opt.key)}
                    >
                        <Text style={[styles.sortText, sort === opt.key ? styles.sortTextActive : undefined]}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            {loading ? (
                <LoadingSpinner />
            ) : items.length === 0 ? (
                <EmptyState icon="bookmark-outline" title="Chưa có item nào" message="Nhấn + Thêm mới để bắt đầu" />
            ) : (
                <FlatList
                    data={items}
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
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchItems(1, true); }} tintColor={Colors.primary} />
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
        backgroundColor: Colors.surface,
    },
    headerTitle: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.text },
    addButton: {
        backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg,
        paddingVertical: 8, flexDirection: "row", alignItems: "center",
    },
    addButtonText: { color: "#fff", fontWeight: "700", fontSize: FontSize.sm },
    searchRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.surface },
    searchWrap: {
        flexDirection: "row", alignItems: "center", backgroundColor: Colors.background,
        borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, height: 42,
        borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
    },
    searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },
    sortRow: { flexDirection: "row", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.xs, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
    sortChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: Colors.background },
    sortChipActive: { backgroundColor: Colors.primary },
    sortText: { fontSize: FontSize.xs, color: Colors.textSecondary },
    sortTextActive: { color: "#fff", fontWeight: "600" },
});
