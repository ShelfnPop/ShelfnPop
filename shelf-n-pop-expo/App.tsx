import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import type { Session } from "@supabase/supabase-js";
import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text as NativeText,
  TextStyle,
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
  PopSale,
  PopCatalog,
  Profile,
  PublicWishlistItem,
  SharedShelf,
  SharedShelfCollectionItem,
  SharedShelfGroupedItem,
  SharedShelfMember,
} from "./src/types";
import { compactName, integer, money } from "./src/utils/format";
import {
  buildSharedStatsMembers,
  confirmAction,
  dashboardActivityText,
  normalizeShelfVariant,
  percent,
  perPopValue,
  quantityNumber,
  type ScanShelfOwner,
} from "./src/domain/appHelpers";
import {
  fetchDashboardHome,
  fetchMySharedShelves,
  fetchSetChecklistItems,
  fetchSetChecklistSummaries,
  fetchSharedShelfCollectionItems,
  fetchSharedShelfMembers,
  fetchSharedShelfOwnersForPop,
  fetchUserCollectionItems,
} from "./src/data/supabaseQueries";
import { AdminCatalogFixScreen as ManagedAdminCatalogFixScreen, AdminScreen as ManagedAdminScreen } from "./src/ui/AdminScreens";
import { DashboardActionTile } from "./src/ui/DashboardActionTile";
import { SharedShelfSettingsScreen as ManagedSharedShelfSettingsScreen } from "./src/ui/SharedShelfSettingsScreen";

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
  | "tradeSell"
  | "huntHub"
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
type BreakdownSortMode = "closest" | "value" | "count" | "average";
type SetProgressDrillMode = "withinReach" | "complete" | "reviewed";
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
  completionEligible?: boolean | null;
  setClassification?: string | null;
  completionReviewNote?: string | null;
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
  set_classification?: string | null;
  completion_eligible?: boolean | null;
  completion_review_note?: string | null;
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
type SetRecommendation = {
  key: string;
  setName: string;
  completionLine: string | null;
  row: ChecklistDisplayRow;
  estimatedValue?: number | null;
};
type SetProgressSummary = {
  ownedUnique: number;
  checklistTotal: number;
  completionPercent: number;
};
type CollectorMode = "casual" | "avid" | "reseller";
type ListingStatus = "keeping" | "for_sale" | "for_trade" | "sale_or_trade";
type TradeSellFilter = "active" | "for_sale" | "for_trade" | "sold";
type CatalogPhotoDraft = {
  pop_name: string | null;
  character: string | null;
  franchise: string | null;
  set_name: string | null;
  number: string | null;
  variant: string | null;
  exclusivity: string | null;
  pop_type: string | null;
  pop_style: string | null;
  upc: string | null;
  confidence: number;
  needs_review: boolean;
  review_notes: string[];
};
type ParserAssistField = {
  label: string;
  catalogValue: string | null;
  aiValue: string | null;
  severity: "info" | "warning";
};
type TesseractRecognizeResult = {
  data?: {
    text?: string;
  };
};
type TesseractModule = {
  recognize: (
    image: string,
    language?: string,
    options?: { logger?: (message: { status?: string; progress?: number }) => void },
  ) => Promise<TesseractRecognizeResult>;
};
type DashboardTheme = {
  accent: string;
  accentText: string;
  accentSoft: string;
  border: string;
  softBorder: string;
  heroBg: string;
  panelBg: string;
  cardBg: string;
  logoBg: string;
  primaryActionBg: string;
  secondaryActionBg: string;
  valueBorder: string;
};
const CONDITIONS = ["Unknown", "Mint", "Near Mint", "Good", "Fair", "Damaged", "Out of Box"] as const;
const LISTING_STATUS_OPTIONS = ["Keeping", "For Sale", "Open to Trade", "Sale or Trade"] as const;
const MARKETPLACE_OPTIONS = ["", "eBay", "Whatnot", "Mercari", "Facebook", "Local", "Funko App", "Other"] as const;
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
const APP_VERSION = "4.0.0";
const DASHBOARD_ICON_SCAN_POP = require("./assets/dashboard-icons/scan-pop.png");
const DASHBOARD_ICON_SET_PROGRESS = require("./assets/dashboard-icons/set-progress.png");
const DASHBOARD_ICON_MY_SHELF = require("./assets/dashboard-icons/my-shelf.png");
const DASHBOARD_ICON_SHARED_SHELF = require("./assets/dashboard-icons/shared-shelf.png");
const DASHBOARD_ICON_POP_HUNTS = require("./assets/dashboard-icons/pop-hunts.png");
const DASHBOARD_ICON_PROFILE_SETTINGS = require("./assets/dashboard-icons/profile-settings.png");
const DASHBOARD_ICON_SHELF_RECAP = require("./assets/dashboard-icons/shelf-recap.png");
const DASHBOARD_ICON_OPEN_SET_ORGANIZER = require("./assets/dashboard-icons/open-set-organizer.png");
const DASHBOARD_ICON_POPS_TO_FIND_NEXT = require("./assets/dashboard-icons/pops-to-find-next.png");
const DASHBOARD_ICON_VIEW_STATS = require("./assets/dashboard-icons/view-stats.png");
const DASHBOARD_ICON_CREATE_NEW_TRIP = require("./assets/dashboard-icons/create-new-trip.png");
const DASHBOARD_ICON_MEMORY_LANE = require("./assets/dashboard-icons/memory-lane.png");
const PAGE_ICON_SCAN_POP = require("./assets/dashboard-icons/page-scan-pop.png");
const PAGE_ICON_SHELF_STATS = require("./assets/dashboard-icons/page-shelf-stats.png");
const PAGE_ICON_SHARED_SHELF_SETUP = require("./assets/dashboard-icons/page-shared-shelf-setup.png");
const PAGE_ICON_SHARED_SHELF = require("./assets/dashboard-icons/page-shared-shelf.png");
const PHOTO_DRAFT_TIMEOUT_MS = 30000;
const PHOTO_DRAFT_MAX_BASE64_LENGTH = 2_800_000;
const PHOTO_DRAFT_MAX_DIMENSION = 1200;
const SUPABASE_FUNCTIONS_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1` : "";
const SUPABASE_FUNCTIONS_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";
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

function defaultSignedPremiumPercent(authentication: string, personalized: boolean): number {
  if (personalized) return 10;
  if (/^(jsa|beckett|psa|funko event|convention coa)$/i.test(authentication)) return 30;
  if (/^unknown$/i.test(authentication)) return 15;
  return 15;
}

type SignedValueEstimate = {
  low: number;
  median: number;
  high: number;
  premiumPercent: number;
};

function estimateSignedValueRange(baseValue: number, signed: boolean, premiumPercent: number): SignedValueEstimate {
  const safeBaseValue = Math.max(Number(baseValue) || 0, 0);
  const safePremiumPercent = Math.max(Number(premiumPercent) || 0, 0);
  const median = signed && safeBaseValue > 0 ? safeBaseValue * (1 + safePremiumPercent / 100) : safeBaseValue;
  const rangeSpread = signed ? Math.max(0.18, Math.min(0.35, 0.24 + safePremiumPercent / 500)) : 0;
  const low = median * (1 - rangeSpread);
  const high = median * (1 + rangeSpread);

  return {
    low: Math.round(low * 100) / 100,
    median: Math.round(median * 100) / 100,
    high: Math.round(high * 100) / 100,
    premiumPercent: safePremiumPercent,
  };
}

function signedValueConfidence(authentication: string, personalized: boolean): "low" | "medium" | "high" {
  if (personalized) return "medium";
  if (/^(jsa|beckett|psa)$/i.test(authentication)) return "high";
  if (/^(funko event|convention coa)$/i.test(authentication)) return "medium";
  return "low";
}

function isSetCompletionEligible(checklist: Pick<SetChecklistSummary, "completion_eligible" | "set_classification" | "required_count"> | null | undefined): boolean {
  const total = Number(checklist?.required_count ?? 0);
  if (!checklist || total <= 1) return false;
  return checklist.completion_eligible !== false && checklist.set_classification !== "single_release" && checklist.set_classification !== "unreviewed";
}

async function fetchCatalogEstimatedValues(catalogIds: string[]): Promise<Record<string, number | null>> {
  const uniqueIds = Array.from(new Set(catalogIds.filter(Boolean)));
  if (uniqueIds.length === 0) return {};

  const { data, error } = await supabase.from("pop_catalog").select("id,estimated_value").in("id", uniqueIds);
  if (error) throw error;

  return ((data ?? []) as Array<{ id: string; estimated_value: number | null }>).reduce<Record<string, number | null>>((acc, row) => {
    acc[row.id] = row.estimated_value;
    return acc;
  }, {});
}

function normalizeCollectorMode(value: string | null | undefined): CollectorMode {
  return value === "avid" || value === "reseller" ? value : "casual";
}

function normalizeListingStatus(value?: string | null, forSale?: boolean | null, forTrade?: boolean | null): ListingStatus {
  if (value === "for_sale" || value === "for_trade" || value === "sale_or_trade") return value;
  if (forSale && forTrade) return "sale_or_trade";
  if (forSale) return "for_sale";
  if (forTrade) return "for_trade";
  return "keeping";
}

function listingStatusLabel(status?: string | null, forSale?: boolean | null, forTrade?: boolean | null): string {
  const normalized = normalizeListingStatus(status, forSale, forTrade);
  if (normalized === "for_sale") return "For Sale";
  if (normalized === "for_trade") return "Open to Trade";
  if (normalized === "sale_or_trade") return "Sale or Trade";
  return "Keeping";
}

function listingStatusFromLabel(label: string): ListingStatus {
  if (label === "For Sale") return "for_sale";
  if (label === "Open to Trade") return "for_trade";
  if (label === "Sale or Trade") return "sale_or_trade";
  return "keeping";
}

function listingFlags(status: ListingStatus): { for_sale: boolean; for_trade: boolean } {
  return {
    for_sale: status === "for_sale" || status === "sale_or_trade",
    for_trade: status === "for_trade" || status === "sale_or_trade",
  };
}

function todayDateInput(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseMoneyInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(/[$,]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function saleNet(sale: Pick<PopSale, "sale_price" | "platform_fees" | "shipping_charged" | "shipping_cost">): number {
  return Number(sale.sale_price ?? 0) - Number(sale.platform_fees ?? 0) + Number(sale.shipping_charged ?? 0) - Number(sale.shipping_cost ?? 0);
}

function saleProfit(sale: Pick<PopSale, "sale_price" | "platform_fees" | "shipping_charged" | "shipping_cost" | "purchase_price">): number {
  return saleNet(sale) - Number(sale.purchase_price ?? 0);
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

function collectorModeDashboardTheme(mode: CollectorMode): DashboardTheme {
  if (mode === "avid") {
    return {
      accent: "#8fb8ff",
      accentText: "#e9f1ff",
      accentSoft: "#17243a",
      border: "#2f4771",
      softBorder: "#243856",
      heroBg: "#121923",
      panelBg: "#15191f",
      cardBg: "#10151c",
      logoBg: "#18243a",
      primaryActionBg: "#536da8",
      secondaryActionBg: "#162235",
      valueBorder: "#37547f",
    };
  }

  if (mode === "reseller") {
    return {
      accent: "#d8b46a",
      accentText: "#fff1cf",
      accentSoft: "#282316",
      border: "#5a4a29",
      softBorder: "#433823",
      heroBg: "#181815",
      panelBg: "#151719",
      cardBg: "#101315",
      logoBg: "#292414",
      primaryActionBg: "#a8823b",
      secondaryActionBg: "#241f14",
      valueBorder: "#74613a",
    };
  }

  return {
    accent: "#8fd8c8",
    accentText: "#e3fff8",
    accentSoft: "#142825",
    border: "#2f5c55",
    softBorder: "#254942",
    heroBg: "#121b1d",
    panelBg: "#151b1e",
    cardBg: "#101518",
    logoBg: "#132927",
    primaryActionBg: "#4f756f",
    secondaryActionBg: "#162a28",
    valueBorder: "#3c6d67",
  };
}

function dashboardMetricsForMode(mode: CollectorMode, dashboard: DashboardHome | null): Array<{ label: string; value: string }> {
  if (mode === "avid") {
    return [
      { label: "Tracked Pops", value: integer(dashboard?.total_pops) },
      { label: "Unique Pops", value: integer(dashboard?.unique_items) },
      { label: "Recent Adds", value: integer(dashboard?.pops_added_this_month) },
    ];
  }

  if (mode === "reseller") {
    return [
      { label: "Total Pops", value: integer(dashboard?.total_pops) },
      { label: "Unique Items", value: integer(dashboard?.unique_items) },
      { label: "Added Month", value: integer(dashboard?.pops_added_this_month) },
    ];
  }

  return [
    { label: "On Shelf", value: integer(dashboard?.total_pops) },
    { label: "Different Pops", value: integer(dashboard?.unique_items) },
    { label: "New This Month", value: integer(dashboard?.pops_added_this_month) },
  ];
}

function dashboardPrimaryHighlightValue(mode: CollectorMode, item: CollectionItem | null): string {
  if (!item) return "--";
  if (mode === "reseller") return money(perPopValue(item));
  if (mode === "avid") return item.number ? `#${item.number}` : "View";
  return "View";
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
  const catalogVariant = item.display_variant ?? item.variant;
  const variantSource = isMeaningfulVariant(item.owned_variant)
    ? item.owned_variant
    : isMeaningfulVariant(catalogVariant)
      ? catalogVariant
      : null;
  const variant = variantSource ? normalizeShelfVariant(variantSource).toLowerCase() : "common";
  if (item.pop_catalog_id) return `catalog:${item.pop_catalog_id}::${variant}`;
  if (item.collection_item_id) return `collection:${item.collection_item_id}::${variant}`;
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
    const completionEligible = isSetCompletionEligible(checklist);
    const ownedCount = group.completionOwnedCount ?? group.uniqueCount;
    const completedGroup = {
      ...group,
      checklistTotal: total,
      completionPercent: Math.min(100, (ownedCount / total) * 100),
      completionSourceLabel: checklist.source_label,
      completionEligible,
      setClassification: checklist.set_classification,
      completionReviewNote: checklist.completion_review_note,
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

function setMissingCount(group: StatsGroup): number | null {
  if (!group.checklistTotal) return null;
  return Math.max(0, group.checklistTotal - (group.completionOwnedCount ?? group.uniqueCount));
}

function compareSetClosest(a: StatsGroup, b: StatsGroup): number {
  const aMissing = setMissingCount(a);
  const bMissing = setMissingCount(b);
  const aIncomplete = aMissing != null && aMissing > 0;
  const bIncomplete = bMissing != null && bMissing > 0;

  if (aIncomplete !== bIncomplete) return aIncomplete ? -1 : 1;
  if (aIncomplete && bIncomplete && aMissing !== bMissing) return Number(aMissing) - Number(bMissing);

  const aPercent = a.completionPercent ?? -1;
  const bPercent = b.completionPercent ?? -1;
  return bPercent - aPercent || b.count - a.count || b.value - a.value || a.name.localeCompare(b.name);
}

function setMatchesProgressDrill(group: StatsGroup, mode: SetProgressDrillMode): boolean {
  const total = Number(group.checklistTotal ?? 0);
  if (total <= 0 || group.completionPercent == null) return false;

  const owned = Number(group.completionOwnedCount ?? group.uniqueCount);
  if (mode === "complete") return group.completionEligible === true && owned >= total;
  if (mode === "withinReach") return group.completionEligible === true && owned > 0 && owned < total;
  return true;
}

function setProgressDrillLabel(mode: SetProgressDrillMode): string {
  if (mode === "complete") return "Complete";
  if (mode === "withinReach") return "Within Reach";
  return "Reviewed";
}

function setStatusBadge(group: StatsGroup): { label: string; backgroundColor: string; borderColor: string; color: string } | null {
  if (!group.checklistTotal) return null;

  if (group.setClassification === "single_release") {
    return {
      label: "Single release",
      backgroundColor: "#25191d",
      borderColor: "#7b4f5b",
      color: "#ffc6d2",
    };
  }

  if (group.completionEligible === false || group.setClassification === "unreviewed") {
    return {
      label: "Checklist review",
      backgroundColor: "#272315",
      borderColor: "#745f2d",
      color: "#ffe7a3",
    };
  }

  if (group.setClassification === "mini_set") {
    return {
      label: "Mini set",
      backgroundColor: "#142827",
      borderColor: "#3f7d73",
      color: "#d8fff7",
    };
  }

  return {
    label: "Certified",
    backgroundColor: "#162235",
    borderColor: "#496fa8",
    color: "#d9e8ff",
  };
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
  const [setProgressDrillMode, setSetProgressDrillMode] = useState<SetProgressDrillMode>("withinReach");
  const [focusedSetName, setFocusedSetName] = useState<string | null>(null);
  const [huntScanContext, setHuntScanContext] = useState<HuntScanContext | null>(null);
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
          onScan={() => {
            setHuntScanContext(null);
            setScreen("scan");
          }}
          onCollection={() => {
            setCollectionFilter(NO_COLLECTION_FILTER);
            setScreen("collection");
          }}
          onShelfStats={() => setScreen("shelfStats")}
          onTradeSell={() => setScreen("tradeSell")}
          onHuntHub={() => setScreen("huntHub")}
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
          huntContext={huntScanContext}
          onBack={() => {
            if (huntScanContext) {
              setScreen("huntHub");
              return;
            }
            goHome();
          }}
          onManualAdd={() => setScreen("manualAdd")}
          onAdded={(item) => {
            setHuntScanContext(null);
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
          onOpenBreakdown={(mode = "withinReach") => {
            setSetProgressDrillMode(mode);
            setFocusedSetName(null);
            setScreen("shelfBreakdown");
          }}
          onOpenSetBreakdown={(setName, mode = "withinReach") => {
            setSetProgressDrillMode(mode);
            setFocusedSetName(setName);
            setScreen("shelfBreakdown");
          }}
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
          initialSetFilter={setProgressDrillMode}
          initialFocusedSetName={focusedSetName}
          onBack={() => setScreen("shelfStats")}
          onOpenFilter={(filter) => {
            setCollectionFilter(filter);
            setScreen("collection");
          }}
        />
      )}
      {screen === "tradeSell" && (
        <TradeSellScreen
          session={session}
          onBack={goHome}
          onScan={() => {
            setHuntScanContext(null);
            setScreen("scan");
          }}
          onChooseShelf={() => {
            setCollectionFilter(NO_COLLECTION_FILTER);
            setScreen("collection");
          }}
          onOpenItem={(item) => {
            setSelectedItem(item);
            setScreen("detail");
          }}
        />
      )}
      {screen === "huntHub" && (
        <HuntHubScreen
          session={session}
          onBack={goHome}
          onScan={(context) => {
            setHuntScanContext(context);
            setScreen("scan");
          }}
          onSharedShelf={() => setScreen("sharedShelf")}
          onShelfStats={() => setScreen("shelfStats")}
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
        <ManagedSharedShelfSettingsScreen
          shelf={selectedShelf}
          session={session}
          onBack={() => setScreen("sharedShelfDetail")}
          onShelfUpdated={(shelf) => setSelectedShelf(shelf)}
          onShelfLeft={() => {
            setSelectedShelf(null);
            setScreen("sharedShelf");
          }}
          appVersion={APP_VERSION}
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
      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brandBlock}>
          <View style={styles.authLogoShell}>
            <Image source={APP_LOGO} style={styles.authLogo} />
          </View>
          <Text style={styles.logoMark}>Shelf-n-Pop</Text>
          <Text style={styles.authTagline}>Your collection, hunts, memories, and values in one place.</Text>
        </View>

        <View style={styles.authFeatureRow}>
          <View style={styles.authFeatureTile}>
            <Text style={styles.authFeatureTitle}>Shelf</Text>
            <Text style={styles.authFeatureCopy}>Track every Pop</Text>
          </View>
          <View style={styles.authFeatureTile}>
            <Text style={styles.authFeatureTitle}>Sets</Text>
            <Text style={styles.authFeatureCopy}>Find what is next</Text>
          </View>
          <View style={styles.authFeatureTile}>
            <Text style={styles.authFeatureTitle}>Hunts</Text>
            <Text style={styles.authFeatureCopy}>Save the story</Text>
          </View>
        </View>

        <View style={styles.authPanel}>
          <View style={styles.authPanelHeader}>
            <Text style={styles.authEyebrow}>{mode === "signIn" ? "Welcome back" : "Start your shelf"}</Text>
            <Text style={styles.authPanelTitle}>{mode === "signIn" ? "Log in to your collection" : "Create your collector account"}</Text>
          </View>

          <View style={styles.authModeSwitch}>
            <Pressable
              onPress={() => setMode("signIn")}
              style={[styles.authModeOption, mode === "signIn" && styles.authModeOptionActive]}
            >
              <Text style={[styles.authModeText, mode === "signIn" && styles.authModeTextActive]}>Log In</Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("signUp")}
              style={[styles.authModeOption, mode === "signUp" && styles.authModeOptionActive]}
            >
              <Text style={[styles.authModeText, mode === "signUp" && styles.authModeTextActive]}>Create</Text>
            </Pressable>
          </View>

          <View style={styles.authFieldGroup}>
            <Label>Email</Label>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="collector@email.com"
              placeholderTextColor="#8c95a3"
              style={[styles.input, styles.authInput]}
            />
          </View>
          <View style={styles.authFieldGroup}>
            <Label>Password</Label>
            <TextInput
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#8c95a3"
              style={[styles.input, styles.authInput]}
            />
          </View>
          {mode === "signUp" && (
            <View style={styles.authFieldGroup}>
              <Label>Confirm Password</Label>
              <TextInput
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                placeholderTextColor="#8c95a3"
                style={[styles.input, styles.authInput]}
              />
            </View>
          )}

          <PrimaryButton label={busy ? "Working..." : mode === "signIn" ? "Log In" : "Create Account"} onPress={submit} disabled={busy} />
          {mode === "signIn" ? (
            <Pressable onPress={sendPasswordReset} disabled={busy} style={styles.linkButton}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.authVersionText}>Shelf-n-Pop v{APP_VERSION}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function DashboardScreen({
  session,
  refreshKey,
  onScan,
  onCollection,
  onShelfStats,
  onTradeSell,
  onHuntHub,
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
  onTradeSell: () => void;
  onHuntHub: () => void;
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
  const dashboardTheme = collectorModeDashboardTheme(collectorMode);
  const dashboardMetrics = dashboardMetricsForMode(collectorMode, dashboard);
  const nextMoveTitle =
    collectorMode === "reseller"
      ? "Review your market shelf"
      : collectorMode === "avid"
        ? "Find the next set-builder win"
        : "Enjoy the newest shelf moments";
  const nextMoveBody =
    collectorMode === "reseller"
      ? "Check sale/trade status, values, and shelf health before the next move."
      : collectorMode === "avid"
        ? "Start with close sets, missing Pops, and variants that tighten the collection."
        : "Jump into recent adds, favorites, and the shared shelf without digging through stats.";
  const nextMoveLabel = collectorMode === "reseller" ? "Open Trade & Sell" : collectorMode === "avid" ? "Open Set Organizer" : "View My Shelf";
  const nextMovePress = collectorMode === "reseller" ? onTradeSell : collectorMode === "avid" ? onShelfStats : onCollection;
  const valueSnapshot = (
    <View style={[styles.dashboardInsightPanel, { borderColor: dashboardTheme.border, backgroundColor: dashboardTheme.panelBg }]}>
      <Text style={styles.dashboardSectionTitle}>{dashboardCopy.insightTitle}</Text>
      {collectorMode === "reseller" ? (
        <View style={styles.dashboardInsightGrid}>
          <View style={[styles.dashboardInsightTile, { backgroundColor: dashboardTheme.cardBg }]}>
            <Text style={styles.dashboardInsightLabel}>Total Paid</Text>
            <Text style={styles.dashboardInsightValue} adjustsFontSizeToFit numberOfLines={1}>
              {money(dashboard?.total_paid)}
            </Text>
          </View>
          <View style={[styles.dashboardInsightTile, { backgroundColor: dashboardTheme.cardBg }]}>
            <Text style={styles.dashboardInsightLabel}>Avg Paid</Text>
            <Text style={styles.dashboardInsightValue} adjustsFontSizeToFit numberOfLines={1}>
              {money(dashboard?.average_paid_per_pop)}
            </Text>
          </View>
          <View style={[styles.dashboardInsightTile, { backgroundColor: dashboardTheme.cardBg }]}>
            <Text style={styles.dashboardInsightLabel}>Avg Value</Text>
            <Text style={styles.dashboardInsightValue} adjustsFontSizeToFit numberOfLines={1}>
              {money(dashboard?.average_value_per_pop)}
            </Text>
          </View>
        </View>
      ) : null}
      <TopStatRow
        label={collectorMode === "reseller" ? "Highest Valued Pop" : collectorMode === "avid" ? "Set Standout" : "Shelf Standout"}
        item={highestValuePop}
        value={dashboardPrimaryHighlightValue(collectorMode, highestValuePop)}
        onPress={highestValuePop ? () => onOpenItem(highestValuePop) : undefined}
      />
      <TopStatRow
        label={collectorMode === "avid" ? "Earliest Release" : collectorMode === "reseller" ? "Oldest Release" : "Oldest Pop"}
        item={oldestPop}
        value={oldestPop ? releaseDateText(oldestPop) ?? "--" : "--"}
        onPress={oldestPop ? () => onOpenItem(oldestPop) : undefined}
      />
    </View>
  );
  const dashboardHomeBase = (
    <View style={[styles.dashboardHomeBase, { borderColor: dashboardTheme.border, backgroundColor: dashboardTheme.heroBg }]}>
      <View style={styles.dashboardHomeHeader}>
        <View style={styles.dashboardHeroTop}>
          <View style={[styles.dashboardLogoShell, styles.dashboardLogoShellCompact, { backgroundColor: dashboardTheme.logoBg }]}>
            <ProfileAvatar avatarKey={resolveAvatarKey(profile?.avatar_url)} size={38} />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.dashboardEyebrow, { color: dashboardTheme.accent }]}>{dashboardCopy.eyebrow}</Text>
            <Text style={styles.dashboardGreeting} adjustsFontSizeToFit numberOfLines={1}>
              {dashboard?.greeting_text ?? "Welcome back, Collector"}
            </Text>
          </View>
        </View>
        <Pressable onPress={onProfile} style={[styles.dashboardModeMiniButton, { borderColor: dashboardTheme.softBorder, backgroundColor: dashboardTheme.accentSoft }]}>
          <Text style={[styles.dashboardModeMiniButtonText, { color: dashboardTheme.accentText }]}>Change</Text>
        </Pressable>
      </View>

      <Text style={styles.dashboardSubtext}>{dashboardActivityText(dashboard)}</Text>

      <View style={styles.dashboardHomeValueRow}>
        <View style={styles.flex}>
          <Text style={styles.dashboardValueLabel}>{dashboardCopy.valueTitle}</Text>
          <Text style={styles.dashboardValue} adjustsFontSizeToFit numberOfLines={1}>
            {money(dashboard?.total_collection_value)}
          </Text>
          <View style={styles.dashboardGainRow}>
            <Text style={styles.dashboardGainLabel}>{collectorMode === "reseller" ? "Net Gain" : "Shelf Change"}</Text>
            <Text style={[styles.dashboardGainValue, gainLossColorStyle(dashboard?.gain_loss)]}>{money(dashboard?.gain_loss)}</Text>
          </View>
        </View>
        <View style={[styles.dashboardValueSide, styles.dashboardHomeValueSide, { borderColor: dashboardTheme.softBorder, backgroundColor: dashboardTheme.cardBg }]}>
          <Text style={styles.dashboardSideLabel}>Avg Value</Text>
          <Text style={styles.dashboardSideValue}>{money(dashboard?.average_value_per_pop)}</Text>
          <Text style={styles.dashboardSideLabel}>Avg Paid</Text>
          <Text style={styles.dashboardSideValue}>{money(dashboard?.average_paid_per_pop)}</Text>
        </View>
      </View>

      <View style={[styles.dashboardHomeFocus, { borderColor: dashboardTheme.softBorder, backgroundColor: dashboardTheme.panelBg }]}>
        <View style={styles.flex}>
          <Text style={[styles.dashboardEyebrow, { color: dashboardTheme.accent }]}>Current focus</Text>
          <Text style={styles.dashboardModeTitle}>{dashboardCopy.focusTitle}</Text>
          <Text style={styles.dashboardHomeFocusBody}>{dashboardCopy.focusBody}</Text>
        </View>
        <View style={styles.dashboardModeFocusRow}>
          <ModeFocusPill label={dashboardCopy.primaryFocus} theme={dashboardTheme} />
          <ModeFocusPill label={dashboardCopy.secondaryFocus} theme={dashboardTheme} />
          <ModeFocusPill label={dashboardCopy.tertiaryFocus} theme={dashboardTheme} />
        </View>
      </View>

      <View style={styles.dashboardCompactStatsGrid}>
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} theme={dashboardTheme} compact />
        ))}
      </View>
    </View>
  );
  const nextBestMove = (
    <Pressable onPress={nextMovePress} style={[styles.dashboardNextMoveCard, { borderColor: dashboardTheme.softBorder, backgroundColor: dashboardTheme.panelBg }]}>
      <View style={styles.flex}>
        <Text style={[styles.dashboardEyebrow, { color: dashboardTheme.accent }]}>Next best move</Text>
        <Text style={styles.dashboardNextMoveTitle}>{nextMoveTitle}</Text>
        <Text style={styles.dashboardNextMoveBody}>{nextMoveBody}</Text>
      </View>
      <Text style={[styles.dashboardNextMoveAction, { color: dashboardTheme.accentText }]}>{nextMoveLabel}</Text>
    </Pressable>
  );
  const modeShelfActionLabel = collectorMode === "reseller" ? "Shelf Stats" : dashboardCopy.statsActionLabel;
  const modeShelfActionDescription = collectorMode === "reseller" ? "Values and shelf health" : dashboardCopy.statsActionSub;
  const modeShelfActionIcon = collectorMode === "reseller" ? DASHBOARD_ICON_VIEW_STATS : DASHBOARD_ICON_SET_PROGRESS;

  return (
    <ScreenFrame title="Shelf-n-Pop" rightLabel="Sign out" onRight={() => supabase.auth.signOut()}>
      {busy ? (
        <ActivityIndicator color="#7e67f4" />
      ) : (
        <>
          {dashboardHomeBase}

          {nextBestMove}

          <View style={[styles.dashboardActionPanel, { borderColor: dashboardTheme.border, backgroundColor: dashboardTheme.panelBg }]}>
            <Text style={styles.dashboardSectionTitle}>✨ Quick Actions</Text>
            <Text style={[styles.dashboardActionGroupLabel, { color: dashboardTheme.accent }]}>Add to Shelf</Text>
            <View style={styles.dashboardActionGroup}>
              <DashboardActionTile
                icon={DASHBOARD_ICON_SCAN_POP}
                label="Scan Pop"
                description="Add or update an item"
                onPress={onScan}
                styles={styles}
                tileStyle={[styles.dashboardWideActionButton, styles.dashboardWidePrimaryAction, { borderColor: dashboardTheme.accent, backgroundColor: dashboardTheme.primaryActionBg }]}
                labelStyle={styles.dashboardActionLabel}
                descriptionStyle={styles.dashboardShelfButtonDescription}
                iconSize={46}
              />
            </View>
            <Text style={[styles.dashboardActionGroupLabel, { color: dashboardTheme.accent }]}>Review Shelf</Text>
            <View style={styles.dashboardBottomActions}>
              <DashboardActionTile
                icon={DASHBOARD_ICON_MY_SHELF}
                label="My Shelf"
                description="Browse and manage your Pops"
                onPress={onCollection}
                styles={styles}
                tileStyle={[styles.dashboardShelfButton, { borderColor: dashboardTheme.softBorder, backgroundColor: dashboardTheme.accentSoft }]}
                labelStyle={[styles.dashboardShelfButtonLabel, { color: dashboardTheme.accentText }]}
              />
              <DashboardActionTile
                icon={modeShelfActionIcon}
                label={modeShelfActionLabel}
                description={modeShelfActionDescription}
                onPress={onShelfStats}
                styles={styles}
                tileStyle={[styles.dashboardShelfButton, { borderColor: dashboardTheme.softBorder, backgroundColor: dashboardTheme.accentSoft }]}
                labelStyle={[styles.dashboardShelfButtonLabel, { color: dashboardTheme.accentText }]}
              />
            </View>
            {collectorMode === "reseller" ? (
              <DashboardActionTile
                icon={DASHBOARD_ICON_VIEW_STATS}
                label="Trade & Sell"
                description="Listings, trades, and sales"
                onPress={onTradeSell}
                styles={styles}
                tileStyle={[styles.dashboardWideActionButton, { borderColor: dashboardTheme.accent, backgroundColor: dashboardTheme.secondaryActionBg }]}
                labelStyle={[styles.dashboardShelfButtonLabel, { color: dashboardTheme.accentText }]}
                descriptionStyle={styles.dashboardShelfButtonDescription}
              />
            ) : null}
            <Text style={[styles.dashboardActionGroupLabel, { color: dashboardTheme.accent }]}>Connect & Play</Text>
            <View style={styles.dashboardBottomActions}>
              <DashboardActionTile
                icon={DASHBOARD_ICON_SHARED_SHELF}
                label="Shared Shelf"
                description="Review group shelves"
                onPress={onSharedShelf}
                styles={styles}
                tileStyle={[styles.dashboardShelfButton, { borderColor: dashboardTheme.softBorder, backgroundColor: dashboardTheme.cardBg }]}
                labelStyle={[styles.dashboardShelfButtonLabel, { color: dashboardTheme.accentText }]}
              />
              <DashboardActionTile
                icon={DASHBOARD_ICON_POP_HUNTS}
                label="Pop Hunts"
                description="Plan the next family hunt"
                onPress={onHuntHub}
                styles={styles}
                tileStyle={[styles.dashboardShelfButton, { borderColor: dashboardTheme.softBorder, backgroundColor: dashboardTheme.cardBg }]}
                labelStyle={[styles.dashboardShelfButtonLabel, { color: dashboardTheme.accentText }]}
              />
            </View>
            <Text style={[styles.dashboardActionGroupLabel, { color: dashboardTheme.accent }]}>Account</Text>
            <DashboardActionTile
              icon={DASHBOARD_ICON_PROFILE_SETTINGS}
              label="Profile & settings"
              description="Mode, avatar, and account"
              onPress={onProfile}
              styles={styles}
              tileStyle={[styles.dashboardWideActionButton, styles.dashboardAccountActionButton, { borderColor: dashboardTheme.softBorder, backgroundColor: dashboardTheme.cardBg }]}
              labelStyle={[styles.dashboardShelfButtonLabel, { color: dashboardTheme.accentText }]}
              descriptionStyle={styles.dashboardShelfButtonDescription}
            />
            {onAdmin ? (
              <Pressable onPress={onAdmin} style={styles.dashboardAdminLink}>
                <Text style={styles.dashboardProfileText}>Admin Console</Text>
              </Pressable>
            ) : null}
          </View>

          {valueSnapshot}
        </>
      )}
    </ScreenFrame>
  );
}

