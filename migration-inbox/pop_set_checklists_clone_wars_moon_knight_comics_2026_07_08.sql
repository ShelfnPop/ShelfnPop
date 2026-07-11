-- Audit note: Clone Wars reviewed checklist and Moon Knight Comics cleanup, 2026-07-08.
--
-- Sources:
--   Star Wars: The Clone Wars FigureRealm checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056
--   Count Dooku vs. Anakin Skywalker official Funko supplemental row:
--     https://funko.com/pop-count-dooku-vs.-anakin-skywalker-2-pack/74328.html
--   Moon Knight Fan checklist/reference page:
--     https://www.moonknightfan.com/funkos.html
--
-- Live changes:
--   * Promote Star Wars: The Clone Wars to reviewed with 31 required rows.
--   * Denominator = 28 FigureRealm checklist rows + 3 supplemental owned rows:
--     Count Dooku vs. Anakin Skywalker 2-Pack, Obi-Wan Kenobi (Mandalorian Armor)
--     #599, and 332nd Company Trooper #627.
--   * Keep Moon Knight (Comics) draft, but correct owned Moon Knight #08 to Comic Cover.
--   * No ownership quantities, paid values, or current values are changed.

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
    'Star Wars: The Clone Wars',
    'Star Wars',
    'reviewed',
    'FigureRealm Clone Wars checklist + official Funko supplemental owned row',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056',
    0.86,
    now(),
    'Reviewed Clone Wars denominator is 31: 28 FigureRealm checklist rows plus 3 supplemental owned rows absent from that page: Count Dooku vs. Anakin Skywalker 2-Pack, Obi-Wan Kenobi (Mandalorian Armor) #599, and 332nd Company Trooper #627.'
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
), checklist(pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, source_value, confidence_value, notes_value) as (
  values
    ('Darth Maul & Gar Saxon (Glows In The Dark)', 'Darth Maul & Gar Saxon', null, 'Glow in the Dark', null, 'Pop! Sets', '2-Pack', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.84::numeric, 'FigureRealm Clone Wars Pop! Sets row.'),
    ('Pong Krell vs. Captain Rex', 'Pong Krell vs. Captain Rex', null, 'Common', null, 'Pop! Sets', '2-Pack', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.84::numeric, 'FigureRealm Clone Wars Pop! Sets row.'),
    ('Ahsoka', 'Ahsoka', '272', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Ahsoka', 'Ahsoka', '268', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Ahsoka', 'Ahsoka', '409', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Ahsoka', 'Ahsoka', '414', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Ahsoka Tano', 'Ahsoka Tano', '658', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Ahsoka Tano (Diamond Collection)', 'Ahsoka Tano', '268', 'Diamond Collection', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.88::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Anakin Skywalker', 'Anakin Skywalker', '271', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Arc Trooper Jesse', 'Arc Trooper Jesse', '807', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Arc Trooper Jesse (Helmet) (Chase)', 'Arc Trooper Jesse', '807', 'Chase', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.88::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Asajj Ventress', 'Asajj Ventress', '711', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Bo-Katan Kryze', 'Bo-Katan Kryze', '412', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Cad Bane', 'Cad Bane', '262', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Cad Bane with Todo 360', 'Cad Bane', '476', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Captain Rex', 'Captain Rex', '274', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Clone Trooper Fives (Retro)', 'Clone Trooper Fives', '768', 'Retro', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.88::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Darth Maul', 'Darth Maul', '410', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Darth Maul', 'Darth Maul', '450', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Darth Maul (Cybernetic Legs)', 'Darth Maul', '647', 'Cybernetic Legs', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.88::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Gar Saxon', 'Gar Saxon', '411', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('General Grievous', 'General Grievous', '129', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Hondo and Pikk', 'Hondo and Pikk', '808', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Jar Jar Binks', 'Jar Jar Binks', '500', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Mandalorian (Super Commando)', 'Mandalorian', '415', 'Super Commando', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.88::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Obi-Wan Kenobi', 'Obi-Wan Kenobi', '270', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Wrecker', 'Wrecker', '413', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Yoda', 'Yoda', '269', 'Common', null, 'Pop! Star Wars', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056', 0.90::numeric, 'FigureRealm Clone Wars Pop! Vinyl row.'),
    ('Count Dooku vs. Anakin Skywalker 2-Pack', 'Count Dooku & Anakin Skywalker', null, 'Common', 'GameStop', 'Pop! Multipack', '2-Pack', 'https://funko.com/pop-count-dooku-vs.-anakin-skywalker-2-pack/74328.html', 0.86::numeric, 'Official Funko supplemental owned Clone Wars Pop! Multipack row.'),
    ('Obi-Wan Kenobi (Mandalorian Armor)', 'Obi-Wan Kenobi', '599', 'Mandalorian Armor', 'Entertainment Earth', 'Pop! Star Wars', 'Standard', 'https://www.pricecharting.com/game/funko-pop-star-wars/obi-wan-kenobi-mandalorian-armor-599', 0.84::numeric, 'Supplemental owned Clone Wars row absent from FigureRealm page.'),
    ('332nd Company Trooper', '332nd Company Trooper', '627', 'Common', 'Books-A-Million', 'Pop! Star Wars', 'Standard', 'https://funko.com/pop-332nd-company-trooper-marching/71252.html', 0.86::numeric, 'Official Funko supplemental owned Clone Wars row absent from FigureRealm page.')
), matched as (
  select
    upsert_set.id as set_id,
    pc.id as pop_catalog_id,
    pc.upc,
    checklist.*
  from checklist
  cross join upsert_set
  left join lateral (
    select pc.id, pc.upc
    from public.pop_catalog pc
    where pc.franchise = 'Star Wars'
      and pc.set_name = 'Star Wars: The Clone Wars'
      and (
        (checklist.number_value is not null and pc.number = checklist.number_value and (lower(pc.pop_name) = lower(checklist.pop_name) or lower(pc.character) = lower(checklist.character_name)))
        or (checklist.number_value is null and (lower(pc.pop_name) = lower(checklist.pop_name) or lower(pc.character) = lower(checklist.character_name)))
        or (checklist.pop_name = 'Count Dooku vs. Anakin Skywalker 2-Pack' and pc.upc = '889698743280')
        or (checklist.pop_name = 'Darth Maul & Gar Saxon (Glows In The Dark)' and pc.upc = '889698740869')
        or (checklist.pop_name = 'Obi-Wan Kenobi (Mandalorian Armor)' and pc.upc = '889698682831')
        or (checklist.pop_name = '332nd Company Trooper' and pc.upc = '889698712521')
      )
    order by
      case when lower(pc.pop_name) = lower(checklist.pop_name) then 0 else 1 end,
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
  upc,
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
  upc = coalesce(excluded.upc, public.pop_set_checklist_items.upc),
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
  set_total = 31,
  needs_review = false,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  api_last_updated = now()
where franchise = 'Star Wars'
  and set_name = 'Star Wars: The Clone Wars';

update public.pop_catalog
set
  pop_name = 'Darth Maul & Gar Saxon',
  character = 'Darth Maul & Gar Saxon',
  variant = 'Glow in the Dark',
  exclusivity = 'Exclusive',
  pop_type = 'Pop! Sets',
  pop_style = '2-Pack',
  set_total = 31,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  api_last_updated = now()
where upc = '889698740869';

update public.pop_catalog
set
  pop_name = 'Obi-Wan Kenobi (Mandalorian Armor)',
  character = 'Obi-Wan Kenobi',
  variant = 'Mandalorian Armor',
  exclusivity = 'Entertainment Earth',
  pop_type = 'Pop! Star Wars',
  pop_style = 'Standard',
  set_total = 31,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  api_last_updated = now()
where upc = '889698682831';

update public.pop_catalog
set
  pop_name = '332nd Company Trooper',
  character = '332nd Company Trooper',
  variant = null,
  exclusivity = 'Books-A-Million',
  pop_type = 'Pop! Star Wars',
  pop_style = 'Standard',
  set_total = 31,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  api_last_updated = now()
where upc = '889698712521';

update public.pop_catalog
set
  pop_name = 'Count Dooku vs. Anakin Skywalker 2-Pack',
  character = 'Count Dooku & Anakin Skywalker',
  number = null,
  variant = null,
  exclusivity = 'GameStop',
  pop_type = 'Pop! Multipack',
  pop_style = '2-Pack',
  set_total = 31,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  api_last_updated = now()
where upc = '889698743280';

update public.pop_catalog
set
  pop_type = 'Pop! Marvel',
  pop_style = 'Comic Cover',
  display_description = 'Moon Knight is a Marvel Pop! Comic Covers release #8 from Moon Knight (Comics).',
  description = 'Moon Knight is a Marvel Pop! Comic Covers release #8 from Moon Knight (Comics).',
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.95),
  needs_review = false,
  api_last_updated = now()
where upc = '889698615006';

update public.pop_sets
set
  status = 'draft',
  reviewed_at = null,
  confidence = greatest(coalesce(confidence, 0), 0.80),
  source_label = 'Moon Knight Fan checklist/reference page',
  source_url = 'https://www.moonknightfan.com/funkos.html',
  notes = 'Moon Knight Fan confirms the owned comics rows, including Comic Covers #08 and Deluxe Mr. Knight #1199, but the page mixes Disney+ show, comics, Marvel Zombies, Infinity Warps, Soda, Keychain, Pin, Comic Cover, Deluxe, Jumbo, and standard Pop rows. Completion denominator remains deferred until the comic-line scope is intentionally split.',
  updated_at = now()
where canonical_name = 'Moon Knight (Comics)'
  and franchise = 'Marvel';

select
  ps.canonical_name,
  ps.status,
  ps.confidence,
  count(pci.id) as checklist_rows,
  count(pci.id) filter (where pci.is_required_for_completion) as required_rows,
  count(pci.pop_catalog_id) as linked_catalog_rows
from public.pop_sets ps
left join public.pop_set_checklist_items pci on pci.set_id = ps.id
where (ps.canonical_name = 'Star Wars: The Clone Wars' and ps.franchise = 'Star Wars')
   or (ps.canonical_name = 'Moon Knight (Comics)' and ps.franchise = 'Marvel')
group by ps.canonical_name, ps.status, ps.confidence
order by ps.canonical_name;
