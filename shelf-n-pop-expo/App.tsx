import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { Session } from "@supabase/supabase-js";
import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
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
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

import { supabase } from "./src/lib/supabase";
import type {
  AdminAuditEvent,
  CollectionItem,
  DashboardHome,
  CatalogIssueReport,
  LookupResponse,
  PopCatalog,
  Profile,
  PublicWishlistItem,
  SharedShelf,
  SharedShelfCollectionItem,
  SharedShelfGroupedItem,
  SharedShelfMember,
} from "./src/types";
import { compactName, integer, money } from "./src/utils/format";
import { AdminCatalogFixScreen as ManagedAdminCatalogFixScreen, AdminScreen as ManagedAdminScreen } from "./src/ui/AdminScreens";

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
  | "sharedShelfSettings"
  | "shelfStats"
  | "shelfBreakdown"
  | "admin"
  | "adminCatalogFix";

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
type SetChecklistViewMode = "owned" | "missing" | "full";
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
  completionOwnedCount?: number;
  checklistTotal?: number | null;
  completionPercent?: number | null;
  completionSourceLabel?: string | null;
  setPremiumBoost?: number | null;
  setPremiumRate?: number | null;
  setPremiumReason?: string | null;
  estimatedSetValue?: number | null;
  missingForSetBoost?: number | null;
};
type SetChecklistSummary = {
  set_id: string;
  set_name: string;
  status: string | null;
  source_label: string | null;
  required_count: number | null;
};
type SetChecklistItem = {
  id: string;
  set_id: string;
  pop_catalog_id: string | null;
  upc: string | null;
  pop_name: string | null;
  character: string | null;
  number: string | null;
  variant: string | null;
  exclusivity: string | null;
  pop_type: string | null;
  pop_style: string | null;
  is_required_for_completion: boolean | null;
};
type ChecklistDisplayRow = SetChecklistItem & {
  owned: boolean;
  ownedItem?: StatsSourceItem;
};
type SetPremiumDisplay = {
  text: string;
  isActive: boolean;
};
type SetProgressSummary = {
  ownedUnique: number;
  checklistTotal: number;
  completionPercent: number;
};
type CollectorMode = "casual" | "avid" | "reseller";
const CONDITIONS = ["Unknown", "Mint", "Near Mint", "Good", "Fair", "Damaged", "Out of Box"] as const;
const VARIANTS = [
  "Common",
  "Grail",
  "Legendary",
  "Mythic",
  "Royalty",
  "Ultra",
  "Chase",
  "Glow in the Dark",
  "Glow in the Dark Chase",
  "Flocked",
  "Flocked Chase",
  "Metallic",
  "Metallic Chase",
  "Chrome",
  "Blacklight",
  "Blacklight Chase",
  "Diamond Collection",
  "Diamond Collection Chase",
  "Glitter",
  "DIY",
  "Artist Series",
  "Patina",
  "Translucent",
  "Bloody",
  "Battle Damaged",
  "Black & White",
  "Sepia",
  "Stained Glass",
  "Wood Deco",
  "Scented",
  "Other",
] as const;
const EXCLUSIVITIES = [
  "None",
  "Exclusive",
  "US Exclusive",
  "Funko Shop",
  "San Diego Comic-Con",
  "New York Comic Con",
  "Emerald City Comic Con",
  "WonderCon",
  "D23",
  "Target Con",
  "Summer Convention",
  "Fall Convention",
  "Spring Convention",
  "Winter Convention",
  "Walmart",
  "Target",
  "GameStop",
  "Hot Topic",
  "BoxLunch",
  "Amazon",
  "Walgreens",
  "Entertainment Earth",
  "FYE",
  "Barnes & Noble",
  "PX Previews",
  "Specialty Series",
  "Collectors Corps",
  "Toy Sapiens",
  "AAA Anime Exclusive",
  "AT&T",
  "Books-A-Million",
  "DC Shop",
  "D23 First To Market",
  "First To Market",
  "Funkon London",
  "Go! Calendars",
  "SDCC / Summer Convention",
  "South Park Shop",
  "Special Edition",
  "Target REDcard",
  "Toy Tokyo",
  "Wondrous Convention",
  "Other",
] as const;
const SIGNATURE_AUTHENTICATIONS = ["None", "Unknown", "JSA", "Beckett", "PSA", "Funko Event", "Convention COA", "Other"] as const;
const SIGNATURE_LOCATIONS = ["Box", "Window", "Insert", "Protector", "Figure", "Base", "Other"] as const;
const APP_LOGO = require("./assets/shelf-n-pop-logo.png");
const APP_VERSION = "0.2.0";
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
const BREAKDOWN_EXPANDED_ROW_LIMIT = 36;
const PUBLIC_WISHLIST_ROW_LIMIT = 24;
const ISSUE_TYPES = [
  { key: "wrong_image", label: "Wrong image" },
  { key: "missing_image", label: "Missing image" },
  { key: "wrong_value", label: "Wrong value" },
  { key: "missing_value", label: "Missing value" },
  { key: "wrong_details", label: "Wrong details" },
  { key: "duplicate", label: "Duplicate" },
  { key: "other", label: "Other" },
] as const;
type IssueType = (typeof ISSUE_TYPES)[number]["key"];
const COLLECTOR_MODE_OPTIONS: Array<{
  key: CollectorMode;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    key: "casual",
    label: "Casual Collector",
    shortLabel: "Casual",
    description: "A softer shelf view with recent adds, favorites, and simple progress.",
  },
  {
    key: "avid",
    label: "Avid Fan",
    shortLabel: "Avid",
    description: "More set progress, variants, exclusives, and missing Pops.",
  },
  {
    key: "reseller",
    label: "Value Tracker",
    shortLabel: "Value",
    description: "Keeps values, paid price, duplicates, and sale details closer at hand.",
  },
];
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

function defaultSignedBoost(authentication: string, personalized: boolean): number {
  if (personalized) return 10;
  if (/^(jsa|beckett|psa|funko event|convention coa)$/i.test(authentication)) return 30;
  if (/^unknown$/i.test(authentication)) return 15;
  return 15;
}

function adjustedSignedValue(baseValue: number, signed: boolean, boostPercent: number): number {
  if (!signed || baseValue <= 0) return baseValue;
  return Math.round(baseValue * (1 + Math.max(boostPercent, 0) / 100) * 100) / 100;
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

async function fetchSetChecklistSummaries(): Promise<Record<string, SetChecklistSummary>> {
  const { data, error } = await supabase
    .from("pop_set_completion_catalog_summary")
    .select("set_id,set_name,status,source_label,required_count")
    .eq("status", "reviewed");

  if (error) throw error;

  return ((data ?? []) as SetChecklistSummary[]).reduce<Record<string, SetChecklistSummary>>((acc, row) => {
    if (row.set_name && Number(row.required_count ?? 0) > 0) {
      acc[compactName(row.set_name).toLowerCase()] = row;
    }
    return acc;
  }, {});
}

async function fetchSetChecklistItems(setId: string): Promise<SetChecklistItem[]> {
  const { data, error } = await supabase
    .from("pop_set_checklist_items")
    .select("id,set_id,pop_catalog_id,upc,pop_name,character,number,variant,exclusivity,pop_type,pop_style,is_required_for_completion")
    .eq("set_id", setId)
    .eq("is_required_for_completion", true);

  if (error) throw error;

  return ((data ?? []) as SetChecklistItem[]).sort(compareChecklistRows);
}

async function fetchMySharedShelves(): Promise<SharedShelf[]> {
  const { data, error } = await supabase.rpc("get_my_shared_shelves");
  if (error) throw error;
  return (data ?? []) as SharedShelf[];
}

async function fetchSharedShelfMembers(shelfId: string): Promise<SharedShelfMember[]> {
  const { data: memberRows, error: memberError } = await supabase
    .from("shared_shelf_members")
    .select("id,shelf_id,user_id,role,created_at")
    .eq("shelf_id", shelfId)
    .order("created_at", { ascending: true });

  if (memberError) throw memberError;

  const members = (memberRows ?? []) as Array<{
    id: string;
    shelf_id: string;
    user_id: string;
    role: string;
    created_at: string;
  }>;
  const profileIds = members.map((member) => member.user_id).filter(Boolean);
  const { data: profileRows, error: profileError } = profileIds.length
    ? await supabase.from("profiles").select("id,display_name,username").in("id", profileIds)
    : { data: [], error: null };

  if (profileError) throw profileError;

  const profiles = new Map(
    ((profileRows ?? []) as Array<{ id: string; display_name: string | null; username: string | null }>).map((profile) => [
      profile.id,
      profile,
    ]),
  );

  return members.map((member) => {
    const profile = profiles.get(member.user_id);
    return {
      ...member,
      display_name: profile?.display_name ?? null,
      username: profile?.username ?? null,
    };
  });
}

function sharedShelfOwnerName(item: SharedShelfCollectionItem): string {
  return (item.owner_display_name || "Collector").trim() || "Collector";
}

function sharedShelfMemberName(member: Pick<SharedShelfMember, "display_name" | "username">): string {
  return compactName(member.display_name || member.username || "Collector");
}

function generateInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 8; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function confirmAction(title: string, message: string, action: () => void) {
  if (IS_WEB && typeof window !== "undefined" && typeof window.confirm === "function") {
    if (window.confirm(`${title}\n\n${message}`)) action();
    return;
  }

  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Continue", style: "destructive", onPress: action },
  ]);
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

function normalizeCollectorMode(value: string | null | undefined): CollectorMode {
  return value === "avid" || value === "reseller" ? value : "casual";
}

function collectorModeLabel(mode: CollectorMode): string {
  return COLLECTOR_MODE_OPTIONS.find((option) => option.key === mode)?.label ?? "Casual Collector";
}

function collectorModeDescription(mode: CollectorMode): string {
  return COLLECTOR_MODE_OPTIONS.find((option) => option.key === mode)?.description ?? COLLECTOR_MODE_OPTIONS[0].description;
}

function collectorModeDashboardCopy(mode: CollectorMode): {
  eyebrow: string;
  valueTitle: string;
  insightTitle: string;
  statsActionLabel: string;
  statsActionSub: string;
  focusTitle: string;
  focusBody: string;
  primaryFocus: string;
  secondaryFocus: string;
  tertiaryFocus: string;
} {
  if (mode === "avid") {
    return {
      eyebrow: "Set builder view",
      valueTitle: "Shelf Value",
      insightTitle: "Collector Highlights",
      statsActionLabel: "Set Progress",
      statsActionSub: "Sets, variants, and gaps",
      focusTitle: "Build the set",
      focusBody: "Avid mode brings reviewed sets, variants, exclusives, and missing Pops closer to the front.",
      primaryFocus: "Closest sets",
      secondaryFocus: "Missing Pops",
      tertiaryFocus: "Variant checks",
    };
  }

  if (mode === "reseller") {
    return {
      eyebrow: "Value tracker view",
      valueTitle: "Total Collection Value",
      insightTitle: "Value Snapshot",
      statsActionLabel: "Shelf Stats",
      statsActionSub: "Values, costs, and gaps",
      focusTitle: "Track the value",
      focusBody: "Value Tracker mode keeps cost, condition, duplicates, and sale context easier to reach.",
      primaryFocus: "Portfolio value",
      secondaryFocus: "Gain/loss",
      tertiaryFocus: "Sale flags",
    };
  }

  return {
    eyebrow: "Shelf view",
    valueTitle: "Shelf Value",
    insightTitle: "Shelf Highlights",
    statsActionLabel: "Shelf Highlights",
    statsActionSub: "Sets, favorites, and finds",
    focusTitle: "Enjoy the shelf",
    focusBody: "Casual mode keeps the experience visual and relaxed, with values available but not driving every screen.",
    primaryFocus: "Recent adds",
    secondaryFocus: "Shelf browsing",
    tertiaryFocus: "Shared fun",
  };
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

function completionOwnershipKey(item: Pick<StatsSourceItem, "pop_catalog_id" | "collection_item_id" | "owned_variant" | "display_variant" | "variant">): string {
  if (item.pop_catalog_id) return `catalog:${item.pop_catalog_id}`;
  if (item.collection_item_id) return `collection:${item.collection_item_id}`;
  const catalogVariant = item.display_variant ?? item.variant;
  const variantSource = isMeaningfulVariant(catalogVariant) ? catalogVariant : item.owned_variant;
  const variant = normalizeShelfVariant(variantSource).toLowerCase();
  return `unknown::${variant}`;
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
  const groups = new Map<string, StatsGroup & { uniqueIds: Set<string>; completionIds: Set<string> }>();

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
        completionIds: new Set<string>(),
      } as StatsGroup & { uniqueIds: Set<string>; completionIds: Set<string> });

    existing.count += quantityNumber(item.quantity);
    existing.value += Number(item.total_value ?? 0);
    existing.paid += Number(item.total_cost ?? 0);
    existing.uniqueIds.add(item.pop_catalog_id || item.collection_item_id);
    existing.completionIds.add(completionOwnershipKey(item));
    existing.items.push(item);
    groups.set(name, existing);
  }

  return Array.from(groups.values())
    .map(({ uniqueIds, completionIds, ...group }) => ({
      ...group,
      uniqueCount: uniqueIds.size,
      completionOwnedCount: completionIds.size,
      averageValue: group.count > 0 ? group.value / group.count : 0,
      items: [...group.items].sort((a, b) => Number(perPopValue(b) ?? 0) - Number(perPopValue(a) ?? 0)),
    }))
    .sort((a, b) => b.count - a.count || b.value - a.value || a.name.localeCompare(b.name));
}

function addSetCompletion(groups: StatsGroup[], checklists: Record<string, SetChecklistSummary>): StatsGroup[] {
  return groups.map((group) => {
    const checklist = checklists[group.name.toLowerCase()];
    const total = Number(checklist?.required_count ?? 0);
    if (!checklist || total <= 0) return group;
    const ownedCount = group.completionOwnedCount ?? group.uniqueCount;
    const completedGroup = {
      ...group,
      checklistTotal: total,
      completionPercent: Math.min(100, (ownedCount / total) * 100),
      completionSourceLabel: checklist.source_label,
    };
    return {
      ...completedGroup,
      ...calculateSetPremium(completedGroup),
    };
  });
}

function setCompletionText(group: StatsGroup): string | null {
  if (!group.checklistTotal || group.completionPercent == null) return null;
  const ownedCount = group.completionOwnedCount ?? group.uniqueCount;
  return `${integer(ownedCount)} of ${integer(group.checklistTotal)} owned - ${percent(group.completionPercent)} complete`;
}

function normalizedCondition(value: string | null | undefined): string {
  return String(value || "Unknown").trim().toLowerCase();
}

function isMintCondition(value: string | null | undefined): boolean {
  return normalizedCondition(value) === "mint";
}

function isNearMintOrMintCondition(value: string | null | undefined): boolean {
  const condition = normalizedCondition(value);
  return condition === "mint" || condition === "near mint";
}

function hasKnownCondition(value: string | null | undefined): boolean {
  const condition = normalizedCondition(value);
  return Boolean(condition && condition !== "unknown");
}

function calculateSetPremium(group: StatsGroup): Partial<StatsGroup> {
  const total = Number(group.checklistTotal ?? 0);
  if (total <= 0) return {};

  const ownedCount = group.completionOwnedCount ?? group.uniqueCount;
  const missingCount = Math.max(0, total - ownedCount);
  if (missingCount > 0) {
    return {
      missingForSetBoost: missingCount,
      setPremiumBoost: null,
      setPremiumRate: null,
      setPremiumReason: null,
      estimatedSetValue: null,
    };
  }

  if (group.value <= 0) {
    return {
      missingForSetBoost: 0,
      setPremiumBoost: null,
      setPremiumRate: null,
      setPremiumReason: null,
      estimatedSetValue: null,
    };
  }

  const conditions = group.items.map((item) => item.condition);
  const allConditionsKnown = conditions.length > 0 && conditions.every(hasKnownCondition);
  const allMint = allConditionsKnown && conditions.every(isMintCondition);
  const allNearMintOrMint = allConditionsKnown && conditions.every(isNearMintOrMintCondition);
  const rate = allMint ? 0.1 : allNearMintOrMint ? 0.08 : 0.05;
  const reason = allMint ? "All Mint complete set" : allNearMintOrMint ? "Near Mint/Mint complete set" : "Complete reviewed set";
  const boost = group.value * rate;

  return {
    missingForSetBoost: 0,
    setPremiumBoost: boost,
    setPremiumRate: rate,
    setPremiumReason: reason,
    estimatedSetValue: group.value + boost,
  };
}

