-- Targeted cleanup from pop_catalog_rows_parser_review_2.csv.
-- Exact UPC updates for rows visible in the latest 100-row export.

update public.pop_catalog set
  franchise = 'Five Nights at Freddy''s',
  set_name = 'Five Nights at Freddy''s',
  number = null,
  api_last_updated = now()
where upc = '889698871167';

update public.pop_catalog set
  pop_name = 'Withered Chica',
  character = 'Withered Chica',
  franchise = 'Five Nights at Freddy''s',
  set_name = 'Five Nights at Freddy''s',
  number = null,
  api_last_updated = now()
where upc = '889698838658';

update public.pop_catalog set
  pop_name = 'Ruined Chica',
  character = 'Ruined Chica',
  franchise = 'Five Nights at Freddy''s',
  set_name = 'Five Nights at Freddy''s: Security Breach',
  api_last_updated = now()
where upc = '889698724715';

update public.pop_catalog set
  pop_name = 'Tiger Rock',
  character = 'Tiger Rock',
  franchise = 'Five Nights at Freddy''s',
  set_name = 'Five Nights at Freddy''s',
  api_last_updated = now()
where upc = '889698918213';

update public.pop_catalog set
  pop_name = 'Withered Bonnie',
  character = 'Withered Bonnie',
  franchise = 'Five Nights at Freddy''s',
  set_name = 'Five Nights at Freddy''s',
  number = null,
  api_last_updated = now()
where upc = '889698838641';

update public.pop_catalog set
  pop_name = 'Peacemaker Doppelganger',
  character = 'Peacemaker Doppelganger',
  franchise = 'Peacemaker',
  set_name = 'Peacemaker S3',
  api_last_updated = now()
where upc = '889698919913';

update public.pop_catalog set
  pop_name = 'Withered Foxy',
  character = 'Withered Foxy',
  franchise = 'Five Nights at Freddy''s',
  set_name = 'Five Nights at Freddy''s',
  api_last_updated = now()
where upc = '889698838665';

update public.pop_catalog set
  pop_name = 'Supergirl With Puppy Krypto',
  character = 'Supergirl With Puppy Krypto',
  franchise = 'DC',
  api_last_updated = now()
where upc = '889698908016';

update public.pop_catalog set
  pop_name = 'DJ Music Man',
  character = 'DJ Music Man',
  franchise = 'Five Nights at Freddy''s',
  set_name = 'Five Nights at Freddy''s: Help Wanted 2',
  api_last_updated = now()
where upc = '889698861175';

update public.pop_catalog set
  pop_name = 'Nacho Libre',
  character = 'Nacho Libre',
  franchise = 'Nacho Libre',
  number = null,
  variant = null,
  api_last_updated = now()
where upc = '889698363471';

update public.pop_catalog set
  pop_name = 'TieDye Freddy',
  character = 'TieDye Freddy',
  franchise = 'Five Nights at Freddy''s',
  set_name = 'Five Nights at Freddy''s',
  api_last_updated = now()
where upc = '889698642323';

update public.pop_catalog set
  pop_name = 'Venom With Wings',
  character = 'Venom With Wings',
  franchise = 'Marvel',
  set_name = 'Mech Strike',
  api_last_updated = now()
where upc = '889698631501';

update public.pop_catalog set
  pop_name = 'Balloon Bonnie',
  character = 'Balloon Bonnie',
  franchise = 'Five Nights at Freddy''s',
  set_name = 'Five Nights at Freddy''s',
  api_last_updated = now()
where upc = '889698676250';

update public.pop_catalog set
  pop_name = 'Jack-O-Moon',
  character = 'Jack-O-Moon',
  franchise = 'Five Nights at Freddy''s',
  set_name = 'Five Nights at Freddy''s: Help Wanted 2',
  api_last_updated = now()
where upc = '889698885553';

update public.pop_catalog set
  pop_name = 'Holiday Snow Chica',
  character = 'Holiday Snow Chica',
  franchise = 'Five Nights at Freddy''s',
  set_name = 'Five Nights at Freddy''s',
  api_last_updated = now()
where upc = '889698724869';

