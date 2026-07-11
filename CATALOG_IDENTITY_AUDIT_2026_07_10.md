# Shelf-n-Pop Catalog Identity Audit

Generated: 2026-07-10

Workspace: `C:\Users\mplat\source\shelf-n-pop`

Scope: live `pop_catalog` review of franchise, set, box number, and Pop name quality. This is a read-only snapshot; no catalog rows were changed.

## Executive Snapshot

- Catalog rows: `2,231`
- Distinct franchise labels: `138`
- Distinct set labels: `494`
- Missing franchise: `9`
- Missing set: `0`
- Missing box number: `50`
- Missing box number on Pop product lines: `48`
- Weak/placeholder Pop names: `0`
- Low parse confidence below `0.75`: `2`
- Rows currently marked `needs_review`: `0`
- Active learned parser overrides: `146`
- Duplicate UPC groups: `0`
- Normalized set/franchise conflict groups: `10`
- Set + box-number groups containing different Pop names: `34`

The catalog has no missing sets and no duplicate UPC groups. The remaining work is concentrated in incorrect assignments, missing numbers, broad set buckets, label normalization, and identity collisions.

## Important Caveats

- `482` rows have the same set and franchise label. Most are legitimate show- or movie-level sets such as `Game of Thrones`, `The Office`, and `Back to the Future`; this is not an error count.
- The generic-set heuristic found `28` rows, but `15` are Pokemon rows where the broad Pokemon set is likely intentional. The stronger broad-set queue is `13` rows: `Star Wars 7`, `Disney 4`, and `Marvel 2`.
- Of the `48` Pop-line rows without a number, `27` are multipacks, moments, or deluxe products that may legitimately be unnumbered. The high-priority number queue is the `21` Standard-style rows.
- Many of the `34` set/number/name conflicts are legitimate variants sharing a box number. They must be separated from true catalog collisions before updates.

## High-Signal Identity Problems

### Missing Franchise

Nine rows currently have no franchise. These are a clean first review batch:

- `889698609302` - Jackie Robinson #42
- `889698477550` - Hattie #923
- `889698835398` - Dexter Morgan #1965
- `889698322270` - Bud Bundy #691
- `889698835381` - Debra Morgan #1696
- `889698568128` - Mike Tyson #1
- `889698674720` - Joe Montana #216
- `889698724401` - Xerxes #1475
- `889698233439` - Lobster Johnson #4

### Obvious Cross-Franchise or Identity Drift

These rows are strong candidates for the first correction batch:

- `849803096854` - White Canary is stored as Marvel / `Pop! Marvel` inside a DC set.
- `889698862776` - Tube is stored under NFL; its title identifies Lilo & Stitch and box number `1565`.
- `889698691215` - Eugene is stored as Marvel / `Pop! Marvel` inside Shazam.
- `849803038267` - Peanuts Linus Van Pelt is stored as Marvel / The Walking Dead.
- `889698712910` - Indiana Jones uses `Die-Cast` as the franchise instead of the product style/type.
- `889698871877` - Bullseye as Superman has drifted back to DC / Superman with no number; this previously required Target / Ad Icons identity protection.

Lower-risk normalization candidates include Toy Story rows split between `Disney` and `Toy Story`, and Wallace & Gromit labels split by capitalization and ampersand spelling.

## Box Number Review

Missing Pop-line numbers by style:

- Standard: `21`
- 2-Pack: `15`
- 3-Pack: `5`
- 4-Pack: `2`
- Moment: `2`
- Movie Moment: `2`
- Deluxe: `1`

The Standard queue should be verified first. Several titles already contain a likely box number that parsing missed, including Tube `1565` and Spiderman `2211`.

Seven stored number values are nonstandard. `SE` and `2 Pack` / `3 Pack` may be intentional labels, but Trigon's stored number `71746` is suspicious and resembles a product identifier rather than a box number.

## Set Review

Strong broad-set candidates:

- `Star Wars`: `7`
- `Disney`: `4`
- `Marvel`: `2`

Set-label normalization groups:

- `DC Super Heroes` / `DC Superheroes`: `42` rows
- `What If` / `What If...?`: `23`
- `Shazam! Fury of the Gods` capitalization variants: `10`
- `Rick and Morty` capitalization variants: `9`
- `Return of the Jedi 40th Anniversary` capitalization variants: `5`
- Five smaller punctuation/capitalization groups: `2` rows each

