-- Shelf-n-Pop catalog health follow-up: missing-franchise cluster repair.
-- Project: vwlnlgqxjamkukssuajt
--
-- Scope:
--   Nine exact UPCs from the 2026-07-13 weekly health check where set_name was
--   already a source-verifiable franchise/line label but franchise was null.
--
-- Source basis:
--   Official Funko pages identify Hobbs & Shaw, Ozark, and Varsity Blues items
--   with matching item/box numbers. Figure Realm corroborates the Hobbs & Shaw
--   and Varsity Blues checklist totals.
--
-- Safety:
--   Exact UPC list only. No deletes. Upserts active catalog_parser_overrides
--   so lookup_pop keeps the reviewed identity on future refreshes.

with reviewed(upc, override_data, notes) as (
  values
    (
      '889698477529',
      jsonb_build_object(
        'pop_name', 'Shaw',
        'character', 'Shaw',
        'franchise', 'Hobbs & Shaw',
        'set_name', 'Hobbs & Shaw',
        'set_total', 4,
        'number', '920',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Movies',
        'pop_style', 'Standard',
        'description', 'Shaw belongs to the Hobbs & Shaw Pop! Movies line as #920.',
        'display_description', 'Shaw belongs to the Hobbs & Shaw Pop! Movies line as #920.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise cluster batch; Hobbs & Shaw Shaw #920.'
    ),
    (
      '889698477536',
      jsonb_build_object(
        'pop_name', 'Hobbs',
        'character', 'Hobbs',
        'franchise', 'Hobbs & Shaw',
        'set_name', 'Hobbs & Shaw',
        'set_total', 4,
        'number', '921',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Movies',
        'pop_style', 'Standard',
        'description', 'Hobbs belongs to the Hobbs & Shaw Pop! Movies line as #921.',
        'display_description', 'Hobbs belongs to the Hobbs & Shaw Pop! Movies line as #921.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise cluster batch; Hobbs & Shaw Hobbs #921.'
    ),
    (
      '889698477543',
      jsonb_build_object(
        'pop_name', 'Brixton',
        'character', 'Brixton',
        'franchise', 'Hobbs & Shaw',
        'set_name', 'Hobbs & Shaw',
        'set_total', 4,
        'number', '922',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Movies',
        'pop_style', 'Standard',
        'description', 'Brixton belongs to the Hobbs & Shaw Pop! Movies line as #922.',
        'display_description', 'Brixton belongs to the Hobbs & Shaw Pop! Movies line as #922.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise cluster batch; Hobbs & Shaw Brixton #922.'
    ),
    (
      '889698558013',
      jsonb_build_object(
        'pop_name', 'Marty Byrde',
        'character', 'Marty Byrde',
        'franchise', 'Ozark',
        'set_name', 'Ozark',
        'set_total', 3,
        'number', '1196',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Television',
        'pop_style', 'Standard',
        'description', 'Marty Byrde belongs to the Ozark Pop! Television line as #1196.',
        'display_description', 'Marty Byrde belongs to the Ozark Pop! Television line as #1196.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise cluster batch; Ozark Marty Byrde #1196.'
    ),
    (
      '889698558020',
      jsonb_build_object(
        'pop_name', 'Ruth Langmore',
        'character', 'Ruth Langmore',
        'franchise', 'Ozark',
        'set_name', 'Ozark',
        'set_total', 3,
        'number', '1197',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Television',
        'pop_style', 'Standard',
        'description', 'Ruth Langmore belongs to the Ozark Pop! Television line as #1197.',
        'display_description', 'Ruth Langmore belongs to the Ozark Pop! Television line as #1197.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise cluster batch; Ozark Ruth Langmore #1197.'
    ),
    (
      '889698558037',
      jsonb_build_object(
        'pop_name', 'Wendy Byrde',
        'character', 'Wendy Byrde',
        'franchise', 'Ozark',
        'set_name', 'Ozark',
        'set_total', 3,
        'number', '1198',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Television',
        'pop_style', 'Standard',
        'description', 'Wendy Byrde belongs to the Ozark Pop! Television line as #1198.',
        'display_description', 'Wendy Byrde belongs to the Ozark Pop! Television line as #1198.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise cluster batch; Ozark Wendy Byrde #1198.'
    ),
    (
      '889698802437',
      jsonb_build_object(
        'pop_name', 'Coach Kilmer',
        'character', 'Coach Kilmer',
        'franchise', 'Varsity Blues',
        'set_name', 'Varsity Blues',
        'set_total', 4,
        'number', '1868',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Movies',
        'pop_style', 'Standard',
        'description', 'Coach Kilmer belongs to the Varsity Blues Pop! Movies line as #1868.',
        'display_description', 'Coach Kilmer belongs to the Varsity Blues Pop! Movies line as #1868.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise cluster batch; Varsity Blues Coach Kilmer #1868.'
    ),
    (
      '889698802444',
      jsonb_build_object(
        'pop_name', 'Mox',
        'character', 'Mox',
        'franchise', 'Varsity Blues',
        'set_name', 'Varsity Blues',
        'set_total', 4,
        'number', '1869',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Movies',
        'pop_style', 'Standard',
        'description', 'Mox belongs to the Varsity Blues Pop! Movies line as #1869.',
        'display_description', 'Mox belongs to the Varsity Blues Pop! Movies line as #1869.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise cluster batch; Varsity Blues Mox #1869.'
    ),
    (
      '889698802451',
      jsonb_build_object(
        'pop_name', 'Charlie Tweeder',
        'character', 'Charlie Tweeder',
        'franchise', 'Varsity Blues',
        'set_name', 'Varsity Blues',
        'set_total', 4,
        'number', '1870',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Movies',
        'pop_style', 'Standard',
        'description', 'Charlie Tweeder belongs to the Varsity Blues Pop! Movies line as #1870.',
        'display_description', 'Charlie Tweeder belongs to the Varsity Blues Pop! Movies line as #1870.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-franchise cluster batch; Varsity Blues Charlie Tweeder #1870.'
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
  '889698477529',
  '889698477536',
  '889698477543',
  '889698558013',
  '889698558020',
  '889698558037',
  '889698802437',
  '889698802444',
  '889698802451'
)
order by pc.franchise, pc.number;
