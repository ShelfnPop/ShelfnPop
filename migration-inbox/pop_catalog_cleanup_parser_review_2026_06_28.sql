-- Targeted cleanup from pop_catalog_rows_parser_review_6_28.csv.
-- These are exact UPC corrections from the review export.

update public.pop_catalog
set pop_name = 'Hospice Morty',
    character = 'Hospice Morty',
    franchise = 'Rick and Morty',
    set_name = 'Rick and Morty',
    api_last_updated = now()
where upc = '889698454360';

update public.pop_catalog
set pop_name = 'Rick With Laptop',
    character = 'Rick With Laptop',
    franchise = 'Rick and Morty',
    set_name = 'Rick and Morty',
    api_last_updated = now()
where upc = '889698477918';

update public.pop_catalog
set pop_name = 'Tracksuit Jerry',
    character = 'Tracksuit Jerry',
    franchise = 'Rick and Morty',
    set_name = 'Rick and Morty',
    api_last_updated = now()
where upc = '889698403856';

update public.pop_catalog
set pop_name = 'Thor',
    character = 'Thor',
    franchise = 'Marvel',
    set_name = 'Thor: Love and Thunder',
    api_last_updated = now()
where upc = '889698717502';

update public.pop_catalog
set pop_name = 'Whiplash',
    character = 'Whiplash',
    franchise = 'Marvel',
    api_last_updated = now()
where upc = '889698837927';

update public.pop_catalog
set pop_name = 'Post Malone',
    character = 'Post Malone',
    franchise = 'Pop! Rocks',
    api_last_updated = now()
where upc = '889698391818';

update public.pop_catalog
set pop_name = 'Freddy As Orange Lantern',
    character = 'Freddy As Orange Lantern',
    api_last_updated = now()
where upc = '889698891844';

update public.pop_catalog
set pop_name = 'Michael Scarn',
    character = 'Michael Scarn',
    franchise = 'The Office',
    api_last_updated = now()
where upc = '889698520614';

update public.pop_catalog
set pop_name = 'Mycroft Holmes',
    character = 'Mycroft Holmes',
    franchise = 'Sherlock',
    api_last_updated = now()
where upc = '849803060534';

update public.pop_catalog
set pop_name = 'Arlo',
    character = 'Arlo',
    franchise = 'The Good Dinosaur',
    api_last_updated = now()
where upc = '849803063924';

update public.pop_catalog
set franchise = 'Wizarding World',
    api_last_updated = now()
where upc = '889698266970';

update public.pop_catalog
set pop_name = 'Klaus Hargreeves',
    character = 'Klaus Hargreeves',
    franchise = 'The Umbrella Academy',
    api_last_updated = now()
where upc = '889698445139';

update public.pop_catalog
set pop_name = 'Sinestro',
    character = 'Sinestro',
    franchise = 'DC',
    api_last_updated = now()
where upc = '889698691932';

update public.pop_catalog
set pop_name = 'Post Malone Knight',
    character = 'Post Malone Knight',
    franchise = 'Pop! Rocks',
    api_last_updated = now()
where upc = '889698520119';

update public.pop_catalog
set pop_name = 'Will The Wise',
    character = 'Will The Wise',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    api_last_updated = now()
where upc = '889698385336';

update public.pop_catalog
set pop_name = 'Lucas',
    character = 'Lucas',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    api_last_updated = now()
where upc = '889698623957';

update public.pop_catalog
set pop_name = 'Dustin With Die',
    character = 'Dustin With Die',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    api_last_updated = now()
where upc = '889698623926';

update public.pop_catalog
set pop_name = 'Eddie With Guitar',
    character = 'Eddie With Guitar',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    api_last_updated = now()
where upc = '889698624008';

update public.pop_catalog
set pop_name = 'Demobat',
    character = 'Demobat',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    api_last_updated = now()
where upc = '889698656382';

update public.pop_catalog
set pop_name = 'Henry (001)',
    character = 'Henry (001)',
    number = '1458',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    api_last_updated = now()
where upc = '889698721363';

update public.pop_catalog
set pop_name = 'Hunter Eddie With Guitar',
    character = 'Hunter Eddie With Guitar',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    api_last_updated = now()
where upc = '889698721387';

update public.pop_catalog
set pop_name = 'Mike W/Will''s Painting',
    character = 'Mike W/Will''s Painting',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    api_last_updated = now()
where upc = '889698801379';

update public.pop_catalog
set pop_name = 'Vecna (Transformation)',
    character = 'Vecna (Transformation)',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    api_last_updated = now()
where upc = '889698801386';

update public.pop_catalog
set pop_name = 'Murray',
    character = 'Murray',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    api_last_updated = now()
where upc = '889698744188';

update public.pop_catalog
set pop_name = 'Nancy Wheeler',
    character = 'Nancy Wheeler',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    api_last_updated = now()
where upc = '889698757485';

update public.pop_catalog
set pop_name = 'Eleven With Bandana',
    character = 'Eleven With Bandana',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    api_last_updated = now()
where upc = '889698757508';

update public.pop_catalog
set pop_name = 'Dustin Henderson',
    character = 'Dustin Henderson',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    api_last_updated = now()
where upc = '889698757515';

update public.pop_catalog
set pop_name = 'Mike Wheeler',
    character = 'Mike Wheeler',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    api_last_updated = now()
where upc = '889698757539';
