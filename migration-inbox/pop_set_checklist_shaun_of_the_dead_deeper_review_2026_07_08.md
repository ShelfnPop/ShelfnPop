# Deeper review: Shaun Of The Dead release scope

Date: 2026-07-08

## Finding

The current `Shaun Of The Dead` reviewed checklist verifies as 4/4, but the four rows are not one clean release group.

## Evidence

- FigureRealm lists the 2015 Pop! Vinyl rows as Ed #241, Ed (Bloody) #241, Ed (Zombie) #241, Ed (Zombie) #259, Shaun #240, and Shaun (Bloody) #240.
- FigureRealm lists Shaun (Funko Fusion) #996 as a 2024 Pop! Vinyl row.
- FigureRealm lists Shaun (Pool Cue) #1660 and Shaun (Pool Cue) (Bloody) (Chase) #1660 as 2025 Pop! Vinyl rows.
- The current owned catalog rows are Ed (Bloody) #241, Ed (Zombie) #259, and Shaun (Pool Cue) #1660.
- The current owned collection has two user collection items on the shared Shaun (Pool Cue) #1660 catalog row: one `owned_variant = Common` and one `owned_variant = Chase`.

## Concern

The current 4-row checklist mixes 2015 Ed rows with 2025 Shaun #1660 rows. The number ranges are meaningful and suggest these should be treated as separate release-scoped checklist passes rather than one compact 4-row set.

## Recommended correction

- Keep catalog rows variant-safe: Shaun #1660 common/chase can remain one shared catalog row with two `user_collection_items.owned_variant` values unless a separate chase catalog row is intentionally created later.
- Replace the current compact 4-row reviewed denominator with release-scoped checklists:
  - `Shaun Of The Dead (2015 Pop! Vinyl)`: Ed/Shaun #240/#241/#259 rows.
  - `Shaun Of The Dead (2025 Pop! Vinyl)`: Shaun (Pool Cue) #1660 common/chase rows.
- Defer any live split until the app grouping behavior is confirmed, because changing `pop_catalog.set_name` would split the user-facing set display.
