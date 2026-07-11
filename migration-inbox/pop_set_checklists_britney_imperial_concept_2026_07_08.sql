-- Audit note: Britney Spears, DC Imperial Palace, and Star Wars Concept Series reviewed checklist pass, 2026-07-08.
--
-- Sources:
--   Britney Spears FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820
--   Britney Spears Minis official Funko supplemental source:
--     https://funko.com/britney-spears-mini-vinyl-figure-toxic/84457a.html
--   DC Imperial Palace wave source:
--     https://comicbook.com/dc/news/funko-dc-comics-imperial-palace-pops-wave-2-superman-wonder-woma/
--   DC Imperial Palace Robin official Funko source:
--     https://funko.com/pop-robin-imperial-palace/52430.html
--   Star Wars Concept Series official first-wave source:
--     https://www.starwars.com/news/funko-pop-star-wars-concept-series
--   Star Wars Concept Series checklist cross-check:
--     https://maythefunkobewithyou.weebly.com/checklist.html
--
-- Live changes:
--   * Promote Britney Spears to reviewed with 17 required Pop!/Album rows.
--   * Split the owned Britney Spears Minis row into a separate reviewed 9-item Minis checklist.
--   * Promote DC Imperial Palace to reviewed with 11 scoped catalog rows, including Superman #402 moved from the generic Superman set.
--   * Promote Star Wars Concept Series to reviewed with 13 required rows.
--   * Correct narrow catalog identity issues in the targeted rows only.
--   * No ownership quantities, paid values, current values, or images are changed.

