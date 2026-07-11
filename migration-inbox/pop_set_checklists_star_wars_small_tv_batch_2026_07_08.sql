-- Star Wars small TV set checklist pass, applied 2026-07-08.
-- Sources:
--   Ahsoka: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5037
--   The Book of Boba Fett: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5051
--   Obi-Wan Kenobi: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5099&ssid=2
--   Skeleton Crew: https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=starwarsskeletoncrewfunko&id=5130

update public.pop_catalog
set
  pop_name = 'Obi-Wan Kenobi',
  character = 'Obi-Wan Kenobi',
  number = '536',
  variant = 'Art Series',
  exclusivity = 'Target',
  pop_style = 'Art Series',
  display_description = 'Obi-Wan Kenobi belongs to the Obi-Wan Kenobi Pop! Star Wars line as #536. This catalog entry tracks the Art Series format, Target exclusive. Released in 2022.'
where upc = '889698650960';

update public.pop_catalog
set
  pop_name = 'Wim',
  character = 'Wim',
  display_description = 'Wim belongs to the Skeleton Crew Pop! Star Wars line as #699. Released in 2024.'
where upc = '889698767347';

update public.pop_catalog
set
  variant = null,
  exclusivity = 'Funko Shop',
  display_description = 'Kh''ymm belongs to the Skeleton Crew Pop! Star Wars line as #731. This catalog entry tracks the Funko Shop exclusive. Released in 2024.'
where upc = '889698768382';

update public.pop_catalog
set
  pop_name = 'The Mandalorian (with Pouch)',
  character = 'The Mandalorian',
  variant = 'With Pouch',
  display_description = 'The Mandalorian belongs to The Book of Boba Fett Pop! Star Wars line as #585. This catalog entry tracks the With Pouch variant. Released in 2022.'
where upc = '889698686549';

update public.pop_catalog
set
  pop_name = 'Ezra Bridger (Lightsaber)',
  character = 'Ezra Bridger',
  variant = 'Lightsaber',
  display_description = 'Ezra Bridger belongs to the Ahsoka Pop! Star Wars line as #752. This catalog entry tracks the Lightsaber variant. Released in 2024.'
where upc = '889698837620';

update public.pop_catalog
set set_total = case
  when set_name = 'Ahsoka' then 23
  when set_name = 'The Book of Boba Fett' then 13
  when set_name = 'Obi-Wan Kenobi' then 24
  when set_name = 'Skeleton Crew' then 6
  else set_total
end
where franchise = 'Star Wars'
  and set_name in ('Ahsoka', 'The Book of Boba Fett', 'Obi-Wan Kenobi', 'Skeleton Crew');

