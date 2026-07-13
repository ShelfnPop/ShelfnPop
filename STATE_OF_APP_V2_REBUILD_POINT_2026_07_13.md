# State of the App - V2 Rebuild Point

Date: 2026-07-13
Workspace: `C:\Users\mplat\source\shelf-n-pop`
Primary app workspace: `C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo`
Branch: `codex/admin-override-management`
Production web URL: `https://shelf-n-pop.expo.app`
Expo app version: `0.1.4`

This document is a rebuild checkpoint before starting V2. It captures the current production app shape, live Supabase state, recent backend hardening, validation status, working-tree risk, and a practical V2 roadmap.

## Executive Summary

Shelf-n-Pop is currently a working Expo app backed by Supabase. The app supports account auth, dashboard metrics, barcode scanning, manual out-of-box item creation, personal collection management, wishlist/public profile flows, shared shelf collaboration, shelf stats/breakdowns, set-completion tracking, and an admin catalog health console.

The live catalog is in a strong operational state:

- `2702` catalog rows.
- `3095` collection item rows across `8` users.
- `2674` distinct catalog items currently owned.
- `3124` total collection quantity.
- Estimated collection value: `$49,298.83`.
- `0` missing catalog values.
- `0` missing catalog images.
- `0` rows currently marked `needs_review`.
- `0` low-confidence rows under `0.75`.
- `474` active parser overrides protecting cleaned catalog identities.
- `4` catalog issue reports, `0` open.
- `169` admin audit events.

The app is validated as of this checkpoint:

- TypeScript check passed.
- Expo web export passed.
- Production web smoke check returned HTTP `200`.
- Supabase CLI is available locally at version `2.109.1`.

The main caution: the working tree is dirty. There are important uncommitted app and Edge Function changes, plus several untracked migration/report artifacts from recent catalog cleanup. Do not start V2 by overwriting or resetting this workspace.

## Current Product Surface

### Core App

The active product is the Expo app in `shelf-n-pop-expo/`. The root-level static files (`app.js`, `index.html`, `styles.css`) are older prototype material and should not be treated as the current app.

Current app identity:

- Expo name: `Shelf-n-Pop`
- Slug: `shelf-n-pop`
- Version: `0.1.4`
- Bundle/package identifiers:
  - iOS: `com.shelfnpop.app`
  - Android: `com.shelfnpop.app`
- EAS project id: `084002f4-d6b3-422e-ace6-4add0a12bf68`
- Owner: `shelf-n-pops-team`
- Web bundler: Metro
- User interface style: dark
- Camera permission is configured for barcode scanning.

### Implemented User Workflows

Current navigation is handled by `src/ui/SignedInAppRouter.tsx` and includes:

- Dashboard
- Barcode scan
- Manual add / out-of-box item creation
- My Shelf collection list
- Item detail/edit/remove/sold flow
- Shelf Stats
- Shelf Breakdown by franchise or set
- Shared Shelf list
- Shared Shelf detail
- Shared Shelf settings
- Profile and settings
- Public collector profile
- Admin Console
- Admin catalog fix screen

### Key UI Modules

Current extracted UI modules:

- `src/ui/AuthScreen.tsx`
- `src/ui/DashboardScreen.tsx`
- `src/ui/ShelfStatsScreen.tsx`
- `src/ui/ShelfBreakdownScreen.tsx`
- `src/ui/AdminScreens.tsx`
- `src/ui/SignedInAppRouter.tsx`
- `src/ui/ShellPrimitives.tsx`
- `src/ui/FormPrimitives.tsx`
- `src/ui/Badges.tsx`
- `src/ui/Primitives.tsx`

Current extracted domain/data modules:

- `src/domain/appHelpers.ts`
- `src/data/supabaseQueries.ts`
- `src/lib/supabase.ts`
- `src/types.ts`
- `src/utils/format.ts`

### Main Maintainability Warning

`App.tsx` is still very large:

