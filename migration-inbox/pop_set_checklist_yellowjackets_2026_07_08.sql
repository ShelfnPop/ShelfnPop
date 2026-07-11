-- Audit note: Yellowjackets set completion cleanup, 2026-07-08.
--
-- Sources:
--   FigureRealm Yellowjackets Pop! Vinyl checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6312&ssid=1
--   Official Funko Yellowjackets collection page:
--     https://funko.com/fandoms/movies-tv/horror/yellowjackets/
--
-- Live changes:
--   * Promote Yellowjackets to reviewed with 8 required rows.
--   * Link all 8 checklist rows to owned catalog rows by UPC.
--   * Backfill catalog franchise, full character names, set_total, and 2023 release-date placeholder.
--   * No ownership quantities, paid values, current values, or images are changed.

with upsert_set as (
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
    'Yellowjackets',
    'Yellowjackets',
    'reviewed',
    'FigureRealm checklist + official Funko Yellowjackets collection page',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6312&ssid=1',
    0.90,
    now(),
    'Reviewed Yellowjackets denominator is 8: Shauna Sadecki #1449, Jackie Taylor #1450, Misty Quigley #1451, Taissa Turner #1452, Natalie Scatorccio #1453, Lottie Matthews #1454, Van Palmer #1455, and Ben Scott #1456.'
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
), clear_prior_checklist as (
  delete from public.pop_set_checklist_items
  where set_id in (select id from upsert_set)
  returning id
), checklist(upc_value, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, source_value, confidence_value, notes_value) as (
  values
    ('889698707282', 'Shauna Sadecki', 'Shauna Sadecki', '1449', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6312&ssid=1', 0.92::numeric, 'FigureRealm #1449 checklist row; official Funko page confirms full character name.'),
    ('889698707244', 'Jackie Taylor', 'Jackie Taylor', '1450', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6312&ssid=1', 0.92::numeric, 'FigureRealm #1450 checklist row; official Funko page confirms full character name.'),
    ('889698707268', 'Misty Quigley', 'Misty Quigley', '1451', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6312&ssid=1', 0.92::numeric, 'FigureRealm #1451 checklist row; official Funko page confirms full character name.'),
    ('889698707299', 'Taissa Turner', 'Taissa Turner', '1452', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6312&ssid=1', 0.92::numeric, 'FigureRealm #1452 checklist row; official Funko page confirms full character name.'),
    ('889698707275', 'Natalie Scatorccio', 'Natalie Scatorccio', '1453', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6312&ssid=1', 0.92::numeric, 'FigureRealm #1453 checklist row; official Funko page confirms full character name.'),
    ('889698707251', 'Lottie Matthews', 'Lottie Matthews', '1454', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6312&ssid=1', 0.92::numeric, 'FigureRealm #1454 checklist row; official Funko page confirms full character name.'),
    ('889698707305', 'Van Palmer', 'Van Palmer', '1455', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6312&ssid=1', 0.92::numeric, 'FigureRealm #1455 checklist row; official Funko page confirms full character name.'),
    ('889698707237', 'Ben Scott', 'Ben Scott', '1456', 'Common', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6312&ssid=1', 0.92::numeric, 'FigureRealm #1456 checklist row; official Funko page confirms full character name.')
), matched as (
  select
    upsert_set.id as set_id,
    pc.id as pop_catalog_id,
    pc.upc,
    checklist.*
  from checklist
  cross join upsert_set
  left join public.pop_catalog pc on pc.upc = checklist.upc_value
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
  exclusivity_value,
  pop_type_value,
  pop_style_value,
  true,
  source_value,
  confidence_value,
  notes_value
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
  franchise = 'Yellowjackets',
  set_name = 'Yellowjackets',
  number = v.number_value,
  variant = null,
  exclusivity = null,
  pop_type = 'Pop! Television',
  pop_style = 'Standard',
  set_total = 8,
  release_date = coalesce(pc.release_date, '2023-01-01'::date),
  needs_review = false,
  parse_confidence = greatest(coalesce(pc.parse_confidence, 0), 0.92),
  api_last_updated = now()
from (
  values
    ('889698707282', 'Shauna Sadecki', 'Shauna Sadecki', '1449'),
    ('889698707244', 'Jackie Taylor', 'Jackie Taylor', '1450'),
    ('889698707268', 'Misty Quigley', 'Misty Quigley', '1451'),
    ('889698707299', 'Taissa Turner', 'Taissa Turner', '1452'),
    ('889698707275', 'Natalie Scatorccio', 'Natalie Scatorccio', '1453'),
    ('889698707251', 'Lottie Matthews', 'Lottie Matthews', '1454'),
    ('889698707305', 'Van Palmer', 'Van Palmer', '1455'),
    ('889698707237', 'Ben Scott', 'Ben Scott', '1456')
) as v(upc_value, pop_name, character_name, number_value)
where pc.upc = v.upc_value;
