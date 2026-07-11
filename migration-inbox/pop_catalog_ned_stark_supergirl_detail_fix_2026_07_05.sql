update public.pop_catalog
set
  set_name = 'Game of Thrones',
  pop_type = 'Pop! Television',
  api_last_updated = now()
where upc = '889698567916';

update public.pop_catalog
set
  franchise = 'DC',
  set_name = 'Supergirl',
  pop_type = 'Pop! Movies',
  number = coalesce(nullif(number, ''), '634'),
  pop_style = 'Standard',
  display_description = 'From Supergirl, Supergirl Kara Zor-El With Cedric is a Pop! Movies release #634.',
  api_last_updated = now()
where upc = '889698907958';
