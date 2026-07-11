-- pop_catalog rows 21-40 by api_last_updated desc, reviewed 2026-07-08.
-- Staged only. Review before applying to live Supabase.

-- Star Wars corrections.
update public.pop_catalog
set
  pop_name = 'Stormtrooper',
  character = 'Stormtrooper',
  franchise = 'Star Wars',
  set_name = 'Star Wars: Episode IV - A New Hope',
  number = '598',
  variant = null,
  exclusivity = null,
  estimated_value = 14.99,
  raw_title = 'Stormtrooper #598',
  clean_title = 'Stormtrooper #598',
  description = 'Stormtrooper is a Star Wars: Episode IV - A New Hope Pop! release #598 from the Star Wars New Classics line.',
  display_description = 'Stormtrooper is a Star Wars: Episode IV - A New Hope Pop! release #598 from the Star Wars New Classics line.',
  parse_confidence = 0.98,
  needs_review = true
where upc = '889698675376';

update public.user_collection_items
set
  owned_variant = 'Common',
  current_value = 14.99
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698675376')
  and coalesce(current_value, 0) = 6.15;

update public.pop_catalog
set
  pop_name = 'Princess Leia',
  character = 'Princess Leia',
  variant = 'Gold Chrome',
  exclusivity = 'Galactic Convention / Hot Topic',
  raw_title = 'Princess Leia [Gold Chrome] #295',
  clean_title = 'Princess Leia (Gold Chrome) #295',
  description = 'Princess Leia (Gold Chrome) is a Star Wars Pop! release #295, Galactic Convention shared exclusive.',
  display_description = 'Princess Leia (Gold Chrome) is a Star Wars Pop! release #295, Galactic Convention shared exclusive.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698430173';

update public.pop_catalog
set
  pop_name = 'Darth Vader on TIE Fighter',
  character = 'Darth Vader',
  franchise = 'Star Wars',
  set_name = 'Disney 100',
  pop_type = 'Pop! Trains',
  raw_title = 'Darth Vader on TIE Fighter #20',
  clean_title = 'Darth Vader on TIE Fighter #20',
  description = 'Darth Vader on TIE Fighter is a Disney 100 Star Wars Pop! Trains release #20, Amazon exclusive.',
  display_description = 'Darth Vader on TIE Fighter is a Disney 100 Star Wars Pop! Trains release #20, Amazon exclusive.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698704571';

update public.pop_catalog
set
  set_name = 'The Book of Boba Fett',
  description = 'Krrsantan (Flocked) is a Star Wars: The Book of Boba Fett Pop! release #548, Summer Convention exclusive.',
  display_description = 'Krrsantan (Flocked) is a Star Wars: The Book of Boba Fett Pop! release #548, Summer Convention exclusive.'
where upc = '889698652568';

update public.pop_catalog
set
  pop_name = 'Jean-Luc Picard (Transporter) (Glitter)',
  character = 'Jean-Luc Picard',
  franchise = 'Star Trek',
  set_name = 'Star Trek Transporter',
  number = '1687',
  variant = 'Glitter',
  pop_type = 'Pop! Plus',
  estimated_value = 14.99,
  raw_title = 'Jean-Luc Picard (Transporter) [Glitter] #1687',
  clean_title = 'Jean-Luc Picard (Transporter) (Glitter) #1687',
  description = 'Jean-Luc Picard (Transporter) (Glitter) is a Star Trek Pop! Plus release #1687.',
  display_description = 'Jean-Luc Picard (Transporter) (Glitter) is a Star Trek Pop! Plus release #1687.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698837729';

update public.user_collection_items
set current_value = 14.99
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698837729')
  and coalesce(current_value, 0) = 12.9;

update public.pop_catalog
set
  pop_name = 'Darth Maul (Gold Metallic)',
  character = 'Darth Maul',
  franchise = 'Star Wars',
  set_name = 'Star Wars',
  number = '9',
  variant = 'Metallic Gold',
  exclusivity = 'Walmart',
  vault_status = 'Vaulted',
  raw_title = 'Darth Maul [Metallic Gold] #9',
  clean_title = 'Darth Maul (Metallic Gold) #9',
  description = 'Darth Maul (Metallic Gold) is a Star Wars Pop! release #9, Walmart exclusive.',
  display_description = 'Darth Maul (Metallic Gold) is a Star Wars Pop! release #9, Walmart exclusive.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698430203';

