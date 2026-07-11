-- Lilo & Stitch full Pop! Vinyl checklist pass, 2026-07-08.
-- Source: MyPopFigures/FigureRealm Pop! Vinyl Figures subseries, 64 rows.

update public.pop_catalog
set
  pop_name = case upc
    when '889698556149' then 'Lilo (with Scrump)'
    when '889698862769' then 'Gamer Stitch'
    when '889698831123' then 'Stitch (Easter Bunny)'
    when '889698736374' then 'Stitch with Plunger'
    when '889698751629' then 'Stitch (As Beast)'
    when '889698751643' then 'Stitch as Simba'
    when '889698919074' then 'Stitch with Mood Chart (Angry) (Chase)'
    else pop_name
  end,
  character = case upc
    when '889698556149' then 'Lilo'
    when '889698862769' then 'Stitch'
    when '889698831123' then 'Stitch'
    when '889698736374' then 'Stitch'
    when '889698751629' then 'Stitch'
    when '889698751643' then 'Stitch'
    when '889698919074' then 'Stitch'
    else character
  end,
  number = case upc
    when '889698556149' then '1043'
    when '889698862769' then '1566'
    when '889698831123' then '1533'
    when '889698736374' then '1354'
    when '889698751629' then '1459'
    when '889698751643' then '1461'
    when '889698919074' then '1744'
    else number
  end,
  variant = case upc
    when '889698556149' then 'With Scrump'
    when '889698831123' then 'Easter Bunny'
    when '889698751629' then 'As Beast'
    when '889698751643' then 'As Simba'
    when '889698919074' then 'Chase'
    else variant
  end,
  exclusivity = case upc
    when '889698736374' then 'Entertainment Earth'
    when '889698919074' then null
    else exclusivity
  end,
  set_name = 'Lilo & Stitch',
  pop_type = 'Pop! Disney',
  pop_style = 'Standard',
  set_total = 64,
  parse_confidence = 0.98,
  needs_review = false,
  clean_title = case upc
    when '889698556149' then 'Lilo (with Scrump) #1043'
    when '889698862769' then 'Gamer Stitch #1566'
    when '889698831123' then 'Stitch (Easter Bunny) #1533'
    when '889698736374' then 'Stitch with Plunger #1354'
    when '889698751629' then 'Stitch (As Beast) #1459'
    when '889698751643' then 'Stitch as Simba #1461'
    when '889698919074' then 'Stitch with Mood Chart (Angry) (Chase) #1744'
    else clean_title
  end,
  description = case upc
    when '889698556149' then 'Lilo (with Scrump) is a Lilo & Stitch Pop! Disney release #1043.'
    when '889698862769' then 'Gamer Stitch is a Lilo & Stitch Pop! Disney release #1566.'
    when '889698831123' then 'Stitch (Easter Bunny) is a Lilo & Stitch Pop! Disney release #1533.'
    when '889698736374' then 'Stitch with Plunger is a Lilo & Stitch Pop! Disney release #1354, Entertainment Earth exclusive.'
    when '889698751629' then 'Stitch (As Beast) is a Lilo & Stitch Pop! Disney release #1459.'
    when '889698751643' then 'Stitch as Simba is a Lilo & Stitch Pop! Disney release #1461.'
    when '889698919074' then 'Stitch with Mood Chart (Angry) (Chase) is a Lilo & Stitch Pop! Disney release #1744.'
    else description
  end,
  display_description = case upc
    when '889698556149' then 'Lilo (with Scrump) is a Lilo & Stitch Pop! Disney release #1043.'
    when '889698862769' then 'Gamer Stitch is a Lilo & Stitch Pop! Disney release #1566.'
    when '889698831123' then 'Stitch (Easter Bunny) is a Lilo & Stitch Pop! Disney release #1533.'
    when '889698736374' then 'Stitch with Plunger is a Lilo & Stitch Pop! Disney release #1354, Entertainment Earth exclusive.'
    when '889698751629' then 'Stitch (As Beast) is a Lilo & Stitch Pop! Disney release #1459.'
    when '889698751643' then 'Stitch as Simba is a Lilo & Stitch Pop! Disney release #1461.'
    when '889698919074' then 'Stitch with Mood Chart (Angry) (Chase) is a Lilo & Stitch Pop! Disney release #1744.'
    else display_description
  end
