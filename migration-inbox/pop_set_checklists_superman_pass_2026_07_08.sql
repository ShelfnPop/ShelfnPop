-- Superman cleanup pass, 2026-07-08.
-- Goal: repair source-backed Superman sub-set totals and move Jim Lee #278
-- rows out of the broad Superman/Man of Steel buckets.

update public.pop_catalog
set
  set_total = case set_name
    when 'Superman (2025)' then 14
    when 'Superman (1978)' then 7
    when 'Superman: Shield Through the Ages' then 5
    when 'Man of Steel' then 4
    else set_total
  end
where franchise = 'DC'
  and set_name in ('Superman (2025)', 'Superman (1978)', 'Superman: Shield Through the Ages', 'Man of Steel');

update public.pop_catalog
set
  set_name = 'DC Jim Lee Collection',
  pop_name = 'Superman on Gargoyle',
  character = 'Superman',
  pop_style = 'Deluxe',
  exclusivity = coalesce(exclusivity, 'GameStop'),
  set_total = 7,
  vault_status = 'Vaulted',
  description = 'Superman on Gargoyle is a DC Jim Lee Collection Pop! Deluxe release #278.',
  display_description = 'Superman on Gargoyle is a DC Jim Lee Collection Pop! Deluxe release #278.'
where upc = '889698340724';

update public.pop_catalog
set
  set_name = 'DC Jim Lee Collection',
  pop_name = 'Superman on Gargoyle',
  character = 'Superman',
  pop_style = 'Deluxe',
  exclusivity = coalesce(exclusivity, 'GameStop'),
  set_total = 7,
  vault_status = 'Vaulted',
  description = 'Superman on Gargoyle is a DC Jim Lee Collection Pop! Deluxe release #278, Black & White.',
  display_description = 'Superman on Gargoyle is a DC Jim Lee Collection Pop! Deluxe release #278, Black & White.'
where upc = '889698397742';

