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
  pc.edition_notes
from public.user_collection_items uci
join public.pop_catalog pc on pc.id = uci.pop_catalog_id
where uci.user_id = (select auth.uid());

create or replace view public.user_collection_summary_view
with (security_invoker = true)
as
select
  uci.user_id,
  count(distinct uci.pop_catalog_id) as unique_items,
  coalesce(sum(coalesce(uci.quantity, 1::bigint)), 0::numeric) as total_quantity,
  coalesce(sum((coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.current_value, pc.estimated_value, 0::numeric))), 0::numeric) as total_collection_value,
  coalesce(sum((coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric))), 0::numeric) as total_purchase_cost,
  coalesce(sum((coalesce(uci.quantity, 1::bigint)::numeric * (coalesce(uci.current_value, pc.estimated_value, 0::numeric) - coalesce(uci.purchase_price, 0::numeric)))), 0::numeric) as total_gain_loss
from public.user_collection_items uci
join public.pop_catalog pc on pc.id = uci.pop_catalog_id
where uci.user_id = (select auth.uid())
group by uci.user_id;
