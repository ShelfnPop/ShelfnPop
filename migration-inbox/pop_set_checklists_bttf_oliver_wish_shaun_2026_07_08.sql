-- Audit note: Back to the Future, Oliver & Company, Wish, and Shaun Of The Dead reviewed checklist pass, 2026-07-08.
--
-- Sources:
--   Back to the Future FigureRealm Pop! Vinyl checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12
--   Oliver & Company FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7591
--   Wish FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6101
--   Shaun of the Dead FigureRealm Pop! Vinyl checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4645&ssid=3
--
-- Live changes:
--   * Promote Back to the Future to reviewed with 25 Pop! Vinyl rows.
--   * Promote Oliver & Company to reviewed with 3 Pop! Vinyl rows.
--   * Promote Wish to reviewed with 6 Pop! Vinyl rows.
--   * Promote Shaun Of The Dead to reviewed with 9 Pop! Vinyl rows.
--   * Normalize 13 owned catalog rows and set scoped completion totals.

with bttf_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Back to the Future','Back to the Future','reviewed','FigureRealm Back to the Future Pop! Vinyl checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12',0.90,now(),'FigureRealm Pop! Vinyl Figures subseries lists 25 Back to the Future rows. Completion denominator excludes Digital, Moments, keychains, Rides, Towns, VHS Covers, Soda, and Vinyl Idolz.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), oliver_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Oliver & Company','Disney','reviewed','FigureRealm Oliver & Company checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7591',0.90,now(),'FigureRealm lists 3 Oliver & Company Pop! Vinyl rows. Completion denominator is 3.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), wish_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Wish','Disney','reviewed','FigureRealm Wish checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6101',0.90,now(),'FigureRealm lists 6 Wish Pop! Vinyl rows. Completion denominator is 6.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), shaun_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Shaun Of The Dead','Shaun Of The Dead','reviewed','FigureRealm Shaun of the Dead Pop! Vinyl checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4645&ssid=3',0.90,now(),'FigureRealm Pop! Vinyl Figures subseries lists 9 Shaun of the Dead rows. Completion denominator excludes Dorbz and Vinyl Idolz.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), clear_prior as (
  delete from public.pop_set_checklist_items
  where set_id in (select id from bttf_set union all select id from oliver_set union all select id from wish_set union all select id from shaun_set)
  returning id
), checklist(set_name, franchise_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, confidence_value, source_value, notes_value) as (
  values
    ('Back to the Future','Back to the Future','Biff Tannen','Biff Tannen','963',null,null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Doc & Einstein','Doc & Einstein','972',null,null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Doc 2015','Doc Brown','960','2015',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Doc with Helmet','Doc Brown','959','with Helmet',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Owned row checklist item.'),
    ('Back to the Future','Back to the Future','Doc with Helmet (Glows In The Dark)','Doc Brown','959','Helmet Glow in the Dark',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Dr. Emmett Brown','Dr. Emmett Brown','62',null,null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Dr. Emmett Brown','Dr. Emmett Brown','50',null,null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Dr. Emmett Brown (Glows In The Dark)','Dr. Emmett Brown','62','Glow in the Dark',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Dr. Emmett Brown (Jumper Cables)','Dr. Emmett Brown','236','Jumper Cables','Loot Crate','Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Owned row checklist item.'),
    ('Back to the Future','Back to the Future','Einstein','Einstein','1274',null,null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Marty 1955','Marty McFly','957','1955',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Owned row checklist item.'),
    ('Back to the Future','Back to the Future','Marty Checking Watch','Marty McFly','965','Checking Watch','Summer Convention','Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Owned row checklist item.'),
    ('Back to the Future','Back to the Future','Marty in Future Outfit','Marty McFly','962','Future Outfit',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Marty in Future Outfit (Metallic)','Marty McFly','962','Future Outfit Metallic',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Marty in Jacket','Marty McFly','1025','Jacket',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Marty in Puffy Vest','Marty McFly','961','Puffy Vest',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Marty McFly','Marty McFly','61',null,null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Marty McFly (2015)','Marty McFly','1847','2015','Exclusive','Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Owned row checklist item.'),
    ('Back to the Future','Back to the Future','Marty McFly (Cowboy)','Marty McFly','816','Cowboy',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Marty McFly (Guitar)','Marty McFly','602','Guitar',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Marty McFly (Hazmat Suit)','Marty McFly','815','Hazmat Suit',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Marty McFly (Hoverboard)','Marty McFly','245','Hoverboard',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Marty McFly (Plutonium) (Glows In The Dark)','Marty McFly','49','Plutonium Glow in the Dark',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Marty with Glasses','Marty McFly','958','with Glasses',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Back to the Future','Back to the Future','Marty with Hoverboard','Marty McFly','964','with Hoverboard',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12','Back to the Future checklist item.'),
    ('Oliver & Company','Disney','Dodger (Glasses) with Oliver (Chase)','Dodger with Oliver','1705','Glasses Chase',null,'Pop! Disney','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7591','Owned row checklist item.'),
    ('Oliver & Company','Disney','Dodger with Oliver','Dodger with Oliver','1705',null,null,'Pop! Disney','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7591','Owned row checklist item.'),
    ('Oliver & Company','Disney','Georgette with Tito','Georgette with Tito','1706',null,null,'Pop! Disney','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7591','Owned row checklist item.'),
    ('Wish','Disney','Asha with Star','Asha','1390','with Star',null,'Pop! Disney','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6101','Owned row checklist item.'),
    ('Wish','Disney','Dahlia','Dahlia','1391',null,null,'Pop! Disney','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6101','Wish checklist item.'),
    ('Wish','Disney','King Magnifico','King Magnifico','1392',null,null,'Pop! Disney','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6101','Owned row checklist item.'),
    ('Wish','Disney','Queen Amaya','Queen Amaya','1393',null,null,'Pop! Disney','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6101','Wish checklist item.'),
    ('Wish','Disney','Star (Diamond Collection)','Star','1412','Diamond Collection',null,'Pop! Disney','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6101','Wish checklist item.'),
    ('Wish','Disney','Valentino','Valentino','1394',null,null,'Pop! Disney','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6101','Wish checklist item.'),
    ('Shaun Of The Dead','Shaun Of The Dead','Ed','Ed','241',null,null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4645&ssid=3','Shaun of the Dead checklist item.'),
    ('Shaun Of The Dead','Shaun Of The Dead','Ed (Bloody)','Ed','241','Bloody',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4645&ssid=3','Owned row checklist item.'),
    ('Shaun Of The Dead','Shaun Of The Dead','Ed (Zombie)','Ed','241','Zombie',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4645&ssid=3','Shaun of the Dead checklist item.'),
    ('Shaun Of The Dead','Shaun Of The Dead','Ed (Zombie)','Ed','259','Zombie',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4645&ssid=3','Owned row checklist item.'),
    ('Shaun Of The Dead','Shaun Of The Dead','Shaun','Shaun','240',null,null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4645&ssid=3','Shaun of the Dead checklist item.'),
    ('Shaun Of The Dead','Shaun Of The Dead','Shaun (Bloody)','Shaun','240','Bloody',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4645&ssid=3','Shaun of the Dead checklist item.'),
    ('Shaun Of The Dead','Shaun Of The Dead','Shaun (Funko Fusion)','Shaun','996','Funko Fusion',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4645&ssid=3','Shaun of the Dead checklist item.'),
    ('Shaun Of The Dead','Shaun Of The Dead','Shaun (Pool Cue)','Shaun','1660','Pool Cue',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4645&ssid=3','Owned row checklist item.'),
    ('Shaun Of The Dead','Shaun Of The Dead','Shaun (Pool Cue) (Bloody) (Chase)','Shaun','1660','Pool Cue Bloody Chase',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4645&ssid=3','Shaun of the Dead checklist item.')
), target_sets as (
  select id, 'Back to the Future'::text as canonical_name, 'Back to the Future'::text as franchise from bttf_set
  union all select id, 'Oliver & Company'::text, 'Disney'::text from oliver_set
  union all select id, 'Wish'::text, 'Disney'::text from wish_set
  union all select id, 'Shaun Of The Dead'::text, 'Shaun Of The Dead'::text from shaun_set
), inserted_checklist as (
  insert into public.pop_set_checklist_items (set_id, pop_name, character, number, variant, exclusivity, pop_type, pop_style, is_required_for_completion, source_url, confidence, notes)
  select target_sets.id, checklist.pop_name, checklist.character_name, checklist.number_value, checklist.variant_value, checklist.exclusivity_value, checklist.pop_type_value, checklist.pop_style_value, true, checklist.source_value, checklist.confidence_value, checklist.notes_value
  from checklist join target_sets on target_sets.canonical_name = checklist.set_name and target_sets.franchise = checklist.franchise_name
  cross join (select count(*) as cleared_rows from clear_prior) cleared
  returning id
), owned_updates(upc, set_name, franchise_name, total_value, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value) as (
  values
    ('889698881906','Back to the Future','Back to the Future',25,'Marty McFly (2015)','Marty McFly','1847','2015','Exclusive','Pop! Movies','Standard'),
    ('889698489072','Back to the Future','Back to the Future',25,'Marty Checking Watch','Marty McFly','965','Checking Watch','Summer Convention','Pop! Movies','Standard'),
    ('849803064778','Back to the Future','Back to the Future',25,'Dr. Emmett Brown (Jumper Cables)','Dr. Emmett Brown','236','Jumper Cables','Loot Crate','Pop! Movies','Standard'),
    ('889698469135','Back to the Future','Back to the Future',25,'Marty 1955','Marty McFly','957','1955',null,'Pop! Movies','Standard'),
    ('889698469142','Back to the Future','Back to the Future',25,'Doc with Helmet','Doc Brown','959','with Helmet',null,'Pop! Movies','Standard'),
    ('889698903295','Oliver & Company','Disney',3,'Dodger (Glasses) with Oliver (Chase)','Dodger with Oliver','1705','Glasses Chase',null,'Pop! Disney','Standard'),
    ('889698919098','Oliver & Company','Disney',3,'Dodger with Oliver','Dodger with Oliver','1705','Diamond Collection','Exclusive','Pop! Disney','Standard'),
    ('889698903301','Oliver & Company','Disney',3,'Georgette with Tito','Georgette with Tito','1706',null,null,'Pop! Disney','Standard'),
    ('889698724227','Wish','Disney',6,'King Magnifico','King Magnifico','1392',null,null,'Pop! Disney','Standard'),
    ('889698724203','Wish','Disney',6,'Asha with Star','Asha','1390','with Star',null,'Pop! Disney','Standard'),
    ('889698849319','Shaun Of The Dead','Shaun Of The Dead',9,'Shaun (Pool Cue)','Shaun','1660','Pool Cue',null,'Pop! Movies','Standard'),
    ('849803061319','Shaun Of The Dead','Shaun Of The Dead',9,'Ed (Bloody)','Ed','241','Bloody',null,'Pop! Movies','Standard'),
    ('849803061326','Shaun Of The Dead','Shaun Of The Dead',9,'Ed (Zombie)','Ed','259','Zombie',null,'Pop! Movies','Standard')
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

