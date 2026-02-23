import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Spacing } from "../theme";

type Props = { icon?: string; title: string; message?: string };

export default function EmptyState({ icon = "file-tray-outline", title, message }: Props) {
    return (
        <View style={styles.container}>
            <Ionicons name={icon as any} size={56} color={Colors.textMuted} />
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        padding: Spacing.xxxl,
    },
    title: { fontSize: FontSize.lg, fontWeight: "600", color: Colors.text, textAlign: "center", marginTop: Spacing.md },
    message: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: "center", marginTop: Spacing.sm },
});
