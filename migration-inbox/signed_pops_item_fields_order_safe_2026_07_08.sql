-- Add item-level signed Pop tracking and signed value boost, applied 2026-07-08.
-- Signed details belong on user_collection_items because signatures are copy-specific.
-- The app-facing views keep existing column order and append signed fields to avoid
-- Postgres view column rename errors.

alter table public.user_collection_items
  add column if not exists signed boolean not null default false,
  add column if not exists signed_by text,
  add column if not exists signature_authentication text,
  add column if not exists signature_cert_number text,
  add column if not exists signature_location text,
  add column if not exists signature_personalized boolean not null default false,
  add column if not exists signature_notes text,
  add column if not exists signed_value_boost_percent numeric;

-- Value rule for all collection views:
-- adjusted value = base current/catalog value * (1 + signed boost percent / 100)
-- only when the shelf item is marked signed. Catalog values are untouched.
