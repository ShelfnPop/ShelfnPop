# Last 5 Catalog Entry Review - 2026-07-08

Reviewed the five newest `pop_catalog` rows by `created_at desc nulls last, api_last_updated desc nulls last`.

## Applied fixes

- `889698300322`: corrected from `Bob Ross And Pea Pod #560` to `Tom Riddle #60`, Harry Potter / Wizarding World. The stored image already shows Tom Riddle #60, so no image reset was needed.
- `889698311533`: retained Dobby #63 Target 10-inch identity and refreshed the placeholder `$1.00` value to `$29.99`, matching the reviewed PriceCharting New value. The owned item value was updated with the catalog baseline because it was also still `$1.00`.
- `889698556149`: normalized Lilo #1043 to the `Lilo & Stitch` set and replaced the weak generated description.
- `889698872003`: corrected Luau Stitch from `1567 Luau Stitch` with a missing number to `Luau Stitch (Flocked) #1567`, Target exclusive.
- `889698862745`: corrected Luau Angel to Pop! Disney #1568 and cleaned up the character/set/description fields.
- `889698918336`: corrected Devilish Stitch from `1701 Devilish Stitch` with a missing number to `Devilish Stitch #1701`, Entertainment Earth exclusive.
- `889698917858`: corrected Stitch with Balloon to `Stitch with Balloon #1709`, Target exclusive.

## Left as-is

- `889698102322`: Von Miller #60, Denver Broncos orange jersey; no obvious catalog mismatch found in this pass.
- `889698116275`: Kelly #397, Ash vs. Evil Dead; no obvious catalog mismatch found in this pass.
- `889698838429`: Evil Ash #1881, Army of Darkness S2; external references support the current name and UPC, so no set-name change was made here.

## Evidence

- Amazon product metadata lists UPC `889698300322` as `POP!: Harry Potter - Tom Riddle`.
- eBay product metadata lists UPC `0889698300322`, box number `60`, character `Tom Riddle`, franchise `Harry Potter`, series `Harry Potter Series 5`.
- PriceCharting lists Dobby 10 Inch #63 values as Out of Box `$17.99`, In Box `$25.00`, New `$29.99` at review time.
- Funko lists Stitch with Balloon as item `91785`, box number `1709`, Disney / Lilo & Stitch, retail exclusive.
- eBay/Hobbies Galore product metadata lists Luau Angel UPC `889698862745` as box number `1568`.
- Amazon/FPNYC product metadata lists Devilish Stitch UPC `889698918336` as box number `1701`, Entertainment Earth exclusive.
- Funko/retail metadata lists Luau Stitch Flocked UPC `889698872003` as box number `1567`.
