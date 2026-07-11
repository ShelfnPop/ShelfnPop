# DC Super Heroes + Superman First Pass Review - 2026-07-08

## Applied live catalog changes

- Moved holiday rows from broad `Superman` / `DC Super Heroes` buckets into `DC Holiday`.
  - Superman in Holiday Sweater #353: common, DIY, and Flocked rows
  - Harley Quinn with Helper #357
  - The Penguin Snowman #367, Hot Topic
- Moved gingerbread rows into `DC Gingerbread`.
  - Gingerbread Superman #443
  - Gingerbread Aquaman #445
- Moved Bugs Bunny as Superman #842 out of `Superman` and into `DC Looney Tunes` under franchise `Looney Tunes`.
- Cleaned obvious noisy names inside the remaining `DC Super Heroes` bucket.
  - Heroes The Flash -> The Flash
  - Thrillkiller Batman 69 -> Thrillkiller Batman
  - New 52 Reverse Flash -> Reverse-Flash, variant New 52
  - The Joker Martha Wayne -> The Joker (Martha Wayne)
  - The Joker Death In The Family -> The Joker (Death in the Family)

## Set totals added

| Set | Total | Confidence | Source |
| --- | ---: | ---: | --- |
| DC Holiday | 8 | 0.78 | Sweets and Geeks DC Holiday listings |
| DC Gingerbread | 5 | 0.82 | Superman Homepage gingerbread wave summary |
| DC Looney Tunes | none yet | 0.90 | PriceCharting Bugs Bunny as Superman detail |

## Verification

- `DC Super Heroes` dropped from 38 to 35 live catalog rows.
- `Superman` dropped from 24 to 19 live catalog rows.
- `DC Holiday` now has 6 owned catalog rows, all with `set_total = 8`.
- `DC Gingerbread` now has 2 owned catalog rows, both with `set_total = 5`.
- `DC Looney Tunes` now has Bugs Bunny as Superman #842 with release date `2020-01-01`.
- TypeScript check passed after adding parser overrides to `lookup_pop`.

## Follow-up

- Deploy `shelf-n-pop-expo/supabase/functions/lookup_pop/index.ts` before relying on the parser overrides in live scans. The local Supabase CLI was not available in this shell.
- Next DC pass should review the remaining broad `DC Super Heroes` rows and decide whether to keep a master checklist, split into character/story buckets, or only split obvious sub-lines.
