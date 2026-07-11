drop policy if exists "members can leave shared shelves" on public.shared_shelf_members;

create policy "members can leave shared shelves"
  on public.shared_shelf_members
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    and role <> 'owner'
  );

