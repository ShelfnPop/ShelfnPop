# Supabase Admin Schema Addendum

Generated: 2026-07-10

Project ref: `vwlnlgqxjamkukssuajt`

This addendum documents the live admin, reporting, audit, and parser-learning objects added after the older `SUPABASE_SCHEMA.md` snapshot.

## Tables

### `public.admin_users`

Purpose: identifies users who can access the Admin Console.

Columns:

- `user_id uuid not null`
- `created_at timestamptz not null default now()`
- `notes text null`

RLS:

- `Admins can view their own admin membership`: authenticated select.

### `public.catalog_issue_reports`

Purpose: stores user-submitted catalog issue reports.

Columns:

- `id uuid not null default gen_random_uuid()`
- `reporter_user_id uuid not null default auth.uid()`
- `pop_catalog_id uuid null`
- `collection_item_id uuid null`
- `issue_type text not null`
- `notes text null`
- `status text not null default 'open'`
- `admin_notes text null`
- `resolved_by uuid null`
- `resolved_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

RLS:

- `Users can create their own catalog issue reports`: authenticated insert.
- `Users can view their own catalog issue reports`: authenticated select.
- `Admins can view all catalog issue reports`: authenticated select.
- `Admins can update catalog issue reports`: authenticated update.

Triggers:

- `touch_catalog_issue_report_updated_at`: before update.
- `audit_catalog_issue_report_update`: after update.

### `public.admin_audit_events`

Purpose: stores admin-visible audit records for app/API admin changes.

Columns:

- `id uuid not null default gen_random_uuid()`
- `actor_user_id uuid null`
- `action text not null`
- `table_name text not null`
- `row_id uuid null`
- `related_report_id uuid null`
- `before_data jsonb null`
- `after_data jsonb null`
- `changed_fields text[] not null default array[]::text[]`
- `created_at timestamptz not null default now()`

RLS:

- `Admins can view admin audit events`: authenticated select.

Current audited actions:

- `catalog_update`
- `report_status_update`
- `report_update`
- `parser_override_create`
- `parser_override_update`
- `parser_override_disable`
- `parser_override_delete`

### `public.catalog_parser_overrides`

Purpose: stores learned UPC-specific parser corrections from admin fixes.

Columns:

- `id uuid not null default gen_random_uuid()`
- `upc text not null`
- `pop_catalog_id uuid null`
- `override_data jsonb not null`
- `learned_from_audit_event_id uuid null`
- `created_by uuid null`
- `updated_by uuid null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `is_active boolean not null default true`
- `notes text null`

RLS:

- `Admins can view parser overrides`: authenticated select.
- `Admins can create parser overrides`: authenticated insert.
- `Admins can update parser overrides`: authenticated update.

Triggers:

- `touch_catalog_parser_override_updated_at`: before update.
- `audit_catalog_parser_override_change`: after insert, update, or delete.

## Related Existing Table Changes

### `public.pop_catalog`

Admin-related columns added in recent migrations:

- `parse_reason_codes text[] not null default array[]::text[]`

Admin audit trigger:

- `audit_pop_catalog_update`: after update.

## Notes

- Audit triggers record actor identity through `auth.uid()`, so changes made through the app/API with a signed-in admin are attributed.
- Manual SQL changes outside an authenticated app context may not have admin actor identity.
- Learned parser overrides intentionally store durable identity fields, not volatile value or image fields.
- The Admin Console currently reads active parser overrides and can disable them by setting `is_active = false`.
