-- Show all member collection items inside a shared shelf.
-- The old shared view joined through user_collection_view, which is scoped to the
-- current signed-in user. This view reads collection rows directly, but still only
-- returns rows for shelves where the current user is a member.

create or replace view public.shared_shelf_collection_view as
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
  pc.upc,
  pc.pop_name,
  pc.character,
  pc.franchise,
  pc.number,
  pc.variant,
  pc.exclusivity,
  pc.pop_style,
  pc.set_name,
  pc.image_url,
  pc.vault_status,
  pc.estimated_value,
  coalesce(nullif(uci.current_value, 0), pc.estimated_value, 0) as value_each,
  (coalesce(uci.quantity, 1)::numeric * coalesce(nullif(uci.current_value, 0), pc.estimated_value, 0)) as total_value,
  (coalesce(uci.quantity, 1)::numeric * coalesce(uci.purchase_price, 0)) as total_cost,
  ((coalesce(uci.quantity, 1)::numeric * coalesce(nullif(uci.current_value, 0), pc.estimated_value, 0)) - (coalesce(uci.quantity, 1)::numeric * coalesce(uci.purchase_price, 0))) as gain_loss,
  coalesce(uci.owned_variant, pc.variant) as display_variant,
  pc.display_description,
  uci.created_at
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
);

grant select on public.shared_shelf_collection_view to authenticated;
