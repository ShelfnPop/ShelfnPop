# Toy Story + Stranger Things Set Totals Review - 2026-07-08

## Applied totals

| Set | Total | Confidence | Source |
| --- | ---: | ---: | --- |
| Toy Story | 19 | 0.90 | MyPopFigures Toy Story Pop! Vinyl checklist |
| Toy Story 4 | 21 | 0.90 | MyPopFigures Toy Story 4 checklist |
| Toy Story 5 | 8 | 0.88 | MyPopFigures Toy Story 5 checklist |
| Lightyear | 7 | 0.90 | MyPopFigures Lightyear checklist |
| Toy Story 30th Anniversary | 5 | 0.86 | MyPopFigures 30th Anniversary checklist plus Woody on Bullseye ride |
| Stranger Things: Season 1 | 40 | 0.82 | Derived from loaded FunkyPriceGuide 168-item checklist by box-number range |
| Stranger Things: Season 2 | 32 | 0.82 | Derived from loaded FunkyPriceGuide 168-item checklist by box-number range |
| Stranger Things: Season 3 | 28 | 0.82 | Derived from loaded FunkyPriceGuide 168-item checklist by box-number range |
| Stranger Things: Season 4 | 48 | 0.82 | Derived from loaded FunkyPriceGuide checklist plus season-four deluxe/pack exceptions |
| Stranger Things: Season 5 | 33 | 0.78 | POPsToday Stranger Things 5 checklist |

## Notes

- The existing 168-item `Stranger Things` checklist was renamed to `Stranger Things (All)` so the app does not use the master checklist as a live season bucket.
- Six remaining generic Stranger Things catalog rows were moved into season buckets:
  - Dustin With Die #05 -> Season 4
  - Eleven Split #011 -> Season 5
  - Steve Harrington #13 -> Season 5
  - Murray #85 -> Season 4
  - Eleven #545 -> Season 2
  - Robin, Steve & Vecna -> Season 4
- Season 5 is still the most fluid checklist. POPsToday currently shows 33 items, but several newer rows do not have stable box numbers in the source text yet.
- `Toy Story 30th Anniversary` total includes the four Pop! checklist items plus the 30th Anniversary Woody on Bullseye ride.

## Verification

- `pop_set_completion_catalog_summary` now shows matching `required_count` and `checklist_count` for all reviewed Toy Story and Stranger Things season sets.
- `pop_catalog.set_total` is consistent for all live catalog rows in these sets.
