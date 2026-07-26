create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

-- Required one-time secrets before enabling this job:
-- select vault.create_secret('https://YOUR-PROJECT-REF.supabase.co', 'project_url');
-- select vault.create_secret('YOUR_MAINTENANCE_ADMIN_TOKEN', 'maintenance_admin_token');
--
-- The schedule below runs at 06:00 UTC, which is 1:00 AM America/Chicago during daylight saving time.
-- Supabase Cron uses GMT/UTC cron syntax.

select cron.unschedule('daily-catalog-previous-day-check')
where exists (
  select 1
  from cron.job
  where jobname = 'daily-catalog-previous-day-check'
);

select cron.schedule(
  'daily-catalog-previous-day-check',
  '0 6 * * *',
  $$
  with secrets as (
    select
      (select decrypted_secret from vault.decrypted_secrets where name = 'project_url' limit 1) as project_url,
      (select decrypted_secret from vault.decrypted_secrets where name = 'maintenance_admin_token' limit 1) as maintenance_token
  )
  select net.http_post(
    url := secrets.project_url || '/functions/v1/refresh_catalog_values',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-maintenance-token', secrets.maintenance_token
    ),
    body := jsonb_build_object(
      'mode', 'yesterday',
      'limit', 50,
      'syncCollectionValues', true,
      'since', ((date_trunc('day', now() at time zone 'America/Chicago') - interval '1 day') at time zone 'America/Chicago'),
      'until', (date_trunc('day', now() at time zone 'America/Chicago') at time zone 'America/Chicago')
    )
  )
  from secrets
  where secrets.project_url is not null
    and secrets.maintenance_token is not null;
  $$
);