function setPremiumDisplay(group: StatsGroup, ownedCountOverride?: number, totalOverride?: number): SetPremiumDisplay | null {
  const premium = calculateSetPremium({
    ...group,
    completionOwnedCount: ownedCountOverride ?? group.completionOwnedCount,
    checklistTotal: totalOverride ?? group.checklistTotal,
  });

  if (premium.setPremiumBoost && premium.estimatedSetValue) {
    return {
      text: `Set boost +${money(premium.setPremiumBoost)} - est. set value ${money(premium.estimatedSetValue)}`,
      isActive: true,
    };
  }
  if (premium.missingForSetBoost && premium.missingForSetBoost > 0 && premium.missingForSetBoost <= 3) {
    return {
      text: `${integer(premium.missingForSetBoost)} missing for set boost`,
      isActive: false,
    };
  }
  return null;
}

function setPremiumText(group: StatsGroup): string | null {
  return setPremiumDisplay(group)?.text ?? null;
}

function boxNumberSortValue(value: string | number | null | undefined): { number: number; suffix: string } {
  const clean = String(value ?? "").trim();
  const match = clean.match(/\d+/);
  return {
    number: match ? Number(match[0]) : Number.POSITIVE_INFINITY,
    suffix: clean.replace(/\d+/g, "").trim().toLowerCase(),
  };
}

function sortItemsByBoxNumber<T extends StatsSourceItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aBox = boxNumberSortValue(a.number);
    const bBox = boxNumberSortValue(b.number);

    if (aBox.number !== bBox.number) return aBox.number - bBox.number;
    if (aBox.suffix !== bBox.suffix) return aBox.suffix.localeCompare(bBox.suffix);

    return displayPopName(a).localeCompare(displayPopName(b));
  });
}

function checklistRowName(item: Pick<SetChecklistItem, "pop_name" | "character">): string {
  return compactName(item.pop_name || item.character || "Unknown Pop");
}

function compareChecklistRows(a: SetChecklistItem, b: SetChecklistItem): number {
  const aBox = boxNumberSortValue(a.number);
  const bBox = boxNumberSortValue(b.number);

  if (aBox.number !== bBox.number) return aBox.number - bBox.number;
  if (aBox.suffix !== bBox.suffix) return aBox.suffix.localeCompare(bBox.suffix);

  return checklistRowName(a).localeCompare(checklistRowName(b));
}

function normalizedChecklistPart(value: string | null | undefined): string {
  return compactName(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function checklistVariantPart(value: string | null | undefined): string {
  const clean = normalizedChecklistPart(value);
  if (clean === "diamond collection" || clean === "diamond" || clean === "glitter") return "glitter";
  return !clean || clean === "common" ? "" : clean;
}

function checklistMatchKeysForOwnedItem(item: StatsSourceItem): string[] {
  const setName = normalizedChecklistPart(item.set_name);
  const number = normalizedChecklistPart(item.number);
  const name = normalizedChecklistPart(displayPopName(item));
  const character = normalizedChecklistPart(item.character);
  const variant = checklistVariantPart(item.display_variant || item.owned_variant || item.variant);
  const exclusivity = normalizedChecklistPart(item.exclusivity);
  const hasQualifier = Boolean(variant || exclusivity);
  const keys = new Set<string>();

  if (item.pop_catalog_id) keys.add(`catalog:${item.pop_catalog_id}`);
  if (setName && number && variant) keys.add(`set-number-variant:${setName}:${number}:${variant}`);
  if (setName && number && exclusivity) keys.add(`set-number-exclusive:${setName}:${number}:${exclusivity}`);
  if (setName && number && name && !hasQualifier) keys.add(`set-number-name:${setName}:${number}:${name}`);
  if (setName && number && character && !hasQualifier) keys.add(`set-number-name:${setName}:${number}:${character}`);
  if (setName && number && !hasQualifier) keys.add(`set-number:${setName}:${number}`);

  return Array.from(keys);
}

function checklistMatchKeysForChecklistRow(row: SetChecklistItem, setName: string, duplicateCatalogIds?: Set<string>): string[] {
  const normalizedSet = normalizedChecklistPart(setName);
  const number = normalizedChecklistPart(row.number);
  const name = normalizedChecklistPart(checklistRowName(row));
  const character = normalizedChecklistPart(row.character);
  const variant = checklistVariantPart(row.variant);
  const exclusivity = normalizedChecklistPart(row.exclusivity);
  const hasQualifier = Boolean(variant || exclusivity);
  const keys = new Set<string>();

  if (row.pop_catalog_id && !duplicateCatalogIds?.has(row.pop_catalog_id)) keys.add(`catalog:${row.pop_catalog_id}`);
  if (normalizedSet && number && variant) keys.add(`set-number-variant:${normalizedSet}:${number}:${variant}`);
  if (normalizedSet && number && exclusivity) keys.add(`set-number-exclusive:${normalizedSet}:${number}:${exclusivity}`);
  if (normalizedSet && number && name && !hasQualifier) keys.add(`set-number-name:${normalizedSet}:${number}:${name}`);
  if (normalizedSet && number && character && !hasQualifier) keys.add(`set-number-name:${normalizedSet}:${number}:${character}`);
  if (normalizedSet && number && !hasQualifier) keys.add(`set-number:${normalizedSet}:${number}`);

  return Array.from(keys);
}

function buildChecklistDisplayRows(checklistRows: SetChecklistItem[], ownedItems: StatsSourceItem[], setName: string): ChecklistDisplayRow[] {
  const ownedByKey = new Map<string, StatsSourceItem>();
  const catalogIdCounts = new Map<string, number>();

  for (const row of checklistRows) {
    if (row.pop_catalog_id) {
      catalogIdCounts.set(row.pop_catalog_id, (catalogIdCounts.get(row.pop_catalog_id) ?? 0) + 1);
    }
  }

  const duplicateCatalogIds = new Set(
    Array.from(catalogIdCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([catalogId]) => catalogId),
  );

  for (const item of ownedItems) {
    for (const key of checklistMatchKeysForOwnedItem(item)) {
      if (!ownedByKey.has(key)) ownedByKey.set(key, item);
    }
  }

  return checklistRows.map((row) => {
    const ownedItem = checklistMatchKeysForChecklistRow(row, setName, duplicateCatalogIds)
      .map((key) => ownedByKey.get(key))
      .find(Boolean);

    return {
      ...row,
      owned: Boolean(ownedItem),
      ownedItem,
    };
  });
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
      existing.signed_count = Number(existing.signed_count ?? 0) + (item.signed ? quantityNumber(item.quantity) || 1 : 0);
      if (item.signed && item.signature_authentication) existing.signature_authentication = item.signature_authentication;
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
      pop_type: item.pop_type,
      pop_style: item.pop_style,
      set_name: item.set_name,
      image_url: item.image_url,
      vault_status: item.vault_status,
      release_date: item.release_date,
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
      signed_count: item.signed ? quantityNumber(item.quantity) || 1 : 0,
      signature_authentication: item.signed ? item.signature_authentication : null,
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
  pop_type?: string | null;
}) {
  if (!item.limited_edition && !item.limited_count && !item.edition_notes) return null;
  if (isDigitalPopType(item.pop_type)) return "Production Run";
  return "Limited Edition";
}

function isDigitalPopType(value: string | null | undefined): boolean {
  return /\b(digital|nft)\b/i.test(String(value ?? ""));
}

function LimitedBadge({
  item,
  compact = false,
}: {
  item: { limited_edition?: boolean | null; limited_count?: number | null; edition_notes?: string | null; pop_type?: string | null };
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

function SignedBadge({ item, compact = false }: { item: { signed?: boolean | null; signed_count?: number | null; signature_authentication?: string | null }; compact?: boolean }) {
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

function vaultStatusText(item: { vault_status?: string | null }) {
  const status = String(item.vault_status ?? "").trim();
  if (!status) return null;
  if (/vault/i.test(status)) return "Vaulted";
  return status;
}

function releaseDateText(item: { release_date?: string | null }) {
  const value = String(item.release_date ?? "").trim();
  if (!value) return null;
  const year = value.match(/^(19|20)\d{2}/)?.[0];
  return year ? `Released ${year}` : null;
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
  exclusivity?: string | null;
  pop_type?: string | null;
  pop_style?: string | null;
}) {
  const variant = item.display_variant || item.variant;
  const type = String(item.pop_type ?? "").trim();
  const style = String(item.pop_style ?? "").trim();
  const hasUsefulType = type && !/^pop!?$/i.test(type);
  const hasSpecialStyle = style && !/^(standard|common|pop)$/i.test(style);
  return [
    item.set_name && item.franchise && item.set_name !== item.franchise ? item.franchise : null,
    hasUsefulType ? type : null,
    hasSpecialStyle ? style : null,
    item.number ? `#${item.number}` : null,
    variant && !/^common$/i.test(variant) ? variant : null,
    item.exclusivity,
  ]
    .filter(Boolean)
    .join("  •  ");
}

function displayPopName(
  item: {
    pop_name?: string | null;
    character?: string | null;
    number?: string | null;
    set_name?: string | null;
    upc?: string | null;
    owned_variant?: string | null;
    display_variant?: string | null;
    variant?: string | null;
  },
  variantOverride?: string | null,
) {
  const variant = String(variantOverride ?? item.owned_variant ?? item.display_variant ?? item.variant ?? "").trim();
  const name = String(item.pop_name ?? item.character ?? "").trim();
  const isHammerOfBoravia =
    item.upc === "889698866439" ||
    (item.number === "583" && /superman \(2025\)/i.test(String(item.set_name ?? "")) && /hammer of boravia/i.test(name));

  if (isHammerOfBoravia && /^chase$/i.test(variant)) {
    return "DC's Ultraman";
  }

  return compactName(item.pop_name ?? item.character);
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
  const [selectedAdminFix, setSelectedAdminFix] = useState<{ catalogId: string; reportId?: string } | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<SharedShelf | null>(null);
  const [selectedPublicProfileId, setSelectedPublicProfileId] = useState<string | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>(NO_COLLECTION_FILTER);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled) setIsAdmin(Boolean(data && !error));
      });

    return () => {
      cancelled = true;
    };
  }, [session.user.id]);

  const goHome = () => {
    setSelectedItem(null);
    setSelectedAdminFix(null);
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
          onAdmin={isAdmin ? () => setScreen("admin") : undefined}
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
          onSettings={() => setScreen("sharedShelfSettings")}
          onOpenProfile={(userId) => {
            setSelectedPublicProfileId(userId);
            setScreen("publicProfile");
          }}
        />
      )}
      {screen === "sharedShelfSettings" && selectedShelf && (
        <SharedShelfSettingsScreen
          shelf={selectedShelf}
          session={session}
          onBack={() => setScreen("sharedShelfDetail")}
          onShelfUpdated={(shelf) => setSelectedShelf(shelf)}
          onShelfLeft={() => {
            setSelectedShelf(null);
            setScreen("sharedShelf");
          }}
        />
      )}
      {screen === "profile" && <ProfileScreen session={session} onBack={goHome} />}
      {screen === "admin" && isAdmin && (
        <ManagedAdminScreen
          appVersion={APP_VERSION}
          session={session}
          onBack={goHome}
          styles={styles}
          onFixCatalog={(catalogId, reportId) => {
            setSelectedAdminFix({ catalogId, reportId });
            setScreen("adminCatalogFix");
          }}
        />
      )}
      {screen === "adminCatalogFix" && isAdmin && selectedAdminFix && (
        <ManagedAdminCatalogFixScreen
          appVersion={APP_VERSION}
          session={session}
          catalogId={selectedAdminFix.catalogId}
          styles={styles}
          reportId={selectedAdminFix.reportId}
          onBack={() => setScreen("admin")}
          onSaved={() => {
            setSelectedAdminFix(null);
            setScreen("admin");
          }}
        />
      )}
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
  onAdmin,
}: {
  session: Session;
  refreshKey: number;
  onScan: () => void;
  onCollection: () => void;
  onShelfStats: () => void;
  onOpenItem: (item: CollectionItem) => void;
  onSharedShelf: () => void;
  onProfile: () => void;
  onAdmin?: () => void;
}) {
  const [dashboard, setDashboard] = useState<DashboardHome | null>(null);
  const [highestValuePop, setHighestValuePop] = useState<CollectionItem | null>(null);
  const [oldestPop, setOldestPop] = useState<CollectionItem | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    const [{ data, error }, highestResult, oldestResult, profileResult] = await Promise.all([
      supabase.from("dashboard_home_view").select("*").eq("user_id", session.user.id).maybeSingle(),
      supabase.from("user_collection_view").select("*").eq("user_id", session.user.id).order("value_each", { ascending: false, nullsFirst: false }).limit(1),
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

  const collectorMode = normalizeCollectorMode(profile?.collector_mode);
  const dashboardCopy = collectorModeDashboardCopy(collectorMode);
  const valueSummary = (
    <View style={styles.dashboardValueCard}>
      <Text style={styles.dashboardValueLabel}>{dashboardCopy.valueTitle}</Text>
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
        <Text style={styles.dashboardGainLabel}>{collectorMode === "reseller" ? "Net Gain" : "Shelf Change"}</Text>
        <Text style={[styles.dashboardGainValue, gainLossColorStyle(dashboard?.gain_loss)]}>{money(dashboard?.gain_loss)}</Text>
      </View>
    </View>
  );
  const valueSnapshot = (
    <View style={styles.dashboardInsightPanel}>
      <Text style={styles.dashboardSectionTitle}>{dashboardCopy.insightTitle}</Text>
      {collectorMode === "reseller" ? (
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
      ) : null}
      <TopStatRow
        label={collectorMode === "reseller" ? "Highest Valued Pop" : "Shelf Standout"}
        item={highestValuePop}
        value={money(highestValuePop ? perPopValue(highestValuePop) : null)}
        onPress={highestValuePop ? () => onOpenItem(highestValuePop) : undefined}
      />
      <TopStatRow
        label={collectorMode === "avid" ? "Earliest Release" : "Oldest Pop"}
        item={oldestPop}
        value={oldestPop ? releaseDateText(oldestPop) ?? "--" : "--"}
        onPress={oldestPop ? () => onOpenItem(oldestPop) : undefined}
      />
    </View>
  );

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
                <Text style={styles.dashboardEyebrow}>{dashboardCopy.eyebrow}</Text>
                <Text style={styles.dashboardGreeting} adjustsFontSizeToFit numberOfLines={1}>
                  {dashboard?.greeting_text ?? "Welcome back, Collector"}
                </Text>
              </View>
            </View>
            <Text style={styles.dashboardSubtext}>{dashboardActivityText(dashboard)}</Text>
            <View style={styles.dashboardModeBadge}>
              <Text style={styles.dashboardModeBadgeText}>{collectorModeLabel(collectorMode)}</Text>
            </View>
          </View>

          <View style={styles.dashboardStatsGrid}>
            <MetricCard label="Pops" value={integer(dashboard?.total_pops)} />
            <MetricCard label="Unique Pops" value={integer(dashboard?.unique_items)} />
            <MetricCard label="Added This Month" value={integer(dashboard?.pops_added_this_month)} />
          </View>

          {valueSnapshot}
          {valueSummary}

          <View style={styles.dashboardActionPanel}>
            <Text style={styles.dashboardSectionTitle}>Quick Actions</Text>
            <View style={styles.dashboardActionGrid}>
              <Pressable onPress={onScan} style={styles.dashboardPrimaryAction}>
                <Text style={styles.dashboardActionLabel}>Scan Pop</Text>
                <Text style={styles.dashboardActionSub}>Add or update an item</Text>
              </Pressable>
              <Pressable onPress={onShelfStats} style={styles.dashboardStatsQuickAction}>
                <Text style={styles.dashboardActionLabel}>{dashboardCopy.statsActionLabel}</Text>
                <Text style={styles.dashboardActionSub}>{dashboardCopy.statsActionSub}</Text>
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

          <View style={styles.dashboardModePanel}>
            <View style={styles.dashboardModePanelTop}>
              <View style={styles.flex}>
                <Text style={styles.dashboardEyebrow}>Current mode</Text>
                <Text style={styles.dashboardModeTitle}>{dashboardCopy.focusTitle}</Text>
              </View>
              <Pressable onPress={onProfile} style={styles.dashboardModeChangeButton}>
                <Text style={styles.dashboardModeChangeText}>Change</Text>
              </Pressable>
            </View>
            <Text style={styles.dashboardSubtext}>{dashboardCopy.focusBody}</Text>
            <View style={styles.dashboardModeFocusRow}>
              <ModeFocusPill label={dashboardCopy.primaryFocus} />
              <ModeFocusPill label={dashboardCopy.secondaryFocus} />
              <ModeFocusPill label={dashboardCopy.tertiaryFocus} />
            </View>
          </View>
        </>
      )}
    </ScreenFrame>
  );
}

