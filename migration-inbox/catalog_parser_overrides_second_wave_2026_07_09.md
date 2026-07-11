# Catalog Parser Overrides Second Wave - 2026-07-09

## Purpose

Persist the next group of high-confidence review fixes into `public.catalog_parser_overrides` so parser refreshes keep the corrected franchise, set, number, pop type, and variant data.

## UPCs Included

- `889698430173` - Princess Leia `#295`, `Gold Chrome`
- `889698704571` - Darth Vader on TIE Fighter `#20`, `Disney 100`, `Pop! Trains`
- `889698652568` - Krrsantan `#548`, `The Book of Boba Fett`
- `889698837729` - Jean-Luc Picard (Transporter) (Glitter) `#1687`
- `889698477093` - The Joker `#337`, `Batman 1989`
- `889698372541` - Batman Forever `#289`
- `889698639880` - Sallah `#1352`
- `889698485159` - Biff Tannen `#963`
- `889698744225` - Batman (Kingdom Come) `#569`
- `889698818667` - Fear Gas Batman `#532`
- `889698866422` - Superman and the Fortress of Solitude `#582`

## Intentional Review Flags

- `889698477093` stays `needs_review = true` because the review notes left the Joker `#337` family open for duplicate/variant follow-up.

## Notes

- This is the companion database batch for the code-side static overrides added to `lookup_pop/index.ts`.
- The batch is intentionally narrow and review-safe: it only seeds learned override rows and includes a verification query.
