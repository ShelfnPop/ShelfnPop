-- Audit note: small set completion cleanup batch 2, 2026-07-09.
--
-- Sources:
--   FigureRealm Disney Universe Pop! / Aladdin's First Wish #409:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1453&ssid=22
--   FigureRealm Aladdin checklist / Magic Carpet Ride #480:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=148
--   PriceCharting Aladdin's First Wish #409 UPC cross-check:
--     https://www.pricecharting.com/game/funko-pop-disney/aladdin%27s-first-wish-409
--   Bleeding Cool Avengers Mech Strike common lineup:
--     https://bleedingcool.com/collectibles/funko-pop-marvel-avengers-mech-strike/
--   FigureRealm Doctor Strange #832 UPC cross-check:
--     https://www.figurerealm.com/actionfigure?action=actionfigure&figure=doctorstrange832&id=95465
--   FigureRealm Beavis and Butt-Head checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=583
--   Official Funko Butt-Head (Ghost) #1594:
--     https://funko.com/pop-butt-head-ghost/85082.html
--   FigureRealm Ben 10 checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=605
--   Official Funko Heatblast #1772:
--     https://funko.com/pop-heatblast/86295.html
--
-- Live changes:
--   * Promote Aladdin: Movie Moments to reviewed with 2 required rows.
--   * Promote Avengers: Mech Strike common Pop! Marvel lineup to reviewed with 6 required rows.
--   * Promote Beavis and Butt-Head Pop! Television/Vinyl lineup to reviewed with 6 required rows.
--   * Promote Ben 10 Pop! Television/Vinyl lineup to reviewed with 3 required rows.
--   * Normalize the four owned catalog rows by UPC and set their scoped set_total values.
--   * No ownership quantities, paid values, current values, or images are changed.

-- This file records the executable live SQL applied through Supabase MCP.
-- Reapply only if this environment needs to be reconstructed.

