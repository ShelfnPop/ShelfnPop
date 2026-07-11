-- Audit note: Darkwing Duck and Moon Knight (Comics) set completion cleanup, plus Peacemaker verification, 2026-07-08.
--
-- Sources:
--   Darkwing Duck ActionFigureGeek checklist:
--     https://actionfiguregeek.com/darkwing-duck-funko-pop-checklist-buyers-guide-gallery/
--   Moon Knight Fan Funko reference:
--     https://www.moonknightfan.com/funkos.html
--   Official Funko Pop! Deluxe Mr. Knight #1199:
--     https://funko.com/pop-deluxe-mr.-knight/68730.html
--   Peacemaker FigureRealm checklist, verified unchanged:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3928
--
-- Live changes:
--   * Promote Darkwing Duck to reviewed with 8 required rows.
--   * Promote Moon Knight (Comics) to reviewed with 7 required rows.
--   * Keep Peacemaker unchanged after confirming its 10 reviewed checklist rows still link to catalog rows.
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
    'Darkwing Duck',
    'Darkwing Duck',
    'reviewed',
    'ActionFigureGeek Darkwing Duck Funko Pop checklist',
    'https://actionfiguregeek.com/darkwing-duck-funko-pop-checklist-buyers-guide-gallery/',
    0.86,
    now(),
    'Reviewed Darkwing Duck denominator is 8: #296, #297, #298, #299, #300, #463 common, #463 glow chase, and #1328 Funko Shop. The 2023 #1328 chase is not counted separately in this checklist denominator.'
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
    ('Darkwing Duck', 'Darkwing Duck', '296', 'Common', null, 'Pop! Disney', 'Standard', 'https://actionfiguregeek.com/darkwing-duck-funko-pop-checklist-buyers-guide-gallery/', 0.88::numeric, 'ActionFigureGeek checklist row.'),
    ('Launchpad McQuack', 'Launchpad McQuack', '297', 'Common', null, 'Pop! Disney', 'Standard', 'https://actionfiguregeek.com/darkwing-duck-funko-pop-checklist-buyers-guide-gallery/', 0.90::numeric, 'ActionFigureGeek checklist row.'),
    ('Gosalyn Mallard', 'Gosalyn Mallard', '298', 'Common', null, 'Pop! Disney', 'Standard', 'https://actionfiguregeek.com/darkwing-duck-funko-pop-checklist-buyers-guide-gallery/', 0.90::numeric, 'ActionFigureGeek checklist row.'),
    ('Negaduck', 'Negaduck', '299', 'Common', 'PX Previews', 'Pop! Disney', 'Standard', 'https://actionfiguregeek.com/darkwing-duck-funko-pop-checklist-buyers-guide-gallery/', 0.88::numeric, 'ActionFigureGeek checklist row.'),
    ('Negatron', 'Negatron', '300', 'Glow in the Dark', 'San Diego Comic-Con', 'Pop! Disney', 'Standard', 'https://actionfiguregeek.com/darkwing-duck-funko-pop-checklist-buyers-guide-gallery/', 0.88::numeric, 'ActionFigureGeek checklist row.'),
    ('Megavolt', 'Megavolt', '463', 'Common', 'GameStop', 'Pop! Disney', 'Standard', 'https://actionfiguregeek.com/darkwing-duck-funko-pop-checklist-buyers-guide-gallery/', 0.90::numeric, 'ActionFigureGeek checklist row.'),
    ('Megavolt', 'Megavolt', '463', 'Glow in the Dark Chase', 'GameStop', 'Pop! Disney', 'Standard', 'https://actionfiguregeek.com/darkwing-duck-funko-pop-checklist-buyers-guide-gallery/', 0.88::numeric, 'ActionFigureGeek checklist row.'),
    ('Darkwing Duck', 'Darkwing Duck', '1328', 'Common', 'Funko Shop', 'Pop! Disney', 'Standard', 'https://actionfiguregeek.com/darkwing-duck-funko-pop-checklist-buyers-guide-gallery/', 0.90::numeric, 'ActionFigureGeek checklist row.')
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
    where pc.franchise = 'Darkwing Duck'
      and pc.set_name = 'Darkwing Duck'
      and pc.number = checklist.number_value
      and lower(pc.pop_name) = lower(checklist.pop_name)
      and (
        (checklist.variant_value = 'Common' and coalesce(pc.variant, 'Common') = 'Common')
        or lower(coalesce(pc.variant, '')) = lower(checklist.variant_value)
      )
    order by pc.created_at desc nulls last
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
  set_total = 8,
  needs_review = false,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  api_last_updated = now()
