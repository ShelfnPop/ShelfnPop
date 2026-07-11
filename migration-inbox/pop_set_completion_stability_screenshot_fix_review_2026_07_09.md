# Set Completion Stability Screenshot Fix - 2026-07-09

## Issue

The Closest Sets card showed several impossible completion states, such as `17 of 16`, `12 of 11`, and `6 of 5`.

## Findings

- `Batman v Superman: Dawn of Justice` had two non-BvS catalog rows in the set:
  - `889698372480` - Batman 1989 #275
  - `889698372541` - Batman Forever #289
- `DC Imperial Palace` and `Superman: Shield Through the Ages` had stable catalog/checklist totals, but duplicate collection rows were being counted as extra completion items by the app.
- `Superman (2025)` had the reviewed checklist row `DCs Ultraman #583 Chase` but no linked catalog row. One owned row was stored as `Hammer of Boravia #583` with owned variant `Chase`, which represented that missing Ultraman checklist item.

## Applied Data Repairs

- Moved Batman 1989 #275 and Batman Forever #289 from `Batman v Superman: Dawn of Justice` to `Batman: 80th Anniversary`.
- Set both moved Batman rows to `set_total = 33` and linked them to existing Batman: 80th Anniversary checklist rows.
- Added `DCs Ultraman #583 Chase` to `pop_catalog` under `Superman (2025)` with `set_total = 14`.
- Moved the existing owned Chase row from Hammer of Boravia to the new DCs Ultraman catalog row.
- Linked the Superman (2025) checklist item for DCs Ultraman to the new catalog row.

## App-Side Companion Fix

- Completion counting should use catalog identity only when `pop_catalog_id` is present. Owned variant text can describe a shelf entry, but it should not create another completed checklist item for the same catalog row.

No ownership quantities, paid values, current values, images, or vault fields were changed.
