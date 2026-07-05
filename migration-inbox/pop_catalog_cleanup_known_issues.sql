-- Shelf-n-Pop known catalog cleanup
-- Run the PREVIEW section first. If the rows look right, run the UPDATE section.
--
-- Scope:
-- - conservative fixes for known bad parser outputs
-- - bad vendor franchises
-- - obvious franchise misses
-- - obvious variant/title cleanup
--
-- This script does not try to solve shared-UPC Chase handling. That belongs on
-- user_collection_items.owned_variant, not pop_catalog.variant.

-- =========================
-- PREVIEW AFFECTED ROWS
-- =========================

select
  id,
  upc,
  pop_name,
  character,
  franchise,
  number,
  variant,
  pop_style,
  raw_title,
  clean_title,
  needs_review
from public.pop_catalog
where franchise is null
   or franchise in (
     'Funko',
     'Funko LLC',
     'Funko, LLC',
     'Funko Pop',
     'POP',
     'Pop! Vinyl',
     'DreamBone',
     'Grappiq',
     'IEWAREHOUSE',
     'Alliance Entertainment',
     'Generic',
     'Unknown'
   )
   or pop_name ~* '(vinyl|bobblehead|figures|000[[:space:]]+[0-9]+|\([[:space:]]*\)|chance of chase|[[:space:]]\(other\))'
   or pop_name ~* '(arseface|cassidy|jesse custer|davos seaworth|skeletor|robot devil|mr\.?[[:space:]]+knight|marty|hoverboard|nsync)'
order by pop_name nulls last;

-- =========================
-- UPDATE SECTION
-- =========================

begin;

-- Normalize vendor/junk franchise values to null first so targeted rules can fill them.
update public.pop_catalog
set
  franchise = null,
  needs_review = true,
  api_last_updated = now()
where franchise in (
  'Funko',
  'Funko LLC',
  'Funko, LLC',
  'Funko Pop',
  'POP',
  'Pop! Vinyl',
  'DreamBone',
  'Grappiq',
  'IEWAREHOUSE',
  'Alliance Entertainment',
  'Generic',
  'Unknown'
);

-- Known franchise fills from observed bad rows.
update public.pop_catalog
set
  franchise = 'Preacher',
  needs_review = false,
  api_last_updated = now()
where (franchise is null or franchise = '')
  and coalesce(pop_name, clean_title, raw_title, '') ~* '(arseface|cassidy|jesse custer|preacher)';

update public.pop_catalog
set
  franchise = 'Futurama',
  needs_review = false,
  api_last_updated = now()
where (franchise is null or franchise = '')
  and coalesce(pop_name, clean_title, raw_title, '') ~* '(robot devil|futurama)';

update public.pop_catalog
set
  franchise = 'Game of Thrones',
  needs_review = false,
  api_last_updated = now()
where (franchise is null or franchise = '')
  and coalesce(pop_name, clean_title, raw_title, '') ~* '(davos seaworth|game of thrones)';

update public.pop_catalog
set
  franchise = 'Masters of the Universe',
  needs_review = false,
  api_last_updated = now()
where (franchise is null or franchise = '')
  and coalesce(pop_name, clean_title, raw_title, '') ~* '(meme skeletor|skeletor|masters of the universe)';

update public.pop_catalog
set
  franchise = 'Back to the Future',
  needs_review = false,
  api_last_updated = now()
where (franchise is null or franchise = '')
  and coalesce(pop_name, clean_title, raw_title, '') ~* '(back to the future|marty|hoverboard|doc brown|emmett brown|emmet brown)';

update public.pop_catalog
set
  franchise = 'DC',
  needs_review = false,
  api_last_updated = now()
where (franchise is null or franchise = '')
  and coalesce(pop_name, clean_title, raw_title, '') ~* '(superman|adventures of superman|batman|dc)';

update public.pop_catalog
set
  franchise = 'Marvel',
  needs_review = false,
  api_last_updated = now()
