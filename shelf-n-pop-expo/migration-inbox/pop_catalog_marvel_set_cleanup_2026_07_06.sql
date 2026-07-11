-- Marvel set cleanup pass, 2026-07-06.
-- Normalize duplicate Marvel set labels and move clear title-derived rows
-- out of the broad Marvel Universe bucket.

with changes(upc, set_name, pop_name, character, variant, description) as (
  values
    ('889698615006', 'Marvel Comics', null, null, null, 'Moon Knight is a Marvel Comics Pop! Marvel release #8.'),
    ('889698160049', 'Marvel Zombies', 'Zombie Morbius', 'Zombie Morbius', null, 'Zombie Morbius is a Marvel Zombies Pop! Marvel release #105.'),
    ('889698588676', 'Spider-Man: The Animated Series', null, null, null, 'Hobgoblin is a Spider-Man: The Animated Series Pop! Marvel release #165, US Exclusive.'),
    ('889698111812', 'Marvel Comics', 'Iron Fist', 'Iron Fist', null, 'Iron Fist is a Marvel Comics Pop! Marvel release #188.'),
    ('889698211116', 'Marvel Comics', null, null, null, 'Moon Knight is a Marvel Comics Pop! Marvel release #272, Walgreens exclusive.'),
    ('8969828803', 'Marvel Comics', null, null, null, 'Gwenom is a Marvel Comics Pop! Marvel release #302.'),
    ('889698147910', 'Spider-Man', null, null, null, 'Superior Spider-Man is a Spider-Man Pop! Marvel release #233, Exclusive.'),
    ('889698294690', 'Spider-Man', null, null, null, 'Six Arm Spider-Man is a Spider-Man Pop! Marvel release #313.'),
    ('889698588614', 'Spider-Man', null, null, null, 'Spider-Girl is a Spider-Man Pop! Marvel release #955, Chase Exclusive.'),
    ('889698588690', 'Spider-Man', null, null, null, 'Madame Web is a Spider-Man Pop! Marvel release #960.'),
    ('889698591768', 'Spider-Man', null, null, null, 'Spider-Man is a Spider-Man Pop! Marvel release #961.'),
    ('889698622806', 'Spider-Man', 'Mangaverse Spider-Man', 'Spider-Man', null, 'Mangaverse Spider-Man is a Spider-Man Pop! Marvel release #982.'),
    ('889698739559', 'Marvel Comics', null, null, null, 'Gwen Stacy is a Marvel Comics Pop! Marvel release #1275, Exclusive.'),
    ('889698745277', 'Marvel Comics', null, null, null, 'Spinneret is a Marvel Comics Pop! Marvel release #1293, Exclusive.'),
    ('889698826457', 'Marvel Comics', null, null, null, 'Carnage Ghost Spider is a Marvel Comics Pop! Marvel release #1435.'),
    ('889698826464', 'Marvel Comics', null, null, null, 'Carnage Iron Man is a Marvel Comics Pop! Marvel release #1437.'),
    ('889698609104', 'X-Men', 'Omega Red', 'Omega Red', null, 'Omega Red is an X-Men Pop! Marvel release #980, Exclusive.'),
    ('889698785396', 'X-Men', null, null, null, 'Wolverine is an X-Men Pop! Marvel release #1376.'),
    ('889698506632', 'Marvel Holiday', null, null, null, 'Holiday Gingerbread Thor is a Marvel Holiday Pop! Marvel release #938.'),
    ('889698571296', 'Marvel Holiday', null, null, null, 'Holiday Scarlet Witch is a Marvel Holiday Pop! Marvel release #940.'),
    ('889698581967', 'Marvel Holiday', null, null, null, 'Holiday Thanos is a Marvel Holiday Pop! Marvel release #951.'),
    ('889698717519', 'Captain Marvel', 'Captain Marvel', 'Captain Marvel', null, 'Captain Marvel is a Captain Marvel Pop! Marvel release #1263, San Diego Comic-Con exclusive.'),
    ('889698489027', 'Captain Marvel', 'Dark Captain Marvel', 'Dark Captain Marvel', null, 'Dark Captain Marvel is a Captain Marvel Pop! Marvel release #657, Summer Convention exclusive.'),
    ('849803097479', 'Deadpool', null, null, null, 'Deadpool is a Deadpool Pop! Marvel release #145.'),
    ('889698308656', 'Deadpool', null, null, null, 'Deadpool as Bob Ross is a Deadpool Pop! Marvel release #319.'),
    ('889698308502', 'Deadpool', null, null, null, 'Deadpool is a Deadpool Pop! Marvel release #320.'),
    ('889698569798', 'Deadpool', null, null, 'Pride', 'Deadpool is a Deadpool Pop! Marvel Ride release #320, Pride variant.'),
    ('889698325936', 'Deadpool', null, null, null, 'Mermaid Deadpool is a Deadpool Pop! Marvel release #321, Metallic.'),
    ('889698545501', 'Deadpool', null, null, null, 'Deadpool with Teddy Pants is a Deadpool Pop! Marvel release #754.'),
    ('889698800358', 'Deadpool', null, null, null, 'Deadpool is a Deadpool Pop! Marvel release #1442.'),
    ('889698506786', 'Marvel Zombies', null, null, null, 'Zombie Morbius is a Marvel Zombies Pop! Marvel release #763, Emerald City Comic-Con exclusive.'),
    ('889698687300', 'Moon Knight', null, null, null, 'Mr. Knight is a Moon Knight Pop! Marvel release #1199.'),
    ('889698871303', 'Spider-Man', null, null, null, 'Friendly Neighborhood Spider-Man is a Spider-Man Pop! Marvel release #1529, Exclusive.'),
    ('889698843874', 'Spider-Man', 'Spider-Man Last Stand', 'Spider-Man Last Stand', null, 'Spider-Man Last Stand is a Spider-Man Pop! Marvel release #1450, Exclusive.'),
    ('889698556446', 'Spider-Man: Maximum Venom', null, null, null, 'Venomized Ironheart is a Spider-Man: Maximum Venom Pop! Marvel release #842, Exclusive.'),
    ('889698482936', 'Spider-Man', null, null, null, 'Spider-Man Imposter is a Spider-Man Pop! Marvel 2-Pack, Entertainment Earth exclusive.'),
    ('889698581851', 'Venom', null, null, null, 'Venomized Jack O''Lantern is a Venom Pop! Marvel release #922.'),
    ('889698675130', 'Guardians of the Galaxy Vol. 3', null, null, null, 'Adam Warlock is a Guardians of the Galaxy Vol. 3 Pop! Marvel release #1214, Collectors Corps exclusive.'),
    ('889698680509', 'Guardians of the Galaxy Vol. 3', null, null, null, 'Mantis is a Guardians of the Galaxy Vol. 3 Pop! Marvel release #1212.'),
    ('889698687263', 'Guardians of the Galaxy Vol. 3', null, null, null, 'Groot is a Guardians of the Galaxy Vol. 3 Pop! Marvel release #1213, Funko Shop exclusive.'),
    ('889698675086', 'Guardians of the Galaxy Vol. 3', null, null, null, 'Star-Lord is a Guardians of the Galaxy Vol. 3 Pop! Marvel release #1201.'),
    ('889698675093', 'Guardians of the Galaxy Vol. 3', null, null, null, 'Rocket is a Guardians of the Galaxy Vol. 3 Pop! Marvel release #1202.'),
    ('889698680530', 'Guardians of the Galaxy Vol. 3', null, null, null, 'Drax is a Guardians of the Galaxy Vol. 3 Pop! Marvel release #1204.'),
    ('889698675116', 'Guardians of the Galaxy Vol. 3', null, null, null, 'Nebula is a Guardians of the Galaxy Vol. 3 Pop! Marvel release #1205.'),
    ('889698680486', 'Guardians of the Galaxy Vol. 3', null, null, null, 'Mantis is a Guardians of the Galaxy Vol. 3 Pop! Marvel release #1206.'),
    ('889698692236', 'Guardians of the Galaxy Vol. 3', null, null, null, 'Baby Rocket is a Guardians of the Galaxy Vol. 3 Pop! Marvel release #1208, Flocked US Exclusive.'),
    ('889698675178', 'Guardians of the Galaxy Vol. 3', null, null, null, 'Kraglin is a Guardians of the Galaxy Vol. 3 Pop! Marvel release #1209.'),
    ('889698721691', 'Loki Season 2', null, null, null, 'Loki is a Loki Season 2 Pop! Marvel release #1312.'),
    ('889698721714', 'Loki Season 2', null, null, null, 'Sylvie is a Loki Season 2 Pop! Marvel release #1314.'),
    ('889698837255', 'Gwen-Verse', null, null, null, 'Wolver-Gwen is a Gwen-Verse Pop! Marvel release #1487.'),
    ('889698680448', 'What If...?', null, null, null, 'Goliath is a What If...? Pop! Marvel release #1467.'),
    ('889698562775', 'What If...?', null, null, null, 'Doctor Strange Supreme is a What If...? Pop! Marvel release #874, Glow in the Dark.'),
    ('889698741019', 'X-Men ''97', 'Goblin Queen', 'Goblin Queen', null, 'Goblin Queen is an X-Men ''97 Pop! Marvel release #1304, New York Comic-Con Chase.'),
    ('889698841160', 'X-Men', null, null, null, 'Blink is an X-Men Pop! Marvel release #1458.'),
    ('889698837903', 'The Infinity Saga', null, null, null, 'Peggy Carter is a The Infinity Saga Pop! Marvel release.'),
    ('889698675161', 'Guardians of the Galaxy Vol. 3', null, null, null, 'Baby Rocket is a Guardians of the Galaxy Vol. 3 Pop! Marvel release #1208.'),
    ('889698594806', 'Hawkeye', null, null, null, 'Hawkeye is a Hawkeye Pop! Marvel release #1211.'),
    ('889698594813', 'Hawkeye', 'Kate Bishop & Lucky the Pizza Dog', 'Kate Bishop & Lucky the Pizza Dog', null, 'Kate Bishop & Lucky the Pizza Dog is a Hawkeye Pop! Marvel release #1212.'),
    ('889698594820', 'Hawkeye', 'Yelena', 'Yelena', null, 'Yelena is a Hawkeye Pop! Marvel release #1213, Chase.'),
    ('889698797665', 'Deadpool & Wolverine', null, null, null, 'Deadpool is a Deadpool & Wolverine Pop! Marvel release #1362.'),
    ('889698797672', 'Deadpool & Wolverine', null, null, null, 'Wolverine is a Deadpool & Wolverine Pop! Marvel release #1363.'),
    ('889698797696', 'Deadpool & Wolverine', null, null, null, 'Dogpool is a Deadpool & Wolverine Pop! Marvel release #1401.'),
    ('889698823814', 'Deadpool & Wolverine', null, null, null, 'Kidpool is a Deadpool & Wolverine Pop! Marvel release #1402.'),
    ('889698823821', 'Deadpool & Wolverine', null, null, null, 'Wolverine is a Deadpool & Wolverine Pop! Marvel release #1403.'),
    ('889698850742', 'Deadpool & Wolverine', null, null, null, 'Ladypool is a Deadpool & Wolverine Pop! Marvel release #1404, Diamond Collection.'),
    ('889698852890', 'Deadpool & Wolverine', null, null, null, 'Ladypool is a Deadpool & Wolverine Pop! Marvel release #1404, Diamond Collection.'),
    ('889698849067', 'Deadpool & Wolverine', null, null, null, 'Wade Wilson is a Deadpool & Wolverine Pop! Marvel release #1470, Funko Shop exclusive.')
)
update public.pop_catalog as p
set
  set_name = c.set_name,
  pop_name = coalesce(c.pop_name, p.pop_name),
  character = coalesce(c.character, p.character),
  variant = coalesce(c.variant, p.variant),
  description = c.description,
  display_description = c.description,
  parse_confidence = greatest(coalesce(p.parse_confidence, 0), 0.94),
  needs_review = false
