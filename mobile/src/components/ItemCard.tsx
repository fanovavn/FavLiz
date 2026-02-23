import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, BorderRadius, Spacing, FontSize, getThumbnailColor } from "../theme";

type Props = {
    title: string;
    thumbnail?: string | null;
    viewMode?: string;
    tags?: Array<{ id: string; name: string }>;
    attachmentCount?: number;
    onPress?: () => void;
};

export default function ItemCard({ title, thumbnail, viewMode, tags = [], attachmentCount = 0, onPress }: Props) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            {thumbnail ? (
                <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
            ) : (
                <View style={[styles.thumbnail, { backgroundColor: getThumbnailColor(title) }]}>
                    <Text style={styles.initials}>{title.slice(0, 2).toUpperCase()}</Text>
                </View>
            )}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {tags.length > 0 && (
                    <View style={styles.tagsRow}>
                        {tags.slice(0, 3).map((tag) => (
                            <Text key={tag.id} style={styles.tagText}>#{tag.name}</Text>
                        ))}
                    </View>
                )}
                <View style={styles.meta}>
                    <Ionicons
                        name={viewMode === "PUBLIC" ? "globe-outline" : "lock-closed-outline"}
                        size={14}
                        color={viewMode === "PUBLIC" ? Colors.success : Colors.textMuted}
                    />
                    {attachmentCount > 0 && (
                        <View style={styles.attachRow}>
                            <Ionicons name="attach" size={14} color={Colors.textMuted} />
                            <Text style={styles.attachCount}>{attachmentCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    thumbnail: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.md,
        justifyContent: "center",
        alignItems: "center",
    },
    initials: {
        color: "#fff",
        fontSize: FontSize.md,
        fontWeight: "700",
    },
    content: {
        flex: 1,
        marginLeft: Spacing.md,
        justifyContent: "center",
    },
    title: {
        fontSize: FontSize.md,
        fontWeight: "600",
        color: Colors.text,
    },
    tagsRow: {
        flexDirection: "row",
        marginTop: 2,
        gap: Spacing.sm,
    },
    tagText: {
        fontSize: FontSize.xs,
        color: Colors.primaryLight,
    },
    meta: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        gap: Spacing.sm,
    },
    attachRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    attachCount: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
});
