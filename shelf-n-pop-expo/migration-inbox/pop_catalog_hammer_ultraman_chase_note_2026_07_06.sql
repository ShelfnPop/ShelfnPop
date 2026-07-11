-- Hammer of Boravia / DC's Ultraman chase note, 2026-07-06.
-- The UPC 889698866439 can represent both the common Hammer of Boravia and
-- the Chase identity DC's Ultraman. Keep the catalog UPC row as the common
-- item, and let the owned shelf variant drive the display name for Chase.

update public.pop_catalog
set
  pop_name = 'Hammer of Boravia',
  character = 'Hammer of Boravia',
  franchise = 'DC',
  set_name = 'Superman (2025)',
  pop_type = 'Pop! Movies',
  pop_style = 'Standard',
  number = '583',
  variant = null,
  description = 'Hammer of Boravia is a DC Pop! Movies release #583 from Superman (2025). The Chase owned variant displays as DC''s Ultraman.',
  display_description = 'Hammer of Boravia is a DC Pop! Movies release #583 from Superman (2025). The Chase owned variant displays as DC''s Ultraman.',
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.96),
  needs_review = false
where upc = '889698866439';
