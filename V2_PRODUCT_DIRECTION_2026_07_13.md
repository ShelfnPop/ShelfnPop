# Shelf-n-Pop V2 Product Direction

Date: 2026-07-13
Workspace: `C:\Users\mplat\source\shelf-n-pop`
Starting checkpoint: `STATE_OF_APP_V2_REBUILD_POINT_2026_07_13.md`

## V2 North Star

V2 should make Shelf-n-Pop feel more like a collector's shelf and less like an analytics console. The app should still keep trustworthy values, set completion, catalog hygiene, and shared shelf checks, but those should become supporting context instead of the emotional center of the experience.

The user-facing promise:

> Add Pops cleanly, know where they belong, enjoy browsing your shelf, and choose how much collecting data you want to see.

## Product Principles

1. Lead with the Pop, not the spreadsheet.
   - Images, names, variants, set placement, and ownership story should come before money and raw metrics.
   - Value and gain/loss should be available, but not always dominant.

2. Let collector intent shape the interface.
   - A casual collector wants shelf browsing, favorites, recent adds, and simple set progress.
   - An avid fan wants set completion, missing Pops, variants, exclusives, and shared shelf comparison.
   - A reseller wants value, cost basis, condition, duplicates, for-sale flags, and gain/loss.

3. Use reviewed set catalogs as the source of consistency.
   - When a scanned or manually added Pop can be matched to a reviewed checklist row, V2 should use that row to normalize set, number, variant, type, style, and completion identity.
   - Provider results should enrich the catalog, not casually move Pops out of reviewed sets.

4. Keep catalog fixes durable.
   - Any admin or scan correction that changes identity should continue to save active parser overrides.
   - One-off catalog row edits are not enough if a future refresh can undo the correction.

5. Preserve the V1 app while improving in slices.
   - The current working tree is dirty and contains important app and Edge Function work.
   - V2 should start with additive planning, then small app slices, then deeper backend changes.

## Collector Modes

V2 should add a profile setting named `collector_mode` with three values:

- `casual`: default for a softer, shelf-first experience.
- `avid`: completion-focused, for collectors who care about reviewed sets and variants.
- `reseller`: value-focused, for users managing price, condition, duplicates, and sale intent.

Recommended display behavior:

| Surface | Casual | Avid | Reseller |
|---|---|---|---|
| Dashboard hero | Recent/favorite shelf moment | Closest set progress | Portfolio/value summary |
| My Shelf cards | Image, name, set, owned marker | Image, name, set, number, variant, completion badge | Image, name, value, paid, gain/loss, condition |
| Shelf Stats | Hidden behind a softer "Shelf Highlights" entry | Prominent set/franchise completion | Prominent values, duplicates, for-sale/trade |
| Shared Shelf | Who has what, easy browsing | Set overlap and missing Pops by member | Duplicates, value, for-sale/trade signals |
| Item detail | Story, notes, image, simple metadata | Checklist placement and variant accuracy | Current value, purchase price, condition, sale fields |
| Scan result | Confirm identity, add quickly | Confirm set/checklist match | Confirm value, condition, duplicate/resale context |

Implementation notes:

- Store the setting on `profiles.collector_mode`.
- Default to `casual` if the column or value is missing.
- Keep all information available through navigation; the mode should change emphasis, not delete capability.

## Set-Catalog-Powered Adds

Current useful foundation:

- Reviewed set summaries already load from `pop_set_completion_catalog_summary`.
- Checklist rows already load from `pop_set_checklist_items`.
- Shelf breakdown already uses reviewed set checklists for owned/missing/full views.
- Scan already checks shared shelf ownership for the matched Pop.

V2 scan/add target:

1. Scan or enter UPC.
2. Find exact `pop_catalog` match by UPC.
3. If matched catalog row has a reviewed `set_name`, pull the reviewed checklist row candidates for that set.
4. Match the catalog row to a checklist row using stable keys:
   - `pop_catalog_id`
   - UPC
   - normalized set name + box number + normalized variant
   - normalized character/name fallback
5. Show a set confidence card:
   - "Matched to reviewed set"
   - set name
   - box number
   - variant/exclusive
   - owned/missing status
   - shared shelf ownership if relevant
6. When adding, preserve the reviewed set fields unless the user/admin explicitly overrides them.

For manual loose adds:

- Let the user search reviewed set catalogs first.
- If they pick a checklist row, prepopulate set, number, character/name, variant, type, style, and franchise if known.
- Mark the item as out-of-box at the collection-item level, not by weakening catalog identity.