function ModeFocusPill({ label }: { label: string }) {
  return (
    <View style={styles.dashboardModeFocusPill}>
      <Text style={styles.dashboardModeFocusText}>{label}</Text>
    </View>
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
      if (String(item.vault_status ?? "").toLowerCase().includes("vault")) vaultedCount += quantity;
      if (item.limited_edition || item.limited_count || item.edition_notes) limitedCount += quantity;
      if (!item.image_url) missingImage += 1;
      if (valueEach <= 0) missingValue += 1;
      if (!item.condition || item.condition === "Unknown") unknownCondition += 1;
      if (isRecentCollectionItem(item)) recentAdds += quantity;
      if (!topValue || valueEach > Number(perPopValue(topValue) ?? 0)) topValue = item;
      if (!biggestGain || gainLoss > Number(biggestGain.gain_loss ?? 0)) biggestGain = item;
      if (valueEach > 0 && (!lowestValue || valueEach < Number(perPopValue(lowestValue) ?? 0))) lowestValue = item;
    }

    const gainLoss = totalValue - totalPaid;
    const gainLossPercent = totalPaid > 0 ? (gainLoss / totalPaid) * 100 : null;
    const uniqueShelfItems = uniqueShelfKeys.size;
    const duplicateCopies = Math.max(0, duplicateQuantity - duplicateShelfKeys.size);

    const franchiseGroups = buildStatsGroups(items, "franchise");
    const setGroups = addSetCompletion(buildStatsGroups(items, "set"), setChecklists);
    const topFranchises = [...franchiseGroups].sort((a, b) => b.value - a.value || b.count - a.count || a.name.localeCompare(b.name)).slice(0, 5);
    const topSets = [...setGroups].sort((a, b) => b.value - a.value || b.count - a.count || a.name.localeCompare(b.name)).slice(0, 5);
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
            <Text style={styles.dashboardSectionTitle}>Top Franchises</Text>
            {stats.topFranchises.length === 0 ? (
              <Text style={styles.mutedText}>Add Pops to your shelf to see highlights here.</Text>
            ) : (
              stats.topFranchises.map((group, index) => (
                <StatsHighlightRow
                  key={group.key}
                  rank={index + 1}
                  group={group}
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
  const [setChecklists, setSetChecklists] = useState<Record<string, SetChecklistSummary>>({});
  const [activeShelfId, setActiveShelfId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("all");
  const [busy, setBusy] = useState(true);
  const [sharedBusy, setSharedBusy] = useState(false);
  const [groupMode, setGroupMode] = useState<StatsGroupMode>("franchise");
  const [sortMode, setSortMode] = useState<BreakdownSortMode>("value");
  const [searchText, setSearchText] = useState("");
  const deferredSearchText = useDeferredValue(searchText);
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);
  const [showAllBreakdownRowsKey, setShowAllBreakdownRowsKey] = useState<string | null>(null);
  const [setChecklistViewMode, setSetChecklistViewMode] = useState<SetChecklistViewMode>("owned");
  const [checklistItemsBySetId, setChecklistItemsBySetId] = useState<Record<string, SetChecklistItem[]>>({});
  const [checklistLoadingSetId, setChecklistLoadingSetId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [rows, shelves, checklistRows] = await Promise.all([
        fetchUserCollectionItems(session.user.id),
        fetchMySharedShelves().catch(() => [] as SharedShelf[]),
        fetchSetChecklistSummaries(),
      ]);
      const firstShelf = shelves[0] ?? null;

      setItems(rows);
      setSharedShelves(shelves);
      setSetChecklists(checklistRows);
      setActiveShelfId(firstShelf?.id ?? null);
      setSharedItems([]);
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

  useEffect(() => {
    let cancelled = false;

    const loadSharedShelf = async () => {
      if (!activeShelfId) {
        setSharedItems([]);
        setSelectedMemberId("all");
        setExpandedGroupKey(null);
        setShowAllBreakdownRowsKey(null);
        return;
      }

      setSharedBusy(true);
      try {
        const shelfRows = await fetchSharedShelfCollectionItems(activeShelfId);
        if (!cancelled) {
          setSharedItems(shelfRows);
          setSelectedMemberId("all");
          setExpandedGroupKey(null);
          setShowAllBreakdownRowsKey(null);
        }
      } catch (error) {
        if (!cancelled) {
          Alert.alert("Shared shelf error", error instanceof Error ? error.message : "Unable to load that shared shelf.");
          setSharedItems([]);
        }
      } finally {
        if (!cancelled) setSharedBusy(false);
      }
    };

    loadSharedShelf();

    return () => {
      cancelled = true;
    };
  }, [activeShelfId]);

  const ensureChecklistItems = useCallback(
    async (checklist: SetChecklistSummary | null | undefined) => {
      if (!checklist?.set_id || checklistItemsBySetId[checklist.set_id] || checklistLoadingSetId === checklist.set_id) return;

      setChecklistLoadingSetId(checklist.set_id);
      try {
        const rows = await fetchSetChecklistItems(checklist.set_id);
        setChecklistItemsBySetId((current) => ({
          ...current,
          [checklist.set_id]: rows,
        }));
      } catch (error) {
        Alert.alert("Set checklist error", error instanceof Error ? error.message : "Unable to load the full set checklist.");
      } finally {
        setChecklistLoadingSetId((current) => (current === checklist.set_id ? null : current));
      }
    },
    [checklistItemsBySetId, checklistLoadingSetId],
  );

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

  const groups = useMemo(() => {
    const baseGroups = buildStatsGroups(breakdownItems, groupMode);
    return groupMode === "set" ? addSetCompletion(baseGroups, setChecklists) : baseGroups;
  }, [breakdownItems, groupMode, setChecklists]);

  const filteredGroups = useMemo(() => {
    const term = deferredSearchText.trim().toLowerCase();
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
  }, [groups, deferredSearchText, sortMode]);

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
  const canExpandGroup = activeShelf || groupMode === "set";
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

          {sharedShelves.length > 1 ? (
            <View style={styles.breakdownSwitchPanel}>
              <Text style={styles.breakdownSwitchLabel}>Shared shelf</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.breakdownShelfTabs}>
                {sharedShelves.map((shelf) => (
                  <Pressable
                    key={shelf.id}
                    onPress={() => {
                      setActiveShelfId(shelf.id);
                      setShowAllBreakdownRowsKey(null);
                    }}
                    style={[styles.breakdownShelfTab, activeShelfId === shelf.id && styles.breakdownShelfTabActive]}
                  >
                    <Text style={styles.breakdownShelfTabName} numberOfLines={1}>
                      {shelf.name || "Shared Shelf"}
                    </Text>
                    <Text style={styles.breakdownShelfTabMeta}>
                      {integer(shelf.member_count ?? 0)} members
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {activeShelf && memberTabs.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.breakdownMemberTabs}>
              {memberTabs.map((member) => (
                <Pressable
                  key={member.id}
                  onPress={() => {
                    setSelectedMemberId(member.id);
                    setExpandedGroupKey(null);
                    setShowAllBreakdownRowsKey(null);
                  }}
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
                  onPress={() => {
                    setGroupMode(mode);
                    setExpandedGroupKey(null);
                    setShowAllBreakdownRowsKey(null);
                  }}
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
              {activeShelf ? "Tap a row to see the Pops inside it." : "Tap a row to open the matching shelf view."}
            </Text>

            {sharedBusy ? (
              <ActivityIndicator color="#7e67f4" />
            ) : filteredGroups.length === 0 ? (
              <Text style={styles.mutedText}>No matching groups found.</Text>
            ) : (
              filteredGroups.map((group) => {
                const valueBarPercent = Math.max(4, Math.min(100, (group.value / maxValue) * 100));
                const expanded = expandedGroupKey === group.key;
                const checklist = groupMode === "set" ? setChecklists[group.name.toLowerCase()] : null;
                const checklistRows = checklist?.set_id ? checklistItemsBySetId[checklist.set_id] ?? [] : [];
                const checklistLoading = Boolean(checklist?.set_id && checklistLoadingSetId === checklist.set_id);
                const checklistDisplayRows = checklistRows.length > 0 ? buildChecklistDisplayRows(checklistRows, group.items, group.name) : [];
                const matchedChecklistCount = checklistDisplayRows.filter((row) => row.owned).length;
                const stableOwnedCount = group.completionOwnedCount ?? group.uniqueCount;
                const displayCompletionOwnedCount = Math.max(stableOwnedCount, matchedChecklistCount);
                const displayCompletionTotal = Math.max(
                  Number(checklist?.required_count ?? group.checklistTotal ?? 0),
                  checklistRows.length,
                  displayCompletionOwnedCount,
                );
                const displayCompletionPercent =
                  displayCompletionTotal > 0 ? Math.min(100, (displayCompletionOwnedCount / displayCompletionTotal) * 100) : null;
                const hasCompletion = Boolean(displayCompletionTotal && displayCompletionPercent != null);
                const completionBarPercent = Math.max(4, Math.min(100, Number(displayCompletionPercent ?? 0)));
                const barWidth = `${hasCompletion ? completionBarPercent : valueBarPercent}%` as `${number}%`;
                const completionLine =
                  hasCompletion && displayCompletionPercent != null
                    ? `${integer(displayCompletionOwnedCount)} of ${integer(displayCompletionTotal)} owned - ${percent(displayCompletionPercent)} complete`
                    : setCompletionText(group);
                const missingRows = checklistDisplayRows.filter((row) => !row.owned);
                const displayMissingCount =
                  checklistDisplayRows.length > 0 ? missingRows.length : Math.max(0, displayCompletionTotal - displayCompletionOwnedCount);
                const premiumDisplay =
                  groupMode === "set" ? setPremiumDisplay(group, displayCompletionOwnedCount, displayCompletionTotal) : null;
                const visibleChecklistRows =
                  setChecklistViewMode === "missing"
                    ? missingRows
                    : setChecklistViewMode === "full"
                      ? checklistDisplayRows
                      : [];
                const expandedOwnedRows = sortItemsByBoxNumber(group.items);
                const expandedRowsCount = setChecklistViewMode === "owned" ? expandedOwnedRows.length : visibleChecklistRows.length;
                return (
                  <View key={group.key} style={styles.breakdownGroupRow}>
                    <Pressable
                      onPress={
                        canOpenGroup && !canExpandGroup
                          ? () => onOpenFilter({ kind: filterKind, label: group.name, value: group.name })
                          : () => {
                              setExpandedGroupKey(expanded ? null : group.key);
                              setShowAllBreakdownRowsKey(null);
                              setSetChecklistViewMode("owned");
                              if (!expanded && checklist) void ensureChecklistItems(checklist);
                            }
                      }
                      style={({ pressed }) => [styles.breakdownGroupPressable, pressed && styles.pressed]}
                    >
                      <View style={styles.flex}>
                        <View style={styles.breakdownGroupHeaderRow}>
                          <View style={styles.flex}>
                            <Text style={styles.breakdownGroupName} numberOfLines={1}>
                              {group.name}
                            </Text>
                            <Text style={styles.breakdownGroupMeta}>{integer(group.uniqueCount)} unique Pops</Text>
                            {completionLine ? <Text style={styles.setCompletionText}>{completionLine}</Text> : null}
                          </View>
                          <Text style={styles.groupChevron}>{canOpenGroup && !canExpandGroup ? "View" : expanded ? "Hide" : "Open"}</Text>
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
                        {premiumDisplay ? (
                          <Text style={[styles.setPremiumText, premiumDisplay.isActive ? styles.setPremiumTextActive : null]}>
                            {premiumDisplay.text}
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                    {expanded ? (
                      <View style={styles.statsGroupDetail}>
                        {groupMode === "set" && checklist ? (
                          <>
                            <View style={styles.setChecklistTabs}>
                              {([
                                ["owned", `Owned ${integer(displayCompletionOwnedCount)}`],
                                ["missing", `Missing ${integer(displayMissingCount)}`],
                                ["full", `Full ${integer(checklist.required_count ?? checklistRows.length)}`],
                              ] as const).map(([mode, label]) => (
                                <Pressable
                                  key={mode}
                                  onPress={() => {
                                    setSetChecklistViewMode(mode);
                                    setShowAllBreakdownRowsKey(null);
                                    void ensureChecklistItems(checklist);
                                  }}
                                  style={[styles.setChecklistTab, setChecklistViewMode === mode && styles.setChecklistTabActive]}
                                >
                                  <Text style={[styles.setChecklistTabText, setChecklistViewMode === mode && styles.setChecklistTabTextActive]}>
                                    {label}
                                  </Text>
                                </Pressable>
                              ))}
                            </View>
                            {checklistLoading ? <ActivityIndicator color="#7e67f4" /> : null}
                          </>
                        ) : null}

                        {setChecklistViewMode === "owned" || groupMode !== "set" || !checklist ? (
                          expandedOwnedRows
                            .slice(0, showAllBreakdownRowsKey === group.key ? expandedOwnedRows.length : BREAKDOWN_EXPANDED_ROW_LIMIT)
                            .map((item) => <StatsPopRow key={item.collection_item_id} item={item} />)
                        ) : visibleChecklistRows.length === 0 && !checklistLoading ? (
                          <Text style={styles.mutedSmall}>
                            {setChecklistViewMode === "missing" ? "No missing Pops found for this reviewed checklist." : "No checklist rows loaded for this set yet."}
                          </Text>
                        ) : (
                          visibleChecklistRows
                            .slice(0, showAllBreakdownRowsKey === group.key ? visibleChecklistRows.length : BREAKDOWN_EXPANDED_ROW_LIMIT)
                            .map((row) => <ChecklistPopRow key={row.id} row={row} />)
                        )}
                        {expandedRowsCount > BREAKDOWN_EXPANDED_ROW_LIMIT ? (
                          <Pressable
                            onPress={() => setShowAllBreakdownRowsKey(showAllBreakdownRowsKey === group.key ? null : group.key)}
                            style={({ pressed }) => [styles.showMoreRowsButton, pressed && styles.pressed]}
                          >
                            <Text style={styles.showMoreRowsText}>
                              {showAllBreakdownRowsKey === group.key ? "Show fewer" : `Show ${integer(expandedRowsCount - BREAKDOWN_EXPANDED_ROW_LIMIT)} more`}
                            </Text>
                          </Pressable>
                        ) : null}
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
  const [selectedExclusivity, setSelectedExclusivity] = useState("None");
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
    setSelectedExclusivity("None");
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
    setSelectedExclusivity(foundPop.exclusivity || "None");
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
    const cleanExclusivity = selectedExclusivity && selectedExclusivity !== "None" ? selectedExclusivity : null;
    const selectedCondition = ownedCondition || "Unknown";
    let activeLookup = lookup;

    if ((lookup.exclusivity ?? null) !== cleanExclusivity && lookup.upc) {
      const { data: updateData, error: updateError } = await supabase.functions.invoke("lookup_pop", {
        body: { barcode: lookup.upc, exclusivityOverride: cleanExclusivity },
      });

      if (updateError) {
        setBusy(false);
        Alert.alert("Exclusivity update failed", await getFunctionErrorMessage(updateError, lookup.upc));
        return;
      }

      const updateResponse = updateData as LookupResponse;
      if (updateResponse.pop) {
        activeLookup = updateResponse.pop;
        setLookup(updateResponse.pop);
      }
    }

    const { data: existingRows, error: existingError } = await supabase
      .from("user_collection_items")
      .select("id, quantity, condition, owned_variant")
      .eq("user_id", auth.user.id)
      .eq("pop_catalog_id", activeLookup.id);

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
          pop_catalog_id: activeLookup.id,
          quantity: 1,
          condition: selectedCondition,
          owned_variant: selectedVariant,
          current_value: activeLookup.estimated_value ?? 0,
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
        Alert.alert("Added to shelf", addedMessage ?? `${displayPopName(activeLookup, selectedVariant)} was added. Ready for the next scan.`);
        openScanner();
        return;
      }
      onAdded({
        ...(item as CollectionItem),
        display_description: (item as CollectionItem).display_description ?? activeLookup.display_description,
        display_variant: (item as CollectionItem).display_variant ?? activeLookup.variant,
        variant: (item as CollectionItem).variant ?? activeLookup.variant,
        exclusivity: (item as CollectionItem).exclusivity ?? activeLookup.exclusivity,
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
      await finishAdd(matchingRow.id, `${displayPopName(activeLookup, selectedVariant)} quantity is now ${nextQuantity}. Ready for the next scan.`);
    };

    if (matchingRow) {
      setBusy(false);
      const message = `${displayPopName(activeLookup, selectedVariant)} (${selectedVariant}, ${selectedCondition}) is already on your shelf. Add another copy?`;
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
    const cleanExclusivity = selectedExclusivity && selectedExclusivity !== "None" ? selectedExclusivity : null;
    if ((lookup.exclusivity ?? null) !== cleanExclusivity && lookup.upc) {
      const { data: updateData, error: updateError } = await supabase.functions.invoke("lookup_pop", {
        body: { barcode: lookup.upc, exclusivityOverride: cleanExclusivity },
      });

      if (updateError) {
        setWishlistBusy(false);
        Alert.alert("Exclusivity update failed", await getFunctionErrorMessage(updateError, lookup.upc));
        return;
      }

      const updateResponse = updateData as LookupResponse;
      if (updateResponse.pop) {
        setLookup(updateResponse.pop);
      }
    }

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
      Alert.alert("Already on wishlist", `${displayPopName(lookup, ownedVariant)} is already waiting on your wishlist.`);
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

    Alert.alert("Added to wishlist", `${displayPopName(lookup, ownedVariant)} is now on your wishlist.`);
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
              <Text style={styles.resultName}>{displayPopName(lookup, ownedVariant)}</Text>
              <Text style={styles.mutedText}>{lookup.upc}</Text>
              {shelfMetaLine(lookup) ? (
                <Text style={styles.itemDetailLine} numberOfLines={2}>
                  {shelfMetaLine(lookup)}
                </Text>
              ) : null}
              <LimitedBadge item={lookup} />
              <Text style={styles.scanValueText}>Estimated value: {money(lookup.estimated_value)}</Text>
              {lookup.image_url ? <Image source={{ uri: lookup.image_url }} style={styles.resultImage} /> : <EmptyDisplayBox style={styles.resultImage} />}
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
              <Label>Exclusivity</Label>
              <ExclusivityPicker value={selectedExclusivity} onChange={setSelectedExclusivity} />
              <Text style={styles.mutedSmall}>Use this for convention, retailer, or Funko Shop exclusives.</Text>
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
      .select("id,upc,pop_name,character,franchise,number,variant,exclusivity,pop_type,pop_style,set_name,image_url,vault_status,release_date,estimated_value,display_description,limited_edition,limited_count,edition_notes")
      .or(`pop_name.ilike.%${term}%,character.ilike.%${term}%,franchise.ilike.%${term}%,set_name.ilike.%${term}%,pop_type.ilike.%${term}%,pop_style.ilike.%${term}%,number.ilike.%${term}%`)
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
              {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.catalogResultImage} /> : <EmptyDisplayBox style={styles.catalogResultImagePlaceholder} />}
              <View style={styles.flex}>
                <Text style={styles.itemTitle} numberOfLines={2}>{displayPopName(item, selectedCatalog?.id === item.id ? variant : item.variant)}</Text>
                <Text style={styles.mutedSmall} numberOfLines={1}>{[item.franchise, item.set_name, shelfMetaLine(item)].filter(Boolean).join("  ")}</Text>
                {releaseDateText(item) ? <Text style={styles.mutedSmall}>{releaseDateText(item)}</Text> : null}
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

const CollectionListCard = React.memo(function CollectionListCard({
  item,
  onOpenItem,
}: {
  item: CollectionItem;
  onOpenItem: (item: CollectionItem) => void;
}) {
  const metaLine = shelfMetaLine(item);
  const itemValue = perPopValue(item);
  const quantity = quantityNumber(item.quantity);

  return (
    <Pressable onPress={() => onOpenItem(item)} style={styles.collectionCard}>
      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.thumb} /> : <EmptyDisplayBox style={styles.thumbPlaceholder} />}
      <View style={styles.collectionMiddle}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {displayPopName(item)}
        </Text>
        <Text style={styles.mutedText} numberOfLines={1}>
          {compactName(item.set_name || item.franchise)}
        </Text>
        {metaLine ? (
          <Text style={styles.itemDetailLine} numberOfLines={1}>
            {metaLine}
          </Text>
        ) : null}
        <View style={styles.cardBadgeRow}>
          <VaultBadge item={item} compact />
          <LimitedBadge item={item} compact />
          <SignedBadge item={item} compact />
        </View>
        <Text style={styles.itemMeta}>Qty: {integer(item.quantity)}</Text>
      </View>
      <View style={styles.valueColumn}>
        <Text style={styles.mutedSmall}>Value</Text>
        <Text style={styles.itemMoney} adjustsFontSizeToFit numberOfLines={1}>
          {money(itemValue)}
        </Text>
        {quantity > 1 ? (
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
  );
});

const SharedShelfListCard = React.memo(function SharedShelfListCard({ item }: { item: SharedShelfGroupedItem }) {
  const totalQuantity = quantityNumber(item.total_quantity);
  const hasMultipleCopies = totalQuantity > 1;
  const metaLine = shelfMetaLine(item);
  const released = releaseDateText(item);
  const itemValue = perPopValue(item);

  return (
    <View style={styles.collectionCard}>
      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.thumb} /> : <EmptyDisplayBox style={styles.thumbPlaceholder} />}
      <View style={styles.collectionMiddle}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {displayPopName(item)}
        </Text>
        <Text style={styles.mutedText} numberOfLines={1}>
          {compactName(item.set_name || item.franchise)}
        </Text>
        {metaLine ? (
          <Text style={styles.itemDetailLine} numberOfLines={1}>
            {metaLine}
          </Text>
        ) : null}
        {released ? (
          <Text style={styles.mutedSmall} numberOfLines={1}>
            {released}
          </Text>
        ) : null}
        <Text style={styles.itemMeta}>In Shelf: {integer(totalQuantity)}</Text>
        <View style={styles.cardBadgeRow}>
          <VaultBadge item={item} compact />
          <LimitedBadge item={item} compact />
          <SignedBadge item={item} compact />
        </View>
        {item.variants_owned ? <Text style={styles.mutedSmall} numberOfLines={1}>Variants: {item.variants_owned}</Text> : null}
        <Text style={styles.ownerPill} numberOfLines={2}>Owned by: {item.owner_names}</Text>
      </View>
      <View style={styles.valueColumn}>
        <Text style={styles.mutedSmall}>{hasMultipleCopies ? "Each" : "Value"}</Text>
        <Text style={styles.itemMoney} adjustsFontSizeToFit numberOfLines={1}>
          {money(itemValue)}
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
});

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
  const deferredSearch = useDeferredValue(search);

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
    const term = deferredSearch.trim().toLowerCase();
    const duplicateShelfKeys = activeFilter.kind === "duplicates" ? buildDuplicateShelfKeys(items) : undefined;
    const sliced = items.filter((item) => matchesCollectionFilter(item, activeFilter, duplicateShelfKeys));
    const filtered = term
      ? sliced.filter((item) =>
          [item.pop_name, item.character, item.franchise, item.set_name, item.pop_type, item.pop_style, item.exclusivity, item.upc, item.number].some((value) =>
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
  }, [items, deferredSearch, sort, activeFilter]);

  const renderCollectionItem = useCallback(
    ({ item }: { item: CollectionItem }) => <CollectionListCard item={item} onOpenItem={onOpenItem} />,
    [onOpenItem],
  );

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
        renderItem={renderCollectionItem}
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
  onSettings,
  onOpenProfile,
}: {
  shelf: SharedShelf;
  session: Session;
  onBack: () => void;
  onSettings: () => void;
  onOpenProfile: (userId: string) => void;
}) {
  const [memberItems, setMemberItems] = useState<SharedShelfCollectionItem[]>([]);
  const [members, setMembers] = useState<SharedShelfMember[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("Newest first");
  const [selectedOwner, setSelectedOwner] = useState<string>("all");
  const [groupMode, setGroupMode] = useState<StatsGroupMode>("franchise");
  const [setChecklists, setSetChecklists] = useState<Record<string, SetChecklistSummary>>({});
  const [busy, setBusy] = useState(true);
  const deferredSearch = useDeferredValue(search);

  const load = useCallback(async () => {
    setBusy(true);

    try {
      const [data, memberRows, checklistRows] = await Promise.all([
        fetchSharedShelfCollectionItems(shelf.id),
        fetchSharedShelfMembers(shelf.id),
        fetchSetChecklistSummaries(),
      ]);
      setMemberItems(data);
      setMembers(memberRows);
      setSetChecklists(checklistRows);
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
    const term = deferredSearch.trim().toLowerCase();
    const filtered = term
      ? shelfItems.filter((item) =>
          [item.pop_name, item.character, item.franchise, item.set_name, item.pop_type, item.pop_style, item.exclusivity, item.upc, item.number, item.owner_names, item.variants_owned].some((value) =>
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
  }, [shelfItems, deferredSearch, sort]);

  const topShelfPops = useMemo(
    () =>
      [...shelfItems]
        .filter((item) => Number(perPopValue(item) ?? 0) > 0)
        .sort((a, b) => Number(perPopValue(b) ?? 0) - Number(perPopValue(a) ?? 0))
        .slice(0, 2),
    [shelfItems],
  );

  const sharedGroupItems = useMemo(
    () => (selectedOwner === "all" ? memberItems : memberItems.filter((item) => item.owner_user_id === selectedOwner)),
    [memberItems, selectedOwner],
  );

  const sharedGroups = useMemo(() => {
    const baseGroups = buildStatsGroups(sharedGroupItems, groupMode);
    return groupMode === "set" ? addSetCompletion(baseGroups, setChecklists) : baseGroups;
  }, [sharedGroupItems, groupMode, setChecklists]);
  const sharedGroupTitle = groupMode === "franchise" ? "Franchise Totals" : "Set Totals";

  const memberCount = members.length || ownerTiles.length;
  const ownerSummary = useMemo(
    () =>
      shelfItems.reduce(
        (summary, item) => ({
          totalPops: summary.totalPops + Number(item.total_quantity ?? 0),
          totalValue: summary.totalValue + Number(item.total_value ?? 0),
        }),
        { totalPops: 0, totalValue: 0 },
      ),
    [shelfItems],
  );
  const activeOwner = ownerTiles.find((owner) => owner.id === selectedOwner);
  const isAllOwners = selectedOwner === "all";
  const shelfSummary = useMemo(
    () =>
      allShelfItems.reduce(
        (summary, item) => ({
          totalPops: summary.totalPops + Number(item.total_quantity ?? 0),
          totalValue: summary.totalValue + Number(item.total_value ?? 0),
        }),
        { totalPops: 0, totalValue: 0 },
      ),
    [allShelfItems],
  );
  const totalPops = ownerSummary.totalPops;
  const totalValue = ownerSummary.totalValue;
  const shelfTotalPops = shelfSummary.totalPops;
  const shelfTotalValue = shelfSummary.totalValue;
  const shelfAvgPopValue = shelfTotalPops > 0 ? shelfTotalValue / shelfTotalPops : 0;
  const renderSharedShelfItem = useCallback(
    ({ item }: { item: SharedShelfGroupedItem }) => <SharedShelfListCard item={item} />,
    [],
  );

  return (
    <ScreenFrame title={shelf.name} onBack={onBack} rightLabel="Settings" onRight={onSettings} scroll={false}>
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
                  <Text style={styles.mutedText}>{integer(shelfTotalPops)} Pops across {integer(memberCount)} members</Text>
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
                  <Text style={styles.sharedShelfSummaryValue}>{integer(memberCount)}</Text>
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
                      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.topPopImage} /> : <EmptyDisplayBox style={styles.topPopImagePlaceholder} />}
                      <View style={styles.flex}>
                        <Text style={styles.topPopName} numberOfLines={2}>
                          {displayPopName(item)}
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

            <View style={styles.dashboardInsightPanel}>
              <View style={styles.statsPanelHeader}>
                <View style={styles.flex}>
                  <Text style={styles.dashboardSectionTitle}>{sharedGroupTitle}</Text>
                  <Text style={styles.mutedSmall}>Shared shelf totals by franchise or set.</Text>
                </View>
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
              </View>

              {sharedGroups.length === 0 ? (
                <Text style={styles.mutedText}>When members add Pops, group totals will show here.</Text>
              ) : (
                sharedGroups.slice(0, 6).map((group) => {
                  const completionLine = setCompletionText(group);
                  const premiumDisplay = groupMode === "set" ? setPremiumDisplay(group) : null;
                  return (
                    <View key={group.key} style={styles.statsGroupHeader}>
                      <View style={styles.flex}>
                        <Text style={styles.statsListTitle} numberOfLines={1}>
                          {group.name}
                        </Text>
                        <Text style={styles.mutedSmall}>
                          {integer(group.count)} Pops, {integer(group.uniqueCount)} unique
                        </Text>
                        {completionLine ? <Text style={styles.setCompletionText}>{completionLine}</Text> : null}
                        {premiumDisplay ? (
                          <Text style={[styles.setPremiumText, premiumDisplay.isActive ? styles.setPremiumTextActive : null]}>
                            {premiumDisplay.text}
                          </Text>
                        ) : null}
                        <Text style={styles.mutedSmall}>Avg pop {money(group.averageValue)}</Text>
                      </View>
                      <View style={styles.alignEnd}>
                        <Text style={styles.statsListValue}>{money(group.value)}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

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
        renderItem={renderSharedShelfItem}
      />
    </ScreenFrame>
  );
}

function SharedShelfSettingsScreen({
  shelf,
  session,
  onBack,
  onShelfUpdated,
  onShelfLeft,
}: {
  shelf: SharedShelf;
  session: Session;
  onBack: () => void;
  onShelfUpdated: (shelf: SharedShelf) => void;
  onShelfLeft: () => void;
}) {
  const [currentShelf, setCurrentShelf] = useState(shelf);
  const [shelfName, setShelfName] = useState(shelf.name);
  const [members, setMembers] = useState<SharedShelfMember[]>([]);
  const [memberItems, setMemberItems] = useState<SharedShelfCollectionItem[]>([]);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [memberRows, itemRows] = await Promise.all([
        fetchSharedShelfMembers(currentShelf.id),
        fetchSharedShelfCollectionItems(currentShelf.id),
      ]);
      setMembers(memberRows);
      setMemberItems(itemRows);
    } catch (error) {
      Alert.alert("Settings error", error instanceof Error ? error.message : "Could not load shared shelf settings.");
    } finally {
      setBusy(false);
    }
  }, [currentShelf.id]);

  useEffect(() => {
    setCurrentShelf(shelf);
    setShelfName(shelf.name);
  }, [shelf]);

  useEffect(() => {
    load();
  }, [load]);

  const currentMember = members.find((member) => member.user_id === session.user.id);
  const isShelfOwner = currentShelf.created_by === session.user.id || currentMember?.role === "owner";
  const memberStats = useMemo(() => buildSharedStatsMembers(memberItems).filter((member) => member.id !== "all"), [memberItems]);

  const applyShelfUpdate = (data: Pick<SharedShelf, "id" | "name" | "description" | "invite_code" | "created_by" | "created_at" | "updated_at">) => {
    const updatedShelf = {
      ...currentShelf,
      ...data,
      member_names: currentShelf.member_names,
      member_count: currentShelf.member_count,
    };
    setCurrentShelf(updatedShelf);
    setShelfName(updatedShelf.name);
    onShelfUpdated(updatedShelf);
  };

  const saveShelfName = async () => {
    const cleanName = shelfName.trim();
    if (!cleanName) {
      Alert.alert("Shelf name needed", "Enter a name for this shared shelf.");
      return;
    }
    if (cleanName === currentShelf.name) return;

    setSaving(true);
    const { data, error } = await supabase
      .from("shared_shelves")
      .update({ name: cleanName })
      .eq("id", currentShelf.id)
      .select("id,name,description,invite_code,created_by,created_at,updated_at")
      .single();
    setSaving(false);

    if (error) {
      Alert.alert("Rename failed", error.message);
      return;
    }

    applyShelfUpdate(data as Pick<SharedShelf, "id" | "name" | "description" | "invite_code" | "created_by" | "created_at" | "updated_at">);
  };

  const copyInviteCode = async () => {
    if (IS_WEB && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(currentShelf.invite_code);
      Alert.alert("Invite copied", "The invite code is ready to share.");
      return;
    }

    Alert.alert("Invite code", currentShelf.invite_code);
  };

  const updateInviteCode = async () => {
    setSaving(true);
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const { data, error } = await supabase
        .from("shared_shelves")
        .update({ invite_code: generateInviteCode() })
        .eq("id", currentShelf.id)
        .select("id,name,description,invite_code,created_by,created_at,updated_at")
        .single();

      if (!error && data) {
        setSaving(false);
        applyShelfUpdate(data as Pick<SharedShelf, "id" | "name" | "description" | "invite_code" | "created_by" | "created_at" | "updated_at">);
        return;
      }

      lastError = error;
    }

    setSaving(false);
    Alert.alert("Invite update failed", lastError instanceof Error ? lastError.message : "Could not create a new invite code.");
  };

  const regenerateInviteCode = () => {
    confirmAction("Regenerate invite code?", "The old invite code will stop working for new members.", () => {
      void updateInviteCode();
    });
  };

  const removeMember = (member: SharedShelfMember) => {
    const memberName = sharedShelfMemberName(member);
    confirmAction("Remove member?", `${memberName} will no longer be able to view this shared shelf. Their personal shelf will not be changed.`, async () => {
      setSaving(true);
      const { error } = await supabase.from("shared_shelf_members").delete().eq("id", member.id);
      setSaving(false);

      if (error) {
        Alert.alert("Remove failed", error.message);
        return;
      }

      await load();
    });
  };

  const leaveShelf = () => {
    const membership = currentMember;
    if (!membership || membership.role === "owner") return;

    confirmAction("Leave shared shelf?", "You will lose access to this shared shelf. Your personal shelf will not be changed.", async () => {
      setSaving(true);
      const { error } = await supabase.from("shared_shelf_members").delete().eq("id", membership.id);
      setSaving(false);

      if (error) {
        Alert.alert("Could not leave shelf", error.message);
        return;
      }

      onShelfLeft();
    });
  };

  return (
    <ScreenFrame title="Shelf Settings" onBack={onBack}>
      <View style={styles.sharedSettingsPanel}>
        <View style={styles.sharedSettingsBlock}>
          <Text style={styles.dashboardSectionTitle}>{currentShelf.name}</Text>
          <Text style={styles.mutedSmall}>{isShelfOwner ? "Manage access and invites." : "View members or leave this shelf."}</Text>
        </View>

        <View style={styles.sharedSettingsBlock}>
          <Label>Shelf name</Label>
          <View style={styles.sharedSettingsNameRow}>
            <TextInput
              value={shelfName}
              onChangeText={setShelfName}
              editable={isShelfOwner && !saving}
              placeholder="Shared shelf name"
              placeholderTextColor="#8c95a3"
              style={[styles.input, styles.flex]}
            />
            <Pressable
              onPress={saveShelfName}
              disabled={!isShelfOwner || saving || shelfName.trim() === currentShelf.name}
              style={[styles.sharedSettingsSmallButton, (!isShelfOwner || saving || shelfName.trim() === currentShelf.name) && styles.disabled]}
            >
              <Text style={styles.sharedSettingsSmallButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sharedSettingsBlock}>
          <Label>Invite code</Label>
          <View style={styles.sharedInviteControlRow}>
            <Text selectable style={styles.sharedInviteControlCode}>{currentShelf.invite_code}</Text>
            <Pressable onPress={copyInviteCode} disabled={saving} style={[styles.sharedSettingsSmallButton, saving && styles.disabled]}>
              <Text style={styles.sharedSettingsSmallButtonText}>Copy</Text>
            </Pressable>
            {isShelfOwner ? (
              <Pressable onPress={regenerateInviteCode} disabled={saving} style={[styles.sharedSettingsSmallButtonMuted, saving && styles.disabled]}>
                <Text style={styles.sharedSettingsSmallButtonMutedText}>New</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.sharedSettingsPanel}>
        <View style={styles.sharedSettingsBlock}>
          <Text style={styles.dashboardSectionTitle}>Members</Text>
          <Text style={styles.mutedSmall}>{integer(members.length)} people have access to this shelf.</Text>
        </View>

        {busy ? <ActivityIndicator color="#7e67f4" /> : null}
        {members.map((member) => {
          const isCurrentUser = member.user_id === session.user.id;
          const isOwnerMember = member.role === "owner";
          const stats = memberStats.find((row) => row.id === member.user_id);
          return (
            <View key={member.id} style={styles.sharedMemberRow}>
              <View style={styles.flex}>
                <View style={styles.sharedMemberNameRow}>
                  <Text style={styles.sharedMemberName}>{sharedShelfMemberName(member)}{isCurrentUser ? " (you)" : ""}</Text>
                  <Text style={[styles.sharedMemberRole, isOwnerMember && styles.sharedMemberRoleOwner]}>
                    {isOwnerMember ? "Owner" : "Member"}
                  </Text>
                </View>
                <Text style={styles.mutedSmall}>
                  {integer(stats?.count ?? 0)} Pops - {money(stats?.value ?? 0)}
                </Text>
              </View>
              {isShelfOwner && !isCurrentUser && !isOwnerMember ? (
                <Pressable onPress={() => removeMember(member)} disabled={saving} style={[styles.sharedMemberRemoveButton, saving && styles.disabled]}>
                  <Text style={styles.sharedMemberRemoveText}>Remove</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}

        {!isShelfOwner && currentMember?.role !== "owner" ? (
          <Pressable onPress={leaveShelf} disabled={saving} style={[styles.sharedMemberLeaveButton, saving && styles.disabled]}>
            <Text style={styles.sharedMemberRemoveText}>Leave Shared Shelf</Text>
          </Pressable>
        ) : null}
      </View>
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
  const [selectedExclusivity, setSelectedExclusivity] = useState(item.exclusivity ?? "None");
  const [purchasePrice, setPurchasePrice] = useState(item.purchase_price == null ? "" : String(item.purchase_price));
  const [currentValue, setCurrentValue] = useState(item.current_value == null ? "" : String(item.current_value));
  const [notes, setNotes] = useState(item.notes ?? "");
  const [limitedCount, setLimitedCount] = useState(item.limited_count == null ? "" : String(item.limited_count));
  const [signed, setSigned] = useState(Boolean(item.signed));
  const [signedBy, setSignedBy] = useState(item.signed_by ?? "");
  const [signatureAuthentication, setSignatureAuthentication] = useState(item.signature_authentication ?? "None");
  const [signatureCertNumber, setSignatureCertNumber] = useState(item.signature_cert_number ?? "");
  const [signatureLocation, setSignatureLocation] = useState(item.signature_location ?? "Box");
  const [signaturePersonalized, setSignaturePersonalized] = useState(Boolean(item.signature_personalized));
  const [signatureNotes, setSignatureNotes] = useState(item.signature_notes ?? "");
  const [signedValueBoostPercent, setSignedValueBoostPercent] = useState(
    item.signed_value_boost_percent == null ? "" : String(item.signed_value_boost_percent),
  );
  const [setProgress, setSetProgress] = useState<SetProgressSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueType, setIssueType] = useState<IssueType>("wrong_image");
  const [issueNotes, setIssueNotes] = useState("");
  const [issueBusy, setIssueBusy] = useState(false);
  const baseValue = Number(currentValue || item.current_value || item.estimated_value || 0);
  const parsedSignedBoost =
    signedValueBoostPercent.trim() === ""
      ? defaultSignedBoost(signatureAuthentication, signaturePersonalized)
      : Number(signedValueBoostPercent);
  const safeSignedBoost = Number.isFinite(parsedSignedBoost) ? parsedSignedBoost : 0;
  const adjustedValueEach = adjustedSignedValue(baseValue, signed, safeSignedBoost);
  const previewQuantity = Math.max(Number(quantity) || 1, 1);
  const previewTotalValue = adjustedValueEach * previewQuantity;
  const previewTotalCost = Number(purchasePrice || item.purchase_price || 0) * previewQuantity;
  const detailGainLoss = previewTotalValue - previewTotalCost;
  const usesProductionRun = isDigitalPopType(item.pop_type);
  const showLimitedCountField = usesProductionRun || item.limited_edition || limitedCount.trim();
  const setProgressText = setProgress
    ? `${integer(setProgress.ownedUnique)} / ${integer(setProgress.checklistTotal)} owned - ${percent(setProgress.completionPercent)}`
    : null;
  const detailMetaChips = [
    item.franchise && item.franchise !== item.set_name ? item.franchise : null,
    item.pop_type,
    item.pop_style && !/^(standard|common|pop)$/i.test(item.pop_style) ? item.pop_style : null,
    item.number ? `#${item.number}` : null,
    isMeaningfulVariant(item.display_variant) ? item.display_variant : null,
    selectedExclusivity !== "None" ? selectedExclusivity : null,
    signed ? "Signed" : null,
    signed && signatureAuthentication !== "None" ? signatureAuthentication : null,
    releaseDateText(item),
  ].filter(Boolean);

  useEffect(() => {
    if (!signed || signedValueBoostPercent.trim() !== "") return;
    setSignedValueBoostPercent(String(defaultSignedBoost(signatureAuthentication, signaturePersonalized)));
  }, [signed, signatureAuthentication, signaturePersonalized, signedValueBoostPercent]);

  useEffect(() => {
    let cancelled = false;

    const loadSetProgress = async () => {
      const setName = compactName(item.set_name || "");
      if (!setName || !item.user_id) {
        setSetProgress(null);
        return;
      }

      try {
        const [checklists, ownedRowsResult] = await Promise.all([
          fetchSetChecklistSummaries(),
          supabase
            .from("user_collection_view")
            .select("pop_catalog_id,collection_item_id,owned_variant,display_variant,variant")
            .eq("user_id", item.user_id)
            .eq("set_name", item.set_name),
        ]);

        if (cancelled) return;

        const checklist = checklists[setName.toLowerCase()];
        const total = Number(checklist?.required_count ?? 0);
        if (ownedRowsResult.error || total <= 0) {
          setSetProgress(null);
          return;
        }

        const ownedUnique = new Set(((ownedRowsResult.data ?? []) as StatsSourceItem[]).map(completionOwnershipKey)).size;
        setSetProgress({
          ownedUnique,
          checklistTotal: total,
          completionPercent: Math.min(100, (ownedUnique / total) * 100),
        });
      } catch {
        if (!cancelled) setSetProgress(null);
      }
    };

    loadSetProgress();

    return () => {
      cancelled = true;
    };
  }, [item.set_name, item.user_id]);

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
    const cleanExclusivity = selectedExclusivity && selectedExclusivity !== "None" ? selectedExclusivity : null;
    const cleanSignatureAuthentication = signatureAuthentication && signatureAuthentication !== "None" ? signatureAuthentication : null;
    const cleanSignatureLocation = signatureLocation && signatureLocation !== "Other" ? signatureLocation : signatureLocation || null;
    const parsedBoost =
      signedValueBoostPercent.trim() === ""
        ? defaultSignedBoost(signatureAuthentication, signaturePersonalized)
        : Number(signedValueBoostPercent);
    const cleanBoost = signed && Number.isFinite(parsedBoost) ? Math.max(parsedBoost, 0) : null;

    if (item.upc && (item.exclusivity ?? null) !== cleanExclusivity) {
      const { data: updateData, error: updateError } = await supabase.functions.invoke("lookup_pop", {
        body: { barcode: item.upc, exclusivityOverride: cleanExclusivity },
      });

      if (updateError) {
        setBusy(false);
        Alert.alert("Exclusivity update failed", await getFunctionErrorMessage(updateError, item.upc));
        return;
      }

      const updateResponse = updateData as LookupResponse;
      if (updateResponse.pop?.exclusivity !== undefined) {
        setSelectedExclusivity(updateResponse.pop.exclusivity ?? "None");
      }
    }

    const { error } = await supabase
      .from("user_collection_items")
      .update({
        quantity: Number(quantity) || 1,
        condition,
        owned_variant: ownedVariant.trim() ? ownedVariant.trim() : null,
        purchase_price: purchasePrice ? Number(purchasePrice) : null,
        current_value: currentValue ? Number(currentValue) : null,
        notes,
        signed,
        signed_by: signed && signedBy.trim() ? signedBy.trim() : null,
        signature_authentication: signed ? cleanSignatureAuthentication : null,
        signature_cert_number: signed && signatureCertNumber.trim() ? signatureCertNumber.trim() : null,
        signature_location: signed ? cleanSignatureLocation : null,
        signature_personalized: signed ? signaturePersonalized : false,
        signature_notes: signed && signatureNotes.trim() ? signatureNotes.trim() : null,
        signed_value_boost_percent: cleanBoost,
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
    const { data, error } = await supabase.functions.invoke("lookup_pop", {
      body: {
        barcode: item.upc,
        forceRefresh: true,
        variantOverride: ownedVariant || item.display_variant || item.variant || "Common",
      },
    });
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

  const submitIssueReport = async () => {
    setIssueBusy(true);
    const { error } = await supabase.from("catalog_issue_reports").insert({
      pop_catalog_id: item.pop_catalog_id,
      collection_item_id: item.collection_item_id,
      issue_type: issueType,
      notes: issueNotes.trim() ? issueNotes.trim() : null,
    });
    setIssueBusy(false);

    if (error) {
      Alert.alert("Report failed", error.message);
      return;
    }

    setIssueModalOpen(false);
    setIssueType("wrong_image");
    setIssueNotes("");
    Alert.alert("Report sent", "Thanks. This item is now in the review queue.");
  };

  return (
    <ScreenFrame title="Item Details" onBack={onBack}>
      <Modal visible={issueModalOpen} transparent animationType="slide" onRequestClose={() => setIssueModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.optionSheet}>
            <Text style={styles.optionTitle}>Report Item Issue</Text>
            <View style={styles.issueTypeGrid}>
              {ISSUE_TYPES.map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => setIssueType(option.key)}
                  style={[styles.issueTypeButton, issueType === option.key && styles.issueTypeButtonActive]}
                >
                  <Text style={[styles.issueTypeText, issueType === option.key && styles.issueTypeTextActive]}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
            <Label>Notes</Label>
            <TextInput
              value={issueNotes}
              onChangeText={setIssueNotes}
              multiline
              placeholder="What looks wrong?"
              placeholderTextColor="#8c95a3"
              style={[styles.input, styles.notes]}
            />
            <PrimaryButton label={issueBusy ? "Sending..." : "Send Report"} onPress={submitIssueReport} disabled={issueBusy} />
            <Pressable onPress={() => setIssueModalOpen(false)} disabled={issueBusy} style={styles.linkButton}>
              <Text style={styles.linkText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View style={styles.detailHero}>
        <View style={styles.detailHeroTop}>
          {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.detailHeroImage} /> : <EmptyDisplayBox style={styles.detailHeroImagePlaceholder} />}
          <View style={styles.detailHeroCopy}>
            <Text style={styles.dashboardEyebrow}>Shelf item</Text>
            <Text style={styles.detailTitle}>{displayPopName(item, ownedVariant)}</Text>
            {item.set_name ? <Text style={styles.detailFranchise}>{item.set_name}</Text> : null}
            {setProgressText ? <Text style={styles.detailSetProgress}>{setProgressText}</Text> : null}
            {detailMetaChips.length > 0 ? (
              <View style={styles.detailMetaChips}>
                {detailMetaChips.map((chip) => (
                  <Text key={chip} style={styles.detailMetaChip} numberOfLines={1}>
                    {chip}
                  </Text>
                ))}
              </View>
            ) : null}
            <Text style={styles.mutedSmall}>UPC: {item.upc ?? "--"}</Text>
            <View style={styles.cardBadgeRow}>
              <VaultBadge item={item} compact />
              <LimitedBadge item={item} compact />
              <SignedBadge item={item} compact />
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
        <Label>Exclusivity</Label>
        <ExclusivityPicker value={selectedExclusivity} onChange={setSelectedExclusivity} />
        <Text style={styles.mutedSmall}>
          {item.upc ? "Use this for convention, retailer, or Funko Shop exclusives." : "Exclusivity editing needs a catalog UPC."}
        </Text>
        {showLimitedCountField ? (
          <>
            <Label>{usesProductionRun ? "Production run" : "Limited count"}</Label>
            <TextInput
              value={limitedCount}
              onChangeText={setLimitedCount}
              keyboardType="number-pad"
              placeholder={usesProductionRun ? "Total minted" : "Pieces made"}
              placeholderTextColor="#8c95a3"
              style={styles.input}
            />
          </>
        ) : null}
        <View style={styles.toggleRow}>
          <View style={styles.flex}>
            <Text style={styles.dashboardSectionTitle}>Signed</Text>
            <Text style={styles.mutedSmall}>Track signatures and add an item-level value boost.</Text>
          </View>
          <Switch
            value={signed}
            onValueChange={(next) => {
              setSigned(next);
              if (next && signedValueBoostPercent.trim() === "") {
                setSignedValueBoostPercent(String(defaultSignedBoost(signatureAuthentication, signaturePersonalized)));
              }
            }}
            trackColor={{ true: "#7bd1c3", false: "#283039" }}
            thumbColor={signed ? "#7e67f4" : "#11161d"}
          />
        </View>
        {signed ? (
          <View style={styles.signaturePanel}>
            <Label>Signed by</Label>
            <TextInput value={signedBy} onChangeText={setSignedBy} placeholder="Actor, artist, or signer" placeholderTextColor="#8c95a3" style={styles.input} />
            <View style={styles.detailTwoColumn}>
              <View style={styles.flex}>
                <Label>Authentication</Label>
                <SignatureAuthenticationPicker
                  value={signatureAuthentication}
                  onChange={(value) => {
                    setSignatureAuthentication(value);
                    setSignedValueBoostPercent(String(defaultSignedBoost(value, signaturePersonalized)));
                  }}
                />
              </View>
              <View style={styles.flex}>
                <Label>Location</Label>
                <SignatureLocationPicker value={signatureLocation} onChange={setSignatureLocation} />
              </View>
            </View>
            <Label>COA / cert number</Label>
            <TextInput value={signatureCertNumber} onChangeText={setSignatureCertNumber} placeholder="Optional" placeholderTextColor="#8c95a3" style={styles.input} />
            <View style={styles.toggleRow}>
              <View style={styles.flex}>
                <Text style={styles.signatureToggleTitle}>Personalized</Text>
                <Text style={styles.mutedSmall}>Use a lighter default boost when signed to a person.</Text>
              </View>
              <Switch
                value={signaturePersonalized}
                onValueChange={(next) => {
                  setSignaturePersonalized(next);
                  setSignedValueBoostPercent(String(defaultSignedBoost(signatureAuthentication, next)));
                }}
                trackColor={{ true: "#7bd1c3", false: "#283039" }}
                thumbColor={signaturePersonalized ? "#7e67f4" : "#11161d"}
              />
            </View>
            <View style={styles.detailTwoColumn}>
              <View style={styles.flex}>
                <Label>Signed boost (%)</Label>
                <TextInput value={signedValueBoostPercent} onChangeText={setSignedValueBoostPercent} keyboardType="decimal-pad" style={styles.input} />
              </View>
              <View style={styles.signatureValuePreview}>
                <Text style={styles.dashboardInsightLabel}>Adjusted Value</Text>
                <Text style={styles.detailValueText}>{money(adjustedValueEach)}</Text>
              </View>
            </View>
            <Label>Signature notes</Label>
            <TextInput value={signatureNotes} onChangeText={setSignatureNotes} multiline placeholder="Ink color, quote, placement, event..." placeholderTextColor="#8c95a3" style={[styles.input, styles.notes]} />
          </View>
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
            <Label>{signed ? "Base Current Value ($)" : "Current Value ($)"}</Label>
            <TextInput value={currentValue} onChangeText={setCurrentValue} keyboardType="decimal-pad" style={styles.input} />
          </View>
        </View>
        {signed ? (
          <Text style={styles.mutedSmall}>
            Signed preview: {money(baseValue)} + {percent(safeSignedBoost)} = {money(adjustedValueEach)} each.
          </Text>
        ) : null}
        <PrimaryButton label="Refresh Value" onPress={refreshValue} disabled={busy} />
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.dashboardSectionTitle}>Notes</Text>
        <TextInput value={notes} onChangeText={setNotes} multiline style={[styles.input, styles.notes]} />
      </View>

      <PrimaryButton label={busy ? "Saving..." : "Save Changes"} onPress={save} disabled={busy} />
      <View style={styles.detailDangerSection}>
        <Text style={styles.dashboardSectionTitle}>Shelf Actions</Text>
        <Text style={styles.mutedSmall}>Use these when this Pop leaves your active shelf.</Text>
        <SecondaryButton label="Report Item Issue" onPress={() => setIssueModalOpen(true)} disabled={busy || issueBusy} />
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

type AdminTab = "health" | "reports" | "audit";
type AdminHealthFilter = "queue" | "needsReview" | "lowParse" | "missingImages" | "missingValues";
type AdminHealthMetrics = {
  missingImages: number;
  missingValues: number;
  lowConfidence: number;
  needsReview: number;
  openReports: number;
  healthQueue: number;
};
type AdminHealthRow = PopCatalog & {
  created_at: string | null;
  api_last_updated: string | null;
  parse_confidence: number | null;
  needs_review: boolean | null;
};

function issueTypeLabel(value: string | null | undefined): string {
  return ISSUE_TYPES.find((option) => option.key === value)?.label ?? "Other";
}

function adminRowDate(value: string | null | undefined): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function adminHealthFilterLabel(value: AdminHealthFilter): string {
  if (value === "needsReview") return "Needs Review";
  if (value === "lowParse") return "Low Parse";
  if (value === "missingImages") return "No Image";
  if (value === "missingValues") return "No Value";
  return "Full Health";
}

function parseReasonLabel(value: string): string {
  const labels: Record<string, string> = {
    missing_title: "Missing title",
    missing_franchise: "Missing franchise",
    missing_set: "Missing set",
    missing_number: "Missing number",
    missing_value: "Missing value",
    weak_name_cleanup: "Weak name cleanup",
    generic_set_label: "Generic set",
    variant_or_exclusive_title_noise: "Variant/exclusive noise",
    confidence_floor_070: "Low confidence floor",
    estimated_value_missing: "Missing value",
    missing_character: "Missing character",
    reseller_brand_detected: "Retailer title noise",
  };
  return labels[value] ?? compactName(value.replace(/_/g, " "));
}

function learnedOverrideData(row: {
  pop_name?: string | null;
  character?: string | null;
  franchise?: string | null;
  set_name?: string | null;
  number?: string | null;
  variant?: string | null;
  exclusivity?: string | null;
  pop_type?: string | null;
  pop_style?: string | null;
  display_description?: string | null;
}): Record<string, string> {
  return Object.entries(row).reduce<Record<string, string>>((acc, [key, value]) => {
    const clean = String(value ?? "").trim();
    if (clean) acc[key] = clean;
    return acc;
  }, {});
}

function auditActionLabel(value: string): string {
  if (value === "catalog_update") return "Catalog update";
  if (value === "report_status_update") return "Report status";
  if (value === "report_update") return "Report update";
  return compactName(value.replace(/_/g, " "));
}

function auditChangedFieldText(event: AdminAuditEvent): string {
  const fields = event.changed_fields ?? [];
  const visibleFields = fields.filter((field) => !["api_last_updated", "updated_at"].includes(field));
  if (visibleFields.length === 0) return "Timestamp only";
  return visibleFields.slice(0, 6).join(", ") + (visibleFields.length > 6 ? ` +${visibleFields.length - 6}` : "");
}

function auditSubjectText(event: AdminAuditEvent): string {
  const after = event.after_data ?? {};
  const before = event.before_data ?? {};
  const source = Object.keys(after).length ? after : before;
  const name = String(source.pop_name ?? source.character ?? source.issue_type ?? "").trim();
  const number = String(source.number ?? "").trim();
  const status = String(source.status ?? "").trim();
  if (name && number) return `${name} #${number}`;
  if (name) return name;
  if (status && event.table_name === "catalog_issue_reports") return `Report ${status}`;
  return event.row_id ?? event.table_name;
}

function AdminScreen({
  session,
  onBack,
  onFixCatalog,
}: {
  session: Session;
  onBack: () => void;
  onFixCatalog: (catalogId: string, reportId?: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>("health");
  const [healthFilter, setHealthFilter] = useState<AdminHealthFilter>("queue");
  const [metrics, setMetrics] = useState<AdminHealthMetrics>({
    missingImages: 0,
    missingValues: 0,
    lowConfidence: 0,
    needsReview: 0,
    openReports: 0,
    healthQueue: 0,
  });
  const [healthRows, setHealthRows] = useState<AdminHealthRow[]>([]);
  const [reports, setReports] = useState<CatalogIssueReport[]>([]);
  const [auditEvents, setAuditEvents] = useState<AdminAuditEvent[]>([]);
  const [busy, setBusy] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setSetupError(null);
    const healthColumns =
      "id,created_at,api_last_updated,upc,pop_name,character,franchise,number,variant,exclusivity,pop_type,pop_style,set_name,image_url,vault_status,release_date,estimated_value,display_description,limited_edition,limited_count,edition_notes,parse_confidence,parse_reason_codes,needs_review";
    const buildHealthQuery = () => {
      const query = supabase
        .from("pop_catalog")
        .select(healthColumns)
        .order("api_last_updated", { ascending: false, nullsFirst: false })
        .limit(80);

      if (healthFilter === "needsReview") return query.eq("needs_review", true);
      if (healthFilter === "lowParse") return query.lt("parse_confidence", 0.75);
      if (healthFilter === "missingImages") return query.is("image_url", null);
      if (healthFilter === "missingValues") return query.or("estimated_value.is.null,estimated_value.eq.0");
      return query.or("needs_review.is.true,image_url.is.null,estimated_value.is.null,estimated_value.eq.0,parse_confidence.lt.0.75");
    };

    const [missingImages, missingValues, lowConfidence, needsReview, openReports, healthQueue, healthResult, reportsResult, auditResult] = await Promise.all([
      supabase.from("pop_catalog").select("id", { count: "exact", head: true }).is("image_url", null),
      supabase.from("pop_catalog").select("id", { count: "exact", head: true }).or("estimated_value.is.null,estimated_value.eq.0"),
      supabase.from("pop_catalog").select("id", { count: "exact", head: true }).lt("parse_confidence", 0.75),
      supabase.from("pop_catalog").select("id", { count: "exact", head: true }).eq("needs_review", true),
      supabase.from("catalog_issue_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase
        .from("pop_catalog")
        .select("id", { count: "exact", head: true })
        .or("needs_review.is.true,image_url.is.null,estimated_value.is.null,estimated_value.eq.0,parse_confidence.lt.0.75"),
      buildHealthQuery(),
      supabase.from("catalog_issue_reports").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(40),
      supabase.from("admin_audit_events").select("*").order("created_at", { ascending: false }).limit(40),
    ]);

    if (openReports.error || reportsResult.error) {
      setSetupError(openReports.error?.message ?? reportsResult.error?.message ?? "Admin issue queue is not available yet.");
      setReports([]);
    } else {
      const reportRows = (reportsResult.data ?? []) as CatalogIssueReport[];
      const catalogIds = Array.from(new Set(reportRows.map((report) => report.pop_catalog_id).filter(Boolean))) as string[];
      const catalogResult = catalogIds.length
        ? await supabase
            .from("pop_catalog")
            .select("id,upc,pop_name,franchise,number,variant,set_name,image_url,estimated_value")
            .in("id", catalogIds)
        : { data: [], error: null };
      const catalogById = new Map(((catalogResult.data ?? []) as PopCatalog[]).map((catalog) => [catalog.id, catalog]));
      setReports(
        reportRows.map((report) => {
          const catalog = report.pop_catalog_id ? catalogById.get(report.pop_catalog_id) : null;
          return {
            ...report,
            upc: catalog?.upc ?? null,
            pop_name: catalog?.pop_name ?? null,
            franchise: catalog?.franchise ?? null,
            number: catalog?.number ?? null,
            variant: catalog?.variant ?? null,
            set_name: catalog?.set_name ?? null,
            image_url: catalog?.image_url ?? null,
            estimated_value: catalog?.estimated_value ?? null,
          };
        }),
      );
    }

    if (healthResult.error) {
      setSetupError((current) => current ?? healthResult.error.message);
      setHealthRows([]);
    } else {
      setHealthRows((healthResult.data ?? []) as AdminHealthRow[]);
    }

    if (auditResult.error) {
      setAuditEvents([]);
      setSetupError((current) => current ?? auditResult.error.message);
    } else {
      setAuditEvents((auditResult.data ?? []) as AdminAuditEvent[]);
    }

    setMetrics({
      missingImages: missingImages.count ?? 0,
      missingValues: missingValues.count ?? 0,
      lowConfidence: lowConfidence.count ?? 0,
      needsReview: needsReview.count ?? 0,
      openReports: openReports.count ?? 0,
      healthQueue: healthQueue.count ?? 0,
    });
    setBusy(false);
  }, [healthFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateReportStatus = async (report: CatalogIssueReport, status: "resolved" | "ignored") => {
    setBusy(true);
    const { error } = await supabase
      .from("catalog_issue_reports")
      .update({
        status,
        resolved_by: session.user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", report.id);
    setBusy(false);

    if (error) {
      Alert.alert("Update failed", error.message);
      return;
    }

    await load();
  };

  return (
    <ScreenFrame title="Admin Console" onBack={onBack} rightLabel="Refresh" onRight={load}>
      <View style={styles.statsHero}>
        <Text style={styles.dashboardEyebrow}>App health</Text>
        <Text style={styles.dashboardSectionTitle}>Catalog quality and user reports</Text>
        <Text style={styles.dashboardSubtext}>Review the signals that most affect collector trust.</Text>
      </View>

      <View style={styles.dashboardStatsGrid}>
        <MetricCard label="Reports" value={integer(metrics.openReports)} active={activeTab === "reports"} onPress={() => setActiveTab("reports")} />
        <MetricCard
          label="Needs Review"
          value={integer(metrics.needsReview)}
          active={activeTab === "health" && healthFilter === "needsReview"}
          onPress={() => {
            setHealthFilter("needsReview");
            setActiveTab("health");
          }}
        />
        <MetricCard
          label="Low Parse"
          value={integer(metrics.lowConfidence)}
          active={activeTab === "health" && healthFilter === "lowParse"}
          onPress={() => {
            setHealthFilter("lowParse");
            setActiveTab("health");
          }}
        />
      </View>
      <View style={styles.dashboardStatsGrid}>
        <MetricCard
          label="No Image"
          value={integer(metrics.missingImages)}
          active={activeTab === "health" && healthFilter === "missingImages"}
          onPress={() => {
            setHealthFilter("missingImages");
            setActiveTab("health");
          }}
        />
        <MetricCard
          label="No Value"
          value={integer(metrics.missingValues)}
          active={activeTab === "health" && healthFilter === "missingValues"}
          onPress={() => {
            setHealthFilter("missingValues");
            setActiveTab("health");
          }}
        />
        <MetricCard
          label="Queue"
          value={integer(metrics.openReports + metrics.healthQueue)}
          active={activeTab === "health" && healthFilter === "queue"}
          onPress={() => {
            setHealthFilter("queue");
            setActiveTab("health");
          }}
        />
      </View>

      <View style={styles.adminTabs}>
        <Pressable onPress={() => setActiveTab("health")} style={[styles.adminTab, activeTab === "health" && styles.adminTabActive]}>
          <Text style={[styles.adminTabText, activeTab === "health" && styles.adminTabTextActive]}>Health</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab("reports")} style={[styles.adminTab, activeTab === "reports" && styles.adminTabActive]}>
          <Text style={[styles.adminTabText, activeTab === "reports" && styles.adminTabTextActive]}>Reports</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab("audit")} style={[styles.adminTab, activeTab === "audit" && styles.adminTabActive]}>
          <Text style={[styles.adminTabText, activeTab === "audit" && styles.adminTabTextActive]}>Audit</Text>
        </Pressable>
      </View>

      {setupError ? (
        <View style={styles.adminNotice}>
          <Text style={styles.cardLabel}>Admin setup needed</Text>
          <Text style={styles.mutedSmall}>{setupError}</Text>
        </View>
      ) : null}

      {busy ? (
        <ActivityIndicator color="#7e67f4" />
      ) : activeTab === "health" ? (
        <View style={styles.dashboardInsightPanel}>
          <Text style={styles.dashboardSectionTitle}>{adminHealthFilterLabel(healthFilter)} Queue</Text>
          {healthRows.length === 0 ? <Text style={styles.mutedSmall}>No catalog rows match this tile.</Text> : null}
          {healthRows.map((row) => (
            <View key={row.id} style={styles.adminQueueRow}>
              {row.image_url ? <Image source={{ uri: row.image_url }} style={styles.adminQueueImage} /> : <EmptyDisplayBox style={styles.adminQueueImagePlaceholder} />}
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{displayPopName(row)}</Text>
                <Text style={styles.itemDetailLine}>
                  {[row.franchise, row.set_name, row.number ? `#${row.number}` : null].filter(Boolean).join(" - ") || row.upc || "Catalog row"}
                </Text>
                <View style={styles.adminBadgeRow}>
                  {!row.image_url ? <Text style={styles.adminIssueBadge}>Image</Text> : null}
                  {Number(row.estimated_value ?? 0) <= 0 ? <Text style={styles.adminIssueBadge}>Value</Text> : null}
                  {row.needs_review ? <Text style={styles.adminIssueBadge}>Review</Text> : null}
                  {Number(row.parse_confidence ?? 1) < 0.75 ? <Text style={styles.adminIssueBadge}>Parse {percent(Number(row.parse_confidence ?? 0) * 100)}</Text> : null}
                  {(row.parse_reason_codes ?? []).slice(0, 2).map((reason) => (
                    <Text key={reason} style={styles.adminReasonBadge}>{parseReasonLabel(reason)}</Text>
                  ))}
                </View>
              </View>
              <View style={styles.adminQueueMeta}>
                <Text style={styles.dashboardInsightValue}>{money(row.estimated_value)}</Text>
                <Text style={styles.dashboardInsightLabel}>{adminRowDate(row.api_last_updated ?? row.created_at)}</Text>
                <Pressable onPress={() => onFixCatalog(row.id)} style={styles.adminFixButton}>
                  <Text style={styles.adminFixButtonText}>Fix</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      ) : activeTab === "reports" ? (
        <View style={styles.dashboardInsightPanel}>
          <Text style={styles.dashboardSectionTitle}>User Reports</Text>
          {reports.length === 0 ? <Text style={styles.mutedSmall}>No open user reports.</Text> : null}
          {reports.map((report) => (
            <View key={report.id} style={styles.adminReportCard}>
              <View style={styles.adminReportTop}>
                {report.image_url ? <Image source={{ uri: report.image_url }} style={styles.adminQueueImage} /> : <EmptyDisplayBox style={styles.adminQueueImagePlaceholder} />}
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>{report.pop_name ?? "Catalog item"}</Text>
                  <Text style={styles.itemDetailLine}>
                    {[report.franchise, report.set_name, report.number ? `#${report.number}` : null].filter(Boolean).join(" - ") || report.upc || "User report"}
                  </Text>
                  <Text style={styles.adminIssueBadge}>{issueTypeLabel(report.issue_type)}</Text>
                </View>
                <Text style={styles.dashboardInsightLabel}>{adminRowDate(report.created_at)}</Text>
              </View>
              {report.notes ? <Text style={styles.mutedSmall}>{report.notes}</Text> : null}
              <View style={styles.adminReportActions}>
                {report.pop_catalog_id ? <SecondaryButton label="Open Fix" onPress={() => onFixCatalog(report.pop_catalog_id as string, report.id)} disabled={busy} /> : null}
                <SecondaryButton label="Ignore" onPress={() => updateReportStatus(report, "ignored")} disabled={busy} />
                <PrimaryButton label="Resolve" onPress={() => updateReportStatus(report, "resolved")} disabled={busy} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.dashboardInsightPanel}>
          <Text style={styles.dashboardSectionTitle}>Recent Audit Trail</Text>
          {auditEvents.length === 0 ? <Text style={styles.mutedSmall}>No admin changes have been recorded yet.</Text> : null}
          {auditEvents.map((event) => (
            <View key={event.id} style={styles.adminAuditRow}>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{auditActionLabel(event.action)}</Text>
                <Text style={styles.itemDetailLine}>{auditSubjectText(event)}</Text>
                <Text style={styles.mutedSmall}>Changed: {auditChangedFieldText(event)}</Text>
              </View>
              <Text style={styles.dashboardInsightLabel}>{adminRowDate(event.created_at)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScreenFrame>
  );
}

function AdminCatalogFixScreen({
  session,
  catalogId,
  reportId,
  onBack,
  onSaved,
}: {
  session: Session;
  catalogId: string;
  reportId?: string;
  onBack: () => void;
  onSaved: () => void;
}) {
  const [catalog, setCatalog] = useState<PopCatalog | null>(null);
  const [popName, setPopName] = useState("");
  const [character, setCharacter] = useState("");
  const [franchise, setFranchise] = useState("");
  const [setName, setSetName] = useState("");
  const [number, setNumber] = useState("");
  const [variant, setVariant] = useState("");
  const [exclusivity, setExclusivity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [displayDescription, setDisplayDescription] = useState("");
  const [needsReview, setNeedsReview] = useState(false);
  const [learnFromFix, setLearnFromFix] = useState(true);
  const [busy, setBusy] = useState(true);
  const [apiBusy, setApiBusy] = useState(false);

  const applyCatalogRow = useCallback((row: PopCatalog | null) => {
    setCatalog(row);
    setPopName(row?.pop_name ?? "");
    setCharacter(row?.character ?? "");
    setFranchise(row?.franchise ?? "");
    setSetName(row?.set_name ?? "");
    setNumber(row?.number ?? "");
    setVariant(row?.variant ?? "");
    setExclusivity(row?.exclusivity ?? "");
    setImageUrl(row?.image_url ?? "");
    setEstimatedValue(row?.estimated_value == null ? "" : String(row.estimated_value));
    setDisplayDescription(row?.display_description ?? "");
    setNeedsReview(Boolean(row?.needs_review));
  }, []);

  const load = useCallback(async () => {
    setBusy(true);
    const { data, error } = await supabase
      .from("pop_catalog")
      .select(
        "id,created_at,api_last_updated,upc,pop_name,character,franchise,number,variant,exclusivity,pop_type,pop_style,set_name,image_url,vault_status,release_date,estimated_value,display_description,limited_edition,limited_count,edition_notes,parse_confidence,parse_reason_codes,needs_review",
      )
      .eq("id", catalogId)
      .maybeSingle();
    setBusy(false);

    if (error) {
      Alert.alert("Catalog load failed", error.message);
      return;
    }

    applyCatalogRow(data as PopCatalog | null);
  }, [applyCatalogRow, catalogId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (resolveReport: boolean) => {
    const parsedValue = estimatedValue.trim() ? Number(estimatedValue) : null;
    if (parsedValue != null && !Number.isFinite(parsedValue)) {
      Alert.alert("Check value", "Estimated value needs to be a number.");
      return;
    }

    setBusy(true);
    const payload = {
      pop_name: popName.trim() || null,
      character: character.trim() || null,
      franchise: franchise.trim() || null,
      set_name: setName.trim() || null,
      number: number.trim() || null,
      variant: variant.trim() || null,
      exclusivity: exclusivity.trim() || null,
      image_url: imageUrl.trim() || null,
      estimated_value: parsedValue,
      display_description: displayDescription.trim() || null,
      needs_review: needsReview,
      parse_confidence: learnFromFix ? 0.95 : catalog?.parse_confidence ?? null,
      parse_reason_codes: learnFromFix && !needsReview ? [] : catalog?.parse_reason_codes ?? [],
      api_last_updated: new Date().toISOString(),
    };

    const { error } = await supabase.from("pop_catalog").update(payload).eq("id", catalogId);
    if (error) {
      setBusy(false);
      Alert.alert("Save failed", error.message);
      return;
    }

    if (learnFromFix && catalog?.upc) {
      const overrideData = learnedOverrideData({
        pop_name: payload.pop_name,
        character: payload.character,
        franchise: payload.franchise,
        set_name: payload.set_name,
        number: payload.number,
        variant: payload.variant,
        exclusivity: payload.exclusivity,
        pop_type: catalog.pop_type,
        pop_style: catalog.pop_style,
        display_description: payload.display_description,
      });

      if (Object.keys(overrideData).length > 0) {
        const overrideResult = await supabase.from("catalog_parser_overrides").upsert(
          {
            upc: catalog.upc,
            pop_catalog_id: catalogId,
            override_data: overrideData,
            updated_by: session.user.id,
            created_by: session.user.id,
            is_active: true,
            notes: "Learned from Admin Console catalog fix",
          },
          { onConflict: "upc" },
        );

        if (overrideResult.error) {
          setBusy(false);
          Alert.alert("Catalog saved", `The catalog row was updated, but the parser learning override was not saved: ${overrideResult.error.message}`);
          return;
        }
      }
    }

    if (resolveReport && reportId) {
      const reportResult = await supabase
        .from("catalog_issue_reports")
        .update({
          status: "resolved",
          resolved_by: session.user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (reportResult.error) {
        setBusy(false);
        Alert.alert("Catalog saved", `The catalog row was updated, but the report was not resolved: ${reportResult.error.message}`);
        return;
      }
    }

    setBusy(false);
    onSaved();
  };

  const refreshFromApi = async () => {
    if (!catalog?.upc) {
      Alert.alert("Missing UPC", "This catalog row needs a UPC before it can refresh from the lookup API.");
      return;
    }

    setApiBusy(true);
    const { data, error } = await supabase.functions.invoke("lookup_pop", {
      body: {
        barcode: catalog.upc,
        forceRefresh: true,
        variantOverride: variant.trim() || catalog.variant || "Common",
        exclusivityOverride: exclusivity.trim() || null,
      },
    });

    if (error) {
      setApiBusy(false);
      Alert.alert("API refresh failed", await getFunctionErrorMessage(error, catalog.upc));
      return;
    }

    const response = data as LookupResponse;
    if (response.pop) {
      applyCatalogRow(response.pop);
    }

    await load();
    setApiBusy(false);
    Alert.alert("API refresh complete", "The latest lookup data has been loaded into this fix screen.");
  };

  return (
    <ScreenFrame title="Fix Catalog Item" onBack={onBack} rightLabel="Reload" onRight={load}>
      {busy && !catalog ? (
        <ActivityIndicator color="#7e67f4" />
      ) : catalog ? (
        <>
          <View style={styles.detailHero}>
            <View style={styles.detailHeroTop}>
              {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.detailHeroImage} /> : <EmptyDisplayBox style={styles.detailHeroImagePlaceholder} />}
              <View style={styles.detailHeroCopy}>
                <Text style={styles.dashboardEyebrow}>Shared catalog record</Text>
                <Text style={styles.detailTitle}>{displayPopName({ ...catalog, pop_name: popName, character, variant })}</Text>
                <Text style={styles.mutedSmall}>UPC: {catalog.upc ?? "--"}</Text>
                <Text style={styles.mutedSmall}>
                  Confidence: {catalog.parse_confidence == null ? "--" : percent(Number(catalog.parse_confidence) * 100)}
                </Text>
                {(catalog.parse_reason_codes ?? []).length > 0 ? (
                  <View style={styles.adminBadgeRow}>
                    {(catalog.parse_reason_codes ?? []).map((reason) => (
                      <Text key={reason} style={styles.adminReasonBadge}>{parseReasonLabel(reason)}</Text>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.detailTwoColumn}>
            <SecondaryButton label={apiBusy ? "Refreshing..." : "Refresh API"} onPress={refreshFromApi} disabled={busy || apiBusy} />
            <SecondaryButton label="Reload Saved" onPress={load} disabled={busy || apiBusy} />
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.dashboardSectionTitle}>Identity</Text>
            <Label>Name</Label>
            <TextInput value={popName} onChangeText={setPopName} placeholder="Pop name" placeholderTextColor="#8c95a3" style={styles.input} />
            <Label>Character</Label>
            <TextInput value={character} onChangeText={setCharacter} placeholder="Character" placeholderTextColor="#8c95a3" style={styles.input} />
            <View style={styles.detailTwoColumn}>
              <View style={styles.flex}>
                <Label>Franchise</Label>
                <TextInput value={franchise} onChangeText={setFranchise} placeholder="Franchise" placeholderTextColor="#8c95a3" style={styles.input} />
              </View>
              <View style={styles.flex}>
                <Label>Set</Label>
                <TextInput value={setName} onChangeText={setSetName} placeholder="Set name" placeholderTextColor="#8c95a3" style={styles.input} />
              </View>
            </View>
            <View style={styles.detailTwoColumn}>
              <View style={styles.flex}>
                <Label>Number</Label>
                <TextInput value={number} onChangeText={setNumber} placeholder="Box #" placeholderTextColor="#8c95a3" style={styles.input} />
              </View>
              <View style={styles.flex}>
                <Label>Value ($)</Label>
                <TextInput value={estimatedValue} onChangeText={setEstimatedValue} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#8c95a3" style={styles.input} />
              </View>
            </View>
            <Label>Variant</Label>
            <TextInput value={variant} onChangeText={setVariant} placeholder="Variant" placeholderTextColor="#8c95a3" style={styles.input} />
            <Label>Exclusivity</Label>
            <TextInput value={exclusivity} onChangeText={setExclusivity} placeholder="Exclusive / retailer / convention" placeholderTextColor="#8c95a3" style={styles.input} />
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.dashboardSectionTitle}>Media & Description</Text>
            <Label>Image URL</Label>
            <TextInput value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." placeholderTextColor="#8c95a3" style={styles.input} />
            <Label>Description</Label>
            <TextInput value={displayDescription} onChangeText={setDisplayDescription} multiline placeholder="Catalog description" placeholderTextColor="#8c95a3" style={[styles.input, styles.notes]} />
            <View style={styles.settingRowCard}>
              <View style={styles.flex}>
                <Text style={styles.cardLabel}>Needs review</Text>
                <Text style={styles.mutedSmall}>{needsReview ? "Keep this in the queue." : "Remove this from the review queue."}</Text>
              </View>
              <Switch value={needsReview} onValueChange={setNeedsReview} trackColor={{ true: "#f6c95f", false: "#283039" }} thumbColor={needsReview ? "#7e67f4" : "#11161d"} />
            </View>
            <View style={styles.settingRowCard}>
              <View style={styles.flex}>
                <Text style={styles.cardLabel}>Learn from this fix</Text>
                <Text style={styles.mutedSmall}>Save these identity fields as the UPC override for future API refreshes.</Text>
              </View>
              <Switch value={learnFromFix} onValueChange={setLearnFromFix} trackColor={{ true: "#7bd1c3", false: "#283039" }} thumbColor={learnFromFix ? "#7e67f4" : "#11161d"} />
            </View>
          </View>

          <PrimaryButton label={busy ? "Saving..." : "Save Fix"} onPress={() => save(false)} disabled={busy || apiBusy} />
          {reportId ? <SecondaryButton label="Save & Resolve Report" onPress={() => save(true)} disabled={busy || apiBusy} /> : null}
        </>
      ) : (
        <View style={styles.emptyMiniCard}>
          <Text style={styles.cardLabel}>Catalog item not found</Text>
          <Text style={styles.mutedSmall}>This report may point at a removed catalog row.</Text>
        </View>
      )}
    </ScreenFrame>
  );
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
  const [collectorMode, setCollectorMode] = useState<CollectorMode>("casual");
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
        setCollectorMode(normalizeCollectorMode(next?.collector_mode));
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
      collector_mode: collectorMode,
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
          <Text style={styles.dashboardSectionTitle}>Collector Mode</Text>
          <Text style={styles.mutedSmall}>{collectorModeDescription(collectorMode)}</Text>
        </View>
        <View style={styles.collectorModeGrid}>
          {COLLECTOR_MODE_OPTIONS.map((mode) => (
            <Pressable
              key={mode.key}
              onPress={() => setCollectorMode(mode.key)}
              style={[styles.collectorModeOption, collectorMode === mode.key && styles.collectorModeOptionActive]}
            >
              <Text style={[styles.collectorModeTitle, collectorMode === mode.key && styles.collectorModeTitleActive]}>
                {mode.label}
              </Text>
              <Text style={styles.collectorModeText}>{mode.description}</Text>
            </Pressable>
          ))}
        </View>
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
  const [showAllWishlist, setShowAllWishlist] = useState(false);
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
              (showAllWishlist ? wishlist : wishlist.slice(0, PUBLIC_WISHLIST_ROW_LIMIT)).map((item) => (
                <View key={item.id} style={styles.publicWishlistCard}>
                  {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.thumb} /> : <EmptyDisplayBox style={styles.thumbPlaceholder} />}
                  <View style={styles.collectionMiddle}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {displayPopName(item)}
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
            {wishlist.length > PUBLIC_WISHLIST_ROW_LIMIT ? (
              <Pressable
                onPress={() => setShowAllWishlist((value) => !value)}
                style={({ pressed }) => [styles.showMoreRowsButton, pressed && styles.pressed]}
              >
                <Text style={styles.showMoreRowsText}>
                  {showAllWishlist ? "Show fewer" : `Show ${integer(wishlist.length - PUBLIC_WISHLIST_ROW_LIMIT)} more`}
                </Text>
              </Pressable>
            ) : null}
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

function EmptyDisplayBox({ style }: { style: StyleProp<ViewStyle> }) {
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

function MetricCard({ label, value, onPress, active }: { label: string; value: string; onPress?: () => void; active?: boolean }) {
  const content = (
    <>
      <Text style={styles.cardLabel} adjustsFontSizeToFit numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.metricValue} adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </Text>
    </>
  );

  if (!onPress) {
    return <View style={[styles.metricCard, active && styles.metricCardActive]}>{content}</View>;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.metricCard, styles.metricCardPressable, active && styles.metricCardActive, pressed && styles.pressed]}>
      {content}
    </Pressable>
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

function StatsHighlightRow({
  rank,
  group,
  detail,
  onPress,
}: {
  rank: number;
  group: StatsGroup;
  detail?: string;
  onPress?: () => void;
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
          {item ? displayPopName(item) : "--"}
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

function StatsPopRow({ item, onPress }: { item: StatsSourceItem; onPress?: () => void }) {
  const variant = item.display_variant || item.owned_variant;
  const metaLine = [
    item.set_name,
    item.number ? `#${item.number}` : null,
    isMeaningfulVariant(variant) ? variant : null,
  ]
    .filter(Boolean)
    .join("  ");

  const content = (
    <>
      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.statsPopImage} /> : <EmptyDisplayBox style={styles.statsPopImagePlaceholder} />}
      <View style={styles.flex}>
        <Text style={styles.statsListTitle} numberOfLines={1}>
          {displayPopName(item)}
        </Text>
        <Text style={styles.mutedSmall} numberOfLines={1}>
          {metaLine}
        </Text>
        {releaseDateText(item) ? (
          <Text style={styles.mutedSmall} numberOfLines={1}>
            {releaseDateText(item)}
          </Text>
        ) : null}
        <Text style={styles.mutedSmall}>Qty {integer(item.quantity)}</Text>
      </View>
      <View style={styles.alignEnd}>
        <Text style={styles.statsListValue}>{money(perPopValue(item))}</Text>
        <Text style={styles.mutedSmall}>each</Text>
      </View>
    </>
  );

  if (!onPress) {
    return <View style={styles.statsPopRow}>{content}</View>;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.statsPopRow, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

function ChecklistPopRow({ row }: { row: ChecklistDisplayRow }) {
  const metaLine = [
    row.pop_type,
    row.pop_style && row.pop_style !== "Standard" ? row.pop_style : null,
    row.number ? `#${row.number}` : null,
    isMeaningfulVariant(row.variant) ? row.variant : null,
    row.exclusivity,
  ]
    .filter(Boolean)
    .join("  ");

  return (
    <View style={[styles.statsPopRow, !row.owned && styles.missingChecklistRow]}>
      <EmptyDisplayBox style={styles.statsPopImagePlaceholder} />
      <View style={styles.flex}>
        <Text style={[styles.statsListTitle, !row.owned && styles.missingChecklistTitle]} numberOfLines={1}>
          {checklistRowName(row)}
        </Text>
        <Text style={styles.mutedSmall} numberOfLines={1}>
          {metaLine}
        </Text>
        <Text style={row.owned ? styles.checklistOwnedText : styles.checklistMissingText}>
          {row.owned ? "Owned" : "Not in shelf"}
        </Text>
      </View>
      <View style={styles.alignEnd}>
        <Text style={row.owned ? styles.checklistOwnedBadge : styles.checklistMissingBadge}>
          {row.owned ? "Owned" : "Missing"}
        </Text>
      </View>
    </View>
  );
}

function ConditionPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <ChoicePicker title="Condition" value={value || "Unknown"} options={CONDITIONS} onChange={onChange} />;
}

function VariantPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <ChoicePicker title="Variant" value={value || "Common"} options={VARIANTS} onChange={onChange} />;
}

function ExclusivityPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <ChoicePicker title="Exclusivity" value={value || "None"} options={EXCLUSIVITIES} onChange={onChange} />;
}

function SignatureAuthenticationPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <ChoicePicker title="Authentication" value={value || "None"} options={SIGNATURE_AUTHENTICATIONS} onChange={onChange} />;
}

function SignatureLocationPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <ChoicePicker title="Signature location" value={value || "Box"} options={SIGNATURE_LOCATIONS} onChange={onChange} />;
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
        <Text style={styles.selectValue} numberOfLines={2}>
          {value}
        </Text>
        <Text style={styles.selectChevron}>⌄</Text>
      </Pressable>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.optionSheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.optionTitle}>{title}</Text>
            <ScrollView style={styles.optionScroll} contentContainerStyle={styles.optionScrollContent}>
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
            </ScrollView>
          </Pressable>
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
  dashboardModeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#7bd1c3",
    backgroundColor: "#1b2f31",
  },
  dashboardModeBadgeText: {
    color: "#d9fff8",
    fontSize: 11,
    fontWeight: "900",
  },
  dashboardModePanel: {
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3d4653",
    backgroundColor: "#181f27",
  },
  dashboardModePanelTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dashboardModeTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
  },
  dashboardModeChangeButton: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#7bd1c3",
  },
  dashboardModeChangeText: {
    color: "#101318",
    fontSize: 12,
    fontWeight: "900",
  },
  dashboardModeFocusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dashboardModeFocusPill: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#101318",
    borderWidth: 1,
    borderColor: "#26313d",
  },
  dashboardModeFocusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
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
    minWidth: 0,
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 11,
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
    fontSize: 14,
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
  breakdownSwitchPanel: {
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#293341",
    backgroundColor: "#151a1f",
  },
  breakdownSwitchLabel: {
    color: "#aeb7c4",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  breakdownShelfTabs: {
    gap: 10,
    paddingVertical: 2,
  },
  breakdownShelfTab: {
    width: 170,
    minHeight: 58,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#293341",
    borderRadius: 10,
    backgroundColor: "#101318",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  breakdownShelfTabActive: {
    borderColor: "#9bd8cb",
    backgroundColor: "#213735",
  },
  breakdownShelfTabName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  breakdownShelfTabMeta: {
    color: "#aab4c0",
    fontSize: 12,
    fontWeight: "700",
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#293341",
    backgroundColor: "#101318",
    overflow: "hidden",
  },
  breakdownGroupPressable: {
    padding: 12,
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
  statsRankBadge: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#243734",
  },
  statsRankText: {
    color: "#9bd8cb",
    fontSize: 12,
    fontWeight: "900",
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
  setCompletionText: {
    color: "#9bd8cb",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2,
  },
  setPremiumText: {
    color: "#aeb7c4",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6,
  },
  setPremiumTextActive: {
    color: "#d8fff7",
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
  setChecklistTabs: {
    minHeight: 38,
    flexDirection: "row",
    gap: 6,
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#0d1117",
  },
  setChecklistTab: {
    flex: 1,
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    paddingHorizontal: 6,
  },
  setChecklistTabActive: {
    backgroundColor: "#9bd8cb",
  },
  setChecklistTabText: {
    color: "#b8c0cc",
    fontSize: 11,
    fontWeight: "900",
  },
  setChecklistTabTextActive: {
    color: "#101318",
  },
  statsSetBlock: {
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#151a1f",
  },
  statsSetHeader: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },
  statsSetValue: {
    minWidth: 76,
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
  },
  statsSetDetail: {
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
  showMoreRowsButton: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7bd1c3",
    backgroundColor: "#101318",
  },
  showMoreRowsText: {
    color: "#d9fff8",
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
  missingChecklistRow: {
    borderWidth: 1,
    borderColor: "#303946",
    backgroundColor: "#11161c",
  },
  missingChecklistTitle: {
    color: "#d5dbe5",
  },
  checklistOwnedText: {
    color: "#9bd8cb",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2,
  },
  checklistMissingText: {
    color: "#aeb7c4",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2,
  },
  checklistOwnedBadge: {
    color: "#9bd8cb",
    fontSize: 11,
    fontWeight: "900",
  },
  checklistMissingBadge: {
    color: "#d8a0a0",
    fontSize: 11,
    fontWeight: "900",
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
  },
  dashboardActionPanel: {
    gap: 12,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#151a1f",
    borderWidth: 1,
    borderColor: "#26313d",
  },
  dashboardActionGrid: {
    flexDirection: "row",
    gap: 12,
  },
  dashboardPrimaryAction: {
    flex: 1,
    minHeight: 76,
    justifyContent: "center",
    gap: 4,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#7e67f4",
  },
  dashboardStatsQuickAction: {
    flex: 1,
    minHeight: 76,
    justifyContent: "center",
    gap: 4,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#7bd1c3",
    backgroundColor: "#1b2f31",
  },
  dashboardActionLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  dashboardActionSub: {
    color: "#d8dde7",
    fontSize: 11,
    fontWeight: "800",
  },
  dashboardBottomActions: {
    flexDirection: "row",
    gap: 12,
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
  adminTabs: {
    minHeight: 46,
    flexDirection: "row",
    gap: 8,
    padding: 4,
    borderRadius: 10,
    backgroundColor: "#101318",
    borderWidth: 1,
    borderColor: "#26313d",
  },
  adminTab: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  adminTabActive: {
    backgroundColor: "#7bd1c3",
  },
  adminTabText: {
    color: "#b8c0cc",
    fontSize: 13,
    fontWeight: "900",
  },
  adminTabTextActive: {
    color: "#101318",
  },
  adminNotice: {
    gap: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f6c95f",
    backgroundColor: "#221f14",
  },
  adminQueueRow: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#101318",
  },
  adminQueueImage: {
    width: 52,
    height: 68,
    resizeMode: "contain",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  adminQueueImagePlaceholder: {
    width: 52,
    height: 68,
    borderRadius: 8,
  },
  adminBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 6,
  },
  adminIssueBadge: {
    alignSelf: "flex-start",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    color: "#101318",
    backgroundColor: "#f6c95f",
    fontSize: 10,
    fontWeight: "900",
  },
  adminReasonBadge: {
    alignSelf: "flex-start",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    color: "#d9fff8",
    backgroundColor: "#1b2f31",
    borderWidth: 1,
    borderColor: "#2d655f",
    fontSize: 10,
    fontWeight: "900",
  },
  adminQueueMeta: {
    width: 72,
    alignItems: "flex-end",
    gap: 4,
  },
  adminFixButton: {
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#7bd1c3",
  },
  adminFixButtonText: {
    color: "#101318",
    fontSize: 12,
    fontWeight: "900",
  },
  adminReportCard: {
    gap: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#101318",
  },
  adminReportTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  adminReportActions: {
    flexDirection: "row",
    gap: 10,
  },
  adminAuditRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#101318",
  },
  issueTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  issueTypeButton: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#101318",
  },
  issueTypeButtonActive: {
    borderColor: "#7bd1c3",
    backgroundColor: "#1b2f31",
  },
  issueTypeText: {
    color: "#b8c0cc",
    fontSize: 12,
    fontWeight: "900",
  },
  issueTypeTextActive: {
    color: "#d9fff8",
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
  collectorModeGrid: {
    gap: 10,
  },
  collectorModeOption: {
    gap: 5,
    minHeight: 74,
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#101318",
  },
  collectorModeOptionActive: {
    borderColor: "#7bd1c3",
    backgroundColor: "#1b2f31",
  },
  collectorModeTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  collectorModeTitleActive: {
    color: "#d9fff8",
  },
  collectorModeText: {
    color: "#b8c0cc",
    fontSize: 12,
    lineHeight: 16,
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
  detailSetProgress: {
    color: "#9bd8cb",
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 17,
  },
  detailMeta: {
    color: "#b8c0cc",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18,
  },
  detailMetaChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  detailMetaChip: {
    maxWidth: "100%",
    minHeight: 24,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2d3946",
    color: "#d6dbe4",
    backgroundColor: "#101318",
    fontSize: 11,
    fontWeight: "900",
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
  signaturePanel: {
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#101318",
  },
  signatureToggleTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
  },
  signatureValuePreview: {
    flex: 1,
    minWidth: 140,
    gap: 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#151a1f",
    borderWidth: 1,
    borderColor: "#26313d",
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
  sharedSettingsPanel: {
    gap: 14,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#151a1f",
  },
  sharedSettingsBlock: {
    gap: 8,
  },
  sharedSettingsNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sharedInviteControlRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sharedInviteControlCode: {
    flex: 1,
    minHeight: 44,
    color: "#9bd5c9",
    fontSize: 15,
    fontWeight: "900",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#0d1117",
  },
  sharedSettingsSmallButton: {
    minHeight: 44,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#7bd1c3",
  },
  sharedSettingsSmallButtonText: {
    color: "#101318",
    fontSize: 12,
    fontWeight: "900",
  },
  sharedSettingsSmallButtonMuted: {
    minHeight: 44,
    minWidth: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7bd1c3",
    backgroundColor: "#101318",
  },
  sharedSettingsSmallButtonMutedText: {
    color: "#d9fff8",
    fontSize: 12,
    fontWeight: "900",
  },
  sharedMemberRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#0d1117",
  },
  sharedMemberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  sharedMemberName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  sharedMemberRole: {
    color: "#b8c0cc",
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#202832",
    overflow: "hidden",
  },
  sharedMemberRoleOwner: {
    color: "#101318",
    backgroundColor: "#7bd1c3",
  },
  sharedMemberRemoveButton: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f07178",
    backgroundColor: "#221519",
  },
  sharedMemberLeaveButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f07178",
    backgroundColor: "#221519",
  },
  sharedMemberRemoveText: {
    color: "#f07178",
    fontSize: 12,
    fontWeight: "900",
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
  metricCardPressable: {
    borderColor: "#334252",
  },
  metricCardActive: {
    borderColor: "#7bd1c3",
    backgroundColor: "#1b2f31",
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
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d7dbe5",
    backgroundColor: "#151a1f",
  },
  selectValue: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
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
    maxHeight: "78%" as any,
    gap: 10,
    padding: 18,
    paddingBottom: 34,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: "#151a1f",
    borderWidth: 1,
    borderColor: "#27313c",
  },
  optionScroll: {
    maxHeight: 460,
  },
  optionScrollContent: {
    gap: 8,
    paddingBottom: 4,
  },
  optionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  optionRow: {
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#202832",
  },
  optionRowActive: {
    backgroundColor: "#7e67f4",
  },
  optionText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 19,
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
  },
  emptyDisplayBox: {
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    paddingTop: "10%",
    borderWidth: 2,
    borderColor: "#f6efe6",
    backgroundColor: "#071a36",
  },
  emptyDisplayBoxSide: {
    position: "absolute",
    left: "7%",
    top: "18%",
    width: "20%",
    height: "66%",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#d6d2cd",
    backgroundColor: "#05142b",
  },
  emptyDisplayBoxSideMark: {
    position: "absolute",
    left: "24%",
    top: "36%",
    width: "52%",
    height: "24%",
    borderRadius: 999,
    backgroundColor: "#f1f4f4",
    opacity: 0.46,
  },
  emptyDisplayBoxTop: {
    width: "72%",
    height: "18%",
    marginLeft: "14%",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: "4%",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: "#fff6eb",
  },
  emptyDisplayBoxPopBadge: {
    width: "42%",
    aspectRatio: 1.65,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#071a36",
    backgroundColor: "#fff",
  },
  emptyDisplayBoxPopText: {
    color: "#ff8a00",
    fontSize: 7,
    fontWeight: "900",
  },
  emptyDisplayBoxNameplate: {
    flex: 1,
    height: "44%",
    borderRadius: 1,
    backgroundColor: "#ff8a00",
  },
  emptyDisplayBoxWindow: {
    width: "52%",
    height: "48%",
    marginLeft: "20%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#f6efe6",
    backgroundColor: "#06172f",
  },
  emptyDisplayBoxGlare: {
    position: "absolute",
    right: "12%",
    top: "-8%",
    width: "22%",
    height: "120%",
    opacity: 0.24,
    transform: [{ rotate: "24deg" }],
    backgroundColor: "#dcecff",
  },
  emptyDisplayBoxShelfLabel: {
    width: "72%",
    height: "16%",
    marginLeft: "14%",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    borderTopWidth: 1,
    borderTopColor: "#f6efe6",
    backgroundColor: "#fff6eb",
  },
  emptyDisplayBoxShelfText: {
    width: "78%",
    color: "#fff",
    overflow: "hidden",
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    backgroundColor: "#071a36",
    fontSize: 7,
    fontWeight: "900",
    textAlign: "center",
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