where (franchise is null or franchise = '')
  and coalesce(pop_name, clean_title, raw_title, '') ~* '(mr\.?[[:space:]]+knight|moon knight|marvel|spider-man|spiderman|venom|ghost rider|deadpool|wolverine)';

-- Specific title/name cleanups.
update public.pop_catalog
set
  pop_name = 'Cassidy',
  character = 'Cassidy',
  franchise = 'Preacher',
  variant = 'Bloody',
  needs_review = false,
  api_last_updated = now()
where coalesce(pop_name, clean_title, raw_title, '') ~* 'cassidy'
  and coalesce(pop_name, clean_title, raw_title, '') ~* 'bloody';

update public.pop_catalog
set
  pop_name = regexp_replace(pop_name, '\s*\([[:space:]]*\)\s*', '', 'g'),
  character = case
    when character is null then null
    else regexp_replace(character, '\s*\([[:space:]]*\)\s*', '', 'g')
  end,
  api_last_updated = now()
where pop_name ~* '\([[:space:]]*\)'
   or character ~* '\([[:space:]]*\)';

update public.pop_catalog
set
  pop_name = regexp_replace(pop_name, '\s+VINYL\b', '', 'gi'),
  character = case
    when character is null then null
    else regexp_replace(character, '\s+VINYL\b', '', 'gi')
  end,
  api_last_updated = now()
where pop_name ~* '\s+VINYL\b'
   or character ~* '\s+VINYL\b';

update public.pop_catalog
set
  pop_name = 'Mr. Knight',
  character = 'Mr. Knight',
  franchise = 'Marvel',
  variant = coalesce(variant, 'Glow in the Dark'),
  needs_review = false,
  api_last_updated = now()
where coalesce(pop_name, clean_title, raw_title, '') ~* 'mr\.?[[:space:]]+knight'
  and coalesce(pop_name, clean_title, raw_title, '') ~* 'glow';

update public.pop_catalog
set
  pop_name = 'Marty w/ Hoverboard',
  character = 'Marty w/ Hoverboard',
  franchise = 'Back to the Future',
  number = coalesce(number, '964'),
  needs_review = false,
  api_last_updated = now()
where coalesce(pop_name, clean_title, raw_title, '') ~* '(marty|hoverboard)'
  and coalesce(pop_name, clean_title, raw_title, '') ~* '(back to the future|964)';

update public.pop_catalog
set
  franchise = '*NSYNC',
  pop_style = coalesce(nullif(pop_style, ''), '5-Pack'),
  needs_review = false,
  api_last_updated = now()
where coalesce(pop_name, clean_title, raw_title, '') ~* '(nsync|n sync|\*nsync)';

update public.pop_catalog
set
  number = '50',
  franchise = 'DC',
  api_last_updated = now()
where coalesce(pop_name, clean_title, raw_title, '') ~* 'adventures of superman'
  and coalesce(pop_name, clean_title, raw_title, '') ~* '000[[:space:]]+50';

-- Mark anything still suspicious for manual review.
update public.pop_catalog
set
  needs_review = true,
  api_last_updated = now()
where franchise is null
   or franchise in (
     'Funko',
     'Funko LLC',
     'Funko, LLC',
     'Funko Pop',
     'POP',
     'Pop! Vinyl',
     'DreamBone',
     'Grappiq',
     'IEWAREHOUSE',
     'Alliance Entertainment',
     'Generic',
     'Unknown'
   )
   or pop_name ~* '(vinyl|bobblehead|figures|000[[:space:]]+[0-9]+|\([[:space:]]*\)|chance of chase|[[:space:]]\(other\))';

commit;

-- =========================
-- POST-CLEANUP REVIEW
-- =========================

select
  id,
  upc,
  pop_name,
  character,
  franchise,
  number,
  variant,
  pop_style,
  raw_title,
  clean_title,
  needs_review
from public.pop_catalog
where needs_review is true
order by pop_name nulls last;

