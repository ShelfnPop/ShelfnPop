-- Fourth focused set-name backfill pass for rows still missing set_name.
-- Sources were current catalog text, product descriptions already stored in pop_catalog,
-- and spot checks against Funko/product listings for the exact UPC or box number.

with updates(upc, set_name) as (
  values
    ('889698881210', 'Superman: Ghosts of Krypton'),
    ('889698880954', 'DC Heroes'),
    ('889698808484', 'Deadpool Legacy Collection'),
    ('889698886444', 'Deadpool & Wolverine'),
    ('889698631747', 'Marvel Comics'),
    ('889698637398', 'Hall of Armor'),
    ('889698648059', 'Hall of Armor'),
    ('889698648066', 'Hall of Armor'),
    ('889698627818', 'Hall of Armor'),
    ('889698680455', 'What If...?'),
    ('889698646871', 'Marvel Comics'),
    ('889698680462', 'What If...?'),
    ('889698837897', 'The Infinity Saga'),
    ('889698761093', 'Spider-Man 2'),
    ('849803057398', 'Guardians of the Galaxy'),
    ('889698848497', 'Deadpool & Wolverine'),
    ('889698744768', 'Retro Reimagined'),
    ('889698807708', 'Star Wars: Dark Side'),
    ('889698903264', 'Retro'),
    ('889698743280', 'Star Wars: The Clone Wars'),
    ('889698827713', 'Star Wars: Dark Side'),
    ('889698740869', 'Star Wars: The Clone Wars'),
    ('889698675345', 'New Classics'),
    ('889698201544', 'The Last Jedi'),
    ('889698467681', 'Star Wars: The Empire Strikes Back'),
    ('889698216463', 'Star Wars: The Empire Strikes Back')
)
update public.pop_catalog pc
set set_name = updates.set_name
from updates
where pc.upc = updates.upc
  and nullif(btrim(pc.set_name), '') is null;
