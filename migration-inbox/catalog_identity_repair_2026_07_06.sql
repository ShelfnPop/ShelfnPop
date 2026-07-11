-- Catalog identity repair after PriceCharting value refresh metadata regressions.
-- Values are intentionally not changed here.

with repairs(upc, pop_name, character, franchise, set_name, pop_type, pop_style, number, variant, exclusivity, vault_status, description) as (
  values
    ('889698567916','Ned Stark on Throne','Ned Stark','Game of Thrones','Game of Thrones','Pop! Television','Deluxe','2','Convention','San Diego Comic-Con',null,'Ned Stark on Throne is a Game of Thrones Pop! Television Deluxe release #2, San Diego Comic-Con exclusive.'),
    ('889698652605','Jeremy Jamm','Jeremy Jamm','Parks and Recreation','Parks and Recreation','Pop! Television','Standard','1259',null,'Summer Convention',null,'Jeremy Jamm is a Parks and Recreation Pop! Television release #1259, Summer Convention exclusive.'),
    ('889698421355','Sticky Note Man','Sticky Note Man','Office Space','Office Space','Pop! Movies','Standard','774',null,'Special Edition',null,'Sticky Note Man is an Office Space Pop! Movies release #774.'),
    ('889698708678','Barry Allen','Barry Allen','DC','The Flash','Pop! Heroes','Standard','1413',null,null,null,'Barry Allen is a DC Pop! Heroes release #1413 from The Flash.'),
    ('889698485739','Comic Book Guy','Comic Book Guy','The Simpsons','The Simpsons','Pop! Animation','Standard','832',null,null,null,'Comic Book Guy is a The Simpsons Pop! Animation release #832.'),
    ('889698209298','Eleven with Electrodes','Eleven with Electrodes','Stranger Things','Stranger Things','Pop! Television','Standard','523',null,'GameStop',null,'Eleven with Electrodes is a Stranger Things Pop! Television release #523, GameStop exclusive.'),
    ('889698397261','Evil Groundskeeper Willie','Evil Groundskeeper Willie','The Simpsons','The Simpsons: Treehouse of Horror','Pop! Animation','Standard','824',null,null,null,'Evil Groundskeeper Willie is a The Simpsons: Treehouse of Horror Pop! Animation release #824.'),
    ('889698402071','Forrest Gump','Forrest Gump','Forrest Gump','Forrest Gump','Pop! Movies','Standard','771',null,null,null,'Forrest Gump is a Forrest Gump Pop! Movies release #771.'),
    ('889698586245','Geralt','Geralt','The Witcher','The Witcher','Pop! Television','Standard','1168',null,null,null,'Geralt is a The Witcher Pop! Television release #1168.'),
    ('849803094928','Hawkgirl','Hawkgirl','DC','DC''s Legends of Tomorrow','Pop! Heroes','Standard','377',null,'New York Comic Con',null,'Hawkgirl is a DC Pop! Heroes release #377 from DC''s Legends of Tomorrow, New York Comic Con exclusive.'),
    ('889698673488','Kayla','Kayla','Jurassic Park','Jurassic World Dominion','Pop! Movies','Standard','1268',null,'New York Comic Con',null,'Kayla is a Jurassic World Dominion Pop! Movies release #1268, New York Comic Con exclusive.'),
    ('889698670456','Kearney Zzyzwicz','Kearney Zzyzwicz','The Simpsons','The Simpsons','Pop! Animation','Standard','1282',null,'Fall Convention',null,'Kearney Zzyzwicz is a The Simpsons Pop! Animation release #1282, Fall Convention exclusive.'),
    ('889698586276','Mose Schrute','Mose Schrute','The Office','The Office','Pop! Television','Standard','1179','Common','New York Comic Con',null,'Mose Schrute is a The Office Pop! Television release #1179, New York Comic Con exclusive.'),
    ('889698503327','Zombie Mysterio','Mysterio','Marvel','Marvel Zombies','Pop! Marvel','Standard','660','Glow in the Dark','US Exclusive',null,'Zombie Mysterio is a Marvel Zombies Pop! Marvel release #660, Glow in the Dark.'),
    ('889698652469','Silk','Silk','Marvel','Marvel Comics','Pop! Marvel','Standard','1064',null,'Summer Convention',null,'Silk is a Marvel Comics Pop! Marvel release #1064, Summer Convention exclusive.'),
    ('889698555166','T.D.K.','T.D.K.','DC','The Suicide Squad','Pop! Heroes','Standard','1122',null,null,null,'T.D.K. is a DC Pop! Heroes release #1122 from The Suicide Squad.'),
    ('889698343626','The Creators','The Creators','Game of Thrones','Game of Thrones','Pop! Television','3-Pack',null,'Common','New York Comic Con',null,'The Creators is a Game of Thrones Pop! Television 3-Pack, New York Comic Con exclusive.'),
    ('889698879446','Gambit','Gambit','Marvel','X-Men','Pop! Marvel','Standard','1505',null,'Summer Convention',null,'Gambit is an X-Men Pop! Marvel release #1505, Summer Convention exclusive.'),
    ('889698105248','Deadpool','Deadpool','Marvel','Deadpool','Pop! Marvel','Standard','112','White','Summer Convention',null,'Deadpool is a Marvel Pop! Marvel release #112 from Deadpool, White Summer Convention variant.'),
    ('889698102322','Von Miller','Von Miller','NFL','Denver Broncos','Pop! Sports','Standard','60','Orange Jersey',null,null,'Von Miller is an NFL Pop! Sports release #60 for the Denver Broncos, Orange Jersey.'),
    ('889698538787','The Mandalorian Flying with Blaster','The Mandalorian','Star Wars','The Mandalorian','Pop! Star Wars','Standard','408','Glow in the Dark','Funko Shop','Vaulted','The Mandalorian Flying with Blaster is a Star Wars Pop! Star Wars release #408 from The Mandalorian, Glow in the Dark.'),
    ('889698688956','Iron Spider with Gauntlet','Iron Spider','Marvel','Avengers: Endgame','Pop! Marvel','Standard','1141','Glow in the Dark','Chalice Collectibles',null,'Iron Spider with Gauntlet is an Avengers: Endgame Pop! Marvel release #1141, Glow in the Dark.'),
    ('849803053406','Rocket & Potted Groot','Rocket & Potted Groot','Marvel','Guardians of the Galaxy','Pop! Marvel','Standard','93',null,'2015 Summer Convention',null,'Rocket & Potted Groot is a Guardians of the Galaxy Pop! Marvel release #93, 2015 Summer Convention exclusive.')
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
    vault_status = coalesce(r.vault_status, c.vault_status),
    description = r.description,
    display_description = r.description,
    parse_confidence = greatest(coalesce(c.parse_confidence, 0), 0.98),
    needs_review = false
from repairs r
where c.upc = r.upc;
