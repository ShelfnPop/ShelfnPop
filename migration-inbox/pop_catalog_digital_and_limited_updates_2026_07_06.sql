-- Backfill Digital Pop and limited-production metadata.
-- Values and images are intentionally not changed.

with repairs(upc, pop_name, character, franchise, set_name, pop_type, pop_style, number, variant, exclusivity, limited_edition, limited_count, edition_notes, description) as (
  values
    ('889698674447','The Eradicator','The Eradicator','DC','DC Comics: Superman','Pop! Digital','Standard','40','Legendary','Droppp',true,2050,'Production run of 2050','The Eradicator is a DC Pop! Digital release #40 from DC Comics: Superman, Legendary rarity with a production run of 2050.'),
    ('889698855532','Flintheart Glomgold','Flintheart Glomgold','Disney','DuckTales','Pop! Digital','Standard','313','Ultra','Droppp',true,5000,'Production run of 5000','Flintheart Glomgold is a Disney Pop! Digital release #313 from DuckTales, Ultra rarity with a production run of 5000.'),
    ('889698907811','Hawkgirl','Hawkgirl','DC','Superman','Pop! Heroes','Standard','579','Ultra','Funko Shop',true,5000,'Limited Edition - Ultra, 5000 pieces','Hawkgirl is a DC Pop! Heroes release #579 from Superman, Limited Edition - Ultra with a 5000-piece run.')
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
