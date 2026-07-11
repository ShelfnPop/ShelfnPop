-- Audit note: Star Wars cleanup batch 1, applied 2026-07-08.
-- Scope: visible total/count issues plus first reviewed Star Wars set expansion.
-- Sources:
--   Existing in-app Solo: A Star Wars Story reviewed checklist.
--   FigureRealm Star Wars - Rogue One checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5122
--
-- Live changes made:
--   * Propagated the existing reviewed Solo: A Star Wars Story total of 21 onto catalog rows.
--   * Created/updated reviewed Star Wars: Rogue One checklist with 37 required Pop! Vinyl rows.
--   * Propagated Rogue One set_total of 37 onto owned/catalog Rogue One rows.
--   * Fixed typo set name Star Star Wars: The Force Awakens to Star Wars: The Force Awakens without assigning a total yet.

update public.pop_catalog
set set_total = case
  when set_name = 'Solo: A Star Wars Story' then 21
  when set_name = 'Star Wars: Rogue One' then 37
  else set_total
end
where set_name in ('Solo: A Star Wars Story', 'Star Wars: Rogue One');

update public.pop_catalog
set set_name = 'Star Wars: The Force Awakens'
where set_name = 'Star Star Wars: The Force Awakens';

with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'Star Wars: Rogue One',
    'Star Wars',
    'reviewed',
    'FigureRealm Star Wars - Rogue One checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5122',
    0.90,
    now(),
    'FigureRealm lists 37 Pop! Vinyl Figure rows for Star Wars - Rogue One.'
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
    ('Star Wars: Rogue One', 'Baze Malbus', 'Baze Malbus', '141', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Bistan', 'Bistan', '155', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Bodhi', 'Bodhi', '183', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'C2-B5', 'C2-B5', '147', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Captain Cassian Andor', 'Captain Cassian Andor', '139', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Captain Cassian Andor', 'Captain Cassian Andor', '151', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Chirrut Imwe', 'Chirrut Imwe', '140', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Combat Assault Tank Trooper', 'Combat Assault Tank Trooper', '184', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Darth Vader', 'Darth Vader', '143', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Darth Vader', 'Darth Vader', '157', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Darth Vader', 'Darth Vader', '157', 'Black Chrome', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Darth Vader', 'Darth Vader', '157', 'Blue Chrome', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Darth Vader', 'Darth Vader', '157', 'Futura', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Darth Vader', 'Darth Vader', '157', 'Gold Chrome', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Darth Vader', 'Darth Vader', '157', 'Gold', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Darth Vader', 'Darth Vader', '157', 'Red Chrome', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Death Star Droid (Black)', 'Death Star Droid', '189', 'Black', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Death Star Droid (Silver)', 'Death Star Droid', '188', 'Silver', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Director Orson Krennic', 'Director Orson Krennic', '142', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Galen Erso', 'Galen Erso', '186', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Imperial Death Trooper', 'Imperial Death Trooper', '144', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Imperial Death Trooper', 'Imperial Death Trooper', '149', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Imperial Death Trooper', 'Imperial Death Trooper', '154', 'Chrome', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Jyn Erso', 'Jyn Erso', '138', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Jyn Erso', 'Jyn Erso', '148', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Jyn Erso', 'Jyn Erso', '150', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Jyn Erso', 'Jyn Erso', '152', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Jyn Erso', 'Jyn Erso', '178', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'K-2SO', 'K-2SO', '146', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'K-2SO', 'K-2SO', '179', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Power of the Galaxy: Jyn Erso', 'Jyn Erso', '555', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Saw Gererra', 'Saw Gererra', '153', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Saw Gerrera', 'Saw Gerrera', '177', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Scarif Stormtrooper', 'Scarif Stormtrooper', '145', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Scarif Stormtrooper', 'Scarif Stormtrooper', '156', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Weeteef Cyubee', 'Weeteef Cyubee', '187', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric),
    ('Star Wars: Rogue One', 'Young Jyn Erso', 'Young Jyn Erso', '185', 'Common', null, 'Pop! Star Wars', 'Standard', 0.90::numeric)
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
  'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5122',
  confidence_value,
  'Star Wars: Rogue One checklist item.'
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
