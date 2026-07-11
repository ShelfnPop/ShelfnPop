-- Star Wars generic-set completion follow-up, staged 2026-07-09.
-- Scope: finish the remaining reviewed Star Wars UPCs that still had plain `Star Wars`
-- set labels in parser overrides.
--
-- Evidence:
--   * Figure Realm Empire Strikes Back checklist includes `Dagobah Yoda #124`,
--     `Dagobah Yoda (Gold Chrome) #124`, and `Dagobah Yoda (Gold) #124`.
--   * Figure Realm Phantom Menace checklist includes the core `Darth Maul #9`.
--   * These overrides keep the existing UPC identities and only complete the movie-set placement.
--   * Match the live public.catalog_parser_overrides table shape used in production.

insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
values
(
  '889698430180',
  (select id from public.pop_catalog where upc = '889698430180' limit 1),
  jsonb_build_object(
    'pop_name','Yoda',
    'character','Yoda',
    'franchise','Star Wars',
    'set_name','Star Wars: The Empire Strikes Back',
    'number','124',
    'variant','Metallic Gold',
    'exclusivity','Walmart',
    'pop_type','Pop! Star Wars',
    'pop_style','Standard',
    'description','Yoda is a Star Wars: The Empire Strikes Back Pop! release #124, Walmart exclusive, metallic gold.',
    'display_description','Yoda is a Star Wars: The Empire Strikes Back Pop! release #124, Walmart exclusive, metallic gold.',
    'parse_confidence',0.98,
    'needs_review',false
  ),
  'Final reviewed set placement for metallic-gold Yoda.',
  true
),
(
  '889698430203',
  (select id from public.pop_catalog where upc = '889698430203' limit 1),
  jsonb_build_object(
    'pop_name','Darth Maul (Gold Metallic)',
    'character','Darth Maul',
    'franchise','Star Wars',
    'set_name','Star Wars: The Phantom Menace',
    'number','9',
    'variant','Metallic Gold',
    'exclusivity','Walmart',
    'vault_status','Vaulted',
    'pop_type','Pop! Star Wars',
    'pop_style','Standard',
    'description','Darth Maul (Gold Metallic) is a Star Wars: The Phantom Menace Pop! release #9, Walmart exclusive.',
    'display_description','Darth Maul (Gold Metallic) is a Star Wars: The Phantom Menace Pop! release #9, Walmart exclusive.',
    'parse_confidence',0.98,
    'needs_review',false
  ),
  'Final reviewed set placement for metallic-gold Darth Maul.',
  true
)
on conflict (upc) do update
set
  pop_catalog_id = excluded.pop_catalog_id,
  override_data = excluded.override_data,
  notes = excluded.notes,
  is_active = excluded.is_active;
