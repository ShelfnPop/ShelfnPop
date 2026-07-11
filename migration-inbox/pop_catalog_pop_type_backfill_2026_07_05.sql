update public.pop_catalog
set pop_type =
  case
    when franchise = 'Marvel' then 'Pop! Marvel'
    when franchise = 'DC' then 'Pop! Heroes'
    when franchise = 'Star Wars' then 'Pop! Star Wars'
    when franchise in ('Disney', 'Toy Story', 'The Nightmare Before Christmas', 'The Good Dinosaur', 'Disney Afternoon') then 'Pop! Disney'
    when franchise in ('Pop! Rocks', '*NSYNC', 'Boyz II Men', 'Disturbed', 'Dolly Parton', 'Elvis Presley', 'New Kids on the Block', 'Pink', 'Whitney Houston') then 'Pop! Rocks'
    when franchise in ('WWE') then 'Pop! WWE'
    when franchise in ('NFL') then 'Pop! Sports'
    when franchise in ('Five Nights at Freddy''s', 'Fallout', 'Spyro', 'Crash Bandicoot', 'Cuphead') or franchise like 'Pok%' then 'Pop! Games'
    when franchise in ('The Simpsons', 'Futurama', 'South Park', 'Rick and Morty', 'Animaniacs', 'Looney Tunes', 'Ben 10', 'Cartoon Network', 'Chilly Willy', 'Invincible', 'Jujutsu Kaisen', 'WondLa', 'The Adventures Of Jimmy Neutron Boy Genius') then 'Pop! Animation'
    when franchise in ('Stranger Things', 'Game of Thrones', 'Peacemaker', 'The Witcher', 'Preacher', 'Scrubs', 'The Office', 'Lost', 'Supernatural', 'Saved by the Bell', 'Grey''s Anatomy', 'House', 'Psych', 'Saturday Night Live', 'Sherlock', 'Suits', 'Ted Lasso', 'The Big Bang Theory', 'The Tick', 'The Umbrella Academy', 'The Walking Dead', 'Yellowstone', 'Ash vs. Evil Dead', 'Beavis and Butt-Head') then 'Pop! Television'
    when franchise in ('Bob Ross', 'Funko', 'Pop! Icons', 'Zodiac') then 'Pop! Icons'
    when franchise in ('Coca-Cola', 'Brandalised') then 'Pop! Ad Icons'
    when franchise in ('G.I. Joe', 'Masters of the Universe') then 'Pop! Retro Toys'
    when concat_ws(' ', raw_title, clean_title, pop_name, set_name, franchise) ~* '\b(Pop!?\s*Television|Pop!?\s*TV|Television)\b' then 'Pop! Television'
    when concat_ws(' ', raw_title, clean_title, pop_name, set_name, franchise) ~* '\b(Pop!?\s*Movies?|Movies?)\b' then 'Pop! Movies'
    when concat_ws(' ', raw_title, clean_title, pop_name, set_name, franchise) ~* '\b(Pop!?\s*Games?|Video Games?)\b' then 'Pop! Games'
    when concat_ws(' ', raw_title, clean_title, pop_name, set_name, franchise) ~* '\b(Pop!?\s*Rocks?)\b' then 'Pop! Rocks'
    when concat_ws(' ', raw_title, clean_title, pop_name, set_name, franchise) ~* '\b(Pop!?\s*Animation|Animation)\b' then 'Pop! Animation'
    when concat_ws(' ', raw_title, clean_title, pop_name, set_name, franchise) ~* '\b(Pop!?\s*Disney|Disney|Pixar)\b' then 'Pop! Disney'
    when concat_ws(' ', raw_title, clean_title, pop_name, set_name, franchise) ~* '\b(Pop!?\s*Marvel|Marvel)\b' then 'Pop! Marvel'
    when concat_ws(' ', raw_title, clean_title, pop_name, set_name, franchise) ~* '\b(Pop!?\s*Heroes|DC Comics|DC Super Heroes)\b' then 'Pop! Heroes'
    when concat_ws(' ', raw_title, clean_title, pop_name, set_name, franchise) ~* '\b(Pop!?\s*Star Wars|Star Wars)\b' then 'Pop! Star Wars'
    when concat_ws(' ', raw_title, clean_title, pop_name, set_name, franchise) ~* '\b(Pop!?\s*Ad Icons?|Ad Icons?)\b' then 'Pop! Ad Icons'
    when concat_ws(' ', raw_title, clean_title, pop_name, set_name, franchise) ~* '\b(Pop!?\s*Icons?|Icons?)\b' then 'Pop! Icons'
    when concat_ws(' ', raw_title, clean_title, pop_name, set_name, franchise) ~* '\b(Pop!?\s*Sports?|Sports?)\b' then 'Pop! Sports'
    when concat_ws(' ', raw_title, clean_title, pop_name, set_name, franchise) ~* '\b(Pop!?\s*WWE|WWE)\b' then 'Pop! WWE'
    else 'Pop! Movies'
  end,
  api_last_updated = now()
where pop_type is null
  or btrim(pop_type) = ''
  or pop_type = 'Pop';
