# Standard Missing-Number Cleanup - 2026-07-10

Status: applied to the live catalog and protected with active UPC parser overrides.

The 19-row Standard queue resolved into:

- 15 source-confirmed box identifiers
- 1 unnumbered Pop! Mug
- 1 unnumbered Pop! 2-Pack
- 1 unnumbered Pop! Moment
- 1 unnumbered Bitty Pop! Arcade product

The parser now recognizes explicit Mug, Premium, Moment, and Bitty Pop! Arcade labels before franchise-based product-line inference. Missing-number warnings are suppressed for product styles that are commonly and legitimately unnumbered while remaining required for Standard Pops.
