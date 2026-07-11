-- Small reviewed set total cleanup batch 2, applied 2026-07-09.
--
-- Scope:
-- - Apply reviewed checklist counts from public.pop_sets + public.pop_set_checklist_items
--   to additional small buckets whose rows still lacked set_total.
-- - Do not change ownership, images, values, vault fields, franchise, or set names.

with reviewed_totals(set_name, franchise, set_total) as (
  values
    ('Batman Forever', 'DC', 5),
    ('Loki Season 2', 'Marvel', 10),
    ('Zoolander', 'Zoolander', 4)
)
update public.pop_catalog pc
set
  set_total = rt.set_total,
  parse_confidence = greatest(coalesce(pc.parse_confidence, 0), 0.90),
  needs_review = false
from reviewed_totals rt
where pc.set_name = rt.set_name
  and pc.franchise = rt.franchise
  and pc.set_total is null;