- `App.tsx`: `8432` lines.
- `lookup_pop/index.ts`: `15846` lines.
- `refresh_catalog_values/index.ts`: `878` lines.

V2 should not add much more behavior directly to these files. The highest-return V2 engineering move is to preserve current behavior while extracting routes, screens, scanner flows, shared shelf flows, detail/edit flows, and function parsing/pricing concerns into smaller modules.

## Live Supabase State

Project ref: `vwlnlgqxjamkukssuajt`

### Tables

Live public base tables:

- `admin_audit_events`
- `admin_users`
- `catalog_issue_reports`
- `catalog_parser_overrides`
- `dashboard_snapshots`
- `pop_catalog`
- `pop_set_checklist_items`
- `pop_sets`
- `profiles`
- `shared_shelf_members`
- `shared_shelves`
- `user_collection_items`
- `wishlist_items`

Live public views:

- `dashboard_home_view`
- `pop_set_completion_catalog_summary`
- `shared_public_profile_summary_view`
- `shared_public_wishlist_view`
- `shared_shelf_collection_view`
- `shared_shelf_grouped_collection_view`
- `user_collection_summary_view`
- `user_collection_view`

### Catalog Health

Live health query result:

- Catalog rows: `2702`
- Missing values: `0`
- Missing images: `0`
- Needs review: `0`
- Low parse confidence under `0.75`: `0`
- Missing set rows: `11`
- Missing number rows: `48`
- Missing franchise rows: `64`
- Rows still carrying `estimated_value_missing` reason code: `14`
- Latest catalog API update: `2026-07-13 02:29:13.519+00`
- Latest catalog created timestamp: `2026-07-13 02:29:13.576132+00`

Interpretation:

- The value/image/review queue is clean.
- The remaining catalog work is classification completeness, not emergency app health.
- The `14` stale `estimated_value_missing` reason codes should be cleaned because missing value count is `0`.

### Collection Health

Live collection result:

- Collection item rows: `3095`
- Users with collection rows: `8`
- Distinct catalog items owned: `2674`
- Total quantity: `3124`
- Estimated collection value: `$49,298.83`

### Parser Override / Admin Health

Live result:

- Parser overrides: `474`
- Active parser overrides: `474`
- Latest parser override update: `2026-07-12 18:59:36.890721+00`
- Catalog issue reports: `4`
- Open catalog issue reports: `0`
- Admin users: `1`
- Audit events: `169`
- Latest audit event: `2026-07-12 18:59:36.995886+00`

Interpretation:

- Parser-learning is now central to catalog stability.
- Admin fixes should continue saving active `catalog_parser_overrides`; one-off row edits are not enough.

### Value Source Mix

Top current `api_source` values:

- `pricecharting`: `1696`
- `go-upc+barcodelookup_value+pricecharting`: `602`
- `go-upc+barcodelookup_value`: `245`
- `go-upc`: `53`
- `pricecharting+pricecharting`: `18`
- `catalog_cleanup_avengers_batch_2`: `13`
- `go-upc+pricecharting`: `12`
- `barcodelookup+pricecharting`: `12`
- `go-upc+retail_fallback:funko_msrp`: `9`
- `catalog_cleanup_avengers_batch_1`: `9`

Interpretation:

- PriceCharting is still the dominant value source.
- BarcodeLookup and Go-UPC are important fallback sources.
- Manual/retail fallback values are present and should remain auditable.
- Source labels are useful but inconsistent. V2 should consider a dedicated value provenance table or normalized source metadata rather than overloading `api_source`.

### Vault Status

Current vault status distribution:

- `Active`: `2639`
- `Vaulted`: `63`

Interpretation:

- Vault status exists but is likely under-classified toward `Active`.
- V2 could treat vault status as an enrichable field with confidence/provenance, not just a parser output.

## Edge Functions

Live Edge Functions as of this checkpoint:

