import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { Session } from "@supabase/supabase-js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text as NativeText,
  TextInput as NativeTextInput,
  View,
} from "react-native";

import { supabase } from "./src/lib/supabase";
import type {
  CollectionItem,
  DashboardHome,
  LookupResponse,
  PopCatalog,
  Profile,
  PublicWishlistItem,
  SharedShelf,
  SharedShelfCollectionItem,
  SharedShelfGroupedItem,
} from "./src/types";
import { compactName, integer, money } from "./src/utils/format";

type Screen =
  | "dashboard"
  | "scan"
  | "manualAdd"
  | "collection"
  | "detail"
  | "profile"
  | "publicProfile"
  | "sharedShelf"
  | "sharedShelfDetail"
  | "shelfStats"
  | "shelfBreakdown";

const SORTS = ["Newest first", "Value high-low", "Gain/Loss high-low", "Name A-Z"] as const;
type SortMode = (typeof SORTS)[number];
type CollectionFilterKind =
  | "none"
  | "vaulted"
  | "limited"
  | "duplicates"
  | "recent"
  | "missingImages"
  | "missingValues"
  | "unknownCondition"
  | "franchise"
  | "setName";
type CollectionFilter = {
  kind: CollectionFilterKind;
  label: string;
  value?: string;
};
type StatsGroupMode = "franchise" | "set";
type BreakdownSortMode = "value" | "count" | "average";
type StatsSourceItem = CollectionItem | SharedShelfCollectionItem;
type SharedStatsMember = {
  id: string;
  name: string;
  count: number;
  value: number;
};
type StatsGroup = {
  key: string;
  name: string;
  count: number;
  uniqueCount: number;
  value: number;
  paid: number;
  averageValue: number;
  items: StatsSourceItem[];
};
const CONDITIONS = ["Unknown", "Mint", "Near Mint", "Good", "Fair", "Damaged", "Out of Box"] as const;
const VARIANTS = ["Common", "Chase", "Glow in the Dark", "Flocked", "Metallic", "Diamond", "Blacklight", "Bloody", "Digital", "GitD", "Other"] as const;
const APP_LOGO = require("./assets/shelf-n-pop-logo.png");
const APP_VERSION = "0.1.3";
const AVATAR_BEANIE = require("./assets/avatars/avatar-beanie.png");
const AVATAR_GLASSES = require("./assets/avatars/avatar-glasses.png");
const AVATAR_CAP = require("./assets/avatars/avatar-cap.png");
const AVATAR_CROWN = require("./assets/avatars/avatar-crown.png");
const AVATAR_SHADES = require("./assets/avatars/avatar-shades.png");
const AVATAR_HOODIE = require("./assets/avatars/avatar-hoodie.png");
const AVATAR_PANDA = require("./assets/avatars/avatar-panda.png");
const AVATAR_BEAR = require("./assets/avatars/avatar-bear.png");
const AVATAR_LION = require("./assets/avatars/avatar-lion.png");
const AVATAR_CAT = require("./assets/avatars/avatar-cat.png");
const AVATAR_BOT = require("./assets/avatars/avatar-bot.png");
const AVATAR_FOX = require("./assets/avatars/avatar-fox.png");
const AVATAR_OWL = require("./assets/avatars/avatar-owl.png");
const IS_WEB = Platform.OS === "web";
const NO_COLLECTION_FILTER: CollectionFilter = { kind: "none", label: "All Pops" };
const AVATAR_OPTIONS = [
  { key: "logo", label: "Shelf", image: APP_LOGO, accent: "#ff8a00" },
  { key: "midnight", label: "Beanie", image: AVATAR_BEANIE, accent: "#7e67f4" },
  { key: "mint", label: "Glasses", image: AVATAR_GLASSES, accent: "#7bd1c3" },
  { key: "gold", label: "Cap", image: AVATAR_CAP, accent: "#ffb23f" },
  { key: "berry", label: "Crown", image: AVATAR_CROWN, accent: "#f071b8" },
  { key: "ice", label: "Shades", image: AVATAR_SHADES, accent: "#8fd3ff" },
  { key: "hoodie", label: "Hoodie", image: AVATAR_HOODIE, accent: "#7e67f4" },
  { key: "panda", label: "Panda", image: AVATAR_PANDA, accent: "#7bd1c3" },
  { key: "bear", label: "Bear", image: AVATAR_BEAR, accent: "#ffb23f" },
  { key: "lion", label: "Lion", image: AVATAR_LION, accent: "#ff8a00" },
  { key: "cat", label: "Cat", image: AVATAR_CAT, accent: "#7e67f4" },
  { key: "bot", label: "Bot", image: AVATAR_BOT, accent: "#7bd1c3" },
  { key: "fox", label: "Fox", image: AVATAR_FOX, accent: "#ff8a00" },
  { key: "owl", label: "Owl", image: AVATAR_OWL, accent: "#ffb23f" },
] as const;
type AvatarKey = (typeof AVATAR_OPTIONS)[number]["key"];
const SUPABASE_PAGE_SIZE = 1000;

type BrowserBarcodeDetector = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
};

type BrowserScannerControls = {
  stop: () => void;
};

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => BrowserBarcodeDetector;
  }
}

function Text(props: React.ComponentProps<typeof NativeText>) {
  return <NativeText allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />;
}

function TextInput(props: React.ComponentProps<typeof NativeTextInput>) {
  return <NativeTextInput allowFontScaling={false} maxFontSizeMultiplier={1} {...props} />;
}

