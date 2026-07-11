# Star Wars Specialty Follow-up Parser Overrides - 2026-07-09

## Added durability

- `889698430203` -> `Darth Maul (Gold Metallic) #9`
  - Kept in generic `Star Wars` for now.
  - Protected the reviewed identity fields that were still missing from parser overrides:
    - `number = 9`
    - `variant = Metallic Gold`
    - `exclusivity = Walmart`
    - `vault_status = Vaulted`

## Still deferred

- `849803087159` - `Blue Senate Guard #98`
  - Left out of parser overrides for now because the Phantom Menace checklist used in the reviewed pass did not support that set placement.
- `Chewbacca #6`
  - Left out of parser overrides for now because reviewed set placement is still ambiguous.

## Why this batch stays narrow

The goal here is only to stop the known Darth Maul identity regression from resurfacing on refresh. The other two rows still need stronger checklist or source support before we hard-code a durable parser decision.
