-- Star Wars safe totals + Rise of Skywalker pass, applied 2026-07-09.
--
-- Scope:
-- - Propagate existing reviewed set totals onto rows already in reviewed Star Wars buckets.
-- - Normalize The Clone Wars casing into Star Wars: The Clone Wars.
-- - Normalize The Rise of Skywalker casing/suffix variants and load a reviewed 45-item checklist.
--
-- Sources:
-- - Existing reviewed pop_sets records for The Mandalorian, The Force Awakens,
--   Obi-Wan Kenobi, The Book of Boba Fett, The Empire Strikes Back, and The Clone Wars.
-- - FigureRealm Star Wars - Rise of Skywalker checklist:
--   https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5118

with reviewed_totals(set_name, expected_total) as (
  values
    ('The Mandalorian', 112),
    ('Star Wars: The Force Awakens', 61),
    ('Obi-Wan Kenobi', 24),
    ('The Book of Boba Fett', 13),
    ('Star Wars: The Empire Strikes Back', 61)
)
update public.pop_catalog pc
set
  set_total = reviewed_totals.expected_total,
  parse_confidence = greatest(coalesce(pc.parse_confidence, 0), 0.90),
  needs_review = false
from reviewed_totals
where pc.franchise = 'Star Wars'
  and pc.set_name = reviewed_totals.set_name
  and (pc.set_total is null or pc.set_total <> reviewed_totals.expected_total);

update public.pop_catalog
set
  set_name = 'Star Wars: The Clone Wars',
  set_total = 31,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  display_description = replace(
    coalesce(display_description, pop_name || ' belongs to the Star Wars: The Clone Wars Pop! Star Wars line.'),
    'The Clone Wars',
    'Star Wars: The Clone Wars'
  )
where franchise = 'Star Wars'
  and set_name in ('The Clone Wars', 'Star Wars: The Clone Wars')
  and (set_name <> 'Star Wars: The Clone Wars' or set_total is null or set_total <> 31);

update public.pop_catalog
set
  set_name = 'Star Wars: The Rise of Skywalker',
  set_total = 45,
  number = case
    when upc = '889698398862' then '314'
    else number
  end,
  pop_name = case
    when upc = '889698398879' then 'Kylo Ren (Supreme Leader)'
    when upc = '889698514842' then 'Rey (Two Lightsabers)'
    else pop_name
  end,
  character = case
    when upc = '889698398879' then 'Kylo Ren'
    when upc = '889698514842' then 'Rey'
    else character
  end,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  display_description = case
    when upc = '889698398862' then 'BB-8 belongs to the Star Wars: The Rise of Skywalker Pop! Star Wars line as #314. Released in 2019.'
    when upc = '889698398879' then 'Kylo Ren (Supreme Leader) belongs to the Star Wars: The Rise of Skywalker Pop! Star Wars line as #308. Released in 2019.'
    when upc = '889698514842' then 'Rey (Two Lightsabers) belongs to the Star Wars: The Rise of Skywalker Pop! Star Wars line as #434. Released in 2021.'
    else replace(coalesce(display_description, pop_name || ' belongs to the Star Wars: The Rise of Skywalker Pop! Star Wars line.'), 'Star Wars: The Rise Of Skywalker. Summer Convention', 'Star Wars: The Rise of Skywalker')
  end
where franchise = 'Star Wars'
  and set_name in (
    'Star Wars: The Rise of Skywalker',
    'Star Wars: The Rise Of Skywalker',
    'Star Wars: The Rise Of Skywalker. Summer Convention'
  );

