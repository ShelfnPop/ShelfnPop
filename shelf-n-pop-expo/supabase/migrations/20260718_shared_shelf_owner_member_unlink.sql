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
    or exists (
      select 1
      from public.shared_shelf_members owner_member
      where owner_member.shelf_id = shared_shelf_members.shelf_id
        and owner_member.user_id = (select auth.uid())
        and owner_member.role = 'owner'
    )
  );
