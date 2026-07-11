-- Add and backfill catalog release dates, staged 2026-07-07.
-- This is staged in migration-inbox for review before applying to Supabase.

alter table public.pop_catalog
add column if not exists release_date date;

update public.pop_catalog
set release_date = release_source.release_date
from (
  select
    id,
    coalesce(
      nullif(raw_api_json #>> '{primary,pricecharting,response,release-date}', ''),
      nullif(raw_api_json #>> '{pricecharting,response,release-date}', ''),
      nullif(raw_api_json #>> '{primary,primary,pricecharting,response,release-date}', '')
    )::date as release_date
  from public.pop_catalog
  where coalesce(
      nullif(raw_api_json #>> '{primary,pricecharting,response,release-date}', ''),
      nullif(raw_api_json #>> '{pricecharting,response,release-date}', ''),
      nullif(raw_api_json #>> '{primary,primary,pricecharting,response,release-date}', '')
    ) ~ '^(19|20)[0-9]{2}-[0-9]{2}-[0-9]{2}$'
) as release_source
where public.pop_catalog.id = release_source.id
  and public.pop_catalog.release_date is distinct from release_source.release_date;

comment on column public.pop_catalog.release_date is
  'Best-known Funko/catalog release date. Backfilled from provider payloads when explicit release-date data is available.';

-- Verification after applying:
-- select count(*) filter (where release_date is not null) as with_release_date,
--        count(*) filter (where release_date is null) as missing_release_date
-- from public.pop_catalog;
