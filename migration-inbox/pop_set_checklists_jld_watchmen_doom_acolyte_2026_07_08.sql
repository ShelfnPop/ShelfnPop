-- Audit note: Justice League Dark, Watchmen, Doom Patrol, and The Acolyte reviewed checklist pass, 2026-07-08.
--
-- Sources:
--   Justice League Dark FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7654&ssid=1
--   Watchmen FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=watchmenfunko&id=6536
--   Doom Patrol FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1517
--   Star Wars - Acolyte FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5035
--
-- Live changes:
--   * Promote Justice League Dark to reviewed with 3 required rows.
--   * Promote Watchmen to reviewed with 8 required rows.
--   * Promote Doom Patrol to reviewed with 3 required rows.
--   * Promote The Acolyte to reviewed with 5 required rows.
--   * Normalize 10 owned catalog rows and set completion totals.

with jld_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'Justice League Dark',
    'DC',
    'reviewed',
    'FigureRealm Justice League Dark Pop! Vinyl checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7654&ssid=1',
    0.91,
    now(),
    'FigureRealm Pop! Vinyl Figures subseries lists 3 Justice League Dark rows. Completion denominator is 3.'
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
), watchmen_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'Watchmen',
    'DC',
    'reviewed',
    'FigureRealm Watchmen Pop! Vinyl checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=watchmenfunko&id=6536',
    0.91,
    now(),
    'FigureRealm lists 8 Watchmen Pop! Vinyl rows. Completion denominator is 8.'
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
), doom_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'Doom Patrol',
    'DC',
    'reviewed',
    'FigureRealm Doom Patrol Pop! Vinyl checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1517',
    0.91,
    now(),
    'FigureRealm lists 3 Doom Patrol Pop! Vinyl rows. Completion denominator is 3.'
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
), acolyte_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'The Acolyte',
    'Star Wars',
    'reviewed',
    'FigureRealm Star Wars - Acolyte Pop! Vinyl checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5035',
    0.91,
    now(),
    'FigureRealm lists 5 Star Wars - Acolyte Pop! Vinyl rows. Completion denominator is 5.'
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
    select id from jld_set
    union all select id from watchmen_set
    union all select id from doom_set
    union all select id from acolyte_set
  )
  returning id
), checklist(set_name, franchise_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, confidence_value, source_value, notes_value) as (
  values
    ('Justice League Dark','DC','Constantine (Deluxe)','Constantine','616',null,null,'Pop! Heroes','Deluxe',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7654&ssid=1','Justice League Dark checklist item.'),
    ('Justice League Dark','DC','Swamp Thing (Super)','Swamp Thing','624',null,null,'Pop! Heroes','Jumbo',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7654&ssid=1','FigureRealm labels this Super; app style uses Jumbo for oversized Pop figures.'),
    ('Justice League Dark','DC','Zatanna','Zatanna','623',null,null,'Pop! Heroes','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=7654&ssid=1','Justice League Dark checklist item.'),

    ('Watchmen','DC','Dr. Manhattan','Dr. Manhattan','23',null,null,'Pop! Heroes','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=watchmenfunko&id=6536','Watchmen checklist item.'),
    ('Watchmen','DC','Dr. Manhattan','Dr. Manhattan','1888',null,'Exclusive','Pop! Heroes','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=watchmenfunko&id=6536','Watchmen 2025 checklist item.'),
    ('Watchmen','DC','Nite Owl','Nite Owl','1899',null,'Exclusive','Pop! Heroes','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=watchmenfunko&id=6536','Watchmen 2025 checklist item.'),
    ('Watchmen','DC','Ozymandias','Ozymandias','1895',null,'Exclusive','Pop! Heroes','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=watchmenfunko&id=6536','Owned row and current 2025 checklist item.'),
    ('Watchmen','DC','Rorschach','Rorschach','24',null,null,'Pop! Heroes','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=watchmenfunko&id=6536','Watchmen checklist item.'),
    ('Watchmen','DC','Rorschach','Rorschach','1896',null,'Exclusive','Pop! Heroes','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=watchmenfunko&id=6536','Owned row and current 2025 checklist item.'),
    ('Watchmen','DC','Rorschach (Bloody)','Rorschach','24','Bloody',null,'Pop! Heroes','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=watchmenfunko&id=6536','Watchmen checklist item.'),
    ('Watchmen','DC','Silk Spectre II','Silk Spectre II','1887',null,'Exclusive','Pop! Heroes','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=watchmenfunko&id=6536','Watchmen 2025 checklist item.'),

    ('Doom Patrol','DC','Robotman','Robotman','1534',null,null,'Pop! Television','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1517','Doom Patrol checklist item.'),
    ('Doom Patrol','DC','Negative Man','Negative Man','1535',null,null,'Pop! Television','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1517','Doom Patrol checklist item.'),
    ('Doom Patrol','DC','Mr. Nobody (Glow)','Mr. Nobody','1536','Glow in the Dark',null,'Pop! Television','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1517','Doom Patrol checklist item.'),

    ('The Acolyte','Star Wars','Osha Aniseya','Osha Aniseya','722',null,null,'Pop! Star Wars','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5035','The Acolyte checklist item.'),
    ('The Acolyte','Star Wars','Qimir','Qimir','723',null,null,'Pop! Star Wars','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5035','The Acolyte checklist item.'),
    ('The Acolyte','Star Wars','Yord Fandar','Yord Fandar','724',null,null,'Pop! Star Wars','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5035','The Acolyte checklist item.'),
    ('The Acolyte','Star Wars','Jedi Master Sol','Jedi Master Sol','725',null,null,'Pop! Star Wars','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5035','The Acolyte checklist item.'),
    ('The Acolyte','Star Wars','Bazil','Bazil','726',null,null,'Pop! Star Wars','Standard',0.91::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5035','The Acolyte checklist item.')
), target_sets as (
  select id, 'Justice League Dark'::text as canonical_name, 'DC'::text as franchise from jld_set
  union all select id, 'Watchmen'::text, 'DC'::text from watchmen_set
  union all select id, 'Doom Patrol'::text, 'DC'::text from doom_set
  union all select id, 'The Acolyte'::text, 'Star Wars'::text from acolyte_set
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
    ('889698904377','Justice League Dark','DC',3,'Constantine (Deluxe)','Constantine','616',null,null,'Pop! Heroes','Deluxe'),
    ('889698904391','Justice League Dark','DC',3,'Swamp Thing (Super)','Swamp Thing','624',null,null,'Pop! Heroes','Jumbo'),
    ('889698871464','Watchmen','DC',8,'Ozymandias','Ozymandias','1895',null,'Exclusive','Pop! Heroes','Standard'),
    ('889698871471','Watchmen','DC',8,'Rorschach','Rorschach','1896',null,'Exclusive','Pop! Heroes','Standard'),
    ('889698758963','Doom Patrol','DC',3,'Robotman','Robotman','1534',null,null,'Pop! Television','Standard'),
    ('889698758956','Doom Patrol','DC',3,'Negative Man','Negative Man','1535',null,null,'Pop! Television','Standard'),
    ('889698758918','Doom Patrol','DC',3,'Mr. Nobody (Glow)','Mr. Nobody','1536','Glow in the Dark',null,'Pop! Television','Standard'),
    ('889698797559','The Acolyte','Star Wars',5,'Osha Aniseya','Osha Aniseya','722',null,null,'Pop! Star Wars','Standard'),
    ('889698797573','The Acolyte','Star Wars',5,'Yord Fandar','Yord Fandar','724',null,null,'Pop! Star Wars','Standard'),
    ('889698797597','The Acolyte','Star Wars',5,'Bazil','Bazil','726',null,null,'Pop! Star Wars','Standard')
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
      case when owned_updates.variant_value is not null then ', ' || owned_updates.variant_value else '' end ||
      case when owned_updates.exclusivity_value is not null then ', ' || owned_updates.exclusivity_value || ' exclusive' else '' end || '.',
    display_description = owned_updates.pop_name || ' is a ' || owned_updates.set_name || ' ' || owned_updates.pop_type_value || ' release #' || owned_updates.number_value ||
      case when owned_updates.variant_value is not null then ', ' || owned_updates.variant_value else '' end ||
      case when owned_updates.exclusivity_value is not null then ', ' || owned_updates.exclusivity_value || ' exclusive' else '' end || '.'
  from owned_updates
  where pc.upc = owned_updates.upc
  returning pc.id, pc.upc, pc.pop_name
)
select
  (select count(*) from inserted_checklist) as inserted_checklist_rows,
  (select count(*) from updated_catalog) as updated_catalog_rows;

-- Relink after apply:
-- update public.pop_set_checklist_items ci
-- set pop_catalog_id = pc.id, upc = pc.upc, updated_at = now()
-- from public.pop_catalog pc, public.pop_sets ps
-- where ps.id = ci.set_id
--   and ps.canonical_name in ('Justice League Dark', 'Watchmen', 'Doom Patrol', 'The Acolyte')
--   and pc.set_name = ps.canonical_name
--   and pc.franchise = ps.franchise
--   and ci.number = pc.number
--   and lower(ci.pop_name) = lower(pc.pop_name);
--
-- Verification queries:
-- select ps.canonical_name, ps.franchise, ps.status, ps.confidence, count(ci.id) as required_rows, count(ci.pop_catalog_id) as linked_rows
-- from public.pop_sets ps
-- left join public.pop_set_checklist_items ci on ci.set_id = ps.id and ci.is_required_for_completion
-- where ps.canonical_name in ('Justice League Dark', 'Watchmen', 'Doom Patrol', 'The Acolyte')
-- group by ps.id
-- order by ps.canonical_name;
--
-- select set_name, franchise, count(*) as catalog_rows, min(set_total) as set_total,
--   count(*) filter (where needs_review) as needs_review_rows,
--   count(*) filter (where number is null or number = '') as missing_numbers,
--   count(*) filter (where image_url is null or image_url = '') as missing_images
-- from public.pop_catalog
-- where set_name in ('Justice League Dark', 'Watchmen', 'Doom Patrol', 'The Acolyte')
-- group by set_name, franchise
-- order by set_name;
