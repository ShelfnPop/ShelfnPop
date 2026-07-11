# DC Jim Lee Collection checklist correction - 2026-07-08

## Status

Staged in `migration-inbox/pop_set_checklists_dc_jim_lee_collection_2026_07_08.sql`.

Not applied live from this shell.

## Scope

- DC Jim Lee Collection
- Corrects the draft seven-item denominator to a 15-item reviewed checklist.

## Sources

- FigureRealm DC Collection Pop! checklist: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10
- Official Funko Vault page for Superman on Gargoyle #278: https://funko.com/pop-deluxe-dc--superman-on-gargoyle-jim-lee/34072.html

## Reasoning

- The previous Superman pass intentionally left `DC Jim Lee Collection` as draft with `set_total = 7`.
- FigureRealm lists 15 DC Collection Pop! entries in this Jim Lee-style checklist slice.
- The list includes black-and-white variants, and the app already has a black-and-white Superman #278 catalog row, so the reviewed app denominator should preserve those variants instead of collapsing them into character-only slots.
- Funko official Vault evidence verifies Superman on Gargoyle as box `#278`, `Pop! Deluxe`, and vaulted.

## Staged Changes

- Update live catalog rows in `DC Jim Lee Collection` to `set_total = 15`.
- Mark `pop_sets` row `DC Jim Lee Collection` as `reviewed`, confidence `0.86`.
- Upsert 15 required checklist rows:
  - Aquaman #254
  - Aquaman #254 Black & White
  - Batman (Hush) #239
  - Batman (Hush) #239 Black & White
  - Joker (Hush) #240
  - Joker (Hush) #240 Black & White
  - Flash #268
  - Flash #268 Black & White
  - Catwoman #269
  - Catwoman #269 Black & White
  - Green Lantern and Batman #271
  - Superman on Gargoyle #278
  - Superman on Gargoyle #278 Black & White
  - Wonder Woman #282
  - Wonder Woman #282 Black & White

## Parser

- No new `lookup_pop` parser override was added in this pass.
- The existing Superman #278 UPC overrides are already present for:
  - `889698340724`
  - `889698397742`

## Verification To Run After Apply

- Confirm `pop_sets` has one reviewed `DC Jim Lee Collection` row at confidence `0.86`.
- Confirm checklist row count is `15`.
- Confirm catalog rows in `DC Jim Lee Collection` have min/max `set_total = 15`.
- Confirm the two Superman #278 UPC rows still read as `Superman on Gargoyle`, `Deluxe`, with the expected common and black-and-white variants.
