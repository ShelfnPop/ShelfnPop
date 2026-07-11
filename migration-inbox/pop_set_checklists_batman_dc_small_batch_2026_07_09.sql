-- Audit note: Batman/DC small set cleanup batch, 2026-07-09.
--
-- Sources:
--   FigureRealm Batman & Robin Pop! checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=9
--   FigureRealm Batman Returns Pop! checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=24
--   FigureRealm Batman 80 Years Pop! checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=10
--   FigureRealm Batman Arkham Asylum Pop! checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=15
--   PriceCharting Joker Green Chrome #53 UPC cross-check:
--     https://www.pricecharting.com/game/funko-pop-heroes/the-joker-green-chrome-53
--
-- Live changes:
--   * Promote Batman & Robin to reviewed with 4 required rows.
--   * Promote Batman: Arkham Asylum to reviewed with 12 required rows.
--   * Link owned Batman Returns Penguin #339 into existing reviewed 5-row set.
--   * Link owned Batman First Appearance #270 into existing reviewed 33-row Batman 80th set.
--   * Normalize owned catalog totals/details for the four targeted UPCs.
--   * No ownership quantities, paid values, current values, or images are changed.

with update_values(upc_value, pop_name_value, character_value, franchise_value, set_name_value, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, set_total_value, release_date_value, confidence_value) as (
  values
    ('889698478687', 'Mr. Freeze (Glitter)', 'Mr. Freeze', 'DC', 'Batman & Robin', '342', 'Glitter', 'Summer Convention', 'Pop! Heroes', 'Standard', 4, '2020-01-01', 0.92::numeric),
    ('889698477086', 'Penguin', 'Penguin', 'DC', 'Batman Returns', '339', null, null, 'Pop! Heroes', 'Standard', 5, '2020-01-01', 0.92::numeric),
    ('889698372145', 'Batman (First Appearance)', 'Batman', 'DC', 'Batman: 80th Anniversary', '270', 'First Appearance', null, 'Pop! Heroes', 'Standard', 33, '2019-01-01', 0.92::numeric),
    ('889698423366', 'Joker (Green Chrome)', 'Joker', 'DC', 'Batman: Arkham Asylum', '53', 'Green Chrome', 'Target', 'Pop! Heroes', 'Standard', 12, '2014-01-01', 0.92::numeric)
)
update public.pop_catalog pc
set
  pop_name = v.pop_name_value,
  character = v.character_value,
  franchise = v.franchise_value,
  set_name = v.set_name_value,
  number = v.number_value,
  variant = v.variant_value,
  exclusivity = v.exclusivity_value,
  pop_type = v.pop_type_value,
  pop_style = v.pop_style_value,
  set_total = v.set_total_value,
  release_date = coalesce(pc.release_date, v.release_date_value::date),
  needs_review = false,
  parse_confidence = greatest(coalesce(pc.parse_confidence, 0), v.confidence_value),
  api_last_updated = now()
from update_values v
where pc.upc = v.upc_value;

