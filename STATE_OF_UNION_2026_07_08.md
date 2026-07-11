# Shelf-n-Pop State of the Union

Generated: 2026-07-08

Workspace: `C:\Users\mplat\source\shelf-n-pop`

## 1. Executive Summary

Shelf-n-Pop is now best understood as an Expo + React Native + Supabase app, with an older static HTML prototype still sitting at the repository root. The active app is in `shelf-n-pop-expo/`.

The project is in an active working state, not a clean release state. The current branch is `master`. There are large uncommitted app and parser changes, plus many untracked SQL and review files in `migration-inbox/` from recent catalog and set cleanup work. Do not discard or reset these files without a deliberate backup.

The Expo type check currently passes from `shelf-n-pop-expo/`.

The live web app deployment path is:

```text
C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo\deploy-web.cmd
```

The production Expo URL is:

```text
https://shelf-n-pop.expo.app
```

Current app version in `App.tsx` and `package.json` is `0.1.3`.

## 2. Repository Map

### Root

- `README.md`: documents the old static browser prototype.
- `PROJECT_CONTEXT.md`: migrated context from the earlier FlutterFlow + Supabase phase.
- `SUPABASE_SCHEMA.md`: older schema map exported from Supabase.
- `CODEX_RECOVERY_NOTES.md`: earlier recovery summary.
- `index.html`, `app.js`, `styles.css`: static prototype; not the active production app.
- `migration-inbox/`: active staging area for SQL, review notes, data cleanup batches, schema work, and safety notes.
- `shelf-n-pop-expo/`: active Expo app.
- `.codex-eas/`: local EAS cache/config area used by deployment.

### Active Expo App

- `shelf-n-pop-expo/App.tsx`: main application file. It currently contains screen routing, screens, data loaders, UI components, scanner flow, shared shelf flow, profile flow, stats, checklist logic, and item detail editing.
- `shelf-n-pop-expo/src/types.ts`: TypeScript types for Supabase rows and app data.
- `shelf-n-pop-expo/src/lib/supabase.ts`: Supabase client setup.
- `shelf-n-pop-expo/src/utils/format.ts`: money, integer, and display-name formatting helpers.
- `shelf-n-pop-expo/supabase/functions/lookup_pop/index.ts`: large barcode/product lookup Edge Function with catalog parsing, UPC overrides, PriceCharting enrichment, value lookup, and review-confidence behavior.
- `shelf-n-pop-expo/supabase/functions/refresh_catalog_values/index.ts`: batch value refresh Edge Function logic.
- `shelf-n-pop-expo/scripts/refresh-pricecharting-values.mjs`: local batch runner for PriceCharting refreshes through the Edge Function.
- `shelf-n-pop-expo/supabase/migrations/`: durable app migrations.
- `shelf-n-pop-expo/assets/`: app logo and avatar assets.

## 3. Current App Capabilities

The active Expo app includes:

- Auth and session-aware app shell.
- Dashboard backed by `dashboard_home_view`.
- Scan flow with web/native barcode handling.
- Barcode lookup through `lookup_pop`.
- Add-to-collection and add-to-wishlist flows.
- Manual add/out-of-box flow through Supabase RPC.
- My Collection list with sorting and filters.
- Item detail editing for quantity, condition, variant, values, limited edition metadata, and signed-item metadata.
- Profile editing with avatar selection.
- Public profile and public wishlist display.
- Shared Shelf creation, invite join, member settings, shared collection views, and shared stats.
- Shelf Stats and Shelf Breakdown screens with franchise/set grouping.
- Set checklist completion views using `pop_set_completion_catalog_summary` and `pop_set_checklist_items`.
- Limited edition, vaulted, digital, release date, and signed-item badges.

Important `App.tsx` screens currently include:

- `DashboardScreen`
- `ScanScreen`
- `ManualAddScreen`
- `CollectionScreen`
- `ItemDetailScreen`
- `ProfileScreen`
- `PublicProfileScreen`
- `SharedShelfScreen`
- `SharedShelfDetailScreen`
- `SharedShelfSettingsScreen`
- `ShelfStatsScreen`
- `ShelfBreakdownScreen`

## 4. Supabase Shape

The older `SUPABASE_SCHEMA.md` documents these original objects:

- `profiles`
- `pop_catalog`
- `user_collection_items`
- `dashboard_snapshots`
- `user_collection_view`
- `user_collection_summary_view`
- `dashboard_home_view`

The current app and migrations also rely on newer or previously missing objects, including:

- `wishlist_items`
- `shared_shelves`
- `shared_shelf_members`
- `shared_shelf_collection_view`
- `shared_shelf_grouped_collection_view`
- `shared_public_wishlist_view`
- `shared_public_profile_summary_view`
- `pop_sets`
- `pop_set_checklist_items`
- `pop_set_completion_catalog_summary`

The schema docs are therefore not fully current. Before making schema-heavy changes, export or inspect the live Supabase schema again.

Supabase project URL used by the app:

```text
https://vwlnlgqxjamkukssuajt.supabase.co
```

Environment variables are expected in `shelf-n-pop-expo/.env`:

```text
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Do not commit real `.env` values.

## 5. Current Working Tree State

As of this report:

- Branch: `master`
- Type check: passing
- Modified tracked files:
  - `shelf-n-pop-expo/.gitignore`
  - `shelf-n-pop-expo/App.tsx`
  - `shelf-n-pop-expo/package.json`
  - `shelf-n-pop-expo/pnpm-lock.yaml`
  - `shelf-n-pop-expo/scripts/refresh-pricecharting-values.mjs`
  - `shelf-n-pop-expo/src/types.ts`
  - `shelf-n-pop-expo/supabase/functions/lookup_pop/index.ts`
  - `shelf-n-pop-expo/supabase/functions/refresh_catalog_values/index.ts`
- Diff size reported by Git:
  - 8 tracked files changed
  - about 11,907 insertions and 595 deletions
- There are many untracked files in `migration-inbox/`, mostly SQL and review markdown from recent catalog, set checklist, release/vault, signed-item, and value work.
- There is also an untracked `shelf-n-pop-expo/migration-inbox/` folder and Supabase temp/backup files under `shelf-n-pop-expo/supabase/`.

Treat the dirty tree as valuable work in progress. If a new chat needs a clean baseline, make a branch and/or archive first.

## 6. Recent Work Themes

Recent project activity is concentrated in these lanes:

- Catalog identity cleanup: franchise, set, number, variant, exclusivity, pop type, pop style, release date, vault status, and display descriptions.
- Set checklist coverage: many `pop_set_checklists_*` files, especially Star Wars, Superman/DC, Toy Story, Stranger Things, Deadpool, Marvel, Game of Thrones, and other batches.
- Reviewed set totals and completion denominator fixes.
- Shared Shelf functionality and settings.
- Public profile and public wishlist views.
- Signed-item support on owned collection rows.
- Limited edition and production-run metadata.
- PriceCharting value enrichment and review thresholds.
- Parser overrides in `lookup_pop` to prevent future scans/refreshes from reverting cleaned catalog identities.

User preference that matters most for ongoing cleanup:

- Prioritize missing or incorrect set coverage before broad catalog polish.
- Keep variant-specific values on `user_collection_items.current_value`.
- Keep shared catalog baseline values on `pop_catalog.estimated_value` unless the catalog row itself is variant-specific.
- Use a 75% confidence threshold for item-level variant/Chase value updates when clearly labeled.
- Stage risky data work in `migration-inbox/` before applying broadly.

## 7. Scheduled Maintenance

Two active local Codex automations exist:

### Weekly Catalog Health Check

- ID: `weekly-shelf-n-pop-catalog-health-check`
- Status: active
- Schedule: Mondays at 9:00 AM
- Scope: catalog rows created or updated in the last 7 days, missing fields, noisy set labels, duplicate UPC/image groups, parse confidence, `needs_review`, and recommended safe cleanup SQL.
- Important instruction: do not deploy unless code or parser changes are made.

### Bi-weekly Value Update

- ID: `bi-weekly-shelf-n-pop-value-update`
- Status: active
- Schedule: Tuesdays at 9:00 AM every 2 weeks, starting 2026-07-14
- Scope: catalog and owned item values, prioritizing variants and Chase-like owned variants.
- Important instruction: use item-level `user_collection_items.current_value` for variant-specific market values and apply only after migration-inbox SQL plus verification.

If asked about schedules in a future chat, re-read:

```text
C:\Users\mplat\.codex\automations\weekly-shelf-n-pop-catalog-health-check\automation.toml
C:\Users\mplat\.codex\automations\bi-weekly-shelf-n-pop-value-update\automation.toml
```

## 8. Validation Commands

Run from:

```text
C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo
```

Type check:

```powershell
& 'C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\node_modules\typescript\bin\tsc' --noEmit
```

Package script equivalent:

```powershell
npm run typecheck
```

Start Expo:

```powershell
npm run web
```

Deploy web:

```powershell
.\deploy-web.cmd
```

Batch value refresh helper:

```powershell
npm run refresh:values
```

Useful batch options in `scripts/refresh-pricecharting-values.mjs`:

- `--limit=N`
- `--delay=MS`
- `--force`
- `--all`
- `--upcs=UPC1,UPC2`

## 9. Data Safety Rules

For SQL and catalog work:

1. Prefer `migration-inbox/` SQL files first.
2. Include verification `select` queries in the SQL file where possible.
3. Avoid destructive broad updates without a narrow `where` clause and review note.
4. Update `lookup_pop` UPC overrides when fixing identities so future scans do not regress the same rows.
5. Keep convention labels in `exclusivity`, not `variant`.
6. Avoid using `Common` as a meaningful display/stat variant.
7. Call out image updates separately from value or identity updates.
8. For set cleanup, define the denominator clearly before marking a set reviewed.
9. If confidence is below the agreed threshold, leave the row untouched and summarize it as a review candidate.

## 10. New Chat Resume Guide

Use this prompt to resume cleanly:

```text
We are continuing Shelf-n-Pop in C:\Users\mplat\source\shelf-n-pop. Start by reading STATE_OF_UNION_2026_07_08.md, then inspect git status and the latest migration-inbox files before editing. The active app is shelf-n-pop-expo, not the root static prototype. Type check was passing as of 2026-07-08. Preserve the dirty worktree unless I explicitly ask you to clean it. For data work, stage SQL in migration-inbox and verify with selects. For variant/Chase values, use user_collection_items.current_value and the 75% confidence threshold. For parser/catalog identity fixes, update lookup_pop overrides so future scans preserve the corrections.
```

If the next task is UI/app work:

```text
Focus on shelf-n-pop-expo/App.tsx and related types. Preserve parity between My Shelf and Shared Shelf where applicable. Run the Expo type check before reporting done. Deploy with shelf-n-pop-expo/deploy-web.cmd only after validation and explicit approval.
```

If the next task is catalog/set cleanup:

```text
Use migration-inbox as the staging area. Prefer official Funko pages first, then checklist sources such as Figure Realm, Hero Habit, FunkyPriceGuide, or other credible references. Prioritize missing or incorrect set coverage. Update live rows only when the evidence is high-confidence, include verification queries, and add parser overrides for UPC-specific corrections.
```

If the next task is value refresh:

```text
Use PriceCharting or another credible market source. Separate catalog baseline values from owned variant values. Use user_collection_items.current_value for item-level Chase/variant values. Use 75% confidence as the operating threshold and report updated, skipped, missing-market-data, and image-change counts separately.
```

## 11. Emergency Roadmap

### If the App Is Broken

1. Do not reset the repo.
2. Run the type check from `shelf-n-pop-expo/`.
3. If the error is in `App.tsx`, inspect the nearest changed screen/helper first.
4. If the app fails at runtime after a schema change, compare `src/types.ts`, `App.tsx` selects, and the live Supabase view columns.
5. If the live web app is stale, run `deploy-web.cmd` only after the local type check passes.

### If Deployment Fails

1. Use `shelf-n-pop-expo/deploy-web.cmd`.
2. Confirm dependencies are installed in `shelf-n-pop-expo/node_modules`.
3. Confirm `.env` exists and has Supabase public URL/key.
4. Check EAS config in `shelf-n-pop-expo/eas.json`.
5. If EAS auth or network blocks deployment, stop and capture the exact error instead of retrying blindly.

### If Catalog Data Looks Wrong

1. Identify whether the problem is the live row, a staged SQL file, or parser behavior.
2. For one-off identity corrections, patch the row and add/update a `CATALOG_OVERRIDES_BY_UPC` entry in `lookup_pop`.
3. For broad issues, stage SQL in `migration-inbox/`.
4. Verify with `select` queries before and after.
5. Leave ambiguous rows in `needs_review` rather than forcing a guess.

### If Values Look Wrong

1. Check whether the value is catalog-level or item-level.
2. For Chase, signed, glow, metallic, diamond, flocked, or other owned variant values, prefer `user_collection_items.current_value`.
3. Do not overwrite `pop_catalog.estimated_value` unless the catalog row is clearly variant-specific.
4. Require credible market evidence and the 75% confidence threshold before applying item-level updates.
5. Report images separately from prices.

### If Set Completion Looks Wrong

1. Inspect `pop_sets`, `pop_set_checklist_items`, and `pop_set_completion_catalog_summary`.
2. Confirm whether the set is `draft` or `reviewed`.
3. Confirm `required_count` matches the intended checklist denominator.
4. Confirm owned rows match by catalog ID, UPC, number/name, and meaningful variant.
5. Avoid marking large mixed franchises reviewed until the denominator is intentionally scoped.

### If Shared Shelf Looks Wrong

1. Check `shared_shelves`, `shared_shelf_members`, `shared_shelf_collection_view`, and `shared_shelf_grouped_collection_view`.
2. Confirm the current user is a member of the shelf.
3. Check whether a view is filtering by owner instead of all shelf members.
4. Preserve UI parity with My Shelf where practical.

### If You Need to Preserve Work Fast

1. Copy or commit nothing automatically unless asked.
2. Capture:
   - `git status --short`
   - `git diff --stat`
   - latest files in `migration-inbox/`
   - whether type check passes
3. If allowed, create a branch with prefix `codex/`.
4. If allowed, stage or commit the work in logical groups:
   - app/UI changes
   - parser/function changes
   - schema migrations
   - catalog SQL/review artifacts

## 12. Known Follow-ups

- Refresh the Supabase schema docs because `SUPABASE_SCHEMA.md` is behind the live app shape.
- Decide which `migration-inbox/` SQL files have been applied, which are pending, and which are archival evidence only.
- Deploy the updated `lookup_pop` Edge Function after parser override work, if not already done from a CLI-enabled environment.
- Reconcile root `migration-inbox/` versus `shelf-n-pop-expo/migration-inbox/`.
- Decide whether signed-item SQL in `migration-inbox/` has been applied live and whether a durable migration should be added under `shelf-n-pop-expo/supabase/migrations/`.
- Consider splitting `App.tsx` into screen/component modules after the current work settles. Do this only as a deliberate refactor, not during urgent bug fixes.
