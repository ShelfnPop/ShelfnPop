import { compactName } from "../utils/format";
import { supabase } from "../lib/supabase";
import type {
  CollectionItem,
  DashboardHome,
  PopCatalog,
  SharedShelf,
  SharedShelfCollectionItem,
  SharedShelfMember,
} from "../types";
import { compareChecklistRows, normalizeShelfVariant, quantityNumber, sharedShelfOwnerName } from "../domain/appHelpers";
import type { ScanShelfOwner, SetChecklistItem, SetChecklistSummary } from "../domain/appHelpers";

const SUPABASE_PAGE_SIZE = 1000;

export async function fetchSharedShelfCollectionItems(shelfId: string): Promise<SharedShelfCollectionItem[]> {
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

export async function fetchUserCollectionItems(userId: string): Promise<CollectionItem[]> {
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

export async function fetchSetChecklistSummaries(): Promise<Record<string, SetChecklistSummary>> {
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

export async function fetchSetChecklistItems(setId: string): Promise<SetChecklistItem[]> {
  const { data, error } = await supabase
    .from("pop_set_checklist_items")
    .select("id,set_id,pop_catalog_id,upc,pop_name,character,number,variant,exclusivity,pop_type,pop_style,is_required_for_completion")
    .eq("set_id", setId)
    .eq("is_required_for_completion", true);

  if (error) throw error;

  return ((data ?? []) as SetChecklistItem[]).sort(compareChecklistRows);
}

export async function fetchMySharedShelves(): Promise<SharedShelf[]> {
  const { data, error } = await supabase.rpc("get_my_shared_shelves");
  if (error) throw error;
  return (data ?? []) as SharedShelf[];
}

export async function fetchSharedShelfMembers(shelfId: string): Promise<SharedShelfMember[]> {
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

export async function fetchSharedShelfOwnersForPop(pop: PopCatalog): Promise<ScanShelfOwner[]> {
  const popUpc = pop.upc ? `${pop.upc}`.replace(/\D/g, "") : "";
  if (!pop.id && !popUpc) return [];

  const shelves = await fetchMySharedShelves();
  const shelf = shelves[0];
  if (!shelf?.id) return [];

  const items = await fetchSharedShelfCollectionItems(shelf.id);
  const owners = new Map<string, ScanShelfOwner>();

  for (const item of items) {
    const itemUpc = item.upc ? `${item.upc}`.replace(/\D/g, "") : "";
    if (item.pop_catalog_id !== pop.id && itemUpc !== popUpc) continue;

    const ownerId = item.owner_user_id || item.user_id || sharedShelfOwnerName(item);
    const name = sharedShelfOwnerName(item);
    const variant = normalizeShelfVariant(item.owned_variant ?? item.display_variant);
    const key = `${ownerId}:${variant.toLowerCase()}`;
    const existing = owners.get(key) ?? { key, name, variant, quantity: 0 };
    existing.quantity += quantityNumber(item.quantity) || 1;
    owners.set(key, existing);
  }

  return Array.from(owners.values()).sort((a, b) => a.name.localeCompare(b.name) || a.variant.localeCompare(b.variant));
}

export async function fetchDashboardHome(userId: string): Promise<DashboardHome | null> {
  const { data, error } = await supabase.from("dashboard_home_view").select("*").eq("user_id", userId).maybeSingle();

  if (error) throw error;

  return (data as DashboardHome | null) ?? null;
}
