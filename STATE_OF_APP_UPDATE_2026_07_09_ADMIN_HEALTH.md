# Shelf-n-Pop App Update: Admin Health, Learning Loop, Risks, and Enhancements

Generated: 2026-07-09

Workspace: `C:\Users\mplat\source\shelf-n-pop`

Production URL: `https://shelf-n-pop.expo.app`

Active app workspace: `C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo`

## Executive Summary

Shelf-n-Pop is live and operational. The latest production update added a stronger Admin Console workflow for monitoring catalog health, drilling into problem areas, fixing catalog rows, and teaching the parser from admin corrections.

The app is no longer just collecting user issue reports. It now has the beginnings of an operational feedback loop:

- users can report catalog issues,
- admin can review health signals and reports,
- admin can fix rows directly,
- fixes can create learned parser overrides,
- future catalog lookups can reuse those learned corrections,
- admin changes are audit-tracked.

Production health check after this update:

- Production URL returned `200 OK`.
- `lookup_pop` Edge Function is deployed with JWT verification enabled.
- Web app is deployed to Expo production.
- Latest production URL remains `https://shelf-n-pop.expo.app`.

## What Changed in This Update

### Admin Console Health Tiles

The Admin Console health tiles are now drillable:

- `Reports` opens the user report queue.
- `Needs Review` filters the health queue to reviewed-needed rows.
- `Low Parse` filters to low parse confidence rows.
- `No Image` filters to rows missing images.
- `No Value` filters to rows missing values.
- `Queue` returns to the broader health queue.

This makes the console more useful as an operating dashboard instead of only a static scorecard.

### Reason Codes

Catalog rows now support `parse_reason_codes`.

Current reason code examples:

- `weak_name_cleanup`
- `variant_or_exclusive_title_noise`
- `missing_number`
- `missing_franchise`
- `missing_set`
- `confidence_floor_070`
- `generic_set_label`

The Admin Console displays these reason codes as readable badges so the fix queue explains why an item is being surfaced.

### Parser Learning Loop

A new `catalog_parser_overrides` table stores learned UPC-specific corrections from admin fixes.

When `Learn from this fix` is enabled on the admin fix screen, the app saves durable parser learning data for that UPC, including identity fields such as:

- pop name
- character
- franchise
- set name
- number
- variant
- exclusivity
- pop type
- pop style
- display description

The learning loop intentionally does not save volatile value or image fields as parser learning data.

### Lookup Function Update

The `lookup_pop` Edge Function now checks learned catalog overrides when parsing a UPC.

The intended behavior is:

1. Lookup UPC.
2. Parse raw source data.
3. Apply static code-level UPC overrides.
4. Apply learned database-backed UPC overrides.
5. Save or refresh the catalog row with better confidence and cleared reason codes when appropriate.

This protects admin fixes from being undone by future lookup or refresh behavior.

### Live Health Snapshot

Current live catalog health after the update:

- Low parse rows: `13`
- Rows with reason codes: `472`
- Needs review rows: `50`
- Missing image rows: `2`
- Missing or zero value rows: `0`
- Learned parser overrides: `83`

Top reason code counts:

- `weak_name_cleanup`: `250`
- `variant_or_exclusive_title_noise`: `150`
- `missing_number`: `53`
- `missing_franchise`: `19`
- `missing_set`: `14`
- `confidence_floor_070`: `13`
- `generic_set_label`: `12`

## Current Operating Process

Recommended admin workflow:

1. Open Admin Console.
2. Start with `Low Parse`, `Needs Review`, `No Image`, or `Reports`.
3. Open one item from the queue.
4. Fix the catalog identity fields first.
5. Leave `Learn from this fix` on when the correction is UPC-specific and durable.
6. Save the row.
7. If the item came from a report, save and resolve the report.
8. Use the audit trail to confirm what changed.

This is the right operating model because it improves the live row and reduces the chance of the same issue returning later.

## Risks

### 1. App File Size

`App.tsx` is very large and now contains normal app screens, shared shelf logic, set completion logic, admin workflows, and many supporting components.

Risk:

- future UI changes are harder to isolate,
- merge conflicts are more likely,
- one mistake can affect unrelated screens.

Recommended action:

- split admin, collection, shared shelf, stats, and profile screens into separate modules once the current release settles.

### 2. Parser Function Complexity

`lookup_pop/index.ts` is also very large and now includes source lookup, fallback logic, PriceCharting enrichment, static overrides, learned overrides, image handling, confidence scoring, and refresh behavior.

Risk:

- parser fixes can have unexpected side effects,
- static overrides and learned overrides can conflict,
- hard to test all UPC/source combinations manually.

Recommended action:

- add parser snapshot tests for known UPCs,
- add duplicate override checks,
- split scoring, override application, source lookup, and value enrichment into smaller units.

### 3. Learned Override Quality

The learning loop is powerful, but it depends on admin fixes being correct.

Risk:

- an incorrect admin fix can become a durable override,
- repeated bad overrides could make future parsing look more confident than it should.

Recommended action:

- add an admin view for learned overrides,
- allow disabling or editing an override,
- audit override creation and changes clearly,
- consider requiring a note when learning is enabled for high-impact fields.

### 4. Needs Review Count Increased

