-- Chewbacca #06 parser durability, staged 2026-07-09.
-- Source support:
--   * Figure Realm Empire Strikes Back checklist includes `Chewbacca #06`.
--   * Figure Realm A New Hope checklist includes the distinct row `Chewbacca (Hoth) #06`,
--     which supports treating plain `Chewbacca #06` as the Empire Strikes Back row.
--   * Funko From the Vault confirms item number 2324 / box number 6 for the core Chewbacca release.
-- Scope:
--   * Protect exact identity and reviewed movie-set placement for UPC 830395023243.
--   * Deliberately leave variant/exclusivity unset because market listings around this UPC are noisy.
--   * Match the live public.catalog_parser_overrides table shape used in production.

insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
values (
  '830395023243',
  (select id from public.pop_catalog where upc = '830395023243' limit 1),
  jsonb_build_object(
    'pop_name','Chewbacca',
    'character','Chewbacca',
    'franchise','Star Wars',
    'set_name','Star Wars: The Empire Strikes Back',
    'number','06',
    'pop_type','Pop! Star Wars',
    'pop_style','Standard',
    'description','Chewbacca belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #06.',
    'display_description','Chewbacca belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #06.',
    'parse_confidence',0.98,
    'needs_review',false
  ),
  'Conservative base-identity override for Chewbacca #06.',
  true
)
on conflict (upc) do update
set
  pop_catalog_id = excluded.pop_catalog_id,
  override_data = excluded.override_data,
  notes = excluded.notes,
  is_active = excluded.is_active;
