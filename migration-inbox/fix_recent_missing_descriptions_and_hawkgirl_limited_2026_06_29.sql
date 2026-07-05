-- Fix the two recent catalog rows that had empty display descriptions.
-- Also mark Hawkgirl as a limited production run so the app can show the limited badge.

update public.pop_catalog
set
  pop_name = 'Hawkgirl',
  character = 'Hawkgirl',
  franchise = 'DC',
  limited_edition = true,
  edition_notes = coalesce(edition_notes, 'Limited production run'),
  display_description = coalesce(
    nullif(btrim(display_description), ''),
    'Hawkgirl is a DC Funko Pop from the Superman 2025 lineup.'
  )
where upc = '889698907811';

update public.pop_catalog
set
  pop_name = 'Hulk Gold Chrome',
  character = 'Hulk',
  franchise = 'Marvel',
  variant = coalesce(variant, 'Chrome'),
  display_description = coalesce(
    nullif(btrim(display_description), ''),
    'Hulk Gold Chrome is a Marvel Funko Pop with a chrome finish.'
  )
where upc = '889698335171';
