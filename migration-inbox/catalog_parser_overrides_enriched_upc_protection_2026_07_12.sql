-- Protect scan-safe UPC rows from Funko_Catalog_Enriched_Bundle.zip, 2026-07-12.
--
-- Safety choices:
-- - Does not insert or overwrite public.pop_catalog rows.
-- - Does not overwrite existing active parser overrides.
-- - Does not use starter-catalog set totals as checklist totals.
-- - Builds override_data from the current live pop_catalog row so more precise
--   existing values survive future lookup refreshes.

begin;

with candidate(upc) as (
  values
    ('849803047771'),
    ('849803047788'),
    ('849803055790'),
    ('849803047801'),
    ('849803047818'),
    ('849803047825'),
    ('849803047757'),
    ('849803056063'),
    ('849803047931'),
    ('849803065089'),
    ('889698348836'),
    ('889698548991'),
    ('889698549011'),
    ('889698549004'),
    ('889698548977'),
    ('889698548984'),
    ('889698543286'),
    ('889698637398'),
    ('889698627818'),
    ('889698648059'),
    ('889698648066'),
    ('849803062286'),
    ('849803062262'),
    ('889698216463'),
    ('849803037918'),
    ('849803037925'),
    ('849803037949'),
    ('849803037956'),
    ('849803051044'),
    ('849803051754'),
    ('849803051785'),
    ('849803051051'),
    ('849803057398'),
    ('849803053406'),
    ('889698220330'),
    ('889698469579'),
    ('889698475280'),
    ('849803044565'),
    ('889698650304'),
    ('889698609159')
), source_rows as (
  select pc.*
  from candidate c
  join public.pop_catalog pc on pc.upc = c.upc
  where not exists (
    select 1
    from public.catalog_parser_overrides cpo
    where cpo.upc = c.upc
      and cpo.is_active
  )
), upserted_overrides as (
  insert into public.catalog_parser_overrides (
    upc,
    pop_catalog_id,
    override_data,
    notes,
    is_active
  )
  select
    sr.upc,
    sr.id,
    jsonb_strip_nulls(jsonb_build_object(
      'pop_name', sr.pop_name,
      'character', sr.character,
      'franchise', sr.franchise,
      'set_name', sr.set_name,
      'number', sr.number,
      'variant', sr.variant,
      'exclusivity', sr.exclusivity,
      'pop_type', sr.pop_type,
      'pop_style', sr.pop_style,
      'image_url', sr.image_url,
      'image_source', sr.image_source,
      'vault_status', sr.vault_status,
      'estimated_value', sr.estimated_value,
      'description', sr.description,
      'display_description', sr.display_description,
      'parse_confidence', greatest(coalesce(sr.parse_confidence, 0.98), 0.98),
      'needs_review', coalesce(sr.needs_review, false)
    )),
    'Protected from Funko_Catalog_Enriched_Bundle scan-safe UPC import 2026-07-12; override mirrors current live catalog values and does not overwrite catalog rows.',
    true
  from source_rows sr
  on conflict (upc) do update
  set pop_catalog_id = excluded.pop_catalog_id,
      override_data = excluded.override_data,
      notes = excluded.notes,
      is_active = true,
      updated_at = now()
  where not public.catalog_parser_overrides.is_active
  returning upc
)
select count(*) as inserted_or_reactivated_override_count
from upserted_overrides;

-- Verification: after apply, all 40 candidate UPC rows should exist in
-- pop_catalog and should have an active parser override.
with candidate(upc) as (
  values
    ('849803047771'),
    ('849803047788'),
    ('849803055790'),
    ('849803047801'),
    ('849803047818'),
    ('849803047825'),
    ('849803047757'),
    ('849803056063'),
    ('849803047931'),
    ('849803065089'),
    ('889698348836'),
    ('889698548991'),
    ('889698549011'),
    ('889698549004'),
    ('889698548977'),
    ('889698548984'),
    ('889698543286'),
    ('889698637398'),
    ('889698627818'),
    ('889698648059'),
    ('889698648066'),
    ('849803062286'),
    ('849803062262'),
    ('889698216463'),
    ('849803037918'),
    ('849803037925'),
    ('849803037949'),
    ('849803037956'),
    ('849803051044'),
    ('849803051754'),
    ('849803051785'),
    ('849803051051'),
    ('849803057398'),
    ('849803053406'),
    ('889698220330'),
    ('889698469579'),
    ('889698475280'),
    ('849803044565'),
    ('889698650304'),
    ('889698609159')
)
select
  count(*) as candidate_count,
  count(pc.id) as catalog_rows,
  count(cpo.id) filter (where cpo.is_active) as active_overrides,
  count(*) filter (where pc.id is null) as missing_catalog_rows
from candidate c
left join public.pop_catalog pc on pc.upc = c.upc
left join public.catalog_parser_overrides cpo
  on cpo.upc = c.upc
 and cpo.is_active;

commit;
