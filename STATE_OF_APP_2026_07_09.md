# Shelf-n-Pop App State and Improvement Review

Generated: 2026-07-09

Workspace: `C:\Users\mplat\source\shelf-n-pop`

Production URL: `https://shelf-n-pop.expo.app`

Active app workspace: `C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo`

## 1. Current Executive State

Shelf-n-Pop is an active Expo + React Native + Supabase app. The root folder still contains the original static prototype (`index.html`, `app.js`, `styles.css`), but the real maintained product is now the Expo app under `shelf-n-pop-expo/`.

The app is live on Expo Hosting and currently responds successfully at the production URL. A production deploy was completed after the app performance pass on 2026-07-08. The deployed app version remains `0.1.3`.

The local codebase is not clean. It contains valuable uncommitted app, parser, function, type, script, migration, and data-cleanup work. Do not reset or clean the worktree unless the work is first deliberately preserved.

Current validation from this report:

- TypeScript check: passing.
- Production URL: HTTP `200`.
- Current branch: `master`.
- Current app version: `0.1.3`.
- Current Expo project id: `084002f4-d6b3-422e-ace6-4add0a12bf68`.
- Current Expo owner: `shelf-n-pops-team`.

## 2. Current Repository Shape

### Root Workspace

- `.agents/`: local agent-related folder.
- `.codex/`: Codex local project metadata.
- `.codex-eas/`: local EAS cache/config data.
- `.codex-tools/`: local tool/support folder created during recent work.
- `.git/`: Git repo.
- `.pnpm-store/`: local package store.
- `migration-inbox/`: primary staging area for data cleanup SQL, review notes, schema work, and safe applied/pending data-maintenance artifacts.
- `shelf-n-pop-expo/`: active application workspace.
- `README.md`: older static-prototype readme.
- `PROJECT_CONTEXT.md`: early migrated app context.
- `SUPABASE_SCHEMA.md`: older schema map and now stale compared with current app/migrations.
- `CODEX_RECOVERY_NOTES.md`: earlier recovery note.
- `STATE_OF_UNION_2026_07_08.md`: prior app handoff snapshot.
- `STATE_OF_APP_2026_07_09.md`: this report.

### Active Expo Workspace

- `App.tsx`: main app file, currently about 8,235 lines.
- `src/types.ts`: app-facing Supabase/domain types.
- `src/lib/supabase.ts`: Supabase client.
- `src/utils/format.ts`: money, integer, and name formatting helpers.
- `supabase/functions/lookup_pop/index.ts`: barcode/catalog lookup Edge Function, currently about 14,952 lines.
- `supabase/functions/refresh_catalog_values/index.ts`: market value refresh Edge Function, currently about 547 lines.
- `supabase/migrations/`: durable schema/app migrations.
- `scripts/refresh-pricecharting-values.mjs`: local batch runner for PriceCharting refreshes.
- `deploy-web.cmd`: known-good web production deploy entry point.

## 3. Current Git and File State

Tracked files modified:

- `shelf-n-pop-expo/.gitignore`
- `shelf-n-pop-expo/App.tsx`
- `shelf-n-pop-expo/package.json`
- `shelf-n-pop-expo/pnpm-lock.yaml`
- `shelf-n-pop-expo/scripts/refresh-pricecharting-values.mjs`
- `shelf-n-pop-expo/src/types.ts`
- `shelf-n-pop-expo/supabase/functions/lookup_pop/index.ts`
- `shelf-n-pop-expo/supabase/functions/refresh_catalog_values/index.ts`

Current tracked diff size:

- 8 tracked files changed.
- About 15,728 insertions.
- About 905 deletions.

Untracked state:

- `STATE_OF_UNION_2026_07_08.md` is still untracked.
- `STATE_OF_APP_2026_07_09.md` is newly added by this report.
- `migration-inbox/` contains 264 files.
- `migration-inbox/` contains 32 files dated `2026_07_09`.
- There are untracked Supabase temp files under `shelf-n-pop-expo/supabase/.temp*`.
- There is an untracked `shelf-n-pop-expo/migration-inbox/` folder.
- Three newer durable migrations are untracked under `shelf-n-pop-expo/supabase/migrations/`:
  - `20260708_admin_health_console.sql`
  - `20260708_admin_catalog_fix_policy.sql`
  - `20260708_admin_audit_trail.sql`

Interpretation:

- The working tree is an active product-and-data-maintenance workspace, not a clean release branch.
- The app has been deployed successfully despite local uncommitted changes.
- Before any cleanup, create a preservation branch and group commits deliberately.

