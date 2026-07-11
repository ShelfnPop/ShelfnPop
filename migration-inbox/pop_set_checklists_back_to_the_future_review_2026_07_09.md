# Back to the Future cleanup review - 2026-07-09

## Back to the Future

Kept the existing reviewed Pop! Vinyl denominator at 25 rows.

Sources:

- FigureRealm Back to the Future Pop! Vinyl checklist: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=415&ssid=12
- Official Funko Doc with Helmet #959: https://funko.com/pop-doc-with-helmet/46914.html
- PriceCharting Doc with Helmet GITD #959: https://www.pricecharting.com/game/funko-pop-movies/doc-with-helmet-gitd-959
- Walmart / retail cross-check for Doc & Einstein #972: https://www.walmart.com/ip/Funko-Pop-Doc-Einstein-972-Back-to-the-Future-Vinyl-Figure/17559269436

Applied cleanup:

- Normalized owned Pop! Movies rows into `Back to the Future` with `set_total = 25`.
- Linked newly cleaned owned rows into the existing reviewed checklist where applicable.
- Corrected regular `Marty McFly #49` and `Dr. Emmett Brown #50` away from glow/exclusive hints that belonged to different variants.
- Kept `Doc with Helmet #959` and `Doc with Helmet (Glows In The Dark) #959` as separate owned UPC rows.
- Moved `Back to the Future Part II`, `Back To The Future Part II`, `Back To The Future Part III`, and `FUN / Zavvi. Back To The Future II` owned Pop! Movies rows into the reviewed `Back to the Future` 25-row Pop! Vinyl scope.

Owned UPCs cleaned in this scope:

- `830395034003` Marty McFly #49
- `830395033990` Dr. Emmett Brown #50
- `849803059071` Marty McFly (Hoverboard) #245
- `889698430906` Marty McFly (Cowboy) #816
- `889698469128` Marty with Glasses #958
- `889698635837` Doc with Helmet (Glows In The Dark) #959
- `889698469159` Doc 2015 #960
- `889698487054` Marty in Puffy Vest #961
- `889698485159` Biff Tannen #963
- `889698487085` Marty with Hoverboard #964
- `889698496858` Doc & Einstein #972

## Back to the Future Digital

Promoted to reviewed as a focused Digital physical-release scope.

Source:

- PriceCharting Doc 1885 #219 Digital: https://www.pricecharting.com/game/funko-pop-digital/doc-1885-219

Applied denominator:

- 1 required row: Doc 1885 #219.
- Owned UPC `889698815185` linked.
- Marked as limited edition with `limited_count = 1900`.
- Kept separate from the 25-row Pop! Vinyl scope.

## Back to the Future Part II: Deluxe Moment

Promoted to reviewed as a focused Deluxe Moment scope.

Source:

- Official Funko Hoverboard Chase Deluxe Moment: https://funko.com/pop-deluxe-moment-back-to-the-future-ii---hoverboard-chase/76563.html

Applied denominator:

- 1 required row: Hoverboard Chase Deluxe Moment.
- Owned UPC `889698765633` linked.
- Kept separate from the 25-row Pop! Vinyl scope.

## Verification

- `Back to the Future`: reviewed `25/25`.
- `Back to the Future Digital`: reviewed `1/1`.
- `Back to the Future Part II: Deluxe Moment`: reviewed `1/1`.
- Final owned Back to the Future backlog query returned no rows needing `set_total`, franchise, or review cleanup.

## Parser note

- Added local `lookup_pop` overrides for the newly cleaned owned Back to the Future UPCs so future barcode refreshes preserve the corrected scopes.

No ownership quantities, paid values, current values, or images were changed.
