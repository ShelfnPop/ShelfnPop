-- Audit note: finish small draft/one-row set batch, 2026-07-09.
--
-- Sources:
--   Official Funko Bitty Pop! Bitty Box Lilo's Home:
--     https://funko.com/bitty-pop-bitty-box-lilos-home/85536.html
--   FigureRealm Pinocchio Pop! Vinyl checklist, filtered to Netflix's Pinocchio #1296-1299 wave:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3993&ssid=2
--   Official Funko Geppetto #1297:
--     https://funko.com/pop-geppetto/67386.html
--   FigureRealm 1883 checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=11
--   Official Funko Margaret Dutton #1445:
--     https://funko.com/pop-margaret-dutton/72196.html
--   21 Jump Street cross-check:
--     https://www.walmart.com/ip/FUNKO-POP-MOVIES-21-JUMP-STREET-MORTON-SCHMIDT/44938832
--
-- Live changes:
--   * Promote Lilo & Stitch Bitty Pop! to reviewed with 1 required row.
--   * Promote Netflix's Pinocchio to reviewed with 4 required rows.
--   * Promote 1883 to reviewed with 6 required rows.
--   * Promote 21 Jump Street to reviewed with 2 required rows.
--   * Normalize owned catalog totals and the 21 Jump Street set-name split.
--   * No ownership quantities, paid values, current values, or images are changed.

with upsert_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'Lilo & Stitch Bitty Pop!',
    'Disney',
    'reviewed',
    'Official Funko Bitty Pop! Bitty Box Lilo''s Home',
    'https://funko.com/bitty-pop-bitty-box-lilos-home/85536.html',
    0.95,
    now(),
    'Reviewed denominator is 1: Bitty Pop! Bitty Box Lilo''s Home, item 85536, including Bitty Pop! Lilo with Scrump and Bitty Pop! Superhero Stitch inside the Bitty Box product.'
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
  '889698855365',
  'Lilo''s Home',
  'Lilo''s Home',
  null,
  'Bitty Box',
  null,
  'Bitty Pop!',
  'Bitty Box',
  true,
  'https://funko.com/bitty-pop-bitty-box-lilos-home/85536.html',
  0.95,
  'Official Funko item 85536; includes Bitty Pop! Lilo with Scrump and Bitty Pop! Superhero Stitch.'
from upsert_set
left join public.pop_catalog pc on pc.upc = '889698855365'
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
  franchise = 'Disney',
  set_name = 'Lilo & Stitch Bitty Pop!',
  pop_name = 'Lilo''s Home',
  character = 'Lilo''s Home',
  variant = 'Bitty Box',
  exclusivity = null,
  pop_type = 'Bitty Pop!',
  pop_style = 'Bitty Box',
  set_total = 1,
  needs_review = false,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.95),
  api_last_updated = now()
where upc = '889698855365';

