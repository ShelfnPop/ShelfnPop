-- Star Wars: The Phantom Menace reviewed-set moves, applied 2026-07-09.
--
-- Scope:
-- - Normalize exact Phantom Menace rows into the canonical reviewed set name.
-- - Apply the FigureRealm checklist total for the combined Phantom Menace Funko checklist.
-- - Move only regular exact checklist matches from the generic Star Wars bucket.
--
-- Source:
-- - FigureRealm Star Wars - Phantom Menace checklist:
--   https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5104

update public.pop_catalog
set
  set_name = 'Star Wars: The Phantom Menace',
  set_total = 30,
  pop_name = case
    when upc = '830395023908' then 'Darth Maul'
    when upc = '889698147989' then 'Young Anakin Skywalker'
    when upc = '889698760188' then 'Obi-Wan Kenobi (Padawan)'
    else pop_name
  end,
  character = case
    when upc = '889698147989' then 'Anakin Skywalker'
    when upc = '889698760188' then 'Obi-Wan Kenobi'
    else character
  end,
  variant = case
    when upc = '889698147989' then 'Podracer'
    when upc = '889698760188' then 'Padawan'
    else variant
  end,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  display_description = case
    when upc = '830395023908' then 'Darth Maul belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #9.'
    when upc = '889698147989' then 'Young Anakin Skywalker belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #231. This catalog entry tracks the Podracer / Walgreens exclusive.'
    when upc = '889698376662' then 'Watto belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #298. This catalog entry tracks the Star Wars Celebration exclusive. Released in 2019.'
    when upc = '889698406772' then 'Aurra Sing belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #303. This catalog entry tracks the Smuggler''s Bounty exclusive. Released in 2019.'
    when upc = '889698407021' then 'Sebulba belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #304.'
    when upc = '889698760188' then 'Obi-Wan Kenobi (Padawan) belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #699. Released in 2024.'
    when upc = '889698760218' then 'Watto belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #702. Released in 2024.'
    else display_description
  end
where franchise = 'Star Wars'
  and upc in (
    '830395023908',
    '889698147989',
    '889698376662',
    '889698406772',
    '889698407021',
    '889698760188',
    '889698760218'
  );
