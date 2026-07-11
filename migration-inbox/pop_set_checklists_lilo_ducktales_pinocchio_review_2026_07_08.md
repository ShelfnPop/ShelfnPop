# Lilo & Stitch, DuckTales, Pinocchio Set Batch

Applied: 2026-07-08

## Sources

- FigureRealm Lilo & Stitch Pop! Vinyl checklist: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3047&ssid=58
- PriceCharting DuckTales search index: https://www.pricecharting.com/search-products?q=Funko+Pop+DuckTales&type=prices
- Droppp DuckTales digital-release metadata: https://droppp.io/
- FigureRealm Pinocchio checklist: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=810
- Funko product metadata for Netflix's Pinocchio split rows: https://funko.com/

## Result

- `Lilo & Stitch`
  - Normalized owned catalog rows from `Lilo And Stitch`, `Disney Stich. Concept Art`, `Stitch In Costume`, and a null-set Stitch-as-Pongo row into `Lilo & Stitch`.
  - Set `set_total = 64` from the FigureRealm Pop! Vinyl Figure source count.
  - Left the `pop_sets` record as `draft` because the 64 individual checklist rows were not fully extracted in this pass.
  - Corrected owned rows including `Stitch in Sand #1566`, `Easter Stitch #1533`, `Snorkeling Stitch #1742`, `Stitch with Mood Chart #1744`, `Stitch (Concept Art) #1538`, and `Stitch (As Pongo) #1462`.

- `DuckTales`
  - Created a reviewed checklist with 10 required rows.
  - Linked owned catalog rows for the original 306-311 run plus `Flintheart Glomgold #313`.
  - Included known non-owned checklist rows for `Scrooge McDuck (Gold) #312`, `Ma Beagle #316`, and `Gizmoduck #362`.

- `Pinocchio`
  - Created a reviewed Disney Pinocchio checklist with 14 required rows.
  - Corrected UPC `889698515344` from `Pinocchio #25` to `Jiminy Cricket (Green Jacket) #1026`.
  - Kept `Blue Fairy #1027` in Disney Pinocchio.
  - Moved UPC `889698673860` from Disney Pinocchio to `Netflix's Pinocchio` as `Geppetto #1297`.

## Parser guards

Added UPC overrides for the corrected Lilo & Stitch rows and the Pinocchio/Netflix's Pinocchio split so lookup refreshes do not revert the catalog cleanup.
