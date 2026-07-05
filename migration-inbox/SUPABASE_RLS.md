# Supabase RLS Policy Map

Generated from `migration-inbox/supabase_rls_policies.csv`.

## Summary

The current policies look aligned with a logged-in, per-user collection app.

- `profiles`: users can select, insert, and update only their own profile where `auth.uid() = id`.
- `pop_catalog`: authenticated users can read the shared catalog.
- `user_collection_items`: authenticated users can select, insert, update, and delete only their own rows where `auth.uid() = user_id`.
- `dashboard_snapshots`: users can select, insert, update, and delete only their own snapshots where `auth.uid() = user_id`.

## Dashboard Implication

`dashboard_home_view` should be readable for a logged-in user if the view is based on these underlying tables and the query filters to the current user. In FlutterFlow, the dashboard should query `dashboard_home_view` with:

`user_id = current authenticated user uid`

If FlutterFlow returns no row, check whether the user has a matching `profiles.id` row and at least one relevant row in `user_collection_items`.

## Exported Policies

| Table | Command | Policy | Qual | With Check |
| --- | --- | --- | --- | --- |
| `dashboard_snapshots` | DELETE | Users can delete their own dashboard snapshots | `(auth.uid() = user_id)` | `null` |
| `dashboard_snapshots` | INSERT | Users can insert their own dashboard snapshots | `null` | `(auth.uid() = user_id)` |
| `dashboard_snapshots` | UPDATE | Users can update their own dashboard snapshots | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |
| `dashboard_snapshots` | SELECT | Users can view their own dashboard snapshots | `(auth.uid() = user_id)` | `null` |
| `pop_catalog` | SELECT | Authenticated users can read pop catalog | `true` | `null` |
| `profiles` | INSERT | Users can insert their own profile | `null` | `(auth.uid() = id)` |
| `profiles` | UPDATE | Users can update their own profile | `(auth.uid() = id)` | `(auth.uid() = id)` |
| `profiles` | SELECT | Users can view their own profile | `(auth.uid() = id)` | `null` |
| `user_collection_items` | DELETE | Users can delete their own collection items | `(auth.uid() = user_id)` | `null` |
| `user_collection_items` | INSERT | Users can insert their own collection items | `null` | `(auth.uid() = user_id)` |
| `user_collection_items` | UPDATE | Users can update their own collection items | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |
| `user_collection_items` | SELECT | Users can view their own collection items | `(auth.uid() = user_id)` | `null` |
