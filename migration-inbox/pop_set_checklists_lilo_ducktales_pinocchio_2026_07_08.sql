-- Lilo & Stitch, DuckTales, and Pinocchio set-clean batch, 2026-07-08.
-- Lilo & Stitch is intentionally left draft because the source count is 64 Pop! Vinyl
-- rows and this pass focused on owned catalog normalization, not full extraction.

update public.pop_catalog
set
  set_name = 'Lilo & Stitch',
  pop_type = 'Pop! Disney',
  pop_style = coalesce(pop_style, 'Standard'),
  set_total = 64,
  needs_review = false,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.9)
where franchise = 'Disney'
  and (
    set_name in ('Lilo & Stitch', 'Lilo And Stitch', 'Disney Stich. Concept Art', 'Stitch In Costume')
    or upc in ('889698751650')
  );

update public.pop_catalog
set
  pop_name = case upc
    when '889698862769' then 'Stitch in Sand'
    when '889698831123' then 'Easter Stitch'
    when '889698903431' then 'Snorkeling Stitch'
    when '889698903455' then 'Stitch with Mood Chart'
    when '889698844246' then 'Stitch (Concept Art)'
    when '889698751650' then 'Stitch (As Pongo)'
    else pop_name
  end,
  character = case upc
    when '889698862769' then 'Stitch'
    when '889698831123' then 'Stitch'
    when '889698903431' then 'Stitch'
    when '889698903455' then 'Stitch'
    when '889698844246' then 'Stitch'
    when '889698751650' then 'Stitch'
    else character
  end,
  number = case upc
    when '889698862769' then '1566'
    when '889698831123' then '1533'
    when '889698903431' then '1742'
    when '889698903455' then '1744'
    when '889698844246' then '1538'
    when '889698751650' then '1462'
    else number
  end,
  variant = case upc
    when '889698844246' then 'Concept Art'
    when '889698751650' then 'As Pongo'
    else variant
  end,
  exclusivity = case upc
    when '889698844246' then 'Funko Shop'
    else exclusivity
  end,
  description = case upc
    when '889698862769' then 'Stitch in Sand is a Lilo & Stitch Pop! Disney release #1566.'
    when '889698831123' then 'Easter Stitch is a Lilo & Stitch Pop! Disney release #1533.'
    when '889698903431' then 'Snorkeling Stitch is a Lilo & Stitch Pop! Disney release #1742.'
    when '889698903455' then 'Stitch with Mood Chart is a Lilo & Stitch Pop! Disney release #1744.'
    when '889698844246' then 'Stitch (Concept Art) is a Lilo & Stitch Pop! Disney release #1538, Funko Shop exclusive.'
    when '889698751650' then 'Stitch (As Pongo) is a Lilo & Stitch Pop! Disney release #1462.'
    else description
  end,
  display_description = case upc
    when '889698862769' then 'Stitch in Sand is a Lilo & Stitch Pop! Disney release #1566.'
    when '889698831123' then 'Easter Stitch is a Lilo & Stitch Pop! Disney release #1533.'
    when '889698903431' then 'Snorkeling Stitch is a Lilo & Stitch Pop! Disney release #1742.'
    when '889698903455' then 'Stitch with Mood Chart is a Lilo & Stitch Pop! Disney release #1744.'
    when '889698844246' then 'Stitch (Concept Art) is a Lilo & Stitch Pop! Disney release #1538, Funko Shop exclusive.'
    when '889698751650' then 'Stitch (As Pongo) is a Lilo & Stitch Pop! Disney release #1462.'
    else display_description
  end,
  clean_title = case upc
    when '889698862769' then 'Stitch in Sand #1566'
    when '889698831123' then 'Easter Stitch #1533'
    when '889698903431' then 'Snorkeling Stitch #1742'
    when '889698903455' then 'Stitch with Mood Chart #1744'
    when '889698844246' then 'Stitch (Concept Art) #1538'
    when '889698751650' then 'Stitch (As Pongo) #1462'
    else clean_title
  end
