# Catalog Parser Overrides Last-20 Durability - 2026-07-09

## Purpose

Persist the repeated last-20 review corrections in `public.catalog_parser_overrides` so future `lookup_pop` refreshes preserve the corrected identity even when live catalog rows are later refreshed.

## UPCs Included

- `889698147644` - Kylo Ren `#203`, `Star Wars: The Last Jedi`
- `830395034003` - Marty McFly `#49`, Plastic Empire limited run
- `830395033990` - Dr. Emmett Brown `#50`, Glow in the Dark convention row
- `889698816663` - Grand Admiral Thrawn `#697`, Diamond Glitter SDCC
- `889698717366` - Hatching Raptor `#1442`, `Jurassic Park`
- `889698871877` - Bullseye as Superman `#249`, `Target` / `Ad Icons`
- `889698496858` - Doc & Einstein `#972`, `Back to the Future`
- `889698567718` - Andy with Leg Casts `#1155`, `Parks and Recreation`
- `889698147989` - Young Anakin Skywalker (Podracer) `#231`
- `889698675376` - Stormtrooper `#598`, `Star Wars: Episode IV - A New Hope`
- `889698495776` - The Joker `#337`, `Batman 1989`
- `889698372480` - Batman (1989) `#275`

## Intentional Review Flags

These overrides deliberately keep `needs_review = true` because the identity is known but the sticker/value/vault nuance still benefits from manual review:

- `889698147644`
- `830395034003`
- `830395033990`
- `889698816663`
- `889698675376`
- `889698495776`
- `889698372480`

## Notes

- This batch is parser-learning only; it does not update `pop_catalog` rows directly.
- The companion code-side protection already exists in `lookup_pop/index.ts`.
- The goal is to keep row refreshes from reintroducing the same franchise/set/number mistakes while preserving human review where the market/sticker call is still open.
