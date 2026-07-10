import { Alert } from "react-native";
import {
  type CollectionItem,
  type DashboardHome,
  type AdminAuditEvent,
  type SharedShelfCollectionItem,
  type SharedShelfGroupedItem,
  type SharedShelfMember,
} from "../types";
import { compactName, integer, money } from "../utils/format";

export type CollectionFilterKind =
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

export type CollectionFilter = {
  kind: CollectionFilterKind;
  label: string;
  value?: string;
};

export type StatsGroupMode = "franchise" | "set";

export type SharedStatsMember = {
  id: string;
  name: string;
  count: number;
  value: number;
};

export type AvatarKey =
  | "logo"
  | "midnight"
  | "mint"
  | "gold"
  | "berry"
  | "ice"
  | "hoodie"
  | "panda"
  | "bear"
  | "lion"
  | "cat"
  | "bot"
  | "fox"
  | "owl";

export const VALID_AVATAR_KEYS = [
  "logo",
  "midnight",
  "mint",
  "gold",
  "berry",
  "ice",
  "hoodie",
  "panda",
  "bear",
  "lion",
  "cat",
  "bot",
  "fox",
  "owl",
] as const;

export type StatsSourceItem = CollectionItem | SharedShelfCollectionItem;

export type StatsGroup = {
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

export type SetChecklistSummary = {
  set_id: string;
  set_name: string;
  status: string | null;
  source_label: string | null;
  required_count: number | null;
};

export type SetChecklistItem = {
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

export type ChecklistDisplayRow = SetChecklistItem & {
  owned: boolean;
  ownedItem?: StatsSourceItem;
};

export type SetPremiumDisplay = {
  text: string;
  isActive: boolean;
};

export type SetProgressSummary = {
  ownedUnique: number;
  checklistTotal: number;
  completionPercent: number;
};

export type ScanShelfOwner = {
  key: string;
  name: string;
  quantity: number;
  variant: string;
};

export type AdminHealthFilter = "queue" | "needsReview" | "lowParse" | "missingImages" | "missingValues";

export function quantityNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function perPopValue(item: {
  value_each?: number | null;
  current_value?: number | null;
  estimated_value?: number | null;
  total_value?: number | null;
  quantity?: number | null;
  total_quantity?: number | null;
}): number | null {
  if (item.value_each != null) return Number(item.value_each);
  if (item.current_value != null) return Number(item.current_value);

  const quantity = quantityNumber(item.quantity ?? item.total_quantity);
  if (quantity > 0 && item.total_value != null) return Number(item.total_value) / quantity;
  if (item.estimated_value != null) return Number(item.estimated_value);

  return null;
}

export function displayPopName(
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

export function sharedShelfOwnerName(item: SharedShelfCollectionItem): string {
  return (item.owner_display_name || "Collector").trim() || "Collector";
}

export function sharedShelfMemberName(member: Pick<SharedShelfMember, "display_name" | "username">): string {
  return compactName(member.display_name || member.username || "Collector");
}

export function generateInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 8; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export function confirmAction(title: string, message: string, action: () => void) {
  if (typeof window !== "undefined" && typeof window.confirm === "function") {
    if (window.confirm(`${title}\n\n${message}`)) action();
    return;
  }

  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Continue", style: "destructive", onPress: action },
  ]);
}

export function normalizedUpc(value: string | number | null | undefined): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function normalizeShelfVariant(value: string | null | undefined): string {
  const clean = String(value ?? "").trim();
  return clean || "Common";
}

export function shortDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function percent(value: number | null | undefined): string {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed)) return "0%";
  return `${parsed.toFixed(1)}%`;
}

export function dashboardActivityText(dashboard: DashboardHome | null): string {
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

export function isMeaningfulVariant(value: string | null | undefined): boolean {
  const normalized = String(value ?? "").trim().toLowerCase();
  return Boolean(normalized) && !["common", "standard", "--", "unknown"].includes(normalized);
}

export function passwordRedirectTo() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return undefined;
}

