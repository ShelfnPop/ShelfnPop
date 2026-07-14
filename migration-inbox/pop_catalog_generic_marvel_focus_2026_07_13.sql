-- Generic Marvel focus cleanup, 2026-07-13.
--
-- Scope:
-- - Move owned J. Jonah Jameson #1057 out of the generic Marvel bucket and into Spider-Man.
-- - Protect the corrected set placement with an active catalog_parser_overrides row.
-- - Leave Scarlet Witch (Sketched Deco) #1575 in Marvel for now because official/retail sources
--   describe it as a broad Marvel sketched deco release, not a narrower canonical set.
--
-- No ownership rows, quantities, values, images, or review flags are changed.

with reviewed(upc, override_data, notes) as (
  values
    (
      '889698648073',
      jsonb_build_object(
        'pop_name', 'J. Jonah Jameson',
        'character', 'J. Jonah Jameson',
        'franchise', 'Marvel',
        'set_name', 'Spider-Man',
        'number', '1057',
        'variant', null,
        'exclusivity', 'Entertainment Earth',
        'pop_type', 'Pop! Marvel',
        'pop_style', 'Standard',
        'description', 'J. Jonah Jameson is a Spider-Man Pop! Marvel release #1057, Entertainment Earth exclusive.',
        'display_description', 'J. Jonah Jameson is a Spider-Man Pop! Marvel release #1057, Entertainment Earth exclusive.',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'Generic Marvel focus pass: moved J. Jonah Jameson #1057 to Spider-Man based on Funko/retail Spider-Man placement.'
    )
),
updated_catalog as (
  update public.pop_catalog pc
  set
    pop_name = r.override_data->>'pop_name',
    character = r.override_data->>'character',
    franchise = r.override_data->>'franchise',
    set_name = r.override_data->>'set_name',
    number = r.override_data->>'number',
    variant = r.override_data->>'variant',
    exclusivity = r.override_data->>'exclusivity',
    pop_type = r.override_data->>'pop_type',
    pop_style = r.override_data->>'pop_style',
    description = r.override_data->>'description',
    display_description = r.override_data->>'display_description',
    parse_confidence = (r.override_data->>'parse_confidence')::numeric,
    needs_review = (r.override_data->>'needs_review')::boolean,
    api_last_updated = now()
  from reviewed r
  where pc.upc = r.upc
  returning pc.id, pc.upc
),
protected_overrides as (
  insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
  select r.upc, uc.id, r.override_data, r.notes, true
  from reviewed r
  join updated_catalog uc on uc.upc = r.upc
  on conflict (upc) do update
  set
    pop_catalog_id = excluded.pop_catalog_id,
    override_data = excluded.override_data,
    notes = excluded.notes,
    is_active = true,
    updated_at = now()
  returning upc
)
select
  (select count(*) from updated_catalog) as catalog_rows_moved,
  (select count(*) from protected_overrides) as protected_override_rows;
