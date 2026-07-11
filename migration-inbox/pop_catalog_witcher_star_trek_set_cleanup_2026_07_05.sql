update public.pop_catalog
set
  set_name = 'The Witcher',
  display_description = 'From The Witcher, Geralt And Roach is a Pop! Television release #108, Walmart exclusive.',
  api_last_updated = now()
where upc = '889698589024';

update public.pop_catalog
set
  set_name = 'Star Trek II: The Wrath of Khan',
  display_description = 'From Star Trek II: The Wrath of Khan, Kirk And Spock is a Pop! Movies release #1197.',
  api_last_updated = now()
where upc = '889698608152';
