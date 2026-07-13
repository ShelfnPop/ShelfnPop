-- Shelf-n-Pop catalog health follow-up: Sinister Six missing-set repair.
-- Project: vwlnlgqxjamkukssuajt
--
-- Scope:
--   Five exact UPCs from the 2026-07-13 weekly health check where Marvel
--   Sinister Six rows had null set_name but high parse_confidence.
--
-- Source basis:
--   Official Funko product pages describe this as the Marvel Sinister Six
--   Pop! Deluxe series, comprised of 7 figures, sold through Amazon, with
--   box numbers 1013, 1014, 1016, 1017, and 1018 for this batch.
--
-- Safety:
--   Exact UPC list only. No deletes. Inserts/upserts active
--   catalog_parser_overrides so future lookup_pop refreshes preserve the
--   reviewed identity without an Edge Function deploy.

with reviewed(upc, override_data, notes) as (
  values
    (
      '889698609029',
      jsonb_build_object(
        'pop_name', 'Doctor Octopus',
        'character', 'Doctor Octopus',
        'franchise', 'Marvel',
        'set_name', 'Sinister Six',
        'set_total', 7,
        'number', '1013',
        'variant', null,
        'exclusivity', 'Amazon',
        'pop_type', 'Pop! Deluxe',
        'pop_style', 'Deluxe',
        'description', 'Doctor Octopus belongs to the Marvel Sinister Six Pop! Deluxe series as #1013.',
        'display_description', 'Doctor Octopus belongs to the Marvel Sinister Six Pop! Deluxe series as #1013.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 weekly health follow-up; official Funko Sinister Six Pop! Deluxe series.'
    ),
    (
      '889698609036',
      jsonb_build_object(
        'pop_name', 'Vulture',
        'character', 'Vulture',
        'franchise', 'Marvel',
        'set_name', 'Sinister Six',
        'set_total', 7,
        'number', '1014',
        'variant', null,
        'exclusivity', 'Amazon',
        'pop_type', 'Pop! Deluxe',
        'pop_style', 'Deluxe',
        'description', 'Vulture belongs to the Marvel Sinister Six Pop! Deluxe series as #1014.',
        'display_description', 'Vulture belongs to the Marvel Sinister Six Pop! Deluxe series as #1014.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 weekly health follow-up; official Funko Sinister Six Pop! Deluxe series.'
    ),
    (
      '889698609050',
      jsonb_build_object(
        'pop_name', 'Mysterio',
        'character', 'Mysterio',
        'franchise', 'Marvel',
        'set_name', 'Sinister Six',
        'set_total', 7,
        'number', '1016',
        'variant', null,
        'exclusivity', 'Amazon',
        'pop_type', 'Pop! Deluxe',
        'pop_style', 'Deluxe',
        'description', 'Mysterio belongs to the Marvel Sinister Six Pop! Deluxe series as #1016.',
        'display_description', 'Mysterio belongs to the Marvel Sinister Six Pop! Deluxe series as #1016.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 weekly health follow-up; official Funko Sinister Six Pop! Deluxe series.'
    ),
    (
      '889698609067',
      jsonb_build_object(
        'pop_name', 'Electro',
        'character', 'Electro',
        'franchise', 'Marvel',
        'set_name', 'Sinister Six',
        'set_total', 7,
        'number', '1017',
        'variant', null,
        'exclusivity', 'Amazon',
        'pop_type', 'Pop! Deluxe',
        'pop_style', 'Deluxe',
        'description', 'Electro belongs to the Marvel Sinister Six Pop! Deluxe series as #1017.',
        'display_description', 'Electro belongs to the Marvel Sinister Six Pop! Deluxe series as #1017.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 weekly health follow-up; official Funko Sinister Six Pop! Deluxe series.'
    ),
    (
      '889698609074',
      jsonb_build_object(
        'pop_name', 'Kraven the Hunter',
        'character', 'Kraven the Hunter',
        'franchise', 'Marvel',
        'set_name', 'Sinister Six',
        'set_total', 7,
        'number', '1018',
        'variant', null,
        'exclusivity', 'Amazon',
        'pop_type', 'Pop! Deluxe',
        'pop_style', 'Deluxe',
        'description', 'Kraven the Hunter belongs to the Marvel Sinister Six Pop! Deluxe series as #1018.',
        'display_description', 'Kraven the Hunter belongs to the Marvel Sinister Six Pop! Deluxe series as #1018.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 weekly health follow-up; official Funko Sinister Six Pop! Deluxe series.'
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
    parse_reason_codes = '{}'::text[],
    api_last_updated = now()
  from reviewed r
  where pc.upc = r.upc
  returning pc.id, pc.upc
),
upserted_overrides as (
  insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
  select r.upc, u.id, r.override_data, r.notes, true
  from reviewed r
  join updated_catalog u using (upc)
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
  (select count(*) from updated_catalog) as catalog_rows_updated,
  (select count(*) from upserted_overrides) as active_overrides_upserted;

-- Follow-up verification.
select
  pc.upc,
  pc.pop_name,
  pc.character,
  pc.franchise,
  pc.set_name,
  pc.set_total,
  pc.number,
  pc.exclusivity,
  pc.pop_type,
  pc.pop_style,
  pc.needs_review,
  cpo.is_active as parser_override_active,
  cpo.override_data->>'set_name' as override_set_name,
  cpo.override_data->>'pop_style' as override_pop_style
from public.pop_catalog pc
left join public.catalog_parser_overrides cpo
  on cpo.upc = pc.upc
where pc.upc in (
  '889698609029',
  '889698609036',
  '889698609050',
  '889698609067',
  '889698609074'
)
order by pc.number;
