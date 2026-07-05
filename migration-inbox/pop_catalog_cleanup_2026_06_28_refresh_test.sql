-- Targeted parser cleanup test rows from 2026-06-28.
-- These are specific pop_catalog rows, including items that may not be in a user's collection.

update public.pop_catalog
set
  pop_name = '001 (Vaporizing)',
  character = '001 (Vaporizing)',
  franchise = 'Stranger Things',
  number = nullif(number, ''),
  needs_review = false,
  api_last_updated = now()
where upc = '889698783101';

update public.pop_catalog
set
  pop_name = 'Will',
  character = 'Will',
  franchise = 'Stranger Things',
  needs_review = false,
  api_last_updated = now()
where upc = '889698623964';

update public.pop_catalog
set
  pop_name = 'Kingpin',
  character = 'Kingpin',
  franchise = 'Marvel',
  needs_review = false,
  api_last_updated = now()
where upc = '889698758628';

update public.pop_catalog
set
  pop_name = 'Daredevil (Black Suit)',
  character = 'Daredevil (Black Suit)',
  franchise = 'Marvel',
  needs_review = false,
  api_last_updated = now()
where upc = '889698918497';
