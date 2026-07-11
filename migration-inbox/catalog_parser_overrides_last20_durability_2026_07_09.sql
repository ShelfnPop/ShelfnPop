-- Learned parser overrides for recurring last-20 review fixes, staged 2026-07-09.
-- Purpose:
-- - Persist corrected identity/set/exclusivity data in public.catalog_parser_overrides.
-- - Keep intentional review flags on rows where sticker/value nuance still needs human review.
-- - Avoid broad live catalog edits; this file only seeds parser learning rows.

insert into public.catalog_parser_overrides (upc, pop_catalog_id, override_data, notes, is_active)
values
  (
    '889698147644',
    (select id from public.pop_catalog where upc = '889698147644' limit 1),
    jsonb_build_object(
      'pop_name', 'Kylo Ren',
      'character', 'Kylo Ren',
      'franchise', 'Star Wars',
      'set_name', 'Star Wars: The Last Jedi',
      'number', '203',
      'exclusivity', 'Toys R Us',
      'pop_type', 'Pop! Star Wars',
      'pop_style', 'Standard',
      'description', 'Kylo Ren is a Star Wars: The Last Jedi Pop! release #203, Toys R Us exclusive.',
      'display_description', 'Kylo Ren is a Star Wars: The Last Jedi Pop! release #203, Toys R Us exclusive.',
      'parse_confidence', 0.98,
      'needs_review', true
    ),
    'Identity is stable; keep review on for vault/value follow-up.',
    true
  ),
  (
    '830395034003',
    (select id from public.pop_catalog where upc = '830395034003' limit 1),
    jsonb_build_object(
      'pop_name', 'Marty McFly',
      'character', 'Marty McFly',
      'franchise', 'Back to the Future',
      'set_name', 'Back to the Future',
      'number', '49',
      'exclusivity', 'Plastic Empire',
      'pop_type', 'Pop! Movies',
      'pop_style', 'Standard',
      'limited_edition', true,
      'limited_count', 3000,
      'description', 'Marty McFly is a Back to the Future Pop! Movies release #49, Plastic Empire exclusive limited to 3,000 pieces.',
      'display_description', 'Marty McFly is a Back to the Future Pop! Movies release #49, Plastic Empire exclusive limited to 3,000 pieces.',
      'parse_confidence', 0.98,
      'needs_review', true
    ),
    'Identity is stable; keep review on for high-variant/value sensitivity.',
    true
  ),
  (
    '830395033990',
    (select id from public.pop_catalog where upc = '830395033990' limit 1),
    jsonb_build_object(
      'pop_name', 'Dr. Emmett Brown',
      'character', 'Dr. Emmett Brown',
      'franchise', 'Back to the Future',
      'set_name', 'Back to the Future',
      'number', '50',
      'variant', 'Glow in the Dark',
      'exclusivity', 'Convention',
      'pop_type', 'Pop! Movies',
      'pop_style', 'Standard',
      'description', 'Dr. Emmett Brown (Glow in the Dark) is a Back to the Future Pop! Movies release #50, Convention exclusive.',
      'display_description', 'Dr. Emmett Brown (Glow in the Dark) is a Back to the Future Pop! Movies release #50, Convention exclusive.',
      'parse_confidence', 0.98,
      'needs_review', true
    ),
    'Identity is stable; keep review on for convention/glow variant confirmation.',
    true
  ),
  (
    '889698816663',
    (select id from public.pop_catalog where upc = '889698816663' limit 1),
    jsonb_build_object(
      'pop_name', 'Grand Admiral Thrawn (Diamond Glitter)',
      'character', 'Grand Admiral Thrawn',
      'franchise', 'Star Wars',
      'set_name', 'Ahsoka',
      'number', '697',
      'variant', 'Diamond Glitter',
      'exclusivity', 'San Diego Comic-Con',
      'pop_type', 'Pop! Star Wars',
      'pop_style', 'Standard',
      'limited_edition', true,
      'limited_count', 3000,
      'description', 'Grand Admiral Thrawn (Diamond Glitter) is a Star Wars: Ahsoka Pop! release #697, San Diego Comic-Con exclusive limited to 3,000 pieces.',
      'display_description', 'Grand Admiral Thrawn (Diamond Glitter) is a Star Wars: Ahsoka Pop! release #697, San Diego Comic-Con exclusive limited to 3,000 pieces.',
      'parse_confidence', 0.98,
      'needs_review', true
    ),
    'Identity is stable; keep review on for sticker/value confirmation.',
    true
  ),
  (
    '889698717366',
    (select id from public.pop_catalog where upc = '889698717366' limit 1),
    jsonb_build_object(
      'pop_name', 'Hatching Raptor',
      'character', 'Hatching Raptor',
      'franchise', 'Jurassic Park',
      'set_name', 'Jurassic Park',
      'number', '1442',
      'exclusivity', 'Summer Convention / Target',
      'pop_type', 'Pop! Movies',
      'pop_style', 'Standard',
      'description', 'Hatching Raptor is a Jurassic Park Pop! Movies release #1442, 2023 Summer Convention exclusive shared with Target.',
      'display_description', 'Hatching Raptor is a Jurassic Park Pop! Movies release #1442, 2023 Summer Convention exclusive shared with Target.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'False-positive DC inference fix.',
    true
  ),
  (
    '889698871877',
    (select id from public.pop_catalog where upc = '889698871877' limit 1),
    jsonb_build_object(
      'pop_name', 'Bullseye as Superman',
      'character', 'Bullseye',
      'franchise', 'Target',
      'set_name', 'Ad Icons',
      'number', '249',
      'exclusivity', 'Target',
      'pop_type', 'Pop! Ad Icons',
      'pop_style', 'Standard',
      'vault_status', 'Vaulted',
      'description', 'Bullseye as Superman is a Target Ad Icons Pop! Icons release #249, Target exclusive.',
      'display_description', 'Bullseye as Superman is a Target Ad Icons Pop! Icons release #249, Target exclusive.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'False-positive DC inference fix.',
    true
  ),
  (
    '889698496858',
    (select id from public.pop_catalog where upc = '889698496858' limit 1),
    jsonb_build_object(
      'pop_name', 'Doc & Einstein',
      'character', 'Doc Brown & Einstein',
      'franchise', 'Back to the Future',
      'set_name', 'Back to the Future',
      'number', '972',
      'exclusivity', 'Walmart',
      'pop_type', 'Pop! Movies',
      'pop_style', 'Standard',
      'description', 'Doc & Einstein is a Back to the Future Pop! Movies release #972, Walmart exclusive.',
      'display_description', 'Doc & Einstein is a Back to the Future Pop! Movies release #972, Walmart exclusive.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'Back to the Future identity normalization.',
    true
  ),
  (
    '889698567718',
    (select id from public.pop_catalog where upc = '889698567718' limit 1),
    jsonb_build_object(
      'pop_name', 'Andy with Leg Casts',
      'character', 'Andy Dwyer',
      'franchise', 'Parks and Recreation',
      'set_name', 'Parks and Recreation',
      'number', '1155',
      'exclusivity', 'Calendar Club',
      'pop_type', 'Pop! Television',
      'pop_style', 'Standard',
      'description', 'Andy with Leg Casts is a Parks and Recreation Pop! Television release #1155, Calendar Club exclusive.',
      'display_description', 'Andy with Leg Casts is a Parks and Recreation Pop! Television release #1155, Calendar Club exclusive.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'Character and set-name normalization.',
    true
  ),
  (
    '889698147989',
    (select id from public.pop_catalog where upc = '889698147989' limit 1),
    jsonb_build_object(
      'pop_name', 'Young Anakin Skywalker (Podracer)',
      'character', 'Anakin Skywalker',
      'franchise', 'Star Wars',
      'set_name', 'Star Wars: Episode I - The Phantom Menace',
      'number', '231',
      'exclusivity', 'Walgreens',
      'pop_type', 'Pop! Star Wars',
      'pop_style', 'Standard',
      'description', 'Young Anakin Skywalker (Podracer) is a Star Wars Pop! release #231, Walgreens exclusive.',
      'display_description', 'Young Anakin Skywalker (Podracer) is a Star Wars Pop! release #231, Walgreens exclusive.',
      'parse_confidence', 0.98,
      'needs_review', false
    ),
    'Barcode-specific identity correction.',
    true
  ),
  (
    '889698675376',
    (select id from public.pop_catalog where upc = '889698675376' limit 1),
    jsonb_build_object(
      'pop_name', 'Stormtrooper',
      'character', 'Stormtrooper',
      'franchise', 'Star Wars',
      'set_name', 'Star Wars: Episode IV - A New Hope',
      'number', '598',
      'pop_type', 'Pop! Star Wars',
      'pop_style', 'Standard',
      'description', 'Stormtrooper is a Star Wars: Episode IV - A New Hope Pop! release #598 from the Star Wars New Classics line.',
      'display_description', 'Stormtrooper is a Star Wars: Episode IV - A New Hope Pop! release #598 from the Star Wars New Classics line.',
      'parse_confidence', 0.98,
      'needs_review', true
    ),
    'Identity is stable; keep review on for value/variant follow-up.',
    true
  ),
  (
    '889698495776',
    (select id from public.pop_catalog where upc = '889698495776' limit 1),
    jsonb_build_object(
      'pop_name', 'The Joker (Batman 1989)',
      'character', 'The Joker',
      'franchise', 'DC',
      'set_name', 'Batman 1989',
      'number', '337',
      'variant', 'Metallic',
      'exclusivity', 'Exclusive',
      'pop_type', 'Pop! Heroes',
      'pop_style', 'Standard',
      'description', 'The Joker (Batman 1989) is a Pop! Heroes release #337, metallic exclusive.',
      'display_description', 'The Joker (Batman 1989) is a Pop! Heroes release #337, metallic exclusive.',
      'parse_confidence', 0.98,
      'needs_review', true
    ),
    'Identity is stable; keep review on for exclusivity/value cleanup.',
    true
  ),
  (
    '889698372480',
    (select id from public.pop_catalog where upc = '889698372480' limit 1),
    jsonb_build_object(
      'pop_name', 'Batman (1989)',
      'character', 'Batman',
      'franchise', 'DC',
      'set_name', 'Batman 1989',
      'number', '275',
      'exclusivity', 'Target',
      'pop_type', 'Pop! Heroes',
      'pop_style', 'Standard',
      'description', 'Batman (1989) is a Batman: 80th Anniversary Pop! Heroes release #275, Target exclusive.',
      'display_description', 'Batman (1989) is a Batman: 80th Anniversary Pop! Heroes release #275, Target exclusive.',
      'parse_confidence', 0.98,
      'needs_review', true
    ),
    'Identity is stable; keep review on until Batman line cleanup is fully reconciled.',
    true
  )
on conflict (upc) do update
set
  pop_catalog_id = excluded.pop_catalog_id,
  override_data = excluded.override_data,
  notes = excluded.notes,
  is_active = excluded.is_active;

-- Verification: confirm the learned rows exist and preserve the intended review posture.
select
  upc,
  pop_catalog_id,
  override_data ->> 'franchise' as franchise,
  override_data ->> 'set_name' as set_name,
  override_data ->> 'number' as number,
  override_data ->> 'exclusivity' as exclusivity,
  override_data ->> 'pop_type' as pop_type,
  override_data ->> 'needs_review' as needs_review,
  is_active,
  notes
from public.catalog_parser_overrides
where upc in (
  '889698147644',
  '830395034003',
  '830395033990',
  '889698816663',
  '889698717366',
  '889698871877',
  '889698496858',
  '889698567718',
  '889698147989',
  '889698675376',
  '889698495776',
  '889698372480'
)
order by upc;