with upsert_sets as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values
    (
      'Superman (2025)',
      'DC',
      'reviewed',
      'FigureRealm Superman 2025 Movie checklist',
      'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6474',
      0.90,
      now(),
      'FigureRealm lists 13 Pop! Vinyl Figures for Superman 2025; app set total remains 14 to include the owned Pop! Moment/Deluxe Fortress of Solitude #582 row already loaded in the checklist.'
    ),
    (
      'Superman (1978)',
      'DC',
      'reviewed',
      'FigureRealm Superman Funko checklist and Superman Homepage',
      'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5334&mode=2&series=supermanfunko&ssid=-1',
      0.84,
      now(),
      'Completion total includes Superman/Fortress #537, Jor-El #538, Lois Lane #539, Lex Luthor #540, Lex Luthor Chase #540, Rewind Superman, and Rewind Clark Kent Chase.'
    ),
    (
      'Superman: Shield Through the Ages',
      'DC',
      'reviewed',
      'FigureRealm Superman Funko checklist',
      'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5334&mode=2&series=supermanfunko&ssid=-1',
      0.86,
      now(),
      'Checklist uses the five numbered Shield Through the Ages-style owned rows: #609, #610, #611, #612, and #615.'
    ),
    (
      'Man of Steel',
      'DC',
      'reviewed',
      'FigureRealm Superman Funko checklist',
      'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5334&mode=2&series=supermanfunko&ssid=-1',
      0.82,
      now(),
      'FigureRealm Superman Man of Steel Pop subseries lists four items: Superman #23, Superman #29, General Zod #30, and Superman Black Suit #32.'
    ),
    (
      'DC Jim Lee Collection',
      'DC',
      'draft',
      'Funko Vault and Pop Shop Guide Jim Lee checklist',
      'https://funko.com/pop-deluxe-dc--superman-on-gargoyle-jim-lee/34072.html',
      0.78,
      now(),
      'Superman #278 verified by official Funko Vault as Pop! Deluxe, box #278, vaulted. Set total of 7 is staged from Jim Lee collection checklist/search evidence and should receive a later full checklist pass.'
    )
  on conflict (canonical_name, franchise) do update set
    status = excluded.status,
    source_label = excluded.source_label,
    source_url = excluded.source_url,
    confidence = excluded.confidence,
    reviewed_at = excluded.reviewed_at,
    notes = excluded.notes,
    updated_at = now()
  returning id, canonical_name
), target_sets as (
  select id, canonical_name from upsert_sets
  union
  select id, canonical_name from public.pop_sets
  where canonical_name in ('Superman (1978)', 'Superman: Shield Through the Ages', 'Man of Steel')
), checklist(set_name, upc_value, pop_name, character_name, number_value, variant_value, exclusivity_value, pop_type_value, pop_style_value, source_url, confidence_value, notes_value) as (
  values
    ('Superman (1978)', '889698807623', 'Superman and Fortress of Solitude', 'Superman', '537', 'Common', null, 'Pop! Movies', 'Deluxe', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5334&mode=2&series=supermanfunko&ssid=-1', 0.84::numeric, 'Superman 1978 checklist item.'),
    ('Superman (1978)', null, 'Jor-El', 'Jor-El', '538', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.supermanhomepage.com/first-look-at-new-wave-of-funko-superman-the-movie-pop-vinyl-figures/', 0.82::numeric, 'Superman 1978 checklist item.'),
    ('Superman (1978)', null, 'Lois Lane', 'Lois Lane', '539', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.supermanhomepage.com/first-look-at-new-wave-of-funko-superman-the-movie-pop-vinyl-figures/', 0.82::numeric, 'Superman 1978 checklist item.'),
    ('Superman (1978)', null, 'Lex Luthor (Kryptonite Necklace)', 'Lex Luthor', '540', 'Common', null, 'Pop! Movies', 'Standard', 'https://www.supermanhomepage.com/first-look-at-new-wave-of-funko-superman-the-movie-pop-vinyl-figures/', 0.82::numeric, 'Superman 1978 checklist item.'),
    ('Superman (1978)', null, 'Lex Luthor (Kryptonite Necklace)', 'Lex Luthor', '540', 'Chase', null, 'Pop! Movies', 'Standard', 'https://www.supermanhomepage.com/first-look-at-new-wave-of-funko-superman-the-movie-pop-vinyl-figures/', 0.82::numeric, 'Superman 1978 chase checklist item.'),
    ('Superman (1978)', '889698758116', 'Superman Rewind', 'Superman', '1978', 'Common', null, 'Pop! Movies', 'Rewind', 'https://funko.com/rewind-superman-superman-the-movie/75811.html', 0.82::numeric, 'Superman 1978 Rewind checklist item.'),
    ('Superman (1978)', null, 'Clark Kent Rewind', 'Clark Kent', '1978', 'Chase', null, 'Pop! Movies', 'Rewind', 'https://funko.com/rewind-superman-superman-the-movie/75811.html', 0.82::numeric, 'Superman 1978 Rewind chase checklist item.'),

    ('Superman: Shield Through the Ages', '889698862288', 'Golden Age Superman', 'Superman', '609', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5334&mode=2&series=supermanfunko&ssid=-1', 0.86::numeric, 'Shield Through the Ages checklist item.'),
    ('Superman: Shield Through the Ages', '889698862295', 'Superman ''50', 'Superman', '610', 'Black & White', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5334&mode=2&series=supermanfunko&ssid=-1', 0.86::numeric, 'Shield Through the Ages checklist item.'),
    ('Superman: Shield Through the Ages', '889698862301', 'Superman Fall of Sinestro', 'Superman', '611', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5334&mode=2&series=supermanfunko&ssid=-1', 0.86::numeric, 'Shield Through the Ages checklist item.'),
    ('Superman: Shield Through the Ages', '889698889551', 'Superman Blackest Night', 'Superman', '612', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5334&mode=2&series=supermanfunko&ssid=-1', 0.86::numeric, 'Shield Through the Ages checklist item.'),
    ('Superman: Shield Through the Ages', '889698888165', 'Superman (Breaking Chains)', 'Superman', '615', 'Glow in the Dark', 'Target', 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5334&mode=2&series=supermanfunko&ssid=-1', 0.86::numeric, 'Shield Through the Ages checklist item.'),

    ('Man of Steel', null, 'Superman', 'Superman', '23', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5334&mode=2&series=supermanfunko&ssid=-1', 0.82::numeric, 'Man of Steel checklist item.'),
    ('Man of Steel', '830395030494', 'Superman', 'Superman', '29', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5334&mode=2&series=supermanfunko&ssid=-1', 0.82::numeric, 'Man of Steel checklist item.'),
    ('Man of Steel', null, 'General Zod', 'General Zod', '30', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5334&mode=2&series=supermanfunko&ssid=-1', 0.82::numeric, 'Man of Steel checklist item.'),
    ('Man of Steel', null, 'Superman (Black Suit)', 'Superman', '32', 'Common', null, 'Pop! Heroes', 'Standard', 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5334&mode=2&series=supermanfunko&ssid=-1', 0.82::numeric, 'Man of Steel checklist item.')
), matched as (
  select
    target_sets.id as set_id,
    pc.id as pop_catalog_id,
    checklist.*
  from checklist
  join target_sets on target_sets.canonical_name = checklist.set_name
  left join lateral (
    select pc.id
    from public.pop_catalog pc
    where lower(pc.set_name) = lower(checklist.set_name)
      and (
        (checklist.upc_value is not null and pc.upc = checklist.upc_value)
        or (
          checklist.number_value is not null
          and pc.number = checklist.number_value
          and (
            lower(coalesce(pc.pop_name, pc.character, '')) = lower(checklist.pop_name)
            or lower(coalesce(pc.character, pc.pop_name, '')) = lower(checklist.character_name)
          )
        )
      )
    order by
      case when lower(coalesce(pc.variant, 'Common')) = lower(coalesce(checklist.variant_value, 'Common')) then 0 else 1 end,
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
  upc_value,
  pop_name,
  character_name,
  number_value,
  variant_value,
  exclusivity_value,
  pop_type_value,
  pop_style_value,
  true,
  source_url,
  confidence_value,
  notes_value
from matched
on conflict (set_id, coalesce(number, ''), lower(coalesce(pop_name, '')), lower(coalesce(variant, '')), lower(coalesce(exclusivity, ''))) do update set
  pop_catalog_id = excluded.pop_catalog_id,
  upc = excluded.upc,
  character = excluded.character,
  pop_type = excluded.pop_type,
  pop_style = excluded.pop_style,
  is_required_for_completion = excluded.is_required_for_completion,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  notes = excluded.notes,
  updated_at = now();