| Function | Version | Status | JWT | SHA |
|---|---:|---|---|---|
| `lookup_pop` | `305` | `ACTIVE` | `true` | `fb5ecd8e342242db370e885d01cb60f067baaed19dc2207d9b8580150bdb74f0` |
| `refresh_catalog_values` | `34` | `ACTIVE` | `false` | `4150fe450480ab258e1d834000037a418343853ba41b7110d6996ad738b2e4ed` |
| `quick-task` | `26` | `ACTIVE` | `true` | `1f9d30de166c2740333960f950f72588dea8c993bfb6ca9c6729b546acbe9a52` |

Important:

- Older state docs mention `lookup_pop` versions like `248` or `249`; those are now stale. Live version is `305`.
- Future Edge Function work should first check the remote version before editing/deploying.
- `lookup_pop` remains JWT-verified.
- `refresh_catalog_values` is not JWT-verified but still uses its own maintenance/admin authorization path.

### Current Edge Function Responsibilities

`lookup_pop`:

- UPC lookup and catalog matching.
- Existing-row refresh.
- Parser cleanup.
- PriceCharting matching and value extraction.
- Go-UPC and BarcodeLookup fallback product data.
- Static and database-driven parser overrides.
- Shared-UPC protection and variant-safe response behavior.
- Image fallback/upload behavior.

`refresh_catalog_values`:

- Batch value refresh.
- Retail fallback handling.
- Shared-UPC family protection.
- Maintenance-controlled value repair surface.

V2 recommendation:

- Split `lookup_pop` into parser, provider clients, pricing, image, override, and response modules.
- Keep production behavior stable while extracting. Do not redesign and refactor at the same time.

## Recent Catalog / Backend Milestones

Recent work since the older July 10 state doc:

- Missing-value rows were cleaned and ultimately brought to `0`.
- Retail fallback was used where market/sold-comp data was too thin but a current retail baseline was acceptable.
- Stale value-missing flags were partially addressed, though `14` still remain.
- Shared-UPC behavior was hardened so shared UPC families do not mutate catalog baseline values incorrectly.
- `refresh_catalog_values` now has protected shared-UPC families.
- A third-party enriched UPC bundle was handled safely by protecting current live catalog rows with overrides rather than overwriting production catalog data.
- Active parser overrides now total `474`.

Recent staged or untracked maintenance artifacts include:

- `migration-inbox/pop_catalog_missing_value_market_deep_dive_2026_07_11.md`
- `migration-inbox/pop_catalog_missing_value_market_deep_dive_2026_07_11.sql`
- `migration-inbox/pop_catalog_missing_value_market_deep_dive_second_pass_2026_07_11.md`
- `migration-inbox/pop_catalog_missing_value_market_deep_dive_second_pass_2026_07_11.sql`
- `migration-inbox/pop_catalog_missing_value_retail_fallback_2026_07_11.md`
- `migration-inbox/pop_catalog_missing_value_retail_fallback_2026_07_11.sql`
- `migration-inbox/pop_catalog_missing_value_disney_batch_2026_07_11.sql`
- `migration-inbox/pop_catalog_clear_stale_value_missing_flags_2026_07_11.sql`
- `migration-inbox/pop_catalog_zombie_thing_image_2026_07_11.sql`
- `migration-inbox/catalog_parser_overrides_enriched_upc_protection_2026_07_12.sql`

## Local Working Tree State

The branch is `codex/admin-override-management` and tracks `origin/codex/admin-override-management`.

Recent commits:

- `451d96b` Add set total aliases for catalog cleanup
- `0c1798c` Fix refresh catalog value function types
- `684b434` Add catalog cleanup review artifacts
- `7d29e5d` Harden PriceCharting refresh updates
- `91f54d1` Update admin app shell and release metadata
- `e602571` Protect lookup_pop catalog refresh cleanup
- `aeb9edd` Fix extracted shell asset path
- `47df3cd` Document admin Supabase schema addendum

Current modified files:

- `shelf-n-pop-expo/App.tsx`
- `shelf-n-pop-expo/src/ui/ShelfBreakdownScreen.tsx`
- `shelf-n-pop-expo/supabase/functions/lookup_pop/catalog_refresh_rules.ts`
- `shelf-n-pop-expo/supabase/functions/lookup_pop/catalog_refresh_rules_test.ts`
- `shelf-n-pop-expo/supabase/functions/lookup_pop/index.ts`
- `shelf-n-pop-expo/supabase/functions/refresh_catalog_values/index.ts`

Current untracked files/directories include:

- `.codex-tools/`
- `.codex/`
- `STATE_OF_APP_2026_07_10.md`
- multiple `migration-inbox/*.sql` and `migration-inbox/*.md` cleanup artifacts
- `shelf-n-pop-expo/deno.lock`
- `shelf-n-pop-expo/supabase/functions/lookup_pop/catalog_refresh_rules_shared_upc_test.ts`
- `shelf-n-pop-expo/supabase/functions/refresh_catalog_values/shared_upc_rules.ts`
- `shelf-n-pop-expo/supabase/functions/refresh_catalog_values/shared_upc_rules_test.ts`
- Supabase temp directories
- `tmp_dashboard_snip.txt`

Current diff size:

- `6` tracked files changed.
- `7130` insertions.
- `347` deletions.

Interpretation:

- This is not a clean rebuild base yet.
- Before starting V2, commit or intentionally stash/split the current backend and catalog-maintenance changes.
- The untracked function test files and shared-UPC rule file are probably important and should not be discarded.

## Validation Status

Checks run for this checkpoint:

### TypeScript

Command:

```powershell
C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\typescript\bin\tsc --noEmit
```
Working directory:

```text
C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo
```

Result: passed.

### Web Export

Command:

```powershell
$env:EXPO_NO_TELEMETRY='1'
$env:PATH='C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
.\node_modules\.bin\expo.cmd export --platform web
```

Result: passed.

Output:

- Bundled `576` modules.
- Exported to `shelf-n-pop-expo/dist`.
- Main web bundles included one large `997 kB` index bundle plus common/runtime chunks.

### Production Smoke Check

URL:

```text
https://shelf-n-pop.expo.app
```

Result:

- HTTP status `200`
- Response length `1419`

### Supabase CLI

Local bundled CLI:

```text
C:\Users\mplat\source\shelf-n-pop\.codex-tools\supabase-cli\supabase.exe
```

Version:

```text
2.109.1
```

## Known Risks and Cleanup Items

### 1. Dirty Working Tree

Risk:

- Starting V2 immediately could bury important V1 stabilization work.

Recommendation:

- Create a checkpoint commit or split into logical commits:
  - App shell / shelf breakdown fix
  - `lookup_pop` parser/value/shared-UPC hardening
  - `refresh_catalog_values` shared-UPC protection
  - Migration-inbox catalog/value artifacts
  - State/rebuild docs

### 2. `App.tsx` Still Contains Duplicate Legacy Implementations

Risk:

- Some screens now have extracted versions, but older in-file implementations still appear in `App.tsx`, including admin-related code.
- V2 work may edit the wrong version if the live routing path is not confirmed first.

Recommendation:

- Confirm each screen's live render path through `SignedInAppRouter`.
- Remove dead in-file duplicates in small PRs.
- Keep `App.tsx` as composition/wiring only.

### 3. `lookup_pop` Is Too Large

Risk:

- Parser, provider clients, images, values, overrides, and response logic are fused into one very large function.
- Small changes are high-risk and hard to test in isolation.

Recommendation:

- V2 backend extraction plan:
  - `providers/pricecharting.ts`
  - `providers/goUpc.ts`
  - `providers/barcodeLookup.ts`
  - `parser/funkoParser.ts`
  - `parser/overrides.ts`
  - `pricing/valueRules.ts`
  - `images/imageRules.ts`
  - `sharedUpc/sharedUpcRules.ts`
  - `responses/lookupResponse.ts`

### 4. Stale Reason Codes

Risk:

