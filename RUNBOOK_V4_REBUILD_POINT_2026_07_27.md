# Shelf-n-Pop V4 Rebuild Runbook

Date: 2026-07-27
Workspace: `C:\Users\mplat\source\shelf-n-pop`
App workspace: `C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo`
Branch: `codex/v2-rebuild-foundation`
Known good commit: `58c539d Align Aladdin catalog refresh overrides`
App version: `4.0.0`
Production web URL: `https://shelf-n-pop.expo.app`

Use this runbook when you need to rebuild, verify, continue, or recover the V4 Shelf-n-Pop app from the current stable point.

## 1. Restore The Code Point

From `C:\Users\mplat\source\shelf-n-pop`:

```powershell
git fetch
git checkout codex/v2-rebuild-foundation
git pull
git rev-parse --short HEAD
```

Expected anchor:

```text
58c539d
```

Important: the workspace contains many untracked historical `migration-inbox` and state files. Do not run `git clean`, `git reset --hard`, or broad checkout commands unless intentionally discarding local artifacts.

## 2. Confirm Runtime Tools

Normal Node may not be on PATH in this desktop environment. The bundled runtime used during V4 validation was:

```text
C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe
```

Bundled fallback PNPM:

```text
C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd
```

If commands fail because `node`, `pnpm`, or `tsc` are not found, prepend the bundled Node path:

```powershell
$env:PATH='C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
```

## 3. Install Or Confirm Dependencies

From `C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo`:

```powershell
$env:PATH='C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
npm install
```

If using PNPM instead:

```powershell
$env:PATH='C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback;' + $env:PATH
pnpm install
```

## 4. Environment Variables

The app depends on Supabase configuration. Confirm the local environment has the project URL and anon key expected by `shelf-n-pop-expo/src/lib/supabase.ts`.

Before testing Edge Functions or app login flows, confirm Supabase secrets in the platform:

- Gemini API key for image assist if using AI photo tools.
- OpenAI API key only if re-enabling/testing the OpenAI image path.
- Any PriceCharting/value refresh credentials if used by the current deployment.

Do not move AI image assist out of Advanced Photo Tools until crash behavior has been retested.

## 5. Local App Validation

From `C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo`:

```powershell
$env:PATH='C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
.\node_modules\.bin\tsc.cmd --noEmit
```

Expected V4 checkpoint result: pass.

To run the Expo web app locally:

```powershell
$env:PATH='C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH
npm run web
```

Then inspect:

- Login.
- Dashboard.
- Set Progress.
- My Shelf.
- Shared Shelf.
- Shelf Stats.
- Shelf Breakdown.
- Scan Pop.
- Trade & Sell.
- Pop Hunt hub.
- Create New Trip.
- Current Trip.
- Stop Detail.
- Memory Lane.
- Item Detail.
- Admin Console.

## 6. Catalog Function Validation

Deno is not installed globally in the current workspace. V4 used temporary Deno via `pnpm dlx deno-bin`.

From `C:\Users\mplat\source\shelf-n-pop\shelf-n-pop-expo`:

```powershell
$env:PATH='C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback;' + $env:PATH
& 'C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' dlx deno-bin test --no-lock --no-check supabase/functions/lookup_pop/catalog_refresh_rules_test.ts
```

Expected V4 checkpoint result:

```text
262 passed | 0 failed
```

Then run the shared UPC protections:

```powershell
$env:PATH='C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback;' + $env:PATH
& 'C:\Users\mplat\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd' dlx deno-bin test --no-lock --no-check supabase/functions/lookup_pop/catalog_refresh_rules_shared_upc_test.ts
```

Expected V4 checkpoint result:

```text
8 passed | 0 failed
```

Reason for flags:

- `--no-lock`: temporary Deno could not read the current lockfile format.
- `--no-check`: test runtime validation is reliable here, while full Deno typecheck is blocked by older fixture/lock/runtime friction.

## 7. Supabase Database Caution

Before applying migrations to production, inspect remote migration history. Prior rebuild notes warned that local migration files and remote Supabase migration state may not perfectly match.

Important migration families:

- collector modes: `20260713_collector_mode_profiles.sql`
- trade/sell: `20260713_trade_sell_value_tracker.sql`
- set completion: `20260714_set_completion_eligibility*.sql`
- Pop Hunts: `20260715_funko_hunt_*.sql`
- multiple active hunts: `20260716233347_allow_multiple_funko_hunts_per_month.sql`
- daily catalog check: `20260718_daily_catalog_*.sql`
- shared shelf unlink: `20260718_shared_shelf_owner_member_unlink.sql`
- signed value flow: `20260720_signed_value_*.sql`

Do not blindly run every SQL file in `migration-inbox/`. Many files are audit notes, historical repair batches, readbacks, or one-off cleanup artifacts.

## 8. Supabase Edge Functions

Important functions:

- `supabase/functions/lookup_pop`
- `supabase/functions/analyze_pop_image`
- `supabase/functions/daily_catalog_check`
- `supabase/functions/refresh_catalog_values`

Before deploying an Edge Function:

1. Run the relevant local tests.
2. Confirm required Supabase secrets.
3. Confirm no AI image path is being promoted unintentionally.
4. Deploy one function at a time.
5. Test from the app, not just from function logs.

## 9. Production Publish Checklist

Before publishing app updates:

1. Confirm `package.json`, `app.json`, and `App.tsx` show the intended version.
2. Run `tsc --noEmit`.
3. Run catalog tests if lookup, parser, UPC, set, value, or catalog description behavior changed.
4. Open the app locally and check core phone-sized screens.
5. Confirm Supabase migrations/functions needed by the app are live.
6. Publish with the project's normal Expo/EAS flow.
7. Verify the production URL after publish.

The production URL currently documented is:

```text
https://shelf-n-pop.expo.app
```

## 10. Smoke Test Script

After a rebuild or publish, manually verify:

- Login works with a known account.
- Dashboard loads value, recap, and mode context.
- Dashboard quick actions route correctly.
- Set Progress opens and rows drill into set recap/missing behavior.
- My Shelf opens and item detail loads.
- Shared Shelf opens and settings are accessible.
- Shelf Stats and Shelf Breakdown load without empty states for known data.
- Scan Pop can find a known UPC.
- Item detail can save edits.
- Trade & Sell tabs load and item market status can be changed.
- Pop Hunt hub shows Create, Current Trips, and Memory Lane.
- New Trip starts fresh.
- Existing Current Trip opens.
- Stop Detail supports notes/finds/photos.
- Memory Lane shows completed trip finds beyond the previous 8-item limit.
- Admin Console loads for an admin account.

## 11. Known V4 Follow-Ups

Keep these in the queue after the rebuild point:

- Change `ShellPrimitives` fallback footer version from `0.3.24` to `4.0.0`.
- Continue simplifying dense Current Trip pages.
- Improve map handoff so full addresses land in Google/Apple Maps.
- Keep polishing Create New Trip into a guided prompt flow.
- Add safer user-reviewed add-to-catalog/add-to-shelf from AI or OCR results.
- Re-test AI photo tools for browser crash behavior before making them prominent.
- Consider archiving or organizing old `migration-inbox` artifacts so future status checks are quieter.

## 12. Recovery Rule Of Thumb

If something goes sideways, return to:

```text
branch: codex/v2-rebuild-foundation
commit: 58c539d
version: 4.0.0
```

Then run:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
```

and the two catalog tests listed above before making new changes.
