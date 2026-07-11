-- Catalog cleanup for Superman (2025) movie set.
-- Applied directly to Supabase on 2026-07-06 and kept here as an audit note.

with updates(upc, set_name, description_text) as (
  values
    ('889698856423','Superman (2025)','Superman is a DC Pop! Heroes release #562 from Superman (2025).'),
    ('889698856447','Superman (2025)','Lex Luthor is a DC Pop! Heroes release #564 from Superman (2025).'),
    ('889698856454','Superman (2025)','Krypto is a DC Pop! Heroes release #565 from Superman (2025).'),
    ('889698856461','Superman (2025)','Superman is a DC Pop! Heroes jumbo release #566 from Superman (2025).'),
    ('889698907811','Superman (2025)','Hawkgirl is a DC Pop! Heroes release #579 from Superman (2025), Limited Edition - Ultra with a 5000-piece run.'),
    ('889698866422','Superman (2025)','Superman and the Fortress of Solitude is a DC Pop! Heroes moment release #582 from Superman (2025).'),
    ('889698866439','Superman (2025)','Hammer of Boravia is a DC Pop! Heroes release #583 from Superman (2025).'),
    ('889698866446','Superman (2025)','Mr. Terrific is a DC Pop! Heroes release #584 from Superman (2025).'),
    ('889698866453','Superman (2025)','Guy Gardner is a DC Pop! Heroes release #585 from Superman (2025).'),
    ('889698866460','Superman (2025)','Metamorpho with Baby Joey is a DC Pop! Heroes release #586 from Superman (2025).'),
    ('889698866477','Superman (2025)','The Engineer is a DC Pop! Heroes release #587 from Superman (2025).'),
    ('889698871419','Superman (2025)','Superman (Battle Damaged) is a DC Pop! Heroes release #588 from Superman (2025), Funko Shop exclusive.')
)
update public.pop_catalog pc
set set_name = u.set_name,
    description = u.description_text,
    display_description = u.description_text
from updates u
where pc.upc = u.upc;

update public.pop_catalog
set pop_name = 'Superman (Battle Damaged)',
    character = 'Superman',
    variant = 'Battle Damaged',
    display_description = 'Superman (Battle Damaged) is a DC Pop! Heroes release #588 from Superman (2025), Funko Shop exclusive.',
    description = 'Superman (Battle Damaged) is a DC Pop! Heroes release #588 from Superman (2025), Funko Shop exclusive.'
where upc = '889698871419';
