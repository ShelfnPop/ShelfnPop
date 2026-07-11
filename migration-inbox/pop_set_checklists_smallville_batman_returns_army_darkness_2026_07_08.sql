-- Audit note: Smallville, Batman Returns, and Army of Darkness reviewed checklist pass, 2026-07-08.
--
-- Sources:
--   Smallville FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4759
--   Batman Returns FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=24
--   Army of Darkness FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6369
--   Army of Darkness Funko product page for VHS Cover item:
--     https://funko.com/pop-vhs-covers-army-of-darkness-ash-williams/81948.html
--
-- Live changes:
--   * Promote Smallville to reviewed with 8 Pop! rows.
--   * Promote Batman Returns to reviewed with 5 Batman Returns Pop! rows.
--   * Promote Army of Darkness to reviewed with 8 rows, including the Pop! VHS Cover.
--   * Normalize 8 owned catalog rows and set scoped completion totals.

with smallville_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Smallville','DC','reviewed','FigureRealm Smallville Pop! checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4759',0.90,now(),'FigureRealm lists 8 Smallville Pop! Vinyl rows. Completion denominator is 8.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), batman_returns_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Batman Returns','DC','reviewed','FigureRealm Batman Returns Pop! checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=24',0.90,now(),'FigureRealm lists 5 Batman Returns Pop! rows. Completion denominator is 5.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), army_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Army of Darkness','Army of Darkness','reviewed','FigureRealm Army of Darkness Funko checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6369',0.90,now(),'FigureRealm lists 8 Army of Darkness Funko rows: 1 Pop! VHS Cover and 7 Pop! Vinyl Figures. Completion denominator is 8.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), clear_prior as (
  delete from public.pop_set_checklist_items
  where set_id in (select id from smallville_set union all select id from batman_returns_set union all select id from army_set)
  returning id
), checklist(set_name, franchise_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, confidence_value, source_value, notes_value) as (
  values
    ('Smallville','DC','Clark Kent','Clark Kent','625',null,null,'Pop! Television','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4759','Smallville checklist item.'),
    ('Smallville','DC','Clark Kent','Clark Kent','543',null,null,'Pop! Television','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4759','Smallville checklist item.'),
    ('Smallville','DC','Clark Kent (Shirtless)','Clark Kent','627','Shirtless',null,'Pop! Television','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4759','Smallville checklist item.'),
    ('Smallville','DC','Doomsday Max','Doomsday Max','541',null,null,'Pop! Television','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4759','Owned row checklist item.'),
    ('Smallville','DC','Green Arrow','Green Arrow','628',null,null,'Pop! Television','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4759','Smallville checklist item.'),
    ('Smallville','DC','Kara Kent','Kara Kent','542',null,null,'Pop! Television','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4759','Owned row checklist item.'),
    ('Smallville','DC','Lex Luthor','Lex Luthor','626',null,null,'Pop! Television','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4759','Smallville checklist item.'),
    ('Smallville','DC','Lois Lane','Lois Lane','629',null,null,'Pop! Television','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4759','Smallville checklist item.'),
    ('Batman Returns','DC','Catwoman','Catwoman','338',null,null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=24','Batman Returns checklist item.'),
    ('Batman Returns','DC','Catwoman (Pink) (Art Series)','Catwoman','62','Pink Art Series',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=24','Owned row checklist item.'),
    ('Batman Returns','DC','Penguin','Penguin','339',null,null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=24','Batman Returns checklist item.'),
    ('Batman Returns','DC','Penguin (Blue) (Art Series)','Penguin','63','Blue Art Series',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=24','Owned row checklist item.'),
    ('Batman Returns','DC','Penguin and Duck Ride','Penguin','288',null,'Summer Convention','Pop! Heroes','Ride',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=24','Owned row checklist item.'),
    ('Army of Darkness','Army of Darkness','Ash Williams','Ash Williams','20',null,'GameStop','Pop! VHS Covers','VHS Cover',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6369','Owned row checklist item.'),
    ('Army of Darkness','Army of Darkness','Ash (Army of Darkness)','Ash','53',null,null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6369','Owned row checklist item.'),
    ('Army of Darkness','Army of Darkness','Ash (Army of Darkness)','Ash','1024',null,null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6369','Army of Darkness checklist item.'),
    ('Army of Darkness','Army of Darkness','Ash (Boomstick)','Ash','1880','Boomstick',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6369','Army of Darkness checklist item.'),
    ('Army of Darkness','Army of Darkness','Deadite (Army of Darkness)','Deadite','54',null,null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6369','Army of Darkness checklist item.'),
    ('Army of Darkness','Army of Darkness','Deadite (Army of Darkness) (Glow in the Dark)','Deadite','54','Glow in the Dark',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6369','Army of Darkness checklist item.'),
    ('Army of Darkness','Army of Darkness','Evil Ash (Sword)','Evil Ash','1671','Sword',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6369','Army of Darkness checklist item.'),
    ('Army of Darkness','Army of Darkness','Evil Ash (Swords)','Evil Ash','1881','Swords',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6369','Army of Darkness checklist item.')
), target_sets as (
  select id, 'Smallville'::text as canonical_name, 'DC'::text as franchise from smallville_set
  union all select id, 'Batman Returns'::text, 'DC'::text from batman_returns_set
  union all select id, 'Army of Darkness'::text, 'Army of Darkness'::text from army_set
), inserted_checklist as (
  insert into public.pop_set_checklist_items (set_id, pop_name, character, number, variant, exclusivity, pop_type, pop_style, is_required_for_completion, source_url, confidence, notes)
  select target_sets.id, checklist.pop_name, checklist.character_name, checklist.number_value, checklist.variant_value, checklist.exclusivity_value, checklist.pop_type_value, checklist.pop_style_value, true, checklist.source_value, checklist.confidence_value, checklist.notes_value
  from checklist join target_sets on target_sets.canonical_name = checklist.set_name and target_sets.franchise = checklist.franchise_name
  returning id
), owned_updates(upc, set_name, franchise_name, total_value, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value) as (
  values
    ('889698834827','Smallville','DC',8,'Kara Kent','Kara Kent','542',null,null,'Pop! Television','Standard'),
    ('889698834810','Smallville','DC',8,'Doomsday Max','Doomsday Max','541',null,null,'Pop! Television','Standard'),
    ('889698583961','Batman Returns','DC',5,'Catwoman (Pink) (Art Series)','Catwoman','62','Pink Art Series',null,'Pop! Heroes','Standard'),
    ('889698601016','Batman Returns','DC',5,'Penguin (Blue) (Art Series)','Penguin','63','Blue Art Series',null,'Pop! Heroes','Standard'),
    ('889698652148','Batman Returns','DC',5,'Penguin and Duck Ride','Penguin','288',null,'Summer Convention','Pop! Heroes','Ride'),
    ('889698819480','Army of Darkness','Army of Darkness',8,'Ash Williams','Ash Williams','20',null,'GameStop','Pop! VHS Covers','VHS Cover'),
    ('889698838405','Army of Darkness','Army of Darkness',8,'Ash (Army of Darkness)','Ash','53',null,null,'Pop! Movies','Standard'),
    ('830395034072','Army of Darkness','Army of Darkness',8,'Ash (Army of Darkness)','Ash','53',null,null,'Pop! Movies','Standard')
), updated_catalog as (
  update public.pop_catalog pc
  set pop_name=owned_updates.pop_name, character=owned_updates.character_name, franchise=owned_updates.franchise_name, set_name=owned_updates.set_name, number=owned_updates.number_value, variant=owned_updates.variant_value, exclusivity=owned_updates.exclusivity_value, pop_type=owned_updates.pop_type_value, pop_style=owned_updates.pop_style_value, set_total=owned_updates.total_value, needs_review=false, parse_confidence=greatest(coalesce(pc.parse_confidence,0),0.90),
    description = owned_updates.pop_name || ' is a ' || owned_updates.set_name || ' ' || owned_updates.pop_type_value || ' release #' || owned_updates.number_value || case when owned_updates.variant_value is not null then ', ' || owned_updates.variant_value || ' variant' else '' end || case when owned_updates.exclusivity_value is not null then ', ' || owned_updates.exclusivity_value || ' exclusive' else '' end || '.',
    display_description = owned_updates.pop_name || ' is a ' || owned_updates.set_name || ' ' || owned_updates.pop_type_value || ' release #' || owned_updates.number_value || case when owned_updates.variant_value is not null then ', ' || owned_updates.variant_value || ' variant' else '' end || case when owned_updates.exclusivity_value is not null then ', ' || owned_updates.exclusivity_value || ' exclusive' else '' end || '.'
  from owned_updates
  where pc.upc = owned_updates.upc
  returning pc.id
)
select (select count(*) from inserted_checklist) as inserted_checklist_rows, (select count(*) from updated_catalog) as updated_catalog_rows;

-- Relink after apply:
-- update public.pop_set_checklist_items ci
-- set pop_catalog_id = pc.id, upc = pc.upc, updated_at = now()
-- from public.pop_catalog pc, public.pop_sets ps
-- where ps.id = ci.set_id
--   and ps.canonical_name in ('Smallville', 'Batman Returns', 'Army of Darkness')
--   and pc.set_name = ps.canonical_name
--   and pc.franchise = ps.franchise
--   and ci.number = pc.number
--   and lower(ci.pop_name) = lower(pc.pop_name);
