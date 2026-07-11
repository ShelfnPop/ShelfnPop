# Last 20 Scanned Pops Review - 2026-07-08

Scope: newest 20 `user_collection_items` rows by `created_at desc`, joined directly to `pop_catalog`.

No live data was changed in this pass. Recommended fixes are staged in `migration-inbox/pop_catalog_last20_scans_review_2026_07_08.sql`.

## Summary

- Reviewed 20 scanned-in collection rows.
- 8 rows look OK or close enough for now.
- 12 rows need some correction or review.
- Biggest issues: wrong or missing box numbers, broad/noisy set labels, variant mismatch on gold/hologram releases, vault status left `Active` for officially retired items, and several values that no longer match the reviewed PriceCharting page.
- Values below use the agreed 75% confidence threshold for item-level value updates.

## High-confidence fixes

| UPC | Current | Issue | Recommended correction |
| --- | --- | --- | --- |
| 889698147989 | Young Anakin Skywalker Podracer, no number/set | Official/reference listings support Young Anakin Skywalker Podracer #231, Walgreens exclusive. | Set number `231`, set `Star Wars: Episode I - The Phantom Menace`, exclusivity `Walgreens`; value can stay near current. |
| 889698606547 | The Mandalorian (Beskar Armor), owned GITD, value $20.00 | UPC is the Entertainment Earth hologram/GITD #345, not the standard Beskar Armor row. PriceCharting New is $10.95. | Rename to `The Mandalorian (Hologram)`, variant `Glow in the Dark`, value `$10.95`. |
| 889698430180 | Yoda #124, variant Green Chrome, value $11.00 | UPC/title point to Metallic Gold / Gold Metallic Walmart exclusive. PriceCharting New for Metallic Gold is $13.87. | Variant `Metallic Gold`, owned variant `Metallic Gold`, value `$13.87`. |
| 889698675376 | Stormtrooper, New Classics, number 156, variant Squad Leader | Funko lists this as Stormtrooper #598 from Star Wars: Episode IV A New Hope. | Number `598`, clear variant, set `Star Wars: Episode IV - A New Hope`. |
| 889698430173 | Princess Leia Gold #295 | UPC/source title supports Princess Leia Metallic Gold #287. PriceCharting New is $8.07. | Number `287`, variant `Metallic Gold`, value `$8.07`. |
| 849803064778 | Dr. Emmett Brown (Jumper Cables), value $13.52 | PriceCharting New is $6.00 for Dr. Emmett Brown Jumper Cables #236. | Update value to `$6.00`. |
| 889698837729 | Transporter Plus Picard, no number, Pop! Movies | Retail/eBay references support Jean-Luc Picard Transporter Pop! Plus #1687. | Number `1687`, pop type `Pop! Plus`, name/character `Jean-Luc Picard`. |
| 889698430203 | Darth Maul, no number/set | UPC references support Darth Maul Gold Metallic Walmart exclusive #9. | Number `9`, variant `Metallic Gold`, exclusivity `Walmart`. |

## Good or minor-only rows

| UPC | Stored row | Review |
| --- | --- | --- |
| 889698147644 | Kylo Ren #203 Toys R Us | Identity/box/exclusivity look right. Set label should drop `. Toys R Us`; vault should be reviewed because marketplace references mark it vaulted. |
| 830395034003 | Marty McFly #49 Glow in the Dark | High-value identity/value look right for the Plastic Empire LE 3000 row, but exclusivity and limited count are missing, and owned variant says `Common` even though the catalog row is variant-specific. |
| 889698475983 | Jawa #371 | Identity/box look right. Current value is close to PriceCharting; no value change staged. |
| 889698430197 | Jango Fett #285 Metallic | Identity/box/exclusivity look right, but variant should be `Metallic Gold`/`Gold Metallic` rather than plain `Metallic`. |
| 889698469128 | Marty with Glasses #958 | Identity/box look right. Franchise missing; Funko marks it From the Vault. |
| 889698567718 | Andy #1155 | Should likely be `Andy with Leg Casts` / `Andy Dwyer`; box number and value look reasonable. |
| 889698407021 | Sebulba #304 | Identity/box look right. Set can be tightened to Phantom Menace; exclusivity likely Smuggler's Bounty. |
| 889698704571 | Darth Vader on Tie Fighter #20 | Identity/box/value look right. Pop type should be `Pop! Trains`; Funko marks it From the Vault. |
| 889698520263 | Bo-Katan Kryze #412 | Identity/box look plausible. Source naming is split between Clone Wars and Mandalorian, so left as-is. |
| 889698652568 | Krrsantan Flocked #548 | Identity/box/exclusivity look right. Funko marks it From the Vault. |
| 889698665742 | Remnant Stormtrooper #563 | Identity/box/exclusivity/value look reasonable. |
| 889698477055 | The Riddler #340 | Identity/box/set look right. Funko marks it From the Vault. |

## Evidence

- Funko lists Anakin Skywalker in Pod Racer Helmet as box #698, but UPC `889698147989` references support the older Walgreens Young Anakin Skywalker Podracer #231, so this row is not the 2024 From the Vault #698 item.
- PriceCharting lists Young Anakin Skywalker #231 New around `$17.49`.
- Funko lists Stormtrooper item `67537` as box #598, Star Wars: Episode IV A New Hope.
- PriceCharting lists The Mandalorian Holographic #345 New at `$10.95`.
- PriceCharting lists Yoda Metallic Gold #124 New at `$13.87`.
- PriceCharting lists Princess Leia Metallic Gold #287 New at `$8.07`.
- PriceCharting lists Dr. Emmett Brown Jumper Cables #236 New at `$6.00`.
- Funko lists Darth Vader on Tie Fighter as Pop! Trains #20 and From the Vault.
- Funko lists Marty with Glasses #958 as From the Vault.
- Funko lists The Riddler #340 as From the Vault.
- Funko lists Krrsantan Flocked #548 as From the Vault.
- eBay/retail metadata supports Picard Transporter Pop! Plus #1687 for UPC `889698837729`.