with upsert_sets as (
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
  values
    (
      'Britney Spears',
      'Pop! Rocks',
      'reviewed',
      'FigureRealm Britney Spears checklist',
      'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',
      0.90,
      now(),
      'Reviewed denominator is 17 FigureRealm Britney Spears rows: 1 Pop! Albums row and 16 Pop! Vinyl Figures rows. Minis are split into Britney Spears Minis.'
    ),
    (
      'Britney Spears Minis',
      'Pop! Rocks',
      'reviewed',
      'Official Funko Britney Spears Minis checklist',
      'https://funko.com/britney-spears-mini-vinyl-figure-toxic/84457a.html',
      0.88,
      now(),
      'Reviewed denominator is 9 official Funko Minis: Baby One More Time, Oops!... I Did It Again, I''m A Slave 4 U, (You Drive Me) Crazy, Toxic, Circus, Oops!... I Did It Again Metallic, I''m A Slave 4 U Metallic, and Circus Metallic.'
    ),
    (
      'DC Imperial Palace',
      'DC',
      'reviewed',
      'ComicBook.com DC Imperial Palace wave source + official Funko row cross-check',
      'https://comicbook.com/dc/news/funko-dc-comics-imperial-palace-pops-wave-2-superman-wonder-woma/',
      0.84,
      now(),
      'Reviewed scoped denominator is 11 catalog-known DC Imperial Palace rows: Deathstroke #368; Batman #374 common and Blue Metallic; Joker #375; Harley Quinn #376; Robin #377 common; Wonder Woman #378; Martian Manhunter #399; Green Lantern #400; The Flash #401; Superman #402.'
    ),
    (
      'Star Wars Concept Series',
      'Star Wars',
      'reviewed',
      'StarWars.com first-wave source + May The Funko Be With You checklist',
      'https://maythefunkobewithyou.weebly.com/checklist.html',
      0.86,
      now(),
      'Reviewed denominator is 13 Concept Series rows: #386-389, #423-426, #470-473, and #524. StarWars.com confirms the initial McQuarrie Concept Series wave of Darth Vader, Chewbacca, Starkiller, and Boba Fett.'
    )
  on conflict (canonical_name, franchise) do update set
    status = excluded.status,
    source_label = excluded.source_label,
    source_url = excluded.source_url,
    confidence = excluded.confidence,
    reviewed_at = excluded.reviewed_at,
    notes = excluded.notes,
    updated_at = now()
  returning id, canonical_name, franchise
), clear_prior as (
  delete from public.pop_set_checklist_items
  where set_id in (select id from upsert_sets)
  returning id
), checklist(set_name, franchise_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, source_value, confidence_value, notes_value) as (
  values
    ('Britney Spears','Pop! Rocks','Britney Spears (Oops!... I Did it Again)','Britney Spears','26',null,null,'Pop! Albums','Album','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.90::numeric,'FigureRealm Britney Spears Pop! Albums row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears','Britney Spears','215',null,null,'Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.90::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (...Baby One More Time)','Britney Spears','90','...Baby One More Time',null,'Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.90::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (Baby One More Time)','Britney Spears','444','Baby One More Time',null,'Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.90::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (Diamond Collection)','Britney Spears','215','Diamond Collection',null,'Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.88::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (I''m a Slave 4 U)','Britney Spears','98','I''m a Slave 4 U',null,'Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.90::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (I''m a Slave 4 U) (Metallic)','Britney Spears','98','I''m a Slave 4 U Metallic','Barnes & Noble','Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.88::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (I''m a Slave 4 U) (Platinum)','Britney Spears','98','I''m a Slave 4 U Platinum',null,'Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.88::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (Lucky)','Britney Spears','460','Lucky',null,'Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.90::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (Me Against the Music)','Britney Spears','410','Me Against the Music',null,'Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.90::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (Oops! I Did It Again)','Britney Spears','462','Oops! I Did It Again',null,'Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.90::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (Ringleader)','Britney Spears','262','Ringleader',null,'Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.90::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (Ringleader) (Hat) (Chase)','Britney Spears','262','Ringleader Hat Chase',null,'Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.88::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (Stronger)','Britney Spears','461','Stronger',null,'Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.90::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (Toxic)','Britney Spears','208','Toxic',null,'Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.90::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (You Better Work)','Britney Spears','495','You Better Work',null,'Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.90::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),
    ('Britney Spears','Pop! Rocks','Britney Spears (You Drive Me Crazy)','Britney Spears','292','You Drive Me Crazy','New York Comic Con','Pop! Rocks','Standard','https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=820',0.88::numeric,'FigureRealm Britney Spears Pop! Vinyl row.'),

    ('Britney Spears Minis','Pop! Rocks','Britney Spears Mini Vinyl Figure (Baby One More Time)','Britney Spears',null,'Baby One More Time',null,'Funko Minis','Mini','https://funko.com/britney-spears-mini-vinyl-figure-toxic/84457a.html',0.88::numeric,'Official Funko Britney Spears Minis row.'),
    ('Britney Spears Minis','Pop! Rocks','Britney Spears Mini Vinyl Figure (Oops!... I Did It Again)','Britney Spears',null,'Oops!... I Did It Again',null,'Funko Minis','Mini','https://funko.com/britney-spears-mini-vinyl-figure-toxic/84457a.html',0.88::numeric,'Official Funko Britney Spears Minis row.'),
    ('Britney Spears Minis','Pop! Rocks','Britney Spears Mini Vinyl Figure (I''m A Slave 4 U)','Britney Spears',null,'I''m A Slave 4 U',null,'Funko Minis','Mini','https://funko.com/britney-spears-mini-vinyl-figure-toxic/84457a.html',0.88::numeric,'Official Funko Britney Spears Minis row.'),
    ('Britney Spears Minis','Pop! Rocks','Britney Spears Mini Vinyl Figure ((You Drive Me) Crazy)','Britney Spears',null,'(You Drive Me) Crazy',null,'Funko Minis','Mini','https://funko.com/britney-spears-mini-vinyl-figure-toxic/84457a.html',0.88::numeric,'Official Funko Britney Spears Minis row.'),
    ('Britney Spears Minis','Pop! Rocks','Britney Spears Mini Vinyl Figure (Toxic)','Britney Spears',null,'Toxic',null,'Funko Minis','Mini','https://funko.com/britney-spears-mini-vinyl-figure-toxic/84457a.html',0.90::numeric,'Official Funko Britney Spears Minis row.'),
    ('Britney Spears Minis','Pop! Rocks','Britney Spears Mini Vinyl Figure (Circus)','Britney Spears',null,'Circus',null,'Funko Minis','Mini','https://funko.com/britney-spears-mini-vinyl-figure-toxic/84457a.html',0.88::numeric,'Official Funko Britney Spears Minis row.'),
    ('Britney Spears Minis','Pop! Rocks','Britney Spears Mini Vinyl Figure (Oops!... I Did It Again) (Metallic)','Britney Spears',null,'Oops!... I Did It Again Metallic',null,'Funko Minis','Mini','https://funko.com/britney-spears-mini-vinyl-figure-toxic/84457a.html',0.88::numeric,'Official Funko Britney Spears Minis row.'),
    ('Britney Spears Minis','Pop! Rocks','Britney Spears Mini Vinyl Figure (I''m A Slave 4 U) (Metallic)','Britney Spears',null,'I''m A Slave 4 U Metallic',null,'Funko Minis','Mini','https://funko.com/britney-spears-mini-vinyl-figure-toxic/84457a.html',0.88::numeric,'Official Funko Britney Spears Minis row.'),
    ('Britney Spears Minis','Pop! Rocks','Britney Spears Mini Vinyl Figure (Circus) (Metallic)','Britney Spears',null,'Circus Metallic',null,'Funko Minis','Mini','https://funko.com/britney-spears-mini-vinyl-figure-toxic/84457a.html',0.88::numeric,'Official Funko Britney Spears Minis row.'),

    ('DC Imperial Palace','DC','Deathstroke (Imperial Palace)','Deathstroke','368',null,null,'Pop! Heroes','Standard','https://comicbook.com/dc/news/funko-dc-comics-imperial-palace-pops-wave-2-superman-wonder-woma/',0.84::numeric,'Owned DC Imperial Palace scoped row.'),
    ('DC Imperial Palace','DC','Batman (Imperial Palace)','Batman','374',null,null,'Pop! Heroes','Standard','https://comicbook.com/dc/news/funko-dc-comics-imperial-palace-pops-wave-2-superman-wonder-woma/',0.86::numeric,'DC Imperial Palace wave row.'),
    ('DC Imperial Palace','DC','Batman (Imperial Palace) (Blue Metallic)','Batman','374','Blue Metallic','Popcultcha','Pop! Heroes','Standard','https://www.figurerealm.com/actionfigure?action=actionfigure&figure=batmanimperialpalacebluemetallic374&id=96275',0.86::numeric,'FigureRealm individual Imperial Palace variant row.'),
    ('DC Imperial Palace','DC','Joker (Imperial Palace)','Joker','375',null,null,'Pop! Heroes','Standard','https://comicbook.com/dc/news/funko-dc-comics-imperial-palace-pops-wave-2-superman-wonder-woma/',0.84::numeric,'DC Imperial Palace wave row.'),
    ('DC Imperial Palace','DC','Harley Quinn (Imperial Palace)','Harley Quinn','376',null,null,'Pop! Heroes','Standard','https://comicbook.com/dc/news/funko-dc-comics-imperial-palace-pops-wave-2-superman-wonder-woma/',0.84::numeric,'DC Imperial Palace wave row.'),
    ('DC Imperial Palace','DC','Robin (Imperial Palace)','Robin','377',null,null,'Pop! Heroes','Standard','https://funko.com/pop-robin-imperial-palace/52430.html',0.90::numeric,'Official Funko Imperial Palace Robin row.'),
    ('DC Imperial Palace','DC','Wonder Woman (Imperial Palace)','Wonder Woman','378',null,null,'Pop! Heroes','Standard','https://comicbook.com/dc/news/funko-dc-comics-imperial-palace-pops-wave-2-superman-wonder-woma/',0.84::numeric,'DC Imperial Palace wave row.'),
    ('DC Imperial Palace','DC','Martian Manhunter (Imperial Palace)','Martian Manhunter','399',null,null,'Pop! Heroes','Standard','https://comicbook.com/dc/news/funko-dc-comics-imperial-palace-pops-wave-2-superman-wonder-woma/',0.82::numeric,'Owned DC Imperial Palace scoped row.'),
    ('DC Imperial Palace','DC','Green Lantern (Imperial Palace)','Green Lantern','400',null,null,'Pop! Heroes','Standard','https://comicbook.com/dc/news/funko-dc-comics-imperial-palace-pops-wave-2-superman-wonder-woma/',0.84::numeric,'DC Imperial Palace wave row.'),
    ('DC Imperial Palace','DC','The Flash (Imperial Palace)','The Flash','401',null,null,'Pop! Heroes','Standard','https://comicbook.com/dc/news/funko-dc-comics-imperial-palace-pops-wave-2-superman-wonder-woma/',0.84::numeric,'DC Imperial Palace wave row.'),
    ('DC Imperial Palace','DC','Superman (Imperial Palace)','Superman','402',null,null,'Pop! Heroes','Standard','https://comicbook.com/dc/news/funko-dc-comics-imperial-palace-pops-wave-2-superman-wonder-woma/',0.86::numeric,'DC Imperial Palace wave row moved from generic Superman set.'),

    ('Star Wars Concept Series','Star Wars','Concept Series Starkiller','Starkiller','386',null,'Star Wars Celebration','Pop! Star Wars','Standard','https://www.starwars.com/news/funko-pop-star-wars-concept-series',0.90::numeric,'StarWars.com first-wave Concept Series row; May The Funko Be With You number cross-check.'),
    ('Star Wars Concept Series','Star Wars','Concept Series Chewbacca','Chewbacca','387',null,'Star Wars Celebration','Pop! Star Wars','Standard','https://www.starwars.com/news/funko-pop-star-wars-concept-series',0.90::numeric,'StarWars.com first-wave Concept Series row; May The Funko Be With You number cross-check.'),
    ('Star Wars Concept Series','Star Wars','Concept Series Boba Fett','Boba Fett','388',null,'Star Wars Celebration','Pop! Star Wars','Standard','https://www.starwars.com/news/funko-pop-star-wars-concept-series',0.90::numeric,'StarWars.com first-wave Concept Series row; May The Funko Be With You number cross-check.'),
    ('Star Wars Concept Series','Star Wars','Concept Series Darth Vader','Darth Vader','389',null,'Star Wars Celebration','Pop! Star Wars','Standard','https://www.starwars.com/news/funko-pop-star-wars-concept-series',0.90::numeric,'StarWars.com first-wave Concept Series row; May The Funko Be With You number cross-check.'),
    ('Star Wars Concept Series','Star Wars','Concept Series C-3PO','C-3PO','423',null,null,'Pop! Star Wars','Standard','https://maythefunkobewithyou.weebly.com/checklist.html',0.86::numeric,'May The Funko Be With You Concept Series checklist row.'),
    ('Star Wars Concept Series','Star Wars','Concept Series R2-D2','R2-D2','424',null,null,'Pop! Star Wars','Standard','https://maythefunkobewithyou.weebly.com/checklist.html',0.86::numeric,'May The Funko Be With You Concept Series checklist row.'),
    ('Star Wars Concept Series','Star Wars','Concept Series Yoda','Yoda','425',null,null,'Pop! Star Wars','Standard','https://maythefunkobewithyou.weebly.com/checklist.html',0.86::numeric,'May The Funko Be With You Concept Series checklist row.'),
    ('Star Wars Concept Series','Star Wars','Concept Series Darth Vader (Alternate)','Darth Vader','426','Alternate',null,'Pop! Star Wars','Standard','https://maythefunkobewithyou.weebly.com/checklist.html',0.84::numeric,'May The Funko Be With You Concept Series checklist row.'),
    ('Star Wars Concept Series','Star Wars','Concept Series Stormtrooper','Stormtrooper','470',null,null,'Pop! Star Wars','Standard','https://maythefunkobewithyou.weebly.com/checklist.html',0.84::numeric,'May The Funko Be With You Concept Series checklist row.'),
    ('Star Wars Concept Series','Star Wars','Concept Series Snowtrooper','Snowtrooper','471',null,null,'Pop! Star Wars','Standard','https://maythefunkobewithyou.weebly.com/checklist.html',0.86::numeric,'May The Funko Be With You Concept Series checklist row.'),
    ('Star Wars Concept Series','Star Wars','Concept Series Han Solo','Han Solo','472',null,null,'Pop! Star Wars','Standard','https://maythefunkobewithyou.weebly.com/checklist.html',0.86::numeric,'May The Funko Be With You Concept Series checklist row.'),
    ('Star Wars Concept Series','Star Wars','Concept Series Stormtrooper (w/ Shield)','Stormtrooper','473','w/ Shield','Funko Shop','Pop! Star Wars','Standard','https://maythefunkobewithyou.weebly.com/checklist.html',0.86::numeric,'May The Funko Be With You Concept Series checklist row.'),
    ('Star Wars Concept Series','Star Wars','Concept Series Darth Vader (Disney Exclusive)','Darth Vader','524',null,'Disney','Pop! Star Wars','Standard','https://maythefunkobewithyou.weebly.com/checklist.html',0.84::numeric,'May The Funko Be With You Concept Series checklist row.')
), matched as (
  select
    s.id as set_id,
    pc.id as pop_catalog_id,
    pc.upc,
    checklist.*
  from checklist
  join upsert_sets s
    on s.canonical_name = checklist.set_name
   and s.franchise = checklist.franchise_name
  left join lateral (
    select pc.id, pc.upc
    from public.pop_catalog pc
    where (
      (checklist.set_name = 'Britney Spears' and pc.franchise = 'Pop! Rocks' and pc.set_name = 'Britney Spears')
      or (checklist.set_name = 'Britney Spears Minis' and pc.upc = '889698844574')
      or (checklist.set_name = 'DC Imperial Palace' and pc.franchise = 'DC' and (pc.set_name = 'DC Imperial Palace' or pc.upc = '889698524339'))
      or (checklist.set_name = 'Star Wars Concept Series' and pc.franchise = 'Star Wars' and pc.set_name = 'Star Wars Concept Series')
    )
      and (
        (checklist.set_name = 'Britney Spears Minis' and checklist.variant_value = 'Toxic' and pc.upc = '889698844574')
        or (checklist.set_name = 'DC Imperial Palace' and checklist.number_value = pc.number and (
          (checklist.variant_value is null and (pc.variant is null or pc.upc in ('889698524308','889698524339')))
          or (checklist.variant_value = 'Blue Metallic' and pc.upc = '889698548205')
        ))
        or (checklist.set_name = 'Star Wars Concept Series' and checklist.number_value = pc.number)
        or (checklist.set_name = 'Britney Spears' and checklist.number_value = pc.number and (
          (checklist.variant_value is null and pc.variant is null and lower(coalesce(pc.pop_name,'')) not like '%oops, i did again%' and lower(coalesce(pc.pop_name,'')) not like '%stronger%')
          or (checklist.number_value = '90' and pc.upc = '889698901369')
          or (checklist.number_value = '98' and checklist.variant_value = 'I''m a Slave 4 U' and pc.upc = '889698366519')
          or (checklist.number_value = '98' and checklist.variant_value = 'I''m a Slave 4 U Metallic' and pc.upc = '889698610087')
          or (checklist.number_value = '208' and pc.upc = '889698520331')
          or (checklist.number_value = '262' and checklist.variant_value = 'Ringleader' and pc.upc = '889698614351')
          or (checklist.number_value = '292' and pc.upc = '889698570664')
          or (checklist.number_value = '444' and pc.upc = '889698798112')
          or (checklist.number_value = '460' and pc.upc = '889698798129')
          or (checklist.number_value = '461' and pc.upc = '889698838344')
          or (checklist.number_value = '462' and pc.upc = '889698838351')
        ))
      )
    order by
      case when lower(pc.pop_name) = lower(checklist.pop_name) then 0 else 1 end,
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
from matched;

update public.pop_catalog
set
  set_name = 'Britney Spears',
  set_total = 17,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  api_last_updated = now()
where franchise = 'Pop! Rocks'
  and set_name = 'Britney Spears'
  and upc <> '889698844574';

update public.pop_catalog
set
  pop_name = case upc
    when '889698520331' then 'Britney Spears (Toxic)'
    when '889698614351' then 'Britney Spears (Ringleader)'
    when '889698570664' then 'Britney Spears (You Drive Me Crazy)'
    when '889698366519' then 'Britney Spears (I''m a Slave 4 U)'
    when '889698610087' then 'Britney Spears (I''m a Slave 4 U) (Metallic)'
    when '889698901369' then 'Britney Spears (...Baby One More Time)'
    when '889698838344' then 'Britney Spears (Stronger)'
    when '889698838351' then 'Britney Spears (Oops! I Did It Again)'
    else pop_name
  end,
  character = 'Britney Spears',
  number = case upc
    when '889698838344' then '461'
    else number
  end,
  variant = case upc
    when '889698520331' then 'Toxic'
    when '889698614351' then 'Ringleader'
    when '889698570664' then 'You Drive Me Crazy'
    when '889698366519' then 'I''m a Slave 4 U'
    when '889698610087' then 'I''m a Slave 4 U Metallic'
    when '889698901369' then '...Baby One More Time'
    when '889698798112' then 'Baby One More Time'
    when '889698798129' then 'Lucky'
    when '889698838344' then 'Stronger'
    when '889698838351' then 'Oops! I Did It Again'
    else variant
  end,
  exclusivity = case upc
    when '889698610087' then 'Barnes & Noble'
    when '889698570664' then 'New York Comic Con'
    else exclusivity
  end,
  pop_type = 'Pop! Rocks',
  pop_style = 'Standard',
  set_total = 17,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  api_last_updated = now()
where upc in (
  '889698520331',
  '889698614351',
  '889698570664',
  '889698366519',
  '889698610087',
  '889698901369',
  '889698798112',
  '889698798129',
  '889698838344',
  '889698838351'
);

update public.pop_catalog
set
  pop_name = 'Britney Spears Mini Vinyl Figure (Toxic)',
  character = 'Britney Spears',
  franchise = 'Pop! Rocks',
  set_name = 'Britney Spears Minis',
  number = null,
  variant = 'Toxic',
  exclusivity = 'Five Below',
  pop_type = 'Funko Minis',
  pop_style = 'Mini',
  set_total = 9,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.88),
  needs_review = false,
  api_last_updated = now()
where upc = '889698844574';

update public.pop_catalog
set
  set_name = 'DC Imperial Palace',
  set_total = 11,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.86),
  needs_review = false,
  api_last_updated = now()
