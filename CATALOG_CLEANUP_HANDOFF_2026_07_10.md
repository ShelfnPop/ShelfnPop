# Shelf-n-Pop Catalog Cleanup Handoff

Generated: 2026-07-10

Workspace: `C:\Users\mplat\source\shelf-n-pop`

App workspace: `C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo`

Branch: `codex/admin-override-management`

Supabase project: `vwlnlgqxjamkukssuajt`

## Pause Point

The catalog cleanup is paused after completing the critical identity, review-health, missing-number, broad-set, and label-normalization batches. Live corrections were paired with active UPC parser overrides whenever the decision was identity-specific. Generic lessons were added to the parser and covered by regression tests.

The working tree contains substantial existing and current uncommitted work. Do not reset, revert, or overwrite unrelated changes. Read diffs carefully and work with the current files.

## Current Live Snapshot

- Catalog rows: `2,231`
- Missing franchise: `0`
- Missing set: `0`
- Standard-style missing box number: `0`
- Remaining broad `Star Wars` / `Disney` / `Marvel` set rows: `0`
- Rows below the `0.75` confidence threshold: `1`
- Rows marked `needs_review`: `1`
- Active parser overrides: `186`
- Set + number identity-collision groups: `34`

## Completed Work

### Batch 1 - Critical Identity and Franchise

- Corrected 15 high-priority identities.
- Filled all nine missing franchises.
- Corrected White Canary, Stitch with Tube, Eugene, Linus van Pelt, Indiana Jones Die-Cast, and Bullseye as Superman.
- Fixed the refresh behavior so explicit static or learned override fields replace already-populated incorrect API fields.
- Trusted corrections now clear resolved reason codes and review state.

Files:

- `migration-inbox/pop_catalog_identity_batch_1_2026_07_10.sql`
- `migration-inbox/pop_catalog_identity_batch_1_2026_07_10.md`

### Review-Health Cleanup

- Removed stale resolved `missing_set`, `missing_franchise`, `missing_number`, and `missing_character` warnings.
- Preserved unrelated warning codes.
- Correctly marked sub-`0.75` confidence rows for review.

Files:

- `migration-inbox/pop_catalog_reason_code_health_cleanup_2026_07_10.sql`
- `migration-inbox/pop_catalog_reason_code_health_cleanup_2026_07_10.md`

### Batch 2 - Standard Missing Numbers

- Reduced Standard-style missing box numbers from `19` to `0`.
- Added 15 source-confirmed identifiers.
- Reclassified four legitimately unnumbered products as Mug, 2-Pack, Moment, or Bitty Pop! Arcade.
- Added reusable specialty-product recognition and missing-number warning rules.

Files:

- `migration-inbox/pop_catalog_standard_missing_numbers_batch_2026_07_10.sql`
- `migration-inbox/pop_catalog_standard_missing_numbers_batch_2026_07_10.md`

### Batch 3 - Broad Sets and Canonical Labels

- Reduced the core Disney/Marvel/Star Wars broad-set queue from `11` to `0`.
- Moved rows to verified sets such as The Nightmare Before Christmas, Mickey Mouse, Star Wars Retro Series, A New Hope, Tales of the Jedi, Star Wars Legends, and Maul: Shadow Lord.
- Canonicalized aliases for DC Super Heroes, What If...?, Shazam! Fury of the Gods, Rick and Morty, Return of the Jedi 40th Anniversary, The Nightmare Before Christmas, and Star Wars Retro Series.
- Verified that reviewed set-checklist names still align after normalization.

Files:

- `migration-inbox/pop_catalog_broad_sets_and_aliases_2026_07_10.sql`
- `migration-inbox/pop_catalog_broad_sets_and_aliases_2026_07_10.md`

## Parser Changes

Primary files:

- `shelf-n-pop-expo/supabase/functions/lookup_pop/index.ts`
- `shelf-n-pop-expo/supabase/functions/lookup_pop/catalog_refresh_rules.ts`
- `shelf-n-pop-expo/supabase/functions/lookup_pop/catalog_refresh_rules_test.ts`

Implemented behavior:

- Explicit UPC overrides are authoritative for reviewed fields.
- Explicit `null` values can clear stale optional fields.
- Resolved `missing_set` warnings are removed.
- Mug, Premium, Moment, and Bitty Pop! Arcade labels receive the correct product type and style.
- Legitimately unnumbered specialty styles do not receive false missing-number warnings.
- Known set aliases normalize to one canonical label while unknown verified labels remain unchanged.

Latest validation:

- TypeScript `tsc --noEmit`: passed.
- Parser regression tests: `21` passed.
- `lookup_pop`: deployed successfully after Batch 3.

## Next Batch

Review the `34` set + box-number groups that contain different normalized Pop names. Many are legitimate variants, so do not merge or change them automatically.

Start with these seven high-signal groups from the catalog audit:

1. Batman 1989 #337 - Batman & Joker versus Joker identities
2. Game of Thrones #67 - Bran Stark versus Jon Snow & Rhaegal
3. Game of Thrones #60 - Giant Wight versus Mounted White Walker
4. Harry Potter #175 - Gingerbread Harry versus Undesirable No. 1 Harry
5. Solo #248 - Han Solo versus Mudtrooper
6. Stranger Things: Season 3 #75 - Dustin Henderson versus Joyce
7. Superman (2025) #583 - Ultraman Chase versus Hammer of Boravia

For each group:

1. Query every catalog row and linked collection/checklist row separately.
2. Verify UPC, name, set, number, variant, exclusivity, vault status, and value using current sources.
3. Distinguish legitimate same-number variants from wrong names, numbers, or sets.
4. Apply confirmed live corrections in place unless a true duplicate/remap is required.
5. Add or update `catalog_parser_overrides` for every UPC-specific decision.
6. Add regression coverage for reusable parser findings.
7. Run TypeScript and parser tests, deploy `lookup_pop`, and rerun collision counts.

## Working Rules

- Use the live catalog as the current source of state; this document is a handoff snapshot.
- Keep the agreed `0.75` confidence threshold.
- Prefer official Funko or retailer product pages; use PriceCharting, hobbyDB, Figure Realm, and Hero Habit as supporting sources.
- Check accuracy, details, set, vault status, box number, and value together.
- Preserve user-owned quantity and shelf records unless a verified catalog remap requires a targeted change.
- Pair live fixes with parser or override protection so refreshes cannot recreate the problem.
- Do not revert unrelated dirty-worktree changes.

## Unpause Prompt

Resume the Shelf-n-Pop catalog cleanup in `C:\Users\mplat\source\shelf-n-pop` on branch `codex/admin-override-management`. Read `CATALOG_CLEANUP_HANDOFF_2026_07_10.md` and `CATALOG_IDENTITY_AUDIT_2026_07_10.md`, then refresh the live Supabase snapshot for project `vwlnlgqxjamkukssuajt` before editing anything. The completed batches brought missing franchises, missing sets, Standard missing numbers, and core Disney/Marvel/Star Wars broad-set rows to zero. Do not redo those batches unless live verification shows drift. Start Batch 4 by reviewing the seven high-signal set + box-number collision groups listed in the handoff, beginning with Batman 1989 #337. For each group, verify all catalog, collection, and checklist rows; distinguish legitimate variants from identity errors; review name, franchise, set, box number, variant, exclusivity, vault status, and value; and present a concise current-versus-proposed breakdown before applying changes. After approval, apply live corrections, add UPC override protection and reusable parser logic, add regression tests, run TypeScript and parser tests, deploy `lookup_pop`, and verify the live collision count. Preserve all unrelated uncommitted work.