update public.pop_catalog set
  pop_name = 'Eclipse',
  character = 'Eclipse',
  franchise = 'Five Nights at Freddy''s',
  variant = coalesce(nullif(variant, ''), 'Glow in the Dark'),
  api_last_updated = now()
where upc = '889698883023';

update public.pop_catalog set
  pop_name = 'Raj Koothrappali',
  character = 'Raj Koothrappali',
  franchise = 'The Big Bang Theory',
  number = null,
  api_last_updated = now()
where upc = '889698417044';

update public.pop_catalog set
  pop_name = 'Heatblast',
  character = 'Heatblast',
  franchise = 'Ben 10',
  number = null,
  api_last_updated = now()
where upc = '889698862950';

update public.pop_catalog set
  pop_name = 'Conrad Carapax',
  character = 'Conrad Carapax',
  franchise = 'DC',
  set_name = 'Blue Beetle',
  api_last_updated = now()
where upc = '889698723527';

update public.pop_catalog set
  pop_name = 'Withered Golden Freddy',
  character = 'Withered Golden Freddy',
  franchise = 'Five Nights at Freddy''s',
  set_name = 'Five Nights at Freddy''s',
  api_last_updated = now()
where upc = '889698830911';

update public.pop_catalog set
  pop_name = 'Guy',
  character = 'Guy',
  franchise = 'Free Guy',
  number = '1241',
  exclusivity = coalesce(nullif(exclusivity, ''), 'NYCC'),
  api_last_updated = now()
where upc = '889698645355';

update public.pop_catalog set
  pop_name = 'The Penguin',
  character = 'The Penguin',
  franchise = 'DC',
  set_name = 'Batman Returns',
  pop_style = 'Art Series',
  api_last_updated = now()
where upc = '889698601016';

update public.pop_catalog set
  pop_name = 'Morgan With Helmet & Hologram Tony Stark',
  character = 'Morgan With Helmet & Hologram Tony Stark',
  franchise = 'Marvel',
  set_name = 'Avengers: Endgame',
  variant = coalesce(nullif(variant, ''), 'Glow in the Dark'),
  api_last_updated = now()
where upc = '889698543279';

update public.pop_catalog set
  pop_name = 'Thor',
  character = 'Thor',
  franchise = 'Marvel',
  variant = coalesce(nullif(variant, ''), 'Glow in the Dark'),
  api_last_updated = now()
where upc = '889698297738';

update public.pop_catalog set
  pop_name = 'Oogie Boogie Wheel',
  character = 'Oogie Boogie Wheel',
  franchise = 'The Nightmare Before Christmas',
  number = '811',
  api_last_updated = now()
where upc = '889698405911';

update public.pop_catalog set
  pop_name = 'Surtur',
  character = 'Surtur',
  franchise = 'Marvel',
  api_last_updated = now()
where upc = '889698137744';

update public.pop_catalog set
  pop_name = 'Black Lantern Reverse Flash',
  character = 'Black Lantern Reverse Flash',
  franchise = 'DC',
  number = '68',
  api_last_updated = now()
where upc = '849803050580';

update public.pop_catalog set
  pop_name = 'Black Widow',
  character = 'Black Widow',
  franchise = 'Marvel',
  set_name = 'Avengers: Age of Ultron',
  api_last_updated = now()
where upc = '849803047931';

update public.pop_catalog set
  pop_name = 'New 52 Reverse Flash',
  character = 'New 52 Reverse Flash',
  franchise = 'DC',
  number = '81',
  api_last_updated = now()
where upc = '849803071714';

update public.pop_catalog set
  pop_name = 'Black Panther',
  character = 'Black Panther',
  franchise = 'Marvel',
  number = '1217',
  api_last_updated = now()
where upc = '889698691970';

update public.pop_catalog set
  pop_name = 'Billy And Tommy',
  character = 'Billy And Tommy',
  franchise = 'Marvel',
  set_name = 'WandaVision',
  exclusivity = coalesce(nullif(exclusivity, ''), 'Spring Convention'),
  number = null,
  api_last_updated = now()
where upc = '889698543156';
