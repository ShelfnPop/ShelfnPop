begin;

update public.pop_catalog
set raw_title = 'Wade Wilson (Weapon XI) [SDCC / Summer Convention] #489',
    clean_title = 'Wade Wilson (Weapon XI) [SDCC / Summer Convention] #489',
    pop_name = 'Wade Wilson (Weapon XI)',
    character = 'Deadpool',
    franchise = 'Marvel',
    set_name = 'X-Men Origins: Wolverine',
    number = '489',
    variant = 'SDCC / Summer Convention',
    exclusivity = 'SDCC / Summer Convention',
    limited_edition = true,
    limited_count = null,
    edition_notes = 'San Diego Comic-Con (SDCC) Exclusive / Summer Convention Exclusive',
    description = 'Wade Wilson (Weapon XI) is a Marvel Funko Pop #489 from X-Men Origins: Wolverine.',
    display_description = 'Wade Wilson (Weapon XI) is a Marvel Funko Pop #489 from X-Men Origins: Wolverine.',
    parse_confidence = 0.98,
    needs_review = false
where upc = '889698489089';

update public.pop_catalog
set raw_title = 'Blackest Night Superman (Gold) [GameStop Exclusive] #83',
    clean_title = 'Blackest Night Superman (Gold) [GameStop Exclusive] #83',
    pop_name = 'Blackest Night Superman',
    character = 'Superman',
    franchise = 'DC',
    set_name = 'Green Lantern',
    number = '83',
    variant = 'Gold',
    exclusivity = 'GameStop',
    limited_edition = false,
    limited_count = null,
    edition_notes = 'GameStop Exclusive',
    description = 'Blackest Night Superman is a DC Funko Pop #83 from the Green Lantern line (Gold, GameStop Exclusive).',
    display_description = 'Blackest Night Superman is a DC Funko Pop #83 from the Green Lantern line (Gold, GameStop Exclusive).',
    parse_confidence = 0.98,
    needs_review = false
where upc = '849803074739';

update public.pop_catalog
set raw_title = 'The Bride #68',
    clean_title = 'The Bride #68',
    pop_name = 'The Bride',
    character = 'The Bride',
    franchise = 'Kill Bill',
    set_name = 'Kill Bill',
    number = '68',
    variant = 'Common',
    exclusivity = null,
    limited_edition = false,
    limited_count = null,
    edition_notes = null,
    description = 'The Bride is a Kill Bill Funko Pop #68.',
    display_description = 'The Bride is a Kill Bill Funko Pop #68.',
    parse_confidence = 0.98,
    needs_review = false
where upc = '889698810302';

update public.pop_catalog
set raw_title = 'Weasel #106',
    clean_title = 'Weasel #106',
    pop_name = 'Weasel',
    character = 'Weasel',
    franchise = 'Disney',
    set_name = 'Who Framed Roger Rabbit?',
    number = '106',
    variant = 'Common',
    exclusivity = null,
    limited_edition = false,
    limited_count = null,
    edition_notes = null,
    description = 'Weasel is a Disney Funko Pop #106 from Who Framed Roger Rabbit?.',
    display_description = 'Weasel is a Disney Funko Pop #106 from Who Framed Roger Rabbit?.',
    parse_confidence = 0.98,
    needs_review = false
where upc = '889698810340';

update public.pop_catalog
set raw_title = 'Bistan #155 Toy Sapiens',
    clean_title = 'Bistan #155 Toy Sapiens',
    pop_name = 'Bistan',
    character = 'Bistan',
    franchise = 'Star Wars',
    set_name = 'Star Wars Rogue One',
    number = '155',
    variant = 'Toy Sapiens',
    exclusivity = 'Toy Sapiens',
    limited_edition = false,
    limited_count = null,
    edition_notes = 'Toy Sapiens',
    description = 'Bistan is a Star Wars Funko Pop #155 from Star Wars Rogue One (Toy Sapiens).',
    display_description = 'Bistan is a Star Wars Funko Pop #155 from Star Wars Rogue One (Toy Sapiens).',
    parse_confidence = 0.98,
    needs_review = false
where upc = '889698104586';

update public.pop_catalog
set raw_title = 'Wade Wilson (Baby Legs) #3',
    clean_title = 'Wade Wilson (Baby Legs) #3',
    pop_name = 'Wade Wilson (Baby Legs)',
    character = 'Deadpool',
    franchise = 'Marvel',
    set_name = 'Deadpool',
    number = '3',
    variant = 'Common',
    exclusivity = null,
    limited_edition = false,
    limited_count = null,
    edition_notes = null,
    description = 'Wade Wilson (Baby Legs) is a Marvel Funko Pop #3 from Deadpool.',
    display_description = 'Wade Wilson (Baby Legs) is a Marvel Funko Pop #3 from Deadpool.',
    parse_confidence = 0.98,
    needs_review = false
where upc = '889698808538';

commit;
