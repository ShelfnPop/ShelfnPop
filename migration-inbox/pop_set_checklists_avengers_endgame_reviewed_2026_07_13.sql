begin;

insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes, updated_at)
values ('Avengers: Endgame', 'Marvel', 'reviewed', 'FunkyPriceGuide Avengers Endgame checklist', 'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/', 0.90, now(), 'Reviewed checklist seeded from FunkyPriceGuide 68-item Pop checklist. Figure Realm cross-check also lists Avengers Endgame Pop subseries.', now())
on conflict (canonical_name, franchise) do update
set status = excluded.status,
    source_label = excluded.source_label,
    source_url = excluded.source_url,
    confidence = excluded.confidence,
    reviewed_at = excluded.reviewed_at,
    notes = excluded.notes,
    updated_at = now();

with target_set as (
  select id from public.pop_sets where canonical_name = 'Avengers: Endgame' and franchise = 'Marvel'
)
delete from public.pop_set_checklist_items i
using target_set s
where i.set_id = s.id;

with target_set as (
  select id from public.pop_sets where canonical_name = 'Avengers: Endgame' and franchise = 'Marvel'
), rows(pop_name, character, number, variant, exclusivity, pop_type, pop_style, is_required_for_completion, source_url, confidence, notes) as (
  values
    ('Tony Stark','Tony Stark','449',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 449 Tony Stark (Common)'),
    ('Tony Stark','Tony Stark','449',null,'Entertainment Earth','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 449 Tony Stark (Entertainment Earth)'),
    ('Tony Stark','Tony Stark','449','Glow in the Dark','Target','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 449 Tony Stark (Glows In The Dark) Bundle (Target)'),
    ('Captain America','Captain America','450',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 450 Captain America (Common)'),
    ('Captain America','Captain America','450',null,'Entertainment Earth','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 450 Captain America (Entertainment Earth)'),
    ('Captain America','Captain America','450','Glow in the Dark','FYE','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 450 Captain America (Glows In The Dark) (FYE)'),
    ('Hulk','Hulk','451',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 451 Hulk (Common)'),
    ('Hulk','Hulk','451',null,'Entertainment Earth','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 451 Hulk (Entertainment Earth)'),
    ('Hulk','Hulk','451','Glow in the Dark','Hot Topic','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 451 Hulk (Glows In The Dark) Bundle (Hot Topic)'),
    ('Thor','Thor','452',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 452 Thor (Common)'),
    ('Thor','Thor','452',null,'Entertainment Earth','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 452 Thor (Entertainment Earth)'),
    ('Thor','Thor','452','Glow in the Dark','GameStop','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 452 Thor (Glows In The Dark) Bundle (GameStop)'),
    ('Thanos','Thanos','453',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 453 Thanos (Common)'),
    ('Thanos','Thanos','453',null,'Entertainment Earth','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 453 Thanos (Entertainment Earth)'),
    ('Black Widow','Black Widow','454',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 454 Black Widow (Common)'),
    ('Black Widow','Black Widow','454',null,'Entertainment Earth','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 454 Black Widow (Entertainment Earth)'),
    ('Ant-Man','Ant-Man','455',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 455 Ant-Man (Common)'),
    ('Ant-Man','Ant-Man','455',null,'Entertainment Earth','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 455 Ant-Man (Entertainment Earth)'),
    ('Nebula','Nebula','456',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 456 Nebula (Common)'),
    ('Nebula','Nebula','456',null,'Entertainment Earth','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 456 Nebula (Entertainment Earth)'),
    ('Hawkeye','Hawkeye','457',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 457 Hawkeye (Common)'),
    ('Hawkeye','Hawkeye','457',null,'Entertainment Earth','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 457 Hawkeye (Entertainment Earth)'),
    ('War Machine','War Machine','458',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 458 War Machine (Common)'),
    ('War Machine','War Machine','458',null,'Entertainment Earth','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 458 War Machine (Entertainment Earth)'),
    ('Captain Marvel','Captain Marvel','459',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 459 Captain Marvel (Common)'),
    ('Captain Marvel','Captain Marvel','459',null,'Entertainment Earth','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 459 Captain Marvel (Entertainment Earth)'),
    ('Thanos','Thanos','460',null,'Target','Pop! Marvel','Jumbo',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 460 Thanos (10 Inch) (Target)'),
    ('War Machine','War Machine','461',null,'Amazon','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 461 War Machine (Amazon)'),
    ('Rocket','Rocket','462',null,'Walmart','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 462 Rocket (Walmart)'),
    ('Hulk','Hulk','463',null,'GameStop','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 463 Hulk (GameStop)'),
    ('Captain America','Captain America','464',null,'Hot Topic','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 464 Captain America (Hot Topic)'),
    ('Ronin','Ronin','465',null,'Walmart','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 465 Ronin (Walmart)'),
    ('Hawkeye','Hawkeye','466',null,'Walgreens','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 466 Hawkeye (Walgreens)'),
    ('Iron Man','Iron Man','467',null,'BoxLunch','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 467 Iron Man (BoxLunch)'),
    ('Hulk','Hulk','478',null,null,'Pop! Marvel','Jumbo',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 478 Hulk (6 Inch)'),
    ('Thor','Thor','479',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 479 Thor'),
    ('Rescue','Rescue','480',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 480 Rescue'),
    ('Captain America','Captain America','481',null,'Collectors Corps','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 481 Captain America (MCC)'),
    ('Thor','Thor','482',null,'FYE','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 482 Thor (FYE)'),
    ('Valkyrie','Valkyrie','483',null,'Collectors Corps','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 483 Valkyrie (MCC)'),
    ('Wong','Wong','493',null,'San Diego Comic-Con','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 493 Wong (SDCC 2019)'),
    ('Hulk (Blue Chrome)','Hulk','499','Blue Chrome','Walmart','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 499 Hulk Blue Chrome (Walmart)'),
    ('Hulk (Green Chrome)','Hulk','499','Green Chrome','Walmart','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 499 Hulk Green Chrome (Walmart)'),
    ('Hulk (Orange Chrome)','Hulk','499','Orange Chrome','Walmart','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 499 Hulk Orange Chrome (Walmart)'),
    ('Hulk (Purple Chrome)','Hulk','499','Purple Chrome','Walmart','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 499 Hulk Purple Chrome (Walmart)'),
    ('Hulk (Red Chrome)','Hulk','499','Red Chrome','Walmart','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 499 Hulk Red Chrome (Walmart)'),
    ('Hulk (Yellow Chrome)','Hulk','499','Yellow Chrome','Walmart','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 499 Hulk Yellow Chrome (Walmart)'),
    ('Iron Man with Gauntlet','Iron Man with Gauntlet','529',null,'New York Comic-Con','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 529 Iron Man with Gauntlet (2019 NYCC)'),
    ('Captain America with Broken Shield','Captain America with Broken Shield','573',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 573 Captain America with Broken Shield'),
    ('Iron Spider with Nano Gauntlet','Iron Spider with Nano Gauntlet','574',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 574 Iron Spider with Nano Gauntlet'),
    ('Hulk with Taco','Hulk with Taco','575',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 575 Hulk with Taco'),
    ('Captain Marvel with New Hair','Captain Marvel with New Hair','576',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 576 Captain Marvel with New Hair'),
    ('Korg Gamer','Korg Gamer','577',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 577 Korg Gamer'),
    ('Bro Thor with Pizza','Bro Thor with Pizza','578',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 578 Bro Thor with Pizza'),
    ('Thanos','Thanos','579',null,'in the Garden','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 579 Thanos (in the Garden)'),
    ('Iron Man','Iron Man','580','Glow in the Dark','PX Previews','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 580 Iron Man (Glows In The Dark) (PX Previews)'),
    ('Thanos','Thanos','592',null,'Emerald City Comic-Con','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 592 Thanos (ECCC 2020)'),
    ('Stan Lee Cameo','Stan Lee Cameo','726',null,'Funko Shop','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 726 Stan Lee Cameo (Funko Shop)'),
    ('Loki','Loki','747','Glow in the Dark','Funko Shop','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 747 Loki (Glows In The Dark) (Funko Shop)'),
    ('Wanda Maximoff','Wanda Maximoff','855','Glow in the Dark','Pop In A Box','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 855 Wanda Maximoff (Glows In The Dark) (Pop In A Box)'),
    ('Iron Patriot','Iron Patriot','868',null,'Funko Shop','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 868 Iron Patriot (Funko Shop)'),
    ('Old Man Steve','Old Man Steve','915',null,'Amazon','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 915 Old Man Steve (Amazon)'),
    ('Thor','Thor','1117','Glow in the Dark Chase','Chalice Collectibles','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 1117 Thor (Glow Chase) (Chalice Collectibles)'),
    ('Thor','Thor','1117','Glow in the Dark','Chalice Collectibles','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 1117 Thor (Glows In The Dark) (Chalice Collectibles)'),
    ('Iron Spider','Iron Spider','1142',null,null,'Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 1142 Iron Spider'),
    ('Captain America','Captain America','1198','Glow in the Dark','Volcano X','Pop! Marvel','Standard',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 1198 Captain America (Glows In The Dark) (Volcano X)'),
    ('2-Pack Hulk & Thanos','2-Pack Hulk & Thanos',null,null,'Barnes & Noble','Pop! Marvel','2-Pack',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 2-Pack Hulk & Thanos (Barnes & Noble)'),
    ('2-Pack Morgan Stark & Tony Stark','2-Pack Morgan Stark & Tony Stark',null,'Glow in the Dark','Pop In A Box','Pop! Marvel','2-Pack',true,'https://funkypriceguide.com/checklist/funko-pop-avengers-endgame/',0.9,'FPG: 2-Pack Morgan Stark & Tony Stark (Glows In The Dark) (Pop In A Box)')
)
insert into public.pop_set_checklist_items (set_id, pop_catalog_id, pop_name, character, number, variant, exclusivity, pop_type, pop_style, is_required_for_completion, source_url, confidence, notes)
select s.id,
       c.id,
       r.pop_name,
       r.character,
       r.number,
       r.variant,
       r.exclusivity,
       r.pop_type,
       r.pop_style,
       r.is_required_for_completion,
       r.source_url,
       r.confidence,
       r.notes
from rows r
cross join target_set s
left join public.pop_catalog c
  on c.set_name = 'Avengers: Endgame'
 and c.franchise = 'Marvel'
 and coalesce(c.number, '') = coalesce(r.number, '')
 and lower(regexp_replace(c.pop_name, '[^a-z0-9]+', '', 'g')) = lower(regexp_replace(r.pop_name, '[^a-z0-9]+', '', 'g'))
 and coalesce(lower(c.variant), '') = coalesce(lower(r.variant), '');

update public.pop_catalog
set set_total = 68
where set_name = 'Avengers: Endgame'
  and franchise = 'Marvel';

commit;
