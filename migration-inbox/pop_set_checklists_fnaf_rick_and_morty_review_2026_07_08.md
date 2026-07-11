# Five Nights at Freddy's and Rick and Morty set review - 2026-07-08

## Five Nights at Freddy's

Live verification showed Five Nights at Freddy's is already reviewed:

- `pop_sets.status`: reviewed
- `confidence`: 0.84
- `checklist_rows`: 105
- `matched_catalog_rows`: 13
- `set_total` on owned catalog rows: 105

No new FNAF SQL was needed in this pass.

## Rick and Morty

Rick and Morty was still draft from the earlier Incredibles/Pet Sematary/Rick batch because only the 99-row FigureRealm count had been captured. This pass extracts the full FigureRealm Pop! Vinyl Figures subseries checklist and promotes the set to reviewed.

Source:

- FigureRealm Rick and Morty Pop! Vinyl Figures: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=4365&ssid=10

Applied result:

- `pop_sets.status`: reviewed
- `confidence`: 0.88
- `checklist_rows`: 99
- `required_rows`: 99
- `linked_catalog_rows`: 8
- Existing Rick and Morty catalog rows retain `set_total = 99`
- Existing Rick and Morty catalog rows have `missing_numbers = 0`, `missing_images = 0`, and `needs_review = 0`

Catalog identity note:

- The 8 owned/catalog Rick and Morty rows were already normalized before this pass.
- No parser override or edge-function deploy is needed for this step.
