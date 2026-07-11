-- Last 20 scanned-in collection row review, 2026-07-08.
-- Staged only. Review before applying to live Supabase.

-- High-confidence catalog identity/value fixes.

update public.pop_catalog
set
  pop_name = 'Young Anakin Skywalker (Podracer)',
  character = 'Anakin Skywalker',
  franchise = 'Star Wars',
  set_name = 'Star Wars: Episode I - The Phantom Menace',
  number = '231',
  exclusivity = 'Walgreens',
  clean_title = 'Young Anakin Skywalker (Podracer) #231',
  description = 'Young Anakin Skywalker (Podracer) is a Star Wars Pop! release #231, Walgreens exclusive.',
  display_description = 'Young Anakin Skywalker (Podracer) is a Star Wars Pop! release #231, Walgreens exclusive.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698147989';

update public.pop_catalog
set
  pop_name = 'The Mandalorian (Hologram)',
  character = 'The Mandalorian',
  franchise = 'Star Wars',
  set_name = 'The Mandalorian',
  number = '345',
  variant = 'Glow in the Dark',
  exclusivity = 'Entertainment Earth',
  estimated_value = 10.95,
  raw_title = 'The Mandalorian Hologram #345',
  clean_title = 'The Mandalorian (Hologram) #345',
  description = 'The Mandalorian (Hologram) is a Star Wars Pop! release #345, Entertainment Earth exclusive, glow in the dark.',
  display_description = 'The Mandalorian (Hologram) is a Star Wars Pop! release #345, Entertainment Earth exclusive, glow in the dark.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698606547';

update public.user_collection_items
set
  owned_variant = 'Glow in the Dark',
  current_value = 10.95
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698606547')
  and coalesce(current_value, 0) = 20;

update public.pop_catalog
set
  variant = 'Metallic Gold',
  estimated_value = 13.87,
  raw_title = 'Yoda [Metallic Gold] #124',
  clean_title = 'Yoda #124',
  description = 'Yoda is a Star Wars Pop! release #124, Walmart exclusive, metallic gold.',
  display_description = 'Yoda is a Star Wars Pop! release #124, Walmart exclusive, metallic gold.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698430180';

update public.user_collection_items
set
  owned_variant = 'Metallic Gold',
  current_value = 13.87
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698430180')
  and coalesce(current_value, 0) = 11;

update public.pop_catalog
set
  set_name = 'Star Wars: Episode IV - A New Hope',
  number = '598',
  variant = null,
  clean_title = 'Stormtrooper #598',
  description = 'Stormtrooper is a Star Wars: Episode IV - A New Hope Pop! release #598.',
  display_description = 'Stormtrooper is a Star Wars: Episode IV - A New Hope Pop! release #598.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698675376';

update public.user_collection_items
set owned_variant = null
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698675376')
  and owned_variant = 'Squad Leader';

update public.pop_catalog
set
  pop_name = 'Princess Leia (Metallic Gold)',
  character = 'Princess Leia',
  number = '287',
  variant = 'Metallic Gold',
  exclusivity = 'Walmart',
  estimated_value = 8.07,
  raw_title = 'Princess Leia [Metallic Gold] #287',
  clean_title = 'Princess Leia (Metallic Gold) #287',
  description = 'Princess Leia (Metallic Gold) is a Star Wars Pop! release #287, Walmart exclusive.',
  display_description = 'Princess Leia (Metallic Gold) is a Star Wars Pop! release #287, Walmart exclusive.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698430173';

update public.user_collection_items
set
  owned_variant = 'Metallic Gold',
  current_value = 8.07
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698430173')
  and coalesce(current_value, 0) = 10.29;

update public.pop_catalog
set estimated_value = 6.00
where upc = '849803064778'
  and coalesce(estimated_value, 0) = 13.52;

update public.user_collection_items
set current_value = 6.00
where pop_catalog_id = (select id from public.pop_catalog where upc = '849803064778')
  and coalesce(current_value, 0) = 13.52;

