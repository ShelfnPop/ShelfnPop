# Toy Story + Stranger Things Set Cleanup Review - 2026-07-08

Applied SQL: `pop_catalog_toy_story_stranger_things_set_cleanup_2026_07_08.sql`.

## Resulting buckets

Toy Story:

- Lightyear: 1
- Toy Story: 6
- Toy Story 30th Anniversary: 1
- Toy Story 4: 3
- Toy Story 5: 3

Stranger Things:

- Stranger Things: 6
- Stranger Things: Season 1: 9
- Stranger Things: Season 2: 13
- Stranger Things: Season 3: 13
- Stranger Things: Season 4: 29
- Stranger Things: Season 5: 23

## Notes

- Cleaned punctuation/noisy labels such as `Stranger Things.`, `Stranger Things. Special Edition`, and `Stranger Things S5 Wave 2`.
- Moved Woody on Bullseye #1597 to `Toy Story 30th Anniversary`.
- Moved Bullseye as Buzz Lightyear #1721 and Bullseye #1713 to `Toy Story 5`.
- Filled Bullseye's missing Toy Story 5 box number as `1713`.
- Left six Stranger Things rows in the general `Stranger Things` bucket because their exact season/set should be reviewed separately: Dustin With Die #05, Eleven Split #011, Steve Harrington #13, Murray #85, Eleven #545, and Robin/Steve/Vecna 3-Pack.
