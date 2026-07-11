-- Re-clear known bad image matches after background refresh repopulated them.
-- Function guards now prevent these specific images from being restored.

update public.pop_catalog
set
  set_name = 'Star Wars: Return of the Jedi',
  image_url = null,
  image_source = null,
  image_last_checked = now(),
  display_description = 'From Star Wars: Return of the Jedi, Luke Skywalker Jedi is a Pop! Star Wars release #11.',
  api_last_updated = now()
where upc = '889698160162';

update public.pop_catalog
set
  image_url = null,
  image_source = null,
  image_last_checked = now(),
  api_last_updated = now()
where upc in ('889698430210', '889698217842');
