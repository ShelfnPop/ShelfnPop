-- Toy Story + Stranger Things set totals/checklists, 2026-07-08.
-- Sources:
-- - MyPopFigures Toy Story subseries checklists.
-- - FunkyPriceGuide Stranger Things 168-item checklist already loaded in pop_sets.
-- - POPsToday Stranger Things 5 checklist showing 33 items.

update public.pop_sets
set canonical_name = 'Stranger Things (All)',
    notes = coalesce(notes, '') || ' Renamed from Stranger Things so season-specific app buckets do not inherit the full master checklist total.',
    updated_at = now()
where canonical_name = 'Stranger Things'
  and franchise = 'Stranger Things'
  and exists (
    select 1
    from public.pop_set_checklist_items
    where pop_set_checklist_items.set_id = pop_sets.id
  );

update public.pop_catalog
set set_name = case id
  when '4b32cb14-2a40-4a10-998e-954cfbe9ad0a'::uuid then 'Stranger Things: Season 4'
  when 'b3532733-7da7-4e28-be5c-1fe92973aea3'::uuid then 'Stranger Things: Season 5'
  when 'da46f409-f5a0-4724-89f2-7955759b8f46'::uuid then 'Stranger Things: Season 5'
  when 'afd2f341-f4ed-4ab7-8196-92b7cacc7edf'::uuid then 'Stranger Things: Season 4'
  when '2a1caa73-3aac-49af-884e-9c311341537d'::uuid then 'Stranger Things: Season 2'
  when '80fff8c4-5d5a-4095-bca3-02894f0e8a14'::uuid then 'Stranger Things: Season 4'
  else set_name
end
where id in (
  '4b32cb14-2a40-4a10-998e-954cfbe9ad0a'::uuid,
  'b3532733-7da7-4e28-be5c-1fe92973aea3'::uuid,
  'da46f409-f5a0-4724-89f2-7955759b8f46'::uuid,
  'afd2f341-f4ed-4ab7-8196-92b7cacc7edf'::uuid,
  '2a1caa73-3aac-49af-884e-9c311341537d'::uuid,
  '80fff8c4-5d5a-4095-bca3-02894f0e8a14'::uuid
);

update public.pop_catalog
set set_total = case set_name
  when 'Toy Story' then 19
  when 'Toy Story 4' then 21
  when 'Toy Story 5' then 8
  when 'Lightyear' then 7
  when 'Toy Story 30th Anniversary' then 5
  when 'Stranger Things: Season 1' then 40
  when 'Stranger Things: Season 2' then 32
  when 'Stranger Things: Season 3' then 28
  when 'Stranger Things: Season 4' then 48
  when 'Stranger Things: Season 5' then 33
  else set_total
end
where set_name in (
  'Toy Story',
  'Toy Story 4',
  'Toy Story 5',
  'Lightyear',
  'Toy Story 30th Anniversary',
  'Stranger Things: Season 1',
  'Stranger Things: Season 2',
  'Stranger Things: Season 3',
  'Stranger Things: Season 4',
  'Stranger Things: Season 5'
);