where upc in ('889698556149','889698862769','889698831123','889698736374','889698751629','889698751643','889698919074');

update public.pop_catalog
set
  pop_name = 'Lilo''s Home',
  character = 'Lilo''s Home',
  set_name = 'Lilo & Stitch Bitty Pop!',
  pop_type = 'Bitty Pop!',
  pop_style = 'Bitty Box',
  set_total = null,
  description = 'Lilo''s Home is a Lilo & Stitch Bitty Pop! Bitty Box release.',
  display_description = 'Lilo''s Home is a Lilo & Stitch Bitty Pop! Bitty Box release.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698855365';

with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values
    ('Lilo & Stitch', 'Disney', 'reviewed', 'MyPopFigures / FigureRealm Pop! Vinyl Figures checklist', 'https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10', 0.9, now(), 'Loaded 64 Pop! Vinyl Figure checklist rows from the Lilo & Stitch subseries. Bitty Pop! Lilo''s Home split out of this denominator.'),
    ('Lilo & Stitch Bitty Pop!', 'Disney', 'draft', 'Funko product metadata', 'https://funko.com/bitty-pop-bitty-box-lilos-home/85536.html', 0.9, null, 'Catalog split target for Lilo''s Home Bitty Pop! Bitty Box; full Bitty Pop! checklist not extracted in this pass.')
  on conflict (canonical_name, franchise) do update
  set status = excluded.status,
      source_label = excluded.source_label,
      source_url = excluded.source_url,
      confidence = excluded.confidence,
      reviewed_at = excluded.reviewed_at,
      notes = excluded.notes,
      updated_at = now()
  returning id, canonical_name, franchise
), target_set as (
  select id from public.pop_sets where canonical_name = 'Lilo & Stitch' and franchise = 'Disney'
), delete_existing as (
  delete from public.pop_set_checklist_items where set_id in (select id from target_set)
), checklist(pop_name, character_name, number_value, variant_value, exclusivity_value, pop_style_value, source_value) as (
  values
    ('Angel (Easter Bunny)','Angel','1534','Easter Bunny',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Annoyed Stitch','Stitch','1222',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Gamer Stitch','Stitch','1229',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Gamer Stitch','Stitch','1566',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Halloween Stitch','Stitch','605',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Hula Lilo','Lilo','521',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Hula Lilo with Scrump','Lilo','1741','With Scrump',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Hula Stitch','Stitch','718',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Lilo (with Pudge)','Lilo','1047','With Pudge',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Lilo (with Scrump)','Lilo','1043','With Scrump',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Luau Angel','Angel','1568',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Luau Stitch','Stitch','1567',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Mermaid Angel','Angel','1743',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Monster Stitch','Stitch','1049',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Pirate Stitch','Stitch','1659',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Pumpkin Stitch','Stitch','1087',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Pumpkin Stitch (Black Light)','Stitch','1498','Black Light',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Reuben (with Grilled Cheese)','Reuben','1339','With Grilled Cheese',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Santa Stitch','Stitch','983',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Skeleton Stitch','Stitch','1234',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Skeleton Stitch (Glows In The Dark) (Chase)','Stitch','1234','Chase',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Sleeping Stitch','Stitch','1050',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Snorkeling Stitch','Stitch','1742',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (As Beast)','Stitch','1459','As Beast',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (As Cheshire Cat)','Stitch','1460','As Cheshire Cat',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (As Gus Gus)','Stitch','1463','As Gus Gus',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (As Pongo)','Stitch','1462','As Pongo',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (Concept Art)','Stitch','1538','Concept Art','Funko Shop','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (Drinking Boba Tea)','Stitch','1182','Drinking Boba Tea',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (Easter Bunny)','Stitch','1533','Easter Bunny',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (Smiling)','Stitch','1045',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (Smiling) (10" Scale)','Stitch','1046','10" Scale',null,'Jumbo','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (Smiling) (Flocked)','Stitch','1045','Flocked',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (with Record Player)','Stitch','1048','With Record Player',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (with Record Player) (Open Mouth) (Chase)','Stitch','1048','Chase',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (with Turtle)','Stitch','1353','With Turtle',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (with Ukulele)','Stitch','1044','With Ukulele',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (with Ukulele) (Diamond)','Stitch','1044','Diamond',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (with Ukulele) (Flocked)','Stitch','1044','Flocked',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (with Ukulele) (Jumbo)','Stitch','1419','With Ukulele','Entertainment Earth','Jumbo','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ssid=10'),
    ('Stitch (with Ukulele) (Metallic)','Stitch','1044','Metallic',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch 626 (Metallic)','Stitch','125','Metallic',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch as Baker','Stitch','978','As Baker',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch as Simba','Stitch','1461','As Simba',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch in Bathtub (Deluxe)','Stitch','1252','Deluxe',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch in Cuffs','Stitch','1235',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch in Robe','Stitch','1608',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch in Rollers','Stitch','1124',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch in Sunlounger','Stitch','1639',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch On Surfboard','Stitch','1594',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch On Tricycle','Stitch','784',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch Unwrapping Gift','Stitch','1522',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch Valentine','Stitch','510',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch with Balloon','Stitch','1709',null,'Target','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch with Ducks (Deluxe)','Stitch','639','Deluxe','BoxLunch','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch with Frog','Stitch','986',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch with Mood Chart','Stitch','1744',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch with Mood Chart (Angry) (Chase)','Stitch','1744','Chase',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch with Plunger','Stitch','1354',null,'Entertainment Earth','Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Stitch with Tube','Stitch','1565',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Summer Stitch (Black Light)','Stitch','1414','Black Light',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Summer Stitch (Scented)','Stitch','636','Scented',null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Superhero Stitch','Stitch','506',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10'),
    ('Tourist Stitch','Stitch','1569',null,null,'Standard','https://www.mypopfigures.com/pop?action=seriesitemlist&id=3047&ns=40&series=lilostitchfunko&ssid=10')
), inserted as (
  insert into public.pop_set_checklist_items (
    set_id, pop_name, character, number, variant, exclusivity, pop_type, pop_style,
    is_required_for_completion, source_url, confidence, notes
  )
  select
    target_set.id,
    checklist.pop_name,
    checklist.character_name,
    checklist.number_value,
    checklist.variant_value,
    checklist.exclusivity_value,
    'Pop! Disney',
    checklist.pop_style_value,
    true,
    checklist.source_value,
    0.9,
    'Lilo & Stitch Pop! Vinyl Figures checklist row.'
  from checklist
  cross join target_set
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
      is_required_for_completion = true,
      updated_at = now()
  returning id
)
update public.pop_set_checklist_items ci
set pop_catalog_id = pc.id,
    upc = pc.upc,
    updated_at = now()
from public.pop_catalog pc, public.pop_sets ps
where ci.set_id = ps.id
  and ps.canonical_name = 'Lilo & Stitch'
  and ps.franchise = 'Disney'
  and pc.set_name = ps.canonical_name
  and pc.franchise = ps.franchise
  and coalesce(ci.number, '') = coalesce(pc.number, '')
  and (
    lower(ci.pop_name) = lower(pc.pop_name)
    or lower(coalesce(ci.variant, '')) = lower(coalesce(pc.variant, ''))
  );

update public.pop_set_checklist_items ci
set pop_catalog_id = pc.id,
    upc = pc.upc,
    updated_at = now()
from public.pop_catalog pc
join public.pop_sets ps
  on ps.canonical_name = pc.set_name
 and ps.franchise = pc.franchise
where ci.set_id = ps.id
  and ps.canonical_name = 'Lilo & Stitch'
  and ps.franchise = 'Disney'
  and coalesce(ci.number, '') = coalesce(pc.number, '')
  and (
    lower(ci.pop_name) = lower(pc.pop_name)
    or (
      lower(coalesce(ci.variant, '')) = lower(coalesce(pc.variant, ''))
      and coalesce(ci.variant, '') <> ''
    )
  );
