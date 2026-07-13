# Shelf-n-Pop State of the App

Updated: 2026-07-10
Thread/sub-project name: State of the App
Workspace: `C:\Users\mplat\source\shelf-n-pop`
Primary app: `shelf-n-pop-expo/`
Production URL checked: `https://shelf-n-pop.expo.app`

## Executive Summary

Shelf-n-Pop is in a healthy operating state. The local TypeScript check is passing, the production site responds successfully, and the newest work has shifted the project from one-off catalog repair toward a durable admin and parser-learning workflow.

The biggest product improvement since the last report is the admin reliability loop:

- Users can report item-level catalog issues from item detail.
- Admins can inspect health queues, reports, learned parser overrides, and audit history.
- Admin catalog fixes can be saved as learned UPC-specific parser overrides.
- Parser reason codes now explain why a row is considered weak, incomplete, or review-worthy.
- Parser override changes are audited.

The biggest remaining engineering risk is still concentration of logic in large files. `App.tsx` has started to shrink through extraction into `src/`, but it is still large and appears to retain older admin screen code even though the extracted admin screens are now imported. The Supabase `lookup_pop` edge function is also very large and should be split carefully once the parser-learning behavior stabilizes.

## Current Verified Status

### Git And Workspace

- Current branch: `codex/admin-override-management`
- Latest commit: `451d96b Add set total aliases for catalog cleanup`
- Tracked working tree diff at inspection time: clean
- Untracked local/generated items remain present:
  - `.codex-tools/`
  - `shelf-n-pop-expo/-`
  - `shelf-n-pop-expo/deno.lock`
  - `shelf-n-pop-expo/supabase/.temp.backup-20260707181737/`
  - `shelf-n-pop-expo/supabase/.temp/*`
  - `shelf-n-pop-expo/supabase/supabase/`
  - `supabase/`
  - `tmp_dashboard_snip.txt`

Do not bulk-delete these without checking them. Some are likely generated or local Supabase state, but `deno.lock` may be meaningful if edge-function dependency locking becomes part of the deployment workflow.

### Version And Deployment

- Local `package.json` version: `0.1.4`
- Local `app.json` version: `0.1.4`
- Local `App.tsx` app version constant: `0.1.4`
- Expo owner: `shelf-n-pops-team`
- Expo project ID: `084002f4-d6b3-422e-ace6-4add0a12bf68`
- Production URL check returned HTTP `200`
- Production response included the expected app shell markers

Important boundary: production was confirmed reachable, but this pass did not perform a deploy or independently prove that the deployed bundle displays `0.1.4`. Treat `0.1.4` as the current local app version unless a deployment check explicitly confirms the live footer or bundle version.

### Validation

The direct TypeScript check passed from `shelf-n-pop-expo/`:

```powershell
C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\typescript\bin\tsc --noEmit
```

This is the current reliable local validation handle for this checkout.

## Current App Shape

The real app remains the Expo app under `shelf-n-pop-expo/`. The root of the repo still contains support docs, migration inbox files, and some local artifacts.

### Active User-Facing Areas

- Authentication and signed-in routing
- Dashboard
- Barcode scan flow
- Manual add flow
- My Shelf
- Item detail
- Item issue reporting
- Wishlist/public profile areas
- Shared shelf
- Shelf stats
- Shelf breakdown
- Settings
- Admin console
- Admin catalog fix workflow

### Current Admin Areas

The admin console now covers four operational surfaces:

- Health: catalog rows with missing images, missing values, low parse confidence, or review flags
- Reports: open user-submitted issue reports
- Overrides: active learned parser overrides
- Audit: recent admin and parser override changes

The admin catalog fix workflow supports:

- Editing core catalog identity fields
- Editing image and estimated value fields
- Toggling review state
- Opening eBay sold-search research links
- Saving the correction back to `pop_catalog`
- Optionally learning from the fix through `catalog_parser_overrides`
- Resolving linked user reports after a successful fix

