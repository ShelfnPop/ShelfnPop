begin;

with franchise_updates(upc, franchise, set_name, exclusivity) as (
  values
    ('889698675772', 'DC', 'Aquaman And The Lost Kingdom', null),
    ('889698610087', 'Pop! Rocks', 'Britney Spears', 'Barnes & Noble'),
    ('889698113434', 'Beetlejuice', 'Beetlejuice', null),
    ('889698641876', 'DC', 'Black Adam', null),
    ('889698641951', 'DC', 'Black Adam', null),
    ('889698366519', 'Pop! Rocks', 'Britney Spears', null),
    ('889698520331', 'Pop! Rocks', 'Britney Spears', null),
    ('889698798112', 'Pop! Rocks', 'Britney Spears', null),
    ('889698614351', 'Pop! Rocks', 'Britney Spears', null),
    ('889698761222', 'Caddyshack', 'Caddyshack', null),
    ('889698577960', 'Cartoon Network', 'Cartoon Network', null),
    ('889698509497', 'Disney', 'Casey Jr. Circus Train Attraction', null),
    ('889698614184', 'Cuphead', 'Cuphead', null),
    ('830395033686', 'Despicable Me', 'Despicable Me 2', null),
    ('889698557504', 'Dirty Dancing', 'Dirty Dancing', null),
    ('889698557511', 'Dirty Dancing', 'Dirty Dancing', null),
    ('889698657037', 'Disturbed', 'Disturbed', null),
    ('889698830645', 'Funko', 'Funko Fusion', null),
    ('889698830669', 'Funko', 'Funko Fusion', null),
    ('889698364232', 'Grey''s Anatomy', 'Grey''s Anatomy', null),
    ('889698737883', 'Jujutsu Kaisen', 'Jujutsu Kaisen', null),
    ('889698120265', 'Lost', 'Lost', null),
    ('889698124133', 'Lost', 'Lost', null),
    ('849803053796', 'Monty Python And The Holy Grail', 'Monty Python And The Holy Grail', null),
    ('849803053833', 'Monty Python And The Holy Grail', 'Monty Python And The Holy Grail', null),
    ('0849803053833', 'Monty Python And The Holy Grail', 'Monty Python And The Holy Grail', null),
    ('849803053826', 'Monty Python And The Holy Grail', 'Monty Python And The Holy Grail', null),
    ('0849803053819', 'Monty Python And The Holy Grail', 'Monty Python And The Holy Grail', null),
    ('889698345460', '*NSYNC', 'NSYNC', null),
    ('889698345408', '*NSYNC', 'NSYNC', null),
    ('889698345415', '*NSYNC', 'NSYNC', null),
    ('889698345385', '*NSYNC', 'NSYNC', null),
    ('889698345439', '*NSYNC', 'NSYNC', null),
    ('889698570664', 'Pop! Rocks', 'Britney Spears', 'New York Comic Con'),
    ('889698552509', 'Rick and Morty', 'Rick and Morty', null),
    ('889698356008', 'Scrubs', 'Scrubs', null),
    ('889698363433', 'Scrubs', 'Scrubs', null),
    ('889698355988', 'Scrubs', 'Scrubs', null),
    ('889698355995', 'Scrubs', 'Scrubs', null),
    ('849803061319', 'Shaun Of The Dead', 'Shaun Of The Dead', null),
    ('889698849319', 'Shaun Of The Dead', 'Shaun Of The Dead', null),
    ('849803061326', 'Shaun Of The Dead', 'Shaun Of The Dead', null),
    ('889698781831', 'Disney', 'Sleeping Beauty 65th Anniversary', null),
    ('889698516365', 'South Park', 'South Park', null),
    ('889698518444', 'South Park', 'South Park', null),
    ('889698686372', 'South Park', 'South Park', 'South Park Shop'),
    ('889698678704', 'Spellbound', 'Spellbound', null),
    ('849803054328', 'Ted', 'Ted 2', null),
    ('889698707176', 'Ted Lasso', 'Ted Lasso', null),
    ('889698757416', 'The Adventures Of Jimmy Neutron Boy Genius', 'The Adventures Of Jimmy Neutron Boy Genius', null),
    ('889698287470', 'The Tick', 'The Tick', null),
    ('889698613545', 'Whitney Houston', 'Whitney Houston', null),
    ('889698797535', 'WondLa', 'Wondla', null),
    ('889698883238', 'Zodiac', 'Zodiac', null),
    ('889698364201', 'Zoolander', 'Zoolander', null)
)
update public.pop_catalog pc
set franchise = fu.franchise,
    set_name = fu.set_name,
    exclusivity = coalesce(fu.exclusivity, pc.exclusivity),
    api_last_updated = now()
