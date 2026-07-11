-- Audit note: Agents Of S.H.I.E.L.D, Batman Forever, Beetlejuice, and Gotham reviewed checklist pass, 2026-07-08.
--
-- Sources:
--   Agents of S.H.I.E.L.D. FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=135
--   Batman Forever FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=23
--   Beetlejuice FigureRealm Pop! Vinyl checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9
--   Gotham Pop! Vinyl source:
--     https://www.entertainmentearth.com/news/funko-gotham-pop-vinyl-figures/
--
-- Live changes:
--   * Promote Agents Of S.H.I.E.L.D to reviewed with 3 Pop! Vinyl rows, excluding the Pop! Ride.
--   * Promote Batman Forever to reviewed with 5 Batman Forever Pop! rows.
--   * Promote Beetlejuice to reviewed with 18 Pop! Vinyl rows.
--   * Promote Gotham to reviewed with 6 Pop! Television rows.
--   * Normalize 9 owned catalog rows and set scoped completion totals.

with agents_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Agents Of S.H.I.E.L.D','Marvel','reviewed','FigureRealm Agents of S.H.I.E.L.D. Pop! Vinyl checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=135',0.90,now(),'FigureRealm lists 3 Pop! Vinyl rows for Agents of S.H.I.E.L.D.; completion denominator excludes the Pop! Ride.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), batman_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Batman Forever','DC','reviewed','FigureRealm Batman Forever Pop! checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=23',0.90,now(),'FigureRealm lists 5 Batman Forever Pop! rows. Completion denominator is 5.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), beetlejuice_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Beetlejuice','Beetlejuice','reviewed','FigureRealm Beetlejuice Pop! Vinyl checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9',0.90,now(),'FigureRealm Pop! Vinyl Figures subseries lists 18 Beetlejuice rows. Completion denominator is 18 and excludes Dorbz, Digital, Moments, Pins, Plus, Sets, Towns, and Soda.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), gotham_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Gotham','DC','reviewed','Entertainment Earth Gotham Pop! Vinyl article','https://www.entertainmentearth.com/news/funko-gotham-pop-vinyl-figures/',0.84,now(),'Entertainment Earth and Beckett list the 6 Gotham Pop! Vinyl figures: James Gordon, Harvey Bullock, Bruce Wayne, Oswald Cobblepot, Selina Kyle, and Fish Mooney. Completion denominator is 6.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), clear_prior as (
  delete from public.pop_set_checklist_items
  where set_id in (select id from agents_set union all select id from batman_set union all select id from beetlejuice_set union all select id from gotham_set)
), checklist(set_name, franchise_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, confidence_value, source_value, notes_value) as (
  values
    ('Agents Of S.H.I.E.L.D','Marvel','Agent Coulson','Agent Coulson','53',null,null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=135','Agents of S.H.I.E.L.D. checklist item.'),
    ('Agents Of S.H.I.E.L.D','Marvel','Agent Daisy Johnson','Agent Daisy Johnson','166',null,null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=135','Agents of S.H.I.E.L.D. checklist item.'),
    ('Agents Of S.H.I.E.L.D','Marvel','Agent May','Agent May','88',null,null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=135','Agents of S.H.I.E.L.D. checklist item.'),
    ('Batman Forever','DC','Riddler','Riddler','340',null,null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=23','Batman Forever checklist item.'),
    ('Batman Forever','DC','Riddler (Art Series)','Riddler','61','Art Series',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=23','Batman Forever checklist item.'),
    ('Batman Forever','DC','Two-Face','Two-Face','341',null,null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=23','Batman Forever checklist item.'),
    ('Batman Forever','DC','Two-Face (Art Series)','Two-Face','66','Art Series',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=23','Batman Forever checklist item.'),
    ('Batman Forever','DC','Two-Face & Riddler (Glow in the Dark)','Two-Face & Riddler',null,'Glow in the Dark',null,'Pop! Heroes','2-Pack',0.86::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=23','Batman Forever 2-pack listed without a box number.'),
    ('Beetlejuice','Beetlejuice','Adam Maitland (Transformed)','Adam Maitland','992','Transformed',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Barbara Maitland (Transformed)','Barbara Maitland','993','Transformed',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Beetlejuice','Beetlejuice','05',null,null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Beetlejuice (Adam''s Clothes)','Beetlejuice','362','Adam''s Clothes',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Owned row checklist item.'),
    ('Beetlejuice','Beetlejuice','Beetlejuice (Carousel Hat)','Beetlejuice','1005','Carousel Hat',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Beetlejuice (Glows In The Dark) (Chase)','Beetlejuice','05','Glow in the Dark Chase',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Beetlejuice (Guide Hat)','Beetlejuice','605','Guide Hat',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Owned row checklist item.'),
    ('Beetlejuice','Beetlejuice','Beetlejuice (Guide Hat) (Glows In The Dark)','Beetlejuice','605','Guide Hat Glow in the Dark',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Beetlejuice (Handbook) (Glows In The Dark)','Beetlejuice','1010','Handbook Glow in the Dark',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Beetlejuice (Shrunken Head)','Beetlejuice','1761','Shrunken Head',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Beetlejuice (Snake)','Beetlejuice','1728','Snake',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Beetlejuice (Wedding Outfit)','Beetlejuice','641','Wedding Outfit',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Delia Deetz','Delia Deetz','1758',null,null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Here Lies Betelgeuse (Deluxe)','Betelgeuse','1762','Deluxe',null,'Pop! Movies','Deluxe',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Lydia Deetz (Book)','Lydia Deetz','642','Book',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Lydia Deetz (Flying)','Lydia Deetz','1759','Flying',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Lydia Deetz (Wedding Dress)','Lydia Deetz','640','Wedding Dress',null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Beetlejuice','Beetlejuice','Sandworm','Sandworm','1760',null,null,'Pop! Movies','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=593&mode=2&series=beetlejuicefunko&ssid=9','Beetlejuice checklist item.'),
    ('Gotham','DC','James Gordon','James Gordon','75',null,null,'Pop! Television','Standard',0.84::numeric,'https://www.entertainmentearth.com/news/funko-gotham-pop-vinyl-figures/','Gotham checklist item.'),
    ('Gotham','DC','Harvey Bullock','Harvey Bullock','76',null,null,'Pop! Television','Standard',0.84::numeric,'https://www.entertainmentearth.com/news/funko-gotham-pop-vinyl-figures/','Owned row checklist item.'),
    ('Gotham','DC','Bruce Wayne','Bruce Wayne','77',null,null,'Pop! Television','Standard',0.84::numeric,'https://www.entertainmentearth.com/news/funko-gotham-pop-vinyl-figures/','Gotham checklist item.'),
    ('Gotham','DC','Oswald Cobblepot','Oswald Cobblepot','78',null,null,'Pop! Television','Standard',0.84::numeric,'https://www.entertainmentearth.com/news/funko-gotham-pop-vinyl-figures/','Gotham checklist item.'),
    ('Gotham','DC','Selina Kyle','Selina Kyle','79',null,null,'Pop! Television','Standard',0.84::numeric,'https://www.entertainmentearth.com/news/funko-gotham-pop-vinyl-figures/','Owned row checklist item.'),
    ('Gotham','DC','Fish Mooney','Fish Mooney','80',null,null,'Pop! Television','Standard',0.84::numeric,'https://www.entertainmentearth.com/news/funko-gotham-pop-vinyl-figures/','Owned row checklist item.')
), target_sets as (
  select id, 'Agents Of S.H.I.E.L.D'::text as canonical_name, 'Marvel'::text as franchise from agents_set
  union all select id, 'Batman Forever'::text, 'DC'::text from batman_set
  union all select id, 'Beetlejuice'::text, 'Beetlejuice'::text from beetlejuice_set
  union all select id, 'Gotham'::text, 'DC'::text from gotham_set
), inserted_checklist as (
  insert into public.pop_set_checklist_items (set_id, pop_name, character, number, variant, exclusivity, pop_type, pop_style, is_required_for_completion, source_url, confidence, notes)
  select target_sets.id, checklist.pop_name, checklist.character_name, checklist.number_value, checklist.variant_value, checklist.exclusivity_value, checklist.pop_type_value, checklist.pop_style_value, true, checklist.source_value, checklist.confidence_value, checklist.notes_value
  from checklist join target_sets on target_sets.canonical_name = checklist.set_name and target_sets.franchise = checklist.franchise_name
  returning id
), owned_updates(upc, set_name, franchise_name, total_value, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value) as (
  values
    ('849803040536','Agents Of S.H.I.E.L.D','Marvel',3,'Agent Coulson','Agent Coulson','53',null,null,'Pop! Marvel','Standard'),
    ('849803051204','Agents Of S.H.I.E.L.D','Marvel',3,'Agent May','Agent May','88',null,null,'Pop! Marvel','Standard'),
    ('889698583954','Batman Forever','DC',5,'Riddler (Art Series)','Riddler','61','Art Series',null,'Pop! Heroes','Standard'),
    ('889698609357','Batman Forever','DC',5,'Two-Face (Art Series)','Two-Face','66','Art Series',null,'Pop! Heroes','Standard'),
    ('889698113434','Beetlejuice','Beetlejuice',18,'Beetlejuice (Adam''s Clothes)','Beetlejuice','362','Adam''s Clothes',null,'Pop! Movies','Standard'),
    ('889698323192','Beetlejuice','Beetlejuice',18,'Beetlejuice (Guide Hat)','Beetlejuice','605','Guide Hat',null,'Pop! Movies','Standard'),
    ('849803062477','Gotham','DC',6,'Harvey Bullock','Harvey Bullock','76',null,null,'Pop! Television','Standard'),
    ('849803062507','Gotham','DC',6,'Selina Kyle','Selina Kyle','79',null,null,'Pop! Television','Standard'),
    ('849803062460','Gotham','DC',6,'Fish Mooney','Fish Mooney','80',null,null,'Pop! Television','Standard')
), updated_catalog as (
  update public.pop_catalog pc
  set pop_name=owned_updates.pop_name, character=owned_updates.character_name, franchise=owned_updates.franchise_name, set_name=owned_updates.set_name, number=owned_updates.number_value, variant=owned_updates.variant_value, exclusivity=owned_updates.exclusivity_value, pop_type=owned_updates.pop_type_value, pop_style=owned_updates.pop_style_value, set_total=owned_updates.total_value, needs_review=false, parse_confidence=greatest(coalesce(pc.parse_confidence,0),0.90),
    description = owned_updates.pop_name || ' is a ' || owned_updates.set_name || ' ' || owned_updates.pop_type_value || ' release #' || owned_updates.number_value || case when owned_updates.variant_value is not null then ', ' || owned_updates.variant_value else '' end || '.',
    display_description = owned_updates.pop_name || ' is a ' || owned_updates.set_name || ' ' || owned_updates.pop_type_value || ' release #' || owned_updates.number_value || case when owned_updates.variant_value is not null then ', ' || owned_updates.variant_value else '' end || '.'
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
--   and ps.canonical_name in ('Agents Of S.H.I.E.L.D', 'Batman Forever', 'Beetlejuice', 'Gotham')
--   and pc.set_name = ps.canonical_name
--   and pc.franchise = ps.franchise
--   and ci.number = pc.number
--   and lower(ci.pop_name) = lower(pc.pop_name);