where franchise = 'Darkwing Duck'
  and set_name = 'Darkwing Duck';

update public.pop_catalog
set
  exclusivity = 'Funko Shop',
  set_total = 8,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  api_last_updated = now()
where upc = '889698692335';

update public.pop_catalog
set
  exclusivity = 'GameStop',
  set_total = 8,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  api_last_updated = now()
where upc = '889698348256';

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
    'Moon Knight (Comics)',
    'Marvel',
    'reviewed',
    'Moon Knight Fan reference + official Funko #1199 detail',
    'https://www.moonknightfan.com/funkos.html',
    0.86,
    now(),
    'Reviewed Moon Knight (Comics) denominator is 7: #266, #267 glow, #272, Comic Covers #08 and #54, plus Pop! Deluxe Mr. Knight #1199 common and glow chase. Disney+ show, Marvel Zombies, Infinity Warps, Soda, Keychain, Pin, and Jumbo rows remain outside this comics set.'
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
    ('Moon Knight', 'Moon Knight', '266', 'Common', 'Hot Topic', 'Pop! Marvel', 'Standard', 'https://www.moonknightfan.com/funkos.html', 0.88::numeric, 'Moon Knight Fan notes 2017 LA Comic Con release that later became Hot Topic exclusive.'),
    ('Moon Knight', 'Moon Knight', '267', 'Glow in the Dark', 'LA ComicCon', 'Pop! Marvel', 'Standard', 'https://www.moonknightfan.com/funkos.html', 0.86::numeric, 'Moon Knight Fan checklist row.'),
    ('Moon Knight', 'Moon Knight', '272', 'Common', 'Walgreens', 'Pop! Marvel', 'Standard', 'https://www.moonknightfan.com/funkos.html', 0.90::numeric, 'Moon Knight Fan checklist row.'),
    ('Moon Knight', 'Moon Knight', '8', 'Common', null, 'Pop! Comic Covers', 'Comic Cover', 'https://www.moonknightfan.com/funkos.html', 0.90::numeric, 'Moon Knight Fan Comic Covers #08 row.'),
    ('Moon Knight', 'Moon Knight', '54', 'Common', null, 'Pop! Comic Covers', 'Comic Cover', 'https://www.moonknightfan.com/funkos.html', 0.88::numeric, 'Moon Knight Fan Comic Covers #54 row.'),
    ('Mr. Knight', 'Mr. Knight', '1199', 'Common', 'Funko Shop', 'Pop! Deluxe', 'Deluxe', 'https://funko.com/pop-deluxe-mr.-knight/68730.html', 0.90::numeric, 'Official Funko Pop! Deluxe Mr. Knight #1199 row.'),
    ('Mr. Knight', 'Mr. Knight', '1199', 'Glow in the Dark Chase', 'Funko Shop', 'Pop! Deluxe', 'Deluxe', 'https://funko.com/pop-deluxe-mr.-knight/68730.html', 0.90::numeric, 'Official Funko notes 1-in-6 glow-in-the-dark chase.')
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
    where pc.franchise = 'Marvel'
      and pc.set_name = 'Moon Knight (Comics)'
      and pc.number = checklist.number_value
      and lower(pc.pop_name) = lower(checklist.pop_name)
      and (
        (checklist.variant_value = 'Common' and coalesce(pc.variant, 'Common') = 'Common')
        or lower(coalesce(pc.variant, '')) = lower(checklist.variant_value)
      )
    order by pc.created_at desc nulls last
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
  set_total = 7,
  needs_review = false,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  api_last_updated = now()
where franchise = 'Marvel'
  and set_name = 'Moon Knight (Comics)';

update public.pop_catalog
set
  pop_type = 'Pop! Comic Covers',
  pop_style = 'Comic Cover',
  set_total = 7,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false,
  api_last_updated = now()
where upc = '889698615006';
