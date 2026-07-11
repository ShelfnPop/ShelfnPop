-- Last-20 completion override batch, staged 2026-07-09.
-- Purpose:
-- - Close the remaining high-confidence parser-learning gaps from the 2026-07-08
--   last-20 scan and api-updated review notes.

insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
values
  (
    '889698520232',
    (select id from public.pop_catalog where upc = '889698520232' limit 1),
    jsonb_build_object(
      'pop_name', 'Ahsoka Tano',
      'character', 'Ahsoka Tano',
      'franchise', 'Star Wars',
      'set_name', 'The Clone Wars',
      'number', '409',
      'pop_type', 'Pop! Star Wars',
      'pop_style', 'Standard',
      'description', 'Ahsoka Tano is a Star Wars: The Clone Wars Pop! release #409.',
      'display_description', 'Ahsoka Tano is a Star Wars: The Clone Wars Pop! release #409.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence Ahsoka set correction.',
    true
  ),
  (
    '889698107662',
    (select id from public.pop_catalog where upc = '889698107662' limit 1),
    jsonb_build_object(
      'pop_name', 'Ahsoka Tano (Holographic)',
      'character', 'Ahsoka Tano',
      'franchise', 'Star Wars',
      'set_name', 'Star Wars Rebels',
      'number', '130',
      'variant', 'Holographic',
      'exclusivity', 'Hot Topic',
      'pop_type', 'Pop! Star Wars',
      'pop_style', 'Standard',
      'description', 'Ahsoka Tano (Holographic) is a Star Wars Rebels Pop! release #130, Hot Topic exclusive.',
      'display_description', 'Ahsoka Tano (Holographic) is a Star Wars Rebels Pop! release #130, Hot Topic exclusive.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence Ahsoka variant correction.',
    true
  ),
  (
    '889698759380',
    (select id from public.pop_catalog where upc = '889698759380' limit 1),
    jsonb_build_object(
      'pop_name', 'Vito Corleone with Towel Silencer',
      'character', 'Vito Corleone',
      'franchise', 'The Godfather',
      'set_name', 'The Godfather Part II',
      'number', '1525',
      'pop_type', 'Pop! Movies',
      'pop_style', 'Standard',
      'description', 'Vito Corleone with Towel Silencer is a The Godfather Part II Pop! Movies release #1525.',
      'display_description', 'Vito Corleone with Towel Silencer is a The Godfather Part II Pop! Movies release #1525.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence franchise/set fill.',
    true
  ),
  (
    '889698768283',
    (select id from public.pop_catalog where upc = '889698768283' limit 1),
    jsonb_build_object(
      'pop_name', 'Bo-Katan Kryze',
      'character', 'Bo-Katan Kryze',
      'franchise', 'Star Wars',
      'set_name', 'The Mandalorian',
      'number', '693',
      'exclusivity', 'Target',
      'pop_type', 'Pop! Star Wars',
      'pop_style', 'Standard',
      'description', 'Bo-Katan Kryze is a Star Wars: The Mandalorian Pop! release #693, Target exclusive.',
      'display_description', 'Bo-Katan Kryze is a Star Wars: The Mandalorian Pop! release #693, Target exclusive.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence Mandalorian set normalization.',
    true
  ),
  (
    '889698430180',
    (select id from public.pop_catalog where upc = '889698430180' limit 1),
    jsonb_build_object(
      'pop_name', 'Yoda',
      'character', 'Yoda',
      'franchise', 'Star Wars',
      'set_name', 'Star Wars',
      'number', '124',
      'variant', 'Metallic Gold',
      'exclusivity', 'Walmart',
      'pop_type', 'Pop! Star Wars',
      'pop_style', 'Standard',
      'description', 'Yoda is a Star Wars Pop! release #124, Walmart exclusive, metallic gold.',
      'display_description', 'Yoda is a Star Wars Pop! release #124, Walmart exclusive, metallic gold.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence Star Wars metallic variant correction.',
    true
  ),
  (
    '889698430197',
    (select id from public.pop_catalog where upc = '889698430197' limit 1),
    jsonb_build_object(
      'pop_name', 'Jango Fett',
      'character', 'Jango Fett',
      'franchise', 'Star Wars',
      'set_name', 'Star Wars: Attack of the Clones',
      'number', '285',
      'variant', 'Metallic Gold',
      'exclusivity', 'Walmart',
      'pop_type', 'Pop! Star Wars',
      'pop_style', 'Standard',
      'description', 'Jango Fett is a Star Wars: Attack of the Clones Pop! release #285, Walmart exclusive, metallic gold.',
      'display_description', 'Jango Fett is a Star Wars: Attack of the Clones Pop! release #285, Walmart exclusive, metallic gold.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence Star Wars metallic variant correction.',
    true
  ),
  (
    '889698407021',
    (select id from public.pop_catalog where upc = '889698407021' limit 1),
    jsonb_build_object(
      'pop_name', 'Sebulba',
      'character', 'Sebulba',
      'franchise', 'Star Wars',
      'set_name', 'Star Wars: Episode I - The Phantom Menace',
      'number', '304',
      'exclusivity', 'Smuggler''s Bounty',
      'pop_type', 'Pop! Star Wars',
      'pop_style', 'Standard',
      'description', 'Sebulba is a Star Wars: Episode I - The Phantom Menace Pop! release #304, Smuggler''s Bounty exclusive.',
      'display_description', 'Sebulba is a Star Wars: Episode I - The Phantom Menace Pop! release #304, Smuggler''s Bounty exclusive.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'High-confidence Phantom Menace set tightening.',
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
  override_data ->> 'exclusivity' as exclusivity,
  override_data ->> 'needs_review' as needs_review,
  is_active,
  notes
from public.catalog_parser_overrides
where upc in (
  '889698520232',
  '889698107662',
  '889698759380',
  '889698768283',
  '889698430180',
  '889698430197',
  '889698407021'
)
order by upc;
