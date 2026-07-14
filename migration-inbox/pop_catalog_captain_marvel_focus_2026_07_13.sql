-- Captain Marvel focused owned-set cleanup, 2026-07-13.
--
-- Scope:
-- - Fix two owned rows that were parsed as "Captain" instead of "Captain Marvel".
-- - Add those owned rows to the reviewed Captain Marvel completion checklist.
-- - Move the owned-scope Captain Marvel denominator from 3 to 5.
-- - Protect the corrected identities with active catalog_parser_overrides.
--
-- No ownership rows, quantities, conditions, paid values, current values, or images are changed.

with reviewed(upc, override_data, notes) as (
  values
    (
      '889698376853',
      jsonb_build_object(
        'pop_name', 'Captain Marvel',
        'character', 'Captain Marvel',
        'franchise', 'Marvel',
        'set_name', 'Captain Marvel',
        'set_total', 5,
        'number', '444',
        'variant', 'Glow in the Dark',
        'exclusivity', null,
        'pop_type', 'Pop! Marvel',
        'pop_style', 'Standard',
        'description', 'Captain Marvel is a Captain Marvel Pop! Marvel release #444, Glow in the Dark.',
        'display_description', 'Captain Marvel is a Captain Marvel Pop! Marvel release #444, Glow in the Dark.',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'Captain Marvel focus pass: corrected truncated Captain name and protected Glow in the Dark #444 identity.'
    ),
    (
      '889698552134',
      jsonb_build_object(
        'pop_name', 'Captain Marvel',
        'character', 'Captain Marvel',
        'franchise', 'Marvel',
        'set_name', 'Captain Marvel',
        'set_total', 5,
        'number', '908',
        'variant', 'Black Light',
        'exclusivity', null,
        'pop_type', 'Pop! Marvel',
        'pop_style', 'Standard',
        'description', 'Captain Marvel is a Captain Marvel Pop! Marvel release #908, Black Light.',
        'display_description', 'Captain Marvel is a Captain Marvel Pop! Marvel release #908, Black Light.',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'Captain Marvel focus pass: corrected truncated Captain name and protected Black Light #908 identity.'
    )
),
updated_catalog as (
  update public.pop_catalog pc
  set
    pop_name = r.override_data->>'pop_name',
    character = r.override_data->>'character',
    franchise = r.override_data->>'franchise',
    set_name = r.override_data->>'set_name',
    set_total = (r.override_data->>'set_total')::integer,
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
),
captain_marvel_set as (
  select id
  from public.pop_sets
  where canonical_name = 'Captain Marvel'
    and franchise = 'Marvel'
  limit 1
),
checklist_updates as (
  update public.pop_set_checklist_items psi
  set
    pop_catalog_id = pc.id,
    pop_name = pc.pop_name,
    character = pc.character,
    number = pc.number,
    variant = pc.variant,
    exclusivity = pc.exclusivity,
    pop_type = pc.pop_type,
    pop_style = pc.pop_style,
    is_required_for_completion = true,
    confidence = 0.90,
    notes = 'Captain Marvel focused owned-scope checklist item confirmed from UPC/title review.'
  from captain_marvel_set cms
  join public.pop_catalog pc on pc.upc in ('889698376853', '889698552134')
  where psi.set_id = cms.id
    and psi.upc = pc.upc
  returning psi.upc
),
checklist_inserts as (
  insert into public.pop_set_checklist_items (
    set_id,
    pop_catalog_id,
    upc,
    pop_name,
    character,
    number,
    variant,
    exclusivity,
    pop_type,
    pop_style,
    is_required_for_completion,
    source_url,
    confidence,
    notes
  )
  select
    cms.id,
    pc.id,
    pc.upc,
    pc.pop_name,
    pc.character,
    pc.number,
    pc.variant,
    pc.exclusivity,
    pc.pop_type,
    pc.pop_style,
    true,
    'https://funko.com',
    0.90,
    'Captain Marvel focused owned-scope checklist item confirmed from UPC/title review.'
  from captain_marvel_set cms
  join public.pop_catalog pc on pc.upc in ('889698376853', '889698552134')
  where not exists (
    select 1
    from public.pop_set_checklist_items existing
    where existing.set_id = cms.id
      and existing.upc = pc.upc
  )
  returning upc
),
set_total_update as (
  update public.pop_catalog
  set
    set_total = 5,
    parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
    needs_review = false,
    api_last_updated = now()
  where franchise = 'Marvel'
    and set_name = 'Captain Marvel'
    and upc in ('889698376853', '889698376877', '889698489027', '889698552134', '889698717519')
  returning upc
),
set_note_update as (
  update public.pop_sets
  set
    notes = 'Reviewed owned Captain Marvel completion denominator includes Captain Marvel #444 Glow in the Dark, Goose Flerken #445 Chase, Dark Captain Marvel #657, Captain Marvel #908 Black Light, and Captain Marvel (Fear Itself) #1263.',
    updated_at = now()
  where canonical_name = 'Captain Marvel'
    and franchise = 'Marvel'
  returning id
),
final_checklist_sync as (
  update public.pop_set_checklist_items psi
  set
    pop_catalog_id = pc.id,
    pop_name = pc.pop_name,
    character = pc.character,
    number = pc.number,
    variant = pc.variant,
    exclusivity = pc.exclusivity,
    pop_type = pc.pop_type,
    pop_style = pc.pop_style,
    is_required_for_completion = true,
    confidence = 0.90,
    notes = 'Captain Marvel focused owned-scope checklist item confirmed from UPC/title review.'
  from public.pop_sets ps, public.pop_catalog pc
  where psi.set_id = ps.id
    and pc.upc = psi.upc
    and ps.canonical_name = 'Captain Marvel'
    and ps.franchise = 'Marvel'
    and psi.upc in ('889698376853', '889698552134')
    and exists (select 1 from updated_catalog uc where uc.upc = psi.upc)
  returning psi.upc
)
select
  (select count(*) from updated_catalog) as corrected_catalog_rows,
  (select count(*) from protected_overrides) as protected_override_rows,
  ((select count(*) from checklist_updates) + (select count(*) from checklist_inserts)) as checklist_rows_added_or_updated,
  (select count(*) from final_checklist_sync) as checklist_rows_synced,
  (select count(*) from set_total_update) as set_total_rows_updated,
  (select count(*) from set_note_update) as set_notes_updated;
