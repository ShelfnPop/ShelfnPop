-- Star Wars generic bucket reviewed-set moves, applied 2026-07-09.
--
-- Scope:
-- - Move exact-match generic Star Wars rows into already-reviewed movie sets.
-- - Apply reviewed set totals from existing pop_sets/checklist metadata.
-- - Normalize one Episode IV / one Episode VI label into the reviewed canonical names.
--
-- Sources:
-- - FigureRealm Star Wars - A New Hope checklist:
--   https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5034
-- - FigureRealm Star Wars - Empire Strikes Back checklist:
--   https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5064
-- - FigureRealm Star Wars - Return of the Jedi checklist:
--   https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6714

update public.pop_catalog
set
  set_name = 'Star Wars: The Empire Strikes Back',
  set_total = 61,
  pop_name = case
    when upc = '889698101059' then 'Dagobah Yoda'
    when upc = '889698561051' then 'Bounty Hunters Collection: Dengar'
    else pop_name
  end,
  character = case
    when upc = '889698101059' then 'Yoda'
    when upc = '889698561051' then 'Dengar'
    else character
  end,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  display_description = case
    when upc = '849803065744' then 'AT-AT Driver belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #92. This catalog entry tracks the Walgreens exclusive.'
    when upc = '889698101059' then 'Dagobah Yoda belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #124.'
    when upc = '889698561051' then 'Bounty Hunters Collection: Dengar belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #440. This catalog entry tracks the GameStop exclusive.'
    else display_description
  end
where franchise = 'Star Wars'
  and upc in ('849803065744', '889698101059', '889698561051');

update public.pop_catalog
set
  set_name = 'Star Wars: A New Hope',
  set_total = 73,
  pop_name = case
    when upc = '889698430166' then 'Luke Skywalker (Bespin)'
    when upc in ('889698390835', '889698430173') then 'Princess Leia (Gold Chrome)'
    when upc = '889698675376' then 'Stormtrooper'
    else pop_name
  end,
  character = case
    when upc = '889698430166' then 'Luke Skywalker'
    when upc in ('889698390835', '889698430173') then 'Princess Leia'
    else character
  end,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  display_description = case
    when upc = '849803057794' then 'Nalan Cheel belongs to the Star Wars: A New Hope Pop! Star Wars line as #52.'
    when upc = '889698430166' then 'Luke Skywalker (Bespin) belongs to the Star Wars: A New Hope Pop! Star Wars line as #93. This catalog entry tracks the Metallic Walmart exclusive.'
    when upc = '889698129084' then 'Muftak belongs to the Star Wars: A New Hope Pop! Star Wars line as #173. This catalog entry tracks the Spring Convention exclusive.'
    when upc = '889698390835' then 'Princess Leia (Gold Chrome) belongs to the Star Wars: A New Hope Pop! Star Wars line as #295.'
    when upc = '889698430173' then 'Princess Leia (Gold Chrome) belongs to the Star Wars: A New Hope Pop! Star Wars line as #295. This catalog entry tracks the Galactic Convention / Hot Topic exclusive.'
    when upc = '889698475983' then 'Jawa belongs to the Star Wars: A New Hope Pop! Star Wars line as #371.'
    when upc = '889698675376' then 'Stormtrooper belongs to the Star Wars: A New Hope Pop! Star Wars line as #598.'
    else display_description
  end
where franchise = 'Star Wars'
  and upc in (
    '849803057794',
    '889698430166',
    '889698129084',
    '889698390835',
    '889698430173',
    '889698475983',
    '889698675376'
  );

update public.pop_catalog
set
  set_name = 'Star Wars: Return of the Jedi',
  set_total = 58,
  pop_name = 'Princess Leia (Boushh)',
  character = 'Princess Leia',
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  display_description = 'Princess Leia (Boushh) belongs to the Star Wars: Return of the Jedi Pop! Star Wars line as #50.'
where franchise = 'Star Wars'
  and upc = '849803057091';

update public.pop_catalog
set
  set_name = 'Star Wars: Return of the Jedi 40th Anniversary',
  set_total = 9,
  pop_name = 'Princess Leia (Boushh)',
  character = 'Princess Leia',
  variant = 'Boushh',
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  display_description = 'Princess Leia (Boushh) belongs to the Star Wars: Return of the Jedi 40th Anniversary Pop! Star Wars line as #606. Released in 2023.'
where franchise = 'Star Wars'
  and upc = '889698707480';