## 4. Live App and Deployment State

The app is deployed on Expo Hosting.

Production URL:

```text
https://shelf-n-pop.expo.app
```

Production verification during this report:

- HTTP status: `200`
- Response contained expected web app markers.

Known deploy flow:

```powershell
cd C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo
.\deploy-web.cmd
```

Manual equivalent:

```powershell
$env:PATH="C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin;$PWD\node_modules\.bin;$env:PATH"
.\node_modules\.bin\expo.cmd export -p web --clear
.\node_modules\.bin\eas.cmd deploy --prod
```

Important environment note:

- Global `npx`, `npm`, or `node` may not be available in every PowerShell session.
- The reliable path is the bundled Codex Node runtime plus project-local `.bin` executables.

## 5. App Package State

Package:

- Name: `shelf-n-pop-expo`
- Version: `0.1.3`
- Expo SDK: `~54.0.35`
- React: `19.1.0`
- React Native: `0.81.5`
- Supabase JS: `2.108.2`
- TypeScript: `~5.9.3`
- EAS CLI dependency: `^20.5.1`

Important runtime dependencies:

- `@supabase/supabase-js`
- `@react-native-async-storage/async-storage`
- `expo-camera`
- `@zxing/browser`
- `@zxing/library`
- `react-native-web`

Available scripts:

- `start`: Expo start.
- `android`: Expo Android start.
- `ios`: Expo iOS start.
- `web`: Expo web start.
- `typecheck`: `tsc --noEmit`.
- `refresh:values`: local PriceCharting value refresh helper.

## 6. Current App Capabilities

The active app currently includes:

- Email/password auth and session handling.
- Dashboard backed by Supabase profile/dashboard views.
- Dashboard quick actions for scanning, shelf stats, collection, shared shelf, profile/settings, and admin console when the user is an admin.
- UPC/barcode scan flow.
- Web scanner support via browser/zxing path.
- Native camera scanner support through Expo Camera.
- Catalog lookup through `lookup_pop`.
- Scan result display with image, value, metadata, and shared shelf ownership warning.
- Add to collection.
- Add and scan another.
- Add to wishlist.
- Manual add flow.
- Out-of-box/manual item creation through Supabase RPC.
- My Shelf list with search, sorting, filters, image/value/status badges, and detail navigation.
- Item detail editing.
- Item deletion.
- Quantity/condition/variant editing.
- Current value editing.
- Limited edition and production-run editing.
- Signed-item editing, including signer, authentication, certificate number, location, personalization, notes, and signed value boost.
- User profile editing.
- Avatar selection.
- Public profile view.
- Public wishlist view.
- Shared Shelf creation.
- Shared Shelf join by invite code.
- Shared Shelf member list/settings.
- Shared Shelf rename and invite reset.
- Shared Shelf member removal/leave controls.
- Shared Shelf grouped view by item across members.
- Shared Shelf owner filtering.
- Shared Shelf top-pop and totals panels.
- Shelf Stats dashboard.
- Shelf Breakdown by franchise/set.
- Set checklist completion views.
- Owned/missing/full set checklist modes.
- Set premium/boost display when completion conditions are met.
- Admin catalog health console.
- Admin user report queue.
- Admin catalog fix workflow.
- Admin audit event viewer.
- Catalog issue reporting from item detail.
- Refresh API button in admin catalog fix workflow.

## 7. Current Screen Map

Current screen routing includes:

- `dashboard`
- `scan`
- `manualAdd`
- `collection`
- `detail`
- `profile`
- `publicProfile`
- `sharedShelf`
- `sharedShelfDetail`
- `sharedShelfSettings`
- `shelfStats`
- `shelfBreakdown`
- `admin`
- `adminCatalogFix`

Major screen components:

- `AuthScreen`
- `DashboardScreen`
- `ShelfStatsScreen`
- `ShelfBreakdownScreen`
- `ScanScreen`
- `ManualAddScreen`
- `CollectionScreen`
- `SharedShelfScreen`
- `SharedShelfDetailScreen`
- `SharedShelfSettingsScreen`
- `ItemDetailScreen`
- `AdminScreen`
- `AdminCatalogFixScreen`
- `ProfileScreen`
- `PublicProfileScreen`

## 8. Performance State

A focused app performance pass has already been applied and deployed.

Current performance optimizations present:

- `useDeferredValue` is used for heavy search/filter paths.
- `CollectionListCard` is memoized with `React.memo`.
- `SharedShelfListCard` is memoized with `React.memo`.
- Personal shelf list uses `FlatList`.
- Shared shelf list uses `FlatList`.
- `FlatList` is configured with:
  - `initialNumToRender={8}`
  - `maxToRenderPerBatch={8}`
  - `windowSize={7}`
  - `removeClippedSubviews={!IS_WEB}`
- List render callbacks are stable with `useCallback`.
- Duplicate shelf key calculations are avoided unless the Duplicate filter is active.
- Shelf Stats base metrics were consolidated into a single pass instead of repeated full-list reductions/sorts.
- Shared shelf total/owner summaries are memoized.

Current performance risks:

- `App.tsx` is still extremely large.
- Admin, shelf, scanner, profile, shared shelf, and stats code all live in the same module.
- `lookup_pop/index.ts` is very large and likely difficult to reason about safely.
- Set checklist and stats logic are CPU-heavy and currently client-side.
- App data fetching is custom hook/state logic rather than a shared cache/query layer.
- Some screens still render large mapped sections inside scroll views, especially admin and breakdown detail areas.
- Large assets include a roughly 1 MB logo.

## 9. Supabase State

Older documented objects from `SUPABASE_SCHEMA.md`:

- `profiles`
- `pop_catalog`
- `user_collection_items`
- `dashboard_snapshots`
- `user_collection_view`
- `user_collection_summary_view`
- `dashboard_home_view`

Current app/migrations also rely on:

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
- `admin_users`
- `catalog_issue_reports`
- `admin_audit_events`

Current Supabase project URL:

```text
https://vwlnlgqxjamkukssuajt.supabase.co
```

Important schema gap:

- `SUPABASE_SCHEMA.md` is stale.
- It should be regenerated or replaced with a current schema export before the next major schema or RLS pass.

## 10. Durable Migrations in App Workspace

Existing app migrations under `shelf-n-pop-expo/supabase/migrations/`:

- `20260630_advisor_cleanup_shared_shelf_security.sql`
- `20260630_dashboard_average_value_metrics.sql`
- `20260630_dashboard_monthly_activity_fallback.sql`
- `20260630_normalize_dc_franchise_and_descriptions.sql`
- `20260630_restore_personal_collection_scope.sql`
- `20260630_scrub_catalog_product_format_noise.sql`
- `20260630_scrub_fantastic_four_and_possessive_names.sql`
- `20260630_scrub_foreign_and_vendor_descriptions.sql`
- `20260701_align_collection_summary_value_rule.sql`
- `20260702_add_manual_out_of_box_item.sql`
- `20260702_public_profile_collection_summary.sql`
- `20260702_public_profile_shared_wishlist.sql`
- `20260702_unique_items_include_variant.sql`
- `20260703_fix_shared_shelf_each_value_and_spiderman_price.sql`
- `20260703_harden_collection_summary_view.sql`
- `20260707_shared_shelf_member_settings.sql`
- `20260708_admin_health_console.sql`
- `20260708_admin_catalog_fix_policy.sql`
- `20260708_admin_audit_trail.sql`

Recent admin migrations add:

- `admin_users`
- private `is_admin` helper.
- `catalog_issue_reports`
- report RLS policies.
- admin update policy on `pop_catalog`.
- `admin_audit_events`
- audit triggers for admin catalog updates and report updates.

## 11. Admin Console State

The admin console is now a first-class internal app surface.

Admin access:

- App checks `admin_users` for the signed-in user.
- Admin Console link appears from Dashboard only for admins.

Admin health tab:

- Counts missing images.
- Counts missing/zero values.
- Counts low parse confidence below `0.75`.
- Counts `needs_review` rows.
- Counts open user reports.
- Shows a queue of catalog health rows.

Admin reports tab:

- Reads open rows from `catalog_issue_reports`.
- Enriches reports with catalog row data.
- Allows fixing catalog row.
- Allows resolving report.
- Allows ignoring report.

Admin audit tab:

- Reads recent `admin_audit_events`.
- Shows changed fields/action/subject/timestamp.

Admin fix workflow:

- Opens a catalog row.
- Allows editing core fields.
- Allows toggling `needs_review`.
- Allows refreshing from the API.
- Allows saving.
- Allows saving and resolving a linked report.

Important admin caveat:

- Audit triggers capture app/API edits using `auth.uid()`.
- Manual SQL changes outside the app auth context may not carry actor identity.

## 12. Catalog Lookup and Value Refresh State

