-- Audit note: Suicide Squad and Guardians of the Galaxy cleanup applied directly to production on 2026-07-06.

with updates(upc, pop_name, character, franchise, set_name, pop_type, pop_style, number, variant, exclusivity, description) as (
  values
    ('889698560146','Peacemaker','Peacemaker','DC','The Suicide Squad','Pop! Movies','Standard','1110',null,null,'Peacemaker is a DC Pop! Movies release #1110 from The Suicide Squad.'),
    ('889698127844','Star-Lord','Star-Lord','Marvel','Guardians of the Galaxy Vol. 2','Pop! Marvel','Standard','198','Chase',null,'Star-Lord is a Marvel Pop! Marvel release #198 from Guardians of the Galaxy Vol. 2, Chase variant.'),
    ('889698132701','Rocket','Rocket','Marvel','Guardians of the Galaxy Vol. 2','Pop! Marvel','Standard','201',null,null,'Rocket is a Marvel Pop! Marvel release #201 from Guardians of the Galaxy Vol. 2.'),
    ('889698131551','Nebula','Nebula','Marvel','Guardians of the Galaxy Vol. 2','Pop! Marvel','Standard','203',null,null,'Nebula is a Marvel Pop! Marvel release #203 from Guardians of the Galaxy Vol. 2.'),
    ('889698127806','Taserface','Taserface','Marvel','Guardians of the Galaxy Vol. 2','Pop! Marvel','Standard','206',null,null,'Taserface is a Marvel Pop! Marvel release #206 from Guardians of the Galaxy Vol. 2.'),
    ('849803037918','Star-Lord','Star-Lord','Marvel','Guardians of the Galaxy','Pop! Marvel','Standard','47',null,null,'Star-Lord is a Marvel Pop! Marvel release #47 from Guardians of the Galaxy.'),
    ('849803037956','Gamora','Gamora','Marvel','Guardians of the Galaxy','Pop! Marvel','Standard','51',null,null,'Gamora is a Marvel Pop! Marvel release #51 from Guardians of the Galaxy.'),
    ('849803051761','Ronan','Ronan','Marvel','Guardians of the Galaxy','Pop! Marvel','Standard','75',null,null,'Ronan is a Marvel Pop! Marvel release #75 from Guardians of the Galaxy.'),
    ('849803051785','The Collector','The Collector','Marvel','Guardians of the Galaxy','Pop! Marvel','Standard','77',null,null,'The Collector is a Marvel Pop! Marvel release #77 from Guardians of the Galaxy.'),
    ('849803087395','Star-Lord with Mixed Tape','Star-Lord','Marvel','Guardians of the Galaxy','Pop! Marvel','Standard','155',null,null,'Star-Lord with Mixed Tape is a Marvel Pop! Marvel release #155 from Guardians of the Galaxy.'),
    ('889698357746','Young Gamora','Young Gamora','Marvel','Avengers: Infinity War','Pop! Marvel','Standard','417',null,null,'Young Gamora is a Marvel Pop! Marvel release #417 from Avengers: Infinity War.')
)
update public.pop_catalog pc
set
  pop_name = u.pop_name,
  character = u.character,
  franchise = u.franchise,
  set_name = u.set_name,
  pop_type = u.pop_type,
  pop_style = u.pop_style,
  number = u.number,
  variant = u.variant,
  exclusivity = u.exclusivity,
  description = u.description,
  display_description = u.description
from updates u
where pc.upc = u.upc;

update public.pop_catalog
set pop_type = 'Pop! Movies'
where set_name in ('Suicide Squad', 'The Suicide Squad');

update public.pop_catalog
set set_name = 'Birds of Prey', pop_type = 'Pop! Movies'
where set_name = 'Birds Of Prey';

update public.pop_catalog
set
  set_name = 'Guardians of the Galaxy',
  description = 'Drax is a Marvel Pop! Marvel release #50 from Guardians of the Galaxy.',
  display_description = 'Drax is a Marvel Pop! Marvel release #50 from Guardians of the Galaxy.'
where upc = '849803037949';

update public.pop_catalog
set
  set_name = 'Guardians of the Galaxy',
  description = 'Dancing Groot is a Marvel Pop! Marvel release #65 from Guardians of the Galaxy.',
  display_description = 'Dancing Groot is a Marvel Pop! Marvel release #65 from Guardians of the Galaxy.'
where upc = '849803051044';

update public.pop_catalog
set
  set_name = 'Guardians of the Galaxy Holiday Special',
  description = 'Drax is a Marvel Pop! Marvel release #75 from The Guardians of the Galaxy Holiday Special.',
  display_description = 'Drax is a Marvel Pop! Marvel release #75 from The Guardians of the Galaxy Holiday Special.'
where upc = '889698643306';

update public.pop_catalog
set
  set_name = 'Guardians of the Galaxy',
  description = 'Star-Lord with Power Stone is a Marvel Pop! Marvel release #611 from Guardians of the Galaxy.',
  display_description = 'Star-Lord with Power Stone is a Marvel Pop! Marvel release #611 from Guardians of the Galaxy.'
where upc = '889698736411';
