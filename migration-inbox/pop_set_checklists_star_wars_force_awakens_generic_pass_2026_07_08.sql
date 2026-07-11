-- Star Wars Force Awakens + generic bucket pass, applied 2026-07-08.
-- Sources:
--   * FigureRealm Star Wars - Force Awakens checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=starwarsforceawakensfunko&id=5071
--   * FigureRealm page 2 reports Items 41 - 61, so required count is 61.
--
-- Scope:
--   * Load a reviewed Force Awakens checklist and set total.
--   * Move high-confidence rows out of the generic Star Wars bucket.
--   * Leave specialty/standalone rows in Star Wars until a dedicated source pass.

update public.pop_catalog
set
  set_name = 'Star Wars: The Force Awakens',
  set_total = 61,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false
where franchise = 'Star Wars'
  and (
    set_name = 'Star Wars: The Force Awakens'
    or upc = '889698554985'
  );

update public.pop_catalog
set
  set_name = case
    when upc in ('849803087173', '889698864527') then 'Star Wars: A New Hope'
    when upc in ('889698161688', '889698160179', '849803093471') then 'Star Wars: The Empire Strikes Back'
    when upc in ('849803055295', '889698375276', '889698375917', '889698556897', '889698375924') then 'Star Wars: Return of the Jedi'
    when upc = '889698768382' then 'Skeleton Crew'
    when upc = '889698837620' then 'Ahsoka'
    else set_name
  end,
  pop_name = case
    when upc = '849803087173' then 'Luke Skywalker (Ceremony)'
    when upc = '849803055295' then 'Darth Vader (Unmasked)'
    when upc = '889698375276' then 'Darth Vader (Electrocuted)'
    when upc = '889698375924' then 'Lando Calrissian (General)'
    when upc = '889698554985' then 'Rey (Jakku)'
    when upc = '889698641210' then 'Lando Calrissian in the Millennium Falcon'
    else pop_name
  end,
  character = case
    when upc in ('849803055295', '889698375276') then 'Darth Vader'
    when upc = '849803087173' then 'Luke Skywalker'
    when upc = '889698375924' then 'Lando Calrissian'
    when upc = '889698554985' then 'Rey'
    when upc = '889698641210' then 'Lando Calrissian'
    else character
  end,
  variant = case
    when upc = '849803087173' then 'Ceremony'
    when upc = '849803055295' then 'Unmasked'
    when upc = '889698375276' then 'Electrocuted'
    when upc = '889698375924' then 'General'
    when upc = '889698554985' then 'Jakku'
    else variant
  end,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.88),
  needs_review = false
where franchise = 'Star Wars'
  and upc in (
    '849803087173',
    '889698864527',
    '889698161688',
    '889698160179',
    '849803093471',
    '849803055295',
    '889698375276',
    '889698375917',
    '889698556897',
    '889698375924',
    '889698768382',
    '889698837620'
  );