function passwordRedirectTo() {
  if (IS_WEB && typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return undefined;
}

function quantityNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function perPopValue(item: {
  value_each?: number | null;
  current_value?: number | null;
  estimated_value?: number | null;
  total_value?: number | null;
  quantity?: number | null;
  total_quantity?: number | null;
}) {
  if (item.value_each != null) return Number(item.value_each);
  if (item.current_value != null) return Number(item.current_value);

  const quantity = quantityNumber(item.quantity ?? item.total_quantity);
  if (quantity > 0 && item.total_value != null) return Number(item.total_value) / quantity;
  if (item.estimated_value != null) return Number(item.estimated_value);

  return null;
}

async function fetchSharedShelfCollectionItems(shelfId: string): Promise<SharedShelfCollectionItem[]> {
  const allRows: SharedShelfCollectionItem[] = [];

  // Page through the whole view so large shared shelves do not stop at Supabase's 1,000-row response cap.
  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const to = from + SUPABASE_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("shared_shelf_collection_view")
      .select("*")
      .eq("shelf_id", shelfId)
      .order("created_at", { ascending: false })
      .order("collection_item_id", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const rows = (data ?? []) as SharedShelfCollectionItem[];
    allRows.push(...rows);

    if (rows.length < SUPABASE_PAGE_SIZE) {
      break;
    }
  }

  return allRows;
}

async function fetchUserCollectionItems(userId: string): Promise<CollectionItem[]> {
  const allRows: CollectionItem[] = [];

  // Match the shared shelf loader: Shelf Stats and long personal shelves need every page, not just the first 1,000.
  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const to = from + SUPABASE_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("user_collection_view")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .order("collection_item_id", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const rows = (data ?? []) as CollectionItem[];
    allRows.push(...rows);

    if (rows.length < SUPABASE_PAGE_SIZE) {
      break;
    }
  }

  return allRows;
}

async function fetchMySharedShelves(): Promise<SharedShelf[]> {
  const { data, error } = await supabase.rpc("get_my_shared_shelves");
  if (error) throw error;
  return (data ?? []) as SharedShelf[];
}

function sharedShelfOwnerName(item: SharedShelfCollectionItem): string {
  return (item.owner_display_name || "Collector").trim() || "Collector";
}

type ScanShelfOwner = {
  key: string;
  name: string;
  quantity: number;
  variant: string;
};

function normalizedUpc(value: string | number | null | undefined): string {
  return String(value ?? "").replace(/\D/g, "");
}

function normalizeShelfVariant(value: string | null | undefined): string {
  const clean = String(value ?? "").trim();
  return clean || "Common";
}

async function fetchSharedShelfOwnersForPop(pop: PopCatalog): Promise<ScanShelfOwner[]> {
  const popUpc = normalizedUpc(pop.upc);
  if (!pop.id && !popUpc) return [];

  const shelves = await fetchMySharedShelves();
  const shelf = shelves[0];
  if (!shelf?.id) return [];

  const items = await fetchSharedShelfCollectionItems(shelf.id);
  const owners = new Map<string, ScanShelfOwner>();

  for (const item of items) {
    const itemUpc = normalizedUpc(item.upc);
    if (item.pop_catalog_id !== pop.id && itemUpc !== popUpc) continue;

    const ownerId = item.owner_user_id || item.user_id || sharedShelfOwnerName(item);
    const name = sharedShelfOwnerName(item);
    const variant = normalizeShelfVariant(item.owned_variant ?? item.display_variant);
    const key = `${ownerId}:${variant.toLowerCase()}`;
    const existing = owners.get(key) ?? { key, name, variant, quantity: 0 };
    existing.quantity += quantityNumber(item.quantity) || 1;
    owners.set(key, existing);
  }

  return Array.from(owners.values()).sort(
    (a, b) => a.name.localeCompare(b.name) || a.variant.localeCompare(b.variant),
  );
}

function buildSharedStatsMembers(items: SharedShelfCollectionItem[]): SharedStatsMember[] {
  const members = new Map<string, SharedStatsMember>();
  let totalCount = 0;
  let totalValue = 0;

  for (const item of items) {
    const count = quantityNumber(item.quantity);
    const value = Number(item.total_value ?? 0);
    totalCount += count;
    totalValue += value;

    const id = item.owner_user_id || item.user_id || "unknown";
    const existing = members.get(id) ?? { id, name: sharedShelfOwnerName(item), count: 0, value: 0 };
    existing.count += count;
    existing.value += value;
    members.set(id, existing);
  }

  return [
    { id: "all", name: "All", count: totalCount, value: totalValue },
    ...Array.from(members.values()).sort((a, b) => b.value - a.value || a.name.localeCompare(b.name)),
  ];
}

async function fetchDashboardHome(userId: string): Promise<DashboardHome | null> {
  const { data, error } = await supabase
    .from("dashboard_home_view")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return (data as DashboardHome | null) ?? null;
}

function percent(value: number | null | undefined): string {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return "0%";
  return `${parsed.toFixed(1)}%`;
}

function dashboardActivityText(dashboard: DashboardHome | null): string {
  const totalPops = Number(dashboard?.total_pops ?? 0);
  const uniquePops = Number(dashboard?.unique_items ?? 0);
  const addedThisMonth = Number(dashboard?.pops_added_this_month ?? 0);

  if (totalPops > 0 && addedThisMonth > 0) {
    return `${integer(totalPops)} Pops on your shelf, ${integer(addedThisMonth)} added this month.`;
  }

  if (totalPops > 0 && uniquePops > 0) {
    return `${integer(totalPops)} Pops across ${integer(uniquePops)} unique catalog items.`;
  }

  return "Scan your first Pop to start building your shelf.";
}

function shortDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isMeaningfulVariant(value: string | null | undefined): boolean {
  const normalized = String(value ?? "").trim().toLowerCase();
  return Boolean(normalized) && !["common", "standard", "--", "unknown"].includes(normalized);
}

function isRecentCollectionItem(item: CollectionItem): boolean {
  const dateValue = item.acquired_date || item.created_at;
  const date = dateValue ? new Date(dateValue).getTime() : Number.NaN;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return Number.isFinite(date) && date >= thirtyDaysAgo;
}

function duplicateShelfKey(item: StatsSourceItem): string {
  const catalogId = item.pop_catalog_id || item.collection_item_id;
  const variant = String(item.owned_variant || item.display_variant || item.variant || "Common")
    .trim()
    .toLowerCase();
  return `${catalogId}::${variant || "common"}`;
}

function buildDuplicateShelfKeys(items: CollectionItem[]): Set<string> {
  const counts = new Map<string, { rows: number; copies: number }>();
  for (const item of items) {
    const key = duplicateShelfKey(item);
    const existing = counts.get(key) ?? { rows: 0, copies: 0 };
    existing.rows += 1;
    existing.copies += quantityNumber(item.quantity);
    counts.set(key, existing);
  }

  return new Set(
    Array.from(counts.entries())
      .filter(([, value]) => value.rows > 1 || value.copies > 1)
      .map(([key]) => key),
  );
}

function matchesCollectionFilter(item: CollectionItem, filter: CollectionFilter, duplicateShelfKeys?: Set<string>): boolean {
  if (filter.kind === "none") return true;
  if (filter.kind === "vaulted") return String(item.vault_status ?? "").toLowerCase().includes("vault");
  if (filter.kind === "limited") return Boolean(item.limited_edition || item.limited_count || item.edition_notes);
  if (filter.kind === "duplicates") return quantityNumber(item.quantity) > 1 || Boolean(duplicateShelfKeys?.has(duplicateShelfKey(item)));
  if (filter.kind === "recent") return isRecentCollectionItem(item);
  if (filter.kind === "missingImages") return !item.image_url;
  if (filter.kind === "missingValues") return Number(perPopValue(item) ?? 0) <= 0;
  if (filter.kind === "unknownCondition") return !item.condition || item.condition === "Unknown";
  if (filter.kind === "franchise") return compactName(item.franchise || item.set_name || "Unsorted") === filter.value;
  if (filter.kind === "setName") return compactName(item.set_name || "Unsorted") === filter.value;
  return true;
}

function buildStatsGroups(items: StatsSourceItem[], mode: StatsGroupMode): StatsGroup[] {
  const groups = new Map<string, StatsGroup & { uniqueIds: Set<string> }>();

  for (const item of items) {
    const name = mode === "franchise" ? compactName(item.franchise || item.set_name || "Unsorted") : compactName(item.set_name || "Unsorted");
    const existing =
      groups.get(name) ??
      ({
        key: `${mode}:${name}`,
        name,
        count: 0,
        uniqueCount: 0,
        value: 0,
        paid: 0,
        averageValue: 0,
        items: [],
        uniqueIds: new Set<string>(),
      } as StatsGroup & { uniqueIds: Set<string> });

    existing.count += quantityNumber(item.quantity);
    existing.value += Number(item.total_value ?? 0);
    existing.paid += Number(item.total_cost ?? 0);
    existing.uniqueIds.add(item.pop_catalog_id || item.collection_item_id);
    existing.items.push(item);
    groups.set(name, existing);
  }

  return Array.from(groups.values())
    .map(({ uniqueIds, ...group }) => ({
      ...group,
      uniqueCount: uniqueIds.size,
      averageValue: group.count > 0 ? group.value / group.count : 0,
      items: [...group.items].sort((a, b) => Number(perPopValue(b) ?? 0) - Number(perPopValue(a) ?? 0)),
    }))
    .sort((a, b) => b.count - a.count || b.value - a.value || a.name.localeCompare(b.name));
}

function groupSharedShelfItems(items: SharedShelfCollectionItem[]): SharedShelfGroupedItem[] {
  const grouped = new Map<string, SharedShelfGroupedItem & { ownerSet: Set<string>; variantSet: Set<string> }>();

  for (const item of items) {
    const existing = grouped.get(item.pop_catalog_id);
    const ownerName = item.owner_display_name || "Collector";
    const variantName = item.display_variant || item.owned_variant || item.variant;

    if (existing) {
      existing.total_quantity = quantityNumber(existing.total_quantity) + quantityNumber(item.quantity);
      existing.total_value = Number(existing.total_value ?? 0) + Number(item.total_value ?? 0);
      existing.total_cost = Number(existing.total_cost ?? 0) + Number(item.total_cost ?? 0);
      existing.gain_loss = Number(existing.gain_loss ?? 0) + Number(item.gain_loss ?? 0);
      existing.ownerSet.add(ownerName);
      if (variantName) existing.variantSet.add(variantName);
      existing.owner_count = existing.ownerSet.size;
      existing.owner_names = Array.from(existing.ownerSet).join(", ");
      existing.variants_owned = Array.from(existing.variantSet).join(", ");
      if (item.created_at && (!existing.newest_added_at || item.created_at > existing.newest_added_at)) {
        existing.newest_added_at = item.created_at;
      }
      continue;
    }

    const ownerSet = new Set([ownerName]);
    const variantSet = new Set<string>();
    if (variantName) variantSet.add(variantName);

    grouped.set(item.pop_catalog_id, {
      shelf_id: item.shelf_id,
      shelf_name: item.shelf_name,
      invite_code: item.invite_code,
      pop_catalog_id: item.pop_catalog_id,
      upc: item.upc,
      pop_name: item.pop_name,
      character: item.character,
      franchise: item.franchise,
      number: item.number,
      variant: item.variant,
      exclusivity: item.exclusivity,
      pop_style: item.pop_style,
      set_name: item.set_name,
      image_url: item.image_url,
      vault_status: item.vault_status,
      estimated_value: item.estimated_value,
      value_each: item.value_each,
      display_description: item.display_description,
      limited_edition: item.limited_edition,
      limited_count: item.limited_count,
      edition_notes: item.edition_notes,
      total_quantity: quantityNumber(item.quantity),
      owner_count: 1,
      owner_names: ownerName,
      variants_owned: Array.from(variantSet).join(", "),
      total_value: Number(item.total_value ?? 0),
      total_cost: Number(item.total_cost ?? 0),
      gain_loss: Number(item.gain_loss ?? 0),
      newest_added_at: item.created_at,
      ownerSet,
      variantSet,
    });
  }

  return Array.from(grouped.values()).map(({ ownerSet: _ownerSet, variantSet: _variantSet, ...item }) => item);
}

function gainLossColorStyle(value: number | null | undefined) {
  const amount = Number(value ?? 0);
  if (amount < 0) return styles.lossText;
  if (amount > 0) return styles.gainText;
  return styles.neutralMoneyText;
}

function limitedEditionText(item: {
  limited_edition?: boolean | null;
  limited_count?: number | null;
  edition_notes?: string | null;
}) {
  if (!item.limited_edition && !item.limited_count && !item.edition_notes) return null;
  return "Limited Edition";
}

function LimitedBadge({
  item,
  compact = false,
}: {
  item: { limited_edition?: boolean | null; limited_count?: number | null; edition_notes?: string | null };
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

function vaultStatusText(item: { vault_status?: string | null }) {
  const status = String(item.vault_status ?? "").trim();
  if (!status) return null;
  if (/vault/i.test(status)) return "Vaulted";
  return status;
}

function VaultBadge({
  item,
  compact = false,
}: {
  item: { vault_status?: string | null };
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

function shelfMetaLine(item: {
  franchise?: string | null;
  set_name?: string | null;
  number?: string | null;
  display_variant?: string | null;
  variant?: string | null;
}) {
  const variant = item.display_variant || item.variant;
  return [
    item.set_name && item.franchise && item.set_name !== item.franchise ? item.franchise : null,
    item.number ? `#${item.number}` : null,
    variant && !/^common$/i.test(variant) ? variant : null,
  ]
    .filter(Boolean)
    .join("  •  ");
}

async function getFunctionErrorMessage(error: unknown, barcode?: string) {
  const baseMessage = error instanceof Error ? error.message : "The lookup request failed.";
  const response = (error as { context?: Response | { json?: () => Promise<unknown>; text?: () => Promise<string> } })?.context;
  const prefix = barcode ? `UPC: ${barcode}\n` : "";

  if (!response) {
    return `${prefix}${baseMessage}`;
  }

  try {
    const details = typeof response.json === "function" ? await response.json() : null;
    if (details && typeof details === "object") {
      const errorText =
        "error" in details && typeof details.error === "string"
          ? details.error
          : "message" in details && typeof details.message === "string"
            ? details.message
            : JSON.stringify(details);
      return `${prefix}${baseMessage}\n${errorText}`;
    }
  } catch {
    try {
      const text = typeof response.text === "function" ? await response.text() : "";
      if (text) return `${prefix}${baseMessage}\n${text}`;
    } catch {
      // Keep the original Supabase error if the response body has already been read.
    }
  }

  return `${prefix}${baseMessage}`;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (loadingSession) {
    return <Splash label="Loading Shelf-n-Pop..." />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, IS_WEB && styles.webSafeArea]}>
      <StatusBar style="light" />
      {session ? <SignedInApp session={session} /> : <AuthScreen />}
    </SafeAreaView>
  );
}

function SignedInApp({ session }: { session: Session }) {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<SharedShelf | null>(null);
  const [selectedPublicProfileId, setSelectedPublicProfileId] = useState<string | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>(NO_COLLECTION_FILTER);
  const [refreshKey, setRefreshKey] = useState(0);

  const goHome = () => {
    setSelectedItem(null);
    setSelectedShelf(null);
    setSelectedPublicProfileId(null);
    setScreen("dashboard");
    setRefreshKey((value) => value + 1);
  };

  return (
    <View style={[styles.appShell, IS_WEB && styles.webAppShell]}>
      {screen === "dashboard" && (
        <DashboardScreen
          session={session}
          refreshKey={refreshKey}
          onScan={() => setScreen("scan")}
          onCollection={() => {
            setCollectionFilter(NO_COLLECTION_FILTER);
            setScreen("collection");
          }}
          onShelfStats={() => setScreen("shelfStats")}
          onOpenItem={(item) => {
            setSelectedItem(item);
            setScreen("detail");
          }}
          onSharedShelf={() => setScreen("sharedShelf")}
          onProfile={() => setScreen("profile")}
        />
      )}
      {screen === "scan" && (
        <ScanScreen
          onBack={goHome}
          onManualAdd={() => setScreen("manualAdd")}
          onAdded={(item) => {
            setSelectedItem(item);
            setScreen("detail");
          }}
        />
      )}
      {screen === "manualAdd" && (
        <ManualAddScreen
          onBack={() => setScreen("scan")}
          onAdded={(item) => {
            setSelectedItem(item);
            setScreen("detail");
          }}
        />
      )}
      {screen === "collection" && (
        <CollectionScreen
          session={session}
          onBack={goHome}
          initialFilter={collectionFilter}
          onShelfStats={() => setScreen("shelfStats")}
          statsLabel="View Stats >"
          onOpenItem={(item) => {
            setSelectedItem(item);
            setScreen("detail");
          }}
        />
      )}
      {screen === "shelfStats" && (
        <ShelfStatsScreen
          session={session}
          onBack={goHome}
          onOpenBreakdown={() => setScreen("shelfBreakdown")}
          onOpenFilter={(filter) => {
            setCollectionFilter(filter);
            setScreen("collection");
          }}
          onOpenItem={(item) => {
            setSelectedItem(item);
            setScreen("detail");
          }}
        />
      )}
      {screen === "shelfBreakdown" && (
        <ShelfBreakdownScreen
          session={session}
          onBack={() => setScreen("shelfStats")}
          onOpenFilter={(filter) => {
            setCollectionFilter(filter);
            setScreen("collection");
          }}
        />
      )}
      {screen === "detail" && selectedItem && (
        <ItemDetailScreen
          item={selectedItem}
          onBack={() => setScreen("collection")}
          onUpdated={(item) => setSelectedItem(item)}
          onSaved={() => {
            setSelectedItem(null);
            setScreen("collection");
          }}
        />
      )}
      {screen === "sharedShelf" && (
        <SharedShelfScreen
          onBack={goHome}
          onOpenShelf={(shelf) => {
            setSelectedShelf(shelf);
            setScreen("sharedShelfDetail");
          }}
        />
      )}
      {screen === "sharedShelfDetail" && selectedShelf && (
        <SharedShelfDetailScreen
          shelf={selectedShelf}
          session={session}
          onBack={() => setScreen("sharedShelf")}
          onOpenProfile={(userId) => {
            setSelectedPublicProfileId(userId);
            setScreen("publicProfile");
          }}
        />
      )}
      {screen === "profile" && <ProfileScreen session={session} onBack={goHome} />}
      {screen === "publicProfile" && selectedPublicProfileId && (
        <PublicProfileScreen
          userId={selectedPublicProfileId}
          onBack={() => setScreen(selectedShelf ? "sharedShelfDetail" : "sharedShelf")}
        />
      )}
    </View>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const sendPasswordReset = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      Alert.alert("Enter your email", "Type your account email first, then request the reset link.");
      return;
    }

    setBusy(true);
    const redirectTo = passwordRedirectTo();
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, redirectTo ? { redirectTo } : undefined);
    setBusy(false);

    if (error) {
      Alert.alert("Reset failed", error.message);
      return;
    }

    Alert.alert("Reset email sent", "Check your inbox for the password reset link.");
  };

  const submit = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Enter your email and password.");
      return;
    }

    if (mode === "signUp" && password !== confirmPassword) {
      Alert.alert("Passwords do not match", "Please re-enter your password.");
      return;
    }

    setBusy(true);
    const result =
      mode === "signIn"
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password });
    setBusy(false);

    if (result.error) {
      Alert.alert("Authentication failed", result.error.message);
      return;
    }

    if (mode === "signUp") {
      Alert.alert("Account created", "You can start using Shelf-n-Pop.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.authWrap}>
      <View style={styles.brandBlock}>
        <Image source={APP_LOGO} style={styles.authLogo} />
        <Text style={styles.logoMark}>Shelf-n-Pop</Text>
        <Text style={styles.mutedText}>Track. Value. Share your collection.</Text>
      </View>
      <View style={styles.panel}>
        <Label>Email</Label>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="collector@email.com"
          placeholderTextColor="#8c95a3"
          style={styles.input}
        />
        <Label>Password</Label>
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#8c95a3"
          style={styles.input}
        />
        {mode === "signUp" && (
          <>
            <Label>Confirm Password</Label>
            <TextInput
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor="#8c95a3"
              style={styles.input}
            />
          </>
        )}
        <PrimaryButton label={busy ? "Working..." : mode === "signIn" ? "Log In" : "Create Account"} onPress={submit} disabled={busy} />
        {mode === "signIn" ? (
          <Pressable onPress={sendPasswordReset} disabled={busy} style={styles.linkButton}>
            <Text style={styles.linkText}>Forgot password?</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={() => setMode(mode === "signIn" ? "signUp" : "signIn")} style={styles.linkButton}>
          <Text style={styles.linkText}>{mode === "signIn" ? "Create an account" : "I already have an account"}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function DashboardScreen({
  session,
  refreshKey,
  onScan,
  onCollection,
  onShelfStats,
  onOpenItem,
  onSharedShelf,
  onProfile,
}: {
  session: Session;
  refreshKey: number;
  onScan: () => void;
  onCollection: () => void;
  onShelfStats: () => void;
  onOpenItem: (item: CollectionItem) => void;
  onSharedShelf: () => void;
  onProfile: () => void;
}) {
  const [dashboard, setDashboard] = useState<DashboardHome | null>(null);
  const [highestValuePop, setHighestValuePop] = useState<CollectionItem | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    const [{ data, error }, highestResult, profileResult] = await Promise.all([
      supabase.from("dashboard_home_view").select("*").eq("user_id", session.user.id).maybeSingle(),
      supabase.from("user_collection_view").select("*").eq("user_id", session.user.id).order("value_each", { ascending: false, nullsFirst: false }).limit(1),
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
    setProfile(profileResult.error ? null : (profileResult.data as Profile | null));
    setDashboard(data as DashboardHome | null);
  }, [session.user.id]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <ScreenFrame title="Shelf-n-Pop" rightLabel="Sign out" onRight={() => supabase.auth.signOut()}>
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
              <Text style={[styles.dashboardGainValue, gainLossColorStyle(dashboard?.gain_loss)]}>{money(dashboard?.gain_loss)}</Text>
            </View>
          </View>

          <View style={styles.dashboardStatsGrid}>
            <MetricCard label="Pops" value={integer(dashboard?.total_pops)} />
            <MetricCard label="Unique Pops" value={integer(dashboard?.unique_items)} />
            <MetricCard label="Added This Month" value={integer(dashboard?.pops_added_this_month)} />
          </View>

          <View style={styles.dashboardInsightPanel}>
            <Text style={styles.dashboardSectionTitle}>Value Snapshot</Text>
            <View style={styles.dashboardInsightGrid}>
              <View style={styles.dashboardInsightTile}>
                <Text style={styles.dashboardInsightLabel}>Total Paid</Text>
                <Text style={styles.dashboardInsightValue}>{money(dashboard?.total_paid)}</Text>
              </View>
              <View style={styles.dashboardInsightTile}>
                <Text style={styles.dashboardInsightLabel}>Avg Paid</Text>
                <Text style={styles.dashboardInsightValue}>{money(dashboard?.average_paid_per_pop)}</Text>
              </View>
              <View style={styles.dashboardInsightTile}>
                <Text style={styles.dashboardInsightLabel}>Avg Value</Text>
                <Text style={styles.dashboardInsightValue}>{money(dashboard?.average_value_per_pop)}</Text>
              </View>
            </View>
            <TopStatRow
              label="Highest Valued Pop"
              item={highestValuePop}
              value={money(highestValuePop ? perPopValue(highestValuePop) : null)}
              onPress={highestValuePop ? () => onOpenItem(highestValuePop) : undefined}
            />
          </View>

          <View style={styles.dashboardActionPanel}>
            <Text style={styles.dashboardSectionTitle}>Quick Actions</Text>
            <PrimaryButton label="Scan Pop" onPress={onScan} />
            <View style={styles.dashboardBottomActions}>
              <SecondaryButton label="My Shelf" onPress={onCollection} />
              <SecondaryButton label="Shared Shelf" onPress={onSharedShelf} />
            </View>
            <Pressable onPress={onShelfStats} style={styles.dashboardStatsAction}>
              <Text style={styles.dashboardStatsActionText}>Shelf Stats</Text>
            </Pressable>
            <Pressable onPress={onProfile} style={styles.dashboardProfileLink}>
              <Text style={styles.dashboardProfileText}>Profile & settings</Text>
            </Pressable>
            <VersionFooter />
          </View>
        </>
      )}
    </ScreenFrame>
  );
}

function ShelfStatsScreen({
  session,
  onBack,
  onOpenBreakdown,
  onOpenFilter,
  onOpenItem,
}: {
  session: Session;
  onBack: () => void;
  onOpenBreakdown: () => void;
  onOpenFilter: (filter: CollectionFilter) => void;
  onOpenItem: (item: CollectionItem) => void;
}) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [busy, setBusy] = useState(true);
  const [groupMode, setGroupMode] = useState<StatsGroupMode>("franchise");
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const rows = await fetchUserCollectionItems(session.user.id);
      setItems(rows);
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
    const rowTotalPops = items.reduce((sum, item) => sum + quantityNumber(item.quantity), 0);
    const rowTotalValue = items.reduce((sum, item) => sum + Number(item.total_value ?? 0), 0);
    const rowTotalPaid = items.reduce((sum, item) => sum + Number(item.total_cost ?? 0), 0);
    const totalPops = rowTotalPops;
    const totalValue = rowTotalValue;
    const totalPaid = rowTotalPaid;
    const gainLoss = totalValue - totalPaid;
    const gainLossPercent = totalPaid > 0 ? (gainLoss / totalPaid) * 100 : null;
    const rowUniqueShelfItems = new Set(items.map(duplicateShelfKey)).size;
    const uniqueShelfItems = rowUniqueShelfItems;
    const duplicateShelfKeys = buildDuplicateShelfKeys(items);
    const duplicateRows = items.filter((item) => duplicateShelfKeys.has(duplicateShelfKey(item)));
    const duplicateCopies = duplicateRows.reduce((sum, item) => sum + quantityNumber(item.quantity), 0) - duplicateShelfKeys.size;
    const vaultedCount = items.reduce((sum, item) => {
      const status = String(item.vault_status ?? "").toLowerCase();
      return sum + (status.includes("vault") ? quantityNumber(item.quantity) : 0);
    }, 0);
    const limitedCount = items.reduce(
      (sum, item) => sum + (item.limited_edition || item.limited_count || item.edition_notes ? quantityNumber(item.quantity) : 0),
      0,
    );
    const missingImage = items.filter((item) => !item.image_url).length;
    const missingValue = items.filter((item) => Number(perPopValue(item) ?? 0) <= 0).length;
    const unknownCondition = items.filter((item) => !item.condition || item.condition === "Unknown").length;
    const rowRecentAdds = items.reduce((sum, item) => sum + (isRecentCollectionItem(item) ? quantityNumber(item.quantity) : 0), 0);
    const recentAdds = rowRecentAdds;

    const topValue = [...items].sort((a, b) => Number(perPopValue(b) ?? 0) - Number(perPopValue(a) ?? 0))[0] ?? null;
    const biggestGain = [...items].sort((a, b) => Number(b.gain_loss ?? 0) - Number(a.gain_loss ?? 0))[0] ?? null;
    const lowestValue = [...items]
      .filter((item) => Number(perPopValue(item) ?? 0) > 0)
      .sort((a, b) => Number(perPopValue(a) ?? 0) - Number(perPopValue(b) ?? 0))[0] ?? null;

    const franchiseGroups = buildStatsGroups(items, "franchise");
    const setGroups = buildStatsGroups(items, "set");

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
    };
  }, [items]);

  const visibleGroups = groupMode === "franchise" ? stats.franchiseGroups : stats.setGroups;
  const groupTitle = groupMode === "franchise" ? "Franchise Totals" : "Set Totals";

  return (
    <ScreenFrame title="Shelf Stats" onBack={onBack}>
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
            <MetricCard label="Avg Value" value={money(stats.averageValue)} />
            <MetricCard label="Avg Paid" value={money(stats.averagePaid)} />
            <MetricCard label="Return" value={stats.gainLossPercent == null ? "--" : percent(stats.gainLossPercent)} />
          </View>

          <View style={styles.dashboardInsightPanel}>
            <Text style={styles.dashboardSectionTitle}>Shelf Mix</Text>
            <View style={styles.statsTwoColumn}>
              <StatPill label="Vaulted" value={integer(stats.vaultedCount)} onPress={() => onOpenFilter({ kind: "vaulted", label: "Vaulted" })} />
              <StatPill label="Limited" value={integer(stats.limitedCount)} onPress={() => onOpenFilter({ kind: "limited", label: "Limited" })} />
              <StatPill label="Duplicate Pops" value={integer(stats.duplicateCopies)} onPress={() => onOpenFilter({ kind: "duplicates", label: "Duplicate Pops" })} />
              <StatPill label="Added 30 days" value={integer(stats.recentAdds)} onPress={() => onOpenFilter({ kind: "recent", label: "Added 30 days" })} />
            </View>
          </View>

          <View style={styles.dashboardInsightPanel}>
            <Text style={styles.dashboardSectionTitle}>Standout Pops</Text>
            <TopStatRow label="Highest Value" item={stats.topValue} value={money(stats.topValue ? perPopValue(stats.topValue) : null)} onPress={stats.topValue ? () => onOpenItem(stats.topValue as CollectionItem) : undefined} />
            <TopStatRow
              label="Biggest Gain"
              item={stats.biggestGain}
              value={money(stats.biggestGain?.gain_loss)}
              valueStyle={gainLossColorStyle(stats.biggestGain?.gain_loss)}
              onPress={stats.biggestGain ? () => onOpenItem(stats.biggestGain as CollectionItem) : undefined}
            />
            <TopStatRow
              label="Lowest Value"
              item={stats.lowestValue}
              value={money(stats.lowestValue ? perPopValue(stats.lowestValue) : null)}
              onPress={stats.lowestValue ? () => onOpenItem(stats.lowestValue as CollectionItem) : undefined}
            />
          </View>

          <View style={styles.dashboardInsightPanel}>
            <Text style={styles.dashboardSectionTitle}>Shelf Health</Text>
            <View style={styles.statsTwoColumn}>
              <StatPill label="Missing images" value={integer(stats.missingImage)} onPress={() => onOpenFilter({ kind: "missingImages", label: "Missing images" })} />
              <StatPill label="Missing values" value={integer(stats.missingValue)} onPress={() => onOpenFilter({ kind: "missingValues", label: "Missing values" })} />
              <StatPill label="Unknown condition" value={integer(stats.unknownCondition)} onPress={() => onOpenFilter({ kind: "unknownCondition", label: "Unknown condition" })} />
              <StatPill label="Shelf entries" value={integer(stats.shelfEntries)} />
            </View>
          </View>

          <Pressable onPress={onOpenBreakdown} style={({ pressed }) => [styles.statsBreakdownButton, pressed && styles.pressed]}>
            <Text style={styles.statsBreakdownButtonText}>Set & Franchise Breakdown</Text>
          </Pressable>

          <View style={styles.dashboardInsightPanel}>
            <View style={styles.statsPanelHeader}>
              <View style={styles.flex}>
                <Text style={styles.dashboardSectionTitle}>{groupTitle}</Text>
                <Text style={styles.mutedSmall}>Tap a row to see the Pops inside it.</Text>
              </View>
              <View style={styles.segmentedControl}>
                {(["franchise", "set"] as const).map((mode) => (
                  <Pressable
                    key={mode}
                    onPress={() => {
                      setGroupMode(mode);
                      setExpandedGroupKey(null);
                    }}
                    style={[styles.segmentButton, groupMode === mode && styles.segmentButtonActive]}
                  >
                    <Text style={[styles.segmentText, groupMode === mode && styles.segmentTextActive]}>
                      {mode === "franchise" ? "Franchises" : "Sets"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {visibleGroups.length === 0 ? (
              <Text style={styles.mutedText}>Add Pops to your shelf to see totals here.</Text>
            ) : (
              visibleGroups.map((group) => {
                const expanded = expandedGroupKey === group.key;
                const filterKind = groupMode === "franchise" ? "franchise" : "setName";
                return (
                  <View key={group.key} style={styles.statsGroupBlock}>
                    <Pressable
                      onPress={() => setExpandedGroupKey(expanded ? null : group.key)}
                      style={({ pressed }) => [styles.statsGroupHeader, pressed && styles.pressed]}
                    >
                      <View style={styles.flex}>
                        <Text style={styles.statsListTitle} numberOfLines={1}>
                          {group.name}
                        </Text>
                        <Text style={styles.mutedSmall}>
                          {integer(group.count)} Pops, {integer(group.uniqueCount)} unique
                        </Text>
                        <Text style={styles.mutedSmall}>Avg pop {money(group.averageValue)}</Text>
                      </View>
                      <View style={styles.alignEnd}>
                        <Text style={styles.statsListValue}>{money(group.value)}</Text>
                        <Text style={styles.groupChevron}>{expanded ? "Hide" : "Open"}</Text>
                      </View>
                    </Pressable>

                    {expanded ? (
                      <View style={styles.statsGroupDetail}>
                        <Pressable
                          onPress={() => onOpenFilter({ kind: filterKind, label: group.name, value: group.name })}
                          style={({ pressed }) => [styles.groupFilterButton, pressed && styles.pressed]}
                        >
                          <Text style={styles.groupFilterText}>View all in My Shelf</Text>
                        </Pressable>
                        {group.items.map((item) => (
                          <StatsPopRow key={item.collection_item_id} item={item} onPress={() => onOpenItem(item)} />
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        </>
      )}
    </ScreenFrame>
  );
}

function ShelfBreakdownScreen({
  session,
  onBack,
  onOpenFilter,
}: {
  session: Session;
  onBack: () => void;
  onOpenFilter: (filter: CollectionFilter) => void;
}) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [sharedItems, setSharedItems] = useState<SharedShelfCollectionItem[]>([]);
  const [sharedShelves, setSharedShelves] = useState<SharedShelf[]>([]);
  const [activeShelfId, setActiveShelfId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("all");
  const [busy, setBusy] = useState(true);
  const [groupMode, setGroupMode] = useState<StatsGroupMode>("franchise");
  const [sortMode, setSortMode] = useState<BreakdownSortMode>("value");
  const [searchText, setSearchText] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [rows, shelves] = await Promise.all([
        fetchUserCollectionItems(session.user.id),
        fetchMySharedShelves().catch(() => [] as SharedShelf[]),
      ]);
      const firstShelf = shelves[0] ?? null;
      const shelfRows = firstShelf ? await fetchSharedShelfCollectionItems(firstShelf.id) : [];

      setItems(rows);
      setSharedShelves(shelves);
      setActiveShelfId(firstShelf?.id ?? null);
      setSharedItems(shelfRows);
      setSelectedMemberId("all");
    } catch (error) {
      Alert.alert("Shelf Breakdown error", error instanceof Error ? error.message : "Unable to load your shelf breakdown.");
    } finally {
      setBusy(false);
    }
  }, [session.user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const activeShelf = useMemo(
    () => sharedShelves.find((shelf) => shelf.id === activeShelfId) ?? null,
    [activeShelfId, sharedShelves],
  );
  const memberTabs = useMemo(() => buildSharedStatsMembers(sharedItems), [sharedItems]);

  useEffect(() => {
    if (selectedMemberId !== "all" && !memberTabs.some((member) => member.id === selectedMemberId)) {
      setSelectedMemberId("all");
    }
  }, [memberTabs, selectedMemberId]);

  const selectedMember = memberTabs.find((member) => member.id === selectedMemberId) ?? memberTabs[0] ?? null;
  const breakdownItems = useMemo<StatsSourceItem[]>(() => {
    if (!activeShelf) return items;
    if (selectedMemberId === "all") return sharedItems;
    return sharedItems.filter((item) => (item.owner_user_id || item.user_id || "unknown") === selectedMemberId);
  }, [activeShelf, items, selectedMemberId, sharedItems]);

  const groups = useMemo(() => buildStatsGroups(breakdownItems, groupMode), [breakdownItems, groupMode]);

  const filteredGroups = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    const visible = term ? groups.filter((group) => group.name.toLowerCase().includes(term)) : groups;
    return [...visible].sort((a, b) => {
      if (sortMode === "count") {
        return b.count - a.count || b.value - a.value || a.name.localeCompare(b.name);
      }
      if (sortMode === "average") {
        return b.averageValue - a.averageValue || b.count - a.count || a.name.localeCompare(b.name);
      }
      return b.value - a.value || b.count - a.count || a.name.localeCompare(b.name);
    });
  }, [groups, searchText, sortMode]);

  const summary = useMemo(() => {
    const totalPops = breakdownItems.reduce((sum, item) => sum + quantityNumber(item.quantity), 0);
    const uniquePops = new Set(breakdownItems.map(duplicateShelfKey)).size;
    const totalValue = breakdownItems.reduce((sum, item) => sum + Number(item.total_value ?? 0), 0);
    const strongestGroup = [...groups].sort((a, b) => b.value - a.value)[0] ?? null;
    return { totalPops, uniquePops, totalValue, strongestGroup };
  }, [breakdownItems, groups]);

  const maxValue = Math.max(1, ...filteredGroups.map((group) => group.value));
  const filterKind = groupMode === "franchise" ? "franchise" : "setName";
  const title = groupMode === "franchise" ? "Franchises" : "Sets";
  const canOpenGroup = !activeShelf;
  const memberCount = Math.max(0, memberTabs.length - 1);
  const scopeName = activeShelf
    ? selectedMemberId === "all"
      ? activeShelf.name || "Shared Shelf"
      : `${selectedMember?.name ?? "Collector"}'s Shelf`
    : "My Shelf";
  const scopeCopy = activeShelf
    ? selectedMemberId === "all"
      ? `${integer(summary.totalPops)} Pops across ${integer(memberCount)} members, ${money(summary.totalValue)} total value.`
      : `${integer(summary.totalPops)} Pops from ${selectedMember?.name ?? "this member"}, ${money(summary.totalValue)} total value.`
    : `${integer(summary.totalPops)} Pops, ${integer(summary.uniquePops)} unique, ${money(summary.totalValue)} total value.`;

  return (
    <ScreenFrame title="Shelf Breakdown" onBack={onBack}>
      {busy ? (
        <ActivityIndicator color="#7e67f4" />
      ) : (
        <>
          <View style={styles.breakdownHero}>
            <Text style={styles.dashboardEyebrow}>{activeShelf ? "Shared shelf map" : "Shelf organizer"}</Text>
            <Text style={styles.dashboardSectionTitle}>{scopeName}</Text>
            <Text style={styles.dashboardSubtext}>{scopeCopy}</Text>
            {summary.strongestGroup ? (
              <View style={styles.breakdownHeroMetaRow}>
                <View style={styles.breakdownHeroTile}>
                  <Text style={styles.breakdownHeroLabel}>Top by value</Text>
                  <Text style={styles.breakdownHeroValue} numberOfLines={1}>
                    {summary.strongestGroup.name}
                  </Text>
                </View>
                <View style={styles.breakdownHeroTile}>
                  <Text style={styles.breakdownHeroLabel}>Avg pop</Text>
                  <Text style={styles.breakdownHeroValue}>{money(summary.strongestGroup.averageValue)}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {activeShelf && memberTabs.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.breakdownMemberTabs}>
              {memberTabs.map((member) => (
                <Pressable
                  key={member.id}
                  onPress={() => setSelectedMemberId(member.id)}
                  style={[styles.breakdownMemberTab, selectedMemberId === member.id && styles.breakdownMemberTabActive]}
                >
                  <Text style={styles.breakdownMemberTabName} numberOfLines={1}>
                    {member.name}
                  </Text>
                  <Text style={styles.breakdownMemberTabMeta}>{integer(member.count)} in shelf</Text>
                  <Text style={styles.breakdownMemberTabValue}>{money(member.value)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          <View style={styles.breakdownControls}>
            <View style={styles.segmentedControl}>
              {(["franchise", "set"] as const).map((mode) => (
                <Pressable
                  key={mode}
                  onPress={() => setGroupMode(mode)}
                  style={[styles.segmentButton, groupMode === mode && styles.segmentButtonActive]}
                >
                  <Text style={[styles.segmentText, groupMode === mode && styles.segmentTextActive]}>
                    {mode === "franchise" ? "Franchises" : "Sets"}
                  </Text>
                </Pressable>
              ))}
            </View>

            <NativeTextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={groupMode === "franchise" ? "Search franchises" : "Search sets"}
              placeholderTextColor="#8d96a3"
              style={styles.breakdownSearchInput}
            />

            <View style={styles.breakdownSortRow}>
              {([
                ["value", "Value"],
                ["count", "Pops"],
                ["average", "Avg"],
              ] as const).map(([mode, label]) => (
                <Pressable
                  key={mode}
                  onPress={() => setSortMode(mode)}
                  style={[styles.breakdownSortChip, sortMode === mode && styles.breakdownSortChipActive]}
                >
                  <Text style={[styles.breakdownSortText, sortMode === mode && styles.breakdownSortTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.dashboardInsightPanel}>
            <Text style={styles.dashboardSectionTitle}>{title} Breakdown</Text>
            <Text style={styles.mutedSmall}>
              {activeShelf ? "See how the shared shelf is shaped by franchise or set." : "Tap a row to open the matching shelf view."}
            </Text>

            {filteredGroups.length === 0 ? (
              <Text style={styles.mutedText}>No matching groups found.</Text>
            ) : (
              filteredGroups.map((group) => {
                const barWidth = `${Math.max(4, Math.min(100, (group.value / maxValue) * 100))}%` as `${number}%`;
                return (
                  <Pressable
                    key={group.key}
                    onPress={canOpenGroup ? () => onOpenFilter({ kind: filterKind, label: group.name, value: group.name }) : undefined}
                    style={({ pressed }) => [styles.breakdownGroupRow, pressed && canOpenGroup && styles.pressed]}
                  >
                    <View style={styles.flex}>
                      <View style={styles.breakdownGroupHeaderRow}>
                        <View style={styles.flex}>
                          <Text style={styles.breakdownGroupName} numberOfLines={1}>
                            {group.name}
                          </Text>
                          <Text style={styles.breakdownGroupMeta}>{integer(group.uniqueCount)} unique Pops</Text>
                        </View>
                        {canOpenGroup ? <Text style={styles.groupChevron}>View</Text> : null}
                      </View>
                      <View style={styles.breakdownMetricRow}>
                        <View style={styles.breakdownMetricTile}>
                          <Text style={styles.breakdownMetricLabel}>Pops</Text>
                          <Text style={styles.breakdownMetricValue} numberOfLines={1}>
                            {integer(group.count)}
                          </Text>
                        </View>
                        <View style={styles.breakdownMetricTile}>
                          <Text style={styles.breakdownMetricLabel}>Value</Text>
                          <Text style={styles.breakdownMetricValue} numberOfLines={1}>
                            {money(group.value)}
                          </Text>
                        </View>
                        <View style={styles.breakdownMetricTile}>
                          <Text style={styles.breakdownMetricLabel}>Avg</Text>
                          <Text style={styles.breakdownMetricValue} numberOfLines={1}>
                            {money(group.averageValue)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.breakdownBarTrack}>
                        <View style={[styles.breakdownBarFill, { width: barWidth }]} />
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </>
      )}
    </ScreenFrame>
  );
}

function ScanScreen({
  onBack,
  onManualAdd,
  onAdded,
}: {
  onBack: () => void;
  onManualAdd: () => void;
  onAdded: (item: CollectionItem) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [barcode, setBarcode] = useState("");
  const [lookup, setLookup] = useState<PopCatalog | null>(null);
  const [ownedVariant, setOwnedVariant] = useState("Common");
  const [ownedCondition, setOwnedCondition] = useState("Unknown");
  const [busy, setBusy] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [sharedShelfOwners, setSharedShelfOwners] = useState<ScanShelfOwner[]>([]);
  const [sharedShelfChecked, setSharedShelfChecked] = useState(false);
  const [sharedShelfBusy, setSharedShelfBusy] = useState(false);

  const resetScan = () => {
    setBarcode("");
    setLookup(null);
    setOwnedVariant("Common");
    setOwnedCondition("Unknown");
    setScanLocked(false);
    setSharedShelfOwners([]);
    setSharedShelfChecked(false);
    setSharedShelfBusy(false);
  };

  const findPop = async (value = barcode) => {
    const clean = value.trim();
    if (!clean) {
      Alert.alert("Enter a UPC", "Scan or type the barcode first.");
      return;
    }
    setBusy(true);
    setLookup(null);
    setSharedShelfOwners([]);
    setSharedShelfChecked(false);
    setSharedShelfBusy(false);
    const { data, error } = await supabase.functions.invoke("lookup_pop", { body: { barcode: clean } });
    setBusy(false);

    if (error) {
      Alert.alert("Lookup failed", await getFunctionErrorMessage(error, clean));
      return;
    }

    const response = data as LookupResponse;
    if (!response.found || !response.pop) {
      Alert.alert("Pop not found", response.message ?? "Check the UPC and try again.");
      return;
    }

    const foundPop = response.pop;
    setLookup(foundPop);
    setOwnedVariant(foundPop.variant || "Common");
    setOwnedCondition("Unknown");
    setSharedShelfBusy(true);
    void fetchSharedShelfOwnersForPop(foundPop)
      .then(setSharedShelfOwners)
      .catch(() => setSharedShelfOwners([]))
      .finally(() => {
        setSharedShelfChecked(true);
        setSharedShelfBusy(false);
      });
  };

  const addToCollection = async (scanMore = false) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!lookup || !auth.user) return;

    setBusy(true);
    const selectedVariant = ownedVariant || "Common";
    const selectedCondition = ownedCondition || "Unknown";
    const { data: existingRows, error: existingError } = await supabase
      .from("user_collection_items")
      .select("id, quantity, condition, owned_variant")
      .eq("user_id", auth.user.id)
      .eq("pop_catalog_id", lookup.id);

    if (existingError) {
      setBusy(false);
      Alert.alert("Duplicate check failed", existingError.message);
      return;
    }

    const matchingRow = existingRows?.find((row) => {
      const rowVariant = String(row.owned_variant || "Common").trim().toLowerCase();
      const rowCondition = String(row.condition || "Unknown").trim().toLowerCase();
      return rowVariant === selectedVariant.trim().toLowerCase() && rowCondition === selectedCondition.trim().toLowerCase();
    });

    const addNewShelfItem = async () =>
      supabase
        .from("user_collection_items")
        .insert({
          user_id: auth.user.id,
          pop_catalog_id: lookup.id,
          quantity: 1,
          condition: selectedCondition,
          owned_variant: selectedVariant,
          current_value: lookup.estimated_value ?? 0,
          purchase_price: 0,
        })
        .select("id")
        .single();

    const finishAdd = async (collectionItemId: string, addedMessage?: string) => {
      const { data: item, error: itemError } = await supabase
        .from("user_collection_view")
        .select("*")
        .eq("collection_item_id", collectionItemId)
        .single();

      setBusy(false);
      if (itemError) {
        Alert.alert("Added", "The Pop was added, but the detail screen could not load.");
        if (scanMore) {
          resetScan();
          openScanner();
        }
        return;
      }
      if (scanMore) {
        resetScan();
        Alert.alert("Added to shelf", addedMessage ?? `${compactName(lookup.pop_name)} was added. Ready for the next scan.`);
        openScanner();
        return;
      }
      onAdded({
        ...(item as CollectionItem),
        display_description: (item as CollectionItem).display_description ?? lookup.display_description,
        display_variant: (item as CollectionItem).display_variant ?? lookup.variant,
        variant: (item as CollectionItem).variant ?? lookup.variant,
      });
    };

    const insertNew = async () => {
      const { data, error } = await addNewShelfItem();
      if (error) {
        setBusy(false);
        Alert.alert("Could not add Pop", error.message);
        return;
      }
      await finishAdd(data.id);
    };

    const addAnotherCopy = async () => {
      if (!matchingRow) return;
      const nextQuantity = Math.max(Number(matchingRow.quantity) || 1, 1) + 1;
      const { error } = await supabase
        .from("user_collection_items")
        .update({ quantity: nextQuantity })
        .eq("id", matchingRow.id);
      if (error) {
        setBusy(false);
        Alert.alert("Could not update quantity", error.message);
        return;
      }
      await finishAdd(matchingRow.id, `${compactName(lookup.pop_name)} quantity is now ${nextQuantity}. Ready for the next scan.`);
    };

    if (matchingRow) {
      setBusy(false);
      const message = `${compactName(lookup.pop_name)} (${selectedVariant}, ${selectedCondition}) is already on your shelf. Add another copy?`;
      if (IS_WEB && typeof window !== "undefined") {
        if (window.confirm(message)) {
          setBusy(true);
          await addAnotherCopy();
        }
        return;
      }

      Alert.alert("Already on shelf", message, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add Another",
          onPress: async () => {
            setBusy(true);
            await addAnotherCopy();
          },
        },
      ]);
      return;
    }

    if (existingRows?.length) {
      setBusy(false);
      const ownedCopies = existingRows.map((row) => `${row.owned_variant || "Common"} / ${row.condition || "Unknown"}`).join(", ");
      const message = `You already own this Pop as ${ownedCopies}. Add ${selectedVariant} / ${selectedCondition} as another shelf copy?`;
      if (IS_WEB && typeof window !== "undefined") {
        if (window.confirm(message)) {
          setBusy(true);
          await insertNew();
        }
        return;
      }

      Alert.alert("Possible variant match", message, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add Copy",
          onPress: async () => {
            setBusy(true);
            await insertNew();
          },
        },
      ]);
      return;
    }

    await insertNew();
  };

  const addToWishlist = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!lookup || !auth.user) return;

    setWishlistBusy(true);
    const { data: existing, error: existingError } = await supabase
      .from("wishlist_items")
      .select("id")
      .eq("user_id", auth.user.id)
      .eq("pop_catalog_id", lookup.id)
      .maybeSingle();

    if (existingError) {
      setWishlistBusy(false);
      Alert.alert("Wishlist check failed", existingError.message);
      return;
    }

    if (existing) {
      setWishlistBusy(false);
      Alert.alert("Already on wishlist", `${compactName(lookup.pop_name)} is already waiting on your wishlist.`);
      return;
    }

    const wishlistNotes = isMeaningfulVariant(ownedVariant) ? `Variant: ${ownedVariant}` : null;
    const { error } = await supabase.from("wishlist_items").insert({
      user_id: auth.user.id,
      pop_catalog_id: lookup.id,
      priority: "Medium",
      notes: wishlistNotes,
    });

    setWishlistBusy(false);
    if (error) {
      Alert.alert("Could not add to wishlist", error.message);
      return;
    }

    Alert.alert("Added to wishlist", `${compactName(lookup.pop_name)} is now on your wishlist.`);
  };

  const openScanner = async () => {
    if (IS_WEB) {
      setScanLocked(false);
      setScannerOpen(true);
      return;
    }

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Camera needed", "Allow camera access to scan barcodes.");
        return;
      }
    }
    setScanLocked(false);
    setScannerOpen(true);
  };

  return (
    <ScreenFrame title="Scan Pop" onBack={onBack}>
      {scannerOpen ? (
        IS_WEB ? (
          <WebBarcodeScanner
            locked={scanLocked}
            onCancel={() => setScannerOpen(false)}
            onCode={(code) => {
              if (scanLocked) return;
              setScanLocked(true);
              setScannerOpen(false);
              setBarcode(code);
              findPop(code);
            }}
          />
        ) : (
          <View style={styles.cameraWrap}>
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ["upc_a", "upc_e", "ean13", "ean8"] }}
              onBarcodeScanned={(result) => {
                if (scanLocked) return;
                setScanLocked(true);
                setScannerOpen(false);
                setBarcode(result.data);
                findPop(result.data);
              }}
            />
            <SecondaryButton label="Cancel Scan" onPress={() => setScannerOpen(false)} />
          </View>
        )
      ) : (
        <>
          <View style={styles.panel}>
            <Text style={styles.centerTitle}>Scan or enter UPC</Text>
            <PrimaryButton label="Scan Barcode" onPress={openScanner} />
            <TextInput
              keyboardType="number-pad"
              value={barcode}
              onChangeText={setBarcode}
              placeholder="Enter UPC"
              placeholderTextColor="#8c95a3"
              style={styles.input}
            />
            <PrimaryButton label={busy ? "Finding..." : "Find Pop"} onPress={() => findPop()} disabled={busy} />
            <SecondaryButton label="Add Loose Pop" onPress={onManualAdd} disabled={busy} />
          </View>
          {lookup && (
            <View style={styles.panel}>
              <Text style={styles.centerTitle}>Pop Found</Text>
              <Text style={styles.resultName}>{compactName(lookup.pop_name)}</Text>
              <Text style={styles.mutedText}>{lookup.upc}</Text>
              <LimitedBadge item={lookup} />
              <Text style={styles.scanValueText}>Estimated value: {money(lookup.estimated_value)}</Text>
              {lookup.image_url ? <Image source={{ uri: lookup.image_url }} style={styles.resultImage} /> : null}
              <View style={styles.scanShelfMatchBox}>
                <View style={styles.scanShelfMatchHeader}>
                  <Text style={styles.scanShelfMatchTitle}>Shared Shelf Check</Text>
                  <View
                    style={[
                      styles.scanShelfMatchBadge,
                      sharedShelfBusy
                        ? styles.scanShelfMatchBadgeChecking
                        : sharedShelfOwners.length > 0
                          ? styles.scanShelfMatchBadgeOwned
                          : styles.scanShelfMatchBadgeClear,
                    ]}
                  >
                    <Text style={styles.scanShelfMatchBadgeText}>
                      {sharedShelfBusy ? "Checking" : sharedShelfOwners.length > 0 ? "Found" : "Open"}
                    </Text>
                  </View>
                </View>
                {sharedShelfBusy ? (
                  <Text style={styles.scanShelfMatchText}>Checking who already has this Pop...</Text>
                ) : sharedShelfOwners.length > 0 ? (
                  <>
                    <Text style={styles.scanShelfMatchText}>Already on this shared shelf:</Text>
                    <View style={styles.scanShelfOwnerWrap}>
                      {sharedShelfOwners.map((owner) => (
                        <View key={owner.key} style={styles.scanShelfOwnerPill}>
                          <Text style={styles.scanShelfOwnerName}>
                            {owner.name}
                            {owner.quantity > 1 ? ` x${owner.quantity}` : ""}
                          </Text>
                          {owner.variant !== "Common" ? <Text style={styles.scanShelfOwnerVariant}>{owner.variant}</Text> : null}
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={styles.scanShelfMatchText}>
                    {sharedShelfChecked ? "No one on this shared shelf has it yet." : "Checking shared shelf ownership..."}
                  </Text>
                )}
              </View>
              <Label>Your copy</Label>
              <VariantPicker value={ownedVariant} onChange={setOwnedVariant} />
              <Text style={styles.mutedSmall}>Pick Chase or another variant if this UPC can represent more than one version.</Text>
              <Label>Condition</Label>
              <ConditionPicker value={ownedCondition} onChange={setOwnedCondition} />
              <Text style={styles.mutedSmall}>Use Out of Box when the figure is loose or the box is not part of the shelf item.</Text>
              <PrimaryButton label={busy ? "Adding..." : "Add to Collection"} onPress={() => addToCollection(false)} disabled={busy || wishlistBusy} />
              <SecondaryButton label={busy ? "Adding..." : "Add & Scan Another"} onPress={() => addToCollection(true)} disabled={busy || wishlistBusy} />
              <SecondaryButton label={wishlistBusy ? "Saving..." : "Add to Wishlist"} onPress={addToWishlist} disabled={busy || wishlistBusy} />
            </View>
          )}
        </>
      )}
    </ScreenFrame>
  );
}

function ManualAddScreen({ onBack, onAdded }: { onBack: () => void; onAdded: (item: CollectionItem) => void }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PopCatalog[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<PopCatalog | null>(null);
  const [popName, setPopName] = useState("");
  const [franchise, setFranchise] = useState("");
  const [setName, setSetName] = useState("");
  const [number, setNumber] = useState("");
  const [variant, setVariant] = useState("Common");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [notes, setNotes] = useState("");

  const loadCollectionItem = async (collectionItemId: string, fallback?: PopCatalog | null) => {
    const { data, error } = await supabase
      .from("user_collection_view")
      .select("*")
      .eq("collection_item_id", collectionItemId)
      .single();

    if (error) {
      Alert.alert("Added", "The loose Pop was added, but the detail screen could not load.");
      onBack();
      return;
    }

    onAdded({
      ...(data as CollectionItem),
      display_description: (data as CollectionItem).display_description ?? fallback?.display_description ?? null,
      display_variant: (data as CollectionItem).display_variant ?? fallback?.variant ?? variant,
      variant: (data as CollectionItem).variant ?? fallback?.variant ?? variant,
    });
  };

  const searchCatalog = async () => {
    const term = search.trim().replace(/[%,]/g, " ");
    if (term.length < 2) {
      Alert.alert("Search needed", "Enter a name, franchise, set, or box number.");
      return;
    }

    setSearching(true);
    const { data, error } = await supabase
      .from("pop_catalog")
      .select("id,upc,pop_name,character,franchise,number,variant,exclusivity,pop_style,set_name,image_url,vault_status,estimated_value,display_description,limited_edition,limited_count,edition_notes")
      .or(`pop_name.ilike.%${term}%,character.ilike.%${term}%,franchise.ilike.%${term}%,set_name.ilike.%${term}%,number.ilike.%${term}%`)
      .order("pop_name", { ascending: true })
      .limit(20);
    setSearching(false);

    if (error) {
      Alert.alert("Catalog search failed", error.message);
      return;
    }

    setResults((data ?? []) as PopCatalog[]);
    if (!data?.length) {
      Alert.alert("No catalog match", "You can create a manual loose Pop below.");
    }
  };

  const addExistingCatalogItem = async (catalog: PopCatalog) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    setSaving(true);
    const selectedVariant = variant || catalog.variant || "Common";
    const { data: existingRows, error: existingError } = await supabase
      .from("user_collection_items")
      .select("id, quantity, condition, owned_variant")
      .eq("user_id", auth.user.id)
      .eq("pop_catalog_id", catalog.id);

    if (existingError) {
      setSaving(false);
      Alert.alert("Duplicate check failed", existingError.message);
      return;
    }

    const matchingRow = existingRows?.find((row) => {
      const rowVariant = String(row.owned_variant || "Common").trim().toLowerCase();
      const rowCondition = String(row.condition || "Unknown").trim().toLowerCase();
      return rowVariant === selectedVariant.trim().toLowerCase() && rowCondition === "out of box";
    });

    if (matchingRow) {
      const nextQuantity = Math.max(Number(matchingRow.quantity) || 1, 1) + 1;
      const { error } = await supabase.from("user_collection_items").update({ quantity: nextQuantity }).eq("id", matchingRow.id);
      setSaving(false);
      if (error) {
        Alert.alert("Could not update quantity", error.message);
        return;
      }
      await loadCollectionItem(matchingRow.id, catalog);
      return;
    }

    const { data, error } = await supabase
      .from("user_collection_items")
      .insert({
        user_id: auth.user.id,
        pop_catalog_id: catalog.id,
        quantity: 1,
        condition: "Out of Box",
        owned_variant: selectedVariant,
        current_value: catalog.estimated_value ?? null,
        purchase_price: 0,
        notes: notes.trim() || null,
      })
      .select("id")
      .single();
    setSaving(false);

    if (error) {
      Alert.alert("Could not add loose Pop", error.message);
      return;
    }

    await loadCollectionItem(data.id, catalog);
  };

  const createManualLoosePop = async () => {
    const cleanName = popName.trim();
    if (!cleanName) {
      Alert.alert("Name needed", "Add at least the Pop name before creating a manual loose item.");
      return;
    }

    const parsedValue = estimatedValue.trim() ? Number(estimatedValue) : null;
    if (parsedValue != null && !Number.isFinite(parsedValue)) {
      Alert.alert("Value needs a number", "Use a simple dollar amount like 12.50.");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase.rpc("create_manual_out_of_box_item", {
      pop_name_input: cleanName,
      franchise_input: franchise.trim() || null,
      set_name_input: setName.trim() || null,
      number_input: number.trim() || null,
      variant_input: variant || "Common",
      estimated_value_input: parsedValue,
      notes_input: notes.trim() || null,
    });
    setSaving(false);

    if (error) {
      Alert.alert("Could not create loose Pop", error.message);
      return;
    }

    await loadCollectionItem(data as string, null);
  };

  return (
    <ScreenFrame title="Add Loose Pop" onBack={onBack}>
      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Search catalog first</Text>
        <Text style={styles.mutedText}>Best for out-of-box Pops when you know the character, set, franchise, or box number.</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Example: Boba Fett 297"
          placeholderTextColor="#8c95a3"
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={searchCatalog}
        />
        <PrimaryButton label={searching ? "Searching..." : "Search Catalog"} onPress={searchCatalog} disabled={searching || saving} />
      </View>

      {results.length ? (
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Pick a catalog match</Text>
          <Text style={styles.mutedSmall}>These will be added to your shelf with condition set to Out of Box.</Text>
          {results.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                setSelectedCatalog(item);
                setVariant(item.variant || "Common");
              }}
              style={[styles.catalogResultRow, selectedCatalog?.id === item.id && styles.catalogResultRowActive]}
            >
              {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.catalogResultImage} /> : <View style={styles.catalogResultImagePlaceholder} />}
              <View style={styles.flex}>
                <Text style={styles.itemTitle} numberOfLines={2}>{compactName(item.pop_name)}</Text>
                <Text style={styles.mutedSmall} numberOfLines={1}>{[item.franchise, item.set_name, item.number ? `#${item.number}` : null].filter(Boolean).join("  ")}</Text>
                <Text style={styles.itemDetailLine}>{money(item.estimated_value)}</Text>
              </View>
            </Pressable>
          ))}
          {selectedCatalog ? (
            <>
              <Label>Variant</Label>
              <VariantPicker value={variant} onChange={setVariant} />
              <Label>Notes</Label>
              <TextInput value={notes} onChangeText={setNotes} placeholder="Optional note" placeholderTextColor="#8c95a3" style={styles.input} />
              <PrimaryButton label={saving ? "Adding..." : "Add Selected Out of Box"} onPress={() => addExistingCatalogItem(selectedCatalog)} disabled={saving || searching} />
            </>
          ) : null}
        </View>
      ) : null}

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Create manual loose Pop</Text>
        <Text style={styles.mutedSmall}>Use this only when the catalog search does not find a match.</Text>
        <Label>Pop name</Label>
        <TextInput value={popName} onChangeText={setPopName} placeholder="Character or product name" placeholderTextColor="#8c95a3" style={styles.input} />
        <View style={styles.detailTwoColumn}>
          <View style={styles.flex}>
            <Label>Franchise</Label>
            <TextInput value={franchise} onChangeText={setFranchise} placeholder="DC, Marvel, Disney" placeholderTextColor="#8c95a3" style={styles.input} />
          </View>
          <View style={styles.flex}>
            <Label>Number</Label>
            <TextInput value={number} onChangeText={setNumber} placeholder="# optional" placeholderTextColor="#8c95a3" style={styles.input} />
          </View>
        </View>
        <Label>Set name</Label>
        <TextInput value={setName} onChangeText={setSetName} placeholder="Optional set" placeholderTextColor="#8c95a3" style={styles.input} />
        <Label>Variant</Label>
        <VariantPicker value={variant} onChange={setVariant} />
        <Label>Estimated value ($)</Label>
        <TextInput value={estimatedValue} onChangeText={setEstimatedValue} keyboardType="decimal-pad" placeholder="Optional" placeholderTextColor="#8c95a3" style={styles.input} />
        <Label>Notes</Label>
        <TextInput value={notes} onChangeText={setNotes} placeholder="Optional note" placeholderTextColor="#8c95a3" style={styles.input} />
        <PrimaryButton label={saving ? "Creating..." : "Create Out-of-Box Shelf Item"} onPress={createManualLoosePop} disabled={saving || searching} />
      </View>
    </ScreenFrame>
  );
}

function CollectionScreen({
  session,
  onBack,
  initialFilter,
  onShelfStats,
  statsLabel,
  onOpenItem,
}: {
  session: Session;
  onBack: () => void;
  initialFilter: CollectionFilter;
  onShelfStats: () => void;
  statsLabel: string;
  onOpenItem: (item: CollectionItem) => void;
}) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("Newest first");
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>(initialFilter);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const rows = await fetchUserCollectionItems(session.user.id);
      setItems(rows);
    } catch (error) {
      Alert.alert("Collection error", error instanceof Error ? error.message : "Unable to load your shelf.");
    } finally {
      setBusy(false);
    }
  }, [session.user.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const duplicateShelfKeys = buildDuplicateShelfKeys(items);
    const sliced = items.filter((item) => matchesCollectionFilter(item, activeFilter, duplicateShelfKeys));
    const filtered = term
      ? sliced.filter((item) =>
          [item.pop_name, item.character, item.franchise, item.upc, item.number].some((value) =>
            String(value ?? "").toLowerCase().includes(term),
          ),
        )
      : [...sliced];

    if (sort === "Name A-Z") {
      filtered.sort((a, b) => compactName(a.pop_name).localeCompare(compactName(b.pop_name)));
    }
    if (sort === "Value high-low") {
      filtered.sort((a, b) => Number(perPopValue(b) ?? 0) - Number(perPopValue(a) ?? 0));
    }
    if (sort === "Gain/Loss high-low") {
      filtered.sort((a, b) => Number(b.gain_loss ?? 0) - Number(a.gain_loss ?? 0));
    }
    return filtered;
  }, [items, search, sort, activeFilter]);

  return (
    <ScreenFrame title="My Shelf" onBack={onBack} rightLabel={statsLabel} onRight={onShelfStats} scroll={false}>
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.collection_item_id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={!IS_WEB}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View style={styles.collectionStickyHeader}>
            <View style={styles.row}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search collection"
                placeholderTextColor="#8c95a3"
                style={[styles.input, styles.flex]}
              />
              <Pressable
                style={styles.sortButton}
                onPress={() => {
                  const index = SORTS.indexOf(sort);
                  setSort(SORTS[(index + 1) % SORTS.length]);
                }}
              >
                <Text style={styles.sortText}>{sort}</Text>
              </Pressable>
            </View>
            {activeFilter.kind !== "none" ? (
              <View style={styles.activeFilterRow}>
                <Text style={styles.activeFilterText} numberOfLines={1}>
                  Showing: {activeFilter.label}
                </Text>
                <Pressable onPress={() => setActiveFilter(NO_COLLECTION_FILTER)} style={styles.clearFilterButton}>
                  <Text style={styles.clearFilterText}>Clear</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          busy ? (
            <ActivityIndicator color="#7e67f4" />
          ) : (
            <View style={styles.panel}>
              <Text style={styles.centerTitle}>No Pops yet</Text>
              <Text style={styles.mutedText}>Scan or enter a UPC to add your first Pop.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => onOpenItem(item)} style={styles.collectionCard}>
            {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.thumb} /> : <View style={styles.thumbPlaceholder} />}
            <View style={styles.collectionMiddle}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {compactName(item.pop_name)}
              </Text>
              <Text style={styles.mutedText} numberOfLines={1}>
                {compactName(item.set_name || item.franchise)}
              </Text>
              {shelfMetaLine(item) ? (
                <Text style={styles.itemDetailLine} numberOfLines={1}>
                  {shelfMetaLine(item)}
                </Text>
              ) : null}
              <View style={styles.cardBadgeRow}>
                <VaultBadge item={item} compact />
                <LimitedBadge item={item} compact />
              </View>
              <Text style={styles.itemMeta}>Qty: {integer(item.quantity)}</Text>
            </View>
            <View style={styles.valueColumn}>
              <Text style={styles.mutedSmall}>Value</Text>
              <Text style={styles.itemMoney} adjustsFontSizeToFit numberOfLines={1}>
                {money(perPopValue(item))}
              </Text>
              {quantityNumber(item.quantity) > 1 ? (
                <>
                  <Text style={styles.mutedSmall}>Total</Text>
                  <Text style={styles.itemMoneySmall} adjustsFontSizeToFit numberOfLines={1}>
                    {money(item.total_value)}
                  </Text>
                </>
              ) : null}
              <Text style={styles.mutedSmall}>Paid</Text>
              <Text style={styles.itemMoney} adjustsFontSizeToFit numberOfLines={1}>
                {money(item.total_cost)}
              </Text>
              <Text style={styles.mutedSmall}>Gain/Loss</Text>
              <Text style={gainLossColorStyle(item.gain_loss)} adjustsFontSizeToFit numberOfLines={1}>
                {money(item.gain_loss)}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </ScreenFrame>
  );
}

function SharedShelfScreen({ onBack, onOpenShelf }: { onBack: () => void; onOpenShelf: (shelf: SharedShelf) => void }) {
  const [shelves, setShelves] = useState<SharedShelf[]>([]);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("get_my_shared_shelves");
    setBusy(false);

    if (error) {
      Alert.alert("Shared Shelf error", error.message);
      return;
    }

    setShelves((data ?? []) as SharedShelf[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createShelf = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      Alert.alert("Name needed", "Give your Shared Shelf a name.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.rpc("create_shared_shelf", {
      shelf_name: cleanName,
      shelf_description: null,
    });
    setSaving(false);

    if (error) {
      Alert.alert("Could not create shelf", error.message);
      return;
    }

    setName("");
    await load();
  };

  const joinShelf = async () => {
    const cleanCode = inviteCode.trim();
    if (!cleanCode) {
      Alert.alert("Invite code needed", "Enter the invite code for the Shared Shelf.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.rpc("join_shared_shelf", { invite: cleanCode });
    setSaving(false);

    if (error) {
      Alert.alert("Could not join shelf", error.message);
      return;
    }

    setInviteCode("");
    await load();
  };

  return (
    <ScreenFrame title="Shared Shelf" onBack={onBack}>
      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Create a Shared Shelf</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Example: Platt Family"
          placeholderTextColor="#8c95a3"
          style={styles.input}
        />
        <PrimaryButton label={saving ? "Working..." : "Create Shelf"} onPress={createShelf} disabled={saving} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Join with Invite Code</Text>
        <TextInput
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="Invite code"
          autoCapitalize="characters"
          placeholderTextColor="#8c95a3"
          style={styles.input}
        />
        <SecondaryButton label={saving ? "Working..." : "Join Shelf"} onPress={joinShelf} disabled={saving} />
      </View>

      <Text style={styles.sectionTitle}>Your Shared Shelves</Text>
      {busy ? <ActivityIndicator color="#7e67f4" /> : null}
      {!busy && shelves.length === 0 ? (
        <View style={styles.panel}>
          <Text style={styles.centerTitle}>No Shared Shelves yet</Text>
          <Text style={styles.mutedText}>Create one for your household or join one with an invite code.</Text>
        </View>
      ) : null}
      {shelves.map((shelf) => (
        <Pressable key={shelf.id} onPress={() => onOpenShelf(shelf)} style={styles.shelfCard}>
          <View style={styles.flex}>
            <Text style={styles.itemTitle}>{shelf.name}</Text>
            <Text style={styles.mutedText} numberOfLines={2}>
              Members: {shelf.member_names?.trim() || "Just you"}
            </Text>
            <Text style={styles.mutedText}>Invite code: {shelf.invite_code}</Text>
          </View>
          <Text style={styles.selectChevron}>›</Text>
        </Pressable>
      ))}
    </ScreenFrame>
  );
}

function SharedShelfDetailScreen({
  shelf,
  session,
  onBack,
  onOpenProfile,
}: {
  shelf: SharedShelf;
  session: Session;
  onBack: () => void;
  onOpenProfile: (userId: string) => void;
}) {
  const [memberItems, setMemberItems] = useState<SharedShelfCollectionItem[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("Newest first");
  const [selectedOwner, setSelectedOwner] = useState<string>("all");
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);

    try {
      const data = await fetchSharedShelfCollectionItems(shelf.id);
      setMemberItems(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load shared shelf.";
      Alert.alert("Shared members error", message);
    } finally {
      setBusy(false);
    }
  }, [shelf.id]);

  useEffect(() => {
    load();
  }, [load]);

  const ownerTiles = useMemo(() => {
    const owners = new Map<string, { id: string; name: string; count: number; value: number }>();

    for (const item of memberItems) {
      const id = item.owner_user_id;
      const name = item.owner_display_name || "Collector";
      const existing = owners.get(id);
      if (existing) {
        existing.count += quantityNumber(item.quantity);
        existing.value += Number(item.total_value ?? 0);
      } else {
        owners.set(id, {
          id,
          name,
          count: quantityNumber(item.quantity),
          value: Number(item.total_value ?? 0),
        });
      }
    }

    return Array.from(owners.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [memberItems]);

  const allShelfItems = useMemo(() => groupSharedShelfItems(memberItems), [memberItems]);

  const shelfItems = useMemo(() => {
    if (selectedOwner === "all") return allShelfItems;
    return groupSharedShelfItems(memberItems.filter((item) => item.owner_user_id === selectedOwner));
  }, [allShelfItems, memberItems, selectedOwner]);

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? shelfItems.filter((item) =>
          [item.pop_name, item.character, item.franchise, item.upc, item.number, item.owner_names, item.variants_owned].some((value) =>
            String(value ?? "").toLowerCase().includes(term),
          ),
        )
      : [...shelfItems];

    if (sort === "Name A-Z") {
      filtered.sort((a, b) => compactName(a.pop_name).localeCompare(compactName(b.pop_name)));
    }
    if (sort === "Value high-low") {
      filtered.sort((a, b) => Number(b.total_value ?? 0) - Number(a.total_value ?? 0));
    }
    if (sort === "Gain/Loss high-low") {
      filtered.sort((a, b) => Number(b.gain_loss ?? 0) - Number(a.gain_loss ?? 0));
    }
    return filtered;
  }, [shelfItems, search, sort]);

  const topShelfPops = useMemo(
    () =>
      [...shelfItems]
        .filter((item) => Number(perPopValue(item) ?? 0) > 0)
        .sort((a, b) => Number(perPopValue(b) ?? 0) - Number(perPopValue(a) ?? 0))
        .slice(0, 2),
    [shelfItems],
  );

  const totalPops = shelfItems.reduce((sum, item) => sum + Number(item.total_quantity ?? 0), 0);
  const totalValue = shelfItems.reduce((sum, item) => sum + Number(item.total_value ?? 0), 0);
  const activeOwner = ownerTiles.find((owner) => owner.id === selectedOwner);
  const isAllOwners = selectedOwner === "all";
  const shelfTotalPops = allShelfItems.reduce((sum, item) => sum + Number(item.total_quantity ?? 0), 0);
  const shelfTotalValue = allShelfItems.reduce((sum, item) => sum + Number(item.total_value ?? 0), 0);
  const shelfAvgPopValue = shelfTotalPops > 0 ? shelfTotalValue / shelfTotalPops : 0;

  return (
    <ScreenFrame title={shelf.name} onBack={onBack} scroll={false}>
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.pop_catalog_id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={!IS_WEB}
        ListHeaderComponent={
          <>
            <View style={[styles.valueCard, styles.sharedShelfValueCard]}>
              <View style={styles.sharedShelfHeroRow}>
                <View style={styles.flex}>
                  <Text style={styles.cardLabel}>Shared Shelf Value</Text>
                  <Text style={styles.bigMoney} adjustsFontSizeToFit numberOfLines={1}>
                    {money(shelfTotalValue)}
                  </Text>
                  <Text style={styles.mutedText}>{integer(shelfTotalPops)} Pops across {integer(ownerTiles.length)} members</Text>
                </View>
              </View>
              {!isAllOwners && activeOwner ? (
                <View style={styles.sharedViewingRow}>
                  <View style={styles.flex}>
                    <Text style={styles.sharedViewingLabel}>Viewing {activeOwner.name}</Text>
                    <Text style={styles.mutedSmall}>{integer(totalPops)} Pops • {money(totalValue)} in shelf</Text>
                  </View>
                  <Pressable onPress={() => setSelectedOwner("all")} style={styles.sharedShelfClearButton}>
                    <Text style={styles.sharedShelfClearText}>Show all</Text>
                  </Pressable>
                  <Pressable onPress={() => onOpenProfile(activeOwner.id)} style={styles.sharedShelfProfileButton}>
                    <Text style={styles.sharedShelfProfileText}>View Profile</Text>
                  </Pressable>
                </View>
              ) : null}
              <View style={styles.sharedShelfSummaryGrid}>
                <View style={styles.sharedShelfSummaryTile}>
                  <Text style={styles.sharedShelfSummaryLabel}>Members</Text>
                  <Text style={styles.sharedShelfSummaryValue}>{integer(ownerTiles.length)}</Text>
                </View>
                <View style={styles.sharedShelfSummaryTile}>
                  <Text style={styles.sharedShelfSummaryLabel}>Avg Pop</Text>
                  <Text style={styles.sharedShelfSummaryValue}>{money(shelfAvgPopValue)}</Text>
                </View>
                <View style={styles.sharedShelfSummaryTile}>
                  <Text style={styles.sharedShelfSummaryLabel}>Invite</Text>
                  <Text selectable style={styles.sharedShelfInviteCode}>{shelf.invite_code}</Text>
                </View>
              </View>
            </View>

            {ownerTiles.length > 0 ? (
              <View style={styles.ownerSelectorPanel}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.ownerTileRow}
                >
                  <Pressable
                    onPress={() => setSelectedOwner("all")}
                    style={[styles.ownerTile, selectedOwner === "all" && styles.ownerTileActive]}
                  >
                    <Text style={styles.ownerTileName}>All</Text>
                    <Text style={styles.ownerTileMeta}>{integer(shelfTotalPops)} Pops</Text>
                    <Text style={styles.ownerTileValue}>{money(shelfTotalValue)}</Text>
                  </Pressable>
                  {ownerTiles.map((owner) => (
                    <Pressable
                      key={owner.id}
                      onPress={() => setSelectedOwner(owner.id)}
                      style={[styles.ownerTile, selectedOwner === owner.id && styles.ownerTileActive]}
                    >
                      <Text style={styles.ownerTileName} numberOfLines={1}>{owner.name}</Text>
                      <Text style={styles.ownerTileMeta}>{integer(owner.count)} Pops</Text>
                      <Text style={styles.ownerTileValue}>{money(owner.value)}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {topShelfPops.length > 0 ? (
              <View style={[styles.panel, styles.sharedTopPopsPanel]}>
                <View>
                  <Text style={styles.sectionTitle}>Top Pops</Text>
                  <Text style={styles.mutedSmall}>Highest individual values on this shelf</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topPopRow}>
                  {topShelfPops.map((item, index) => (
                    <View key={item.pop_catalog_id} style={styles.topPopCard}>
                      <View style={styles.topPopRank}>
                        <Text style={styles.topPopRankText}>#{index + 1}</Text>
                      </View>
                      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.topPopImage} /> : <View style={styles.topPopImagePlaceholder} />}
                      <View style={styles.flex}>
                        <Text style={styles.topPopName} numberOfLines={2}>
                          {compactName(item.pop_name)}
                        </Text>
                        <Text style={styles.mutedSmall} numberOfLines={1}>
                          {compactName(item.set_name || item.franchise)}
                        </Text>
                        <Text style={styles.topPopValue}>{money(perPopValue(item))}</Text>
                        <Text style={styles.mutedSmall} numberOfLines={1}>
                          {item.owner_names}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <View style={[styles.row, styles.sharedSearchRow]}>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search shared shelf"
                placeholderTextColor="#8c95a3"
                style={[styles.input, styles.flex]}
              />
              <Pressable
                style={styles.sortButton}
                onPress={() => {
                  const index = SORTS.indexOf(sort);
                  setSort(SORTS[(index + 1) % SORTS.length]);
                }}
              >
                <Text style={styles.sortText}>{sort}</Text>
              </Pressable>
            </View>

            {busy ? <ActivityIndicator color="#7e67f4" /> : null}
            {!busy && visibleItems.length === 0 ? (
              <View style={styles.panel}>
                <Text style={styles.centerTitle}>Nothing shared yet</Text>
                <Text style={styles.mutedText}>When members add Pops, they will show up here.</Text>
              </View>
            ) : null}
          </>
        }
        renderItem={({ item }) => {
          const totalQuantity = quantityNumber(item.total_quantity);
          const hasMultipleCopies = totalQuantity > 1;

          return (
            <View style={styles.collectionCard}>
              {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.thumb} /> : <View style={styles.thumbPlaceholder} />}
              <View style={styles.collectionMiddle}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {compactName(item.pop_name)}
                </Text>
                <Text style={styles.mutedText} numberOfLines={1}>
                  {compactName(item.set_name || item.franchise)}
                </Text>
                {shelfMetaLine(item) ? (
                  <Text style={styles.itemDetailLine} numberOfLines={1}>
                    {shelfMetaLine(item)}
                  </Text>
                ) : null}
                <Text style={styles.itemMeta}>In Shelf: {integer(totalQuantity)}</Text>
                <View style={styles.cardBadgeRow}>
                  <VaultBadge item={item} compact />
                  <LimitedBadge item={item} compact />
                </View>
                {item.variants_owned ? <Text style={styles.mutedSmall} numberOfLines={1}>Variants: {item.variants_owned}</Text> : null}
                <Text style={styles.ownerPill} numberOfLines={2}>Owned by: {item.owner_names}</Text>
              </View>
              <View style={styles.valueColumn}>
                <Text style={styles.mutedSmall}>{hasMultipleCopies ? "Each" : "Value"}</Text>
                <Text style={styles.itemMoney} adjustsFontSizeToFit numberOfLines={1}>
                  {money(perPopValue(item))}
                </Text>
                {hasMultipleCopies ? (
                  <>
                    <Text style={styles.mutedSmall}>Shelf total</Text>
                    <Text style={styles.itemMoneySmall} adjustsFontSizeToFit numberOfLines={1}>
                      {money(item.total_value)}
                    </Text>
                  </>
                ) : null}
                <Text style={styles.mutedSmall}>Paid</Text>
                <Text style={styles.itemMoney} adjustsFontSizeToFit numberOfLines={1}>
                  {money(item.total_cost)}
                </Text>
                <Text style={styles.mutedSmall}>Gain</Text>
                <Text style={gainLossColorStyle(item.gain_loss)} adjustsFontSizeToFit numberOfLines={1}>
                  {money(item.gain_loss)}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </ScreenFrame>
  );
}

function WebBarcodeScanner({
  locked,
  onCode,
  onCancel,
}: {
  locked: boolean;
  onCode: (code: string) => void;
  onCancel: () => void;
}) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const controlsRef = React.useRef<BrowserScannerControls | null>(null);
  const [message, setMessage] = useState("Starting camera...");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia || !videoRef.current) {
          setMessage("This browser does not expose camera access here. Use Expo Go or enter the UPC manually.");
          return;
        }

        const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
          import("@zxing/browser"),
          import("@zxing/library"),
        ]);
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
        ]);

        const reader = new BrowserMultiFormatReader(hints);
        setMessage("Point the camera at the UPC barcode.");

        const controls = await reader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          },
          videoRef.current,
          (result) => {
            const code = result?.getText()?.trim();
            if (!cancelled && !locked && code) {
              controlsRef.current?.stop();
              onCode(code);
            }
          },
        );
        controlsRef.current = controls;
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Camera access was blocked.";
        setMessage(`Camera did not open: ${detail}`);
      }
    }

    start();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [locked, onCode]);

  return (
    <View style={styles.cameraWrap}>
      <View style={styles.webCameraFrame}>
        {React.createElement("video" as never, {
          ref: videoRef,
          style: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 8,
            backgroundColor: "#000",
          },
        })}
      </View>
      <Text style={styles.mutedText}>{message}</Text>
      <SecondaryButton label="Cancel Scan" onPress={onCancel} />
    </View>
  );
}

function ItemDetailScreen({
  item,
  onBack,
  onUpdated,
  onSaved,
}: {
  item: CollectionItem;
  onBack: () => void;
  onUpdated: (item: CollectionItem) => void;
  onSaved: () => void;
}) {
  const [quantity, setQuantity] = useState(String(item.quantity ?? 1));
  const [condition, setCondition] = useState(item.condition ?? "Unknown");
  const [ownedVariant, setOwnedVariant] = useState(item.owned_variant ?? item.display_variant ?? "");
  const [purchasePrice, setPurchasePrice] = useState(item.purchase_price == null ? "" : String(item.purchase_price));
  const [currentValue, setCurrentValue] = useState(item.current_value == null ? "" : String(item.current_value));
  const [notes, setNotes] = useState(item.notes ?? "");
  const [forTrade, setForTrade] = useState(Boolean(item.for_trade));
  const [forSale, setForSale] = useState(Boolean(item.for_sale));
  const [limitedCount, setLimitedCount] = useState(item.limited_count == null ? "" : String(item.limited_count));
  const [busy, setBusy] = useState(false);
  const detailGainLoss = Number(item.gain_loss ?? 0);

  const reload = async () => {
    const { data, error } = await supabase
      .from("user_collection_view")
      .select("*")
      .eq("collection_item_id", item.collection_item_id)
      .single();
    if (!error && data) onUpdated(data as CollectionItem);
  };

  const save = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("user_collection_items")
      .update({
        quantity: Number(quantity) || 1,
        condition,
        owned_variant: ownedVariant.trim() ? ownedVariant.trim() : null,
        purchase_price: purchasePrice ? Number(purchasePrice) : null,
        current_value: currentValue ? Number(currentValue) : null,
        notes,
        for_trade: forTrade,
        for_sale: forSale,
      })
      .eq("id", item.collection_item_id);
    setBusy(false);
    if (error) {
      Alert.alert("Save failed", error.message);
      return;
    }

    if (item.limited_edition || limitedCount.trim()) {
      const parsedLimitedCount = limitedCount.trim() ? Number(limitedCount) : null;
      if (parsedLimitedCount == null || Number.isFinite(parsedLimitedCount)) {
        await supabase.rpc("update_pop_limited_count", {
          collection_item_id: item.collection_item_id,
          limited_count_value: parsedLimitedCount,
        });
      }
    }

    await reload();
    onSaved();
  };

  const refreshValue = async () => {
    if (!item.upc) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("lookup_pop", { body: { barcode: item.upc, forceRefresh: true } });
    if (error) {
      setBusy(false);
      Alert.alert("Refresh failed", await getFunctionErrorMessage(error, item.upc));
      return;
    }
    const response = data as LookupResponse;
    const nextValue = response.pop?.estimated_value;
    if (nextValue != null) {
      setCurrentValue(String(nextValue));
      await supabase.from("user_collection_items").update({ current_value: nextValue }).eq("id", item.collection_item_id);
      await reload();
    }
    setBusy(false);
  };

  const removeFromShelf = async (sold = false) => {
    const currentQuantity = Math.max(Number(quantity) || 1, 1);
    const title = sold ? "Mark as sold?" : "Remove from shelf?";
    const actionText = currentQuantity > 1 ? "This will reduce the quantity by 1." : "This will remove the Pop from your active shelf.";
    const message = sold
      ? `${actionText} Sold history can be added in a future update.`
      : actionText;
    const actionLabel = sold ? "Mark Sold" : currentQuantity > 1 ? "Remove 1" : "Remove";

    const runRemoval = async () => {
      setBusy(true);
      const result =
        currentQuantity > 1
          ? await supabase
              .from("user_collection_items")
              .update({ quantity: currentQuantity - 1 })
              .eq("id", item.collection_item_id)
          : await supabase.from("user_collection_items").delete().eq("id", item.collection_item_id);
      setBusy(false);

      if (result.error) {
        Alert.alert(sold ? "Could not mark sold" : "Remove failed", result.error.message);
        return;
      }

      if (currentQuantity > 1) {
        setQuantity(String(currentQuantity - 1));
        await reload();
      } else {
        onSaved();
      }
    };

    if (IS_WEB && typeof window !== "undefined") {
      if (window.confirm(`${title}\n\n${message}`)) {
        await runRemoval();
      }
      return;
    }

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: actionLabel,
        style: "destructive",
        onPress: runRemoval,
      },
    ]);
  };

  return (
    <ScreenFrame title="Item Details" onBack={onBack}>
      <View style={styles.detailHero}>
        <View style={styles.detailHeroTop}>
          {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.detailHeroImage} /> : <View style={styles.detailHeroImagePlaceholder} />}
          <View style={styles.detailHeroCopy}>
            <Text style={styles.dashboardEyebrow}>Shelf item</Text>
            <Text style={styles.detailTitle}>{compactName(item.pop_name)}</Text>
            {item.set_name ? <Text style={styles.detailFranchise}>{item.set_name}</Text> : null}
            <Text style={styles.detailMeta} numberOfLines={2}>
              {[item.franchise, item.number ? `#${item.number}` : null, item.display_variant].filter(Boolean).join("  ")}
            </Text>
            <Text style={styles.mutedSmall}>UPC: {item.upc ?? "--"}</Text>
            <View style={styles.cardBadgeRow}>
              <VaultBadge item={item} compact />
              <LimitedBadge item={item} compact />
            </View>
          </View>
        </View>
        {item.display_description ? (
          <Text style={styles.detailDescription} numberOfLines={4}>
            {item.display_description}
          </Text>
        ) : null}
        <View style={styles.detailValueGrid}>
          <View style={styles.detailValueTile}>
            <Text style={styles.dashboardInsightLabel}>Value</Text>
            <Text style={styles.detailValueText}>{money(item.total_value ?? item.current_value ?? item.estimated_value)}</Text>
          </View>
          <View style={styles.detailValueTile}>
            <Text style={styles.dashboardInsightLabel}>Paid</Text>
            <Text style={styles.detailValueText}>{money(item.total_cost ?? item.purchase_price)}</Text>
          </View>
          <View style={styles.detailValueTile}>
            <Text style={styles.dashboardInsightLabel}>Gain/Loss</Text>
            <Text style={[styles.detailValueText, gainLossColorStyle(detailGainLoss)]}>{money(detailGainLoss)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailSection}>
        <View>
          <Text style={styles.dashboardSectionTitle}>Shelf Details</Text>
          <Text style={styles.mutedSmall}>Track condition, variant, and quantity for this shelf item.</Text>
        </View>
        <View style={styles.detailTwoColumn}>
          <View style={styles.flex}>
            <Label>Quantity</Label>
            <TextInput value={quantity} onChangeText={setQuantity} keyboardType="number-pad" style={styles.input} />
          </View>
          <View style={styles.flex}>
            <Label>Condition</Label>
            <ConditionPicker value={condition} onChange={setCondition} />
          </View>
        </View>
        <Label>Variant</Label>
        <VariantPicker value={ownedVariant} onChange={setOwnedVariant} />
        {(item.limited_edition || limitedCount.trim()) ? (
          <>
            <Label>Limited count</Label>
            <TextInput
              value={limitedCount}
              onChangeText={setLimitedCount}
              keyboardType="number-pad"
              placeholder="Pieces made"
              placeholderTextColor="#8c95a3"
              style={styles.input}
            />
          </>
        ) : null}
      </View>

      <View style={styles.detailSection}>
        <View>
          <Text style={styles.dashboardSectionTitle}>Value Tools</Text>
          <Text style={styles.mutedSmall}>Keep your estimate fresh using the current pricing source.</Text>
        </View>
        <View style={styles.detailTwoColumn}>
          <View style={styles.flex}>
            <Label>Purchase Price ($)</Label>
            <TextInput value={purchasePrice} onChangeText={setPurchasePrice} keyboardType="decimal-pad" style={styles.input} />
          </View>
          <View style={styles.flex}>
            <Label>Current Value ($)</Label>
            <TextInput value={currentValue} onChangeText={setCurrentValue} keyboardType="decimal-pad" style={styles.input} />
          </View>
        </View>
        <PrimaryButton label="Refresh Value" onPress={refreshValue} disabled={busy} />
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.dashboardSectionTitle}>Shelf Flags</Text>
        <ToggleRow label="For Trade" value={forTrade} onValueChange={setForTrade} />
        <ToggleRow label="For Sale" value={forSale} onValueChange={setForSale} />
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.dashboardSectionTitle}>Notes</Text>
        <TextInput value={notes} onChangeText={setNotes} multiline style={[styles.input, styles.notes]} />
      </View>

      <PrimaryButton label={busy ? "Saving..." : "Save Changes"} onPress={save} disabled={busy} />
      <View style={styles.detailDangerSection}>
        <Text style={styles.dashboardSectionTitle}>Shelf Actions</Text>
        <Text style={styles.mutedSmall}>Use these when this Pop leaves your active shelf.</Text>
        <SecondaryButton label="Mark Sold" onPress={() => removeFromShelf(true)} disabled={busy} />
        <Pressable onPress={() => removeFromShelf(false)} disabled={busy} style={[styles.removeButton, busy && styles.disabled]}>
          <Text style={styles.removeButtonText}>Remove from Shelf</Text>
        </Pressable>
      </View>
    </ScreenFrame>
  );
}

