-- Clear stale estimated_value_missing flags on rows that already have estimated_value.
-- Keep other parser warnings, such as missing_number, untouched.

update pop_catalog
set parse_reason_codes = array_remove(parse_reason_codes, 'estimated_value_missing')
where estimated_value is not null
  and parse_reason_codes @> array['estimated_value_missing']::text[];

select
  count(*) as stale_estimated_value_missing_flags
from pop_catalog
where estimated_value is not null
  and parse_reason_codes @> array['estimated_value_missing']::text[];