with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'Star Wars: The Force Awakens',
    'Star Wars',
    'reviewed',
    'FigureRealm Star Wars - Force Awakens checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=starwarsforceawakensfunko&id=5071',
    0.88,
    now(),
    'FigureRealm paginated checklist reports 61 Pop! Vinyl Figure rows for Star Wars - Force Awakens.'
  )
  on conflict (canonical_name, franchise) do update set
    status = excluded.status,
    source_label = excluded.source_label,
    source_url = excluded.source_url,
    confidence = excluded.confidence,
    reviewed_at = excluded.reviewed_at,
    notes = excluded.notes,
    updated_at = now()
  returning id, canonical_name
), checklist(set_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, confidence_value) as (
  values
    ('Star Wars: The Force Awakens', 'Admiral Ackbar (Yellow Suit)', 'Admiral Ackbar', '81', 'Yellow Suit', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'BB-8', 'BB-8', '61', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'BB-8', 'BB-8', '116', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'BB-8 (San Francisco Giants)', 'BB-8', '220', 'San Francisco Giants', null, 'Pop! Star Wars', 'Standard', 0.86::numeric),
    ('Star Wars: The Force Awakens', 'Blue Snaggletooth', 'Blue Snaggletooth', '69', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'C-3PO (Red Arm)', 'C-3PO', '64', 'Red Arm', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'C-3PO (Red Arm Chrome)', 'C-3PO', '64', 'Chrome', null, 'Pop! Star Wars', 'Standard', 0.86::numeric),
    ('Star Wars: The Force Awakens', 'Captain Phasma', 'Captain Phasma', '65', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Captain Phasma (Chrome)', 'Captain Phasma', '91', 'Chrome', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Chewbacca', 'Chewbacca', '63', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Chewbacca (Blue Chrome)', 'Chewbacca', '63', 'Blue Chrome', null, 'Pop! Star Wars', 'Standard', 0.86::numeric),
    ('Star Wars: The Force Awakens', 'Chewbacca (Flocked)', 'Chewbacca', '63', 'Flocked', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Chewbacca (Gold Chrome)', 'Chewbacca', '63', 'Gold Chrome', null, 'Pop! Star Wars', 'Standard', 0.86::numeric),
    ('Star Wars: The Force Awakens', 'Finn', 'Finn', '59', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Finn (Lightsaber)', 'Finn', '85', 'Lightsaber', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Finn (Stormtrooper)', 'Finn', '76', 'Stormtrooper', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'First Order Flametrooper', 'First Order Flametrooper', '68', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'First Order Stormtrooper', 'First Order Stormtrooper', '66', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'First Order Stormtrooper', 'First Order Stormtrooper', '74', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'First Order Stormtrooper', 'First Order Stormtrooper', '75', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'FN-2187 (Bloody Hand Print)', 'FN-2187', '100', 'Bloody Hand Print', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'FN-2199', 'FN-2199', '111', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'General Hux', 'General Hux', '109', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'General Leia', 'General Leia', '107', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Guavian', 'Guavian', '112', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Han Solo', 'Han Solo', '79', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Han Solo', 'Han Solo', '115', 'Summer Convention', 'Summer Convention', 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Han Solo (Snow Gear)', 'Han Solo', '86', 'Snow Gear', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Kylo Ren', 'Kylo Ren', '77', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Kylo Ren', 'Kylo Ren', '105', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Kylo Ren (Masked)', 'Kylo Ren', '60', 'Masked', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Kylo Ren (Retro)', 'Kylo Ren', '770', 'Retro', null, 'Pop! Star Wars', 'Standard', 0.86::numeric),
    ('Star Wars: The Force Awakens', 'Kylo Ren (Unmasked)', 'Kylo Ren', '87', 'Unmasked', 'Walmart', 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Kylo Ren with Darth Vader''s Helmet', 'Kylo Ren', '739', 'Deluxe', null, 'Pop! Star Wars', 'Deluxe', 0.86::numeric),
    ('Star Wars: The Force Awakens', 'Legends: Shadow Guard', 'Shadow Guard', '71', 'Common', null, 'Pop! Star Wars', 'Standard', 0.86::numeric),
    ('Star Wars: The Force Awakens', 'Luke Skywalker', 'Luke Skywalker', '106', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Maz Kanata', 'Maz Kanata', '108', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Maz Kanata', 'Maz Kanata', '118', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'ME-809', 'ME-809', '113', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Nien Nunb', 'Nien Nunb', '82', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Poe Dameron', 'Poe Dameron', '62', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Poe Dameron', 'Poe Dameron', '72', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Poe Dameron', 'Poe Dameron', '117', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Poe Dameron', 'Poe Dameron', '120', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Princess Leia', 'Princess Leia', '80', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Red Snaggletooth', 'Red Snaggletooth', '70', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Rey', 'Rey', '58', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Rey', 'Rey', '73', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Rey', 'Rey', '119', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Rey', 'Rey', '161', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Rey (Metallic Gold)', 'Rey', '114', 'Metallic', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Rey (Jakku)', 'Rey', '451', 'Jakku', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Rey (with Lightsaber)', 'Rey', '104', 'With Lightsaber', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Rey with Speeder', 'Rey', '174', 'Common', null, 'Pop! Star Wars', 'Ride', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Sidon Ithano', 'Sidon Ithano', '83', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Snap Wexley', 'Snap Wexley', '110', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Supreme Leader Snoke (Hologram)', 'Supreme Leader Snoke', '182', 'Glow in the Dark', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'TIE Fighter Pilot', 'TIE Fighter Pilot', '67', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'TIE Fighter Pilot', 'TIE Fighter Pilot', '89', 'Black and Red', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'TIE Fighter Pilot', 'TIE Fighter Pilot', '89', 'Red', null, 'Pop! Star Wars', 'Standard', 0.88::numeric),
    ('Star Wars: The Force Awakens', 'Varmik', 'Varmik', '84', 'Common', null, 'Pop! Star Wars', 'Standard', 0.88::numeric)
), matched as (
  select
    upsert_sets.id as set_id,
    pc.id as pop_catalog_id,
    checklist.*
  from checklist
  join upsert_sets on upsert_sets.canonical_name = checklist.set_name
  left join lateral (
    select pc.id
    from public.pop_catalog pc
    where lower(pc.set_name) = lower(checklist.set_name)
      and pc.number = checklist.number_value
      and (
        lower(coalesce(pc.pop_name, pc.character, '')) = lower(checklist.pop_name)
        or lower(coalesce(pc.character, pc.pop_name, '')) = lower(checklist.character_name)
        or lower(coalesce(pc.pop_name, pc.character, '')) like lower(checklist.character_name || '%')
      )
    order by
      case when lower(coalesce(pc.variant, 'Common')) = lower(coalesce(checklist.variant_value, 'Common')) then 0 else 1 end,
      pc.created_at desc nulls last
    limit 1
  ) pc on true
)
insert into public.pop_set_checklist_items (
  set_id,
  pop_catalog_id,
  pop_name,
  character,
  number,
  variant,
  exclusivity,
  pop_type,
  pop_style,
  is_required_for_completion,
  source_url,
  confidence,
  notes
)
select
  set_id,
  pop_catalog_id,
  pop_name,
  character_name,
  number_value,
  variant_value,
  exclusivity_value,
  pop_type_value,
  pop_style_value,
  true,
  'https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=starwarsforceawakensfunko&id=5071',
  confidence_value,
  'Star Wars: The Force Awakens checklist item.'
from matched
on conflict (set_id, coalesce(number, ''), lower(coalesce(pop_name, '')), lower(coalesce(variant, '')), lower(coalesce(exclusivity, ''))) do update set
  pop_catalog_id = coalesce(excluded.pop_catalog_id, public.pop_set_checklist_items.pop_catalog_id),
  character = excluded.character,
  pop_type = excluded.pop_type,
  pop_style = excluded.pop_style,
  is_required_for_completion = excluded.is_required_for_completion,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  notes = excluded.notes,
  updated_at = now();