update public.pop_catalog
set
  pop_name = 'Jean-Luc Picard (Transporter)',
  character = 'Jean-Luc Picard',
  number = '1687',
  pop_type = 'Pop! Plus',
  clean_title = 'Jean-Luc Picard (Transporter) #1687',
  description = 'Jean-Luc Picard (Transporter) is a Star Trek Pop! Plus release #1687.',
  display_description = 'Jean-Luc Picard (Transporter) is a Star Trek Pop! Plus release #1687.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698837729';

update public.pop_catalog
set
  number = '9',
  variant = 'Metallic Gold',
  exclusivity = 'Walmart',
  raw_title = 'Darth Maul [Metallic Gold] #9',
  clean_title = 'Darth Maul #9',
  description = 'Darth Maul is a Star Wars Pop! release #9, Walmart exclusive, metallic gold.',
  display_description = 'Darth Maul is a Star Wars Pop! release #9, Walmart exclusive, metallic gold.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698430203';

update public.user_collection_items
set owned_variant = 'Metallic Gold'
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698430203')
  and owned_variant = 'Metallic';

-- Smaller identity polish and conservative review flags.

update public.pop_catalog
set
  set_name = 'Star Wars: The Last Jedi',
  exclusivity = 'Toys R Us',
  needs_review = true
where upc = '889698147644';

update public.pop_catalog
set
  set_name = 'Back to the Future',
  exclusivity = 'Plastic Empire',
  limited_edition = true,
  limited_count = 3000,
  needs_review = true
where upc = '830395034003';

update public.user_collection_items
set owned_variant = null
where pop_catalog_id = (select id from public.pop_catalog where upc = '830395034003')
  and owned_variant = 'Common';

update public.pop_catalog
set
  variant = 'Metallic Gold',
  raw_title = 'Jango Fett [Metallic Gold] #285',
  description = 'Jango Fett is a Star Wars: Attack of the Clones Pop! release #285, Walmart exclusive, metallic gold.',
  display_description = 'Jango Fett is a Star Wars: Attack of the Clones Pop! release #285, Walmart exclusive, metallic gold.'
where upc = '889698430197';

update public.user_collection_items
set owned_variant = 'Metallic Gold'
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698430197')
  and owned_variant = 'Metallic';

update public.pop_catalog
set
  franchise = 'Back to the Future',
  set_name = 'Back to the Future',
  estimated_value = 9.99,
  vault_status = 'Vaulted'
where upc = '889698469128';

update public.user_collection_items
set current_value = 9.99
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698469128')
  and coalesce(current_value, 0) = 9;

update public.pop_catalog
set
  pop_name = 'Andy with Leg Casts',
  character = 'Andy Dwyer',
  set_name = 'Parks and Recreation',
  exclusivity = 'Calendar Club',
  clean_title = 'Andy with Leg Casts #1155',
  description = 'Andy with Leg Casts is a Parks and Recreation Pop! Television release #1155, Calendar Club exclusive.',
  display_description = 'Andy with Leg Casts is a Parks and Recreation Pop! Television release #1155, Calendar Club exclusive.'
where upc = '889698567718';

update public.pop_catalog
set
  set_name = 'Star Wars: Episode I - The Phantom Menace',
  exclusivity = 'Smuggler''s Bounty'
where upc = '889698407021';

update public.pop_catalog
set
  pop_type = 'Pop! Trains',
  vault_status = 'Vaulted'
where upc = '889698704571';

update public.pop_catalog
set vault_status = 'Vaulted'
where upc in ('889698652568', '889698477055');

-- Verification queries.

select upc, pop_name, character, franchise, set_name, number, variant, exclusivity, pop_type, vault_status, estimated_value, parse_confidence, needs_review
from public.pop_catalog
where upc in (
  '889698147644','830395034003','889698475983','889698147989','889698430197',
  '889698469128','889698606547','889698430180','889698567718','889698675376',
  '889698407021','889698430173','849803064778','889698704571','889698520263',
  '889698652568','889698665742','889698837729','889698477055','889698430203'
)
order by upc;