function resolveAvatarKey(value?: string | null): AvatarKey {
  return AVATAR_OPTIONS.some((avatar) => avatar.key === value) ? (value as AvatarKey) : "logo";
}

function ProfileAvatar({ avatarKey, size }: { avatarKey: AvatarKey; size: number }) {
  const avatar = AVATAR_OPTIONS.find((option) => option.key === avatarKey) ?? AVATAR_OPTIONS[0];

  return (
    <View
      style={[
        styles.avatarBadge,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.24),
          borderColor: avatar.accent,
        },
      ]}
    >
      <Image source={avatar.image} style={styles.avatarImage} />
    </View>
  );
}

function ProfileScreen({ session, onBack }: { session: Session; onBack: () => void }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState(session.user.email ?? "");
  const [bio, setBio] = useState("");
  const [avatarKey, setAvatarKey] = useState<AvatarKey>("logo");
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(true);
  const [securityBusy, setSecurityBusy] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        setBusy(false);
        if (error) {
          Alert.alert("Profile error", error.message);
          return;
        }
        const next = data as Profile | null;
        setProfile(next);
        setDisplayName(next?.display_name ?? "");
        setUsername(next?.username ?? session.user.email ?? "");
        setBio(next?.bio ?? "");
        setAvatarKey(resolveAvatarKey(next?.avatar_url));
        setIsPublic(next?.is_public ?? true);
      });
  }, [session.user.email, session.user.id]);

  const save = async () => {
    setBusy(true);
    const payload = {
      id: session.user.id,
      display_name: displayName,
      username,
      avatar_url: avatarKey,
      bio,
      is_public: isPublic,
    };
    const { data, error } = await supabase.from("profiles").upsert(payload).select("*").single();
    setBusy(false);
    if (error) {
      Alert.alert("Save failed", error.message);
      return;
    }
    setProfile(data as Profile);
    onBack();
  };

  const updatePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Password too short", "Use at least 6 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Passwords do not match", "Re-enter the new password.");
      return;
    }

    setSecurityBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSecurityBusy(false);

    if (error) {
      Alert.alert("Password update failed", error.message);
      return;
    }

    setNewPassword("");
    setConfirmNewPassword("");
    Alert.alert("Password updated", "Your account password has been changed.");
  };

  const sendPasswordReset = async () => {
    const cleanEmail = session.user.email;
    if (!cleanEmail) {
      Alert.alert("Missing email", "This account does not have an email address available.");
      return;
    }

    setSecurityBusy(true);
    const redirectTo = passwordRedirectTo();
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, redirectTo ? { redirectTo } : undefined);
    setSecurityBusy(false);

    if (error) {
      Alert.alert("Reset failed", error.message);
      return;
    }

    Alert.alert("Reset email sent", "Check your inbox for the password reset link.");
  };

  return (
    <ScreenFrame title="Profile & Settings" onBack={onBack}>
      <View style={styles.profileHero}>
        <ProfileAvatar avatarKey={avatarKey} size={58} />
        <View style={styles.flex}>
          <Text style={styles.dashboardEyebrow}>Collector profile</Text>
          <Text style={styles.profileHeroName} adjustsFontSizeToFit numberOfLines={1}>
            {displayName.trim() || "Your Shelf"}
          </Text>
          <Text style={styles.profileHeroMeta} numberOfLines={1}>
            {username || session.user.email}
          </Text>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <View>
          <Text style={styles.dashboardSectionTitle}>Avatar</Text>
          <Text style={styles.mutedSmall}>Pick the shelf marker that feels most like you.</Text>
        </View>
        <View style={styles.avatarGrid}>
          {AVATAR_OPTIONS.map((avatar) => (
            <Pressable
              key={avatar.key}
              onPress={() => setAvatarKey(avatar.key)}
              style={[styles.avatarOption, avatarKey === avatar.key && styles.avatarOptionActive]}
            >
              <ProfileAvatar avatarKey={avatar.key} size={54} />
              <Text style={styles.avatarOptionLabel}>{avatar.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.settingsSection}>
        <View>
          <Text style={styles.dashboardSectionTitle}>Identity</Text>
          <Text style={styles.mutedSmall}>This is how your name appears across Shelf-n-Pop.</Text>
        </View>
        <Label>Preferred name</Label>
        <TextInput value={displayName} onChangeText={setDisplayName} placeholder="What should we call you?" placeholderTextColor="#8c95a3" style={styles.input} />
        <Label>Username</Label>
        <TextInput autoCapitalize="none" value={username} onChangeText={setUsername} placeholder="Username or email" placeholderTextColor="#8c95a3" style={styles.input} />
        <Label>Bio</Label>
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          placeholder="Tell collectors a little about your shelf."
          placeholderTextColor="#8c95a3"
          style={[styles.input, styles.notes]}
        />
      </View>

      <View style={styles.settingsSection}>
        <View>
          <Text style={styles.dashboardSectionTitle}>Shelf Visibility</Text>
          <Text style={styles.mutedSmall}>Controls how your collector profile can show up in shared spaces.</Text>
        </View>
        <View style={styles.settingRowCard}>
          <View style={styles.flex}>
            <Text style={styles.cardLabel}>Public profile</Text>
            <Text style={styles.mutedSmall}>{isPublic ? "Visible to shared shelf members." : "Only visible to you."}</Text>
          </View>
          <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: "#7bd1c3", false: "#283039" }} thumbColor={isPublic ? "#7e67f4" : "#11161d"} />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.dashboardSectionTitle}>Account</Text>
        <View style={styles.accountInfoRow}>
          <Text style={styles.mutedSmall}>Email</Text>
          <Text style={styles.accountInfoValue} numberOfLines={1}>
            {session.user.email}
          </Text>
        </View>
        {profile ? (
          <View style={styles.accountInfoRow}>
            <Text style={styles.mutedSmall}>Status</Text>
            <Text style={styles.accountInfoValue}>Profile synced</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.settingsSection}>
        <View>
          <Text style={styles.dashboardSectionTitle}>Security</Text>
          <Text style={styles.mutedSmall}>Update your password or send yourself a reset link.</Text>
        </View>
        <Label>New password</Label>
        <TextInput
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New password"
          placeholderTextColor="#8c95a3"
          style={styles.input}
        />
        <Label>Confirm new password</Label>
        <TextInput
          secureTextEntry
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          placeholder="Confirm new password"
          placeholderTextColor="#8c95a3"
          style={styles.input}
        />
        <PrimaryButton label={securityBusy ? "Working..." : "Change Password"} onPress={updatePassword} disabled={securityBusy} />
        <Pressable onPress={sendPasswordReset} disabled={securityBusy} style={styles.profileResetLink}>
          <Text style={styles.dashboardProfileText}>Email me a reset link</Text>
        </Pressable>
      </View>

      <PrimaryButton label={busy ? "Saving..." : "Save Profile"} onPress={save} disabled={busy} />
    </ScreenFrame>
  );
}

