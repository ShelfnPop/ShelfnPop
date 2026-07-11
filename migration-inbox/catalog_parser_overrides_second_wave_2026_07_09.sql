-- Second-wave learned parser overrides from 2026-07-08 review batches, staged 2026-07-09.
-- Purpose:
-- - Persist additional high-confidence identity fixes for Star Wars, Back to the Future, Batman/DC, and Indiana Jones rows.
-- - Keep review flags only where the review notes explicitly left duplicate/sticker/value ambiguity open.

insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
values
  (
    '889698430173',
    (select id from public.pop_catalog where upc = '889698430173' limit 1),
    jsonb_build_object(
      'pop_name', 'Princess Leia',
      'character', 'Princess Leia',
      'franchise', 'Star Wars',
      'set_name', 'Star Wars',
      'number', '295',
      'variant', 'Gold Chrome',
      'exclusivity', 'Galactic Convention / Hot Topic',
      'pop_type', 'Pop! Star Wars',
      'pop_style', 'Standard',
      'description', 'Princess Leia (Gold Chrome) is a Star Wars Pop! release #295, Galactic Convention shared exclusive.',
      'display_description', 'Princess Leia (Gold Chrome) is a Star Wars Pop! release #295, Galactic Convention shared exclusive.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence Star Wars variant normalization.',
    true
  ),
  (
    '889698704571',
    (select id from public.pop_catalog where upc = '889698704571' limit 1),
    jsonb_build_object(
      'pop_name', 'Darth Vader on TIE Fighter',
      'character', 'Darth Vader',
      'franchise', 'Star Wars',
      'set_name', 'Disney 100',
      'number', '20',
      'exclusivity', 'Amazon',
      'pop_type', 'Pop! Trains',
      'pop_style', 'Standard',
      'description', 'Darth Vader on TIE Fighter is a Disney 100 Star Wars Pop! Trains release #20, Amazon exclusive.',
      'display_description', 'Darth Vader on TIE Fighter is a Disney 100 Star Wars Pop! Trains release #20, Amazon exclusive.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence Star Wars pop-type correction.',
    true
  ),
  (
    '889698652568',
    (select id from public.pop_catalog where upc = '889698652568' limit 1),
    jsonb_build_object(
      'pop_name', 'Krrsantan',
      'character', 'Krrsantan',
      'franchise', 'Star Wars',
      'set_name', 'The Book of Boba Fett',
      'number', '548',
      'variant', 'Flocked',
      'exclusivity', 'Summer Convention',
      'pop_type', 'Pop! Star Wars',
      'pop_style', 'Standard',
      'description', 'Krrsantan (Flocked) is a Star Wars: The Book of Boba Fett Pop! release #548, Summer Convention exclusive.',
      'display_description', 'Krrsantan (Flocked) is a Star Wars: The Book of Boba Fett Pop! release #548, Summer Convention exclusive.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence set casing and identity normalization.',
    true
  ),
  (
    '889698837729',
    (select id from public.pop_catalog where upc = '889698837729' limit 1),
    jsonb_build_object(
      'pop_name', 'Jean-Luc Picard (Transporter) (Glitter)',
      'character', 'Jean-Luc Picard',
      'franchise', 'Star Trek',
      'set_name', 'Star Trek Transporter',
      'number', '1687',
      'variant', 'Glitter',
      'pop_type', 'Pop! Plus',
      'pop_style', 'Standard',
      'description', 'Jean-Luc Picard (Transporter) (Glitter) is a Star Trek Pop! Plus release #1687.',
      'display_description', 'Jean-Luc Picard (Transporter) (Glitter) is a Star Trek Pop! Plus release #1687.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence Star Trek identity normalization.',
    true
  ),
  (
    '889698477093',
    (select id from public.pop_catalog where upc = '889698477093' limit 1),
    jsonb_build_object(
      'pop_name', 'The Joker (Batman 1989)',
      'character', 'The Joker',
      'franchise', 'DC',
      'set_name', 'Batman 1989',
      'number', '337',
      'variant', 'Metallic',
      'pop_type', 'Pop! Heroes',
      'pop_style', 'Standard',
      'description', 'The Joker (Batman 1989) is a Pop! Heroes release #337.',
      'display_description', 'The Joker (Batman 1989) is a Pop! Heroes release #337.',
      'parse_confidence', 0.98,
      'needs_review', true
    ),
    'Identity is stable; keep review on for duplicate family and variant/value follow-up.',
    true
  ),
  (
    '889698372541',
    (select id from public.pop_catalog where upc = '889698372541' limit 1),
    jsonb_build_object(
      'pop_name', 'Batman Forever',
      'character', 'Batman',
      'franchise', 'DC',
      'set_name', 'Batman Forever',
      'number', '289',
      'pop_type', 'Pop! Heroes',
      'pop_style', 'Standard',
      'description', 'Batman Forever is a Pop! Heroes release #289.',
      'display_description', 'Batman Forever is a Pop! Heroes release #289.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence Batman line set-name correction.',
    true
  ),
  (
    '889698639880',
    (select id from public.pop_catalog where upc = '889698639880' limit 1),
    jsonb_build_object(
      'pop_name', 'Sallah',
      'character', 'Sallah',
      'franchise', 'Indiana Jones',
      'set_name', 'Indiana Jones and the Last Crusade',
      'number', '1352',
      'pop_type', 'Pop! Movies',
      'pop_style', 'Standard',
      'description', 'Sallah is an Indiana Jones and the Last Crusade Pop! Movies release #1352.',
      'display_description', 'Sallah is an Indiana Jones and the Last Crusade Pop! Movies release #1352.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence franchise/set fill.',
    true
  ),
  (
    '889698485159',
    (select id from public.pop_catalog where upc = '889698485159' limit 1),
    jsonb_build_object(
      'pop_name', 'Biff Tannen',
      'character', 'Biff Tannen',
      'franchise', 'Back to the Future',
      'set_name', 'Back to the Future',
      'number', '963',
      'vault_status', 'Vaulted',
      'pop_type', 'Pop! Movies',
      'pop_style', 'Standard',
      'description', 'Biff Tannen is a Pop! Movies release #963 from Back to the Future.',
      'display_description', 'From Back to the Future, Biff Tannen is a Pop! Movies release #963.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence Back to the Future normalization.',
    true
  ),
  (
    '889698744225',
    (select id from public.pop_catalog where upc = '889698744225' limit 1),
    jsonb_build_object(
      'pop_name', 'Batman (Kingdom Come)',
      'character', 'Batman',
      'franchise', 'DC',
      'set_name', 'Kingdom Come',
      'number', '569',
      'exclusivity', 'Summer Convention',
      'pop_type', 'Pop! Heroes',
      'pop_style', 'Standard',
      'description', 'Batman (Kingdom Come) is a Pop! Heroes release #569, Summer Convention exclusive.',
      'display_description', 'Batman (Kingdom Come) is a Pop! Heroes release #569, Summer Convention exclusive.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence Batman line context correction.',
    true
  ),
  (
    '889698818667',
    (select id from public.pop_catalog where upc = '889698818667' limit 1),
    jsonb_build_object(
      'pop_name', 'Fear Gas Batman',
      'character', 'Batman',
      'franchise', 'DC',
      'set_name', 'Batman Begins',
      'number', '532',
      'exclusivity', 'Funko Shop',
      'pop_type', 'Pop! Heroes',
      'pop_style', 'Standard',
      'description', 'Fear Gas Batman is a Batman Begins Pop! Heroes release #532, Funko Shop exclusive.',
      'display_description', 'Fear Gas Batman is a Batman Begins Pop! Heroes release #532, Funko Shop exclusive.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence Batman line set-name correction.',
    true
  ),
  (
    '889698866422',
    (select id from public.pop_catalog where upc = '889698866422' limit 1),
    jsonb_build_object(
      'pop_name', 'Superman and the Fortress of Solitude',
      'character', 'Superman',
      'franchise', 'DC',
      'set_name', 'Superman (2025)',
      'number', '582',
      'pop_type', 'Pop! Moment',
      'pop_style', 'Standard',
      'description', 'Superman and the Fortress of Solitude is a Superman (2025) Pop! Moment release #582.',
      'display_description', 'Superman and the Fortress of Solitude is a Superman (2025) Pop! Moment release #582.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence Superman (2025) moment correction.',
    true
  )
on conflict (upc) do update
set
  pop_catalog_id = excluded.pop_catalog_id,
  override_data = excluded.override_data,
  notes = excluded.notes,
  is_active = excluded.is_active;

select
  upc,
  pop_catalog_id,
  override_data ->> 'franchise' as franchise,
  override_data ->> 'set_name' as set_name,
  override_data ->> 'number' as number,
  override_data ->> 'variant' as variant,
  override_data ->> 'pop_type' as pop_type,
  override_data ->> 'needs_review' as needs_review,
  is_active,
  notes
from public.catalog_parser_overrides
where upc in (
  '889698430173',
  '889698704571',
  '889698652568',
  '889698837729',
  '889698477093',
  '889698372541',
  '889698639880',
  '889698485159',
  '889698744225',
  '889698818667',
  '889698866422'
)
order by upc;