with upsert_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values
    ('Aladdin: Movie Moments', 'Disney', 'reviewed', 'FigureRealm Disney Universe/Aladdin checklist + PriceCharting Aladdin''s First Wish', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1453&ssid=22', 0.86, now(), 'Reviewed denominator is 2 for the Aladdin Movie Moments scope: Aladdin''s First Wish #409 and Magic Carpet Ride #480.'),
    ('Avengers: Mech Strike', 'Marvel', 'reviewed', 'Bleeding Cool Avengers Mech Strike common lineup + FigureRealm Doctor Strange row', 'https://bleedingcool.com/collectibles/funko-pop-marvel-avengers-mech-strike/', 0.86, now(), 'Reviewed denominator is 6 common Avengers: Mech Strike Pop! Marvel rows: Captain America #829, Black Panther #830, Captain Marvel #831, Doctor Strange #832, Hulk #833, and Thor #834.'),
    ('Beavis and Butt-Head', 'Beavis and Butt-Head', 'reviewed', 'FigureRealm Beavis and Butt-Head Pop! Vinyl checklist + official Funko Butt-Head Ghost', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=583', 0.90, now(), 'Reviewed denominator is 6 Pop! rows: Beavis #40, Butt-Head #41, Butt-Head Burger World Uniform #1591, Beavis Burger World Uniform #1592, Cornholio #1593, and Butt-Head (Ghost) #1594.'),
    ('Ben 10', 'Ben 10', 'reviewed', 'FigureRealm Ben 10 Pop! Vinyl checklist + official Funko Heatblast', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=605', 0.92, now(), 'Reviewed denominator is 3 Pop! rows: Ben Tennyson #1771, Heatblast #1772, and Swampfire #1202.')
  on conflict (canonical_name, franchise) do update set
    status = excluded.status,
    source_label = excluded.source_label,
    source_url = excluded.source_url,
    confidence = excluded.confidence,
    reviewed_at = excluded.reviewed_at,
    notes = excluded.notes,
    updated_at = now()
  returning id, canonical_name, franchise
), clear_prior as (
  delete from public.pop_set_checklist_items ci
  using upsert_set us
  where ci.set_id = us.id
), checklist(set_name, franchise, upc_value, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, source_value, confidence_value, notes_value) as (
  values
    ('Aladdin: Movie Moments', 'Disney', '889698293754', 'Aladdin''s First Wish', 'Aladdin & Genie', '409', 'Movie Moments', null, 'Pop! Moments', 'Movie Moments', 'https://www.pricecharting.com/game/funko-pop-disney/aladdin%27s-first-wish-409', 0.90::numeric, 'PriceCharting confirms UPC 889698293754 and box #409.'),
    ('Aladdin: Movie Moments', 'Disney', null, 'Magic Carpet Ride', 'Aladdin', '480', 'Movie Moments', null, 'Pop! Moments', 'Movie Moments', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=148', 0.82::numeric, 'FigureRealm Aladdin checklist row.'),
    ('Avengers: Mech Strike', 'Marvel', null, 'Captain America', 'Captain America', '829', null, null, 'Pop! Marvel', 'Standard', 'https://bleedingcool.com/collectibles/funko-pop-marvel-avengers-mech-strike/', 0.86::numeric, 'Common lineup row.'),
    ('Avengers: Mech Strike', 'Marvel', null, 'Black Panther', 'Black Panther', '830', null, null, 'Pop! Marvel', 'Standard', 'https://bleedingcool.com/collectibles/funko-pop-marvel-avengers-mech-strike/', 0.86::numeric, 'Common lineup row.'),
    ('Avengers: Mech Strike', 'Marvel', null, 'Captain Marvel', 'Captain Marvel', '831', null, null, 'Pop! Marvel', 'Standard', 'https://bleedingcool.com/collectibles/funko-pop-marvel-avengers-mech-strike/', 0.86::numeric, 'Common lineup row.'),
    ('Avengers: Mech Strike', 'Marvel', '889698552363', 'Doctor Strange', 'Doctor Strange', '832', null, null, 'Pop! Marvel', 'Standard', 'https://www.figurerealm.com/actionfigure?action=actionfigure&figure=doctorstrange832&id=95465', 0.90::numeric, 'FigureRealm confirms Doctor Strange #832 and UPC 889698552363.'),
    ('Avengers: Mech Strike', 'Marvel', null, 'Hulk', 'Hulk', '833', null, null, 'Pop! Marvel', 'Standard', 'https://bleedingcool.com/collectibles/funko-pop-marvel-avengers-mech-strike/', 0.86::numeric, 'Common lineup row.'),
    ('Avengers: Mech Strike', 'Marvel', null, 'Thor', 'Thor', '834', null, null, 'Pop! Marvel', 'Standard', 'https://bleedingcool.com/collectibles/funko-pop-marvel-avengers-mech-strike/', 0.86::numeric, 'Common lineup row.'),
    ('Beavis and Butt-Head', 'Beavis and Butt-Head', null, 'Beavis', 'Beavis', '40', null, null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=583', 0.90::numeric, 'FigureRealm Pop! Vinyl row.'),
    ('Beavis and Butt-Head', 'Beavis and Butt-Head', null, 'Butt-Head', 'Butt-Head', '41', null, null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=583', 0.90::numeric, 'FigureRealm Pop! Vinyl row.'),
    ('Beavis and Butt-Head', 'Beavis and Butt-Head', null, 'Butt-Head (Burger World Uniform)', 'Butt-Head', '1591', 'Burger World Uniform', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=583', 0.90::numeric, 'FigureRealm Pop! Vinyl row.'),
    ('Beavis and Butt-Head', 'Beavis and Butt-Head', null, 'Beavis (Burger World Uniform)', 'Beavis', '1592', 'Burger World Uniform', null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=583', 0.90::numeric, 'FigureRealm Pop! Vinyl row.'),
    ('Beavis and Butt-Head', 'Beavis and Butt-Head', null, 'Cornholio', 'Cornholio', '1593', null, null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=583', 0.90::numeric, 'FigureRealm Pop! Vinyl row.'),
    ('Beavis and Butt-Head', 'Beavis and Butt-Head', '889698850827', 'Butt-Head (Ghost)', 'Butt-Head', '1594', 'Ghost', 'Funko Shop', 'Pop! Television', 'Standard', 'https://funko.com/pop-butt-head-ghost/85082.html', 0.95::numeric, 'Official Funko item 85082, web exclusive, box #1594.'),
    ('Ben 10', 'Ben 10', null, 'Ben Tennyson', 'Ben Tennyson', '1771', null, null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=605', 0.90::numeric, 'FigureRealm Pop! Vinyl row.'),
    ('Ben 10', 'Ben 10', '889698862950', 'Heatblast', 'Heatblast', '1772', null, null, 'Pop! Television', 'Standard', 'https://funko.com/pop-heatblast/86295.html', 0.95::numeric, 'Official Funko item 86295, box #1772.'),
    ('Ben 10', 'Ben 10', null, 'Swampfire', 'Swampfire', '1202', null, null, 'Pop! Television', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=605', 0.90::numeric, 'FigureRealm Pop! Vinyl row.')
), matched as (
  select us.id as set_id, pc.id as pop_catalog_id, checklist.*
  from checklist
  join upsert_set us on us.canonical_name = checklist.set_name and us.franchise = checklist.franchise
  left join public.pop_catalog pc on pc.upc = checklist.upc_value
)
insert into public.pop_set_checklist_items (
  set_id, pop_catalog_id, upc, pop_name, character, number, variant, exclusivity, pop_type, pop_style,
  is_required_for_completion, source_url, confidence, notes
)
select
  set_id, pop_catalog_id, upc_value, pop_name, character_name, number_value, variant_value, exclusivity_value,
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

update public.pop_catalog pc
set
  franchise = v.franchise,
  set_name = v.set_name,
  pop_name = v.pop_name,
  character = v.character_name,
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
from (
  values
    ('889698293754', 'Disney', 'Aladdin: Movie Moments', 'Aladdin''s First Wish', 'Aladdin & Genie', '409', 'Movie Moments', null, 'Pop! Moments', 'Movie Moments', 2, '2018-01-01', 0.90::numeric),
    ('889698552363', 'Marvel', 'Avengers: Mech Strike', 'Doctor Strange', 'Doctor Strange', '832', null, null, 'Pop! Marvel', 'Standard', 6, '2021-01-01', 0.90::numeric),
    ('889698850827', 'Beavis and Butt-Head', 'Beavis and Butt-Head', 'Butt-Head (Ghost)', 'Butt-Head', '1594', 'Ghost', 'Funko Shop', 'Pop! Television', 'Standard', 6, '2024-01-01', 0.95::numeric),
    ('889698862950', 'Ben 10', 'Ben 10', 'Heatblast', 'Heatblast', '1772', null, null, 'Pop! Television', 'Standard', 3, '2025-01-01', 0.95::numeric)
) as v(upc_value, franchise, set_name, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, set_total_value, release_date_value, confidence_value)
where pc.upc = v.upc_value;
