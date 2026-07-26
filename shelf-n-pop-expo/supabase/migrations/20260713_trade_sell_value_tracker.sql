alter table public.user_collection_items
  add column if not exists listing_status text not null default 'keeping'
    check (listing_status in ('keeping', 'for_sale', 'for_trade', 'sale_or_trade', 'sold')),
  add column if not exists asking_price numeric,
  add column if not exists minimum_price numeric,
  add column if not exists listing_platform text,
  add column if not exists listed_at date,
  add column if not exists trade_notes text;

update public.user_collection_items
set listing_status = case
  when coalesce(for_sale, false) and coalesce(for_trade, false) then 'sale_or_trade'
  when coalesce(for_sale, false) then 'for_sale'
  when coalesce(for_trade, false) then 'for_trade'
  else listing_status
end
where listing_status = 'keeping'
  and (coalesce(for_sale, false) or coalesce(for_trade, false));

create table if not exists public.pop_sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  collection_item_id uuid references public.user_collection_items(id) on delete set null,
  pop_catalog_id uuid references public.pop_catalog(id) on delete set null,
  sold_at date not null default current_date,
  sale_price numeric not null default 0,
  platform text,
  platform_fees numeric not null default 0,
  shipping_charged numeric not null default 0,
  shipping_cost numeric not null default 0,
  purchase_price numeric,
  estimated_value_at_sale numeric,
  pop_name text,
  franchise text,
  set_name text,
  number text,
  variant text,
  image_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pop_sales enable row level security;

drop policy if exists "Users can view their own pop sales" on public.pop_sales;
create policy "Users can view their own pop sales"
  on public.pop_sales
  for select
  using (user_id = (select auth.uid()));

drop policy if exists "Users can insert their own pop sales" on public.pop_sales;
create policy "Users can insert their own pop sales"
  on public.pop_sales
  for insert
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can update their own pop sales" on public.pop_sales;
create policy "Users can update their own pop sales"
  on public.pop_sales
  for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete their own pop sales" on public.pop_sales;
create policy "Users can delete their own pop sales"
  on public.pop_sales
  for delete
  using (user_id = (select auth.uid()));

create index if not exists pop_sales_user_sold_at_idx on public.pop_sales (user_id, sold_at desc);
create index if not exists user_collection_items_listing_status_idx on public.user_collection_items (user_id, listing_status);

create or replace view public.user_collection_view
with (security_invoker = true)
as
select
  uci.id as collection_item_id,
  uci.user_id,
  uci.pop_catalog_id,
  uci.quantity,
  uci.condition,
  uci.box_condition,
  uci.purchase_price,
  uci.current_value,
  uci.notes,
  uci.for_trade,
  uci.for_sale,
  uci.visibility,
  uci.acquired_date,
  uci.created_at,
  pc.upc,
  pc.pop_name,
  pc."character",
  pc.franchise,
  pc.number,
  pc.variant,
  pc.exclusivity,
  pc.pop_type,
  pc.set_name,
  pc.image_url,
  pc.vault_status,
  pc.estimated_value,
  coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric) as value_each,
  coalesce(uci.purchase_price, 0::numeric) as cost_each,
  (coalesce(uci.quantity, 1::bigint)::numeric * coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric)) as total_value,
  (coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric)) as total_cost,
  ((coalesce(uci.quantity, 1::bigint)::numeric * coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric)) - (coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric))) as gain_loss,
  pc.pop_style,
  uci.owned_variant,
  coalesce(uci.owned_variant, pc.variant) as display_variant,
  pc.description,
  pc.display_description,
  pc.limited_edition,
  pc.limited_count,
  pc.edition_notes,
  pc.release_date,
  uci.signed,
  uci.signed_by,
  uci.signature_authentication,
  uci.signature_cert_number,
  uci.signature_location,
  uci.signature_personalized,
  uci.signature_notes,
  uci.signed_value_boost_percent,
  uci.listing_status,
  uci.asking_price,
  uci.minimum_price,
  uci.listing_platform,
  uci.listed_at,
  uci.trade_notes
from public.user_collection_items uci
join public.pop_catalog pc on pc.id = uci.pop_catalog_id
where uci.user_id = (select auth.uid());
