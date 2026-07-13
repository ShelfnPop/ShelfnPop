-- Shelf-n-Pop catalog health follow-up: Letterkenny missing-franchise repair.
-- Project: vwlnlgqxjamkukssuajt
--
-- Scope:
--   Five exact UPCs from the 2026-07-13 weekly health check where set_name was
--   already Letterkenny but franchise was null.
--
-- Source basis:
--   Official/retailer listings identify the rows as Letterkenny Pop!
--   Television figures and 2-packs.
--
-- Safety:
--   Exact UPC list only. No deletes. Upserts active catalog_parser_overrides
--   so lookup_pop keeps the reviewed identity on future refreshes.

with reviewed(upc, override_data, notes) as (
  values
    (
      '889698571258',
      jsonb_build_object(
        'pop_name', 'Daryl',
        'character', 'Daryl',
        'franchise', 'Letterkenny',
        'set_name', 'Letterkenny',
        'number', '1163',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Television',
        'pop_style', 'Standard',
        'description', 'Daryl belongs to the Letterkenny Pop! Television line as #1163.',
        'display_description', 'Daryl belongs to the Letterkenny Pop! Television line as #1163.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise batch; Letterkenny Daryl #1163.'
    ),
    (
      '889698571265',
      jsonb_build_object(
        'pop_name', 'Katy',
        'character', 'Katy',
        'franchise', 'Letterkenny',
        'set_name', 'Letterkenny',
        'number', '1164',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Television',
        'pop_style', 'Standard',
        'description', 'Katy belongs to the Letterkenny Pop! Television line as #1164.',
        'display_description', 'Katy belongs to the Letterkenny Pop! Television line as #1164.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise batch; Letterkenny Katy #1164.'
    ),
    (
      '889698571272',
      jsonb_build_object(
        'pop_name', 'Squirrelly Dan',
        'character', 'Squirrelly Dan',
        'franchise', 'Letterkenny',
        'set_name', 'Letterkenny',
        'number', '1165',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Television',
        'pop_style', 'Standard',
        'description', 'Squirrelly Dan belongs to the Letterkenny Pop! Television line as #1165.',
        'display_description', 'Squirrelly Dan belongs to the Letterkenny Pop! Television line as #1165.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise batch; Letterkenny Squirrelly Dan #1165.'
    ),
    (
      '889698601610',
      jsonb_build_object(
        'pop_name', 'Reilly & Jonesy 2-Pack',
        'character', 'Reilly & Jonesy',
        'franchise', 'Letterkenny',
        'set_name', 'Letterkenny',
        'number', null,
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Television',
        'pop_style', '2-Pack',
        'description', 'Reilly & Jonesy belongs to the Letterkenny Pop! Television 2-pack line.',
        'display_description', 'Reilly & Jonesy belongs to the Letterkenny Pop! Television 2-pack line.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise batch; Letterkenny Reilly & Jonesy 2-pack.'
    ),
    (
      '889698666800',
      jsonb_build_object(
        'pop_name', 'Stewart & Roald 2-Pack',
        'character', 'Stewart & Roald',
        'franchise', 'Letterkenny',
        'set_name', 'Letterkenny',
        'number', null,
        'variant', null,
        'exclusivity', 'GameStop',
        'pop_type', 'Pop! Television',
        'pop_style', '2-Pack',
        'description', 'Stewart & Roald belongs to the Letterkenny Pop! Television 2-pack line.',
        'display_description', 'Stewart & Roald belongs to the Letterkenny Pop! Television 2-pack line.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise batch; Letterkenny Stewart & Roald 2-pack.'
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
  pc.number,
  pc.variant,
  pc.exclusivity,
  pc.pop_type,
  pc.pop_style,
  pc.needs_review,
  pc.parse_reason_codes,
  cpo.is_active as parser_override_active,
  cpo.override_data->>'franchise' as override_franchise
from public.pop_catalog pc
left join public.catalog_parser_overrides cpo on cpo.upc = pc.upc
where pc.upc in (
  '889698571258',
  '889698571265',
  '889698571272',
  '889698601610',
  '889698666800'
)
order by pc.pop_style, pc.number nulls last, pc.pop_name;
