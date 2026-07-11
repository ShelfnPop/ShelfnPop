begin;

update public.pop_catalog
set pop_name = 'The Batman Who Laughs',
    franchise = 'DC',
    set_name = 'The Batman Who Laughs',
    number = '524',
    api_last_updated = now()
where upc = '889698786713';

update public.pop_catalog
set pop_name = 'Blue Venom',
    franchise = 'Marvel',
    set_name = 'Venom',
    number = '234',
    api_last_updated = now()
where upc = '8969814808';

update public.pop_catalog
set pop_name = 'Spider-Man Premium',
    franchise = 'Marvel',
    set_name = 'Spider-Man',
    exclusivity = 'US Exclusive',
    api_last_updated = now()
where upc = '889698918107';

update public.pop_catalog
set pop_name = 'Venom with Ooze',
    franchise = 'Marvel',
    set_name = 'Venom',
    number = '1469',
    variant = 'Glow in the Dark',
    api_last_updated = now()
where upc = '8969884452';

update public.pop_catalog
set pop_name = 'Nancy Wheeler with Shotgun',
    franchise = 'Stranger Things',
    set_name = 'Stranger Things',
    number = '1802',
    api_last_updated = now()
where upc = '889698886505';

update public.pop_catalog
set pop_name = 'Tank Girl',
    franchise = 'Tank Girl',
    set_name = 'Tank Girl',
    number = '06',
    api_last_updated = now()
where upc = '889698879439';

commit;
