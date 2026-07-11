-- Audit note: Avengers: Age of Ultron, Ant-Man, and Invincible cleanup batch, applied 2026-07-08.
-- Sources:
--   FigureRealm Avengers Age of Ultron Pop! checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1
--   FigureRealm Ant-Man Pop! Vinyl Figures checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=4
--   FigureRealm Ant-Man and the Wasp Pop! checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=1
--   FigureRealm Ant-Man & The Wasp: Quantumania checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=280
--   FigureRealm Invincible Pop! Vinyl Figures checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2
--
-- Live changes made:
--   * Loaded reviewed checklist rows for Avengers: Age of Ultron (19), Ant-Man (7), Ant-Man and the Wasp (12),
--     Ant-Man & The Wasp: Quantumania (10), and Invincible (16).
--   * Corrected original Ant-Man rows that were incorrectly assigned to Quantumania.
--   * Corrected Ghost (Invisible) from Ant-Man and the Wasp.
--   * Corrected Allen to Allen the Alien (Bloody).

update public.pop_catalog
set
  pop_name = case upc
    when '849803055790' then 'Hulk (Savage)'
    when '849803049621' then 'Yellowjacket'
    when '849803059712' then 'Ant-Man (Black Out)'
    when '889698307475' then 'Ghost (Invisible)'
    when '889698918275' then 'Allen the Alien (Bloody)'
    else pop_name
  end,
  character = case upc
    when '849803055790' then 'Hulk'
    when '849803049621' then 'Yellowjacket'
    when '849803059712' then 'Ant-Man'
    when '889698307475' then 'Ghost'
    when '889698918275' then 'Allen the Alien'
    else character
  end,
  set_name = case
    when upc in ('849803049638','849803049621','849803059712') then 'Ant-Man'
    when upc = '889698307475' then 'Ant-Man and the Wasp'
    when upc in ('889698704908','889698706780') then 'Ant-Man & The Wasp: Quantumania'
    else set_name
  end,
  number = case upc
    when '849803049638' then '85'
    when '849803059712' then '85'
    when '849803049621' then '86'
    when '889698307475' then '345'
    when '889698918275' then '1863'
    else number
  end,
  variant = case upc
    when '849803055790' then 'Savage'
    when '849803059712' then 'Black Out'
    when '889698307475' then 'Invisible'
    when '889698918275' then 'Bloody'
    else variant
  end,
  exclusivity = case upc
    when '889698307475' then 'Walmart'
    when '889698918275' then 'Funko Shop'
    else exclusivity
  end,
  pop_type = case
    when upc in ('849803047771','849803055790','849803047801','849803047818','849803047825','849803047757','849803056063','849803047931','849803047795','849803049638','849803049621','849803059712','889698307475','889698704908','889698706780') then 'Pop! Marvel'
    when upc = '889698918275' then 'Pop! Animation'
    else pop_type
  end,
  pop_style = coalesce(pop_style, 'Standard'),
  set_total = case
    when set_name = 'Avengers: Age of Ultron' or upc in ('849803047771','849803055790','849803047801','849803047818','849803047825','849803047757','849803056063','849803047931','849803047795') then 19
    when upc in ('849803049638','849803049621','849803059712') then 7
    when upc = '889698307475' then 12
    when upc in ('889698704908','889698706780') then 10
    when upc = '889698918275' then 16
    else set_total
  end,
  release_date = case upc
    when '849803047771' then '2015-01-01'::date
    when '849803055790' then '2015-01-01'::date
    when '849803047801' then '2015-01-01'::date
    when '849803047818' then '2015-01-01'::date
    when '849803047825' then '2015-01-01'::date
    when '849803047757' then '2015-01-01'::date
    when '849803056063' then '2015-01-01'::date
    when '849803047931' then '2015-01-01'::date
    when '849803047795' then '2015-01-01'::date
    when '849803049638' then '2015-01-01'::date
    when '849803049621' then '2015-01-01'::date
    when '849803059712' then '2015-01-01'::date
    when '889698307475' then '2018-01-01'::date
    when '889698704908' then '2022-01-01'::date
    when '889698706780' then '2023-01-01'::date
    when '889698918275' then '2025-01-01'::date
    else release_date
  end,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false
where upc in (
  '849803047771','849803055790','849803047801','849803047818','849803047825',
  '849803047757','849803056063','849803047931','849803047795','849803049638',
  '849803049621','849803059712','889698307475','889698704908','889698706780',
  '889698918275'
);

