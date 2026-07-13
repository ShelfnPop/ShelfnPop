import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import type { Session } from "@supabase/supabase-js";
import {
  addSetCompletion,
  buildDuplicateShelfKeys,
  buildStatsGroups,
  duplicateShelfKey,
  displayPopName,
  isRecentCollectionItem,
  percent,
  perPopValue,
  quantityNumber,
  releaseDateText,
  type CollectionFilter,
  type SetChecklistSummary,
  type StatsGroup,
  setCompletionText,
} from "../domain/appHelpers";
import { compactName, integer, money } from "../utils/format";
import { fetchSetChecklistSummaries, fetchUserCollectionItems } from "../data/supabaseQueries";
import type { CollectionItem } from "../types";
import { Text } from "./Primitives";
import { ScreenFrame } from "./ShellPrimitives";

type ShelfStatsScreenStyles = Record<string, any>;

const APP_VERSION = "0.2.0";

export interface ShelfStatsScreenProps {
  session: Session;
  onBack: () => void;
  onOpenBreakdown: () => void;
  onOpenFilter: (filter: CollectionFilter) => void;
  onOpenItem: (item: CollectionItem) => void;
  styles: ShelfStatsScreenStyles;
}

export function ShelfStatsScreen({
  session,
  onBack,
  onOpenBreakdown,
  onOpenFilter,
  onOpenItem,
  styles,
}: ShelfStatsScreenProps) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [setChecklists, setSetChecklists] = useState<Record<string, SetChecklistSummary>>({});
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [rows, checklistRows] = await Promise.all([fetchUserCollectionItems(session.user.id), fetchSetChecklistSummaries()]);
      setItems(rows);
      setSetChecklists(checklistRows);
    } catch (error) {
      Alert.alert("Shelf Stats error", error instanceof Error ? error.message : "Unable to load your shelf stats.");
    } finally {
      setBusy(false);
    }
  }, [session.user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    let totalPops = 0;
    let totalValue = 0;
    let totalPaid = 0;
    let vaultedCount = 0;
    let limitedCount = 0;
    let missingImage = 0;
    let missingValue = 0;
    let unknownCondition = 0;
    let recentAdds = 0;
    let topValue: CollectionItem | null = null;
    let biggestGain: CollectionItem | null = null;
    let lowestValue: CollectionItem | null = null;
    const uniqueShelfKeys = new Set<string>();
    const duplicateShelfKeys = buildDuplicateShelfKeys(items);
    const duplicateRows: CollectionItem[] = [];
    let duplicateQuantity = 0;

    for (const item of items) {
      const quantity = quantityNumber(item.quantity);
      const valueEach = Number(perPopValue(item) ?? 0);
      const gainLoss = Number(item.gain_loss ?? 0);
      const shelfKey = duplicateShelfKey(item);

      totalPops += quantity;
      totalValue += Number(item.total_value ?? 0);
      totalPaid += Number(item.total_cost ?? 0);
      uniqueShelfKeys.add(shelfKey);

      if (duplicateShelfKeys.has(shelfKey)) {
        duplicateRows.push(item);
        duplicateQuantity += quantity;
      }

      if (String(item.vault_status ?? "").toLowerCase().includes("vault")) {
        vaultedCount += quantity;
      }

      if (item.limited_edition || item.limited_count || item.edition_notes) {
        limitedCount += quantity;
      }

      if (!item.image_url) {
        missingImage += 1;
      }

      if (valueEach <= 0) {
        missingValue += 1;
      }

      if (!item.condition || item.condition === "Unknown") {
        unknownCondition += 1;
      }

      if (isRecentCollectionItem(item)) {
        recentAdds += quantity;
      }

      if (!topValue || valueEach > Number(perPopValue(topValue) ?? 0)) {
        topValue = item;
      }

      if (!biggestGain || gainLoss > Number(biggestGain.gain_loss ?? 0)) {
        biggestGain = item;
      }

      if (valueEach > 0 && (!lowestValue || valueEach < Number(perPopValue(lowestValue) ?? 0))) {
        lowestValue = item;
      }
    }

    const gainLoss = totalValue - totalPaid;
    const gainLossPercent = totalPaid > 0 ? (gainLoss / totalPaid) * 100 : null;
    const uniqueShelfItems = uniqueShelfKeys.size;
    const duplicateCopies = Math.max(0, duplicateQuantity - duplicateShelfKeys.size);
    const franchiseGroups = buildStatsGroups(items, "franchise");
    const setGroups = addSetCompletion(buildStatsGroups(items, "set"), setChecklists);
    const topFranchises = [...franchiseGroups]
      .sort((a, b) => b.value - a.value || b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 5);
    const topSets = [...setGroups]
      .sort((a, b) => b.value - a.value || b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 5);
    const closestSets = [...setGroups]
      .filter((group) => group.checklistTotal && group.completionPercent != null)
      .sort((a, b) => {
        const aMissing = Number(a.checklistTotal ?? 0) - Number(a.completionOwnedCount ?? a.uniqueCount);
        const bMissing = Number(b.checklistTotal ?? 0) - Number(b.completionOwnedCount ?? b.uniqueCount);
        const aComplete = Number(a.completionPercent ?? 0);
        const bComplete = Number(b.completionPercent ?? 0);
        return aMissing - bMissing || bComplete - aComplete || b.value - a.value || a.name.localeCompare(b.name);
      })
      .slice(0, 5);

    return {
      totalPops,
      uniqueItems: uniqueShelfItems,
      shelfEntries: items.length,
      totalValue,
      totalPaid,
      gainLoss,
      gainLossPercent,
      averageValue: totalPops > 0 ? totalValue / totalPops : 0,
      averagePaid: totalPops > 0 ? totalPaid / totalPops : 0,
      duplicateRows: duplicateRows.length,
      duplicateCopies,
      vaultedCount,
      limitedCount,
      missingImage,
      missingValue,
      unknownCondition,
      recentAdds,
      topValue,
      biggestGain,
      lowestValue,
      franchiseGroups,
      setGroups,
      topFranchises,
      topSets,
      closestSets,
    };
  }, [items, setChecklists]);

  return (
    <ScreenFrame appVersion={APP_VERSION} title="Shelf Stats" onBack={onBack}>
      {busy ? (
        <ActivityIndicator color="#7e67f4" />
      ) : (
        <>
          <View style={styles.statsHero}>
            <Text style={styles.dashboardEyebrow}>Personal shelf recap</Text>
            <Text style={styles.statsHeroValue}>{money(stats.totalValue)}</Text>
            <Text style={styles.dashboardSubtext}>
              {integer(stats.totalPops)} Pops, {integer(stats.uniqueItems)} unique Pops, {money(stats.gainLoss)} gain/loss.
            </Text>
          </View>

          <View style={styles.dashboardStatsGrid}>
            <MetricCard label="Avg Value" value={money(stats.averageValue)} styles={styles} />
            <MetricCard label="Avg Paid" value={money(stats.averagePaid)} styles={styles} />
            <MetricCard label="Return" value={stats.gainLossPercent == null ? "--" : percent(stats.gainLossPercent)} styles={styles} />
          </View>

          <View style={styles.dashboardInsightPanel}>
            <Text style={styles.dashboardSectionTitle}>Shelf Mix</Text>
            <View style={styles.statsTwoColumn}>
              <StatPill
                label="Vaulted"
                value={integer(stats.vaultedCount)}
                styles={styles}
                onPress={() => onOpenFilter({ kind: "vaulted", label: "Vaulted" })}
              />
              <StatPill
                label="Limited"
                value={integer(stats.limitedCount)}
                styles={styles}
                onPress={() => onOpenFilter({ kind: "limited", label: "Limited" })}
              />
              <StatPill
                label="Duplicate Pops"
                value={integer(stats.duplicateCopies)}
                styles={styles}
                onPress={() => onOpenFilter({ kind: "duplicates", label: "Duplicate Pops" })}
              />
              <StatPill
                label="Added 30 days"
                value={integer(stats.recentAdds)}
                styles={styles}
                onPress={() => onOpenFilter({ kind: "recent", label: "Added 30 days" })}
              />
            </View>
          </View>

          <View style={styles.dashboardInsightPanel}>
            <Text style={styles.dashboardSectionTitle}>Standout Pops</Text>
            <TopStatRow
              label="Highest Value"
              item={stats.topValue}
              value={money(stats.topValue ? perPopValue(stats.topValue) : null)}
              onPress={stats.topValue ? () => onOpenItem(stats.topValue as CollectionItem) : undefined}
              styles={styles}
            />
            <TopStatRow
              label="Biggest Gain"
              item={stats.biggestGain}
              value={money(stats.biggestGain?.gain_loss)}
              valueStyle={gainLossColorStyle(styles, stats.biggestGain?.gain_loss)}
              onPress={stats.biggestGain ? () => onOpenItem(stats.biggestGain as CollectionItem) : undefined}
              styles={styles}
            />
            <TopStatRow
              label="Lowest Value"
              item={stats.lowestValue}
              value={money(stats.lowestValue ? perPopValue(stats.lowestValue) : null)}
              onPress={stats.lowestValue ? () => onOpenItem(stats.lowestValue as CollectionItem) : undefined}
              styles={styles}
            />
          </View>

          <View style={styles.dashboardInsightPanel}>
            <Text style={styles.dashboardSectionTitle}>Shelf Health</Text>
            <View style={styles.statsTwoColumn}>
              <StatPill
                label="Missing images"
                value={integer(stats.missingImage)}
                styles={styles}
                onPress={() => onOpenFilter({ kind: "missingImages", label: "Missing images" })}
              />
              <StatPill
                label="Missing values"
                value={integer(stats.missingValue)}
                styles={styles}
                onPress={() => onOpenFilter({ kind: "missingValues", label: "Missing values" })}
              />
              <StatPill
                label="Unknown condition"
                value={integer(stats.unknownCondition)}
                styles={styles}
                onPress={() => onOpenFilter({ kind: "unknownCondition", label: "Unknown condition" })}
              />
              <StatPill label="Shelf entries" value={integer(stats.shelfEntries)} styles={styles} />
            </View>
          </View>

          <Pressable onPress={onOpenBreakdown} style={({ pressed }) => [styles.statsBreakdownButton, pressed && styles.pressed]}>
            <Text style={styles.statsBreakdownButtonText}>Set & Franchise Breakdown</Text>
          </Pressable>

          <View style={styles.dashboardInsightPanel}>
            <Text style={styles.dashboardSectionTitle}>Top Franchises</Text>
            {stats.topFranchises.length === 0 ? (
              <Text style={styles.mutedText}>Add Pops to your shelf to see highlights here.</Text>
            ) : (
              stats.topFranchises.map((group, index) => (
                <StatsHighlightRow
                  key={group.key}
                  rank={index + 1}
                  group={group}
                  styles={styles}
                  onPress={() => onOpenFilter({ kind: "franchise", label: group.name, value: group.name })}
                />
              ))
            )}
          </View>

          <View style={styles.dashboardInsightPanel}>
            <Text style={styles.dashboardSectionTitle}>Top Sets</Text>
            {stats.topSets.length === 0 ? (
              <Text style={styles.mutedText}>Add Pops to your shelf to see set highlights here.</Text>
            ) : (
              stats.topSets.map((group, index) => (
                <StatsHighlightRow
                  key={group.key}
                  rank={index + 1}
                  group={group}
                  styles={styles}
                  onPress={() => onOpenFilter({ kind: "setName", label: group.name, value: group.name })}
                />
              ))
            )}
          </View>

          <View style={styles.dashboardInsightPanel}>
            <Text style={styles.dashboardSectionTitle}>Closest Sets</Text>
            {stats.closestSets.length === 0 ? (
              <Text style={styles.mutedText}>Reviewed set totals will appear here as they are added.</Text>
            ) : (
              stats.closestSets.map((group, index) => (
                <StatsHighlightRow
                  key={group.key}
                  rank={index + 1}
                  group={group}
                  styles={styles}
                  detail={setCompletionText(group) ?? undefined}
                  onPress={() => onOpenFilter({ kind: "setName", label: group.name, value: group.name })}
                />
              ))
            )}
          </View>
        </>
      )}
    </ScreenFrame>
  );
}

