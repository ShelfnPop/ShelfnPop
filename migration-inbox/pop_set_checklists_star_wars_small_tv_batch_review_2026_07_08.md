# Star Wars small TV checklist pass - 2026-07-08

Applied live to Supabase project `vwlnlgqxjamkukssuajt`.

## Scope

- Ahsoka
- The Book of Boba Fett
- Obi-Wan Kenobi
- Skeleton Crew

## Sources

- Ahsoka: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5037
- The Book of Boba Fett: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5051
- Obi-Wan Kenobi: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5099&ssid=2
- Skeleton Crew: https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=starwarsskeletoncrewfunko&id=5130

## Live verification

| Set | Catalog rows | Rows with total | Set total | Checklist rows | Matched catalog rows |
| --- | ---: | ---: | ---: | ---: | ---: |
| Ahsoka | 4 | 4 | 23 | 23 | 4 |
| The Book of Boba Fett | 5 | 5 | 13 | 13 | 4 |
| Obi-Wan Kenobi | 4 | 4 | 24 | 24 | 4 |
| Skeleton Crew | 4 | 4 | 6 | 6 | 4 |

## Corrections

- UPC `889698650960`: corrected Obi-Wan Kenobi to box `#536`, `Art Series`, `Target`, and `Art Series` style.
- UPC `889698767347`: corrected `Skeleton Crew Wim` to `Wim`.
- UPC `889698768382`: moved `Funko Shop` from variant to exclusivity for Kh'ymm.
- UPC `889698686549`: corrected `The Mandalorian (with Gift)` to `The Mandalorian (with Pouch)`.
- UPC `889698837620`: changed Ezra Bridger to `Ezra Bridger (Lightsaber)` with `Lightsaber` variant.

## Notes

- FigureRealm's Ahsoka page reports 28 total items, but 5 are Pop! Pocket Keychains. The app set total was set to the 23 Pop! Vinyl Figures rows.
- All rows in the four scoped sets now have consistent `set_total` values and no missing box numbers.
- Added local `lookup_pop` UPC overrides for the corrected rows so future refreshes preserve these identities once the edge function is deployed.
- TypeScript check passed after the parser override edits.
- Supabase CLI is not available in this shell, so `lookup_pop` still needs an edge-function deploy from an environment with CLI access.