where franchise = 'DC'
  and (
    set_name = 'DC Imperial Palace'
    or upc = '889698524339'
  );

update public.pop_catalog
set
  pop_name = case upc
    when '889698513975' then 'Deathstroke (Imperial Palace)'
    when '889698524278' then 'Batman (Imperial Palace)'
    when '889698548205' then 'Batman (Imperial Palace) (Blue Metallic)'
    when '889698524285' then 'Joker (Imperial Palace)'
    when '889698524292' then 'Harley Quinn (Imperial Palace)'
    when '889698524308' then 'Robin (Imperial Palace)'
    when '889698524346' then 'Wonder Woman (Imperial Palace)'
    when '889698542647' then 'Martian Manhunter (Imperial Palace)'
    when '889698524315' then 'Green Lantern (Imperial Palace)'
    when '889698524322' then 'The Flash (Imperial Palace)'
    when '889698524339' then 'Superman (Imperial Palace)'
    else pop_name
  end,
  variant = case upc
    when '889698548205' then 'Blue Metallic'
    else null
  end,
  exclusivity = case upc
    when '889698548205' then 'Popcultcha'
    else exclusivity
  end,
  pop_type = 'Pop! Heroes',
  pop_style = 'Standard',
  set_total = 11,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.86),
  needs_review = false,
  api_last_updated = now()
