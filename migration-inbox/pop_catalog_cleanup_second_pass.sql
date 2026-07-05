-- Shelf-n-Pop catalog cleanup - second pass
-- Built from Supabase_parser_cleanup_Jun 27.csv post-cleanup review results.
--
-- Run the PREVIEW query first. Then run the transaction if the suggested
-- changes look right.

-- =========================
-- PREVIEW CURRENT TARGETS
-- =========================

select
  upc,
  pop_name,
  character,
  franchise,
  number,
  variant,
  pop_style,
  raw_title,
  needs_review
from public.pop_catalog
where upc in (
  '889698862295',
  '846626014546',
  '849803053086',
  '889698881210',
  '889698530606',
  '889698855532',
  '889698293754',
  '849803097455',
  '849803097448',
  '889698609944',
  '889698513999',
  '8670ee2e-542e-4027-9942-34b16004a2f6',
  '849803049997',
  '889698648080',
  '849803051044',
  '889698475280',
  '849803037925',
  '889698627818',
  '889698663366',
  '889698111492',
  '889698786706',
  '849803053079',
  '889698111539',
  '849803087395',
  '849803040130',
  '889698579568',
  '889698862271',
  '849803057398',
  '889698702607'
)
or needs_review is true
order by pop_name nulls last;

-- =========================
-- UPDATE SECTION
-- =========================

begin;

-- Direct UPC fixes for rows known from the review export.
update public.pop_catalog
set
  pop_name = 'Adventures of Superman',
  character = 'Adventures of Superman',
  franchise = 'DC',
  number = '50',
  needs_review = false,
  api_last_updated = now()
where upc = '889698862295';

update public.pop_catalog
set
  pop_name = 'Stan Lee Guan Yu',
  character = 'Stan Lee Guan Yu',
  franchise = 'Marvel',
  variant = 'Red',
  exclusivity = coalesce(exclusivity, 'Convention'),
  needs_review = false,
  api_last_updated = now()
where upc = '846626014546';

-- This row is too generic to trust. Keep it reviewable.
update public.pop_catalog
set
  needs_review = true,
  api_last_updated = now()
where upc = '849803053086';

update public.pop_catalog
set
  pop_name = 'Brainiac',
  character = 'Brainiac',
  franchise = 'DC',
  number = null,
  exclusivity = coalesce(exclusivity, 'New York Comic Con'),
  needs_review = false,
  api_last_updated = now()
where upc = '889698881210';

update public.pop_catalog
set
  franchise = 'Coca-Cola',
  pop_name = 'Coke Bottle Cap',
  character = 'Coke Bottle Cap',
  needs_review = false,
  api_last_updated = now()
where upc = '889698530606';

update public.pop_catalog
set
  franchise = 'Disney Afternoon',
  pop_name = 'Flintheart Glomgold',
  character = 'Flintheart Glomgold',
  number = '313',
  needs_review = false,
  api_last_updated = now()
where upc = '889698855532';

update public.pop_catalog
set
  franchise = 'Disney',
  pop_name = 'Aladdin''s First Wish',
  character = 'Aladdin''s First Wish',
  number = '409',
  needs_review = false,
  api_last_updated = now()
where upc = '889698293754';

update public.pop_catalog
set
  pop_name = 'Karl Mordo',
  character = 'Karl Mordo',
  franchise = 'Marvel',
  number = '170',
  needs_review = false,
  api_last_updated = now()
where upc = '849803097455';

update public.pop_catalog
set
  pop_name = 'Doctor Strange',
  character = 'Doctor Strange',
  franchise = 'Marvel',
  number = '169',
  needs_review = false,
  api_last_updated = now()
where upc = '849803097448';

update public.pop_catalog
set
  pop_name = '*NSYNC',
  character = '*NSYNC',
  franchise = '*NSYNC',
  number = null,
  pop_style = 'Album',
  needs_review = false,
  api_last_updated = now()
where upc = '889698609944';

update public.pop_catalog
set
  pop_name = 'Devil Flanders',
  character = 'Devil Flanders',
  franchise = 'The Simpsons',
  variant = coalesce(variant, 'Glow in the Dark'),
  exclusivity = coalesce(exclusivity, 'US Exclusive'),
  needs_review = false,
  api_last_updated = now()
where upc = '889698513999';

update public.pop_catalog
set
  franchise = 'Star Trek',
  pop_name = 'Freddy as Locutus of Borg',
  character = 'Freddy as Locutus of Borg',
  needs_review = false,
  api_last_updated = now()
where upc = '889698845786';

update public.pop_catalog
set
  franchise = 'Frozen',
  pop_name = 'Olaf',
  character = 'Olaf',
  pop_style = 'Keychain',
  needs_review = false,
  api_last_updated = now()
where upc = '849803049997';

update public.pop_catalog
set
  franchise = 'Marvel',
  pop_name = 'Mighty Thor',
  character = 'Mighty Thor',
  number = '1046',
  variant = 'Glow in the Dark',
  needs_review = false,
  api_last_updated = now()
where upc = '889698648080';

update public.pop_catalog
set
  franchise = 'Marvel',
  pop_name = 'Dancing Groot',
  character = 'Dancing Groot',
  needs_review = false,
  api_last_updated = now()
