-- Backfill pop_catalog.description from existing raw_api_json where possible.
-- This keeps junk placeholders out and limits descriptions to a short app-friendly length.

update public.pop_catalog
set description = left(
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
  ),
  280
)
where
  (description is null or trim(description) = '')
  and coalesce(
    raw_api_json #>> '{primary,product,description}',
    raw_api_json #>> '{product,description}',
    raw_api_json #>> '{products,0,description}',
    raw_api_json #>> '{value_fallback,products,0,description}'
  ) is not null
  and trim(coalesce(
    raw_api_json #>> '{primary,product,description}',
    raw_api_json #>> '{product,description}',
    raw_api_json #>> '{products,0,description}',
    raw_api_json #>> '{value_fallback,products,0,description}'
  )) <> ''
  and coalesce(
    raw_api_json #>> '{primary,product,description}',
    raw_api_json #>> '{product,description}',
    raw_api_json #>> '{products,0,description}',
    raw_api_json #>> '{value_fallback,products,0,description}'
  ) !~* '^no description found\.?$'
  and coalesce(
    raw_api_json #>> '{primary,product,description}',
    raw_api_json #>> '{product,description}',
    raw_api_json #>> '{products,0,description}',
    raw_api_json #>> '{value_fallback,products,0,description}'
  ) !~* '^n/a$';
