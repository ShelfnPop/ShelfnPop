# Codex Recovery Notes

## 1. What this app does

This project is a Funko Pop collection app for tracking a personal collection. The real app stack is FlutterFlow for the frontend and Supabase for the backend.

The app supports collection tracking, barcode lookup, catalog population, dashboard summary cards, scan/add flows, and collection browsing. A temporary static HTML prototype also exists in this workspace; it runs from `index.html`, stores edits in browser local storage, and is not the production stack.

## 2. Key frontend files

Top-level frontend/prototype files:

- `index.html`
- `styles.css`
- `app.js`

Real app/frontend workspace:

- `shelf-n-pop-expo/`

Project documentation and migration context:

- `README.md`
- `PROJECT_CONTEXT.md`
- `SUPABASE_SCHEMA.md`
- `migration-inbox/`

Other top-level project folders:

- `.agents/`
- `.codex-eas/`
- `.git/`

## 3. Key Supabase tables/views/functions

Known Supabase objects from the schema export:

- `profiles`
- `pop_catalog`
- `user_collection_items`
- `dashboard_snapshots`
- `user_collection_view`
- `user_collection_summary_view`
- `dashboard_home_view`

Foreign keys captured in the schema notes:

- `user_collection_items.pop_catalog_id` -> `pop_catalog.id`
- `user_collection_items.user_id` -> `profiles.id`
- `wishlist_items.pop_catalog_id` -> `pop_catalog.id`
- `wishlist_items.user_id` -> `profiles.id`

Important dashboard and collection views:

- `user_collection_summary_view` calculates unique items, total quantity, total collection value, total purchase cost, and total gain/loss by user.
- `user_collection_view` joins collection item rows to `pop_catalog` details and calculates per-item value, cost, total value, total cost, gain/loss, and display variant.
- `dashboard_home_view` builds a user-specific dashboard from profiles, summary data, wishlist counts, monthly additions, and dashboard snapshots.

Important note: the foreign-key export references `wishlist_items`, but the column export did not include a `wishlist_items` table. The schema export may need to be rerun or checked.

No Supabase functions were listed in the requested source files. `SUPABASE_RLS.md` is not currently present in the top-level project folder, so RLS policy details are not available from the requested sources.

## 4. Current work-in-progress areas

- Dashboard summary cards are being built and bound to `user_collection_summary_view`.
- Dashboard layout, card colors, gain/loss conditional formatting, and decimal formatting were recently worked on.
- Barcode lookup and catalog parsing need cleanup, especially around franchise, number, variant, and pop name parsing.
- Some catalog rows need manual cleanup for titles with bad vendor/franchise values, leftover words, empty parentheses, or catalog-number noise.
- Supabase schema, policies, functions, and views still need a definitive export into `migration-inbox/`.
- FlutterFlow pages and actions for Dashboard, Scan Pop, Collection, and Item Detail still need to be exported or screenshot.
- The workspace still contains a temporary static prototype while the actual app context is FlutterFlow + Supabase.

## 5. Safe next development steps

1. Export current Supabase schema, policies, functions, and views into `migration-inbox/`.
2. Add or regenerate an RLS reference file, since `SUPABASE_RLS.md` is not present at the top level.
3. Confirm whether `wishlist_items` exists in Supabase and rerun the table/column export if needed.
4. Export or screenshot FlutterFlow pages and actions for Dashboard, Scan Pop, Collection, and Item Detail.
5. Keep `SUPABASE_SCHEMA.md` as the current schema source of truth until a newer export replaces it.
6. Create a FlutterFlow implementation checklist for each page/action.
7. Patch and verify catalog parsing rules for barcode lookup and refresh flows.
8. Rebuild project documentation around the real FlutterFlow + Supabase stack rather than the temporary static prototype.

## 6. Workspace move note

This project was moved from OneDrive to:

`C:\Users\mplat\source\shelf-n-pop`

Use this path as the current project folder going forward.
