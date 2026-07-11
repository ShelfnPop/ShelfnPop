-- Audit note: Game of Thrones catalog cleanup applied directly to production on 2026-07-06.

update public.pop_catalog
set set_name = 'Game of Thrones'
where franchise ilike '%game%thrones%'
  and set_name is distinct from 'Game of Thrones';

update public.pop_catalog
set
  pop_name = regexp_replace(pop_name, '^Thrones\s+', '', 'i'),
  character = regexp_replace(character, '^Thrones\s+', '', 'i'),
  set_name = 'Game of Thrones'
where franchise ilike '%game%thrones%'
  and (pop_name ~* '^Thrones\s+' or character ~* '^Thrones\s+');

update public.pop_catalog
set
  pop_name = 'Battle of the Bastards',
  character = 'Jon Snow & Ramsay Bolton',
  set_name = 'Game of Thrones',
  pop_type = 'Pop! Television',
  pop_style = '2-Pack',
  description = 'Battle of the Bastards is a Game of Thrones Pop! Television 2-Pack featuring Jon Snow and Ramsay Bolton.',
  display_description = 'Battle of the Bastards is a Game of Thrones Pop! Television 2-Pack featuring Jon Snow and Ramsay Bolton.'
where upc = '889698123785';
