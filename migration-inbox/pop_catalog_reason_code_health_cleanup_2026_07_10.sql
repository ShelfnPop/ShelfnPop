-- Applied review-health cleanup, 2026-07-10.
-- Removes only resolved missing-field warnings and flags genuinely low-confidence rows.

with repaired as (
  select
    id,
    coalesce(
      array(
        select code
        from unnest(coalesce(parse_reason_codes, '{}'::text[])) as code
        where not (
          (code = 'missing_set' and nullif(btrim(set_name), '') is not null)
          or (code = 'missing_franchise' and nullif(btrim(franchise), '') is not null)
          or (code = 'missing_number' and nullif(btrim(number), '') is not null)
          or (code = 'missing_character' and nullif(btrim(character), '') is not null)
        )
      ),
      '{}'::text[]
    ) as reason_codes,
    parse_confidence < 0.75 as low_confidence
  from public.pop_catalog
)
update public.pop_catalog p
set parse_reason_codes = r.reason_codes,
    needs_review = case when r.low_confidence then true else p.needs_review end
from repaired r
where p.id = r.id
  and (
    p.parse_reason_codes is distinct from r.reason_codes
    or (r.low_confidence and p.needs_review is not true)
  );
