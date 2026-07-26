alter table public.user_collection_items
  add column if not exists signed_estimated_value_low numeric,
  add column if not exists signed_estimated_value_median numeric,
  add column if not exists signed_estimated_value_high numeric,
  add column if not exists signed_value_confidence text
    check (signed_value_confidence is null or signed_value_confidence in ('low', 'medium', 'high')),
  add column if not exists signed_value_source text,
  add column if not exists signed_value_last_checked timestamptz;

with signed_inputs as (
  select
    uci.id,
    coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric) as base_value,
    greatest(
      coalesce(
        uci.signed_value_boost_percent,
        case
          when coalesce(uci.signature_personalized, false) then 10
          when uci.signature_authentication ~* '^(jsa|beckett|psa|funko event|convention coa)$' then 30
          when uci.signature_authentication ~* '^unknown$' then 15
          else 15
        end
      ),
      0
    ) as premium_percent
  from public.user_collection_items uci
  join public.pop_catalog pc on pc.id = uci.pop_catalog_id
  where coalesce(uci.signed, false)
),
signed_estimates as (
  select
    id,
    base_value,
    premium_percent,
    round(base_value * (1 + premium_percent / 100), 2) as median_value,
    greatest(0.18, least(0.35, 0.24 + premium_percent / 500)) as range_spread
  from signed_inputs
  where base_value > 0
)
update public.user_collection_items uci
set
  signed_estimated_value_low = round(se.median_value * (1 - se.range_spread), 2),
  signed_estimated_value_median = se.median_value,
  signed_estimated_value_high = round(se.median_value * (1 + se.range_spread), 2),
  signed_value_confidence = case
    when coalesce(uci.signature_personalized, false) then 'medium'
    when uci.signature_authentication ~* '^(jsa|beckett|psa)$' then 'high'
    when uci.signature_authentication ~* '^(funko event|convention coa)$' then 'medium'
    else 'low'
  end,
  signed_value_source = 'app_estimate',
  signed_value_last_checked = now()
from signed_estimates se
where se.id = uci.id
  and (
    uci.signed_estimated_value_median is null
    or uci.signed_value_source is null
    or uci.signed_value_source = 'app_estimate'
  );

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
  coalesce(signed_value.signed_median, base_value.value_each) as value_each,
  coalesce(uci.purchase_price, 0::numeric) as cost_each,
  (coalesce(uci.quantity, 1::bigint)::numeric * coalesce(signed_value.signed_median, base_value.value_each)) as total_value,
  (coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric)) as total_cost,
  ((coalesce(uci.quantity, 1::bigint)::numeric * coalesce(signed_value.signed_median, base_value.value_each)) - (coalesce(uci.quantity, 1::bigint)::numeric * coalesce(uci.purchase_price, 0::numeric))) as gain_loss,
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
  uci.trade_notes,
  signed_value.signed_low as signed_estimated_value_low,
  signed_value.signed_median as signed_estimated_value_median,
  signed_value.signed_high as signed_estimated_value_high,
  case when coalesce(uci.signed, false) then uci.signed_value_confidence else null end as signed_value_confidence,
  case when coalesce(uci.signed, false) then uci.signed_value_source else null end as signed_value_source,
  case when coalesce(uci.signed, false) then uci.signed_value_last_checked else null end as signed_value_last_checked
from public.user_collection_items uci
join public.pop_catalog pc on pc.id = uci.pop_catalog_id
cross join lateral (
  select coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric) as value_each
) base_value
cross join lateral (
  select
    case when coalesce(uci.signed, false) then nullif(uci.signed_estimated_value_low, 0::numeric) else null end as signed_low,
    case when coalesce(uci.signed, false) then nullif(uci.signed_estimated_value_median, 0::numeric) else null end as signed_median,
    case when coalesce(uci.signed, false) then nullif(uci.signed_estimated_value_high, 0::numeric) else null end as signed_high
) signed_value
where uci.user_id = (select auth.uid());

create or replace view public.user_collection_summary_view
with (security_invoker = true)
as
select
  uci.user_id,
  count(distinct (
    uci.pop_catalog_id::text || '::' || lower(coalesce(nullif(btrim(uci.owned_variant), ''), nullif(btrim(pc.variant), ''), 'Common'))
  )) as unique_items,
  coalesce(sum(coalesce(uci.quantity, 1)), 0::numeric) as total_quantity,
  coalesce(
    sum(coalesce(uci.quantity, 1)::numeric * coalesce(signed_value.signed_median, base_value.value_each)),
    0::numeric
  ) as total_collection_value,
  coalesce(
    sum(coalesce(uci.quantity, 1)::numeric * coalesce(uci.purchase_price, 0::numeric)),
    0::numeric
  ) as total_purchase_cost,
  coalesce(
    sum(
      coalesce(uci.quantity, 1)::numeric
      * (coalesce(signed_value.signed_median, base_value.value_each) - coalesce(uci.purchase_price, 0::numeric))
    ),
    0::numeric
  ) as total_gain_loss
from public.user_collection_items uci
join public.pop_catalog pc on pc.id = uci.pop_catalog_id
cross join lateral (
  select coalesce(nullif(uci.current_value, 0::numeric), pc.estimated_value, 0::numeric) as value_each
) base_value
cross join lateral (
  select case
    when coalesce(uci.signed, false) then nullif(uci.signed_estimated_value_median, 0::numeric)
    else null
  end as signed_median
) signed_value
where uci.user_id = (select auth.uid())
group by uci.user_id;
