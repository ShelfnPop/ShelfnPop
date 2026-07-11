-- Small reviewed set total cleanup batch 3, applied 2026-07-09.
--
-- Scope:
-- - Apply reviewed checklist counts for sets with denominator <= 10.
-- - Use existing reviewed pop_sets + pop_set_checklist_items as the source of truth.
-- - Do not change ownership, images, values, vault fields, franchise, set names, or item names.

with reviewed_totals(set_name, franchise, set_total) as (
  values
    ('Deadpool', 'Marvel', 2),
    ('Deadpool Bucket List', 'Marvel', 4),
    ('Deadpool Legacy Collection', 'Marvel', 3),
    ('Deadpool Literary Classics', 'Marvel', 5),
    ('Deadpool Rides', 'Marvel', 4),
    ('Deadpool Seasons', 'Marvel', 4),
    ('Deadpool Shenanigans', 'Marvel', 6)
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

-- Corrective note: Captain Marvel is an owned-character scoped denominator.
-- Goose Flerken is in the broader Captain Marvel movie catalog bucket, but does
-- not belong in the reviewed owned-character denominator of 2.
update public.pop_catalog
set set_total = null
where franchise = 'Marvel'
  and set_name = 'Captain Marvel'
  and upc = '889698376877';
