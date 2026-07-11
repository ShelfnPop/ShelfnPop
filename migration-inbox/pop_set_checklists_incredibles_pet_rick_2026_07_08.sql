-- Audit note: Incredibles 2, Pet Sematary, and Rick and Morty cleanup batch, applied 2026-07-08.
-- Sources:
--   FigureRealm Incredibles 2 Pop! checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2
--   FigureRealm Incredibles full checklist for 20th Anniversary placement:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621
--   FigureRealm Pet Sematary checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3957
--   FigureRealm Rick and Morty checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4365
--
-- Live changes made:
--   * Corrected owned/catalog rows for Incredibles 2, Pet Sematary, and Rick and Morty.
--   * Moved JJ & Syndrome #1506 from Incredibles 2 to The Incredibles 20th Anniversary.
--   * Loaded reviewed checklist rows for Incredibles 2 (19) and Pet Sematary (5).
--   * Stored Rick and Morty as draft with a 99 Pop! Vinyl Figure source count; full checklist extraction is deferred.

update public.pop_catalog
set
  pop_name = case upc
    when '889698809481' then 'JJ & Syndrome (20th Anniversary)'
    when '889698292009' then 'Mr. Incredible'
    when '889698314329' then 'Jack-Jack (Metallic Chrome)'
    when '889698292054' then 'Monster Jack-Jack'
    when '889698299541' then 'Jack-Jack (Edna)'
    when '889698291989' then 'Elastigirl (Outfit Upgrade)'
    when '889698370202' then 'Voyd'
    when '889698581868' then 'Gage & Church'
    when '889698552509' then 'Rick with Glorzo'
    when '889698477918' then 'Morty with Laptop'
    else pop_name
  end,
  character = case upc
    when '889698809481' then 'JJ & Syndrome'
    when '889698292009' then 'Mr. Incredible'
    when '889698314329' then 'Jack-Jack'
    when '889698292054' then 'Jack-Jack'
    when '889698299541' then 'Jack-Jack'
    when '889698291989' then 'Elastigirl'
    when '889698370202' then 'Voyd'
    when '889698581868' then 'Gage & Church'
    when '889698552509' then 'Rick'
    when '889698477918' then 'Morty'
    else character
  end,
  set_name = case
    when upc = '889698809481' then 'The Incredibles 20th Anniversary'
    when upc in (
      '889698292009','889698291996','889698292016','889698292023','889698314329',
      '889698292030','889698292085','889698292054','889698299541','889698291989','889698370202'
    ) then 'Incredibles 2'
    when upc in ('889698581868','889698807128','889698807135') then 'Pet Sematary'
    when franchise = 'Rick and Morty' or lower(coalesce(set_name, '')) in ('rick and morty', 'rick & morty') then 'Rick and Morty'
    else set_name
  end,
  number = case upc
    when '889698809481' then '1506'
    when '889698292009' then '363'
    when '889698291996' then '364'
    when '889698292016' then '365'
    when '889698292023' then '366'
    when '889698314329' then '367'
    when '889698292030' then '367'
    when '889698292085' then '370'
    when '889698292054' then '401'
    when '889698299541' then '404'
    when '889698291989' then '403'
    when '889698370202' then '509'
    when '889698581868' then '729'
    when '889698807128' then '1585'
    when '889698807135' then '1586'
    when '889698552509' then '956'
    when '889698477918' then '742'
    else number
  end,
  variant = case upc
    when '889698314329' then 'Metallic Chrome'
    when '889698581868' then 'Glow in the Dark'
    else variant
  end,
  exclusivity = case upc
    when '889698292023' then null
    when '889698292054' then 'Funko Shop'
    when '889698314329' then 'Exclusive'
    when '889698299541' then 'Summer Convention'
    when '889698291989' then 'Exclusive'
    when '889698370202' then 'Emerald City Comic Con'
    when '889698581868' then 'Exclusive'
    when '889698477918' then 'GameStop'
    else exclusivity
  end,
  pop_type = case
    when upc in (
      '889698809481','889698292009','889698291996','889698292016','889698292023',
      '889698314329','889698292030','889698292085','889698292054','889698299541',
      '889698291989','889698370202'
    ) then 'Pop! Disney'
    when upc in ('889698581868','889698807128','889698807135') then 'Pop! Movies'
    when franchise = 'Rick and Morty' or lower(coalesce(set_name, '')) in ('rick and morty', 'rick & morty') then 'Pop! Animation'
    else pop_type
  end,
  pop_style = coalesce(pop_style, 'Standard'),
  set_total = case
    when upc = '889698809481' then null
    when upc in (
      '889698292009','889698291996','889698292016','889698292023','889698314329',
      '889698292030','889698292085','889698292054','889698299541','889698291989','889698370202'
    ) then 19
    when upc in ('889698581868','889698807128','889698807135') then 5
    when franchise = 'Rick and Morty' or lower(coalesce(set_name, '')) in ('rick and morty', 'rick & morty') then 99
    else set_total
  end,
  release_date = case upc
    when '889698809481' then '2024-01-01'::date
    when '889698292009' then '2018-01-01'::date
    when '889698291996' then '2018-01-01'::date
    when '889698292016' then '2018-01-01'::date
    when '889698292023' then '2018-01-01'::date
    when '889698314329' then '2018-01-01'::date
    when '889698292030' then '2018-01-01'::date
    when '889698292085' then '2018-01-01'::date
    when '889698292054' then '2018-01-01'::date
    when '889698299541' then '2018-01-01'::date
    when '889698291989' then '2018-01-01'::date
    when '889698370202' then '2019-01-01'::date
    when '889698581868' then '2021-01-01'::date
    when '889698807128' then '2024-01-01'::date
    when '889698807135' then '2024-01-01'::date
    when '889698552509' then '2021-01-01'::date
    when '889698477918' then '2020-01-01'::date
    else release_date
  end,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false