- Live query shows `14` rows still carrying `estimated_value_missing` in `parse_reason_codes` even though missing value count is `0`.

Recommendation:

- Run or adapt `migration-inbox/pop_catalog_clear_stale_value_missing_flags_2026_07_11.sql`.
- Verify afterward:
  - `missing_value_rows = 0`
  - `value_missing_reason_rows = 0`

### 5. Catalog Completeness Still Has Non-Emergency Gaps

Remaining gaps:

- Missing set rows: `11`
- Missing number rows: `48`
- Missing franchise rows: `64`
- Generic `Pop!` type rows: `17`

Recommendation:

- Treat these as V2 data-quality backlog.
- Continue grouped cleanup with parser overrides.
- Do not block V2 UI architecture on these unless the feature depends directly on complete set/franchise data.

### 6. Source Provenance Is Overloaded

Risk:

- `api_source` currently carries mixed labels: provider chains, manual batches, fallback labels, and cleanup batch names.

Recommendation:

- V2 should consider a `catalog_value_sources` or `catalog_enrichment_events` table.
- Keep `pop_catalog.estimated_value` as current baseline, but store evidence/provenance separately.

### 7. Value Model Needs a V2 Decision

Current rule:

- Shared catalog baseline value belongs in `pop_catalog.estimated_value`.
- Item-specific variant/condition value belongs in `user_collection_items.current_value`.

Recommendation:

- Keep this rule.
- Add explicit UI language in V2 so users understand catalog value vs their item's custom value.
- Add value confidence/provenance if possible.

## V2 Roadmap

### Phase 0 - Freeze and Preserve

Goal: create a safe rebuild base.

Actions:

1. Review current `git status`.
2. Decide whether to commit all current V1 stabilization work or split it.
3. Ensure important untracked files are either committed or deliberately ignored.
4. Create a V2 branch after the checkpoint is preserved.
5. Do not reset the current branch.

Suggested branch:

```text
codex/v2-rebuild-foundation
```

### Phase 1 - Architecture Stabilization

Goal: make the app easier to change without changing product behavior.

Actions:

1. Keep current app behavior intact.
2. Extract remaining live screens from `App.tsx`.
3. Delete confirmed dead duplicate screen implementations.
4. Move shared hooks/data loaders out of screen components.
5. Move styles into smaller screen-level style modules or a design-token layer.
6. Keep `SignedInAppRouter` or replace it with a more formal navigation layer only after screens are modular.

Success criteria:

- `App.tsx` becomes primarily app/session wiring.
- No behavior regressions.
- TypeScript and web export pass after each slice.

### Phase 2 - Backend/Parser Modularization

Goal: reduce risk in `lookup_pop` and `refresh_catalog_values`.

Actions:

1. Split provider clients from parser code.
2. Split static rules/overrides from runtime logic.
3. Keep all current regression tests.
4. Add focused tests for:
   - shared UPC families
   - explicit null overrides
   - PriceCharting UPC guard
   - BarcodeLookup fallback
   - retail fallback value parsing
5. Deploy only after local tests and TypeScript pass.

Success criteria:

- Same live behavior.
- Smaller function files.
- Easier provider-level test coverage.

### Phase 3 - Data Model and Admin V2

Goal: make catalog operations safer and more transparent.

Actions:

1. Add value provenance model or enrichment-event log.
2. Add admin filters for stale reason codes, missing franchise, missing set, missing box number, and generic type.
3. Add admin workflows for value confidence and source evidence.
4. Add parser override preview before saving.
5. Add better audit summaries for catalog row changes.

Success criteria:

- Admin can explain why a value/name/set is present.
- Manual corrections are durable and discoverable.

### Phase 4 - Product V2

Goal: improve collector experience, not just internals.

Candidate features:

- Cleaner collection navigation and persistent filters.
- Better scan result UX with duplicate/shared-shelf awareness.
- User-facing value confidence and custom item value controls.
- Set-completion views that distinguish reviewed checklists from inferred sets.
- Wishlist improvements.
- Public profile polish.
- Shared shelf comparison views.
- Better onboarding for new users.

