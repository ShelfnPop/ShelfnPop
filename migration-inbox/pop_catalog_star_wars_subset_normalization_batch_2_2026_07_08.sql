-- Star Wars subset normalization batch 2
-- Scope: duplicate/near-duplicate Star Wars set names with high-confidence mapping.
-- Sources:
--   * Star Wars: Rogue One reviewed checklist already loaded from FigureRealm:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5122
--   * Star Wars: The Clone Wars FigureRealm checklist reports 28 Pop! Vinyl Figure rows:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056
--   * The Mandalorian reviewed checklist already loaded from FigureRealm/FunkyPriceGuide comparison:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5091

update public.pop_catalog
set
  set_name = case
    when set_name = 'Star Wars Rogue One' then 'Star Wars: Rogue One'
    when set_name = 'The Clone Wars' then 'Star Wars: The Clone Wars'
    when set_name = 'Star Wars: Return Of The Jedi 40th Anniversary' then 'Star Wars: Return of the Jedi 40th Anniversary'
    when set_name = 'Star Wars: Episode VI Return Of The Jedi' then 'Star Wars: Return of the Jedi'
    when set_name = 'Star Wars: Across The Galaxy' then 'Star Wars: Across the Galaxy'
    when upc = '889698937900' then 'The Mandalorian'
    else set_name
  end,
  set_total = case
    when set_name = 'Star Wars Rogue One' then 37
    when set_name in ('The Clone Wars', 'Star Wars: The Clone Wars') then 28
    when upc = '889698937900' then 112
    else set_total
  end,
  pop_name = case
    when upc = '889698160193' then 'R2-D2 (Jabba''s Skiff)'
    when upc = '889698160162' then 'Luke Skywalker (Jedi)'
    when upc = '889698715621' then 'Holographic Luke Skywalker'
    else pop_name
  end,
  character = case
    when upc = '889698160193' then 'R2-D2'
    when upc = '889698160162' then 'Luke Skywalker'
    when upc = '889698715621' then 'Luke Skywalker'
    else character
  end,
  exclusivity = case
    when upc = '889698937900' then 'Target'
    else exclusivity
  end,
  parse_confidence = greatest(coalesce(parse_confidence, 0), 0.90),
  needs_review = false
where franchise = 'Star Wars'
  and (
    set_name in (
      'Star Wars Rogue One',
      'The Clone Wars',
      'Star Wars: The Clone Wars',
      'Star Wars: Return Of The Jedi 40th Anniversary',
      'Star Wars: Episode VI Return Of The Jedi',
      'Star Wars: Across The Galaxy'
    )
    or upc in (
      '889698937900',
      '889698160193',
      '889698160162',
      '889698715621'
    )
  );

insert into public.pop_sets (
  canonical_name,
  franchise,
  status,
  source_label,
  source_url,
  confidence,
  notes
)
select
  'Star Wars: The Clone Wars',
  'Star Wars',
  'draft',
  'FigureRealm Star Wars - Clone Wars checklist',
  'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056',
  0.82,
  'FigureRealm reports 28 Pop! Vinyl Figure rows; full checklist item load deferred for a dedicated pass.'
where not exists (
  select 1
  from public.pop_sets
  where canonical_name = 'Star Wars: The Clone Wars'
    and franchise = 'Star Wars'
);

update public.pop_sets
set
  status = case when status = 'reviewed' then status else 'draft' end,
  source_label = coalesce(source_label, 'FigureRealm Star Wars - Clone Wars checklist'),
  source_url = coalesce(source_url, 'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=5056'),
  confidence = greatest(coalesce(confidence, 0), 0.82),
  notes = coalesce(notes, 'FigureRealm reports 28 Pop! Vinyl Figure rows; full checklist item load deferred for a dedicated pass.'),
  updated_at = now()
where canonical_name = 'Star Wars: The Clone Wars'
  and franchise = 'Star Wars';
