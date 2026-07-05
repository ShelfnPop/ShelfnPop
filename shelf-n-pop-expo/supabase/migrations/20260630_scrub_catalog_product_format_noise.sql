update public.pop_catalog
set set_name = 'Moon Knight'
where set_name is null
  and lower(coalesce(raw_title,'') || ' ' || coalesce(clean_title,'') || ' ' || coalesce(description,'')) like '%moon knight%';

update public.pop_catalog
set set_name = 'Thor: Ragnarok'
where set_name is null
  and lower(coalesce(raw_title,'') || ' ' || coalesce(clean_title,'') || ' ' || coalesce(description,'')) like '%thor%ragnarok%';

update public.pop_catalog
set set_name = 'Ant-Man and the Wasp: Quantumania'
where lower(coalesce(raw_title,'') || ' ' || coalesce(clean_title,'') || ' ' || coalesce(description,'')) ~ '(quantumania|ant[- ]man)'
  and coalesce(set_name,'') = '';

update public.pop_catalog
set set_name = 'Guardians of the Galaxy Vol. 3'
where lower(coalesce(raw_title,'') || ' ' || coalesce(clean_title,'') || ' ' || coalesce(description,'')) like '%guardians%galaxy%3%'
  and coalesce(set_name,'') in ('', 'Guardians of the Galaxy');

with cleaned as (
  select
    id,
    nullif(
      btrim(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(
                      regexp_replace(
                        regexp_replace(
                          regexp_replace(
                            regexp_replace(
                              regexp_replace(
                                regexp_replace(
                                  regexp_replace(
                                    regexp_replace(
                                      pop_name,
                                      '^\s*[~!¡]+\s*|\s*[~!¡]+\s*$', '', 'gi'
                                    ),
                                    '\m(?:Pop!?\s*)?(?:Vinyl\s+)?Bobble[- ]?Head\M|\mBobblehead\M|\mVinilo\s+Bobble\s+Head\M',
                                    ' ',
                                    'gi'
                                  ),
                                  '\m(?:Pop!?\s*)?Vinyl\M',
                                  ' ',
                                  'gi'
                                ),
                                '\m(?:Action\s+Figure|Vinyl\s+Figure|Figure|Figurine)\M',
                                ' ',
                                'gi'
                              ),
                              '\m\d+(?:\.\d+)?\s*[- ]?cm\M',
                              ' ',
                              'gi'
                            ),
                            '\mMarvel\M|\mDC\M|\mStar\s+Wars\M|\mThe\s+Simpsons\M|\mStranger\s+Things\M',
                            ' ',
                            'gi'
                          ),
                          '\mThor:?\s+Ragnarok\M|\mThor\s+Ragnarok\M',
                          ' ',
                          'gi'
                        ),
                        '\mAvengers(?:\s+4)?\s+Endgame\M|\mAvengers\s+Infinity\s+War\M',
                        ' ',
                        'gi'
                      ),
                      '\mGuardians\s+Of\s+The\s+Galaxy(?::?\s+Vol\.?\s*3|\s+3)?\M',
                      ' ',
                      'gi'
                    ),
                    '\mAnt[- ]Man\s+(?:&|And)\s+The\s+Wasp:?\s+Quantumania\M|\mAnt\s+Man\s+Quantumania\M',
                    ' ',
                    'gi'
                  ),
                  '\mMoon\s+Knight\M',
                  ' ',
                  'gi'
                ),
                '\mThunderbolts\M',
                ' ',
                'gi'
              ),
              '\s+',
              ' ',
              'g'
            ),
            '^\s*[-–—:]+\s*|\s*[-–—:]+\s*$',
            '',
            'g'
          ),
          '\s+',
          ' ',
          'g'
        )
      ),
      ''
    ) as clean_name
  from public.pop_catalog
  where pop_name ilike '%vinyl%'
     or pop_name ilike '%bobble%'
     or pop_name ilike '%9 cm%'
     or pop_name ilike '%10cm%'
     or pop_name like '~%'
)
update public.pop_catalog pc
set
  pop_name = cleaned.clean_name,
  character = case
    when pc.character is null then cleaned.clean_name
    when pc.character = pc.pop_name then cleaned.clean_name
    when pc.character ilike '%vinyl%'
      or pc.character ilike '%bobble%'
      or pc.character ilike '%9 cm%'
      or pc.character ilike '%10cm%'
      or pc.character like '~%'
    then cleaned.clean_name
    else pc.character
  end,
  display_description = case
    when cleaned.clean_name is not null
      and (
        pc.display_description is null
        or trim(pc.display_description) = ''
        or pc.display_description ilike '%' || pc.pop_name || '%'
        or pc.display_description ~* '(all funko pop|sold with boxes|box image|condition listed|window display box|collect them all|stylized pop vinyl|pop vinyl figures take characters|authentic preloved|high quality pop protector|packaging not guaranteed|figure stands|comes packaged|comes package|vinyl bobblehead is|vinyl figure)'
      )
    then cleaned.clean_name || ' is a ' ||
      case when pc.franchise is not null and btrim(pc.franchise) <> '' then pc.franchise || ' ' else '' end ||
      'Funko Pop' ||
      case when pc.number is not null and btrim(pc.number) <> '' then ' #' || pc.number else '' end ||
      case when pc.set_name is not null and btrim(pc.set_name) <> '' and coalesce(pc.franchise, '') <> pc.set_name then ' from ' || pc.set_name else '' end ||
      case when pc.limited_edition is true then ' Limited Edition.' else '.' end
    else pc.display_description
  end,
  needs_review = case
    when cleaned.clean_name is null then true
    else pc.needs_review
  end
from cleaned
where pc.id = cleaned.id
  and cleaned.clean_name is not null;

update public.pop_catalog
set display_description =
  pop_name || ' is a ' ||
  case when franchise is not null and btrim(franchise) <> '' then franchise || ' ' else '' end ||
  'Funko Pop' ||
  case when number is not null and btrim(number) <> '' then ' #' || number else '' end ||
  case when set_name is not null and btrim(set_name) <> '' and coalesce(franchise, '') <> set_name then ' from ' || set_name else '' end ||
  case when limited_edition is true then ' Limited Edition.' else '.' end
where pop_name is not null
  and display_description ~* '(all funko pop|sold with boxes|box image|condition listed|window display box|collect them all|stylized pop vinyl|pop vinyl figures take characters|authentic preloved|high quality pop protector|packaging not guaranteed|figure stands|comes packaged|comes package|vinyl bobblehead is|vinyl figure)';
