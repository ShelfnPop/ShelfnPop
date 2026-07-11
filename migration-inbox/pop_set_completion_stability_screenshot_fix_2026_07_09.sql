-- Set completion stability fixes from Closest Sets review, applied 2026-07-09.
--
-- Scope:
-- - Move Batman 1989 #275 and Batman Forever #289 out of Batman v Superman and into Batman: 80th Anniversary.
-- - Link those two catalog rows to the existing Batman: 80th Anniversary checklist rows.
-- - Add the missing Superman (2025) DCs Ultraman #583 Chase catalog row and move the owned Chase entry from Hammer of Boravia to Ultraman.
-- - Do not change ownership quantities, values, images, or vault fields.

update public.pop_catalog
set
  set_name = 'Batman: 80th Anniversary',
  set_total = 33,
  pop_name = 'Batman (1989)',
  character = 'Batman',
  variant = '1989',
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  display_description = 'Batman (1989) belongs to the Batman: 80th Anniversary Pop! Heroes line as #275.'
where franchise = 'DC'
  and upc = '889698372480';

update public.pop_catalog
set
  set_name = 'Batman: 80th Anniversary',
  set_total = 33,
  pop_name = 'Batman Forever',
  character = 'Batman',
  variant = 'Forever',
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  display_description = 'Batman Forever belongs to the Batman: 80th Anniversary Pop! Heroes line as #289.'
where franchise = 'DC'
  and upc = '889698372541';

with batman_1989 as (
  select id, upc
  from public.pop_catalog
  where franchise = 'DC'
    and set_name = 'Batman: 80th Anniversary'
    and upc = '889698372480'
  limit 1
), batman_80_set as (
  select id
  from public.pop_sets
  where canonical_name = 'Batman: 80th Anniversary'
    and franchise = 'DC'
  limit 1
)
update public.pop_set_checklist_items pci
set
  pop_catalog_id = b.id,
  upc = b.upc,
  updated_at = now()
from batman_1989 b
cross join batman_80_set s
where pci.set_id = s.id
  and pci.number = '275'
  and pci.pop_name = 'Batman (1989)';

with batman_forever as (
  select id, upc
  from public.pop_catalog
  where franchise = 'DC'
    and set_name = 'Batman: 80th Anniversary'
    and upc = '889698372541'
  limit 1
), batman_80_set as (
  select id
  from public.pop_sets
  where canonical_name = 'Batman: 80th Anniversary'
    and franchise = 'DC'
  limit 1
)
update public.pop_set_checklist_items pci
set
  pop_catalog_id = b.id,
  upc = b.upc,
  updated_at = now()
from batman_forever b
cross join batman_80_set s
where pci.set_id = s.id
  and pci.number = '289'
  and pci.pop_name = 'Batman Forever';

insert into public.pop_catalog (
  pop_name,
  character,
  franchise,
  number,
  variant,
  exclusivity,
  pop_type,
  pop_style,
  set_name,
  set_total,
  raw_title,
  clean_title,
  parse_confidence,
  needs_review,
  display_description
)
select
  'DCs Ultraman',
  'DCs Ultraman',
  'DC',
  '583',
  'Chase',
  null,
  'Pop! Heroes',
  'Standard',
  'Superman (2025)',
  14,
  'DCs Ultraman [Chase] #583',
  'DCs Ultraman #583',
  0.90,
  false,
  'DCs Ultraman belongs to the Superman (2025) Pop! Heroes line as #583. This catalog entry tracks the Chase variant.'
where not exists (
  select 1
  from public.pop_catalog
  where franchise = 'DC'
    and set_name = 'Superman (2025)'
    and pop_name = 'DCs Ultraman'
    and number = '583'
    and variant = 'Chase'
);

with ultraman as (
  select id
  from public.pop_catalog
  where franchise = 'DC'
    and set_name = 'Superman (2025)'
    and pop_name = 'DCs Ultraman'
    and number = '583'
    and variant = 'Chase'
  limit 1
)
update public.user_collection_items uci
set pop_catalog_id = ultraman.id
from ultraman
where uci.id = 'b336532d-7830-4e10-884c-f6a2b7f26db2';

with ultraman as (
  select id, upc
  from public.pop_catalog
  where franchise = 'DC'
    and set_name = 'Superman (2025)'
    and pop_name = 'DCs Ultraman'
    and number = '583'
    and variant = 'Chase'
  limit 1
), superman_2025_set as (
  select id
  from public.pop_sets
  where canonical_name = 'Superman (2025)'
    and franchise = 'DC'
  limit 1
)
update public.pop_set_checklist_items pci
set
  pop_catalog_id = ultraman.id,
  upc = ultraman.upc,
  updated_at = now()
from ultraman
cross join superman_2025_set s
where pci.set_id = s.id
  and pci.pop_name = 'DCs Ultraman'
  and pci.number = '583'
  and pci.variant = 'Chase';
