-- Reviewed set-total repair batch, 2026-07-08.
-- Goal: stamp already-reviewed checklist totals onto catalog rows that were
-- still missing set_total values.

with target(set_name, franchise, expected_total) as (
  values
    ('The Witcher', 'The Witcher', 20),
    ('Jurassic World: Dominion', 'Jurassic Park', 26),
    ('The Flash (2023)', 'DC', 16),
    ('Moon Knight', 'Marvel', 14),
    ('Zack Snyder''s Justice League', 'DC', 12)
)
update public.pop_catalog pc
set set_total = target.expected_total
from target
where lower(pc.set_name) = lower(target.set_name)
  and lower(pc.franchise) = lower(target.franchise)
  and (pc.set_total is null or pc.set_total <> target.expected_total);
