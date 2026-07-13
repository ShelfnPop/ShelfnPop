-- Retail fallback values for the remaining July 11 missing-value batch.
-- Evidence and policy:
-- migration-inbox/pop_catalog_missing_value_retail_fallback_2026_07_11.md
--
-- Safety:
-- - catalog baselines only; no item-specific current_value writes
-- - only rows that are still missing estimated_value are changed
-- - values are retail/listing fallbacks intended to be replaced by the
--   bi-weekly market refresh when stronger value data becomes available

with proposed(upc, estimated_value) as (
  values
    ('849803062224'::text, 11.00::numeric),
    ('889698147552'::text,  7.00::numeric),
    ('889698450355'::text, 14.00::numeric),
    ('889698711609'::text, 13.00::numeric),
    ('889698744775'::text, 20.00::numeric),
    ('889698761116'::text, 10.00::numeric),
    ('889698797221'::text, 10.00::numeric),
    ('889698797245'::text, 15.00::numeric),
    ('889698797726'::text, 18.00::numeric),
    ('889698802420'::text, 14.00::numeric),
    ('889698802475'::text, 15.00::numeric),
    ('889698805605'::text, 10.00::numeric),
    ('889698810739'::text, 25.00::numeric),
    ('889698834636'::text, 16.00::numeric),
    ('889698835534'::text, 10.00::numeric),
    ('889698835541'::text, 10.00::numeric),
    ('889698835558'::text, 10.00::numeric),
    ('889698837293'::text, 12.00::numeric),
    ('889698839747'::text, 15.00::numeric),
    ('889698839761'::text, 15.00::numeric)
)
update public.pop_catalog pc
set
  estimated_value = proposed.estimated_value,
  parse_reason_codes = array_remove(
    coalesce(pc.parse_reason_codes, array[]::text[]),
    'estimated_value_missing'
  )
from proposed
where pc.upc = proposed.upc
  and pc.estimated_value is null;

-- Verification query after this retail fallback pass:
-- batch_rows = 36, valued_rows = 36, missing_rows = 0,
-- stale_missing_value_reason_codes = 0 among valued rows.
with batch(upc) as (
  values
    ('849803062224'), ('849803062262'), ('889698147385'), ('889698147552'),
    ('889698398824'), ('889698450355'), ('889698576130'), ('889698576161'),
    ('889698601634'), ('889698711609'), ('889698714150'), ('889698744775'),
    ('889698761116'), ('889698762137'), ('889698796972'), ('889698797221'),
    ('889698797245'), ('889698797702'), ('889698797719'), ('889698797726'),
    ('889698802420'), ('889698802475'), ('889698805605'), ('889698810739'),
    ('889698821278'), ('889698834636'), ('889698835534'), ('889698835541'),
    ('889698835558'), ('889698837293'), ('889698839747'), ('889698839761'),
    ('889698841146'), ('889698844314'), ('889698884006'), ('889698904551')
)
select
  count(*)::int as batch_rows,
  count(*) filter (where pc.estimated_value is not null)::int as valued_rows,
  count(*) filter (where pc.estimated_value is null)::int as missing_rows,
  count(*) filter (
    where pc.estimated_value is not null
      and 'estimated_value_missing' = any(coalesce(pc.parse_reason_codes, array[]::text[]))
  )::int as stale_missing_value_reason_codes
from batch
join public.pop_catalog pc using (upc);
