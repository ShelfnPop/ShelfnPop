# Star Wars original trilogy checklist pass - 2026-07-08

Applied live to Supabase project `vwlnlgqxjamkukssuajt`.

## Scope

- Star Wars: A New Hope
- Star Wars: The Empire Strikes Back
- Star Wars: Return of the Jedi

## Sources

- A New Hope: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5034
- The Empire Strikes Back: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5064
- Return of the Jedi: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=6714

## Live verification

| Set | Catalog rows | Rows with total | Set total | Checklist rows | Matched catalog rows |
| --- | ---: | ---: | ---: | ---: | ---: |
| Star Wars: A New Hope | 8 | 8 | 73 | 73 | 4 |
| Star Wars: The Empire Strikes Back | 9 | 9 | 61 | 61 | 2 |
| Star Wars: Return of the Jedi | 10 | 10 | 58 | 58 | 6 |

## Notes

- `pop_catalog.set_total` is now consistent across the existing owned/catalog rows for these three sets.
- `pop_sets` rows are marked `reviewed` at `0.88` confidence.
- Checklist rows were inserted into `pop_set_checklist_items`, so the app can show the owned/missing/full views for these sets.
- Some checklist rows did not auto-link to `pop_catalog_id` because historical catalog names and variants differ from the source checklist labels. That is expected for this pass and can be tightened in later item-level cleanup.
