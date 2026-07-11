-- Audit note: Die-Cast style corrections identified during catalog review.
-- Applied directly to production on 2026-07-06.

update public.pop_catalog
set pop_style = 'Die-Cast'
where upc in (
  '889698565592', -- Captain America #1
  '889698743013', -- The Joker #10 / Chase, owned variants include Common and Chase
  '889698851923'  -- Yoda #3
);
