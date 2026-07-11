-- Rick and Morty reviewed checklist load, 2026-07-08.
-- Scope: promote the existing draft Rick and Morty set to reviewed after extracting
-- the full 99-row FigureRealm Pop! Vinyl Figures checklist.
--
-- Source:
--   https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4365&ssid=10
--
-- Live expectations:
--   * pop_sets Rick and Morty -> reviewed, confidence 0.88.
--   * pop_set_checklist_items -> 99 required rows.
--   * Existing Rick and Morty catalog rows keep set_total = 99.
--   * No ownership quantities, paid values, or current values are changed.

with upsert_set as (
  insert into public.pop_sets (
    canonical_name,
    franchise,
    status,
    source_label,
    source_url,
    confidence,
    reviewed_at,
    notes
  )
  values (
    'Rick and Morty',
    'Rick and Morty',
    'reviewed',
    'FigureRealm Rick and Morty Pop! Vinyl Figures checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4365&ssid=10',
    0.88,
    now(),
    'FigureRealm Pop! Vinyl Figures subseries lists 99 Rick and Morty rows across three pages. Completion denominator is 99.'
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
), clear_prior_checklist as (
  delete from public.pop_set_checklist_items
  where set_id in (select id from upsert_set)
  returning id
), raw_items(title) as (
  select unnest(array[
    'Alien Morty #338',
    'Alien Rick #337',
    'Balthromaw (Deluxe) #957',
    'Berserker Squanchy #568',
    'Beth #301',
    'Birdperson #176',
    'Cornvelious Daniel (Bloody) #334',
    'Death Crystal Morty #660',
    'Doofus Rick #140',
    'Dr. Xenon Bloom (Glows In The Dark) #570',
    'Evil Morty #141',
    'Exoskeleton Snowball (Deluxe) #569',
    'Floating Death Crystal Morty #664',
    'Froopyland Beth #442',
    'Gamer Rick #741',
    'Gearhead #438',
    'Glootie #575',
    'Hemorrhage #342',
    'Hologram Rick Clone #659',
    'Hologram Rick Clone (Glows In The Dark) #667',
    'Hologram Rick Clone (Glows In The Dark) #666',
    'Hologram Rick Clone (Glows In The Dark) #665',
    'Hospice Morty #693',
    'Jaguar #488',
    'Jerry #302',
    'Kiara #443',
    'King of S#!+ (with Sound) #694',
    'Kirkland Meeseeks #661',
    'Krombopulos Michael #264',
    'Lawyer Morty #304',
    'Morty #113',
    'Morty (Blips and Chitz) #417',
    'Morty with Glorzo #954',
    'Morty with Laptop #742',
    'Morty with Shrunken Rick #958',
    'Mr. Meeseeks #174',
    'Mr. Meeseeks (Chase) #174',
    'Mr. Meeseeks with Meeseeks Box #180',
    'Mr. Poopy Butthole #177',
    'Mr. Poopy Butthole (Bloody) #206',
    'Mr. Poopy Butthole Auctioneer #691',
    'Noob Noob #441',
    'Pickle Rick #350',
    'Pickle Rick (Glows In The Dark) #350',
    'Pickle Rick (Rat Suit) #333',
    'Pickle Rick (Rat Suit) (Translucent) #333',
    'Pickle Rick with Laser #332',
    'Prison Break Rick #339',
    'Purge Suit Morty #567',
    'Purge Suit Rick #566',
    'Queen Summer #955',
    'Resistance Goldenfold #571',
    'Rick #112',
    'Rick (Blips and Chitz) #416',
    'Rick (Facehugger) #343',
    'Rick (with Memory Vial) #1191',
    'Rick with Crown #649',
    'Rick with Crystal Skull #692',
    'Rick with Funnel Hat #959',
    'Rick with Glorzo #956',
    'Rick with Portal Gun #114',
    'Rick with Portal Gun (Jumbo) #665',
    'Roy #418',
    'Scary Terry #300',
    'Scary Terry #344',
    'Scary Terry (Blacklight) #300',
    'Schwifty Morty #573',
    'Schwifty Rick #572',
    'Sentient Arm Morty #340',
    'Sentient Arm Morty (Chase) (Bloody) #340',
    'Shrimp Morty #645',
    'Shrimp Rick #644',
    'Slick Morty #440',
    'Snowball #178',
    'Snowball (Flocked) #178',
    'Space Suit Morty (with Snake) #690',
    'Space Suit Rick (with Snake) #689',
    'Squanchy #175',
    'Squanchy with Rope #346',
    'Story Train Evil Morty #953',
    'Summer #303',
    'Teacher Rick #439',
    'Teddy Rick #662',
    'Teddy Rick (Chase) (Bloody) #662',
    'Tinkles / Ghost In a Jar #256',
    'Tiny Rick #489',
    'Tony #650',
    'Toxic Morty (Glows In The Dark) #336',
    'Toxic Rick (Glows In The Dark) #335',
    'Tracksuit Jerry #574',
    'Unity #444',
    'Warrior Summer #341',
    'Wasp Rick #663',
    'Weaponized Morty #173',
    'Weaponized Rick #172',
    'Weaponized Rick (Chase) #172',
    'Western Morty #364',
    'Western Rick #363',
    'Young Rick #305'
  ])
), parsed as (
  select
    trim(regexp_replace(title, '\s+#\d+$', '')) as pop_name,
    trim(regexp_replace(regexp_replace(title, '\s+#\d+$', ''), '\s+\([^)]*\)', '', 'g')) as character_name,
    substring(title from '#([0-9]+)$') as number_value,
    case
      when title ilike '%Glows In The Dark%' or title ilike '%Glow in the Dark%' then 'Glow in the Dark'
      when title ilike '%Chase%' and title ilike '%Bloody%' then 'Bloody Chase'
      when title ilike '%Chase%' then 'Chase'
      when title ilike '%Bloody%' then 'Bloody'
      when title ilike '%Flocked%' then 'Flocked'
      when title ilike '%Translucent%' then 'Translucent'
      when title ilike '%Blacklight%' then 'Blacklight'
      when title ilike '%with Sound%' then 'With Sound'
      else 'Common'
    end as variant_value,
    null::text as exclusivity_value,
    case
      when title ilike '%Deluxe%' then 'Pop! Deluxe'
      when title ilike '%Jumbo%' then 'Pop! Jumbo'
      else 'Pop! Animation'
    end as pop_type_value,
    case
      when title ilike '%Deluxe%' then 'Deluxe'
      when title ilike '%Jumbo%' then 'Jumbo'
      else 'Standard'
    end as pop_style_value
  from raw_items
), matched as (
  select
    upsert_set.id as set_id,
    pc.id as pop_catalog_id,
    pc.upc,
    parsed.*
  from parsed
  cross join upsert_set
  left join lateral (
    select pc.id, pc.upc
    from public.pop_catalog pc
    where (pc.franchise = 'Rick and Morty' or pc.set_name = 'Rick and Morty')
      and pc.number = parsed.number_value
      and (
        lower(pc.pop_name) = lower(parsed.pop_name)
        or lower(pc.character) = lower(parsed.character_name)
      )
    order by
      case when lower(pc.pop_name) = lower(parsed.pop_name) then 0 else 1 end,
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
  'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4365&ssid=10',
  0.88::numeric,
  'Rick and Morty FigureRealm Pop! Vinyl Figures checklist item.'
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
  set_name = 'Rick and Morty',
  franchise = 'Rick and Morty',
  pop_type = coalesce(pop_type, 'Pop! Animation'),
  pop_style = coalesce(pop_style, 'Standard'),
  set_total = 99,
  needs_review = false,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  api_last_updated = now()
where franchise = 'Rick and Morty'
   or set_name = 'Rick and Morty';

select
  ps.canonical_name,
  ps.status,
  ps.confidence,
  ps.reviewed_at is not null as reviewed_at_set,
  count(pci.id) as checklist_rows,
  count(pci.pop_catalog_id) as linked_catalog_rows,
  count(*) filter (where pci.is_required_for_completion) as required_rows
from public.pop_sets ps
left join public.pop_set_checklist_items pci on pci.set_id = ps.id
where ps.canonical_name = 'Rick and Morty'
  and ps.franchise = 'Rick and Morty'
group by ps.canonical_name, ps.status, ps.confidence, ps.reviewed_at;
