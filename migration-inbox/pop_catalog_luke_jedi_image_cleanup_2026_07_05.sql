-- Clear incorrect cached image for Luke Skywalker Jedi #11.
-- The stored image depicts a different Luke/R2-D2 product, so leave the app
-- to show its placeholder until a matching image is found.

update public.pop_catalog
set
  set_name = 'Star Wars: Return of the Jedi',
  image_url = null,
  image_source = null,
  image_last_checked = now(),
  display_description = 'From Star Wars: Return of the Jedi, Luke Skywalker Jedi is a Pop! Star Wars release #11.',
  api_last_updated = now()
where upc = '889698160162';
