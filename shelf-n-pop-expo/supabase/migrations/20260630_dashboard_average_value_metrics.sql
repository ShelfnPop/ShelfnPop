create or replace view public.dashboard_home_view
with (security_invoker = true) as
with wishlist_counts as (
  select
    wishlist_items.user_id,
    count(*)::integer as wishlist_count
  from public.wishlist_items
  where wishlist_items.user_id is not null
  group by wishlist_items.user_id
),
monthly_adds as (
  select
    uci.user_id,
    coalesce(sum(coalesce(uci.quantity, 1)), 0)::integer as pops_added_this_month,
    coalesce(
      sum(coalesce(uci.quantity, 1) * coalesce(uci.current_value, pc.estimated_value, 0)),
      0
    )::numeric as added_value_this_month
  from public.user_collection_items uci
  left join public.pop_catalog pc on pc.id = uci.pop_catalog_id
  where uci.user_id is not null
    and coalesce(uci.acquired_date, uci.created_at::date) >= date_trunc('month', current_date)::date
    and coalesce(uci.acquired_date, uci.created_at::date) < (date_trunc('month', current_date) + interval '1 month')::date
  group by uci.user_id
),
baseline_snapshot as (
  select distinct on (ds.user_id)
    ds.user_id,
    ds.snapshot_date as baseline_snapshot_date,
    ds.total_collection_value as baseline_collection_value
  from public.dashboard_snapshots ds
  where ds.snapshot_date < date_trunc('month', current_date)::date
  order by ds.user_id, ds.snapshot_date desc
),
base as (
  select
    p.id as user_id,
    coalesce(nullif(p.display_name, ''), nullif(p.username, ''), 'Collector') as display_name,
    coalesce(s.unique_items, 0) as unique_items,
    coalesce(s.total_quantity, 0)::bigint as total_pops,
    coalesce(s.total_collection_value, 0)::numeric(12,2) as total_collection_value,
    coalesce(s.total_purchase_cost, 0)::numeric(12,2) as total_paid,
    coalesce(s.total_gain_loss, 0)::numeric(12,2) as gain_loss,
    coalesce(w.wishlist_count, 0) as wishlist_count,
    coalesce(m.pops_added_this_month, 0) as pops_added_this_month,
    coalesce(m.added_value_this_month, 0)::numeric as added_value_this_month,
    b.baseline_snapshot_date,
    b.baseline_collection_value
  from public.profiles p
  left join public.user_collection_summary_view s on s.user_id = p.id
  left join wishlist_counts w on w.user_id = p.id
  left join monthly_adds m on m.user_id = p.id
  left join baseline_snapshot b on b.user_id = p.id
  where p.id = auth.uid()
),
calc as (
  select
    base.user_id,
    base.display_name,
    base.unique_items,
    base.total_pops,
    base.total_collection_value,
    base.total_paid,
    base.gain_loss,
    base.wishlist_count,
    base.pops_added_this_month,
    base.added_value_this_month,
    base.baseline_snapshot_date,
    base.baseline_collection_value,
    case
      when base.total_pops = 0 then null::numeric
      else round(base.total_paid / base.total_pops, 2)
    end as average_paid_per_pop,
    case
      when base.total_pops = 0 then null::numeric
      else round(base.total_collection_value / base.total_pops, 2)
    end as average_value_per_pop,
    'Welcome back, ' || base.display_name as greeting_text,
    case
      when base.baseline_collection_value is null then base.added_value_this_month
      else base.total_collection_value - base.baseline_collection_value
    end as monthly_value_change,
    case
      when base.baseline_collection_value is null or base.baseline_collection_value = 0 then null::numeric
      else round((base.total_collection_value - base.baseline_collection_value) / base.baseline_collection_value * 100, 1)
    end as monthly_value_change_percent,
    case
      when base.total_paid = 0 then null::numeric
      else round(base.gain_loss / base.total_paid * 100, 1)
    end as gain_loss_percent
  from base
)
select
  user_id,
  display_name,
  greeting_text,
  case
    when total_pops > 0 and gain_loss_percent is not null and gain_loss > 0 then 'Your shelf is up ' || gain_loss_percent || '% overall.'
    when total_pops > 0 and gain_loss_percent is not null and gain_loss < 0 then 'Your shelf is down ' || abs(gain_loss_percent) || '% overall.'
    when baseline_snapshot_date is null and pops_added_this_month > 0 then 'You added ' || pops_added_this_month || case when pops_added_this_month = 1 then ' Pop this month.' else ' Pops this month.' end
    when monthly_value_change_percent is null then 'Track your shelf, value, and collection.'
    when monthly_value_change > 0 then 'Your collection value is up ' || monthly_value_change_percent || '% this month.'
    when monthly_value_change < 0 then 'Your collection value is down ' || abs(monthly_value_change_percent) || '% this month.'
    else 'Your collection value is steady this month.'
  end as insight_text,
  unique_items,
  total_pops,
  total_collection_value,
  total_paid,
  gain_loss,
  gain_loss_percent,
  wishlist_count,
  pops_added_this_month,
  baseline_snapshot_date,
  baseline_collection_value,
  monthly_value_change,
  monthly_value_change_percent,
  current_date as generated_date,
  average_paid_per_pop,
  average_value_per_pop
from calc;
