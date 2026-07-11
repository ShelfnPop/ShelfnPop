-- Batman/DC stability override batch, staged 2026-07-09.
-- Purpose:
-- - Persist stable Batman/DC cleanup results into public.catalog_parser_overrides.
-- - Cover vaulted Batman Forever rows, DC New Classics rows, and Dark Multiverse rows.

insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
values
  (
    '889698477055',
    (select id from public.pop_catalog where upc = '889698477055' limit 1),
    jsonb_build_object(
      'pop_name', 'The Riddler',
      'character', 'The Riddler',
      'franchise', 'DC',
      'set_name', 'Batman Forever',
      'number', '340',
      'vault_status', 'Vaulted',
      'pop_type', 'Pop! Heroes',
      'pop_style', 'Standard',
      'description', 'The Riddler is a Batman Forever Pop! Heroes release #340.',
      'display_description', 'The Riddler is a Batman Forever Pop! Heroes release #340.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'Stable Batman Forever row with vaulted status normalization.',
    true
  ),
  (
    '889698477062',
    (select id from public.pop_catalog where upc = '889698477062' limit 1),
    jsonb_build_object(
      'pop_name', 'Two-Face',
      'character', 'Two-Face',
      'franchise', 'DC',
      'set_name', 'Batman Forever',
      'number', '341',
      'vault_status', 'Vaulted',
      'pop_type', 'Pop! Heroes',
      'pop_style', 'Standard',
      'description', 'Two-Face is a Batman Forever Pop! Heroes release #341.',
      'display_description', 'Two-Face is a Batman Forever Pop! Heroes release #341.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'Stable Batman Forever row with vaulted status normalization.',
    true
  ),
  (
    '889698863698',
    (select id from public.pop_catalog where upc = '889698863698' limit 1),
    jsonb_build_object(
      'pop_name', 'Batman',
      'character', 'Batman',
      'franchise', 'DC',
      'set_name', 'DC New Classics',
      'number', '598',
      'pop_type', 'Pop! Heroes',
      'pop_style', 'Standard',
      'description', 'Batman is a DC New Classics Pop! Heroes release #598.',
      'display_description', 'Batman is a DC New Classics Pop! Heroes release #598.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'Stable DC New Classics set-name normalization.',
    true
  ),
  (
    '889698863704',
    (select id from public.pop_catalog where upc = '889698863704' limit 1),
    jsonb_build_object(
      'pop_name', 'Superman',
      'character', 'Superman',
      'franchise', 'DC',
      'set_name', 'DC New Classics',
      'number', '599',
      'pop_type', 'Pop! Heroes',
      'pop_style', 'Standard',
      'description', 'Superman is a DC New Classics Pop! Heroes release #599.',
      'display_description', 'Superman is a DC New Classics Pop! Heroes release #599.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'Stable DC New Classics set-name normalization.',
    true
  ),
  (
    '889698863711',
    (select id from public.pop_catalog where upc = '889698863711' limit 1),
    jsonb_build_object(
      'pop_name', 'Wonder Woman',
      'character', 'Wonder Woman',
      'franchise', 'DC',
      'set_name', 'DC New Classics',
      'number', '600',
      'pop_type', 'Pop! Heroes',
      'pop_style', 'Standard',
      'description', 'Wonder Woman is a DC New Classics Pop! Heroes release #600.',
      'display_description', 'Wonder Woman is a DC New Classics Pop! Heroes release #600.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'Stable DC New Classics set-name normalization.',
    true
  ),
  (
    '889698863728',
    (select id from public.pop_catalog where upc = '889698863728' limit 1),
    jsonb_build_object(
      'pop_name', 'Green Lantern',
      'character', 'Green Lantern',
      'franchise', 'DC',
      'set_name', 'DC New Classics',
      'number', '601',
      'pop_type', 'Pop! Heroes',
      'pop_style', 'Standard',
      'description', 'Green Lantern is a DC New Classics Pop! Heroes release #601.',
      'display_description', 'Green Lantern is a DC New Classics Pop! Heroes release #601.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'Stable DC New Classics set-name normalization.',
    true
  ),
  (
    '889698862257',
    (select id from public.pop_catalog where upc = '889698862257' limit 1),
    jsonb_build_object(
      'pop_name', 'Robin King',
      'character', 'Robin King',
      'franchise', 'DC',
      'set_name', 'Tales from the Dark Multiverse',
      'number', '581',
      'pop_type', 'Pop! Heroes',
      'pop_style', 'Standard',
      'description', 'Robin King is a Tales from the Dark Multiverse Pop! Heroes release #581.',
      'display_description', 'Robin King is a Tales from the Dark Multiverse Pop! Heroes release #581.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'Stable Dark Multiverse set-name normalization.',
    true
  ),
  (
    '889698862240',
    (select id from public.pop_catalog where upc = '889698862240' limit 1),
    jsonb_build_object(
      'pop_name', 'Saint Batman',
      'character', 'Saint Batman',
      'franchise', 'DC',
      'set_name', 'Tales from the Dark Multiverse',
      'number', '580',
      'pop_type', 'Pop! Heroes',
      'pop_style', 'Standard',
      'description', 'Saint Batman is a Tales from the Dark Multiverse Pop! Heroes release #580.',
      'display_description', 'Saint Batman is a Tales from the Dark Multiverse Pop! Heroes release #580.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'Stable Dark Multiverse set-name normalization.',
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
  override_data ->> 'set_name' as set_name,
  override_data ->> 'number' as number,
  override_data ->> 'vault_status' as vault_status,
  override_data ->> 'needs_review' as needs_review,
  is_active,
  notes
from public.catalog_parser_overrides
where upc in (
  '889698477055',
  '889698477062',
  '889698863698',
  '889698863704',
  '889698863711',
  '889698863728',
  '889698862257',
  '889698862240'
)
order by upc;
