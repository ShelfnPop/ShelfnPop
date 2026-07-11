-- Correct older Stranger Things Eleven row that borrowed Finale Eleven metadata.

update public.pop_catalog
set
  number = '545',
  image_url = null,
  image_source = null,
  image_last_checked = now(),
  display_description = 'From Stranger Things, Eleven is a Pop! Television release #545.',
  api_last_updated = now()
where upc = '889698217842';