where upc = '849803051044';

update public.pop_catalog
set
  franchise = 'Marvel',
  pop_name = 'Groot Wood Deco',
  character = 'Groot Wood Deco',
  needs_review = false,
  api_last_updated = now()
where upc = '889698475280';

update public.pop_catalog
set
  franchise = 'Marvel',
  pop_name = 'Rocket Raccoon',
  character = 'Rocket Raccoon',
  number = '48',
  needs_review = false,
  api_last_updated = now()
where upc = '849803037925';

update public.pop_catalog
set
  franchise = 'Marvel',
  pop_name = 'Iron Man Model 4',
  character = 'Iron Man Model 4',
  number = '1036',
  pop_style = 'Deluxe',
  needs_review = false,
  api_last_updated = now()
where upc = '889698627818';

update public.pop_catalog
set
  pop_name = 'Homerzilla',
  character = 'Homerzilla',
  franchise = 'The Simpsons',
  number = '15',
  needs_review = false,
  api_last_updated = now()
where upc = '889698663366';

update public.pop_catalog
set
  pop_name = 'Jesse Custer',
  character = 'Jesse Custer',
  franchise = 'Preacher',
  needs_review = false,
  api_last_updated = now()
where upc = '889698111492';

update public.pop_catalog
set
  pop_name = 'Lex Luthor as Superman',
  character = 'Lex Luthor as Superman',
  franchise = 'DC',
  exclusivity = coalesce(exclusivity, 'US Exclusive'),
  needs_review = false,
  api_last_updated = now()
where upc = '889698786706';

update public.pop_catalog
set
  pop_name = 'Morton Schmidt',
  character = 'Morton Schmidt',
  franchise = '21 Jump Street',
  needs_review = false,
  api_last_updated = now()
where upc = '849803053079';

update public.pop_catalog
set
  pop_name = 'Cassidy',
  character = 'Cassidy',
  franchise = 'Preacher',
  needs_review = false,
  api_last_updated = now()
where upc = '889698111539';

update public.pop_catalog
set
  pop_name = 'Star-Lord (Mixed Tape)',
  character = 'Star-Lord',
  franchise = 'Marvel',
  number = '155',
  needs_review = false,
  api_last_updated = now()
where upc = '849803087395';

update public.pop_catalog
set
  pop_name = 'Star-Lord',
  character = 'Star-Lord',
  franchise = 'Marvel',
  number = '52',
  needs_review = false,
  api_last_updated = now()
where upc = '849803040130';

update public.pop_catalog
set
  pop_name = 'Superman Holiday DIY',
  character = 'Superman Holiday DIY',
  franchise = 'DC',
  number = '353',
  exclusivity = coalesce(exclusivity, 'US Exclusive'),
  needs_review = false,
  api_last_updated = now()
where upc = '889698579568';

update public.pop_catalog
set
  pop_name = 'Superman Retro Comic (Flying)',
  character = 'Superman Retro Comic (Flying)',
  franchise = 'DC',
  number = null,
  exclusivity = coalesce(exclusivity, 'New York Comic Con'),
  needs_review = false,
  api_last_updated = now()
where upc = '889698862271';

update public.pop_catalog
set
  pop_name = 'Thanos',
  character = 'Thanos',
  franchise = 'Marvel',
  pop_style = 'Jumbo',
  variant = coalesce(variant, 'Glow in the Dark'),
  needs_review = false,
  api_last_updated = now()
where upc = '849803057398';

update public.pop_catalog
set
  pop_name = 'Theme Song',
  character = 'Theme Song',
  franchise = 'Peacemaker',
  pop_style = 'Moment',
  needs_review = false,
  api_last_updated = now()
where upc = '889698702607';

-- Broad cleanup for any remaining name pollution.
update public.pop_catalog
set
  pop_name = btrim(regexp_replace(
    regexp_replace(
      regexp_replace(pop_name, '\b(Vinyl|Bobblehead|Bobble Head|Figure|Figures)\b', '', 'gi'),
      '\s*\([[:space:]]*\)\s*',
      '',
      'g'
    ),
    '\s+',
    ' ',
    'g'
  )),
  character = case
    when character is null then null
    else btrim(regexp_replace(
      regexp_replace(
        regexp_replace(character, '\b(Vinyl|Bobblehead|Bobble Head|Figure|Figures)\b', '', 'gi'),
        '\s*\([[:space:]]*\)\s*',
        '',
        'g'
      ),
      '\s+',
      ' ',
      'g'
    ))
  end,
  api_last_updated = now()
where pop_name ~* '\b(Vinyl|Bobblehead|Bobble Head|Figure|Figures)\b|\([[:space:]]*\)'
   or character ~* '\b(Vinyl|Bobblehead|Bobble Head|Figure|Figures)\b|\([[:space:]]*\)';

commit;

-- =========================
-- POST-CLEANUP REVIEW
-- =========================

select
  upc,
  pop_name,
  character,
  franchise,
  number,
  variant,
  pop_style,
  raw_title,
  needs_review
from public.pop_catalog
where needs_review is true
order by pop_name nulls last;
