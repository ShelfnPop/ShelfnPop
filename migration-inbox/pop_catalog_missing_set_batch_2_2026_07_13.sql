-- Shelf-n-Pop catalog health follow-up: remaining missing-set repair.
-- Project: vwlnlgqxjamkukssuajt
--
-- Scope:
--   Six exact UPCs left with null set_name after the Sinister Six batch.
--
-- Source basis:
--   Official Funko/retailer pages confirm the Spider-Man Mash-Up, Spider-Man
--   Symbiote Bonding, WandaVision Scarlet Witch, and The Fairly OddParents
--   Cosmo & Wanda product identities.
--
-- Safety:
--   Exact UPC list only. No deletes. Upserts active catalog_parser_overrides
--   so lookup_pop keeps the reviewed identity on future refreshes.

with reviewed(upc, override_data, notes) as (
  values
    (
      '889698618199',
      jsonb_build_object(
        'pop_name', 'Scarlet Witch',
        'character', 'Scarlet Witch',
        'franchise', 'Marvel',
        'set_name', 'WandaVision',
        'number', '823',
        'exclusivity', 'Amazon / Marvel Collector Corps',
        'pop_type', 'Pop! Marvel',
        'pop_style', 'Standard',
        'description', 'Scarlet Witch belongs to the Marvel WandaVision Pop! line as #823.',
        'display_description', 'Scarlet Witch belongs to the Marvel WandaVision Pop! line as #823.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-set batch 2; Funko WandaVision Scarlet Witch #823.'
    ),
    (
      '889698853385',
      jsonb_build_object(
        'pop_name', 'Cosmo & Wanda as Goldfish',
        'character', 'Cosmo & Wanda',
        'franchise', 'The Fairly OddParents',
        'set_name', 'The Fairly OddParents',
        'number', '1693',
        'variant', 'As Goldfish',
        'exclusivity', 'Amazon',
        'pop_type', 'Pop! Moments',
        'pop_style', 'Moment',
        'description', 'Cosmo & Wanda as Goldfish belongs to The Fairly OddParents Pop! Moments line as #1693.',
        'display_description', 'Cosmo & Wanda as Goldfish belongs to The Fairly OddParents Pop! Moments line as #1693.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-set batch 2; Funko/Amazon Cosmo & Wanda as Goldfish #1693.'
    ),
    (
      '889698872508',
      jsonb_build_object(
        'pop_name', 'Spider-Man',
        'character', 'Spider-Man',
        'franchise', 'Marvel',
        'set_name', 'Spider-Man',
        'number', '1525',
        'variant', 'Symbiote Bonding',
        'exclusivity', 'GameStop',
        'pop_type', 'Pop! Marvel',
        'pop_style', 'Standard',
        'description', 'Spider-Man (Symbiote Bonding) belongs to the Marvel Spider-Man Pop! line as #1525.',
        'display_description', 'Spider-Man (Symbiote Bonding) belongs to the Marvel Spider-Man Pop! line as #1525.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-set batch 2; Funko Spider-Man Symbiote Bonding #1525.'
    ),
    (
      '889698951203',
      jsonb_build_object(
        'pop_name', 'Daredevil (Spider-Man Mash-Up)',
        'character', 'Daredevil',
        'franchise', 'Marvel',
        'set_name', 'Spider-Man Mash-Up',
        'set_total', 5,
        'number', '1603',
        'variant', 'Spider-Man Mash-Up',
        'exclusivity', 'Target',
        'pop_type', 'Pop! Marvel',
        'pop_style', 'Standard',
        'description', 'Daredevil (Spider-Man Mash-Up) belongs to the Marvel Spider-Man Mash-Up Pop! line as #1603.',
        'display_description', 'Daredevil (Spider-Man Mash-Up) belongs to the Marvel Spider-Man Mash-Up Pop! line as #1603.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-set batch 2; Funko/Target Spider-Man Mash-Up #1603.'
    ),
    (
      '889698951210',
      jsonb_build_object(
        'pop_name', 'Doctor Strange (Spider-Man Mash-Up)',
        'character', 'Doctor Strange',
        'franchise', 'Marvel',
        'set_name', 'Spider-Man Mash-Up',
        'set_total', 5,
        'number', '1604',
        'variant', 'Spider-Man Mash-Up',
        'exclusivity', 'Target',
        'pop_type', 'Pop! Marvel',
        'pop_style', 'Standard',
        'description', 'Doctor Strange (Spider-Man Mash-Up) belongs to the Marvel Spider-Man Mash-Up Pop! line as #1604.',
        'display_description', 'Doctor Strange (Spider-Man Mash-Up) belongs to the Marvel Spider-Man Mash-Up Pop! line as #1604.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-set batch 2; Funko/Target Spider-Man Mash-Up #1604.'
    ),
    (
      '889698951234',
      jsonb_build_object(
        'pop_name', 'Human Torch (Spider-Man Mash-Up)',
        'character', 'Human Torch',
        'franchise', 'Marvel',
        'set_name', 'Spider-Man Mash-Up',
        'set_total', 5,
        'number', '1606',
        'variant', 'Spider-Man Mash-Up',
        'exclusivity', 'Target',
        'pop_type', 'Pop! Marvel',
        'pop_style', 'Standard',
        'description', 'Human Torch (Spider-Man Mash-Up) belongs to the Marvel Spider-Man Mash-Up Pop! line as #1606.',
        'display_description', 'Human Torch (Spider-Man Mash-Up) belongs to the Marvel Spider-Man Mash-Up Pop! line as #1606.',
        'parse_confidence', 0.98,
        'needs_review', false,
        'warnings', jsonb_build_array()
      ),
      '2026-07-13 missing-set batch 2; Funko/Target Spider-Man Mash-Up #1606.'
    )
),
updated_catalog as (
  update public.pop_catalog pc
  set
    pop_name = r.override_data->>'pop_name',
    character = r.override_data->>'character',
    franchise = r.override_data->>'franchise',
    set_name = r.override_data->>'set_name',
    set_total = case when r.override_data ? 'set_total' then (r.override_data->>'set_total')::integer else pc.set_total end,
    number = r.override_data->>'number',
    variant = case when r.override_data ? 'variant' then r.override_data->>'variant' else pc.variant end,
    exclusivity = case when r.override_data ? 'exclusivity' then r.override_data->>'exclusivity' else pc.exclusivity end,
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
  cpo.override_data->>'set_name' as override_set_name
from public.pop_catalog pc
left join public.catalog_parser_overrides cpo on cpo.upc = pc.upc
where pc.upc in (
  '889698618199',
  '889698853385',
  '889698872508',
  '889698951203',
  '889698951210',
  '889698951234'
)
order by pc.number;
