-- Last-five catalog entry review, 2026-07-08.
-- Corrects UPC 889698300322 from a Bob Ross misparse to Tom Riddle #60.
-- Refreshes Dobby #63 Target 10-inch value from a placeholder $1 to the
-- current PriceCharting "New" value reviewed on 2026-07-08.

update public.pop_catalog
set
  pop_name = 'Tom Riddle',
  character = 'Tom Riddle',
  franchise = 'Wizarding World',
  set_name = 'Harry Potter',
  number = '60',
  variant = null,
  exclusivity = null,
  pop_type = 'Pop! Movies',
  pop_style = 'Standard',
  set_total = 219,
  raw_title = 'Funko POP!: Harry Potter - Tom Riddle, Multicolor',
  clean_title = 'Tom Riddle #60',
  description = 'Tom Riddle is a Harry Potter Pop! Movies release #60.',
  display_description = 'Tom Riddle is a Harry Potter Pop! Movies release #60.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698300322';

update public.pop_catalog
set
  estimated_value = 29.99
where upc = '889698311533'
  and coalesce(estimated_value, 0) = 1;

update public.user_collection_items
set
  current_value = 29.99
where pop_catalog_id = (
    select id
    from public.pop_catalog
    where upc = '889698311533'
  )
  and coalesce(current_value, 0) = 1;

update public.pop_catalog
set
  set_name = 'Lilo & Stitch',
  description = 'Lilo is a Lilo & Stitch Pop! Disney release #1043.',
  display_description = 'Lilo is a Lilo & Stitch Pop! Disney release #1043.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698556149';

update public.pop_catalog
set
  pop_name = 'Luau Stitch (Flocked)',
  character = 'Stitch',
  franchise = 'Disney',
  set_name = 'Lilo & Stitch',
  number = '1567',
  variant = 'Flocked',
  exclusivity = 'Target',
  pop_type = 'Pop! Disney',
  pop_style = 'Standard',
  clean_title = 'Luau Stitch (Flocked) #1567',
  description = 'Luau Stitch (Flocked) is a Lilo & Stitch Pop! Disney release #1567, Target exclusive.',
  display_description = 'Luau Stitch (Flocked) is a Lilo & Stitch Pop! Disney release #1567, Target exclusive.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698872003';

update public.pop_catalog
set
  pop_name = 'Luau Angel',
  character = 'Angel',
  franchise = 'Disney',
  set_name = 'Lilo & Stitch',
  number = '1568',
  variant = null,
  exclusivity = null,
  pop_type = 'Pop! Disney',
  pop_style = 'Standard',
  clean_title = 'Luau Angel #1568',
  description = 'Luau Angel is a Lilo & Stitch Pop! Disney release #1568.',
  display_description = 'Luau Angel is a Lilo & Stitch Pop! Disney release #1568.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698862745';

update public.pop_catalog
set
  pop_name = 'Devilish Stitch',
  character = 'Stitch',
  franchise = 'Disney',
  set_name = 'Lilo & Stitch',
  number = '1701',
  variant = null,
  exclusivity = 'Entertainment Earth',
  pop_type = 'Pop! Disney',
  pop_style = 'Standard',
  clean_title = 'Devilish Stitch #1701',
  description = 'Devilish Stitch is a Lilo & Stitch Pop! Disney release #1701, Entertainment Earth exclusive.',
  display_description = 'Devilish Stitch is a Lilo & Stitch Pop! Disney release #1701, Entertainment Earth exclusive.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698918336';

update public.pop_catalog
set
  pop_name = 'Stitch with Balloon',
  character = 'Stitch',
  franchise = 'Disney',
  set_name = 'Lilo & Stitch',
  number = '1709',
  variant = null,
  exclusivity = 'Target',
  pop_type = 'Pop! Disney',
  pop_style = 'Standard',
  clean_title = 'Stitch with Balloon #1709',
  description = 'Stitch with Balloon is a Lilo & Stitch Pop! Disney release #1709, Target exclusive.',
  display_description = 'Stitch with Balloon is a Lilo & Stitch Pop! Disney release #1709, Target exclusive.',
  parse_confidence = 0.98,
  needs_review = false
where upc = '889698917858';
