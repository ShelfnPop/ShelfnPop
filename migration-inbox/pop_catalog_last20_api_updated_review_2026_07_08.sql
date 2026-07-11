-- Last 20 pop_catalog rows by api_last_updated desc, reviewed 2026-07-08.
-- Staged only. Review before applying to live Supabase.

-- Ahsoka / Star Wars identity cleanup.
update public.pop_catalog
set
  pop_name = 'Ahsoka Tano',
  character = 'Ahsoka Tano',
  franchise = 'Star Wars',
  set_name = 'The Clone Wars',
  number = '409',
  raw_title = 'Ahsoka Tano #409',
  clean_title = 'Ahsoka Tano #409',
  description = 'Ahsoka Tano is a Star Wars: The Clone Wars Pop! release #409.',
  display_description = 'Ahsoka Tano is a Star Wars: The Clone Wars Pop! release #409.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698520232';

update public.pop_catalog
set
  pop_name = 'Grand Admiral Thrawn (Diamond Glitter)',
  character = 'Grand Admiral Thrawn',
  franchise = 'Star Wars',
  set_name = 'Ahsoka',
  number = '697',
  variant = 'Diamond Glitter',
  exclusivity = 'San Diego Comic-Con',
  limited_edition = true,
  limited_count = 3000,
  raw_title = 'Grand Admiral Thrawn [Diamond Glitter] #697',
  clean_title = 'Grand Admiral Thrawn (Diamond Glitter) #697',
  description = 'Grand Admiral Thrawn (Diamond Glitter) is a Star Wars: Ahsoka Pop! release #697, San Diego Comic-Con exclusive.',
  display_description = 'Grand Admiral Thrawn (Diamond Glitter) is a Star Wars: Ahsoka Pop! release #697, San Diego Comic-Con exclusive.',
  parse_confidence = 0.98,
  needs_review = true
where upc = '889698816663';

update public.pop_catalog
set
  pop_name = 'Ahsoka Tano (Holographic)',
  character = 'Ahsoka Tano',
  franchise = 'Star Wars',
  set_name = 'Star Wars Rebels',
  number = '130',
  variant = 'Holographic',
  exclusivity = 'Hot Topic',
  raw_title = 'Ahsoka [Holographic] #130',
  clean_title = 'Ahsoka Tano (Holographic) #130',
  description = 'Ahsoka Tano (Holographic) is a Star Wars Rebels Pop! release #130, Hot Topic exclusive.',
  display_description = 'Ahsoka Tano (Holographic) is a Star Wars Rebels Pop! release #130, Hot Topic exclusive.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698107662';

update public.pop_catalog
set
  set_name = 'The Mandalorian',
  exclusivity = 'Target',
  description = 'Bo-Katan Kryze is a Star Wars: The Mandalorian Pop! release #693, Target exclusive.',
  display_description = 'Bo-Katan Kryze is a Star Wars: The Mandalorian Pop! release #693, Target exclusive.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698768283';

update public.pop_catalog
set
  set_name = 'Star Wars: The Last Jedi',
  exclusivity = 'Toys R Us',
  description = 'Kylo Ren is a Star Wars: The Last Jedi Pop! release #203, Toys R Us exclusive.',
  display_description = 'Kylo Ren is a Star Wars: The Last Jedi Pop! release #203, Toys R Us exclusive.'
where upc = '889698147644';

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
  variant = 'Metallic Gold',
  raw_title = 'Jango Fett [Metallic Gold] #285',
  description = 'Jango Fett is a Star Wars: Attack of the Clones Pop! release #285, Walmart exclusive, metallic gold.',
  display_description = 'Jango Fett is a Star Wars: Attack of the Clones Pop! release #285, Walmart exclusive, metallic gold.'
where upc = '889698430197';

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

-- Movies / Back to the Future / Parks rows.
update public.pop_catalog
set
  pop_name = 'Vito Corleone with Towel Silencer',
  character = 'Vito Corleone',
  franchise = 'The Godfather',
  set_name = 'The Godfather Part II',
  number = '1525',
  estimated_value = 10.89,
  raw_title = 'Vito Corleone with Towel Silencer #1525',
  clean_title = 'Vito Corleone with Towel Silencer #1525',
  description = 'Vito Corleone with Towel Silencer is a The Godfather Part II Pop! Movies release #1525.',
  display_description = 'Vito Corleone with Towel Silencer is a The Godfather Part II Pop! Movies release #1525.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698759380';

update public.pop_catalog
set
  pop_name = 'Doc & Einstein',
  character = 'Doc Brown & Einstein',
  franchise = 'Back to the Future',
  set_name = 'Back to the Future',
  number = '972',
  exclusivity = 'Walmart',
  pop_type = 'Pop! Movies',
  clean_title = 'Doc & Einstein #972',
  description = 'Doc & Einstein is a Back to the Future Pop! Movies release #972, Walmart exclusive.',
  display_description = 'Doc & Einstein is a Back to the Future Pop! Movies release #972, Walmart exclusive.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698496858';

update public.pop_catalog
set
  set_name = 'Back to the Future',
  exclusivity = 'Convention',
  description = 'Dr. Emmett Brown (Glow in the Dark) is a Back to the Future Pop! Movies release #50.',
  display_description = 'Dr. Emmett Brown (Glow in the Dark) is a Back to the Future Pop! Movies release #50.',
  needs_review = true
where upc = '830395033990';

update public.pop_catalog
set
  set_name = 'Back to the Future',
  exclusivity = 'Plastic Empire',
  limited_edition = true,
  limited_count = 3000,
  needs_review = true
where upc = '830395034003';

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

-- Verification query for the reviewed window.
select upc, pop_name, character, franchise, set_name, number, variant, exclusivity, pop_type, vault_status, estimated_value, parse_confidence, needs_review
from public.pop_catalog
where upc in (
  '849803060442','849803096144','889698520232','889698816663','889698649025',
  '889698107662','889698759380','889698496858','889698768283','830395033990',
  '889698740302','889698686495','889698147644','830395034003','889698475983',
  '889698147989','889698430197','889698469128','889698430180','889698567718'
)
order by api_last_updated desc nulls last;