-- Rebuild reviewed Batman & Robin checklist.
with upsert_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Batman & Robin', 'DC', 'reviewed', 'FigureRealm Batman & Robin Pop! checklist + retail Mr. Freeze Glitter cross-check', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=9', 0.90, now(), 'Reviewed denominator is 4 Batman & Robin Pop! rows.')
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
), checklist(upc_value, pop_name, character_name, number_value, variant_value, exclusivity_value, source_value, confidence_value, notes_value) as (
  values
    (null, 'Mr. Freeze (Art Series)', 'Mr. Freeze', '65', 'Art Series', null, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=9', 0.90::numeric, 'FigureRealm row.'),
    ('889698478687', 'Mr. Freeze (Glitter)', 'Mr. Freeze', '342', 'Glitter', 'Summer Convention', 'https://www.amazon.com/Funko-Heroes-Glitter-Convention-Exclusive/dp/B08DL5ZQ4Y', 0.88::numeric, 'Retail cross-check for Mr. Freeze Glitter #342.'),
    (null, 'Mr. Freeze (Batman and Robin) (Silver Suit)', 'Mr. Freeze', '342', 'Silver Suit', null, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=9', 0.90::numeric, 'FigureRealm row.'),
    (null, 'Poison Ivy (Specialty Series)', 'Poison Ivy', '343', 'Specialty Series', 'Specialty Series', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=9', 0.90::numeric, 'FigureRealm row.')
), matched as (
  select upsert_set.id as set_id, pc.id as pop_catalog_id, checklist.*
  from checklist
  cross join upsert_set
  left join public.pop_catalog pc on pc.upc = checklist.upc_value
)
insert into public.pop_set_checklist_items (
  set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity, pop_type, pop_style,
  is_required_for_completion, source_url, confidence, notes
)
select set_id, pop_catalog_id, upc_value, pop_name, character_name, number_value, variant_value, exclusivity_value,
  'Pop! Heroes', 'Standard', true, source_value, confidence_value, notes_value
from matched;

-- Rebuild reviewed Batman: Arkham Asylum checklist.
with upsert_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Batman: Arkham Asylum', 'DC', 'reviewed', 'FigureRealm Batman Arkham Asylum Pop! checklist + PriceCharting Joker Green Chrome UPC cross-check', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=15', 0.90, now(), 'Reviewed denominator is 12 Batman Arkham Asylum Pop! rows.')
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
), checklist(upc_value, pop_name, character_name, number_value, variant_value, exclusivity_value, source_value, confidence_value, notes_value) as (
  values
    (null, 'Bane ((Glows In The Dark) (Deluxe)', 'Bane', '532', 'Glow in the Dark Deluxe', null, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=15', 0.90::numeric, 'FigureRealm row.'),
    (null, 'Batman', 'Batman', '52', null, null, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=15', 0.90::numeric, 'FigureRealm row.'),
    (null, 'Batman (Detective Mode)', 'Batman', '52', 'Detective Mode', null, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=15', 0.90::numeric, 'FigureRealm row.'),
    (null, 'Harley Quinn (Nurse)', 'Harley Quinn', '54', 'Nurse', null, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=15', 0.90::numeric, 'FigureRealm row.'),
    (null, 'Joker', 'Joker', '53', null, null, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=15', 0.90::numeric, 'FigureRealm row.'),
    (null, 'Joker (Black Chrome)', 'Joker', '53', 'Black Chrome', null, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=15', 0.90::numeric, 'FigureRealm row.'),
    ('889698423366', 'Joker (Green Chrome)', 'Joker', '53', 'Green Chrome', 'Target', 'https://www.pricecharting.com/game/funko-pop-heroes/the-joker-green-chrome-53', 0.92::numeric, 'PriceCharting confirms UPC 889698423366 and Target exclusive Green Chrome #53.'),
    (null, 'Joker (Orange Chrome)', 'Joker', '53', 'Orange Chrome', null, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=15', 0.90::numeric, 'FigureRealm row.'),
    (null, 'Joker (Purple Chrome)', 'Joker', '53', 'Purple Chrome', null, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=15', 0.90::numeric, 'FigureRealm row.'),
    (null, 'Joker (Silver Chrome)', 'Joker', '53', 'Silver Chrome', null, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=15', 0.90::numeric, 'FigureRealm row.'),
    (null, 'Killer Croc', 'Killer Croc', '56', null, null, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=15', 0.90::numeric, 'FigureRealm row.'),
    (null, 'Poison Ivy', 'Poison Ivy', '55', null, null, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=500&ssid=15', 0.90::numeric, 'FigureRealm row.')
), matched as (
  select upsert_set.id as set_id, pc.id as pop_catalog_id, checklist.*
  from checklist
  cross join upsert_set
  left join public.pop_catalog pc on pc.upc = checklist.upc_value
)
insert into public.pop_set_checklist_items (
  set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity, pop_type, pop_style,
  is_required_for_completion, source_url, confidence, notes
)
select set_id, pop_catalog_id, upc_value, pop_name, character_name, number_value, variant_value, exclusivity_value,
  'Pop! Heroes', 'Standard', true, source_value, confidence_value, notes_value
from matched;
