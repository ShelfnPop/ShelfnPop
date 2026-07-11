-- Toy Story + Stranger Things release/vault pass, 2026-07-08.
-- Scope: high-confidence release dates and official Funko vaulted matches.
-- Notes:
-- - Do not mark Toy Story Bullseye #520 vaulted; official Funko currently shows it as available/low stock.
-- - Do not broadly mark Toy Story 4 rows vaulted from marketplace titles alone.
-- - Season 5 Stranger Things release dates are only updated where a retailer gives an exact street date.

update public.pop_catalog
set vault_status = 'Vaulted'
where id in (
  'b77e2a72-e743-4f26-861f-c493438d9a23', -- Steve #803, official Funko From the Vault.
  '1b147025-f02b-4134-a917-8a8d8f86d5d1', -- Dustin at Camp #804, official Funko From the Vault.
  '67ce431f-905f-480c-8111-07267aa0edfb', -- Eleven #1238, official Funko From the Vault.
  '9421f88a-7758-4dd6-a43e-420f08508c2d'  -- 001 / Number One #1387, official Funko From the Vault.
);

update public.pop_catalog
set release_date = '2023-07-01'
where id = '9421f88a-7758-4dd6-a43e-420f08508c2d'
  and release_date is null;

update public.pop_catalog
set release_date = '2025-10-03'
where id = '48668943-9d4c-4730-9261-c5705ac43948'
  and release_date is null;

update public.pop_catalog
set release_date = '2019-02-01'
where id = '5b16f7ee-4880-4dde-8c35-84771757a15b'
  and release_date is null;

-- Verification:
-- select pop_name, set_name, number, vault_status, release_date
-- from public.pop_catalog
-- where id in (
--   'b77e2a72-e743-4f26-861f-c493438d9a23',
--   '1b147025-f02b-4134-a917-8a8d8f86d5d1',
--   '67ce431f-905f-480c-8111-07267aa0edfb',
--   '9421f88a-7758-4dd6-a43e-420f08508c2d',
--   '48668943-9d4c-4730-9261-c5705ac43948',
--   '5b16f7ee-4880-4dde-8c35-84771757a15b'
-- )
-- order by set_name, nullif(regexp_replace(coalesce(number,''), '\D', '', 'g'), '')::int nulls last;
