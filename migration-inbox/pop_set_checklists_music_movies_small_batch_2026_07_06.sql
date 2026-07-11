with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values
    ('Boyz II Men', 'Boyz II Men', 'reviewed', 'Wertoys Boyz II Men set listing and Pop Rocks checklist cross-check', 'https://wertoys.com/funko-pop-rocks-boyz-ii-men-item-s-231-232-233-set-of-3-vinyl-figures-2021/', 0.88, now(), 'Reviewed checklist includes Nathan Morris #231, Shawn Stockman #232, and Wanya Morris #233.'),
    ('New Kids On The Block', 'New Kids on the Block', 'reviewed', 'Figure Realm New Kids on the Block checklist', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3753', 0.90, now(), 'Reviewed checklist includes Donnie #312, Joey #313, Jordan #314, Jonathan #315, and Danny #316.'),
    ('Dirty Dancing', 'Dirty Dancing', 'reviewed', 'Figure Realm Dirty Dancing checklist', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6710&mode=1&series=dirtydancingfunko', 0.88, now(), 'Reviewed checklist includes 2018 and 2021 Baby/Johnny releases: #696, #697, #1098, #1099.'),
    ('Zoolander', 'Zoolander', 'reviewed', 'Figure Realm Zoolander checklist and Comic Spot chase note', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7557&mode=3&series=zoolanderfunko', 0.90, now(), 'Reviewed checklist includes Derek #700, Hansel #701, Mugatu #702, Mugatu with Dog Chase #702, and Derek Zoolander Merman #703.')
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
  select id, canonical_name from public.pop_sets where canonical_name in ('Boyz II Men', 'New Kids On The Block', 'Dirty Dancing', 'Zoolander')
), checklist(set_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, source_url, confidence_value, notes_value) as (
  values
    ('Boyz II Men', 'Nathan Morris', 'Nathan Morris', '231', 'Common', null, 'Pop! Rocks', 'Standard', 'https://wertoys.com/funko-pop-rocks-boyz-ii-men-item-s-231-232-233-set-of-3-vinyl-figures-2021/', 0.88::numeric, 'Boyz II Men checklist item.'),
    ('Boyz II Men', 'Shawn Stockman', 'Shawn Stockman', '232', 'Common', null, 'Pop! Rocks', 'Standard', 'https://wertoys.com/funko-pop-rocks-boyz-ii-men-item-s-231-232-233-set-of-3-vinyl-figures-2021/', 0.88::numeric, 'Boyz II Men checklist item.'),
    ('Boyz II Men', 'Wanya Morris', 'Wanya Morris', '233', 'Common', null, 'Pop! Rocks', 'Standard', 'https://wertoys.com/funko-pop-rocks-boyz-ii-men-item-s-231-232-233-set-of-3-vinyl-figures-2021/', 0.88::numeric, 'Boyz II Men checklist item.'),
    ('New Kids On The Block', 'Donnie', 'Donnie', '312', 'Common', null, 'Pop! Rocks', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3753', 0.90::numeric, 'New Kids on the Block checklist item.'),
    ('New Kids On The Block', 'Joey', 'Joey', '313', 'Common', null, 'Pop! Rocks', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3753', 0.90::numeric, 'New Kids on the Block checklist item.'),
    ('New Kids On The Block', 'Jordan', 'Jordan', '314', 'Common', null, 'Pop! Rocks', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3753', 0.90::numeric, 'New Kids on the Block checklist item.'),
    ('New Kids On The Block', 'Jonathan', 'Jonathan', '315', 'Common', null, 'Pop! Rocks', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3753', 0.90::numeric, 'New Kids on the Block checklist item.'),
    ('New Kids On The Block', 'Danny', 'Danny', '316', 'Common', null, 'Pop! Rocks', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3753', 0.90::numeric, 'New Kids on the Block checklist item.'),
    ('Dirty Dancing', 'Baby', 'Baby', '696', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6710&mode=1&series=dirtydancingfunko', 0.88::numeric, 'Dirty Dancing 2018 checklist item.'),
    ('Dirty Dancing', 'Johnny', 'Johnny', '697', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6710&mode=1&series=dirtydancingfunko', 0.88::numeric, 'Dirty Dancing 2018 checklist item.'),
    ('Dirty Dancing', 'Baby', 'Baby', '1098', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6710&mode=1&series=dirtydancingfunko', 0.88::numeric, 'Dirty Dancing 2021 checklist item.'),
    ('Dirty Dancing', 'Johnny', 'Johnny', '1099', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6710&mode=1&series=dirtydancingfunko', 0.88::numeric, 'Dirty Dancing 2021 checklist item.'),
    ('Zoolander', 'Derek Zoolander', 'Derek Zoolander', '700', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7557&mode=3&series=zoolanderfunko', 0.90::numeric, 'Zoolander checklist item.'),
    ('Zoolander', 'Hansel', 'Hansel', '701', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7557&mode=3&series=zoolanderfunko', 0.90::numeric, 'Zoolander checklist item.'),
    ('Zoolander', 'Mugatu', 'Mugatu', '702', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7557&mode=3&series=zoolanderfunko', 0.90::numeric, 'Zoolander checklist item.'),
    ('Zoolander', 'Mugatu Holding Dog', 'Mugatu Holding Dog', '702', 'Chase', null, 'Pop! Movies', 'Standard', 'https://acomicspot.com/pop-movies-zoolander-mugatu-702/', 0.88::numeric, 'Zoolander Mugatu with Dog chase checklist item.'),
    ('Zoolander', 'Derek Zoolander Merman', 'Derek Zoolander Merman', '703', 'Common', 'San Diego Comic-Con', 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7557&mode=3&series=zoolanderfunko', 0.90::numeric, 'Zoolander Merman checklist item.')
), matched as (
  select
    target_sets.id as set_id,
    pc.id as pop_catalog_id,
    checklist.*
  from checklist
  join target_sets on target_sets.canonical_name = checklist.set_name
  left join public.pop_catalog pc
    on lower(pc.set_name) = lower(checklist.set_name)
    and pc.number = checklist.number_value
    and (
      lower(coalesce(pc.pop_name, pc.character, '')) = lower(checklist.pop_name)
      or lower(coalesce(pc.character, pc.pop_name, '')) = lower(checklist.character_name)
      or lower(coalesce(pc.pop_name, pc.character, '')) like '%' || lower(split_part(checklist.pop_name, ' ', 1)) || '%'
    )
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
  null,
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
  character = excluded.character,
  pop_type = excluded.pop_type,
  pop_style = excluded.pop_style,
  is_required_for_completion = excluded.is_required_for_completion,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  notes = excluded.notes,
  updated_at = now();
