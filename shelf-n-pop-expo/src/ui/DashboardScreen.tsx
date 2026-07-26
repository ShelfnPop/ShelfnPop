import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, View } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  dashboardActivityText,
  displayPopName,
  perPopValue,
  releaseDateText,
  resolveAvatarKey,
  type AvatarKey,
} from "../domain/appHelpers";
import { compactName, integer, money } from "../utils/format";
import type { CollectionItem, DashboardHome, Profile } from "../types";
import { ScreenFrame } from "./ShellPrimitives";
import { Text } from "./Primitives";
import { SecondaryButton } from "./FormPrimitives";

const APP_VERSION = "0.3.26";
const AVATAR_IMAGES: Record<AvatarKey, any> = {
  logo: require("../../assets/shelf-n-pop-logo.png"),
  midnight: require("../../assets/avatars/avatar-beanie.png"),
  mint: require("../../assets/avatars/avatar-glasses.png"),
  gold: require("../../assets/avatars/avatar-cap.png"),
  berry: require("../../assets/avatars/avatar-crown.png"),
  ice: require("../../assets/avatars/avatar-shades.png"),
  hoodie: require("../../assets/avatars/avatar-hoodie.png"),
  panda: require("../../assets/avatars/avatar-panda.png"),
  bear: require("../../assets/avatars/avatar-bear.png"),
  lion: require("../../assets/avatars/avatar-lion.png"),
  cat: require("../../assets/avatars/avatar-cat.png"),
  bot: require("../../assets/avatars/avatar-bot.png"),
  fox: require("../../assets/avatars/avatar-fox.png"),
  owl: require("../../assets/avatars/avatar-owl.png"),
};

type DashboardScreenStyles = Record<string, any>;

export interface DashboardScreenProps {
  session: Session;
  refreshKey: number;
  onScan: () => void;
  onCollection: () => void;
  onShelfStats: () => void;
  onOpenItem: (item: CollectionItem) => void;
  onSharedShelf: () => void;
  onProfile: () => void;
  onAdmin?: () => void;
  styles: DashboardScreenStyles;
}