update public.user_collection_items
set owned_variant = 'Metallic Gold'
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698430203')
  and owned_variant = 'Metallic';

-- DC / Batman corrections.
update public.pop_catalog
set
  pop_name = 'The Joker (Batman 1989) (Metallic)',
  character = 'The Joker',
  franchise = 'DC',
  set_name = 'Batman 1989',
  number = '337',
  variant = 'Metallic',
  exclusivity = 'Exclusive',
  pop_type = 'Pop! Heroes',
  raw_title = 'The Joker Batman 1989 [Metallic] #337',
  clean_title = 'The Joker (Batman 1989) (Metallic) #337',
  description = 'The Joker (Batman 1989) (Metallic) is a DC Pop! Heroes release #337.',
  display_description = 'The Joker (Batman 1989) (Metallic) is a DC Pop! Heroes release #337.',
  parse_confidence = 0.98,
  needs_review = true
where upc = '889698495776';

update public.user_collection_items
set owned_variant = 'Metallic'
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698495776')
  and owned_variant in ('Common', 'Metallic');

update public.pop_catalog
set
  pop_name = 'The Joker (Batman 1989) (Metallic)',
  character = 'The Joker',
  franchise = 'DC',
  set_name = 'Batman 1989',
  number = '337',
  variant = 'Metallic',
  exclusivity = 'GameStop',
  pop_type = 'Pop! Heroes',
  raw_title = 'The Joker Batman 1989 [Metallic] #337',
  clean_title = 'The Joker (Batman 1989) (Metallic) #337',
  description = 'The Joker (Batman 1989) (Metallic) is a DC Pop! Heroes release #337.',
  display_description = 'The Joker (Batman 1989) (Metallic) is a DC Pop! Heroes release #337.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698477093';

update public.user_collection_items
set owned_variant = 'Metallic'
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698477093')
  and owned_variant = 'Chase';

update public.pop_catalog
set
  set_name = 'DC New Classics',
  description = 'Wonder Woman is a DC New Classics Pop! Heroes release #600.',
  display_description = 'Wonder Woman is a DC New Classics Pop! Heroes release #600.'
where upc = '889698863711';

update public.pop_catalog
set
  set_name = 'DC New Classics',
  description = 'Green Lantern is a DC New Classics Pop! Heroes release #601.',
  display_description = 'Green Lantern is a DC New Classics Pop! Heroes release #601.'
where upc = '889698863728';

update public.pop_catalog
set
  set_name = 'DC New Classics',
  description = 'Superman is a DC New Classics Pop! Heroes release #599.',
  display_description = 'Superman is a DC New Classics Pop! Heroes release #599.'
where upc = '889698863704';

update public.pop_catalog
set
  set_name = 'DC New Classics',
  description = 'Batman is a DC New Classics Pop! Heroes release #598.',
  display_description = 'Batman is a DC New Classics Pop! Heroes release #598.'
where upc = '889698863698';

-- Movies corrections.
update public.pop_catalog
set
  franchise = 'Indiana Jones',
  set_name = 'Indiana Jones and the Last Crusade',
  description = 'Sallah is an Indiana Jones and the Last Crusade Pop! Movies release #1352.',
  display_description = 'Sallah is an Indiana Jones and the Last Crusade Pop! Movies release #1352.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698639880';

update public.pop_catalog
set
  franchise = 'Back to the Future',
  set_name = 'Back to the Future',
  vault_status = 'Vaulted',
  description = 'Biff Tannen is a Back to the Future Pop! Movies release #963.',
  display_description = 'Biff Tannen is a Back to the Future Pop! Movies release #963.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698485159';

-- Verification query for the reviewed window.
select upc, pop_name, character, franchise, set_name, number, variant, exclusivity, pop_type, vault_status, estimated_value, parse_confidence, needs_review
from public.pop_catalog
where upc in (
  '889698675376','889698407021','889698430173','889698704571','889698520263',
  '889698652568','889698837729','889698477055','889698477062','889698430203',
  '889698495776','889698639880','889698477086','889698477093','849803064228',
  '889698863711','889698863728','889698485159','889698863704','889698863698'
)
order by api_last_updated desc nulls last;
