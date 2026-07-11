update public.pop_catalog
set
  franchise = case
    when nullif(trim(franchise), '') is null and set_name ilike 'Ted Lasso' then 'Ted Lasso'
    when nullif(trim(franchise), '') is null and set_name ilike 'Parks And Recreation' then 'Parks and Recreation'
    when nullif(trim(franchise), '') is null and set_name ilike 'Army Of Darkness%' then 'Army of Darkness'
    when nullif(trim(franchise), '') is null and set_name ilike 'Cocaine Bear' then 'Cocaine Bear'
    when nullif(trim(franchise), '') is null and set_name ilike 'Robocop' then 'RoboCop'
    when nullif(trim(franchise), '') is null and set_name ilike 'Bullet Train' then 'Bullet Train'
    when nullif(trim(franchise), '') is null and set_name ilike 'Jingle All The Way' then 'Jingle All the Way'
    when nullif(trim(franchise), '') is null and set_name ilike 'Wallace And Gromit' then 'Wallace and Gromit'
    else franchise
  end,
  set_name = case
    when set_name ilike 'Parks And Recreation' then 'Parks and Recreation'
    when set_name ilike 'Army Of Darkness' then 'Army of Darkness'
    when set_name ilike 'Army Of Darkness S2' then 'Army of Darkness S2'
    when set_name ilike 'Army Of Darkness. Scare Fair%' then 'Army of Darkness: Scare Fair 2024'
    when set_name ilike 'Robocop' then 'RoboCop'
    when set_name ilike 'Jingle All The Way' then 'Jingle All the Way'
    when set_name ilike 'Wallace And Gromit' then 'Wallace and Gromit'
    else set_name
  end
where upc in (
  '889698838429',
  '889698838405',
  '889698828505',
  '830395034072',
  '889698819480',
  '889698771887',
  '889698801720',
  '889698801751',
  '889698726580',
  '889698744317',
  '889698561679',
  '889698561693',
  '889698561662',
  '889698561686',
  '889698807944',
  '889698657396',
  '889698568326',
  '889698476942',
  '889698785839',
  '889698757171',
  '889698707206',
  '889698707190',
  '889698662475',
  '889698664806',
  '889698662581',
  '889698657099',
  '889698657082',
  '889698657105'
);

update public.pop_catalog
set
  franchise = 'Parks and Recreation',
  set_name = 'Parks and Recreation',
  pop_type = 'Pop! Television',
  pop_name = case
    when upc = '889698726559' then 'Ann Perkins (Pawnee Goddesses)'
    else pop_name
  end,
  display_description = case
    when upc = '889698726559' then 'From Parks and Recreation, Ann Perkins (Pawnee Goddesses) is a Pop! Television release.'
    when upc = '889698726566' then 'From Parks and Recreation, April Ludgate (Pawnee Goddesses) is a Pop! Television release.'
    else display_description
  end
where upc in ('889698726559', '889698726566');

update public.pop_catalog
set
  pop_name = 'Dapper Donald Duck',
  set_name = 'Disney 90th Anniversary',
  number = '1444',
  pop_type = 'Pop! Disney',
  display_description = 'From Disney 90th Anniversary, Dapper Donald Duck is a Pop! Disney release #1444.'
where upc = '889698757249';

update public.pop_catalog
set
  needs_review = false
where upc = '889698879347'
  and pop_name = 'H.E.R.B.I.E'
  and franchise = 'Marvel'
  and set_name = 'Fantastic Four: First Steps'
  and pop_type = 'Pop! Marvel'
  and number = '1504';
