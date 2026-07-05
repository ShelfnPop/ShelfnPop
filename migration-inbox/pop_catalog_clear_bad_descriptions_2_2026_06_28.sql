-- Clear additional low-quality descriptions found in pop_catalog_rows_parser_review_2.csv.
-- These are non-English store blurbs or generic manufacturer/retailer boilerplate.

update public.pop_catalog
set
  description = null,
  api_last_updated = now()
where description is not null
  and (
    description ~* '\mfigur\M'
    or description ~* '\mfigura\M'
    or description ~* '\mvinilo\M'
    or description ~* '\mvinyle\M'
    or description ~* '\mcolecci[oó]n\M'
    or description ~* '\mproducto\M'
    or description ~* '\mdescrizione\M'
    or description ~* '\mtilaa\M'
    or description ~* '\mkärkkäiseltä\M'
    or description ~* 'suomen suurimmassa'
    or description ~* '\mverkkokaupassa\M'
    or description ~* '\mtuotetta\M'
    or description ~* '\mgr[oö]ße\M'
    or description ~* '\msüße\M'
    or description ~* 'deiner lieblingsfranchise'
    or description ~* '\msammeln\M'
    or description ~* '\mavec\M'
    or description ~* '\mcomo\M'
    or description ~* 'from funko[''’]s popular [''’]?pop!?[''’]? series'
    or description ~* 'stands approx\.?[[:space:]]*9[[:space:]]*cm'
    or description ~* 'window box packaging'
    or description ~* 'leading pop culture brand'
    or description ~* 'premium vinyl material'
    or description ~* 'funko delivers a fun'
    or description ~* 'inspired by designer toys'
    or description ~* 'stylized collectable stands'
    or description ~* 'collect and display all'
    or description ~* 'new[[:space:]]*-[[:space:]]*open box'
    or description ~* 'retail box'
    or description ~* 'product description'
  );

-- Exact rows seen in the latest review export.
update public.pop_catalog
set
  description = null,
  api_last_updated = now()
where upc in (
  '889698838658',
  '889698724715',
  '889698838641',
  '889698919913',
  '889698838665',
  '889698861175',
  '889698724869',
  '889698889049',
  '889698889032',
  '889698761093',
  '889698862950',
  '889698830911',
  '889698645355',
  '889698691970',
  '849803055295',
  '849803055400'
);
