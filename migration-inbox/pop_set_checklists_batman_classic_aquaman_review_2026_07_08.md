# Batman Classic TV Series + Aquaman Review - 2026-07-08

## Applied

- Updated live `pop_catalog.set_total`:
  - `Batman Classic TV Series` = 20
  - `Aquaman` = 14
- Fixed UPC `889698299954`:
  - `pop_name` = `Batman vs. The Penguin`
  - `character` = `Batman & The Penguin`
  - `pop_style` = `2-Pack`
  - `set_total` = 20
- Created/updated reviewed `pop_sets` rows:
  - `Batman Classic TV Series`, confidence `0.90`
  - `Aquaman`, confidence `0.84`
- Loaded `pop_set_checklist_items`:
  - `Batman Classic TV Series`: 20 required items
  - `Aquaman`: 14 required items
- Added lookup parser override for UPC `889698299954` so future scans keep the corrected 2-pack data.

## Sources

- Batman Classic TV Series source: FigureRealm Pop! Vinyl Figures checklist, `20 Items Found`.
- Batman vs. The Penguin UPC source: Amok Time product page showing SKU `889698299954`.
- Aquaman source: FigureRealm Aquaman checklist. Source shows 15 items overall; app completion total uses 14 Pop! Vinyl/Ride-style items and excludes Pop! Comic Cover #13.

## Verification

- Supabase check after apply:
  - `Aquaman`: `reviewed`, confidence `0.84`, checklist count `14`, catalog rows `11`, min/max `set_total = 14`.
  - `Batman Classic TV Series`: `reviewed`, confidence `0.90`, checklist count `20`, catalog rows `7`, min/max `set_total = 20`.
  - UPC `889698299954` now reads `Batman vs. The Penguin`, `2-Pack`, `set_total = 20`.
- TypeScript check passed in `shelf-n-pop-expo`.

## Left For Later

- Superman remains intentionally untouched in this pass. It mixes older DC Super Heroes numbering, character-line Superman releases, and modern movie/set rows, so it needs a dedicated source-backed split before adding a completion denominator.