where upc in ('889698862769','889698831123','889698903431','889698903455','889698844246','889698751650');

update public.pop_catalog
set
  set_name = 'DuckTales',
  pop_type = case when upc = '889698855532' then 'Pop! Digital' else 'Pop! Disney' end,
  pop_style = case when upc = '889698855532' then 'Digital' else 'Standard' end,
  set_total = 10,
  needs_review = false,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.9)
where franchise = 'Disney'
  and set_name = 'DuckTales';

update public.pop_catalog
set
  pop_name = 'Jiminy Cricket (Green Jacket)',
  character = 'Jiminy Cricket',
  franchise = 'Disney',
  set_name = 'Pinocchio',
  number = '1026',
  variant = 'Green Jacket',
  exclusivity = null,
  pop_type = 'Pop! Disney',
  pop_style = 'Standard',
  set_total = 14,
  clean_title = 'Jiminy Cricket (Green Jacket) #1026',
  description = 'Jiminy Cricket (Green Jacket) is a Pinocchio Pop! Disney release #1026.',
  display_description = 'Jiminy Cricket (Green Jacket) is a Pinocchio Pop! Disney release #1026.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698515344';

update public.pop_catalog
set
  pop_name = 'Blue Fairy',
  character = 'Blue Fairy',
  franchise = 'Disney',
  set_name = 'Pinocchio',
  number = '1027',
  variant = null,
  exclusivity = null,
  pop_type = 'Pop! Disney',
  pop_style = 'Standard',
  set_total = 14,
  clean_title = 'Blue Fairy #1027',
  description = 'Blue Fairy is a Pinocchio Pop! Disney release #1027.',
  display_description = 'Blue Fairy is a Pinocchio Pop! Disney release #1027.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698515351';

update public.pop_catalog
set
  pop_name = 'Geppetto',
  character = 'Geppetto',
  franchise = 'Netflix''s Pinocchio',
  set_name = 'Netflix''s Pinocchio',
  number = '1297',
  variant = null,
  exclusivity = null,
  pop_type = 'Pop! Movies',
  pop_style = 'Standard',
  set_total = 5,
  clean_title = 'Geppetto #1297',
  description = 'Geppetto is a Netflix''s Pinocchio Pop! Movies release #1297.',
  display_description = 'Geppetto is a Netflix''s Pinocchio Pop! Movies release #1297.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698673860';

