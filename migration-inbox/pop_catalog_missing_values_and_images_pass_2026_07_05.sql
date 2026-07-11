begin;

with value_updates(upc, estimated_value, value_note) as (
  values
    ('889698810302', 14.53::numeric, 'Best Buy current retail price, checked 2026-07-05'),
    ('889698810340', 14.58::numeric, 'Best Buy current retail price, checked 2026-07-05'),
    ('8969884452', 14.99::numeric, 'Funko current retail price, checked 2026-07-05'),
    ('889698919913', 24.99::numeric, 'Entertainment Earth pre-order retail price, checked 2026-07-05'),
    ('889698920636', 14.99::numeric, 'Funko current retail price, checked 2026-07-05'),
    ('889698886505', 14.99::numeric, 'Funko current retail price, checked 2026-07-05'),
    ('889698908238', 14.99::numeric, 'Target current retail price, checked 2026-07-05')
)
update public.pop_catalog pc
set estimated_value = vu.estimated_value,
    api_source = case
      when coalesce(pc.api_source, '') like '%manual_retail_research%' then pc.api_source
      when nullif(pc.api_source, '') is null then 'manual_retail_research'
      else pc.api_source || '+manual_retail_research'
    end,
    edition_notes = concat_ws('; ', nullif(pc.edition_notes, ''), vu.value_note),
    api_last_updated = now()
from value_updates vu
where pc.upc = vu.upc
  and pc.estimated_value is null;

update public.user_collection_items uci
set current_value = pc.estimated_value
from public.pop_catalog pc
where uci.pop_catalog_id = pc.id
  and pc.upc in ('889698810302', '889698810340', '8969884452', '889698919913', '889698920636', '889698886505', '889698908238')
  and (uci.current_value is null or uci.current_value = 0)
  and pc.estimated_value is not null;

update public.pop_catalog
set pop_name = 'Robin Hood',
    character = 'Robin Hood',
    raw_title = coalesce(nullif(raw_title, ''), 'Robin Hood #1440'),
    clean_title = 'Robin Hood #1440',
    api_last_updated = now()
where upc = '889698339858';

update public.pop_catalog
set pop_name = 'Tank Girl with Tank',
    character = 'Tank Girl',
    franchise = 'Tank Girl',
    set_name = 'Tank Girl',
    number = '06',
    pop_type = coalesce(pop_type, 'Pop! Rides'),
    pop_style = coalesce(pop_style, 'Ride'),
    exclusivity = coalesce(exclusivity, 'Summer Convention'),
    raw_title = 'Tank Girl with Tank #06',
    clean_title = 'Tank Girl with Tank #06',
    display_description = 'Tank Girl with Tank is a Tank Girl Funko Pop! Rides #06.',
    description = coalesce(description, 'Tank Girl with Tank is a Tank Girl Funko Pop! Rides #06.'),
    api_last_updated = now()
where upc = '889698879439';

update public.pop_catalog
set number = '843',
    variant = coalesce(variant, 'Glow in the Dark'),
    raw_title = coalesce(nullif(raw_title, ''), 'Rotta The Hutt #843'),
    clean_title = 'Rotta The Hutt #843',
    display_description = 'Rotta The Hutt is a Star Wars Funko Pop #843 from The Mandalorian.',
    description = coalesce(description, 'Rotta The Hutt is a Star Wars Funko Pop #843 from The Mandalorian.'),
    api_last_updated = now()
where upc = '889698908238';

update public.pop_catalog
set exclusivity = coalesce(exclusivity, 'Entertainment Earth')
where upc = '8969884452';

update public.pop_catalog
set exclusivity = coalesce(exclusivity, 'Funko Shop')
where upc in ('889698920636', '889698886505');

update public.user_collection_items uci
set current_value = null
from public.pop_catalog pc
where uci.pop_catalog_id = pc.id
  and pc.estimated_value is null
  and uci.current_value = 0;

commit;
