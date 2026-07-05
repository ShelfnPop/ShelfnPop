-- Group shared shelf collections so the same Pop appears once with all owners listed.

create or replace view public.shared_shelf_grouped_collection_view as
select
  s.id as shelf_id,
  s.name as shelf_name,
  s.invite_code,
  uci.pop_catalog_id,
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
  pc.display_description,
  sum(coalesce(uci.quantity, 1))::bigint as total_quantity,
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
  sum(coalesce(uci.quantity, 1)::numeric * coalesce(nullif(uci.current_value, 0), pc.estimated_value, 0)) as total_value,
  sum(coalesce(uci.quantity, 1)::numeric * coalesce(uci.purchase_price, 0)) as total_cost,
  sum(
    (coalesce(uci.quantity, 1)::numeric * coalesce(nullif(uci.current_value, 0), pc.estimated_value, 0))
    - (coalesce(uci.quantity, 1)::numeric * coalesce(uci.purchase_price, 0))
  ) as gain_loss,
  max(uci.created_at) as newest_added_at
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
  pc.display_description;

grant select on public.shared_shelf_grouped_collection_view to authenticated;
