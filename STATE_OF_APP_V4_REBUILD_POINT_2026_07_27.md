# State of the App - V4 Rebuild Point

Date: 2026-07-27
Workspace: `C:\Users\mplat\source\shelf-n-pop`
Primary app workspace: `C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo`
Branch: `codex/v2-rebuild-foundation`
Rebuild anchor commit: `58c539d Align Aladdin catalog refresh overrides`
Production web URL: `https://shelf-n-pop.expo.app`
Expo app version: `4.0.0`

This is the V4 rebuild checkpoint for Shelf-n-Pop after the V3 page-by-page polish, V4 dashboard/login refresh, Pop Hunt flow improvements, shared shelf cleanup, and catalog refresh hardening. It is meant to be the practical "known good" product snapshot if the app needs to be rebuilt, audited, or continued from a stable point.

## Executive Summary

Shelf-n-Pop is now positioned as a collector companion app for tracking the shelf, building verified sets, planning family Pop Hunts, sharing collections, and keeping catalog data cleaner over time.

The V4 line moved the app from heavy analytical screens toward a friendlier collector flow:

- Dashboard is cleaner and mode-aware.
- Set Progress leads with verified progress and next actions.
- My Shelf and Shared Shelf have more approachable icons, labels, and navigation.
- Pop Hunts now use a hub-and-trip flow instead of one crowded planning page.
- Memory Lane is the home for completed hunt history.
- Catalog refresh logic is more durable for reviewed identities, descriptions, set totals, shared UPCs, and parser warning cleanup.

Version `4.0.0` is currently stamped in:

- `shelf-n-pop-expo/package.json`
- `shelf-n-pop-expo/app.json`
- `shelf-n-pop-expo/App.tsx`
- `shelf-n-pop-expo/src/ui/DashboardScreen.tsx`
- `shelf-n-pop-expo/src/ui/ShelfStatsScreen.tsx`

Known small cleanup: `shelf-n-pop-expo/src/ui/ShellPrimitives.tsx` still has a fallback footer default of `0.3.24`, but screens normally pass the app version explicitly.

## Validation At This Checkpoint

The rebuild anchor commit was pushed to GitHub on branch `codex/v2-rebuild-foundation`.

Validation passed:

- Expo TypeScript check: passed.
- Catalog refresh regression tests: `262 passed`, `0 failed`.
- Shared UPC catalog tests: `8 passed`, `0 failed`.

The catalog tests were run with temporary Deno via `pnpm dlx deno-bin` because Deno is not installed globally in this workspace. Tests used `--no-lock --no-check` because the checked-in Deno lock format is newer than the temporary Deno runtime can read.

## V4 User Experience State

### Login

The login page now uses the Shelf-n-Pop identity more directly:

- centered brand mark and title.
- cleaner dark presentation.
- simple email/password flow.
- account creation and password recovery actions remain available.

The layout is improved from the earlier full-width form treatment, but the page can still be refined later with a warmer collector-facing welcome message and tighter mobile spacing.

### Dashboard

The dashboard is the main collector home and is stamped as V4.

Current dashboard intent:

- show the user's personal recap and shelf value first.
- keep collector mode context visible without letting it dominate.
- use mode-specific direction for Casual Collector, Avid Fan, and Value Tracker.
- make the core next actions obvious: Scan Pop, Set Progress, My Shelf, Shared Shelf, Pop Hunts, Profile & Settings.

The dashboard should stay focused on "what I have, what changed, what should I do next" rather than becoming an admin or analytics page.

### Collector Modes

The app still supports three modes:

- Casual Collector: lighter shelf browsing, recent adds, shared fun.
- Avid Fan: set building, verified sets, missing Pops, close sets.
- Value Tracker: collection value, trade/sell status, sale tracking, market shelf.

Mode selection affects dashboard copy, visual emphasis, and priority actions. The goal is to let the same app feel useful to different collecting styles without fragmenting core navigation.

### Set Progress

Set Progress is now the main home for the Avid Fan path.

Current behavior and design intent:

- verified complete sets are separated from loose or unreviewed groups.
- false complete sets are reduced through set-completion eligibility rules.
- "Sets Within Reach" and "Pops to Find Next" are the primary action lists.
- set rows should drill into owned vs missing recap, not route to a generic shelf dump.
- small verified/certified badges give confidence to reviewed sets.
- set organizer no longer relies on a decorative emoji-style icon in the CTA.