with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values
    ('Lilo & Stitch', 'Disney', 'draft', 'FigureRealm Pop! Vinyl Figure checklist', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3047&ssid=58', 0.9, null, 'Source count is 64 Pop! Vinyl Figure rows; owned catalog rows normalized in this pass, full checklist extraction deferred.'),
    ('DuckTales', 'Disney', 'reviewed', 'Retail and collector checklist cross-check', 'https://www.pricecharting.com/search-products?q=Funko+Pop+DuckTales&type=prices', 0.85, now(), 'Reviewed compact DuckTales checklist including classic, convention, digital, and later Scrooge/Gizmoduck rows.'),
    ('Pinocchio', 'Disney', 'reviewed', 'FigureRealm Pinocchio Pop! Vinyl checklist', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810', 0.9, now(), 'Reviewed Disney Pinocchio checklist; Netflix''s Pinocchio Geppetto was split into its own catalog set.'),
    ('Netflix''s Pinocchio', 'Netflix''s Pinocchio', 'draft', 'Funko product metadata', 'https://funko.com/', 0.85, null, 'Catalog split target for Geppetto #1297; full checklist not extracted in this pass.')
  on conflict (canonical_name, franchise) do update
  set status = excluded.status,
      source_label = excluded.source_label,
      source_url = excluded.source_url,
      confidence = excluded.confidence,
      reviewed_at = excluded.reviewed_at,
      notes = excluded.notes,
      updated_at = now()
  returning id, canonical_name, franchise
), target_sets as (
  select id, canonical_name, franchise from upsert_sets
  union all
  select id, canonical_name, franchise
  from public.pop_sets
  where (canonical_name, franchise) in (
    ('Lilo & Stitch', 'Disney'),
    ('DuckTales', 'Disney'),
    ('Pinocchio', 'Disney'),
    ('Netflix''s Pinocchio', 'Netflix''s Pinocchio')
  )
), delete_existing as (
  delete from public.pop_set_checklist_items
  where set_id in (
    select id from target_sets where canonical_name in ('DuckTales', 'Pinocchio')
  )
), checklist(set_name, franchise_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, confidence_value, source_value, notes_value) as (
  values
    ('DuckTales','Disney','Scrooge McDuck','Scrooge McDuck','306',null,null,'Pop! Disney','Standard',0.9,'https://www.pricecharting.com/search-products?q=Funko+Pop+DuckTales&type=prices','Classic DuckTales Pop! Disney release.'),
    ('DuckTales','Disney','Huey','Huey','307',null,null,'Pop! Disney','Standard',0.9,'https://www.pricecharting.com/search-products?q=Funko+Pop+DuckTales&type=prices','Classic DuckTales Pop! Disney release.'),
    ('DuckTales','Disney','Dewey','Dewey','308',null,null,'Pop! Disney','Standard',0.9,'https://www.pricecharting.com/search-products?q=Funko+Pop+DuckTales&type=prices','Classic DuckTales Pop! Disney release.'),
    ('DuckTales','Disney','Louie','Louie','309',null,null,'Pop! Disney','Standard',0.9,'https://www.pricecharting.com/search-products?q=Funko+Pop+DuckTales&type=prices','Classic DuckTales Pop! Disney release.'),
    ('DuckTales','Disney','Webby','Webby','310',null,null,'Pop! Disney','Standard',0.9,'https://www.pricecharting.com/search-products?q=Funko+Pop+DuckTales&type=prices','Classic DuckTales Pop! Disney release.'),
    ('DuckTales','Disney','Magica De Spell','Magica De Spell','311',null,'GameStop','Pop! Disney','Standard',0.9,'https://www.pricecharting.com/search-products?q=Funko+Pop+DuckTales&type=prices','GameStop exclusive.'),
    ('DuckTales','Disney','Scrooge McDuck (Gold)','Scrooge McDuck','312','Gold','New York Comic Con','Pop! Disney','Standard',0.82,'https://www.pricecharting.com/search-products?q=Funko+Pop+DuckTales&type=prices','Convention exclusive variant.'),
    ('DuckTales','Disney','Flintheart Glomgold','Flintheart Glomgold','313','Ultra','Droppp','Pop! Digital','Digital',0.9,'https://droppp.io/','Digital Pop! release.'),
    ('DuckTales','Disney','Ma Beagle','Ma Beagle','316','Royalty','Droppp','Pop! Digital','Digital',0.82,'https://droppp.io/','Digital Pop! royalty reward.'),
    ('DuckTales','Disney','Gizmoduck','Gizmoduck','362',null,'Target','Pop! Disney','Standard',0.85,'https://www.pricecharting.com/search-products?q=Funko+Pop+DuckTales&type=prices','Target exclusive.'),
    ('Pinocchio','Disney','Pinocchio','Pinocchio','617',null,null,'Pop! Disney','Standard',0.9,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810','Disney Pinocchio Pop! Vinyl Figure.'),
    ('Pinocchio','Disney','Pinocchio (Glitter)','Pinocchio','617','Glitter','BoxLunch','Pop! Disney','Standard',0.88,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810','BoxLunch glitter variant.'),
    ('Pinocchio','Disney','Jiminy Cricket (Green Jacket)','Jiminy Cricket','1026','Green Jacket',null,'Pop! Disney','Standard',0.95,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810','Disney Pinocchio Pop! Vinyl Figure.'),
    ('Pinocchio','Disney','Jiminy Cricket','Jiminy Cricket','1026',null,null,'Pop! Disney','Standard',0.9,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810','Disney Pinocchio Pop! Vinyl Figure.'),
    ('Pinocchio','Disney','Blue Fairy','Blue Fairy','1027',null,null,'Pop! Disney','Standard',0.95,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810','Disney Pinocchio Pop! Vinyl Figure.'),
    ('Pinocchio','Disney','Figaro','Figaro','1028',null,null,'Pop! Disney','Standard',0.9,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810','Disney Pinocchio Pop! Vinyl Figure.'),
    ('Pinocchio','Disney','Pinocchio','Pinocchio','1029',null,null,'Pop! Disney','Standard',0.9,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810','Disney Pinocchio Pop! Vinyl Figure.'),
    ('Pinocchio','Disney','Cleo in Fish Bowl','Cleo','1030',null,null,'Pop! Disney','Standard',0.9,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810','Disney Pinocchio Pop! Vinyl Figure.'),
    ('Pinocchio','Disney','Geppetto','Geppetto','1031',null,null,'Pop! Disney','Standard',0.9,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810','Disney Pinocchio Pop! Vinyl Figure.'),
    ('Pinocchio','Disney','Honest John','Honest John','1032',null,null,'Pop! Disney','Standard',0.9,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810','Disney Pinocchio Pop! Vinyl Figure.'),
    ('Pinocchio','Disney','Jiminy Cricket on Leaf','Jiminy Cricket','1033',null,null,'Pop! Disney','Standard',0.9,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810','Disney Pinocchio Pop! Vinyl Figure.'),
    ('Pinocchio','Disney','Pinocchio (Art Series)','Pinocchio','25','Art Series','Target','Pop! Disney','Art Series',0.88,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810','Target Art Series release.'),
    ('Pinocchio','Disney','Pinocchio (Wooden)','Pinocchio','1029','Wooden','Funko Shop','Pop! Disney','Standard',0.86,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810','Funko Shop wooden variant.'),
    ('Pinocchio','Disney','Pinocchio (With Jiminy Cricket)','Pinocchio','617','With Jiminy Cricket','Funko Shop','Pop! Disney','Standard',0.86,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810','Funko Shop variant.')
), inserted as (
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
  on conflict (
    set_id,
    coalesce(number, ''),
    lower(coalesce(pop_name, '')),
    lower(coalesce(variant, '')),
    lower(coalesce(exclusivity, ''))
  ) do update
  set character = excluded.character,
      pop_type = excluded.pop_type,
      pop_style = excluded.pop_style,
      source_url = excluded.source_url,
      confidence = excluded.confidence,
      notes = excluded.notes,
      updated_at = now()
  returning id
)
update public.pop_set_checklist_items ci
set pop_catalog_id = pc.id,
    upc = pc.upc,
    updated_at = now()
from public.pop_catalog pc, public.pop_sets ps
where ci.set_id = ps.id
  and pc.franchise = ps.franchise
  and pc.set_name = ps.canonical_name
  and coalesce(ci.number, '') = coalesce(pc.number, '')
  and lower(ci.pop_name) = lower(pc.pop_name)
  and ps.canonical_name in ('DuckTales', 'Pinocchio');

update public.pop_set_checklist_items ci
set pop_catalog_id = pc.id,
    upc = pc.upc,
    updated_at = now()
from public.pop_catalog pc
join public.pop_sets ps
  on ps.canonical_name = pc.set_name
 and ps.franchise = pc.franchise
where ci.set_id = ps.id
  and ps.canonical_name in ('DuckTales', 'Pinocchio')
  and coalesce(ci.number, '') = coalesce(pc.number, '')
  and lower(coalesce(ci.variant, '')) = lower(coalesce(pc.variant, ''))
  and lower(coalesce(ci.exclusivity, '')) = lower(coalesce(pc.exclusivity, ''));