type PublicProfileSummary = {
  total_pops: number | null;
  unique_items: number | null;
  total_collection_value: number | null;
};

function PublicProfileScreen({ userId, onBack }: { userId: string; onBack: () => void }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wishlist, setWishlist] = useState<PublicWishlistItem[]>([]);
  const [summary, setSummary] = useState<PublicProfileSummary | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setBusy(true);
      const [profileResult, wishlistResult, summaryResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, bio, is_public")
          .eq("id", userId)
          .eq("is_public", true)
          .maybeSingle(),
        supabase
          .from("shared_public_wishlist_view")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("shared_public_profile_summary_view")
          .select("total_pops, unique_items, total_collection_value")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      if (cancelled) return;
      setBusy(false);

      if (profileResult.error) {
        Alert.alert("Profile error", profileResult.error.message);
        return;
      }

      if (wishlistResult.error) {
        Alert.alert("Wishlist error", wishlistResult.error.message);
      }

      setProfile((profileResult.data ?? null) as Profile | null);
      setWishlist((wishlistResult.data ?? []) as PublicWishlistItem[]);
      setSummary((summaryResult.data ?? null) as PublicProfileSummary | null);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const profileName = profile?.display_name?.trim() || profile?.username?.trim() || "Collector";

  return (
    <ScreenFrame title="Collector Profile" onBack={onBack}>
      {busy ? <ActivityIndicator color="#7e67f4" /> : null}

      {!busy && !profile ? (
        <View style={styles.panel}>
          <Text style={styles.centerTitle}>Profile is private</Text>
          <Text style={styles.mutedText}>This collector has not shared a public profile with this shelf.</Text>
        </View>
      ) : null}

      {profile ? (
        <>
          <View style={styles.publicProfileHero}>
            <ProfileAvatar avatarKey={resolveAvatarKey(profile.avatar_url)} size={70} />
            <View style={styles.flex}>
              <Text style={styles.dashboardEyebrow}>Public shelf profile</Text>
              <Text style={styles.profileHeroName} adjustsFontSizeToFit numberOfLines={1}>
                {profileName}
              </Text>
              {profile.username ? (
                <Text style={styles.profileHeroMeta} numberOfLines={1}>
                  {profile.username}
                </Text>
              ) : null}
            </View>
          </View>

          {profile.bio ? (
            <View style={styles.publicBioCard}>
              <Text style={styles.mutedText}>{profile.bio}</Text>
            </View>
          ) : null}

          <View style={styles.publicProfileStatsRow}>
            <MetricCard label="Pops" value={integer(summary?.total_pops)} />
            <MetricCard label="Unique" value={integer(summary?.unique_items)} />
            <MetricCard label="Shelf Value" value={money(summary?.total_collection_value)} />
          </View>

          <View style={styles.settingsSection}>
            <View>
              <Text style={styles.dashboardSectionTitle}>{profileName}'s Wishlist</Text>
              <Text style={styles.mutedSmall}>Pops this collector is hunting for next.</Text>
            </View>

            {wishlist.length === 0 ? (
              <View style={styles.emptyMiniCard}>
                <Text style={styles.centerTitle}>No wishlist items yet</Text>
                <Text style={styles.mutedText}>When {profileName} adds wishlist Pops, they will show here.</Text>
              </View>
            ) : (
              wishlist.map((item) => (
                <View key={item.id} style={styles.publicWishlistCard}>
                  {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.thumb} /> : <View style={styles.thumbPlaceholder} />}
                  <View style={styles.collectionMiddle}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {compactName(item.pop_name)}
                    </Text>
                    <Text style={styles.mutedText} numberOfLines={1}>
                      {compactName(item.set_name || item.franchise)}
                    </Text>
                    {shelfMetaLine(item) ? (
                      <Text style={styles.itemDetailLine} numberOfLines={1}>
                        {shelfMetaLine(item)}
                      </Text>
                    ) : null}
                    <View style={styles.cardBadgeRow}>
                      <VaultBadge item={item} compact />
                      <LimitedBadge item={item} compact />
                      {item.priority ? <Text style={styles.wishlistPriority}>{item.priority}</Text> : null}
                    </View>
                    {item.notes ? (
                      <Text style={styles.mutedSmall} numberOfLines={2}>
                        {item.notes}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.publicWishlistValue}>
                    <Text style={styles.mutedSmall}>Value</Text>
                    <Text style={styles.itemMoney} adjustsFontSizeToFit numberOfLines={1}>
                      {money(perPopValue(item))}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      ) : null}
    </ScreenFrame>
  );
}

function ScreenFrame({
  title,
  children,
  onBack,
  rightLabel,
  onRight,
  scroll = true,
}: {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  rightLabel?: string;
  onRight?: () => void;
  scroll?: boolean;
}) {
  return (
    <View style={styles.screen}>
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
          <VersionFooter />
        </ScrollView>
      ) : (
        <View style={styles.contentFill}>
          {children}
          <VersionFooter />
        </View>
      )}
    </View>
  );
}

function VersionFooter() {
  return (
    <View style={styles.versionFooter}>
      <Text style={styles.versionFooterText}>Shelf-n-Pop v{APP_VERSION}</Text>
    </View>
  );
}

function Splash({ label }: { label: string }) {
  return (
    <SafeAreaView style={[styles.safeArea, IS_WEB && styles.webSafeArea]}>
      <View style={styles.splash}>
        <ActivityIndicator color="#7e67f4" />
        <Text style={styles.mutedText}>{label}</Text>
      </View>
    </SafeAreaView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.primaryButton, disabled && styles.disabled]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.secondaryButton, disabled && styles.disabled]}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
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

function StatPill({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
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

function TopStatRow({
  label,
  item,
  value,
  valueStyle,
  onPress,
}: {
  label: string;
  item: CollectionItem | null;
  value: string;
  valueStyle?: React.ComponentProps<typeof Text>["style"];
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={styles.flex}>
        <Text style={styles.dashboardInsightLabel}>{label}</Text>
        <Text style={styles.statsListTitle} numberOfLines={1}>
          {item ? compactName(item.pop_name) : "--"}
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

function StatsPopRow({ item, onPress }: { item: StatsSourceItem; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.statsPopRow, pressed && styles.pressed]}>
      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.statsPopImage} /> : <View style={styles.statsPopImagePlaceholder} />}
      <View style={styles.flex}>
        <Text style={styles.statsListTitle} numberOfLines={1}>
          {compactName(item.pop_name)}
        </Text>
        <Text style={styles.mutedSmall} numberOfLines={1}>
          {[item.set_name, item.number ? `#${item.number}` : null, item.display_variant || item.owned_variant].filter(Boolean).join("  ")}
        </Text>
        <Text style={styles.mutedSmall}>Qty {integer(item.quantity)}</Text>
      </View>
      <View style={styles.alignEnd}>
        <Text style={styles.statsListValue}>{money(perPopValue(item))}</Text>
        <Text style={styles.mutedSmall}>each</Text>
      </View>
    </Pressable>
  );
}

function ToggleRow({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: "#7bd1c3", false: "#283039" }} thumbColor={value ? "#7e67f4" : "#11161d"} />
    </View>
  );
}

function ConditionPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <ChoicePicker title="Condition" value={value || "Unknown"} options={CONDITIONS} onChange={onChange} />;
}

function VariantPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <ChoicePicker title="Variant" value={value || "Common"} options={VARIANTS} onChange={onChange} />;
}

function ChoicePicker({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.selectInput}>
        <Text style={styles.selectValue}>{value}</Text>
        <Text style={styles.selectChevron}>⌄</Text>
      </Pressable>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <View style={styles.optionSheet}>
            <Text style={styles.optionTitle}>{title}</Text>
            {options.map((option) => (
              <Pressable
                key={option}
                style={[styles.optionRow, option === value && styles.optionRowActive]}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1f2429",
  },
  webSafeArea: {
    minHeight: "100vh" as any,
    width: "100vw" as any,
    overflow: "hidden" as any,
  },
  appShell: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1f2429",
  },
  webAppShell: {
    height: "100vh" as any,
    width: "100vw" as any,
    overflow: "hidden" as any,
  },
  screen: {
    flex: 1,
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#101318",
  },
  appBar: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#765df0",
    borderBottomWidth: 1,
    borderBottomColor: "#8d77ff",
  },
  appTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  backButton: {
    width: 38,
    height: 38,
    justifyContent: "center",
  },
  headerLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    marginRight: 8,
  },
  backText: {
    color: "#7bd1c3",
    fontSize: 34,
    lineHeight: 34,
  },
  rightAction: {
    minWidth: 96,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(16, 19, 24, 0.16)",
  },
  rightActionText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
  },
  rightActionPlaceholder: {
    minWidth: 96,
    minHeight: 34,
  },
  content: {
    padding: 18,
    gap: 16,
    paddingBottom: 44,
  },
  versionFooter: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 2,
  },
  versionFooterText: {
    color: "#a9b3c1",
    fontSize: 12,
    fontWeight: "800",
  },
  contentFill: {
    flex: 1,
  },
  listContent: {
    padding: 18,
    gap: 16,
    paddingBottom: 44,
  },
  collectionStickyHeader: {
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#202832",
    backgroundColor: "#101318",
  },
  activeFilterRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#1b2f31",
  },
  activeFilterText: {
    flex: 1,
    color: "#d9fff8",
    fontSize: 12,
    fontWeight: "900",
  },
  sharedShelfClearButton: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#7bd1c3",
  },
  sharedShelfClearText: {
    color: "#101318",
    fontSize: 12,
    fontWeight: "900",
  },
  sharedShelfProfileButton: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7bd1c3",
  },
  sharedShelfProfileText: {
    color: "#d9fff8",
    fontSize: 12,
    fontWeight: "900",
  },
  authWrap: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 24,
    backgroundColor: "#101318",
  },
  brandBlock: {
    alignItems: "center",
    gap: 12,
  },
  authLogo: {
    width: 96,
    height: 96,
    borderRadius: 20,
  },
  logoMark: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
  },
  h1: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  mutedText: {
    color: "#b8c0cc",
    fontSize: 14,
    lineHeight: 19,
  },
  mutedSmall: {
    color: "#b8c0cc",
    fontSize: 12,
    lineHeight: 16,
  },
  alignEnd: {
    alignItems: "flex-end",
  },
  dashboardHero: {
    gap: 10,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#151a1f",
    borderWidth: 1,
    borderColor: "#26313d",
  },
  dashboardHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dashboardLogoShell: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#07172f",
  },
  dashboardLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  dashboardEyebrow: {
    color: "#7bd1c3",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  dashboardGreeting: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  dashboardSubtext: {
    color: "#b8c0cc",
    fontSize: 14,
    lineHeight: 19,
  },
  dashboardValueCard: {
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d7dbe5",
    backgroundColor: "#151a1f",
  },
  dashboardValueLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
  dashboardValue: {
    color: "#fff",
    fontSize: 33,
    fontWeight: "900",
    flex: 1,
    minWidth: 0,
  },
  dashboardValueBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dashboardValueSide: {
    minWidth: 96,
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#121820",
  },
  dashboardSideLabel: {
    color: "#b8c0cc",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  dashboardSideValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
  dashboardGainRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    flexWrap: "wrap",
  },
  dashboardGainLabel: {
    color: "#b8c0cc",
    fontSize: 12,
    fontWeight: "900",
  },
  dashboardGainValue: {
    fontSize: 17,
    fontWeight: "900",
  },
  dashboardGainPercent: {
    fontSize: 13,
    fontWeight: "900",
  },
  dashboardStatsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  dashboardInsightPanel: {
    gap: 10,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#151a1f",
    borderWidth: 1,
    borderColor: "#26313d",
  },
  dashboardSectionTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
  dashboardInsightGrid: {
    flexDirection: "row",
    gap: 10,
  },
  dashboardInsightTile: {
    flex: 1,
    gap: 4,
    padding: 11,
    borderRadius: 8,
    backgroundColor: "#101318",
  },
  dashboardInsightLabel: {
    color: "#b8c0cc",
    fontSize: 11,
    fontWeight: "800",
  },
  dashboardInsightValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
  statsHero: {
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#7bd1c3",
    backgroundColor: "#151a1f",
  },
  statsHeroValue: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
  },
  statsTwoColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statsBreakdownButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#9bd8cb",
  },
  statsBreakdownButtonText: {
    color: "#071014",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  breakdownHero: {
    gap: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#293341",
    backgroundColor: "#151a1f",
  },
  breakdownHeroMetaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  breakdownHeroTile: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#101318",
  },
  breakdownHeroLabel: {
    color: "#aeb7c4",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  breakdownHeroValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },
  breakdownControls: {
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#293341",
    backgroundColor: "#151a1f",
  },
  breakdownSearchInput: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d9dde5",
    color: "#ffffff",
    fontSize: 16,
  },
  breakdownSortRow: {
    flexDirection: "row",
    gap: 8,
  },
  breakdownSortChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#293341",
    backgroundColor: "#101318",
  },
  breakdownSortChipActive: {
    borderColor: "#9bd8cb",
    backgroundColor: "#243b39",
  },
  breakdownSortText: {
    color: "#aeb7c4",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  breakdownSortTextActive: {
    color: "#ffffff",
  },
  breakdownMemberTabs: {
    gap: 10,
    paddingVertical: 2,
  },
  breakdownMemberTab: {
    width: 148,
    borderWidth: 1,
    borderColor: "#293341",
    borderRadius: 10,
    backgroundColor: "#151a20",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  breakdownMemberTabActive: {
    borderColor: "#9bd8cc",
    backgroundColor: "#1b3432",
  },
  breakdownMemberTabName: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "900",
  },
  breakdownMemberTabMeta: {
    color: "#aab4c0",
    fontSize: 12,
  },
  breakdownMemberTabValue: {
    color: "#86d49e",
    fontSize: 13,
    fontWeight: "900",
  },
  breakdownGroupRow: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#293341",
    backgroundColor: "#101318",
  },
  breakdownGroupHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  breakdownGroupName: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },
  breakdownGroupMeta: {
    color: "#b9c0ca",
    fontSize: 13,
    marginTop: 2,
  },
  breakdownMetricRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  breakdownMetricTile: {
    flex: 1,
    minHeight: 52,
    justifyContent: "center",
    padding: 9,
    borderRadius: 8,
    backgroundColor: "#0d1117",
  },
  breakdownMetricLabel: {
    color: "#aeb7c4",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  breakdownMetricValue: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 3,
  },
  breakdownBarTrack: {
    height: 8,
    marginTop: 10,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#232a33",
  },
  breakdownBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#9bd8cb",
  },
  statsPanelHeader: {
    gap: 10,
  },
  segmentedControl: {
    minHeight: 40,
    flexDirection: "row",
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#101318",
  },
  segmentButton: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  segmentButtonActive: {
    backgroundColor: "#7bd1c3",
  },
  segmentText: {
    color: "#b8c0cc",
    fontSize: 12,
    fontWeight: "900",
  },
  segmentTextActive: {
    color: "#101318",
  },
  statPill: {
    width: "48%",
    minHeight: 68,
    gap: 4,
    justifyContent: "center",
    padding: 11,
    borderRadius: 8,
    backgroundColor: "#101318",
  },
  statPillValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  statsListRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 11,
    borderRadius: 8,
    backgroundColor: "#101318",
  },
  pressableStatRow: {
    borderWidth: 1,
    borderColor: "#26313d",
  },
  pressed: {
    opacity: 0.76,
  },
  statsListTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  statsListValue: {
    minWidth: 86,
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
  },
  statsGroupBlock: {
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#101318",
  },
  statsGroupHeader: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 11,
  },
  groupChevron: {
    color: "#7bd1c3",
    fontSize: 11,
    fontWeight: "900",
  },
  statsGroupDetail: {
    gap: 8,
    padding: 8,
    paddingTop: 0,
  },
  groupFilterButton: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#1b2f31",
  },
  groupFilterText: {
    color: "#7bd1c3",
    fontSize: 12,
    fontWeight: "900",
  },
  statsPopRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#151a1f",
  },
  statsPopImage: {
    width: 42,
    height: 56,
    resizeMode: "contain",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  statsPopImagePlaceholder: {
    width: 42,
    height: 56,
    borderRadius: 6,
    backgroundColor: "#272d34",
  },
  dashboardActionPanel: {
    gap: 10,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#151a1f",
    borderWidth: 1,
    borderColor: "#26313d",
  },
  dashboardBottomActions: {
    flexDirection: "row",
    gap: 12,
  },
  dashboardStatsAction: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#7bd1c3",
    backgroundColor: "#1b2f31",
  },
  dashboardStatsActionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
  dashboardProfileLink: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  dashboardProfileText: {
    color: "#b8c0cc",
    fontSize: 13,
    fontWeight: "900",
  },
  profileResetLink: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  profileHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#151a1f",
  },
  profileHeroLogo: {
    width: 58,
    height: 58,
    borderRadius: 14,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  avatarOption: {
    width: 92,
    minHeight: 104,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#101318",
  },
  avatarOptionActive: {
    borderColor: "#7bd1c3",
    backgroundColor: "#1b2f31",
  },
  avatarOptionLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  avatarBadge: {
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    backgroundColor: "#07111f",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileHeroName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  profileHeroMeta: {
    color: "#b8c0cc",
    fontSize: 13,
    fontWeight: "800",
  },
  settingsSection: {
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#151a1f",
  },
  publicProfileHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#151a1f",
  },
  publicBioCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#101318",
    borderWidth: 1,
    borderColor: "#26313d",
  },
  publicProfileStatsRow: {
    flexDirection: "row",
    gap: 10,
  },
  emptyMiniCard: {
    gap: 8,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#101318",
  },
  publicWishlistCard: {
    minHeight: 124,
    flexDirection: "row",
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#20262d",
  },
  publicWishlistValue: {
    width: 72,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 2,
  },
  wishlistPriority: {
    alignSelf: "flex-start",
    color: "#101318",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#c7b9ff",
    fontSize: 11,
    fontWeight: "900",
  },
  settingRowCard: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#101318",
  },
  accountInfoRow: {
    gap: 4,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#101318",
  },
  accountInfoValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  detailHero: {
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#151a1f",
  },
  detailHeroTop: {
    flexDirection: "row",
    gap: 12,
  },
  detailHeroImage: {
    width: 106,
    height: 136,
    resizeMode: "contain",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  detailHeroImagePlaceholder: {
    width: 106,
    height: 136,
    borderRadius: 10,
    backgroundColor: "#101318",
  },
  detailHeroCopy: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  detailTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 25,
  },
  detailFranchise: {
    color: "#d7dbe5",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 19,
  },
  detailMeta: {
    color: "#b8c0cc",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18,
  },
  detailDescription: {
    color: "#d7dbe5",
    fontSize: 13,
    lineHeight: 18,
  },
  detailValueGrid: {
    flexDirection: "row",
    gap: 8,
  },
  detailValueTile: {
    flex: 1,
    gap: 3,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#101318",
  },
  detailValueText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  detailSection: {
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#151a1f",
  },
  detailDangerSection: {
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3a2d34",
    backgroundColor: "#151a1f",
  },
  detailTwoColumn: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  panel: {
    gap: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#151a1f",
    borderWidth: 1,
    borderColor: "#202832",
  },
  catalogPanel: {
    gap: 6,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#151a1f",
    borderWidth: 1,
    borderColor: "#050608",
    alignItems: "center",
  },
  catalogResultRow: {
    minHeight: 90,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#101318",
  },
  catalogResultRowActive: {
    borderColor: "#7bd1c3",
    backgroundColor: "#1b2f31",
  },
  catalogResultImage: {
    width: 58,
    height: 74,
    resizeMode: "contain",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  catalogResultImagePlaceholder: {
    width: 58,
    height: 74,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  valueCard: {
    gap: 8,
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#151a1f",
  },
  sharedShelfValueCard: {
    gap: 22,
    paddingVertical: 24,
  },
  sharedShelfSummaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: -4,
  },
  sharedShelfSummaryTile: {
    flex: 1,
    minHeight: 62,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#0d1117",
    padding: 10,
    justifyContent: "center",
  },
  sharedShelfSummaryLabel: {
    color: "#aeb8c4",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  sharedShelfSummaryValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 4,
  },
  sharedShelfInviteCode: {
    color: "#9bd5c9",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4,
  },
  cardLabel: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  bigMoney: {
    color: "#fff",
    fontSize: 29,
    fontWeight: "900",
  },
  gainText: {
    color: "#72c58e",
    fontWeight: "900",
  },
  lossText: {
    color: "#f07178",
    fontWeight: "900",
  },
  neutralMoneyText: {
    color: "#fff",
    fontWeight: "900",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  insightValueBlock: {
    alignItems: "flex-end",
    gap: 2,
  },
  flex: {
    flex: 1,
  },
  metricCard: {
    flex: 1,
    minHeight: 82,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#151a1f",
  },
  metricValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  sharedShelfHeroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sharedViewingRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#101318",
    borderWidth: 1,
    borderColor: "#26313d",
  },
  sharedViewingLabel: {
    color: "#7bd1c3",
    fontSize: 12,
    fontWeight: "900",
  },
  inviteRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  clearFilterButton: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#1b2f31",
  },
  clearFilterText: {
    color: "#7bd1c3",
    fontSize: 12,
    fontWeight: "900",
  },
  panelValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  input: {
    minHeight: 44,
    color: "#fff",
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d7dbe5",
    backgroundColor: "#151a1f",
    fontSize: 14,
  },
  notes: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  selectInput: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d7dbe5",
    backgroundColor: "#151a1f",
  },
  selectValue: {
    color: "#fff",
    fontSize: 14,
  },
  selectChevron: {
    color: "#b8c0cc",
    fontSize: 20,
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  optionSheet: {
    gap: 8,
    padding: 18,
    paddingBottom: 34,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: "#151a1f",
    borderWidth: 1,
    borderColor: "#27313c",
  },
  optionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  optionRow: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#202832",
  },
  optionRowActive: {
    backgroundColor: "#7e67f4",
  },
  optionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  label: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  primaryButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 18,
    backgroundColor: "#7e67f4",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#7bd1c3",
  },
  secondaryButtonText: {
    color: "#101318",
    fontWeight: "900",
    fontSize: 15,
  },
  removeButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f07178",
    backgroundColor: "#221519",
  },
  removeButtonText: {
    color: "#f07178",
    fontSize: 14,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.55,
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  linkText: {
    color: "#7bd1c3",
    fontWeight: "800",
  },
  centerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  resultName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  scanValueText: {
    color: "#72c58e",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  scanShelfMatchBox: {
    width: "100%",
    backgroundColor: "#101b1b",
    borderColor: "#7bd1c3",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  scanShelfMatchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },
  scanShelfMatchTitle: {
    color: "#9bd5c9",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 0,
    textTransform: "uppercase",
  },
  scanShelfMatchBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#26313d",
  },
  scanShelfMatchBadgeChecking: {
    backgroundColor: "#3a315f",
  },
  scanShelfMatchBadgeOwned: {
    backgroundColor: "#22463d",
  },
  scanShelfMatchBadgeClear: {
    backgroundColor: "#22313a",
  },
  scanShelfMatchBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },
  scanShelfMatchText: {
    color: "#b9c2cf",
    fontSize: 13,
    lineHeight: 18,
  },
  scanShelfOwnerWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  scanShelfOwnerPill: {
    backgroundColor: "#9bd5c9",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  scanShelfOwnerName: {
    color: "#071013",
    fontSize: 12,
    fontWeight: "900",
  },
  scanShelfOwnerVariant: {
    color: "#24403b",
    fontSize: 11,
    marginTop: 1,
  },
  resultImage: {
    width: "100%",
    height: 190,
    resizeMode: "contain",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  cameraWrap: {
    gap: 16,
  },
  camera: {
    height: 420,
    borderRadius: 8,
    overflow: "hidden",
  },
  webCameraFrame: {
    height: 420,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  sortButton: {
    minHeight: 46,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#151a1f",
  },
  sortText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  shelfCard: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#202832",
    backgroundColor: "#151a1f",
  },
  inviteText: {
    color: "#b8c0cc",
    fontSize: 13,
    fontWeight: "800",
  },
  ownerTileRow: {
    gap: 8,
    paddingVertical: 2,
    paddingRight: 4,
  },
  ownerSelectorPanel: {
    marginTop: 8,
    marginBottom: 8,
  },
  sharedTopPopsPanel: {
    marginBottom: 2,
  },
  sharedSearchRow: {
    marginTop: 2,
  },
  ownerTile: {
    minWidth: 104,
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#202832",
    backgroundColor: "#151a1f",
  },
  ownerTileActive: {
    borderColor: "#7bd1c3",
    backgroundColor: "#1b2f31",
  },
  ownerTileName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  ownerTileMeta: {
    color: "#b8c0cc",
    fontSize: 10,
    fontWeight: "800",
  },
  ownerTileValue: {
    color: "#72c58e",
    fontSize: 11,
    fontWeight: "900",
  },
  topPopRow: {
    gap: 8,
    paddingRight: 4,
  },
  topPopCard: {
    width: 190,
    minHeight: 106,
    flexDirection: "row",
    gap: 8,
    padding: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#101318",
  },
  topPopRank: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 1,
    minWidth: 28,
    minHeight: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#7e67f4",
  },
  topPopRankText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },
  topPopImage: {
    width: 58,
    height: 74,
    resizeMode: "contain",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  topPopImagePlaceholder: {
    width: 58,
    height: 74,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  topPopName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 16,
  },
  topPopValue: {
    color: "#72c58e",
    fontSize: 15,
    fontWeight: "900",
  },
  collectionCard: {
    minHeight: 146,
    flexDirection: "row",
    gap: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#050608",
    backgroundColor: "#272d34",
  },
  thumb: {
    width: 70,
    height: 92,
    resizeMode: "cover",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  thumbPlaceholder: {
    width: 70,
    height: 92,
    borderRadius: 8,
    backgroundColor: "#151a1f",
  },
  collectionMiddle: {
    flex: 1,
    justifyContent: "center",
    gap: 5,
  },
  itemTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 17,
  },
  itemMeta: {
    color: "#fff",
    fontWeight: "800",
  },
  itemDetailLine: {
    color: "#8fd5c9",
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 14,
  },
  cardBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 5,
  },
  ownerPill: {
    alignSelf: "flex-start",
    color: "#101318",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#7bd1c3",
    fontSize: 11,
    fontWeight: "900",
  },
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
  statusBadgeCompact: {
    maxWidth: "100%",
  },
  vaultedBadge: {
    color: "#fff",
    backgroundColor: "#80455f",
  },
  activeStatusBadge: {
    color: "#101318",
    backgroundColor: "#8fd5c9",
  },
  valueColumn: {
    width: 98,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 1,
  },
  itemMoney: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
  },
  itemMoneySmall: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 11,
  },
  description: {
    color: "#fff",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 17,
  },
  toggleRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
});
