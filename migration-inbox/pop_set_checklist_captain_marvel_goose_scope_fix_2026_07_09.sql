-- Captain Marvel Goose scope fix, applied 2026-07-09.
--
-- Scope:
-- - Include Goose Flerken #445 Chase in the reviewed Captain Marvel completion set.
-- - Update the Captain Marvel reviewed denominator from 2 to 3.
-- - Keep ownership, values, images, and vault fields unchanged.

with captain_marvel_set as (
  select id
  from public.pop_sets
  where canonical_name = 'Captain Marvel'
    and franchise = 'Marvel'
  limit 1
), goose_catalog as (
  select id, upc, pop_name, character, number, variant, exclusivity, pop_type, pop_style
  from public.pop_catalog
  where franchise = 'Marvel'
    and set_name = 'Captain Marvel'
    and upc = '889698376877'
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
  cms.id,
  gc.id,
  gc.upc,
  gc.pop_name,
  gc.character,
  gc.number,
  gc.variant,
  gc.exclusivity,
  gc.pop_type,
  gc.pop_style,
  true,
  'https://funko.com',
  0.80,
  'User-confirmed Captain Marvel set item; Goose Flerken Chase belongs in this owned completion denominator.'
from captain_marvel_set cms
cross join goose_catalog gc
where not exists (
  select 1
  from public.pop_set_checklist_items existing
  where existing.set_id = cms.id
    and existing.upc = gc.upc
);

update public.pop_sets
set
  notes = 'Reviewed owned Captain Marvel completion denominator includes Captain Marvel (Fear Itself), Dark Captain Marvel, and Goose Flerken Chase.',
  updated_at = now()
where canonical_name = 'Captain Marvel'
  and franchise = 'Marvel';

update public.pop_catalog
set
  set_total = 3,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false
where franchise = 'Marvel'
  and set_name = 'Captain Marvel'
  and upc in ('889698717519', '889698489027', '889698376877');
