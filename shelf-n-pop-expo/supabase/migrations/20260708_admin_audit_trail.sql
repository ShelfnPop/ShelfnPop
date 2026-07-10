create table if not exists public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  table_name text not null,
  row_id uuid,
  related_report_id uuid references public.catalog_issue_reports(id) on delete set null,
  before_data jsonb,
  after_data jsonb,
  changed_fields text[] not null default array[]::text[],
  created_at timestamptz not null default now()
);

alter table public.admin_audit_events enable row level security;

create index if not exists admin_audit_events_created_at_idx
  on public.admin_audit_events (created_at desc);

create index if not exists admin_audit_events_row_idx
  on public.admin_audit_events (table_name, row_id, created_at desc);

drop policy if exists "Admins can view admin audit events" on public.admin_audit_events;

create policy "Admins can view admin audit events"
  on public.admin_audit_events
  for select
  to authenticated
  using (private.is_admin((select auth.uid())));

grant select on public.admin_audit_events to authenticated;

create or replace function private.jsonb_changed_fields(old_row jsonb, new_row jsonb)
returns text[]
language sql
immutable
as $$
  select coalesce(array_agg(key order by key), array[]::text[])
  from (
    select key
    from jsonb_object_keys(old_row || new_row) as keys(key)
    where (old_row -> key) is distinct from (new_row -> key)
  ) changed;
$$;

revoke all on function private.jsonb_changed_fields(jsonb, jsonb) from public, anon, authenticated;

create or replace function private.audit_pop_catalog_update()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  old_data jsonb;
  new_data jsonb;
  changed text[];
begin
  if not private.is_admin(auth.uid()) then
    return new;
  end if;

  old_data := to_jsonb(old);
  new_data := to_jsonb(new);
  changed := private.jsonb_changed_fields(old_data, new_data);

  if coalesce(array_length(changed, 1), 0) > 0 then
    insert into public.admin_audit_events (
      actor_user_id,
      action,
      table_name,
      row_id,
      before_data,
      after_data,
      changed_fields
    )
    values (
      auth.uid(),
      'catalog_update',
      'pop_catalog',
      new.id,
      old_data,
      new_data,
      changed
    );
  end if;

  return new;
end;
$$;

revoke all on function private.audit_pop_catalog_update() from public, anon, authenticated;

drop trigger if exists audit_pop_catalog_update on public.pop_catalog;

create trigger audit_pop_catalog_update
  after update on public.pop_catalog
  for each row
  execute function private.audit_pop_catalog_update();

create or replace function private.audit_catalog_issue_report_update()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  old_data jsonb;
  new_data jsonb;
  changed text[];
begin
  if not private.is_admin(auth.uid()) then
    return new;
  end if;

  old_data := to_jsonb(old);
  new_data := to_jsonb(new);
  changed := private.jsonb_changed_fields(old_data, new_data);

  if coalesce(array_length(changed, 1), 0) > 0 then
    insert into public.admin_audit_events (
      actor_user_id,
      action,
      table_name,
      row_id,
      related_report_id,
      before_data,
      after_data,
      changed_fields
    )
    values (
      auth.uid(),
      case
        when old.status is distinct from new.status then 'report_status_update'
        else 'report_update'
      end,
      'catalog_issue_reports',
      new.id,
      new.id,
      old_data,
      new_data,
      changed
    );
  end if;

  return new;
end;
$$;

revoke all on function private.audit_catalog_issue_report_update() from public, anon, authenticated;

drop trigger if exists audit_catalog_issue_report_update on public.catalog_issue_reports;

create trigger audit_catalog_issue_report_update
  after update on public.catalog_issue_reports
  for each row
  execute function private.audit_catalog_issue_report_update();