with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'Star Wars: The Rise of Skywalker',
    'Star Wars',
    'reviewed',
    'FigureRealm Star Wars - Rise of Skywalker checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5118',
    0.90,
    now(),
    'FigureRealm lists 45 rows across Pop! Rides and Pop! Vinyl Figures for Star Wars - Rise of Skywalker.'
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
    ('Star Wars: The Rise of Skywalker', 'Supreme Leader Kylo Ren (in TIE Whisperer) (Deluxe)', 'Kylo Ren', '321', 'Deluxe', null, 'Pop! Rides', 'Ride', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Babu Frik', 'Babu Frik', '340', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Babu Frik (10" Scale)', 'Babu Frik', '435', '10" Scale', null, 'Pop! Star Wars', 'Jumbo', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'BB-8', 'BB-8', '314', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Ben Solo', 'Ben Solo', '431', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'C-3PO', 'C-3PO', '341', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'C-3PO (Red Eyes)', 'C-3PO', '360', 'Red Eyes', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'D-O', 'D-O', '312', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'D-O (10" Scale)', 'D-O', '336', '10" Scale', null, 'Pop! Star Wars', 'Jumbo', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Dark Side Rey', 'Rey', '359', 'Dark Side', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Emperor Palpatine', 'Emperor Palpatine', '433', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Finn', 'Finn', '309', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'First Order Jet Trooper', 'First Order Jet Trooper', '317', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'First Order Tread Speeder', 'First Order Tread Speeder', '320', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Jannah', 'Jannah', '315', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Knight of Ren (Arm Cannon)', 'Knight of Ren', '334', 'Arm Cannon', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Knight of Ren (Arm Cannon) (Hematite Chrome)', 'Knight of Ren', '334', 'Hematite Chrome', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Knight of Ren (Blaster Rifle)', 'Knight of Ren', '331', 'Blaster Rifle', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Knight of Ren (Blaster Rifle) (Hematite Chrome)', 'Knight of Ren', '331', 'Hematite Chrome', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Knight of Ren (Heavy Blade)', 'Knight of Ren', '335', 'Heavy Blade', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Knight of Ren (Heavy Blade) (Hematite Chrome)', 'Knight of Ren', '335', 'Hematite Chrome', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Knight of Ren (Long Axe)', 'Knight of Ren', '325', 'Long Axe', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Knight of Ren (Long Axe) (Hematite Chrome)', 'Knight of Ren', '325', 'Hematite Chrome', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Knight of Ren (Scythe)', 'Knight of Ren', '333', 'Scythe', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Knight of Ren (Scythe) (Hematite Chrome)', 'Knight of Ren', '333', 'Hematite Chrome', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Knight of Ren (War Club)', 'Knight of Ren', '332', 'War Club', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Knight of Ren (War Club) (Hematite Chrome)', 'Knight of Ren', '332', 'Hematite Chrome', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Kylo Ren (Supreme Leader)', 'Kylo Ren', '308', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Kylo Ren (Supreme Leader)', 'Kylo Ren', '324', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Kylo Ren (Supreme Leader) (Glows In The Dark)', 'Kylo Ren', '308', 'Glow in the Dark', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Kylo Ren Supreme Leader (Glows in the Dark) (10" Scale)', 'Kylo Ren', '344', 'Glow in the Dark 10" Scale', null, 'Pop! Star Wars', 'Jumbo', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Lando Calrissian', 'Lando Calrissian', '313', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Lieutenant Connix', 'Lieutenant Connix', '319', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Luke Skywalker (Jedi Training)', 'Luke Skywalker', '399', 'Jedi Training', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Poe Dameron', 'Poe Dameron', '310', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Power of the Galaxy: Rey', 'Rey', '577', 'Power of the Galaxy', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Princess Leia (Jedi Training)', 'Princess Leia', '400', 'Jedi Training', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Rey', 'Rey', '307', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Rey (Two Lightsabers)', 'Rey', '434', 'Two Lightsabers', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Rey (Yellow Lightsaber)', 'Rey', '432', 'Yellow Lightsaber', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Rose', 'Rose', '316', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Sith Jet Trooper', 'Sith Jet Trooper', '318', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Sith Jet Trooper', 'Sith Jet Trooper', '383', 'Convention', 'Summer Convention', 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Sith Trooper', 'Sith Trooper', '306', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: The Rise of Skywalker', 'Zorii Bliss', 'Zorii Bliss', '311', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric)
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
  'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5118',
  confidence_value,
  'Star Wars: The Rise of Skywalker checklist item.'
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
