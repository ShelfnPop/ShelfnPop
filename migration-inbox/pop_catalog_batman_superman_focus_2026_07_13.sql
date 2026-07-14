-- Exact-UPC Batman/Superman set cleanup.
-- Keeps parser protection in place so future catalog refreshes preserve the reviewed set placement.

with reviewed(upc, override_data, notes) as (
  values
    (
      '889698787741',
      jsonb_build_object(
        'pop_name', 'Batman Knight',
        'character', 'Batman Knight',
        'franchise', 'DC',
        'set_name', 'Batman: Knight and Squire',
        'number', '513',
        'variant', null,
        'exclusivity', 'Funko Shop',
        'pop_type', 'Pop! Heroes',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Heroes: DC - Batman Knight #513, Funko Shop exclusive',
        'display_description', 'Batman Knight #513',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'Source-backed move from broad Batman into Batman: Knight and Squire; Funko product copy names that lineup for UPC 889698787741.'
    ),
    (
      '889698871884',
      jsonb_build_object(
        'pop_name', 'Superman (Black Suit)',
        'character', 'Superman',
        'franchise', 'DC',
        'set_name', 'Superman: Lois and Clark',
        'number', '557',
        'variant', 'Black Suit',
        'exclusivity', 'Funko Shop',
        'pop_type', 'Pop! Heroes',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Heroes: DC - Superman (Black Suit) #557 from Superman: Lois and Clark #1',
        'display_description', 'Superman (Black Suit) #557',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'Source-backed move from broad Superman into Superman: Lois and Clark; Funko product copy identifies the comic source for UPC 889698871884.'
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
