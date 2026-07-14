-- Exact-UPC polish for broad DC/Marvel buckets.
-- Keeps parser protection in place so future catalog refreshes preserve the reviewed labels.

with reviewed(upc, override_data, notes) as (
  values
    (
      '889698837491',
      jsonb_build_object(
        'pop_name', 'Symbiote Suit Spider-Man',
        'character', 'Symbiote Suit Spider-Man',
        'franchise', 'Marvel',
        'set_name', 'Spider-Man',
        'number', '1444',
        'variant', null,
        'exclusivity', null,
        'pop_type', 'Pop! Marvel',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Marvel: Spider-Man Comics - Symbiote Suit Spider-Man #1444',
        'display_description', 'Symbiote Suit Spider-Man #1444',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'Source-backed move from broad Marvel Comics into existing Spider-Man grouping; Target/eBay product data confirms UPC and #1444.'
    ),
    (
      '830395035215',
      jsonb_build_object(
        'pop_name', 'The Flash (New 52)',
        'character', 'The Flash',
        'franchise', 'DC',
        'set_name', 'DC Universe',
        'number', '52',
        'variant', 'New 52',
        'exclusivity', 'PX Previews',
        'pop_type', 'Pop! Heroes',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Heroes: DC Universe - The Flash (New 52) #52 PX Previews Exclusive',
        'display_description', 'The Flash (New 52) #52',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'Source-backed identity cleanup for UPC 830395035215; keeps the row in DC Universe but removes malformed character text.'
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
  (select count(*) from updated_catalog) as catalog_rows_updated,
  (select count(*) from protected_overrides) as parser_overrides_upserted;
