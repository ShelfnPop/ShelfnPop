# Recent DC/Batman Scan Review - 2026-07-08

Scope: recent `user_collection_items` from the last 2 days whose joined catalog row matched DC, Batman, Superman, Joker, Riddler, Penguin, Two-Face, or related terms.

No live data was changed. Recommended changes are staged in `migration-inbox/pop_catalog_recent_dc_batman_review_2026_07_08.sql`.

## Summary

- Reviewed 24 recent DC/Batman-ish additions.
- Most DC New Classics, Dark Multiverse, and Batman 85th rows are structurally OK.
- Main issues found:
  - A Jurassic Park Hatching Raptor row is incorrectly tagged as `DC`.
  - Several Batman 80th/1989 rows are stored under `Batman v Superman: Dawn of Justice`.
  - The Joker Batman 1989 rows need better variant/value separation.
  - Bullseye as Superman is filed under `DC / Superman`, but official Funko treats it as Target / Ad Icons with box #249.
  - Some rows should use more precise set names such as `Batman 1989`, `Batman Forever`, `Batman Begins`, `Kingdom Come`, `Tales from the Dark Multiverse`, and `DC New Classics`.

## High-confidence staged fixes

| UPC | Current | Recommended correction |
| --- | --- | --- |
| 889698717366 | Hatching Raptor tagged as `DC` | Change franchise to `Jurassic Park`, set to `Jurassic Park`, keep #1442 and Summer Convention/Target context. |
| 889698871877 | Bullseye Superman missing number, set `Superman` | Set franchise/license context to `Target`, set `Ad Icons`, number `249`, exclusivity `Target`, vault `Vaulted`. |
| 889698372480 | Batman 1989 #275 under Batman v Superman | Set `Batman 1989`, add `Target`, value review to PriceCharting New `$15.37` if this is the silver Target exclusive; otherwise leave common value for manual check. |
| 889698372541 | Batman Forever #289 under Batman v Superman | Set name/character to Batman, set `Batman Forever`, value `$9.00`. |
| 889698372145 | Batman First Appearance #270 | Tighten set to `Batman 80th Anniversary`, value `$8.63`. |
| 889698495776 | Batman Metallic 1989 Joker row | Normalize to The Joker (Batman 1989) #337, variant `Metallic`, `Pop! Heroes`; value should be reviewed against the matching metallic #337 market. |
| 889698477093 | The Joker Batman 1989 #337 owned as Chase | Normalize set/type, update item-level Chase value to `$19.37` using PriceCharting Chase New. |
| 889698744225 | Batman #569 | Set name to `Batman (Kingdom Come)`, set `Kingdom Come`, exclusivity `Summer Convention`, value `$17.92` for Summer Convention row. |
| 889698818667 | Fear Gas Batman #532 | Set `Batman Begins`, value already matches PriceCharting New `$26.49`. |
| 889698866422 | Superman and Fortress of Solitude #582 | Use `Pop! Moment`, set `Superman (2025)`, value is close to PriceCharting New around `$24.48`. |

## Rows that look OK or minor-only

| UPC | Stored row | Review |
| --- | --- | --- |
| 889698477055 | The Riddler #340, Batman Forever | Identity/number/set look right. Funko marks it From the Vault, so vault status should be `Vaulted`. |
| 889698477062 | Two-Face #341, Batman Forever | Identity/number/set look right; marketplace metadata marks it vaulted. |
| 889698477086 | The Penguin #339, Batman Returns | Identity/number/set look right; value looks plausible. |
| 889698863698 | Batman #598 | DC New Classics identity/value look plausible. Set could be standardized to `DC New Classics`. |
| 889698863704 | Superman #599 | DC New Classics identity/value look plausible. |
| 889698863711 | Wonder Woman #600 | DC New Classics identity/value look plausible. |
| 889698863728 | Green Lantern #601 | DC New Classics identity/value look plausible. |
| 889698862257 | Robin King #581 | Funko confirms Tales from the Dark Multiverse #581; value is close. |
| 889698862240 | Saint Batman #580 | Funko confirms Tales from the Dark Multiverse #580; value is close. |
| 830395033723 | The Joker #36, The Dark Knight Trilogy | Identity/set/value look plausible. |
| 889698806879 | The Joker #517 | PriceCharting New matches stored value. |
| 889698787741 | Batman Knight #513 | Identity/exclusivity look right; value close enough. |
| 889698372534 | Batman (Red Rain) #286 | Identity looks right; no value change staged. |
| 889698668590 | Batman Lights and Sounds #448 | PriceCharting New matches stored value. |

## Evidence

- Funko lists Fear Gas Batman as item `81866`, box #532, DC Comics / Batman / Batman Begins.
- Funko lists Robin King item `86225`, box #581, Tales from the Dark Multiverse.
- Funko lists Saint Batman item `86224`, box #580, Tales from the Dark Multiverse.
- Funko lists Bullseye as Superman item `87187`, box #249, Target license, From the Vault.
- Funko lists Hatching Raptor item `71736`, Jurassic Park, 2023 Summer Convention sticker.
- PriceCharting lists The Joker Batman 1989 Chase #337 New at `$19.37`; Metallic #337 New at `$15.24`; common #337 New around `$10.00`.
- PriceCharting lists Batman #598, Superman #599, Wonder Woman #600, and Green Lantern #601 as DC New Classics rows.
- PriceCharting lists Superman and Fortress of Solitude #582 as a Pop! Moment with New around `$24.48`.