with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values
    ('Ahsoka', 'Star Wars', 'reviewed', 'FigureRealm Star Wars - Ahsoka Pop! Vinyl checklist', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5037', 0.86, now(), 'FigureRealm page shows 28 total items including Pocket Keychains; this Pop-only checklist uses the 23 Pop! Vinyl Figures rows.'),
    ('The Book of Boba Fett', 'Star Wars', 'reviewed', 'FigureRealm Star Wars - Book of Boba Fett checklist', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5051', 0.90, now(), 'Checklist extraction shows 13 Pop! Vinyl Figure rows.'),
    ('Obi-Wan Kenobi', 'Star Wars', 'reviewed', 'FigureRealm Star Wars - Obi Wan Kenobi Pop! Vinyl checklist', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5099&ssid=2', 0.90, now(), 'Checklist extraction shows 24 Pop! Vinyl Figure rows.'),
    ('Skeleton Crew', 'Star Wars', 'reviewed', 'FigureRealm Star Wars - Skeleton Crew checklist', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=starwarsskeletoncrewfunko&id=5130', 0.92, now(), 'Checklist extraction shows 6 Pop! Vinyl Figure rows.')
  on conflict (canonical_name, franchise) do update set
    status = excluded.status,
    source_label = excluded.source_label,
    source_url = excluded.source_url,
    confidence = excluded.confidence,
    reviewed_at = excluded.reviewed_at,
    notes = excluded.notes,
    updated_at = now()
  returning id, canonical_name
), raw_items(set_name, source_url, title) as (
  select 'Ahsoka', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5037', unnest(array[
    '332nd Company Trooper #681',
    'Ahsoka Tano #650',
    'Ahsoka Tano (Dual Lightsabers) #680',
    'Ahsoka Tano (Lightsabers) #749',
    'Anakin Skywalker (Lightsaber) #751',
    'Baylan Skoll #688',
    'C1-10P (Chopper) #654',
    'Captain Enoch #690',
    'Clone Trooper (Phase 1) #689',
    'Ezra Bridger (Lightsaber) #752',
    'General Hera Syndulla #653',
    'Grand Admiral Thrawn #683',
    'Grand Admiral Thrawn #697',
    'Grand Admiral Thrawn (Diamond Collection) #697',
    'Loth Cat (Diamond Collection) #799',
    'Marrok #651',
    'Morgan Elsbeth #684',
    'Professor Huyang #652',
    'Sabine Wren #655',
    'Sabine Wren (Lightsaber) #750',
    'Shin Hati #687',
    'Thrawn''s Night Trooper #685',
    'Thrawn''s Night Trooper (Blue Mouthpiece) #686'
  ])
  union all
  select 'The Book of Boba Fett', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5051', unnest(array[
    'Boba Fett #480',
    'Boba Fett (Kneepad Rockets) #734',
    'Boba Fett (Red Chrome) #462',
    'Boba Fett (Retro) #769',
    'Cad Bane #580',
    'Fennec Shand #481',
    'Grogu with Armor #584',
    'Grogu with Rancor #587',
    'Krrsantan #581',
    'Krrsantan (Flocked) #548',
    'Luke Skywalker & Grogu #583',
    'Majordomo #582',
    'Mandalorian (with Pouch) #585'
  ])
  union all
  select 'Obi-Wan Kenobi', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5099&ssid=2', unnest(array[
    'Ben Kenobi on Eopie (Deluxe) #549',
    'Darth Vader #539',
    'Darth Vader (Art Series) #535',
    'Darth Vader (Damaged Helmet) #637',
    'Darth Vader (Fighting Pose) #543',
    'Darth Vader on Throne (Deluxe) #745',
    'Fifth Brother #630',
    'Grand Inquisitor #631',
    'Haja Estree #545',
    'Kawlan Roken #540',
    'Ned-B #634',
    'Obi-Wan Kenobi #538',
    'Obi-Wan Kenobi #544',
    'Obi-Wan Kenobi #629',
    'Obi-Wan Kenobi (Art Series) #536',
    'Power of the Galaxy: Sabine Wren #547',
    'Purge Trooper #533',
    'Purge Trooper #635',
    'Purge Trooper (Battle Pose) #632',
    'Reva (Third Sister) #542',
    'Reva (Third Sister) #546',
    'Tala Durith #541',
    'Young Leia (with Lola) #659',
    'Young Luke Skywalker #633'
  ])
  union all
  select 'Skeleton Crew', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=starwarsskeletoncrewfunko&id=5130', unnest(array[
    'Fern #700',
    'Jod #698',
    'KB #701',
    'Kh''ymm #731',
    'Neel #702',
    'Wim #699'
  ])
), parsed as (
  select
    upsert_sets.id as set_id,
    raw_items.set_name,
    raw_items.source_url,
    regexp_replace(raw_items.title, '\s+#\d+\s*$', '') as pop_name,
    regexp_replace(regexp_replace(raw_items.title, '\s+#\d+\s*$', ''), '\s+\([^)]*\)$', '') as character_name,
    regexp_replace(raw_items.title, '^.*#([0-9]+)\s*$', '\1') as number_value,
    case
      when raw_items.title ilike '%Diamond Collection%' then 'Diamond Collection'
      when raw_items.title ilike '%Flocked%' then 'Flocked'
      when raw_items.title ilike '%Art Series%' then 'Art Series'
      when raw_items.title ilike '%Retro%' then 'Retro'
      when raw_items.title ilike '%Lightsaber%' then 'Lightsaber'
      when raw_items.title ilike '%Blue Mouthpiece%' then 'Blue Mouthpiece'
      when raw_items.title ilike '%Red Chrome%' then 'Red Chrome'
      when raw_items.title ilike '%Kneepad Rockets%' then 'Kneepad Rockets'
      when raw_items.title ilike '%With Pouch%' then 'With Pouch'
      else 'Common'
    end as variant_value,
    case
      when raw_items.title ilike '%Deluxe%' or raw_items.title ilike '%on Eopie%' or raw_items.title ilike '%on Throne%' then 'Deluxe'
      else 'Standard'
    end as pop_style_value
  from raw_items
  join upsert_sets on upsert_sets.canonical_name = raw_items.set_name
), matched as (
  select
    parsed.*,
    pc.id as pop_catalog_id
  from parsed
  left join lateral (
    select pc.id
    from public.pop_catalog pc
    where lower(pc.set_name) = lower(parsed.set_name)
      and ltrim(coalesce(pc.number, ''), '0') = ltrim(parsed.number_value, '0')
      and (
        lower(coalesce(pc.pop_name, pc.character, '')) = lower(parsed.pop_name)
        or lower(coalesce(pc.character, pc.pop_name, '')) = lower(parsed.character_name)
        or lower(coalesce(pc.pop_name, pc.character, '')) like lower(parsed.character_name || '%')
      )
    order by
      case when lower(coalesce(pc.variant, 'Common')) = lower(coalesce(parsed.variant_value, 'Common')) then 0 else 1 end,
      pc.created_at desc nulls last
    limit 1
  ) pc on true
)
insert into public.pop_set_checklist_items (
  set_id,
  pop_catalog_id,
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
  pop_name,
  character_name,
  number_value,
  variant_value,
  null,
  'Pop! Star Wars',
  pop_style_value,
  true,
  source_url,
  0.90,
  set_name || ' checklist item.'
from matched
on conflict (set_id, coalesce(number, ''), lower(coalesce(pop_name, '')), lower(coalesce(variant, '')), lower(coalesce(exclusivity, ''))) do update set
  pop_catalog_id = coalesce(excluded.pop_catalog_id, public.pop_set_checklist_items.pop_catalog_id),
  character = excluded.character,
  pop_type = excluded.pop_type,
  pop_style = excluded.pop_style,
  is_required_for_completion = excluded.is_required_for_completion,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  notes = excluded.notes,
  updated_at = now();
