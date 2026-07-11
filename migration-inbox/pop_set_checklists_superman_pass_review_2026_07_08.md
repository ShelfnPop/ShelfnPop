# Superman Cleanup Pass - 2026-07-08

## Applied

- Repaired live catalog set totals:
  - `Superman (2025)` = 14
  - `Superman (1978)` = 7
  - `Superman: Shield Through the Ages` = 5
  - `Man of Steel` = 4
- Moved two Superman #278 rows into `DC Jim Lee Collection`:
  - UPC `889698340724`
  - UPC `889698397742`
- Updated both #278 rows to:
  - `pop_name` = `Superman on Gargoyle`
  - `set_name` = `DC Jim Lee Collection`
  - `pop_style` = `Deluxe`
  - `vault_status` = `Vaulted`
  - `set_total` = 7
- Created/updated `pop_sets` rows:
  - `Superman (2025)` reviewed, confidence `0.90`
  - `Superman (1978)` reviewed, confidence `0.84`
  - `Superman: Shield Through the Ages` reviewed, confidence `0.86`
  - `Man of Steel` reviewed, confidence `0.82`
  - `DC Jim Lee Collection` draft, confidence `0.78`
- Loaded checklist rows:
  - `Superman (1978)` = 7 required items
  - `Superman: Shield Through the Ages` = 5 required items
  - `Man of Steel` = 4 required items
- Added lookup parser overrides for the two Jim Lee #278 UPCs.

## Verification

- Supabase check after apply:
  - `Superman (2025)`: checklist `14`, catalog rows `13`, min/max set total `14`
  - `Superman (1978)`: checklist `7`, catalog rows `5`, min/max set total `7`
  - `Superman: Shield Through the Ages`: checklist `5`, catalog rows `5`, min/max set total `5`
  - `Man of Steel`: checklist `4`, catalog rows `2`, min/max set total `4`
  - `DC Jim Lee Collection`: draft, catalog rows `2`, min/max set total `7`
- UPC `889698340724` and `889698397742` both now read `Superman on Gargoyle`, `DC Jim Lee Collection`, `Deluxe`, `Vaulted`.
- TypeScript check passed in `shelf-n-pop-expo`.

## Sources

- FigureRealm Superman 2025 Movie checklist.
- FigureRealm Superman Funko checklist.
- Funko Vault page for `POP Deluxe: DC- Superman on Gargoyle (Jim Lee)`.
- Funko Rewind Superman official page.
- Superman Homepage first-look article for the Superman 1978 movie wave.

## Left For Later

- The broad `Superman` set still has 18 catalog rows with no set total. This was intentional: the available 45-item Superman universe total overlaps rows we have already split into more useful sub-sets, so applying that broad denominator would make the Shelf Breakdown feel inconsistent again.
- `DC Jim Lee Collection` is draft because the two owned Superman rows are fixed, but the full seven-item checklist still needs a dedicated pass.
