update public.pop_catalog
set display_description =
  trim(
    regexp_replace(
      concat(
        case
          when coalesce(nullif(set_name, ''), nullif(franchise, '')) is not null
            then concat('From ', coalesce(nullif(set_name, ''), nullif(franchise, '')), ', ', coalesce(nullif(pop_name, ''), nullif(character, ''), 'This Pop'))
          else coalesce(nullif(pop_name, ''), nullif(character, ''), 'This Pop')
        end,
        ' is a ',
        case
          when pop_style is not null and btrim(pop_style) <> '' and pop_style !~* '^(standard|common|pop)$'
            then concat(pop_style, ' ')
          else ''
        end,
        coalesce(nullif(pop_type, ''), 'Funko Pop'),
        ' release',
        case when number is not null and btrim(number) <> '' then concat(' #', number) else '' end,
        case when variant is not null and btrim(variant) <> '' and variant !~* '^common$' then concat(', ', variant) else '' end,
        case when exclusivity is not null and btrim(exclusivity) <> '' then concat(', ', exclusivity, ' exclusive') else '' end,
        '.'
      ),
      '\s+',
      ' ',
      'g'
    )
  ),
  api_last_updated = now()
where coalesce(nullif(pop_name, ''), nullif(character, '')) is not null
  and (
    display_description is null
    or btrim(display_description) = ''
    or display_description ~* ' is an? .*funko pop'
    or display_description ~* '^(no description found|product details|description:\s*pop television)'
  );
