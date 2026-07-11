-- Recent Batman-related scan review, 2026-07-08.
-- Staged only. Review before applying to live Supabase.

-- Joker / Batman 1989 misclassifications.
update public.pop_catalog
set
  pop_name = 'The Joker (Batman 1989)',
  character = 'The Joker',
  franchise = 'DC',
  set_name = 'Batman 1989',
  number = '337',
  variant = 'Metallic',
  exclusivity = 'Exclusive',
  pop_type = 'Pop! Heroes',
  raw_title = 'The Joker Batman 1989 [Metallic] #337',
  clean_title = 'The Joker Batman 1989 #337',
  description = 'The Joker (Batman 1989) is a Pop! Heroes release #337, metallic exclusive.',
  display_description = 'The Joker (Batman 1989) is a Pop! Heroes release #337, metallic exclusive.',
  parse_confidence = 0.98,
  needs_review = true
where upc = '889698495776';

update public.user_collection_items
set owned_variant = 'Metallic'
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698495776')
  and coalesce(owned_variant, 'Common') = 'Common';

update public.pop_catalog
set
  pop_name = 'The Joker (Batman 1989)',
  character = 'The Joker',
  franchise = 'DC',
  set_name = 'Batman 1989',
  number = '337',
  pop_type = 'Pop! Heroes',
  raw_title = 'The Joker Batman 1989 #337',
  clean_title = 'The Joker Batman 1989 #337',
  description = 'The Joker (Batman 1989) is a Pop! Heroes release #337.',
  display_description = 'The Joker (Batman 1989) is a Pop! Heroes release #337.',
  needs_review = true
where upc = '889698477093';

update public.user_collection_items
set current_value = 19.37
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698477093')
  and owned_variant = 'Chase'
  and coalesce(current_value, 0) = 15.24;

-- Batman 1989 / Batman Forever rows parsed into Batman v Superman.
update public.pop_catalog
set
  pop_name = 'Batman (1989)',
  character = 'Batman',
  set_name = 'Batman 1989',
  raw_title = 'Batman 1989 #275',
  clean_title = 'Batman 1989 #275',
  description = 'Batman 1989 is a Batman 80th Anniversary Pop! Heroes release #275.',
  display_description = 'Batman 1989 is a Batman 80th Anniversary Pop! Heroes release #275.',
  needs_review = false
where upc = '889698372480';

update public.pop_catalog
set
  pop_name = 'Batman Forever',
  character = 'Batman',
  set_name = 'Batman Forever',
  estimated_value = 9.00,
  raw_title = 'Batman Forever #289',
  clean_title = 'Batman Forever #289',
  description = 'Batman Forever is a Pop! Heroes release #289.',
  display_description = 'Batman Forever is a Pop! Heroes release #289.',
  needs_review = false
where upc = '889698372541';

-- Tighten Batman-line rows.
update public.pop_catalog
set set_name = 'DC New Classics'
where upc = '889698863698';

update public.pop_catalog
set
  set_name = 'Tales from the Dark Multiverse',
  description = 'Saint Batman is a Tales from the Dark Multiverse Pop! Heroes release #580.',
  display_description = 'Saint Batman is a Tales from the Dark Multiverse Pop! Heroes release #580.'
where upc = '889698862240';

update public.pop_catalog
set
  pop_name = 'Batman (Kingdom Come)',
  character = 'Batman',
  set_name = 'Kingdom Come',
  variant = null,
  exclusivity = 'Summer Convention',
  estimated_value = 17.92,
  raw_title = 'Batman [Summer Convention] #569',
  clean_title = 'Batman (Kingdom Come) #569',
  description = 'Batman (Kingdom Come) is a Pop! Heroes release #569, Summer Convention exclusive.',
  display_description = 'Batman (Kingdom Come) is a Pop! Heroes release #569, Summer Convention exclusive.',
  needs_review = false
where upc = '889698744225';

update public.user_collection_items
set
  owned_variant = null,
  current_value = 17.92
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698744225')
  and coalesce(current_value, 0) = 21.99;

update public.pop_catalog
set
  set_name = 'Batman Begins',
  description = 'Fear Gas Batman is a Batman Begins Pop! Heroes release #532, Funko Shop exclusive.',
  display_description = 'Fear Gas Batman is a Batman Begins Pop! Heroes release #532, Funko Shop exclusive.'
where upc = '889698818667';

update public.pop_catalog
set
  set_name = 'Batman 85th Anniversary',
  description = 'The Joker is a Batman 85th Anniversary Pop! Heroes release #517.',
  display_description = 'The Joker is a Batman 85th Anniversary Pop! Heroes release #517.'
where upc = '889698806879';

update public.pop_catalog
set
  set_name = 'Batman 85th Anniversary',
  estimated_value = 19.53
where upc = '889698668590'
  and coalesce(estimated_value, 0) = 19.65;

update public.user_collection_items
set current_value = 19.53
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698668590')
  and coalesce(current_value, 0) = 19.65;

update public.pop_catalog
set
  set_name = 'Batman 80th Anniversary',
  estimated_value = 8.63,
  description = 'Batman First Appearance is a Batman 80th Anniversary Pop! Heroes release #270.',
  display_description = 'Batman First Appearance is a Batman 80th Anniversary Pop! Heroes release #270.'
where upc = '889698372145';

update public.user_collection_items
set current_value = 8.63
where pop_catalog_id = (select id from public.pop_catalog where upc = '889698372145')
  and coalesce(current_value, 0) = 8.05;

-- Keep good Batman-related rows visible in verification output.
select upc, pop_name, character, franchise, set_name, number, variant, exclusivity, pop_type, vault_status, estimated_value, parse_confidence, needs_review
from public.pop_catalog
where upc in (
  '889698477055','889698477062','889698495776','889698477086','889698477093',
  '889698863698','889698862240','889698744225','889698818667','889698806879',
  '889698787741','889698372534','889698668590','889698372480','889698372541',
  '889698372145'
)
order by upc;
