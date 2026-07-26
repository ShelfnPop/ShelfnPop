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
    url := secrets.project_url || '/functions/v1/daily_catalog_check',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-maintenance-token', secrets.maintenance_token
    ),
    body := jsonb_build_object(
      'limit', 50,
      'since', ((date_trunc('day', now() at time zone 'America/Chicago') - interval '1 day') at time zone 'America/Chicago'),
      'until', (date_trunc('day', now() at time zone 'America/Chicago') at time zone 'America/Chicago')
    )
  )
  from secrets
  where secrets.project_url is not null
    and secrets.maintenance_token is not null;
  $$
);
