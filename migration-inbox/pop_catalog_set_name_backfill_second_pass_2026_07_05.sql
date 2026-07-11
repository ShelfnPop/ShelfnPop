-- Shelf-n-Pop catalog set_name backfill - second conservative pass.
-- Applied to live Supabase on 2026-07-05.
-- Scope: title-exact rows and tight number/name clusters reviewed after first pass.

with proposed(upc, suggested_set) as (
  values
    ('849803064778', 'Back to the Future'),
    ('889698862950', 'Ben 10'),
    ('889698800808', 'Futurama'),
    ('889698123785', 'Game of Thrones'),
    ('889698346160', 'Game of Thrones'),
    ('889698529525', 'The Simpsons'),
    ('889698529587', 'The Simpsons'),
    ('889698459228', 'The Simpsons'),
    ('889698529631', 'The Simpsons'),
    ('889698529617', 'The Simpsons'),
    ('889698546119', 'WWE'),
    ('889698919913', 'Peacemaker S3'),
    ('889698702607', 'Peacemaker'),
    ('889698838351', 'Britney Spears'),
    ('889698838344', 'Britney Spears'),
    ('889698678704', 'Spellbound'),
    ('889698781831', 'Sleeping Beauty 65th Anniversary'),
    ('889698650090', 'Doctor Strange in the Multiverse of Madness'),
    ('889698648653', 'Doctor Strange in the Multiverse of Madness'),
    ('889698624213', 'Thor: Love and Thunder'),
    ('889698624220', 'Thor: Love and Thunder'),
    ('889698624237', 'Thor: Love and Thunder'),
    ('889698624244', 'Thor: Love and Thunder'),
    ('889698624251', 'Thor: Love and Thunder'),
    ('889698624268', 'Thor: Love and Thunder'),
    ('889698650120', 'Thor: Love and Thunder'),
    ('889698642057', 'Thor: Love and Thunder'),
    ('889698642576', 'Moon Knight'),
    ('889698642583', 'Moon Knight'),
    ('889698649902', 'Moon Knight'),
    ('889698653329', 'Moon Knight'),
    ('889698639422', 'Black Panther: Wakanda Forever'),
    ('889698767316', 'Skeleton Crew'),
    ('889698767330', 'Skeleton Crew'),
    ('889698800044', 'Mandalorian S3')
)
update public.pop_catalog pc
set
  set_name = proposed.suggested_set,
  needs_review = false,
  api_last_updated = now()
from proposed
where pc.upc = proposed.upc
  and nullif(btrim(pc.set_name), '') is null;