export function defaultSignedBoost(authentication: string, personalized: boolean): number {
  if (personalized) return 10;
  if (/^(jsa|beckett|psa|funko event|convention coa)$/i.test(authentication)) return 30;
  if (/^unknown$/i.test(authentication)) return 15;
  return 15;
}

export function adjustedSignedValue(baseValue: number, signed: boolean, boostPercent: number): number {
  if (!signed || baseValue <= 0) return baseValue;
  return Math.round(baseValue * (1 + Math.max(boostPercent, 0) / 100) * 100) / 100;
}

export function isDigitalPopType(value: string | null | undefined): boolean {
  return /\b(digital|nft)\b/i.test(String(value ?? ""));
}

export function limitedEditionText(item: {
  limited_edition?: boolean | null;
  limited_count?: number | null;
  edition_notes?: string | null;
  pop_type?: string | null;
}) {
  if (!item.limited_edition && !item.limited_count && !item.edition_notes) return null;
  if (isDigitalPopType(item.pop_type)) return "Production Run";
  return "Limited Edition";
}

export function vaultStatusText(item: { vault_status?: string | null }) {
  const status = String(item.vault_status ?? "").trim();
  if (!status) return null;
  if (/vault/i.test(status)) return "Vaulted";
  return status;
}

export function releaseDateText(item: { release_date?: string | null }) {
  const value = String(item.release_date ?? "").trim();
  if (!value) return null;
  const year = value.match(/^(19|20)\d{2}/)?.[0];
  return year ? `Released ${year}` : null;
}

export function issueTypeLabel(value: string | null | undefined): string {
  const issueOptions = [
    { key: "wrong_image", label: "Wrong image" },
    { key: "missing_image", label: "Missing image" },
    { key: "wrong_value", label: "Wrong value" },
    { key: "missing_value", label: "Missing value" },
    { key: "wrong_details", label: "Wrong details" },
    { key: "duplicate", label: "Duplicate" },
    { key: "other", label: "Other" },
  ] as const;

  return issueOptions.find((option) => option.key === value)?.label ?? "Other";
}

export function resolveAvatarKey(value?: string | null): AvatarKey {
  return VALID_AVATAR_KEYS.includes((value ?? "") as AvatarKey) ? (value as AvatarKey) : "logo";
}

export function adminRowDate(value: string | null | undefined): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export const ISSUE_TYPES = [
  { key: "wrong_image", label: "Wrong image" },
  { key: "missing_image", label: "Missing image" },
  { key: "wrong_value", label: "Wrong value" },
  { key: "missing_value", label: "Missing value" },
  { key: "wrong_details", label: "Wrong details" },
  { key: "duplicate", label: "Duplicate" },
  { key: "other", label: "Other" },
] as const;

export type IssueType = (typeof ISSUE_TYPES)[number]["key"];

export function adminHealthFilterLabel(value: AdminHealthFilter): string {
  if (value === "needsReview") return "Needs Review";
  if (value === "lowParse") return "Low Parse";
  if (value === "missingImages") return "No Image";
  if (value === "missingValues") return "No Value";
  return "Full Health";
}

export function parseReasonLabel(value: string): string {
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

export type AdminSeverity = "critical" | "high" | "medium" | "low";

export function adminSeverityLabel(value: AdminSeverity): string {
  if (value === "critical") return "Critical";
  if (value === "high") return "High";
  if (value === "medium") return "Medium";
  return "Low";
}

export function adminSeverityRank(value: AdminSeverity): number {
  if (value === "critical") return 0;
  if (value === "high") return 1;
  if (value === "medium") return 2;
  return 3;
}

export function catalogHealthSeverity(row: {
  image_url?: string | null;
  estimated_value?: number | null;
  pop_name?: string | null;
  character?: string | null;
  franchise?: string | null;
  set_name?: string | null;
  number?: string | null;
  parse_confidence?: number | null;
  parse_reason_codes?: string[] | null;
}): AdminSeverity {
  const reasons = new Set(row.parse_reason_codes ?? []);
  if (!row.image_url || Number(row.estimated_value ?? 0) <= 0 || (!row.pop_name && !row.character) || reasons.has("missing_title")) {
    return "critical";
  }
  if (!row.franchise || !row.set_name || !row.number || reasons.has("missing_franchise") || reasons.has("missing_set") || reasons.has("missing_number")) {
    return "high";
  }
  if (reasons.has("variant_or_exclusive_title_noise") || reasons.has("generic_set_label") || Number(row.parse_confidence ?? 1) < 0.75) {
    return "medium";
  }
  return "low";
}

export function sortedCatalogHealthRows<T extends Parameters<typeof catalogHealthSeverity>[0] & { api_last_updated?: string | null; created_at?: string | null }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const severityDiff = adminSeverityRank(catalogHealthSeverity(a)) - adminSeverityRank(catalogHealthSeverity(b));
    if (severityDiff !== 0) return severityDiff;

    const aTime = new Date(a.api_last_updated ?? a.created_at ?? 0).getTime();
    const bTime = new Date(b.api_last_updated ?? b.created_at ?? 0).getTime();
    return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
  });
}