## Current Code Organization

### Extracted Source Files

Current `src/` structure:

- `src/types.ts`
- `src/lib/supabase.ts`
- `src/utils/format.ts`
- `src/domain/appHelpers.ts`
- `src/data/supabaseQueries.ts`
- `src/ui/AuthScreen.tsx`
- `src/ui/Badges.tsx`
- `src/ui/DashboardScreen.tsx`
- `src/ui/FormPrimitives.tsx`
- `src/ui/Primitives.tsx`
- `src/ui/ShellPrimitives.tsx`
- `src/ui/ShelfBreakdownScreen.tsx`
- `src/ui/ShelfStatsScreen.tsx`
- `src/ui/SignedInAppRouter.tsx`
- `src/ui/AdminScreens.tsx`

This is good progress. The project is no longer purely a monolithic `App.tsx`, and the most recent admin-health work has a clearer home in `src/ui/AdminScreens.tsx` and `src/domain/appHelpers.ts`.

### Large Files To Watch

- `shelf-n-pop-expo/App.tsx`: 8,428 lines
- `shelf-n-pop-expo/supabase/functions/lookup_pop/index.ts`: 15,684 lines
- `shelf-n-pop-expo/src/domain/appHelpers.ts`: 35,506 bytes
- `shelf-n-pop-expo/src/ui/AdminScreens.tsx`: 35,505 bytes

`App.tsx` still imports the extracted admin screens:

```tsx
import { AdminCatalogFixScreen as ManagedAdminCatalogFixScreen, AdminScreen as ManagedAdminScreen } from "./src/ui/AdminScreens";
```

However, older `AdminScreen` and admin catalog fix code still appears later in `App.tsx`. Because the app now renders the imported managed screens, that older in-file admin code should be reviewed as likely dead code and removed in a focused cleanup after one more TypeScript pass.

## Database And Supabase State

### Durable Migration Count

`shelf-n-pop-expo/supabase/migrations/` currently contains 21 migration files.

Newest durable migrations:

- `20260710_audit_catalog_parser_overrides.sql`
- `20260709_parser_reason_codes_and_learning.sql`
- `20260708_admin_audit_trail.sql`
- `20260708_admin_catalog_fix_policy.sql`
- `20260708_admin_health_console.sql`
- `20260707_shared_shelf_member_settings.sql`

### Parser Reason Codes And Learning

`20260709_parser_reason_codes_and_learning.sql` adds:

- `pop_catalog.parse_reason_codes`
- `catalog_parser_overrides`
- Admin-only RLS policies for parser overrides
- Active override indexing by UPC
- `private.compute_parse_reason_codes(...)`
- Backfill logic for rows needing parse reason codes

Current reason-code concepts include:

- `missing_title`
- `missing_franchise`
- `missing_set`
- `missing_number`
- `missing_value`
- `weak_name_cleanup`
- `generic_set_label`
- `variant_or_exclusive_title_noise`
- `confidence_floor_070`

This is a major reliability improvement because weak catalog rows can now explain themselves, and admin fixes can become repeatable parser knowledge instead of isolated row edits.

### Parser Override Auditing

`20260710_audit_catalog_parser_overrides.sql` adds audit coverage for parser override changes.

Audited actions:

- `parser_override_create`
- `parser_override_update`
- `parser_override_disable`
- `parser_override_delete`

These write to `admin_audit_events`, keeping the correction loop accountable.

### Edge Function State

`lookup_pop/index.ts` now references:

- `parse_reason_codes`
- `catalog_parser_overrides`
- override application logic
- parser score/warning output
- write-back of parse reason codes

This means the edge function is now participating in the learning loop, not just parsing and returning catalog rows.

## Migration Inbox State

`migration-inbox/` currently contains 308 files.
Files dated `2026_07_10`: 22.

Recent July 10 work includes:

