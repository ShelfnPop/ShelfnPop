# DC Jim Lee + Harry Potter implementation review - 2026-07-08

## Applied live

- `DC Jim Lee Collection`
  - Updated existing catalog rows from `set_total = 7` to `set_total = 15`.
  - Marked `pop_sets.canonical_name = 'DC Jim Lee Collection'` as `reviewed`.
  - Loaded 15 required checklist rows.

- `Harry Potter`
  - Confirmed the set was already reviewed live from the prior pass:
    - `pop_sets.status = reviewed`
    - `confidence = 0.90`
    - `checklist_rows = 219`
  - Corrected the one Harry Potter catalog row that still had no `set_total`:
    - UPC `889698311533`
    - `Dobby (10" Super Sized Pop)` #63
    - `Target` exclusive
    - `pop_style = Jumbo`
    - `set_total = 219`
  - Added a local `lookup_pop` UPC override for `889698311533`.

## Live verification

- `DC Jim Lee Collection`: `reviewed`, 15 checklist rows, 2 matched catalog rows.
- `Harry Potter`: `reviewed`, 219 checklist rows, 54 matched catalog rows.
- Catalog totals:
  - `DC Jim Lee Collection`: 2 catalog rows, both with min/max `set_total = 15`.
  - `Harry Potter`: 60 catalog rows, 60 rows with `set_total = 219` after Dobby correction.

## Sources

- DC Jim Lee Collection checklist: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2479&ssid=10
- Funko official Superman on Gargoyle #278 vault page: https://funko.com/pop-deluxe-dc--superman-on-gargoyle-jim-lee/34072.html
- Harry Potter Dobby #63 source: https://www.harrypotterpopvinyls.com/harry-potter/63-dobby-10-inch-super-sized-pop

## Not done

- No value refresh.
- No image replacement.
- `lookup_pop` local changes still need Edge Function deployment from a CLI-capable environment.
