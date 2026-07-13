-- Weekly catalog health check follow-up for 2026-07-13.
-- Project: vwlnlgqxjamkukssuajt
--
-- Purpose:
--   Mark recent catalog rows for review when identity completeness is poor even
--   though parse_confidence remains high. The live audit found 88 candidates.
--
-- Safety:
--   Non-destructive. This only changes needs_review from false/null to true.
--   It does not change catalog identity, value, image, UPC, or delete rows.
--   Review the candidate select before running the update.
--
-- Fixed audit window (database clock):
--   2026-07-06T11:34:01.667411+00:00 through
--   2026-07-13T11:34:01.667411+00:00

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
    ) between '2026-07-06T11:34:01.667411+00:00'::timestamptz
          and '2026-07-13T11:34:01.667411+00:00'::timestamptz
    and coalesce(needs_review, false) = false
    and (
      nullif(btrim(franchise), '') is null
      or nullif(btrim(set_name), '') is null
      or lower(btrim(set_name)) in (
        'funko', 'funko pop', 'funko pop!', 'pop', 'pop!', 'pop vinyl',
        'pop! vinyl', 'pop figure', 'pop figure!', 'pop vinyl figure',
        'pop! figure', 'vinyl', 'vinyl figure', 'vinyl figures',
        'collectible', 'collectibles', 'exclusive', 'special edition',
        'limited edition', 'figure', 'figures', 'toy', 'toys', 'movies',
        'television', 'tv', 'games', 'animation', 'heroes', 'marvel',
        'star wars', 'disney', 'other', 'unknown', 'n/a', 'na', 'none'
      )
    )
)
select
  count(*) as rows_that_would_be_flagged,
  count(*) filter (where nullif(btrim(franchise), '') is null) as missing_franchise,
  count(*) filter (where nullif(btrim(set_name), '') is null) as missing_set_name,
  count(*) filter (
    where lower(btrim(set_name)) in (
      'funko', 'funko pop', 'funko pop!', 'pop', 'pop!', 'pop vinyl',
      'pop! vinyl', 'pop figure', 'pop figure!', 'pop vinyl figure',
      'pop! figure', 'vinyl', 'vinyl figure', 'vinyl figures',
      'collectible', 'collectibles', 'exclusive', 'special edition',
      'limited edition', 'figure', 'figures', 'toy', 'toys', 'movies',
      'television', 'tv', 'games', 'animation', 'heroes', 'marvel',
      'star wars', 'disney', 'other', 'unknown', 'n/a', 'na', 'none'
    )
  ) as generic_or_noisy_set_name
from candidates;

-- Apply only after reviewing the diagnostic count and rows.
update public.pop_catalog pc
set needs_review = true
from (
  select id
  from public.pop_catalog
  where greatest(
      coalesce(created_at, '-infinity'::timestamptz),
      coalesce(api_last_updated, '-infinity'::timestamptz)
    ) between '2026-07-06T11:34:01.667411+00:00'::timestamptz
          and '2026-07-13T11:34:01.667411+00:00'::timestamptz
    and coalesce(needs_review, false) = false
    and (
      nullif(btrim(franchise), '') is null
      or nullif(btrim(set_name), '') is null
      or lower(btrim(set_name)) in (
        'funko', 'funko pop', 'funko pop!', 'pop', 'pop!', 'pop vinyl',
        'pop! vinyl', 'pop figure', 'pop figure!', 'pop vinyl figure',
        'pop! figure', 'vinyl', 'vinyl figure', 'vinyl figures',
        'collectible', 'collectibles', 'exclusive', 'special edition',
        'limited edition', 'figure', 'figures', 'toy', 'toys', 'movies',
        'television', 'tv', 'games', 'animation', 'heroes', 'marvel',
        'star wars', 'disney', 'other', 'unknown', 'n/a', 'na', 'none'
      )
    )
) flagged
where pc.id = flagged.id
returning pc.uuid, pc.upc, pc.raw_title, pc.franchise, pc.set_name,
          pc.parse_confidence, pc.needs_review;

-- Follow-up verification after applying.
with recent as (
  select *
  from public.pop_catalog
  where greatest(
      coalesce(created_at, '-infinity'::timestamptz),
      coalesce(api_last_updated, '-infinity'::timestamptz)
    ) between '2026-07-06T11:34:01.667411+00:00'::timestamptz
          and '2026-07-13T11:34:01.667411+00:00'::timestamptz
)
select
  count(*) as recent_rows,
  count(*) filter (where needs_review is true) as needs_review,
  count(*) filter (
    where coalesce(needs_review, false) = false
      and nullif(btrim(franchise), '') is null
  ) as missing_franchise_still_unflagged,
  count(*) filter (
    where coalesce(needs_review, false) = false
      and nullif(btrim(set_name), '') is null
  ) as missing_set_still_unflagged
from recent;
