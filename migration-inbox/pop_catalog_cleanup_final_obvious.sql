-- Shelf-n-Pop catalog cleanup - final obvious fixes
-- Built from supabase_parser_update_2.csv.
--
-- This leaves UPC 849803053086 / "Bobblehead" marked for manual review
-- because the source title is too generic to safely identify.

begin;

update public.pop_catalog
set
  franchise = 'Marvel',
  pop_name = 'Miek',
  character = 'Miek',
  api_last_updated = now(),
  needs_review = false
where upc = '889698624268';

update public.pop_catalog
set
  franchise = 'Marvel',
  pop_name = 'Mighty Thor',
  character = 'Mighty Thor',
  number = '1041',
  api_last_updated = now(),
  needs_review = false
where upc = '889698624220';

update public.pop_catalog
set
  franchise = 'Marvel',
  pop_name = 'Mighty Thor',
  character = 'Mighty Thor',
  api_last_updated = now(),
  needs_review = false
where upc = '889698650120';

update public.pop_catalog
set
  franchise = 'Marvel',
  pop_name = 'Ultron Grinning',
  character = 'Ultron Grinning',
  number = '83',
  api_last_updated = now(),
  needs_review = false
where upc = '849803056063';

update public.pop_catalog
set
  franchise = 'Marvel',
  pop_name = 'Gorr''s Daughter',
  character = 'Gorr''s Daughter',
  number = '1188',
  api_last_updated = now(),
  needs_review = false
where upc = '889698642088';

update public.pop_catalog
set
  franchise = 'Disney',
  pop_name = 'Violet',
  character = 'Violet',
  api_last_updated = now(),
  needs_review = false
where upc = '889698292016';

update public.pop_catalog
set
  franchise = 'The Walking Dead',
  pop_name = 'Richard',
  character = 'Richard',
  api_last_updated = now(),
  needs_review = false
where upc = '889698252034';

update public.pop_catalog
set
  franchise = 'Toy Story',
  pop_name = 'Woody',
  character = 'Woody',
  api_last_updated = now(),
  needs_review = false
where upc = '849803068776';

update public.pop_catalog
set
  franchise = 'Marvel',
  pop_name = 'Cable (X-Corp)',
  character = 'Cable',
  number = '1594',
  api_last_updated = now(),
  needs_review = false
where upc = '889698907927';

-- This appears to be a specific product/person, but there is not enough
-- context in the exported row to infer a franchise safely.
update public.pop_catalog
set
  pop_name = 'Franny SE',
  character = 'Franny SE',
  api_last_updated = now(),
  needs_review = true
where upc = '889698901673';

-- Keep the generic Bobblehead row flagged.
update public.pop_catalog
set
  api_last_updated = now(),
  needs_review = true
where upc = '849803053086';

commit;

select
  upc,
  pop_name,
  character,
  franchise,
  number,
  variant,
  pop_style,
  raw_title,
  needs_review
from public.pop_catalog
where needs_review is true
order by pop_name nulls last;

