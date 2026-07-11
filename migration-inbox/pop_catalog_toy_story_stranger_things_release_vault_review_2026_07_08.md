# Toy Story + Stranger Things Release/Vault Review - 2026-07-08

## Applied

High-confidence vaulted status updates:

- Stranger Things Steve #803: official Funko From the Vault page.
- Stranger Things Dustin at Camp #804: official Funko From the Vault page.
- Stranger Things Eleven #1238: official Funko From the Vault page.
- Stranger Things Number One / 001 #1387: official Funko From the Vault page.

High-confidence release date updates:

- Stranger Things Number One / 001 #1387: `2023-07-01`, based on official 2023 Summer Convention context.
- Stranger Things Nancy Wheeler #1778: `2025-10-03`, based on Target street date.
- Toy Story Mrs. Nesbit #518: `2019-02-01`, based on StockX product release date.

Applied SQL: `pop_catalog_toy_story_stranger_things_release_vault_pass_2026_07_08.sql`.

## Current gap counts after applying

- Toy Story: 14 rows, 10 missing release dates, 0 vaulted.
- Stranger Things: 93 rows, 35 missing release dates, 5 vaulted.

## Intentionally left alone

- Toy Story Bullseye #520 stayed Active because official Funko currently shows the standard Bullseye #520 page as available/low stock. Marketplace listings calling it vaulted are not enough to override that.
- Toy Story Slinky Dog #516 and several Toy Story 4 rows have marketplace sales titles saying vaulted, but no official vault confirmation was found in this pass.
- Stranger Things Season 5 / Wave 5B rows without exact street dates were not backfilled. Some retailer pages show pre-order or estimated arrival windows, which are not the same as a release date.
- Toy Story 5 rows without exact street dates were not backfilled. Target confirms they are current/in-stock but did not expose a street date for the matched rows in this pass.
