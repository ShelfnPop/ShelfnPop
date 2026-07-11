-- Mandalorian cleanup pass, 2026-07-06.
-- Keep the broad The Mandalorian set for earlier waves, move clear Season 3 rows
-- into a readable Season 3 bucket, and fix a few truncated display names.

with changes(upc, pop_name, character, set_name, description) as (
  values
    ('889698800044', 'Din Grogu with Armour', 'Din Grogu with Armour', 'The Mandalorian Season 3', 'Din Grogu with Armour is a Star Wars Pop! Star Wars release #712 from The Mandalorian Season 3.'),
    ('889698800051', 'Moff Gideon with Armor', 'Moff Gideon with Armor', 'The Mandalorian Season 3', 'Moff Gideon with Armor is a Star Wars Pop! Star Wars release #713 from The Mandalorian Season 3.'),
    ('889698800037', 'Bo-Katan Kryze', 'Bo-Katan Kryze', 'The Mandalorian Season 3', 'Bo-Katan Kryze is a Star Wars Pop! Star Wars release #714 from The Mandalorian Season 3.'),
    ('889698821124', 'The Armorer', 'The Armorer', 'The Mandalorian Season 3', 'The Armorer is a Star Wars Pop! Star Wars release #717 from The Mandalorian Season 3.'),
    ('889698800020', 'Grogu Force Barrier', 'Grogu Force Barrier', 'The Mandalorian Season 3', 'Grogu Force Barrier is a Star Wars Pop! Star Wars release #719 from The Mandalorian Season 3.'),
    ('889698765527', 'Peli Motto with Grogu', 'Peli Motto with Grogu', 'The Mandalorian Season 3', 'Peli Motto with Grogu is a Star Wars Pop! Star Wars release #665 from The Mandalorian Season 3.'),
    ('889698765541', 'The Armorer', 'The Armorer', 'The Mandalorian Season 3', 'The Armorer is a Star Wars Pop! Star Wars release #668 from The Mandalorian Season 3.'),
    ('889698765497', 'The Mandalorian in N-1 Starfighter with R5-D4', 'The Mandalorian in N-1 Starfighter with R5-D4', 'The Mandalorian Season 3', 'The Mandalorian in N-1 Starfighter with R5-D4 is a Star Wars Pop! Star Wars release #670 from The Mandalorian Season 3.'),
    ('889698523738', 'The Mandalorian & The Child on Bantha', 'The Mandalorian & The Child on Bantha', 'The Mandalorian', 'The Mandalorian & The Child on Bantha is a Star Wars Pop! Star Wars release #416 from The Mandalorian.'),
    ('889698545259', 'The Mandalorian with Grogu', 'The Mandalorian with Grogu', 'The Mandalorian', 'The Mandalorian with Grogu is a Star Wars Pop! Star Wars release #461 from The Mandalorian.'),
    ('889698587976', 'The Mandalorian with Darksaber', 'The Mandalorian with Darksaber', 'The Mandalorian', 'The Mandalorian with Darksaber is a Star Wars Pop! Star Wars release #491 from The Mandalorian, Glow in the Dark Exclusive.'),
    ('889698686501', 'Grogu with Armor', 'Grogu with Armor', 'The Book of Boba Fett', 'Grogu with Armor is a Star Wars Pop! Star Wars release #584 from The Book of Boba Fett.'),
    ('889698937900', 'Grogu with Snack', 'Grogu with Snack', 'The Mandalorian', 'Grogu with Snack is a Star Wars Pop! Star Wars release #825 from The Mandalorian, Flocked.'),
    ('889698908238', 'Rotta the Hutt', 'Rotta the Hutt', 'The Mandalorian & Grogu', 'Rotta the Hutt is a Star Wars Pop! Star Wars release #843 from The Mandalorian & Grogu, Glow in the Dark Special Edition.')
)
update public.pop_catalog as p
set
  pop_name = c.pop_name,
  character = c.character,
  set_name = c.set_name,
  description = c.description,
  display_description = c.description,
  parse_confidence = greatest(coalesce(p.parse_confidence, 0), 0.94),
  needs_review = false
from changes c
where p.upc = c.upc;

update public.pop_catalog
set set_name = 'The Mandalorian Season 3'
where set_name = 'Mandalorian S3';

update public.pop_catalog
set set_name = 'The Book of Boba Fett'
where set_name = 'The Book Of Boba Fett';
