alter table public.pop_catalog
  add column if not exists parse_reason_codes text[] not null default array[]::text[];

create table if not exists public.catalog_parser_overrides (
  id uuid primary key default gen_random_uuid(),
  upc text not null unique,
  pop_catalog_id uuid references public.pop_catalog(id) on delete set null,
  override_data jsonb not null,
  learned_from_audit_event_id uuid references public.admin_audit_events(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_active boolean not null default true,
  notes text
);

alter table public.catalog_parser_overrides enable row level security;

create index if not exists catalog_parser_overrides_active_upc_idx
  on public.catalog_parser_overrides (upc)
  where is_active;

drop policy if exists "Admins can view parser overrides" on public.catalog_parser_overrides;
drop policy if exists "Admins can create parser overrides" on public.catalog_parser_overrides;
drop policy if exists "Admins can update parser overrides" on public.catalog_parser_overrides;

create policy "Admins can view parser overrides"
  on public.catalog_parser_overrides
  for select
  to authenticated
  using (private.is_admin((select auth.uid())));

create policy "Admins can create parser overrides"
  on public.catalog_parser_overrides
  for insert
  to authenticated
  with check (private.is_admin((select auth.uid())));

create policy "Admins can update parser overrides"
  on public.catalog_parser_overrides
  for update
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

grant select, insert, update on public.catalog_parser_overrides to authenticated;

create or replace function public.touch_catalog_parser_override_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.touch_catalog_parser_override_updated_at() from public, anon, authenticated;

drop trigger if exists touch_catalog_parser_override_updated_at on public.catalog_parser_overrides;

create trigger touch_catalog_parser_override_updated_at
  before update on public.catalog_parser_overrides
  for each row
  execute function public.touch_catalog_parser_override_updated_at();

create or replace function private.compute_parse_reason_codes(
  raw_title text,
  clean_title text,
  pop_name text,
  franchise text,
  set_name text,
  number text,
  variant text,
  exclusivity text,
  estimated_value numeric,
  parse_confidence numeric
)
returns text[]
language sql
immutable
as $$
  select coalesce(array_agg(reason order by reason), array[]::text[])
  from (
    select 'missing_title' as reason
    where nullif(btrim(coalesce(raw_title, '')), '') is null

    union all
    select 'missing_franchise'
    where nullif(btrim(coalesce(franchise, '')), '') is null

    union all
    select 'missing_set'
    where nullif(btrim(coalesce(set_name, '')), '') is null

    union all
    select 'missing_number'
    where nullif(btrim(coalesce(number, '')), '') is null

    union all
    select 'missing_value'
    where estimated_value is null or estimated_value = 0

    union all
    select 'weak_name_cleanup'
    where nullif(btrim(coalesce(raw_title, '')), '') is not null
      and nullif(btrim(coalesce(pop_name, '')), '') is not null
      and length(pop_name) >= greatest(length(raw_title) - 3, 1)

    union all
    select 'generic_set_label'
    where nullif(btrim(coalesce(set_name, '')), '') is not null
      and lower(btrim(set_name)) in ('marvel', 'dc', 'disney', 'star wars', 'n/a', 'funko', 'pop! icons')

    union all
    select 'variant_or_exclusive_title_noise'
    where lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '')) ~ '(exclusive|special edition|\\bse\\b|metallic|diamond|glitter|chase|flocked|glow|gitd)'
      and (nullif(btrim(coalesce(variant, '')), '') is null or nullif(btrim(coalesce(exclusivity, '')), '') is null)

    union all
    select 'confidence_floor_070'
    where parse_confidence is not null
      and parse_confidence < 0.75
  ) reasons;
$$;

revoke all on function private.compute_parse_reason_codes(text, text, text, text, text, text, text, text, numeric, numeric) from public, anon, authenticated;

update public.pop_catalog
set parse_reason_codes = private.compute_parse_reason_codes(
  raw_title,
  clean_title,
  pop_name,
  franchise,
  set_name,
  number,
  variant,
  exclusivity,
  estimated_value,
  parse_confidence
)
where parse_confidence < 0.75
   or needs_review is true
   or image_url is null
   or estimated_value is null
   or estimated_value = 0
   or coalesce(array_length(parse_reason_codes, 1), 0) = 0;
