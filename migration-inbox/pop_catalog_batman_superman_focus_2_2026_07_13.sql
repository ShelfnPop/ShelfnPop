-- Second exact-UPC Batman/Superman set cleanup pass.
-- Moves only source-backed rows into clearer set buckets and protects them from parser refresh drift.

with reviewed(upc, override_data, notes) as (
  values
    (
      '889698601030',
      jsonb_build_object(
        'pop_name', 'The Joker (Art Series)',
        'character', 'The Joker',
        'franchise', 'DC',
        'set_name', 'Batman 1989',
        'number', '64',
        'variant', 'Art Series',
        'exclusivity', 'Target',
        'set_total', null,
        'pop_type', 'Pop! Heroes',
        'pop_style', 'Art Series',
        'description', 'Funko Pop! Art Series: Batman 1989 - The Joker #64, Target exclusive',
        'display_description', 'The Joker (Art Series) #64',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'Source-backed move from broad Batman into Batman 1989; UPC 889698601030 is the Joker Art Series #64.'
    ),
    (
      '889698437066',
      jsonb_build_object(
        'pop_name', 'The Joker Gamer',
        'character', 'The Joker',
        'franchise', 'DC',
        'set_name', 'Batman: 80th Anniversary',
        'number', '295',
        'variant', 'Gamer',
        'exclusivity', 'GameStop',
        'set_total', 33,
        'pop_type', 'Pop! Heroes',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Heroes: Batman 80 Years - The Joker Gamer #295, GameStop exclusive',
        'display_description', 'The Joker Gamer #295',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'Source-backed move from broad Batman into Batman: 80th Anniversary; product listings identify The Joker Gamer #295 as Batman 80 Years/GameStop.'
    ),
    (
      '889698363549',
      jsonb_build_object(
        'pop_name', 'Batman Murder Machine',
        'character', 'Batman Murder Machine',
        'franchise', 'DC',
        'set_name', 'DC Dark Multiverse',
        'number', '360',
        'variant', null,
        'exclusivity', 'Hot Topic',
        'set_total', null,
        'pop_type', 'Pop! Heroes',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Heroes: DC - Batman Murder Machine #360, Hot Topic exclusive',
        'display_description', 'Batman Murder Machine #360',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'Source-backed move from broad Batman into DC Dark Multiverse; product data identifies Batman Murder Machine #360.'
    ),
    (
      '889698353014',
      jsonb_build_object(
        'pop_name', 'Superman 3-Pack',
        'character', 'Superman',
        'franchise', 'DC',
        'set_name', 'Superman 80 Years',
        'number', null,
        'variant', 'Chrome',
        'exclusivity', 'Fall Convention',
        'set_total', null,
        'pop_type', 'Pop! Heroes',
        'pop_style', '3-Pack',
        'description', 'Funko Pop! Heroes: Superman 80 Years Chrome 3-Pack, 2018 Fall Convention exclusive',
        'display_description', 'Superman 3-Pack (Chrome)',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'Source-backed move from broad Superman into Superman 80 Years; UPC 889698353014 is the chrome 3-pack.'
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
    set_total = nullif(r.override_data->>'set_total', '')::integer,
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
