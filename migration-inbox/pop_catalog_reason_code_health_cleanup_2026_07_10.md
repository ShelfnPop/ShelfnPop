# Catalog Review-Health Cleanup - 2026-07-10

Status: applied to the live catalog.

This maintenance pass removes resolved `missing_set`, `missing_franchise`, `missing_number`, and `missing_character` reason codes when the corresponding final field is populated. It preserves every unrelated reason code.

Rows below the agreed `0.75` confidence threshold are marked `needs_review = true`; higher-confidence review state is left unchanged.
