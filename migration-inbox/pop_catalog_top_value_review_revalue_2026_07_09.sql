-- Top-value catalog review/revalue follow-up, staged 2026-07-09.
-- Scope:
-- - Mark the risky top-value rows for manual review.
-- - Align stored identity/value fields to the reviewed variant context where current
--   PriceCharting evidence is strong enough.
--
-- Sources:
-- - Chewbacca #6 PriceCharting: https://www.pricecharting.com/game/funko-pop-star-wars/chewbacca-6
-- - Dr. Emmett Brown [GITD] #50 PriceCharting: https://www.pricecharting.com/game/funko-pop-movies/dr-emmett-brown-gitd-50
-- - Marty McFly [Green GITD] #49 PriceCharting: https://www.pricecharting.com/game/funko-pop-movies/marty-mcfly-green-gitd-49
-- - The Joker 2 Pack [GITD] PriceCharting: https://www.pricecharting.com/game/funko-pop-heroes/the-joker-2-pack-gitd

update public.pop_catalog
set
  set_name = 'Star Wars: The Empire Strikes Back',
  number = '06',
  variant = null,
  exclusivity = null,
  estimated_value = 22.49,
  needs_review = true,
  api_last_updated = now(),
  description = 'Chewbacca belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #06.',
  display_description = 'Chewbacca belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #06.'
where upc = '830395023243';

update public.pop_catalog
set
  variant = 'Glow in the Dark',
  exclusivity = 'Convention',
  estimated_value = 769.94,
  needs_review = true,
  api_last_updated = now(),
  description = 'Dr. Emmett Brown (Glow in the Dark) is a Back to the Future Pop! Movies release #50, Convention exclusive.',
  display_description = 'Dr. Emmett Brown (Glow in the Dark) is a Back to the Future Pop! Movies release #50, Convention exclusive.'
where upc = '830395033990';

update public.pop_catalog
set
  variant = 'Green Glow in the Dark',
  exclusivity = 'Plastic Empire',
  limited_edition = true,
  limited_count = 3000,
  estimated_value = 408.53,
  needs_review = true,
  api_last_updated = now(),
  description = 'Marty McFly (Green Glow in the Dark) is a Back to the Future Pop! Movies release #49, Plastic Empire exclusive limited to 3,000 pieces.',
  display_description = 'Marty McFly (Green Glow in the Dark) is a Back to the Future Pop! Movies release #49, Plastic Empire exclusive limited to 3,000 pieces.'
where upc = '830395034003';

update public.pop_catalog
set
  number = null,
  variant = 'Glow in the Dark',
  exclusivity = 'Gemini Collectibles',
  limited_edition = true,
  limited_count = 480,
  estimated_value = 928.38,
  needs_review = true,
  api_last_updated = now(),
  description = 'The Joker / Bank Robber Joker is a The Dark Knight Trilogy Pop! Heroes 2-Pack, Glow in the Dark Gemini Collectibles exclusive limited to 480 pieces.',
  display_description = 'The Joker / Bank Robber Joker is a The Dark Knight Trilogy Pop! Heroes 2-Pack, Glow in the Dark Gemini Collectibles exclusive limited to 480 pieces.'
where upc = '849803038991';

select upc, pop_name, set_name, number, variant, exclusivity, limited_count, estimated_value, needs_review
from public.pop_catalog
where upc in ('830395023243','830395033990','830395034003','849803038991')
order by estimated_value desc;
