-- DC Super Heroes + Superman first cleanup pass, 2026-07-08.
-- Goal: split obvious sub-lines out of broad DC buckets and clean noisy display names.

update public.pop_catalog
set
  pop_name = case upc
    when '830395022482' then 'The Flash'
    when '849803055653' then 'Thrillkiller Batman'
    when '849803071714' then 'Reverse-Flash'
    when '889698144025' then 'The Joker (Martha Wayne)'
    when '889698374873' then 'The Joker (Death in the Family)'
    when '889698506410' then 'Superman in Holiday Sweater'
    when '889698579568' then 'Superman in Holiday Sweater'
    when '889698506519' then 'Superman in Holiday Sweater'
    when '889698506564' then 'Harley Quinn with Helper'
    when '889698516747' then 'The Penguin Snowman'
    when '889698643214' then 'Gingerbread Aquaman'
    when '889698643221' then 'Gingerbread Superman'
    when '889698491631' then 'Bugs Bunny as Superman'
    else pop_name
  end,
  character = case upc
    when '830395022482' then 'The Flash'
    when '849803055653' then 'Batman'
    when '849803071714' then 'Reverse-Flash'
    when '889698144025' then 'The Joker'
    when '889698374873' then 'The Joker'
    when '889698506410' then 'Superman'
    when '889698579568' then 'Superman'
    when '889698506519' then 'Superman'
    when '889698506564' then 'Harley Quinn'
    when '889698516747' then 'The Penguin'
    when '889698643214' then 'Aquaman'
    when '889698643221' then 'Superman'
    when '889698491631' then 'Bugs Bunny'
    else character
  end,
  set_name = case upc
    when '889698506410' then 'DC Holiday'
    when '889698579568' then 'DC Holiday'
    when '889698506519' then 'DC Holiday'
    when '889698506564' then 'DC Holiday'
    when '889698516747' then 'DC Holiday'
    when '889698643214' then 'DC Gingerbread'
    when '889698643221' then 'DC Gingerbread'
    when '889698491631' then 'DC Looney Tunes'
    else set_name
  end,
  franchise = case upc
    when '889698491631' then 'Looney Tunes'
    else franchise
  end,
  variant = case upc
    when '849803071714' then 'New 52'
    when '889698491631' then 'Superman'
    else variant
  end,
  exclusivity = case upc
    when '889698516747' then 'Hot Topic'
    when '889698491631' then 'FYE'
    else exclusivity
  end,
  pop_type = case upc
    when '889698491631' then 'Pop! Animation'
    else pop_type
  end,
  set_total = case upc
    when '889698506410' then 8
    when '889698579568' then 8
    when '889698506519' then 8
    when '889698506564' then 8
    when '889698516747' then 8
    when '889698643214' then 5
    when '889698643221' then 5
    else set_total
  end,
  release_date = case upc
    when '889698491631' then date '2020-01-01'
    else release_date
  end,
  description = case upc
    when '889698491631' then 'Bugs Bunny as Superman is a DC Looney Tunes Pop! Animation release #842, FYE exclusive.'
    else description
  end,
  display_description = case upc
    when '889698491631' then 'Bugs Bunny as Superman is a DC Looney Tunes Pop! Animation release #842, FYE exclusive.'
    else display_description
  end
where upc in (
  '830395022482',
  '849803055653',
  '849803071714',
  '889698144025',
  '889698374873',
  '889698506410',
  '889698579568',
  '889698506519',
  '889698506564',
  '889698516747',
  '889698643214',
  '889698643221',
  '889698491631'
);

insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
values
  ('DC Holiday', 'DC', 'reviewed', 'Sweets and Geeks DC Holiday listings', 'https://www.sweetsandgeeks.com/collections/funko-holiday/dc-comics', 0.78, now(), 'Holiday sub-line. Count set to 8 based on named holiday standard releases visible in source: Superman #353, Wonder Woman #354, Batman #355, Flash #356, Harley Quinn #357, Joker #358, Silent Knight Batman #366, Penguin Snowman #367. Variants and multi-packs should be revisited.'),
  ('DC Gingerbread', 'DC', 'reviewed', 'Superman Homepage DC Heroes Gingerbread summary', 'https://www.supermanhomepage.com/dc-heroes-gingerbread-superman-funko-pop-vinyl-figure/', 0.82, now(), 'Gingerbread DC Heroes wave; source names Batman, Wonder Woman, Aquaman, The Flash, and Superman as a five-figure set.'),
  ('DC Looney Tunes', 'Looney Tunes', 'reviewed', 'PriceCharting Bugs Bunny as Superman details', 'https://www.pricecharting.com/game/funko-pop-animation/bugs-as-superman-842', 0.90, now(), 'DC Looney Tunes crossover line. Bugs Bunny as Superman #842 verified as Pop! Animation, series DC Looney Tunes, released 2020-01-01.')
on conflict (canonical_name, franchise) do update set
  status = excluded.status,
  source_label = excluded.source_label,
  source_url = excluded.source_url,
  confidence = excluded.confidence,
  reviewed_at = excluded.reviewed_at,
  notes = excluded.notes,
  updated_at = now();
