-- Batman Classic TV Series + Aquaman second DC cleanup pass, 2026-07-08.
-- Goal: add reviewed set totals/checklists for source-backed DC sets and fix
-- the Batman vs. The Penguin 2-pack display data.

update public.pop_catalog
set
  set_total = case
    when set_name = 'Batman Classic TV Series' then 20
    when set_name = 'Aquaman' then 14
    else set_total
  end
where franchise = 'DC'
  and set_name in ('Batman Classic TV Series', 'Aquaman');

update public.pop_catalog
set
  pop_name = 'Batman vs. The Penguin',
  character = 'Batman & The Penguin',
  pop_style = '2-Pack',
  set_total = 20,
  description = 'Batman vs. The Penguin is a Batman Classic TV Series Pop! Heroes 2-pack.',
  display_description = 'Batman vs. The Penguin is a Batman Classic TV Series Pop! Heroes 2-pack.'
where upc = '889698299954';

with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values
    (
      'Batman Classic TV Series',
      'DC',
      'reviewed',
      'FigureRealm Batman Classic TV Pop! Vinyl checklist',
      'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5',
      0.90,
      now(),
      'FigureRealm Pop! Vinyl Figures subseries lists 20 items. Batman vs. The Penguin 2-pack is verified by UPC, but no box number was found in reviewed sources.'
    ),
    (
      'Aquaman',
      'DC',
      'reviewed',
      'FigureRealm Aquaman Pop! Vinyl checklist',
      'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293',
      0.84,
      now(),
      'FigureRealm Aquaman checklist shows 15 items overall; set total uses the 14 Pop! Vinyl/Ride-style items and excludes Pop! Comic Cover #13 from completion.'
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
), target_sets as (
  select id, canonical_name from upsert_sets
  union
  select id, canonical_name from public.pop_sets
  where canonical_name in ('Batman Classic TV Series', 'Aquaman')
), checklist(set_name, upc_value, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, source_url, confidence_value, notes_value) as (
  values
    ('Batman Classic TV Series', null, 'Batman', 'Batman', '41', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.90::numeric, 'Batman Classic TV Pop! Vinyl checklist item.'),
    ('Batman Classic TV Series', null, 'Batman', 'Batman', '41', 'Metallic', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.88::numeric, 'Batman Classic TV metallic checklist item.'),
    ('Batman Classic TV Series', null, 'Robin', 'Robin', '42', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.90::numeric, 'Batman Classic TV Pop! Vinyl checklist item.'),
    ('Batman Classic TV Series', null, 'Catwoman', 'Catwoman', '43', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.90::numeric, 'Batman Classic TV Pop! Vinyl checklist item.'),
    ('Batman Classic TV Series', null, 'The Joker', 'The Joker', '44', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.90::numeric, 'Batman Classic TV Pop! Vinyl checklist item.'),
    ('Batman Classic TV Series', null, 'The Joker', 'The Joker', '44', 'Metallic', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.88::numeric, 'Batman Classic TV metallic checklist item.'),
    ('Batman Classic TV Series', null, 'Surf''s Up! Batman', 'Batman', '133', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.88::numeric, 'Batman Classic TV checklist item.'),
    ('Batman Classic TV Series', null, 'Surf''s Up! The Joker', 'The Joker', '134', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.88::numeric, 'Batman Classic TV checklist item.'),
    ('Batman Classic TV Series', null, 'The Riddler', 'The Riddler', '183', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.90::numeric, 'Batman Classic TV Pop! Vinyl checklist item.'),
    ('Batman Classic TV Series', null, 'The Riddler', 'The Riddler', '183', 'Chase', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.88::numeric, 'Batman Classic TV chase checklist item.'),
    ('Batman Classic TV Series', null, 'The Penguin', 'The Penguin', '184', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.90::numeric, 'Batman Classic TV Pop! Vinyl checklist item.'),
    ('Batman Classic TV Series', null, 'Mr. Freeze', 'Mr. Freeze', '185', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.88::numeric, 'Batman Classic TV checklist item.'),
    ('Batman Classic TV Series', null, 'Batgirl', 'Batgirl', '186', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.88::numeric, 'Batman Classic TV checklist item.'),
    ('Batman Classic TV Series', null, 'King Tut', 'King Tut', '187', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.88::numeric, 'Batman Classic TV checklist item.'),
    ('Batman Classic TV Series', null, 'Batgirl', 'Batgirl', '21', '8-Bit', null, 'Pop! Heroes', '8-Bit', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.84::numeric, 'Batman Classic TV 8-Bit checklist item.'),
    ('Batman Classic TV Series', '889698299954', 'Batman vs. The Penguin', 'Batman & The Penguin', null, 'Common', null, 'Pop! Heroes', '2-Pack', 'https://amoktime.com/funko-pop-heroes-batman-classic-tv-series-batman-vs-the-penguin-2-pack/', 0.90::numeric, 'Batman Classic TV 2-pack verified by UPC; no box number found in reviewed sources.'),
    ('Batman Classic TV Series', null, 'Surf''s Up! Batman / Joker', 'Batman & The Joker', null, 'Common', null, 'Pop! Heroes', '2-Pack', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.84::numeric, 'Batman Classic TV 2-pack checklist item.'),
    ('Batman Classic TV Series', null, 'Batman Bomb', 'Batman', '624', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.84::numeric, 'Batman Classic TV checklist item.'),
    ('Batman Classic TV Series', null, 'Robin Holy Bat-Trap', 'Robin', '625', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.84::numeric, 'Batman Classic TV checklist item.'),
    ('Batman Classic TV Series', null, 'Batman Climbing Wall', 'Batman', '626', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=469&ssid=5', 0.84::numeric, 'Batman Classic TV checklist item.'),

    ('Aquaman', null, 'Arthur Curry', 'Arthur Curry', '243', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293', 0.84::numeric, 'Aquaman Pop! Vinyl checklist item.'),
    ('Aquaman', null, 'Arthur Curry (Gladiator)', 'Arthur Curry', '244', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293', 0.84::numeric, 'Aquaman Pop! Vinyl checklist item.'),
    ('Aquaman', null, 'Arthur Curry (Gladiator)', 'Arthur Curry', '244', 'Gold Chrome', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293', 0.82::numeric, 'Aquaman Gold Chrome checklist item.'),
    ('Aquaman', null, 'Arthur Curry (Gladiator)', 'Arthur Curry', '244', 'Patina', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293', 0.82::numeric, 'Aquaman Patina checklist item.'),
    ('Aquaman', null, 'Aquaman', 'Aquaman', '245', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293', 0.84::numeric, 'Aquaman Pop! Vinyl checklist item.'),
    ('Aquaman', null, 'Mera', 'Mera', '246', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293', 0.84::numeric, 'Aquaman Pop! Vinyl checklist item.'),
    ('Aquaman', null, 'Orm', 'Orm', '247', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293', 0.84::numeric, 'Aquaman Pop! Vinyl checklist item.'),
    ('Aquaman', null, 'Black Manta', 'Black Manta', '248', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293', 0.84::numeric, 'Aquaman Pop! Vinyl checklist item.'),
    ('Aquaman', null, 'Black Manta', 'Black Manta', '248', 'Black Chrome', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293', 0.82::numeric, 'Aquaman Black Chrome checklist item.'),
    ('Aquaman', null, 'Black Manta', 'Black Manta', '248', 'Gloss Black', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293', 0.82::numeric, 'Aquaman Gloss Black checklist item.'),
    ('Aquaman', null, 'Black Manta', 'Black Manta', '249', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293', 0.84::numeric, 'Aquaman Pop! Vinyl checklist item.'),
    ('Aquaman', null, 'Mera', 'Mera', '250', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293', 0.84::numeric, 'Aquaman Pop! Vinyl checklist item.'),
    ('Aquaman', null, 'Arthur Curry in Hero Suit', 'Arthur Curry', null, 'Chrome', null, 'Pop! Heroes', '3-Pack', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293', 0.80::numeric, 'Aquaman chrome 3-pack checklist item.'),
    ('Aquaman', null, 'Aquaman', 'Aquaman', '439', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=293', 0.80::numeric, 'Aquaman later-wave Pop! Vinyl checklist item.')
), matched as (
  select
    target_sets.id as set_id,
    pc.id as pop_catalog_id,
    checklist.*
  from checklist
  join target_sets on target_sets.canonical_name = checklist.set_name
  left join lateral (
    select id
    from public.pop_catalog pc
    where lower(pc.set_name) = lower(checklist.set_name)
      and (
        (checklist.upc_value is not null and pc.upc = checklist.upc_value)
        or (
          checklist.number_value is not null
          and pc.number = checklist.number_value
          and (
            lower(coalesce(pc.pop_name, pc.character, '')) = lower(checklist.pop_name)
            or lower(coalesce(pc.character, pc.pop_name, '')) = lower(checklist.character_name)
          )
        )
        or (
          checklist.number_value is null
          and lower(coalesce(pc.pop_name, pc.character, '')) = lower(checklist.pop_name)
        )
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
  upc,
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
  upc_value,
  pop_name,
  character_name,
  number_value,
  variant_value,
  exclusivity_value,
  pop_type_value,
  pop_style_value,
  true,
  source_url,
  confidence_value,
  notes_value
from matched
on conflict (set_id, coalesce(number, ''), lower(coalesce(pop_name, '')), lower(coalesce(variant, '')), lower(coalesce(exclusivity, ''))) do update set
  pop_catalog_id = excluded.pop_catalog_id,
  upc = excluded.upc,
  character = excluded.character,
  pop_type = excluded.pop_type,
  pop_style = excluded.pop_style,
  is_required_for_completion = excluded.is_required_for_completion,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  notes = excluded.notes,
  updated_at = now();
