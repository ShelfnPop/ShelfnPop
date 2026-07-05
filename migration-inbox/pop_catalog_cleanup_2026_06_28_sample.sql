-- Cleanup rows found in the 2026-06-28 pop_catalog_rows.csv export.
-- Run after deploying lookup_pop_6_28.ts, or use the Refresh Value button/API
-- for each UPC instead if you prefer to let the parser re-process them.

update public.pop_catalog
set
  pop_name = 'Rorschach',
  character = 'Rorschach',
  needs_review = false,
  api_last_updated = now()
where upc = '889698871471';

update public.pop_catalog
set
  franchise = 'Star Wars',
  needs_review = false,
  api_last_updated = now()
where upc = '849803096267';

update public.pop_catalog
set
  pop_name = 'Allen',
  character = 'Allen',
  franchise = 'Invincible',
  needs_review = false,
  api_last_updated = now()
where upc = '889698918275';

update public.pop_catalog
set
  franchise = 'Stranger Things',
  needs_review = false,
  api_last_updated = now()
where upc = '889698885560';

update public.pop_catalog
set
  pop_name = 'Eleven In Mall Outfit',
  character = 'Eleven In Mall Outfit',
  variant = coalesce(nullif(variant, ''), 'Blacklight'),
  franchise = 'Stranger Things',
  needs_review = false,
  api_last_updated = now()
where upc = '889698598194';

update public.pop_catalog
set
  pop_name = 'Moon Knight',
  character = 'Moon Knight',
  franchise = 'Marvel',
  needs_review = false,
  api_last_updated = now()
where upc = '889698642552';
