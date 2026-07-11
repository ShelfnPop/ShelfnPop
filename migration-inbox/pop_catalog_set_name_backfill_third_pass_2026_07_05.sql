-- Shelf-n-Pop catalog set_name backfill - third conservative pass.
-- Applied to live Supabase on 2026-07-05.
-- Scope: UPC-specific exact-title mappings and strong line mappings after review.

with proposed(upc, suggested_franchise, suggested_set) as (
  values
    ('889698323192', 'Beetlejuice', 'Beetlejuice'),
    ('889698879439', 'Tank Girl', 'Tank Girl'),
    ('889698497930', 'Disney', 'Disney Halloween'),
    ('830395023502', 'Disney', 'Disney Villains'),
    ('889698364294', 'Zoolander', 'Zoolander'),
    ('889698291989', 'Disney', 'Incredibles 2'),
    ('889698428736', 'NFL', 'NFL'),
    ('889698574075', 'NFL', 'NFL'),
    ('889698786713', 'DC', 'The Batman Who Laughs'),
    ('889698871884', 'DC', 'Superman'),
    ('830395022482', 'DC', 'DC Super Heroes'),
    ('830395035215', 'DC', 'DC Universe'),
    ('889698858540', 'DC', 'DC Super Heroes'),
    ('889698579261', 'Marvel', 'Avengers'),
    ('8969814808', 'Marvel', 'Venom'),
    ('889698407168', 'Marvel', 'Marvel 80th Anniversary'),
    ('889698837248', 'Marvel', 'Gwen-Verse'),
    ('889698837262', 'Marvel', 'Gwen-Verse'),
    ('889698837279', 'Marvel', 'Gwen-Verse'),
    ('889698837927', 'Marvel', 'Iron Man 2'),
    ('889698881326', 'Marvel', 'Marvel Comics'),
    ('889698594950', 'Marvel', 'Ms. Marvel'),
    ('8969884452', 'Marvel', 'Venom'),
    ('889698441551', 'Marvel', 'Marvel 80th Anniversary'),
    ('889698841153', 'Marvel', 'X-Men'),
    ('889698879507', 'Marvel', 'X-Men')
)
update public.pop_catalog pc
set
  franchise = coalesce(nullif(btrim(pc.franchise), ''), proposed.suggested_franchise),
  set_name = proposed.suggested_set,
  needs_review = false,
  api_last_updated = now()
from proposed
where pc.upc = proposed.upc
  and nullif(btrim(pc.set_name), '') is null;
