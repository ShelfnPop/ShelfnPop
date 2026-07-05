update public.pop_catalog
set franchise = 'The Simpsons',
    set_name = 'Treehouse of Horror',
    display_description = 'Simpsons King Homer is a The Simpsons Funko Pop from Treehouse of Horror.'
where id = 'fe09391f-2797-4b4a-910e-3d31038373dd';

update public.pop_catalog
set pop_name = 'Venom Carnage',
    character = 'Venom Carnage',
    franchise = 'Marvel',
    exclusivity = coalesce(exclusivity, 'Exclusive'),
    display_description = 'Venom Carnage is a Marvel Funko Pop Exclusive.'
where id = '129b7169-9e93-4119-bbf5-b3170fc375ce';

update public.pop_catalog
set pop_name = 'Mister Knight',
    character = 'Mister Knight',
    set_name = 'Moon Knight',
    display_description = 'Mister Knight is a Marvel Funko Pop from Moon Knight.'
where id = 'f8963bc5-be2a-4747-9d21-37678b092a4b';

update public.pop_catalog
set display_description = 'Mister Fantastic is a Marvel Funko Pop from Fantastic Four: First Steps.'
where id = '8e2f34f2-ade4-483a-96b9-875f206c8e0b';

update public.pop_catalog
set display_description = 'This catalog row needs review because the source title did not include the character name.',
    needs_review = true
where id = '961cba0d-a1ad-4ec4-9477-42a544143091';

update public.pop_catalog
set display_description =
  pop_name || ' is a ' ||
  case when franchise is not null and btrim(franchise) <> '' then franchise || ' ' else '' end ||
  'Funko Pop' ||
  case when number is not null and btrim(number) <> '' then ' #' || number else '' end ||
  case when set_name is not null and btrim(set_name) <> '' and coalesce(franchise, '') <> set_name then ' from ' || set_name else '' end ||
  case when limited_edition is true then ' Limited Edition.' else '.' end
where pop_name is not null
  and display_description ~* '(pre-owned|actual item|marks or damage|product release dates|terms of services|soft protectors|vinyl bobblehead|approximately [0-9]|aproximadamente|vinilo|televisi[oó]n|figura de vinilo|figura viene|cadena abc|comprar|ponieważ|spécial|matière|fabricant|date de sortie|collectible stands approximately|measures approximately|standing approximately|funko pop! television)';

update public.pop_catalog
set display_description = 'Venom With Ooze Glow-in-the-Dark is a Marvel Funko Pop #1469 (Glow in the Dark).'
where upc = '8969884452';

update public.pop_catalog
set pop_name = 'Black Panther',
    character = 'Black Panther',
    franchise = 'Marvel',
    set_name = 'Captain America: Civil War',
    display_description = 'Black Panther is a Marvel Funko Pop #138 from Captain America: Civil War.'
where upc = '849803077198';

update public.pop_catalog
set display_description = 'Stan Lee (Security Guard) is a Marvel Funko Pop.'
where upc = '889698406055';

update public.pop_catalog
set pop_name = 'Unknown Pop',
    character = null,
    display_description = 'This catalog row needs review because the source title did not include the character name.',
    needs_review = true
where upc = '849803053086'
  and pop_name = 'Bobblehead';
