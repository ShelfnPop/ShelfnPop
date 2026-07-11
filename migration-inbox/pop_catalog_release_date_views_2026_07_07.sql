-- Expose pop_catalog.release_date through app-facing views, staged 2026-07-07.
-- Apply after migration-inbox/pop_catalog_release_date_field_2026_07_07.sql.

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
  coalesce(uci.quantity, 1::bigint)::numeric * coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric) as total_value,
  coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric) as total_cost,
  coalesce(uci.quantity, 1::bigint)::numeric * coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric) - coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric) as gain_loss,
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
where uci.user_id = (select auth.uid());

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
  sum(coalesce(uci.quantity, 1::bigint)::numeric * coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric)) as total_value,
  sum(coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric)) as total_cost,
  sum(
    coalesce(uci.quantity, 1::bigint)::numeric * coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric)
    - coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric)
  ) as gain_loss,
  max(uci.created_at) as newest_added_at,
  pc.limited_edition,
  pc.limited_count,
  pc.edition_notes,
  max(coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric)) as value_each,
  pc.release_date
from public.shared_shelves s
join public.shared_shelf_members member on member.shelf_id = s.id
left join public.profiles p on p.id = member.user_id
join public.user_collection_items uci on uci.user_id = member.user_id
join public.pop_catalog pc on pc.id = uci.pop_catalog_id
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
  pc.release_date;

create or replace view public.shared_public_wishlist_view
with (security_invoker = true)
as
select
  wi.id,
  wi.user_id,
  wi.pop_catalog_id,
  wi.priority,
  wi.notes,
  wi.created_at,
  p.display_name as owner_display_name,
  p.username as owner_username,
  p.avatar_url as owner_avatar_url,
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
  pc.pop_type,
  pc.release_date
from public.wishlist_items wi
join public.profiles p on p.id = wi.user_id
join public.pop_catalog pc on pc.id = wi.pop_catalog_id
where coalesce(p.is_public, false)
  and private.can_view_collection_owner(wi.user_id, (select auth.uid()));

grant select on public.user_collection_view to authenticated;
grant select on public.shared_shelf_grouped_collection_view to authenticated;
grant select on public.shared_public_wishlist_view to authenticated;
