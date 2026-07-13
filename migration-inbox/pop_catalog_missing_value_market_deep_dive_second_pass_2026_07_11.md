# Missing-value market deep dive second pass - 2026-07-11

## Scope and method

- Follow-up scope: the 24 `pop_catalog` rows still missing `estimated_value` after the first July 11 market-value pass.
- Currency: USD.
- Target field: `public.pop_catalog.estimated_value` only.
- Item-specific values: no `public.user_collection_items.current_value` updates in this pass. The damaged Praetorian Guard still needs condition-specific evidence.
- Apply threshold: `confidence >= 0.75`.
- Evidence preference: current sold-history sources first, especially PriceCharting and POPs Today. Retail asks were used only as corroboration.

## New high-confidence values

| UPC | Cleaned identity | Proposed USD | Confidence | Evidence and decision |
|---|---|---:|---:|---|
| 889698576130 | Black Widow, The Infinity Saga, #50, Artist Series | 10.00 | 0.82 | PriceCharting now has an exact Art Series entry for Black Widow [Red] #50 with current market values of $5.70 out of box, $8 in box, and $9.50 new, based on completed-sales history. eBay product metadata corroborates UPC `0889698576130`, box #50, and display name Black Widow (Red). Rounded new baseline: $10. |
| 889698576161 | Hulk, The Infinity Saga, #48, Artist Series | 10.00 | 0.82 | PriceCharting has an exact Art Series entry for Hulk [Green] #48 with current market values of $5.93 out of box, $8 in box, and $9.89 new. CMDstore corroborates UPC `889698576161` and current retail at $14.99, but the PriceCharting sold-history value is the baseline. Rounded new baseline: $10. |
| 889698797702 | Michelle, The Electric State, #1738, With Paintball Gun | 14.00 | 0.76 | POPs Today reports an estimated value of $13.60, a recent April 2026 sale at $13.21, a February 2026 sale at $10.70, and a 2025 sale at $16.95. The site explicitly warns volume is low, so confidence is just over threshold. Rounded baseline: $14. |
| 889698797719 | Cosmo, The Electric State, #1739 | 14.00 | 0.85 | POPs Today has a deeper exact sold-history list for Cosmo #1739, including 2026 sales at $13.49, $19.99, $8.00, and $14.44, plus several 2025 comps around $12-$18. Recent current-price signal clusters around the mid-teens. Conservative baseline: $14. |

## Still intentionally left missing

| UPC | Identity | Reason left blank |
|---|---|---|
| 849803062224 | Poe Dameron, The Force Awakens, #62 | PriceCharting verifies the exact item but has no current values; POPs Today remains sparse and volatile. |
| 889698147552 | Praetorian Guard, The Last Jedi, #208, Walgreens | Owned copy is damaged; catalog baseline and damaged item value need separate evidence. |
| 889698450355 | Kylo Ren (Supreme Leader) & Rey, 2-Pack, Barnes & Noble | Current evidence is active/ended listings and buyback pricing, not enough sold-history support. |
| 889698711609 | Nebula & Mantis, Black Light 2-Pack, Target | Found exact current listing evidence and one listing with one sold, but not a reliable market series. |
| 889698744775 | R2-D2 & C-3PO, Disney 100, #661, Retro Reimagined 2-Pack, Target | Official Funko and eBay product pages verify identity; exact value evidence is still listing-heavy. |
| 889698761116 | Kraven, Spider-Man 2, Pop! Games | Still no reputable exact value history found. |
| 889698797221 | Baela Targaryen, House of the Dragon, #19 | PriceCharting verifies UPC but reports no value and no sold listings. |
| 889698797245 | Daemon Targaryen with Dark Sister, #17, Wearing Armor, Funko Shop | PriceCharting verifies UPC but reports rare/no sales data; retail listings alone stay below threshold. |
| 889698797726 | Keats, The Electric State, #1740 | POPs Today shows only one recent exact sale at $17.99/$18 and flags low volume; keep blank. |
| 889698802420 | Billy Bob with Bacon, Varsity Blues, #1867 | Current exact-UPC retail is grouped around $14-$16, but no reliable sold series was found. |
| 889698802475 | Helm Hammerhand, War of the Rohirrim, #1835 | Exact-UPC product pages and active listings found, but no current sold series. |
| 889698805605 | Sandy Alcantara, Miami Marlins, #101 | Active listing medians are visible through GrailNest/retail, but no sufficiently transparent sold series. |
| 889698810739 | Superman, Action Comics #644, Comic Cover #18 | Amazon, eBay, and retailers verify identity/current listing range; no exact completed-sale series found. |
| 889698834636 | Alys Rivers, House of the Dragon, #26 | Exact current retail only; no sold-history support. |
| 889698835534 | Ferris Bueller, Ferris Bueller's Day Off, #1729 | Exact retail/listing identity only; no reliable sold-history support. |
| 889698835541 | Cameron Frye, Ferris Bueller's Day Off, #1731 | No reputable exact value history found. |
| 889698835558 | Sloane Peterson, Ferris Bueller's Day Off, #1730 | No reputable exact value history found. |
| 889698837293 | Cyborg Superman, Reign of the Supermen, Comic Cover #21 | Official Funko sale/current retailers show a broad $12.49-$24.99 spread, but POPs Today/retail evidence does not include enough sold comps. |
| 889698839747 | Quint, Jaws, #1755 | Official Funko and retail pages verify identity and pricing, but no sold series found. |
| 889698839761 | Alicent Hightower, House of the Dragon, #24, Teal Cloak | Best Buy verifies exact UPC/current $14.99 listing, but no sold-history support. |

## Apply summary

- Additional high-confidence catalog updates proposed: **4**.
- Rows intentionally left missing after this second pass: **20**.
- Item-level updates proposed now: **0**.
