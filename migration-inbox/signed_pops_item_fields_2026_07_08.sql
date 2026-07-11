-- Superseded by migration-inbox/signed_pops_item_fields_order_safe_2026_07_08.sql.
-- This first draft inserted signed view columns before existing columns, which Postgres correctly rejected.
-- Keep for audit trail only; do not apply.
--
-- Add item-level signed Pop tracking and signed value boost, staged/applied 2026-07-08.
-- Signed details belong on user_collection_items because signatures are copy-specific.

alter table public.user_collection_items
  add column if not exists signed boolean not null default false,
  add column if not exists signed_by text,
  add column if not exists signature_authentication text,
  add column if not exists signature_cert_number text,
  add column if not exists signature_location text,
  add column if not exists signature_personalized boolean not null default false,
  add column if not exists signature_notes text,
  add column if not exists signed_value_boost_percent numeric;

create or replace view public.user_collection_summary_view
with (security_invoker = true)
as
select
  uci.user_id,
  count(distinct uci.pop_catalog_id) as unique_items,
  coalesce(sum(coalesce(uci.quantity, 1::bigint)), 0::numeric) as total_quantity,
  coalesce(sum(coalesce(uci.quantity, 1::bigint)::numeric * values.signed_value_each), 0::numeric) as total_collection_value,
  coalesce(sum(coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric)), 0::numeric) as total_purchase_cost,
  coalesce(sum(coalesce(uci.quantity, 1::bigint)::numeric * (values.signed_value_each - coalesce(uci.purchase_price, 0::numeric))), 0::numeric) as total_gain_loss
from public.user_collection_items uci
join public.pop_catalog pc on pc.id = uci.pop_catalog_id
cross join lateral (
  select coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric) as base_value
) base
cross join lateral (
  select case
    when coalesce(uci.signed, false) then round(base.base_value * (1 + greatest(coalesce(uci.signed_value_boost_percent, 0::numeric), 0::numeric) / 100), 2)
    else base.base_value
  end as signed_value_each
) values
group by uci.user_id;

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
  uci.signed,
  uci.signed_by,
  uci.signature_authentication,
  uci.signature_cert_number,
  uci.signature_location,
  uci.signature_personalized,
  uci.signature_notes,
  uci.signed_value_boost_percent,
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
  values.signed_value_each as value_each,
  coalesce(uci.purchase_price, 0::numeric) as cost_each,
  coalesce(uci.quantity, 1::bigint)::numeric * values.signed_value_each as total_value,
  coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric) as total_cost,
  coalesce(uci.quantity, 1::bigint)::numeric * values.signed_value_each - coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric) as gain_loss,
  pc.pop_style,
  uci.owned_variant,
  coalesce(uci.owned_variant, pc.variant) as display_variant,
  pc.description,
  pc.display_description,
  pc.limited_edition,
  pc.limited_count,
  pc.edition_notes,
  pc.release_date
from public.user_collection_items uci
join public.pop_catalog pc on pc.id = uci.pop_catalog_id
cross join lateral (
  select coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric) as base_value
) base
cross join lateral (
  select case
    when coalesce(uci.signed, false) then round(base.base_value * (1 + greatest(coalesce(uci.signed_value_boost_percent, 0::numeric), 0::numeric) / 100), 2)
    else base.base_value
  end as signed_value_each
) values
where uci.user_id = (select auth.uid());

create or replace view public.shared_shelf_collection_view
with (security_invoker = true)
as
select
  s.id as shelf_id,
  s.name as shelf_name,
  s.invite_code,
  member.user_id as owner_user_id,
  coalesce(nullif(p.display_name, ''), nullif(p.username, ''), 'Collector') as owner_display_name,
  uci.id as collection_item_id,
  uci.pop_catalog_id,
  uci.quantity,
  uci.condition,
  uci.owned_variant,
  uci.purchase_price,
  uci.current_value,
  uci.notes,
  uci.for_trade,
  uci.for_sale,
  uci.signed,
  uci.signed_by,
  uci.signature_authentication,
  uci.signature_cert_number,
  uci.signature_location,
  uci.signature_personalized,
  uci.signature_notes,
  uci.signed_value_boost_percent,
  pc.upc,
  pc.pop_name,
  pc."character",
  pc.franchise,
  pc.number,
  pc.variant,
  pc.exclusivity,
  pc.pop_style,
  pc.set_name,
  pc.image_url,
  pc.vault_status,
  pc.estimated_value,
  values.signed_value_each as value_each,
  coalesce(uci.quantity, 1::bigint)::numeric * values.signed_value_each as total_value,
  coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric) as total_cost,
  coalesce(uci.quantity, 1::bigint)::numeric * values.signed_value_each - coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric) as gain_loss,
  coalesce(uci.owned_variant, pc.variant) as display_variant,
  pc.display_description,
  uci.created_at,
  pc.limited_edition,
  pc.limited_count,
  pc.edition_notes,
  pc.pop_type,
  pc.release_date
