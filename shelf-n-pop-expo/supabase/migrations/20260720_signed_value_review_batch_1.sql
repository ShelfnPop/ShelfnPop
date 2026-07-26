update public.user_collection_items
set
  signed_estimated_value_low = reviewed.low_value,
  signed_estimated_value_median = reviewed.median_value,
  signed_estimated_value_high = reviewed.high_value,
  signed_value_confidence = reviewed.confidence,
  signed_value_source = 'reviewed_market_2026_07_20',
  signed_value_last_checked = now(),
  signed_by = reviewed.signed_by
from (
  values
    ('7846d653-8594-4b01-88d7-c9976fe0ea52'::uuid, 450::numeric, 650::numeric, 1000::numeric, 'medium', 'Christian Bale'),
    ('46bf1ab3-4f07-46fa-be92-d56347c3c267'::uuid, 225::numeric, 400::numeric, 650::numeric, 'low', 'Britney Spears'),
    ('38e8bd0e-cbca-4351-925e-eb02c8ab8e8c'::uuid, 80::numeric, 120::numeric, 250::numeric, 'low', 'Gaten Matarazzo'),
    ('623d9aeb-dcf5-459b-bae4-9e0816e2a255'::uuid, 45::numeric, 80::numeric, 120::numeric, 'low', 'Christine Elise'),
    ('287c6053-807c-48ad-b4cf-fb10be12ae20'::uuid, 130::numeric, 165::numeric, 220::numeric, 'high', 'Josh Gad'),
    ('4f81eeb1-cff7-4006-85eb-972b95d8e5f9'::uuid, 110::numeric, 150::numeric, 230::numeric, 'medium', 'Billy West'),
    ('611ecb43-5198-4719-afeb-aa6ca425eec0'::uuid, 180::numeric, 275::numeric, 375::numeric, 'high', 'Josh Brolin')
) as reviewed(id, low_value, median_value, high_value, confidence, signed_by)
where user_collection_items.id = reviewed.id
  and coalesce(user_collection_items.signed, false);
