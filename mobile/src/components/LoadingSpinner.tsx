import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Colors, FontSize } from "../theme";

type Props = { text?: string };

export default function LoadingSpinner({ text }: Props) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors.primary} />
            {text && <Text style={styles.text}>{text}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    text: {
        marginTop: 12,
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
});
