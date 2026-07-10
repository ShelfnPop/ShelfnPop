create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table if not exists public.admin_users (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  notes text
);

alter table public.admin_users enable row level security;

create or replace function private.is_admin(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = target_user_id
      and target_user_id = auth.uid()
  );
$$;

revoke all on function private.is_admin(uuid) from public, anon;
grant execute on function private.is_admin(uuid) to authenticated;

drop policy if exists "Admins can view their own admin membership" on public.admin_users;

create policy "Admins can view their own admin membership"
  on public.admin_users
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create table if not exists public.catalog_issue_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  pop_catalog_id uuid references public.pop_catalog(id) on delete set null,
  collection_item_id uuid references public.user_collection_items(id) on delete set null,
  issue_type text not null check (
    issue_type in (
      'wrong_image',
      'missing_image',
      'wrong_value',
      'missing_value',
      'wrong_details',
      'duplicate',
      'other'
    )
  ),
  notes text,
  status text not null default 'open' check (status in ('open', 'resolved', 'ignored')),
  admin_notes text,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.catalog_issue_reports enable row level security;

create index if not exists catalog_issue_reports_status_created_idx
  on public.catalog_issue_reports (status, created_at desc);

create index if not exists catalog_issue_reports_pop_catalog_id_idx
  on public.catalog_issue_reports (pop_catalog_id);

create index if not exists catalog_issue_reports_reporter_user_id_idx
  on public.catalog_issue_reports (reporter_user_id);

create or replace function public.touch_catalog_issue_report_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.touch_catalog_issue_report_updated_at() from public, anon, authenticated;

drop trigger if exists touch_catalog_issue_report_updated_at on public.catalog_issue_reports;

create trigger touch_catalog_issue_report_updated_at
  before update on public.catalog_issue_reports
  for each row
  execute function public.touch_catalog_issue_report_updated_at();

drop policy if exists "Users can create their own catalog issue reports" on public.catalog_issue_reports;
drop policy if exists "Users can view their own catalog issue reports" on public.catalog_issue_reports;
drop policy if exists "Admins can view all catalog issue reports" on public.catalog_issue_reports;
drop policy if exists "Admins can update catalog issue reports" on public.catalog_issue_reports;

create policy "Users can create their own catalog issue reports"
  on public.catalog_issue_reports
  for insert
  to authenticated
  with check (reporter_user_id = (select auth.uid()));

create policy "Users can view their own catalog issue reports"
  on public.catalog_issue_reports
  for select
  to authenticated
  using (reporter_user_id = (select auth.uid()));

create policy "Admins can view all catalog issue reports"
  on public.catalog_issue_reports
  for select
  to authenticated
  using (private.is_admin((select auth.uid())));

create policy "Admins can update catalog issue reports"
  on public.catalog_issue_reports
  for update
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

grant select on public.admin_users to authenticated;
grant select, insert, update on public.catalog_issue_reports to authenticated;
revoke delete on public.catalog_issue_reports from anon, authenticated;

-- After this migration is applied, grant yourself access with your profile id:
-- insert into public.admin_users (user_id, notes)
-- values ('00000000-0000-0000-0000-000000000000', 'Owner account')
-- on conflict (user_id) do nothing;
