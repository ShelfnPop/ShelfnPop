export type DashboardHome = {
  user_id: string;
  display_name: string | null;
  greeting_text: string | null;
  insight_text: string | null;
  unique_items: number | null;
  total_pops: number | null;
  total_collection_value: number | null;
  total_paid: number | null;
  gain_loss: number | null;
  gain_loss_percent: number | null;
  average_paid_per_pop: number | null;
  average_value_per_pop: number | null;
  wishlist_count: number | null;
  pops_added_this_month: number | null;
  baseline_snapshot_date: string | null;
  baseline_collection_value: number | null;
  monthly_value_change: number | null;
  monthly_value_change_percent: number | null;
  generated_date: string | null;
};

export type PopCatalog = {
  id: string;
  upc: string | null;
  pop_name: string | null;
  character: string | null;
  franchise: string | null;
  number: string | null;
  variant: string | null;
  exclusivity: string | null;
  pop_style: string | null;
  set_name: string | null;
  image_url: string | null;
  vault_status: string | null;
  estimated_value: number | null;
  display_description: string | null;
  limited_edition: boolean | null;
  limited_count: number | null;
  edition_notes: string | null;
};

export type CollectionItem = {
  collection_item_id: string;
  user_id: string;
  pop_catalog_id: string;
  quantity: number | null;
  condition: string | null;
  owned_variant: string | null;
  purchase_price: number | null;
  current_value: number | null;
  notes: string | null;
  for_trade: boolean | null;
  for_sale: boolean | null;
  acquired_date?: string | null;
  created_at?: string | null;
  upc: string | null;
  pop_name: string | null;
  character: string | null;
  franchise: string | null;
  number: string | null;
  variant: string | null;
  exclusivity: string | null;
  pop_style: string | null;
  set_name: string | null;
  image_url: string | null;
  vault_status: string | null;
  estimated_value: number | null;
  value_each: number | null;
  total_value: number | null;
  total_cost: number | null;
  gain_loss: number | null;
  display_variant: string | null;
  display_description: string | null;
  limited_edition: boolean | null;
  limited_count: number | null;
  edition_notes: string | null;
};

export type SharedShelf = {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_names: string | null;
  member_count: number | null;
};

export type SharedShelfCollectionItem = CollectionItem & {
  shelf_id: string;
  shelf_name: string;
  invite_code: string;
  owner_user_id: string;
  owner_display_name: string;
  created_at: string | null;
};

export type SharedShelfGroupedItem = {
  shelf_id: string;
  shelf_name: string;
  invite_code: string;
  pop_catalog_id: string;
  upc: string | null;
  pop_name: string | null;
  character: string | null;
  franchise: string | null;
  number: string | null;
  variant: string | null;
  exclusivity: string | null;
  pop_style: string | null;
  set_name: string | null;
  image_url: string | null;
  vault_status: string | null;
  estimated_value: number | null;
  display_description: string | null;
  limited_edition: boolean | null;
  limited_count: number | null;
  edition_notes: string | null;
  total_quantity: number | null;
  owner_count: number | null;
  owner_names: string | null;
  variants_owned: string | null;
  value_each: number | null;
  total_value: number | null;
  total_cost: number | null;
  gain_loss: number | null;
  newest_added_at: string | null;
};

export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_public: boolean | null;
};

export type PublicWishlistItem = {
  id: string;
  user_id: string;
  pop_catalog_id: string;
  priority: string | null;
  notes: string | null;
  created_at: string | null;
  owner_display_name: string | null;
  owner_username: string | null;
  owner_avatar_url: string | null;
  upc: string | null;
  pop_name: string | null;
  character: string | null;
  franchise: string | null;
  number: string | null;
  variant: string | null;
  exclusivity: string | null;
  pop_style: string | null;
  set_name: string | null;
  image_url: string | null;
  vault_status: string | null;
  estimated_value: number | null;
  display_description: string | null;
  limited_edition: boolean | null;
  limited_count: number | null;
  edition_notes: string | null;
};

export type LookupResponse = {
  found: boolean;
  source?: string;
  message?: string;
  error?: string;
  pop?: PopCatalog;
};
