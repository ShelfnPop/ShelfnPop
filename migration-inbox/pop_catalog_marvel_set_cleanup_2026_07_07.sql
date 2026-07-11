-- Marvel set cleanup for Avengers and Thor catalog rows.
-- Values are intentionally not changed here.

with repairs(upc, pop_name, character, franchise, set_name, pop_type, pop_style, number, variant, exclusivity, description) as (
  values
    ('849803047771','Iron Man Mark 43','Iron Man','Marvel','Avengers: Age of Ultron','Pop! Marvel','Standard','66',null,null,'Iron Man Mark 43 is a Marvel Pop! Marvel release #66 from Avengers: Age of Ultron.'),
    ('849803055790','Savage Hulk','Hulk','Marvel','Avengers: Age of Ultron','Pop! Marvel','Standard','68',null,'Exclusive','Savage Hulk is a Marvel Pop! Marvel release #68 from Avengers: Age of Ultron, exclusive.'),
    ('849803047801','Thor','Thor','Marvel','Avengers: Age of Ultron','Pop! Marvel','Standard','69',null,null,'Thor is a Marvel Pop! Marvel release #69 from Avengers: Age of Ultron.'),
    ('889698366755','Captain Marvel','Captain Marvel','Marvel','Avengers: Endgame','Pop! Marvel','Standard','459',null,null,'Captain Marvel is a Marvel Pop! Marvel release #459 from Avengers: Endgame.'),
    ('889698385909','Valkyrie','Valkyrie','Marvel','Avengers: Endgame','Pop! Marvel','Standard','483',null,null,'Valkyrie is a Marvel Pop! Marvel release #483 from Avengers: Endgame.'),
    ('889698413503','Hulk','Hulk','Marvel','Avengers: Endgame','Pop! Marvel','Standard','499','Chrome','Walmart','Hulk is a Marvel Pop! Marvel release #499 from Avengers: Endgame, Chrome Walmart exclusive.'),
    ('889698451437','Captain Marvel with New Hair','Captain Marvel','Marvel','Avengers: Endgame','Pop! Marvel','Standard','576',null,null,'Captain Marvel with New Hair is a Marvel Pop! Marvel release #576 from Avengers: Endgame.'),
    ('889698470964','Iron Man (I Am Iron Man)','Iron Man','Marvel','Avengers: Endgame','Pop! Marvel','Standard','580','Glow in the Dark','PX Previews','Iron Man (I Am Iron Man) is a Marvel Pop! Marvel release #580 from Avengers: Endgame, Glow in the Dark PX Previews exclusive.'),
    ('889698269049','Teen Groot with Gun','Groot','Marvel','Avengers: Infinity War','Pop! Marvel','Standard','293',null,null,'Teen Groot with Gun is a Marvel Pop! Marvel release #293 from Avengers: Infinity War.'),
    ('889698641593','Mighty Thor','Mighty Thor','Marvel','Thor: Love and Thunder','Pop! Marvel','Standard','1041','Glow in the Dark','Collector Corps','Mighty Thor is a Marvel Pop! Marvel release #1041 from Thor: Love and Thunder, Glow in the Dark Collector Corps exclusive.'),
    ('889698631761','Thor & Mighty Thor','Thor & Mighty Thor','Marvel','Thor: Love and Thunder','Pop! Marvel','2-Pack',null,null,'Target','Thor & Mighty Thor is a Marvel Pop! Marvel 2-Pack from Thor: Love and Thunder, Target exclusive.'),
    ('889698650861','Thor: Love and Thunder 4-Pack','Thor: Love and Thunder','Marvel','Thor: Love and Thunder','Pop! Marvel','4-Pack',null,null,'Walmart','Thor: Love and Thunder 4-Pack is a Marvel Pop! Marvel 4-Pack from Thor: Love and Thunder, Walmart exclusive.'),
    ('889698137706','Valkyrie (Scavenger Suit)','Valkyrie','Marvel','Thor: Ragnarok','Pop! Marvel','Standard','244',null,null,'Valkyrie (Scavenger Suit) is a Marvel Pop! Marvel release #244 from Thor: Ragnarok.'),
    ('889698307628','Valkyrie','Valkyrie','Marvel','Thor: Ragnarok','Pop! Marvel','Standard','336',null,'Summer Convention','Valkyrie is a Marvel Pop! Marvel release #336 from Thor: Ragnarok, Summer Convention exclusive.'),
    ('830395032276','Thor','Thor','Marvel','Thor: The Dark World','Pop! Marvel','Standard','35',null,'Gemini Collectibles','Thor is a Marvel Pop! Marvel release #35 from Thor: The Dark World, Gemini Collectibles exclusive.')
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
    description = r.description,
    display_description = r.description,
    parse_confidence = greatest(coalesce(c.parse_confidence, 0), 0.95),
    needs_review = false
from repairs r
where c.upc = r.upc;
