-- Replace visibly truncated retailer/API blurbs with concise catalog descriptions.

update public.pop_catalog
set
  display_description =
    'From ' || coalesce(nullif(trim(set_name), ''), nullif(trim(franchise), ''), 'this collection') ||
    ', ' || pop_name ||
    ' is a ' || coalesce(nullif(trim(pop_type), ''), 'Funko Pop') ||
    ' release' ||
    case
      when nullif(trim(number), '') is not null then ' #' || trim(number)
      else ''
    end ||
    case
      when nullif(trim(variant), '') is not null and lower(trim(variant)) <> 'common' then ', ' || trim(variant)
      else ''
    end ||
    case
      when nullif(trim(exclusivity), '') is not null then ', exclusive to ' || trim(exclusivity)
      else ''
    end ||
    '.',
  api_last_updated = now()
where display_description ~ '\\.\\.\\.$'
   or display_description ~ '\\bwith Pop!$';
