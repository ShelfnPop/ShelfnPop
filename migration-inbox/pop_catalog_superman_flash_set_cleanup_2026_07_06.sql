-- Catalog cleanup for Superman and The Flash set separation.
-- Applied directly to Supabase on 2026-07-06 and kept here as an audit note.

with set_updates(upc, set_name) as (
  values
    ('849803060275','Batman V. Superman Dawn Of Justice'),
    ('849803063429','Batman V. Superman Dawn Of Justice'),
    ('849803075798','Batman V. Superman Dawn Of Justice'),
    ('849803099312','Batman V. Superman Dawn Of Justice'),
    ('849803065447','Batman V. Superman Dawn Of Justice'),
    ('849803070052','Batman V. Superman Dawn Of Justice'),
    ('889698807630','Superman (1978)'),
    ('889698807647','Superman (1978)'),
    ('889698807654','Superman (1978)'),
    ('889698807623','Superman (1978)'),
    ('889698758116','Superman (1978)'),
    ('889698856430','Superman (2025)'),
    ('849803053444','The Flash (TV Series)'),
    ('849803054045','The Flash (TV Series)'),
    ('849803054052','The Flash (TV Series)'),
    ('849803094768','The Flash (TV Series)'),
    ('889698339551','The Flash (TV Series)'),
    ('889698636391','The Flash (TV Series)'),
    ('889698520195','The Flash (TV Series)'),
    ('889698520201','The Flash (TV Series)'),
    ('889698520218','The Flash (TV Series)'),
    ('889698655927','The Flash (2023)'),
    ('889698655934','The Flash (2023)'),
    ('889698655941','The Flash (2023)'),
    ('889698655958','The Flash (2023)'),
    ('889698655965','The Flash (2023)'),
    ('889698655989','The Flash (2023)'),
    ('889698655996','The Flash (2023)'),
    ('889698656009','The Flash (2023)'),
    ('889698656016','The Flash (2023)'),
    ('889698663779','The Flash (2023)'),
    ('889698666350','The Flash (2023)'),
    ('889698668781','The Flash (2023)'),
    ('889698659420','The Flash (2023)'),
    ('889698708678','The Flash (2023)')
)
update public.pop_catalog pc
set set_name = su.set_name
from set_updates su
where pc.upc = su.upc;

update public.pop_catalog set pop_name = 'Jor-El', character = 'Jor-El', number = '538' where upc = '889698807630';
update public.pop_catalog set pop_name = 'Lois Lane', character = 'Lois Lane', number = '539' where upc = '889698807647';
update public.pop_catalog set pop_name = 'Lex Luthor', character = 'Lex Luthor', number = '540' where upc = '889698807654';
update public.pop_catalog set pop_name = 'Superman and Fortress of Solitude', character = 'Superman', number = '537', pop_style = 'Deluxe' where upc = '889698807623';
update public.pop_catalog set pop_name = 'Superman Rewind', character = 'Superman', pop_style = 'Rewind' where upc = '889698758116';
update public.pop_catalog set pop_name = 'Lois Lane', character = 'Lois Lane', number = '563' where upc = '889698856430';
update public.pop_catalog set pop_name = 'Wonder Woman', character = 'Wonder Woman' where upc = '849803060275';
update public.pop_catalog set pop_name = 'Batman v Superman 2-Pack', character = 'Batman + Superman', pop_style = '2-Pack' where upc = '849803065447';
update public.pop_catalog set pop_name = 'Batman v Superman Metallic 2-Pack', character = 'Batman + Superman', pop_style = '2-Pack' where upc = '849803070052';
update public.pop_catalog set variant = 'Glow in the Dark' where upc = '889698636391';

update public.pop_catalog
set pop_type = 'Pop! Movies'
where set_name in ('Batman V. Superman Dawn Of Justice','Superman (1978)','Superman (2025)','The Flash (2023)','Justice League (2017)','Zack Snyder''s Justice League');

update public.pop_catalog
set pop_type = 'Pop! Television'
where set_name = 'The Flash (TV Series)';
