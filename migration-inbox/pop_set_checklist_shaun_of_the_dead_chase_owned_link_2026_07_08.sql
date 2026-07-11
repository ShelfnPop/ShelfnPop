-- Correction note: Shaun Of The Dead chase ownership link, 2026-07-08.
--
-- The Shaun (Pool Cue) common and chase are represented by two user_collection_items
-- that share the same catalog row and differ by owned_variant.
-- Link the chase checklist row to that catalog row so completion reflects 4/4 owned.

with chase_owned as (
  select pc.id as pop_catalog_id, pc.upc
  from public.user_collection_items uci
  join public.pop_catalog pc on pc.id = uci.pop_catalog_id
  where pc.franchise = 'Shaun Of The Dead'
    and pc.set_name = 'Shaun Of The Dead'
    and pc.number = '1660'
    and lower(pc.pop_name) = lower('Shaun (Pool Cue)')
    and lower(coalesce(uci.owned_variant, '')) = 'chase'
  limit 1
), updated_chase_checklist as (
  update public.pop_set_checklist_items ci
  set pop_catalog_id = chase_owned.pop_catalog_id,
      upc = chase_owned.upc,
      updated_at = now(),
      notes = 'Owned via user_collection_items.owned_variant = Chase on the shared Shaun (Pool Cue) #1660 catalog row.'
  from public.pop_sets ps, chase_owned
  where ps.id = ci.set_id
    and ps.canonical_name = 'Shaun Of The Dead'
    and ps.franchise = 'Shaun Of The Dead'
    and ci.number = '1660'
    and lower(ci.pop_name) = lower('Shaun (Pool Cue) (Bloody) (Chase)')
  returning ci.id
)
select (select count(*) from chase_owned) as owned_chase_rows,
       (select count(*) from updated_chase_checklist) as updated_checklist_rows;

