# Missing-value retail fallback - 2026-07-11

## Scope and method

- Follow-up scope: the 20 `pop_catalog` rows still missing `estimated_value` after the two July 11 sold-comp passes.
- User policy for this pass: fill remaining blanks with current retail/listing baselines now; the bi-weekly refresh can replace these as stronger market values become available.
- Currency: USD.
- Target field: `public.pop_catalog.estimated_value` only.
- No `public.user_collection_items.current_value` updates.
- Shipping was not added. For non-USD retail, a rounded USD-equivalent or better US listing was preferred when available.

## Retail fallback values

| UPC | Cleaned identity | Retail fallback USD | Evidence and decision |
|---|---|---:|---|
| 849803062224 | Poe Dameron, The Force Awakens, #62 | 11.00 | ToyWiz lists the exact UPC at $10.79; Amok Time corroborates exact UPC at $14.99. Use the lower current retail/listing baseline. |
| 889698147552 | Praetorian Guard, The Last Jedi, #208, Walgreens | 7.00 | eBay product page shows an exact #208 Walgreens listing at $6.99; Bedrock City lists the exact UPC at $9.99. Use the lower current baseline. |
| 889698450355 | Kylo Ren (Supreme Leader) & Rey, 2-Pack, Barnes & Noble | 14.00 | Exact-UPC eBay listing at $13.99, with other exact listings materially higher. |
| 889698711609 | Nebula & Mantis, Black Light 2-Pack, Target | 13.00 | Exact-UPC eBay listing at $12.99, with one sold and multiple available. |
| 889698744775 | R2-D2 & C-3PO, Disney 100, #661, Retro Reimagined 2-Pack, Target | 20.00 | Exact-UPC eBay listing at $19.99 and official Funko identity confirmation. |
| 889698761116 | Kraven, Spider-Man 2, Pop! Games | 10.00 | Target lists exact UPC at $9.99. |
| 889698797221 | Baela Targaryen, House of the Dragon, #19 | 10.00 | Target lists exact UPC at $9.51 sale / $13.59 regular. Use current sale baseline rounded. |
| 889698797245 | Daemon Targaryen with Dark Sister, #17, Wearing Armor, Funko Shop | 15.00 | Best Buy lists exact model/UPC at $14.99; exact eBay listing is $13.95. Use primary retail baseline. |
| 889698797726 | Keats, The Electric State, #1740 | 18.00 | POPs Today reports a recent exact sale/estimate around $18; exact-UPC EU retail at EUR 15.99 supports a similar USD retail fallback. |
| 889698802420 | Billy Bob with Bacon, Varsity Blues, #1867 | 14.00 | WSC Sports lists exact UPC at $13.99; A Comic Spot was previously found at $14.99. |
| 889698802475 | Helm Hammerhand, War of the Rohirrim, #1835 | 15.00 | Exact-UPC eBay listing at $14.99; Target shows $11.39 out of stock and Best Buy/PopMarket higher. Use current available listing. |
| 889698805605 | Sandy Alcantara, Miami Marlins, #101 | 10.00 | Exact active listings previously found around $7.70-$13.99; GrailNest visible active listings include $9.99 examples. Use rounded representative retail fallback. |
| 889698810739 | Superman, Action Comics #644, Comic Cover #18 | 25.00 | Exact-UPC retail/listings cluster around $22-$25; prior Best Buy/retail evidence supports a $24.99 baseline. |
| 889698834636 | Alys Rivers, House of the Dragon, #26 | 16.00 | Best Buy exact model page shows marketplace range from $15.93 to $30.93; JB Hi-Fi corroborates exact UPC at $15 AUD. Use the lowest visible US retail baseline rounded. |
| 889698835534 | Ferris Bueller, Ferris Bueller's Day Off, #1729 | 10.00 | Target lists exact UPC at $10.19 clearance. |
| 889698835541 | Cameron Frye, Ferris Bueller's Day Off, #1731 | 10.00 | Current eBay shop/listing evidence shows exact Cameron #1731 available at $6.99-$15.99; Target/Best Buy corroborate exact identity. Use a conservative retail fallback. |
| 889698835558 | Sloane Peterson, Ferris Bueller's Day Off, #1730 | 10.00 | eBay product page shows exact Sloane #1730 listings including $9.92 and $10.00 entries; Target corroborates exact UPC. |
| 889698837293 | Cyborg Superman, Reign of the Supermen, Comic Cover #21 | 12.00 | Official Funko sale was $12.49; Target also surfaced $12.49 adjacent current retail signal, while other retailers were $24.99. Use sale retail fallback rounded down. |
| 889698839747 | Quint, Jaws, #1755 | 15.00 | Official Funko lists Quint at $14.99; PopMarket had a lower sold-out price and Best Buy/marketplace was higher. Use official retail baseline. |
| 889698839761 | Alicent Hightower, House of the Dragon, #24, Teal Cloak | 15.00 | Best Buy lists exact UPC at $14.99, with marketplace range to $30.93. |

## Apply summary

- Retail fallback catalog updates proposed: **20**.
- Expected original 36-row batch state after apply: **36 valued**, **0 missing**.
- Item-level updates proposed now: **0**.
