# Recent Batman-Related Scan Review - 2026-07-08

Scope: recent collection additions from the last 3 days where the joined catalog row matched Batman in the pop name, character, set, raw title, or clean title.

No live data was changed. Recommended changes are staged in `migration-inbox/pop_catalog_recent_batman_only_review_2026_07_08.sql`.

## Summary

- Reviewed 16 recent Batman-related rows.
- 7 rows look good or only need light set-name polish.
- 9 rows need correction, value adjustment, or variant review.
- The main problems are:
  - Batman 1989 / Batman Forever rows parsed into `Batman v Superman: Dawn of Justice`.
  - Joker #337 rows split across confusing UPCs/variants.
  - Batman #569 missing `Kingdom Come` and convention context.
  - Several Batman-line rows need more precise set names.

## Needs Fix Or Review

| UPC | Current row | Finding | Recommendation |
| --- | --- | --- | --- |
| 889698495776 | Batman Metallic 1989 Joker, no number, `Batman v Superman`, `Pop! Movies` | Misclassified. Source/title points to Joker from Batman 1989 #337, metallic/exclusive. | Normalize to `The Joker (Batman 1989) #337`, `Pop! Heroes`, variant `Metallic`; keep `needs_review = true` because this UPC is separate from the cleaner #337 row. |
| 889698477093 | The Joker Batman #337, `Batman v Superman`, `Pop! Games`, owned `Chase` | Misclassified set/type. If owned copy is Chase, current value is low. | Normalize to Batman 1989 / Pop! Heroes; set item-level Chase value to `$19.37`. |
| 889698372480 | Batman #275, `Batman v Superman` | Actually Batman 1989 #275. Stored value `$11.67` matches the common PriceCharting row. | Set `set_name = Batman 1989`; keep value unchanged unless the physical box is Silver/Braced. |
| 889698372541 | Batman Forever #289, `Batman v Superman` | Set is wrong; value `$9.00` matches PriceCharting New. | Set character `Batman`, set `Batman Forever`; value stays `$9.00`. |
| 889698744225 | Batman #569, variant `Convention`, missing set | PriceCharting supports Batman Summer Convention #569; POPs Today calls it Kingdom Come. | Set `Batman (Kingdom Come)`, set `Kingdom Come`, exclusivity `Summer Convention`, clear item variant, value `$17.92`. |
| 889698818667 | Fear Gas Batman #532, missing set | Funko official page ties this to Batman Begins. | Set `Batman Begins`; value `$26.49` is fine. |
| 889698806879 | The Joker #517, set `Batman` | Value is right, but set is too broad. | Set `Batman 85th Anniversary`. |
| 889698668590 | Batman Lights and Sounds #448, set `Batman`, value `$19.65` | PriceCharting New is about `$19.53`; set can be tighter. | Set `Batman 85th Anniversary`; optional value refresh to `$19.53`. |
| 889698372145 | Batman First Appearance #270, value `$8.05` | PriceCharting New is `$8.63`. | Set `Batman 80th Anniversary`; update value to `$8.63`. |

## Looks Good Or Minor Only

| UPC | Row | Review |
| --- | --- | --- |
| 889698477055 | The Riddler #340, Batman Forever | Identity/set/box are right. Stored value `$15.35` is above the latest PriceCharting New seen in search, so value may be worth a later pricing-only refresh. |
| 889698477062 | Two-Face #341, Batman Forever | Identity/set/box look right. Marketplace metadata supports the row. |
| 889698477086 | The Penguin #339, Batman Returns | Official Funko page confirms item `47708`, box #339, Batman Returns. Stored value `$9.50` is plausible. |
| 889698863698 | Batman #598 | DC New Classics Batman #598. Row is correct; set can be standardized to `DC New Classics`. |
| 889698862240 | Saint Batman #580 | Official Funko page confirms box #580 from Tales from the Dark Multiverse. |
| 889698787741 | Batman Knight #513 | Identity/exclusivity look right; value close enough. |
| 889698372534 | Batman (Red Rain) #286 | Identity/value look right. PriceCharting New matches stored `$6.76`. |

## Evidence

- Funko confirms The Penguin item `47708`, box #339, Batman Returns.
- Funko confirms Fear Gas Batman item `81866`, box #532, Batman Begins.
- Funko confirms Saint Batman item `86224`, box #580, Tales from the Dark Multiverse.
- PriceCharting lists Batman 1989 #275 New at `$11.67`; Silver #275 is a separate `$15.37` row.
- PriceCharting lists Batman Forever #289 New at `$9.00`.
- PriceCharting lists Batman First Appearance #270 New at `$8.63`.
- PriceCharting lists Batman Red Rain #286 New at `$6.76`.
- PriceCharting lists The Joker Batman 1989 #337 variants separately: common around `$10.00`, metallic `$15.24`, chase `$19.37`.
