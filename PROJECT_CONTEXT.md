# Funko Collection App Context

This workspace continues a FlutterFlow + Supabase app for tracking a personal Funko Pop collection.

## Source Material

- Shared ChatGPT conversation saved at `migration-inbox/shared-chatgpt-conversation.txt`.
- Original project link was private/sign-in gated, so the shared conversation is currently the best imported context.
- The static HTML prototype in this folder is only a temporary local mockup, not the production app stack.

## Actual Stack

- Frontend: FlutterFlow
- Backend: Supabase
- Data source/API: barcode lookup flow that can populate `pop_catalog`
- App state/workflows: FlutterFlow actions, page state/app state variables, Supabase queries, conditional actions, snackbars, navigation

## Known Supabase Objects

Tables and views mentioned in the shared conversation:

- `profiles` or `profile` table
- `pop_catalog`
- user collection table, referenced in conversation as user collection / user collection items
- `user_collection_summary_view`

Important dashboard view fields:

- `user_id`
- `total_quantity`
- `total_collection_value`
- `total_purchase_cost`
- `total_gain_loss`

Known `pop_catalog` fields from barcode response examples:

- `id`
- `uuid`
- `created_at`
- `upc`
- `pop_name`
- `character`
- `franchise`
- `number`
- `variant`
- `exclusivity`
- `pop_type`
- `set_name`
- `set_total`
- `image_url`
- `vault_status`
- `estimated_value`
- `api_source`
- `api_last_updated`
- `raw_api_json`
- `raw_title`
- `clean_title`
- `pop_style`

## FlutterFlow Pages / Flows Mentioned

- Authentication pages: create account, login, confirm password handling
- DashboardPage
- Scan Pop flow
- My Collection / collection tab
- Item detail page

Dashboard structure captured from the shared conversation:

```
DashboardPage
└── Column
    ├── Welcome text
    ├── Subtitle
    ├── Row: Total Pops / Total Value
    ├── Row: Total Paid / Gain/Loss
    ├── Scan Pop button
    └── My Collection button
```

Dashboard query guidance:

- Put the Supabase query on the parent Column containing the dashboard values.
- Query: `user_collection_summary_view`
- Filter: `user_id = [User ID]`
- Bind card values from that Column query result, not from App State or static text.

Dashboard bindings:

| Card | Bind value to |
| --- | --- |
| Total Pops | `user_collection_summary_view Row -> total_quantity` |
| Total Value | `user_collection_summary_view Row -> total_collection_value` |
| Total Paid | `user_collection_summary_view Row -> total_purchase_cost` |
| Gain/Loss | `user_collection_summary_view Row -> total_gain_loss` |

## Barcode Lookup / Catalog Parsing

The app has a barcode lookup flow. One captured example returned UPC `889698326896` and a catalog result for `Funko Pop Marvel Venom Venomized Ghost Rider #369 Vinyl Figure`.

Known parsing issues from the conversation:

- Vendor/brand values sometimes become bad franchises, such as `DreamBone`, `Grappiq`, `IEWAREHOUSE`, `Funko`, `Funko LLC`, or `Pop! Vinyl`.
- `variant` should mean things like Chase, Glow in the Dark, Bloody, Metallic, etc., not ordinary name descriptors like Venomized.
- Some titles include leftover words like Vinyl, bobblehead, figures, empty parentheses, catalog numbers, or franchise text.
- Some records need cleanup for franchise, number, variant, and pop name.

Example cleanup query from the shared conversation:

```sql
select
  upc,
  pop_name,
  character,
  franchise,
  number,
  variant,
  pop_style,
  exclusivity,
  api_source,
  raw_title,
  clean_title
from public.pop_catalog
where franchise is null
   or franchise in (
     'Funko',
     'Funko LLC',
     'Funko, LLC',
     'POP',
     'Pop! Vinyl',
     'DreamBone',
     'Grappiq'
   )
   or pop_name ~* '(vinyl|bobblehead|figures|000[[:space:]]+[0-9]+|\([[:space:]]*\)|chance of chase|[[:space:]]\(other\))'
order by pop_name;
```

Known likely manual fixes from screenshots:

- Arseface, Cassidy, Jesse Custer -> Preacher
- Davos Seaworth -> Game of Thrones
- Meme Skeletor -> Masters of the Universe
- Figures NSYNC -> *NSYNC, likely 5-Pack
- 964 Back To The Future Marty W/ Hoverboard -> cleaner name plus number 964
- Adventures of Superman 000 50 -> number 50
- Cassidy (Bloody) VINYL () -> Cassidy, variant Bloody
- Mr. Knight () -> remove empty parentheses

## Current State From Shared Conversation

- Tables were created and foreign keys were discussed.
- Auth, create account, login, and FlutterFlow Supabase setup were worked through.
- Barcode API test and response worked.
- Adding scanned items to the collection eventually worked in Supabase.
- Collection screen had a period where Supabase showed records but FlutterFlow did not display them.
- Dashboard summary cards were being built and bound to `user_collection_summary_view`.
- Colors and card layout were updated.
- Gain/loss conditional formatting and decimal formatting were configured.
- Current late-stage work appears focused on dashboard card layout and catalog parsing cleanup.

## Next Practical Steps

1. Export the Supabase schema, policies, functions, and views into `migration-inbox/`.
2. Export or screenshot the FlutterFlow pages/actions for Dashboard, Scan Pop, Collection, and Item Detail.
3. Rebuild this workspace around the real stack docs rather than the temporary static prototype.
4. Produce a definitive Supabase schema reference, including foreign keys and RLS policies.
5. Produce a FlutterFlow implementation checklist for each page/action.
6. Patch catalog parsing rules for barcode lookup and refresh flows.

## Imported Supabase Schema

The current exported schema has been parsed into `SUPABASE_SCHEMA.md`. Use that file as the source of truth for table columns, foreign keys, and view definitions.

Notable current objects:

- `profiles`
- `pop_catalog`
- `user_collection_items`
- `user_collection_view`
- `user_collection_summary_view`
- `dashboard_home_view`
- `dashboard_snapshots`

One schema check remains: the foreign-key export references `wishlist_items`, but the column export did not include `wishlist_items`. That likely means either the table was filtered out, deleted after the FK export source saw it, or the columns export should be rerun.