Backend/data recommendations:

- Add a read helper such as `fetchReviewedChecklistCandidatesForCatalog(pop: PopCatalog)`.
- Add a matching helper such as `matchCatalogToChecklistRow(pop, checklistRows)`.
- Later, consider a database view that joins `pop_catalog` to reviewed checklist rows for faster scan-time lookup.
- Do not reseed `pop_catalog` from checklist rows wholesale until UPC coverage and identity collision rules are clear.

## UI Cleanup Direction

### Dashboard

Current issue:

- The dashboard strongly emphasizes total value, average value, average paid, net gain, and value snapshots.

V2 direction:

- Rename the primary mental model from "Dashboard" to "Home" or "Shelf".
- In casual mode, lead with recent adds, shelf image grid, and "what's new on your shelf."
- In avid mode, lead with closest reviewed sets and missing Pops.
- In reseller mode, keep the value summary prominent.

First safe slice:

- Add a collector-mode-aware dashboard copy layer while keeping the existing data query.
- Change labels and card ordering based on mode, without changing database schema yet by defaulting to `casual`.

### My Shelf

V2 direction:

- Make browsing feel more like looking through a collection.
- Add display modes:
  - `display`: image-heavy shelf cards.
  - `compact`: faster list for large collections.
  - `manage`: values, flags, condition, duplicate controls.
- Keep filters persistent during a session.
- Prefer set and franchise chips over raw stats.

### Shelf Stats / Breakdown

Current issue:

- This is useful but reads analytical.

V2 direction:

- Rename or reframe as "Shelf Highlights" for casual mode.
- Keep "Shelf Stats" or "Breakdown" available for avid/reseller mode.
- Promote "Closest Sets" and "Missing Pops" over value ranking when mode is casual or avid.
- Keep value sorting first for reseller mode.

### Shared Shelves

V2 direction:

- Make shared shelves feel like a group collection experience.
- Show:
  - who owns this Pop
  - group set progress
  - missing Pops the group could complete together
  - member shelf profile cards
- In reseller mode, optionally show duplicate/value/for-sale signals.

First safe slice:

- Change shared shelf breakdown copy from "map/value" language toward "group shelf" language.
- Add mode-aware ordering later.

## Data Model Backlog

Suggested additive migrations:

1. `profiles.collector_mode text not null default 'casual'`
   - Check constraint: `collector_mode in ('casual', 'avid', 'reseller')`

2. Optional later: `profiles.shelf_display_mode text not null default 'display'`
   - Values: `display`, `compact`, `manage`

3. Optional later: `catalog_checklist_matches`
   - `pop_catalog_id`
   - `set_id`
   - `set_checklist_item_id`
   - `match_method`
   - `match_confidence`
   - `review_status`
   - timestamps

4. Optional later: `catalog_enrichment_events`
   - Store value/source/provider evidence separately from `pop_catalog.api_source`.

## First V2 Implementation Slice

Recommended next work item:

1. Preserve the current working tree with a checkpoint commit or agreed split.
2. Add `collector_mode` to profile types and profile settings UI.
3. Add a small local helper:
   - `collectorModeLabel`
   - `collectorModeDescription`
   - `collectorModeDashboardPriority`
4. Use the selected mode only for copy/order in the dashboard at first.
5. Run TypeScript and web export.

Why this first:

- It starts the V2 product direction without risking scan/catalog behavior.
- It creates the user-facing setting you described.
- It gives future UI screens a shared personalization knob.

## Second V2 Implementation Slice

Recommended next work item:

1. Extract scan set-matching helpers into app data/domain code.
2. For scan results, show a reviewed set match card when available.
3. For manual loose adds, let users pick from reviewed checklist rows before creating a manual item.
4. Keep all catalog writes conservative.

## Open Decisions

1. Should the default mode for existing users be `casual` or should admins/backfill infer mode from behavior?
   - Recommendation: default everyone to `casual`; let users opt into more detail.

2. Should "reseller" be named something softer?
   - Options: `reseller`, `seller`, `value tracker`, `market mode`.
   - Recommendation: show the UI label as "Value Tracker" while storing the value as `reseller`.

3. Should the main tab be called "Dashboard", "Home", or "Shelf"?
   - Recommendation: user-facing "Shelf" for casual mode, "Dashboard" acceptable for reseller mode.

4. Should reviewed set catalogs ever create missing `pop_catalog` rows?
   - Recommendation: not automatically in V2 phase 1. Use them to prepopulate manual adds and normalize matched scans first.
