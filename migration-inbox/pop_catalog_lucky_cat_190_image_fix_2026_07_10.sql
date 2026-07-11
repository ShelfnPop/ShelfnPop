-- Lucky Cat #190 image fix, staged 2026-07-10.
-- Purpose:
-- - Restore the missing product image for the older Lucky Cat #190 row.
-- - Leave the already-correct value and box number alone.

update public.pop_catalog
set
  image_url = 'https://storage.googleapis.com/images.pricecharting.com/okwqss6oiliwuwgb/1600.jpg',
  image_source = 'pricecharting',
  image_last_checked = now()
where upc = '889698829878';

select
  upc,
  pop_name,
  character,
  franchise,
  set_name,
  number,
  image_url,
  image_source,
  image_last_checked,
  estimated_value,
  parse_confidence,
  needs_review
from public.pop_catalog
where upc = '889698829878';