Catalog data now better supports set completion by keeping reviewed set names, set totals, franchise assignments, and display descriptions durable during lookup refresh.

### My Shelf

My Shelf has been polished for a more collector-friendly browsing experience:

- action labels and icons are more consistent.
- shelf entry points are larger and easier to understand on phone screens.
- text truncation was reduced where titles were too tight.
- shelf breakdown and drillable group flows are positioned as organizer tools.

The My Shelf experience should keep moving toward fast browsing, filtering, and item detail confidence rather than raw table-style reporting.

### Shared Shelf

Shared Shelf supports family/group collecting:

- shared shelf value and member totals.
- top Pops across the group.
- franchise and set totals.
- member filters.
- setup and settings flows.
- repaired member unlink/leave behavior.

The shared shelf removal/leave action now uses the themed language "Step Off Shelf."

### Shelf Stats And Shelf Breakdown

Shelf Stats and Shelf Breakdown were tuned to match the dashboard color direction and to keep information flow clearer:

- recap stats live near the top.
- sets and next targets are within easier reach.
- breakdown is cleaner and more functional for avid users.
- franchise and set grouping remains available.
- group rows can be opened to inspect underlying Pops.

### Trade & Sell

Value Tracker mode includes Trade & Sell:

- Active, For Sale, Trades, and Sold views.
- asking and sold net rollups.
- item detail status for keeping, for sale, open to trade, or sale/trade.
- sale/trade flow is intentionally driven from item detail or scan result context, while Trade & Sell acts as the portfolio view.

Future polish should make the empty market shelf state more helpful by pointing users to the exact flow for marking items.

### Pop Hunts

Pop Hunts are now a core experience, not a side feature.

Current flow:

- Pop Hunt hub starts with Create a New Trip, Current Trips, and Memory Lane.
- Create a New Trip should begin with prompts and a fresh planning state.
- Current Trips opens selected active trips.
- Memory Lane stores completed trips and trip memories.
- Multiple active trips are allowed.
- Trip pages support route stops, stop details, finds, notes, photos, and memory notes.
- Stops can be added manually when an extra place pops up.
- Free store search supports ZIP/radius/type and name search, with manual add as fallback.
- Directions/map handoff exists but still needs another pass for address reliability.

Item detail can show where and when a Pop was found on a trip.

Known Pop Hunt follow-up:

- Current trip screens can still become dense when many stops/finds are present.
- Create New Trip should continue shifting toward a guided prompt flow.
- Map handoff should prefer complete address query strings and expose Apple/Google options clearly.

### Image Assist And Scan Pop

Scan Pop remains the main add/update path.

Current state:

- UPC scan/catalog matching remains the trusted default.
- OCR can match existing catalog records.
- Gemini image assist worked better than the OpenAI image path during testing.
- OpenAI image path hit quota limits.
- AI box image flow caused browser crashes and should stay behind Advanced Photo Tools.
- AI results need guarded add-to-catalog/add-to-shelf behavior with user review.

The V4 direction is: keep UPC and reviewed catalog data as the reliable path, use AI as an assistant, and avoid making AI the primary catalog authority until it is more stable.

## Catalog And Data Quality State

The catalog refresh rules are significantly more durable than the early V3 state.

Current improvements include:

- reviewed identities survive refresh.
- shared UPC identities are protected.
- value resolution keeps catalog values and response-only variant values separate.
- reviewed description metadata can be preserved.
- parser warning cleanup is safer when enrichment fills missing fields.
- Encanto and Aladdin reviewed audit updates are aligned with the durable set-total rules.
- set total overrides and scoped set labels reduce false completion.
- broad generic buckets such as Marvel/DC/Star Wars are less likely to swallow specific reviewed sets.
- new parser/display description helpers improve catalog presentation.

Recent V4 catalog hardening touched:

- `shelf-n-pop-expo/supabase/functions/lookup_pop/catalog_refresh_rules.ts`
- `shelf-n-pop-expo/supabase/functions/lookup_pop/index.ts`
- `shelf-n-pop-expo/supabase/functions/lookup_pop/catalog_refresh_rules_test.ts`
- `shelf-n-pop-expo/supabase/functions/lookup_pop/catalog_refresh_rules_shared_upc_test.ts`

## Supabase State

Important Supabase areas:

- Auth profiles.
- personal collection items.
- catalog lookup and refresh functions.
- dashboard summary views.
- shared shelves and shared shelf members.
- set completion eligibility.
- trade/sell status.
- Pop Hunt tables and photo storage.
- daily catalog check functions.
- admin health and catalog repair workflows.

Important Edge Functions:

- `lookup_pop`
- `analyze_pop_image`
- `daily_catalog_check`
- `refresh_catalog_values`

Important migration families:

- collector mode: `20260713_collector_mode_profiles.sql`
- trade/sell: `20260713_trade_sell_value_tracker.sql`
- set completion: `20260714_set_completion_eligibility*.sql`
- Pop Hunts: `20260715_funko_hunt_*.sql`, `20260716233347_allow_multiple_funko_hunts_per_month.sql`
- daily catalog check: `20260718_daily_catalog_*.sql`
- shared shelf unlink: `20260718_shared_shelf_owner_member_unlink.sql`
- signed value flow: `20260720_signed_value_*.sql`

Before applying migrations to production, confirm remote migration history because earlier rebuild notes warned that local migration files and remote migration state may not perfectly match.

## Current Key Modules

App entry:

- `shelf-n-pop-expo/App.tsx`

Extracted UI modules:

- `shelf-n-pop-expo/src/ui/AdminScreens.tsx`
- `shelf-n-pop-expo/src/ui/AuthScreen.tsx`
- `shelf-n-pop-expo/src/ui/Badges.tsx`
- `shelf-n-pop-expo/src/ui/DashboardActionTile.tsx`
- `shelf-n-pop-expo/src/ui/DashboardScreen.tsx`
- `shelf-n-pop-expo/src/ui/FormPrimitives.tsx`
- `shelf-n-pop-expo/src/ui/Primitives.tsx`
- `shelf-n-pop-expo/src/ui/SharedShelfSettingsScreen.tsx`
- `shelf-n-pop-expo/src/ui/ShelfBreakdownScreen.tsx`
- `shelf-n-pop-expo/src/ui/ShelfStatsScreen.tsx`
- `shelf-n-pop-expo/src/ui/ShellPrimitives.tsx`
- `shelf-n-pop-expo/src/ui/SignedInAppRouter.tsx`

Domain/data modules:

- `shelf-n-pop-expo/src/data/supabaseQueries.ts`
- `shelf-n-pop-expo/src/domain/appHelpers.ts`
- `shelf-n-pop-expo/src/lib/supabase.ts`
- `shelf-n-pop-expo/src/types.ts`
- `shelf-n-pop-expo/src/utils/format.ts`

## Known Worktree State

At this checkpoint, tracked app changes are committed and pushed at `58c539d`.

There are still many untracked historical artifacts in the workspace:

- older State of App markdown files.
- root `migration-inbox/` SQL, readback, image, and audit artifacts.
- `shelf-n-pop-expo/migration-inbox/` catalog cleanup SQL artifacts.
- `shelf-n-pop-expo/.codex-tmp/`.

These were intentionally left unstaged. Do not use destructive git cleanup commands unless the goal is explicitly to archive or remove those artifacts.

## Rebuild Notes

If rebuilding from V4:

1. Start from branch `codex/v2-rebuild-foundation` at commit `58c539d`.
2. Restore/install dependencies in `shelf-n-pop-expo`.
3. Confirm Supabase environment variables are present.
4. Confirm production Supabase migrations before pushing database changes.
5. Run app TypeScript checks.
6. Run catalog refresh tests before changing parser/catalog behavior.
7. Keep AI image assist behind Advanced Photo Tools until browser crash behavior is resolved.
8. Continue extracting large screens from `App.tsx` using the existing `SharedShelfSettingsScreen`, `DashboardScreen`, and `ShelfStatsScreen` patterns.
9. Keep user-facing flows warm and collector-oriented; avoid drifting back into spreadsheet-style screens unless the page is explicitly admin or reseller-focused.
