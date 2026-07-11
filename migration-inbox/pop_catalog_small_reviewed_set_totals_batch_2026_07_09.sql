-- Small reviewed set total cleanup batch, applied 2026-07-09.
--
-- Scope:
-- - Apply reviewed checklist counts from public.pop_sets + public.pop_set_checklist_items
--   to small catalog buckets whose rows still lacked set_total.
-- - Correct one obvious franchise mismatch for Podcast #927 in Ghostbusters: Afterlife.
-- - Do not change ownership, images, values, or vault fields.

with reviewed_totals(set_name, franchise, set_total) as (
  values
    ('Boyz II Men', 'Boyz II Men', 3),
    ('Clueless', 'Clueless', 7),
    ('Despicable Me 3', 'Despicable Me', 11),
    ('Dirty Dancing', 'Dirty Dancing', 4),
    ('E.T. 40th Anniversary', 'E.T.', 8),
    ('Edward Scissorhands', 'Edward Scissorhands', 9),
    ('Forrest Gump', 'Forrest Gump', 5),
    ('Ghostbusters: Afterlife', 'Ghostbusters', 20),
    ('Legally Blonde', 'Legally Blonde', 4),
    ('Lost', 'Lost', 7),
    ('Monty Python And The Holy Grail', 'Monty Python And The Holy Grail', 6),
    ('New Kids On The Block', 'New Kids on the Block', 5),
    ('Saved By The Bell', 'Saved by the Bell', 9),
    ('Scrubs', 'Scrubs', 4),
    ('Super Troopers', 'Super Troopers', 5),
    ('The Princess Bride', 'The Princess Bride', 5),
    ('Willow', 'Willow', 5)
)
update public.pop_catalog pc
set
  set_total = rt.set_total,
  franchise = case
    when pc.upc = '889698480253' and pc.set_name = 'Ghostbusters: Afterlife' then 'Ghostbusters'
    else pc.franchise
  end,
  parse_confidence = greatest(coalesce(pc.parse_confidence, 0), 0.90),
  needs_review = false
from reviewed_totals rt
where pc.set_name = rt.set_name
  and (
    pc.franchise = rt.franchise
    or (pc.upc = '889698480253' and pc.set_name = 'Ghostbusters: Afterlife')
  )
  and pc.set_total is null;
