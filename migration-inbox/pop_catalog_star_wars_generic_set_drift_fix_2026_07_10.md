# Star Wars Generic-Set Drift Fix - 2026-07-10

## Scope

This batch repairs live `pop_catalog` rows that drifted back to generic `Star Wars`
after refresh, even though reviewed parser overrides already define their correct
movie-set placement.

## Updated UPCs

- `889698430203` -> `Darth Maul (Gold Metallic) #9`
  - `Star Wars: The Phantom Menace`
- `849803087159` -> `Blue Senate Guard #98`
  - `Star Wars: Attack of the Clones`
  - exclusivity normalized to `Galactic Convention`
- `889698430180` -> `Yoda #124`
  - `Star Wars: The Empire Strikes Back`

## Why this batch is safe

All three rows already have active reviewed override protection in
`public.catalog_parser_overrides`. This is not a new inference batch; it is a live
catalog repair batch to bring the stored row shape back in line with the reviewed
override state.