The current live snapshot shows `50` needs-review rows. That is not necessarily bad; it likely means the system is now better at surfacing rows that deserve human attention.

Risk:

- admin queue may feel bigger even though quality visibility improved,
- some rows may be flagged for reasons that are not truly user-impacting.

Recommended action:

- separate severity levels:
  - blocking: missing image, missing value, missing name,
  - quality: weak cleanup, missing set, generic set,
  - informational: confidence floor only.

### 5. Reason Code Noise

`weak_name_cleanup` is the largest reason code bucket.

Risk:

- if too many rows are marked weak, the queue may feel noisy,
- admin effort may go toward cosmetic cleanup instead of user-visible issues.

Recommended action:

- tune `weak_name_cleanup` scoring,
- prioritize rows with multiple reason codes,
- prioritize rows that affect user scans, reported issues, missing values, or missing images.

### 6. Schema Documentation Drift

The app now relies on admin tables, audit tables, parser override tables, set completion tables, and issue report tables. The older schema documentation does not fully reflect the live database.

Risk:

- future work may rely on stale docs,
- RLS or migration decisions could be made from incomplete context.

Recommended action:

- regenerate Supabase schema docs after this release.

### 7. Dirty Worktree

The repo contains many active uncommitted changes and many staged/pending SQL review files.

Risk:

- difficult recovery if something is accidentally reset,
- hard to identify exactly what belongs to this release.

Recommended action:

- create a preservation branch,
- commit this release in logical groups,
- add a migration-inbox ledger for applied, pending, skipped, and archived SQL files.

## Recommended Enhancements

### Highest Priority

1. Add a learned override management screen.

Show:

- UPC
- catalog item
- fields learned
- created by
- updated by
- created date
- last updated date
- active/inactive status

Actions:

- open catalog row,
- edit override,
- disable override,
- view audit trail.

2. Add severity and priority to reason codes.

Suggested levels:

- `critical`: missing image, missing value, missing title/name
- `high`: missing franchise, missing set, missing number
- `medium`: variant/exclusive title noise, generic set label
- `low`: weak name cleanup, confidence floor only

3. Add admin trend charts.

Track:

- low parse count over time,
- needs review count over time,
- open reports over time,
- resolved reports by week,
- learned overrides created by week,
- top reason codes by week.

4. Add parser test coverage.

Start with:

- UPCs with learned overrides,
- UPCs with static overrides,
- low-parse sample rows,
- PriceCharting-only rows,
- rows with variant/exclusivity ambiguity.

5. Regenerate schema documentation.

Include:

- tables,
- views,
- functions,
- triggers,
- RLS policies,
- indexes,
- grants.

### High Priority

6. Split the Admin Console into its own module.

Suggested files:

- `src/screens/admin/AdminScreen.tsx`
- `src/screens/admin/AdminCatalogFixScreen.tsx`
- `src/screens/admin/adminQueries.ts`
- `src/screens/admin/adminTypes.ts`

7. Add admin queue sorting.

Useful sort modes:

- highest severity,
- newest report,
- lowest confidence,
- missing image first,
- missing value first,
- most reason codes,
- recently updated.

8. Add bulk admin actions.

Safe first bulk actions:

- mark selected rows as needs review,
- clear needs review for selected rows,
- assign reason code severity,
- archive duplicate reports.

Avoid bulk parser learning until override review tooling exists.

9. Add report deduplication.

If multiple users report the same UPC and issue type, group them into one admin queue item.

10. Add user-facing report status.

Let users know:

- report received,
- in review,
- resolved,
- ignored or not reproducible.

### Medium Priority

11. Add app release/version visibility.

The app still reports `0.1.3` despite meaningful production changes.

Recommended:

- bump to `0.1.4`,
- show version/build date in profile or admin,
- add an admin-only deployment note.

12. Add lightweight analytics.

Track:

- scan success/failure,
- report issue submitted,
- admin fix saved,
- learned override created,
- refresh API used,
- lookup source used.

13. Add better refresh feedback.

The refresh button works, but admin could benefit from:

- before/after fields,
- source used,
- whether learned override was applied,
- changed fields summary,
- value/image/identity separation.

14. Add image health tooling.

For the two remaining missing-image rows:

- show image source attempts,
- allow admin image URL replacement,
- add image recheck button,
- track image failures by reason.

15. Add value-source confidence.

Missing values are currently at zero, which is good. Next step is value confidence:

- source name,
- last checked,
- item-level vs catalog-level,
- variant-specific warning.

## Suggested Next Sequence

Best next work order:

1. Create a preservation branch and commit the current app/admin/parser/database work.
2. Add a learned override management view.
3. Add severity to reason codes and sort the admin queue by severity.
4. Regenerate Supabase schema documentation.
5. Bump app version to `0.1.4`.
6. Add parser snapshot tests for learned/static overrides.
7. Split admin code out of `App.tsx`.
8. Add admin trend metrics.
9. Add report deduplication and user-facing report status.
10. Continue catalog cleanup using reason-code batches.

## Bottom Line

The app is in a much stronger operational state than before this update. The Admin Console now gives you a practical way to see user-impacting catalog issues, act on them, and make the system smarter from your corrections.

The biggest risk is maintainability, not immediate functionality. The core product is live and improving, but the app and parser files are large enough that the next best investment is structure, tests, override management, and schema documentation.
