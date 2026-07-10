import React from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "./Primitives";

export function Label({ children }: { children: React.ReactNode }) {
    return <Text style={styles.labelText}>{children}</Text>;
}

export function PrimaryButton({ label, onPress, disabled }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
}) {
    return (
        <Pressable onPress={onPress} disabled={disabled} style={[styles.primaryButton, disabled && styles.disabled]}>
            <Text style={styles.primaryButtonText}>{label}</Text>
        </Pressable>
    );
}

export function SecondaryButton({ label, onPress, disabled }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
}) {
    return (
        <Pressable onPress={onPress} disabled={disabled} style={[styles.secondaryButton, disabled && styles.disabled]}>
            <Text style={styles.secondaryButtonText}>{label}</Text>
        </Pressable>
    );
}

export function EmptyDisplayBox({ style }: { style: StyleProp<ViewStyle> }) {
    return (
        <View style={[styles.emptyDisplayBox, style]}>
            <View style={styles.emptyDisplayBoxSide}>
                <View style={styles.emptyDisplayBoxSideMark} />
            </View>
            <View style={styles.emptyDisplayBoxTop}>
                <View style={styles.emptyDisplayBoxPopBadge}>
                    <Text style={styles.emptyDisplayBoxPopText}>POP!</Text>
                </View>
                <View style={styles.emptyDisplayBoxNameplate} />
            </View>
            <View style={styles.emptyDisplayBoxWindow}>
                <View style={styles.emptyDisplayBoxGlare} />
            </View>
            <View style={styles.emptyDisplayBoxShelfLabel}>
                <Text style={styles.emptyDisplayBoxShelfText} adjustsFontSizeToFit numberOfLines={1}>
                    SHELF & POP
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    labelText: { color: "#fff", fontSize: 13, fontWeight: "700" },
    primaryButton: { minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 12, paddingHorizontal: 18, backgroundColor: "#7e67f4" },
    primaryButtonText: { color: "#fff", fontWeight: "900", fontSize: 15 },
    secondaryButton: { flex: 1, minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 12, paddingHorizontal: 14, backgroundColor: "#7bd1c3" },
    secondaryButtonText: { color: "#101318", fontWeight: "900", fontSize: 15 },
    disabled: { opacity: 0.55 },
    emptyDisplayBox: { alignItems: "center", justifyContent: "flex-start", overflow: "hidden", paddingTop: "10%", borderWidth: 2, borderColor: "#f6efe6", backgroundColor: "#071a36" },
    emptyDisplayBoxSide: { position: "absolute", left: "7%", top: "18%", width: "20%", height: "66%", borderRadius: 3, borderWidth: 1, borderColor: "#d6d2cd", backgroundColor: "#05142b" },
    emptyDisplayBoxSideMark: { position: "absolute", left: "24%", top: "36%", width: "52%", height: "24%", borderRadius: 999, backgroundColor: "#f1f4f4", opacity: 0.46 },
    emptyDisplayBoxTop: { width: "72%", height: "18%", marginLeft: "14%", flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: "4%", borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: "#fff6eb" },
    emptyDisplayBoxPopBadge: { width: "42%", aspectRatio: 1.65, alignItems: "center", justifyContent: "center", borderRadius: 999, borderWidth: 1, borderColor: "#071a36", backgroundColor: "#fff" },
    emptyDisplayBoxPopText: { color: "#ff8a00", fontSize: 7, fontWeight: "900" },
    emptyDisplayBoxNameplate: { flex: 1, height: "44%", borderRadius: 1, backgroundColor: "#ff8a00" },
    emptyDisplayBoxWindow: { width: "52%", height: "48%", marginLeft: "20%", alignItems: "center", justifyContent: "center", borderRadius: 4, borderWidth: 1, borderColor: "#f6efe6", backgroundColor: "#06172f" },
    emptyDisplayBoxGlare: { position: "absolute", right: "12%", top: "-8%", width: "22%", height: "120%", opacity: 0.24, transform: [{ rotate: "24deg" }], backgroundColor: "#dcecff" },
    emptyDisplayBoxShelfLabel: { width: "72%", height: "16%", marginLeft: "14%", alignItems: "center", justifyContent: "center", borderBottomLeftRadius: 3, borderBottomRightRadius: 3, borderTopWidth: 1, borderTopColor: "#f6efe6", backgroundColor: "#fff6eb" },
    emptyDisplayBoxShelfText: { width: "78%", color: "#fff", overflow: "hidden", paddingHorizontal: 3, paddingVertical: 1, borderRadius: 2, backgroundColor: "#071a36", fontSize: 7, fontWeight: "900", textAlign: "center" },
});