export function DashboardScreen({
  session,
  refreshKey,
  onScan,
  onCollection,
  onShelfStats,
  onOpenItem,
  onSharedShelf,
  onProfile,
  onAdmin,
  styles,
}: DashboardScreenProps) {
  const [dashboard, setDashboard] = useState<DashboardHome | null>(null);
  const [highestValuePop, setHighestValuePop] = useState<CollectionItem | null>(null);
  const [oldestPop, setOldestPop] = useState<CollectionItem | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    const [{ data, error }, highestResult, oldestResult, profileResult] = await Promise.all([
      supabase.from("dashboard_home_view").select("*").eq("user_id", session.user.id).maybeSingle(),
      supabase
        .from("user_collection_view")
        .select("*")
        .eq("user_id", session.user.id)
        .order("value_each", { ascending: false, nullsFirst: false })
        .limit(1),
      supabase
        .from("user_collection_view")
        .select("*")
        .eq("user_id", session.user.id)
        .not("release_date", "is", null)
        .order("release_date", { ascending: true, nullsFirst: false })
        .limit(1),
      supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle(),
    ]);

    setBusy(false);
    if (error) {
      Alert.alert("Dashboard error", error.message);
      return;
    }

    if (highestResult.error) {
      setHighestValuePop(null);
    } else {
      setHighestValuePop(((highestResult.data ?? [])[0] as CollectionItem | undefined) ?? null);
    }

    if (oldestResult.error) {
      setOldestPop(null);
    } else {
      setOldestPop(((oldestResult.data ?? [])[0] as CollectionItem | undefined) ?? null);
    }

    setProfile(profileResult.error ? null : (profileResult.data as Profile | null));
    setDashboard(data as DashboardHome | null);
  }, [session.user.id]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <ScreenFrame appVersion={APP_VERSION} title="Shelf-n-Pop" rightLabel="Sign out" onRight={() => supabase.auth.signOut()}>
      {busy ? (
        <ActivityIndicator color="#7e67f4" />
      ) : (
        <>
          <View style={styles.dashboardHero}>
            <View style={styles.dashboardHeroTop}>
              <View style={styles.dashboardLogoShell}>
                <ProfileAvatar avatarKey={resolveAvatarKey(profile?.avatar_url)} size={46} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.dashboardEyebrow}>Your shelf today</Text>
                <Text style={styles.dashboardGreeting} adjustsFontSizeToFit numberOfLines={1}>
                  {dashboard?.greeting_text ?? "Welcome back, Collector"}
                </Text>
              </View>
            </View>
            <Text style={styles.dashboardSubtext}>{dashboardActivityText(dashboard)}</Text>
          </View>

          <View style={styles.dashboardValueCard}>
            <Text style={styles.dashboardValueLabel}>Total Collection Value</Text>
            <View style={styles.dashboardValueBody}>
              <Text style={styles.dashboardValue} adjustsFontSizeToFit numberOfLines={1}>
                {money(dashboard?.total_collection_value)}
              </Text>
              <View style={styles.dashboardValueSide}>
                <Text style={styles.dashboardSideLabel}>Avg Value</Text>
                <Text style={styles.dashboardSideValue}>{money(dashboard?.average_value_per_pop)}</Text>
                <Text style={styles.dashboardSideLabel}>Avg Paid</Text>
                <Text style={styles.dashboardSideValue}>{money(dashboard?.average_paid_per_pop)}</Text>
              </View>
            </View>
            <View style={styles.dashboardGainRow}>
              <Text style={styles.dashboardGainLabel}>Net Gain</Text>
              <Text style={[styles.dashboardGainValue, gainLossColorStyle(styles, dashboard?.gain_loss)]}>
                {money(dashboard?.gain_loss)}
              </Text>
            </View>
          </View>

          <View style={styles.dashboardStatsGrid}>
            <MetricCard label="Pops" value={integer(dashboard?.total_pops)} styles={styles} />
            <MetricCard label="Unique Pops" value={integer(dashboard?.unique_items)} styles={styles} />
            <MetricCard label="Added This Month" value={integer(dashboard?.pops_added_this_month)} styles={styles} />
          </View>

          <View style={styles.dashboardInsightPanel}>
            <Text style={styles.dashboardSectionTitle}>Value Snapshot</Text>
            <View style={styles.dashboardInsightGrid}>
              <View style={styles.dashboardInsightTile}>
                <Text style={styles.dashboardInsightLabel}>Total Paid</Text>
                <Text style={styles.dashboardInsightValue} adjustsFontSizeToFit numberOfLines={1}>
                  {money(dashboard?.total_paid)}
                </Text>
              </View>
              <View style={styles.dashboardInsightTile}>
                <Text style={styles.dashboardInsightLabel}>Avg Paid</Text>
                <Text style={styles.dashboardInsightValue} adjustsFontSizeToFit numberOfLines={1}>
                  {money(dashboard?.average_paid_per_pop)}
                </Text>
              </View>
              <View style={styles.dashboardInsightTile}>
                <Text style={styles.dashboardInsightLabel}>Avg Value</Text>
                <Text style={styles.dashboardInsightValue} adjustsFontSizeToFit numberOfLines={1}>
                  {money(dashboard?.average_value_per_pop)}
                </Text>
              </View>
            </View>
            <TopStatRow
              label="Highest Valued Pop"
              item={highestValuePop}
              value={money(highestValuePop ? perPopValue(highestValuePop) : null)}
              onPress={highestValuePop ? () => onOpenItem(highestValuePop) : undefined}
              styles={styles}
            />
            <TopStatRow
              label="Oldest Pop"
              item={oldestPop}
              value={oldestPop ? releaseDateText(oldestPop) ?? "--" : "--"}
              onPress={oldestPop ? () => onOpenItem(oldestPop) : undefined}
              styles={styles}
            />
          </View>

          <View style={styles.dashboardActionPanel}>
            <Text style={styles.dashboardSectionTitle}>Quick Actions</Text>
            <View style={styles.dashboardActionGrid}>
              <Pressable onPress={onScan} style={styles.dashboardPrimaryAction}>
                <Text style={styles.dashboardActionLabel}>Scan Pop</Text>
                <Text style={styles.dashboardActionSub}>Add or update an item</Text>
              </Pressable>
              <Pressable onPress={onShelfStats} style={styles.dashboardStatsQuickAction}>
                <Text style={styles.dashboardActionLabel}>Shelf Stats</Text>
                <Text style={styles.dashboardActionSub}>Sets, values, and gaps</Text>
              </Pressable>
            </View>
            <View style={styles.dashboardBottomActions}>
              <SecondaryButton label="My Shelf" onPress={onCollection} />
              <SecondaryButton label="Shared Shelf" onPress={onSharedShelf} />
            </View>
            <Pressable onPress={onProfile} style={styles.dashboardProfileLink}>
              <Text style={styles.dashboardProfileText}>Profile & settings</Text>
            </Pressable>
            {onAdmin ? (
              <Pressable onPress={onAdmin} style={styles.dashboardProfileLink}>
                <Text style={styles.dashboardProfileText}>Admin Console</Text>
              </Pressable>
            ) : null}
          </View>
        </>
      )}
    </ScreenFrame>
  );
}

function gainLossColorStyle(styles: DashboardScreenStyles, value: number | null | undefined) {
  const amount = Number(value ?? 0);
  if (amount < 0) {
    return styles.lossText;
  }
  if (amount > 0) {
    return styles.gainText;
  }
  return styles.neutralMoneyText;
}

function MetricCard({ label, value, styles }: { label: string; value: string; styles: DashboardScreenStyles }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.cardLabel} adjustsFontSizeToFit numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.metricValue} adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function TopStatRow({
  label,
  item,
  value,
  onPress,
  styles,
}: {
  label: string;
  item: CollectionItem | null;
  value: string;
  onPress?: () => void;
  styles: DashboardScreenStyles;
}) {
  return (
    <Pressable onPress={onPress} style={styles.insightRow} disabled={!onPress}>
      <View style={styles.flex}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.itemMeta} adjustsFontSizeToFit numberOfLines={1}>
          {item ? compactName(displayPopName(item, item.owned_variant)) : "No data yet"}
        </Text>
      </View>
      <View style={styles.insightValueBlock}>
        <Text style={styles.bigMoney} adjustsFontSizeToFit numberOfLines={1}>
          {value}
        </Text>
      </View>
    </Pressable>
  );
}

function ProfileAvatar({ avatarKey, size }: { avatarKey: AvatarKey; size: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 10, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
      <Image source={AVATAR_IMAGES[avatarKey]} style={{ width: size, height: size, resizeMode: "cover" }} />
    </View>
  );
}
