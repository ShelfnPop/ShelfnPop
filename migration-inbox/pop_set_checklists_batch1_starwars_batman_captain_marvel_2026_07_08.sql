-- Audit note: Batch 1 reviewed checklist pass, 2026-07-08.
--
-- Sources:
--   Andor FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1
--   Batman 80 Years FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10
--   Star Wars: Across the Galaxy source evidence:
--     Amazon/Funko retail listings for the Amazon-exclusive Across the Galaxy Qui-Gon Jinn and Force Ghost 3-Pack items.
--   Captain Marvel source evidence:
--     Funko/FigureRealm retail metadata for the owned Captain Marvel character rows; this is an owned-scope character pass, not the full Captain Marvel movie line.
--
-- Live changes:
--   * Promote Andor to reviewed with 14 Pop! Star Wars rows.
--   * Promote Batman: 80th Anniversary to reviewed with 33 Pop! Heroes rows.
--   * Promote Star Wars: Across the Galaxy to reviewed with a scoped 2-row Amazon-exclusive set.
--   * Promote Captain Marvel to reviewed with a scoped 2-row owned character set.
--   * Normalize 8 owned catalog rows and set scoped completion totals.

with andor_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Andor','Star Wars','reviewed','FigureRealm Andor Pop! checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1',0.90,now(),'FigureRealm lists 14 Andor Pop! Star Wars rows. Completion denominator is 14.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), batman_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Batman: 80th Anniversary','DC','reviewed','FigureRealm Batman 80 Years Pop! checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10',0.90,now(),'FigureRealm Batman 80 Years subseries lists 33 Pop! Heroes rows. Completion denominator is 33.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), across_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Star Wars: Across the Galaxy','Star Wars','reviewed','Amazon/Funko Across the Galaxy retail listings','https://www.amazon.com/stores/page/preview?isSlp=1&isPreview=1&asins=B08SRSBYX8',0.82,now(),'Scoped Amazon-exclusive Across the Galaxy denominator is 2 owned rows: Qui-Gon Jinn (Tatooine) #422 and Force Ghost 3-Pack.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), captain_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Captain Marvel','Marvel','reviewed','Owned-scope Captain Marvel character checklist','https://funko.com',0.80,now(),'Scoped owned-character denominator is 2 and intentionally does not represent the full Captain Marvel movie or Marvel Universe line.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), clear_prior as (
  delete from public.pop_set_checklist_items
  where set_id in (select id from andor_set union all select id from batman_set union all select id from across_set union all select id from captain_set)
  returning id
), checklist(set_name, franchise_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, confidence_value, source_value, notes_value) as (
  values
    ('Andor','Star Wars','B2EMO','B2EMO','533',null,null,'Pop! Star Wars','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1','Andor checklist item.'),
    ('Andor','Star Wars','Cassian','Cassian','534',null,null,'Pop! Star Wars','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1','Owned row checklist item.'),
    ('Andor','Star Wars','Cassian Andor (Narkina 5)','Cassian Andor','677','Narkina 5',null,'Pop! Star Wars','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1','Andor checklist item.'),
    ('Andor','Star Wars','Dedra Meero','Dedra Meero','675',null,null,'Pop! Star Wars','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1','Andor checklist item.'),
    ('Andor','Star Wars','Hunter (Mercenary Gear)','Hunter','788','Mercenary Gear',null,'Pop! Star Wars','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1','Andor checklist item.'),
    ('Andor','Star Wars','Imperial Guard','Imperial Guard','535',null,null,'Pop! Star Wars','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1','Andor checklist item.'),
    ('Andor','Star Wars','K-2SO','K-2SO','786',null,null,'Pop! Star Wars','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1','Andor checklist item.'),
    ('Andor','Star Wars','Karis Nemik','Karis Nemik','679',null,null,'Pop! Star Wars','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1','Andor checklist item.'),
    ('Andor','Star Wars','Kino Loy','Kino Loy','678',null,null,'Pop! Star Wars','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1','Andor checklist item.'),
    ('Andor','Star Wars','Luthen Rael','Luthen Rael','536',null,null,'Pop! Star Wars','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1','Andor checklist item.'),
    ('Andor','Star Wars','Marda Ro','Marda Ro','789',null,null,'Pop! Star Wars','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1','Andor checklist item.'),
    ('Andor','Star Wars','Range Trooper','Range Trooper','787',null,'Funko Shop','Pop! Star Wars','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1','Owned row checklist item.'),
    ('Andor','Star Wars','Vel Sartha','Vel Sartha','680',null,null,'Pop! Star Wars','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1','Andor checklist item.'),
    ('Andor','Star Wars','Wilmon Paak','Wilmon Paak','676',null,null,'Pop! Star Wars','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1','Andor checklist item.'),

    ('Batman: 80th Anniversary','DC','1950 Batmobile (Blue Metallic) (Deluxe)','Batman','277','Blue Metallic',null,'Pop! Rides','Ride',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','1950 Batmobile (Deluxe)','Batman','277',null,null,'Pop! Rides','Ride',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Alfred Pennyworth with Wayne Manor (Deluxe)','Alfred Pennyworth','13','Wayne Manor',null,'Pop! Town','Town',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Bat-Mite (1st Appearance 1959)','Bat-Mite','300','1st Appearance 1959',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Bat-Mite (1st Appearance 1959) (Metallic)','Bat-Mite','300','1st Appearance 1959 Metallic',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman','Batman','284',null,null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (1989)','Batman','275','1989',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (1989) (Fists Up)','Batman','275','1989 Fists Up',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (1989) (Patina)','Batman','315','1989 Patina',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (1997)','Batman','314','1997',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (Damned)','Batman','288','Damned',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (Dawnbreaker)','Batman','253','Dawnbreaker',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (First Appearance)','Batman','270','First Appearance',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (Gamer) (Sitting) (Chase)','Batman','294','Gamer Sitting Chase',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (Gamer) (Standing)','Batman','293','Gamer Standing',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (Grim Knight)','Batman','318','Grim Knight',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (Merciless)','Batman','313','Merciless',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (Pink Chrome)','Batman','144','Pink Chrome',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (Red Death)','Batman','283','Red Death',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (Red Metallic)','Batman','144','Red Metallic',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (Red Rain)','Batman','286','Red Rain',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Owned row checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (Red Son)','Batman','312','Red Son',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (Teal Chrome)','Batman','144','Teal Chrome',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman (The Joker is Wild)','Batman','292','The Joker is Wild',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman and Commissioner Gordon (Batman Begins) (Deluxe)','Batman and Commissioner Gordon','291','Batman Begins Deluxe',null,'Pop! Heroes','Deluxe',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman and Robin (New Look Batman 1964)','Batman and Robin','281','New Look Batman 1964',null,'Pop! Heroes','2-Pack',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman Beyond (Metallic Chrome)','Batman Beyond','287','Metallic Chrome',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman Forever','Batman','289','Forever',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman vs. The Joker (Movie Moments)','Batman vs. The Joker','280','Movie Moments',null,'Pop! Heroes','Moment',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Owned row checklist item.'),
    ('Batman: 80th Anniversary','DC','Batman with the Hall of Justice (Deluxe)','Batman','09','Hall of Justice',null,'Pop! Town','Town',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Devastator','Devastator','319',null,null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Joker (Gamer)','Joker','295','Gamer',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),
    ('Batman: 80th Anniversary','DC','Joker (VR Gamer) (Chase)','Joker','296','VR Gamer Chase',null,'Pop! Heroes','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10','Batman 80 Years checklist item.'),

    ('Star Wars: Across the Galaxy','Star Wars','Qui-Gon Jinn (Tatooine)','Qui-Gon Jinn','422','Tatooine','Amazon','Pop! Star Wars','Standard',0.82::numeric,'https://www.amazon.com/stores/page/preview?isSlp=1&isPreview=1&asins=B08SRSBYX8','Owned row checklist item.'),
    ('Star Wars: Across the Galaxy','Star Wars','Force Ghost 3-Pack (Anakin, Yoda & Obi-Wan Kenobi)','Anakin, Yoda & Obi-Wan Kenobi',null,'Glow in the Dark','Amazon','Pop! Star Wars','3-Pack',0.82::numeric,'https://www.amazon.com/stores/page/preview?isSlp=1&isPreview=1&asins=B08SRSBYX8','Owned row checklist item.'),
    ('Captain Marvel','Marvel','Dark Captain Marvel','Captain Marvel','657','Dark','Summer Convention','Pop! Marvel','Standard',0.80::numeric,'https://funko.com','Owned-scoped Captain Marvel character item.'),
    ('Captain Marvel','Marvel','Captain Marvel (Fear Itself)','Captain Marvel','1263','Fear Itself','San Diego Comic-Con','Pop! Marvel','Standard',0.80::numeric,'https://funko.com','Owned-scoped Captain Marvel character item.')
), target_sets as (
  select id, 'Andor'::text as canonical_name, 'Star Wars'::text as franchise from andor_set
  union all select id, 'Batman: 80th Anniversary'::text, 'DC'::text from batman_set
  union all select id, 'Star Wars: Across the Galaxy'::text, 'Star Wars'::text from across_set
  union all select id, 'Captain Marvel'::text, 'Marvel'::text from captain_set
), inserted_checklist as (
  insert into public.pop_set_checklist_items (set_id, pop_name, character, number, variant, exclusivity, pop_type, pop_style, is_required_for_completion, source_url, confidence, notes)
  select target_sets.id, checklist.pop_name, checklist.character_name, checklist.number_value, checklist.variant_value, checklist.exclusivity_value, checklist.pop_type_value, checklist.pop_style_value, true, checklist.source_value, checklist.confidence_value, checklist.notes_value
  from checklist join target_sets on target_sets.canonical_name = checklist.set_name and target_sets.franchise = checklist.franchise_name
  cross join (select count(*) as cleared_rows from clear_prior) cleared
  returning id
), owned_updates(upc, set_name, franchise_name, total_value, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value) as (
  values
    ('889698653336','Andor','Star Wars',14,'Cassian','Cassian','534',null,null,'Pop! Star Wars','Standard'),
    ('889698871853','Andor','Star Wars',14,'Range Trooper','Range Trooper','787',null,'Funko Shop','Pop! Star Wars','Standard'),
    ('889698372503','Batman: 80th Anniversary','DC',33,'Batman vs. The Joker (Movie Moments)','Batman vs. The Joker','280','Movie Moments',null,'Pop! Heroes','Moment'),
    ('889698372534','Batman: 80th Anniversary','DC',33,'Batman (Red Rain)','Batman','286','Red Rain',null,'Pop! Heroes','Standard'),
    ('889698555616','Star Wars: Across the Galaxy','Star Wars',2,'Qui-Gon Jinn (Tatooine)','Qui-Gon Jinn','422','Tatooine','Amazon','Pop! Star Wars','Standard'),
    ('889698556248','Star Wars: Across the Galaxy','Star Wars',2,'Force Ghost 3-Pack (Anakin, Yoda & Obi-Wan Kenobi)','Anakin, Yoda & Obi-Wan Kenobi',null,'Glow in the Dark','Amazon','Pop! Star Wars','3-Pack'),
    ('889698717519','Captain Marvel','Marvel',2,'Captain Marvel (Fear Itself)','Captain Marvel','1263','Fear Itself','San Diego Comic-Con','Pop! Marvel','Standard'),
    ('889698489027','Captain Marvel','Marvel',2,'Dark Captain Marvel','Captain Marvel','657','Dark','Summer Convention','Pop! Marvel','Standard')
), updated_catalog as (
  update public.pop_catalog pc
  set pop_name=owned_updates.pop_name, character=owned_updates.character_name, franchise=owned_updates.franchise_name, set_name=owned_updates.set_name, number=owned_updates.number_value, variant=owned_updates.variant_value, exclusivity=owned_updates.exclusivity_value, pop_type=owned_updates.pop_type_value, pop_style=owned_updates.pop_style_value, set_total=owned_updates.total_value, needs_review=false, parse_confidence=greatest(coalesce(pc.parse_confidence,0),0.90),
    description = owned_updates.pop_name || ' is a ' || owned_updates.set_name || ' ' || owned_updates.pop_type_value || case when owned_updates.number_value is not null then ' release #' || owned_updates.number_value else ' release' end || case when owned_updates.variant_value is not null then ', ' || owned_updates.variant_value || ' variant' else '' end || case when owned_updates.exclusivity_value is not null then ', ' || owned_updates.exclusivity_value || ' exclusive' else '' end || '.',
    display_description = owned_updates.pop_name || ' is a ' || owned_updates.set_name || ' ' || owned_updates.pop_type_value || case when owned_updates.number_value is not null then ' release #' || owned_updates.number_value else ' release' end || case when owned_updates.variant_value is not null then ', ' || owned_updates.variant_value || ' variant' else '' end || case when owned_updates.exclusivity_value is not null then ', ' || owned_updates.exclusivity_value || ' exclusive' else '' end || '.'
  from owned_updates
  where pc.upc = owned_updates.upc
  returning pc.id
)
select (select count(*) from inserted_checklist) as inserted_checklist_rows, (select count(*) from updated_catalog) as updated_catalog_rows;
