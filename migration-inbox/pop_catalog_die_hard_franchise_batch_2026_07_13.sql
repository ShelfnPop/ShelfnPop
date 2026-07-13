-- Shelf-n-Pop catalog health follow-up: Die Hard missing-franchise repair.
-- Project: vwlnlgqxjamkukssuajt
--
-- Scope:
--   Four exact UPCs from the 2026-07-13 weekly health check where set_name was
--   already Die Hard but franchise was null.
--
-- Source basis:
--   Official Funko Vault/retailer listings identify the rows as Die Hard
--   Pop! Movies figures.
--
-- Safety:
--   Exact UPC list only. No deletes. Upserts active catalog_parser_overrides
--   so lookup_pop keeps the reviewed identity on future refreshes.

with reviewed(upc, override_data, notes) as (
  values
    (
      '889698348713',
      jsonb_build_object(
        'pop_name', 'Al Powell',
        'character', 'Al Powell',
        'franchise', 'Die Hard',
        'set_name', 'Die Hard',
        'number', '668',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Movies',
        'pop_style', 'Standard',
        'description', 'Al Powell belongs to the Die Hard Pop! Movies line as #668.',
        'display_description', 'Al Powell belongs to the Die Hard Pop! Movies line as #668.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise batch; Die Hard Al Powell #668.'
    ),
    (
      '889698348706',
      jsonb_build_object(
        'pop_name', 'Tony Vreski',
        'character', 'Tony Vreski',
        'franchise', 'Die Hard',
        'set_name', 'Die Hard',
        'number', '671',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Movies',
        'pop_style', 'Standard',
        'description', 'Tony Vreski belongs to the Die Hard Pop! Movies line as #671.',
        'display_description', 'Tony Vreski belongs to the Die Hard Pop! Movies line as #671.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise batch; Die Hard Tony Vreski #671.'
    ),
    (
      '889698338691',
      jsonb_build_object(
        'pop_name', 'John McClane (Shirtless)',
        'character', 'John McClane',
        'franchise', 'Die Hard',
        'set_name', 'Die Hard',
        'number', '672',
        'variant', 'Shirtless',
        'exclusivity', 'Target',
        'pop_type', 'Pop! Movies',
        'pop_style', 'Standard',
        'description', 'John McClane (Shirtless) belongs to the Die Hard Pop! Movies line as #672.',
        'display_description', 'John McClane (Shirtless) belongs to the Die Hard Pop! Movies line as #672.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise batch; Die Hard John McClane Shirtless #672.'
    ),
    (
      '889698503310',
      jsonb_build_object(
        'pop_name', 'John McClane (Running on Glass)',
        'character', 'John McClane',
        'franchise', 'Die Hard',
        'set_name', 'Die Hard',
        'number', '1007',
        'variant', 'Running on Glass',
        'exclusivity', 'Walmart',
        'pop_type', 'Pop! Movies',
        'pop_style', 'Standard',
        'description', 'John McClane (Running on Glass) belongs to the Die Hard Pop! Movies line as #1007.',
        'display_description', 'John McClane (Running on Glass) belongs to the Die Hard Pop! Movies line as #1007.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise batch; Die Hard John McClane #1007 Walmart.'
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
  '889698348713',
  '889698348706',
  '889698338691',
  '889698503310'
)
order by pc.number;
