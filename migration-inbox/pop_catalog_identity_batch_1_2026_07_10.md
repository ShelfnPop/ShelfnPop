# Catalog Identity Cleanup - Batch 1 - 2026-07-10

Status: applied to the live catalog and protected with active UPC parser overrides.

This batch repairs 15 high-priority identity records found by the catalog-wide audit:

- 9 missing franchises
- 4 cross-franchise or product-line classification errors
- Stitch with Tube #1565, whose title, set, and number were incomplete
- Bullseye as Superman #249, whose correct override existed but was not authoritative during refresh

The matching parser change makes explicitly reviewed override fields authoritative over populated API fields. It also clears resolved review warnings and now removes stale `missing_set` warnings when a set has been recovered.