with upsert_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'Netflix''s Pinocchio',
    'Netflix''s Pinocchio',
    'reviewed',
    'FigureRealm Pinocchio checklist filtered to Netflix wave + official Funko Geppetto',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3993&ssid=2',
    0.88,
    now(),
    'Reviewed denominator is 4 for Guillermo del Toro/Netflix''s Pinocchio: Black Rabbit #1296, Geppetto #1297, Wood Sprite #1298, and Pinocchio and Cricket #1299.'
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
), checklist(upc_value, pop_name, character_name, number_value, variant_value, pop_type_value, pop_style_value, source_value, confidence_value, notes_value) as (
  values
    (null, 'Black Rabbit', 'Black Rabbit', '1296', 'Common', 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3993&ssid=2', 0.88::numeric, 'FigureRealm 2022 Pinocchio Pop! Vinyl row; part of the Netflix wave.'),
    ('889698673860', 'Geppetto', 'Geppetto', '1297', 'Common', 'Pop! Movies', 'Standard', 'https://funko.com/pop-geppetto/67386.html', 0.92::numeric, 'Official Funko item 67386; Netflix''s Pinocchio Geppetto #1297.'),
    (null, 'Wood Sprite', 'Wood Sprite', '1298', 'Common', 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3993&ssid=2', 0.88::numeric, 'FigureRealm 2022 Pinocchio Pop! Vinyl row; part of the Netflix wave.'),
    (null, 'Pinocchio and Cricket', 'Pinocchio and Cricket', '1299', 'Common', 'Pop! Movies', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3993&ssid=2', 0.88::numeric, 'FigureRealm 2022 Pinocchio Pop! Vinyl row; part of the Netflix wave.')
), matched as (
  select upsert_set.id as set_id, pc.id as pop_catalog_id, pc.upc, checklist.*
  from checklist
  cross join upsert_set
  left join public.pop_catalog pc on pc.upc = checklist.upc_value
)
insert into public.pop_set_checklist_items (
  set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity, pop_type, pop_style,
  is_required_for_completion, source_url, confidence, notes
)
select
  set_id, pop_catalog_id, upc_value, pop_name, character_name, number_value, variant_value, null,
  pop_type_value, pop_style_value, true, source_value, confidence_value, notes_value
from matched
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
  franchise = 'Netflix''s Pinocchio',
  set_name = 'Netflix''s Pinocchio',
  pop_name = 'Geppetto',
  character = 'Geppetto',
  number = '1297',
  variant = null,
  exclusivity = null,
  pop_type = 'Pop! Movies',
  pop_style = 'Standard',
  set_total = 4,
  release_date = coalesce(release_date, '2022-01-01'::date),
  needs_review = false,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.92),
  api_last_updated = now()
where upc = '889698673860';

with upsert_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    '1883',
    'Yellowstone',
    'reviewed',
    'FigureRealm 1883 checklist + official Funko Margaret Dutton',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=11',
    0.90,
    now(),
    'Reviewed denominator is 6: Elsa Dutton #1443, James Dutton #1444, Margaret Dutton #1445, Sam #1446, Shea Brennan #1447, and Thomas #1448.'
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
), checklist(upc_value, pop_name, character_name, number_value, source_value, confidence_value, notes_value) as (
  values
    (null, 'Elsa Dutton', 'Elsa Dutton', '1443', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=11', 0.90::numeric, 'FigureRealm 1883 checklist row.'),
    (null, 'James Dutton', 'James Dutton', '1444', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=11', 0.90::numeric, 'FigureRealm 1883 checklist row.'),
    ('889698721967', 'Margaret Dutton', 'Margaret Dutton', '1445', 'https://funko.com/pop-margaret-dutton/72196.html', 0.93::numeric, 'Official Funko item 72196; FigureRealm checklist row.'),
    (null, 'Sam', 'Sam', '1446', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=11', 0.90::numeric, 'FigureRealm 1883 checklist row.'),
    (null, 'Shea Brennan', 'Shea Brennan', '1447', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=11', 0.90::numeric, 'FigureRealm 1883 checklist row.'),
    (null, 'Thomas', 'Thomas', '1448', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=11', 0.90::numeric, 'FigureRealm 1883 checklist row.')
), matched as (
  select upsert_set.id as set_id, pc.id as pop_catalog_id, pc.upc, checklist.*
  from checklist
  cross join upsert_set
  left join public.pop_catalog pc on pc.upc = checklist.upc_value
)
insert into public.pop_set_checklist_items (
  set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity, pop_type, pop_style,
  is_required_for_completion, source_url, confidence, notes
)
select
  set_id, pop_catalog_id, upc_value, pop_name, character_name, number_value, 'Common', null,
  'Pop! Television', 'Standard', true, source_value, confidence_value, notes_value
from matched
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
  franchise = 'Yellowstone',
  set_name = '1883',
  pop_name = 'Margaret Dutton',
  character = 'Margaret Dutton',
  number = '1445',
  variant = null,
  exclusivity = null,
  pop_type = 'Pop! Television',
  pop_style = 'Standard',
  set_total = 6,
  release_date = coalesce(release_date, '2024-01-01'::date),
  needs_review = false,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.93),
  api_last_updated = now()
where upc = '889698721967';

with upsert_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    '21 Jump Street',
    '21 Jump Street',
    'reviewed',
    '21 Jump Street retail and market cross-check',
    'https://www.walmart.com/ip/FUNKO-POP-MOVIES-21-JUMP-STREET-MORTON-SCHMIDT/44938832',
    0.84,
    now(),
    'Reviewed denominator is 2: Morton Schmidt #173 and Greg Jenko #174.'
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
), checklist(upc_value, pop_name, character_name, number_value, source_value, confidence_value, notes_value) as (
  values
    ('849803053079', 'Morton Schmidt', 'Morton Schmidt', '173', 'https://www.walmart.com/ip/FUNKO-POP-MOVIES-21-JUMP-STREET-MORTON-SCHMIDT/44938832', 0.84::numeric, 'Walmart product page for Morton Schmidt says to get the Greg Jenko figure too; market listings cross-check #173/#174 pair.'),
    ('849803053086', 'Greg Jenko', 'Greg Jenko', '174', 'https://www.pricecharting.com/game/funko-pop-movies/morton-schmidt-173', 0.82::numeric, 'PriceCharting sold-set references cross-check the Morton Schmidt #173 and Greg Jenko #174 pair.')
), matched as (
  select upsert_set.id as set_id, pc.id as pop_catalog_id, pc.upc, checklist.*
  from checklist
  cross join upsert_set
  left join public.pop_catalog pc on pc.upc = checklist.upc_value
)
insert into public.pop_set_checklist_items (
  set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity, pop_type, pop_style,
  is_required_for_completion, source_url, confidence, notes
)
select
  set_id, pop_catalog_id, upc_value, pop_name, character_name, number_value, 'Common', null,
  'Pop! Movies', 'Standard', true, source_value, confidence_value, notes_value
from matched
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

update public.pop_catalog pc
set
  pop_name = v.pop_name,
  character = v.character_name,
  franchise = '21 Jump Street',
  set_name = '21 Jump Street',
  number = v.number_value,
  variant = null,
  exclusivity = null,
  pop_type = 'Pop! Movies',
  pop_style = 'Standard',
  set_total = 2,
  release_date = coalesce(pc.release_date, '2015-01-01'::date),
  needs_review = false,
  parse_confidence = greatest(coalesce(pc.parse_confidence, 0), 0.90),
  api_last_updated = now()
from (
  values
    ('849803053079', 'Morton Schmidt', 'Morton Schmidt', '173'),
    ('849803053086', 'Greg Jenko', 'Greg Jenko', '174')
) as v(upc_value, pop_name, character_name, number_value)
where pc.upc = v.upc_value;