where upc in (
  '889698513975',
  '889698524278',
  '889698548205',
  '889698524285',
  '889698524292',
  '889698524308',
  '889698524346',
  '889698542647',
  '889698524315',
  '889698524322',
  '889698524339'
);

update public.pop_catalog
set
  pop_name = case upc
    when '889698493710' then 'Concept Series Darth Vader'
    when '889698501118' then 'Concept Series R2-D2'
    when '889698501125' then 'Concept Series Yoda'
    when '889698567688' then 'Concept Series Snowtrooper'
    when '889698567671' then 'Concept Series Han Solo'
    when '889698572286' then 'Concept Series Stormtrooper (w/ Shield)'
    else pop_name
  end,
  character = case upc
    when '889698493741' then 'Starkiller'
    when '889698493727' then 'Chewbacca'
    when '889698493710' then 'Darth Vader'
    when '889698501101' then 'C-3PO'
    when '889698501118' then 'R2-D2'
    when '889698501125' then 'Yoda'
    when '889698567688' then 'Snowtrooper'
    when '889698567671' then 'Han Solo'
    when '889698572286' then 'Stormtrooper'
    else character
  end,
  variant = case upc
    when '889698572286' then 'w/ Shield'
    else null
  end,
  exclusivity = case upc
    when '889698493741' then 'Star Wars Celebration'
    when '889698493727' then 'Star Wars Celebration'
    when '889698493710' then 'Star Wars Celebration'
    when '889698572286' then 'Funko Shop'
    else exclusivity
  end,
  pop_type = 'Pop! Star Wars',
  pop_style = 'Standard',
  set_total = 13,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  api_last_updated = now()
where franchise = 'Star Wars'
  and set_name = 'Star Wars Concept Series';

-- Verification:
-- select set_name, franchise, status, required_count, checklist_count
-- from public.pop_set_completion_catalog_summary
-- where set_name in ('Britney Spears','Britney Spears Minis','DC Imperial Palace','Star Wars Concept Series')
-- order by set_name;
--
-- select pc.set_name, count(*) as catalog_rows, sum(case when uci.id is not null then 1 else 0 end) as owned_links, min(pc.set_total) as set_total, max(pc.set_total) as max_set_total
-- from public.pop_catalog pc
-- left join public.user_collection_items uci on uci.pop_catalog_id = pc.id
-- where pc.set_name in ('Britney Spears','Britney Spears Minis','DC Imperial Palace','Star Wars Concept Series')
-- group by pc.set_name
-- order by pc.set_name;