from franchise_updates fu
where pc.upc = fu.upc
  and (nullif(btrim(pc.franchise), '') is null
       or pc.set_name is distinct from fu.set_name
       or (fu.exclusivity is not null and pc.exclusivity is distinct from fu.exclusivity));

with targeted_updates(upc, franchise, set_name, variant, exclusivity, pop_name) as (
  values
    ('889698691901', 'The Lord of the Rings', 'The Lord of the Rings', null, null, 'Smeagol'),
    ('889698469319', 'Pop! Rocks', 'Weezer', null, null, 'Rivers Cuomo'),
    ('889698844574', 'Pop! Rocks', 'Britney Spears', null, null, 'Minis Britney Spears'),
    ('889698429863', 'DC', 'DC Super Heroes', 'Metallic', 'Target REDcard', 'Batman'),
    ('889698632591', 'DC', 'DC Super Heroes', 'Diamond Collection', 'DC Shop', 'Batman'),
    ('889698342100', 'DC', 'DC Super Heroes', 'Chrome', 'New York Comic Con', 'Batman'),
    ('830395022017', 'DC', 'DC Super Heroes', 'Metallic Chase', null, 'Batman'),
    ('849803074982', 'DC', 'DC Super Heroes', 'Metallic Chase', null, 'Batman'),
    ('889698581684', 'DC', 'Zack Snyder''s Justice League', 'Black & White', 'DC Shop', 'Diana Prince'),
    ('889698601474', 'The Witcher', 'The Witcher', null, 'Books-A-Million', 'Battle Yennefer'),
    ('889698133234', 'Stranger Things', 'Stranger Things', null, 'Barnes & Noble', 'Dustin'),
    ('889698135511', 'The Lord of the Rings', 'The Lord Of The Rings', 'Translucent', 'Barnes & Noble', 'Frodo Baggins'),
    ('889698135610', 'The Lord of the Rings', 'The Lord Of The Rings', null, 'Barnes & Noble', 'Gollum (Invisible Ver.)'),
    ('889698506946', 'Masters of the Universe', 'Masters Of The Universe', null, 'Toy Tokyo', 'Ninjor'),
    ('889698542593', 'The Office', 'The Office', null, 'Emerald City Comic Con', 'Dwight Schrute'),
    ('889698787819', 'The Simpsons', 'The Simpsons', null, 'Funkon London', 'Homer With Reactor'),
    ('889698405126', 'Game of Thrones', 'Game Of Thrones', 'Metallic', 'AT&T', 'Night King'),
    ('889698520614', 'The Office', 'Threat Level Midnight', null, 'Go! Calendars', 'Michael Scarn'),
    ('889698555289', 'Marvel', 'Marvel Universe', null, 'Summer Convention', 'Falcon'),
    ('889698504317', 'Marvel', 'Marvel Zombies', null, 'Special Edition', 'Zombie Silver Surfer'),
    ('889698509640', 'Star Wars', 'The Mandalorian', null, 'D23 First To Market', 'The Mandalorian')
)
update public.pop_catalog pc
set franchise = coalesce(tu.franchise, pc.franchise),
    set_name = coalesce(tu.set_name, pc.set_name),
    variant = coalesce(tu.variant, pc.variant),
    exclusivity = coalesce(tu.exclusivity, pc.exclusivity),
    pop_name = coalesce(tu.pop_name, pc.pop_name),
    api_last_updated = now()
from targeted_updates tu
where pc.upc = tu.upc;

update public.pop_catalog
set set_name = 'Star Wars',
    api_last_updated = now()
where upc in ('830395023878', '889698864527')
  and nullif(btrim(set_name), '') is null;

update public.pop_catalog
set set_name = 'Spider-Man',
    api_last_updated = now()
where upc = '889698918107'
  and nullif(btrim(set_name), '') is null;

update public.pop_catalog
set set_name = 'Marvel',
    api_last_updated = now()
where upc = '889698774369'
  and nullif(btrim(set_name), '') is null;

delete from public.pop_catalog
where upc = '070847003229'
  and not exists (select 1 from public.user_collection_items u where u.pop_catalog_id = pop_catalog.id)
  and not exists (select 1 from public.wishlist_items w where w.pop_catalog_id = pop_catalog.id);

commit;