with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values
    ('Avengers: Age of Ultron','Marvel','reviewed','FigureRealm Avengers Age of Ultron Pop! checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1',0.90,now(),'FigureRealm lists 19 Avengers Age of Ultron Pop! rows.'),
    ('Ant-Man','Marvel','reviewed','FigureRealm Ant-Man Pop! Vinyl Figures checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=4',0.92,now(),'FigureRealm lists 7 Ant-Man Pop! Vinyl Figure rows.'),
    ('Ant-Man and the Wasp','Marvel','reviewed','FigureRealm Ant-Man and the Wasp Pop! checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=1',0.90,now(),'FigureRealm lists 12 Ant-Man and the Wasp Pop! rows.'),
    ('Ant-Man & The Wasp: Quantumania','Marvel','reviewed','FigureRealm Ant-Man & The Wasp: Quantumania checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=280',0.90,now(),'FigureRealm lists 10 Ant-Man & The Wasp: Quantumania Pop! Vinyl Figure rows, excluding Pop! Moments and keychains.'),
    ('Invincible','Invincible','reviewed','FigureRealm Invincible Pop! Vinyl Figures checklist','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2',0.90,now(),'FigureRealm lists 16 Invincible Pop! Vinyl Figure rows.')
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
    ('Avengers: Age of Ultron','Black Widow','Black Widow','91','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Black Widow (Cap Shield)','Black Widow','103','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Captain America','Captain America','67','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Captain America (Unmasked)','Captain America','92','Unmasked',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Grinning Ultron','Ultron','83','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Hawkeye','Hawkeye','70','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Hulk','Hulk','68','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Hulk (Gamma Glow in the Dark)','Hulk','68','Glow in the Dark',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Hulk (Savage)','Hulk','68','Savage','Exclusive','Pop! Marvel','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item; exclusivity retained from owned row.'),
    ('Avengers: Age of Ultron','Hulkbuster','Hulkbuster','73','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Iron Man (Unmasked) (Mark 43)','Iron Man','94','Unmasked',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Iron Man Mark 43','Iron Man','66','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Iron Man Mark 43 (Jumbo) (Glows In The Dark)','Iron Man','962','Glow in the Dark','Jumbo','Pop! Jumbo','Jumbo',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Scarlet Witch','Scarlet Witch','95','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Thor','Thor','69','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Ultron','Ultron','72','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Vision','Vision','71','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Vision (Faded)','Vision','71','Faded',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Avengers: Age of Ultron','Vision (Metallic)','Vision','71','Metallic',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=396&ssid=-1','Avengers: Age of Ultron checklist item.'),
    ('Ant-Man','Ant-Man','Ant-Man','85','Common',null,'Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=4','Ant-Man checklist item.'),
    ('Ant-Man','Ant-Man #455','Ant-Man','455','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=4','Ant-Man checklist item.'),
    ('Ant-Man','Ant-Man (Black Out)','Ant-Man','85','Black Out','Exclusive','Pop! Marvel','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=4','Ant-Man checklist item; exclusivity retained from owned row.'),
    ('Ant-Man','Ant-Man (Glows in the Dark)','Ant-Man','85','Glow in the Dark',null,'Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=4','Ant-Man checklist item.'),
    ('Ant-Man','Ant-Man (Unmasked)','Ant-Man','87','Unmasked',null,'Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=4','Ant-Man checklist item.'),
    ('Ant-Man','Yellowjacket','Yellowjacket','86','Common',null,'Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=4','Ant-Man checklist item.'),
    ('Ant-Man','Yellowjacket (Glows in the Dark)','Yellowjacket','86','Glow in the Dark',null,'Pop! Marvel','Standard',0.92::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=4','Ant-Man checklist item.'),
    ('Ant-Man and the Wasp','Ant-Man (Masked)','Ant-Man','340','Masked',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=1','Ant-Man and the Wasp checklist item.'),
    ('Ant-Man and the Wasp','Ant-Man (Unmasked) (Chase)','Ant-Man','340','Chase',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=1','Ant-Man and the Wasp checklist item.'),
    ('Ant-Man and the Wasp','Ghost','Ghost','342','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=1','Ant-Man and the Wasp checklist item.'),
    ('Ant-Man and the Wasp','Ghost (Invisible)','Ghost','345','Invisible','Walmart','Pop! Marvel','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=1','Ant-Man and the Wasp checklist item; Walmart retained from owned row.'),
    ('Ant-Man and the Wasp','Giant-Man (10" Scale)','Giant-Man','414','Common',null,'Pop! Jumbo','Jumbo',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=1','Ant-Man and the Wasp checklist item.'),
    ('Ant-Man and the Wasp','Hank Pym (Masked)','Hank Pym','343','Masked',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=1','Ant-Man and the Wasp checklist item.'),
    ('Ant-Man and the Wasp','Hank Pym (Unmasked)','Hank Pym','346','Unmasked',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=1','Ant-Man and the Wasp checklist item.'),
    ('Ant-Man and the Wasp','Janet van Dyne','Janet van Dyne','344','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=1','Ant-Man and the Wasp checklist item.'),
    ('Ant-Man and the Wasp','Janet van Dyne (Unmasked)','Janet van Dyne','347','Unmasked',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=1','Ant-Man and the Wasp checklist item.'),
    ('Ant-Man and the Wasp','Wasp (Blacklight)','Wasp','341','Blacklight',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=1','Ant-Man and the Wasp checklist item.'),
    ('Ant-Man and the Wasp','Wasp (Masked)','Wasp','341','Masked',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=1','Ant-Man and the Wasp checklist item.'),
    ('Ant-Man and the Wasp','Wasp (Unmasked) (Chase)','Wasp','341','Chase',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=279&ssid=1','Ant-Man and the Wasp checklist item.'),
    ('Ant-Man & The Wasp: Quantumania','Ant-Man','Ant-Man','1137','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=280','Quantumania checklist item.'),
    ('Ant-Man & The Wasp: Quantumania','Ant-Man','Ant-Man','1166','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=280','Quantumania checklist item.'),
    ('Ant-Man & The Wasp: Quantumania','Cassie Lang','Cassie Lang','1167','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=280','Quantumania checklist item.'),
    ('Ant-Man & The Wasp: Quantumania','Kang','Kang','1139','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=280','Quantumania checklist item.'),
    ('Ant-Man & The Wasp: Quantumania','Kang (Glows In The Dark)','Kang','1305','Glow in the Dark',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=280','Quantumania checklist item.'),
    ('Ant-Man & The Wasp: Quantumania','Lord Krylar','Lord Krylar','1218','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=280','Quantumania checklist item.'),
    ('Ant-Man & The Wasp: Quantumania','M.O.D.O.K.','M.O.D.O.K.','1140','Common',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=280','Quantumania checklist item.'),
    ('Ant-Man & The Wasp: Quantumania','M.O.D.OK. (Unmasked)','M.O.D.O.K.','1262','Unmasked',null,'Pop! Marvel','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=280','Quantumania checklist item; source spelling preserved.'),
    ('Ant-Man & The Wasp: Quantumania','Wasp (Masked)','Wasp','1138','Masked',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=280','Quantumania checklist item.'),
    ('Ant-Man & The Wasp: Quantumania','Wasp (Unmasked) (Chase)','Wasp','1138','Chase',null,'Pop! Marvel','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=280','Quantumania checklist item.'),
    ('Invincible','Allen the Alien (Bloody)','Allen the Alien','1863','Bloody','Funko Shop','Pop! Animation','Standard',0.88::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item; Funko Shop retained from owned row.'),
    ('Invincible','Atom Eve','Atom Eve','1501','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.'),
    ('Invincible','Atom Eve (Armored)','Atom Eve','1911','Armored',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.'),
    ('Invincible','Battle Beast','Battle Beast','54','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.'),
    ('Invincible','Battle Beast (Bloody) (Chase)','Battle Beast','54','Chase',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.'),
    ('Invincible','Conquest','Conquest','1913','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.'),
    ('Invincible','Conquest (Damaged Arm) (Chase)','Conquest','1913','Chase',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.'),
    ('Invincible','Invincible','Invincible','1499','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.'),
    ('Invincible','Invincible (Bloody) (Chase) (Funko Fusion)','Invincible','1098','Chase',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.'),
    ('Invincible','Invincible (Bloody) (Specialty Series)','Invincible','1502','Bloody',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.'),
    ('Invincible','Invincible (Conquest Battle Damaged) (Bloody)','Invincible','1912','Bloody',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.'),
    ('Invincible','Invincible (Funko Fusion)','Invincible','1098','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.'),
    ('Invincible','Omni-Man','Omni-Man','1500','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.'),
    ('Invincible','Omni-Man (Bloody Armor)','Omni-Man','1861','Bloody Armor',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.'),
    ('Invincible','Omni-Man (Bloody)','Omni-Man','1500','Bloody',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.'),
    ('Invincible','Rex Splode','Rex Splode','1862','Common',null,'Pop! Animation','Standard',0.90::numeric,'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2','Invincible checklist item.')
), matched as (
  select upsert_sets.id as set_id, pc.id as pop_catalog_id, pc.upc, checklist.*
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
  set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity, pop_type, pop_style,
  is_required_for_completion, source_url, confidence, notes
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
