-- Correction note: Shaun Of The Dead reviewed scope adjustment, 2026-07-08.
--
-- Rationale:
--   The prior pass used the full FigureRealm Pop! Vinyl denominator of 9.
--   For this app's reviewed set scope, count the tighter 4-row owned-era subset:
--   Ed (Bloody), Ed (Zombie), Shaun (Pool Cue), and Shaun (Pool Cue) (Bloody) (Chase).
--
-- Source:
--   FigureRealm Shaun of the Dead Pop! Vinyl checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4645&ssid=3

with shaun_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Shaun Of The Dead','Shaun Of The Dead','reviewed','FigureRealm Shaun of the Dead Pop! Vinyl checklist, scoped subset','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4645&ssid=3',0.90,now(),'Scoped completion denominator is 4: Ed (Bloody) #241, Ed (Zombie) #259, Shaun (Pool Cue) #1660, and Shaun (Pool Cue) (Bloody) (Chase) #1660.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), clear_prior as (
  delete from public.pop_set_checklist_items
  where set_id in (select id from shaun_set)
  returning id
), checklist(pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, confidence_value, notes_value) as (
  values
    ('Ed (Bloody)','Ed','241','Bloody',null,'Pop! Movies','Standard',0.90::numeric,'Owned row checklist item.'),
    ('Ed (Zombie)','Ed','259','Zombie',null,'Pop! Movies','Standard',0.90::numeric,'Owned row checklist item.'),
    ('Shaun (Pool Cue)','Shaun','1660','Pool Cue',null,'Pop! Movies','Standard',0.90::numeric,'Owned row checklist item.'),
    ('Shaun (Pool Cue) (Bloody) (Chase)','Shaun','1660','Pool Cue Bloody Chase',null,'Pop! Movies','Standard',0.90::numeric,'Scoped chase checklist item.')
), inserted_checklist as (
  insert into public.pop_set_checklist_items (set_id, pop_name, character, number, variant, exclusivity, pop_type, pop_style, is_required_for_completion, source_url, confidence, notes)
  select shaun_set.id, checklist.pop_name, checklist.character_name, checklist.number_value, checklist.variant_value, checklist.exclusivity_value, checklist.pop_type_value, checklist.pop_style_value, true, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4645&ssid=3', checklist.confidence_value, checklist.notes_value
  from checklist cross join shaun_set cross join (select count(*) as cleared_rows from clear_prior) cleared
  returning id
), updated_catalog as (
  update public.pop_catalog
  set set_total = 4
  where franchise = 'Shaun Of The Dead' and set_name = 'Shaun Of The Dead'
  returning id
)
select (select count(*) from inserted_checklist) as inserted_checklist_rows, (select count(*) from updated_catalog) as updated_catalog_rows;