function ModeFocusPill({ label, theme }: { label: string; theme: DashboardTheme }) {
  return (
    <View style={[styles.dashboardModeFocusPill, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
      <Text style={[styles.dashboardModeFocusText, { color: theme.accentText }]}>{label}</Text>
    </View>
  );
}

function DashboardIconLabel({
  icon,
  label,
  labelStyle,
  size = 40,
}: {
  icon: ImageSourcePropType;
  label: string;
  labelStyle: StyleProp<TextStyle>;
  size?: number;
}) {
  return (
    <View style={styles.dashboardIconLabelRow}>
      <Image source={icon} style={[styles.dashboardActionIcon, { width: size, height: size, borderRadius: Math.max(8, size * 0.22) }]} />
      <Text style={[styles.dashboardIconLabelText, labelStyle]} adjustsFontSizeToFit numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function DashboardSectionTitle({ icon, title }: { icon: ImageSourcePropType; title: string }) {
  return (
    <View style={styles.dashboardSectionTitleRow}>
      <Image source={icon} style={styles.dashboardSectionIcon} />
      <Text style={styles.dashboardSectionTitle}>{title}</Text>
    </View>
  );
}

function PageIconHero({
  icon,
  eyebrow,
  title,
  copy,
  style,
}: {
  icon: ImageSourcePropType;
  eyebrow: string;
  title: string;
  copy: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.pageIconHero, style]}>
      <Image source={icon} style={styles.pageIconHeroImage} />
      <View style={styles.flex}>
        <Text style={styles.pageIconHeroEyebrow}>{eyebrow}</Text>
        <Text style={styles.pageIconHeroTitle}>{title}</Text>
        <Text style={styles.pageIconHeroCopy}>{copy}</Text>
      </View>
    </View>
  );
}

type FunkoHunt = {
  id: string;
  user_id: string;
  shared_shelf_id: string | null;
  title: string;
  hunt_month: string;
  status: "planning" | "active" | "completed";
  theme: string | null;
  set_goal: string | null;
  goals: string[] | null;
  recap: string | null;
  favorite_memory: string | null;
  created_at?: string | null;
};
type HuntHubView = "home" | "planning" | "current" | "memory";
type HuntCurrentSection = "route" | "finds" | "memories";
type HuntStopStatus = "planned" | "visited" | "found" | "no_luck";
type FunkoHuntStop = {
  id: string;
  hunt_id: string;
  stop_order: number;
  name: string;
  detail: string | null;
  tag: string | null;
  visit_status: HuntStopStatus;
  visit_note: string | null;
};
type HuntStopDraft = {
  id: string;
  isNew?: boolean;
  stop_order: number;
  name: string;
  detail: string;
  tag: string;
  visit_status: HuntStopStatus;
  visit_note: string;
};
type HuntScanContext = {
  huntId: string;
  huntTitle: string;
  stopId: string;
  stopName: string;
};
type PotentialHotspot = {
  id: string;
  name: string;
  detail: string;
  tag: string;
  kind: string;
  source?: "osm" | "starter" | "custom";
  distanceMiles?: number | null;
  address?: string | null;
};
type HuntHotspotType = "all" | "big_box" | "collector" | "mall" | "resale" | "bookstore";
type FunkoHuntMemory = {
  id: string;
  hunt_id: string;
  author_user_id: string;
  memory_type: "note" | "best_find" | "funny_moment" | "still_hunting";
  body: string;
  mood: string | null;
  created_at: string;
};
type FunkoHuntFind = {
  id: string;
  hunt_id: string;
  stop_id: string | null;
  found_by_user_id: string | null;
  pop_catalog_id: string | null;
  collection_item_id: string | null;
  pop_name: string | null;
  outcome: "spotted" | "bought" | "passed" | "wishlist";
  note: string | null;
  is_best_find: boolean;
  created_at: string;
};
type ItemHuntFind = FunkoHuntFind & {
  funko_hunts?: {
    title: string | null;
    hunt_month: string | null;
    status: FunkoHunt["status"] | null;
  } | null;
  funko_hunt_stops?: {
    name: string | null;
    detail: string | null;
    tag: string | null;
  } | null;
};
type FunkoHuntPhoto = {
  id: string;
  hunt_id: string;
  stop_id: string | null;
  find_id: string | null;
  uploaded_by_user_id: string;
  storage_bucket: string;
  storage_path: string;
  caption: string | null;
  photo_type: "memory" | "find" | "stop";
  created_at: string;
  signed_url?: string | null;
};

const DEFAULT_HUNT_GOALS = [
  "Find one Pop from a close set",
  "Spot something from a shared wishlist",
  "Take one family memory note",
];

const DEFAULT_HUNT_STOPS = [
    { name: "Target run", detail: "Check new drops and shared wishlist finds", tag: "First stop" },
    { name: "Local comic shop", detail: "Look for vaulted and set-completion Pops", tag: "Best odds" },
    { name: "Mall loop", detail: "Let everyone pick one maybe find", tag: "Family pick" },
  ];
const HUNT_STOP_STATUSES: Array<{ value: HuntStopStatus; label: string }> = [
  { value: "planned", label: "Planned" },
  { value: "visited", label: "Visited" },
  { value: "found", label: "Found" },
  { value: "no_luck", label: "No Luck" },
];
const HUNT_STATUSES: Array<{ value: FunkoHunt["status"]; label: string }> = [
  { value: "planning", label: "Plan It" },
  { value: "active", label: "On the Hunt" },
  { value: "completed", label: "Memory Vault" },
];
const HUNT_FIND_OUTCOMES: Array<{ value: FunkoHuntFind["outcome"]; label: string }> = [
  { value: "bought", label: "Bought" },
  { value: "spotted", label: "Spotted" },
  { value: "passed", label: "Passed" },
  { value: "wishlist", label: "Wishlist" },
];
const HUNT_PHOTOS_BUCKET = "hunt-photos";
const HUNT_RADIUS_OPTIONS = [5, 10, 25, 50] as const;
type HuntRadius = (typeof HUNT_RADIUS_OPTIONS)[number];
const HUNT_HOTSPOT_TYPES: Array<{ value: HuntHotspotType; label: string; detail: string }> = [
  { value: "all", label: "All", detail: "Mix the route" },
  { value: "big_box", label: "Big Box", detail: "Chains and quick stops" },
  { value: "collector", label: "Collector", detail: "Comics, toys, collectibles" },
  { value: "mall", label: "Mall", detail: "Hot Topic and BoxLunch odds" },
  { value: "resale", label: "Resale", detail: "Thrift, antique, second hand" },
  { value: "bookstore", label: "Bookstore", detail: "Quiet shelf checks" },
];

type OSMElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string | undefined>;
};

type OSMGeocodeResult = {
  lat: string;
  lon: string;
  display_name?: string;
};

type PhotonFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    osm_key?: string;
    osm_value?: string;
    name?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    town?: string;
    village?: string;
    locality?: string;
  };
};

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildDefaultHuntStopDrafts(): HuntStopDraft[] {
  return DEFAULT_HUNT_STOPS.map((stop, index) => ({
    id: stop.name,
    stop_order: index + 1,
    ...stop,
    visit_status: "planned",
    visit_note: "",
  }));
}

function buildPotentialHotspots(zipCode: string, radius: HuntRadius): PotentialHotspot[] {
  const cleanZip = zipCode.trim();
  const candidates = [
    {
      name: "Target / big-box run",
      kind: "Retail",
      tag: "New drops",
      detail: `Check Target-style retailers around ${cleanZip} for common waves, exclusives, and surprise restocks.`,
    },
    {
      name: "GameStop route",
      kind: "Retail",
      tag: "Exclusives",
      detail: `Look for game, anime, Marvel, and convention sticker finds within ${radius} miles.`,
    },
    {
      name: "Local comic shop",
      kind: "Comic shop",
      tag: "Collector pick",
      detail: "Good stop for older Pops, trade talk, and staff recommendations.",
    },
    {
      name: "Hot Topic / BoxLunch mall stop",
      kind: "Mall",
      tag: "Chase odds",
      detail: "Worth checking for anime, Disney, exclusives, and shared-shelf wishlist finds.",
    },
    {
      name: "Barnes & Noble loop",
      kind: "Bookstore",
      tag: "Quiet find",
      detail: "A slower stop that can still surface exclusives, movie lines, and hidden older stock.",
    },
    {
      name: "Walmart late aisle check",
      kind: "Retail",
      tag: "Wild card",
      detail: "Best as a quick pass for new waves, clearance finds, and unexpected shelf stock.",
    },
    {
      name: "Antique mall / flea market",
      kind: "Resale",
      tag: "Vaulted hunt",
      detail: "Use this for memory-making and older finds, but compare prices before buying.",
    },
    {
      name: "Collectibles and toy shop",
      kind: "Collectibles",
      tag: "Best odds",
      detail: "Most likely place for vaulted Pops, grails, trades, and display-worthy finds.",
    },
  ];
  const resultCount = radius <= 5 ? 4 : radius <= 10 ? 5 : radius <= 25 ? 7 : candidates.length;
  return candidates.slice(0, resultCount).map((candidate, index) => ({
    id: `${cleanZip}-${radius}-${index}`,
    source: "starter" as const,
    ...candidate,
  }));
}

function milesBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthMiles = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return earthMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function hotspotAddress(tags: Record<string, string | undefined>): string | null {
  const parts = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

function namedSearchAddress(properties: PhotonFeature["properties"]): string | null {
  if (!properties) return null;
  const parts = [properties.housenumber, properties.street, properties.city || properties.town || properties.village || properties.locality].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

function namedSearchBbox(lat: number, lon: number, radiusMiles: HuntRadius): string {
  const latDelta = radiusMiles / 69;
  const lonDelta = radiusMiles / Math.max(Math.cos((lat * Math.PI) / 180) * 69, 1);
  const left = lon - lonDelta;
  const right = lon + lonDelta;
  const top = lat + latDelta;
  const bottom = lat - latDelta;
  return `${left},${bottom},${right},${top}`;
}

function hotspotKindFromTags(tags: Record<string, string | undefined>): string {
  const shop = tags.shop;
  const amenity = tags.amenity;
  const brand = (tags.brand || tags.name || "").toLowerCase();
  if (brand.includes("hot topic") || brand.includes("boxlunch") || tags.mall) return "Mall";
  if (shop === "comics" || shop === "toys" || shop === "collector" || shop === "video_games" || shop === "games") return "Collector";
  if (shop === "second_hand" || shop === "charity" || shop === "antiques" || amenity === "marketplace") return "Resale";
  if (shop === "books") return "Bookstore";
  if (shop === "department_store" || shop === "supermarket" || shop === "variety_store" || brand.includes("target") || brand.includes("walmart") || brand.includes("gamestop")) return "Retail";
  return shop ? compactName(shop) : "Local stop";
}

function hotspotTag(kind: string, tags: Record<string, string | undefined>): string {
  const brand = (tags.brand || tags.name || "").toLowerCase();
  if (kind === "Collector") return "Best odds";
  if (kind === "Mall") return "Chase odds";
  if (kind === "Resale") return "Vaulted hunt";
  if (kind === "Bookstore") return "Quiet find";
  if (brand.includes("gamestop")) return "Exclusives";
  if (brand.includes("target") || brand.includes("walmart")) return "New drops";
  return "Local result";
}

function hotspotWhy(kind: string, name: string, distanceMiles: number | null): string {
  const distance = distanceMiles == null ? "" : `${distanceMiles.toFixed(1)} mi away. `;
  if (kind === "Collector") return `${distance}${name} may be good for older Pops, trades, and set-completion finds.`;
  if (kind === "Mall") return `${distance}Worth checking for anime, Disney, exclusives, and shared wishlist finds.`;
  if (kind === "Resale") return `${distance}Good memory-making stop for older finds. Compare prices before buying.`;
  if (kind === "Bookstore") return `${distance}A quieter stop that can still surface exclusives and hidden shelf stock.`;
  if (kind === "Retail") return `${distance}Good quick stop for new waves, commons, and occasional exclusives.`;
  return `${distance}Potential local hunting ground from OpenStreetMap.`;
}

function overpassFilters(type: HuntHotspotType): string[] {
  const chain = '["brand"~"Target|Walmart|GameStop|Hot Topic|BoxLunch|Barnes|Noble",i]';
  if (type === "big_box") return ['["shop"~"department_store|supermarket|variety_store|video_games|games"]', chain];
  if (type === "collector") return ['["shop"~"comics|toys|collector|video_games|games|hobby"]'];
  if (type === "mall") return [chain, '["shop"~"clothes|gift|toys"]["name"~"Hot Topic|BoxLunch",i]'];
  if (type === "resale") return ['["shop"~"second_hand|charity|antiques|thrift"]', '["amenity"="marketplace"]'];
  if (type === "bookstore") return ['["shop"="books"]', '["brand"~"Barnes|Noble",i]'];
  return ['["shop"~"department_store|supermarket|variety_store|video_games|games|comics|toys|collector|hobby|second_hand|charity|antiques|thrift|books"]', '["amenity"="marketplace"]', chain];
}

function escapeOverpassRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function searchNameToLooseRegex(value: string): string {
  const tokens = value
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/^&$/, "and"))
    .filter(Boolean)
    .map(escapeOverpassRegex);
  return tokens.join(".{0,16}");
}

function namedPlaceFilters(searchName: string): string[] {
  const cleanName = searchName.trim();
  if (!cleanName) return [];
  const escaped = searchNameToLooseRegex(cleanName);
  const nameFilter = `["name"~"${escaped}",i]`;
  const brandFilter = `["brand"~"${escaped}",i]`;
  const operatorFilter = `["operator"~"${escaped}",i]`;
  return [
    `["shop"]${nameFilter}`,
    `["shop"]${brandFilter}`,
    `["shop"]${operatorFilter}`,
    `["amenity"]${nameFilter}`,
    `["amenity"]${brandFilter}`,
    `["amenity"]${operatorFilter}`,
  ];
}

function buildOverpassQuery(lat: number, lon: number, radiusMiles: HuntRadius, type: HuntHotspotType, searchName = ""): string {
  const radiusMeters = Math.min(radiusMiles * 1609.34, 80467);
  const nameRegex = searchNameToLooseRegex(searchName);
  const filters = searchName.trim() ? [...namedPlaceFilters(searchName), ...overpassFilters(type).map((filter) => `${filter}["name"~"${nameRegex}",i]`)] : overpassFilters(type);
  const clauses = filters
    .flatMap((filter) => [
      `node(around:${radiusMeters},${lat},${lon})${filter};`,
      `way(around:${radiusMeters},${lat},${lon})${filter};`,
      `relation(around:${radiusMeters},${lat},${lon})${filter};`,
    ])
    .join("\n");
  return `[out:json][timeout:14];\n(\n${clauses}\n);\nout center tags 24;`;
}

async function geocodeZipWithOSM(zipCode: string): Promise<{ lat: number; lon: number; label: string }> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=us&postalcode=${encodeURIComponent(zipCode)}&limit=1`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!response.ok) throw new Error(`ZIP lookup failed (${response.status})`);
  const data = (await response.json()) as OSMGeocodeResult[];
  const first = data[0];
  if (!first) throw new Error("ZIP code was not found.");
  const lat = Number(first.lat);
  const lon = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error("ZIP code returned an invalid location.");
  return { lat, lon, label: first.display_name || zipCode };
}

async function fetchNamedHotspotsWithOSM(
  location: { lat: number; lon: number },
  searchName: string,
  radius: HuntRadius,
): Promise<PotentialHotspot[]> {
  const cleanName = searchName.trim();
  if (!cleanName) return [];
  const params = new URLSearchParams({
    q: cleanName,
    limit: "10",
    lat: String(location.lat),
    lon: String(location.lon),
    bbox: namedSearchBbox(location.lat, location.lon, radius),
  });
  const response = await fetchWithTimeout(
    `https://photon.komoot.io/api/?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
    },
    7000,
  );
  if (!response.ok) return [];
  const results = (await response.json()) as { features?: PhotonFeature[] };
  const seen = new Set<string>();
  return (results.features ?? [])
    .map<PotentialHotspot | null>((result) => {
      const coordinates = result.geometry?.coordinates;
      if (!coordinates) return null;
      const [lon, lat] = coordinates;
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
      const distanceMiles = milesBetween(location.lat, location.lon, lat, lon);
      if (distanceMiles > radius + 0.25) return null;
      const properties = result.properties ?? {};
      const name = properties.name;
      if (!name) return null;
      const key = `${name.toLowerCase()}-${Math.round(lat * 1000)}-${Math.round(lon * 1000)}`;
      if (seen.has(key)) return null;
      seen.add(key);
      const pseudoTags: Record<string, string | undefined> = {
        name,
        shop: properties.osm_key === "shop" ? properties.osm_value : undefined,
        amenity: properties.osm_key === "amenity" ? properties.osm_value : undefined,
      };
      const kind = hotspotKindFromTags(pseudoTags);
      const address = namedSearchAddress(properties);
      return {
        id: `osm-named-${key}`,
        name,
        kind,
        tag: hotspotTag(kind, pseudoTags),
        detail: hotspotWhy(kind, name, distanceMiles),
        source: "osm" as const,
        distanceMiles,
        address,
      };
    })
    .filter((value): value is PotentialHotspot => value !== null)
    .sort((a, b) => Number(a.distanceMiles ?? 999) - Number(b.distanceMiles ?? 999));
}

async function fetchOSMHotspots(zipCode: string, radius: HuntRadius, type: HuntHotspotType, searchName = ""): Promise<PotentialHotspot[]> {
  const location = await geocodeZipWithOSM(zipCode);
  const namedResults = await fetchNamedHotspotsWithOSM(location, searchName, radius);
  const query = buildOverpassQuery(location.lat, location.lon, radius, type, searchName);
  let json: { elements?: OSMElement[] };
  try {
    const response = await fetchWithTimeout("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Accept: "application/json",
      },
      body: new URLSearchParams({ data: query }).toString(),
    }, searchName.trim() ? 7000 : 12000);
    if (!response.ok) {
      if (namedResults.length > 0) return namedResults;
      throw new Error(`Place search failed (${response.status})`);
    }
    json = (await response.json()) as { elements?: OSMElement[] };
  } catch (error) {
    if (namedResults.length > 0) return namedResults;
    throw error;
  }
  const seen = new Set<string>();
  namedResults.forEach((hotspot) => {
    const key = `${hotspot.name.toLowerCase()}-${Math.round(Number(hotspot.distanceMiles ?? 0) * 10)}`;
    seen.add(key);
  });
  const overpassHotspots = (json.elements ?? [])
    .map<PotentialHotspot | null>((element) => {
      const tags = element.tags ?? {};
      const name = tags.name || tags.brand || tags.operator;
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;
      if (!name || lat == null || lon == null) return null;
      const distanceMiles = milesBetween(location.lat, location.lon, Number(lat), Number(lon));
      const key = `${name.toLowerCase()}-${Math.round(distanceMiles * 10)}`;
      if (seen.has(key)) return null;
      seen.add(key);
      const kind = hotspotKindFromTags(tags);
      const address = hotspotAddress(tags);
      return {
        id: `osm-${element.type}-${element.id}`,
        name,
        kind,
        tag: hotspotTag(kind, tags),
        detail: hotspotWhy(kind, name, distanceMiles),
        source: "osm" as const,
        distanceMiles,
        address,
      };
    })
    .filter((value): value is PotentialHotspot => value !== null)
  const hotspots = [...namedResults, ...overpassHotspots]
    .sort((a, b) => Number(a.distanceMiles ?? 999) - Number(b.distanceMiles ?? 999))
    .slice(0, 12);
  return hotspots;
}

function buildTypedHotspot(searchName: string, zipCode: string, radius: HuntRadius): PotentialHotspot | null {
  const cleanName = searchName.trim();
  if (!cleanName) return null;
  return {
    id: `typed-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${zipCode.trim()}`,
    name: cleanName,
    kind: "Typed stop",
    tag: "Add anyway",
    detail: `OpenStreetMap may not list this place yet. Add it to this hunt and use notes/photos to capture the visit around ${zipCode.trim()} within your ${radius}-mile search area.`,
    source: "custom",
  };
}

function huntStopDetailWithAddress(hotspot: PotentialHotspot): string {
  const address = hotspot.address?.trim();
  const detail = hotspot.detail.trim();
  if (!address) return detail;
  return `Address: ${address}${detail ? `\n${detail}` : ""}`;
}

