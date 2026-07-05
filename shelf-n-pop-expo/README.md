# Shelf-n-Pop Expo

This is the native/mobile rebuild of Shelf-n-Pop using Expo, React Native, and the existing Supabase project.

## Setup

1. Copy `.env.example` to `.env`.
2. Paste your Supabase anon/public key into `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. Install dependencies.
4. Run the app with Expo.

## Supabase

Project URL:

`https://vwlnlgqxjamkukssuajt.supabase.co`

The app uses the existing Supabase tables/views:

- `profiles`
- `dashboard_home_view`
- `user_collection_view`
- `user_collection_items`
- Edge Function: `lookup_pop`
