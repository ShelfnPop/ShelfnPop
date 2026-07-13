import { Alert, ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";
import type { Session } from "@supabase/supabase-js";
import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import type { CollectionItem, SharedShelf, SharedShelfCollectionItem } from "../types";
import { integer, money } from "../utils/format";
import {
  type ChecklistDisplayRow,
  type CollectionFilter,
  type SetChecklistItem,
  type SetChecklistSummary,
  type StatsGroupMode,
  type StatsSourceItem,
  addSetCompletion,
  buildChecklistDisplayRows,
  buildSharedStatsMembers,
  buildStatsGroups,
  checklistRowName,
  displayPopName,
  duplicateShelfKey,
  isMeaningfulVariant,
  percent,
  perPopValue,
  quantityNumber,
  releaseDateText,
  setCompletionText,
  setPremiumDisplay,
  sortItemsByBoxNumber,
} from "../domain/appHelpers";
import {
  fetchMySharedShelves,
  fetchSetChecklistItems,
  fetchSetChecklistSummaries,
  fetchSharedShelfCollectionItems,
  fetchUserCollectionItems,
} from "../data/supabaseQueries";
import { ScreenFrame } from "./ShellPrimitives";
import { EmptyDisplayBox } from "./FormPrimitives";
import { Text, TextInput } from "./Primitives";

type BreakdownSortMode = "value" | "count" | "average";
type SetChecklistViewMode = "owned" | "missing" | "full";

const BREAKDOWN_EXPANDED_ROW_LIMIT = 36;

type ShelfBreakdownScreenProps = {
  session: Session;
  onBack: () => void;
  onOpenFilter: (filter: CollectionFilter) => void;
  styles: Record<string, any>;
  appVersion: string;
};

export function ShelfBreakdownScreenImpl({
  session,
  onBack,
  onOpenFilter,
  styles,
  appVersion,
}: ShelfBreakdownScreenProps) {
const [items, setItems] = useState<CollectionItem[]>([]); const [sharedItems, setSharedItems] = useState<SharedShelfCollectionItem[]>([]); const [sharedShelves, setSharedShelves] = useState<SharedShelf[]>([]); const [setChecklists, setSetChecklists] = useState<Record<string, SetChecklistSummary>>({}); const [activeShelfId, setActiveShelfId] = useState<string | null>(null); const [selectedMemberId, setSelectedMemberId] = useState("all"); const [busy, setBusy] = useState(true); const [sharedBusy, setSharedBusy] = useState(false); const [groupMode, setGroupMode] = useState<StatsGroupMode>("franchise"); const [sortMode, setSortMode] = useState<BreakdownSortMode>("value"); const [searchText, setSearchText] = useState(""); const deferredSearchText = useDeferredValue(searchText); const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null); const [showAllBreakdownRowsKey, setShowAllBreakdownRowsKey] = useState<string | null>(null); const [setChecklistViewMode, setSetChecklistViewMode] = useState<SetChecklistViewMode>("owned"); const [checklistItemsBySetId, setChecklistItemsBySetId] = useState<Record<string, SetChecklistItem[]>>({}); const [checklistLoadingSetId, setChecklistLoadingSetId] = useState<string | null>(null); const load = useCallback(async () => { setBusy(true); try {
    const [rows, shelves, checklistRows] = await Promise.all([fetchUserCollectionItems(session.user.id), fetchMySharedShelves().catch(() => [] as SharedShelf[]), fetchSetChecklistSummaries(),]);
    const firstShelf = shelves[0] ?? null;
    setItems(rows);
    setSharedShelves(shelves);
    setSetChecklists(checklistRows);
    setActiveShelfId(firstShelf?.id ?? null);
    setSharedItems([]);
    setSelectedMemberId("all");
}
catch (error) {
    Alert.alert("Shelf Breakdown error", error instanceof Error ? error.message : "Unable to load your shelf breakdown.");
}
finally {
    setBusy(false);
} }, [session.user.id]); useEffect(() => { load(); }, [load]); useEffect(() => { let cancelled = false; const loadSharedShelf = async () => { if (!activeShelfId) {
    setSharedItems([]);
    setSelectedMemberId("all");
    setExpandedGroupKey(null);
    setShowAllBreakdownRowsKey(null);
    return;
} setSharedBusy(true); try {
    const shelfRows = await fetchSharedShelfCollectionItems(activeShelfId);
    if (!cancelled) {
        setSharedItems(shelfRows);
        setSelectedMemberId("all");
        setExpandedGroupKey(null);
        setShowAllBreakdownRowsKey(null);
    }
}
catch (error) {
    if (!cancelled) {
        Alert.alert("Shared shelf error", error instanceof Error ? error.message : "Unable to load that shared shelf.");
        setSharedItems([]);
    }
}
finally {
    if (!cancelled)
        setSharedBusy(false);
} }; loadSharedShelf(); return () => { cancelled = true; }; }, [activeShelfId]); const ensureChecklistItems = useCallback(async (checklist: SetChecklistSummary | null | undefined) => { if (!checklist?.set_id || checklistItemsBySetId[checklist.set_id] || checklistLoadingSetId === checklist.set_id)
    return; setChecklistLoadingSetId(checklist.set_id); try {
    const rows = await fetchSetChecklistItems(checklist.set_id);
    setChecklistItemsBySetId((current) => ({ ...current, [checklist.set_id]: rows, }));
}
catch (error) {
    Alert.alert("Set checklist error", error instanceof Error ? error.message : "Unable to load the full set checklist.");
}
finally {
    setChecklistLoadingSetId((current) => (current === checklist.set_id ? null : current));
} }, [checklistItemsBySetId, checklistLoadingSetId]); const activeShelf = useMemo(() => sharedShelves.find((shelf) => shelf.id === activeShelfId) ?? null, [activeShelfId, sharedShelves]); const memberTabs = useMemo(() => buildSharedStatsMembers(sharedItems), [sharedItems]); useEffect(() => { if (selectedMemberId !== "all" && !memberTabs.some((member) => member.id === selectedMemberId)) {
    setSelectedMemberId("all");
} }, [memberTabs, selectedMemberId]); const selectedMember = memberTabs.find((member) => member.id === selectedMemberId) ?? memberTabs[0] ?? null; const breakdownItems = useMemo<StatsSourceItem[]>(() => { if (!activeShelf)
    return items; if (selectedMemberId === "all")
    return sharedItems; return sharedItems.filter((item) => (item.owner_user_id || item.user_id || "unknown") === selectedMemberId); }, [activeShelf, items, selectedMemberId, sharedItems]); const groups = useMemo(() => { const baseGroups = buildStatsGroups(breakdownItems, groupMode); return groupMode === "set" ? addSetCompletion(baseGroups, setChecklists) : baseGroups; }, [breakdownItems, groupMode, setChecklists]); const filteredGroups = useMemo(() => { const term = deferredSearchText.trim().toLowerCase(); const visible = term ? groups.filter((group) => group.name.toLowerCase().includes(term)) : groups; return [...visible].sort((a, b) => { if (sortMode === "count") {
    return b.count - a.count || b.value - a.value || a.name.localeCompare(b.name);
} if (sortMode === "average") {
    return b.averageValue - a.averageValue || b.count - a.count || a.name.localeCompare(b.name);
} return b.value - a.value || b.count - a.count || a.name.localeCompare(b.name); }); }, [groups, deferredSearchText, sortMode]); const summary = useMemo(() => { const totalPops = breakdownItems.reduce((sum, item) => sum + quantityNumber(item.quantity), 0); const uniquePops = new Set(breakdownItems.map(duplicateShelfKey)).size; const totalValue = breakdownItems.reduce((sum, item) => sum + Number(item.total_value ?? 0), 0); const strongestGroup = [...groups].sort((a, b) => b.value - a.value)[0] ?? null; return { totalPops, uniquePops, totalValue, strongestGroup }; }, [breakdownItems, groups]); const maxValue = Math.max(1, ...filteredGroups.map((group) => group.value)); const filterKind = groupMode === "franchise" ? "franchise" : "setName"; const title = groupMode === "franchise" ? "Franchises" : "Sets"; const canOpenGroup = !activeShelf; const canExpandGroup = activeShelf || groupMode === "set"; const memberCount = Math.max(0, memberTabs.length - 1); const scopeName = activeShelf ? selectedMemberId === "all" ? activeShelf.name || "Shared Shelf" : `${selectedMember?.name ?? "Collector"}'s Shelf` : "My Shelf"; const scopeCopy = activeShelf ? selectedMemberId === "all" ? `${integer(summary.totalPops)} Pops across ${integer(memberCount)} members, ${money(summary.totalValue)} total value.` : `${integer(summary.totalPops)} Pops from ${selectedMember?.name ?? "this member"}, ${money(summary.totalValue)} total value.` : `${integer(summary.totalPops)} Pops, ${integer(summary.uniquePops)} unique, ${money(summary.totalValue)} total value.`; return (<ScreenFrame appVersion={appVersion} title="Shelf Breakdown" onBack={onBack}>      {busy ? (<ActivityIndicator color="#7e67f4"/>) : (<>          <View style={styles.breakdownHero}>            <Text style={styles.dashboardEyebrow}>{activeShelf ? "Shared shelf map" : "Shelf organizer"}</Text>            <Text style={styles.dashboardSectionTitle}>{scopeName}</Text>            <Text style={styles.dashboardSubtext}>{scopeCopy}</Text>            {summary.strongestGroup ? (<View style={styles.breakdownHeroMetaRow}>                <View style={styles.breakdownHeroTile}>                  <Text style={styles.breakdownHeroLabel}>Top by value</Text>                  <Text style={styles.breakdownHeroValue} numberOfLines={1}>                    {summary.strongestGroup.name}                  </Text>                </View>                <View style={styles.breakdownHeroTile}>                  <Text style={styles.breakdownHeroLabel}>Avg pop</Text>                  <Text style={styles.breakdownHeroValue}>{money(summary.strongestGroup.averageValue)}</Text>                </View>              </View>) : null}          </View>          {sharedShelves.length > 1 ? (<View style={styles.breakdownSwitchPanel}>              <Text style={styles.breakdownSwitchLabel}>Shared shelf</Text>              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.breakdownShelfTabs}>                {sharedShelves.map((shelf) => (<Pressable key={shelf.id} onPress={() => { setActiveShelfId(shelf.id); setShowAllBreakdownRowsKey(null); }} style={[styles.breakdownShelfTab, activeShelfId === shelf.id && styles.breakdownShelfTabActive]}>                    <Text style={styles.breakdownShelfTabName} numberOfLines={1}>                      {shelf.name || "Shared Shelf"}                    </Text>                    <Text style={styles.breakdownShelfTabMeta}>                      {integer(shelf.member_count ?? 0)} members                    </Text>                  </Pressable>))}              </ScrollView>            </View>) : null}          {activeShelf && memberTabs.length > 0 ? (<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.breakdownMemberTabs}>              {memberTabs.map((member) => (<Pressable key={member.id} onPress={() => { setSelectedMemberId(member.id); setExpandedGroupKey(null); setShowAllBreakdownRowsKey(null); }} style={[styles.breakdownMemberTab, selectedMemberId === member.id && styles.breakdownMemberTabActive]}>                  <Text style={styles.breakdownMemberTabName} numberOfLines={1}>                    {member.name}                  </Text>                  <Text style={styles.breakdownMemberTabMeta}>{integer(member.count)} in shelf</Text>                  <Text style={styles.breakdownMemberTabValue}>{money(member.value)}</Text>                </Pressable>))}            </ScrollView>) : null}          <View style={styles.breakdownControls}>            <View style={styles.segmentedControl}>              {(["franchise", "set"] as const).map((mode) => (<Pressable key={mode} onPress={() => { setGroupMode(mode); setExpandedGroupKey(null); setShowAllBreakdownRowsKey(null); }} style={[styles.segmentButton, groupMode === mode && styles.segmentButtonActive]}>                  <Text style={[styles.segmentText, groupMode === mode && styles.segmentTextActive]}>                    {mode === "franchise" ? "Franchises" : "Sets"}                  </Text>                </Pressable>))}            </View>            <TextInput value={searchText} onChangeText={setSearchText} placeholder={groupMode === "franchise" ? "Search franchises" : "Search sets"} placeholderTextColor="#8d96a3" style={styles.breakdownSearchInput}/>            <View style={styles.breakdownSortRow}>              {([["value", "Value"], ["count", "Pops"], ["average", "Avg"],] as const).map(([mode, label]) => (<Pressable key={mode} onPress={() => setSortMode(mode)} style={[styles.breakdownSortChip, sortMode === mode && styles.breakdownSortChipActive]}>                  <Text style={[styles.breakdownSortText, sortMode === mode && styles.breakdownSortTextActive]}>{label}</Text>                </Pressable>))}            </View>          </View>          <View style={styles.dashboardInsightPanel}>            <Text style={styles.dashboardSectionTitle}>{title} Breakdown</Text>            <Text style={styles.mutedSmall}>              {activeShelf ? "Tap a row to see the Pops inside it." : "Tap a row to open the matching shelf view."}            </Text>            {sharedBusy ? (<ActivityIndicator color="#7e67f4"/>) : filteredGroups.length === 0 ? (<Text style={styles.mutedText}>No matching groups found.</Text>) : (filteredGroups.map((group) => { const valueBarPercent = Math.max(4, Math.min(100, (group.value / maxValue) * 100)); const expanded = expandedGroupKey === group.key; const checklist = groupMode === "set" ? setChecklists[group.name.toLowerCase()] : null; const checklistRows = checklist?.set_id ? checklistItemsBySetId[checklist.set_id] ?? [] : []; const checklistLoading = Boolean(checklist?.set_id && checklistLoadingSetId === checklist.set_id); const checklistDisplayRows = checklistRows.length > 0 ? buildChecklistDisplayRows(checklistRows, group.items, group.name) : []; const matchedChecklistCount = checklistDisplayRows.filter((row) => row.owned).length; const stableOwnedCount = group.completionOwnedCount ?? group.uniqueCount; const displayCompletionOwnedCount = Math.max(stableOwnedCount, matchedChecklistCount); const displayCompletionTotal = Math.max(Number(checklist?.required_count ?? group.checklistTotal ?? 0), checklistRows.length, displayCompletionOwnedCount); const displayCompletionPercent = displayCompletionTotal > 0 ? Math.min(100, (displayCompletionOwnedCount / displayCompletionTotal) * 100) : null; const hasCompletion = Boolean(displayCompletionTotal && displayCompletionPercent != null); const completionBarPercent = Math.max(4, Math.min(100, Number(displayCompletionPercent ?? 0))); const barWidth = `${hasCompletion ? completionBarPercent : valueBarPercent}%` as `${number}%`; const completionLine = hasCompletion && displayCompletionPercent != null ? `${integer(displayCompletionOwnedCount)} of ${integer(displayCompletionTotal)} owned - ${percent(displayCompletionPercent)} complete` : setCompletionText(group); const missingRows = checklistDisplayRows.filter((row) => !row.owned); const displayMissingCount = checklistDisplayRows.length > 0 ? missingRows.length : Math.max(0, displayCompletionTotal - displayCompletionOwnedCount); const premiumDisplay = groupMode === "set" ? setPremiumDisplay(group, displayCompletionOwnedCount, displayCompletionTotal) : null; const visibleChecklistRows = setChecklistViewMode === "missing" ? missingRows : setChecklistViewMode === "full" ? checklistDisplayRows : []; const expandedOwnedRows = sortItemsByBoxNumber(group.items); const expandedRowsCount = setChecklistViewMode === "owned" ? expandedOwnedRows.length : visibleChecklistRows.length; return (<View key={group.key} style={styles.breakdownGroupRow}>                    <Pressable onPress={canOpenGroup && !canExpandGroup ? () => onOpenFilter({ kind: filterKind, label: group.name, value: group.name }) : () => { setExpandedGroupKey(expanded ? null : group.key); setShowAllBreakdownRowsKey(null); setSetChecklistViewMode("owned"); if (!expanded && checklist)
    void ensureChecklistItems(checklist); }} style={({ pressed }) => [styles.breakdownGroupPressable, pressed && styles.pressed]}>                      <View style={styles.flex}>                        <View style={styles.breakdownGroupHeaderRow}>                          <View style={styles.flex}>                            <Text style={styles.breakdownGroupName} numberOfLines={1}>                              {group.name}                            </Text>                            <Text style={styles.breakdownGroupMeta}>{integer(group.uniqueCount)} unique Pops</Text>                            {completionLine ? <Text style={styles.setCompletionText}>{completionLine}</Text> : null}                          </View>                          <Text style={styles.groupChevron}>{canOpenGroup && !canExpandGroup ? "View" : expanded ? "Hide" : "Open"}</Text>                        </View>                        <View style={styles.breakdownMetricRow}>                          <View style={styles.breakdownMetricTile}>                            <Text style={styles.breakdownMetricLabel}>Pops</Text>                            <Text style={styles.breakdownMetricValue} numberOfLines={1}>                              {integer(group.count)}                            </Text>                          </View>                          <View style={styles.breakdownMetricTile}>                            <Text style={styles.breakdownMetricLabel}>Value</Text>                            <Text style={styles.breakdownMetricValue} numberOfLines={1}>                              {money(group.value)}                            </Text>                          </View>                          <View style={styles.breakdownMetricTile}>                            <Text style={styles.breakdownMetricLabel}>Avg</Text>                            <Text style={styles.breakdownMetricValue} numberOfLines={1}>                              {money(group.averageValue)}                            </Text>                          </View>                        </View>                        <View style={styles.breakdownBarTrack}>                          <View style={[styles.breakdownBarFill, { width: barWidth }]}/>                        </View>                        {premiumDisplay ? (<Text style={[styles.setPremiumText, premiumDisplay.isActive ? styles.setPremiumTextActive : null]}>                            {premiumDisplay.text}                          </Text>) : null}                      </View>                    </Pressable>                    {expanded ? (<View style={styles.statsGroupDetail}>                        {groupMode === "set" && checklist ? (<>                            <View style={styles.setChecklistTabs}>                              {([["owned", `Owned ${integer(displayCompletionOwnedCount)}`], ["missing", `Missing ${integer(displayMissingCount)}`], ["full", `Full ${integer(checklist.required_count ?? checklistRows.length)}`],] as const).map(([mode, label]) => (<Pressable key={mode} onPress={() => { setSetChecklistViewMode(mode); setShowAllBreakdownRowsKey(null); void ensureChecklistItems(checklist); }} style={[styles.setChecklistTab, setChecklistViewMode === mode && styles.setChecklistTabActive]}>                                  <Text style={[styles.setChecklistTabText, setChecklistViewMode === mode && styles.setChecklistTabTextActive]}>                                    {label}                                  </Text>                                </Pressable>))}                            </View>                            {checklistLoading ? <ActivityIndicator color="#7e67f4"/> : null}                          </>) : null}                        {setChecklistViewMode === "owned" || groupMode !== "set" || !checklist ? (expandedOwnedRows.slice(0, showAllBreakdownRowsKey === group.key ? expandedOwnedRows.length : BREAKDOWN_EXPANDED_ROW_LIMIT).map((item) => <StatsPopRow key={item.collection_item_id} item={item} styles={styles}/>)) : visibleChecklistRows.length === 0 && !checklistLoading ? (<Text style={styles.mutedSmall}>                            {setChecklistViewMode === "missing" ? "No missing Pops found for this reviewed checklist." : "No checklist rows loaded for this set yet."}                          </Text>) : (visibleChecklistRows.slice(0, showAllBreakdownRowsKey === group.key ? visibleChecklistRows.length : BREAKDOWN_EXPANDED_ROW_LIMIT).map((row) => <ChecklistPopRow key={row.id} row={row} styles={styles}/>))}                        {expandedRowsCount > BREAKDOWN_EXPANDED_ROW_LIMIT ? (<Pressable onPress={() => setShowAllBreakdownRowsKey(showAllBreakdownRowsKey === group.key ? null : group.key)} style={({ pressed }) => [styles.showMoreRowsButton, pressed && styles.pressed]}>                            <Text style={styles.showMoreRowsText}>                              {showAllBreakdownRowsKey === group.key ? "Show fewer" : `Show ${integer(expandedRowsCount - BREAKDOWN_EXPANDED_ROW_LIMIT)} more`}                            </Text>                          </Pressable>) : null}                      </View>) : null}                  </View>); }))}          </View>        </>)}    </ScreenFrame>); }

