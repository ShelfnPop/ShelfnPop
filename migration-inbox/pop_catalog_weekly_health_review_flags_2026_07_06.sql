-- Weekly catalog health check follow-up for 2026-07-06.
-- Project: vwlnlgqxjamkukssuajt
--
-- Purpose:
--   Mark recent catalog rows for review when the parser/catalog health check found
--   missing core fields, low parse confidence, or generic set labels.
--
-- Safety:
--   Non-destructive. This only changes needs_review from false/null to true.
--   It does not change title, franchise, set_name, value, image, UPC, or delete rows.
--
-- Review window captured during automation run:
--   2026-06-29T22:37:16.067171+00:00 through 2026-07-06T22:37:16.067171+00:00

with candidates as (
  select
    id,
    uuid,
    upc,
    raw_title,
    clean_title,
    franchise,
    set_name,
    pop_type,
    pop_style,
    number,
    estimated_value,
    image_url,
    parse_confidence,
    needs_review,
    greatest(
      coalesce(created_at, '-infinity'::timestamptz),
      coalesce(api_last_updated, '-infinity'::timestamptz)
    ) as activity_at
  from public.pop_catalog
  where greatest(
      coalesce(created_at, '-infinity'::timestamptz),
      coalesce(api_last_updated, '-infinity'::timestamptz)
    ) >= '2026-06-29T22:37:16.067171+00:00'::timestamptz
    and greatest(
      coalesce(created_at, '-infinity'::timestamptz),
      coalesce(api_last_updated, '-infinity'::timestamptz)
    ) <= '2026-07-06T22:37:16.067171+00:00'::timestamptz
    and coalesce(needs_review, false) = false
    and (
      parse_confidence is null
      or parse_confidence < 0.75
      or nullif(btrim(franchise), '') is null
      or nullif(btrim(set_name), '') is null
      or nullif(btrim(pop_type), '') is null
      or nullif(btrim(pop_style), '') is null
      or nullif(btrim(image_url), '') is null
      or estimated_value is null
      or lower(btrim(set_name)) in (
        'funko',
        'funko pop',
        'funko pop!',
        'pop',
        'pop!',
        'pop vinyl',
        'pop! vinyl',
        'vinyl',
        'vinyl figure',
        'vinyl figures',
        'collectible',
        'collectibles',
        'exclusive',
        'special edition',
        'limited edition',
        'figure',
        'figures',
        'toy',
        'toys',
        'movies',
        'television',
        'tv',
        'games',
        'animation',
        'heroes',
        'marvel',
        'star wars',
        'disney',
        'other',
        'unknown',
        'n/a',
        'na',
        'none'
      )
    )
)
select
  count(*) as rows_that_would_be_flagged,
  count(*) filter (where parse_confidence is null or parse_confidence < 0.75) as low_parse_confidence,
  count(*) filter (where nullif(btrim(set_name), '') is null) as missing_set_name,
  count(*) filter (where nullif(btrim(image_url), '') is null) as missing_image_url,
  count(*) filter (where estimated_value is null) as missing_estimated_value,
  count(*) filter (where lower(btrim(set_name)) in ('marvel', 'star wars', 'disney', 'n/a')) as generic_set_label
from candidates;

update public.pop_catalog pc
set needs_review = true
from (
  select id
  from public.pop_catalog
  where greatest(
      coalesce(created_at, '-infinity'::timestamptz),
      coalesce(api_last_updated, '-infinity'::timestamptz)
    ) >= '2026-06-29T22:37:16.067171+00:00'::timestamptz
    and greatest(
      coalesce(created_at, '-infinity'::timestamptz),
      coalesce(api_last_updated, '-infinity'::timestamptz)
    ) <= '2026-07-06T22:37:16.067171+00:00'::timestamptz
    and coalesce(needs_review, false) = false
    and (
      parse_confidence is null
      or parse_confidence < 0.75
      or nullif(btrim(franchise), '') is null
      or nullif(btrim(set_name), '') is null
      or nullif(btrim(pop_type), '') is null
      or nullif(btrim(pop_style), '') is null
      or nullif(btrim(image_url), '') is null
      or estimated_value is null
      or lower(btrim(set_name)) in (
        'funko',
        'funko pop',
        'funko pop!',
        'pop',
        'pop!',
        'pop vinyl',
        'pop! vinyl',
        'vinyl',
        'vinyl figure',
        'vinyl figures',
        'collectible',
        'collectibles',
        'exclusive',
        'special edition',
        'limited edition',
        'figure',
        'figures',
        'toy',
        'toys',
        'movies',
        'television',
        'tv',
        'games',
        'animation',
        'heroes',
        'marvel',
        'star wars',
        'disney',
        'other',
        'unknown',
        'n/a',
        'na',
        'none'
      )
    )
) flagged
where pc.id = flagged.id
returning pc.uuid, pc.upc, pc.raw_title, pc.franchise, pc.set_name, pc.parse_confidence, pc.needs_review;

-- Follow-up verification after applying:
with recent as (
  select *
  from public.pop_catalog
  where greatest(
      coalesce(created_at, '-infinity'::timestamptz),
      coalesce(api_last_updated, '-infinity'::timestamptz)
    ) >= '2026-06-29T22:37:16.067171+00:00'::timestamptz
    and greatest(
      coalesce(created_at, '-infinity'::timestamptz),
      coalesce(api_last_updated, '-infinity'::timestamptz)
    ) <= '2026-07-06T22:37:16.067171+00:00'::timestamptz
)
select
  count(*) as recent_rows,
  count(*) filter (where needs_review is true) as needs_review,
  count(*) filter (where coalesce(needs_review, false) = false and (parse_confidence is null or parse_confidence < 0.75)) as low_confidence_still_unflagged,
  count(*) filter (where coalesce(needs_review, false) = false and nullif(btrim(set_name), '') is null) as missing_set_still_unflagged,
  count(*) filter (where coalesce(needs_review, false) = false and nullif(btrim(image_url), '') is null) as missing_image_still_unflagged,
  count(*) filter (where coalesce(needs_review, false) = false and estimated_value is null) as missing_value_still_unflagged
from recent;
