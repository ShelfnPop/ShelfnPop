-- Princess Leia #295 set follow-up, staged 2026-07-09.
-- Purpose:
-- - Align UPC 889698430173 with the reviewed Star Wars movie-set placement already
--   used for the matching gold-chrome Leia row.
-- - Match the live public.catalog_parser_overrides table shape used in production.

insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
values (
  '889698430173',
  (select id from public.pop_catalog where upc = '889698430173' limit 1),
  jsonb_build_object(
    'pop_name','Princess Leia',
    'character','Princess Leia',
    'franchise','Star Wars',
    'set_name','Star Wars: A New Hope',
    'number','295',
    'variant','Gold Chrome',
    'exclusivity','Galactic Convention / Hot Topic',
    'pop_type','Pop! Star Wars',
    'pop_style','Standard',
    'description','Princess Leia (Gold Chrome) belongs to the Star Wars: A New Hope Pop! Star Wars line as #295. This catalog entry tracks the Galactic Convention / Hot Topic exclusive.',
    'display_description','Princess Leia (Gold Chrome) belongs to the Star Wars: A New Hope Pop! Star Wars line as #295. This catalog entry tracks the Galactic Convention / Hot Topic exclusive.',
    'parse_confidence',0.98,
    'needs_review',false
  ),
  'Align gold-chrome Leia convention row with reviewed A New Hope set placement.',
  true
)
on conflict (upc) do update
set
  pop_catalog_id = excluded.pop_catalog_id,
  override_data = excluded.override_data,
  notes = excluded.notes,
  is_active = excluded.is_active;

select
  upc,
  override_data ->> 'set_name' as set_name,
  override_data ->> 'number' as number,
  override_data ->> 'variant' as variant,
  override_data ->> 'exclusivity' as exclusivity,
  override_data ->> 'needs_review' as needs_review
from public.catalog_parser_overrides
where upc = '889698430173';
