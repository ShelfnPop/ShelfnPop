-- Star Wars original trilogy checklist totals, applied 2026-07-08.
-- Sources:
--   A New Hope:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5034
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5034&ns=40&series=starwarsanewhopefunko&ssid=1
--   The Empire Strikes Back:
--     https://www.mypopfigures.com/pop?action=seriesitemlist&id=5064&ssid=2
--     https://www.mypopfigures.com/pop?action=seriesitemlist&id=5064&ns=40&series=starwarsempirestrikesbackfunko&ssid=2
--   Return of the Jedi:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6714
--     https://figurerealm.com/actionfigure?action=seriesitemlist&id=6714&ns=40&series=starwarsreturnofthejedifunko&ssid=2

update public.pop_catalog
set set_total = case
  when set_name = 'Star Wars: A New Hope' then 73
  when set_name = 'Star Wars: The Empire Strikes Back' then 61
  when set_name = 'Star Wars: Return of the Jedi' then 58
  else set_total
end
where franchise = 'Star Wars'
  and set_name in (
    'Star Wars: A New Hope',
    'Star Wars: The Empire Strikes Back',
    'Star Wars: Return of the Jedi'
  );

with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values
    ('Star Wars: A New Hope', 'Star Wars', 'reviewed', 'FigureRealm/MyPopFigures Star Wars - A New Hope checklist', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5034', 0.88, now(), 'Checklist extraction shows 73 Pop! Vinyl Figure rows.'),
    ('Star Wars: The Empire Strikes Back', 'Star Wars', 'reviewed', 'FigureRealm/MyPopFigures Star Wars - Empire Strikes Back checklist', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5064', 0.88, now(), 'Checklist extraction shows 61 Pop! Vinyl Figure rows.'),
    ('Star Wars: Return of the Jedi', 'Star Wars', 'reviewed', 'FigureRealm/MyPopFigures Star Wars - Return of the Jedi checklist', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6714', 0.88, now(), 'Checklist extraction shows 58 Pop! Vinyl Figure rows.')
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
  select 'Star Wars: A New Hope', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5034', unnest(array[
    'Ben Kenobi #99','Ben Kenobi (Retro) #572','Biggs Darklighter #24','Biggs Darklighter (Deleted Scenes) #802','C-3PO #13','C-3PO (Gold Chrome) #13','Cantina Faceoff (Movie Moments) #223','Chewbacca #596','Chewbacca #513','Chewbacca (Facet) #657','Chewbacca (Hoth) #06','Chewbacca (Retro) #570','Darth Vader #01','Darth Vader #509','Darth Vader #597','Darth Vader (Chrome) #01','Darth Vader (Lights & Sound) #343','Darth Vader (with Tie Advanced x1 Starfighter) (Deluxe) #742','Death Star Duel (Movie Moments) #225','Escape Pod Landing (Movie Moments) #222','Figrin D''An #48','Garindan (Empire Spy) #127','Grand Moff Tarkin #159','Greedo #07','Greedo (Vault) #07','Hammerhead #37','Han Solo #03','Han Solo #169','Han Solo (Stormtrooper) #15','Han Solo (Vault) #03','Han Solo in the Millennium Falcon #321','Jabba the Hutt (Deleted Scenes) #801','Jawa #20','Jawa (Classic) #371','Jawa (Vault) #20','Luke Skywalker #594','Luke Skywalker #511','Luke Skywalker (Bespin) #93','Luke Skywalker (Bespin) (Gold) #93','Luke Skywalker (Binary Sunset) #764','Luke Skywalker (Deleted Scenes) #800','Luke Skywalker (Red 5) #763','Luke Skywalker (Stormtrooper) #16','Luke Skywalker (Tatooine) #49','Luke Skywalker (with Remote) #765','Luke Skywalker (X-Wing Pilot) #17','Luke Skywalker with Landspeeder #175','Luke Skywalker with X-Wing #232','Muftak #173','Nalan Cheel #52','Obi-Wan Kenobi #10','Obi-Wan Kenobi (Vault) #10','Princess Leia #04','Princess Leia #595','Princess Leia #512','Princess Leia (Blue Chrome) #295','Princess Leia (Gold Chrome) #295','R2-D2 #31','R2-D2 (Retro) #571','R2-D2 and Princess Leia Hologram (Deluxe) #766','R5-D4 #180','Sandtrooper #322','Sandtrooper (Deleted Scenes) #803','Stormtrooper #05','Stormtrooper #598','Stormtrooper #510','Stormtrooper (in Red Armor) #05','Tie Fighter Pilot #51','Tie Fighter Pilot (Metallic) #51','TIE Fighter Pilot with Tie Fighter #221','Trash Compactor Escape (Movie Moments) #224','Tusken Raider #19','Tusken Raider (Vault) #19'
  ])
  union all
  select 'Star Wars: The Empire Strikes Back', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5064', unnest(array[
    '4-LOM #101','A Lesson in the Force #382','AT-AT Driver #92','Battle at Echo Base: Chewbacca (Flocked) #374','Battle at Echo Base: Darth Vader & Snowtrooper #377','Battle at Echo Base: Han Solo with Tauntaun #373','Battle at Echo Base: Princess Leia #376','Battle at Echo Base: Probe Droid #375','Battle at Echo Base: Wampa #372','Boba Fett #08','Boba Fett (10" Scale) #367','Boba Fett (Rifle) (Glows in the Dark) #735','Boba Fett with Slave I #213','Boba Gets His Bounty #280','Bossk #35','Bounty Hunters Collection: 4-LOM #439','Bounty Hunters Collection: Boba Fett #436','Bounty Hunters Collection: Bossk #437','Bounty Hunters Collection: Darth Vader #442','Bounty Hunters Collection: Dengar #440','Bounty Hunters Collection: IG-88 #438','Bounty Hunters Collection: Zuckuss #441','Chewbacca #06','Chewbacca #300','Cloud City Duel (Movie Moments) #226','Dagobah Face-Off #284','Dagobah Yoda #124','Dagobah Yoda (Blue Chrome) #124','Dagobah Yoda (Gold Chrome) #124','Dagobah Yoda (Gold) #124','Dagobah Yoda (Green Chrome) #124','Dagobah Yoda (Green) #124','Darth Vader (Bespin) #158','Darth Vader (Bespin) (Art Series) #518','Darth Vader (Fist Pose) #428','Darth Vader (Hoth) (Art Series) #516','Darth Vader in Meditation Chamber #365','Dengar #230','E-3PO #46','Han Solo (Carbonite) #364','Han Solo (Hoth) #47','Holographic Emperor (Glows In The Dark) #40','Hoth Han Solo with Tauntaun #125','IG-88 #103','K-3PO #55','Lando Calrissian #30','Luke Skywalker (Bespin Encounter) #94','Luke Skywalker (Hoth) #34','Luke Skywalker & Yoda #363','Luke Skywalker with Tauntaun #366','Medical Droid #212','Obi-Wan Kenobi (Glows in the Dark) #392','Princess Leia #362','Princess Leia (Hoth) #125','R2-D2 (Dagobah) #31','Snowtrooper #56','Stormtrooper (10" Scale) #391','Wampa #39','Wampa (Flocked) #39','Wedge Antilles with Snow Speeder #219','Zuckuss #122'
  ])
  union all
  select 'Star Wars: Return of the Jedi', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6714', unnest(array[
    'Admiral Ackbar #617','Admiral Ackbar (White Suit) #28','Baby Nippet (Flocked) #292','Bib Fortuna #53','Biker Scout #38','Boba Fett #102','Brethupp #613','Chewbacca with AT-ST #236','Darth Vader (Electrocuted) #288','Darth Vader (Electrocuted) (Glows In The Dark) #288','Darth Vader (Endor) (Art Series) #517','Emperor Palpatine #36','Emperor Palpatine #289','Emperor Palpatine #614','Emperor Palpatine (Force Lightning) (Jumbo) #741','Emperor Palpatine (Glow in the Dark) #36','Emperor Palpatine (Retro) #573','Encounter on Endor #294','Ewok with Speeder Bike (Movie Moments) #258','Gamorrean Guard #12','Gamorrean Guard (Vault) #12','Han Solo #286','Holographic Luke Skywalker (Glows In The Dark) #615','Imperial Guard #57','Jabba the Hutt #22','Jabba''s Skiff: Boba Fett #623','Jabba''s Skiff: Chewbacca (Deluxe) #619','Jabba''s Skiff: Han Solo (Deluxe) #620','Jabba''s Skiff: Lando Calrissian (Deluxe) #621','Jabba''s Skiff: Luke Skywalker (Deluxe) #618','Jabba''s Skiff: Nikto (Skiff Guard) (Deluxe) #622','Klaatu (Skiff Guard) #283','Lando Calrissian #282','Lando Calrissian #291','Lando Calrissian in the Millenium Falcon #514','Luke Skywalker (Endor) #123','Luke Skywalker (Hood) #126','Luke Skywalker (Jedi) #11','Luke Skywalker (Jedi) (Vault) #11','Luke Skywalker with Speeder Bike (Chase) #229','Max Rebo #616','Max Rebo (Specialty Series) #160','Princess Leia #287','Princess Leia (Boushh Unmasked) #54','Princess Leia (Boushh) #50','Princess Leia (Gold) #287','Princess Leia (with Speeder Bike) #228','R2-D2 (Jabba''s Skiff) #121','R2-Q5 #41','Ree Yees #95','Scout Trooper with Speeder Bike #234','Slave Leia #18','Slave Leia (Vault) #18','Unmasked Vader #43','Wicket #26','Wicket (Flocked) #26','Wicket W. Warrick #290','Wicket W. Warrick (10" Scale) #293'
  ])
), parsed as (
  select
    upsert_sets.id as set_id,
    raw_items.set_name,
    raw_items.source_url,
    regexp_replace(raw_items.title, '\s+#\d+\s*$', '') as pop_name,
    regexp_replace(raw_items.title, '\s+#\d+\s*$', '') as character_name,
    regexp_replace(raw_items.title, '^.*#([0-9]+)\s*$', '\1') as number_value,
    case
      when raw_items.title ilike '%Flocked%' then 'Flocked'
      when raw_items.title ilike '%Glows in the Dark%' or raw_items.title ilike '%Glow in the Dark%' then 'Glow in the Dark'
      when raw_items.title ilike '%Gold Chrome%' then 'Gold Chrome'
      when raw_items.title ilike '%Blue Chrome%' then 'Blue Chrome'
      when raw_items.title ilike '%Green Chrome%' then 'Green Chrome'
      when raw_items.title ilike '%Chrome%' then 'Chrome'
      when raw_items.title ilike '%Gold%' then 'Gold'
      when raw_items.title ilike '%Retro%' then 'Retro'
      when raw_items.title ilike '%Vault%' then 'Vault'
      else 'Common'
    end as variant_value,
    case
      when raw_items.title ilike '%Movie Moments%' then 'Moment'
      when raw_items.title ilike '%Deluxe%' then 'Deluxe'
      when raw_items.title ilike '%Jumbo%' or raw_items.title ilike '%10" Scale%' then 'Jumbo'
      when raw_items.title ilike '%with X-Wing%' or raw_items.title ilike '%with Tie%' or raw_items.title ilike '%with Landspeeder%' or raw_items.title ilike '%with Tauntaun%' or raw_items.title ilike '%with Speeder Bike%' or raw_items.title ilike '%with AT-ST%' or raw_items.title ilike '%Slave I%' or raw_items.title ilike '%Millen%' then 'Ride'
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
      and ltrim(pc.number, '0') = ltrim(parsed.number_value, '0')
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
  0.88,
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
