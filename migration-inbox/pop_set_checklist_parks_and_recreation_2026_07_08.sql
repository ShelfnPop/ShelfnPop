-- Audit note: Parks and Recreation reviewed Pop! Vinyl checklist pass, 2026-07-08.
--
-- Source:
--   FigureRealm Parks and Recreation Pop! Vinyl Figures checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3920&mode=2&series=parksandrecreationfunko&ssid=3
--
-- Live changes:
--   * Promote Parks and Recreation to reviewed with 35 Pop! Vinyl rows.
--   * Exclude Pop! Sets and Soda from this completion denominator.
--   * Normalize 11 owned catalog rows and set scoped completion totals.

with parks_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Parks and Recreation','Parks and Recreation','reviewed','FigureRealm Parks and Recreation Pop! Vinyl checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3920&mode=2&series=parksandrecreationfunko&ssid=3',0.90,now(),'FigureRealm Pop! Vinyl Figures subseries lists 35 Parks and Recreation rows. Completion denominator excludes Pop! Sets and Soda.')
  on conflict (canonical_name, franchise) do update set status=excluded.status, source_label=excluded.source_label, source_url=excluded.source_url, confidence=excluded.confidence, reviewed_at=excluded.reviewed_at, notes=excluded.notes, updated_at=now()
  returning id
), clear_prior as (
  delete from public.pop_set_checklist_items
  where set_id in (select id from parks_set)
  returning id
), checklist(pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, confidence_value, notes_value) as (
  values
    ('Andy (As Princess Rainbow Sparkle)','Andy Dwyer','1147','As Princess Rainbow Sparkle',null,'Pop! Television','Standard',0.90::numeric,'Owned row checklist item.'),
    ('Andy (with Leg Casts)','Andy Dwyer','1155','with Leg Casts',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Andy Dwyer (Johnny Karate) (Chase)','Andy Dwyer','533','Johnny Karate Chase',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Andy Dwyer (Mouse Rat Shirt)','Andy Dwyer','533','Mouse Rat Shirt',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Andy Dwyer (Pawnee Goddesses)','Andy Dwyer','1413','Pawnee Goddesses',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Andy Dwyer (Playing Guitar)','Andy Dwyer','501','Playing Guitar',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Andy Radical (Opposum)','Andy Dwyer','1567','Opposum',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Ann Perkins (Pawnee Goddesses)','Ann Perkins','1411','Pawnee Goddesses',null,'Pop! Television','Standard',0.90::numeric,'Owned row checklist item.'),
    ('April Ludgate','April Ludgate','502',null,null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('April Ludgate (Pawnee Goddesses)','April Ludgate','1412','Pawnee Goddesses',null,'Pop! Television','Standard',0.90::numeric,'Owned row checklist item.'),
    ('April Ludgate (Prom Outfit)','April Ludgate','1581','Prom Outfit',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('April Ludgate (Scissors)','April Ludgate','1568','Scissors',null,'Pop! Television','Standard',0.90::numeric,'Owned row checklist item.'),
    ('Ben Wyatt','Ben Wyatt','1153',null,null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Ben Wyatt (Ledgerman Hat) (Chase)','Ben Wyatt','1153','Ledgerman Hat Chase',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Bert Macklin','Bert Macklin','503',null,null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Chris Traeger (with Champion)','Chris Traeger','1415','with Champion',null,'Pop! Television','Standard',0.90::numeric,'Owned row checklist item.'),
    ('Duke Silver','Duke Silver','1149',null,null,'Pop! Television','Standard',0.90::numeric,'Owned row checklist item.'),
    ('Filibuster Leslie','Leslie Knope','1151','Filibuster',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Hunter Ron (Bandaged) (Chase)','Ron Swanson','1150','Bandaged Chase',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Hunter Ron (Hat)','Ron Swanson','1150','Hat',null,'Pop! Television','Standard',0.90::numeric,'Owned row checklist item.'),
    ('Janet Snakehole','April Ludgate','1148',null,null,'Pop! Television','Standard',0.90::numeric,'Owned row checklist item.'),
    ('Jeremy Jamm','Jeremy Jamm','1259',null,'Summer Convention','Pop! Television','Standard',0.90::numeric,'Owned row checklist item.'),
    ('Leslie Knope','Leslie Knope','498',null,null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Leslie Knope (Pawnee Goddesses)','Leslie Knope','1410','Pawnee Goddesses',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Leslie Knope (Waffles)','Leslie Knope','1537','Waffles',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Leslie Knope (Wedding Dress)','Leslie Knope','1287','Wedding Dress',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Leslie the Riveter','Leslie Knope','1146','Riveter',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Li''L Sebastian','Li''L Sebastian','500',null,null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Mona-Lisa','Mona-Lisa','1284',null,null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Ron Swanson','Ron Swanson','499',null,null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Ron Swanson (Cornrows)','Ron Swanson','652','Cornrows',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Ron Swanson (Dancing)','Ron Swanson','1063','Dancing',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.'),
    ('Ron Swanson (Pawnee Rangers)','Ron Swanson','1414','Pawnee Rangers',null,'Pop! Television','Standard',0.90::numeric,'Owned row checklist item.'),
    ('Ron Swanson (Pyramid of Greatness)','Ron Swanson','1569','Pyramid of Greatness',null,'Pop! Television','Standard',0.90::numeric,'Owned row checklist item.'),
    ('Ron with the Flu','Ron Swanson','1152','with the Flu',null,'Pop! Television','Standard',0.90::numeric,'Parks and Recreation checklist item.')
), inserted_checklist as (
  insert into public.pop_set_checklist_items (set_id, pop_name, character, number, variant, exclusivity, pop_type, pop_style, is_required_for_completion, source_url, confidence, notes)
  select parks_set.id, checklist.pop_name, checklist.character_name, checklist.number_value, checklist.variant_value, checklist.exclusivity_value, checklist.pop_type_value, checklist.pop_style_value, true, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3920&mode=2&series=parksandrecreationfunko&ssid=3', checklist.confidence_value, checklist.notes_value
  from checklist cross join parks_set cross join (select count(*) as cleared_rows from clear_prior) cleared
  returning id
), owned_updates(upc, pop_name, character_name, number_value, variant_value, exclusivity_value) as (
  values
    ('889698561662','Andy (As Princess Rainbow Sparkle)','Andy Dwyer','1147','As Princess Rainbow Sparkle',null),
    ('889698561693','Janet Snakehole','April Ludgate','1148',null,null),
    ('889698561679','Duke Silver','Duke Silver','1149',null,null),
    ('889698561686','Hunter Ron (Hat)','Ron Swanson','1150','Hat',null),
    ('889698652605','Jeremy Jamm','Jeremy Jamm','1259',null,'Summer Convention'),
    ('889698726559','Ann Perkins (Pawnee Goddesses)','Ann Perkins','1411','Pawnee Goddesses',null),
    ('889698726566','April Ludgate (Pawnee Goddesses)','April Ludgate','1412','Pawnee Goddesses',null),
    ('889698726580','Ron Swanson (Pawnee Rangers)','Ron Swanson','1414','Pawnee Rangers',null),
    ('889698744317','Chris Traeger (with Champion)','Chris Traeger','1415','with Champion',null),
    ('889698801720','April Ludgate (Scissors)','April Ludgate','1568','Scissors',null),
    ('889698801751','Ron Swanson (Pyramid of Greatness)','Ron Swanson','1569','Pyramid of Greatness',null)
), updated_catalog as (
  update public.pop_catalog pc
  set pop_name=owned_updates.pop_name, character=owned_updates.character_name, franchise='Parks and Recreation', set_name='Parks and Recreation', number=owned_updates.number_value, variant=owned_updates.variant_value, exclusivity=owned_updates.exclusivity_value, pop_type='Pop! Television', pop_style='Standard', set_total=35, needs_review=false, parse_confidence=greatest(coalesce(pc.parse_confidence,0),0.90),
    description = owned_updates.pop_name || ' is a Parks and Recreation Pop! Television release #' || owned_updates.number_value || case when owned_updates.variant_value is not null then ', ' || owned_updates.variant_value || ' variant' else '' end || case when owned_updates.exclusivity_value is not null then ', ' || owned_updates.exclusivity_value || ' exclusive' else '' end || '.',
    display_description = owned_updates.pop_name || ' is a Parks and Recreation Pop! Television release #' || owned_updates.number_value || case when owned_updates.variant_value is not null then ', ' || owned_updates.variant_value || ' variant' else '' end || case when owned_updates.exclusivity_value is not null then ', ' || owned_updates.exclusivity_value || ' exclusive' else '' end || '.'
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
--   and ps.canonical_name = 'Parks and Recreation'
--   and ps.franchise = 'Parks and Recreation'
--   and pc.set_name = ps.canonical_name
--   and pc.franchise = ps.franchise
--   and ci.number = pc.number
--   and lower(ci.pop_name) = lower(pc.pop_name);
