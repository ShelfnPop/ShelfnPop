-- Catalog identity cleanup for Harry Potter, Five Nights at Freddy's, and Avengers: Endgame.
-- Values are intentionally not changed here.

with repairs(upc, pop_name, character, franchise, set_name, pop_type, pop_style, number, variant, exclusivity, description, confidence) as (
  values
    ('889698413527','Hulk (Yellow Chrome)','Hulk','Marvel','Avengers: Endgame','Pop! Marvel','Standard','499','Yellow Chrome','Walmart','Hulk (Yellow Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame, Walmart exclusive.',0.98::numeric),
    ('889698413558','Hulk (Orange Chrome)','Hulk','Marvel','Avengers: Endgame','Pop! Marvel','Standard','499','Orange Chrome','Walmart','Hulk (Orange Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame, Walmart exclusive.',0.95::numeric),
    ('889698413565','Hulk (Red Chrome)','Hulk','Marvel','Avengers: Endgame','Pop! Marvel','Standard','499','Red Chrome',null,'Hulk (Red Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame.',0.95::numeric),
    ('889698413589','Hulk with Gauntlet (Purple Chrome)','Hulk','Marvel','Avengers: Endgame','Pop! Marvel','Standard','499','Purple Chrome',null,'Hulk with Gauntlet (Purple Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame.',0.95::numeric),
    ('889698413534','Hulk (Blue Chrome)','Hulk','Marvel','Avengers: Endgame','Pop! Marvel','Standard','499','Blue Chrome','Walmart','Hulk (Blue Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame, Walmart exclusive.',0.95::numeric),
    ('889698556422','Wanda Maximoff','Wanda Maximoff','Marvel','Avengers: Endgame','Pop! Marvel','Standard','855','Glow in the Dark','Pop In A Box','Wanda Maximoff is a Marvel Pop! Marvel release #855 from Avengers: Endgame, Glow in the Dark Pop In A Box exclusive.',0.98::numeric),
    ('889698543279','Morgan Stark & Tony Stark','Morgan Stark & Tony Stark','Marvel','Avengers: Endgame','Pop! Marvel','2-Pack',null,'Glow in the Dark','Pop In A Box','Morgan Stark & Tony Stark is a Marvel Pop! Marvel 2-Pack from Avengers: Endgame, Glow in the Dark Pop In A Box exclusive.',0.95::numeric),
    ('849803058913','Albus Dumbledore with Wand','Albus Dumbledore','Wizarding World','Harry Potter','Pop! Movies','Standard','15',null,null,'Albus Dumbledore with Wand is a Harry Potter Pop! Movies release #15.',0.98::numeric),
    ('889698800181','Harry Potter (Gingerbread)','Harry Potter','Wizarding World','Harry Potter','Pop! Movies','Standard','175','Gingerbread',null,'Harry Potter (Gingerbread) is a Harry Potter Pop! Movies release #175.',0.98::numeric),
    ('889698800204','Ron Weasley (Gingerbread)','Ron Weasley','Wizarding World','Harry Potter','Pop! Movies','Standard','177','Gingerbread',null,'Ron Weasley (Gingerbread) is a Harry Potter Pop! Movies release #177.',0.98::numeric),
    ('889698864343','Harry Potter with Hourglass','Harry Potter','Wizarding World','Harry Potter','Pop! Movies','Standard','180',null,null,'Harry Potter with Hourglass is a Harry Potter Pop! Movies release #180.',0.98::numeric),
    ('889698864367','Luna Lovegood (Party Dress)','Luna Lovegood','Wizarding World','Harry Potter','Pop! Movies','Standard','182',null,null,'Luna Lovegood (Party Dress) is a Harry Potter Pop! Movies release #182.',0.98::numeric),
    ('889698864374','Puking Pastille Girl','Puking Pastille Girl','Wizarding World','Harry Potter','Pop! Movies','Standard','185',null,null,'Puking Pastille Girl is a Harry Potter Pop! Movies release #185.',0.98::numeric),
    ('889698864381','Horace Slughorn','Horace Slughorn','Wizarding World','Harry Potter','Pop! Movies','Standard','186',null,'Exclusive','Horace Slughorn is a Harry Potter Pop! Movies release #186, exclusive.',0.92::numeric),
    ('889698902670','Aberforth Dumbledore','Aberforth Dumbledore','Wizarding World','Harry Potter','Pop! Movies','Standard','190',null,null,'Aberforth Dumbledore is a Harry Potter Pop! Movies release #190.',0.98::numeric),
    ('889698902700','Helena Ravenclaw','Helena Ravenclaw','Wizarding World','Harry Potter','Pop! Movies','Standard','192','Glow in the Dark',null,'Helena Ravenclaw is a Harry Potter Pop! Movies release #192, Glow in the Dark.',0.98::numeric),
    ('889698871167','Freddy Fazbear (10th Anniversary)','Freddy Fazbear','Five Nights at Freddy''s','Five Nights at Freddy''s','Pop! Games','Standard','1060','10th Anniversary',null,'Freddy Fazbear (10th Anniversary) is a Five Nights at Freddy''s Pop! Games release #1060.',0.98::numeric)
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
set set_name = 'Five Nights at Freddy''s',
    franchise = 'Five Nights at Freddy''s',
    pop_type = 'Pop! Games',
    parse_confidence = greatest(coalesce(parse_confidence, 0), 0.9),
    needs_review = false
where set_name in ('Five Nights At Freddy''s', 'Five Nights At Freddy’s')
   or franchise in ('Five Nights At Freddy''s', 'Five Nights At Freddy’s');
