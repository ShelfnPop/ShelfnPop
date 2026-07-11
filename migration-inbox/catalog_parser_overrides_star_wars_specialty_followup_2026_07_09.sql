-- Star Wars specialty follow-up parser durability, staged 2026-07-09.
-- Scope: protect the reviewed Darth Maul metallic-gold identity in parser-backed learning.
-- Notes:
--   * `849803087159` Blue Senate Guard #98 is covered in its own later follow-up file.
--   * `830395023243` Chewbacca #06 is covered in its own later follow-up file.
--   * Match the live public.catalog_parser_overrides table shape used in production.

insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
values (
  '889698430203',
  (select id from public.pop_catalog where upc = '889698430203' limit 1),
  jsonb_build_object(
    'pop_name','Darth Maul (Gold Metallic)',
    'character','Darth Maul',
    'franchise','Star Wars',
    'set_name','Star Wars',
    'number','9',
    'variant','Metallic Gold',
    'exclusivity','Walmart',
    'vault_status','Vaulted',
    'pop_type','Pop! Star Wars',
    'pop_style','Standard',
    'description','Darth Maul (Gold Metallic) is a Star Wars Pop! release #9, Walmart exclusive.',
    'display_description','Darth Maul (Gold Metallic) is a Star Wars Pop! release #9, Walmart exclusive.',
    'parse_confidence',0.98,
    'needs_review',false
  ),
  'Protect metallic-gold Darth Maul identity before final set completion.',
  true
)
on conflict (upc) do update
set
  pop_catalog_id = excluded.pop_catalog_id,
  override_data = excluded.override_data,
  notes = excluded.notes,
  is_active = excluded.is_active;
