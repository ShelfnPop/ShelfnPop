-- Audit note: Shang-Chi and South Park reviewed checklist pass, 2026-07-08.
--
-- Sources:
--   Shang-Chi FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639
--   South Park FigureRealm Pop! Vinyl checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6
--
-- Live changes:
--   * Promote Shang-Chi and the Legend of the Ten Rings to reviewed with 14 required rows.
--   * Promote South Park to reviewed with 55 required Pop! Vinyl rows.
--   * Normalize noisy owned Shang-Chi rows: Wenwu #847, Shang-Chi #844, Katy #845,
--     The Great Protector #850, Shang-Chi #879, and Xialing #880.
--   * Normalize owned South Park AWESOM-O and Kyle display names.
--   * Stage The Office as a dedicated follow-up instead of forcing a 100-row Pop! Vinyl pass here.

with shang_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'Shang-Chi and the Legend of the Ten Rings',
    'Marvel',
    'reviewed',
    'FigureRealm Shang-Chi Pop! Vinyl checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639',
    0.92,
    now(),
    'FigureRealm lists 14 Shang-Chi Pop! Vinyl rows. Completion denominator is 14.'
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
), south_park_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'South Park',
    'South Park',
    'reviewed',
    'FigureRealm South Park Pop! Vinyl checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6',
    0.90,
    now(),
    'FigureRealm Pop! Vinyl Figures subseries lists 55 South Park rows. Completion denominator is 55 and excludes Albums, Keychains, Sets, Towns, and Wacky Wobblers.'
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
), office_draft as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'The Office',
    'The Office',
    'draft',
    'FigureRealm Office Pop! Vinyl checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3835&ssid=-1',
    0.82,
    null,
    'FigureRealm shows a large Office checklist with 100 Pop! Vinyl rows plus rides, sets, pins, keychains, ornaments, Popsies, and Soda. This is staged as a dedicated follow-up so the full 100-row Pop! Vinyl denominator can be extracted without mixing subseries.'
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
    select id from shang_set
    union all
    select id from south_park_set
  )
  returning id
), checklist(set_name, franchise_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, confidence_value, source_value, notes_value) as (
  values
    ('Shang-Chi and the Legend of the Ten Rings','Marvel','Death Dealer','Death Dealer','853','Common','GameStop','Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639','Shang-Chi checklist item.'),
    ('Shang-Chi and the Legend of the Ten Rings','Marvel','The Great Protector (6" Scale)','The Great Protector','850','Common',null,'Pop! Super','Jumbo',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639','Shang-Chi checklist item.'),
    ('Shang-Chi and the Legend of the Ten Rings','Marvel','Jiang Li','Jiang Li','848','Common',null,'Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639','Shang-Chi checklist item.'),
    ('Shang-Chi and the Legend of the Ten Rings','Marvel','Katy','Katy','845','Common',null,'Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639','Shang-Chi checklist item.'),
    ('Shang-Chi and the Legend of the Ten Rings','Marvel','Katy','Katy','852','Common',null,'Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639','Shang-Chi checklist item.'),
    ('Shang-Chi and the Legend of the Ten Rings','Marvel','Razor Fist','Razor Fist','849','Common',null,'Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639','Shang-Chi checklist item.'),
    ('Shang-Chi and the Legend of the Ten Rings','Marvel','Shang-Chi','Shang-Chi','843','Common',null,'Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639','Shang-Chi checklist item.'),
    ('Shang-Chi and the Legend of the Ten Rings','Marvel','Shang-Chi','Shang-Chi','844','Common',null,'Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639','Shang-Chi checklist item.'),
    ('Shang-Chi and the Legend of the Ten Rings','Marvel','Shang-Chi','Shang-Chi','879','Common','Marvel Collector Corps','Pop! Marvel','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639','Shang-Chi checklist item.'),
    ('Shang-Chi and the Legend of the Ten Rings','Marvel','Shang-Chi (Red)','Shang-Chi','843','Red',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639','Shang-Chi checklist item.'),
    ('Shang-Chi and the Legend of the Ten Rings','Marvel','Wenwu','Wenwu','847','Common',null,'Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639','Shang-Chi checklist item.'),
    ('Shang-Chi and the Legend of the Ten Rings','Marvel','Wenwu','Wenwu','851','Common',null,'Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639','Shang-Chi checklist item.'),
    ('Shang-Chi and the Legend of the Ten Rings','Marvel','Xialing','Xialing','846','Common',null,'Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639','Shang-Chi checklist item.'),
    ('Shang-Chi and the Legend of the Ten Rings','Marvel','Xialing','Xialing','880','Common','Marvel Collector Corps','Pop! Marvel','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4639','Shang-Chi checklist item.'),

    ('South Park','South Park','AWESOM-O (Masked)','AWESOM-O','25','Masked',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','AWESOM-O (Unmasked)','AWESOM-O','29','Unmasked',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Butters','Butters','01','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Cartman','Cartman','02','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Cartman (Boyband)','Cartman','37','Boyband',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Cartman (Faith + 1)','Cartman','27','Faith + 1',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Cartman Cop','Cartman','17','Cop',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Cartman with Clyde','Cartman','14','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Chef','Chef','15','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Chef (Fancy Tuxedo)','Chef','1474','Fancy Tuxedo',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Coon','Coon','07','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Craig Tucker with Stripe','Craig Tucker','1759','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Cupid Cartman','Cupid Cartman','1763','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Digital Stan (Glows in the Dark)','Digital Stan','36','Glow in the Dark',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Farmer Randy','Farmer Randy','1473','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Goth Stan','Goth Stan','13','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Grand Wizard Cartman','Grand Wizard Cartman','30','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','High Elf King Kyle','High Elf King Kyle','31','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Hippie Exterminator Cartman','Hippie Exterminator Cartman','1760','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Human Kite','Human Kite','19','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Ike Broflovski','Ike Broflovski','03','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Jimmy Valmer','Jimmy Valmer','1761','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Kenny','Kenny','16','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Kenny (Boyband)','Kenny','38','Boyband',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Kenny (Princess)','Kenny','28','Princess',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Kissing Company Butters','Kissing Company Butters','1758','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Kyle','Kyle','09','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Kyle (Boyband)','Kyle','39','Boyband',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Kyle (Jersey)','Kyle','24','Jersey',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Kyle as Tooth Decay','Kyle','35','Tooth Decay',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Marjorine (Butters)','Marjorine','23','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Mint-Berry Crunch','Mint-Berry Crunch','06','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Mr. Garrison (Specialty Series)','Mr. Garrison','18','Specialty Series',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Mr. Hankey','Mr. Hankey','21','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Mr. Mackey (Drugs are Bad)','Mr. Mackey','1476','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Mysterion','Mysterion','04','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Paladin Butters','Paladin Butters','32','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Phillip','Phillip','12','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Phillip (Canadian Flag) (Chase)','Phillip','12','Chase',null,'Pop! Animation','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Professor Chaos','Professor Chaos','10','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Randy Marsh','Randy Marsh','22','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Ranger Stan Marshwalker','Ranger Stan Marshwalker','33','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Satan (Deluxe)','Satan','1475','Common',null,'Pop! Deluxe','Deluxe',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Stan','Stan','08','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Stan (Boyband)','Stan','40','Boyband',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Stan (Shadow Hachi)','Stan','26','Shadow Hachi',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Steven McTowelie','Steven McTowelie','41','Common','South Park Shop','Pop! Animation','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Terrance','Terrance','11','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Terrance (Canadian Flag) (Chase)','Terrance','11','Chase',null,'Pop! Animation','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Timmy & Gobbles','Timmy & Gobbles','1471','Common',null,'Pop! Animation','Pop! & Buddy',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Toolshed','Toolshed','20','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Towelie (Flocked)','Towelie','34','Flocked',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Wendy Testaburger','Wendy Testaburger','1762','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Wonder Tweek','Wonder Tweek','1472','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.'),
    ('South Park','South Park','Zombie Kenny','Zombie Kenny','05','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4825&ssid=6','South Park Pop! Vinyl checklist item.')
), target_sets as (
  select id, 'Shang-Chi and the Legend of the Ten Rings'::text as canonical_name, 'Marvel'::text as franchise from shang_set
  union all
  select id, 'South Park'::text as canonical_name, 'South Park'::text as franchise from south_park_set
), matched as (
  select
    target_sets.id as set_id,
    pc.id as pop_catalog_id,
    pc.upc,
    checklist.*
  from checklist
  join target_sets on target_sets.canonical_name = checklist.set_name and target_sets.franchise = checklist.franchise_name
  left join lateral (
    select pc.id, pc.upc
    from public.pop_catalog pc
    where pc.set_name = checklist.set_name
      and pc.franchise = checklist.franchise_name
      and pc.number = checklist.number_value
      and (lower(pc.pop_name) = lower(checklist.pop_name) or lower(pc.character) = lower(checklist.character_name))
    order by case when lower(pc.pop_name) = lower(checklist.pop_name) then 0 else 1 end, pc.created_at desc nulls last
    limit 1
  ) pc on true
)
insert into public.pop_set_checklist_items (
  set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity,
  pop_type, pop_style, is_required_for_completion, source_url, confidence, notes
)
select
  set_id, pop_catalog_id, upc, pop_name, character_name, number_value, variant_value, exclusivity_value,
  pop_type_value, pop_style_value, true, source_value, confidence_value, notes_value
from matched
on conflict (set_id, coalesce(number, ''), lower(coalesce(pop_name, '')), lower(coalesce(variant, '')), lower(coalesce(exclusivity, ''))) do update set
  pop_catalog_id = coalesce(excluded.pop_catalog_id, public.pop_set_checklist_items.pop_catalog_id),
  upc = coalesce(excluded.upc, public.pop_set_checklist_items.upc),
  character = excluded.character,
  pop_type = excluded.pop_type,
  pop_style = excluded.pop_style,
  is_required_for_completion = excluded.is_required_for_completion,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  notes = excluded.notes,
  updated_at = now();

update public.pop_catalog
set
  set_total = case
    when set_name = 'Shang-Chi and the Legend of the Ten Rings' then 14
    when set_name = 'South Park' then 55
    else set_total
  end,
  needs_review = false,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  api_last_updated = now()
where (set_name = 'Shang-Chi and the Legend of the Ten Rings' and franchise = 'Marvel')
   or (set_name = 'South Park' and franchise = 'South Park');

update public.pop_catalog
set pop_name = case upc
    when '889698528801' then 'Wenwu'
    when '889698528757' then 'Shang-Chi'
    when '889698528788' then 'Katy'
    when '889698528825' then 'The Great Protector (6" Scale)'
    when '889698554213' then 'Shang-Chi'
    when '889698554220' then 'Xialing'
    else pop_name
  end,
  character = case upc
    when '889698528825' then 'The Great Protector'
    when '889698554220' then 'Xialing'
    else character
  end,
  number = case upc
    when '889698528801' then '847'
    when '889698528757' then '844'
    when '889698528788' then '845'
    when '889698528825' then '850'
    when '889698554213' then '879'
    when '889698554220' then '880'
    else number
  end,
  exclusivity = case upc
    when '889698554213' then 'Marvel Collector Corps'
    when '889698554220' then 'Marvel Collector Corps'
    else exclusivity
  end,
  pop_type = case upc
    when '889698528825' then 'Pop! Super'
    else 'Pop! Marvel'
  end,
  pop_style = case upc
    when '889698528825' then 'Jumbo'
    else 'Standard'
  end,
  set_total = 14,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.92),
  needs_review = false,
  api_last_updated = now()
where upc in ('889698528801','889698528757','889698528788','889698528825','889698554213','889698554220');

update public.pop_catalog
set pop_name = case upc
    when '889698516365' then 'AWESOM-O (Masked)'
    when '889698518444' then 'AWESOM-O (Unmasked)'
    when '889698516358' then 'Kyle (Jersey)'
    else pop_name
  end,
  character = case upc
    when '889698516365' then 'AWESOM-O'
    when '889698518444' then 'AWESOM-O'
    when '889698516358' then 'Kyle'
    else character
  end,
  variant = case upc
    when '889698516365' then 'Masked'
    when '889698518444' then 'Unmasked'
    when '889698516358' then 'Jersey'
    else variant
  end,
  set_total = 55,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  api_last_updated = now()
where upc in ('889698516365','889698518444','889698516358');

select
  ps.canonical_name,
  ps.status,
  ps.confidence,
  count(pci.id) as checklist_rows,
  count(pci.id) filter (where pci.is_required_for_completion) as required_rows,
  count(pci.pop_catalog_id) as linked_catalog_rows
from public.pop_sets ps
left join public.pop_set_checklist_items pci on pci.set_id = ps.id
where (ps.canonical_name = 'Shang-Chi and the Legend of the Ten Rings' and ps.franchise = 'Marvel')
   or (ps.canonical_name = 'South Park' and ps.franchise = 'South Park')
   or (ps.canonical_name = 'The Office' and ps.franchise = 'The Office')
group by ps.canonical_name, ps.status, ps.confidence
order by ps.canonical_name;
