-- Shelf-n-Pop catalog health follow-up: Black Mirror missing-franchise repair.
-- Project: vwlnlgqxjamkukssuajt
--
-- Scope:
--   Five exact UPCs from the 2026-07-13 weekly health check where set_name was
--   already Black Mirror but franchise was null.
--
-- Source basis:
--   Official Funko Vault and retailer listings identify the rows as Black
--   Mirror Pop! Television figures #941-#945.
--
-- Safety:
--   Exact UPC list only. No deletes. Upserts active catalog_parser_overrides
--   so lookup_pop keeps the reviewed identity on future refreshes.

with reviewed(upc, override_data, notes) as (
  values
    (
      '889698451758',
      jsonb_build_object(
        'pop_name', 'Kelly',
        'character', 'Kelly',
        'franchise', 'Black Mirror',
        'set_name', 'Black Mirror',
        'set_total', 5,
        'number', '941',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Television',
        'pop_style', 'Standard',
        'description', 'Kelly belongs to the Black Mirror Pop! Television line as #941.',
        'display_description', 'Kelly belongs to the Black Mirror Pop! Television line as #941.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise batch; Black Mirror Pop! Television #941.'
    ),
    (
      '889698451765',
      jsonb_build_object(
        'pop_name', 'Yorkie',
        'character', 'Yorkie',
        'franchise', 'Black Mirror',
        'set_name', 'Black Mirror',
        'set_total', 5,
        'number', '942',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Television',
        'pop_style', 'Standard',
        'description', 'Yorkie belongs to the Black Mirror Pop! Television line as #942.',
        'display_description', 'Yorkie belongs to the Black Mirror Pop! Television line as #942.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise batch; Black Mirror Pop! Television #942.'
    ),
    (
      '889698453639',
      jsonb_build_object(
        'pop_name', 'Robert Daly',
        'character', 'Robert Daly',
        'franchise', 'Black Mirror',
        'set_name', 'Black Mirror',
        'set_total', 5,
        'number', '943',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Television',
        'pop_style', 'Standard',
        'description', 'Robert Daly belongs to the Black Mirror Pop! Television line as #943.',
        'display_description', 'Robert Daly belongs to the Black Mirror Pop! Television line as #943.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise batch; Black Mirror Pop! Television #943.'
    ),
    (
      '889698453646',
      jsonb_build_object(
        'pop_name', 'Nanette Cole',
        'character', 'Nanette Cole',
        'franchise', 'Black Mirror',
        'set_name', 'Black Mirror',
        'set_total', 5,
        'number', '944',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Television',
        'pop_style', 'Standard',
        'description', 'Nanette Cole belongs to the Black Mirror Pop! Television line as #944.',
        'display_description', 'Nanette Cole belongs to the Black Mirror Pop! Television line as #944.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise batch; Black Mirror Pop! Television #944.'
    ),
    (
      '889698453660',
      jsonb_build_object(
        'pop_name', 'Ashley Too',
        'character', 'Ashley Too',
        'franchise', 'Black Mirror',
        'set_name', 'Black Mirror',
        'set_total', 5,
        'number', '945',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Television',
        'pop_style', 'Standard',
        'description', 'Ashley Too belongs to the Black Mirror Pop! Television line as #945.',
        'display_description', 'Ashley Too belongs to the Black Mirror Pop! Television line as #945.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise batch; Black Mirror Pop! Television #945.'
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
  set pop_catalog_id = excluded.pop_catalog_id,
      override_data = excluded.override_data,
      notes = excluded.notes,
      is_active = true,
      updated_at = now()
  returning upc
)
select
  (select count(*) from updated_catalog) as catalog_rows_updated,
  (select count(*) from upserted_overrides) as active_overrides_upserted;

select
  pc.upc,
  pc.pop_name,
  pc.character,
  pc.franchise,
  pc.set_name,
  pc.set_total,
  pc.number,
  pc.pop_type,
  pc.pop_style,
  pc.needs_review,
  pc.parse_reason_codes,
  cpo.is_active as parser_override_active,
  cpo.override_data->>'franchise' as override_franchise
from public.pop_catalog pc
left join public.catalog_parser_overrides cpo on cpo.upc = pc.upc
where pc.upc in (
  '889698451758',
  '889698451765',
  '889698453639',
  '889698453646',
  '889698453660'
)
order by pc.number;
