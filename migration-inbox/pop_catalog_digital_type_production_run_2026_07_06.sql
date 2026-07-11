-- Backfill Digital Pop / NFT catalog identity and production-run metadata.

with repairs(upc, pop_name, character, franchise, set_name, pop_type, pop_style, number, variant, exclusivity, limited_edition, limited_count, edition_notes, description) as (
  values
    ('889698674461','The Flash (Rebirth)','The Flash','DC','DC Comics: The Flash','Pop! Digital','Standard','42','Legendary',null,true,null,'Digital production run','The Flash (Rebirth) is a DC Pop! Digital release #42 from DC Comics: The Flash.'),
    ('889698858540','Two-Face','Two-Face','DC','Batman 85th Series 2','Pop! Digital','Standard','371','Ultra','Droppp',true,5000,'Production run of 5000','Two-Face is a DC Pop! Digital release #371 from Batman 85th Series 2, Ultra rarity with a production run of 5000.')
)
update public.pop_catalog c
set pop_name = r.pop_name,
    character = r.character,
    franchise = r.franchise,
    set_name = r.set_name,
    pop_type = r.pop_type,
    pop_style = r.pop_style,
    number = r.number,
    variant = r.variant,
    exclusivity = r.exclusivity,
    limited_edition = r.limited_edition,
    limited_count = r.limited_count,
    edition_notes = r.edition_notes,
    description = r.description,
    display_description = r.description,
    parse_confidence = greatest(coalesce(c.parse_confidence, 0), 0.98),
    needs_review = false
from repairs r
where c.upc = r.upc;