- `pop_catalog_identity_collision_batch_4_harry_potter_175_2026_07_10`
- `pop_catalog_identity_collision_batch_4_game_of_thrones_60_2026_07_10`
- `pop_catalog_identity_collision_batch_4_game_of_thrones_67_2026_07_10`
- `pop_catalog_identity_collision_batch_4_batman_1989_2026_07_10`
- `pop_catalog_broad_sets_and_aliases_2026_07_10`
- `pop_catalog_standard_missing_numbers_batch_2026_07_10`
- `pop_catalog_reason_code_health_cleanup_2026_07_10`
- `pop_catalog_identity_batch_1_2026_07_10`
- `pop_catalog_lucky_cat_190_image_fix_2026_07_10`
- `pop_catalog_lucky_cat_cleanup_2026_07_10`
- `pop_catalog_star_wars_generic_set_drift_fix_2026_07_10`

This inbox is acting as the operating ledger for catalog cleanup. It remains useful, but it also needs periodic consolidation so completed SQL, staged SQL, and superseded notes do not become hard to distinguish.

## Product Health

### What Is Working Well

- The app is reachable in production.
- The local TypeScript check passes.
- App versioning is consistent locally at `0.1.4`.
- The admin console is becoming a real operating cockpit.
- User issue reports now connect collector feedback to admin repair.
- Parser overrides make fixes durable across future lookups.
- Audit history now covers both admin edits and parser override changes.
- Set completion counting has been hardened with catalog-aware ownership keys.
- Recent catalog cleanup is increasingly grouped by root cause instead of random row edits.

### Current Friction

- `App.tsx` is still too large for comfortable long-term work.
- `lookup_pop/index.ts` is very large and has high blast radius.
- Some extracted logic is duplicated or left behind in `App.tsx`.
- The admin console has useful queues, but not yet enough bulk workflow support.
- Schema docs likely lag the live schema because recent migrations added admin audit, issue reports, parser reason codes, and overrides.
- Migration inbox volume is high.
- Production version verification needs a repeatable check after deploys.

## Roadmap

### Emergency Roadmap

Use this if the app breaks, catalog parsing goes sideways, or a deployment must be stabilized quickly.

1. Confirm production health
   - Open `https://shelf-n-pop.expo.app`
   - Confirm the app shell loads
   - If possible, confirm the footer version shown in the live app

2. Run the local safety check
   - From `shelf-n-pop-expo/`, run the direct TypeScript command listed above
   - Do not deploy if this fails unless the failure is fully understood and unrelated to the deployed path

3. Check recent branch and diff
   - Confirm the branch is expected
   - Confirm whether tracked files are modified
   - Do not remove untracked Supabase or generated files during an emergency unless they are proven to be the cause

4. If catalog parsing is wrong
   - Check admin Health for low parse and review rows
   - Check admin Overrides for recent learned override changes
   - Check admin Audit for the last parser override or catalog fix actions
   - Prefer disabling a bad override over making broad parser edits during an incident

5. If user reports spike
   - Use Admin Console > Reports
   - Fix rows one at a time
   - Keep "learn from fix" enabled only when the correction is UPC-specific and likely repeatable
   - Resolve reports only after confirming the catalog row looks right

6. If deployment is suspected
   - Re-run TypeScript
   - Rebuild/deploy through the known project-local path
   - Verify production returns HTTP `200`
   - Verify the live footer or visible version if possible

7. If database migration is suspected
   - Check the newest files in `shelf-n-pop-expo/supabase/migrations/`
   - Confirm whether the migration was applied live
   - Check RLS policies if admin screens suddenly show setup errors
   - For parser override issues, inspect `catalog_parser_overrides` and `admin_audit_events`

### Short-Term Roadmap

1. Remove dead admin code from `App.tsx`
   - Confirm the imported `ManagedAdminScreen` and `ManagedAdminCatalogFixScreen` are the only rendered admin paths
   - Remove the older in-file admin components
   - Run TypeScript

