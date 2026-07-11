# Star Wars Force Awakens + generic bucket pass - 2026-07-08

## Applied live

- Loaded `Star Wars: The Force Awakens` as a reviewed set with `61` checklist rows.
- Propagated `set_total = 61` to all owned/catalog `Star Wars: The Force Awakens` rows.
- Moved `Rey (Jakku) #451` from generic `Star Wars` into `Star Wars: The Force Awakens`.
- Split high-confidence rows out of the generic `Star Wars` bucket:
  - `Luke Skywalker (Ceremony) #90` and `Sandtrooper #803` -> `Star Wars: A New Hope`
  - `Boba Fett #102`, `IG-88 #103`, and `Zuckuss #122` -> `Star Wars: The Empire Strikes Back`
  - `Darth Vader (Unmasked) #43`, `Darth Vader (Electrocuted) #288`, `Emperor Palpatine #289`, `Wicket W. Warrick #290`, and `Lando Calrissian (General) #291` -> `Star Wars: Return of the Jedi`
  - `Ezra Bridger #752` -> `Ahsoka`
  - `Kh'ymm #731` -> `Skeleton Crew`

## Verification

- `Star Wars: The Force Awakens`: `15` catalog rows, all with set total `61`.
- `Star Wars: The Force Awakens` set metadata: `reviewed`, `0.88` confidence, `61` checklist rows.
- Generic `Star Wars` bucket reduced from `28` rows to `15` rows.

## Parser guardrails

- Added local parser rules for:
  - `Rey Jakku` -> `Star Wars: The Force Awakens`
  - `Luke Ceremony` / `Sandtrooper` -> `Star Wars: A New Hope`
  - `Boba Fett #102`, `IG-88`, `Zuckuss` -> `Star Wars: The Empire Strikes Back`
  - `Vader Electrocuted`, `Emperor Palpatine`, `Wicket W. Warrick`, `Lando Calrissian General` -> `Star Wars: Return of the Jedi`
  - `Ezra Bridger` -> `Ahsoka`
  - `Kh'ymm` -> `Skeleton Crew`

## Left in generic `Star Wars`

These still need a source-backed pass before moving:

- `Darth Vader #1`
- `Yoda (Spirit) #02`, Glow in the Dark
- `Yoda #3`, Die-Cast
- `Stormtrooper Red #5`
- `C-3PO #13`
- `Yoda [Green Chrome] #124`
- `Han Solo #169`
- `Mace Windu #172`
- `Jango Fett #285`, Metallic
- `Watto #298`
- `Aurra Sing #303`
- `Lando Calrissian in the Millennium Falcon #514`
- `Darth Vader #626`, Diamond Collection
- `C-3PO #638`
- `Darth Vader #757`

## Sources

- FigureRealm Star Wars - Force Awakens: https://www.figurerealm.com/actionfigure?action=seriesitemlist&figures=starwarsforceawakensfunko&id=5071
