# API-Updated Catalog Review 21-40 - 2026-07-08

Scope: rows 21-40 from `pop_catalog` ordered by `api_last_updated desc nulls last`.

No live data was changed. Recommended adjustments are staged in `migration-inbox/pop_catalog_api_updated_21_40_review_2026_07_08.sql`.

## Current vs Change

| UPC | Current | Requested change |
| --- | --- | --- |
| 889698675376 | Stormtrooper #156, set `New Classics`, variant `Squad Leader`, value `$6.15` | This UPC is Funko item 67537: Stormtrooper #598 from Star Wars: Episode IV - A New Hope / New Classics. Update number to `598`, remove Squad Leader, set value to MSRP `$14.99`, and keep `needs_review = true` because the old value came from the wrong Scarif Stormtrooper #156 match. |
| 889698430173 | Princess Leia Gold #295, character includes `Gold`, exclusivity `Walmart` | Normalize to `Princess Leia`, variant `Gold Chrome`, exclusivity `Galactic Convention / Hot Topic`; value `$10.29` is correct. |
| 889698704571 | Darth Vader On Tie Fighter #20, franchise/set `Disney 100. Star Wars`, type `Pop! Disney` | Normalize to `Darth Vader on TIE Fighter`, franchise `Star Wars`, set `Disney 100`, type `Pop! Trains`; value `$11.79` is correct. |
| 889698652568 | Krrsantan #548, set casing `The Book Of Boba Fett`, exclusivity `Summer Convention` | Normalize set casing to `The Book of Boba Fett`; keep flocked/value. |
| 889698837729 | Transporter Plus Picard, missing number, type `Pop! Movies` | Normalize to `Jean-Luc Picard (Transporter) (Glitter) #1687`, type `Pop! Plus`, set `Star Trek Transporter`, value `$14.99`, and update owned value from `$12.90`. |
| 889698430203 | Darth Maul, missing number, generic `Metallic`, value `$21.17` | This UPC is Darth Maul (Gold Metallic) #9 Walmart, not #299. Set number `9`, variant `Metallic Gold`, vault `Vaulted`; keep value. |
| 889698495776 | Batman Metallic 1989 Joker, set `Batman v Superman: Dawn of Justice`, type `Pop! Movies`, number blank | Normalize to `The Joker (Batman 1989) (Metallic) #337`, set `Batman 1989`, type `Pop! Heroes`, variant `Metallic`; keep `needs_review = true` because this UPC appears to duplicate the #337 metallic Joker family. |
| 889698639880 | Sallah #1352, franchise blank | Set franchise `Indiana Jones`, set `Indiana Jones and the Last Crusade`; value `$10.43` is correct. |
| 889698477093 | The Joker Batman #337, set `Batman v Superman: Dawn of Justice`, type `Pop! Games`, owned variant `Chase` | Normalize catalog to `The Joker (Batman 1989) (Metallic) #337`, set `Batman 1989`, type `Pop! Heroes`, variant `Metallic`; update owned variant to `Metallic`. |
| 889698863711 | Wonder Woman #600, set `Wonder Woman` | Set to `DC New Classics`; value `$15.24` is correct. |
| 889698863728 | Green Lantern #601, set `Green Lantern` | Set to `DC New Classics`; value `$17.15` is correct. |
| 889698485159 | Biff Tannen #963, franchise blank, set `Back To The Future` | Set franchise `Back to the Future`, set casing `Back to the Future`, vault `Vaulted`; value left at `$33.53`. |
| 889698863704 | Superman #599, set `Superman` | Set to `DC New Classics`; value `$18.00` is correct. |
| 889698863698 | Batman #598, set `Batman` | Set to `DC New Classics`; value `$11.34` is correct. |

## Left As-Is

| UPC | Row | Reason |
| --- | --- | --- |
| 889698407021 | Sebulba #304 | Identity and value match PriceCharting. |
| 889698520263 | Bo-Katan Kryze #412 | Identity and value look correct. |
| 889698477055 | The Riddler #340 | Batman Forever identity/value match PriceCharting. |
| 889698477062 | Two-Face #341 | Batman Forever identity/value match PriceCharting. |
| 889698477086 | The Penguin #339 | Batman Returns identity/value match PriceCharting. |
| 849803064228 | Finn With Lightsaber #85 | Identity/value match PriceCharting. |

## Notes

- No `box_number` column exists on `user_collection_items`; the catalog `number` field is the box number source for these rows.
- Price changes were staged only where there was a clear mismatch or a direct retail/value anchor.
- The two Joker #337 catalog rows should remain visible for follow-up duplicate handling rather than being merged in this batch.
