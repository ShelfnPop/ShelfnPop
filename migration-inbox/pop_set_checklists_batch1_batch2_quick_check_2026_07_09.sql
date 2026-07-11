-- Batch 1/2 quick-check repair, 2026-07-09.
-- Applied directly to Supabase.
--
-- Scope:
-- - Batch 1: DC Comics, DC Superheroes, Doctor Strange, Fallout (TV Show).
-- - Batch 2: Justice League, NSYNC, Office Space, Star Trek Beyond.
--
-- Findings:
-- - Fallout (TV Show), NSYNC, Office Space, and Star Trek Beyond already had
--   reviewed pop_sets/checklist records, but their live pop_catalog rows were
--   still missing set_total values.
-- - Doctor Strange is a clean 13-item Pop! Vinyl checklist by FigureRealm.
-- - DC Superheroes is a clean 6-owned-row denominator here: the 2015 wave
--   Firestorm #91, Black Manta #92, Supergirl #93, Power Girl #94, Cyborg #95,
--   plus the Cyborg #95 Glow in the Dark / Entertainment Earth variant.
-- - DC Comics and broad Justice League remain mixed buckets and were not
--   stamped with broad totals.
--
-- Sources:
-- - FigureRealm Doctor Strange checklist:
--   https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1492
-- - CBR 2015 DC wave summary:
--   https://www.cbr.com/funko-adds-supergirl-power-girl-and-more-to-dc-pop-vinyl-line/
-- - Cyborg GITD retailer cross-check:
--   https://grumpybobsonline.com/products/pop-heroes-95-dc-super-heroes-cyborg-glows-in-the-dark-entertainment-earth-exclusive-funko-pop-figure-and-box-w-protector

with target(set_name, franchise, expected_total) as (
  values
    ('Fallout (TV Show)', 'Fallout', 10),
    ('NSYNC', '*NSYNC', 6),
    ('Office Space', 'Office Space', 6),
    ('Star Trek Beyond', 'Star Trek', 11),
    ('Doctor Strange', 'Marvel', 13),
    ('DC Superheroes', 'DC', 6)
)
update public.pop_catalog pc
set set_total = target.expected_total
from target
where lower(pc.set_name) = lower(target.set_name)
  and lower(pc.franchise) = lower(target.franchise)
  and (pc.set_total is null or pc.set_total <> target.expected_total);
