-- Audit note: Hawkeye, Blue Beetle, and Ghostbusters: Frozen Empire reviewed checklist pass, 2026-07-08.
--
-- Sources:
--   Hawkeye My Pop Figures checklist:
--     https://www.mypopfigures.com/pop?action=seriesitemlist&figures=hawkeyefunko&id=2430
--   Blue Beetle FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=732
--   Ghostbusters - Afterlife/Frozen Empire FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2129
--   Ghostbusters Frozen Empire Fandom 2024 Pop! Vinyl list:
--     https://ghostbusters.fandom.com/wiki/Funko%3A_Ghostbusters_%282024%29_Pop%21_Vinyl_Figure_Series
--
-- Live changes:
--   * Promote Hawkeye to reviewed with 8 required Pop! Vinyl rows.
--   * Promote Blue Beetle to reviewed with 7 required Pop! Vinyl rows, excluding Pocket Keychains and Soda.
--   * Promote Ghostbusters: Frozen Empire to reviewed with 6 required Pop!/Deluxe rows.
--   * Normalize 11 owned catalog rows and set completion totals.

with hawkeye_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'Hawkeye',
    'Marvel',
    'reviewed',
    'My Pop Figures Hawkeye Pop! Vinyl checklist',
    'https://www.mypopfigures.com/pop?action=seriesitemlist&figures=hawkeyefunko&id=2430',
    0.90,
    now(),
    'My Pop Figures lists 8 Hawkeye Pop! Vinyl rows. Completion denominator is 8.'
  )
  on conflict (canonical_name, franchise) do update set
    status = excluded.status,
    source_label = excluded.source_label,
    source_url = excluded.source_url,
    confidence = excluded.confidence,
    reviewed_at = excluded.reviewed_at,
    notes = excluded.notes,
    updated_at = now()
  returning id
), blue_beetle_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'Blue Beetle',
    'DC',
    'reviewed',
    'FigureRealm Blue Beetle Pop! Vinyl checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=732',
    0.91,
    now(),
    'FigureRealm lists 7 Blue Beetle Pop! Vinyl rows. Completion denominator is 7 and excludes Pocket Keychains and Soda.'
  )
  on conflict (canonical_name, franchise) do update set
    status = excluded.status,
    source_label = excluded.source_label,
    source_url = excluded.source_url,
    confidence = excluded.confidence,
    reviewed_at = excluded.reviewed_at,
    notes = excluded.notes,
    updated_at = now()
  returning id
), frozen_empire_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'Ghostbusters: Frozen Empire',
    'Ghostbusters',
    'reviewed',
    'FigureRealm/Fandom Ghostbusters Frozen Empire Pop checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2129',
    0.86,
    now(),
    'FigureRealm lists the 2024 Frozen Empire standard rows it has under Ghostbusters - Afterlife; Ghostbusters Fandom lists the 6-item 2024 Frozen Empire Pop! Vinyl/Deluxe line: Phoebe, Grooberson, Pukey, Ray Stantz, Garraka, and Mini Puft. Completion denominator is 6.'
  )
  on conflict (canonical_name, franchise) do update set
    status = excluded.status,
    source_label = excluded.source_label,
    source_url = excluded.source_url,
    confidence = excluded.confidence,
    reviewed_at = excluded.reviewed_at,
    notes = excluded.notes,
    updated_at = now()
  returning id
), clear_prior as (
  delete from public.pop_set_checklist_items
  where set_id in (
    select id from hawkeye_set
    union all select id from blue_beetle_set
    union all select id from frozen_empire_set
  )
  returning id
), checklist(set_name, franchise_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, confidence_value, source_value, notes_value) as (
  values
    ('Hawkeye','Marvel','Clint Barton (Christmas Sweater)','Clint Barton','1216','Christmas Sweater',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.mypopfigures.com/pop?action=seriesitemlist&figures=hawkeyefunko&id=2430','Hawkeye checklist item.'),
    ('Hawkeye','Marvel','Hawkeye','Hawkeye','1211',null,null,'Pop! Marvel','Standard',0.90::numeric,'https://www.mypopfigures.com/pop?action=seriesitemlist&figures=hawkeyefunko&id=2430','Hawkeye checklist item.'),
    ('Hawkeye','Marvel','Kate Bishop','Kate Bishop','1215',null,null,'Pop! Marvel','Standard',0.90::numeric,'https://www.mypopfigures.com/pop?action=seriesitemlist&figures=hawkeyefunko&id=2430','Hawkeye checklist item.'),
    ('Hawkeye','Marvel','Kate Bishop (Christmas Sweater)','Kate Bishop','1217','Christmas Sweater',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.mypopfigures.com/pop?action=seriesitemlist&figures=hawkeyefunko&id=2430','Hawkeye checklist item.'),
    ('Hawkeye','Marvel','Kate Bishop (with Lucky the Pizza Dog)','Kate Bishop & Lucky the Pizza Dog','1212','with Lucky the Pizza Dog',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.mypopfigures.com/pop?action=seriesitemlist&figures=hawkeyefunko&id=2430','Hawkeye checklist item.'),
    ('Hawkeye','Marvel','Maya Lopez','Maya Lopez','1214',null,null,'Pop! Marvel','Standard',0.90::numeric,'https://www.mypopfigures.com/pop?action=seriesitemlist&figures=hawkeyefunko&id=2430','Hawkeye checklist item.'),
    ('Hawkeye','Marvel','Yelena (Masked) (Chase)','Yelena','1213','Masked Chase',null,'Pop! Marvel','Standard',0.88::numeric,'https://www.mypopfigures.com/pop?action=seriesitemlist&figures=hawkeyefunko&id=2430','My Pop Figures lists Yelena Masked Chase.'),
    ('Hawkeye','Marvel','Yelena (Unmasked)','Yelena','1213','Unmasked',null,'Pop! Marvel','Standard',0.88::numeric,'https://www.mypopfigures.com/pop?action=seriesitemlist&figures=hawkeyefunko&id=2430','My Pop Figures lists Yelena Unmasked.'),

    ('Blue Beetle','DC','Blue Beetle','Blue Beetle','1408',null,null,'Pop! Movies','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=732','Blue Beetle checklist item.'),
    ('Blue Beetle','DC','Blue Beetle (Crouching)','Blue Beetle','1403','Crouching',null,'Pop! Movies','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=732','Blue Beetle checklist item.'),
    ('Blue Beetle','DC','Blue Beetle (Crouching) (Glow in the Dark) (Chase)','Blue Beetle','1403','Crouching Glow in the Dark Chase',null,'Pop! Movies','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=732','Blue Beetle checklist item.'),
    ('Blue Beetle','DC','Blue Beetle (Glows In The Dark)','Blue Beetle','1406','Glow in the Dark',null,'Pop! Movies','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=732','Blue Beetle checklist item.'),
    ('Blue Beetle','DC','Blue Beetle (Glows In The Dark)','Blue Beetle','1407','Glow in the Dark',null,'Pop! Movies','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=732','Blue Beetle checklist item.'),
    ('Blue Beetle','DC','Conrad Carapax','Conrad Carapax','1405',null,null,'Pop! Movies','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=732','Blue Beetle checklist item.'),
    ('Blue Beetle','DC','Jaime Reyes','Jaime Reyes','1404',null,null,'Pop! Movies','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=732','Blue Beetle checklist item.'),

    ('Ghostbusters: Frozen Empire','Ghostbusters','Phoebe','Phoebe','1507',null,null,'Pop! Movies','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2129','FigureRealm 2024 Frozen Empire row.'),
    ('Ghostbusters: Frozen Empire','Ghostbusters','Grooberson','Grooberson','1508',null,null,'Pop! Movies','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2129','FigureRealm lists Grooberson Ghostbuster Jumpsuit #1508.'),
    ('Ghostbusters: Frozen Empire','Ghostbusters','Pukey','Pukey','1509',null,null,'Pop! Movies','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2129','FigureRealm 2024 Frozen Empire row.'),
    ('Ghostbusters: Frozen Empire','Ghostbusters','Ray Stantz (Glows in the Dark)','Ray Stantz','1510','Glow in the Dark',null,'Pop! Movies','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2129','FigureRealm 2024 Frozen Empire row.'),
    ('Ghostbusters: Frozen Empire','Ghostbusters','Garraka','Garraka','1511',null,null,'Pop! Movies','Standard',0.84::numeric,'https://ghostbusters.fandom.com/wiki/Funko%3A_Ghostbusters_%282024%29_Pop%21_Vinyl_Figure_Series','Ghostbusters Fandom 2024 Frozen Empire row.'),
    ('Ghostbusters: Frozen Empire','Ghostbusters','Mini Puft','Mini Puft','1513',null,null,'Pop! Deluxe','Deluxe',0.84::numeric,'https://ghostbusters.fandom.com/wiki/Funko%3A_Ghostbusters_%282024%29_Pop%21_Vinyl_Figure_Series','Ghostbusters Fandom 2024 Frozen Empire Deluxe row.')
), target_sets as (
  select id, 'Hawkeye'::text as canonical_name, 'Marvel'::text as franchise from hawkeye_set
  union all select id, 'Blue Beetle'::text, 'DC'::text from blue_beetle_set
  union all select id, 'Ghostbusters: Frozen Empire'::text, 'Ghostbusters'::text from frozen_empire_set
), inserted_checklist as (
  insert into public.pop_set_checklist_items (
    set_id, pop_name, character, number, variant, exclusivity, pop_type, pop_style,
    is_required_for_completion, source_url, confidence, notes
  )
  select
    target_sets.id,
    checklist.pop_name,
    checklist.character_name,
    checklist.number_value,
    checklist.variant_value,
    checklist.exclusivity_value,
    checklist.pop_type_value,
    checklist.pop_style_value,
    true,
    checklist.source_value,
    checklist.confidence_value,
    checklist.notes_value
  from checklist
  join target_sets
    on target_sets.canonical_name = checklist.set_name
   and target_sets.franchise = checklist.franchise_name
  returning id
), owned_updates(upc, set_name, franchise_name, total_value, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value) as (
  values
    ('889698594806','Hawkeye','Marvel',8,'Hawkeye','Hawkeye','1211',null,null,'Pop! Marvel','Standard'),
    ('889698594813','Hawkeye','Marvel',8,'Kate Bishop (with Lucky the Pizza Dog)','Kate Bishop & Lucky the Pizza Dog','1212','with Lucky the Pizza Dog',null,'Pop! Marvel','Standard'),
    ('889698594820','Hawkeye','Marvel',8,'Yelena (Masked) (Chase)','Yelena','1213','Masked Chase',null,'Pop! Marvel','Standard'),
    ('889698723503','Blue Beetle','DC',7,'Blue Beetle (Crouching) (Glow in the Dark) (Chase)','Blue Beetle','1403','Crouching Glow in the Dark Chase',null,'Pop! Movies','Standard'),
    ('889698723510','Blue Beetle','DC',7,'Jaime Reyes','Jaime Reyes','1404',null,null,'Pop! Movies','Standard'),
    ('889698723527','Blue Beetle','DC',7,'Conrad Carapax','Conrad Carapax','1405',null,null,'Pop! Movies','Standard'),
    ('889698741392','Blue Beetle','DC',7,'Blue Beetle','Blue Beetle','1408',null,null,'Pop! Movies','Standard'),
    ('889698733861','Ghostbusters: Frozen Empire','Ghostbusters',6,'Phoebe','Phoebe','1507',null,null,'Pop! Movies','Standard'),
    ('889698789844','Ghostbusters: Frozen Empire','Ghostbusters',6,'Grooberson','Grooberson','1508',null,null,'Pop! Movies','Standard'),
    ('889698733885','Ghostbusters: Frozen Empire','Ghostbusters',6,'Pukey','Pukey','1509',null,null,'Pop! Movies','Standard'),
    ('889698733892','Ghostbusters: Frozen Empire','Ghostbusters',6,'Garraka','Garraka','1511',null,null,'Pop! Movies','Standard')
), updated_catalog as (
  update public.pop_catalog pc
  set
    pop_name = owned_updates.pop_name,
    character = owned_updates.character_name,
    franchise = owned_updates.franchise_name,
    set_name = owned_updates.set_name,
    number = owned_updates.number_value,
    variant = owned_updates.variant_value,
    exclusivity = owned_updates.exclusivity_value,
    pop_type = owned_updates.pop_type_value,
    pop_style = owned_updates.pop_style_value,
    set_total = owned_updates.total_value,
    needs_review = false,
    parse_confidence = greatest(coalesce(pc.parse_confidence, 0), 0.90),
    description = owned_updates.pop_name || ' is a ' || owned_updates.set_name || ' ' || owned_updates.pop_type_value || ' release #' || owned_updates.number_value ||
      case when owned_updates.variant_value is not null then ', ' || owned_updates.variant_value else '' end || '.',
    display_description = owned_updates.pop_name || ' is a ' || owned_updates.set_name || ' ' || owned_updates.pop_type_value || ' release #' || owned_updates.number_value ||
      case when owned_updates.variant_value is not null then ', ' || owned_updates.variant_value else '' end || '.'
  from owned_updates
  where pc.upc = owned_updates.upc
  returning pc.id, pc.upc, pc.pop_name
), relink_by_name as (
  update public.pop_set_checklist_items ci
  set pop_catalog_id = pc.id,
      upc = pc.upc,
      updated_at = now()
  from public.pop_catalog pc
  join public.pop_sets ps on ps.canonical_name = pc.set_name
    and ps.franchise = pc.franchise
  where ps.id = ci.set_id
    and pc.set_name = ps.canonical_name
    and pc.franchise = ps.franchise
    and ps.canonical_name in ('Hawkeye', 'Blue Beetle', 'Ghostbusters: Frozen Empire')
    and ci.number = pc.number
    and lower(ci.pop_name) = lower(pc.pop_name)
  returning ci.id
)
select
  (select count(*) from inserted_checklist) as inserted_checklist_rows,
  (select count(*) from updated_catalog) as updated_catalog_rows,
  (select count(*) from relink_by_name) as linked_catalog_rows;

-- Verification queries:
-- select ps.canonical_name, ps.franchise, ps.status, ps.confidence, count(ci.id) as required_rows, count(ci.pop_catalog_id) as linked_rows
-- from public.pop_sets ps
-- left join public.pop_set_checklist_items ci on ci.set_id = ps.id and ci.is_required_for_completion
-- where ps.canonical_name in ('Hawkeye', 'Blue Beetle', 'Ghostbusters: Frozen Empire')
-- group by ps.id
-- order by ps.canonical_name;
--
-- select set_name, franchise, count(*) as catalog_rows, count(*) filter (where set_total is not null) as rows_with_total,
--   count(*) filter (where needs_review) as needs_review_rows,
--   count(*) filter (where number is null or number = '') as missing_numbers,
--   count(*) filter (where image_url is null or image_url = '') as missing_images
-- from public.pop_catalog
-- where set_name in ('Hawkeye', 'Blue Beetle', 'Ghostbusters: Frozen Empire')
-- group by set_name, franchise
-- order by set_name;