2. Refresh schema documentation
   - Update `SUPABASE_SCHEMA.md`
   - Include `catalog_issue_reports`
   - Include `admin_audit_events`
   - Include `catalog_parser_overrides`
   - Include `pop_catalog.parse_reason_codes`
   - Include any admin helper functions and RLS policies added in July

3. Add admin smoke checks
   - Health tab loads
   - Reports tab loads
   - Overrides tab loads
   - Audit tab loads
   - Catalog fix save path still typechecks

4. Add parser override tests
   - Override is applied by UPC
   - Disabled override is ignored
   - Learned override clears parse reason codes only when appropriate
   - Low-confidence rows retain review signals

5. Consolidate migration inbox
   - Mark applied versus staged versus superseded files
   - Group July 10 catalog cleanup by theme
   - Promote only durable schema changes to `supabase/migrations/`

### Medium-Term Roadmap

1. Continue modularizing `App.tsx`
   - Extract Item Detail
   - Extract Manual Add
   - Extract Scan flow
   - Extract Settings
   - Keep shared helpers in `src/domain/appHelpers.ts` only when they are truly cross-screen

2. Split parser internals carefully
   - Keep edge-function behavior unchanged first
   - Move aliases, scoring, override application, and source parsing into separate modules if the Supabase edge runtime supports the structure cleanly
   - Add tests before changing parser behavior

3. Improve admin operations
   - Add search/filter to Overrides
   - Add "recently changed by me"
   - Add bulk mark-review where safe
   - Add direct links from health rows to related audit events and reports
   - Add explicit confidence/reason-code explanations in the admin fix screen

4. Strengthen value workflow
   - Keep the agreed 75% confidence threshold for value work
   - Prefer official Funko pages first
   - Use checklist sources such as Figure Realm and Hero Habit as secondary references
   - Keep item-level variant pricing on `user_collection_items.current_value`
   - Keep shared baseline value on `pop_catalog.estimated_value`

5. Add release discipline
   - Pre-deploy checklist
   - Post-deploy production version check
   - Short changelog per app version
   - Document rollback steps

## Best Next Actions

Recommended next work order:

1. Commit this report if it looks right.
2. Do a focused cleanup removing duplicated admin code from `App.tsx`.
3. Run TypeScript after that cleanup.
4. Update `SUPABASE_SCHEMA.md` to match the new admin/parser schema.
5. Add a small parser override test harness or smoke script.
6. Review and classify the July 10 migration-inbox files.
7. Deploy only after the above checks are clean and the branch scope is clear.

## Resume Prompt For A New Chat

Use this if work continues in a new task:

```text
We are working in C:\Users\mplat\source\shelf-n-pop on the Shelf-n-Pop Expo app under shelf-n-pop-expo/. The current thread/sub-project is "State of the App." Read STATE_OF_APP_2026_07_10.md first, then inspect the current git status before editing anything.

Current verified state from the report: branch codex/admin-override-management, latest commit 451d96b Add set total aliases for catalog cleanup, local app version 0.1.4, production URL https://shelf-n-pop.expo.app returned HTTP 200, and TypeScript passed using C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe .\node_modules\typescript\bin\tsc --noEmit from shelf-n-pop-expo/.

Key recent app changes: admin screens are extracted to src/ui/AdminScreens.tsx, parser/admin helpers are in src/domain/appHelpers.ts, parser reason codes and catalog_parser_overrides are live schema concepts, lookup_pop applies learned UPC overrides, admin fixes can learn from corrections, and parser override changes are audited.

Highest priority next actions: remove likely dead duplicated admin code from App.tsx after confirming the imported ManagedAdminScreen and ManagedAdminCatalogFixScreen are the only rendered paths, run TypeScript, refresh SUPABASE_SCHEMA.md for recent admin/parser tables and policies, then classify July 10 migration-inbox files.

Important constraints: do not revert or delete untracked files casually; migration-inbox is an operating ledger; keep durable catalog fixes protected by parser overrides or parser code so future refreshes do not undo them; use exact queries and source files rather than guessing current counts.
```
