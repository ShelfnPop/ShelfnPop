-- Catalog identity cleanup for Superman, Guardians of the Galaxy, and Jurassic World sets.
-- Values are intentionally not changed here.

with repairs(upc, pop_name, character, franchise, set_name, pop_type, pop_style, number, variant, exclusivity, description, confidence) as (
  values
    ('889698862288','Golden Age Superman','Superman','DC','Superman: Shield Through the Ages','Pop! Heroes','Standard','609',null,null,'Golden Age Superman is a DC Pop! Heroes release #609 from Superman: Shield Through the Ages.',0.98::numeric),
    ('889698862295','Superman ''50','Superman','DC','Superman: Shield Through the Ages','Pop! Heroes','Standard','610','Black & White',null,'Superman ''50 is a DC Pop! Heroes release #610 from Superman: Shield Through the Ages.',0.98::numeric),
    ('889698862301','Superman Fall of Sinestro','Superman','DC','Superman: Shield Through the Ages','Pop! Heroes','Standard','611',null,null,'Superman Fall of Sinestro is a DC Pop! Heroes release #611 from Superman: Shield Through the Ages.',0.98::numeric),
    ('889698889551','Superman Blackest Night','Superman','DC','Superman: Shield Through the Ages','Pop! Heroes','Standard','612',null,null,'Superman Blackest Night is a DC Pop! Heroes release #612 from Superman: Shield Through the Ages.',0.98::numeric),
    ('889698888165','Superman (Breaking Chains)','Superman','DC','Superman: Shield Through the Ages','Pop! Heroes','Standard','615','Glow in the Dark','Target','Superman (Breaking Chains) is a DC Pop! Heroes release #615 from Superman: Shield Through the Ages, Glow in the Dark Target exclusive.',0.98::numeric),
    ('889698552905','Atrociraptor (Panthera)','Atrociraptor (Panthera)','Jurassic Park','Jurassic World: Dominion','Pop! Movies','Standard','1216',null,'Target','Atrociraptor (Panthera) is a Jurassic World: Dominion Pop! Movies release #1216, Target exclusive.',0.95::numeric),
    ('889698552912','Atrociraptor (Red)','Atrociraptor (Red)','Jurassic Park','Jurassic World: Dominion','Pop! Movies','Standard','1217',null,'Books-A-Million','Atrociraptor (Red) is a Jurassic World: Dominion Pop! Movies release #1217, Books-A-Million exclusive.',0.98::numeric),
    ('889698622257','Ellie Sattler','Ellie Sattler','Jurassic Park','Jurassic World: Dominion','Pop! Movies','Standard','1214',null,null,'Ellie Sattler is a Jurassic World: Dominion Pop! Movies release #1214.',0.98::numeric),
    ('889698622233','Velociraptors (Blue & Beta)','Velociraptors (Blue & Beta)','Jurassic Park','Jurassic World: Dominion','Pop! Movies','Pop! & Buddy','1212',null,null,'Velociraptors (Blue & Beta) is a Jurassic World: Dominion Pop! Movies release #1212.',0.98::numeric),
    ('889698632270','Therizinosaurus, Giganotosaurus & T. Rex','Therizinosaurus, Giganotosaurus & T. Rex','Jurassic Park','Jurassic World: Dominion','Pop! Movies','3-Pack',null,null,'Exclusive','Therizinosaurus, Giganotosaurus & T. Rex is a Jurassic World: Dominion Pop! Movies 3-Pack exclusive.',0.92::numeric),
    ('889698866583','Aquilops','Aquilops','Jurassic Park','Jurassic World: Rebirth','Pop! Movies','Standard','1802',null,null,'Aquilops is a Jurassic World: Rebirth Pop! Movies release #1802.',0.95::numeric),
    ('849803057398','Thanos','Thanos','Marvel','Guardians of the Galaxy','Pop! Marvel','Jumbo','78','Glow in the Dark','Entertainment Earth','Thanos is a Guardians of the Galaxy Pop! Marvel 6-inch release #78, Glow in the Dark Entertainment Earth exclusive.',0.98::numeric),
    ('889698344616','Rocket Raccoon (Classic)','Rocket Raccoon','Marvel','Guardians of the Galaxy','Pop! Marvel','Standard','396','Classic','PX Previews','Rocket Raccoon (Classic) is a Guardians of the Galaxy Pop! Marvel release #396, PX Previews exclusive.',0.95::numeric),
    ('889698736411','Star-Lord with Power Stone','Star-Lord','Marvel','Guardians of the Galaxy','Pop! Marvel','Standard','611','Glow in the Dark','Exclusive','Star-Lord with Power Stone is a Guardians of the Galaxy Pop! Marvel release #611, Glow in the Dark exclusive.',0.85::numeric),
    ('889698669030','Star-Lord with Groot','Star-Lord','Marvel','The Guardians of the Galaxy Holiday Special','Pop! Marvel','Standard','1125','Holiday','Funko','Star-Lord with Groot is a Marvel Pop! Marvel release #1125 from The Guardians of the Galaxy Holiday Special, Funko exclusive.',0.98::numeric),
    ('889698649261','Groot','Groot','Marvel','Guardians of the Galaxy','Pop! Marvel','Comic Cover','12',null,'Target','Groot is a Guardians of the Galaxy Pop! Marvel Comic Cover release #12, Target exclusive.',0.98::numeric)
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
    parse_confidence = greatest(coalesce(c.parse_confidence, 0), r.confidence),
    needs_review = false
from repairs r
where c.upc = r.upc;

update public.pop_catalog
set set_name = 'Jurassic World: Dominion',
    parse_confidence = greatest(coalesce(parse_confidence, 0), 0.9),
    needs_review = false
where set_name = 'Jurassic World Dominion';