function StatsPopRow({ item, onPress, styles }: { item: StatsSourceItem; onPress?: () => void; styles: Record<string, any> }) { const variant = item.display_variant || item.owned_variant; const metaLine = [item.set_name, item.number ? `#${item.number}` : null, isMeaningfulVariant(variant) ? variant : null,].filter(Boolean).join("  "); const content = (<>      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.statsPopImage}/> : <EmptyDisplayBox style={styles.statsPopImagePlaceholder}/>}      <View style={styles.flex}>        <Text style={styles.statsListTitle} numberOfLines={1}>          {displayPopName(item)}        </Text>        <Text style={styles.mutedSmall} numberOfLines={1}>          {metaLine}        </Text>        {releaseDateText(item) ? (<Text style={styles.mutedSmall} numberOfLines={1}>            {releaseDateText(item)}          </Text>) : null}        <Text style={styles.mutedSmall}>Qty {integer(item.quantity)}</Text>      </View>      <View style={styles.alignEnd}>        <Text style={styles.statsListValue}>{money(perPopValue(item))}</Text>        <Text style={styles.mutedSmall}>each</Text>      </View>    </>); if (!onPress) {
    return <View style={styles.statsPopRow}>{content}</View>;
} return (<Pressable onPress={onPress} style={({ pressed }) => [styles.statsPopRow, pressed && styles.pressed]}>      {content}    </Pressable>); }
function ChecklistPopRow({ row, styles }: { row: ChecklistDisplayRow; styles: Record<string, any> }) { const metaLine = [row.pop_type, row.pop_style && row.pop_style !== "Standard" ? row.pop_style : null, row.number ? `#${row.number}` : null, isMeaningfulVariant(row.variant) ? row.variant : null, row.exclusivity,].filter(Boolean).join("  "); return (<View style={[styles.statsPopRow, !row.owned && styles.missingChecklistRow]}>      <EmptyDisplayBox style={styles.statsPopImagePlaceholder}/>      <View style={styles.flex}>        <Text style={[styles.statsListTitle, !row.owned && styles.missingChecklistTitle]} numberOfLines={1}>          {checklistRowName(row)}        </Text>        <Text style={styles.mutedSmall} numberOfLines={1}>          {metaLine}        </Text>        <Text style={row.owned ? styles.checklistOwnedText : styles.checklistMissingText}>          {row.owned ? "Owned" : "Not in shelf"}        </Text>      </View>      <View style={styles.alignEnd}>        <Text style={row.owned ? styles.checklistOwnedBadge : styles.checklistMissingBadge}>          {row.owned ? "Owned" : "Missing"}        </Text>      </View>    </View>); }