The normalized set/franchise conflict scan found `10` groups. Some are legitimate crossovers (`Disney 100`, `DC Looney Tunes`, Stan Lee), while the White Canary, Tube, Eugene, Linus, and Indiana Jones rows are clear assignment problems.

## Name and Identity Review

- Placeholder/empty names: `0`
- One noisy product name was detected: Britney Spears Mini Vinyl Figure (Toxic). This may be a valid Minis product and should not be changed automatically.
- `49` names contain parenthetical variant language; `44` also have a populated variant field. These can produce duplicated display identity and should be reviewed as a name/variant separation batch.
- `34` set + box-number groups contain more than one normalized Pop name.

High-signal collision examples:

- Batman 1989 #337: Batman & Joker vs. Joker identities
- Game of Thrones #67: Bran Stark vs. Jon Snow & Rhaegal
- Game of Thrones #60: Giant Wight vs. Mounted White Walker
- Harry Potter #175: Gingerbread Harry vs. Undesirable No. 1 Harry
- Solo #248: Han Solo vs. Mudtrooper
- Stranger Things: Season 3 #75: Dustin Henderson vs. Joyce
- Superman (2025) #583: Ultraman Chase vs. Hammer of Boravia

Other collision groups are likely legitimate variant families or naming aliases and should not be merged automatically.

## Parser Findings

Current reason-code counts:

- `weak_name_cleanup`: `243`
- `variant_or_exclusive_title_noise`: `145`
- `missing_number`: `48`
- `missing_set`: `25`
- `missing_franchise`: `10`
- `generic_set_label`: `7`
- `confidence_floor_070`: `2`
- `missing_character`: `1`

Reason-code state is drifting from current row state:

- All `25` `missing_set` warnings are stale because those rows now have sets.
- One `missing_franchise` warning is stale.
- One `missing_number` warning is stale.
- Two rows have parse confidence `0.70` but `needs_review = false`.

The parser cleanup currently clears resolved missing-number and missing-franchise warnings in one path, but does not clear resolved `missing_set`. Review flags also need to be recomputed consistently after overrides and refreshes.

Recommended parser improvements:

1. Recompute reason codes from final parsed fields after all static and learned overrides.
2. Clear resolved `missing_set`, `missing_franchise`, `missing_number`, and `missing_character` codes.
3. Set `needs_review` from final confidence and severity instead of preserving an older false value.
4. Add canonical franchise and set label maps for casing, punctuation, and known aliases.
5. Prevent product types such as `Die-Cast` from becoming franchises.
6. Add guarded number extraction for titles containing a likely box number, while rejecting UPC/product-code-sized values.
7. Add a collision warning when a new scan would create a radically different name for an existing set + number identity.
8. Keep variant and exclusivity tokens out of the base Pop name when those fields were parsed separately.
9. Add snapshot tests for every corrected UPC before deploying parser changes.

## Recommended Cleanup Batches

### Batch 1 - Critical Identity and Franchise

Review the nine missing-franchise rows plus the six obvious cross-franchise/identity rows. Include UPC-specific learned or static overrides for confirmed corrections.

### Batch 2 - Standard Pops Missing Numbers

Review the `21` Standard-style rows without box numbers. Extract only source-confirmed box numbers; leave true unnumbered releases alone.

### Batch 3 - Broad Sets and Label Normalization

Split the `13` strong broad-set rows, then normalize the ten casing/punctuation label groups. Keep Pokemon out of automatic broad-set cleanup unless a verified subset exists.

### Batch 4 - Set/Number Identity Collisions

Review all `34` groups, starting with the seven high-signal examples above. Separate legitimate variants from rows with the wrong number, set, or name.

### Batch 5 - Name and Variant Separation

Review the `49` parenthetical-variant names, prioritizing the `44` rows where variant data is already duplicated in the variant field.

### Batch 6 - Specialty Unnumbered Products

Review the remaining `27` multipacks, moments, and deluxe products. This is lower priority because many are legitimately unnumbered.

## Recommended Starting Point

Start with Batch 1. It has the smallest review surface, the highest confidence, and the greatest effect on future UPC scans. Pair each confirmed live correction with parser learning and a regression test so catalog refreshes cannot recreate the same drift.
