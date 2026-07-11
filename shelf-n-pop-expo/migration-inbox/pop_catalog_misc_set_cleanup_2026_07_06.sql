-- Misc set cleanup pass, 2026-07-06.
-- Fix one-off set names surfaced from shelf stats.

with changes(upc, pop_name, character, franchise, set_name, pop_type, pop_style, variant, exclusivity, description) as (
  values
    (
      '889698919913',
      'Peacemaker Doppelganger',
      'Peacemaker Doppelganger',
      'Peacemaker',
      'Peacemaker',
      'Pop! Television',
      'Ride',
      null,
      null,
      'Peacemaker Doppelganger is a Peacemaker Pop! Television Ride release.'
    ),
    (
      '889698798129',
      'Britney Spears (Lucky)',
      'Britney Spears',
      'Pop! Rocks',
      'Britney Spears',
      'Pop! Rocks',
      'Standard',
      null,
      null,
      'Britney Spears (Lucky) is a Britney Spears Pop! Rocks release #460.'
    ),
    (
      '889698570886',
      'Iron Man',
      'Iron Man',
      'Marvel',
      'Avengers',
      'Pop! Marvel',
      'Die-Cast',
      null,
      'Funko Shop',
      'Iron Man is an Avengers Pop! Marvel Die-Cast release #2, Funko Shop exclusive.'
    )
)
update public.pop_catalog as p
set
  pop_name = c.pop_name,
  character = c.character,
  franchise = c.franchise,
  set_name = c.set_name,
  pop_type = c.pop_type,
  pop_style = c.pop_style,
  variant = c.variant,
  exclusivity = c.exclusivity,
  description = c.description,
  display_description = c.description,
  parse_confidence = greatest(coalesce(p.parse_confidence, 0), 0.94),
  needs_review = false
from changes c
where p.upc = c.upc;
