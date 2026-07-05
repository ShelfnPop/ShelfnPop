update public.pop_catalog
set
  pop_name = 'Scarlet Witch Flying',
  character = 'Scarlet Witch Flying',
  display_description = 'Scarlet Witch Flying is a Marvel Funko Pop #828 from WandaVision.',
  needs_review = false
where id = '689117a0-22ba-4c4b-82ab-366816bb92a5';

update public.pop_catalog
set
  pop_name = 'Human Torch',
  character = 'Human Torch',
  set_name = 'Fantastic Four',
  display_description = 'Human Torch is a Marvel Funko Pop #569 from Fantastic Four.',
  needs_review = false
where id = '13140cfc-653c-40d5-a1a7-391b2d97112f';

update public.pop_catalog
set
  pop_name = 'Mole Man',
  character = 'Mole Man',
  set_name = 'Fantastic Four',
  display_description = 'Mole Man is a Marvel Funko Pop from Fantastic Four.',
  needs_review = false
where id = '7ca1eb77-cd18-4c7f-b5bf-e4093196615d';

update public.pop_catalog
set
  pop_name = 'Fantastic Four: First Steps #1504',
  character = null,
  display_description = 'Fantastic Four: First Steps #1504 needs a quick review because the source title did not include the character name.',
  needs_review = true
where id = '812b0915-eeee-49ca-8cf8-686888f3ca5d';

update public.pop_catalog
set set_name = 'Fantastic Four'
where set_name = 'Fantastic Four: First Steps'
  and lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(description, '')) like '%fantastic four%'
  and lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(description, '')) not like '%first steps%'
  and lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(description, '')) not like '%(2025)%'
  and lower(coalesce(raw_title, '') || ' ' || coalesce(clean_title, '') || ' ' || coalesce(description, '')) not like '%2025%';