`lookup_pop/index.ts` is the main barcode/catalog enrichment path.

It currently handles:

- UPC lookup.
- Existing catalog row reuse.
- Force refresh behavior.
- UPC-specific parser overrides.
- PriceCharting product/value integration.
- Variant override handling.
- Exclusivity override handling.
- Go-UPC / BarcodeLookup fallback behavior.
- Image handling.
- Parse confidence.
- `needs_review`.
- Display descriptions.
- Limited edition and release metadata.

`refresh_catalog_values/index.ts` handles value refresh batches.

Local helper:

```powershell
cd C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo
npm run refresh:values
```

Useful value-refresh helper options:

- `--limit=N`
- `--delay=MS`
- `--force`
- `--all`
- `--upcs=UPC1,UPC2`

Known value rule:

- Variant-specific owned values belong on `user_collection_items.current_value`.
- Catalog baseline values belong on `pop_catalog.estimated_value`.
- Only update `pop_catalog.estimated_value` when the catalog row itself is clearly variant-specific.
- 75% confidence is the accepted threshold for item-level variant/Chase value updates when clearly labeled.

## 13. Current Data Maintenance State

`migration-inbox/` is very active.

Current count:

- 264 files total.
- 32 files dated `2026_07_09`.

Recent July 9 themes:

- Set completion stability.
- Correcting impossible completion counts such as `17 of 16`.
- Reviewed set total batches.
- Small reviewed set total batches.
- Star Wars reviewed-set moves.
- Star Wars Phantom Menace cleanup.
- Star Wars Return of the Jedi / Rogue One repair.
- Back to the Future reviewed checklist cleanup.
- Batman/DC small reviewed set cleanup.
- Captain Marvel Goose scope correction.
- Small set checklist batches.
- Set completion screenshot/stability fix.

Important July 9 details observed:

- `pop_set_completion_stability_screenshot_fix_2026_07_09` identified impossible set completion counts and repaired data/app-side assumptions around duplicate owned rows.
- Back to the Future is now split into:
  - `Back to the Future`: reviewed `25/25`.
  - `Back to the Future Digital`: reviewed `1/1`.
  - `Back to the Future Part II: Deluxe Moment`: reviewed `1/1`.
- Batman/DC cleanup reviewed or repaired:
  - `Batman & Robin`: `4/4`.
  - `Batman Returns`: `5/5`.
  - `Batman: 80th Anniversary`: `33/33`.
  - `Batman: Arkham Asylum`: `12/12`.
- Reviewed set totals batch covered:
  - `Deadpool 30th`: 14.
  - `Deadpool Classic`: 13.
  - `Deadpool Parody`: 18.
  - `Encanto`: 11.
- Star Wars generic rows were moved into reviewed movie sets where exact evidence existed.

Repeated data-safety pattern:

- Most review notes explicitly avoid changing ownership quantities, paid values, current values, images, or vault fields unless needed.
- Parser override notes are commonly paired with data cleanup so barcode refreshes preserve corrected identities.

## 14. Scheduled Maintenance

Two active local Codex automations remain configured.

### Weekly Catalog Health Check

- ID: `weekly-shelf-n-pop-catalog-health-check`
- Status: active
- Schedule: Mondays at 9:00 AM
- Scope:
  - rows created/updated in last 7 days
  - missing franchise
  - missing `set_name`
  - missing `pop_type`
  - missing `pop_style`
  - missing number
  - missing estimated value
  - missing image
  - `needs_review`
  - low parse confidence
  - generic/noisy set labels
  - duplicate UPC/image groups
  - new franchise/set distribution
- Default action: prepare safe `migration-inbox` SQL rather than broad destructive changes.
- Deploy rule: do not deploy unless code or parser changes are made.

### Bi-weekly Value Update

- ID: `bi-weekly-shelf-n-pop-value-update`
- Status: active
- Schedule: Tuesdays at 9:00 AM every 2 weeks, starting 2026-07-14.
- Scope:
  - catalog and owned item values
  - Chase
  - Glow in the Dark Chase
  - Metallic Chase
  - Diamond Collection Chase
  - other owned variants
- Default action:
  - use item-level `user_collection_items.current_value` for variant values
  - use the 75% confidence threshold
  - create `migration-inbox` SQL and verify with follow-up selects
  - leave ambiguous matches untouched

## 15. Current Validation Commands

Run from:

```powershell
cd C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo
```

Reliable type check:

```powershell
& 'C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\node_modules\typescript\bin\tsc' --noEmit
```

Production health check:

```powershell
Invoke-WebRequest -Uri 'https://shelf-n-pop.expo.app' -UseBasicParsing -TimeoutSec 30
```

Deploy:

```powershell
.\deploy-web.cmd
```

## 16. Main Risks

### Risk 1: Codebase Concentration

`App.tsx` is doing too much. It contains routing, screen logic, UI components, data loading, domain logic, admin workflows, checklist matching, shared shelf grouping, and performance-sensitive list behavior.

Impact:

- Harder to safely change.
- Harder to test.
- Higher risk of merge conflicts.
- Slower future feature work.

### Risk 2: Parser Size and Complexity

`lookup_pop/index.ts` is about 15k lines.

Impact:

- UPC-specific overrides and generic parser rules can interact unexpectedly.
- Hard to test full behavior.
- Hard to know which cleanup is protected by parser overrides.

### Risk 3: Schema Documentation Drift

`SUPABASE_SCHEMA.md` is older than the live app.

Impact:

- New chats may trust stale schema.
- RLS/table/view assumptions may be wrong.
- Admin and set-completion objects are not represented in the old schema doc.

### Risk 4: Migration Inbox Ambiguity

`migration-inbox/` contains many files, but there is no clear applied/pending/archive ledger in the repo.

Impact:

- Easy to rerun old SQL.
- Hard to know what is live.
- Hard to resume a batch safely.

### Risk 5: Production Versioning

The app has shipped meaningful behavior changes while still reporting `0.1.3`.

Impact:

- Harder to confirm which code is live from the UI.
- Harder to communicate updates.

### Risk 6: Data and App Logic Coupling

Set completion logic depends on both catalog/checklist data and client-side matching behavior.

Impact:

- Data cleanup can reveal app counting bugs.
- Duplicate owned rows can distort completion unless identity matching is careful.

## 17. Improvement Roadmap

### Highest Priority

1. Create a preservation branch and commit logical groups.

Suggested commit groups:

- App UI/performance/admin changes.
- Supabase durable migrations.
- Edge Function parser/value refresh changes.
- Data cleanup SQL and review notes.
- State/handoff documentation.

2. Regenerate the Supabase schema documentation.

Include:

- Tables.
- Views.
- Functions/RPCs.
- RLS policies.
- Triggers.
- Grants.
- Indexes.
- Storage policies, if any.

3. Add a migration-inbox ledger.

Create a simple markdown or CSV index with:

- file name
- purpose
- status: pending/applied/skipped/archive
- applied date
- verification query/result
- related parser override status

4. Bump app version after production-impacting changes.

Suggested next version:

- `0.1.4` for admin/performance/data-quality release.

5. Add parser override tests.

At minimum:

- duplicate UPC override key check.
- known UPC parse snapshots.
- Back to the Future UPCs from July 9.
- Batman/DC UPCs from July 9.
- Star Wars moved rows from July 9.

### High Priority

6. Split `App.tsx` into modules.

Suggested structure:

```text
src/screens/
  DashboardScreen.tsx
  ScanScreen.tsx
  CollectionScreen.tsx
  ItemDetailScreen.tsx
  SharedShelfScreen.tsx
  ShelfStatsScreen.tsx
  ShelfBreakdownScreen.tsx
  AdminScreen.tsx
  ProfileScreen.tsx

src/components/
  ScreenFrame.tsx
  buttons.tsx
  cards.tsx
  badges.tsx
  listRows.tsx
  pickers.tsx

src/domain/
  collection.ts
  sharedShelf.ts
  setCompletion.ts
  catalog.ts
  signatures.ts

src/data/
  supabaseQueries.ts
  adminQueries.ts
```

7. Introduce a query/data cache layer.

React Query would help with:

- dashboard data caching
- collection refetching after item edits
- shared shelf data refresh
- admin health refresh
- retry/error behavior
- reducing duplicate loads across screens

8. Move set-completion calculations into tested domain helpers.

Candidate functions:

- `completionOwnershipKey`
- checklist match key creation
- `buildChecklistDisplayRows`
- `buildStatsGroups`
- `addSetCompletion`
- set premium calculation

9. Add app-level error boundary and user-friendly fallback.

The app currently relies heavily on alerts and local loading states.

Add:

- crash fallback screen
- reload action
- support/report action
- hidden debug details for admin/dev mode

10. Add admin dashboard trends.

Current admin is point-in-time. Add:

- health counts over time
- new reports by week
- resolved reports by week
- rows fixed by admin
- top issue types
- parser confidence trend

### Medium Priority

11. Add image optimization.

The logo is about 1 MB. Consider:

- smaller web favicon/app display asset
- optimized PNG/WebP where supported
- consistent thumbnail sizing
- image cache strategy

12. Add release notes in the app.

Show:

- version
- deployed date
- short change list
- admin-only build/debug metadata

13. Add a lightweight feedback loop for non-admin users.

Catalog issue reporting exists from item detail. Improve with:

- report status visibility
- “thanks, this is in review” messaging
- optional screenshot/image issue type
- duplicate report prevention

14. Improve scan flow resilience.

Ideas:

- show source used: catalog/cache/PriceCharting/Go-UPC/BarcodeLookup
- warn when parse confidence is low
- allow user to report wrong scan immediately
- preserve scan history for last N scans

15. Improve shared shelf invites.

Ideas:

- copy invite code button
- regenerate invite confirmation
- role labels/tooltips
- pending invite flow

16. Add offline/degraded behavior.

Ideas:

- graceful “offline” banner
- cached last collection view
- retry queue for reports/edits
- better network error messages

17. Add automated UI smoke tests.

Minimum web smoke:

- app loads
- auth screen appears when signed out
- dashboard loads for signed-in test account
- collection list renders
- shared shelf screen renders
- admin console loads for admin account

### Lower Priority

18. Add analytics.

Track:

- scan success/failure
- add to collection
- report issue
- admin fix
- shared shelf usage
- search/filter usage

19. Improve accessibility.

Review:

- button labels
- color contrast
- focus behavior on web
- screen reader labels
- touch target sizes

20. Consider moving admin-heavy tools out of the main bundle.

On web, admin code could eventually be code-split or route-split so normal users do not pay as much bundle cost for admin-only functionality.

## 18. Recommended Next Work Sequence

Best next sequence:

1. Preserve the current work.
2. Regenerate schema docs.
3. Create the migration-inbox ledger.
4. Bump version to `0.1.4`.
5. Add parser override duplicate/snapshot tests.
6. Split `App.tsx` carefully, starting with pure components and domain helpers.
7. Add React Query or another query cache.
8. Expand admin dashboard into trend/operations view.
9. Add smoke tests.
10. Continue set cleanup in small verified batches.

## 19. New Chat Resume Prompt

Use this in a new chat:

```text
We are continuing Shelf-n-Pop in C:\Users\mplat\source\shelf-n-pop. Start by reading STATE_OF_APP_2026_07_09.md, then inspect git status. The active app is shelf-n-pop-expo, not the root static prototype. The app is live at https://shelf-n-pop.expo.app and was HTTP 200 on 2026-07-09. TypeScript passed on 2026-07-09. Preserve the dirty worktree unless I explicitly ask for cleanup. Important current work includes admin console, catalog issue reports, admin audit events, performance improvements, set completion fixes, parser overrides, and many migration-inbox SQL/review files. For data work, stage SQL in migration-inbox with verification. For app work, run the direct TypeScript check before reporting done. For deploys, use shelf-n-pop-expo/deploy-web.cmd or the project-local expo/eas commands with bundled Node on PATH.
```

## 20. Practical Emergency Checklist

If the app breaks:

1. Do not reset the repo.
2. Run the direct TypeScript check.
3. Check the production URL.
4. If the issue is admin-only, inspect:
   - `admin_users`
   - `catalog_issue_reports`
   - `admin_audit_events`
   - admin RLS policies
5. If the issue is set completion, inspect:
   - `pop_sets`
   - `pop_set_checklist_items`
   - `pop_set_completion_catalog_summary`
   - client-side completion identity logic
6. If the issue is scan/catalog parsing, inspect:
   - `lookup_pop/index.ts`
   - recent UPC overrides
   - recent migration-inbox review note for that UPC/set
7. If production is stale, use `deploy-web.cmd` after type check passes.

## 21. Bottom Line

Shelf-n-Pop is functional, live, and much more capable than the original prototype. The app now has collection management, shared shelves, wishlist/public profile features, set completion tracking, signed-item support, admin health tooling, user issue reporting, and audit trails.

The biggest overall improvement opportunity is not another feature. It is operational hardening:

- preserve the current work in commits,
- document the live schema,
- classify the migration inbox,
- test parser/set-completion rules,
- split the large app and parser files into maintainable modules,
- and add a data-fetching/cache layer before the next major UI expansion.
