-- DC Jim Lee Collection checklist correction, staged 2026-07-08.
-- Not applied live in this shell.
--
-- Sources:
--   FigureRealm DC Collection Pop! checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10
--   Official Funko Vault page for Superman on Gargoyle #278:
--     https://funko.com/pop-deluxe-dc--superman-on-gargoyle-jim-lee/34072.html
--
-- Rationale:
--   The earlier Superman pass left DC Jim Lee Collection as draft with set_total = 7.
--   FigureRealm lists 15 DC Collection Pop! items in this Jim Lee-style slice,
--   including black-and-white variants. Because the live catalog already tracks
--   a black-and-white Superman #278 row, the completion denominator should keep
--   those variant rows instead of collapsing to character-only count.

update public.pop_catalog
set set_total = 15
where franchise = 'DC'
  and set_name = 'DC Jim Lee Collection';

with upsert_sets as (
  insert into public.pop_sets (
    canonical_name,
    franchise,
    status,
    source_label,
    source_url,
    confidence,
    reviewed_at,
    notes
  )
  values (
    'DC Jim Lee Collection',
    'DC',
    'reviewed',
    'FigureRealm DC Collection Pop! checklist and Funko Vault Superman #278 page',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10',
    0.86,
    now(),
    'Reviewed as a 15-item completion checklist from FigureRealm DC Collection Pop! entries, preserving black-and-white variants because the app already tracks at least one black-and-white catalog row. Funko official Vault page verifies Superman on Gargoyle #278 as Pop! Deluxe and vaulted.'
  )
  on conflict (canonical_name, franchise) do update set
    status = excluded.status,
    source_label = excluded.source_label,
    source_url = excluded.source_url,
    confidence = excluded.confidence,
    reviewed_at = excluded.reviewed_at,
    notes = excluded.notes,
    updated_at = now()
  returning id
), checklist(upc_value, pop_name, character_name, number_value, variant_value, pop_type_value, pop_style_value, source_url, confidence_value, notes_value) as (
  values
    (null, 'Aquaman', 'Aquaman', '254', 'Common', 'Pop! Heroes', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10', 0.86::numeric, 'DC Jim Lee Collection checklist item.'),
    (null, 'Aquaman', 'Aquaman', '254', 'Black & White', 'Pop! Heroes', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10', 0.86::numeric, 'DC Jim Lee Collection black-and-white checklist item.'),
    (null, 'Batman (Hush)', 'Batman', '239', 'Common', 'Pop! Heroes', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10', 0.86::numeric, 'DC Jim Lee Collection checklist item.'),
    (null, 'Batman (Hush)', 'Batman', '239', 'Black & White', 'Pop! Heroes', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10', 0.86::numeric, 'DC Jim Lee Collection black-and-white checklist item.'),
    (null, 'Joker (Hush)', 'Joker', '240', 'Common', 'Pop! Heroes', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10', 0.86::numeric, 'DC Jim Lee Collection checklist item.'),
    (null, 'Joker (Hush)', 'Joker', '240', 'Black & White', 'Pop! Heroes', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10', 0.86::numeric, 'DC Jim Lee Collection black-and-white checklist item.'),
    (null, 'Flash', 'Flash', '268', 'Common', 'Pop! Heroes', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10', 0.86::numeric, 'DC Jim Lee Collection checklist item.'),
    (null, 'Flash', 'Flash', '268', 'Black & White', 'Pop! Heroes', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10', 0.86::numeric, 'DC Jim Lee Collection black-and-white checklist item.'),
    (null, 'Catwoman', 'Catwoman', '269', 'Common', 'Pop! Heroes', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10', 0.86::numeric, 'DC Jim Lee Collection checklist item.'),
    (null, 'Catwoman', 'Catwoman', '269', 'Black & White', 'Pop! Heroes', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10', 0.86::numeric, 'DC Jim Lee Collection black-and-white checklist item.'),
    (null, 'Green Lantern and Batman', 'Green Lantern & Batman', '271', 'Common', 'Pop! Heroes', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10', 0.86::numeric, 'DC Jim Lee Collection checklist item.'),
    ('889698340724', 'Superman on Gargoyle', 'Superman', '278', 'Common', 'Pop! Heroes', 'Deluxe', 'https://funko.com/pop-deluxe-dc--superman-on-gargoyle-jim-lee/34072.html', 0.90::numeric, 'Official Funko Vault page verifies Superman on Gargoyle #278 as Pop! Deluxe and vaulted.'),
    ('889698397742', 'Superman on Gargoyle', 'Superman', '278', 'Black & White', 'Pop! Heroes', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10', 0.86::numeric, 'DC Jim Lee Collection black-and-white checklist item.'),
    (null, 'Wonder Woman', 'Wonder Woman', '282', 'Common', 'Pop! Heroes', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10', 0.86::numeric, 'DC Jim Lee Collection checklist item.'),
    (null, 'Wonder Woman', 'Wonder Woman', '282', 'Black & White', 'Pop! Heroes', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10', 0.86::numeric, 'DC Jim Lee Collection black-and-white checklist item.')
), matched as (
  select
    upsert_sets.id as set_id,
    pc.id as pop_catalog_id,
    checklist.*
  from checklist
  cross join upsert_sets
  left join lateral (
    select pc.id
    from public.pop_catalog pc
    where pc.franchise = 'DC'
      and lower(pc.set_name) = lower('DC Jim Lee Collection')
      and (
        (checklist.upc_value is not null and pc.upc = checklist.upc_value)
        or (
          ltrim(coalesce(pc.number, ''), '0') = ltrim(checklist.number_value, '0')
          and (
            lower(coalesce(pc.pop_name, pc.character, '')) = lower(checklist.pop_name)
            or lower(coalesce(pc.character, pc.pop_name, '')) = lower(checklist.character_name)
            or lower(coalesce(pc.pop_name, pc.character, '')) like lower(checklist.character_name || '%')
          )
        )
      )
    order by
      case when lower(coalesce(pc.variant, 'Common')) = lower(checklist.variant_value) then 0 else 1 end,
      pc.created_at desc nulls last
    limit 1
  ) pc on true
)
insert into public.pop_set_checklist_items (
  set_id,
  pop_catalog_id,
  upc,
  pop_name,
  character,
  number,
  variant,
  exclusivity,
  pop_type,
  pop_style,
  is_required_for_completion,
  source_url,
  confidence,
  notes
)
select
  set_id,
  pop_catalog_id,
  upc_value,
  pop_name,
  character_name,
  number_value,
  variant_value,
  null,
  pop_type_value,
  pop_style_value,
  true,
  source_url,
  confidence_value,
  notes_value
from matched
on conflict (set_id, coalesce(number, ''), lower(coalesce(pop_name, '')), lower(coalesce(variant, '')), lower(coalesce(exclusivity, ''))) do update set
  pop_catalog_id = coalesce(excluded.pop_catalog_id, public.pop_set_checklist_items.pop_catalog_id),
  upc = coalesce(excluded.upc, public.pop_set_checklist_items.upc),
  character = excluded.character,
  pop_type = excluded.pop_type,
  pop_style = excluded.pop_style,
  is_required_for_completion = excluded.is_required_for_completion,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  notes = excluded.notes,
  updated_at = now();

-- Verification after apply:
select
  ps.canonical_name,
  ps.status,
  ps.confidence,
  count(psci.id) as checklist_rows,
  count(psci.pop_catalog_id) as matched_catalog_rows
from public.pop_sets ps
left join public.pop_set_checklist_items psci on psci.set_id = ps.id
where ps.franchise = 'DC'
  and ps.canonical_name = 'DC Jim Lee Collection'
group by ps.canonical_name, ps.status, ps.confidence;

select
  set_name,
  count(*) as catalog_rows,
  min(set_total) as min_set_total,
  max(set_total) as max_set_total
from public.pop_catalog
where franchise = 'DC'
  and set_name = 'DC Jim Lee Collection'
group by set_name;

select
  upc,
  pop_name,
  number,
  variant,
  pop_style,
  set_total,
  vault_status
from public.pop_catalog
where upc in ('889698340724', '889698397742')
order by upc;