where upc in (
  '889698809481','889698292009','889698291996','889698292016','889698292023',
  '889698314329','889698292030','889698292085','889698292054','889698299541',
  '889698291989','889698370202','889698581868','889698807128','889698807135',
  '889698552509','889698355940','889698355957','889698403856','889698403863',
  '889698453028','889698454360','889698477918'
);

with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values
    (
      'Incredibles 2',
      'Disney',
      'reviewed',
      'FigureRealm Incredibles 2 Pop! checklist',
      'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2',
      0.90,
      now(),
      'FigureRealm lists 19 Incredibles 2 Pop! rows. JJ & Syndrome #1506 was moved to The Incredibles 20th Anniversary and excluded from this total.'
    ),
    (
      'Pet Sematary',
      'Pet Sematary',
      'reviewed',
      'FigureRealm Pet Sematary checklist',
      'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3957',
      0.94,
      now(),
      'FigureRealm lists 5 Pet Sematary Pop! Vinyl Figure rows.'
    ),
    (
      'Rick and Morty',
      'Rick and Morty',
      'draft',
      'FigureRealm Rick and Morty subseries count',
      'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4365',
      0.80,
      null,
      'FigureRealm reports 99 Rick and Morty Pop! Vinyl Figure rows; full checklist extraction is deferred.'
    )
  on conflict (canonical_name, franchise) do update set
    status = excluded.status,
    source_label = excluded.source_label,
    source_url = excluded.source_url,
    confidence = excluded.confidence,
    reviewed_at = excluded.reviewed_at,
    notes = excluded.notes,
    updated_at = now()
  returning id, canonical_name
), checklist(set_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, confidence_value, source_value, notes_value) as (
  values
    ('Incredibles 2', 'Dash', 'Dash', '366', 'Common', null, 'Pop! Disney', 'Standard', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Elastigirl', 'Elastigirl', '364', 'Common', null, 'Pop! Disney', 'Standard', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Elastigirl (Outfit Upgrade)', 'Elastigirl', '403', 'Common', 'Exclusive', 'Pop! Disney', 'Standard', 0.88::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item; exclusivity retained from owned row.'),
    ('Incredibles 2', 'Elastigirl on Elasticycle (Deluxe) (Rides)', 'Elastigirl', '45', 'Common', null, 'Pop! Rides', 'Ride', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Fire Jack-Jack', 'Jack-Jack', '402', 'Common', null, 'Pop! Disney', 'Standard', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Frozone', 'Frozone', '368', 'Common', null, 'Pop! Disney', 'Standard', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Jack-Jack', 'Jack-Jack', '367', 'Common', null, 'Pop! Disney', 'Standard', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Jack-Jack (10" Scale)', 'Jack-Jack', '494', 'Common', null, 'Pop! Jumbo', 'Jumbo', 0.88::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Jack-Jack (Diaper)', 'Jack-Jack', '405', 'Common', null, 'Pop! Disney', 'Standard', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Jack-Jack (Edna)', 'Jack-Jack', '404', 'Common', 'Summer Convention', 'Pop! Disney', 'Standard', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Jack-Jack (Metallic Chrome)', 'Jack-Jack', '367', 'Metallic Chrome', 'Exclusive', 'Pop! Disney', 'Standard', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Jack-Jack (San Francisco Giants)', 'Jack-Jack', '367', 'San Francisco Giants', null, 'Pop! Disney', 'Standard', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Monster Jack-Jack', 'Jack-Jack', '401', 'Common', 'Funko Shop', 'Pop! Disney', 'Standard', 0.88::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item; Funko Shop retained from owned row.'),
    ('Incredibles 2', 'Mr. Incredible', 'Mr. Incredible', '363', 'Common', null, 'Pop! Disney', 'Standard', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Screenslaver', 'Screenslaver', '369', 'Common', null, 'Pop! Disney', 'Standard', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Underminer', 'Underminer', '370', 'Common', null, 'Pop! Disney', 'Standard', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Violet', 'Violet', '365', 'Common', null, 'Pop! Disney', 'Standard', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Violet (Invisible) (Chase)', 'Violet', '365', 'Chase', null, 'Pop! Disney', 'Standard', 0.90::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item.'),
    ('Incredibles 2', 'Voyd', 'Voyd', '509', 'Common', 'Emerald City Comic Con', 'Pop! Disney', 'Standard', 0.88::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2', 'Incredibles 2 checklist item; ECCC retained from owned row.'),
    ('Pet Sematary', 'Ellie & Church', 'Ellie & Church', '1584', 'Common', null, 'Pop! Movies', 'Standard', 0.94::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3957', 'Pet Sematary checklist item.'),
    ('Pet Sematary', 'Gage & Church', 'Gage & Church', '729', 'Common', null, 'Pop! Movies', 'Standard', 0.94::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3957', 'Pet Sematary checklist item.'),
    ('Pet Sematary', 'Gage & Church', 'Gage & Church', '729', 'Glow in the Dark', 'Exclusive', 'Pop! Movies', 'Standard', 0.92::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3957', 'Pet Sematary checklist item.'),
    ('Pet Sematary', 'Gage Creed', 'Gage Creed', '1585', 'Common', null, 'Pop! Movies', 'Standard', 0.94::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3957', 'Pet Sematary checklist item.'),
    ('Pet Sematary', 'Victor Pascow', 'Victor Pascow', '1586', 'Common', null, 'Pop! Movies', 'Standard', 0.94::numeric, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3957', 'Pet Sematary checklist item.')
), matched as (
  select
    upsert_sets.id as set_id,
    pc.id as pop_catalog_id,
    pc.upc,
    checklist.*
  from checklist
  join upsert_sets on upsert_sets.canonical_name = checklist.set_name
  left join lateral (
    select pc.id, pc.upc
    from public.pop_catalog pc
    where lower(pc.set_name) = lower(checklist.set_name)
      and pc.number = checklist.number_value
      and (
        lower(coalesce(pc.pop_name, pc.character, '')) = lower(checklist.pop_name)
        or lower(coalesce(pc.character, pc.pop_name, '')) = lower(checklist.character_name)
        or lower(coalesce(pc.pop_name, pc.character, '')) like lower(checklist.character_name || '%')
      )
    order by
      case when lower(coalesce(pc.variant, 'Common')) = lower(coalesce(checklist.variant_value, 'Common')) then 0 else 1 end,
      pc.created_at desc nulls last
    limit 1
  ) pc on true
)
insert into public.pop_set_checklist_items (
  set_id,
  pop_catalog_id,
  upc,
  pop_name,
  character,
  number,
  variant,
  exclusivity,
  pop_type,
  pop_style,
  is_required_for_completion,
  source_url,
  confidence,
  notes
)
select
  set_id,
  pop_catalog_id,
  upc,
  pop_name,
  character_name,
  number_value,
  variant_value,
  exclusivity_value,
  pop_type_value,
  pop_style_value,
  true,
  source_value,
  confidence_value,
  notes_value
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
