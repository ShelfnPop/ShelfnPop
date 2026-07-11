-- Star Wars leftovers specialty split, applied 2026-07-08.
-- Scope: move the last generic Star Wars rows into specialty buckets.
-- Sources:
--   * Funko Yoda Die-Cast #3: https://funko.com/pop-die-cast-yoda-with-lightsaber/85192.html
--   * PriceCharting Yoda Green Chrome #124: https://www.pricecharting.com/game/funko-pop-star-wars/yoda-green-chrome-124
--   * PriceCharting Darth Vader Diamond Collection #626: https://www.pricecharting.com/game/funko-pop-star-wars/darth-vader-diamond-collection-626
--   * UPC 889698715126 cross-checks as Star Wars Bitty Pop! 4-pack.

update public.pop_catalog
set
  set_name = case
    when upc = '889698851923' then 'Star Wars Die-Cast'
    when upc = '889698715126' then 'Star Wars Bitty Pop!'
    when upc = '889698419048' then 'Star Wars Chrome'
    when upc = '889698716123' then 'Star Wars Diamond Collection'
    else set_name
  end,
  pop_name = case
    when upc = '889698851923' then 'Yoda with Lightsaber'
    when upc = '889698715126' then 'Princess Leia, R2-D2, C-3PO and Mystery Bitty Pop! 4-Pack'
    when upc = '889698419048' then 'Yoda (Green Chrome)'
    when upc = '889698716123' then 'Darth Vader (Diamond Collection)'
    else pop_name
  end,
  character = case
    when upc = '889698715126' then 'Princess Leia, R2-D2, C-3PO'
    else character
  end,
  variant = case
    when upc = '889698419048' then 'Green Chrome'
    when upc = '889698716123' then 'Diamond Collection'
    else variant
  end,
  exclusivity = case
    when upc = '889698419048' then 'Summer Convention'
    when upc = '889698716123' then 'Funko Hollywood'
    else exclusivity
  end,
  pop_type = case
    when upc = '889698851923' then 'Pop! Die-Cast'
    when upc = '889698715126' then 'Bitty Pop!'
    else pop_type
  end,
  pop_style = case
    when upc = '889698851923' then 'Die-Cast'
    when upc = '889698715126' then 'Mini'
    else pop_style
  end,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false
where franchise = 'Star Wars'
  and set_name = 'Star Wars'
  and upc in ('889698851923', '889698715126', '889698419048', '889698716123');
