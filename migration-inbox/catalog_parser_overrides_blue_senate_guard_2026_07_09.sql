-- Blue Senate Guard parser durability, staged 2026-07-09.
-- Source support:
--   * Figure Realm item page lists Blue Senate Guard #98 under Star Wars - Attack of the Clones
--     and marks it as Galactic Convention / Star Wars Celebration exclusive.
--   * Figure Realm Attack of the Clones checklist includes Blue Senate Guard #98 in that movie set.
-- Scope:
--   * Protect exact identity and set placement for UPC 849803087159.
--   * Keep exclusivity narrowed to Galactic Convention for now to match the more common market labeling.
--   * Match the live public.catalog_parser_overrides table shape used in production.

insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
values (
  '849803087159',
  (select id from public.pop_catalog where upc = '849803087159' limit 1),
  jsonb_build_object(
    'pop_name','Blue Senate Guard',
    'character','Blue Senate Guard',
    'franchise','Star Wars',
    'set_name','Star Wars: Attack of the Clones',
    'number','98',
    'exclusivity','Galactic Convention',
    'pop_type','Pop! Star Wars',
    'pop_style','Standard',
    'description','Blue Senate Guard is a Star Wars: Attack of the Clones Pop! release #98, Galactic Convention exclusive.',
    'display_description','Blue Senate Guard is a Star Wars: Attack of the Clones Pop! release #98, Galactic Convention exclusive.',
    'parse_confidence',0.98,
    'needs_review',false
  ),
  'Attack of the Clones checklist-backed override.',
  true
)
on conflict (upc) do update
set
  pop_catalog_id = excluded.pop_catalog_id,
  override_data = excluded.override_data,
  notes = excluded.notes,
  is_active = excluded.is_active;
