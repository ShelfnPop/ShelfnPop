-- Lucky Cat cleanup, staged 2026-07-10.
-- Purpose:
-- - Fill in the newly added Lucky Cat row with confirmed identity, set, vault, and value.
-- - Keep future Pop Asia rows from falling through franchise inference.

update public.pop_catalog
set
  pop_name = 'Lucky Cat',
  character = 'Lucky Cat',
  franchise = 'Pop Asia',
  set_name = 'Lucky Cat',
  number = '276',
  exclusivity = 'Summer Convention',
  pop_type = 'Pop!',
  pop_style = 'Jumbo',
  vault_status = 'Vaulted',
  estimated_value = 26.24,
  description = 'Lucky Cat is a Pop Asia Pop! release #276, Summer Convention exclusive from MINDstyle, vaulted.',
  display_description = 'Lucky Cat is a Pop Asia Pop! release #276, Summer Convention exclusive from MINDstyle, vaulted.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698833912';

select
  upc,
  pop_name,
  character,
  franchise,
  set_name,
  number,
  exclusivity,
  pop_type,
  pop_style,
  vault_status,
  estimated_value,
  parse_confidence,
  needs_review
from public.pop_catalog
where upc = '889698833912';
