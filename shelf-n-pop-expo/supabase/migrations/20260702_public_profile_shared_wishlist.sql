drop policy if exists "Shared shelf members can view public wishlists" on public.wishlist_items;

create policy "Shared shelf members can view public wishlists"
  on public.wishlist_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles owner_profile
      where owner_profile.id = wishlist_items.user_id
        and coalesce(owner_profile.is_public, false)
        and private.can_view_collection_owner(wishlist_items.user_id, (select auth.uid()))
    )
  );

create or replace view public.shared_public_wishlist_view
with (security_invoker = true) as
select
  wi.id,
  wi.user_id,
  wi.pop_catalog_id,
  wi.priority,
  wi.notes,
  wi.created_at,
  p.display_name as owner_display_name,
  p.username as owner_username,
  p.avatar_url as owner_avatar_url,
  pc.upc,
  pc.pop_name,
  pc.character,
  pc.franchise,
  pc.number,
  pc.variant,
  pc.exclusivity,
  pc.pop_style,
  pc.set_name,
  pc.image_url,
  pc.vault_status,
  pc.estimated_value,
  pc.display_description,
  pc.limited_edition,
  pc.limited_count,
  pc.edition_notes
from public.wishlist_items wi
join public.profiles p on p.id = wi.user_id
join public.pop_catalog pc on pc.id = wi.pop_catalog_id
where coalesce(p.is_public, false)
  and private.can_view_collection_owner(wi.user_id, (select auth.uid()));

grant select on public.shared_public_wishlist_view to authenticated;
