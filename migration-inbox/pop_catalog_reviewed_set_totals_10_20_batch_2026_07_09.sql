-- Reviewed set total cleanup for 10-20 denominator/range batch, applied 2026-07-09.
--
-- Scope:
-- - Apply reviewed checklist counts for clean reviewed sets in the 10-20 range.
-- - Use existing reviewed pop_sets + pop_set_checklist_items as the source of truth.
-- - Do not change ownership, images, values, vault fields, franchise, set names, or item names.

with reviewed_totals(set_name, franchise, set_total) as (
  values
    ('Deadpool 30th', 'Marvel', 14),
    ('Deadpool Classic', 'Marvel', 13),
    ('Deadpool Parody', 'Marvel', 18),
    ('Encanto', 'Disney', 11)
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