## Emergency Roadmap

If something breaks during V2:

### App UI Broken

1. Confirm whether production still loads:
   - `https://shelf-n-pop.expo.app`
2. Run:
   - TypeScript check
   - Expo web export
3. If the issue is V2-only, deploy or revert to the last V1 production commit.
4. Do not touch live Supabase data unless the failure is data-related.

### Catalog Scan Broken

1. Check live `lookup_pop` version and status.
2. Confirm remote version before deploying.
3. Query `pop_catalog` directly for affected UPCs.
4. Check active `catalog_parser_overrides`.
5. If a row is fixed live, add or update the parser override too.
6. Verify with direct SQL readback, not only function response.

### Values Wrong or Missing

1. Query `pop_catalog.estimated_value`.
2. Query affected `user_collection_items.current_value`.
3. Determine whether the problem is catalog baseline or item-specific variant/condition.
4. Use `refresh_catalog_values` only if the UPC is not a protected shared-UPC family.
5. For manual fixes, keep evidence in `migration-inbox`.

### Shared UPC Regression

1. Check protected shared UPC rules before refreshing values.
2. Confirm `refresh_catalog_values` is still version `34` or later behavior is equivalent.
3. Do not let variant-specific lookups mutate shared catalog baseline values.

### Supabase Auth/RLS Issue

1. Check whether the failure is frontend auth, table grants, or RLS.
2. Do not add `SECURITY DEFINER` as a shortcut.
3. Verify policies include ownership checks, not only `TO authenticated`.
4. Use the admin/security migrations as reference.

## Commands for the Next Thread

Start here:

```powershell
cd C:\Users\mplat\source\shelf-n-pop
git status --short --branch
```

App validation:

```powershell
cd C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo
C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\typescript\bin\tsc --noEmit
```

Web export:

```powershell
cd C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo
$env:EXPO_NO_TELEMETRY='1'
$env:PATH='C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
.\node_modules\.bin\expo.cmd export --platform web
```

Production smoke:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri https://shelf-n-pop.expo.app -TimeoutSec 30
```

Supabase function list:

```powershell
C:\Users\mplat\source\shelf-n-pop\.codex-tools\supabase-cli\supabase.exe functions list --project-ref vwlnlgqxjamkukssuajt
```

## Suggested V2 Start Prompt

Use this in a new Codex task:

```text
We are starting Shelf-n-Pop V2 from the rebuild checkpoint at:
C:\Users\mplat\source\shelf-n-pop\STATE_OF_APP_V2_REBUILD_POINT_2026_07_13.md

Primary app workspace:
C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo

Before changing code, read the rebuild checkpoint, inspect git status, and verify the current branch/worktree. The working tree was dirty at checkpoint time, with important app and Edge Function changes plus untracked migration-inbox artifacts. Do not reset or discard anything.

Goal for V2 Phase 0:
Create a safe V2 foundation. Preserve the current working app and backend state, identify what needs to be committed or split, then propose and execute the first low-risk architecture slice.

Important current facts:
- Production URL: https://shelf-n-pop.expo.app
- App version: 0.1.4
- Branch: codex/admin-override-management
- Live lookup_pop: version 305, ACTIVE, verify_jwt=true
- Live refresh_catalog_values: version 34, ACTIVE, verify_jwt=false
- Live catalog: 2702 rows, 0 missing values, 0 missing images, 0 needs_review, 474 active parser overrides
- TypeScript passed at checkpoint
- Expo web export passed at checkpoint

V2 priorities:
1. Preserve current changes safely.
2. Reduce App.tsx size by extracting live screen logic.
3. Modularize lookup_pop carefully without behavior changes.
4. Keep catalog fixes durable through catalog_parser_overrides.
5. Keep pop_catalog.estimated_value as catalog baseline and user_collection_items.current_value for item-specific value.
```
