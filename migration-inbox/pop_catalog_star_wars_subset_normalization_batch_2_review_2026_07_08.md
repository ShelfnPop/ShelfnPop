# Star Wars subset normalization batch 2 - 2026-07-08

## Applied live

- Normalized `Star Wars Rogue One` into `Star Wars: Rogue One`.
- Normalized `The Clone Wars` into `Star Wars: The Clone Wars`.
- Normalized `Star Wars: Return Of The Jedi 40th Anniversary` casing into `Star Wars: Return of the Jedi 40th Anniversary`.
- Normalized `Star Wars: Episode VI Return Of The Jedi` into `Star Wars: Return of the Jedi`.
- Normalized `Star Wars: Across The Galaxy` casing into `Star Wars: Across the Galaxy`.
- Moved `Grogu (with Snack) #825` / UPC `889698937900` back into `The Mandalorian`, keeping `Flocked` and adding `Target`.
- Cleaned a few display names/characters:
  - `R2-D2 (Jabba's Skiff)`
  - `Luke Skywalker (Jedi)`
  - `Holographic Luke Skywalker`

## Totals

- `Star Wars: Rogue One`: `11` catalog rows, all with set total `37`.
- `Star Wars: The Clone Wars`: `8` catalog rows, all with set total `28`.
- `The Mandalorian`: `38` catalog rows, all with set total `112`.

## Set metadata

- `Star Wars: Rogue One` remains `reviewed` with `37` checklist rows.
- `The Mandalorian` remains `reviewed` with `112` checklist rows.
- `Star Wars: The Clone Wars` is now tracked as `draft` at `0.82` confidence. FigureRealm reports `28` Pop! Vinyl Figure rows, but the full item checklist was not loaded in this batch.

## Parser guardrails

- Updated the local `lookup_pop` override for Bistan / UPC `889698104586` so refreshes keep `Star Wars: Rogue One`.
- Updated the local `lookup_pop` override for Grogu (with Snack) / UPC `889698937900` so refreshes keep `The Mandalorian`, `Flocked`, and `Target`.

## Deferred

- The generic `Star Wars` bucket still needs a dedicated pass; it likely mixes original trilogy, anniversary, art/concept, convention, and specialty rows.
- `Star Wars: The Force Awakens` still needs a paginated checklist pass before assigning a reviewed total.
- `Star Wars: Return of the Jedi` and `Star Wars: Return of the Jedi 40th Anniversary` were normalized, but totals were not assigned in this batch.
- `The Mandalorian & Grogu` / Rotta the Hutt #843 was left alone because it may belong to the newer movie line rather than the reviewed TV checklist.
