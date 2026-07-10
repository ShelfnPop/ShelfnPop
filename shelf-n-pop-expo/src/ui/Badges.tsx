import React from "react";
import { StyleSheet } from "react-native";
import { limitedEditionText, vaultStatusText } from "../domain/appHelpers";
import { Text } from "./Primitives";

type CatalogBadgeItem = {
    limited_edition?: boolean | null;
    limited_count?: number | null;
    edition_notes?: string | null;
    pop_type?: string | null;
    signed?: boolean | null;
    signed_count?: number | null;
    signature_authentication?: string | null;
    vault_status?: string | null;
};

export function LimitedBadge({ item, compact = false, }: {
    item: CatalogBadgeItem;
    compact?: boolean;
}) {
    const label = limitedEditionText(item);
    if (!label) return null;
    return (
        <Text style={[styles.limitedBadge, compact && styles.limitedBadgeCompact]} numberOfLines={compact ? 1 : 2}>
            {label}
        </Text>
    );
}

export function SignedBadge({ item, compact = false }: {
    item: CatalogBadgeItem;
    compact?: boolean;
}) {
    const signedCount = Number(item.signed_count ?? 0);
    if (!item.signed && signedCount <= 0) return null;
    const auth = String(item.signature_authentication ?? "").trim();
    const label = signedCount > 1 ? `Signed x${signedCount}` : auth && auth !== "None" ? "Signed + COA" : "Signed";
    return (
        <Text style={[styles.signedBadge, compact && styles.limitedBadgeCompact]} numberOfLines={1}>
            {label}
        </Text>
    );
}

export function VaultBadge({ item, compact = false, }: {
    item: CatalogBadgeItem;
    compact?: boolean;
}) {
    const label = vaultStatusText(item);
    if (!label) return null;
    const vaulted = /vault/i.test(label);
    return (
        <Text
            style={[
                styles.statusBadge,
                vaulted ? styles.vaultedBadge : styles.activeStatusBadge,
                compact && styles.statusBadgeCompact,
            ]}
            numberOfLines={1}
        >
            {label}
        </Text>
    );
}

const styles = StyleSheet.create({
    limitedBadge: {
        alignSelf: "center",
        color: "#101318",
        overflow: "hidden",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "#f6c95f",
        fontSize: 12,
        fontWeight: "900",
        textAlign: "center",
    },
    signedBadge: {
        alignSelf: "center",
        color: "#101318",
        overflow: "hidden",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "#d8c6ff",
        fontSize: 12,
        fontWeight: "900",
        textAlign: "center",
    },
    limitedBadgeCompact: {
        alignSelf: "flex-start",
        maxWidth: "100%",
        paddingHorizontal: 8,
        paddingVertical: 3,
        fontSize: 11,
    },
    statusBadge: {
        alignSelf: "flex-start",
        overflow: "hidden",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: "900",
    },
    statusBadgeCompact: { maxWidth: "100%" },
    vaultedBadge: { color: "#fff", backgroundColor: "#80455f" },
    activeStatusBadge: { color: "#101318", backgroundColor: "#8fd5c9" },
});

