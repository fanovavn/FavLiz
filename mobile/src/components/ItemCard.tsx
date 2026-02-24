import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, BorderRadius, Spacing, FontSize, FontFamily, getThumbnailColor } from "../theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GRID_GAP = Spacing.sm;
const GRID_PADDING = Spacing.lg;
const GRID_CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

type Props = {
    title: string;
    description?: string | null;
    thumbnail?: string | null;
    viewMode?: string;
    tags?: Array<{ id: string; name: string }>;
    createdAt?: string;
    onPress?: () => void;
    layout?: "list" | "grid";
};

export default function ItemCard({
    title, description, thumbnail, viewMode, tags = [], createdAt, onPress, layout = "list",
}: Props) {
    const bgColor = getThumbnailColor(title);

    if (layout === "grid") {
        return (
            <TouchableOpacity
                style={[styles.gridCard, { width: GRID_CARD_WIDTH }]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {/* Thumbnail */}
                {thumbnail ? (
                    <Image source={{ uri: thumbnail }} style={styles.gridThumb} />
                ) : (
                    <View style={[styles.gridThumb, { backgroundColor: bgColor }]}>
                        <Text style={styles.gridInitials}>{title.slice(0, 2).toUpperCase()}</Text>
                    </View>
                )}

                {/* Content */}
                <View style={styles.gridContent}>
                    <Text style={styles.gridTitle} numberOfLines={2}>{title}</Text>
                    <View style={styles.gridFooter}>
                        <Text style={styles.dateText}>
                            {createdAt ? new Date(createdAt).toLocaleDateString("vi-VN") : ""}
                        </Text>
                        <View style={[styles.badge, viewMode === "PUBLIC" ? styles.badgePublic : styles.badgePrivate]}>
                            <Ionicons
                                name={viewMode === "PUBLIC" ? "globe-outline" : "lock-closed-outline"}
                                size={10}
                                color={viewMode === "PUBLIC" ? Colors.success : Colors.textMuted}
                            />
                            <Text style={[styles.badgeText, viewMode === "PUBLIC" ? styles.badgeTextPublic : styles.badgeTextPrivate]}>
                                {viewMode === "PUBLIC" ? "Public" : "Private"}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    // List layout
    return (
        <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.7}>
            {/* Thumbnail */}
            {thumbnail ? (
                <Image source={{ uri: thumbnail }} style={styles.listThumb} />
            ) : (
                <View style={[styles.listThumb, { backgroundColor: bgColor }]}>
                    <Text style={styles.listInitials}>{title.slice(0, 2).toUpperCase()}</Text>
                </View>
            )}

            {/* Content */}
            <View style={styles.listContent}>
                <Text style={styles.listTitle} numberOfLines={1}>{title}</Text>
                {description ? (
                    <Text style={styles.listDesc} numberOfLines={1}>{description}</Text>
                ) : null}

                {/* Tags */}
                {tags.length > 0 && (
                    <View style={styles.tagsRow}>
                        {tags.slice(0, 3).map((tag) => (
                            <View key={tag.id} style={styles.tagChip}>
                                <Text style={styles.tagChipText}>{tag.name}</Text>
                            </View>
                        ))}
                        {tags.length > 3 && (
                            <Text style={styles.tagMore}>+{tags.length - 3}</Text>
                        )}
                    </View>
                )}

                {/* Footer */}
                <View style={styles.listFooter}>
                    <View style={styles.dateRow}>
                        <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
                        <Text style={styles.dateText}>
                            {createdAt ? new Date(createdAt).toLocaleDateString("vi-VN") : ""}
                        </Text>
                    </View>
                    <Ionicons
                        name={viewMode === "PUBLIC" ? "globe-outline" : "lock-closed-outline"}
                        size={14}
                        color={viewMode === "PUBLIC" ? Colors.success : Colors.textMuted}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    // === LIST LAYOUT ===
    listCard: {
        flexDirection: "row",
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.04)",
    },
    listThumb: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.md,
        justifyContent: "center",
        alignItems: "center",
    },
    listInitials: {
        color: "#fff",
        fontSize: FontSize.lg,
        fontFamily: FontFamily.bold,
    },
    listContent: {
        flex: 1,
        marginLeft: Spacing.md,
        justifyContent: "center",
    },
    listTitle: {
        fontSize: FontSize.md,
        fontFamily: FontFamily.semiBold,
        color: Colors.text,
    },
    listDesc: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
        fontFamily: FontFamily.regular,
    },
    tagsRow: {
        flexDirection: "row",
        marginTop: 6,
        gap: 4,
        flexWrap: "wrap",
    },
    tagChip: {
        backgroundColor: "rgba(233,30,99,0.08)",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    tagChipText: {
        fontSize: 10,
        color: Colors.primary,
        fontFamily: FontFamily.medium,
    },
    tagMore: {
        fontSize: 10,
        color: Colors.textMuted,
        alignSelf: "center",
        fontFamily: FontFamily.regular,
    },
    listFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 6,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    dateText: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontFamily: FontFamily.regular,
    },

    // === GRID LAYOUT ===
    gridCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        overflow: "hidden",
        marginBottom: GRID_GAP,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.04)",
    },
    gridThumb: {
        width: "100%",
        aspectRatio: 16 / 10,
        justifyContent: "center",
        alignItems: "center",
    },
    gridInitials: {
        color: "#fff",
        fontSize: FontSize.xxxl,
        fontFamily: FontFamily.extraBold,
    },
    gridContent: {
        padding: Spacing.md,
    },
    gridTitle: {
        fontSize: FontSize.sm,
        fontFamily: FontFamily.semiBold,
        color: Colors.text,
        marginBottom: 8,
    },
    gridFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    // === BADGES ===
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    badgePublic: {
        backgroundColor: "rgba(22,163,74,0.1)",
    },
    badgePrivate: {
        backgroundColor: "rgba(148,163,184,0.1)",
    },
    badgeText: {
        fontSize: 10,
        fontFamily: FontFamily.medium,
    },
    badgeTextPublic: {
        color: Colors.success,
    },
    badgeTextPrivate: {
        color: Colors.textMuted,
    },
});
