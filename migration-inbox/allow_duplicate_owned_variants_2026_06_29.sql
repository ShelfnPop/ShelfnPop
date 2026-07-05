-- Allow collectors to own multiple entries for the same catalog Pop.
-- This supports shared UPC cases such as Common vs Chase variants.

alter table public.user_collection_items
  drop constraint if exists user_collection_items_user_pop_unique;

create index if not exists user_collection_items_user_pop_variant_idx
on public.user_collection_items (user_id, pop_catalog_id, owned_variant);
