# The Office Set Checklist Review - 2026-07-08

## Scope

Promote `The Office` from draft to reviewed using the FigureRealm Office checklist scoped to `Pop! Vinyl Figures` only.

## Source Notes

- FigureRealm browse-all Office checklist has 104 total items.
- Included denominator: 79 `Pop! Vinyl Figures`.
- Excluded from denominator: Pop! Ornaments, Pop! Pin, Pop! Pocket Keychains, Pop! Rides, Pop! Sets, Popsies, and Soda.
- UPC `889698425902` was corrected with Funko official item evidence for Dwight Schrute (Blonde), item `42590`, box `871`.

## Planned Live Changes

- Set `pop_sets.The Office` to `reviewed`, confidence `0.90`, denominator `79`.
- Replace any prior Office checklist rows with the 79 scoped Pop! Vinyl checklist rows.
- Normalize 18 owned Office catalog rows to `franchise = The Office`, `set_name = The Office`, `pop_type = Pop! Television`, `set_total = 79`.
- Correct noisy owned rows including Jim Halpert Chase, Dwight variants, Michael Scarn, Ryan Howard, Erin Hannon, and Mose Schrute.
- Remove `Common` from Mose Schrute variant; keep `New York Comic Con` in exclusivity.

## Verification Targets

- `pop_set_checklist_items`: 79 required rows for The Office.
- `pop_catalog`: 18 owned Office rows with `set_total = 79`.
- All 18 owned Office rows linked back to checklist items.
- `needs_review = false` for updated owned Office rows.
