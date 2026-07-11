-- Batch 3/4 quick-check repair, 2026-07-09.
-- Applied directly to Supabase.
--
-- Scope:
-- - Batch 3: Star Wars: The Last Jedi, Star Wars: Visions, The Goonies,
--   The Nightmare Before Christmas.
-- - Batch 4: Animaniacs, Ash Vs. Evil Dead, DC New Classics,
--   Fantastic Beasts And Where To Find Them.
--
-- Findings:
-- - Ash Vs. Evil Dead and The Goonies already had reviewed checklist records,
--   but live pop_catalog rows were missing set_total values.
-- - Star Wars: The Last Jedi has 41 FigureRealm checklist rows.
-- - Star Wars: Visions is the four Target Pop! Star Wars rows #502-#505.
--   UPC 889698613491 was corrected from Am #503 to Karre #504.
-- - Fantastic Beasts And Where To Find Them was scoped to the first-film Pop!
--   Vinyl rows #01-#13 plus documented variants, total 15.
-- - DC New Classics was scoped to Batman #598, Superman #599,
--   Wonder Woman #600, and Green Lantern #601, total 4.
-- - Animaniacs was not stamped with a set_total because the bucket mixes the
--   original #161 row with 2025 wave rows. UPC 889698862981 was corrected to
--   Yakko #2066 and protected in lookup_pop.
-- - The Nightmare Before Christmas was not stamped with a set_total because it
--   spans multiple styles/eras and was previously deferred.
--
-- Sources:
-- - FigureRealm Star Wars - Last Jedi checklist:
--   https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5086
-- - StarWars.com Star Wars: Visions Funko reveal:
--   https://www.starwars.com/news/star-wars-visions-collectibles
-- - PriceCharting Karre #504 UPC check:
--   https://www.pricecharting.com/game/funko-pop-star-wars/karre-504
-- - FigureRealm Fantastic Beasts checklist:
--   https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1763
-- - Pop Figures DC New Classics listing page:
--   https://www.popfigures.com/collections/dc?page=2
-- - Funko Yakko Warner #2066:
--   https://funko.com/pop-yakko-warner/86298.html

with target(set_name, franchise, expected_total) as (
  values
    ('Ash Vs. Evil Dead', 'Ash vs. Evil Dead', 5),
    ('The Goonies', 'The Goonies', 12),
    ('Star Wars: The Last Jedi', 'Star Wars', 41),
    ('Star Wars: Visions', 'Star Wars', 4),
    ('Fantastic Beasts And Where To Find Them', 'Wizarding World', 15)
)
update public.pop_catalog pc
set set_total = target.expected_total
from target
where lower(pc.set_name) = lower(target.set_name)
  and lower(pc.franchise) = lower(target.franchise)
  and (pc.set_total is null or pc.set_total <> target.expected_total);

update public.pop_catalog
set set_total = 4
where upc in ('889698863698', '889698863704', '889698863711', '889698863728')
  and set_name = 'DC New Classics'
  and franchise = 'DC'
  and (set_total is null or set_total <> 4);

update public.pop_catalog
set pop_name = 'Karre',
    character = 'Karre',
    number = '504',
    variant = 'Glow in the Dark',
    exclusivity = 'Target',
    description = 'Karre is a Target exclusive Pop! Star Wars release #504 from Star Wars: Visions, Glow in the Dark.',
    display_description = 'From Star Wars: Visions, Karre is a Pop! Star Wars release #504, Glow in the Dark, Target.',
    parse_confidence = greatest(coalesce(parse_confidence, 0), 0.94),
    needs_review = false
where upc = '889698613491';

update public.pop_catalog
set pop_name = 'Yakko',
    character = 'Yakko',
    number = '2066',
    description = 'Yakko is an Animaniacs Pop! Animation release #2066.',
    display_description = 'From Animaniacs, Yakko is a Pop! Animation release #2066.',
    parse_confidence = greatest(coalesce(parse_confidence, 0), 0.94),
    needs_review = false
where upc = '889698862981';
