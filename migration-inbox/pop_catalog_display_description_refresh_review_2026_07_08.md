# Catalog display description refresh - 2026-07-08

Applied live to Supabase project `vwlnlgqxjamkukssuajt`.

## What changed

- Replaced weak generated descriptions such as `From Set, Name is a Pop! release #123.`
- Replaced remaining punctuation-edge cases such as `Mr.` and `M.O.D.O.K.` rows that still matched `release #`.
- Removed duplicate `Exclusive exclusive` wording.
- Preserved rows with non-matching/manual descriptions.

## Verification

| Check | Count |
| --- | ---: |
| Catalog rows | 2,004 |
| Blank display descriptions | 0 |
| Old `From ..., is a release` style | 0 |
| Old `is a Funko Pop` style | 0 |
| Old `release #` style | 0 |
| Duplicate `exclusive exclusive` wording | 0 |
| New catalog-note style rows | 1,854 |

## New fallback style

Example:

`Kelly belongs to the Ash Vs. Evil Dead Pop! Television line as #397. Released in 2016.`

When available, the note also includes variant, exclusivity, non-standard style, vaulted status, and limited-run count.

## Parser/deploy note

The local `lookup_pop` fallback generator was updated and the TypeScript check passed. The Supabase CLI is not installed in this shell, so the edge function still needs deployment from an environment with Supabase CLI access before future scans use the new generator automatically.
