-- Star Wars leftovers story split, applied 2026-07-08.
-- Scope: reduce the generic Star Wars bucket using high-confidence story-backed rows.
-- Notes:
--   * Convention/store details stay in exclusivity, not set_name.
--   * No set totals are assigned in this pass.
-- Sources:
--   * Funko C-3PO #13: https://funko.com/pop-c-3po/2387.html
--   * Target Darth Vader Rebuild #757: https://www.target.com/p/funko-pop-star-wars-darth-vader-rebuild-figure/-/A-93091027
--   * Funko Lando Calrissian in the Millennium Falcon #514: https://funko.com/pop-rides-lando-calrissian-in-the-millennium-falcon/64121.html
--   * PriceCharting / marketplace cross-checks for Star Wars box numbers and exclusivities.

update public.pop_catalog
set
  set_name = case
    when upc in ('830395023007', '889698239677', '830395023878', '889698118415') then 'Star Wars: A New Hope'
    when upc in ('849803055400', '889698641210') then 'Star Wars: Return of the Jedi'
    when upc in ('889698127493', '889698845304') then 'Star Wars: Revenge of the Sith'
    when upc in ('889698316842') then 'Star Wars: Attack of the Clones'
    when upc in ('889698376662', '889698406772') then 'Star Wars: The Phantom Menace'
    else set_name
  end,
  pop_name = case
    when upc = '849803055400' then 'Yoda (Spirit)'
    when upc = '889698239677' then 'Stormtrooper (Red)'
    when upc = '889698127493' then 'Mace Windu'
    when upc = '889698316842' then 'Jango Fett (Metallic Gold)'
    when upc = '889698641210' then 'Lando Calrissian in the Millennium Falcon'
    when upc = '830395023878' then 'C-3PO'
    when upc = '889698845304' then 'Darth Vader (Rebuild)'
    else pop_name
  end,
  character = case
    when upc = '889698239677' then 'Stormtrooper'
    when upc = '889698316842' then 'Jango Fett'
    when upc = '889698641210' then 'Lando Calrissian'
    when upc = '889698845304' then 'Darth Vader'
    else character
  end,
  variant = case
    when upc = '849803055400' then 'Glow in the Dark'
    when upc = '889698239677' then 'Red'
    when upc = '889698316842' then 'Metallic Gold'
    when upc = '889698845304' then 'Rebuild'
    else variant
  end,
  exclusivity = case
    when upc = '889698239677' then 'Target'
    when upc = '889698127493' then 'Walgreens'
    when upc = '889698316842' then 'Walmart'
    when upc = '889698376662' then 'Star Wars Celebration'
    when upc = '889698406772' then 'Smuggler''s Bounty'
    when upc = '889698641210' then 'Galactic Convention'
    when upc = '889698845304' then 'TargetCon'
    else exclusivity
  end,
  pop_style = case
    when upc = '889698641210' then 'Ride'
    else pop_style
  end,
  vault_status = case
    when upc in ('830395023007', '830395023878') then 'Vaulted'
    else vault_status
  end,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.88),
  needs_review = false
where franchise = 'Star Wars'
  and set_name = 'Star Wars'
  and upc in (
    '830395023007',
    '849803055400',
    '889698239677',
    '830395023878',
    '889698118415',
    '889698127493',
    '889698316842',
    '889698376662',
    '889698406772',
    '889698641210',
    '889698845304'
  );
