-- Exact-UPC cleanup for owned catalog rows with missing set names.
-- Source-backed rows only; each update is protected with a parser override.

with reviewed(upc, override_data, notes) as (
  values
    (
      '889698879378',
      jsonb_build_object(
        'pop_name', 'Sam Manson',
        'character', 'Sam Manson',
        'franchise', 'Nickelodeon',
        'set_name', 'Danny Phantom',
        'number', '2002',
        'variant', null,
        'exclusivity', 'Summer Convention',
        'set_total', null,
        'pop_type', 'Pop! Animation',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Animation: Danny Phantom - Sam Manson #2002, 2025 Summer Convention exclusive',
        'display_description', 'Sam Manson #2002',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'UPC 889698879378 source-backed as Sam Manson #2002 from Danny Phantom, correcting missing set and wrong DC franchise.'
    ),
    (
      '889698824132',
      jsonb_build_object(
        'pop_name', 'Alice (Curtsying) (Sketched Deco)',
        'character', 'Alice',
        'franchise', 'Disney',
        'set_name', 'Alice in Wonderland',
        'number', '1528',
        'variant', 'Sketched Deco',
        'exclusivity', 'Funko Shop',
        'set_total', null,
        'pop_type', 'Pop! Disney',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Disney: Alice in Wonderland - Alice (Curtsying) (Sketched Deco) #1528',
        'display_description', 'Alice (Curtsying) (Sketched Deco) #1528',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'UPC 889698824132 source-backed as Alice in Wonderland #1528 Sketched Deco.'
    ),
    (
      '889698849425',
      jsonb_build_object(
        'pop_name', 'Cheerleader Kim Possible',
        'character', 'Kim Possible',
        'franchise', 'Disney',
        'set_name', 'Kim Possible',
        'number', '1583',
        'variant', 'Cheerleader',
        'exclusivity', 'Amazon',
        'set_total', null,
        'pop_type', 'Pop! Disney',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Disney: Kim Possible - Cheerleader Kim Possible #1583, Amazon exclusive',
        'display_description', 'Cheerleader Kim Possible #1583',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'UPC 889698849425 source-backed as Disney Kim Possible Cheerleader Kim #1583.'
    ),
    (
      '889698881968',
      jsonb_build_object(
        'pop_name', 'Wednesday Addams (Fencing)',
        'character', 'Wednesday Addams',
        'franchise', 'Wednesday',
        'set_name', 'Wednesday',
        'number', '1820',
        'variant', 'Fencing',
        'exclusivity', 'Funko Shop',
        'set_total', null,
        'pop_type', 'Pop! Television',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Television: Wednesday - Wednesday Addams (Fencing) #1820, Funko Shop exclusive',
        'display_description', 'Wednesday Addams (Fencing) #1820',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'UPC 889698881968 source-backed as Wednesday Addams (Fencing) #1820.'
    ),
    (
      '889698809993',
      jsonb_build_object(
        'pop_name', 'Good Guy Chucky',
        'character', 'Chucky',
        'franchise', 'Child''s Play',
        'set_name', 'Chucky Vintage Halloween',
        'number', '1589',
        'variant', 'Blacklight',
        'exclusivity', null,
        'set_total', null,
        'pop_type', 'Pop! Movies',
        'pop_style', 'Deluxe',
        'description', 'Funko Pop! Movies: Chucky Vintage Halloween - Good Guy Chucky #1589, blacklight deluxe',
        'display_description', 'Good Guy Chucky #1589',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'UPC 889698809993 source-backed as Chucky Vintage Halloween Good Guy Chucky #1589.'
    ),
    (
      '889698862639',
      jsonb_build_object(
        'pop_name', 'Emily with Butterflies',
        'character', 'Emily',
        'franchise', 'Corpse Bride',
        'set_name', 'Corpse Bride',
        'number', '1830',
        'variant', null,
        'exclusivity', null,
        'set_total', null,
        'pop_type', 'Pop! Plus',
        'pop_style', 'Plus',
        'description', 'Funko Pop! Plus: Corpse Bride - Emily with Butterflies #1830',
        'display_description', 'Emily with Butterflies #1830',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'UPC 889698862639 source-backed as Corpse Bride Emily with Butterflies #1830.'
    ),
    (
      '889698871679',
      jsonb_build_object(
        'pop_name', 'Glen with Axe',
        'character', 'Glen',
        'franchise', 'Child''s Play',
        'set_name', 'Seed of Chucky',
        'number', '1772',
        'variant', null,
        'exclusivity', 'Spirit Halloween',
        'set_total', null,
        'pop_type', 'Pop! Movies',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Movies: Seed of Chucky - Glen with Axe #1772, Spirit Halloween exclusive',
        'display_description', 'Glen with Axe #1772',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'UPC 889698871679 source-backed as Glen with Axe #1772 from Seed of Chucky.'
    ),
    (
      '889698835367',
      jsonb_build_object(
        'pop_name', 'Jimmy Neutron',
        'character', 'Jimmy Neutron',
        'franchise', 'Nickelodeon',
        'set_name', 'The Adventures of Jimmy Neutron, Boy Genius',
        'number', '1903',
        'variant', null,
        'exclusivity', null,
        'set_total', null,
        'pop_type', 'Pop! Animation',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Animation: The Adventures of Jimmy Neutron, Boy Genius - Jimmy Neutron #1903',
        'display_description', 'Jimmy Neutron #1903',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'UPC 889698835367 source-backed as Jimmy Neutron #1903, correcting bad Select (s) parse.'
    ),
    (
      '889698835350',
      jsonb_build_object(
        'pop_name', 'Carl Wheezer',
        'character', 'Carl Wheezer',
        'franchise', 'Nickelodeon',
        'set_name', 'The Adventures of Jimmy Neutron, Boy Genius',
        'number', '1904',
        'variant', null,
        'exclusivity', null,
        'set_total', null,
        'pop_type', 'Pop! Animation',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Animation: The Adventures of Jimmy Neutron, Boy Genius - Carl Wheezer #1904',
        'display_description', 'Carl Wheezer #1904',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'UPC 889698835350 source-backed as Carl Wheezer #1904.'
    ),
    (
      '889698866811',
      jsonb_build_object(
        'pop_name', 'Enid Sinclair',
        'character', 'Enid Sinclair',
        'franchise', 'Wednesday',
        'set_name', 'Wednesday',
        'number', '1816',
        'variant', null,
        'exclusivity', null,
        'set_total', null,
        'pop_type', 'Pop! Television',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Television: Wednesday - Enid Sinclair #1816',
        'display_description', 'Enid Sinclair #1816',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'UPC 889698866811 source-backed as Wednesday Enid Sinclair #1816.'
    ),
    (
      '889698866804',
      jsonb_build_object(
        'pop_name', 'Morticia Addams',
        'character', 'Morticia Addams',
        'franchise', 'Wednesday',
        'set_name', 'Wednesday',
        'number', '1818',
        'variant', null,
        'exclusivity', null,
        'set_total', null,
        'pop_type', 'Pop! Television',
        'pop_style', 'Standard',
        'description', 'Funko Pop! Television: Wednesday - Morticia Addams #1818',
        'display_description', 'Morticia Addams #1818',
        'parse_confidence', 0.98,
        'needs_review', false
      ),
      'UPC 889698866804 source-backed as Wednesday Morticia Addams #1818.'
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
