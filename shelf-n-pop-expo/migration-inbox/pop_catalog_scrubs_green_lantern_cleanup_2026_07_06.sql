-- Audit note: Scrubs and Green Lantern-adjacent catalog cleanup applied directly to production on 2026-07-06.

with updates(upc, pop_name, character, franchise, set_name, pop_type, pop_style, number, variant, exclusivity, description) as (
  values
    (
      '889698355988',
      'J.D.',
      'J.D.',
      'Scrubs',
      'Scrubs',
      'Pop! Television',
      'Standard',
      '737',
      null,
      null,
      'From Scrubs, J.D. is a Pop! Television release #737.'
    ),
    (
      '889698889049',
      'Silver as the Green Lantern',
      'Silver as the Green Lantern',
      'Sonic the Hedgehog',
      'Justice League x Sonic the Hedgehog',
      'Pop! Heroes',
      'Standard',
      '592',
      null,
      'Target',
      'Silver as the Green Lantern is a Justice League x Sonic the Hedgehog Pop! Heroes release #592, Target exclusive.'
    ),
    (
      '889698416993',
      'Howard as Batman',
      'Howard Wolowitz',
      'The Big Bang Theory',
      'The Big Bang Theory',
      'Pop! Television',
      'Standard',
      '834',
      'Batman',
      'San Diego Comic-Con',
      'Howard as Batman is a The Big Bang Theory Pop! Television release #834, San Diego Comic-Con exclusive.'
    ),
    (
      '889698417037',
      'Sheldon Cooper as The Flash',
      'Sheldon Cooper',
      'The Big Bang Theory',
      'The Big Bang Theory',
      'Pop! Television',
      'Standard',
      '833',
      'The Flash',
      'San Diego Comic-Con',
      'Sheldon Cooper as The Flash is a The Big Bang Theory Pop! Television release #833, San Diego Comic-Con exclusive.'
    ),
    (
      '889698417082',
      'Leonard as Green Lantern',
      'Leonard Hofstadter',
      'The Big Bang Theory',
      'The Big Bang Theory',
      'Pop! Television',
      'Standard',
      '836',
      'Green Lantern',
      'San Diego Comic-Con',
      'Leonard as Green Lantern is a The Big Bang Theory Pop! Television release #836, San Diego Comic-Con exclusive.'
    )
)
update public.pop_catalog pc
set
  pop_name = u.pop_name,
  character = u.character,
  franchise = u.franchise,
  set_name = u.set_name,
  pop_type = u.pop_type,
  pop_style = u.pop_style,
  number = u.number,
  variant = u.variant,
  exclusivity = u.exclusivity,
  description = u.description,
  display_description = u.description
from updates u
where pc.upc = u.upc;
