create table if not exists public.shared_shelves (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  description text,
  invite_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shared_shelf_members (
  id uuid primary key default gen_random_uuid(),
  shelf_id uuid not null references public.shared_shelves(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (shelf_id, user_id)
);

alter table public.shared_shelves enable row level security;
alter table public.shared_shelf_members enable row level security;

drop policy if exists "shared shelves are visible to members" on public.shared_shelves;
create policy "shared shelves are visible to members"
on public.shared_shelves
for select
to authenticated
using (
  created_by = (select auth.uid())
  or exists (
    select 1
    from public.shared_shelf_members m
    where m.shelf_id = shared_shelves.id
      and m.user_id = (select auth.uid())
  )
);

drop policy if exists "shared shelf owners can update shelves" on public.shared_shelves;
create policy "shared shelf owners can update shelves"
on public.shared_shelves
for update
to authenticated
using (created_by = (select auth.uid()))
with check (created_by = (select auth.uid()));

drop policy if exists "shared shelf owners can delete shelves" on public.shared_shelves;
create policy "shared shelf owners can delete shelves"
on public.shared_shelves
for delete
to authenticated
using (created_by = (select auth.uid()));

drop policy if exists "members can see own memberships or memberships they own" on public.shared_shelf_members;
create policy "members can see own memberships or memberships they own"
on public.shared_shelf_members
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.shared_shelves s
    where s.id = shared_shelf_members.shelf_id
      and s.created_by = (select auth.uid())
  )
);

drop policy if exists "owners can remove shared shelf members" on public.shared_shelf_members;
create policy "owners can remove shared shelf members"
on public.shared_shelf_members
for delete
to authenticated
using (
  exists (
    select 1
    from public.shared_shelves s
    where s.id = shared_shelf_members.shelf_id
      and s.created_by = (select auth.uid())
  )
);

create or replace function public.create_shared_shelf(
  shelf_name text,
  shelf_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  new_shelf_id uuid;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.shared_shelves (name, description, created_by)
  values (trim(shelf_name), nullif(trim(coalesce(shelf_description, '')), ''), current_user_id)
  returning id into new_shelf_id;

  insert into public.shared_shelf_members (shelf_id, user_id, role)
  values (new_shelf_id, current_user_id, 'owner')
  on conflict (shelf_id, user_id) do nothing;

  return new_shelf_id;
end;
$$;

create or replace function public.join_shared_shelf(invite text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_shelf_id uuid;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select id into target_shelf_id
  from public.shared_shelves
  where invite_code = upper(trim(invite));

  if target_shelf_id is null then
    raise exception 'Shared Shelf invite code not found';
  end if;

  insert into public.shared_shelf_members (shelf_id, user_id, role)
  values (target_shelf_id, current_user_id, 'member')
  on conflict (shelf_id, user_id) do update set role = public.shared_shelf_members.role;

  return target_shelf_id;
end;
$$;

revoke all on function public.create_shared_shelf(text, text) from public;
revoke all on function public.join_shared_shelf(text) from public;
grant execute on function public.create_shared_shelf(text, text) to authenticated;
grant execute on function public.join_shared_shelf(text) to authenticated;

create or replace view public.shared_shelf_collection_view as
select
  s.id as shelf_id,
  s.name as shelf_name,
  s.invite_code,
  member.user_id as owner_user_id,
  coalesce(nullif(p.display_name, ''), nullif(p.username, ''), 'Collector') as owner_display_name,
  ucv.collection_item_id,
  ucv.pop_catalog_id,
  ucv.quantity,
  ucv.condition,
  ucv.owned_variant,
  ucv.purchase_price,
  ucv.current_value,
  ucv.notes,
  ucv.for_trade,
  ucv.for_sale,
  ucv.upc,
  ucv.pop_name,
  ucv.character,
  ucv.franchise,
  ucv.number,
  ucv.variant,
  ucv.exclusivity,
  ucv.pop_style,
  ucv.set_name,
  ucv.image_url,
  ucv.vault_status,
  ucv.estimated_value,
  ucv.value_each,
  ucv.total_value,
  ucv.total_cost,
  ucv.gain_loss,
  ucv.display_variant,
  ucv.display_description,
  ucv.created_at
from public.shared_shelves s
join public.shared_shelf_members member on member.shelf_id = s.id
join public.profiles p on p.id = member.user_id
join public.user_collection_view ucv on ucv.user_id = member.user_id
where exists (
  select 1
  from public.shared_shelf_members viewer
  where viewer.shelf_id = s.id
    and viewer.user_id = auth.uid()
);

grant select on public.shared_shelf_collection_view to authenticated;
grant select on public.shared_shelves to authenticated;
grant select on public.shared_shelf_members to authenticated;

create or replace function public.get_my_shared_shelves()
returns table (
  id uuid,
  name text,
  description text,
  invite_code text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select distinct
    s.id,
    s.name,
    s.description,
    s.invite_code,
    s.created_by,
    s.created_at,
    s.updated_at
  from public.shared_shelves s
  join public.shared_shelf_members m on m.shelf_id = s.id
  where m.user_id = auth.uid()
  order by s.created_at desc;
$$;

revoke all on function public.get_my_shared_shelves() from public;
grant execute on function public.get_my_shared_shelves() to authenticated;