function huntStopMapQuery(stop: Pick<HuntStopDraft, "name" | "detail">) {
  const detailLines = String(stop.detail ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const addressLine = detailLines.find((line) => /^address\s*:/i.test(line));
  const address = addressLine?.replace(/^address\s*:\s*/i, "").trim();
  if (address) return address;

  const usefulDetail = detailLines.find((line) => !/openstreetmap|potential local hunting ground|add it to this hunt/i.test(line));
  return [stop.name, usefulDetail]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}

function mapUrlForStop(stop: Pick<HuntStopDraft, "name" | "detail">, provider: "apple" | "directions") {
  const query = encodeURIComponent(huntStopMapQuery(stop));
  if (!query) return null;
  if (provider === "apple") return `https://maps.apple.com/?daddr=${query}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}

function currentMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function displayHuntDate(value: string | null | undefined): string {
  if (!value) return "This month";
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return "This month";
  return new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

function displayHuntFoundDate(value: string | null | undefined): string {
  if (!value) return "Date not saved";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not saved";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function photoExtension(mimeType?: string | null): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function HuntHubScreen({
  session,
  onBack,
  onScan,
  onSharedShelf,
  onShelfStats,
}: {
  session: Session;
  onBack: () => void;
  onScan: (context: HuntScanContext) => void;
  onSharedShelf: () => void;
  onShelfStats: () => void;
}) {
  const huntMonthStart = currentMonthStart();
  const huntMonth = displayHuntDate(huntMonthStart);
  const [hunt, setHunt] = useState<FunkoHunt | null>(null);
  const [huntStops, setHuntStops] = useState<FunkoHuntStop[]>([]);
  const [huntStopDrafts, setHuntStopDrafts] = useState<HuntStopDraft[]>([]);
  const [huntMemories, setHuntMemories] = useState<FunkoHuntMemory[]>([]);
  const [huntFinds, setHuntFinds] = useState<FunkoHuntFind[]>([]);
  const [huntPhotos, setHuntPhotos] = useState<FunkoHuntPhoto[]>([]);
  const [sharedShelves, setSharedShelves] = useState<SharedShelf[]>([]);
  const [visibleHunts, setVisibleHunts] = useState<FunkoHunt[]>([]);
  const [selectedHuntId, setSelectedHuntId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [huntView, setHuntView] = useState<HuntHubView>("home");
  const [huntCurrentSection, setHuntCurrentSection] = useState<HuntCurrentSection>("route");
  const [isNewHuntDraft, setIsNewHuntDraft] = useState(false);
  const [selectedSharedShelfId, setSelectedSharedShelfId] = useState<string | null>(null);
  const [memoryText, setMemoryText] = useState("");
  const [huntTitleInput, setHuntTitleInput] = useState("");
  const [huntThemeInput, setHuntThemeInput] = useState("");
  const [huntSetGoalInput, setHuntSetGoalInput] = useState("");
  const [huntGoalsInput, setHuntGoalsInput] = useState(DEFAULT_HUNT_GOALS.join("\n"));
  const [hotspotZip, setHotspotZip] = useState("");
  const [hotspotSearchName, setHotspotSearchName] = useState("");
  const [hotspotRadius, setHotspotRadius] = useState<HuntRadius>(10);
  const [hotspotType, setHotspotType] = useState<HuntHotspotType>("all");
  const [hotspotResults, setHotspotResults] = useState<PotentialHotspot[]>([]);
  const [hotspotMessage, setHotspotMessage] = useState("Suggestions are place-type starters for now. Search a ZIP code to try free local results from OpenStreetMap.");
  const [hotspotBusy, setHotspotBusy] = useState(false);
  const [quickStopName, setQuickStopName] = useState("");
  const [quickStopDetail, setQuickStopDetail] = useState("");
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadHunt = useCallback(async () => {
    setBusy(true);
    try {
      const [huntsResult, shelves] = await Promise.all([
        supabase
          .from("funko_hunts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        fetchMySharedShelves().catch(() => [] as SharedShelf[]),
      ]);

      if (huntsResult.error) throw huntsResult.error;

      const nextHunts = (huntsResult.data ?? []) as FunkoHunt[];
      setVisibleHunts(nextHunts);
      setSharedShelves(shelves);

      if (isNewHuntDraft) {
        setSelectedSharedShelfId((current) => current ?? shelves[0]?.id ?? null);
        setHunt(null);
        setHuntStops([]);
        setHuntStopDrafts(buildDefaultHuntStopDrafts());
        setHuntMemories([]);
        setHuntFinds([]);
        setHuntPhotos([]);
        return;
      }

      const ownHunt =
        nextHunts.find((candidate) => candidate.user_id === session.user.id && candidate.status !== "completed") ??
        nextHunts.find((candidate) => candidate.user_id === session.user.id) ??
        null;
      const selectedHunt = selectedHuntId ? nextHunts.find((candidate) => candidate.id === selectedHuntId) ?? null : null;
      const nextHunt = selectedHunt ?? ownHunt ?? nextHunts.find((candidate) => candidate.status !== "completed") ?? nextHunts[0] ?? null;
      setHunt(nextHunt);
      setSelectedHuntId(nextHunt?.id ?? null);
      setSelectedSharedShelfId(nextHunt?.shared_shelf_id ?? shelves[0]?.id ?? null);
      setHuntTitleInput(nextHunt?.title ?? `${huntMonth} Pop Hunt`);
      setHuntThemeInput(nextHunt?.theme ?? "Family memory");
      setHuntSetGoalInput(nextHunt?.set_goal ?? "Close a set");
      setHuntGoalsInput((nextHunt?.goals?.length ? nextHunt.goals : DEFAULT_HUNT_GOALS).join("\n"));

      if (!nextHunt) {
        setHuntStops([]);
        setHuntStopDrafts(buildDefaultHuntStopDrafts());
        setHuntMemories([]);
        setHuntFinds([]);
        setHuntPhotos([]);
        return;
      }

      const [stopsResult, memoriesResult, findsResult, photosResult] = await Promise.all([
        supabase.from("funko_hunt_stops").select("*").eq("hunt_id", nextHunt.id).order("stop_order", { ascending: true }),
        supabase.from("funko_hunt_memories").select("*").eq("hunt_id", nextHunt.id).order("created_at", { ascending: false }).limit(8),
        supabase.from("funko_hunt_finds").select("*").eq("hunt_id", nextHunt.id).order("created_at", { ascending: false }),
        supabase.from("funko_hunt_photos").select("*").eq("hunt_id", nextHunt.id).order("created_at", { ascending: false }).limit(12),
      ]);
      if (stopsResult.error) throw stopsResult.error;
      if (memoriesResult.error) throw memoriesResult.error;
      if (findsResult.error) throw findsResult.error;
      if (photosResult.error) throw photosResult.error;

      const nextStops = (stopsResult.data ?? []) as FunkoHuntStop[];
      setHuntStops(nextStops);
      setHuntStopDrafts(
        nextStops.map((stop) => ({
          id: stop.id,
          stop_order: stop.stop_order,
          name: stop.name,
          detail: stop.detail ?? "",
          tag: stop.tag ?? "",
          visit_status: stop.visit_status ?? "planned",
          visit_note: stop.visit_note ?? "",
        })),
      );
      setHuntMemories((memoriesResult.data ?? []) as FunkoHuntMemory[]);
      setHuntFinds((findsResult.data ?? []) as FunkoHuntFind[]);
      const nextPhotos = (photosResult.data ?? []) as FunkoHuntPhoto[];
      const photosWithUrls = await Promise.all(
        nextPhotos.map(async (photo) => {
          const { data } = await supabase.storage.from(HUNT_PHOTOS_BUCKET).createSignedUrl(photo.storage_path, 60 * 60);
          return { ...photo, signed_url: data?.signedUrl ?? null };
        }),
      );
      setHuntPhotos(photosWithUrls);
    } catch (error) {
      Alert.alert("Pop Hunts error", error instanceof Error ? error.message : "Unable to load your trips.");
    } finally {
      setBusy(false);
    }
  }, [huntMonthStart, isNewHuntDraft, selectedHuntId, session.user.id]);

  useEffect(() => {
    loadHunt();
  }, [loadHunt]);

  const nextDefaultHuntTitle = () => {
    const sameMonthCount = visibleHunts.filter((candidate) => candidate.user_id === session.user.id && candidate.hunt_month === huntMonthStart).length;
    return sameMonthCount > 0 ? `${huntMonth} Pop Hunt ${sameMonthCount + 1}` : `${huntMonth} Pop Hunt`;
  };

  const startNewHuntDraft = () => {
    setIsNewHuntDraft(true);
    setHunt(null);
    setSelectedHuntId(null);
    setSelectedStopId(null);
    setHuntStops([]);
    setHuntStopDrafts(buildDefaultHuntStopDrafts());
    setHuntMemories([]);
    setHuntFinds([]);
    setHuntPhotos([]);
    setMemoryText("");
    setHuntCurrentSection("route");
    setHuntTitleInput(nextDefaultHuntTitle());
    setHuntThemeInput("Family memory");
    setHuntSetGoalInput("Close a set");
    setHuntGoalsInput(DEFAULT_HUNT_GOALS.join("\n"));
    setHotspotResults([]);
    setHotspotMessage("Add a ZIP code or store name when you are ready to build the route.");
    setQuickStopName("");
    setQuickStopDetail("");
    setSelectedSharedShelfId((current) => current ?? sharedShelves[0]?.id ?? null);
    setHuntView("planning");
  };

  const createMonthlyHunt = async () => {
    const cleanTitle = huntTitleInput.trim() || nextDefaultHuntTitle();
    const cleanTheme = huntThemeInput.trim() || "Family memory";
    const cleanSetGoal = huntSetGoalInput.trim() || "Close a set";
    const cleanGoals = huntGoalsInput
      .split("\n")
      .map((goal) => goal.trim())
      .filter(Boolean);
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("funko_hunts")
        .insert({
          user_id: session.user.id,
          shared_shelf_id: selectedSharedShelfId,
          title: cleanTitle,
          hunt_month: huntMonthStart,
          status: "planning",
          theme: cleanTheme,
          set_goal: cleanSetGoal,
          goals: cleanGoals.length ? cleanGoals : DEFAULT_HUNT_GOALS,
        })
        .select("*")
        .single();
      if (error) throw error;

      const nextHunt = data as FunkoHunt;
      setIsNewHuntDraft(false);
      setSelectedHuntId(nextHunt.id);
      setHunt(nextHunt);
      setHuntTitleInput(nextHunt.title);
      setHuntThemeInput(nextHunt.theme ?? "Pop Hunt memory");
      setHuntSetGoalInput(nextHunt.set_goal ?? "Close a set");
      setHuntGoalsInput((nextHunt.goals?.length ? nextHunt.goals : DEFAULT_HUNT_GOALS).join("\n"));
      setHuntView("planning");
      const { error: stopsError } = await supabase.from("funko_hunt_stops").insert(
        DEFAULT_HUNT_STOPS.map((stop, index) => ({
          hunt_id: nextHunt.id,
          stop_order: index + 1,
          ...stop,
          visit_status: "planned",
          visit_note: null,
        })),
      );
      if (stopsError) throw stopsError;

      await loadHunt();
    } catch (error) {
      Alert.alert("Pop Hunt not saved", error instanceof Error ? error.message : "Unable to start this Pop Hunt.");
    } finally {
      setSaving(false);
    }
  };

  const saveMemory = async () => {
    if (!hunt || !memoryText.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("funko_hunt_memories").insert({
        hunt_id: hunt.id,
        author_user_id: session.user.id,
        memory_type: "note",
        body: memoryText.trim(),
        mood: "Family note",
      });
      if (error) throw error;
      setMemoryText("");
      await loadHunt();
    } catch (error) {
      Alert.alert("Memory not saved", error instanceof Error ? error.message : "Unable to save that hunt memory.");
    } finally {
      setSaving(false);
    }
  };

  const uploadHuntPhoto = async (source: "camera" | "library", stopId?: string | null) => {
    if (!hunt) return;

    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Photo permission needed", source === "camera" ? "Allow camera access to take hunt photos." : "Allow photo access to choose hunt photos.");
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.82,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.82,
          });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType || "image/jpeg";
    const storagePath = `${session.user.id}/${hunt.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${photoExtension(mimeType)}`;

    setSaving(true);
    try {
      const response = await fetch(asset.uri);
      const fileBody = await response.blob();
      const { error: uploadError } = await supabase.storage.from(HUNT_PHOTOS_BUCKET).upload(storagePath, fileBody, {
        contentType: mimeType,
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { error: photoError } = await supabase.from("funko_hunt_photos").insert({
        hunt_id: hunt.id,
        stop_id: stopId || null,
        uploaded_by_user_id: session.user.id,
        storage_bucket: HUNT_PHOTOS_BUCKET,
        storage_path: storagePath,
        caption: stopId ? "Saved from this stop" : source === "camera" ? "Taken during the hunt" : "Added from photos",
        photo_type: stopId ? "stop" : "memory",
      });
      if (photoError) throw photoError;

      await loadHunt();
    } catch (error) {
      Alert.alert("Photo not saved", error instanceof Error ? error.message : "Unable to save that hunt photo.");
    } finally {
      setSaving(false);
    }
  };

  const saveHuntSettings = async () => {
    if (!hunt || !huntTitleInput.trim()) return;
    const nextGoals = huntGoalsInput
      .split("\n")
      .map((goal) => goal.trim())
      .filter(Boolean)
      .slice(0, 5);

    setSaving(true);
    try {
      const { error } = await supabase
        .from("funko_hunts")
        .update({
          title: huntTitleInput.trim(),
          theme: huntThemeInput.trim() || null,
          set_goal: huntSetGoalInput.trim() || null,
          goals: nextGoals.length > 0 ? nextGoals : DEFAULT_HUNT_GOALS,
          shared_shelf_id: selectedSharedShelfId,
        })
        .eq("id", hunt.id);
      if (error) throw error;
      await loadHunt();
    } catch (error) {
      Alert.alert("Settings not saved", error instanceof Error ? error.message : "Unable to update this hunt.");
    } finally {
      setSaving(false);
    }
  };

  const updateGoalDraft = (index: number, value: string) => {
    const nextGoals = huntGoalsInput.split("\n");
    while (nextGoals.length <= index) nextGoals.push("");
    nextGoals[index] = value;
    setHuntGoalsInput(nextGoals.join("\n"));
  };

  const updateHuntStatus = async (status: FunkoHunt["status"]) => {
    if (!hunt || hunt.status === status) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("funko_hunts").update({ status }).eq("id", hunt.id);
      if (error) throw error;
      await loadHunt();
    } catch (error) {
      Alert.alert("Status not saved", error instanceof Error ? error.message : "Unable to update hunt status.");
    } finally {
      setSaving(false);
    }
  };

  const saveHuntGoals = async () => {
    if (!hunt) return;
    const nextGoals = huntGoalsInput
      .split("\n")
      .map((goal) => goal.trim())
      .filter(Boolean)
      .slice(0, 5);

    setSaving(true);
    try {
      const { error } = await supabase.from("funko_hunts").update({ goals: nextGoals.length > 0 ? nextGoals : DEFAULT_HUNT_GOALS }).eq("id", hunt.id);
      if (error) throw error;
      await loadHunt();
    } catch (error) {
      Alert.alert("Goals not saved", error instanceof Error ? error.message : "Unable to update hunt goals.");
    } finally {
      setSaving(false);
    }
  };

  const updateStopDraft = <K extends keyof Pick<HuntStopDraft, "name" | "detail" | "tag" | "visit_status" | "visit_note">>(
    id: string,
    field: K,
    value: HuntStopDraft[K],
  ) => {
    setHuntStopDrafts((current) => current.map((stop) => (stop.id === id ? { ...stop, [field]: value } : stop)));
  };

  const addStopDraft = () => {
    setHuntStopDrafts((current) => [
      ...current,
      {
        id: `new-${Date.now()}`,
        isNew: true,
        stop_order: current.length + 1,
        name: "",
        detail: "",
        tag: "",
        visit_status: "planned",
        visit_note: "",
      },
    ]);
  };

  const addQuickHuntStop = async () => {
    if (!hunt) return;
    const name = quickStopName.trim();
    const detail = quickStopDetail.trim();
    if (!name) {
      Alert.alert("Stop name needed", "Add the store or place name before adding it to the route.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("funko_hunt_stops").insert({
        hunt_id: hunt.id,
        stop_order: routeStopCount + 1,
        name,
        detail: detail ? `Address: ${detail}` : null,
        tag: "Pop-up stop",
        visit_status: "planned",
        visit_note: null,
      });
      if (error) throw error;
      setQuickStopName("");
      setQuickStopDetail("");
      await loadHunt();
    } catch (error) {
      Alert.alert("Stop not added", error instanceof Error ? error.message : "Unable to add that stop.");
    } finally {
      setSaving(false);
    }
  };

  const removeStopDraft = async (stop: HuntStopDraft) => {
    const removeLocalStop = () => {
      setHuntStopDrafts((current) => current.filter((candidate) => candidate.id !== stop.id).map((candidate, index) => ({ ...candidate, stop_order: index + 1 })));
    };

    if (stop.isNew) {
      removeLocalStop();
      return;
    }

    const deleteStop = async () => {
      setSaving(true);
      try {
        const { error } = await supabase.from("funko_hunt_stops").delete().eq("id", stop.id);
        if (error) throw error;
        await loadHunt();
      } catch (error) {
        Alert.alert("Stop not removed", error instanceof Error ? error.message : "Unable to remove that stop.");
      } finally {
        setSaving(false);
      }
    };

    const message = `Remove ${stop.name || "this stop"} from the route? Finds and photos linked to the stop will stay with the hunt.`;
    if (IS_WEB && typeof window !== "undefined") {
      if (window.confirm(message)) await deleteStop();
      return;
    }

    Alert.alert("Remove stop?", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: deleteStop },
    ]);
  };

  const findPotentialHotspots = async () => {
    const cleanZip = hotspotZip.trim();
    const cleanName = hotspotSearchName.trim();
    if (!/^\d{5}$/.test(cleanZip)) {
      Alert.alert("ZIP code needed", "Enter a 5-digit ZIP code to find potential hunting grounds.");
      return;
    }
    const typedHotspot = buildTypedHotspot(cleanName, cleanZip, hotspotRadius);
    setHotspotBusy(true);
    if (typedHotspot) {
      setHotspotResults([typedHotspot]);
    }
    setHotspotMessage(cleanName ? `Searching free OpenStreetMap results for "${cleanName}"...` : "Searching free OpenStreetMap results...");
    try {
      const osmResults = await fetchOSMHotspots(cleanZip, hotspotRadius, hotspotType, cleanName);
      if (osmResults.length > 0) {
        setHotspotResults(typedHotspot ? [typedHotspot, ...osmResults] : osmResults);
        setHotspotMessage(`Showing ${osmResults.length} local OpenStreetMap result${osmResults.length === 1 ? "" : "s"}${cleanName ? ` for "${cleanName}"` : ""}.`);
        return;
      }
      setHotspotResults(typedHotspot ? [typedHotspot, ...buildPotentialHotspots(cleanZip, hotspotRadius)] : buildPotentialHotspots(cleanZip, hotspotRadius));
      setHotspotMessage(cleanName ? `OpenStreetMap did not find nearby matches for "${cleanName}". You can add the typed stop anyway, or use the starter suggestions below.` : "OpenStreetMap did not have enough nearby matches, so these are starter suggestions.");
    } catch (error) {
      setHotspotResults(typedHotspot ? [typedHotspot, ...buildPotentialHotspots(cleanZip, hotspotRadius)] : buildPotentialHotspots(cleanZip, hotspotRadius));
      const message = error instanceof Error && error.name === "AbortError" ? "Map search took too long." : error instanceof Error ? error.message : "Map search did not finish.";
      setHotspotMessage(`${message} You can still add the typed stop or use starter suggestions.`);
    } finally {
      setHotspotBusy(false);
    }
  };

  const addPotentialHotspotToHunt = async (hotspot: PotentialHotspot) => {
    if (!hunt) {
      Alert.alert("Start a Pop Hunt first", "Create a Pop Hunt before adding hunting grounds.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("funko_hunt_stops").insert({
        hunt_id: hunt.id,
        stop_order: huntStopDrafts.length + 1,
        name: hotspot.name,
        detail: huntStopDetailWithAddress(hotspot),
        tag: hotspot.tag,
        visit_status: "planned",
        visit_note: null,
      });
      if (error) throw error;
      await loadHunt();
    } catch (error) {
      Alert.alert("Stop not added", error instanceof Error ? error.message : "Unable to add that hunting ground.");
    } finally {
      setSaving(false);
    }
  };

  const saveHuntStops = async () => {
    if (!hunt) return;
    const cleanedStops = huntStopDrafts
      .map((stop, index) => ({
        ...stop,
        stop_order: index + 1,
        name: stop.name.trim(),
        detail: stop.detail.trim(),
        tag: stop.tag.trim(),
        visit_note: stop.visit_note.trim(),
      }))
      .filter((stop) => stop.name);

    setSaving(true);
    try {
      for (const stop of cleanedStops) {
        if (stop.isNew) {
          const { error } = await supabase.from("funko_hunt_stops").insert({
            hunt_id: hunt.id,
            stop_order: stop.stop_order,
            name: stop.name,
            detail: stop.detail || null,
            tag: stop.tag || null,
            visit_status: stop.visit_status,
            visit_note: stop.visit_note || null,
          });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("funko_hunt_stops")
            .update({
              stop_order: stop.stop_order,
              name: stop.name,
              detail: stop.detail || null,
              tag: stop.tag || null,
              visit_status: stop.visit_status,
              visit_note: stop.visit_note || null,
            })
            .eq("id", stop.id);
          if (error) throw error;
        }
      }
      await loadHunt();
    } catch (error) {
      Alert.alert("Stops not saved", error instanceof Error ? error.message : "Unable to update hunt stops.");
    } finally {
      setSaving(false);
    }
  };

  const saveStopDetails = async (stop: HuntStopDraft) => {
    if (!hunt || stop.isNew) return;
    const cleanedName = stop.name.trim();
    if (!cleanedName) {
      Alert.alert("Stop name needed", "Give this stop a name before saving it.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("funko_hunt_stops")
        .update({
          name: cleanedName,
          detail: stop.detail.trim() || null,
          tag: stop.tag.trim() || null,
          visit_status: stop.visit_status,
          visit_note: stop.visit_note.trim() || null,
        })
        .eq("id", stop.id);
      if (error) throw error;
      await loadHunt();
    } catch (error) {
      Alert.alert("Stop not saved", error instanceof Error ? error.message : "Unable to update this stop.");
    } finally {
      setSaving(false);
    }
  };

  const markCompleted = async () => {
    if (!hunt) return;
    setSaving(true);
    try {
      const recap =
        huntMemories[0]?.body ??
        `${hunt.title} is saved as a family hunt memory. Add finds and favorite moments as the recap grows.`;
      const { error } = await supabase
        .from("funko_hunts")
        .update({ status: "completed", recap, favorite_memory: huntMemories[0]?.body ?? null })
        .eq("id", hunt.id);
      if (error) throw error;
      await loadHunt();
    } catch (error) {
      Alert.alert("Hunt not updated", error instanceof Error ? error.message : "Unable to complete this hunt.");
    } finally {
      setSaving(false);
    }
  };

  const deleteHunt = async () => {
    if (!hunt) return;

    const runDelete = async () => {
      setSaving(true);
      try {
        const { data: photos, error: photosError } = await supabase.from("funko_hunt_photos").select("storage_path").eq("hunt_id", hunt.id);
        if (photosError) throw photosError;
        const paths = ((photos ?? []) as Array<{ storage_path: string | null }>).map((photo) => photo.storage_path).filter((path): path is string => Boolean(path));
        if (paths.length > 0) {
          const { error: storageError } = await supabase.storage.from(HUNT_PHOTOS_BUCKET).remove(paths);
          if (storageError) throw storageError;
        }
        const { error } = await supabase.from("funko_hunts").delete().eq("id", hunt.id);
        if (error) throw error;
        setHunt(null);
        setHuntStops([]);
        setHuntStopDrafts(buildDefaultHuntStopDrafts());
        setHuntMemories([]);
        setHuntFinds([]);
        setHuntPhotos([]);
        setMemoryText("");
        await loadHunt();
      } catch (error) {
        Alert.alert("Hunt not deleted", error instanceof Error ? error.message : "Unable to delete this hunt.");
      } finally {
        setSaving(false);
      }
    };

    const message = `Delete ${hunt.title}? This removes the hunt, route, memories, finds, and hunt photos. Your shelf items stay on your shelf.`;
    if (IS_WEB && typeof window !== "undefined") {
      if (window.confirm(message)) await runDelete();
      return;
    }

    Alert.alert("Delete hunt?", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: runDelete },
    ]);
  };

  const updateHuntFindDraft = <K extends keyof Pick<FunkoHuntFind, "outcome" | "note">>(id: string, field: K, value: FunkoHuntFind[K]) => {
    setHuntFinds((current) => current.map((find) => (find.id === id ? { ...find, [field]: value } : find)));
  };

  const saveHuntFindDetails = async (find: FunkoHuntFind) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("funko_hunt_finds")
        .update({
          outcome: find.outcome,
          note: find.note?.trim() || null,
        })
        .eq("id", find.id);
      if (error) throw error;
      await loadHunt();
    } catch (error) {
      Alert.alert("Find not saved", error instanceof Error ? error.message : "Unable to update this hunt find.");
    } finally {
      setSaving(false);
    }
  };

  const openStopMap = async (stop: HuntStopDraft, provider: "apple" | "directions") => {
    const url = mapUrlForStop(stop, provider);
    if (!url) {
      Alert.alert("Stop location needed", "Add a store name or address before opening directions.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported && !IS_WEB) {
        Alert.alert("Map not available", "This device could not open the map link.");
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Directions not opened", error instanceof Error ? error.message : "Unable to open maps for this stop.");
    }
  };

  const markBestHuntFind = async (find: FunkoHuntFind) => {
    if (!hunt) return;
    setSaving(true);
    try {
      const { error: clearError } = await supabase.from("funko_hunt_finds").update({ is_best_find: false }).eq("hunt_id", hunt.id);
      if (clearError) throw clearError;
      const { error: bestError } = await supabase.from("funko_hunt_finds").update({ is_best_find: true }).eq("id", find.id);
      if (bestError) throw bestError;
      const stopName = find.stop_id ? stopNameById[find.stop_id] || "a hunt stop" : "the hunt";
      await supabase
        .from("funko_hunts")
        .update({ favorite_memory: `${find.pop_name || "A hunt find"} from ${stopName}` })
        .eq("id", hunt.id);
      await loadHunt();
    } catch (error) {
      Alert.alert("Best find not saved", error instanceof Error ? error.message : "Unable to mark this as the best find.");
    } finally {
      setSaving(false);
    }
  };

  const memoryPrompts = [
    { label: "Best find", value: "Pick the Pop everyone talks about later" },
    { label: "Funniest moment", value: "Capture the part that made the hunt yours" },
    { label: "Still hunting", value: "Keep one target for next month" },
  ];
  const huntGoals = huntGoalsInput.split("\n").length ? huntGoalsInput.split("\n") : DEFAULT_HUNT_GOALS;
  const displayedStops: HuntStopDraft[] =
    hunt && huntStopDrafts.length > 0
      ? huntStopDrafts
      : huntStops.length > 0
        ? huntStops.map((stop) => ({
            id: stop.id,
            stop_order: stop.stop_order,
            name: stop.name,
            detail: stop.detail ?? "",
            tag: stop.tag ?? "",
            visit_status: stop.visit_status ?? "planned",
            visit_note: stop.visit_note ?? "",
          }))
        : buildDefaultHuntStopDrafts();
  const selectedStop = selectedStopId ? displayedStops.find((stop) => stop.id === selectedStopId) ?? null : null;
  const selectedStopFinds = selectedStop ? huntFinds.filter((find) => find.stop_id === selectedStop.id) : [];
  const selectedStopPhotos = selectedStop ? huntPhotos.filter((photo) => photo.stop_id === selectedStop.id) : [];
  const isHuntOwner = Boolean(hunt && hunt.user_id === session.user.id);
  const activeHunts = visibleHunts.filter((candidate) => candidate.status !== "completed");
  const completedHunts = visibleHunts.filter((candidate) => candidate.status === "completed");
  const selectedShelfName = sharedShelves.find((shelf) => shelf.id === selectedSharedShelfId)?.name || "Family shelf";
  const huntShelfName = sharedShelves.find((shelf) => shelf.id === hunt?.shared_shelf_id)?.name || "Shared shelf";
  const sharedHuntCount = visibleHunts.filter((candidate) => candidate.shared_shelf_id).length;
  const routeStopCount = displayedStops.filter((stop) => stop.name.trim()).length;
  const checkedStopCount = displayedStops.filter((stop) => stop.name.trim() && stop.visit_status !== "planned").length;
  const foundStopCount = displayedStops.filter((stop) => stop.name.trim() && stop.visit_status === "found").length;
  const huntFindCount = huntFinds.length;
  const huntMemoryCount = huntMemories.length + huntPhotos.length;
  const currentTripSections: { key: HuntCurrentSection; label: string; detail: string }[] = [
    { key: "route", label: "Route", detail: `${routeStopCount} stops` },
    { key: "finds", label: "Finds", detail: `${huntFindCount} logged` },
    { key: "memories", label: "Memories", detail: `${huntMemoryCount} saved` },
  ];
  const showCurrentRoute = huntView !== "current" || huntCurrentSection === "route";
  const showCurrentFinds = huntView === "memory" || (huntView === "current" && huntCurrentSection === "finds");
  const showCurrentMemories = huntView === "memory" || (huntView === "current" && huntCurrentSection === "memories");
  const showMemoryTools = huntView !== "current" || showCurrentMemories;
  const stopNameById = displayedStops.reduce<Record<string, string>>((acc, stop) => {
    acc[stop.id] = stop.name.trim() || "Hunt stop";
    return acc;
  }, {});
  const bestFind = huntFinds.find((find) => find.is_best_find) ?? null;
  const progressHint =
    bestFind
      ? `${bestFind.pop_name || "A hunt find"} is leading the story for this hunt.`
      : huntFindCount > 0
      ? "Nice, this hunt already has finds worth remembering."
      : foundStopCount > 0
        ? "Mark the Pop from that found stop so it becomes part of the hunt recap."
      : checkedStopCount > 0
        ? "The route is moving. Add a quick note while the stop is fresh."
        : "Start with the first stop, then mark each place as the hunt unfolds.";
  const huntModeCopy = !hunt
    ? "Create a Pop Hunt, build the route, rally the shelf, and save the moments worth coming back to."
    : isHuntOwner
      ? "Plan it, build the route, rally your shared shelf, and move the trip into the Memory Vault when it is done."
      : "You are viewing a shared Pop Hunt. Follow the route, add memories, and capture finds with the group.";
  const huntScreenTitle = huntView === "planning" ? "Plan a Hunt" : huntView === "current" ? "Current Trips" : huntView === "memory" ? "Memory Lane" : "Pop Hunts";
  const nextActiveHunt = activeHunts.find((candidate) => candidate.id === selectedHuntId) ?? activeHunts[0] ?? null;
  const nextCompletedHunt = completedHunts.find((candidate) => candidate.id === selectedHuntId) ?? completedHunts[0] ?? null;

  if (hunt && selectedStop) {
    return (
      <ScreenFrame title="Stop Details" onBack={() => setSelectedStopId(null)}>
        <View style={styles.huntHero}>
          <Text style={styles.huntEyebrow}>Route stop</Text>
          <Text style={styles.huntHeroTitle}>{selectedStop.name || "Pop Hunt Stop"}</Text>
          <Text style={styles.huntHeroCopy}>{selectedStop.detail || "Add the notes, finds, and photos that make this stop part of the story."}</Text>
          <View style={styles.huntHeroMetaRow}>
            <View style={styles.huntHeroMetaTile}>
              <Text style={styles.huntMetaLabel}>Trip</Text>
              <Text style={styles.huntMetaValue}>{hunt.title}</Text>
            </View>
            <View style={styles.huntHeroMetaTile}>
              <Text style={styles.huntMetaLabel}>Status</Text>
              <Text style={styles.huntMetaValue}>{HUNT_STOP_STATUSES.find((status) => status.value === selectedStop.visit_status)?.label ?? "Planned"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.huntActionRow}>
          <Pressable
            onPress={() =>
              onScan({
                huntId: hunt.id,
                huntTitle: hunt.title,
                stopId: selectedStop.id,
                stopName: selectedStop.name.trim() || "this stop",
              })
            }
            style={({ pressed }) => [styles.huntPrimaryAction, pressed && styles.pressed]}
          >
            <Text style={styles.huntPrimaryActionText}>Add Pop</Text>
            <Text style={styles.huntActionSubtext}>Scan or update a find</Text>
          </Pressable>
          <Pressable onPress={() => uploadHuntPhoto("camera", selectedStop.id)} disabled={saving} style={({ pressed }) => [styles.huntSecondaryAction, pressed && styles.pressed, saving && styles.disabled]}>
            <Text style={styles.huntSecondaryActionText}>Take Photo</Text>
            <Text style={styles.huntActionSubtext}>Save to this stop</Text>
          </Pressable>
        </View>
        <View style={styles.huntActionRow}>
          <Pressable onPress={() => openStopMap(selectedStop, "directions")} style={({ pressed }) => [styles.huntMapAction, pressed && styles.pressed]}>
            <Text style={styles.huntMapActionText}>Directions</Text>
            <Text style={styles.huntActionSubtext}>Open route</Text>
          </Pressable>
          <Pressable onPress={() => openStopMap(selectedStop, "apple")} style={({ pressed }) => [styles.huntMapAction, styles.huntMapActionApple, pressed && styles.pressed]}>
            <Text style={styles.huntMapActionText}>Apple Maps</Text>
            <Text style={styles.huntActionSubtext}>Send stop</Text>
          </Pressable>
        </View>

        <View style={styles.huntPanel}>
          <View style={styles.huntPanelTop}>
            <View>
              <Text style={styles.dashboardSectionTitle}>Stop Notes</Text>
              <Text style={styles.mutedSmall}>{isHuntOwner ? "Update what happened here and save it to the route." : "The trip owner manages this stop note."}</Text>
            </View>
            <View style={styles.huntStatusBadge}>
              <Text style={styles.huntStatusText}>{selectedStop.tag || "Stop"}</Text>
            </View>
          </View>
          {isHuntOwner ? (
            <>
              <TextInput
                value={selectedStop.name}
                onChangeText={(value) => updateStopDraft(selectedStop.id, "name", value)}
                placeholder="Stop name"
                placeholderTextColor="#8d96a3"
                style={styles.huntStopInput}
              />
              <TextInput
                value={selectedStop.detail}
                onChangeText={(value) => updateStopDraft(selectedStop.id, "detail", value)}
                placeholder="What should we look for here?"
                placeholderTextColor="#8d96a3"
                style={styles.huntStopDetailInput}
              />
              <View style={styles.huntStopStatusRow}>
                {HUNT_STOP_STATUSES.map((status) => {
                  const isActive = selectedStop.visit_status === status.value;
                  return (
                    <Pressable
                      key={status.value}
                      onPress={() => updateStopDraft(selectedStop.id, "visit_status", status.value)}
                      style={[styles.huntStopStatusChip, isActive && styles.huntStopStatusChipActive]}
                    >
                      <Text style={[styles.huntStopStatusText, isActive && styles.huntStopStatusTextActive]}>{status.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput
                value={selectedStop.visit_note}
                onChangeText={(value) => updateStopDraft(selectedStop.id, "visit_note", value)}
                placeholder="What happened at this stop?"
                placeholderTextColor="#7f8996"
                multiline
                style={styles.stopDetailNoteInput}
              />
              <Pressable onPress={() => saveStopDetails(selectedStop)} disabled={saving} style={({ pressed }) => [styles.huntSaveButton, pressed && styles.pressed, saving && styles.disabled]}>
                <Text style={styles.huntSaveButtonText}>{saving ? "Saving..." : "Save Stop"}</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.huntFindEmptyCard}>
              <Text style={styles.huntFindEmptyTitle}>{selectedStop.visit_note || "No stop note yet"}</Text>
              <Text style={styles.huntFindEmptyCopy}>{selectedStop.detail || "Use Add Pop or photos to contribute to this stop."}</Text>
            </View>
          )}
        </View>

        <View style={styles.huntPanel}>
          <View style={styles.huntPanelTop}>
            <View>
              <Text style={styles.dashboardSectionTitle}>Stop Finds</Text>
              <Text style={styles.mutedSmall}>Pops connected to this route stop.</Text>
            </View>
            <View style={styles.huntStatusBadge}>
              <Text style={styles.huntStatusText}>{selectedStopFinds.length} Finds</Text>
            </View>
          </View>
          {selectedStopFinds.length === 0 ? (
            <View style={styles.huntFindEmptyCard}>
              <Text style={styles.huntFindEmptyTitle}>No finds linked yet</Text>
              <Text style={styles.huntFindEmptyCopy}>Use Add Pop from this stop after scanning or updating a find.</Text>
            </View>
          ) : (
            selectedStopFinds.map((find) => (
              <View key={find.id} style={styles.huntFindCard}>
                <View style={styles.huntFindTitleRow}>
                  <View style={styles.flex}>
                    <Text style={styles.huntFindName}>{find.pop_name || "Hunt find"}</Text>
                    <Text style={styles.huntFindMeta}>{find.note || compactName(find.outcome)}</Text>
                  </View>
                  {find.is_best_find ? (
                    <View style={styles.huntBestFindPill}>
                      <Text style={styles.huntBestFindPillText}>Best</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.huntPanel}>
          <View style={styles.huntPanelTop}>
            <View>
              <Text style={styles.dashboardSectionTitle}>Stop Photos</Text>
              <Text style={styles.mutedSmall}>Photos saved directly to this stop.</Text>
            </View>
            <View style={styles.huntStatusBadge}>
              <Text style={styles.huntStatusText}>{selectedStopPhotos.length} Photos</Text>
            </View>
          </View>
          <View style={styles.huntPhotoActionRow}>
            <Pressable onPress={() => uploadHuntPhoto("camera", selectedStop.id)} disabled={saving} style={({ pressed }) => [styles.huntPhotoButton, pressed && styles.pressed, saving && styles.disabled]}>
              <Text style={styles.huntPhotoButtonText}>Take Photo</Text>
            </Pressable>
            <Pressable onPress={() => uploadHuntPhoto("library", selectedStop.id)} disabled={saving} style={({ pressed }) => [styles.huntPhotoButton, styles.huntPhotoButtonSecondary, pressed && styles.pressed, saving && styles.disabled]}>
              <Text style={styles.huntPhotoButtonText}>Choose Photo</Text>
            </Pressable>
          </View>
          {selectedStopPhotos.length === 0 ? (
            <View style={styles.huntFindEmptyCard}>
              <Text style={styles.huntFindEmptyTitle}>No stop photos yet</Text>
              <Text style={styles.huntFindEmptyCopy}>Capture the shelf, receipt, group moment, or anything worth remembering here.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.huntPhotoStrip}>
              {selectedStopPhotos.map((photo) => (
                <View key={photo.id} style={styles.huntPhotoCard}>
                  {photo.signed_url ? (
                    <Image source={{ uri: photo.signed_url }} style={styles.huntPhotoThumb} />
                  ) : (
                    <View style={styles.huntPhotoPlaceholder}>
                      <Text style={styles.huntPhotoPlaceholderText}>Photo</Text>
                    </View>
                  )}
                  <Text style={styles.huntPhotoCaption} numberOfLines={2}>{photo.caption || "Stop memory"}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScreenFrame>
    );
  }

  if (huntView === "home") {
    return (
      <ScreenFrame title="Pop Hunts" onBack={onBack}>
        {busy ? (
          <ActivityIndicator color="#7e67f4" />
        ) : (
          <>
            <View style={styles.huntHero}>
              <Text style={styles.huntEyebrow}>Shelf-n-Pop trip hub</Text>
              <Text style={styles.huntHeroTitle}>Where is the next Pop hiding?</Text>
              <Text style={styles.huntHeroCopy}>Start a new family hunt, jump back into a live route, or stroll through completed trips and saved memories.</Text>
              <View style={styles.huntHeroMetaRow}>
                <View style={styles.huntHeroMetaTile}>
                  <Text style={styles.huntMetaLabel}>Current trips</Text>
                  <Text style={styles.huntMetaValue}>{activeHunts.length}</Text>
                </View>
                <View style={styles.huntHeroMetaTile}>
                  <Text style={styles.huntMetaLabel}>Memory lane</Text>
                  <Text style={styles.huntMetaValue}>{completedHunts.length}</Text>
                </View>
              </View>
            </View>

            <View style={styles.huntLandingGrid}>
              <Pressable onPress={startNewHuntDraft} style={({ pressed }) => [styles.huntLandingCard, styles.huntLandingCardPrimary, pressed && styles.pressed]}>
                <Image source={DASHBOARD_ICON_CREATE_NEW_TRIP} style={styles.huntLandingIcon} />
                <View style={styles.flex}>
                  <Text style={styles.huntLandingTitle}>Create a New Trip</Text>
                  <Text style={styles.huntLandingCopy}>Name the hunt, set the goal, choose the shelf, and build the route.</Text>
                </View>
                <Text style={styles.huntLandingArrow}>Plan</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsNewHuntDraft(false);
                  if (nextActiveHunt) setSelectedHuntId(nextActiveHunt.id);
                  setHuntView("current");
                }}
                disabled={activeHunts.length === 0}
                style={({ pressed }) => [styles.huntLandingCard, pressed && styles.pressed, activeHunts.length === 0 && styles.disabled]}
              >
                <Image source={DASHBOARD_ICON_POP_HUNTS} style={styles.huntLandingIcon} />
                <View style={styles.flex}>
                  <Text style={styles.huntLandingTitle}>Select Current Trip</Text>
                  <Text style={styles.huntLandingCopy}>
                    {nextActiveHunt ? `Open ${nextActiveHunt.title || "your active hunt"} and keep the route moving.` : "No live hunts yet. Start a new trip first."}
                  </Text>
                </View>
                <Text style={styles.huntLandingArrow}>{activeHunts.length || "0"}</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsNewHuntDraft(false);
                  if (nextCompletedHunt) setSelectedHuntId(nextCompletedHunt.id);
                  setHuntView("memory");
                }}
                disabled={completedHunts.length === 0}
                style={({ pressed }) => [styles.huntLandingCard, styles.huntLandingCardMemory, pressed && styles.pressed, completedHunts.length === 0 && styles.disabled]}
              >
                <Image source={DASHBOARD_ICON_MEMORY_LANE} style={styles.huntLandingIcon} />
                <View style={styles.flex}>
                  <Text style={styles.huntLandingTitle}>Trip Down Memory Lane</Text>
                  <Text style={styles.huntLandingCopy}>
                    {completedHunts.length > 0 ? "Browse completed hunts, favorite finds, photos, and family notes." : "Completed trips will collect here once a hunt is moved to Memory Lane."}
                  </Text>
                </View>
                <Text style={styles.huntLandingArrow}>{completedHunts.length || "0"}</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame title={huntScreenTitle} onBack={() => setHuntView("home")}>
      {busy ? (
        <ActivityIndicator color="#7e67f4" />
      ) : (
        <>
      <View style={styles.huntHero}>
        <Text style={styles.huntEyebrow}>Shelf-n-Pop trip board</Text>
        <Text style={styles.huntHeroTitle}>{hunt?.title ?? `${huntMonth} Pop Hunt`}</Text>
        <Text style={styles.huntHeroCopy}>{huntModeCopy}</Text>
        <View style={styles.huntHeroMetaRow}>
          <View style={styles.huntHeroMetaTile}>
            <Text style={styles.huntMetaLabel}>Theme</Text>
            <Text style={styles.huntMetaValue}>{hunt?.theme ?? "Family memory"}</Text>
          </View>
          <View style={styles.huntHeroMetaTile}>
            <Text style={styles.huntMetaLabel}>{hunt ? (isHuntOwner ? "Status" : "Shared view") : "Shared shelf"}</Text>
            <Text style={styles.huntMetaValue}>{hunt ? (isHuntOwner ? compactName(hunt.status) : huntShelfName) : selectedShelfName}</Text>
          </View>
        </View>
      </View>

      {huntView !== "memory" ? (
      <View style={styles.huntActionRow}>
        <Pressable onPress={onShelfStats} style={({ pressed }) => [styles.huntPrimaryAction, pressed && styles.pressed]}>
          <Text style={styles.huntPrimaryActionText}>Pick Set Goal</Text>
          <Text style={styles.huntActionSubtext}>Use Sets Within Reach</Text>
        </Pressable>
        <Pressable onPress={onSharedShelf} style={({ pressed }) => [styles.huntSecondaryAction, pressed && styles.pressed]}>
          <Text style={styles.huntSecondaryActionText}>Invite Shelf</Text>
          <Text style={styles.huntActionSubtext}>Plan with your group</Text>
        </Pressable>
      </View>
      ) : null}

      {huntView === "current" && activeHunts.length > 0 ? (
        <View style={styles.huntPanel}>
          <View style={styles.huntPanelTop}>
            <View>
              <Text style={styles.dashboardSectionTitle}>Active Pop Hunts</Text>
              <Text style={styles.mutedSmall}>
                {sharedHuntCount > 0 ? "Open your trip or a shared-shelf hunt that is still in motion." : "Trips in planning or on the hunt stay within quick reach."}
              </Text>
            </View>
            <View style={styles.huntStatusBadge}>
              <Text style={styles.huntStatusText}>{activeHunts.length} Active</Text>
            </View>
          </View>
          <View style={styles.sharedHuntList}>
            {activeHunts.map((candidate) => {
              const isSelected = hunt?.id === candidate.id;
              const isOwner = candidate.user_id === session.user.id;
              const shelfName = sharedShelves.find((shelf) => shelf.id === candidate.shared_shelf_id)?.name || "Shared shelf";
              return (
                <Pressable
                  key={candidate.id}
                  onPress={() => {
                    setIsNewHuntDraft(false);
                    setSelectedHuntId(candidate.id);
                  }}
                  style={[styles.sharedHuntCard, isSelected && styles.sharedHuntCardActive]}
                >
                  <View style={styles.flex}>
                    <Text style={styles.sharedHuntTitle}>{candidate.title || "Pop Hunt"}</Text>
                    <Text style={styles.sharedHuntMeta}>
                      {isOwner ? "Your hunt" : `Shared from ${shelfName}`} - {displayHuntDate(candidate.hunt_month)}
                    </Text>
                  </View>
                  <View style={[styles.sharedHuntBadge, isSelected && styles.sharedHuntBadgeActive]}>
                    <Text style={[styles.sharedHuntBadgeText, isSelected && styles.sharedHuntBadgeTextActive]}>{compactName(candidate.status)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {huntView === "memory" && completedHunts.length > 0 ? (
        <View style={styles.huntPanel}>
          <View style={styles.huntPanelTop}>
            <View>
              <Text style={styles.dashboardSectionTitle}>Memory Lane</Text>
              <Text style={styles.mutedSmall}>Completed Pop Hunts live here for a quick stroll through old trips.</Text>
            </View>
            <View style={styles.huntStatusBadge}>
              <Text style={styles.huntStatusText}>{completedHunts.length} Saved</Text>
            </View>
          </View>
          <View style={styles.sharedHuntList}>
            {completedHunts.map((candidate) => {
              const isSelected = hunt?.id === candidate.id;
              const isOwner = candidate.user_id === session.user.id;
              const shelfName = sharedShelves.find((shelf) => shelf.id === candidate.shared_shelf_id)?.name || "Shared shelf";
              return (
                <Pressable
                  key={candidate.id}
                  onPress={() => {
                    setIsNewHuntDraft(false);
                    setSelectedHuntId(candidate.id);
                  }}
                  style={[styles.sharedHuntCard, styles.memoryLaneCard, isSelected && styles.sharedHuntCardActive]}
                >
                  <View style={styles.flex}>
                    <Text style={styles.sharedHuntTitle}>{candidate.title || "Saved Pop Hunt"}</Text>
                    <Text style={styles.sharedHuntMeta}>
                      {candidate.favorite_memory || candidate.recap || (isOwner ? "Your saved trip" : `Shared from ${shelfName}`)}
                    </Text>
                  </View>
                  <View style={[styles.sharedHuntBadge, isSelected && styles.sharedHuntBadgeActive]}>
                    <Text style={[styles.sharedHuntBadgeText, isSelected && styles.sharedHuntBadgeTextActive]}>{displayHuntDate(candidate.hunt_month)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {hunt ? (
        <View style={styles.huntProgressPanel}>
          <View style={styles.huntPanelTop}>
            <View>
              <Text style={styles.dashboardSectionTitle}>Trip Flow</Text>
              <Text style={styles.mutedSmall}>{progressHint}</Text>
            </View>
            <View style={styles.huntStatusBadge}>
              <Text style={styles.huntStatusText}>{compactName(hunt.status)}</Text>
            </View>
          </View>
          <View style={styles.huntProgressGrid}>
            <View style={styles.huntProgressTile}>
              <Text style={styles.huntProgressValue}>{routeStopCount}</Text>
              <Text style={styles.huntProgressLabel}>Stops</Text>
            </View>
            <View style={styles.huntProgressTile}>
              <Text style={styles.huntProgressValue}>{checkedStopCount}</Text>
              <Text style={styles.huntProgressLabel}>Checked</Text>
            </View>
            <View style={styles.huntProgressTile}>
              <Text style={styles.huntProgressValue}>{huntFindCount}</Text>
              <Text style={styles.huntProgressLabel}>Finds</Text>
            </View>
            <View style={styles.huntProgressTile}>
              <Text style={styles.huntProgressValue}>{huntMemories.length}</Text>
              <Text style={styles.huntProgressLabel}>Memories</Text>
            </View>
          </View>
          {isHuntOwner ? (
            <View style={styles.huntStatusPicker}>
              {HUNT_STATUSES.map((status) => {
                const isActive = hunt.status === status.value;
                return (
                  <Pressable
                    key={status.value}
                    onPress={() => updateHuntStatus(status.value)}
                    disabled={saving}
                    style={[styles.huntStatusChip, isActive && styles.huntStatusChipActive, saving && styles.disabled]}
                  >
                    <Text style={[styles.huntStatusChipText, isActive && styles.huntStatusChipTextActive]}>{status.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          {huntView === "current" ? (
            <View style={styles.huntCurrentTabs}>
              {currentTripSections.map((section) => {
                const isActive = huntCurrentSection === section.key;
                return (
                  <Pressable
                    key={section.key}
                    onPress={() => setHuntCurrentSection(section.key)}
                    style={[styles.huntCurrentTab, isActive && styles.huntCurrentTabActive]}
                  >
                    <Text style={[styles.huntCurrentTabText, isActive && styles.huntCurrentTabTextActive]}>{section.label}</Text>
                    <Text style={[styles.huntCurrentTabDetail, isActive && styles.huntCurrentTabDetailActive]}>{section.detail}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          {bestFind ? (
            <View style={styles.huntBestFindCard}>
              <Text style={styles.huntBestFindEyebrow}>Best find</Text>
              <Text style={styles.huntBestFindTitle}>{bestFind.pop_name || "Hunt find"}</Text>
              <Text style={styles.huntBestFindMeta}>{bestFind.stop_id ? stopNameById[bestFind.stop_id] || "Hunt stop" : "Hunt stop"}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {huntView === "planning" ? (
      <View style={styles.huntPanel}>
        <Text style={styles.dashboardSectionTitle}>{hunt ? "Create Another Pop Hunt" : "Create a Pop Hunt"}</Text>
        <Text style={styles.mutedSmall}>
          Start with the basics, then build the route once the trip is saved.
        </Text>
        {!hunt ? (
          <>
            <Text style={styles.label}>Trip name</Text>
            <TextInput
              value={huntTitleInput}
              onChangeText={setHuntTitleInput}
              placeholder={`${huntMonth} Pop Hunt`}
              placeholderTextColor="#8d96a3"
              style={styles.huntSettingsInput}
            />
            <View style={styles.huntSettingsGrid}>
              <View style={styles.flex}>
                <Text style={styles.label}>Theme</Text>
                <TextInput
                  value={huntThemeInput}
                  onChangeText={setHuntThemeInput}
                  placeholder="Family memory"
                  placeholderTextColor="#8d96a3"
                  style={styles.huntSettingsInput}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.label}>Set goal</Text>
                <TextInput
                  value={huntSetGoalInput}
                  onChangeText={setHuntSetGoalInput}
                  placeholder="Close a set"
                  placeholderTextColor="#8d96a3"
                  style={styles.huntSettingsInput}
                />
              </View>
            </View>
            <Text style={styles.label}>Hunt cards</Text>
            <TextInput
              value={huntGoalsInput}
              onChangeText={setHuntGoalsInput}
              placeholder={DEFAULT_HUNT_GOALS.join("\n")}
              placeholderTextColor="#8d96a3"
              multiline
              style={[styles.huntSettingsInput, styles.huntGoalsDraftInput]}
            />
          </>
        ) : null}
        {sharedShelves.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.huntShelfPicker}>
            {sharedShelves.map((shelf) => (
              <Pressable
                key={shelf.id}
                onPress={() => setSelectedSharedShelfId(shelf.id)}
                style={[styles.huntShelfChip, selectedSharedShelfId === shelf.id && styles.huntShelfChipActive]}
              >
                <Text style={[styles.huntShelfChipText, selectedSharedShelfId === shelf.id && styles.huntShelfChipTextActive]}>
                  {shelf.name || "Shared Shelf"}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        <Pressable onPress={createMonthlyHunt} disabled={saving || !huntTitleInput.trim()} style={({ pressed }) => [styles.huntSaveButton, pressed && styles.pressed, (saving || !huntTitleInput.trim()) && styles.disabled]}>
          <Text style={styles.huntSaveButtonText}>{saving ? "Saving..." : "Start Pop Hunt"}</Text>
        </Pressable>
      </View>
      ) : null}

      {hunt && isHuntOwner && huntView === "planning" ? (
        <View style={styles.huntPanel}>
          <View style={styles.huntPanelTop}>
            <View>
              <Text style={styles.dashboardSectionTitle}>Trip Builder</Text>
              <Text style={styles.mutedSmall}>Name the Pop Hunt, set the target, and connect the shared shelf.</Text>
            </View>
            <View style={styles.huntStatusBadge}>
              <Text style={styles.huntStatusText}>Saved</Text>
            </View>
          </View>
          <Text style={styles.label}>Pop Hunt name</Text>
          <TextInput
            value={huntTitleInput}
            onChangeText={setHuntTitleInput}
            placeholder={`${huntMonth} Pop Hunt`}
            placeholderTextColor="#8d96a3"
            style={styles.huntSettingsInput}
          />
          <View style={styles.huntSettingsGrid}>
            <View style={styles.flex}>
              <Text style={styles.label}>Theme</Text>
              <TextInput
                value={huntThemeInput}
                onChangeText={setHuntThemeInput}
                placeholder="Family memory"
                placeholderTextColor="#8d96a3"
                style={styles.huntSettingsInput}
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>Set goal</Text>
              <TextInput
                value={huntSetGoalInput}
                onChangeText={setHuntSetGoalInput}
                placeholder="Close a set"
                placeholderTextColor="#8d96a3"
                style={styles.huntSettingsInput}
              />
            </View>
          </View>
          {sharedShelves.length > 0 ? (
            <>
              <Text style={styles.label}>Shared shelf</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.huntShelfPicker}>
                {sharedShelves.map((shelf) => (
                  <Pressable
                    key={shelf.id}
                    onPress={() => setSelectedSharedShelfId(shelf.id)}
                    style={[styles.huntShelfChip, selectedSharedShelfId === shelf.id && styles.huntShelfChipActive]}
                  >
                    <Text style={[styles.huntShelfChipText, selectedSharedShelfId === shelf.id && styles.huntShelfChipTextActive]}>
                      {shelf.name || "Shared Shelf"}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : null}
          <Pressable
            onPress={saveHuntSettings}
            disabled={saving || !huntTitleInput.trim()}
            style={({ pressed }) => [styles.huntSaveButton, pressed && styles.pressed, (saving || !huntTitleInput.trim()) && styles.disabled]}
          >
            <Text style={styles.huntSaveButtonText}>{saving ? "Saving..." : "Save Trip Builder"}</Text>
          </Pressable>
          <View style={styles.huntDangerZone}>
            <View style={styles.flex}>
              <Text style={styles.huntDangerTitle}>Need to start over?</Text>
              <Text style={styles.huntDangerCopy}>Delete this Pop Hunt only. Shelf items added during the trip stay on your shelf.</Text>
            </View>
            <Pressable onPress={deleteHunt} disabled={saving} style={({ pressed }) => [styles.huntDangerButton, pressed && styles.pressed, saving && styles.disabled]}>
              <Text style={styles.huntDangerButtonText}>Delete Hunt</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {huntView === "planning" ? (
      <View style={styles.huntPanel}>
        <View style={styles.huntPanelTop}>
          <View>
            <Text style={styles.dashboardSectionTitle}>Find Hunting Grounds</Text>
            <Text style={styles.mutedSmall}>Enter a ZIP code, pick a radius and store type, then add real local stops when OpenStreetMap has them.</Text>
          </View>
          <View style={styles.huntStatusBadge}>
            <Text style={styles.huntStatusText}>Free OSM</Text>
          </View>
        </View>
        <TextInput
          value={hotspotSearchName}
          onChangeText={setHotspotSearchName}
          placeholder="Store name or type, like Target or comic shop"
          placeholderTextColor="#8d96a3"
          style={styles.huntSearchNameInput}
          returnKeyType="search"
          onSubmitEditing={findPotentialHotspots}
        />
        <View style={styles.huntZipRow}>
          <TextInput
            value={hotspotZip}
            onChangeText={setHotspotZip}
            keyboardType="number-pad"
            maxLength={5}
            placeholder="ZIP code"
            placeholderTextColor="#8d96a3"
            style={styles.huntZipInput}
          />
          <Pressable onPress={findPotentialHotspots} disabled={hotspotBusy} style={({ pressed }) => [styles.huntZipSearchButton, pressed && styles.pressed, hotspotBusy && styles.disabled]}>
            <Text style={styles.huntZipSearchText}>{hotspotBusy ? "Finding" : "Search"}</Text>
          </Pressable>
        </View>
        <View style={styles.huntRadiusRow}>
          {HUNT_RADIUS_OPTIONS.map((radius) => (
            <Pressable
              key={radius}
              onPress={() => setHotspotRadius(radius)}
              style={[styles.huntRadiusChip, hotspotRadius === radius && styles.huntRadiusChipActive]}
            >
              <Text style={[styles.huntRadiusText, hotspotRadius === radius && styles.huntRadiusTextActive]}>{radius} mi</Text>
            </Pressable>
          ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.huntTypePicker}>
          {HUNT_HOTSPOT_TYPES.map((type) => {
            const isActive = hotspotType === type.value;
            return (
              <Pressable
                key={type.value}
                onPress={() => setHotspotType(type.value)}
                style={[styles.huntTypeChip, isActive && styles.huntTypeChipActive]}
              >
                <Text style={[styles.huntTypeChipText, isActive && styles.huntTypeChipTextActive]}>{type.label}</Text>
                <Text style={styles.huntTypeChipSubtext}>{type.detail}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {hotspotResults.length === 0 ? (
          <Text style={styles.mutedSmall}>{hotspotMessage}</Text>
        ) : (
          <>
            <Text style={styles.mutedSmall}>{hotspotMessage}</Text>
            {hotspotResults.map((hotspot) => (
              <View key={hotspot.id} style={styles.huntHotspotCard}>
                <View style={styles.flex}>
                  <View style={styles.huntHotspotMetaRow}>
                    <Text style={styles.huntHotspotKind}>{hotspot.kind}</Text>
                    <Text style={styles.huntHotspotSource}>{hotspot.source === "osm" ? "Local" : hotspot.source === "custom" ? "Typed" : "Starter"}</Text>
                  </View>
                  <Text style={styles.huntStopTitle}>{hotspot.name}</Text>
                  {hotspot.address ? <Text style={styles.huntStopDetail}>{hotspot.address}</Text> : null}
                  <Text style={styles.huntStopDetail}>{hotspot.detail}</Text>
                  {hotspot.distanceMiles != null ? <Text style={styles.huntHotspotDistance}>{hotspot.distanceMiles.toFixed(1)} miles away</Text> : null}
                </View>
                <Pressable
                  onPress={() => addPotentialHotspotToHunt(hotspot)}
                  disabled={saving || !hunt || !isHuntOwner}
                  style={({ pressed }) => [styles.huntHotspotAddButton, pressed && styles.pressed, (saving || !hunt || !isHuntOwner) && styles.disabled]}
                >
                  <Text style={styles.huntHotspotAddText}>{hunt ? (isHuntOwner ? "Add" : "Owner") : "Start"}</Text>
                </Pressable>
              </View>
            ))}
          </>
        )}
      </View>
      ) : null}

      {huntView === "planning" ? (
      <View style={styles.huntPanel}>
        <View style={styles.huntPanelTop}>
          <View>
            <Text style={styles.dashboardSectionTitle}>Hunt Cards</Text>
            <Text style={styles.mutedSmall}>Small goals that keep the Pop Hunt fun, focused, and easy to remember.</Text>
          </View>
          <View style={styles.huntStatusBadge}>
            <Text style={styles.huntStatusText}>Planning</Text>
          </View>
        </View>
        {huntGoals.slice(0, 5).map((goal, index) => (
          <View key={`${index}-${goal}`} style={styles.huntGoalRow}>
            <View style={styles.huntGoalNumber}>
              <Text style={styles.huntGoalNumberText}>{index + 1}</Text>
            </View>
            {hunt && isHuntOwner ? (
              <TextInput
                value={goal}
                onChangeText={(value) => updateGoalDraft(index, value)}
                placeholder={`Goal ${index + 1}`}
                placeholderTextColor="#8d96a3"
                style={styles.huntGoalInput}
              />
            ) : (
              <Text style={styles.huntGoalText}>{goal}</Text>
            )}
          </View>
        ))}
        {hunt && isHuntOwner ? (
          <Pressable onPress={saveHuntGoals} disabled={saving} style={({ pressed }) => [styles.huntSubtleSaveButton, pressed && styles.pressed, saving && styles.disabled]}>
            <Text style={styles.huntSubtleSaveButtonText}>{saving ? "Saving..." : "Save Goals"}</Text>
          </Pressable>
        ) : null}
      </View>
      ) : null}

      {showCurrentRoute ? (
      <View style={styles.huntPanel}>
        <View style={styles.huntPanelTop}>
          <View>
            <Text style={styles.dashboardSectionTitle}>{hunt ? "Route Board" : "Stops to Try"}</Text>
            <Text style={styles.mutedSmall}>
              {hunt ? "Keep the route simple: check the stop, mark what happened, and save the note." : "Hotspots can become repeat places once the tracker is connected."}
            </Text>
          </View>
          <View style={styles.huntStatusBadge}>
            <Text style={styles.huntStatusText}>{routeStopCount} Stops</Text>
          </View>
        </View>
        {hunt && isHuntOwner ? (
          <View style={styles.huntQuickStopCard}>
            <View style={styles.huntQuickStopTop}>
              <Text style={styles.huntQuickStopTitle}>✨ Add a pop-up stop</Text>
              <Text style={styles.huntQuickStopCopy}>Use this when a new place shows up during the hunt.</Text>
            </View>
            <TextInput
              value={quickStopName}
              onChangeText={setQuickStopName}
              placeholder="Store or stop name"
              placeholderTextColor="#8d96a3"
              style={styles.huntStopInput}
            />
            <TextInput
              value={quickStopDetail}
              onChangeText={setQuickStopDetail}
              placeholder="Address for maps, or a quick note"
              placeholderTextColor="#8d96a3"
              style={styles.huntStopDetailInput}
            />
            <Pressable
              onPress={addQuickHuntStop}
              disabled={saving || !quickStopName.trim()}
              style={({ pressed }) => [styles.huntQuickStopButton, pressed && styles.pressed, (saving || !quickStopName.trim()) && styles.disabled]}
            >
              <Text style={styles.huntQuickStopButtonText}>{saving ? "Adding..." : "Add to Route"}</Text>
            </Pressable>
          </View>
        ) : null}
        {displayedStops.map((stop, index) => (
          <View key={stop.id} style={styles.huntStopCard}>
            <View style={styles.huntRouteNumber}>
              <Text style={styles.huntRouteNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.flex}>
              {hunt && isHuntOwner ? (
                <>
                  <TextInput
                    value={stop.name}
                    onChangeText={(value) => updateStopDraft(stop.id, "name", value)}
                    placeholder="Stop name"
                    placeholderTextColor="#8d96a3"
                    style={styles.huntStopInput}
                  />
                  <TextInput
                    value={stop.detail ?? ""}
                    onChangeText={(value) => updateStopDraft(stop.id, "detail", value)}
                    placeholder="What should we look for here?"
                    placeholderTextColor="#8d96a3"
                    style={styles.huntStopDetailInput}
                  />
                  <View style={styles.huntStopStatusRow}>
                    {HUNT_STOP_STATUSES.map((status) => {
                      const isActive = stop.visit_status === status.value;
                      return (
                        <Pressable
                          key={status.value}
                          onPress={() => updateStopDraft(stop.id, "visit_status", status.value)}
                          style={[styles.huntStopStatusChip, isActive && styles.huntStopStatusChipActive]}
                        >
                          <Text style={[styles.huntStopStatusText, isActive && styles.huntStopStatusTextActive]}>{status.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <TextInput
                    value={stop.visit_note ?? ""}
                    onChangeText={(value) => updateStopDraft(stop.id, "visit_note", value)}
                    placeholder="What happened at this stop?"
                    placeholderTextColor="#7f8996"
                    style={styles.huntStopVisitNoteInput}
                  />
                  {stop.visit_status === "found" ? (
                    <Pressable
                      onPress={() => {
                        if (!hunt) return;
                        onScan({
                          huntId: hunt.id,
                          huntTitle: hunt.title,
                          stopId: stop.id,
                          stopName: stop.name.trim() || "this stop",
                        });
                      }}
                      style={({ pressed }) => [styles.huntStopScanButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.huntStopScanButtonText}>Add Pop From This Stop</Text>
                      <Text style={styles.huntStopScanButtonSubtext}>Scan or update the find</Text>
                    </Pressable>
                  ) : null}
                </>
              ) : (
                <>
                  <Text style={styles.huntStopTitle}>{stop.name}</Text>
                  {stop.detail ? <Text style={styles.huntStopDetail}>{stop.detail}</Text> : null}
                  {stop.visit_note ? <Text style={styles.huntStopDetail}>{stop.visit_note}</Text> : null}
                  {hunt && stop.visit_status === "found" ? (
                    <Pressable
                      onPress={() => {
                        onScan({
                          huntId: hunt.id,
                          huntTitle: hunt.title,
                          stopId: stop.id,
                          stopName: stop.name.trim() || "this stop",
                        });
                      }}
                      style={({ pressed }) => [styles.huntStopScanButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.huntStopScanButtonText}>Add Pop From This Stop</Text>
                      <Text style={styles.huntStopScanButtonSubtext}>Add your find to this shared hunt</Text>
                    </Pressable>
                  ) : null}
                </>
              )}
            </View>
            {hunt && isHuntOwner ? (
              <View style={styles.huntStopSide}>
                <TextInput
                  value={stop.tag ?? ""}
                  onChangeText={(value) => updateStopDraft(stop.id, "tag", value)}
                  placeholder="Tag"
                  placeholderTextColor="#9e94c9"
                  style={styles.huntStopTagInput}
                />
                <Text style={styles.huntStopSideStatus}>{HUNT_STOP_STATUSES.find((status) => status.value === stop.visit_status)?.label ?? "Planned"}</Text>
                <Pressable onPress={() => setSelectedStopId(stop.id)} disabled={stop.isNew} style={({ pressed }) => [styles.huntStopOpenButton, pressed && styles.pressed, stop.isNew && styles.disabled]}>
                  <Text style={styles.huntStopOpenText}>Open</Text>
                </Pressable>
                <Pressable onPress={() => openStopMap(stop, "directions")} disabled={!huntStopMapQuery(stop)} style={({ pressed }) => [styles.huntStopOpenButton, pressed && styles.pressed, !huntStopMapQuery(stop) && styles.disabled]}>
                  <Text style={styles.huntStopOpenText}>Directions</Text>
                </Pressable>
                <Pressable onPress={() => removeStopDraft(stop)} disabled={saving} style={({ pressed }) => [styles.huntStopRemoveButton, pressed && styles.pressed, saving && styles.disabled]}>
                  <Text style={styles.huntStopRemoveText}>Remove</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.huntStopSide}>
                <View style={styles.huntStopTag}>
                  <Text style={styles.huntStopTagText}>{HUNT_STOP_STATUSES.find((status) => status.value === stop.visit_status)?.label ?? stop.tag}</Text>
                </View>
                {hunt ? (
                  <Pressable onPress={() => setSelectedStopId(stop.id)} style={({ pressed }) => [styles.huntStopOpenButton, pressed && styles.pressed]}>
                    <Text style={styles.huntStopOpenText}>Open</Text>
                  </Pressable>
                ) : null}
                <Pressable onPress={() => openStopMap(stop, "directions")} disabled={!huntStopMapQuery(stop)} style={({ pressed }) => [styles.huntStopOpenButton, pressed && styles.pressed, !huntStopMapQuery(stop) && styles.disabled]}>
                  <Text style={styles.huntStopOpenText}>Directions</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}
        {hunt && isHuntOwner ? (
          <View style={styles.huntStopActions}>
            <Pressable onPress={addStopDraft} style={({ pressed }) => [styles.huntSmallButton, pressed && styles.pressed]}>
              <Text style={styles.huntSmallButtonText}>Add Stop</Text>
            </Pressable>
            <Pressable onPress={saveHuntStops} disabled={saving} style={({ pressed }) => [styles.huntSmallButton, styles.huntSmallButtonPrimary, pressed && styles.pressed, saving && styles.disabled]}>
              <Text style={styles.huntSmallButtonText}>{saving ? "Saving..." : "Save Stops"}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      ) : null}

      {hunt && showCurrentFinds ? (
        <View style={styles.huntPanel}>
          <View style={styles.huntPanelTop}>
            <View>
              <Text style={styles.dashboardSectionTitle}>Find Log</Text>
              <Text style={styles.mutedSmall}>Pops added from this trip show up here with the stop that found them.</Text>
            </View>
            <View style={styles.huntStatusBadge}>
              <Text style={styles.huntStatusText}>{huntFindCount} Finds</Text>
            </View>
          </View>
          {huntFinds.length === 0 ? (
            <View style={styles.huntFindEmptyCard}>
              <Text style={styles.huntFindEmptyTitle}>No hunt finds yet</Text>
              <Text style={styles.huntFindEmptyCopy}>Mark a route stop as Found, then use Add Pop From This Stop after scanning.</Text>
            </View>
          ) : (
            huntFinds.map((find) => (
              <View key={find.id} style={styles.huntFindCard}>
                <View style={styles.flex}>
                  <View style={styles.huntFindTitleRow}>
                    <View style={styles.flex}>
                      <Text style={styles.huntFindName}>{find.pop_name || "Hunt find"}</Text>
                      <Text style={styles.huntFindMeta}>{find.stop_id ? stopNameById[find.stop_id] || "Hunt stop" : "Hunt stop"}</Text>
                    </View>
                    {find.is_best_find ? (
                      <View style={styles.huntBestFindPill}>
                        <Text style={styles.huntBestFindPillText}>Best</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.huntFindOutcomeRow}>
                    {HUNT_FIND_OUTCOMES.map((outcome) => {
                      const isActive = find.outcome === outcome.value;
                      return (
                        <Pressable
                          key={outcome.value}
                          onPress={() => updateHuntFindDraft(find.id, "outcome", outcome.value)}
                          style={[styles.huntFindOutcomeChip, isActive && styles.huntFindOutcomeChipActive]}
                        >
                          <Text style={[styles.huntFindOutcomeChipText, isActive && styles.huntFindOutcomeChipTextActive]}>{outcome.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <TextInput
                    value={find.note ?? ""}
                    onChangeText={(value) => updateHuntFindDraft(find.id, "note", value)}
                    placeholder="Add a quick note about this find"
                    placeholderTextColor="#7f8996"
                    style={styles.huntFindNoteInput}
                  />
                  <View style={styles.huntFindActionRow}>
                    <Pressable
                      onPress={() => markBestHuntFind(find)}
                      disabled={saving}
                      style={({ pressed }) => [styles.huntFindActionButton, find.is_best_find && styles.huntFindActionButtonActive, pressed && styles.pressed, saving && styles.disabled]}
                    >
                      <Text style={[styles.huntFindActionText, find.is_best_find && styles.huntFindActionTextActive]}>
                        {find.is_best_find ? "Best Find" : "Mark Best"}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => saveHuntFindDetails(find)}
                      disabled={saving}
                      style={({ pressed }) => [styles.huntFindActionButton, styles.huntFindSaveButton, pressed && styles.pressed, saving && styles.disabled]}
                    >
                      <Text style={styles.huntFindActionText}>{saving ? "Saving" : "Save"}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}

      {hunt && showCurrentMemories ? (
        <View style={styles.huntPanel}>
          <View style={styles.huntPanelTop}>
            <View>
              <Text style={styles.dashboardSectionTitle}>Photo Roll</Text>
              <Text style={styles.mutedSmall}>Save the shelf shots, store stops, and family moments from the trip.</Text>
            </View>
            <View style={styles.huntStatusBadge}>
              <Text style={styles.huntStatusText}>{huntPhotos.length} Photos</Text>
            </View>
          </View>
          <View style={styles.huntPhotoActionRow}>
            <Pressable
              onPress={() => uploadHuntPhoto("camera")}
              disabled={saving}
              style={({ pressed }) => [styles.huntPhotoButton, pressed && styles.pressed, saving && styles.disabled]}
            >
              <Text style={styles.huntPhotoButtonText}>Take Photo</Text>
            </Pressable>
            <Pressable
              onPress={() => uploadHuntPhoto("library")}
              disabled={saving}
              style={({ pressed }) => [styles.huntPhotoButton, styles.huntPhotoButtonSecondary, pressed && styles.pressed, saving && styles.disabled]}
            >
              <Text style={styles.huntPhotoButtonText}>Choose Photo</Text>
            </Pressable>
          </View>
          {huntPhotos.length === 0 ? (
            <View style={styles.huntFindEmptyCard}>
              <Text style={styles.huntFindEmptyTitle}>No photos yet</Text>
              <Text style={styles.huntFindEmptyCopy}>Add a quick photo from the trip and it will stay with this hunt.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.huntPhotoStrip}>
              {huntPhotos.map((photo) => (
                <View key={photo.id} style={styles.huntPhotoCard}>
                  {photo.signed_url ? (
                    <Image source={{ uri: photo.signed_url }} style={styles.huntPhotoThumb} />
                  ) : (
                    <View style={styles.huntPhotoPlaceholder}>
                      <Text style={styles.huntPhotoPlaceholderText}>Photo</Text>
                    </View>
                  )}
                  <Text style={styles.huntPhotoCaption} numberOfLines={2}>{photo.caption || "Hunt memory"}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      ) : null}

      {showMemoryTools ? (
      <View style={styles.huntPanel}>
        <Text style={styles.dashboardSectionTitle}>{hunt ? "Memory Notes" : "Memory Prompts"}</Text>
        <Text style={styles.mutedSmall}>{hunt ? "Save the small notes that make the trip worth remembering." : "These become the recap after the trip."}</Text>
        {hunt ? (
          <>
            <TextInput
              value={memoryText}
              onChangeText={setMemoryText}
              placeholder="Add a memory, funny moment, or find..."
              placeholderTextColor="#8d96a3"
              multiline
              style={styles.huntMemoryInput}
            />
            <Pressable onPress={saveMemory} disabled={saving || !memoryText.trim()} style={({ pressed }) => [styles.huntSaveButton, pressed && styles.pressed, (saving || !memoryText.trim()) && styles.disabled]}>
              <Text style={styles.huntSaveButtonText}>{saving ? "Saving..." : "Save Memory"}</Text>
            </Pressable>
            {huntMemories.length === 0 ? <Text style={styles.mutedSmall}>No memories saved yet.</Text> : null}
            {huntMemories.map((memory) => (
              <View key={memory.id} style={styles.huntMemoryCard}>
                <Text style={styles.huntMemoryLabel}>{memory.mood || compactName(memory.memory_type)}</Text>
                <Text style={styles.huntMemoryValue}>{memory.body}</Text>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.huntMemoryGrid}>
            {memoryPrompts.map((prompt) => (
              <View key={prompt.label} style={styles.huntMemoryCard}>
                <Text style={styles.huntMemoryLabel}>{prompt.label}</Text>
                <Text style={styles.huntMemoryValue}>{prompt.value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      ) : null}

      {showMemoryTools ? (
      <View style={styles.huntRecapCard}>
        <Text style={styles.huntEyebrow}>{hunt?.status === "completed" ? "Saved recap" : "Future recap"}</Text>
        <Text style={styles.huntRecapTitle}>{hunt?.status === "completed" ? "Family hunt memory" : "After the hunt"}</Text>
        <Text style={styles.huntRecapCopy}>
          {hunt?.recap ??
            "Shelf-n-Pop can turn the day into a small family story: who joined, where you went, what you found, and what is still worth hunting next month."}
        </Text>
        {hunt && isHuntOwner && hunt.status !== "completed" ? (
          <Pressable onPress={markCompleted} disabled={saving} style={({ pressed }) => [styles.huntCompleteButton, pressed && styles.pressed, saving && styles.disabled]}>
            <Text style={styles.huntCompleteButtonText}>{saving ? "Saving..." : "Move to Memory Lane"}</Text>
          </Pressable>
        ) : null}
      </View>
      ) : null}
      </>
      )}
    </ScreenFrame>
  );
}

function ShelfStatsScreen({
  session,
  onBack,
  onOpenBreakdown,
  onOpenSetBreakdown,
  onOpenFilter,
  onOpenItem,
}: {
  session: Session;
  onBack: () => void;
  onOpenBreakdown: (mode?: SetProgressDrillMode) => void;
  onOpenSetBreakdown: (setName: string, mode?: SetProgressDrillMode) => void;
  onOpenFilter: (filter: CollectionFilter) => void;
  onOpenItem: (item: CollectionItem) => void;
}) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [setChecklists, setSetChecklists] = useState<Record<string, SetChecklistSummary>>({});
  const [setRecommendations, setSetRecommendations] = useState<SetRecommendation[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [rows, checklistRows, profileResult] = await Promise.all([
        fetchUserCollectionItems(session.user.id),
        fetchSetChecklistSummaries(),
        supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle(),
      ]);
      setItems(rows);
      setSetChecklists(checklistRows);
      setProfile(profileResult.error ? null : (profileResult.data as Profile | null));
    } catch (error) {
      Alert.alert("Shelf Stats error", error instanceof Error ? error.message : "Unable to load your shelf stats.");
    } finally {
      setBusy(false);
    }
  }, [session.user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const collectorMode = normalizeCollectorMode(profile?.collector_mode);
  const dashboardTheme = collectorModeDashboardTheme(collectorMode);
  const themedPanelStyle = { borderColor: dashboardTheme.border, backgroundColor: dashboardTheme.panelBg };

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
    const inProgressSets = [...setGroups].filter((group) => {
        const total = Number(group.checklistTotal ?? 0);
        const owned = Number(group.completionOwnedCount ?? group.uniqueCount);
        return group.completionEligible === true && total > 0 && group.completionPercent != null && owned > 0 && owned < total;
      });
    const completedSets = [...setGroups].filter((group) => {
      const total = Number(group.checklistTotal ?? 0);
      const owned = Number(group.completionOwnedCount ?? group.uniqueCount);
      return group.completionEligible === true && total > 0 && group.completionPercent != null && owned >= total;
    });
    const reviewedSets = [...setGroups].filter((group) => Number(group.checklistTotal ?? 0) > 0);
    const closestSets = [...inProgressSets]
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
      inProgressSetCount: inProgressSets.length,
      completedSetCount: completedSets.length,
      reviewedSetCount: reviewedSets.length,
      closestSets,
    };
  }, [items, setChecklists]);

  useEffect(() => {
    let cancelled = false;

    const loadRecommendations = async () => {
      const closeGroups = stats.closestSets.slice(0, 4);
      if (closeGroups.length === 0) {
        setSetRecommendations([]);
        return;
      }

      const nextRecommendations: SetRecommendation[] = [];
      for (const group of closeGroups) {
        const checklist = setChecklists[group.name.toLowerCase()];
        if (!checklist?.set_id) continue;

        try {
          const checklistRows = await fetchSetChecklistItems(checklist.set_id);
          const missingRows = buildChecklistDisplayRows(checklistRows, group.items, group.name).filter((row) => !row.owned);
          const estimatedValuesByCatalogId = await fetchCatalogEstimatedValues(
            missingRows.map((row) => row.pop_catalog_id).filter((id): id is string => Boolean(id)),
          );
          for (const row of missingRows.slice(0, 2)) {
            nextRecommendations.push({
              key: `${group.key}:${row.id}`,
              setName: group.name,
              completionLine: setCompletionText(group),
              row,
              estimatedValue: row.pop_catalog_id ? estimatedValuesByCatalogId[row.pop_catalog_id] : null,
            });
            if (nextRecommendations.length >= 6) break;
          }
          if (nextRecommendations.length >= 6) break;
        } catch {
          // Recommendations are helpful, but the rest of the stats page should still render if a checklist load fails.
        }
      }

      if (!cancelled) {
        setSetRecommendations(nextRecommendations);
      }
    };

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [setChecklists, stats.closestSets]);

  return (
    <ScreenFrame title="Set Progress" onBack={onBack}>
      {busy ? (
        <ActivityIndicator color="#7e67f4" />
      ) : (
        <>
          <View style={[styles.statsGuidePanel, { borderColor: dashboardTheme.border, backgroundColor: dashboardTheme.heroBg }]}>
            <PageIconHero
              icon={PAGE_ICON_SHELF_STATS}
              eyebrow="Set builder recap"
              title={`${integer(stats.completedSetCount)} verified sets complete`}
              copy={`${integer(stats.inProgressSetCount)} reviewed sets are still in progress. Start with the closest ones, then use Pops to Find Next as the hunt list.`}
              style={styles.statsGuideHero}
            />
            <View style={styles.dashboardCompactStatsGrid}>
              <MetricCard label="Pops" value={integer(stats.totalPops)} theme={dashboardTheme} compact />
              <MetricCard label="Unique" value={integer(stats.uniqueItems)} theme={dashboardTheme} compact />
              <MetricCard label="Recent" value={integer(stats.recentAdds)} theme={dashboardTheme} compact />
            </View>
            <View style={styles.dashboardCompactStatsGrid}>
              <MetricCard label="Complete" value={integer(stats.completedSetCount)} onPress={() => onOpenBreakdown("complete")} theme={dashboardTheme} compact />
              <MetricCard label="Within Reach" value={integer(stats.inProgressSetCount)} onPress={() => onOpenBreakdown("withinReach")} theme={dashboardTheme} compact />
              <MetricCard label="Reviewed" value={integer(stats.reviewedSetCount)} onPress={() => onOpenBreakdown("reviewed")} theme={dashboardTheme} compact />
            </View>
            <Pressable
              onPress={() => onOpenBreakdown("withinReach")}
              style={({ pressed }) => [styles.statsPrimaryAction, { backgroundColor: dashboardTheme.accent }, pressed && styles.pressed]}
            >
              <DashboardIconLabel icon={DASHBOARD_ICON_OPEN_SET_ORGANIZER} label="Open Set Organizer" labelStyle={styles.statsBreakdownButtonText} size={32} />
            </Pressable>
          </View>

          <View style={[styles.dashboardInsightPanel, styles.statsPriorityPanel, themedPanelStyle]}>
            <DashboardSectionTitle icon={DASHBOARD_ICON_OPEN_SET_ORGANIZER} title="Sets Within Reach" />
            <Text style={styles.statsSectionCopy}>These are the reviewed sets closest to a satisfying finish.</Text>
            {stats.closestSets.length === 0 ? (
              <Text style={styles.mutedText}>No incomplete reviewed sets are close yet. Add a few more Pops to unlock completion suggestions.</Text>
            ) : (
              stats.closestSets.map((group, index) => (
                <StatsHighlightRow
                  key={group.key}
                  rank={index + 1}
                  group={group}
                  detail={setCompletionText(group) ?? undefined}
                  onPress={() => onOpenSetBreakdown(group.name, "withinReach")}
                />
              ))
            )}
          </View>

          <View style={[styles.dashboardInsightPanel, styles.statsPriorityPanel, themedPanelStyle]}>
            <DashboardSectionTitle icon={DASHBOARD_ICON_POPS_TO_FIND_NEXT} title="Pops to Find Next" />
            <Text style={styles.statsSectionCopy}>Use this like a short hunt list. Values are estimates when the catalog has one.</Text>
            {setRecommendations.length === 0 ? (
              <Text style={styles.mutedText}>Missing Pops from close reviewed sets will appear here.</Text>
            ) : (
              setRecommendations.map((recommendation) => <SetRecommendationRow key={recommendation.key} recommendation={recommendation} />)
            )}
          </View>

          <View style={[styles.dashboardInsightPanel, themedPanelStyle]}>
            <Text style={styles.dashboardSectionTitle}>Biggest Shelf Lines</Text>
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

          <View style={[styles.dashboardInsightPanel, themedPanelStyle]}>
            <Text style={styles.dashboardSectionTitle}>Shelf Mix</Text>
            <View style={styles.statsTwoColumn}>
              <StatPill label="Vaulted" value={integer(stats.vaultedCount)} onPress={() => onOpenFilter({ kind: "vaulted", label: "Vaulted" })} />
              <StatPill label="Limited" value={integer(stats.limitedCount)} onPress={() => onOpenFilter({ kind: "limited", label: "Limited" })} />
              <StatPill label="Duplicate Pops" value={integer(stats.duplicateCopies)} onPress={() => onOpenFilter({ kind: "duplicates", label: "Duplicate Pops" })} />
              <StatPill label="Added 30 days" value={integer(stats.recentAdds)} onPress={() => onOpenFilter({ kind: "recent", label: "Added 30 days" })} />
            </View>
          </View>

          <View style={[styles.dashboardInsightPanel, themedPanelStyle]}>
            <Text style={styles.dashboardSectionTitle}>Needs Attention</Text>
            <View style={styles.statsTwoColumn}>
              <StatPill label="Missing images" value={integer(stats.missingImage)} onPress={() => onOpenFilter({ kind: "missingImages", label: "Missing images" })} />
              <StatPill label="Worth updating" value={integer(stats.missingValue)} onPress={() => onOpenFilter({ kind: "missingValues", label: "Missing values" })} />
              <StatPill label="Unknown condition" value={integer(stats.unknownCondition)} onPress={() => onOpenFilter({ kind: "unknownCondition", label: "Unknown condition" })} />
              <StatPill label="Shelf entries" value={integer(stats.shelfEntries)} />
            </View>
          </View>

          <View style={[styles.dashboardInsightPanel, themedPanelStyle]}>
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

          <View style={[styles.dashboardInsightPanel, themedPanelStyle]}>
            <Text style={styles.dashboardSectionTitle}>Value Snapshot</Text>
            <View style={styles.dashboardStatsGrid}>
              <MetricCard label="Avg Value" value={money(stats.averageValue)} theme={dashboardTheme} />
              <MetricCard label="Avg Paid" value={money(stats.averagePaid)} theme={dashboardTheme} />
              <MetricCard label="Return" value={stats.gainLossPercent == null ? "--" : percent(stats.gainLossPercent)} theme={dashboardTheme} />
            </View>
          </View>

          <View style={[styles.dashboardInsightPanel, themedPanelStyle]}>
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
        </>
      )}
    </ScreenFrame>
  );
}

function ShelfBreakdownScreen({
  session,
  initialSetFilter,
  initialFocusedSetName,
  onBack,
  onOpenFilter,
}: {
  session: Session;
  initialSetFilter: SetProgressDrillMode;
  initialFocusedSetName?: string | null;
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
  const [groupMode, setGroupMode] = useState<StatsGroupMode>("set");
  const [sortMode, setSortMode] = useState<BreakdownSortMode>("closest");
  const [setProgressFilter, setSetProgressFilter] = useState<SetProgressDrillMode>(initialSetFilter);
  const [searchText, setSearchText] = useState(initialFocusedSetName ?? "");
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
      setItems(rows);
      setSharedShelves(shelves);
      setSetChecklists(checklistRows);
      setActiveShelfId(null);
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
    setSetProgressFilter(initialSetFilter);
  }, [initialSetFilter]);

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

  useEffect(() => {
    if (!initialFocusedSetName) return;

    const focusedName = compactName(initialFocusedSetName);
    setGroupMode("set");
    setSortMode("closest");
    setSearchText(focusedName);
    setSetChecklistViewMode("owned");

    const focusedGroup = groups.find((group) => group.name.toLowerCase() === focusedName.toLowerCase());
    if (!focusedGroup) return;

    setExpandedGroupKey(focusedGroup.key);
    const checklist = setChecklists[focusedGroup.name.toLowerCase()];
    if (checklist) void ensureChecklistItems(checklist);
  }, [ensureChecklistItems, groups, initialFocusedSetName, setChecklists]);

  const filteredGroups = useMemo(() => {
    const term = deferredSearchText.trim().toLowerCase();
    const setFilteredGroups = groupMode === "set" ? groups.filter((group) => setMatchesProgressDrill(group, setProgressFilter)) : groups;
    const visible = term ? setFilteredGroups.filter((group) => group.name.toLowerCase().includes(term)) : setFilteredGroups;
    return [...visible].sort((a, b) => {
      if (sortMode === "closest" && groupMode === "set") {
        return compareSetClosest(a, b);
      }
      if (sortMode === "count") {
        return b.count - a.count || b.value - a.value || a.name.localeCompare(b.name);
      }
      if (sortMode === "average") {
        return b.averageValue - a.averageValue || b.count - a.count || a.name.localeCompare(b.name);
      }
      return b.value - a.value || b.count - a.count || a.name.localeCompare(b.name);
    });
  }, [groups, deferredSearchText, groupMode, setProgressFilter, sortMode]);

  const summary = useMemo(() => {
    const totalPops = breakdownItems.reduce((sum, item) => sum + quantityNumber(item.quantity), 0);
    const uniquePops = new Set(breakdownItems.map(duplicateShelfKey)).size;
    const totalValue = breakdownItems.reduce((sum, item) => sum + Number(item.total_value ?? 0), 0);
    const strongestGroup = [...groups].sort((a, b) => b.value - a.value)[0] ?? null;
    const reviewedSetGroups = groups.filter((group) => setMatchesProgressDrill(group, "reviewed"));
    const withinReachSetGroups = groups.filter((group) => setMatchesProgressDrill(group, "withinReach"));
    const completeSetGroups = groups.filter((group) => setMatchesProgressDrill(group, "complete"));
    const selectedSetGroups =
      setProgressFilter === "complete" ? completeSetGroups : setProgressFilter === "reviewed" ? reviewedSetGroups : withinReachSetGroups;
    const selectedSetHighlight =
      setProgressFilter === "withinReach"
        ? [...selectedSetGroups].sort(compareSetClosest)[0] ?? null
        : [...selectedSetGroups].sort((a, b) => b.value - a.value || b.count - a.count || a.name.localeCompare(b.name))[0] ?? null;
    return {
      totalPops,
      uniquePops,
      totalValue,
      strongestGroup,
      selectedSetHighlight,
      completeSetCount: completeSetGroups.length,
      reviewedSetCount: reviewedSetGroups.length,
    };
  }, [breakdownItems, groups, setProgressFilter]);

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
    : `${integer(summary.totalPops)} Pops, ${integer(summary.uniquePops)} unique. Open a set to review owned and missing checklist Pops.`;
  const heroPrimaryGroup = groupMode === "set" ? summary.selectedSetHighlight ?? summary.strongestGroup : summary.strongestGroup;
  const heroPrimaryLabel =
    groupMode === "set" ? (setProgressFilter === "withinReach" ? "Closest set" : `${setProgressDrillLabel(setProgressFilter)} set`) : "Top by value";
  const heroSecondaryLabel = groupMode === "set" ? (setProgressFilter === "withinReach" ? "Missing next" : "Set value") : "Avg pop";
  const heroSecondaryValue =
    groupMode === "set" && heroPrimaryGroup
      ? setProgressFilter === "withinReach"
        ? integer(setMissingCount(heroPrimaryGroup) ?? 0)
        : money(heroPrimaryGroup.value)
      : summary.strongestGroup
        ? money(summary.strongestGroup.averageValue)
        : "--";
  const breakdownTheme = collectorModeDashboardTheme("avid");
  const breakdownPanelStyle = { borderColor: breakdownTheme.border, backgroundColor: breakdownTheme.panelBg };
  const breakdownCardStyle = { borderColor: breakdownTheme.border, backgroundColor: breakdownTheme.cardBg };
  const breakdownActiveStyle = { borderColor: breakdownTheme.accent, backgroundColor: breakdownTheme.secondaryActionBg };

  return (
    <ScreenFrame title="🧩 Set Organizer" onBack={onBack}>
      {busy ? (
        <ActivityIndicator color="#7e67f4" />
      ) : (
        <>
          <View style={[styles.breakdownHero, { borderColor: breakdownTheme.border, backgroundColor: breakdownTheme.heroBg }]}>
            <Text style={[styles.dashboardEyebrow, { color: breakdownTheme.accent }]}>
              {activeShelf ? "Shared shelf map" : groupMode === "set" ? "Set organizer" : "Shelf organizer"}
            </Text>
            <Text style={styles.dashboardSectionTitle}>{scopeName}</Text>
            <Text style={styles.dashboardSubtext}>{scopeCopy}</Text>
            {heroPrimaryGroup ? (
              <View style={styles.breakdownHeroMetaRow}>
                <View style={[styles.breakdownHeroTile, { backgroundColor: breakdownTheme.cardBg }]}>
                  <Text style={[styles.breakdownHeroLabel, { color: breakdownTheme.accentText }]}>{heroPrimaryLabel}</Text>
                  <Text style={styles.breakdownHeroValue} numberOfLines={1}>
                    {heroPrimaryGroup.name}
                  </Text>
                </View>
                <View style={[styles.breakdownHeroTile, { backgroundColor: breakdownTheme.cardBg }]}>
                  <Text style={[styles.breakdownHeroLabel, { color: breakdownTheme.accentText }]}>{heroSecondaryLabel}</Text>
                  <Text style={styles.breakdownHeroValue}>{heroSecondaryValue}</Text>
                </View>
                {groupMode === "set" ? (
                  <View style={[styles.breakdownHeroTile, { backgroundColor: breakdownTheme.cardBg }]}>
                    <Text style={[styles.breakdownHeroLabel, { color: breakdownTheme.accentText }]}>Complete sets</Text>
                    <Text style={styles.breakdownHeroValue}>{integer(summary.completeSetCount)}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          {sharedShelves.length > 0 ? (
            <View style={[styles.breakdownSwitchPanel, breakdownPanelStyle]}>
              <Text style={[styles.breakdownSwitchLabel, { color: breakdownTheme.accentText }]}>Shelf view</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.breakdownShelfTabs}>
                <Pressable
                  onPress={() => {
                    setActiveShelfId(null);
                    setShowAllBreakdownRowsKey(null);
                  }}
                  style={[styles.breakdownShelfTab, breakdownCardStyle, !activeShelfId && breakdownActiveStyle]}
                >
                  <Text style={styles.breakdownShelfTabName} numberOfLines={1}>
                    My Shelf
                  </Text>
                  <Text style={styles.breakdownShelfTabMeta}>Personal sets</Text>
                </Pressable>
                {sharedShelves.map((shelf) => (
                  <Pressable
                    key={shelf.id}
                    onPress={() => {
                      setActiveShelfId(shelf.id);
                      setShowAllBreakdownRowsKey(null);
                    }}
                    style={[styles.breakdownShelfTab, breakdownCardStyle, activeShelfId === shelf.id && breakdownActiveStyle]}
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
                  style={[styles.breakdownMemberTab, breakdownCardStyle, selectedMemberId === member.id && breakdownActiveStyle]}
                >
                  <Text style={styles.breakdownMemberTabName} numberOfLines={1}>
                    {member.name}
                  </Text>
                  <Text style={styles.breakdownMemberTabMeta}>{integer(member.count)} in shelf</Text>
                  <Text style={[styles.breakdownMemberTabValue, { color: breakdownTheme.accent }]}>{money(member.value)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}

          <View style={[styles.breakdownControls, breakdownPanelStyle]}>
            <View style={styles.segmentedControl}>
              {(["set", "franchise"] as const).map((mode) => (
                <Pressable
                  key={mode}
                  onPress={() => {
                    setGroupMode(mode);
                    setSortMode(mode === "set" ? "closest" : "value");
                    setExpandedGroupKey(null);
                    setShowAllBreakdownRowsKey(null);
                  }}
                  style={[styles.segmentButton, groupMode === mode && { backgroundColor: breakdownTheme.accent }]}
                >
                  <Text style={[styles.segmentText, groupMode === mode && styles.segmentTextActive]}>
                    {mode === "franchise" ? "Franchises" : "Sets"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {groupMode === "set" ? (
              <View style={styles.breakdownSortRow}>
                {(["withinReach", "complete", "reviewed"] as const).map((mode) => (
                  <Pressable
                    key={mode}
                    onPress={() => {
                      setSetProgressFilter(mode);
                      setExpandedGroupKey(null);
                      setShowAllBreakdownRowsKey(null);
                    }}
                    style={[styles.breakdownSortChip, breakdownCardStyle, setProgressFilter === mode && breakdownActiveStyle]}
                  >
                    <Text style={[styles.breakdownSortText, setProgressFilter === mode && styles.breakdownSortTextActive]}>
                      {setProgressDrillLabel(mode)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <NativeTextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={groupMode === "franchise" ? "Search franchises" : "Search sets"}
              placeholderTextColor="#8d96a3"
              style={[styles.breakdownSearchInput, { borderColor: breakdownTheme.border, backgroundColor: breakdownTheme.cardBg }]}
            />

            <View style={styles.breakdownSortRow}>
              {(groupMode === "set"
                ? ([
                    ["closest", "Closest"],
                    ["count", "Pops"],
                    ["value", "Value"],
                  ] as const)
                : ([
                    ["value", "Value"],
                    ["count", "Pops"],
                    ["average", "Avg"],
                  ] as const)
              ).map(([mode, label]) => (
                <Pressable
                  key={mode}
                  onPress={() => setSortMode(mode)}
                  style={[styles.breakdownSortChip, breakdownCardStyle, sortMode === mode && breakdownActiveStyle]}
                >
                  <Text style={[styles.breakdownSortText, sortMode === mode && styles.breakdownSortTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[styles.dashboardInsightPanel, breakdownPanelStyle]}>
            <Text style={styles.dashboardSectionTitle}>
              {groupMode === "set" ? `${setProgressDrillLabel(setProgressFilter)} Sets` : `${title} Breakdown`}
            </Text>
            <Text style={styles.mutedSmall}>
              {groupMode === "set"
                ? "Open a set to compare owned Pops with the reviewed checklist."
                : activeShelf
                  ? "Tap a row to see the Pops inside it."
                  : "Tap a row to open the matching shelf view."}
            </Text>

            {sharedBusy ? (
              <ActivityIndicator color="#7e67f4" />
            ) : filteredGroups.length === 0 ? (
              <Text style={styles.mutedText}>
                {groupMode === "set"
                  ? `No ${setProgressDrillLabel(setProgressFilter).toLowerCase()} sets found yet.`
                  : "No matching groups found."}
              </Text>
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
                const certificationBadge = groupMode === "set" ? setStatusBadge(group) : null;
                const visibleChecklistRows =
                  setChecklistViewMode === "missing"
                    ? missingRows
                    : setChecklistViewMode === "full"
                      ? checklistDisplayRows
                      : [];
                const expandedOwnedRows = sortItemsByBoxNumber(group.items);
                const expandedRowsCount = setChecklistViewMode === "owned" ? expandedOwnedRows.length : visibleChecklistRows.length;
                return (
                  <View key={group.key} style={[styles.breakdownGroupRow, { borderColor: breakdownTheme.border, backgroundColor: breakdownTheme.cardBg }]}>
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
                            {certificationBadge ? (
                              <View
                                style={[
                                  styles.setStatusBadge,
                                  {
                                    backgroundColor: certificationBadge.backgroundColor,
                                    borderColor: certificationBadge.borderColor,
                                  },
                                ]}
                              >
                                <Text style={[styles.setStatusBadgeText, { color: certificationBadge.color }]}>
                                  {certificationBadge.label}
                                </Text>
                              </View>
                            ) : null}
                            <Text style={styles.breakdownGroupMeta}>{integer(group.uniqueCount)} unique Pops</Text>
                            {completionLine ? <Text style={styles.setCompletionText}>{completionLine}</Text> : null}
                          </View>
                          <Text style={[styles.groupChevron, { color: breakdownTheme.accentText }]}>
                            {canOpenGroup && !canExpandGroup ? "View" : expanded ? "Hide" : "Open"}
                          </Text>
                        </View>
                        <View style={styles.breakdownMetricRow}>
                          <View style={[styles.breakdownMetricTile, { backgroundColor: breakdownTheme.panelBg }]}>
                            <Text style={[styles.breakdownMetricLabel, { color: breakdownTheme.accentText }]}>{groupMode === "set" ? "Owned" : "Pops"}</Text>
                            <Text style={styles.breakdownMetricValue} numberOfLines={1}>
                              {groupMode === "set" && hasCompletion ? integer(displayCompletionOwnedCount) : integer(group.count)}
                            </Text>
                          </View>
                          <View style={[styles.breakdownMetricTile, { backgroundColor: breakdownTheme.panelBg }]}>
                            <Text style={[styles.breakdownMetricLabel, { color: breakdownTheme.accentText }]}>{groupMode === "set" ? "Missing" : "Value"}</Text>
                            <Text style={styles.breakdownMetricValue} numberOfLines={1}>
                              {groupMode === "set" && hasCompletion ? integer(displayMissingCount) : money(group.value)}
                            </Text>
                          </View>
                          <View style={[styles.breakdownMetricTile, { backgroundColor: breakdownTheme.panelBg }]}>
                            <Text style={[styles.breakdownMetricLabel, { color: breakdownTheme.accentText }]}>{groupMode === "set" ? "Complete" : "Avg"}</Text>
                            <Text style={styles.breakdownMetricValue} numberOfLines={1}>
                              {groupMode === "set" && hasCompletion && displayCompletionPercent != null
                                ? percent(displayCompletionPercent)
                                : money(group.averageValue)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.breakdownBarTrack}>
                          <View style={[styles.breakdownBarFill, { width: barWidth, backgroundColor: breakdownTheme.accent }]} />
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
                            {group.completionReviewNote ? (
                              <Text style={styles.setReviewNote}>{group.completionReviewNote}</Text>
                            ) : null}
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
  huntContext,
  onBack,
  onManualAdd,
  onAdded,
}: {
  huntContext?: HuntScanContext | null;
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
  const [photoDraft, setPhotoDraft] = useState<CatalogPhotoDraft | null>(null);
  const [photoDraftImageUri, setPhotoDraftImageUri] = useState<string | null>(null);
  const [photoDraftBusy, setPhotoDraftBusy] = useState(false);
  const [photoDraftMatches, setPhotoDraftMatches] = useState<PopCatalog[]>([]);
  const [photoDraftMatchBusy, setPhotoDraftMatchBusy] = useState(false);
  const [photoDraftMatchMessage, setPhotoDraftMatchMessage] = useState<string | null>(null);
  const [photoOcrBusy, setPhotoOcrBusy] = useState(false);
  const [photoOcrProgress, setPhotoOcrProgress] = useState<string | null>(null);
  const [photoOcrText, setPhotoOcrText] = useState<string | null>(null);
  const [parserAssistOpen, setParserAssistOpen] = useState(false);
  const [advancedPhotoToolsOpen, setAdvancedPhotoToolsOpen] = useState(false);

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

  const loadSharedShelfCheck = (pop: PopCatalog) => {
    setSharedShelfBusy(true);
    setSharedShelfOwners([]);
    setSharedShelfChecked(false);
    void fetchSharedShelfOwnersForPop(pop)
      .then(setSharedShelfOwners)
      .catch(() => setSharedShelfOwners([]))
      .finally(() => {
        setSharedShelfChecked(true);
        setSharedShelfBusy(false);
      });
  };

  const selectCatalogMatch = (pop: PopCatalog) => {
    setLookup(pop);
    setBarcode(pop.upc ?? "");
    setOwnedVariant(pop.variant || "Common");
    setSelectedExclusivity(pop.exclusivity || "None");
    setOwnedCondition("Unknown");
    loadSharedShelfCheck(pop);
  };

  const normalizeAssistValue = (value?: string | null) => String(value ?? "").trim().toLowerCase().replace(/[#™®:!.'"-]/g, "").replace(/\s+/g, " ");

  const buildParserAssistFields = (catalog: PopCatalog | null, draft: CatalogPhotoDraft | null): ParserAssistField[] => {
    if (!catalog || !draft) return [];
    const fields: Array<{ label: string; catalogValue?: string | null; aiValue?: string | null; key: keyof CatalogPhotoDraft }> = [
      { label: "Name", catalogValue: catalog.pop_name ?? catalog.character, aiValue: draft.pop_name ?? draft.character, key: "pop_name" },
      { label: "Character", catalogValue: catalog.character, aiValue: draft.character, key: "character" },
      { label: "Franchise", catalogValue: catalog.franchise, aiValue: draft.franchise, key: "franchise" },
      { label: "Set", catalogValue: catalog.set_name, aiValue: draft.set_name, key: "set_name" },
      { label: "Number", catalogValue: catalog.number, aiValue: draft.number, key: "number" },
      { label: "Variant", catalogValue: catalog.variant, aiValue: draft.variant, key: "variant" },
      { label: "Exclusivity", catalogValue: catalog.exclusivity, aiValue: draft.exclusivity, key: "exclusivity" },
      { label: "UPC", catalogValue: catalog.upc, aiValue: draft.upc, key: "upc" },
    ];

    return fields
      .map((field) => {
        const catalogValue = field.catalogValue?.trim() || null;
        const aiValue = field.aiValue?.trim() || null;
        if (!catalogValue && !aiValue) return null;
        const catalogNorm = normalizeAssistValue(catalogValue);
        const aiNorm = normalizeAssistValue(aiValue);
        const aligned = Boolean(catalogNorm && aiNorm && (catalogNorm === aiNorm || catalogNorm.includes(aiNorm) || aiNorm.includes(catalogNorm)));
        if (aligned) return null;
        return {
          label: field.label,
          catalogValue,
          aiValue,
          severity: catalogValue && aiValue ? "warning" : "info",
        } satisfies ParserAssistField;
      })
      .filter((field): field is ParserAssistField => Boolean(field));
  };

  const parserAssistFields = buildParserAssistFields(lookup, photoDraft);
  const hasParserAssist = Boolean(lookup && photoDraft);

  const scorePhotoDraftMatch = (draft: CatalogPhotoDraft, pop: PopCatalog) => {
    const draftName = `${draft.pop_name ?? ""} ${draft.character ?? ""}`.trim().toLowerCase();
    const popName = `${pop.pop_name ?? ""} ${pop.character ?? ""}`.trim().toLowerCase();
    const draftFranchise = (draft.franchise ?? "").toLowerCase();
    const draftSet = (draft.set_name ?? "").toLowerCase();
    const draftNumber = (draft.number ?? "").toLowerCase();
    let score = 0;

    if (draft.upc && pop.upc === draft.upc) score += 120;
    if (draftNumber && (pop.number ?? "").toLowerCase() === draftNumber) score += 35;
    if (draftName && popName.includes(draftName)) score += 30;
    if (draftName && draftName.includes(popName)) score += 20;
    if (draftFranchise && (pop.franchise ?? "").toLowerCase().includes(draftFranchise)) score += 25;
    if (draftSet && (pop.set_name ?? "").toLowerCase().includes(draftSet)) score += 25;
    if (draft.variant && pop.variant?.toLowerCase() === draft.variant.toLowerCase()) score += 10;
    if (draft.exclusivity && pop.exclusivity?.toLowerCase() === draft.exclusivity.toLowerCase()) score += 10;

    return score;
  };

  const searchPhotoDraftCatalogMatches = async (draft: CatalogPhotoDraft) => {
    setPhotoDraftMatchBusy(true);
    setPhotoDraftMatches([]);
    setPhotoDraftMatchMessage(null);

    const selectFields =
      "id,upc,pop_name,character,franchise,number,variant,exclusivity,pop_type,pop_style,set_name,image_url,vault_status,release_date,estimated_value,display_description,limited_edition,limited_count,edition_notes";
    const foundById: Record<string, PopCatalog> = {};

    try {
      const cleanUpc = draft.upc?.trim();
      if (cleanUpc) {
        const { data, error } = await supabase.from("pop_catalog").select(selectFields).eq("upc", cleanUpc).limit(8);
        if (error) throw error;
        ((data ?? []) as PopCatalog[]).forEach((row) => {
          foundById[row.id] = row;
        });
      }

      const searchTerms = [draft.pop_name, draft.character, draft.franchise, draft.set_name, draft.number]
        .map((term) => term?.trim().replace(/[%,()]/g, " "))
        .filter((term): term is string => Boolean(term && term.length >= 2))
        .slice(0, 5);

      for (const term of searchTerms) {
        const { data, error } = await supabase
          .from("pop_catalog")
          .select(selectFields)
          .or(`pop_name.ilike.%${term}%,character.ilike.%${term}%,franchise.ilike.%${term}%,set_name.ilike.%${term}%,number.ilike.%${term}%`)
          .limit(12);
        if (error) throw error;
        ((data ?? []) as PopCatalog[]).forEach((row) => {
          foundById[row.id] = row;
        });
      }

      const matches = Object.values(foundById)
        .map((pop) => ({ pop, score: scorePhotoDraftMatch(draft, pop) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ pop }) => pop);

      setPhotoDraftMatches(matches);
      setPhotoDraftMatchMessage(matches.length ? "Possible catalog matches" : "No catalog match found from the photo draft yet.");
    } catch (error) {
      setPhotoDraftMatchMessage(error instanceof Error ? error.message : "Catalog match search failed.");
    } finally {
      setPhotoDraftMatchBusy(false);
    }
  };

  const ocrTextToDraft = (text: string): CatalogPhotoDraft => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.replace(/[|]+/g, " ").replace(/\s+/g, " ").trim())
      .filter((line) => line.length >= 2);
    const usefulLines = lines.filter((line) => !/^(pop!?|vinyl|figure|collect them all|warning|age|ages|funko)$/i.test(line));
    const numberMatch = text.match(/#?\s*(\d{1,5})\b/);
    const upcMatch = text.replace(/\D/g, "").match(/\d{12,14}/);
    const firstNameLine = usefulLines.find((line) => /[a-z]/i.test(line) && !/^\d+$/.test(line)) ?? null;
    const secondNameLine = usefulLines.find((line) => line !== firstNameLine && /[a-z]/i.test(line) && !/^\d+$/.test(line)) ?? null;

    return {
      pop_name: firstNameLine,
      character: secondNameLine,
      franchise: null,
      set_name: null,
      number: numberMatch?.[1] ?? null,
      variant: /chase/i.test(text) ? "Chase" : null,
      exclusivity: /exclusive|special edition|target|walmart|hot topic|boxlunch|gamestop|funko shop/i.test(text)
        ? usefulLines.find((line) => /exclusive|special edition|target|walmart|hot topic|boxlunch|gamestop|funko shop/i.test(line)) ?? "Exclusive"
        : null,
      pop_type: null,
      pop_style: null,
      upc: upcMatch?.[0] ?? null,
      confidence: usefulLines.length > 0 ? 0.45 : 0.1,
      needs_review: true,
      review_notes: usefulLines.length > 0 ? ["Free OCR draft. Confirm against the catalog match before adding."] : ["OCR did not find enough readable box text."],
    };
  };

  const runPhotoOcr = async (source: "camera" | "library") => {
    try {
      setPhotoOcrBusy(true);
      setPhotoOcrProgress("Opening photo...");
      setPhotoOcrText(null);
      setPhotoDraft(null);
      setPhotoDraftImageUri(null);
      setPhotoDraftMatches([]);
      setPhotoDraftMatchMessage(null);

      if (source === "camera") {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert("Photo permission needed", "Allow camera access to test OCR on a box photo.");
          return;
        }
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert("Photo permission needed", "Allow photo access to choose a box photo.");
          return;
        }
      }

      const pickerOptions = {
        allowsEditing: false,
        base64: false,
        quality: 0.75,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      };
      const pickerResult =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (pickerResult.canceled) return;
      const asset = pickerResult.assets[0];
      if (!asset?.uri) {
        Alert.alert("Photo not ready", "The image picker did not return a readable photo. Try another image.");
        return;
      }

      setPhotoDraftImageUri(asset.uri);
      setPhotoOcrProgress("Reading visible box text...");
      const Tesseract = (await import("tesseract.js")) as TesseractModule;
      const result = await Tesseract.recognize(asset.uri, "eng", {
        logger: (message) => {
          if (message.status) {
            const percent = typeof message.progress === "number" ? ` ${Math.round(message.progress * 100)}%` : "";
            setPhotoOcrProgress(`${message.status}${percent}`);
          }
        },
      });
      const text = result.data?.text?.trim() ?? "";
      setPhotoOcrText(text || "No readable text found.");
      const draft = ocrTextToDraft(text);
      setPhotoDraft(draft);
      await searchPhotoDraftCatalogMatches(draft);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to run OCR on that photo.";
      setPhotoDraftMatchMessage(message);
      Alert.alert("OCR test failed", message);
    } finally {
      setPhotoOcrBusy(false);
      setPhotoOcrProgress(null);
    }
  };

  const invokePhotoAnalyzer = async (body: { imageBase64: string; mimeType: string }) => {
    if (!SUPABASE_FUNCTIONS_URL || !SUPABASE_FUNCTIONS_ANON_KEY) {
      throw new Error("Supabase function settings are missing from the app build.");
    }

    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/analyze_pop_image`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_FUNCTIONS_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_FUNCTIONS_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    let payload: { draft?: CatalogPhotoDraft; error?: string; message?: string } | null = null;
    try {
      payload = responseText ? JSON.parse(responseText) : null;
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(payload?.error || payload?.message || responseText || `Photo reader returned HTTP ${response.status}.`);
    }

    return payload;
  };

  const prepareAiPhotoAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    const sourceUri = asset.uri;
    if (!sourceUri) throw new Error("The image picker did not return a readable photo. Try another image.");

    if (IS_WEB && typeof document !== "undefined") {
      let bitmap: ImageBitmap | null = null;
      if (typeof createImageBitmap === "function") {
        const imageBlob = await fetch(sourceUri).then((response) => response.blob());
        bitmap = await createImageBitmap(imageBlob, {
          resizeWidth: PHOTO_DRAFT_MAX_DIMENSION,
          resizeHeight: PHOTO_DRAFT_MAX_DIMENSION,
          resizeQuality: "high",
        } as ImageBitmapOptions);
      }

      const image = bitmap ?? await new Promise<HTMLImageElement>((resolve, reject) => {
        const nextImage = document.createElement("img");
        nextImage.onload = () => resolve(nextImage);
        nextImage.onerror = () => reject(new Error("The browser could not load that photo for resizing."));
        nextImage.src = sourceUri;
      });
      const sourceWidth = image.width || PHOTO_DRAFT_MAX_DIMENSION;
      const sourceHeight = image.height || PHOTO_DRAFT_MAX_DIMENSION;
      const scale = Math.min(1, PHOTO_DRAFT_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight));
      const width = Math.max(1, Math.round(sourceWidth * scale));
      const height = Math.max(1, Math.round(sourceHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("The browser could not prepare that photo.");
      context.drawImage(image, 0, 0, width, height);
      bitmap?.close();
      const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
      const imageBase64 = dataUrl.split(",")[1] ?? "";
      if (!imageBase64) throw new Error("The browser could not compress that photo.");
      if (imageBase64.length > PHOTO_DRAFT_MAX_BASE64_LENGTH) {
        throw new Error("That photo is still too large after compression. Try a closer crop of the box or barcode.");
      }
      return { imageBase64, mimeType: "image/jpeg", previewUri: dataUrl };
    }

    const imageBase64 = asset.base64?.replace(/^data:[^;]+;base64,/, "").replace(/\s/g, "") ?? "";
    if (!imageBase64) throw new Error("The image picker did not return a readable photo. Try another image.");
    if (imageBase64.length > PHOTO_DRAFT_MAX_BASE64_LENGTH) {
      throw new Error("That photo is too large for AI analysis. Try a closer crop of the box or barcode.");
    }
    return { imageBase64, mimeType: asset.mimeType || "image/jpeg", previewUri: sourceUri };
  };

  const analyzePopPhoto = async (source: "camera" | "library") => {
    try {
      setPhotoDraftBusy(true);
      setPhotoDraft(null);
      setPhotoDraftImageUri(null);
      setPhotoDraftMatches([]);
      setPhotoDraftMatchMessage(null);

      if (IS_WEB && source === "camera") {
        Alert.alert("Use photo upload", "The browser camera path is too memory-heavy for AI box photos right now. Use Choose AI Photo instead.");
        return;
      }

      if (source === "camera") {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert("Photo permission needed", "Allow camera access to test a box photo.");
          return;
        }
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert("Photo permission needed", "Allow photo access to choose a box photo.");
          return;
        }
      }

      const pickerOptions = {
        allowsEditing: false,
        base64: !IS_WEB,
        quality: 0.45,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      };
      const pickerResult =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (pickerResult.canceled) return;
      const asset = pickerResult.assets[0];
      const preparedPhoto = await prepareAiPhotoAsset(asset);

      setPhotoDraftImageUri(preparedPhoto.previewUri);
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Photo reading timed out. Try a brighter, closer box photo or choose a smaller image.")), PHOTO_DRAFT_TIMEOUT_MS);
      });
      const data = await Promise.race([
        invokePhotoAnalyzer({
            imageBase64: preparedPhoto.imageBase64,
            mimeType: preparedPhoto.mimeType,
        }),
        timeout,
      ]);

      const draft = (data as { draft?: CatalogPhotoDraft } | null)?.draft;
      if (!draft) {
        setPhotoDraftMatchMessage("The photo reader did not return catalog fields.");
        Alert.alert("No draft returned", "The photo reader did not return catalog fields.");
        return;
      }

      setPhotoDraft(draft);
      await searchPhotoDraftCatalogMatches(draft);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to read that photo.";
      setPhotoDraftMatchMessage(message);
      Alert.alert("Photo test failed", message);
    } finally {
      setPhotoDraftBusy(false);
    }
  };

  const analyzePopPhotoForUpc = async (source: "camera" | "library") => {
    try {
      setPhotoDraftBusy(true);
      setPhotoDraftMatchMessage(null);

      if (IS_WEB && source === "camera") {
        Alert.alert("Use barcode scan or photo upload", "The browser camera path is too memory-heavy for AI UPC Assist right now. Use Scan Barcode, or open Advanced photo tools and choose an image.");
        return;
      }

      if (source === "camera") {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert("Photo permission needed", "Allow camera access to read the UPC from a box photo.");
          return;
        }
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert("Photo permission needed", "Allow photo access to choose a box photo.");
          return;
        }
      }

      const pickerOptions = {
        allowsEditing: false,
        base64: !IS_WEB,
        quality: 0.55,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      };
      const pickerResult =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (pickerResult.canceled) return;
      const asset = pickerResult.assets[0];
      const preparedPhoto = await prepareAiPhotoAsset(asset);

      setPhotoDraftImageUri(preparedPhoto.previewUri);
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("UPC photo read timed out. Try a closer, brighter shot of the barcode or box side.")), PHOTO_DRAFT_TIMEOUT_MS);
      });
      const data = await Promise.race([
        invokePhotoAnalyzer({
          imageBase64: preparedPhoto.imageBase64,
          mimeType: preparedPhoto.mimeType,
        }),
        timeout,
      ]);

      const draft = (data as { draft?: CatalogPhotoDraft } | null)?.draft;
      if (!draft) {
        setPhotoDraftMatchMessage("The photo reader did not return UPC fields.");
        Alert.alert("No UPC returned", "The photo reader did not return UPC fields.");
        return;
      }

      setPhotoDraft(draft);
      await searchPhotoDraftCatalogMatches(draft);
      const draftUpc = draft.upc?.trim();
      if (!draftUpc) {
        Alert.alert("No UPC found", "Gemini read the photo, but it did not find a UPC. Try a closer photo of the barcode or side panel.");
        return;
      }

      setBarcode(draftUpc);
      await findPop(draftUpc);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to read UPC from that photo.";
      setPhotoDraftMatchMessage(message);
      Alert.alert("UPC photo check failed", message);
    } finally {
      setPhotoDraftBusy(false);
    }
  };

  const usePhotoDraftUpc = () => {
    const draftUpc = photoDraft?.upc?.trim();
    if (!draftUpc) return;
    setBarcode(draftUpc);
    findPop(draftUpc);
  };

  const photoDraftFields = photoDraft
    ? [
        ["Name", photoDraft.pop_name],
        ["Character", photoDraft.character],
        ["Franchise", photoDraft.franchise],
        ["Set", photoDraft.set_name],
        ["Number", photoDraft.number ? `#${photoDraft.number}` : null],
        ["Variant", photoDraft.variant],
        ["Exclusivity", photoDraft.exclusivity],
        ["Type", photoDraft.pop_type],
        ["Style", photoDraft.pop_style],
        ["UPC", photoDraft.upc],
      ].filter((field): field is [string, string] => Boolean(field[1]))
    : [];

  const renderAdvancedPhotoTools = () => (
    <View style={[styles.scanPhotoDraftPanel, { borderColor: scanTheme.border, backgroundColor: scanTheme.panelBg }]}>
      <Pressable onPress={() => setAdvancedPhotoToolsOpen(!advancedPhotoToolsOpen)} style={styles.scanAdvancedHeader}>
        <View style={styles.flex}>
          <Text style={[styles.dashboardEyebrow, { color: scanTheme.accent }]}>Advanced photo tools</Text>
          <Text style={styles.scanAdvancedTitle}>AI box photo and OCR helpers</Text>
        </View>
        {(photoDraftBusy || photoOcrBusy) ? <ActivityIndicator color={scanTheme.accent} /> : <Text style={styles.scanAdvancedChevron}>{advancedPhotoToolsOpen ? "Hide" : "Open"}</Text>}
      </Pressable>
      {advancedPhotoToolsOpen ? (
        <>
          <Text style={styles.scanPhotoDraftCopy}>Draft catalog fields from Gemini/OpenAI vision or use free OCR below. This does not create or edit catalog records.</Text>
          <View style={styles.scanPhotoDraftActions}>
            {!IS_WEB ? (
              <Pressable
                onPress={() => analyzePopPhoto("camera")}
                disabled={photoDraftBusy || photoOcrBusy || busy}
                style={({ pressed }) => [
                  styles.scanPhotoDraftButton,
                  { backgroundColor: scanTheme.primaryActionBg },
                  pressed && styles.pressed,
                  (photoDraftBusy || photoOcrBusy || busy) && styles.disabled,
                ]}
              >
                <Text style={styles.scanPhotoDraftButtonText}>AI Box Photo</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => analyzePopPhoto("library")}
              disabled={photoDraftBusy || photoOcrBusy || busy}
              style={({ pressed }) => [
                styles.scanPhotoDraftButton,
                styles.scanPhotoDraftSecondaryButton,
                { borderColor: scanTheme.border, backgroundColor: scanTheme.cardBg },
                pressed && styles.pressed,
                (photoDraftBusy || photoOcrBusy || busy) && styles.disabled,
              ]}
            >
              <Text style={styles.scanPhotoDraftSecondaryText}>{IS_WEB ? "Upload AI Photo" : "Choose AI Photo"}</Text>
            </Pressable>
          </View>
          <View style={styles.scanPhotoDraftActions}>
            <Pressable
              onPress={() => runPhotoOcr("camera")}
              disabled={photoDraftBusy || photoOcrBusy || busy}
              style={({ pressed }) => [
                styles.scanPhotoDraftButton,
                styles.scanOcrButton,
                pressed && styles.pressed,
                (photoDraftBusy || photoOcrBusy || busy) && styles.disabled,
              ]}
            >
              <Text style={styles.scanOcrButtonText}>OCR Camera</Text>
            </Pressable>
            <Pressable
              onPress={() => runPhotoOcr("library")}
              disabled={photoDraftBusy || photoOcrBusy || busy}
              style={({ pressed }) => [
                styles.scanPhotoDraftButton,
                styles.scanOcrSecondaryButton,
                pressed && styles.pressed,
                (photoDraftBusy || photoOcrBusy || busy) && styles.disabled,
              ]}
            >
              <Text style={styles.scanOcrButtonText}>OCR Photo</Text>
            </Pressable>
          </View>
          {photoOcrBusy || photoOcrProgress ? (
            <Text style={styles.scanPhotoStatusCopy}>{photoOcrProgress || "Reading photo text..."}</Text>
          ) : null}
          {!photoDraft && photoDraftMatchMessage ? (
            <View style={styles.scanPhotoStatusCard}>
              <Text style={styles.scanPhotoStatusTitle}>Photo reader needs attention</Text>
              <Text style={styles.scanPhotoStatusCopy}>{photoDraftMatchMessage}</Text>
            </View>
          ) : null}
          {photoDraft ? (
            <View style={[styles.scanPhotoDraftResult, { borderColor: scanTheme.border, backgroundColor: scanTheme.cardBg }]}>
              <View style={styles.scanPhotoDraftResultTop}>
                {photoDraftImageUri ? <Image source={{ uri: photoDraftImageUri }} style={styles.scanPhotoDraftImage} /> : null}
                <View style={styles.flex}>
                  <Text style={styles.scanPhotoDraftResultTitle}>{photoDraft.pop_name || photoDraft.character || "Catalog draft"}</Text>
                  <Text style={styles.scanPhotoDraftConfidence}>
                    {Math.round(Math.max(0, Math.min(1, photoDraft.confidence || 0)) * 100)}% confidence
                    {photoDraft.needs_review ? " - needs review" : ""}
                  </Text>
                </View>
              </View>
              <View style={styles.scanPhotoDraftGrid}>
                {photoDraftFields.map(([label, value]) => (
                  <View key={label} style={styles.scanPhotoDraftField}>
                    <Text style={styles.scanPhotoDraftFieldLabel}>{label}</Text>
                    <Text style={styles.scanPhotoDraftFieldValue} numberOfLines={2}>
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
              {photoDraft.review_notes.length > 0 ? (
                <Text style={styles.scanPhotoDraftNotes}>{photoDraft.review_notes.slice(0, 3).join(" ")}</Text>
              ) : null}
              {photoOcrText ? (
                <View style={styles.scanOcrTextBox}>
                  <Text style={styles.scanPhotoDraftFieldLabel}>OCR text</Text>
                  <Text style={styles.scanOcrText} numberOfLines={6}>
                    {photoOcrText}
                  </Text>
                </View>
              ) : null}
              {photoDraft.upc ? (
                <Pressable
                  onPress={usePhotoDraftUpc}
                  disabled={busy}
                  style={({ pressed }) => [styles.scanPhotoDraftUseButton, { backgroundColor: scanTheme.accent }, pressed && styles.pressed, busy && styles.disabled]}
                >
                  <Text style={styles.scanPhotoDraftUseText}>Use UPC and Find Match</Text>
                </Pressable>
              ) : null}
              <View style={styles.scanPhotoMatchSection}>
                <View style={styles.scanPhotoMatchHeader}>
                  <Text style={styles.scanPhotoMatchTitle}>Catalog Match</Text>
                  {photoDraftMatchBusy ? <ActivityIndicator color={scanTheme.accent} /> : null}
                </View>
                {photoDraftMatchMessage ? <Text style={styles.scanPhotoMatchMessage}>{photoDraftMatchMessage}</Text> : null}
                {photoDraftMatches.map((match) => (
                  <Pressable
                    key={match.id}
                    onPress={() => selectCatalogMatch(match)}
                    style={({ pressed }) => [styles.scanPhotoMatchRow, pressed && styles.pressed]}
                  >
                    {match.image_url ? <Image source={{ uri: match.image_url }} style={styles.scanPhotoMatchImage} /> : <EmptyDisplayBox style={styles.scanPhotoMatchImage} />}
                    <View style={styles.flex}>
                      <Text style={styles.scanPhotoMatchName} numberOfLines={1}>
                        {displayPopName(match)}
                      </Text>
                      <Text style={styles.scanPhotoMatchMeta} numberOfLines={2}>
                        {[match.franchise, match.set_name, match.number ? `#${match.number}` : null, match.variant].filter(Boolean).join("  ")}
                      </Text>
                    </View>
                    <View style={styles.alignEnd}>
                      <Text style={styles.scanPhotoMatchValue}>{money(match.estimated_value)}</Text>
                      <Pressable
                        onPress={(event) => {
                          event.stopPropagation();
                          addToCollection(false, match);
                        }}
                        disabled={busy || wishlistBusy}
                        style={({ pressed }) => [styles.scanPhotoMatchAddButton, pressed && styles.pressed, (busy || wishlistBusy) && styles.disabled]}
                      >
                        <Text style={styles.scanPhotoMatchAddText}>{busy ? "Adding" : "Add"}</Text>
                      </Pressable>
                      <Text style={styles.scanPhotoMatchUse}>Tap row to review</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );

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
    loadSharedShelfCheck(foundPop);
  };

  const addToCollection = async (scanMore = false, lookupOverride?: PopCatalog) => {
    const { data: auth } = await supabase.auth.getUser();
    const startingLookup = lookupOverride ?? lookup;
    if (!startingLookup || !auth.user) return;

    setBusy(true);
    const selectedVariant = lookupOverride ? startingLookup.variant || "Common" : ownedVariant || "Common";
    const selectedExclusivityValue = lookupOverride ? startingLookup.exclusivity || "None" : selectedExclusivity;
    const cleanExclusivity = selectedExclusivityValue && selectedExclusivityValue !== "None" ? selectedExclusivityValue : null;
    const selectedCondition = lookupOverride ? "Unknown" : ownedCondition || "Unknown";
    let activeLookup = startingLookup;

    if ((startingLookup.exclusivity ?? null) !== cleanExclusivity && startingLookup.upc) {
      const { data: updateData, error: updateError } = await supabase.functions.invoke("lookup_pop", {
        body: { barcode: startingLookup.upc, exclusivityOverride: cleanExclusivity },
      });

      if (updateError) {
        setBusy(false);
        Alert.alert("Exclusivity update failed", await getFunctionErrorMessage(updateError, startingLookup.upc));
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

    const saveHuntFind = async (collectionItemId: string) => {
      if (!huntContext || !auth.user) return true;
      const { error } = await supabase.from("funko_hunt_finds").insert({
        hunt_id: huntContext.huntId,
        stop_id: huntContext.stopId,
        found_by_user_id: auth.user.id,
        pop_catalog_id: activeLookup.id,
        collection_item_id: collectionItemId,
        pop_name: displayPopName(activeLookup, selectedVariant),
        outcome: "bought",
        note: `Added from ${huntContext.stopName}`,
      });
      if (error) {
        Alert.alert("Added to shelf", "The Pop was added, but the hunt find could not be linked. You can still add a memory from Pop Hunts.");
        return false;
      }
      return true;
    };

    const finishAdd = async (collectionItemId: string, addedMessage?: string) => {
      const huntFindSaved = await saveHuntFind(collectionItemId);
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
        Alert.alert(
          huntContext && huntFindSaved ? "Added to hunt" : "Added to shelf",
          addedMessage ?? `${displayPopName(activeLookup, selectedVariant)} was added. Ready for the next scan.`,
        );
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
  const scanTheme = collectorModeDashboardTheme("avid");

  return (
    <ScreenFrame title="📷 Scan Pop" onBack={onBack}>
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
          <PageIconHero
            icon={PAGE_ICON_SCAN_POP}
            eyebrow="Pop finder"
            title="Add the next box to your shelf"
            copy="Scan the UPC, confirm the variant, and Shelf-n-Pop will check your shelf before adding it."
            style={[styles.scanHero, { borderColor: scanTheme.border, backgroundColor: scanTheme.heroBg }]}
          />

          {huntContext ? (
            <View style={styles.scanHuntContextBanner}>
              <Text style={styles.scanHuntContextEyebrow}>Adding from hunt</Text>
              <Text style={styles.scanHuntContextTitle}>{huntContext.stopName}</Text>
              <Text style={styles.scanHuntContextCopy}>This find will be saved to {huntContext.huntTitle} after it is added to your shelf.</Text>
            </View>
          ) : null}

          <View style={[styles.scanEntryPanel, { borderColor: scanTheme.border, backgroundColor: scanTheme.panelBg }]}>
            <Pressable
              onPress={openScanner}
              disabled={busy}
              style={({ pressed }) => [styles.scanCameraButton, { backgroundColor: scanTheme.accent }, pressed && styles.pressed, busy && styles.disabled]}
            >
              <Text style={styles.scanCameraButtonText}>Scan Barcode</Text>
              <Text style={styles.scanCameraButtonSub}>Use camera or web scanner</Text>
            </Pressable>

            <View style={styles.scanDividerRow}>
              <View style={styles.scanDividerLine} />
              <Text style={styles.scanDividerText}>or enter UPC</Text>
              <View style={styles.scanDividerLine} />
            </View>

            <View style={styles.scanUpcRow}>
              <TextInput
                keyboardType="number-pad"
                value={barcode}
                onChangeText={setBarcode}
                placeholder="UPC number"
                placeholderTextColor="#8c95a3"
                style={[styles.scanUpcInput, { borderColor: scanTheme.border, backgroundColor: scanTheme.cardBg }]}
              />
              <Pressable
                onPress={() => findPop()}
                disabled={busy}
                style={({ pressed }) => [styles.scanFindButton, { backgroundColor: scanTheme.primaryActionBg }, pressed && styles.pressed, busy && styles.disabled]}
              >
                <Text style={styles.scanFindButtonText}>{busy ? "Finding" : "Find"}</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => (IS_WEB ? setAdvancedPhotoToolsOpen(true) : analyzePopPhotoForUpc("camera"))}
              disabled={busy || photoDraftBusy}
              style={({ pressed }) => [styles.scanUpcAssistButton, pressed && styles.pressed, (busy || photoDraftBusy) && styles.disabled]}
            >
              <Text style={styles.scanUpcAssistText}>{photoDraftBusy ? "Reading UPC..." : "AI UPC Assist"}</Text>
              <Text style={styles.scanUpcAssistSubtext}>
                {IS_WEB ? "Open photo upload tools for AI UPC help" : "Photo-read the barcode or box side, then run UPC lookup"}
              </Text>
            </Pressable>

            <Pressable onPress={onManualAdd} disabled={busy} style={({ pressed }) => [styles.scanLooseButton, pressed && styles.pressed, busy && styles.disabled]}>
              <Text style={styles.scanLooseButtonText}>Add loose or no-box Pop</Text>
            </Pressable>
          </View>

          {renderAdvancedPhotoTools()}

          {lookup && (
            <View style={[styles.scanResultPanel, { borderColor: scanTheme.border, backgroundColor: scanTheme.panelBg }]}>
              <View style={styles.scanResultHeader}>
                <View style={styles.flex}>
                  <Text style={[styles.dashboardEyebrow, { color: scanTheme.accent }]}>Pop found</Text>
                  <Text style={styles.resultName}>{displayPopName(lookup, ownedVariant)}</Text>
                  <Text style={styles.mutedText}>{lookup.upc}</Text>
                </View>
                <View style={[styles.scanValueBadge, { borderColor: scanTheme.border, backgroundColor: scanTheme.cardBg }]}>
                  <Text style={styles.scanValueLabel}>Value</Text>
                  <Text style={styles.scanValueBadgeText}>{money(lookup.estimated_value)}</Text>
                </View>
              </View>
              <View style={styles.scanResultBody}>
                {lookup.image_url ? <Image source={{ uri: lookup.image_url }} style={styles.resultImage} /> : <EmptyDisplayBox style={styles.resultImage} />}
                <View style={styles.flex}>
                  {shelfMetaLine(lookup) ? (
                    <Text style={styles.itemDetailLine} numberOfLines={3}>
                      {shelfMetaLine(lookup)}
                    </Text>
                  ) : null}
                  <LimitedBadge item={lookup} />
                </View>
              </View>
              {hasParserAssist ? (
                <View style={[styles.parserAssistBox, { borderColor: scanTheme.border, backgroundColor: scanTheme.cardBg }]}>
                  <Pressable onPress={() => setParserAssistOpen(!parserAssistOpen)} style={styles.parserAssistHeader}>
                    <View style={styles.flex}>
                      <Text style={styles.parserAssistTitle}>Parser Assist</Text>
                      <Text style={styles.parserAssistCopy}>
                        {parserAssistFields.length
                          ? `${parserAssistFields.length} field${parserAssistFields.length === 1 ? "" : "s"} to review from the AI read.`
                          : "AI read lines up with the catalog row."}
                      </Text>
                    </View>
                    <Text style={[styles.parserAssistBadge, parserAssistFields.length ? styles.parserAssistBadgeWarn : styles.parserAssistBadgeGood]}>
                      {parserAssistFields.length ? "Review" : "Aligned"}
                    </Text>
                  </Pressable>
                  {parserAssistOpen ? (
                    <View style={styles.parserAssistDetail}>
                      {parserAssistFields.length ? (
                        parserAssistFields.map((field) => (
                          <View key={field.label} style={styles.parserAssistRow}>
                            <Text style={styles.parserAssistField}>{field.label}</Text>
                            <View style={styles.flex}>
                              <Text style={styles.parserAssistValue} numberOfLines={2}>Catalog: {field.catalogValue || "--"}</Text>
                              <Text style={styles.parserAssistAiValue} numberOfLines={2}>AI read: {field.aiValue || "--"}</Text>
                            </View>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.parserAssistCopy}>No differences found between the AI draft and this catalog row.</Text>
                      )}
                      {photoDraft?.review_notes.length ? (
                        <Text style={styles.parserAssistNote}>{photoDraft.review_notes.slice(0, 2).join(" ")}</Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              ) : null}
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
    <ScreenFrame title="➕ Add Loose Pop" onBack={onBack}>
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
  const primaryValue = quantity > 1 ? item.total_value : itemValue;

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
        <View style={styles.cardValueHero}>
          <Text style={styles.cardValueLabel}>{quantity > 1 ? "Sort value" : "Value"}</Text>
          <Text style={styles.cardValueAmount} adjustsFontSizeToFit numberOfLines={1}>
            {money(primaryValue)}
          </Text>
        </View>
        {quantity > 1 ? (
          <>
            <Text style={styles.mutedSmall}>Each</Text>
            <Text style={styles.itemMoneySmall} adjustsFontSizeToFit numberOfLines={1}>
              {money(itemValue)}
            </Text>
          </>
        ) : null}
        <Text style={styles.mutedSmall}>Paid</Text>
        <Text style={styles.itemMoneySmall} adjustsFontSizeToFit numberOfLines={1}>
          {money(item.total_cost)}
        </Text>
        <Text style={styles.mutedSmall}>Gain/Loss</Text>
        <Text style={[styles.itemMoneySmall, gainLossColorStyle(item.gain_loss)]} adjustsFontSizeToFit numberOfLines={1}>
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
  const primaryValue = hasMultipleCopies ? item.total_value : itemValue;

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
        <View style={styles.cardValueHero}>
          <Text style={styles.cardValueLabel}>{hasMultipleCopies ? "Sort value" : "Value"}</Text>
          <Text style={styles.cardValueAmount} adjustsFontSizeToFit numberOfLines={1}>
            {money(primaryValue)}
          </Text>
        </View>
        {hasMultipleCopies ? (
          <>
            <Text style={styles.mutedSmall}>Each</Text>
            <Text style={styles.itemMoneySmall} adjustsFontSizeToFit numberOfLines={1}>
              {money(itemValue)}
            </Text>
          </>
        ) : null}
        <Text style={styles.mutedSmall}>Paid</Text>
        <Text style={styles.itemMoneySmall} adjustsFontSizeToFit numberOfLines={1}>
          {money(item.total_cost)}
        </Text>
        <Text style={styles.mutedSmall}>Gain</Text>
        <Text style={[styles.itemMoneySmall, gainLossColorStyle(item.gain_loss)]} adjustsFontSizeToFit numberOfLines={1}>
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
    <ScreenFrame title="🏠 My Shelf" onBack={onBack} rightLabel={statsLabel} onRight={onShelfStats} scroll={false}>
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
              <Text style={styles.centerTitle}>📦 No Pops yet</Text>
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
    <ScreenFrame title="🤝 Shared Shelf" onBack={onBack}>
      <PageIconHero
        icon={PAGE_ICON_SHARED_SHELF_SETUP}
        eyebrow="Shared shelf setup"
        title="Build a shelf together"
        copy="Create a group shelf for your crew or join one with an invite code."
        style={styles.sharedShelfSetupHero}
      />

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>✨ Create a Shared Shelf</Text>
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
        <Text style={styles.sectionTitle}>🎟️ Join with Invite Code</Text>
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

      <Text style={styles.sectionTitle}>🤝 Your Shared Shelves</Text>
      {busy ? <ActivityIndicator color="#7e67f4" /> : null}
      {!busy && shelves.length === 0 ? (
        <View style={styles.panel}>
          <Text style={styles.centerTitle}>🤝 No Shared Shelves yet</Text>
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
                <Image source={PAGE_ICON_SHARED_SHELF} style={styles.sharedShelfHeroIcon} />
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

function TradeSellScreen({
  session,
  onBack,
  onScan,
  onChooseShelf,
  onOpenItem,
}: {
  session: Session;
  onBack: () => void;
  onScan: () => void;
  onChooseShelf: () => void;
  onOpenItem: (item: CollectionItem) => void;
}) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [sales, setSales] = useState<PopSale[]>([]);
  const [filter, setFilter] = useState<TradeSellFilter>("active");
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    setBusy(true);
    const [collectionRows, salesResult] = await Promise.all([
      fetchUserCollectionItems(session.user.id),
      supabase.from("pop_sales").select("*").eq("user_id", session.user.id).order("sold_at", { ascending: false }).limit(100),
    ]);

    setItems(collectionRows.filter((item) => normalizeListingStatus(item.listing_status, item.for_sale, item.for_trade) !== "keeping"));
    setSales(salesResult.error ? [] : ((salesResult.data ?? []) as PopSale[]));
    setBusy(false);

    if (salesResult.error) {
      Alert.alert("Sales history unavailable", salesResult.error.message);
    }
  }, [session.user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const activeItems = items.filter((item) => normalizeListingStatus(item.listing_status, item.for_sale, item.for_trade) !== "keeping");
  const saleItems = activeItems.filter((item) => {
    const status = normalizeListingStatus(item.listing_status, item.for_sale, item.for_trade);
    return status === "for_sale" || status === "sale_or_trade";
  });
  const tradeItems = activeItems.filter((item) => {
    const status = normalizeListingStatus(item.listing_status, item.for_sale, item.for_trade);
    return status === "for_trade" || status === "sale_or_trade";
  });
  const askingValue = saleItems.reduce((sum, item) => sum + Number(item.asking_price ?? item.value_each ?? item.current_value ?? item.estimated_value ?? 0), 0);
  const soldNet = sales.reduce((sum, sale) => sum + saleNet(sale), 0);
  const soldProfit = sales.reduce((sum, sale) => sum + saleProfit(sale), 0);
  const filteredItems = filter === "for_sale" ? saleItems : filter === "for_trade" ? tradeItems : filter === "sold" ? [] : activeItems;
  const marketTheme = collectorModeDashboardTheme("reseller");

  return (
    <ScreenFrame title="💰 Trade & Sell" onBack={onBack} rightLabel="Refresh" onRight={load}>
      {busy ? (
        <ActivityIndicator color="#7e67f4" />
      ) : (
        <>
          <View style={styles.marketHero}>
            <Text style={styles.dashboardEyebrow}>Value tracker</Text>
            <Text style={styles.dashboardModeTitle}>Move Pops with intent</Text>
            <Text style={styles.dashboardSubtext}>Keep sale, trade, and sold history in one place without turning your shelf into a spreadsheet.</Text>
            <View style={styles.marketHeroActions}>
              <Pressable onPress={onChooseShelf} style={styles.marketHeroPrimaryAction}>
                <Text style={styles.marketHeroPrimaryText}>🏠 Choose from My Shelf</Text>
              </Pressable>
              <Pressable onPress={onScan} style={styles.marketHeroSecondaryAction}>
                <Text style={styles.marketHeroSecondaryText}>📷 Scan Pop</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.dashboardStatsGrid}>
            <MetricCard label="Active" value={integer(activeItems.length)} theme={marketTheme} />
            <MetricCard label="Asking" value={money(askingValue)} theme={marketTheme} />
            <MetricCard label="Sold Net" value={money(soldNet)} theme={marketTheme} />
          </View>

          <View style={styles.marketFilterRow}>
            {([
              ["active", "Active"],
              ["for_sale", "For Sale"],
              ["for_trade", "Trades"],
              ["sold", "Sold"],
            ] as const).map(([key, label]) => (
              <Pressable key={key} onPress={() => setFilter(key)} style={[styles.marketFilterChip, filter === key && styles.marketFilterChipActive]}>
                <Text style={[styles.marketFilterText, filter === key && styles.marketFilterTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {filter === "sold" ? (
            <View style={styles.dashboardInsightPanel}>
              <View style={styles.marketPanelHeader}>
                <View>
                  <Text style={styles.dashboardSectionTitle}>🧾 Sales History</Text>
                  <Text style={styles.mutedSmall}>
                    {integer(sales.length)} logged sales, {money(soldProfit)} profit after cost.
                  </Text>
                </View>
              </View>
              {sales.length === 0 ? (
                <Text style={styles.mutedText}>No sales logged yet. Open an item and use Mark Sold to start tracking.</Text>
              ) : (
                sales.map((sale) => <SaleHistoryRow key={sale.id} sale={sale} />)
              )}
            </View>
          ) : (
            <View style={styles.dashboardInsightPanel}>
              <View style={styles.marketPanelHeader}>
                <View>
                  <Text style={styles.dashboardSectionTitle}>💰 Active Market Shelf</Text>
                  <Text style={styles.mutedSmall}>
                    {integer(filteredItems.length)} items showing, {integer(tradeItems.length)} open to trade.
                  </Text>
                </View>
                <Pressable onPress={onChooseShelf} style={styles.marketPanelAction}>
                  <Text style={styles.marketPanelActionText}>Add</Text>
                </Pressable>
              </View>
              {filteredItems.length === 0 ? (
                <View style={styles.marketEmptyState}>
                  <Text style={styles.mutedText}>📦 No Pops match this view yet.</Text>
                  <Text style={styles.mutedSmall}>Choose an existing shelf item or scan a new Pop, then mark that owned copy for sale or trade.</Text>
                  <View style={styles.marketEmptyActions}>
                    <SecondaryButton label="Choose from My Shelf" onPress={onChooseShelf} />
                    <SecondaryButton label="Scan Pop" onPress={onScan} />
                  </View>
                </View>
              ) : (
                filteredItems.map((item) => <MarketItemRow key={item.collection_item_id} item={item} onPress={() => onOpenItem(item)} />)
              )}
            </View>
          )}
        </>
      )}
    </ScreenFrame>
  );
}

function MarketItemRow({ item, onPress }: { item: CollectionItem; onPress: () => void }) {
  const status = normalizeListingStatus(item.listing_status, item.for_sale, item.for_trade);
  const asking = Number(item.asking_price ?? item.value_each ?? item.current_value ?? item.estimated_value ?? 0);
  const minPrice = item.minimum_price == null ? null : Number(item.minimum_price);
  const metaLine = [item.set_name || item.franchise, item.number ? `#${item.number}` : null, item.display_variant || item.variant, item.condition]
    .filter(Boolean)
    .join("  ");

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.marketRow, pressed && styles.pressed]}>
      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.marketRowImage} /> : <EmptyDisplayBox style={styles.marketRowImage} />}
      <View style={styles.flex}>
        <View style={styles.marketRowTop}>
          <Text style={styles.marketStatusBadge}>{listingStatusLabel(status)}</Text>
          {item.listing_platform ? <Text style={styles.marketPlatformBadge}>{item.listing_platform}</Text> : null}
        </View>
        <Text style={styles.statsListTitle} numberOfLines={1}>
          {displayPopName(item)}
        </Text>
        <Text style={styles.mutedSmall} numberOfLines={1}>
          {metaLine}
        </Text>
        {item.trade_notes ? (
          <Text style={styles.marketTradeNotes} numberOfLines={2}>
            {item.trade_notes}
          </Text>
        ) : null}
      </View>
      <View style={styles.alignEnd}>
        <Text style={styles.statsListValue}>{money(asking)}</Text>
        <Text style={styles.mutedSmall}>{minPrice != null ? `min ${money(minPrice)}` : "asking"}</Text>
      </View>
    </Pressable>
  );
}

function SaleHistoryRow({ sale }: { sale: PopSale }) {
  const metaLine = [sale.set_name || sale.franchise, sale.number ? `#${sale.number}` : null, sale.variant, sale.platform].filter(Boolean).join("  ");
  const profit = saleProfit(sale);

  return (
    <View style={styles.marketRow}>
      {sale.image_url ? <Image source={{ uri: sale.image_url }} style={styles.marketRowImage} /> : <EmptyDisplayBox style={styles.marketRowImage} />}
      <View style={styles.flex}>
        <Text style={styles.statsListTitle} numberOfLines={1}>
          {sale.pop_name ?? "Sold Pop"}
        </Text>
        <Text style={styles.mutedSmall} numberOfLines={1}>
          {metaLine}
        </Text>
        <Text style={styles.mutedSmall}>Sold {sale.sold_at ?? "--"}</Text>
      </View>
      <View style={styles.alignEnd}>
        <Text style={styles.statsListValue}>{money(sale.sale_price)}</Text>
        <Text style={[styles.mutedSmall, gainLossColorStyle(profit)]}>{money(profit)}</Text>
      </View>
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
  const [listingStatus, setListingStatus] = useState<ListingStatus>(normalizeListingStatus(item.listing_status, item.for_sale, item.for_trade));
  const [askingPrice, setAskingPrice] = useState(item.asking_price == null ? "" : String(item.asking_price));
  const [minimumPrice, setMinimumPrice] = useState(item.minimum_price == null ? "" : String(item.minimum_price));
  const [listingPlatform, setListingPlatform] = useState(item.listing_platform ?? "");
  const [tradeNotes, setTradeNotes] = useState(item.trade_notes ?? "");
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [soldAt, setSoldAt] = useState(todayDateInput());
  const [salePrice, setSalePrice] = useState(item.asking_price == null ? "" : String(item.asking_price));
  const [salePlatform, setSalePlatform] = useState(item.listing_platform ?? "");
  const [platformFees, setPlatformFees] = useState("");
  const [shippingCharged, setShippingCharged] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [saleNotes, setSaleNotes] = useState("");
  const [limitedCount, setLimitedCount] = useState(item.limited_count == null ? "" : String(item.limited_count));
  const [signed, setSigned] = useState(Boolean(item.signed));
  const [signedBy, setSignedBy] = useState(item.signed_by ?? "");
  const [signatureAuthentication, setSignatureAuthentication] = useState(item.signature_authentication ?? "None");
  const [signatureCertNumber, setSignatureCertNumber] = useState(item.signature_cert_number ?? "");
  const [signatureLocation, setSignatureLocation] = useState(item.signature_location ?? "Box");
  const [signaturePersonalized, setSignaturePersonalized] = useState(Boolean(item.signature_personalized));
  const [signatureNotes, setSignatureNotes] = useState(item.signature_notes ?? "");
  const [setProgress, setSetProgress] = useState<SetProgressSummary | null>(null);
  const [itemHuntFinds, setItemHuntFinds] = useState<ItemHuntFind[]>([]);
  const [busy, setBusy] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueType, setIssueType] = useState<IssueType>("wrong_image");
  const [issueNotes, setIssueNotes] = useState("");
  const [issueBusy, setIssueBusy] = useState(false);
  const baseValue = Number(currentValue || item.current_value || item.estimated_value || 0);
  const signedPremiumPercent = defaultSignedPremiumPercent(signatureAuthentication, signaturePersonalized);
  const appSignedValueEstimate = estimateSignedValueRange(baseValue, signed, signedPremiumPercent);
  const signedValueEstimate =
    signed &&
    item.signed_estimated_value_low != null &&
    item.signed_estimated_value_median != null &&
    item.signed_estimated_value_high != null &&
    Number(currentValue || item.current_value || item.estimated_value || 0) === Number(item.current_value || item.estimated_value || 0) &&
    signatureAuthentication === (item.signature_authentication ?? "None") &&
    signaturePersonalized === Boolean(item.signature_personalized)
      ? {
          low: Number(item.signed_estimated_value_low),
          median: Number(item.signed_estimated_value_median),
          high: Number(item.signed_estimated_value_high),
          premiumPercent: Number(item.signed_value_boost_percent ?? signedPremiumPercent),
        }
      : appSignedValueEstimate;
  const adjustedValueEach = signed ? signedValueEstimate.median : baseValue;
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

  useEffect(() => {
    let cancelled = false;

    const loadItemHuntFinds = async () => {
      try {
        const { data, error } = await supabase
          .from("funko_hunt_finds")
          .select("*,funko_hunts(title,hunt_month,status),funko_hunt_stops(name,detail,tag)")
          .eq("collection_item_id", item.collection_item_id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (cancelled) return;
        setItemHuntFinds(error ? [] : ((data ?? []) as ItemHuntFind[]));
      } catch {
        if (!cancelled) setItemHuntFinds([]);
      }
    };

    loadItemHuntFinds();

    return () => {
      cancelled = true;
    };
  }, [item.collection_item_id]);

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
    const cleanListingFlags = listingFlags(listingStatus);
    const cleanSignedPremium = signed ? signedPremiumPercent : null;
    const cleanSignedEstimate = signed ? appSignedValueEstimate : null;

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
        listing_status: listingStatus,
        for_sale: cleanListingFlags.for_sale,
        for_trade: cleanListingFlags.for_trade,
        asking_price: parseMoneyInput(askingPrice),
        minimum_price: parseMoneyInput(minimumPrice),
        listing_platform: listingPlatform.trim() ? listingPlatform.trim() : null,
        listed_at: listingStatus === "keeping" ? null : item.listed_at ?? todayDateInput(),
        trade_notes: tradeNotes.trim() ? tradeNotes.trim() : null,
        signed,
        signed_by: signed && signedBy.trim() ? signedBy.trim() : null,
        signature_authentication: signed ? cleanSignatureAuthentication : null,
        signature_cert_number: signed && signatureCertNumber.trim() ? signatureCertNumber.trim() : null,
        signature_location: signed ? cleanSignatureLocation : null,
        signature_personalized: signed ? signaturePersonalized : false,
        signature_notes: signed && signatureNotes.trim() ? signatureNotes.trim() : null,
        signed_value_boost_percent: cleanSignedPremium,
        signed_estimated_value_low: cleanSignedEstimate?.low ?? null,
        signed_estimated_value_median: cleanSignedEstimate?.median ?? null,
        signed_estimated_value_high: cleanSignedEstimate?.high ?? null,
        signed_value_confidence: signed ? signedValueConfidence(signatureAuthentication, signaturePersonalized) : null,
        signed_value_source: signed ? "app_estimate" : null,
        signed_value_last_checked: signed ? new Date().toISOString() : null,
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

  const logSaleAndRemove = async () => {
    const parsedSalePrice = parseMoneyInput(salePrice);
    if (parsedSalePrice == null) {
      Alert.alert("Sale price needed", "Add the sold price before logging this sale.");
      return;
    }

    const currentQuantity = Math.max(Number(quantity) || 1, 1);
    const runSale = async () => {
      setBusy(true);
      const { error: saleError } = await supabase.from("pop_sales").insert({
        user_id: item.user_id,
        collection_item_id: item.collection_item_id,
        pop_catalog_id: item.pop_catalog_id,
        sold_at: soldAt.trim() || todayDateInput(),
        sale_price: parsedSalePrice,
        platform: salePlatform.trim() ? salePlatform.trim() : null,
        platform_fees: parseMoneyInput(platformFees) ?? 0,
        shipping_charged: parseMoneyInput(shippingCharged) ?? 0,
        shipping_cost: parseMoneyInput(shippingCost) ?? 0,
        purchase_price: parseMoneyInput(purchasePrice) ?? item.purchase_price ?? null,
        estimated_value_at_sale: adjustedValueEach || item.current_value || item.estimated_value || null,
        pop_name: displayPopName(item, ownedVariant),
        franchise: item.franchise,
        set_name: item.set_name,
        number: item.number,
        variant: ownedVariant || item.display_variant || item.variant,
        image_url: item.image_url,
        notes: saleNotes.trim() ? saleNotes.trim() : null,
      });

      if (saleError) {
        setBusy(false);
        Alert.alert("Sale not logged", saleError.message);
        return;
      }

      const result =
        currentQuantity > 1
          ? await supabase
              .from("user_collection_items")
              .update({
                quantity: currentQuantity - 1,
                listing_status: "keeping",
                for_sale: false,
                for_trade: false,
              })
              .eq("id", item.collection_item_id)
          : await supabase.from("user_collection_items").delete().eq("id", item.collection_item_id);

      setBusy(false);

      if (result.error) {
        Alert.alert("Sale logged", "The sale was saved, but the shelf item could not be removed automatically.");
        return;
      }

      setSaleModalOpen(false);
      if (currentQuantity > 1) {
        setQuantity(String(currentQuantity - 1));
        setListingStatus("keeping");
        await reload();
      } else {
        onSaved();
      }
    };

    if (IS_WEB && typeof window !== "undefined") {
      if (window.confirm(`Log sale for ${money(parsedSalePrice)}?\n\nThis will ${currentQuantity > 1 ? "reduce quantity by 1" : "remove the Pop from your active shelf"}.`)) {
        await runSale();
      }
      return;
    }

    Alert.alert("Log sale?", `This will ${currentQuantity > 1 ? "reduce quantity by 1" : "remove the Pop from your active shelf"}.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Log Sale", onPress: runSale },
    ]);
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
    <ScreenFrame title="🧾 Item Details" onBack={onBack}>
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
      <Modal visible={saleModalOpen} transparent animationType="slide" onRequestClose={() => setSaleModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.optionSheet}>
            <Text style={styles.optionTitle}>Log Sale</Text>
            <Text style={styles.mutedSmall}>{displayPopName(item, ownedVariant)}</Text>
            <View style={styles.detailTwoColumn}>
              <View style={styles.flex}>
                <Label>Sold price ($)</Label>
                <TextInput value={salePrice} onChangeText={setSalePrice} keyboardType="decimal-pad" style={styles.input} />
              </View>
              <View style={styles.flex}>
                <Label>Sold date</Label>
                <TextInput value={soldAt} onChangeText={setSoldAt} placeholder="YYYY-MM-DD" placeholderTextColor="#8c95a3" style={styles.input} />
              </View>
            </View>
            <Label>Platform</Label>
            <TextInput value={salePlatform} onChangeText={setSalePlatform} placeholder="eBay, Whatnot, local..." placeholderTextColor="#8c95a3" style={styles.input} />
            <View style={styles.detailTwoColumn}>
              <View style={styles.flex}>
                <Label>Fees ($)</Label>
                <TextInput value={platformFees} onChangeText={setPlatformFees} keyboardType="decimal-pad" style={styles.input} />
              </View>
              <View style={styles.flex}>
                <Label>Ship cost ($)</Label>
                <TextInput value={shippingCost} onChangeText={setShippingCost} keyboardType="decimal-pad" style={styles.input} />
              </View>
            </View>
            <Label>Shipping charged ($)</Label>
            <TextInput value={shippingCharged} onChangeText={setShippingCharged} keyboardType="decimal-pad" style={styles.input} />
            <Label>Sale notes</Label>
            <TextInput value={saleNotes} onChangeText={setSaleNotes} multiline placeholder="Buyer, order note, bundle detail..." placeholderTextColor="#8c95a3" style={[styles.input, styles.notes]} />
            <View style={styles.marketSalePreview}>
              <Text style={styles.dashboardInsightLabel}>Estimated Net</Text>
              <Text style={styles.detailValueText}>
                {money(
                  Number(parseMoneyInput(salePrice) ?? 0) -
                    Number(parseMoneyInput(platformFees) ?? 0) +
                    Number(parseMoneyInput(shippingCharged) ?? 0) -
                    Number(parseMoneyInput(shippingCost) ?? 0),
                )}
              </Text>
            </View>
            <PrimaryButton label={busy ? "Logging..." : "Log Sale"} onPress={logSaleAndRemove} disabled={busy} />
            <Pressable onPress={() => setSaleModalOpen(false)} disabled={busy} style={styles.linkButton}>
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
            <Text style={styles.dashboardInsightLabel}>{signed ? "Median Value" : "Value"}</Text>
            <Text style={styles.detailValueText}>{money(signed ? previewTotalValue : item.total_value ?? item.current_value ?? item.estimated_value)}</Text>
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

      {itemHuntFinds.length > 0 ? (
        <View style={styles.detailSection}>
          <View>
            <Text style={styles.dashboardSectionTitle}>🎯 Found on a Pop Hunt</Text>
            <Text style={styles.mutedSmall}>Trip history saved when this Pop was added from a route stop.</Text>
          </View>
          {itemHuntFinds.map((find) => {
            const stop = find.funko_hunt_stops;
            const trip = find.funko_hunts;
            return (
              <View key={find.id} style={styles.detailHuntFindCard}>
                <View style={styles.detailHuntFindTop}>
                  <View style={styles.flex}>
                    <Text style={styles.detailHuntFindStop}>{stop?.name || "Pop Hunt stop"}</Text>
                    <Text style={styles.detailHuntFindTrip}>
                      {trip?.title || "Pop Hunt"} - {displayHuntFoundDate(find.created_at)}
                    </Text>
                  </View>
                  <View style={styles.huntFindOutcomeBadge}>
                    <Text style={styles.huntFindOutcomeText}>{compactName(find.outcome)}</Text>
                  </View>
                </View>
                {stop?.detail ? <Text style={styles.detailHuntFindDetail}>{stop.detail}</Text> : null}
                {find.note ? <Text style={styles.detailHuntFindNote}>{find.note}</Text> : null}
                {find.is_best_find ? <Text style={styles.detailHuntFindBest}>Best find from this trip</Text> : null}
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={styles.detailSection}>
        <View>
          <Text style={styles.dashboardSectionTitle}>🏠 Shelf Details</Text>
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
            <Text style={styles.dashboardSectionTitle}>✍️ Signed</Text>
            <Text style={styles.mutedSmall}>Track signature facts and let Shelf-n-Pop estimate the signed market range.</Text>
          </View>
          <Switch value={signed} onValueChange={setSigned} trackColor={{ true: "#7bd1c3", false: "#283039" }} thumbColor={signed ? "#7e67f4" : "#11161d"} />
        </View>
        {signed ? (
          <View style={styles.signaturePanel}>
            <Label>Signed by</Label>
            <TextInput value={signedBy} onChangeText={setSignedBy} placeholder="Actor, artist, or signer" placeholderTextColor="#8c95a3" style={styles.input} />
            <View style={styles.detailTwoColumn}>
              <View style={styles.flex}>
                <Label>Authentication</Label>
                <SignatureAuthenticationPicker value={signatureAuthentication} onChange={setSignatureAuthentication} />
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
                <Text style={styles.mutedSmall}>Personalized signatures usually have a narrower resale audience.</Text>
              </View>
              <Switch
                value={signaturePersonalized}
                onValueChange={setSignaturePersonalized}
                trackColor={{ true: "#7bd1c3", false: "#283039" }}
                thumbColor={signaturePersonalized ? "#7e67f4" : "#11161d"}
              />
            </View>
            <View style={styles.signatureValuePreview}>
              <Text style={styles.dashboardInsightLabel}>Most Realistic Value</Text>
              <Text style={styles.detailValueText}>{money(signedValueEstimate.median)}</Text>
              <Text style={styles.mutedSmall}>
                Range: {money(signedValueEstimate.low)} - {money(signedValueEstimate.high)} each
              </Text>
              <Text style={styles.mutedSmall}>Confidence: {signedValueConfidence(signatureAuthentication, signaturePersonalized)}</Text>
            </View>
            <Label>Signature notes</Label>
            <TextInput value={signatureNotes} onChangeText={setSignatureNotes} multiline placeholder="Ink color, quote, placement, event..." placeholderTextColor="#8c95a3" style={[styles.input, styles.notes]} />
          </View>
        ) : null}
      </View>

      <View style={styles.detailSection}>
        <View>
          <Text style={styles.dashboardSectionTitle}>💰 Trade & Sell</Text>
          <Text style={styles.mutedSmall}>Mark this copy for your market shelf and keep private sale notes close by.</Text>
        </View>
        <Label>Status</Label>
        <ChoicePicker
          title="Market status"
          value={listingStatusLabel(listingStatus)}
          options={LISTING_STATUS_OPTIONS}
          onChange={(value) => setListingStatus(listingStatusFromLabel(value))}
        />
        {listingStatus !== "keeping" ? (
          <>
            <View style={styles.detailTwoColumn}>
              <View style={styles.flex}>
                <Label>Asking price ($)</Label>
                <TextInput value={askingPrice} onChangeText={setAskingPrice} keyboardType="decimal-pad" style={styles.input} />
              </View>
              <View style={styles.flex}>
                <Label>Minimum price ($)</Label>
                <TextInput value={minimumPrice} onChangeText={setMinimumPrice} keyboardType="decimal-pad" style={styles.input} />
              </View>
            </View>
            <Label>Platform</Label>
            <TextInput value={listingPlatform} onChangeText={setListingPlatform} placeholder="eBay, Whatnot, local..." placeholderTextColor="#8c95a3" style={styles.input} />
            <Label>Trade / listing notes</Label>
            <TextInput
              value={tradeNotes}
              onChangeText={setTradeNotes}
              multiline
              placeholder="Wanted trades, bundle notes, shipping limits..."
              placeholderTextColor="#8c95a3"
              style={[styles.input, styles.notes]}
            />
          </>
        ) : null}
      </View>

      <View style={styles.detailSection}>
        <View>
          <Text style={styles.dashboardSectionTitle}>📈 Value Tools</Text>
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
            Signed estimate: {money(signedValueEstimate.low)} - {money(signedValueEstimate.high)} each, with {money(signedValueEstimate.median)} as the most realistic value.
          </Text>
        ) : null}
        <PrimaryButton label="Refresh Value" onPress={refreshValue} disabled={busy} />
      </View>

      <View style={styles.detailSection}>
        <Text style={styles.dashboardSectionTitle}>📝 Notes</Text>
        <TextInput value={notes} onChangeText={setNotes} multiline style={[styles.input, styles.notes]} />
      </View>

      <PrimaryButton label={busy ? "Saving..." : "Save Changes"} onPress={save} disabled={busy} />
      <View style={styles.detailDangerSection}>
        <Text style={styles.dashboardSectionTitle}>🧰 Shelf Actions</Text>
        <Text style={styles.mutedSmall}>Use these when this Pop leaves your active shelf.</Text>
        <SecondaryButton label="Report Item Issue" onPress={() => setIssueModalOpen(true)} disabled={busy || issueBusy} />
        <SecondaryButton label="Mark Sold" onPress={() => setSaleModalOpen(true)} disabled={busy} />
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
    <ScreenFrame title="⚙️ Profile & Settings" onBack={onBack}>
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
            <Text style={styles.accountInfoValue}>✅ Profile synced</Text>
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
    <ScreenFrame title="👤 Collector Profile" onBack={onBack}>
      {busy ? <ActivityIndicator color="#7e67f4" /> : null}

      {!busy && !profile ? (
        <View style={styles.panel}>
          <Text style={styles.centerTitle}>🔒 Profile is private</Text>
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
                <Text style={styles.centerTitle}>⭐ No wishlist items yet</Text>
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

function MetricCard({
  label,
  value,
  onPress,
  active,
  theme,
  compact,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  active?: boolean;
  theme?: DashboardTheme;
  compact?: boolean;
}) {
  const cardStyle = theme ? { borderColor: theme.border, backgroundColor: theme.cardBg } : null;
  const baseStyle = compact ? styles.metricCardCompact : styles.metricCard;
  const content = (
    <>
      <Text style={[styles.cardLabel, compact && styles.cardLabelCompact, theme ? { color: theme.accentText } : null]} adjustsFontSizeToFit numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.metricValue, compact && styles.metricValueCompact]} adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </Text>
    </>
  );

  if (!onPress) {
    return <View style={[baseStyle, cardStyle, active && styles.metricCardActive]}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [baseStyle, cardStyle, styles.metricCardPressable, active && styles.metricCardActive, pressed && styles.pressed]}
    >
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

function SetRecommendationRow({ recommendation }: { recommendation: SetRecommendation }) {
  const row = recommendation.row;
  const metaLine = [recommendation.setName, row.number ? `#${row.number}` : null, isMeaningfulVariant(row.variant) ? row.variant : null, row.exclusivity]
    .filter(Boolean)
    .join("  ");
  const hasEstimatedValue = Number(recommendation.estimatedValue ?? 0) > 0;

  return (
    <View style={styles.statsListRow}>
      <View style={styles.statsRankBadge}>
        <Text style={styles.statsRankText}>+</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.dashboardInsightLabel} numberOfLines={1}>
          {recommendation.setName}
        </Text>
        <Text style={styles.statsListTitle} numberOfLines={1}>
          {checklistRowName(row)}
        </Text>
        <Text style={styles.mutedSmall} numberOfLines={1}>
          {metaLine || recommendation.completionLine || "Reviewed checklist item"}
        </Text>
      </View>
      <View style={styles.alignEnd}>
        <Text style={styles.checklistMissingBadge}>Missing</Text>
        <Text style={hasEstimatedValue ? styles.recommendationValue : styles.mutedSmall} numberOfLines={1}>
          {hasEstimatedValue ? money(recommendation.estimatedValue) : "Value TBD"}
        </Text>
        {recommendation.completionLine ? (
          <Text style={styles.mutedSmall} numberOfLines={1}>
            {recommendation.completionLine.replace(" owned - ", "/")}
          </Text>
        ) : null}
      </View>
    </View>
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
        <Pressable style={[styles.modalBackdrop, styles.pickerBackdrop]} onPress={() => setOpen(false)}>
          <Pressable style={[styles.optionSheet, styles.pickerOptionSheet]} onPress={(event) => event.stopPropagation()}>
            <Text style={[styles.optionTitle, styles.pickerOptionTitle]}>{title}</Text>
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
    minHeight: 62,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#765df0",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.14)",
  },
  appTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(16, 19, 24, 0.14)",
    marginRight: 8,
  },
  headerLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    marginRight: 8,
  },
  backText: {
    color: "#e8fff9",
    fontSize: 28,
    lineHeight: 30,
  },
  rightAction: {
    minWidth: 96,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    backgroundColor: "rgba(16, 19, 24, 0.22)",
  },
  rightActionText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
    lineHeight: 15,
  },
  rightActionPlaceholder: {
    minWidth: 96,
    minHeight: 38,
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
    backgroundColor: "#0f141b",
  },
  authScroll: {
    flexGrow: 1,
    justifyContent: "center",
    gap: 18,
    padding: 22,
    paddingVertical: 34,
  },
  brandBlock: {
    alignItems: "center",
    gap: 10,
  },
  authLogoShell: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#263a52",
    backgroundColor: "#101a27",
  },
  authLogo: {
    width: 88,
    height: 88,
    borderRadius: 18,
  },
  logoMark: {
    color: "#fff",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
  },
  authTagline: {
    maxWidth: 310,
    color: "#c6d0dd",
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },
  authFeatureRow: {
    flexDirection: "row",
    gap: 8,
  },
  authFeatureTile: {
    flex: 1,
    minHeight: 76,
    justifyContent: "center",
    gap: 4,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#243856",
    backgroundColor: "#121923",
  },
  authFeatureTitle: {
    color: "#9fb6f4",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  authFeatureCopy: {
    color: "#eef4ff",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  authPanel: {
    gap: 13,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#5e78b8",
    backgroundColor: "#15191f",
  },
  authPanelHeader: {
    gap: 4,
  },
  authEyebrow: {
    color: "#9fc7f4",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  authPanelTitle: {
    color: "#fff",
    fontSize: 21,
    lineHeight: 25,
    fontWeight: "900",
  },
  authModeSwitch: {
    minHeight: 44,
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#10151c",
  },
  authModeOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  authModeOptionActive: {
    backgroundColor: "#9fb6f4",
  },
  authModeText: {
    color: "#b8c0cc",
    fontSize: 13,
    fontWeight: "900",
  },
  authModeTextActive: {
    color: "#111827",
  },
  authFieldGroup: {
    gap: 6,
  },
  authInput: {
    borderColor: "#324459",
    backgroundColor: "#10151c",
  },
  authVersionText: {
    color: "#7d8795",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
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
    gap: 11,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#151a1f",
    borderWidth: 1,
    borderColor: "#26313d",
  },
  dashboardHomeBase: {
    gap: 14,
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#151a1f",
    borderWidth: 1,
    borderColor: "#26313d",
  },
  dashboardHomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
  dashboardLogoShellCompact: {
    width: 46,
    height: 46,
    borderRadius: 12,
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
    gap: 8,
    padding: 12,
    borderRadius: 12,
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
    fontSize: 17,
    lineHeight: 21,
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
  dashboardModeMiniButton: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  dashboardModeMiniButtonText: {
    fontSize: 12,
    fontWeight: "900",
  },
  dashboardModeFocusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dashboardModeFocusPill: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: 9,
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
    fontSize: 36,
    lineHeight: 41,
    fontWeight: "900",
    flex: 1,
    minWidth: 0,
  },
  dashboardHomeValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dashboardHomeValueSide: {
    minWidth: 92,
    paddingHorizontal: 10,
    paddingVertical: 9,
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
  dashboardHomeFocus: {
    gap: 9,
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
  },
  dashboardHomeFocusBody: {
    color: "#b8c0cc",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  dashboardCompactStatsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  dashboardNextMoveCard: {
    minHeight: 84,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#151a1f",
  },
  dashboardNextMoveTitle: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  dashboardNextMoveBody: {
    color: "#b8c0cc",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  dashboardNextMoveAction: {
    maxWidth: 104,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
    textAlign: "right",
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
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#151a1f",
    borderWidth: 1,
    borderColor: "#26313d",
  },
  dashboardSectionTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
  marketHero: {
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5b4725",
    backgroundColor: "#171611",
  },
  marketHeroActions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    paddingTop: 4,
  },
  marketHeroPrimaryAction: {
    flex: 1,
    minWidth: 160,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 232, 173, 0.36)",
    backgroundColor: "#d4a953",
  },
  marketHeroPrimaryText: {
    color: "#14110a",
    fontSize: 13,
    fontWeight: "900",
  },
  marketHeroSecondaryAction: {
    minWidth: 104,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#5b4725",
    backgroundColor: "#211c14",
  },
  marketHeroSecondaryText: {
    color: "#ffe8ad",
    fontSize: 13,
    fontWeight: "900",
  },
  marketFilterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  marketFilterChip: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#35383d",
    backgroundColor: "#121820",
  },
  marketFilterChipActive: {
    borderColor: "#d4a953",
    backgroundColor: "#2a2315",
  },
  marketFilterText: {
    color: "#b8c0cc",
    fontSize: 12,
    fontWeight: "900",
  },
  marketFilterTextActive: {
    color: "#ffe8ad",
  },
  marketPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  marketPanelAction: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#d4a953",
  },
  marketPanelActionText: {
    color: "#14110a",
    fontSize: 12,
    fontWeight: "900",
  },
  marketEmptyState: {
    gap: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#101318",
  },
  marketEmptyActions: {
    gap: 8,
  },
  marketRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#101318",
  },
  marketRowImage: {
    width: 54,
    height: 64,
    borderRadius: 8,
  },
  marketRowTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  marketStatusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    color: "#14110a",
    backgroundColor: "#d4a953",
    fontSize: 10,
    fontWeight: "900",
  },
  marketPlatformBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    color: "#f5e7b1",
    backgroundColor: "#3a321d",
    fontSize: 10,
    fontWeight: "900",
  },
  marketTradeNotes: {
    color: "#d8e4dc",
    fontSize: 12,
    lineHeight: 16,
  },
  marketSalePreview: {
    gap: 3,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#5b4725",
    backgroundColor: "#1d1912",
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
  statsGuidePanel: {
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#151a1f",
  },
  statsGuideHero: {
    minHeight: 112,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  statsPriorityPanel: {
    borderWidth: 1,
  },
  statsSectionCopy: {
    color: "#b8c0cc",
    fontSize: 12,
    lineHeight: 16,
    marginTop: -2,
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
  statsPrimaryAction: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#9bd8cb",
  },
  statsBreakdownButtonText: {
    color: "#071014",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  scanHero: {
    gap: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  scanHeroTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
  },
  scanEntryPanel: {
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  scanCameraButton: {
    minHeight: 76,
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  scanCameraButtonText: {
    color: "#071014",
    fontSize: 20,
    fontWeight: "900",
  },
  scanCameraButtonSub: {
    color: "#1f2117",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
  scanDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scanDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2d3440",
  },
  scanDividerText: {
    color: "#aeb7c4",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  scanUpcRow: {
    flexDirection: "row",
    gap: 10,
  },
  scanUpcInput: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  scanFindButton: {
    width: 88,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  scanFindButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  scanUpcAssistButton: {
    minHeight: 54,
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3a527d",
    backgroundColor: "#17243a",
  },
  scanUpcAssistText: {
    color: "#e9f1ff",
    fontSize: 14,
    fontWeight: "900",
  },
  scanUpcAssistSubtext: {
    color: "#b8c6dc",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  scanLooseButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#514225",
    backgroundColor: "#252218",
  },
  scanLooseButtonText: {
    color: "#fff2c2",
    fontSize: 14,
    fontWeight: "900",
  },
  scanResultPanel: {
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  scanResultHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  scanValueBadge: {
    minWidth: 82,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  scanValueLabel: {
    color: "#aeb7c4",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  scanValueBadgeText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },
  scanResultBody: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  parserAssistBox: {
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  parserAssistHeader: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  parserAssistTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  parserAssistCopy: {
    color: "#b8c2cf",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    marginTop: 2,
  },
  parserAssistBadge: {
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "900",
  },
  parserAssistBadgeGood: {
    color: "#d8fff7",
    backgroundColor: "#142825",
  },
  parserAssistBadgeWarn: {
    color: "#fff1cf",
    backgroundColor: "#282316",
  },
  parserAssistDetail: {
    gap: 8,
  },
  parserAssistRow: {
    flexDirection: "row",
    gap: 10,
    padding: 9,
    borderRadius: 10,
    backgroundColor: "#0f131a",
  },
  parserAssistField: {
    width: 78,
    color: "#9bd8cb",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  parserAssistValue: {
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  parserAssistAiValue: {
    color: "#b8c2cf",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    marginTop: 2,
  },
  parserAssistNote: {
    color: "#d8d1c1",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  scanPhotoDraftPanel: {
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  scanAdvancedHeader: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scanAdvancedTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  scanAdvancedChevron: {
    overflow: "hidden",
    minWidth: 52,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    color: "#e9f1ff",
    backgroundColor: "#17243a",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  scanPhotoDraftHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  scanPhotoDraftTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
  },
  scanPhotoDraftCopy: {
    color: "#cbd3df",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  scanPhotoDraftActions: {
    flexDirection: "row",
    gap: 10,
  },
  scanPhotoDraftButton: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  scanPhotoDraftSecondaryButton: {
    borderWidth: 1,
  },
  scanPhotoDraftButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  scanPhotoDraftSecondaryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  scanOcrButton: {
    borderWidth: 1,
    borderColor: "#3d716b",
    backgroundColor: "#142825",
  },
  scanOcrSecondaryButton: {
    borderWidth: 1,
    borderColor: "#3a527d",
    backgroundColor: "#17243a",
  },
  scanOcrButtonText: {
    color: "#e9f7ff",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  scanPhotoStatusCard: {
    gap: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5a4a29",
    backgroundColor: "#282316",
  },
  scanPhotoStatusTitle: {
    color: "#fff1cf",
    fontSize: 13,
    fontWeight: "900",
  },
  scanPhotoStatusCopy: {
    color: "#d8d1c1",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  scanPhotoDraftResult: {
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  scanPhotoDraftResultTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scanPhotoDraftImage: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: "#070a0f",
  },
  scanPhotoDraftResultTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },
  scanPhotoDraftConfidence: {
    color: "#aeb7c4",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
  },
  scanPhotoDraftGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  scanPhotoDraftField: {
    width: "48%",
    minHeight: 54,
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#0f131a",
  },
  scanPhotoDraftFieldLabel: {
    color: "#9bd8cb",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  scanPhotoDraftFieldValue: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 3,
  },
  scanPhotoDraftNotes: {
    color: "#cbd3df",
    fontSize: 12,
    lineHeight: 17,
  },
  scanOcrTextBox: {
    gap: 5,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#0f131a",
  },
  scanOcrText: {
    color: "#d8dee8",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  scanPhotoDraftUseButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  scanPhotoDraftUseText: {
    color: "#071014",
    fontSize: 14,
    fontWeight: "900",
  },
  scanPhotoMatchSection: {
    gap: 8,
    paddingTop: 2,
  },
  scanPhotoMatchHeader: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  scanPhotoMatchTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  scanPhotoMatchMessage: {
    color: "#aeb7c4",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  scanPhotoMatchRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 9,
    borderRadius: 10,
    backgroundColor: "#0f131a",
  },
  scanPhotoMatchImage: {
    width: 42,
    height: 54,
    borderRadius: 7,
    backgroundColor: "#070a0f",
  },
  scanPhotoMatchName: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  scanPhotoMatchMeta: {
    color: "#aeb7c4",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    marginTop: 2,
  },
  scanPhotoMatchValue: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  scanPhotoMatchAddButton: {
    minWidth: 58,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    marginTop: 5,
    borderRadius: 10,
    backgroundColor: "#9bd8cb",
  },
  scanPhotoMatchAddText: {
    color: "#071014",
    fontSize: 12,
    fontWeight: "900",
  },
  scanPhotoMatchUse: {
    color: "#9bd8cb",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
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
  setStatusBadge: {
    alignSelf: "flex-start",
    minHeight: 22,
    justifyContent: "center",
    marginTop: 6,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  setStatusBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  setReviewNote: {
    color: "#c8cfdb",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  recommendationValue: {
    color: "#d8fff7",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "900",
    textAlign: "right",
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
    gap: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#151a1f",
    borderWidth: 1,
    borderColor: "#26313d",
  },
  dashboardActionGroup: {
    gap: 9,
  },
  dashboardActionGroupLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  dashboardActionGrid: {
    flexDirection: "row",
    gap: 10,
  },
  dashboardPrimaryAction: {
    flex: 1,
    minHeight: 108,
    justifyContent: "center",
    gap: 7,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    backgroundColor: "#7e67f4",
  },
  dashboardStatsQuickAction: {
    flex: 1,
    minHeight: 108,
    justifyContent: "center",
    gap: 7,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#7bd1c3",
    backgroundColor: "#1b2f31",
  },
  dashboardIconLabelRow: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    maxWidth: "100%",
  },
  dashboardIconLabelText: {
    width: "100%",
    flexShrink: 1,
    textAlign: "center",
  },
  dashboardActionIcon: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    backgroundColor: "#0f1520",
  },
  dashboardActionLabel: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
  },
  dashboardActionSub: {
    color: "#d8dde7",
    fontSize: 11,
    fontWeight: "800",
  },
  dashboardBottomActions: {
    flexDirection: "row",
    gap: 10,
  },
  dashboardShelfButton: {
    flex: 1,
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  dashboardShelfButtonLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  dashboardShelfButtonDescription: {
    color: "#d8dde7",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  dashboardSectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  dashboardSectionIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    backgroundColor: "#10151c",
  },
  pageIconHero: {
    minHeight: 128,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  pageIconHeroImage: {
    width: 86,
    height: 86,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    backgroundColor: "#10151c",
  },
  pageIconHeroEyebrow: {
    color: "#9bd8cb",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  pageIconHeroTitle: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
  },
  pageIconHeroCopy: {
    color: "#d8dde7",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  dashboardWideActionButton: {
    minHeight: 88,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  dashboardWidePrimaryAction: {
    minHeight: 96,
  },
  dashboardAccountActionButton: {
    minHeight: 76,
  },
  dashboardAdminLink: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#10151c",
  },
  huntHero: {
    gap: 10,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#3a527d",
    backgroundColor: "#121a26",
  },
  huntEyebrow: {
    color: "#9fbaff",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  huntHeroTitle: {
    color: "#fff",
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "900",
  },
  huntHeroCopy: {
    color: "#d5dce8",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  huntHeroMetaRow: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 4,
  },
  huntHeroMetaTile: {
    flex: 1,
    gap: 3,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#0f1520",
  },
  huntMetaLabel: {
    color: "#9fbaff",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  huntMetaValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  huntActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  huntPrimaryAction: {
    flex: 1,
    minHeight: 66,
    justifyContent: "center",
    gap: 4,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    backgroundColor: "#6f63e8",
  },
  huntSecondaryAction: {
    flex: 1,
    minHeight: 66,
    justifyContent: "center",
    gap: 4,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3d716b",
    backgroundColor: "#142825",
  },
  huntPrimaryActionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  huntSecondaryActionText: {
    color: "#d8fff7",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  huntMapAction: {
    flex: 1,
    minHeight: 50,
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3a527d",
    backgroundColor: "#17243a",
  },
  huntMapActionApple: {
    borderColor: "#3d716b",
    backgroundColor: "#142825",
  },
  huntMapActionText: {
    color: "#e9f1ff",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  huntActionSubtext: {
    color: "#d8dde7",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  huntShelfPicker: {
    gap: 8,
    paddingVertical: 2,
  },
  huntShelfChip: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2e3a4b",
    backgroundColor: "#10151c",
  },
  huntShelfChipActive: {
    borderColor: "#8fb8ff",
    backgroundColor: "#17243a",
  },
  huntShelfChipText: {
    color: "#c8cfdb",
    fontSize: 12,
    fontWeight: "900",
  },
  huntShelfChipTextActive: {
    color: "#e9f1ff",
  },
  huntSettingsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  huntSettingsInput: {
    minHeight: 44,
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2e3a4b",
    backgroundColor: "#10151c",
  },
  huntGoalsDraftInput: {
    minHeight: 92,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  huntSaveButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#8fb8ff",
  },
  huntSaveButtonText: {
    color: "#101318",
    fontSize: 14,
    fontWeight: "900",
  },
  huntDangerZone: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#49313a",
    backgroundColor: "#1b1419",
  },
  huntDangerTitle: {
    color: "#ffd5dc",
    fontSize: 13,
    fontWeight: "900",
  },
  huntDangerCopy: {
    color: "#c9aeb5",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  huntDangerButton: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#7b4f5b",
    backgroundColor: "#25191d",
  },
  huntDangerButtonText: {
    color: "#ffc6d2",
    fontSize: 11,
    fontWeight: "900",
  },
  huntCompleteButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#5a4a29",
    backgroundColor: "#d8b46a",
  },
  huntCompleteButtonText: {
    color: "#14110a",
    fontSize: 13,
    fontWeight: "900",
  },
  huntPanel: {
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2e3a4b",
    backgroundColor: "#15191f",
  },
  huntProgressPanel: {
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3a527d",
    backgroundColor: "#121a26",
  },
  huntProgressGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  huntProgressTile: {
    width: "48%",
    minHeight: 70,
    justifyContent: "center",
    gap: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#253854",
    backgroundColor: "#0f1520",
  },
  huntProgressValue: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
  },
  huntProgressLabel: {
    color: "#9fbaff",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  huntBestFindCard: {
    gap: 3,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5a4a29",
    backgroundColor: "#282316",
  },
  huntBestFindEyebrow: {
    color: "#fff1cf",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  huntBestFindTitle: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  huntBestFindMeta: {
    color: "#d8cfb9",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  huntPanelTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  huntStatusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3f7d73",
    backgroundColor: "#142825",
  },
  huntStatusText: {
    color: "#d8fff7",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  huntStatusPicker: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  huntCurrentTabs: {
    flexDirection: "row",
    gap: 6,
    padding: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#253854",
    backgroundColor: "#0f1520",
  },
  huntCurrentTab: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  huntCurrentTabActive: {
    borderColor: "#8fb8ff",
    backgroundColor: "#8fb8ff",
  },
  huntCurrentTabText: {
    color: "#c8cfdb",
    fontSize: 12,
    fontWeight: "900",
  },
  huntCurrentTabTextActive: {
    color: "#101318",
  },
  huntCurrentTabDetail: {
    color: "#8d96a3",
    fontSize: 10,
    fontWeight: "800",
  },
  huntCurrentTabDetailActive: {
    color: "#172238",
  },
  huntStatusChip: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2e3a4b",
    backgroundColor: "#10151c",
  },
  huntStatusChipActive: {
    borderColor: "#8fb8ff",
    backgroundColor: "#17243a",
  },
  huntStatusChipText: {
    color: "#c8cfdb",
    fontSize: 12,
    fontWeight: "900",
  },
  huntStatusChipTextActive: {
    color: "#e9f1ff",
  },
  huntLandingGrid: {
    gap: 12,
  },
  huntLandingCard: {
    minHeight: 122,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2e3a4b",
    backgroundColor: "#15191f",
  },
  huntLandingCardPrimary: {
    borderColor: "#49608d",
    backgroundColor: "#121a2a",
  },
  huntLandingCardMemory: {
    borderColor: "#5a4a29",
    backgroundColor: "#171510",
  },
  huntLandingEmoji: {
    width: 40,
    height: 40,
    textAlign: "center",
    fontSize: 28,
    lineHeight: 40,
  },
  huntLandingIcon: {
    width: 68,
    height: 68,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    backgroundColor: "#0f1520",
  },
  huntLandingTitle: {
    color: "#fff",
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
  },
  huntLandingCopy: {
    color: "#cbd3df",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },
  huntLandingArrow: {
    minWidth: 42,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    overflow: "hidden",
    color: "#101318",
    backgroundColor: "#9fbaff",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  sharedHuntList: {
    gap: 10,
  },
  sharedHuntCard: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#10151c",
  },
  sharedHuntCardActive: {
    borderColor: "#8fb8ff",
    backgroundColor: "#121d2d",
  },
  memoryLaneCard: {
    borderColor: "#5a4a29",
    backgroundColor: "#171510",
  },
  sharedHuntTitle: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  sharedHuntMeta: {
    color: "#9aa5b4",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  sharedHuntBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#344153",
    backgroundColor: "#151b24",
  },
  sharedHuntBadgeActive: {
    borderColor: "#8fb8ff",
    backgroundColor: "#24344f",
  },
  sharedHuntBadgeText: {
    color: "#c8cfdb",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  sharedHuntBadgeTextActive: {
    color: "#e9f1ff",
  },
  huntGoalRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#10151c",
  },
  huntGoalNumber: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#24344f",
  },
  huntGoalNumberText: {
    color: "#d9e8ff",
    fontSize: 12,
    fontWeight: "900",
  },
  huntGoalText: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },
  huntGoalInput: {
    flex: 1,
    minHeight: 34,
    color: "#fff",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#121a24",
  },
  huntSubtleSaveButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3a527d",
    backgroundColor: "#17243a",
  },
  huntSubtleSaveButtonText: {
    color: "#e9f1ff",
    fontSize: 13,
    fontWeight: "900",
  },
  huntZipRow: {
    flexDirection: "row",
    gap: 10,
  },
  huntSearchNameInput: {
    minHeight: 44,
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2e3a4b",
    backgroundColor: "#10151c",
  },
  huntZipInput: {
    flex: 1,
    minHeight: 44,
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2e3a4b",
    backgroundColor: "#10151c",
  },
  huntZipSearchButton: {
    minWidth: 96,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#8fb8ff",
  },
  huntZipSearchText: {
    color: "#101318",
    fontSize: 13,
    fontWeight: "900",
  },
  huntRadiusRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  huntRadiusChip: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2e3a4b",
    backgroundColor: "#10151c",
  },
  huntRadiusChipActive: {
    borderColor: "#8fb8ff",
    backgroundColor: "#17243a",
  },
  huntRadiusText: {
    color: "#c8cfdb",
    fontSize: 12,
    fontWeight: "900",
  },
  huntRadiusTextActive: {
    color: "#e9f1ff",
  },
  huntTypePicker: {
    gap: 8,
    paddingVertical: 2,
  },
  huntTypeChip: {
    width: 112,
    minHeight: 50,
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2e3a4b",
    backgroundColor: "#10151c",
  },
  huntTypeChipActive: {
    borderColor: "#8fb8ff",
    backgroundColor: "#17243a",
  },
  huntTypeChipText: {
    color: "#f2f5fb",
    fontSize: 12,
    fontWeight: "900",
  },
  huntTypeChipTextActive: {
    color: "#e9f1ff",
  },
  huntTypeChipSubtext: {
    color: "#9aa5b4",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  huntHotspotCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#10151c",
  },
  huntHotspotMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  huntHotspotKind: {
    color: "#9fbaff",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: 4,
  },
  huntHotspotSource: {
    color: "#d8fff7",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#142825",
  },
  huntHotspotDistance: {
    color: "#d8fff7",
    fontSize: 11,
    fontWeight: "900",
  },
  huntHotspotAddButton: {
    minWidth: 58,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#142825",
    borderWidth: 1,
    borderColor: "#3d716b",
  },
  huntHotspotAddText: {
    color: "#d8fff7",
    fontSize: 12,
    fontWeight: "900",
  },
  huntQuickStopCard: {
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3a527d",
    backgroundColor: "#111a29",
  },
  huntQuickStopTop: {
    gap: 2,
  },
  huntQuickStopTitle: {
    color: "#e9f1ff",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },
  huntQuickStopCopy: {
    color: "#aebbd0",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  huntQuickStopButton: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#8fb8ff",
  },
  huntQuickStopButtonText: {
    color: "#101318",
    fontSize: 13,
    fontWeight: "900",
  },
  huntStopCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#10151c",
  },
  huntRouteNumber: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#24344f",
  },
  huntRouteNumberText: {
    color: "#d9e8ff",
    fontSize: 12,
    fontWeight: "900",
  },
  huntStopInput: {
    minHeight: 30,
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#121a24",
  },
  huntStopDetailInput: {
    minHeight: 30,
    color: "#c8cfdb",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#121a24",
  },
  huntStopTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  huntStopDetail: {
    color: "#c8cfdb",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  huntStopTag: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#25223b",
  },
  huntStopTagText: {
    color: "#dad4ff",
    fontSize: 10,
    fontWeight: "900",
  },
  huntStopTagInput: {
    width: 88,
    minHeight: 34,
    color: "#dad4ff",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "#25223b",
  },
  huntStopSide: {
    width: 92,
    alignItems: "center",
    gap: 6,
  },
  huntStopSideStatus: {
    color: "#9fbaff",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase",
  },
  huntStopRemoveButton: {
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#49313a",
    backgroundColor: "#1b1419",
  },
  huntStopRemoveText: {
    color: "#ffc6d2",
    fontSize: 10,
    fontWeight: "900",
  },
  huntStopOpenButton: {
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3d716b",
    backgroundColor: "#142825",
  },
  huntStopOpenText: {
    color: "#d8fff7",
    fontSize: 10,
    fontWeight: "900",
  },
  huntStopStatusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  huntStopStatusChip: {
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2f3b49",
    backgroundColor: "#121a24",
  },
  huntStopStatusChipActive: {
    borderColor: "#a8d8ce",
    backgroundColor: "#1d3a35",
  },
  huntStopStatusText: {
    color: "#b8c2cf",
    fontSize: 10,
    fontWeight: "900",
  },
  huntStopStatusTextActive: {
    color: "#d9fff7",
  },
  huntStopVisitNoteInput: {
    minHeight: 34,
    color: "#eef4ff",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#25303d",
    backgroundColor: "#0d1219",
  },
  stopDetailNoteInput: {
    minHeight: 92,
    color: "#eef4ff",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#25303d",
    backgroundColor: "#0d1219",
    textAlignVertical: "top",
  },
  huntStopScanButton: {
    minHeight: 48,
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#8fb8ff",
    backgroundColor: "#17243a",
  },
  huntStopScanButtonText: {
    color: "#e9f1ff",
    fontSize: 13,
    fontWeight: "900",
  },
  huntStopScanButtonSubtext: {
    color: "#b8c6dc",
    fontSize: 11,
    fontWeight: "800",
  },
  huntStopActions: {
    flexDirection: "row",
    gap: 10,
  },
  scanHuntContextBanner: {
    gap: 4,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3d716b",
    backgroundColor: "#142825",
  },
  scanHuntContextEyebrow: {
    color: "#a8d8ce",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  scanHuntContextTitle: {
    color: "#f3fffc",
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
  },
  scanHuntContextCopy: {
    color: "#cfe5df",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  huntFindCard: {
    minHeight: 72,
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#10151c",
  },
  huntFindTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  huntFindName: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  huntFindMeta: {
    color: "#9fbaff",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  huntBestFindPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#5a4a29",
    backgroundColor: "#282316",
  },
  huntBestFindPillText: {
    color: "#fff1cf",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  huntFindOutcomeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  huntFindOutcomeChip: {
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2f3b49",
    backgroundColor: "#121a24",
  },
  huntFindOutcomeChipActive: {
    borderColor: "#a8d8ce",
    backgroundColor: "#1d3a35",
  },
  huntFindOutcomeChipText: {
    color: "#b8c2cf",
    fontSize: 10,
    fontWeight: "900",
  },
  huntFindOutcomeChipTextActive: {
    color: "#d9fff7",
  },
  huntFindNoteInput: {
    minHeight: 36,
    color: "#eef4ff",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#25303d",
    backgroundColor: "#0d1219",
  },
  huntFindActionRow: {
    flexDirection: "row",
    gap: 8,
  },
  huntFindActionButton: {
    flex: 1,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3a527d",
    backgroundColor: "#17243a",
  },
  huntFindActionButtonActive: {
    borderColor: "#d8b46a",
    backgroundColor: "#282316",
  },
  huntFindSaveButton: {
    borderColor: "#3d716b",
    backgroundColor: "#142825",
  },
  huntFindActionText: {
    color: "#e9f1ff",
    fontSize: 12,
    fontWeight: "900",
  },
  huntFindActionTextActive: {
    color: "#fff1cf",
  },
  huntFindOutcomeBadge: {
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3d716b",
    backgroundColor: "#142825",
  },
  huntFindOutcomeText: {
    color: "#d8fff7",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  huntFindEmptyCard: {
    gap: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#25303d",
    backgroundColor: "#10151c",
  },
  huntFindEmptyTitle: {
    color: "#f3fffc",
    fontSize: 14,
    fontWeight: "900",
  },
  huntFindEmptyCopy: {
    color: "#c8cfdb",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  huntPhotoActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  huntPhotoButton: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#8fb8ff",
    backgroundColor: "#17243a",
  },
  huntPhotoButtonSecondary: {
    borderColor: "#3d716b",
    backgroundColor: "#142825",
  },
  huntPhotoButtonText: {
    color: "#e9f1ff",
    fontSize: 13,
    fontWeight: "900",
  },
  huntPhotoStrip: {
    gap: 10,
    paddingVertical: 2,
  },
  huntPhotoCard: {
    width: 126,
    gap: 6,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#10151c",
  },
  huntPhotoThumb: {
    width: "100%",
    height: 104,
    borderRadius: 9,
    backgroundColor: "#0d1219",
  },
  huntPhotoPlaceholder: {
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#0d1219",
  },
  huntPhotoPlaceholderText: {
    color: "#9fbaff",
    fontSize: 12,
    fontWeight: "900",
  },
  huntPhotoCaption: {
    color: "#c8cfdb",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
  },
  huntSmallButton: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2e3a4b",
    backgroundColor: "#10151c",
  },
  huntSmallButtonPrimary: {
    borderColor: "#8fb8ff",
    backgroundColor: "#17243a",
  },
  huntSmallButtonText: {
    color: "#e9f1ff",
    fontSize: 13,
    fontWeight: "900",
  },
  huntMemoryGrid: {
    gap: 10,
  },
  huntMemoryInput: {
    minHeight: 84,
    color: "#fff",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    textAlignVertical: "top",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2e3a4b",
    backgroundColor: "#10151c",
  },
  huntMemoryCard: {
    gap: 4,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#10151c",
  },
  huntMemoryLabel: {
    color: "#9fbaff",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  huntMemoryValue: {
    color: "#f2f5fb",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  huntRecapCard: {
    gap: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#5a4a29",
    backgroundColor: "#191713",
  },
  huntRecapTitle: {
    color: "#fff1cf",
    fontSize: 18,
    fontWeight: "900",
  },
  huntRecapCopy: {
    color: "#d8d1c1",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  dashboardProfileLink: {
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
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
  detailHuntFindCard: {
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3f7d73",
    backgroundColor: "#142825",
  },
  detailHuntFindTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  detailHuntFindStop: {
    color: "#f3fffc",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  detailHuntFindTrip: {
    color: "#a8d8ce",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
  },
  detailHuntFindDetail: {
    color: "#d7eee8",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  detailHuntFindNote: {
    color: "#eef9f6",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  detailHuntFindBest: {
    alignSelf: "flex-start",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    color: "#fff1cf",
    backgroundColor: "#282316",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
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
  sharedShelfSetupHero: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#151a1f",
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
  cardLabelCompact: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: "center",
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
  metricCardCompact: {
    flex: 1,
    minHeight: 66,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 8,
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
  metricValueCompact: {
    fontSize: 20,
    lineHeight: 24,
  },
  sharedShelfHeroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sharedShelfHeroIcon: {
    width: 82,
    height: 82,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    backgroundColor: "#10151c",
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
  pickerBackdrop: {
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
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
  pickerOptionSheet: {
    width: "100%",
    maxWidth: 430,
    maxHeight: "68%" as any,
    gap: 8,
    padding: 12,
    paddingBottom: 12,
    borderRadius: 14,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: "#151a1f",
  },
  optionScroll: {
    maxHeight: 340,
  },
  optionScrollContent: {
    gap: 5,
    paddingBottom: 2,
  },
  optionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },
  pickerOptionTitle: {
    fontSize: 15,
    marginBottom: 2,
  },
  optionRow: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#202832",
  },
  optionRowActive: {
    backgroundColor: "#7e67f4",
  },
  optionText: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 17,
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
    borderRadius: 14,
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
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
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
    gap: 2,
  },
  cardValueHero: {
    width: "100%",
    gap: 2,
    marginBottom: 4,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#39414b",
  },
  cardValueLabel: {
    color: "#b8c0cc",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  cardValueAmount: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
    lineHeight: 20,
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
