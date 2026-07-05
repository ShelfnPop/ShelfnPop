create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_shared_shelf_member(target_shelf_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.shared_shelf_members m
    where m.shelf_id = target_shelf_id
      and m.user_id = target_user_id
  );
$$;

create or replace function private.can_view_collection_owner(owner_user_id uuid, viewer_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select owner_user_id = viewer_user_id
    or exists (
      select 1
      from public.shared_shelf_members owner_member
      join public.shared_shelf_members viewer_member
        on viewer_member.shelf_id = owner_member.shelf_id
      where owner_member.user_id = owner_user_id
        and viewer_member.user_id = viewer_user_id
    );
$$;

revoke all on function private.is_shared_shelf_member(uuid, uuid) from public, anon;
revoke all on function private.can_view_collection_owner(uuid, uuid) from public, anon;
grant execute on function private.is_shared_shelf_member(uuid, uuid) to authenticated;
grant execute on function private.can_view_collection_owner(uuid, uuid) to authenticated;

create index if not exists shared_shelf_members_user_id_idx on public.shared_shelf_members (user_id);
create index if not exists shared_shelves_created_by_idx on public.shared_shelves (created_by);
create index if not exists user_collection_items_pop_catalog_id_idx on public.user_collection_items (pop_catalog_id);
create index if not exists wishlist_items_user_id_idx on public.wishlist_items (user_id);
create index if not exists wishlist_items_pop_catalog_id_idx on public.wishlist_items (pop_catalog_id);

alter table public.wishlist_items enable row level security;

drop policy if exists "Users can view their own wishlist items" on public.wishlist_items;
drop policy if exists "Users can insert their own wishlist items" on public.wishlist_items;
drop policy if exists "Users can update their own wishlist items" on public.wishlist_items;
drop policy if exists "Users can delete their own wishlist items" on public.wishlist_items;

create policy "Users can view their own wishlist items"
  on public.wishlist_items
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own wishlist items"
  on public.wishlist_items
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own wishlist items"
  on public.wishlist_items
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own wishlist items"
  on public.wishlist_items
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own collection items" on public.user_collection_items;
drop policy if exists "Users can insert their own collection items" on public.user_collection_items;
drop policy if exists "Users can update their own collection items" on public.user_collection_items;
drop policy if exists "Users can delete their own collection items" on public.user_collection_items;

create policy "Users can view own or shared shelf collection items"
  on public.user_collection_items
  for select
  to authenticated
  using (private.can_view_collection_owner(user_id, (select auth.uid())));

create policy "Users can insert their own collection items"
  on public.user_collection_items
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own collection items"
  on public.user_collection_items
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own collection items"
  on public.user_collection_items
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can view own or shared shelf profiles"
  on public.profiles
  for select
  to authenticated
  using (private.can_view_collection_owner(id, (select auth.uid())));

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can view their own dashboard snapshots" on public.dashboard_snapshots;
drop policy if exists "Users can insert their own dashboard snapshots" on public.dashboard_snapshots;
drop policy if exists "Users can update their own dashboard snapshots" on public.dashboard_snapshots;
drop policy if exists "Users can delete their own dashboard snapshots" on public.dashboard_snapshots;

create policy "Users can view their own dashboard snapshots"
  on public.dashboard_snapshots
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own dashboard snapshots"
  on public.dashboard_snapshots
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own dashboard snapshots"
  on public.dashboard_snapshots
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own dashboard snapshots"
  on public.dashboard_snapshots
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "members can see own memberships or memberships they own" on public.shared_shelf_members;
drop policy if exists "owners can remove shared shelf members" on public.shared_shelf_members;

create policy "members can see memberships in their shelves"
  on public.shared_shelf_members
  for select
  to authenticated
  using (private.is_shared_shelf_member(shelf_id, (select auth.uid())));

create policy "owners can remove shared shelf members"
  on public.shared_shelf_members
  for delete
  to authenticated
  using (exists (
    select 1
    from public.shared_shelves s
    where s.id = shared_shelf_members.shelf_id
      and s.created_by = (select auth.uid())
  ));

alter view public.shared_shelf_collection_view set (security_invoker = true);
alter view public.shared_shelf_grouped_collection_view set (security_invoker = true);

revoke execute on function public.create_shared_shelf(text, text) from public, anon;
revoke execute on function public.get_my_shared_shelves() from public, anon;
revoke execute on function public.join_shared_shelf(text) from public, anon;
revoke execute on function public.update_pop_limited_count(uuid, integer) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

grant execute on function public.create_shared_shelf(text, text) to authenticated;
grant execute on function public.get_my_shared_shelves() to authenticated;
grant execute on function public.join_shared_shelf(text) to authenticated;
grant execute on function public.update_pop_limited_count(uuid, integer) to authenticated;

drop policy if exists "Public can read pop images" on storage.objects;