export function learnedOverrideData(row: {
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

export function shelfMetaLine(item: {
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

export async function getFunctionErrorMessage(error: unknown, barcode?: string) {
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

export function auditActionLabel(value: string): string {
  if (value === "catalog_update") return "Catalog update";
  if (value === "report_status_update") return "Report status";
  if (value === "report_update") return "Report update";
  if (value === "parser_override_create") return "Override created";
  if (value === "parser_override_update") return "Override updated";
  if (value === "parser_override_disable") return "Override disabled";
  if (value === "parser_override_delete") return "Override deleted";
  return compactName(value.replace(/_/g, " "));
}

export function auditChangedFieldText(event: AdminAuditEvent): string {
  const fields = event.changed_fields ?? [];
  const visibleFields = fields.filter((field) => !["api_last_updated", "updated_at"].includes(field));
  if (visibleFields.length === 0) return "Timestamp only";
  return visibleFields.slice(0, 6).join(", ") + (visibleFields.length > 6 ? ` +${visibleFields.length - 6}` : "");
}

export function auditSubjectText(event: AdminAuditEvent): string {
  const after = event.after_data ?? {};
  const before = event.before_data ?? {};
  const source = Object.keys(after).length ? after : before;
  const name = String(source.pop_name ?? source.character ?? source.issue_type ?? "").trim();
  const number = String(source.number ?? "").trim();
  const status = String(source.status ?? "").trim();
  const upc = String(source.upc ?? "").trim();
  if (name && number) return `${name} #${number}`;
  if (name) return name;
  if (upc && event.table_name === "catalog_parser_overrides") return `UPC ${upc}`;
  if (status && event.table_name === "catalog_issue_reports") return `Report ${status}`;
  return event.row_id ?? event.table_name;
}

export function isRecentCollectionItem(item: CollectionItem): boolean {
  const dateValue = item.acquired_date || item.created_at;
  const date = dateValue ? new Date(dateValue).getTime() : Number.NaN;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return Number.isFinite(date) && date >= thirtyDaysAgo;
}

export function duplicateShelfKey(item: StatsSourceItem): string {
  const catalogId = item.pop_catalog_id || item.collection_item_id;
  const variant = String(item.owned_variant || item.display_variant || item.variant || "Common")
    .trim()
    .toLowerCase();
  return `${catalogId}::${variant || "common"}`;
}

export function completionOwnershipKey(
  item: Pick<StatsSourceItem, "pop_catalog_id" | "collection_item_id" | "owned_variant" | "display_variant" | "variant">,
): string {
  if (item.pop_catalog_id) return `catalog:${item.pop_catalog_id}`;
  if (item.collection_item_id) return `collection:${item.collection_item_id}`;
  const catalogVariant = item.display_variant ?? item.variant;
  const variantSource = isMeaningfulVariant(catalogVariant) ? catalogVariant : item.owned_variant;
  const variant = normalizeShelfVariant(variantSource).toLowerCase();
  return `unknown::${variant}`;
}

export function buildDuplicateShelfKeys(items: CollectionItem[]): Set<string> {
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

export function matchesCollectionFilter(item: CollectionItem, filter: CollectionFilter, duplicateShelfKeys?: Set<string>): boolean {
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

export function buildStatsGroups(items: StatsSourceItem[], mode: StatsGroupMode): StatsGroup[] {
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

export function addSetCompletion(groups: StatsGroup[], checklists: Record<string, SetChecklistSummary>): StatsGroup[] {
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

export function setCompletionText(group: StatsGroup): string | null {
  if (!group.checklistTotal || group.completionPercent == null) return null;
  const ownedCount = group.completionOwnedCount ?? group.uniqueCount;
  return `${integer(ownedCount)} of ${integer(group.checklistTotal)} owned - ${percent(group.completionPercent)} complete`;
}

export function normalizedCondition(value: string | null | undefined): string {
  return String(value || "Unknown").trim().toLowerCase();
}

export function isMintCondition(value: string | null | undefined): boolean {
  return normalizedCondition(value) === "mint";
}

export function isNearMintOrMintCondition(value: string | null | undefined): boolean {
  const condition = normalizedCondition(value);
  return condition === "mint" || condition === "near mint";
}

export function hasKnownCondition(value: string | null | undefined): boolean {
  const condition = normalizedCondition(value);
  return Boolean(condition && condition !== "unknown");
}

export function calculateSetPremium(group: StatsGroup): Partial<StatsGroup> {
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

export function setPremiumDisplay(group: StatsGroup, ownedCountOverride?: number, totalOverride?: number): SetPremiumDisplay | null {
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

export function setPremiumText(group: StatsGroup): string | null {
  return setPremiumDisplay(group)?.text ?? null;
}

export function boxNumberSortValue(value: string | number | null | undefined): { number: number; suffix: string } {
  const clean = String(value ?? "").trim();
  const match = clean.match(/\d+/);
  return {
    number: match ? Number(match[0]) : Number.POSITIVE_INFINITY,
    suffix: clean.replace(/\d+/g, "").trim().toLowerCase(),
  };
}

export function sortItemsByBoxNumber<T extends StatsSourceItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aBox = boxNumberSortValue(a.number);
    const bBox = boxNumberSortValue(b.number);

    if (aBox.number !== bBox.number) return aBox.number - bBox.number;
    if (aBox.suffix !== bBox.suffix) return aBox.suffix.localeCompare(bBox.suffix);

    return displayPopName(a).localeCompare(displayPopName(b));
  });
}

export function checklistRowName(item: Pick<SetChecklistItem, "pop_name" | "character">): string {
  return compactName(item.pop_name || item.character || "Unknown Pop");
}

export function compareChecklistRows(a: SetChecklistItem, b: SetChecklistItem): number {
  const aBox = boxNumberSortValue(a.number);
  const bBox = boxNumberSortValue(b.number);

  if (aBox.number !== bBox.number) return aBox.number - bBox.number;
  if (aBox.suffix !== bBox.suffix) return aBox.suffix.localeCompare(bBox.suffix);

  return checklistRowName(a).localeCompare(checklistRowName(b));
}

export function normalizedChecklistPart(value: string | null | undefined): string {
  return compactName(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function checklistVariantPart(value: string | null | undefined): string {
  const clean = normalizedChecklistPart(value);
  if (clean === "diamond collection" || clean === "diamond" || clean === "glitter") return "glitter";
  return !clean || clean === "common" ? "" : clean;
}

export function checklistMatchKeysForOwnedItem(item: StatsSourceItem): string[] {
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

export function checklistMatchKeysForChecklistRow(row: SetChecklistItem, setName: string, duplicateCatalogIds?: Set<string>): string[] {
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

export function buildChecklistDisplayRows(checklistRows: SetChecklistItem[], ownedItems: StatsSourceItem[], setName: string): ChecklistDisplayRow[] {
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

export function groupSharedShelfItems(items: SharedShelfCollectionItem[]): SharedShelfGroupedItem[] {
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

export function buildSharedStatsMembers(items: SharedShelfCollectionItem[]): SharedStatsMember[] {
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