with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values
    ('Toy Story', 'Toy Story', 'reviewed', 'MyPopFigures Toy Story Pop! Vinyl checklist', 'https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11', 0.90, now(), 'Pop! Vinyl Figures subseries, 19 items.'),
    ('Toy Story 4', 'Toy Story', 'reviewed', 'MyPopFigures Toy Story 4 Pop! checklist', 'https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12', 0.90, now(), 'Toy Story 4 Pop! subseries, 21 items.'),
    ('Toy Story 5', 'Toy Story', 'reviewed', 'MyPopFigures Toy Story 5 Pop! checklist', 'https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=2', 0.88, now(), 'Toy Story 5 Pop! subseries, 8 items.'),
    ('Lightyear', 'Toy Story', 'reviewed', 'MyPopFigures Lightyear Pop! checklist', 'https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=4', 0.90, now(), 'Lightyear Pop! subseries, 7 items.'),
    ('Toy Story 30th Anniversary', 'Toy Story', 'reviewed', 'MyPopFigures Toy Story 30th Anniversary and Rides checklists', 'https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=3', 0.86, now(), '30th Anniversary Pop! subseries plus Woody on Bullseye 30th Anniversary Ride, 5 items.'),
    ('Stranger Things: Season 1', 'Stranger Things', 'reviewed', 'Derived from loaded FunkyPriceGuide Stranger Things checklist', 'https://funkypriceguide.com/checklist/funko-pop-stranger-things/', 0.82, now(), 'Derived from full Stranger Things checklist by box-number range; 40 items.'),
    ('Stranger Things: Season 2', 'Stranger Things', 'reviewed', 'Derived from loaded FunkyPriceGuide Stranger Things checklist', 'https://funkypriceguide.com/checklist/funko-pop-stranger-things/', 0.82, now(), 'Derived from full Stranger Things checklist by box-number range; 32 items.'),
    ('Stranger Things: Season 3', 'Stranger Things', 'reviewed', 'Derived from loaded FunkyPriceGuide Stranger Things checklist', 'https://funkypriceguide.com/checklist/funko-pop-stranger-things/', 0.82, now(), 'Derived from full Stranger Things checklist by box-number range; 28 items.'),
    ('Stranger Things: Season 4', 'Stranger Things', 'reviewed', 'Derived from loaded FunkyPriceGuide Stranger Things checklist', 'https://funkypriceguide.com/checklist/funko-pop-stranger-things/', 0.82, now(), 'Derived from full Stranger Things checklist by box-number range plus season-four deluxe/pack exceptions; 48 items.'),
    ('Stranger Things: Season 5', 'Stranger Things', 'reviewed', 'POPsToday Stranger Things 5 checklist', 'https://pops.today/user/POPsToday/list/Stranger-Things-5-POPs/', 0.78, now(), 'POPsToday checklist shows 33 Stranger Things 5 items; newer wave should be rechecked as releases settle.')
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
  select id, canonical_name
  from public.pop_sets
  where canonical_name in (
    'Toy Story',
    'Toy Story 4',
    'Toy Story 5',
    'Lightyear',
    'Toy Story 30th Anniversary',
    'Stranger Things: Season 1',
    'Stranger Things: Season 2',
    'Stranger Things: Season 3',
    'Stranger Things: Season 4',
    'Stranger Things: Season 5'
  )
), toy_checklist(set_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, source_url, confidence_value, notes_value) as (
  values
    ('Toy Story','Army Man','Army Man','377','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Army Man','Army Man','377','Metallic','BoxLunch','Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Bo Peep','Bo Peep','517','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Bullseye','Bullseye','520','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Bullseye','Bullseye','520','Flocked',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Buzz Lightyear','Buzz Lightyear','169','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Chuckles','Chuckles','561','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Ham','Ham','170','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Lotso','Lotso','1748','Flocked',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Mr. Pricklepants','Mr. Pricklepants','562','Common','San Diego Comic-Con','Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Mrs. Nesbitt','Mrs. Nesbitt','518','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Rex','Rex','171','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Rex','Rex','1091','Space Helmet Deluxe',null,'Pop! Disney','Deluxe','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Slinky Dog','Slinky Dog','516','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Stinky Pete','Stinky Pete','1397','Common','Specialty Series','Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Tin Toy','Tin Toy','1559','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Wheezy','Wheezy','519','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Woody','Woody','168','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),
    ('Toy Story','Woody','Woody','168','Black & White',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=11',0.90::numeric,'Toy Story Pop! Vinyl checklist item.'),

    ('Toy Story 4','Alien','Alien','525','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Alien','Alien','525','Glitter','Hot Topic','Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Benson','Benson','618','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Bo Peep','Bo Peep','533','Fighting Stance',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Bo Peep with Officer Giggle McDimples','Bo Peep','524','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Bunny','Bunny','532','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Bunny','Bunny','532','Flocked',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Buzz Lightyear','Buzz Lightyear','523','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Buzz Lightyear','Buzz Lightyear','523','Diamond Collection',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Buzz Lightyear','Buzz Lightyear','536','Floating',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Combat Carl Jr.','Combat Carl Jr.','530','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Ducky','Ducky','531','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Ducky','Ducky','531','Flocked',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Duke Caboom','Duke Caboom','529','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Forky','Forky','528','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Forky','Forky','534','Sad',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Gabby Gabby','Gabby Gabby','527','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Gabby Gabby','Gabby Gabby','537','Holding Forky',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Jessie','Jessie','526','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Sheriff Woody','Sheriff Woody','522','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),
    ('Toy Story 4','Sheriff Woody','Sheriff Woody','535','Holding Forky',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=12',0.90::numeric,'Toy Story 4 checklist item.'),

    ('Toy Story 5','Jessie','Jessie','1710','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=2',0.88::numeric,'Toy Story 5 checklist item.'),
    ('Toy Story 5','Woody','Woody','1711','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=2',0.88::numeric,'Toy Story 5 checklist item.'),
    ('Toy Story 5','Buzz Lightyear','Buzz Lightyear','1712','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=2',0.88::numeric,'Toy Story 5 checklist item.'),
    ('Toy Story 5','Bullseye','Bullseye','1713','Common',null,'Pop! Premium','Premium','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=2',0.88::numeric,'Toy Story 5 checklist item.'),
    ('Toy Story 5','Lilypad','Lilypad','1714','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=2',0.88::numeric,'Toy Story 5 checklist item.'),
    ('Toy Story 5','Smarty Pants','Smarty Pants','1715','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=2',0.88::numeric,'Toy Story 5 checklist item.'),
    ('Toy Story 5','Blaze''s Pet Pig with Jessie','Blaze''s Pet Pig with Jessie','1716','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=2',0.88::numeric,'Toy Story 5 checklist item.'),
    ('Toy Story 5','Blaze Manoukian','Blaze Manoukian','1719','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=2',0.88::numeric,'Toy Story 5 checklist item.'),

    ('Lightyear','Buzz Lightyear','Buzz Lightyear','1230','Space Ranger Alpha',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=4',0.90::numeric,'Lightyear checklist item.'),
    ('Lightyear','Buzz Lightyear','Buzz Lightyear','1210','XL-01',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=4',0.90::numeric,'Lightyear checklist item.'),
    ('Lightyear','Buzz Lightyear with Sox','Buzz Lightyear','1211','XL-15 with Sox',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=4',0.90::numeric,'Lightyear checklist item.'),
    ('Lightyear','Izzy Hawthorne','Izzy Hawthorne','1212','Jr. Zap Patrol',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=4',0.90::numeric,'Lightyear checklist item.'),
    ('Lightyear','Sox','Sox','1213','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=4',0.90::numeric,'Lightyear checklist item.'),
    ('Lightyear','Sox','Sox','1213','Flocked',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=4',0.90::numeric,'Lightyear checklist item.'),
    ('Lightyear','Zurg','Zurg','1214','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=4',0.90::numeric,'Lightyear checklist item.'),

    ('Toy Story 30th Anniversary','Alien with Claw','Alien','1595','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=3',0.86::numeric,'Toy Story 30th Anniversary checklist item.'),
    ('Toy Story 30th Anniversary','Andy','Andy','1596','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=3',0.86::numeric,'Toy Story 30th Anniversary checklist item.'),
    ('Toy Story 30th Anniversary','Woody on Bullseye','Woody on Bullseye','1597','Common','Funko Shop','Pop! Rides','Ride','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=8',0.86::numeric,'Toy Story 30th Anniversary ride checklist item.'),
    ('Toy Story 30th Anniversary','Sid','Sid','1598','Common',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=3',0.86::numeric,'Toy Story 30th Anniversary checklist item.'),
    ('Toy Story 30th Anniversary','Al','Al','1600','Chicken Suit',null,'Pop! Disney','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=5618&ssid=3',0.86::numeric,'Toy Story 30th Anniversary checklist item.')
), toy_matched as (
  select
    target_sets.id as set_id,
    pc.id as pop_catalog_id,
    toy_checklist.*
  from toy_checklist
  join target_sets on target_sets.canonical_name = toy_checklist.set_name
  left join public.pop_catalog pc
    on lower(pc.set_name) = lower(toy_checklist.set_name)
    and pc.number = toy_checklist.number_value
    and (
      lower(coalesce(pc.pop_name, pc.character, '')) = lower(toy_checklist.pop_name)
      or lower(coalesce(pc.character, pc.pop_name, '')) = lower(toy_checklist.character_name)
      or (toy_checklist.set_name = 'Toy Story' and pc.number = toy_checklist.number_value)
      or (toy_checklist.set_name = 'Toy Story 4' and pc.number = toy_checklist.number_value)
      or (toy_checklist.set_name = 'Toy Story 5' and pc.number = toy_checklist.number_value)
      or (toy_checklist.set_name = 'Lightyear' and pc.number = toy_checklist.number_value)
      or (toy_checklist.set_name = 'Toy Story 30th Anniversary' and pc.number = toy_checklist.number_value)
    )
)
insert into public.pop_set_checklist_items (
  set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity,
  pop_type, pop_style, is_required_for_completion, source_url, confidence, notes
)
select
  set_id, pop_catalog_id, null, pop_name, character_name, number_value, variant_value, exclusivity_value,
  pop_type_value, pop_style_value, true, source_url, confidence_value, notes_value
from toy_matched
on conflict (set_id, coalesce(number, ''), lower(coalesce(pop_name, '')), lower(coalesce(variant, '')), lower(coalesce(exclusivity, ''))) do update set
  pop_catalog_id = excluded.pop_catalog_id,
  character = excluded.character,
  pop_type = excluded.pop_type,
  pop_style = excluded.pop_style,
  is_required_for_completion = excluded.is_required_for_completion,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  notes = excluded.notes,
  updated_at = now();

-- Copy season-level Stranger Things checklist rows from the reviewed 168-item full checklist.
with full_set as (
  select id from public.pop_sets where canonical_name = 'Stranger Things (All)' and franchise = 'Stranger Things'
), source_rows as (
  select
    i.*,
    nullif(regexp_replace(coalesce(i.number,''), '\D', '', 'g'), '')::int as n
  from public.pop_set_checklist_items i
  join full_set on full_set.id = i.set_id
), classified as (
  select
    case
      when lower(pop_name) like '%dustin%eddie%demobats%' then 'Stranger Things: Season 4'
      when lower(pop_name) like '%robin%steve%vecna%' then 'Stranger Things: Season 4'
      when n between 421 and 526 or n in (16,17,18,19,20,28,29) then 'Stranger Things: Season 1'
      when n between 545 and 729 then 'Stranger Things: Season 2'
      when n between 801 and 923 then 'Stranger Things: Season 3'
      when n between 1185 and 1597 then 'Stranger Things: Season 4'
      when n between 1778 and 1909 then 'Stranger Things: Season 5'
      else null
    end as target_set_name,
    source_rows.*
  from source_rows
), mapped as (
  select
    target_sets.id as set_id,
    classified.pop_catalog_id,
    classified.upc,
    classified.pop_name,
    classified.character,
    classified.number,
    classified.variant,
    classified.exclusivity,
    classified.pop_type,
    classified.pop_style,
    classified.is_required_for_completion,
    classified.source_url,
    least(classified.confidence, 0.82) as confidence,
    classified.notes
  from classified
  join target_sets on target_sets.canonical_name = classified.target_set_name
  where classified.target_set_name is not null
    and classified.target_set_name <> 'Stranger Things: Season 5'
)
insert into public.pop_set_checklist_items (
  set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity,
  pop_type, pop_style, is_required_for_completion, source_url, confidence, notes
)
select
  set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity,
  pop_type, pop_style, is_required_for_completion, source_url, confidence, notes
from mapped
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

-- Season 5 source list is newer than the loaded 168-item FunkyPriceGuide checklist.
with target_sets as (
  select id, canonical_name from public.pop_sets where canonical_name = 'Stranger Things: Season 5' and franchise = 'Stranger Things'
), season5(pop_name, character_name, number_value, variant_value, exclusivity_value, pop_style_value) as (
  values
    ('Nancy Wheeler','Nancy Wheeler','1778','Common',null,'Standard'),
    ('Steve Harrington','Steve Harrington','1779','Common',null,'Standard'),
    ('Eleven','Eleven','1780','With Bandana',null,'Standard'),
    ('Dustin Henderson','Dustin Henderson','1781','Common',null,'Standard'),
    ('Holly Wheeler','Holly Wheeler','1782','Common',null,'Standard'),
    ('Mike Wheeler','Mike Wheeler','1783','Common',null,'Standard'),
    ('Jim Hopper','Jim Hopper','1907','Common',null,'Standard'),
    ('Lucas Sinclair','Lucas Sinclair','1785','With Boombox',null,'Standard'),
    ('Will Byers','Will Byers','1909','Common',null,'Standard'),
    ('Dustin Henderson','Dustin Henderson','1796','With Flashlight','Target','Standard'),
    ('Jonathan Byers','Jonathan Byers','1797','Common',null,'Standard'),
    ('Lucas Sinclair','Lucas Sinclair','1798','With Popcorn','Exclusive','Standard'),
    ('Robin Buckley','Robin Buckley','1799','With Flashlight','Target','Standard'),
    ('Dustin Henderson','Dustin Henderson',null,'Battle Damaged',null,'Standard'),
    ('Joyce Byers','Joyce Byers',null,'With Axe',null,'Standard'),
    ('Nancy Wheeler','Nancy Wheeler','1802','With Shotgun','Funko Shop','Standard'),
    ('Derek Turnbow','Derek Turnbow','1803','Common','Exclusive','Standard'),
    ('Eleven','Eleven',null,'With Bandana Floating',null,'Standard'),
    ('Max Mayfield','Max Mayfield','1805','Common',null,'Standard'),
    ('Vecna 2.0','Vecna 2.0','1806','Common',null,'Standard'),
    ('Eleven','Eleven','1807','In Wetsuit',null,'Standard'),
    ('Mr. Whatsit','Mr. Whatsit','1808','Common',null,'Standard'),
    ('Will Byers','Will Byers','1809','Hive Mind',null,'Standard'),
    ('Holly The Heroic','Holly The Heroic','1810','Common',null,'Standard'),
    ('Erica Sinclair','Erica Sinclair','1812','Common','Funko Shop','Standard'),
    ('Steve Harrington','Steve Harrington',null,'Wave 2',null,'Standard'),
    ('Steve with the Squawk Van','Steve with the Squawk Van',null,'Common',null,'Ride'),
    ('Rockin'' Robin with The Squawk','Rockin'' Robin with The Squawk',null,'Common',null,'Ride'),
    ('Eleven','Eleven',null,'With Bandana',null,'Standard'),
    ('Steve Harrington','Steve Harrington',null,'Wave 3',null,'Standard'),
    ('Dustin Henderson','Dustin Henderson',null,'Common',null,'Standard'),
    ('Robin Buckley','Robin Buckley',null,'Common',null,'Standard'),
    ('Vecna 2.0','Vecna 2.0',null,'Common',null,'Standard')
), matched as (
  select
    target_sets.id as set_id,
    pc.id as pop_catalog_id,
    season5.*
  from season5
  cross join target_sets
  left join public.pop_catalog pc
    on pc.set_name = 'Stranger Things: Season 5'
    and (
      (season5.number_value is not null and pc.number = season5.number_value)
      or (season5.number_value is null and lower(pc.pop_name) = lower(season5.pop_name))
    )
)
insert into public.pop_set_checklist_items (
  set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity,
  pop_type, pop_style, is_required_for_completion, source_url, confidence, notes
)
select
  set_id, pop_catalog_id, null, pop_name, character_name, number_value, variant_value, exclusivity_value,
  'Pop! Television', pop_style_value, true,
  'https://pops.today/user/POPsToday/list/Stranger-Things-5-POPs/',
  0.78,
  'POPsToday Stranger Things 5 checklist item; newer wave should be rechecked.'
from matched
on conflict (set_id, coalesce(number, ''), lower(coalesce(pop_name, '')), lower(coalesce(variant, '')), lower(coalesce(exclusivity, ''))) do update set
  pop_catalog_id = excluded.pop_catalog_id,
  character = excluded.character,
  pop_type = excluded.pop_type,
  pop_style = excluded.pop_style,
  is_required_for_completion = excluded.is_required_for_completion,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  notes = excluded.notes,
  updated_at = now();
