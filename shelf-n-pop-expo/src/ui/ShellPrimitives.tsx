import React from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    View,
    type ViewStyle,
} from "react-native";
import { Text } from "./Primitives";

const APP_LOGO = require("../../assets/shelf-n-pop-logo.png");

export function ScreenFrame({
    title,
    children,
    onBack,
    rightLabel,
    onRight,
    scroll = true,
    appVersion,
    style,
}: {
    title: string;
    children: React.ReactNode;
    onBack?: () => void;
    rightLabel?: string;
    onRight?: () => void;
    scroll?: boolean;
    appVersion?: string;
    style?: ViewStyle;
}) {
    return (
        <View style={[styles.screen, style]}>
            <View style={styles.appBar}>
                {onBack ? (
                    <Pressable onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backText}>‹</Text>
                    </Pressable>
                ) : (
                    <Image source={APP_LOGO} style={styles.headerLogo} />
                )}
                <Text style={styles.appTitle}>{title}</Text>
                {rightLabel && onRight ? (
                    <Pressable onPress={onRight} style={styles.rightAction}>
                        <Text style={styles.rightActionText}>{rightLabel}</Text>
                    </Pressable>
                ) : (
                    <View style={styles.rightActionPlaceholder} />
                )}
            </View>
            {scroll ? (
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    {children}
                    <VersionFooter appVersion={appVersion} />
                </ScrollView>
            ) : (
                <View style={styles.contentFill}>
                    {children}
                    <VersionFooter appVersion={appVersion} />
                </View>
            )}
        </View>
    );
}

export function VersionFooter({ appVersion = "0.2.0" }: { appVersion?: string }) {
    return (
        <View style={styles.versionFooter}>
            <Text style={styles.versionFooterText}>Shelf-n-Pop v{appVersion}</Text>
        </View>
    );
}

export function Splash({ label }: { label: string }) {
    return (
        <SafeAreaView style={[styles.safeArea, styles.webSafeArea]}>
            <View style={styles.splash}>
                <ActivityIndicator color="#7e67f4" />
                <Text style={styles.mutedText}>{label}</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = {
    safeArea: { flex: 1, backgroundColor: "#1f2429" },
    webSafeArea: { minHeight: "100vh" as any, width: "100vw" as any, overflow: "hidden" as any },
    screen: { flex: 1, width: "100%", maxWidth: 520, backgroundColor: "#101318" },
    appBar: {
        minHeight: 64,
        paddingHorizontal: 16,
        flexDirection: "row" as const,
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#765df0",
        borderBottomWidth: 1,
        borderBottomColor: "#8d77ff",
    },
    appTitle: { flex: 1, color: "#fff", fontSize: 20, fontWeight: "900" },
    backButton: { width: 38, height: 38, justifyContent: "center" },
    headerLogo: { width: 38, height: 38, borderRadius: 10, marginRight: 8 },
    backText: { color: "#7bd1c3", fontSize: 34, lineHeight: 34 },
    rightAction: {
        minWidth: 96,
        minHeight: 34,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: "rgba(16, 19, 24, 0.16)",
    },
    rightActionText: { color: "#fff", fontWeight: "900", fontSize: 12 },
    rightActionPlaceholder: { minWidth: 96, minHeight: 34 },
    content: { padding: 18, gap: 16, paddingBottom: 44 },
    versionFooter: { alignItems: "center", paddingTop: 12, paddingBottom: 2 },
    versionFooterText: { color: "#a9b3c1", fontSize: 12, fontWeight: "800" },
    contentFill: { flex: 1 },
    mutedText: { color: "#b8c0cc", fontSize: 14, lineHeight: 19 },
    splash: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
} as const;
