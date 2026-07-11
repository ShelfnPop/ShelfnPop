-- Audit note: Invincible TV series set correction, applied 2026-07-08.
-- Sources:
--   FigureRealm Invincible Pop! Vinyl Figures checklist:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=2679&ssid=2
--   Funko Pop! Invincible product page:
--     https://funko.com/gb/pop-invincible/75867.html
--   GameStop Funko Pop! Television Invincible listing:
--     https://www.gamestop.com/collectibles/funko/pop/products/funko-pop-television-invincible---invincible-4.20-in-vinyl-figure/20008769.html
--
-- Live changes made:
--   * Renamed reviewed set row from Invincible to Invincible (TV Series).
--   * Updated owned Allen the Alien (Bloody) row to Pop! Television.
--   * Updated all 16 checklist items to Pop! Television.

update public.pop_sets
set
  canonical_name = 'Invincible (TV Series)',
  source_label = 'FigureRealm Invincible Pop! Vinyl Figures checklist; Funko/GameStop TV line cross-check',
  notes = 'Reviewed 16-item Pop! Vinyl checklist for the Invincible TV/streaming line. Renamed from generic Invincible to keep room for future comic/game-specific splits.',
  updated_at = now()
where canonical_name = 'Invincible'
  and franchise = 'Invincible';

update public.pop_catalog
set
  set_name = 'Invincible (TV Series)',
  pop_type = 'Pop! Television',
  set_total = 16,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false
where upc = '889698918275';

update public.pop_set_checklist_items i
set
  pop_type = 'Pop! Television',
  notes = case
    when i.notes like '%Invincible checklist item%' then replace(i.notes, 'Invincible checklist item', 'Invincible TV Series checklist item')
    else i.notes
  end,
  updated_at = now()
from public.pop_sets s
where i.set_id = s.id
  and s.canonical_name = 'Invincible (TV Series)'
  and s.franchise = 'Invincible';
