create or replace view public.user_collection_summary_view as
select
  uci.user_id,
  count(distinct uci.pop_catalog_id) as unique_items,
  coalesce(sum(coalesce(uci.quantity, 1)), 0::numeric) as total_quantity,
  coalesce(
    sum(
      coalesce(uci.quantity, 1)::numeric
      * coalesce(nullif(uci.current_value, 0), pc.estimated_value, 0::numeric)
    ),
    0::numeric
  ) as total_collection_value,
  coalesce(
    sum(coalesce(uci.quantity, 1)::numeric * coalesce(uci.purchase_price, 0::numeric)),
    0::numeric
  ) as total_purchase_cost,
  coalesce(
    sum(
      coalesce(uci.quantity, 1)::numeric
      * (
        coalesce(nullif(uci.current_value, 0), pc.estimated_value, 0::numeric)
        - coalesce(uci.purchase_price, 0::numeric)
      )
    ),
    0::numeric
  ) as total_gain_loss
from public.user_collection_items uci
join public.pop_catalog pc on pc.id = uci.pop_catalog_id
where uci.user_id = (select auth.uid())
group by uci.user_id;
