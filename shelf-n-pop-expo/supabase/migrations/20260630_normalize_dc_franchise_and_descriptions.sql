update public.pop_catalog
set
  franchise = 'DC',
  set_name = case
    when lower(coalesce(set_name, '')) in ('', 'dc') and (
      pop_name ilike '%justice league%' or
      character ilike '%justice league%' or
      coalesce(description, '') ilike '%justice league%' or
      coalesce(display_description, '') ilike '%justice league%'
    ) then 'Justice League'
    when lower(coalesce(set_name, '')) in ('', 'dc') and (
      pop_name ilike '%man of steel%' or
      character ilike '%man of steel%' or
      coalesce(description, '') ilike '%man of steel%' or
      coalesce(display_description, '') ilike '%man of steel%'
    ) then 'Man of Steel'
    when lower(coalesce(set_name, '')) in ('', 'dc') and (
      pop_name ilike '%superman%' or
      character ilike '%superman%' or
      coalesce(description, '') ilike '%superman%'
    ) then 'Superman'
    else set_name
  end,
  display_description = case
    when (
      coalesce(display_description, '') ~* '(spider-man|spiderman|green goblin|no way home|marvel)'
      and (
        pop_name ilike '%man of steel%' or
        character ilike '%man of steel%' or
        pop_name ilike '%superman%' or
        character ilike '%superman%' or
        pop_name ilike '%justice league%' or
        character ilike '%justice league%'
      )
    ) then
      coalesce(nullif(character, ''), nullif(pop_name, ''), 'This Pop') ||
      ' is a DC Funko Pop' ||
      case
        when number is not null and btrim(number) <> '' then ' #' || number
        else ''
      end ||
      case
        when (
          case
            when lower(coalesce(set_name, '')) in ('', 'dc') and (
              pop_name ilike '%justice league%' or
              character ilike '%justice league%' or
              coalesce(description, '') ilike '%justice league%' or
              coalesce(display_description, '') ilike '%justice league%'
            ) then 'Justice League'
            when lower(coalesce(set_name, '')) in ('', 'dc') and (
              pop_name ilike '%man of steel%' or
              character ilike '%man of steel%' or
              coalesce(description, '') ilike '%man of steel%' or
              coalesce(display_description, '') ilike '%man of steel%'
            ) then 'Man of Steel'
            when lower(coalesce(set_name, '')) in ('', 'dc') and (
              pop_name ilike '%superman%' or
              character ilike '%superman%' or
              coalesce(description, '') ilike '%superman%'
            ) then 'Superman'
            else set_name
          end
        ) is not null
        and btrim(
          case
            when lower(coalesce(set_name, '')) in ('', 'dc') and (
              pop_name ilike '%justice league%' or
              character ilike '%justice league%' or
              coalesce(description, '') ilike '%justice league%' or
              coalesce(display_description, '') ilike '%justice league%'
            ) then 'Justice League'
            when lower(coalesce(set_name, '')) in ('', 'dc') and (
              pop_name ilike '%man of steel%' or
              character ilike '%man of steel%' or
              coalesce(description, '') ilike '%man of steel%' or
              coalesce(display_description, '') ilike '%man of steel%'
            ) then 'Man of Steel'
            when lower(coalesce(set_name, '')) in ('', 'dc') and (
              pop_name ilike '%superman%' or
              character ilike '%superman%' or
              coalesce(description, '') ilike '%superman%'
            ) then 'Superman'
            else set_name
          end
        ) <> ''
        then ' from ' ||
          case
            when lower(coalesce(set_name, '')) in ('', 'dc') and (
              pop_name ilike '%justice league%' or
              character ilike '%justice league%' or
              coalesce(description, '') ilike '%justice league%' or
              coalesce(display_description, '') ilike '%justice league%'
            ) then 'Justice League'
            when lower(coalesce(set_name, '')) in ('', 'dc') and (
              pop_name ilike '%man of steel%' or
              character ilike '%man of steel%' or
              coalesce(description, '') ilike '%man of steel%' or
              coalesce(display_description, '') ilike '%man of steel%'
            ) then 'Man of Steel'
            when lower(coalesce(set_name, '')) in ('', 'dc') and (
              pop_name ilike '%superman%' or
              character ilike '%superman%' or
              coalesce(description, '') ilike '%superman%'
            ) then 'Superman'
            else set_name
          end
        else ''
      end || '.'
    else display_description
  end,
  needs_review = false
where
  franchise in ('Justice League', 'Superman', 'Man of Steel')
  or pop_name ilike '%justice league%'
  or character ilike '%justice league%'
  or pop_name ilike '%man of steel%'
  or character ilike '%man of steel%'
  or upc in ('830395030494', '830395030500');

update public.pop_catalog
set
  pop_name = 'Superman',
  character = 'Superman',
  franchise = 'DC',
  set_name = 'Man of Steel',
  display_description = 'Superman is a DC Funko Pop from Man of Steel.',
  needs_review = false
where upc = '830395030494';

update public.pop_catalog
set
  pop_name = 'General Zod',
  character = 'General Zod',
  franchise = 'DC',
  set_name = 'Man of Steel',
  display_description = 'General Zod is a DC Funko Pop from Man of Steel.',
  needs_review = false
where upc = '830395030500';