function gainLossColorStyle(styles: ShelfStatsScreenStyles, value: number | null | undefined) {
  const amount = Number(value ?? 0);
  if (amount < 0) {
    return styles.lossText;
  }
  if (amount > 0) {
    return styles.gainText;
  }
  return styles.neutralMoneyText;
}

function MetricCard({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ShelfStatsScreenStyles;
}) {
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

function StatPill({
  label,
  value,
  styles,
  onPress,
}: {
  label: string;
  value: string;
  styles: ShelfStatsScreenStyles;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Text style={styles.dashboardInsightLabel}>{label}</Text>
      <Text style={styles.statPillValue} adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </Text>
    </>
  );

  if (!onPress) {
    return <View style={styles.statPill}>{content}</View>;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.statPill, styles.pressableStatRow, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

function StatsHighlightRow({
  rank,
  group,
  detail,
  onPress,
  styles,
}: {
  rank: number;
  group: StatsGroup;
  detail?: string;
  onPress?: () => void;
  styles: ShelfStatsScreenStyles;
}) {
  const content = (
    <>
      <View style={styles.statsRankBadge}>
        <Text style={styles.statsRankText}>{integer(rank)}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.statsListTitle} numberOfLines={1}>
          {group.name}
        </Text>
        <Text style={styles.mutedSmall} numberOfLines={1}>
          {detail ?? `${integer(group.count)} Pops, ${integer(group.uniqueCount)} unique, avg ${money(group.averageValue)}`}
        </Text>
      </View>
      <View style={styles.alignEnd}>
        <Text style={styles.statsListValue}>{money(group.value)}</Text>
        <Text style={styles.groupChevron}>View</Text>
      </View>
    </>
  );

  if (!onPress) {
    return <View style={styles.statsListRow}>{content}</View>;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.statsListRow, styles.pressableStatRow, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

function TopStatRow({
  label,
  item,
  value,
  valueStyle,
  onPress,
  styles,
}: {
  label: string;
  item: CollectionItem | null;
  value: string;
  valueStyle?: React.ComponentProps<typeof Text>["style"];
  onPress?: () => void;
  styles: ShelfStatsScreenStyles;
}) {
  const content = (
    <>
      <View style={styles.flex}>
        <Text style={styles.dashboardInsightLabel}>{label}</Text>
        <Text style={styles.statsListTitle} numberOfLines={1}>
          {item ? compactName(displayPopName(item, item.owned_variant)) : "--"}
        </Text>
        <Text style={styles.mutedSmall} numberOfLines={1}>
          {item ? compactName(item.set_name || item.franchise) : "No shelf data yet"}
        </Text>
      </View>
      <Text style={[styles.statsListValue, valueStyle]} adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </Text>
    </>
  );

  if (!onPress) {
    return <View style={styles.statsListRow}>{content}</View>;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.statsListRow, styles.pressableStatRow, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}
