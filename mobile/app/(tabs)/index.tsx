import React, { useState, useCallback } from "react";
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { dashboardApi, DashboardStats } from "../../src/api/dashboard";
import { Colors, Spacing, FontSize, BorderRadius, getThumbnailColor } from "../../src/theme";
import LoadingSpinner from "../../src/components/LoadingSpinner";

const TAG_COLORS = ["#16A34A", "#2563EB", "#D97706", "#DC2626", "#7C3AED", "#0D9488"];

export default function DashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const data = await dashboardApi.getStats();
            setStats(data);
        } catch { /* silent */ } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchStats(); }, []));

    if (loading || !stats) return <LoadingSpinner />;

    const displayName = user?.name || user?.username || user?.email?.split("@")[0] || "User";
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
    const maxActivity = Math.max(...stats.weeklyActivity.map((d) => d.count), 1);

    const statCards = [
        { label: "Items", value: stats.itemsCount, icon: "bookmark-outline" as const, color: Colors.primary, route: "/(tabs)/items" },
        { label: "Bộ sưu tập", value: stats.listsCount, icon: "albums-outline" as const, color: "#7C3AED", route: "/(tabs)/lists" },
        { label: "Tags", value: stats.tagsCount, icon: "pricetag-outline" as const, color: Colors.info, route: "/(tabs)/tags" },
        { label: "Công khai", value: stats.publicCount, icon: "globe-outline" as const, color: Colors.success, route: "" },
    ];

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor={Colors.primary} />}
        >
            {/* Hero Banner */}
            <View style={styles.heroBanner}>
                <View style={styles.heroDateRow}>
                    <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.heroDate}>
                        {" "}{new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "2-digit", year: "numeric" })}
                    </Text>
                </View>
                <Text style={styles.heroGreeting}>{greeting}, {displayName}! 👋</Text>
                <Text style={styles.heroSummary}>
                    Bạn có {stats.itemsCount} items trong {stats.listsCount} bộ sưu tập
                </Text>
                <TouchableOpacity style={styles.heroButton} onPress={() => router.push("/item-form")}>
                    <Ionicons name="add-outline" size={18} color={Colors.primaryDark} />
                    <Text style={styles.heroButtonText}> Thêm mới</Text>
                </TouchableOpacity>
            </View>

            {/* Stat Cards */}
            <View style={styles.statGrid}>
                {statCards.map((card) => (
                    <TouchableOpacity
                        key={card.label}
                        style={styles.statCard}
                        onPress={() => card.route && router.push(card.route as never)}
                        disabled={!card.route}
                    >
                        <Ionicons name={card.icon} size={28} color={card.color} style={{ marginBottom: Spacing.sm }} />
                        <Text style={styles.statValue}>{card.value}</Text>
                        <Text style={styles.statLabel}>{card.label}</Text>
                        {card.label === "Items" && stats.itemsThisWeek > 0 && (
                            <Text style={styles.statDelta}>+{stats.itemsThisWeek} tuần này</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Weekly Activity */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="bar-chart-outline" size={20} color={Colors.text} />
                    <Text style={styles.sectionTitle}> Hoạt động tuần</Text>
                </View>
                <View style={styles.chart}>
                    {stats.weeklyActivity.map((day, i) => {
                        const pct = maxActivity > 0 ? (day.count / maxActivity) * 100 : 0;
                        const isToday = i === stats.weeklyActivity.length - 1;
                        return (
                            <View key={day.date} style={styles.chartBar}>
                                <Text style={styles.chartCount}>{day.count > 0 ? day.count : ""}</Text>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: `${Math.max(pct, 8)}%` as never,
                                            backgroundColor: isToday ? Colors.primary : day.count > 0 ? Colors.primaryLight : Colors.border,
                                        },
                                    ]}
                                />
                                <Text style={[styles.chartDay, isToday ? { color: Colors.primary, fontWeight: "700" } : undefined]}>{day.day}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Recent Items */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="time-outline" size={20} color={Colors.text} />
                    <Text style={[styles.sectionTitle, { flex: 1 }]}> Thêm gần đây</Text>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/items")}>
                        <Text style={styles.seeAll}>Xem tất cả →</Text>
                    </TouchableOpacity>
                </View>
                {stats.recentItems.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.recentItem} onPress={() => router.push(`/item-detail?id=${item.id}`)}>
                        {item.thumbnail ? (
                            <Image source={{ uri: item.thumbnail }} style={styles.recentThumb} />
                        ) : (
                            <View style={[styles.recentThumb, { backgroundColor: getThumbnailColor(item.title) }]}>
                                <Text style={styles.recentInitials}>{item.title.slice(0, 2).toUpperCase()}</Text>
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
                            {item.tags.length > 0 && (
                                <Text style={styles.recentTags}>{item.tags.slice(0, 3).map((t) => `#${t.name}`).join("  ")}</Text>
                            )}
                        </View>
                        <Ionicons
                            name={item.viewMode === "PUBLIC" ? "globe-outline" : "lock-closed-outline"}
                            size={16}
                            color={item.viewMode === "PUBLIC" ? Colors.success : Colors.textMuted}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Popular Tags */}
            {stats.topTags.length > 0 && (
                <View style={[styles.section, { marginBottom: Spacing.xxxl }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="pricetags-outline" size={20} color={Colors.text} />
                        <Text style={styles.sectionTitle}> Tags phổ biến</Text>
                    </View>
                    <View style={styles.tagsWrap}>
                        {stats.topTags.map((tag, i) => (
                            <TouchableOpacity
                                key={tag.id}
                                style={[styles.tagChip, { backgroundColor: TAG_COLORS[i % TAG_COLORS.length] + "14" }]}
                                onPress={() => router.push(`/tag-detail?id=${tag.id}`)}
                            >
                                <Text style={[styles.tagChipText, { color: TAG_COLORS[i % TAG_COLORS.length] }]}>
                                    #{tag.name} ({tag.count})
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    heroBanner: {
        padding: Spacing.xl, paddingTop: 60,
        borderBottomLeftRadius: BorderRadius.xl, borderBottomRightRadius: BorderRadius.xl,
        backgroundColor: Colors.primary,
    },
    heroDateRow: { flexDirection: "row", alignItems: "center" },
    heroDate: { fontSize: FontSize.xs, color: "rgba(255,255,255,0.7)" },
    heroGreeting: { fontSize: FontSize.xxl, fontWeight: "800", color: "#fff", marginTop: 8, marginBottom: 4 },
    heroSummary: { fontSize: FontSize.sm, color: "rgba(255,255,255,0.8)", marginBottom: Spacing.lg },
    heroButton: {
        backgroundColor: "#fff", borderRadius: BorderRadius.md, paddingVertical: 10, paddingHorizontal: Spacing.lg,
        alignSelf: "flex-start", flexDirection: "row", alignItems: "center",
    },
    heroButtonText: { color: Colors.primaryDark, fontWeight: "700", fontSize: FontSize.sm },
    statGrid: { flexDirection: "row", flexWrap: "wrap", padding: Spacing.lg, gap: Spacing.sm },
    statCard: {
        width: "48%", backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    statValue: { fontSize: FontSize.xxl, fontWeight: "800", color: Colors.text },
    statLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
    statDelta: { fontSize: FontSize.xs, color: Colors.success, marginTop: 4 },
    section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.md },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: "700", color: Colors.text },
    seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: "600" },
    chart: { flexDirection: "row", height: 120, alignItems: "flex-end", gap: 6, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md },
    chartBar: { flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" },
    chartCount: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
    bar: { width: "70%", borderRadius: 4, minHeight: 4 },
    chartDay: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
    recentItem: {
        flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.md,
        backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm,
    },
    recentThumb: { width: 44, height: 44, borderRadius: BorderRadius.md, justifyContent: "center", alignItems: "center" },
    recentInitials: { color: "#fff", fontWeight: "700", fontSize: FontSize.sm },
    recentTitle: { fontSize: FontSize.md, fontWeight: "600", color: Colors.text },
    recentTags: { fontSize: FontSize.xs, color: Colors.primaryLight, marginTop: 2 },
    tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
    tagChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full },
    tagChipText: { fontSize: FontSize.sm, fontWeight: "600" },
});
