# Incredibles 2, Pet Sematary, Rick and Morty Cleanup

Applied: 2026-07-08

## Sources

- FigureRealm Incredibles 2 Pop! checklist: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621&ssid=2
- FigureRealm Incredibles full checklist: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2621
- FigureRealm Pet Sematary checklist: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3957
- FigureRealm Rick and Morty checklist: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4365

## Result

- `Incredibles 2`
  - Reviewed checklist loaded: 19 required items.
  - Catalog rows now show 11 owned rows with `set_total = 19`.
  - Corrected owned rows include `Mr. Incredible #363`, `Elastigirl (Outfit Upgrade) #403`, `Monster Jack-Jack #401`, `Jack-Jack (Edna) #404`, `Voyd #509`, and `Jack-Jack (Metallic Chrome) #367`.
  - Moved `JJ & Syndrome (20th Anniversary) #1506` out of `Incredibles 2` and into `The Incredibles 20th Anniversary`.

- `Pet Sematary`
  - Reviewed checklist loaded: 5 required items.
  - Catalog rows now show 3 owned rows with `set_total = 5`.
  - Corrected `Pet Sematary Gage & Church` to `Gage & Church #729`, `Glow in the Dark`.

- `Rick and Morty`
  - Normalized 8 catalog rows to `Rick and Morty`.
  - Stored `set_total = 99` from the FigureRealm Pop! Vinyl Figure subseries count.
  - Left `pop_sets` status as `draft` because the 99 individual checklist rows were not extracted in this pass.
  - Corrected `Rick Morty #956` to `Rick with Glorzo #956`.
  - Corrected `Rick With Laptop #742` to `Morty with Laptop #742`, `GameStop`.

## Verification

- `pop_set_completion_catalog_summary`
  - `Incredibles 2`: `reviewed`, `required_count = 19`, `checklist_count = 19`.
  - `Pet Sematary`: `reviewed`, `required_count = 5`, `checklist_count = 5`.
  - `Rick and Morty`: `draft`, `required_count = 0`, `checklist_count = 0`.

- `pop_catalog`
  - `Incredibles 2`: 11 catalog rows, `set_total = 19`.
  - `Pet Sematary`: 3 catalog rows, `set_total = 5`.
  - `Rick and Morty`: 8 catalog rows, `set_total = 99`.
