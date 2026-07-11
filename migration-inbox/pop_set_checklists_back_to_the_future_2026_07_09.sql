-- Audit note: Back to the Future cleanup, 2026-07-09.
--
-- Sources:
--   FigureRealm Back to the Future checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12
--   Official Funko Hoverboard Chase Deluxe Moment:
--     https://funko.com/pop-deluxe-moment-back-to-the-future-ii---hoverboard-chase/76563.html
--   PriceCharting Doc 1885 #219 Digital:
--     https://www.pricecharting.com/game/funko-pop-digital/doc-1885-219
--
-- Live changes:
--   * Keep existing Back to the Future Pop! Vinyl set reviewed at 25 required rows.
--   * Normalize owned Pop! Movies rows into the existing reviewed Back to the Future scope.
--   * Add focused reviewed scopes for Back to the Future Digital and Back to the Future Part II: Deluxe Moment.
--   * No ownership quantities, paid values, current values, or images are changed.

with update_values(upc_value, pop_name_value, character_value, franchise_value, set_name_value, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, set_total_value, release_date_value, confidence_value, limited_edition_value, limited_count_value, edition_notes_value) as (
  values
    ('830395034003', 'Marty McFly', 'Marty McFly', 'Back to the Future', 'Back to the Future', '49', null, null, 'Pop! Movies', 'Standard', 25, '2013-01-01', 0.92::numeric, false, null::int, null),
    ('830395033990', 'Dr. Emmett Brown', 'Dr. Emmett Brown', 'Back to the Future', 'Back to the Future', '50', null, null, 'Pop! Movies', 'Standard', 25, '2013-01-01', 0.92::numeric, false, null::int, null),
    ('889698469128', 'Marty with Glasses', 'Marty McFly', 'Back to the Future', 'Back to the Future', '958', 'with Glasses', null, 'Pop! Movies', 'Standard', 25, '2020-01-01', 0.92::numeric, false, null::int, null),
    ('889698485159', 'Biff Tannen', 'Biff Tannen', 'Back to the Future', 'Back to the Future', '963', null, null, 'Pop! Movies', 'Standard', 25, '2020-01-01', 0.92::numeric, false, null::int, null),
    ('889698496858', 'Doc & Einstein', 'Doc & Einstein', 'Back to the Future', 'Back to the Future', '972', null, 'Walmart', 'Pop! Movies', 'Standard', 25, '2020-01-01', 0.92::numeric, false, null::int, null),
    ('889698635837', 'Doc with Helmet (Glows In The Dark)', 'Doc Brown', 'Back to the Future', 'Back to the Future', '959', 'Helmet Glow in the Dark', null, 'Pop! Movies', 'Standard', 25, '2022-01-01', 0.92::numeric, false, null::int, null),
    ('889698487085', 'Marty with Hoverboard', 'Marty McFly', 'Back to the Future', 'Back to the Future', '964', 'with Hoverboard', null, 'Pop! Movies', 'Standard', 25, '2020-01-01', 0.92::numeric, false, null::int, null),
    ('889698469159', 'Doc 2015', 'Doc Brown', 'Back to the Future', 'Back to the Future', '960', '2015', null, 'Pop! Movies', 'Standard', 25, '2020-01-01', 0.92::numeric, false, null::int, null),
    ('889698487054', 'Marty in Puffy Vest', 'Marty McFly', 'Back to the Future', 'Back to the Future', '961', 'Puffy Vest', null, 'Pop! Movies', 'Standard', 25, '2020-01-01', 0.92::numeric, false, null::int, null),
    ('889698430906', 'Marty McFly (Cowboy)', 'Marty McFly', 'Back to the Future', 'Back to the Future', '816', 'Cowboy', 'Hot Topic', 'Pop! Movies', 'Standard', 25, '2019-01-01', 0.92::numeric, false, null::int, null),
    ('849803059071', 'Marty McFly (Hoverboard)', 'Marty McFly', 'Back to the Future', 'Back to the Future', '245', 'Hoverboard', null, 'Pop! Movies', 'Standard', 25, '2016-01-01', 0.92::numeric, false, null::int, null),
    ('889698815185', 'Doc 1885', 'Doc Brown', 'Back to the Future', 'Back to the Future Digital', '219', '1885', 'Digital', 'Pop! Digital', 'Standard', 1, '2023-10-17', 0.90::numeric, true, 1900, 'Legendary Digital Pop! physical release, limited to 1,900 pieces.'),
    ('889698765633', 'Hoverboard Chase', 'Marty McFly, Griff Tannen, Data, Whitey & Spike', 'Back to the Future', 'Back to the Future Part II: Deluxe Moment', null, null, null, 'Pop! Deluxe Moment', 'Moment', 1, '2023-01-01', 0.92::numeric, false, null::int, null)
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
  limited_edition = v.limited_edition_value,
  limited_count = v.limited_count_value,
  edition_notes = coalesce(v.edition_notes_value, pc.edition_notes),
  needs_review = false,
  parse_confidence = greatest(coalesce(pc.parse_confidence, 0), v.confidence_value),
  api_last_updated = now()
from update_values v
where pc.upc = v.upc_value;

-- Link cleaned owned Pop! Movies rows to the existing reviewed 25-row Back to the Future checklist.
with target_set as (
  select id from public.pop_sets
  where canonical_name = 'Back to the Future' and franchise = 'Back to the Future'
), link_values(upc_value, number_value, variant_value, exclusivity_value) as (
  values
    ('830395034003', '49', null, null),
    ('830395033990', '50', null, null),
    ('889698469128', '958', 'with Glasses', null),
    ('889698485159', '963', null, null),
    ('889698496858', '972', null, 'Walmart'),
    ('889698635837', '959', 'Helmet Glow in the Dark', null),
    ('889698487085', '964', 'with Hoverboard', null),
    ('889698469159', '960', '2015', null),
    ('889698487054', '961', 'Puffy Vest', null),
    ('889698430906', '816', 'Cowboy', 'Hot Topic'),
    ('849803059071', '245', 'Hoverboard', null)
)
update public.pop_set_checklist_items ci
set
  pop_catalog_id = pc.id,
  upc = pc.upc,
  pop_name = pc.pop_name,
  character = pc.character,
  variant = v.variant_value,
  exclusivity = v.exclusivity_value,
  updated_at = now()
from link_values v
join public.pop_catalog pc on pc.upc = v.upc_value
join target_set ts on true
where ci.set_id = ts.id
  and ci.number = v.number_value
  and lower(coalesce(ci.variant, '')) = lower(coalesce(v.variant_value, ''));

-- Focused reviewed scope for the owned Digital Pop! row.
with upsert_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Back to the Future Digital', 'Back to the Future', 'reviewed', 'PriceCharting Doc 1885 #219 Digital cross-check', 'https://www.pricecharting.com/game/funko-pop-digital/doc-1885-219', 0.90, now(), 'Focused digital physical-release denominator is 1 for the owned Legendary Doc 1885 #219 Pop! Digital row.')
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
select upsert_set.id, pc.id, pc.upc, 'Doc 1885', 'Doc Brown', '219', '1885', 'Digital', 'Pop! Digital', 'Standard',
  true, 'https://www.pricecharting.com/game/funko-pop-digital/doc-1885-219', 0.90,
  'PriceCharting confirms UPC 889698815185, box #219, and limited 1,900-piece Digital physical release.'
from upsert_set
join public.pop_catalog pc on pc.upc = '889698815185';

-- Focused reviewed scope for the owned Deluxe Moment row.
with upsert_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values ('Back to the Future Part II: Deluxe Moment', 'Back to the Future', 'reviewed', 'Official Funko Hoverboard Chase Deluxe Moment product page', 'https://funko.com/pop-deluxe-moment-back-to-the-future-ii---hoverboard-chase/76563.html', 0.95, now(), 'Focused Deluxe Pop! Moment denominator is 1: Hoverboard Chase, item 76563.')
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
select upsert_set.id, pc.id, pc.upc, 'Hoverboard Chase', 'Marty McFly, Griff Tannen, Data, Whitey & Spike', null, null, null, 'Pop! Deluxe Moment', 'Moment',
  true, 'https://funko.com/pop-deluxe-moment-back-to-the-future-ii---hoverboard-chase/76563.html', 0.95,
  'Official Funko item 76563; Deluxe Pop! Moment from Back to the Future Part II.'
from upsert_set
join public.pop_catalog pc on pc.upc = '889698765633';
