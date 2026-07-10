drop policy if exists "Admins can update pop catalog" on public.pop_catalog;

create policy "Admins can update pop catalog"
  on public.pop_catalog
  for update
  to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

grant update on public.pop_catalog to authenticated;
