import React, { useState, useCallback } from "react";
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { tagsApi, Tag } from "../../src/api/tags";
import { Colors, Spacing, FontSize, BorderRadius } from "../../src/theme";
import EmptyState from "../../src/components/EmptyState";
import LoadingSpinner from "../../src/components/LoadingSpinner";

const TAG_COLORS = ["#16A34A", "#2563EB", "#D97706", "#DC2626", "#7C3AED", "#0D9488"];

export default function TagsTab() {
    const router = useRouter();
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTags = async () => {
        try {
            const data = await tagsApi.getTags();
            setTags(data);
        } catch { /* silent */ } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchTags(); }, []));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tags ({tags.length})</Text>
            </View>

            {loading ? (
                <LoadingSpinner />
            ) : tags.length === 0 ? (
                <EmptyState icon="pricetag-outline" title="Chưa có tag nào" message="Tags sẽ tự động tạo khi bạn gắn tag cho items" />
            ) : (
                <FlatList
                    data={tags}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={{ gap: Spacing.sm }}
                    contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.sm }}
                    renderItem={({ item, index }) => {
                        const color = TAG_COLORS[index % TAG_COLORS.length];
                        return (
                            <TouchableOpacity
                                style={[styles.tagCard, { borderLeftColor: color }]}
                                onPress={() => router.push(`/tag-detail?id=${item.id}`)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.tagHeader}>
                                    <Ionicons name="pricetag-outline" size={16} color={color} />
                                    <Text style={[styles.tagName, { color }]} numberOfLines={1}>#{item.name}</Text>
                                </View>
                                <Text style={styles.tagCount}>{item.itemCount} items</Text>
                            </TouchableOpacity>
                        );
                    }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTags(); }} tintColor={Colors.primary} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.md,
        backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    headerTitle: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.text },
    tagCard: {
        flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
        padding: Spacing.lg, borderLeftWidth: 3,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    tagHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
    tagName: { fontSize: FontSize.md, fontWeight: "700", flex: 1 },
    tagCount: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
});
