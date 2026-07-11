# Last 20 API-Updated Catalog Review - 2026-07-08

Scope: 20 newest `pop_catalog` rows by `api_last_updated desc nulls last`.

No live data was changed. Recommended adjustments are staged in `migration-inbox/pop_catalog_last20_api_updated_review_2026_07_08.sql`.

## Summary

- Reviewed 20 catalog rows ordered by `api_last_updated desc`.
- 11 rows need identity/set/detail cleanup.
- 5 rows look good or only need minor future value refresh.
- 4 rows were already covered by earlier last-20-scan review files, but are included here because they are also in this API-updated window.
- Value changes were staged only where the external value match was clear at the agreed 75% confidence threshold.

## Staged Adjustments

| UPC | Current row | Adjustment |
| --- | --- | --- |
| 889698520232 | Ahsoka #409, character null, set `Ahsoka` | Set character to `Ahsoka Tano`, set to `The Clone Wars`; value `$7.25` already matches PriceCharting. |
| 889698816663 | Grand Admiral Thrawn #697, variant `Glitter`, no set | Set character/title to Grand Admiral Thrawn, set `Ahsoka`, variant `Diamond Glitter`, exclusivity `San Diego Comic-Con`, limited edition 3000; keep `needs_review = true` for value/sticker confirmation. |
| 889698107662 | Ahsoka #130, character null, set `Ahsoka` | Set character `Ahsoka Tano`, set `Star Wars Rebels`, variant `Holographic`, exclusivity `Hot Topic`; value `$23.79` matches PriceCharting Holographic #130. |
| 889698759380 | Vito Corleone #1525, franchise null | Set franchise/set to `The Godfather Part II`, title `Vito Corleone with Towel Silencer`, value `$10.89`. |
| 889698496858 | Doc & Einstein, missing number/set/type | Set `Doc & Einstein #972`, Back to the Future, Walmart, `Pop! Movies`. |
| 889698768283 | Bo-Katan Kryze #693, set `Star Wars, The Mandalorian`, exclusivity `Target Con` | Normalize set to `The Mandalorian`, exclusivity `Target`, and keep value. |
| 830395033990 | Dr. Emmett Brown #50 GITD | Normalize set to `Back to the Future`, exclusivity `Convention`, keep `needs_review = true` because GITD #50 value is high and variant-sensitive. |
| 889698147644 | Kylo Ren #203, set includes `. Toys R Us`, exclusivity `Other` | Set `Star Wars: The Last Jedi`, exclusivity `Toys R Us`; value `$6.88` matches PriceCharting. |
| 830395034003 | Marty McFly #49 GITD | Set `Back to the Future`, exclusivity `Plastic Empire`, limited count `3000`; keep high variant value and review flag. |
| 889698147989 | Young Anakin Skywalker Podracer, missing number/set | Set `Young Anakin Skywalker (Podracer) #231`, Star Wars Episode I, Walgreens. |
| 889698430197 | Jango Fett #285 Metallic | Variant should be `Metallic Gold`, not generic `Metallic`. |
| 889698469128 | Marty With Glasses #958, franchise null | Set franchise to `Back to the Future`, canonical set spelling, value `$9.99`, vault `Vaulted`. |
| 889698430180 | Yoda #124 Green Chrome | The title/UPC points to Metallic Gold; update variant/value to Metallic Gold / `$13.87`. |
| 889698567718 | Andy #1155 | Normalize to `Andy with Leg Casts`, character `Andy Dwyer`, Calendar Club. |

## Left As-Is

| UPC | Row | Reason |
| --- | --- | --- |
| 849803060442 | Zuckuss #122 | Identity/set/value match PriceCharting. |
| 849803096144 | Snap Wexley #110 | Identity/set look right; no confident value change from search results. |
| 889698649025 | Obi-Wan Kenobi #544 | Identity/set/exclusivity look right. |
| 889698740302 | Max Rebo #616 | Identity/value match PriceCharting; set label is acceptable though could later be standardized. |
| 889698686495 | Cad Bane #580 | Identity/set look right; stored value `$5.00` is plausible but not enough evidence for a change. |
| 889698475983 | Jawa #371 | Identity/value match PriceCharting. |

## Evidence

- PriceCharting confirms Zuckuss #122 New `$13.89`, Ahsoka #409 New `$7.25`, Ahsoka Holographic #130 New `$23.79`, Vito Corleone #1525 New `$10.89`, Max Rebo #616 New `$16.37`, Kylo Ren #203 New `$6.88`, Jawa #371 New around `$9.20`, Batman/Back to the Future rows as noted in earlier review files.
- PriceCharting separates Grand Admiral Thrawn #697 from Grand Admiral Thrawn Diamond Glitter #697; the live row appears to be the Diamond Glitter SDCC item and should remain review-flagged until sticker/value is confirmed.
- Funko/retail pages support Bo-Katan Kryze #693 as Target exclusive from The Mandalorian, Doc & Einstein #972 as Walmart exclusive, Vito Corleone with Towel Silencer as The Godfather Part II, and Ahsoka #409 as The Clone Wars.
