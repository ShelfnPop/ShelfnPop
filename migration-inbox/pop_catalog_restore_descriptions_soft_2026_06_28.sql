-- Restore descriptions from raw_api_json after the overly aggressive cleanup.
-- This uses a softer filter: keep normal English Funko/product blurbs,
-- reject only strong foreign-store and price-comparison text.

with source_descriptions as (
  select
    id,
    trim(
      regexp_replace(
        coalesce(
          raw_api_json #>> '{primary,product,description}',
          raw_api_json #>> '{product,description}',
          raw_api_json #>> '{products,0,description}',
          raw_api_json #>> '{value_fallback,products,0,description}'
        ),
        '\s+',
        ' ',
        'g'
      )
    ) as source_description
  from public.pop_catalog
)
update public.pop_catalog pc
set
  description = left(
    trim(
      regexp_replace(
        regexp_replace(
          regexp_replace(sd.source_description, '\s*China Safety Warning:.*$', '', 'i'),
          '\s*WARNING:.*$',
          '',
          'i'
        ),
        '\s*Please understand this before ordering\.?$',
        '',
        'i'
      )
    ),
    280
  ),
  api_last_updated = now()
from source_descriptions sd
where pc.id = sd.id
  and (pc.description is null or trim(pc.description) = '')
  and sd.source_description is not null
  and trim(sd.source_description) <> ''
  and sd.source_description !~* '^no description found\.?$'
  and sd.source_description !~* '^n/a$'
  and sd.source_description !~* '\mdécouvrez\M'
  and sd.source_description !~* '\mcomparez\M'
  and sd.source_description !~* 'avant de l[''’]acheter'
  and sd.source_description !~* '\mréf\.?\M'
  and sd.source_description !~* '\mfigura\M'
  and sd.source_description !~* '\mvinilo\M'
  and sd.source_description !~* '\mvinyle\M'
  and sd.source_description !~* '\mcolecci[oó]n\M'
  and sd.source_description !~* '\mpersonaje\M'
  and sd.source_description !~* '\mproducto\M'
  and sd.source_description !~* 'distribuidor autorizado'
  and sd.source_description !~* '\menv[ií]os\M'
  and sd.source_description !~* '\mpulgadas\M'
  and sd.source_description !~* '\mhecho de\M'
  and sd.source_description !~* '\mempaque\M'
  and sd.source_description !~* 'estoy viviendo'
  and sd.source_description !~* 'de la exitosa serie'
  and sd.source_description !~* '\mdescubre\M'
  and sd.source_description !~* '\mdescrizione\M'
  and sd.source_description !~* '\mtilaa\M'
  and sd.source_description !~* '\mkärkkäiseltä\M'
  and sd.source_description !~* 'suomen suurimmassa'
  and sd.source_description !~* '\mverkkokaupassa\M'
  and sd.source_description !~* '\mtuotetta\M'
  and sd.source_description !~* '\mgrö[ßs]e\M'
  and sd.source_description !~* '\msüße\M'
  and sd.source_description !~* 'deiner lieblingsfranchise'
  and sd.source_description !~* '\msammeln\M'
  and sd.source_description !~* 'compare prices'
  and sd.source_description !~* 'across[[:space:]]+[0-9]+\+?[[:space:]]+retailers'
  and sd.source_description !~* 'from[[:space:]]+\$[0-9]'
  and sd.source_description !~* 'new[[:space:]]*-[[:space:]]*open box'
  and sd.source_description !~* 'retail box'
  and sd.source_description !~* 'product description';
