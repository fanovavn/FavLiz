import React, { useState, useCallback } from "react";
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, RefreshControl, Modal, ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { itemsApi, Item } from "../../src/api/items";
import { listsApi } from "../../src/api/lists";
import { tagsApi } from "../../src/api/tags";
import { Colors, Spacing, FontSize, FontFamily, BorderRadius } from "../../src/theme";
import ItemCard from "../../src/components/ItemCard";
import EmptyState from "../../src/components/EmptyState";
import LoadingSpinner from "../../src/components/LoadingSpinner";

type ListItem = { id: string; name: string; _count?: { items: number } };
type TagItem = { id: string; name: string; _count?: { items: number } };

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
    const [layout, setLayout] = useState<"list" | "grid">("list");

    // Filter state
    const [showFilter, setShowFilter] = useState(false);
    const [filterSearch, setFilterSearch] = useState("");
    const [userLists, setUserLists] = useState<ListItem[]>([]);
    const [userTags, setUserTags] = useState<TagItem[]>([]);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

    const fetchItems = async (p = 1, reset = true) => {
        try {
            const params: Record<string, string> = { page: String(p), pageSize: "20", sort };
            if (search.trim()) params.search = search.trim();
            if (selectedListId) params.listId = selectedListId;
            if (selectedTagId) params.tagId = selectedTagId;
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

    const fetchFilterData = async () => {
        try {
            const [lists, tags] = await Promise.all([
                listsApi.getLists(),
                tagsApi.getTags(),
            ]);
            setUserLists(lists);
            setUserTags(tags);
        } catch { /* silent */ }
    };

    useFocusEffect(useCallback(() => {
        setLoading(true);
        fetchItems(1, true);
    }, [sort, selectedListId, selectedTagId]));

    const handleSearch = () => { setLoading(true); fetchItems(1, true); };
    const handleLoadMore = () => { if (page < totalPages) fetchItems(page + 1, false); };

    const openFilter = () => {
        fetchFilterData();
        setShowFilter(true);
    };

    const clearFilters = () => {
        setSelectedListId(null);
        setSelectedTagId(null);
        setFilterSearch("");
        setShowFilter(false);
    };

    const activeFilters = (selectedListId ? 1 : 0) + (selectedTagId ? 1 : 0);

    const filteredLists = userLists.filter((l) => l.name.toLowerCase().includes(filterSearch.toLowerCase()));
    const filteredTags = userTags.filter((t) => t.name.toLowerCase().includes(filterSearch.toLowerCase()));

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Link hay <Text style={styles.headerCount}>{total}</Text></Text>
                    <Text style={styles.headerSubtitle}>Tất cả link hay yêu thích của bạn</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => router.push("/item-form")}>
                    <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Toolbar: search + view toggle + filter */}
            <View style={styles.toolbar}>
                <View style={styles.searchWrap}>
                    <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm..."
                        placeholderTextColor={Colors.textMuted}
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearch(""); setLoading(true); fetchItems(1, true); }}>
                            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Info bar */}
            <View style={styles.infoBar}>
                <Text style={styles.infoText}>Hiển thị {items.length}/{total} link hay</Text>
                <View style={styles.infoActions}>
                    <TouchableOpacity
                        style={[styles.viewToggle, layout === "list" && styles.viewToggleActive]}
                        onPress={() => setLayout("list")}
                    >
                        <Ionicons name="list" size={18} color={layout === "list" ? Colors.primary : Colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewToggle, layout === "grid" && styles.viewToggleActive]}
                        onPress={() => setLayout("grid")}
                    >
                        <Ionicons name="grid" size={18} color={layout === "grid" ? Colors.primary : Colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton} onPress={openFilter}>
                        <Ionicons name="funnel-outline" size={18} color={activeFilters > 0 ? Colors.primary : Colors.textSecondary} />
                        {activeFilters > 0 && (
                            <View style={styles.filterBadge}>
                                <Text style={styles.filterBadgeText}>{activeFilters}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* List / Grid */}
            {loading ? (
                <LoadingSpinner />
            ) : items.length === 0 ? (
                <EmptyState icon="bookmark-outline" title="Chưa có item nào" message="Nhấn + để bắt đầu lưu link hay" />
            ) : layout === "grid" ? (
                <FlatList
                    key="grid"
                    data={items}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={{ gap: Spacing.sm }}
                    renderItem={({ item }) => (
                        <ItemCard
                            title={item.title}
                            description={item.description}
                            thumbnail={item.thumbnail}
                            viewMode={item.viewMode}
                            tags={item.tags}
                            createdAt={item.createdAt}
                            onPress={() => router.push(`/item-detail?id=${item.id}`)}
                            layout="grid"
                        />
                    )}
                    contentContainerStyle={{ padding: Spacing.lg }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchItems(1, true); }} tintColor={Colors.primary} />
                    }
                />
            ) : (
                <FlatList
                    key="list"
                    data={items}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ItemCard
                            title={item.title}
                            description={item.description}
                            thumbnail={item.thumbnail}
                            viewMode={item.viewMode}
                            tags={item.tags}
                            createdAt={item.createdAt}
                            onPress={() => router.push(`/item-detail?id=${item.id}`)}
                            layout="list"
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

            {/* Filter Modal */}
            <Modal visible={showFilter} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Bộ lọc</Text>
                            <TouchableOpacity onPress={() => setShowFilter(false)}>
                                <Ionicons name="close" size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Search in filter */}
                        <View style={styles.filterSearchWrap}>
                            <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
                            <TextInput
                                style={styles.filterSearchInput}
                                placeholder="Tìm kiếm..."
                                placeholderTextColor={Colors.textMuted}
                                value={filterSearch}
                                onChangeText={setFilterSearch}
                            />
                        </View>

                        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                            {/* Lists section */}
                            <View style={styles.filterSection}>
                                <View style={styles.filterSectionHeader}>
                                    <Ionicons name="albums-outline" size={16} color={Colors.textSecondary} />
                                    <Text style={styles.filterSectionTitle}>BỘ SƯU TẬP</Text>
                                </View>
                                {filteredLists.map((list) => (
                                    <TouchableOpacity
                                        key={list.id}
                                        style={styles.filterItem}
                                        onPress={() => setSelectedListId(selectedListId === list.id ? null : list.id)}
                                    >
                                        <View style={[styles.radio, selectedListId === list.id && styles.radioActive]} />
                                        <Text style={[styles.filterItemText, selectedListId === list.id && styles.filterItemTextActive]}>
                                            {list.name}
                                        </Text>
                                        <Text style={styles.filterItemCount}>{list._count?.items || 0}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Tags section */}
                            <View style={styles.filterSection}>
                                <View style={styles.filterSectionHeader}>
                                    <Ionicons name="pricetags-outline" size={16} color={Colors.textSecondary} />
                                    <Text style={styles.filterSectionTitle}>TAGS</Text>
                                </View>
                                <View style={styles.tagsList}>
                                    {filteredTags.map((tag) => (
                                        <TouchableOpacity
                                            key={tag.id}
                                            style={[
                                                styles.filterTagChip,
                                                selectedTagId === tag.id && styles.filterTagChipActive,
                                            ]}
                                            onPress={() => setSelectedTagId(selectedTagId === tag.id ? null : tag.id)}
                                        >
                                            <Text style={[
                                                styles.filterTagText,
                                                selectedTagId === tag.id && styles.filterTagTextActive,
                                            ]}>
                                                #{tag.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        {/* Filter actions */}
                        <View style={styles.filterActions}>
                            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                                <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={() => { setShowFilter(false); setLoading(true); fetchItems(1, true); }}
                            >
                                <Text style={styles.applyButtonText}>Áp dụng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // Header
    header: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.sm,
    },
    headerTitle: { fontSize: FontSize.xxl, fontFamily: FontFamily.extraBold, color: Colors.text },
    headerCount: {
        fontSize: FontSize.sm, fontFamily: FontFamily.semiBold, color: Colors.primary,
        backgroundColor: "rgba(233,30,99,0.1)", overflow: "hidden",
    },
    headerSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular, marginTop: 2 },
    addButton: {
        backgroundColor: Colors.primary, width: 44, height: 44,
        borderRadius: 22, justifyContent: "center", alignItems: "center",
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    },

    // Toolbar
    toolbar: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
    searchWrap: {
        flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, height: 44,
        borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
    },
    searchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.text, fontFamily: FontFamily.regular },

    // Info bar
    infoBar: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    },
    infoText: { fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: FontFamily.regular },
    infoActions: { flexDirection: "row", alignItems: "center", gap: 4 },
    viewToggle: {
        width: 36, height: 36, borderRadius: BorderRadius.sm,
        justifyContent: "center", alignItems: "center",
    },
    viewToggleActive: { backgroundColor: "rgba(233,30,99,0.08)" },
    filterButton: {
        width: 36, height: 36, borderRadius: BorderRadius.sm,
        justifyContent: "center", alignItems: "center", position: "relative",
    },
    filterBadge: {
        position: "absolute", top: 2, right: 2, backgroundColor: Colors.primary,
        width: 14, height: 14, borderRadius: 7, justifyContent: "center", alignItems: "center",
    },
    filterBadgeText: { fontSize: 8, color: "#fff", fontFamily: FontFamily.bold },

    // Filter modal
    modalOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl,
        paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: 40,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        marginBottom: Spacing.lg,
    },
    modalTitle: { fontSize: FontSize.xl, fontFamily: FontFamily.bold, color: Colors.text },

    filterSearchWrap: {
        flexDirection: "row", alignItems: "center", backgroundColor: Colors.background,
        borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, height: 44,
        borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm, marginBottom: Spacing.lg,
    },
    filterSearchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.text, fontFamily: FontFamily.regular },

    filterSection: { marginBottom: Spacing.xl },
    filterSectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: Spacing.md },
    filterSectionTitle: { fontSize: FontSize.xs, fontFamily: FontFamily.bold, color: Colors.textSecondary, letterSpacing: 1 },

    filterItem: {
        flexDirection: "row", alignItems: "center", paddingVertical: Spacing.md,
        borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    radio: {
        width: 20, height: 20, borderRadius: 10, borderWidth: 2,
        borderColor: Colors.border, marginRight: Spacing.md,
    },
    radioActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
    filterItemText: { flex: 1, fontSize: FontSize.md, color: Colors.text, fontFamily: FontFamily.regular },
    filterItemTextActive: { fontFamily: FontFamily.semiBold, color: Colors.primary },
    filterItemCount: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: FontFamily.regular },

    tagsList: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
    filterTagChip: {
        borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md, paddingVertical: 6,
    },
    filterTagChipActive: { borderColor: Colors.primary, backgroundColor: "rgba(233,30,99,0.08)" },
    filterTagText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.medium },
    filterTagTextActive: { color: Colors.primary },

    filterActions: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.lg },
    clearButton: {
        flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: Colors.border, alignItems: "center",
    },
    clearButtonText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.semiBold },
    applyButton: {
        flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
        backgroundColor: Colors.primary, alignItems: "center",
    },
    applyButtonText: { fontSize: FontSize.sm, color: "#fff", fontFamily: FontFamily.semiBold },
});
