-- Second market-value follow-up for the July 11 missing-value batch.
-- Evidence and confidence decisions:
-- migration-inbox/pop_catalog_missing_value_market_deep_dive_second_pass_2026_07_11.md
--
-- Safety:
-- - catalog baselines only; no item-specific current_value writes
-- - only rows that are still missing estimated_value are changed
-- - only proposals meeting the project's 0.75 confidence threshold are included

with proposed(upc, estimated_value) as (
  values
    ('889698576130'::text, 10.00::numeric),
    ('889698576161'::text, 10.00::numeric),
    ('889698797702'::text, 14.00::numeric),
    ('889698797719'::text, 14.00::numeric)
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

-- Verification query after this second pass:
-- batch_rows = 36, valued_rows = 16, missing_rows = 20,
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
