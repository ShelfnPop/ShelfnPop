-- Fill the 2026-07-11 Disney/Pixar missing-value batch with stable retail/MSRP fallback values.
-- Official Funko pages were available for the rows below. Funko pages show list price
-- $14.99 for these standard Pop! releases; store as 15 until market pricing appears.
--
-- Sources:
--   https://funko.com/pop-winnie-the-pooh-holding-honeypot/80236.html
--   https://funko.com/pop-piglet-with-pinwheel/80238.html
--   https://funko.com/pop-rabbit-with-basket/80239.html
--   https://funko.com/pop-roo-bouncing/80240.html
--   https://funko.com/pop-tigger-bouncing/80241.html
--   https://funko.com/pop-pooh-with-gift/82876.html
--   https://funko.com/pop-russell-with-sash/79158.html
--   https://funko.com/pop-russell-with-chocolate-bar/80837.html
--   https://funko.com/pop-young-carl/80838.html

with fixes(upc, pop_name, character, set_name, number, exclusivity, estimated_value, source_url) as (
  values
    ('889698802369', 'Winnie the Pooh Holding Honeypot', 'Winnie the Pooh Holding Honeypot', 'Winnie the Pooh', '1512', null, 15::numeric, 'https://funko.com/pop-winnie-the-pooh-holding-honeypot/80236.html'),
    ('889698802383', 'Piglet with Pinwheel', 'Piglet with Pinwheel', 'Winnie the Pooh', '1514', null, 15::numeric, 'https://funko.com/pop-piglet-with-pinwheel/80238.html'),
    ('889698802390', 'Rabbit with Basket', 'Rabbit with Basket', 'Winnie the Pooh', '1515', null, 15::numeric, 'https://funko.com/pop-rabbit-with-basket/80239.html'),
    ('889698802406', 'Roo (Bouncing)', 'Roo (Bouncing)', 'Winnie the Pooh', '1516', null, 15::numeric, 'https://funko.com/pop-roo-bouncing/80240.html'),
    ('889698802413', 'Tigger (Bouncing)', 'Tigger (Bouncing)', 'Winnie the Pooh', '1517', null, 15::numeric, 'https://funko.com/pop-tigger-bouncing/80241.html'),
    ('889698828765', 'Pooh with Gift', 'Pooh with Gift', 'Winnie the Pooh', '1529', 'Funko Shop', 15::numeric, 'https://funko.com/pop-pooh-with-gift/82876.html'),
    ('889698791588', 'Russell with Sash', 'Russell with Sash', 'Pixar Up', '1472', 'BoxLunch', 15::numeric, 'https://funko.com/pop-russell-with-sash/79158.html'),
    ('889698808378', 'Russell with Chocolate Bar', 'Russell with Chocolate Bar', 'Pixar Up', '1479', null, 15::numeric, 'https://funko.com/pop-russell-with-chocolate-bar/80837.html'),
    ('889698808385', 'Young Carl', 'Young Carl', 'Pixar Up', '1480', null, 15::numeric, 'https://funko.com/pop-young-carl/80838.html')
)
update pop_catalog pc
set
  pop_name = fixes.pop_name,
  character = fixes.character,
  set_name = fixes.set_name,
  number = fixes.number,
  exclusivity = fixes.exclusivity,
  estimated_value = fixes.estimated_value,
  api_source = concat_ws('+', nullif(pc.api_source, ''), 'retail_fallback:funko_msrp'),
  api_last_updated = now(),
  parse_reason_codes = array[]::text[],
  needs_review = false,
  raw_api_json = jsonb_set(
    coalesce(pc.raw_api_json, '{}'::jsonb),
    '{retail_fallback}',
    jsonb_build_object(
      'source', 'funko',
      'price_field', 'list_price',
      'value', fixes.estimated_value,
      'source_url', fixes.source_url,
      'checked_at', now()
    ),
    true
  )
from fixes
where pc.upc = fixes.upc;

select
  upc,
  pop_name,
  franchise,
  set_name,
  number,
  exclusivity,
  estimated_value,
  api_source,
  needs_review,
  parse_reason_codes
from pop_catalog
where upc in (
  '889698802369',
  '889698802383',
  '889698802390',
  '889698802406',
  '889698802413',
  '889698828765',
  '889698791588',
  '889698808378',
  '889698808385'
)
order by set_name, number;
