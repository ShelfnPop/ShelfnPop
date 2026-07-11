-- Audit note: small set completion cleanup batch, 2026-07-09.
--
-- Sources:
--   Official Funko Fievel Mousekewitz #2000:
--     https://funko.com/pop-fievel-mousekewitz-fievel-goes-west/90332.html
--   Official Funko Annabelle #790:
--     https://funko.com/pop-annabelle/41967.html
--   FigureRealm Andor checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5038&ssid=1
--   Rogue One Captain Cassian #151 cross-check:
--     https://www.amazon.com/Funko-10451-Captain-Cassian-Bobble/dp/B01M71ATPO
--   FigureRealm Army of Darkness checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6369
--   Official Funko Evil Ash with Swords #1881:
--     https://funko.com/pop-evil-ash-with-swords/83842.html
--
-- Live changes:
--   * Promote An American Tail: Fievel Goes West to reviewed with 1 required row.
--   * Promote Annabelle to reviewed with 1 required row.
--   * Correct Captain Cassian #151 from Andor to Star Wars: Rogue One and set_total 37.
--   * Link Evil Ash #1671 and Evil Ash #1881 into the existing reviewed Army of Darkness checklist.
--   * No ownership quantities, paid values, current values, or images are changed.

with upsert_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'An American Tail: Fievel Goes West',
    'An American Tail',
    'reviewed',
    'Official Funko Fievel Mousekewitz Fievel Goes West product page',
    'https://funko.com/pop-fievel-mousekewitz-fievel-goes-west/90332.html',
    0.95,
    now(),
    'Reviewed movie-specific denominator is 1: Fievel Mousekewitz (Fievel Goes West) #2000. The broader An American Tail line has additional rows outside this movie-specific set.'
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
), clear_prior as (
  delete from public.pop_set_checklist_items where set_id in (select id from upsert_set) returning id
)
insert into public.pop_set_checklist_items (
  set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity, pop_type, pop_style,
  is_required_for_completion, source_url, confidence, notes
)
select
  upsert_set.id,
  pc.id,
  '889698903325',
  'Fievel Mousekewitz',
  'Fievel Mousekewitz',
  '2000',
  'Fievel Goes West',
  null,
  'Pop! Movies',
  'Standard',
  true,
  'https://funko.com/pop-fievel-mousekewitz-fievel-goes-west/90332.html',
  0.95,
  'Official Funko item 90332, box #2000.'
from upsert_set
left join public.pop_catalog pc on pc.upc = '889698903325'
on conflict (set_id, coalesce(number, ''), lower(coalesce(pop_name, '')), lower(coalesce(variant, '')), lower(coalesce(exclusivity, ''))) do update set
  pop_catalog_id = coalesce(excluded.pop_catalog_id, public.pop_set_checklist_items.pop_catalog_id),
  upc = excluded.upc,
  character = excluded.character,
  pop_type = excluded.pop_type,
  pop_style = excluded.pop_style,
  is_required_for_completion = excluded.is_required_for_completion,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  notes = excluded.notes,
  updated_at = now();

update public.pop_catalog
set
  franchise = 'An American Tail',
  set_name = 'An American Tail: Fievel Goes West',
  pop_name = 'Fievel Mousekewitz',
  character = 'Fievel Mousekewitz',
  number = '2000',
  variant = 'Fievel Goes West',
  exclusivity = null,
  pop_type = 'Pop! Movies',
  pop_style = 'Standard',
  set_total = 1,
  needs_review = false,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.95),
  api_last_updated = now()
where upc = '889698903325';

with upsert_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'Annabelle',
    'Annabelle',
    'reviewed',
    'Official Funko Annabelle #790 product page',
    'https://funko.com/pop-annabelle/41967.html',
    0.95,
    now(),
    'Reviewed Annabelle license-scoped denominator is 1: Pop! Annabelle #790. The broader Conjuring checklist remains outside this focused Annabelle set.'
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
), clear_prior as (
  delete from public.pop_set_checklist_items where set_id in (select id from upsert_set) returning id
)
insert into public.pop_set_checklist_items (
  set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity, pop_type, pop_style,
  is_required_for_completion, source_url, confidence, notes
)
select
  upsert_set.id,
  pc.id,
  '889698419673',
  'Annabelle',
  'Annabelle',
  '790',
  'In Chair',
  null,
  'Pop! Movies',
  'Standard',
  true,
  'https://funko.com/pop-annabelle/41967.html',
  0.95,
  'Official Funko item 41967, box #790.'
from upsert_set
left join public.pop_catalog pc on pc.upc = '889698419673'
on conflict (set_id, coalesce(number, ''), lower(coalesce(pop_name, '')), lower(coalesce(variant, '')), lower(coalesce(exclusivity, ''))) do update set
  pop_catalog_id = coalesce(excluded.pop_catalog_id, public.pop_set_checklist_items.pop_catalog_id),
  upc = excluded.upc,
  character = excluded.character,
  pop_type = excluded.pop_type,
  pop_style = excluded.pop_style,
  is_required_for_completion = excluded.is_required_for_completion,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  notes = excluded.notes,
  updated_at = now();

update public.pop_catalog
set
  franchise = 'Annabelle',
  set_name = 'Annabelle',
  pop_name = 'Annabelle',
  character = 'Annabelle',
  number = '790',
  variant = 'In Chair',
  exclusivity = null,
  pop_type = 'Pop! Movies',
  pop_style = 'Standard',
  set_total = 1,
  release_date = coalesce(release_date, '2019-01-01'::date),
  needs_review = false,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.95),
  api_last_updated = now()
where upc = '889698419673';

update public.pop_catalog
set
  franchise = 'Star Wars',
  set_name = 'Star Wars: Rogue One',
  pop_name = 'Captain Cassian Andor',
  character = 'Captain Cassian Andor',
  number = '151',
  variant = null,
  exclusivity = 'Target',
  pop_type = 'Pop! Star Wars',
  pop_style = 'Standard',
  set_total = 37,
  release_date = coalesce(release_date, '2016-01-01'::date),
  needs_review = false,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.92),
  api_last_updated = now()
where upc = '889698104517';

update public.pop_catalog pc
set
  franchise = 'Army of Darkness',
  set_name = 'Army of Darkness',
  pop_name = v.pop_name,
  character = 'Evil Ash',
  number = v.number_value,
  variant = v.variant_value,
  exclusivity = v.exclusivity_value,
  pop_type = 'Pop! Movies',
  pop_style = 'Standard',
  set_total = 8,
  release_date = coalesce(pc.release_date, v.release_date_value::date),
  needs_review = false,
  parse_confidence = greatest(coalesce(pc.parse_confidence, 0), 0.92),
  api_last_updated = now()
from (
  values
    ('889698828505', 'Evil Ash (Sword)', '1671', 'Sword', 'Hot Topic', '2024-01-01'),
    ('889698838429', 'Evil Ash (Swords)', '1881', 'Swords', null, '2025-01-01')
) as v(upc_value, pop_name, number_value, variant_value, exclusivity_value, release_date_value)
where pc.upc = v.upc_value;

update public.pop_set_checklist_items ci
set
  pop_catalog_id = pc.id,
  upc = pc.upc,
  exclusivity = pc.exclusivity,
  updated_at = now()
from public.pop_catalog pc
join public.pop_sets ps on ps.canonical_name = 'Army of Darkness' and ps.franchise = 'Army of Darkness'
where ci.set_id = ps.id
  and pc.set_name = 'Army of Darkness'
  and pc.franchise = 'Army of Darkness'
  and ci.number = pc.number
  and ci.character = pc.character
  and ci.number in ('1671', '1881');
