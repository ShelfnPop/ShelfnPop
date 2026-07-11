-- Star Wars generic-set drift fix, staged 2026-07-10.
-- Scope:
-- - Repair live pop_catalog rows that drifted back to generic `Star Wars`
--   even though reviewed parser overrides already point them to specific movie sets.
-- - Limit this batch to rows with strong override-backed set placement already in
--   public.catalog_parser_overrides.

update public.pop_catalog
set
  set_name = 'Star Wars: The Phantom Menace',
  needs_review = false,
  api_last_updated = now(),
  description = 'Darth Maul (Gold Metallic) is a Star Wars: The Phantom Menace Pop! release #9, Walmart exclusive.',
  display_description = 'Darth Maul (Gold Metallic) is a Star Wars: The Phantom Menace Pop! release #9, Walmart exclusive.'
where upc = '889698430203';

update public.pop_catalog
set
  set_name = 'Star Wars: Attack of the Clones',
  exclusivity = 'Galactic Convention',
  needs_review = false,
  api_last_updated = now(),
  description = 'Blue Senate Guard is a Star Wars: Attack of the Clones Pop! release #98, Galactic Convention exclusive.',
  display_description = 'Blue Senate Guard is a Star Wars: Attack of the Clones Pop! release #98, Galactic Convention exclusive.'
where upc = '849803087159';

update public.pop_catalog
set
  set_name = 'Star Wars: The Empire Strikes Back',
  needs_review = false,
  api_last_updated = now(),
  description = 'Yoda is a Star Wars: The Empire Strikes Back Pop! release #124, Walmart exclusive, metallic gold.',
  display_description = 'Yoda is a Star Wars: The Empire Strikes Back Pop! release #124, Walmart exclusive, metallic gold.'
where upc = '889698430180';

select upc, pop_name, set_name, number, variant, exclusivity, estimated_value, needs_review
from public.pop_catalog
where upc in ('889698430203','849803087159','889698430180')
order by estimated_value desc;