from changes c
where p.upc = c.upc;

update public.pop_catalog
set set_name = case set_name
  when 'Avengers: Age Of Ultron' then 'Avengers: Age of Ultron'
  when 'Ant-Man And The Wasp: Quantumania' then 'Ant-Man and the Wasp: Quantumania'
  when 'Doctor Strange In The Multiverse Of Madness' then 'Doctor Strange in the Multiverse of Madness'
  when 'Guardians Of The Galaxy' then 'Guardians of the Galaxy'
  when 'Guardians Of The Galaxy Vol. 2' then 'Guardians of the Galaxy Vol. 2'
  when 'Guardians Of The Galaxy: Series 1' then 'Guardians of the Galaxy: Series 1'
  when 'Guardians Of The Galaxy: Series 2' then 'Guardians of the Galaxy: Series 2'
  when 'Shang-Chi And The Legend Of The Ten Rings' then 'Shang-Chi and the Legend of the Ten Rings'
  when 'She Hulk: Attorney At Law' then 'She-Hulk: Attorney at Law'
  when 'The Falcon And The Winter Soldier' then 'The Falcon and the Winter Soldier'
  when 'Thor: Love And Thunder' then 'Thor: Love and Thunder'
  else set_name
end
where set_name in (
  'Avengers: Age Of Ultron',
  'Ant-Man And The Wasp: Quantumania',
  'Doctor Strange In The Multiverse Of Madness',
  'Guardians Of The Galaxy',
  'Guardians Of The Galaxy Vol. 2',
  'Guardians Of The Galaxy: Series 1',
  'Guardians Of The Galaxy: Series 2',
  'Shang-Chi And The Legend Of The Ten Rings',
  'She Hulk: Attorney At Law',
  'The Falcon And The Winter Soldier',
  'Thor: Love And Thunder'
);
