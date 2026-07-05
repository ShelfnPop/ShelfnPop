create or replace view public.shared_public_profile_summary_view
with (security_invoker = true) as
select
  uci.user_id,
  count(distinct (uci.pop_catalog_id::text || '::' || lower(coalesce(nullif(btrim(uci.owned_variant), ''), nullif(btrim(pc.variant), ''), 'Common'))))::int as unique_items,
  coalesce(sum(coalesce(uci.quantity, 1)), 0)::int as total_pops,
  coalesce(sum(coalesce(uci.quantity, 1)::numeric * coalesce(nullif(uci.current_value, 0), pc.estimated_value, 0)), 0)::numeric(12,2) as total_collection_value,
  coalesce(sum(coalesce(uci.quantity, 1)::numeric * coalesce(uci.purchase_price, 0)), 0)::numeric(12,2) as total_paid,
  coalesce(sum(coalesce(uci.quantity, 1)::numeric * (coalesce(nullif(uci.current_value, 0), pc.estimated_value, 0) - coalesce(uci.purchase_price, 0))), 0)::numeric(12,2) as total_gain_loss
from public.user_collection_items uci
join public.pop_catalog pc on pc.id = uci.pop_catalog_id
join public.profiles p on p.id = uci.user_id
where coalesce(p.is_public, false)
  and private.can_view_collection_owner(uci.user_id, (select auth.uid()))
group by uci.user_id;

grant select on public.shared_public_profile_summary_view to authenticated;
