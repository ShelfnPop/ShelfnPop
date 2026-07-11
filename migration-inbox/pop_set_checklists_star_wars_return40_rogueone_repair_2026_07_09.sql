-- Star Wars set batch continuation, applied 2026-07-09.
--
-- Scope:
-- - Finish Return of the Jedi 40th Anniversary as a reviewed 9-item Pop! set.
-- - Normalize leftover Star Wars Rogue One rows into the reviewed Star Wars: Rogue One set.
--
-- Sources:
-- - FigureRealm Return of the Jedi 40th Pop! checklist:
--   https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5146&ssid=18
-- - FigureRealm Star Wars - Rogue One checklist:
--   https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5122&mode=3&series=starwarsrogueonefunko

update public.pop_catalog
set
  set_name = 'Star Wars: Rogue One',
  set_total = 37,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  display_description = replace(
    coalesce(display_description, pop_name || ' belongs to the Star Wars: Rogue One Pop! Star Wars line.'),
    'Star Wars Rogue One',
    'Star Wars: Rogue One'
  )
where franchise = 'Star Wars'
  and set_name = 'Star Wars Rogue One';

update public.pop_catalog
set
  set_total = 9,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false
where franchise = 'Star Wars'
  and set_name = 'Star Wars: Return of the Jedi 40th Anniversary';

with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'Star Wars: Return of the Jedi 40th Anniversary',
    'Star Wars',
    'reviewed',
    'FigureRealm Return of the Jedi 40th Pop! checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5146&ssid=18',
    0.90,
    now(),
    'FigureRealm lists 9 Return of the Jedi 40th Pop! rows.'
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
    ('Star Wars: Return of the Jedi 40th Anniversary', 'Luke Skywalker', 'Luke Skywalker', '605', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Return of the Jedi 40th Anniversary', 'Princess Leia (Boushh)', 'Princess Leia', '606', 'Boushh', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Return of the Jedi 40th Anniversary', 'Princess Leia', 'Princess Leia', '607', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Return of the Jedi 40th Anniversary', 'Wicket', 'Wicket', '608', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Return of the Jedi 40th Anniversary', 'C-3PO', 'C-3PO', '609', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Return of the Jedi 40th Anniversary', 'Darth Vader', 'Darth Vader', '610', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Return of the Jedi 40th Anniversary', 'Jabba the Hutt & Salacious B. Crumb', 'Jabba the Hutt & Salacious B. Crumb', '611', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Return of the Jedi 40th Anniversary', 'Darth Vader vs. Luke Skywalker', 'Darth Vader vs. Luke Skywalker', '612', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Return of the Jedi 40th Anniversary', 'Wicket (with Slingshot)', 'Wicket', '631', 'With Slingshot', null, 'Pop! Star Wars', 'Standard', 0.90::numeric)
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
  'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5146&ssid=18',
  confidence_value,
  'Star Wars: Return of the Jedi 40th Anniversary checklist item.'
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
