# Darkwing Duck, Moon Knight Comics, and Peacemaker review - 2026-07-08

## Darkwing Duck

Promoted to reviewed.

Source:

- ActionFigureGeek Darkwing Duck Funko Pop checklist: https://actionfiguregeek.com/darkwing-duck-funko-pop-checklist-buyers-guide-gallery/

Applied denominator:

- 8 required rows: #296, #297, #298, #299, #300, #463 common, #463 glow chase, and #1328 Funko Shop.
- Catalog-owned rows linked: Launchpad McQuack #297, Gosalyn Mallard #298, Megavolt #463, and Darkwing Duck #1328.
- Missing catalog rows remain as checklist-only requirements: Darkwing Duck #296, Negaduck #299, Negatron #300, and Megavolt #463 glow chase.

Catalog cleanup:

- Set all owned Darkwing Duck catalog rows to `set_total = 8`.
- Marked Darkwing Duck #1328 as `Funko Shop`.
- Marked Megavolt #463 as `GameStop`.

## Moon Knight (Comics)

Promoted to reviewed.

Sources:

- Moon Knight Fan Funko reference: https://www.moonknightfan.com/funkos.html
- Official Funko Pop! Deluxe Mr. Knight #1199 detail: https://funko.com/pop-deluxe-mr.-knight/68730.html

Applied denominator:

- 7 required rows: #266, #267 glow, #272, Comic Covers #08 and #54, Pop! Deluxe Mr. Knight #1199 common, and Pop! Deluxe Mr. Knight #1199 glow chase.
- Catalog-owned rows linked: #266, #272, Comic Covers #08, and Mr. Knight #1199 common.
- Missing catalog rows remain as checklist-only requirements: #267 glow, Comic Covers #54, and Mr. Knight #1199 glow chase.

Catalog cleanup:

- Set all owned Moon Knight (Comics) catalog rows to `set_total = 7`.
- Corrected UPC `889698615006` to `pop_type = Pop! Comic Covers` while preserving `pop_style = Comic Cover`.
- Kept UPC `889698213783` as `Hot Topic`, because the Moon Knight Fan source notes it was released at 2017 LA Comic Con and later became Hot Topic exclusive.

## Peacemaker

Verified unchanged.

Source:

- FigureRealm Peacemaker checklist: https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3928

Current state:

- Already reviewed.
- 10 required checklist rows.
- 10 checklist rows linked to catalog rows.
- No catalog, ownership, value, or image changes applied.

## Parser note

- Added Darkwing Duck local `lookup_pop` overrides for the four owned UPCs.
- Updated Moon Knight Comic Covers #08 local override from `Pop! Marvel` to `Pop! Comic Covers`.
