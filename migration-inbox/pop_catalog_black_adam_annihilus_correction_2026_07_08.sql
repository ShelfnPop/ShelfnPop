-- Audit note: correction to broad bucket split batch 2, applied 2026-07-08.
-- Scope: Black Adam #348 and Annihilus #917.
-- Sources:
--   Black Adam #348 PriceCharting:
--     https://www.pricecharting.com/game/funko-pop-heroes/black-adam-348
--   Black Adam #348 Big Apple/eBay corroboration:
--     https://www.ebay.com/itm/256182831390
--   Fantastic Four FigureRealm checklist, used as negative evidence because Annihilus #917 is not present:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=1769
--   Annihilus #917 PriceCharting:
--     https://www.pricecharting.com/game/funko-pop-marvel/annihilus-917
--
-- Live changes made:
--   * Moved Black Adam #348 back to DC Super Heroes, set_total null, variant Glow in the Dark,
--     exclusivity Big Apple Collectibles.
--   * Moved Annihilus #917 back to Marvel Universe, set_total null, exclusivity Walgreens.
--   * Corrected matching lookup_pop overrides so future refreshes do not reattach either row to
--     reviewed Black Adam or Fantastic Four completion totals.

update public.pop_catalog
set
  set_name = case upc
    when '889698465472' then 'DC Super Heroes'
    when '889698581561' then 'Marvel Universe'
    else set_name
  end,
  set_total = null,
  variant = case upc
    when '889698465472' then 'Glow in the Dark'
    else variant
  end,
  exclusivity = case upc
    when '889698465472' then 'Big Apple Collectibles'
    when '889698581561' then 'Walgreens'
    else exclusivity
  end
where upc in ('889698465472','889698581561');