from public.shared_shelves s
join public.shared_shelf_members member on member.shelf_id = s.id
left join public.profiles p on p.id = member.user_id
join public.user_collection_items uci on uci.user_id = member.user_id
join public.pop_catalog pc on pc.id = uci.pop_catalog_id
cross join lateral (
  select coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric) as base_value
) base
cross join lateral (
  select case
    when coalesce(uci.signed, false) then round(base.base_value * (1 + greatest(coalesce(uci.signed_value_boost_percent, 0::numeric), 0::numeric) / 100), 2)
    else base.base_value
  end as signed_value_each
) values
where exists (
  select 1
  from public.shared_shelf_members viewer
  where viewer.shelf_id = s.id
    and viewer.user_id = auth.uid()
);

create or replace view public.shared_shelf_grouped_collection_view
with (security_invoker = true)
as
select
  s.id as shelf_id,
  s.name as shelf_name,
  s.invite_code,
  uci.pop_catalog_id,
  pc.upc,
  pc.pop_name,
  pc."character",
  pc.franchise,
  pc.number,
  pc.variant,
  pc.exclusivity,
  pc.pop_style,
  pc.set_name,
  pc.image_url,
  pc.vault_status,
  pc.estimated_value,
  pc.display_description,
  sum(coalesce(uci.quantity, 1::bigint))::bigint as total_quantity,
  count(distinct member.user_id)::integer as owner_count,
  string_agg(
    distinct coalesce(nullif(p.display_name, ''), nullif(p.username, ''), 'Collector'),
    ', '
    order by coalesce(nullif(p.display_name, ''), nullif(p.username, ''), 'Collector')
  ) as owner_names,
  string_agg(
    distinct coalesce(nullif(uci.owned_variant, ''), nullif(pc.variant, ''), 'Common'),
    ', '
    order by coalesce(nullif(uci.owned_variant, ''), nullif(pc.variant, ''), 'Common')
  ) as variants_owned,
  sum(coalesce(uci.quantity, 1::bigint)::numeric * values.signed_value_each) as total_value,
  sum(coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric)) as total_cost,
  sum(coalesce(uci.quantity, 1::bigint)::numeric * values.signed_value_each - coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric)) as gain_loss,
  max(uci.created_at) as newest_added_at,
  pc.limited_edition,
  pc.limited_count,
  pc.edition_notes,
  max(values.signed_value_each) as value_each,
  pc.release_date,
  pc.pop_type,
  count(*) filter (where coalesce(uci.signed, false))::integer as signed_count,
  max(uci.signature_authentication) filter (where coalesce(uci.signed, false)) as signature_authentication
from public.shared_shelves s
join public.shared_shelf_members member on member.shelf_id = s.id
left join public.profiles p on p.id = member.user_id
join public.user_collection_items uci on uci.user_id = member.user_id
join public.pop_catalog pc on pc.id = uci.pop_catalog_id
cross join lateral (
  select coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric) as base_value
) base
cross join lateral (
  select case
    when coalesce(uci.signed, false) then round(base.base_value * (1 + greatest(coalesce(uci.signed_value_boost_percent, 0::numeric), 0::numeric) / 100), 2)
    else base.base_value
  end as signed_value_each
) values
where exists (
  select 1
  from public.shared_shelf_members viewer
  where viewer.shelf_id = s.id
    and viewer.user_id = auth.uid()
)
group by
  s.id,
  s.name,
  s.invite_code,
  uci.pop_catalog_id,
  pc.upc,
  pc.pop_name,
  pc."character",
  pc.franchise,
  pc.number,
  pc.variant,
  pc.exclusivity,
  pc.pop_style,
  pc.set_name,
  pc.image_url,
  pc.vault_status,
  pc.estimated_value,
  pc.display_description,
  pc.limited_edition,
  pc.limited_count,
  pc.edition_notes,
  pc.release_date,
  pc.pop_type;

grant select on public.user_collection_view to authenticated;
grant select on public.user_collection_summary_view to authenticated;
grant select on public.shared_shelf_collection_view to authenticated;
grant select on public.shared_shelf_grouped_collection_view to authenticated;
