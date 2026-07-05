import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ParseWarning =
  | "missing_title"
  | "missing_franchise"
  | "missing_character"
  | "missing_number"
  | "weak_name_cleanup"
  | "reseller_brand_detected"
  | "estimated_value_missing";

type ParsedFunko = {
  raw_title: string | null;
  clean_title: string | null;
  pop_name: string | null;
  character: string | null;
  franchise: string | null;
  number: string | null;
  variant: string | null;
  exclusivity: string | null;
  pop_type: string | null;
  pop_style: string | null;
  set_name: string | null;
  vault_status: string | null;
  limited_edition: boolean;
  limited_count: number | null;
  edition_notes: string | null;
  description: string | null;
  display_description: string | null;
  estimated_value: number | null;
  parse_confidence: number;
  needs_review: boolean;
  warnings: ParseWarning[];
};

const CATALOG_OVERRIDES_BY_UPC: Record<string, Partial<ParsedFunko>> = {
  "889698489089": {
    raw_title: "Wade Wilson (Weapon XI) [SDCC / Summer Convention] #489",
    clean_title: "Wade Wilson (Weapon XI) [SDCC / Summer Convention] #489",
    pop_name: "Wade Wilson (Weapon XI)",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "X-Men Origins: Wolverine",
    number: "489",
    variant: "SDCC / Summer Convention",
    exclusivity: "SDCC / Summer Convention",
    limited_edition: true,
    edition_notes: "San Diego Comic-Con (SDCC) Exclusive / Summer Convention Exclusive",
    description: "Wade Wilson (Weapon XI) is a Marvel Funko Pop #489 from X-Men Origins: Wolverine.",
    display_description: "Wade Wilson (Weapon XI) is a Marvel Funko Pop #489 from X-Men Origins: Wolverine.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803074739": {
    raw_title: "Blackest Night Superman (Gold) [GameStop Exclusive] #83",
    clean_title: "Blackest Night Superman (Gold) [GameStop Exclusive] #83",
    pop_name: "Blackest Night Superman",
    character: "Superman",
    franchise: "DC",
    set_name: "Green Lantern",
    number: "83",
    variant: "Gold",
    exclusivity: "GameStop",
    limited_edition: false,
    limited_count: null,
    edition_notes: "GameStop Exclusive",
    description: "Blackest Night Superman is a DC Funko Pop #83 from the Green Lantern line (Gold, GameStop Exclusive).",
    display_description: "Blackest Night Superman is a DC Funko Pop #83 from the Green Lantern line (Gold, GameStop Exclusive).",
    estimated_value: null,
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698810302": {
    raw_title: "The Bride #68",
    clean_title: "The Bride #68",
    pop_name: "The Bride",
    character: "The Bride",
    franchise: "Kill Bill",
    set_name: "Kill Bill",
    number: "68",
    variant: "Common",
    exclusivity: null,
    limited_edition: false,
    limited_count: null,
    edition_notes: null,
    description: "The Bride is a Kill Bill Funko Pop #68.",
    display_description: "The Bride is a Kill Bill Funko Pop #68.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698810340": {
    raw_title: "Weasel #106",
    clean_title: "Weasel #106",
    pop_name: "Weasel",
    character: "Weasel",
    franchise: "Disney",
    set_name: "Who Framed Roger Rabbit?",
    number: "106",
    variant: "Common",
    exclusivity: null,
    limited_edition: false,
    limited_count: null,
    edition_notes: null,
    description: "Weasel is a Disney Funko Pop #106 from Who Framed Roger Rabbit?.",
    display_description: "Weasel is a Disney Funko Pop #106 from Who Framed Roger Rabbit?.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698104586": {
    raw_title: "Bistan #155 Toy Sapiens",
    clean_title: "Bistan #155 Toy Sapiens",
    pop_name: "Bistan",
    character: "Bistan",
    franchise: "Star Wars",
    set_name: "Star Wars Rogue One",
    number: "155",
    variant: "Toy Sapiens",
    exclusivity: "Toy Sapiens",
    limited_edition: false,
    limited_count: null,
    edition_notes: "Toy Sapiens",
    description: "Bistan is a Star Wars Funko Pop #155 from Star Wars Rogue One (Toy Sapiens).",
    display_description: "Bistan is a Star Wars Funko Pop #155 from Star Wars Rogue One (Toy Sapiens).",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698808538": {
    raw_title: "Wade Wilson (Baby Legs) #3",
    clean_title: "Wade Wilson (Baby Legs) #3",
    pop_name: "Wade Wilson (Baby Legs)",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool",
    number: "3",
    variant: "Common",
    exclusivity: null,
    limited_edition: false,
    limited_count: null,
    edition_notes: null,
    description: "Wade Wilson (Baby Legs) is a Marvel Funko Pop #3 from Deadpool.",
    display_description: "Wade Wilson (Baby Legs) is a Marvel Funko Pop #3 from Deadpool.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
};

const IMAGE_BUCKET = "pop-images";

const BAD_BRANDS = [
  "IEWAREHOUSE",
  "Funko",
  "Generic",
  "Unknown",
  "Alliance Entertainment",
  "Toynk",
  "Funko Pop",
  "Funko LLC",
"Funko, LLC",
"Pop! Vinyl",
  "POP",
  "DreamBone",
  "Grappiq",
];

const VARIANT_ALIASES: Array<[string, string]> = [
  ["green chrome", "Green Chrome"],
  ["black out", "Black Out"],
  ["glow-in-the-dark", "Glow in the Dark"],
  ["glow in the dark", "Glow in the Dark"],
  ["gitd", "Glow in the Dark"],
  ["blacklight", "Blacklight"],
  ["black light", "Blacklight"],
  ["digital pop", "Digital"],
  ["pop digital", "Digital"],
  ["stained glass", "Stained Glass"],
  ["diamond", "Diamond"],
  ["metallic", "Metallic"],
  ["flocked", "Flocked"],
  ["chrome", "Chrome"],
  ["chase", "Chase"],
  ["bloody", "Bloody"],
  ["glow", "Glow in the Dark"],
  ["glitter", "Glitter"],
  ["translucent", "Translucent"],
  ["sepia", "Sepia"],
];

const POP_STYLE_ALIASES: Array<[string, string]> = [
  ["bitty pop", "Bitty Pop"],
  ["bitty", "Bitty Pop"],
  ["jumbo", "Jumbo"],
  ["super sized", "Jumbo"],
  ["supersized", "Jumbo"],
  ["10-inch", "Jumbo"],
  ["10 inch", "Jumbo"],
  ["10in", "Jumbo"],
  ["18-inch", "Jumbo"],
  ["18 inch", "Jumbo"],
  ["18in", "Jumbo"],
  ["45cm", "Jumbo"],
  ["45 cm", "Jumbo"],
  ["25cm", "Jumbo"],
  ["25 cm", "Jumbo"],
  ["oversized", "Jumbo"],

  ["2-pack", "2-Pack"],
  ["2 pack", "2-Pack"],
  ["2pk", "2-Pack"],
  ["two pack", "2-Pack"],

  ["3-pack", "3-Pack"],
  ["3 pack", "3-Pack"],
  ["3pk", "3-Pack"],
  ["three pack", "3-Pack"],

  ["4-pack", "4-Pack"],
  ["4 pack", "4-Pack"],
  ["4pk", "4-Pack"],
  ["four pack", "4-Pack"],

  ["5-pack", "5-Pack"],
  ["5 pack", "5-Pack"],
  ["5pk", "5-Pack"],
  ["five pack", "5-Pack"],

  ["album deluxe", "Album"],
  ["pop album", "Album"],
  ["album", "Album"],

  ["movie moment", "Movie Moment"],
  ["pop moments", "Moment"],
  ["pop moment", "Moment"],
  ["moments", "Moment"],
  ["moment", "Moment"],

  ["rides", "Ride"],
  ["ride", "Ride"],

  ["deluxe", "Deluxe"],
  ["town", "Town"],
  ["art series", "Art Series"],
  ["comic cover", "Comic Cover"],
  ["art cover", "Art Cover"],
  ["poster", "Poster"],
  ["keychain", "Keychain"],
  ["pocket pop", "Keychain"],
  ["pop & tee", "Pop & Tee"],
  ["pop and tee", "Pop & Tee"],
  ["6-inch", "Jumbo"],
  ["6 inch", "Jumbo"],
  ["6in", "Jumbo"],
];

const EXCLUSIVITY_ALIASES: Array<[string, string]> = [
  ["walmart", "Walmart"],
  ["target", "Target"],
  ["gamestop", "GameStop"],
  ["game stop", "GameStop"],
  ["hot topic", "Hot Topic"],
  ["boxlunch", "BoxLunch"],
  ["box lunch", "BoxLunch"],
  ["amazon", "Amazon"],
  ["walgreens", "Walgreens"],
  ["entertainment earth", "Entertainment Earth"],
  ["funko shop", "Funko Shop"],
  ["fye", "FYE"],
  ["barnes & noble", "Barnes & Noble"],
  ["barnes and noble", "Barnes & Noble"],
  ["px previews", "PX Previews"],
  ["px exclusive", "PX Previews"],
  ["us exclusive", "US Exclusive"],
  ["aaa exclusive", "AAA Exclusive"],
  ["aaa excl", "AAA Exclusive"],
  ["specialty series", "Specialty Series"],
  ["collectors corps", "Collectors Corps"],
  ["collector corps", "Collectors Corps"],
  ["marvel collector corps", "Collectors Corps"],
  ["mcc", "Collectors Corps"],

  ["san diego comic-con", "San Diego Comic-Con"],
  ["sdcc", "San Diego Comic-Con"],
  ["new york comic con", "New York Comic Con"],
  ["nycc", "New York Comic Con"],
  ["fall convention", "Fall Convention"],
  ["spring convention", "Spring Convention"],
  ["summer convention", "Summer Convention"],
  ["wondercon", "WonderCon"],
  ["wondrous convention", "Wondrous Convention"],

  ["2017 con", "2017 Convention"],
  ["2018 con", "2018 Convention"],
  ["2019 con", "2019 Convention"],
  ["2020 con", "2020 Convention"],
  ["2021 con", "2021 Convention"],
  ["2022 con", "2022 Convention"],
  ["2023 con", "2023 Convention"],
  ["2024 con", "2024 Convention"],
  ["2025 con", "2025 Convention"],
  ["exclusive", "Exclusive"],
];

const FRANCHISE_ALIASES: Array<[string, string]> = [
  ["fallout tv series", "Fallout"],
  ["fallout", "Fallout"],
  ["caesar", "Fallout"],

  ["zack snyder", "DC"],
  ["justice league x sonic", "DC"],
  ["jla & sonic", "DC"],
  ["dc & sonic", "DC"],
  ["justice league", "DC"],
  ["diana with arrow", "DC"],
  ["aquaman and the lost kingdom", "DC"],
  ["the suicide squad", "DC"],
  ["suicide squad", "DC"],
  ["black adam", "DC"],
  ["doom patrol", "DC"],
  ["smallville", "DC"],
  ["creature commandos", "DC"],
  ["doctor phosphorus", "DC"],
  ["doctor phosphorous", "DC"],
  ["gotham knights", "DC"],
  ["dc universe", "DC"],
  ["black lantern", "DC"],
  ["red hood", "DC"],
  ["deathstroke", "DC"],
  ["black canary", "DC"],
  ["starfire", "DC"],
  ["nightwing", "DC"],
  ["beast boy", "DC"],
  ["robotman", "DC"],
  ["negative man", "DC"],

  ["wayne's world", "Wayne's World"],
  ["wayne s world", "Wayne's World"],
  ["wayne & garth", "Wayne's World"],
  ["wayne and garth", "Wayne's World"],

  ["steve aoki", "Music"],

  ["she-hulk", "Marvel"],
  ["red she-hulk", "Marvel"],
  ["hulk", "Marvel"],
  ["hercules", "Marvel"],
  ["marvel", "Marvel"],
  ["loki", "Marvel"],
  ["captain america", "Marvel"],
  ["adam warlock", "Marvel"],
  ["black widow", "Marvel"],
  ["taskmaster", "Marvel"],
  ["venom", "Marvel"],
  ["ghost rider", "Marvel"],
  ["spider-man", "Marvel"],
  ["spiderman", "Marvel"],
  ["deadpool", "Marvel"],
  ["deadpool & wolverine", "Marvel"],
  ["deadpool 3", "Marvel"],
  ["venomized deadpool", "Marvel"],
  ["x-men", "Marvel"],
  ["wolverine", "Marvel"],
  ["moon knight", "Marvel"],
  ["daredevil", "Marvel"],
  ["doctor strange", "Marvel"],
  ["winter soldier", "Marvel"],

  ["star wars", "Star Wars"],
  ["across the galaxy force ghost", "Star Wars"],
  ["sw the mandalorian", "Star Wars"],
  ["the mandalorian", "Star Wars"],
  ["mandalorian", "Star Wars"],
  ["grogu", "Star Wars"],
  ["n-1 starfighter", "Star Wars"],
  ["n1 starfighter", "Star Wars"],
  ["obi-wan", "Star Wars"],
  ["obi wan", "Star Wars"],
  ["darth vader", "Star Wars"],

  ["batman", "DC"],
  ["arkham", "DC"],
  ["dc", "DC"],
  ["man of steel", "DC"],
  ["general zod", "DC"],
  ["zod", "DC"],
  ["superman", "DC"],
  ["krypto", "DC"],
  ["green lantern", "DC"],
  ["orange lantern", "DC"],
  ["shazam", "DC"],
  ["wonder woman", "DC"],
  ["harley quinn", "DC"],
  ["joker", "DC"],
  ["arrow", "DC"],
  ["titans", "DC"],

  ["buckbeak", "Wizarding World"],
  ["fantastic beasts", "Wizarding World"],
  ["crimes of grindelwald", "Wizarding World"],
  ["grindelwald", "Wizarding World"],
  ["chupacabra", "Wizarding World"],
  ["harry potter", "Wizarding World"],
  ["wizarding world", "Wizarding World"],
  ["zouwu", "Wizarding World"],

  ["the simpsons", "The Simpsons"],
  ["simpsons", "The Simpsons"],
  ["kearney", "The Simpsons"],
  ["zzyzwicz", "The Simpsons"],

  ["pokemon", "Pokémon"],
  ["pokémon", "Pokémon"],
  ["little mermaid", "Disney"],
  ["the little mermaid", "Disney"],
  ["oliver & company", "Disney"],
  ["oliver and company", "Disney"],
  ["who framed roger rabbit", "Disney"],
  ["roger rabbit", "Disney"],
  ["ariel", "Disney"],
  ["ursula", "Disney"],
  ["lilo & stitch", "Disney"],
  ["lilo and stitch", "Disney"],
  ["pinocchio", "Disney"],
  ["blue fairy", "Disney"],
  ["emperor's new groove", "Disney"],
  ["emperors new groove", "Disney"],
  ["kronk", "Disney"],
  ["disney villains", "Disney"],
  ["coco", "Disney"],
  ["nightmare before christmas", "Disney"],
  ["jack skellington", "Disney"],
  ["duck tales", "Disney"],
  ["ducktales", "Disney"],
  ["scrooge mcduck", "Disney"],
  ["darkwing duck", "Disney"],
  ["dewey", "Disney"],
  ["huey", "Disney"],
  ["louie", "Disney"],
  ["animaniacs", "Animaniacs"],
  ["pinky & the brain", "Animaniacs"],
  ["pinky and the brain", "Animaniacs"],
  ["the princess bride", "The Princess Bride"],
  ["inigo montoya", "The Princess Bride"],
  ["westley", "The Princess Bride"],
  ["g.i. joe", "G.I. Joe"],
  ["gi joe", "G.I. Joe"],
  ["cobra commander", "G.I. Joe"],
  ["snake eyes", "G.I. Joe"],
  ["storm shadow", "G.I. Joe"],
  ["zartan", "G.I. Joe"],
  ["baroness", "G.I. Joe"],
  ["serpentor", "G.I. Joe"],
  ["destro", "G.I. Joe"],
  ["lost jack", "Lost"],
  ["lost sawyer", "Lost"],
  ["tombstone", "Tombstone"],
  ["dumb & dumber", "Dumb and Dumber"],
  ["dumb and dumber", "Dumb and Dumber"],
  ["duck dodgers", "Looney Tunes"],
  ["looney tunes", "Looney Tunes"],
  ["jurassic world", "Jurassic Park"],
  ["jurassic park", "Jurassic Park"],
  ["cuphead", "Cuphead"],
  ["pennywise", "IT"],
  ["dragon ball", "Dragon Ball"],
  ["naruto", "Naruto"],
  ["one piece", "One Piece"],
  ["wwe", "WWE"],
  ["nba", "NBA"],
  ["nfl", "NFL"],
  ["mlb", "MLB"],
  ["fortnite", "Fortnite"],
  ["stranger things", "Stranger Things"],
  ["mean girls", "Mean Girls"],
  ["clueless", "Clueless"],
  ["legally blonde", "Legally Blonde"],
  ["edward scissorhands", "Edward Scissorhands"],
  ["supernatural", "Supernatural"],
  ["star trek", "Star Trek"],
  ["willow", "Willow"],
  ["pet sematary", "Pet Sematary"],
  ["saved by the bell", "Saved by the Bell"],
  ["beavis and butt-head", "Beavis and Butt-Head"],
  ["beavis and butthead", "Beavis and Butt-Head"],
  ["boyz ii men", "Boyz II Men"],
  ["new kids on the block", "New Kids on the Block"],
  ["dolly parton", "Dolly Parton"],
  ["elvis presley", "Elvis Presley"],
  ["pink", "Pink"],
  ["pnk", "Pink"],
  ["e.t.", "E.T."],
  ["et 40th anniversary", "E.T."],
  ["chilly willy", "Chilly Willy"],
  ["crash bandicoot", "Crash Bandicoot"],
  ["despicable me", "Despicable Me"],
  ["forrest gump", "Forrest Gump"],
  ["ash vs. evil dead", "Ash vs. Evil Dead"],
  ["annabelle", "Annabelle"],
  ["saturday night live", "Saturday Night Live"],
  ["dick in a box", "Saturday Night Live"],
  ["d ck in a box", "Saturday Night Live"],
  ["the witcher", "The Witcher"],
  ["ciri", "The Witcher"],
  ["poltergeist", "Poltergeist"],
  ["carol anne freeling", "Poltergeist"],
  ["exorcist believer", "The Exorcist"],
  ["the exorcist", "The Exorcist"],
  ["gregory house", "House"],
  ["house md", "House"],
  ["louis litt", "Suits"],
  ["suits", "Suits"],
  ["cher horowitz", "Clueless"],
  ["bob ross", "Bob Ross"],
  ["the joy of painting", "Bob Ross"],
  ["brandalised", "Brandalised"],
  ["banksy", "Brandalised"],
  ["1883", "Yellowstone"],
  ["an american tail", "An American Tail"],
  ["fievel", "An American Tail"],
  ["doc w/ helmet", "Back to the Future"],
["doc with helmet", "Back to the Future"],
["marty 1955", "Back to the Future"],
["marty in puffy vest", "Back to the Future"],
["marty checking watch", "Back to the Future"],
["marty mcfly", "Back to the Future"],
["marty with hoverboard", "Back to the Future"],
["emmet brown", "Back to the Future"],
["emmett brown", "Back to the Future"],
["lootcrate", "Back to the Future"],

["tallahassee", "Zombieland"],
["columbus", "Zombieland"],
["wichita", "Zombieland"],
["witchita", "Zombieland"],
["bill murray", "Zombieland"],

["preacher", "Preacher"],
["arseface", "Preacher"],
["cassidy", "Preacher"],
["jesse custer", "Preacher"],

["futurama", "Futurama"],
["robot devil", "Futurama"],

  ["toy story", "Toy Story"],
["toy story 4", "Toy Story"],
["toy story 5", "Toy Story"],
  ["woody", "Toy Story"],
  ["buzz lightyear", "Toy Story"],
["bullseye", "Toy Story"],
["combat carl", "Toy Story"],
["mrs. nesbit", "Toy Story"],
["mrs nesbit", "Toy Story"],
["slinky dog", "Toy Story"],
["mr pricklepants", "Toy Story"],

["monsters inc", "Disney"],
["monsters, inc", "Disney"],
["sulley", "Disney"],
["finding dory", "Disney"],
["dory", "Disney"],
["jungle book", "Disney"],
["bagheera", "Disney"],
["incredibles", "Disney"],
["violet", "Disney"],

["masters of the universe", "Masters of the Universe"],
["skeletor", "Masters of the Universe"],

  ["game of thrones", "Game of Thrones"],
  ["davos seaworth", "Game of Thrones"],

  ["rick & morty", "Rick and Morty"],
  ["rick and morty", "Rick and Morty"],

  ["the office", "The Office"],
  ["michael scarn", "The Office"],

  ["pop! rocks", "Pop! Rocks"],
  ["pop rocks", "Pop! Rocks"],
  ["rocks -", "Pop! Rocks"],
  ["post malone", "Pop! Rocks"],

  ["sherlock", "Sherlock"],
  ["mycroft holmes", "Sherlock"],

  ["the good dinosaur", "The Good Dinosaur"],

  ["umbrella academy", "The Umbrella Academy"],
  ["klaus hargreeves", "The Umbrella Academy"],

  ["legends of tomorrow", "DC"],
  ["white canary", "DC"],
  ["hawkgirl", "DC"],
  ["kid flash", "DC"],
  ["reverse flash", "DC"],
  ["black flash", "DC"],
  ["sinestro", "DC"],
  ["watchmen", "DC"],
  ["ozymandias", "DC"],
  ["rorschach", "DC"],
  ["blue beetle", "DC"],
  ["supergirl", "DC"],
  ["krypto", "DC"],
  ["the flash", "DC"],

["invincible", "Invincible"],
["allen the alien", "Invincible"],

["five nights at freddy", "Five Nights at Freddy's"],
["five nights at freddys", "Five Nights at Freddy's"],
["fnaf", "Five Nights at Freddy's"],
["withered chica", "Five Nights at Freddy's"],
["withered bonnie", "Five Nights at Freddy's"],
["withered foxy", "Five Nights at Freddy's"],
["tiger rock", "Five Nights at Freddy's"],
["dj music man", "Five Nights at Freddy's"],
["jack-o-moon", "Five Nights at Freddy's"],
["balloon bonnie", "Five Nights at Freddy's"],

["peacemaker", "Peacemaker"],

["the big bang theory", "The Big Bang Theory"],
["raj koothrappali", "The Big Bang Theory"],

["ben 10", "Ben 10"],
["heatblast", "Ben 10"],

["nacho libre", "Nacho Libre"],
["free guy", "Free Guy"],
["nightmare before christmas", "The Nightmare Before Christmas"],
["oogie boogie", "The Nightmare Before Christmas"],

["dustin henderson", "Stranger Things"],
["jim hopper", "Stranger Things"],
["mike wheeler", "Stranger Things"],
["will byers", "Stranger Things"],
  ["max mayfield", "Stranger Things"],

["lord of the rings", "The Lord of the Rings"],
["frodo", "The Lord of the Rings"],
["psych", "Psych"],
["shawn & gus", "Psych"],
["shawn spencer", "Psych"],
["office space", "Office Space"],
["samir", "Office Space"],
["michael bolton", "Office Space"],
];

function normalizeWhitespace(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function cleanDescription(value: string | null | undefined): string | null {
  const cleaned = normalizeWhitespace(value ?? "");

  if (!cleaned) return null;
  if (/^no description found\.?$/i.test(cleaned)) return null;
  if (/^n\/a$/i.test(cleaned)) return null;

  // Keep normal Funko/product blurbs. Only reject strong foreign-store or price-comparison text.
  const rejectPatterns = [
    /\bdécouvrez\b/i,
    /\bcomparez\b/i,
    /\bavant de l['’]acheter\b/i,
    /\bréf\.?\b/i,
    /\bfigura\b/i,
    /\bvinilo\b/i,
    /\bvinyle\b/i,
    /\bcolecci[oó]n\b/i,
    /\bpersonaje\b/i,
    /\bproducto\b/i,
    /\bdistribuidor autorizado\b/i,
    /\benv[ií]os\b/i,
    /\bpulgadas\b/i,
    /\bhecho de\b/i,
    /\bempaque\b/i,
    /\bestoy viviendo\b/i,
    /\bde la exitosa serie\b/i,
    /\bdescubre\b/i,
    /\bdescrizione\b/i,
    /\btilaa\b/i,
    /\bkärkkäiseltä\b/i,
    /\bsuomen suurimmassa\b/i,
    /\bverkkokaupassa\b/i,
    /\btuotetta\b/i,
    /\bgrö[ßs]e\b/i,
    /\bsüße\b/i,
    /\bdeiner lieblingsfranchise\b/i,
    /\bsammeln\b/i,
    /\bcompare prices\b/i,
    /\bacross\s+\d+\+?\s+retailers\b/i,
    /\bfrom\s+\$\d/i,
    /\bnew\s*-\s*open box\b/i,
    /\bretail box\b/i,
    /\bwindow display box\b/i,
    /\bwindow box packaging\b/i,
    /\bmeasures approximately\b/i,
    /\bcomes packaged\b/i,
    /\bages\s+\d+\s+and up\b/i,
    /\bproduct description\b/i,
    /\btoy,\s*dolls and action figures\b/i,
    /\bspecs typology\b/i,
    /\bbatteries required\b/i,
    /\bcontains batteries\b/i,
    /\bevery regular sized funko pop comes shipped\b/i,
    /\bpop protector\b/i,
    /\bheadquartered in downtown everett\b/i,
    /\bfunko designs sources and distributes\b/i,
    /\bfunko inc\.? is your source\b/i,
    /\buniquely styled and very recognizable\b/i,
    /\bbrought to you by\b/i,
    /\blargest anime and funko\b/i,
    /\bview allclose\b/i,
    /\bfig[úu]rka\b/i,
    /\bšpeci[aá]lnej ed[ií]ci/i,
    /\bsvieti v tme\b/i,
    /\btelevisi[oó]n\b/i,
    /\balgunas de las\b/i,
    /\bpr[oÃ³]xima serie de televisi[oÃ³]n\b/i,
    /\bcadena abc\b/i,
    /\bfunko de la familia\b/i,
    /\bestrena este oto[Ã±n]o\b/i,
    /\bspecial edition sticker on box\b/i,
    /\bpack med\b/i,
    /\bk[Ã¶o]p och f[Ã¶o]rs[Ã¤a]ljning\b/i,
    /\bprodukter f[Ã¶o]r\b/i,
    /\bproduktinformation\b/i,
    /\btillverkare\b/i,
    /\bskickas\b/i,
    /\bprisjakt\b/i,
    /\bproduktbeskrivning\b/i,
  ];

  if (rejectPatterns.some((pattern) => pattern.test(cleaned))) {
    return null;
  }

  const withoutBoilerplate = cleaned
    .replace(/\s*China Safety Warning:.*$/i, "")
    .replace(/\s*WARNING:.*$/i, "")
    .replace(/\\n/g, " ")
    .replace(/\s*Please understand this before ordering\.?$/i, "")
    .replace(/\s*Check out the other .*? Collect them all!?$/i, "")
    .trim();

  if (!withoutBoilerplate) return null;

  return withoutBoilerplate.length > 280
    ? `${withoutBoilerplate.slice(0, 277).trim()}...`
    : withoutBoilerplate;
}

function buildDisplayDescription(parsed: {
  description?: string | null;
  character?: string | null;
  pop_name?: string | null;
  franchise?: string | null;
  set_name?: string | null;
  number?: string | null;
  variant?: string | null;
}): string | null {
  const cleaned = cleanDescription(parsed.description);
  const genericPatterns = [
    /pop vinyl figures take characters from pop culture/i,
    /you can collect all your favorite/i,
    /from funko's popular .?pop.? series comes this .*figure/i,
    /stands approx\. 9 cm tall/i,
    /window box packaging/i,
    /stylized collectable stands/i,
    /^product details\b/i,
    /as a stylized pop vinyl/i,
    /as a stylized pop\b/i,
    /figure stands\s+\d/i,
    /check out the other/i,
    /funko delivers a fun .* stylized look/i,
    /an example of this is the pop figurine/i,
    /miniature versions of popular characters/i,
    /as the world.s leading purvey/i,
    /product release dates/i,
    /terms of services/i,
    /soft protectors/i,
    /pre-owned pop/i,
    /actual item is the one pictured/i,
    /marks or damage/i,
    /vinyl bobblehead is approximately/i,
    /figure stands approximately/i,
    /collectible stands approximately/i,
    /measures approximately/i,
    /standing approximately/i,
    /funko pop!\s*television/i,
    /figura de vinilo/i,
    /figura viene/i,
    /vinilo/i,
    /ponieważ/i,
    /spécial/i,
    /matière/i,
    /fabricant/i,
    /date de sortie/i,
    /^description:\s*pop television/i,
  ];

  if (
    cleaned &&
    !genericPatterns.some((pattern) => pattern.test(cleaned)) &&
    !descriptionMismatchesProduct(cleaned, parsed)
  ) {
    return cleaned;
  }

  const name = parsed.character || parsed.pop_name;
  if (!name) return null;

  return `${name}${parsed.franchise ? ` is a ${parsed.franchise} Funko Pop` : " is a Funko Pop"}${parsed.number ? ` #${parsed.number}` : ""}${parsed.set_name && parsed.set_name !== parsed.franchise ? ` from ${parsed.set_name}` : ""}${parsed.variant ? ` (${parsed.variant})` : ""}.`;
}

function isWeakDisplayDescription(value: unknown): boolean {
  const text = normalizeWhitespace(String(value ?? ""));
  if (!text) return true;

  return [
    /^no description found\.?$/i,
    /\balgunas de las\b/i,
    /\bpr[oÃ³]xima serie de televisi[oÃ³]n\b/i,
    /\bcadena abc\b/i,
    /\bfunko de la familia\b/i,
    /\bfunko delivers a fun\b/i,
    /\ban example of this is the pop figurine\b/i,
    /\bminiature versions of popular characters\b/i,
    /\bas the world.s leading purvey\b/i,
    /\bproduct release dates\b/i,
    /\bterms of services\b/i,
    /\bsoft protectors\b/i,
    /\bpre-owned pop\b/i,
    /\bactual item is the one pictured\b/i,
    /\bfunko inc\.? is your source\b/i,
    /\buniquely styled and very recognizable\b/i,
    /\bmarks or damage\b/i,
    /\bvinyl bobblehead is approximately\b/i,
    /\bfigure stands approximately\b/i,
    /\bcollectible stands approximately\b/i,
    /\bmeasures approximately\b/i,
    /\bstanding approximately\b/i,
    /\bfunko pop!\s*television\b/i,
    /\bfigura de vinilo\b/i,
    /\bfigura viene\b/i,
    /\bvinilo\b/i,
    /\bponieważ\b/i,
    /\bspécial\b/i,
    /\bmatière\b/i,
    /\bfabricant\b/i,
    /\bdate de sortie\b/i,
    /^product details\b/i,
    /\bas a stylized pop vinyl\b/i,
    /\bas a stylized pop\b/i,
    /\bfigure stands\s+\d/i,
    /\bcheck out the other\b/i,
    /^description:\s*pop television/i,
    /\bpack med\b/i,
    /\bk[Ã¶o]p och f[Ã¶o]rs[Ã¤a]ljning\b/i,
    /\bprodukter f[Ã¶o]r\b/i,
    /\bproduktinformation\b/i,
    /\btillverkare\b/i,
    /\bskickas\b/i,
    /\bprisjakt\b/i,
    /\bproduktbeskrivning\b/i,
  ].some((pattern) => pattern.test(text));
}

function descriptionMismatchesProduct(
  value: unknown,
  parsed: {
    character?: string | null;
    pop_name?: string | null;
    franchise?: string | null;
    set_name?: string | null;
  },
): boolean {
  const text = normalizeWhitespace(String(value ?? "")).toLowerCase();
  if (!text) return false;

  const productText = normalizeWhitespace(
    `${parsed.character ?? ""} ${parsed.pop_name ?? ""} ${parsed.franchise ?? ""} ${parsed.set_name ?? ""}`,
  ).toLowerCase();

  const marvelTerms = [
    "marvel",
    "spider-man",
    "spiderman",
    "green goblin",
    "no way home",
    "avengers",
    "x-men",
    "wolverine",
    "daredevil",
    "moon knight",
    "thor",
    "hulk",
    "fantastic four",
    "captain america",
    "iron man",
    "deadpool",
    "venom",
  ];
  const dcTerms = [
    "dc",
    "superman",
    "man of steel",
    "general zod",
    "zod",
    "batman",
    "wonder woman",
    "justice league",
    "green lantern",
    "aquaman",
    "harley quinn",
    "joker",
    "the flash",
    "hawkgirl",
    "krypto",
    "supergirl",
  ];

  const hasAny = (terms: string[]) => terms.some((term) => text.includes(term));
  const productHasAny = (terms: string[]) => terms.some((term) => productText.includes(term));

  if (parsed.franchise === "DC" && hasAny(marvelTerms) && !productHasAny(marvelTerms)) return true;
  if (parsed.franchise === "Marvel" && hasAny(dcTerms) && !productHasAny(dcTerms)) return true;

  return false;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function titleCaseLoose(value: string): string {
  return normalizeWhitespace(value)
    .split(" ")
    .map((part) => {
      if (!part) return part;
      if (part.length <= 3 && part === part.toUpperCase()) return part;
      if (part.includes("&")) return part;
      if (part.match(/^n-\d$/i)) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function stripUniversalNoise(title: string): string {
  return normalizeWhitespace(title)
    .replace(/\bFunko\b/gi, "")
    .replace(/\bPOP!?\b/gi, "")
    .replace(/\bPop\b/gi, "")
    .replace(/!/g, "")
    .replace(/\bVinyl\s+Bobble[- ]?Head\b/gi, "")
    .replace(/\bBobble[- ]?Head\b/gi, "")
    .replace(/\bBobblehead\b/gi, "")
    .replace(/\bVinilo\s+Bobble\s+Head\b/gi, "")
    .replace(/\bVinyl Figure\b/gi, "")
    .replace(/\bPop\s*Vinyl\b/gi, "")
    .replace(/\bVinyl\b/gi, "")
    .replace(/\bVinyl Collectible\b/gi, "")
    .replace(/\bCollectible\b/gi, "")
    .replace(/\bFigurine\b/gi, "")
    .replace(/\bToy Figure\b/gi, "")
    .replace(/\bAction Figure\b/gi, "")
    .replace(/\bFigure\b/gi, "")
    .replace(/\b3\.75\s*Inch\b/gi, "")
    .replace(/\b3 ¾\s*Inch\b/gi, "")
    .replace(/\b3\.75"\b/gi, "")
    .replace(/\b3 ¾"\b/gi, "")
    .replace(/\b\d+(\.\d+)?\s*[- ]?in(ch)?\b/gi, "")
    .replace(/\b\d+(\.\d+)?["”]\b/gi, "")
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNumber(title: string): string | null {
  const titleForNumber = normalizeWhitespace(title)
    .replace(/\b\d+(st|nd|rd|th)\s+anniversary\b/gi, " ")
    .replace(/\b(?:LE|Limited(?: Edition)?(?: to)?)\s*[:#-]?\s*\d{2,6}\s*(?:pcs|pieces|pc)?\b/gi, " ")
    .replace(/\b\d{2,6}\s*(?:pcs|pieces|pc)\b/gi, " ")
    .replace(/\b\d+(\.\d+)?\s*[- ]?cm\b/gi, " ")
    .replace(/\b\d+(\.\d+)?\s*[- ]?in(ch)?\b/gi, " ");

  const hashMatch = titleForNumber.match(/#\s?(\d{1,5})\b/);
  if (hashMatch) return hashMatch[1];

  const noMatch = titleForNumber.match(/\b(?:N[°ºo]?|No\.?)\s*(\d{1,5})\b/i);
  if (noMatch) return noMatch[1];

  const parenNumberMatch = titleForNumber.match(/\((\d{1,5})\)/);
  if (parenNumberMatch) return parenNumberMatch[1];

  const conventionNumberMatch = titleForNumber.match(/\b(\d{1,5})\s+(?:Convention|Con)\s+\d{4}\b/i);
  if (conventionNumberMatch) return conventionNumberMatch[1];

  const colonNumberMatch = titleForNumber.match(/\b(\d{1,5})\s*:\s*[A-Za-z]/);
  if (colonNumberMatch) return colonNumberMatch[1];

  const parenThenSeriesMatch = titleForNumber.match(/\)\s+(\d{3,5})\s+(?:Stranger Things|Marvel|DC|Star Wars)\b/i);
  if (parenThenSeriesMatch) return parenThenSeriesMatch[1];

  const leadingMatch = titleForNumber.match(/^\s*(\d{1,5})\s+[A-Za-z]/);
  if (leadingMatch) return leadingMatch[1];

  const trailingMatch = titleForNumber.match(/\b([0-9]{2,5})\s*(?:\([^)]+\))?\s*$/);
  if (trailingMatch) return trailingMatch[1];

  return null;
}

function findAlias(haystack: string, aliases: Array<[string, string]>): string | null {
  const lower = haystack.toLowerCase();
  const found = aliases.find(([needle]) => lower.includes(needle));
  return found ? found[1] : null;
}

function extractVariant(product: any, cleanTitle: string): string | null {
  const haystack = `${cleanTitle} ${product?.description ?? ""} ${product?.size ?? ""}`;
  const lower = haystack.toLowerCase();

  // Important:
  // "Chance of Chase" means the same UPC may be common OR chase.
  // Do not mark the catalog row itself as Chase.
  // The actual owned copy belongs in user_collection_items.owned_variant.
  if (
    lower.includes("chance of chase") ||
    lower.includes("chance chase") ||
    lower.includes("possible chase") ||
    lower.includes("chase possible") ||
    lower.includes("may receive chase")
  ) {
    return null;
  }

  if (/\bee\b/i.test(haystack) && /\b(glows? dark|gitd|glow in the dark)\b/i.test(haystack)) return "Glow in the Dark";
  if (/\bglitter version\b/i.test(haystack)) return "Glitter";

  return findAlias(haystack, VARIANT_ALIASES);
}

function extractPopStyle(product: any, cleanTitle: string): string {
  const haystack = `${product?.title ?? ""} ${cleanTitle} ${product?.size ?? ""}`;
  return findAlias(haystack, POP_STYLE_ALIASES) ?? "Standard";
}

function extractVaultStatus(product: any, cleanTitle: string): string {
  const haystack = normalizeWhitespace([
    product?.title,
    product?.name,
    product?.description,
    product?.category,
    product?.model,
    product?.specs ? JSON.stringify(product.specs) : "",
    cleanTitle,
  ].filter(Boolean).join(" "));
  if (/\bvaulted\b/i.test(haystack)) return "Vaulted";
  return "Active";
}

function extractLimitedEdition(product: any, cleanTitle: string): {
  limited_edition: boolean;
  limited_count: number | null;
  edition_notes: string | null;
} {
  const haystack = normalizeWhitespace(`${product?.title ?? ""} ${cleanTitle}`);

  const countMatch =
    haystack.match(/\b(?:LE|Limited(?: Edition)?(?: to)?)\s*[:#-]?\s*(\d{2,6})\s*(?:pcs|pieces|pc)\b/i) ??
    haystack.match(/\b(\d{2,6})\s*(?:pcs|pieces|pc)\b/i);
  const limited =
    /\blimited(?: edition| run| production)?\b/i.test(haystack) ||
    !!countMatch;
  const limitedCount = countMatch ? Number(countMatch[1]) : null;

  return {
    limited_edition: limited,
    limited_count: limitedCount,
    edition_notes: limited
      ? limitedCount
        ? `Limited to ${limitedCount} pieces`
        : "Limited production run"
      : null,
  };
}

function extractSetName(product: any, cleanTitle: string): string | null {
  const haystack = `${cleanTitle} ${product?.description ?? ""}`.toLowerCase();

  if (
    haystack.includes("justice league x sonic") ||
    haystack.includes("jla & sonic") ||
    haystack.includes("jla and sonic") ||
    haystack.includes("dc & sonic") ||
    haystack.includes("dc and sonic") ||
    (haystack.includes("sonic") && /\b(batman|flash|superman|wonder woman|cyborg)\b/.test(haystack))
  ) {
    return "Justice League x Sonic";
  }
  if (haystack.includes("steve aoki")) return "Steve Aoki";
  if (haystack.includes("peacemaker")) return "Peacemaker";
  if (haystack.includes("g.i. joe") || haystack.includes("gi joe")) return "G.I. Joe";
  if (haystack.includes("who framed roger rabbit") || haystack.includes("roger rabbit")) return "Who Framed Roger Rabbit";
  if (haystack.includes("aquaman and the lost kingdom")) return "Aquaman and the Lost Kingdom";
  if (haystack.includes("the suicide squad") || haystack.includes("suicide squad")) return "The Suicide Squad";
  if (haystack.includes("black adam")) return "Black Adam";
  if (haystack.includes("doom patrol")) return "Doom Patrol";
  if (haystack.includes("smallville")) return "Smallville";
  if (haystack.includes("creature commandos")) return "Creature Commandos";
  if (haystack.includes("doctor phosphorus") || haystack.includes("doctor phosphorous")) return "Creature Commandos";
  if (haystack.includes("gotham knights")) return "Gotham Knights";
  if (haystack.includes("cyborg silhouette") || haystack.includes("dc universe")) return "DC Universe";
  if (haystack.includes("red hood")) return "DC Comics";
  if (haystack.includes("black lantern") || haystack.includes("wonder woman docteur mary")) return "Wonder Woman";
  if (haystack.includes("mr. freeze") || haystack.includes("mr freeze") || haystack.includes("batman & robin")) return "Batman & Robin";
  if (haystack.includes("deathstroke") || haystack.includes("black canary") || haystack.includes("the arrow")) return "Arrow";
  if (haystack.includes("starfire") || haystack.includes("nightwing") || haystack.includes("beast boy")) return "Titans";
  if (haystack.includes("dick in a box") || haystack.includes("d*ck in a box") || haystack.includes("d ck in a box")) return "Saturday Night Live";
  if (haystack.includes("fantastic beasts") || haystack.includes("crimes of grindelwald") || haystack.includes("chupacabra")) return "Fantastic Beasts: The Crimes of Grindelwald";
  if (haystack.includes("the witcher") || /\bciri\b/.test(haystack)) return "The Witcher";
  if (haystack.includes("carol anne freeling") || haystack.includes("poltergeist ii")) return "Poltergeist II: The Other Side";
  if (haystack.includes("exorcist believer")) return "The Exorcist: Believer";
  if (haystack.includes("gregory house") || haystack.includes("house md")) return "House";
  if (haystack.includes("wolverine finale") || haystack.includes("deadpool & wolverine") || haystack.includes("deadpool 3")) return "Deadpool & Wolverine";
  if (haystack.includes("venomized deadpool")) return "Venom";
  if (haystack.includes("robin hood")) return "Robin Hood";
  if (haystack.includes("mean girls")) return "Mean Girls";
  if (haystack.includes("clueless")) return "Clueless";
  if (haystack.includes("legally blonde")) return "Legally Blonde";
  if (haystack.includes("edward scissorhands")) return "Edward Scissorhands";
  if (haystack.includes("supernatural")) return "Supernatural";
  if (haystack.includes("star trek")) return "Star Trek";
  if (haystack.includes("willow")) return "Willow";
  if (haystack.includes("pet sematary")) return "Pet Sematary";
  if (haystack.includes("saved by the bell")) return "Saved by the Bell";
  if (haystack.includes("beavis and butt-head") || haystack.includes("beavis and butthead")) return "Beavis and Butt-Head";
  if (haystack.includes("boyz ii men")) return "Boyz II Men";
  if (haystack.includes("new kids on the block")) return "New Kids on the Block";
  if (haystack.includes("dolly parton")) return "Dolly Parton";
  if (haystack.includes("elvis presley")) return "Elvis Presley";
  if (haystack.includes("chilly willy")) return "Chilly Willy";
  if (haystack.includes("crash bandicoot")) return "Crash Bandicoot";
  if (haystack.includes("despicable me")) return "Despicable Me";
  if (haystack.includes("forrest gump")) return "Forrest Gump";
  if (haystack.includes("ash vs. evil dead")) return "Ash vs. Evil Dead";
  if (haystack.includes("annabelle")) return "Annabelle";
  if (haystack.includes("louis litt") || haystack.includes("suits")) return "Suits";
  if (haystack.includes("bob ross") || haystack.includes("joy of painting")) return "Bob Ross: The Joy of Painting";
  if (haystack.includes("brandalised") || haystack.includes("banksy")) return "Brandalised";
  if (haystack.includes("1883")) return "1883";
  if (haystack.includes("oliver & company") || haystack.includes("oliver and company")) return "Oliver & Company";
  if (haystack.includes("duck tales") || haystack.includes("ducktales")) return "DuckTales";
  if (/\blogan\b/.test(haystack) && /\b(?:movie exclusive|x-men|marvel|funko)\b/.test(haystack)) return "Logan";
  if (haystack.includes("daredevil") && haystack.includes("born again")) return "Daredevil: Born Again";
  if (haystack.includes("captain america") && haystack.includes("brave new world")) return "Captain America: Brave New World";
  if (haystack.includes("civil war") && haystack.includes("winter soldier")) return "Captain America: Civil War";
  if (haystack.includes("shazam") && haystack.includes("fury of the gods")) return "Shazam! Fury of the Gods";
  if (haystack.includes("loki season 2")) return "Loki Season 2";
  if (haystack.includes("loki") && !haystack.includes("thor")) return "Loki";
  if (haystack.includes("justice league")) return "Justice League";
  if (haystack.includes("man of steel")) return "Man of Steel";
  if (haystack.includes("superman")) return "Superman";
  if (haystack.includes("thunderbolts")) return "Thunderbolts";
  if (haystack.includes("doctor strange") && haystack.includes("multiverse of madness")) return "Doctor Strange in the Multiverse of Madness";
  if (haystack.includes("shang-chi") || haystack.includes("shang chi")) return "Shang-Chi and the Legend of the Ten Rings";
  if (haystack.includes("thor ragnarok")) return "Thor: Ragnarok";
  if (haystack.includes("thor love and thunder") || haystack.includes("thor love & thunder")) return "Thor: Love and Thunder";
  if (haystack.includes("captain america the first avenger")) return "Captain America: The First Avenger";
  if (haystack.includes("captain america")) return "Captain America";
  if (haystack.includes("the princess bride")) return "The Princess Bride";
  if (haystack.includes("animaniacs") || (haystack.includes("pinky") && haystack.includes("brain"))) return "Animaniacs";
  if (haystack.includes("little mermaid")) return "The Little Mermaid";
  if (haystack.includes("lilo") && haystack.includes("stitch")) return "Lilo & Stitch";
  if (haystack.includes("pinocchio")) return "Pinocchio";
  if (haystack.includes("kronk") || haystack.includes("emperor's new groove") || haystack.includes("emperors new groove")) return "The Emperor's New Groove";
  if (haystack.includes("disney villains")) return "Disney Villains";
  if (haystack.includes("aladdin")) return "Aladdin";
  if (haystack.includes("monsters inc") || haystack.includes("monsters, inc")) return "Monsters, Inc.";
  if (haystack.includes("toy story 5")) return "Toy Story 5";
  if (haystack.includes("toy story 4")) return "Toy Story 4";
  if (haystack.includes("toy story")) return "Toy Story";
  if (haystack.includes("finding dory")) return "Finding Dory";
  if (haystack.includes("the jungle book") || haystack.includes("jungle book")) return "The Jungle Book";
  if (haystack.includes("incredibles 2")) return "Incredibles 2";
  if (haystack.includes("coco")) return "Coco";
  if (haystack.includes("dumb & dumber") || haystack.includes("dumb and dumber")) return "Dumb and Dumber";
  if (haystack.includes("duck dodgers")) return "Duck Dodgers";
  if (haystack.includes("looney tunes")) return "Looney Tunes";
  if (haystack.includes("jurassic world dominion") || haystack.includes("jurassic world 3: dominion")) return "Jurassic World Dominion";
  if (haystack.includes("jurassic park")) return "Jurassic Park";
  if (haystack.includes("cuphead")) return "Cuphead";
  if (haystack.includes("pennywise") || haystack.includes("it- pennywise") || haystack.includes("it: pennywise")) return "IT";
  if (haystack.includes("lost jack") || haystack.includes("lost sawyer") || haystack.includes("television: lost")) return "Lost";
  if (haystack.includes("rick") && haystack.includes("morty")) return "Rick and Morty";
  if (haystack.includes("stranger things")) return "Stranger Things";
  if (haystack.includes("five nights at freddy")) return "Five Nights at Freddy's";
  if (haystack.includes("security breach")) return "Five Nights at Freddy's: Security Breach";
  if (haystack.includes("help wanted 2")) return "Five Nights at Freddy's: Help Wanted 2";
  if (haystack.includes("avengers age of ultron")) return "Avengers: Age of Ultron";
  if (haystack.includes("avengers endgame")) return "Avengers: Endgame";
  if (haystack.includes("black widow")) return "Black Widow";
  if (
    haystack.includes("fantastic four") &&
    (haystack.includes("first steps") || haystack.includes("(2025)") || haystack.includes("2025"))
  ) {
    return "Fantastic Four: First Steps";
  }
  if (haystack.includes("fantastic four")) return "Fantastic Four";
  if (haystack.includes("the lord of the rings") || haystack.includes("lord of the rings")) return "The Lord of the Rings";
  if (haystack.includes("office space")) return "Office Space";
  if (haystack.includes("psych")) return "Psych";
  if (haystack.includes("guardians of the galaxy vol. 2") || haystack.includes("guardians of the galaxy vol 2")) return "Guardians of the Galaxy Vol. 2";
  if (haystack.includes("guardians of the galaxy vol. 3") || haystack.includes("guardians of the galaxy vol 3")) return "Guardians of the Galaxy Vol. 3";
  if (haystack.includes("guardians of the galaxy")) return "Guardians of the Galaxy";
  if (haystack.includes("big bang theory")) return "The Big Bang Theory";
  if (haystack.includes("batman returns")) return "Batman Returns";
  if (haystack.includes("harry potter")) return "Harry Potter";
  if (
    /\b(hermione|voldemort|snape|draco|luna|sirius|dobby|dementor|george weasley|bellatrix|mad-eye|moody|peter pettigrew|bloody baron|parvati patil|ron weasley|albus dumbledore)\b/.test(haystack) &&
    !haystack.includes("fantastic beasts") &&
    !haystack.includes("grindelwald")
  ) {
    return "Harry Potter";
  }
  if (haystack.includes("walking dead")) return "The Walking Dead";
  if (haystack.includes("blue beetle")) return "Blue Beetle";
  if (haystack.includes("free guy")) return "Free Guy";
  if (haystack.includes("nightmare before christmas")) return "The Nightmare Before Christmas";
  if (haystack.includes("mech strike")) return "Mech Strike";
  if (haystack.includes("wandavision")) return "WandaVision";
  if (haystack.includes("an american tail")) return "An American Tail: Fievel Goes West";
  if (haystack.includes("tombstone")) return "Tombstone";
  if (haystack.includes("stan lee")) return "Stan Lee";

  return null;
}

function extractExclusivity(product: any): string | null {
  const stores = Array.isArray(product?.stores) ? product.stores : [];
  const haystack = `
    ${product?.title ?? ""}
    ${product?.description ?? ""}
    ${stores.map((s: any) => s?.name ?? "").join(" ")}
  `;

  return findAlias(haystack, EXCLUSIVITY_ALIASES);
}

function guessFranchise(product: any, cleanTitle: string): string | null {
  const manufacturer = normalizeWhitespace(product?.manufacturer ?? "");
  const brand = normalizeWhitespace(product?.brand ?? "");
  const category = normalizeWhitespace(product?.category ?? "");
  const description = normalizeWhitespace(product?.description ?? "");

  const haystack = `${cleanTitle} ${category} ${manufacturer} ${brand} ${description}`;

  if (/\blogan\b/i.test(haystack) && /\b(?:funko|pop|movie exclusive|x-men|marvel)\b/i.test(haystack)) {
    return "Marvel";
  }

  const inferred = inferFranchiseFromKnownText(haystack);
  if (inferred) return inferred;

  const alias = findAlias(haystack, FRANCHISE_ALIASES);
  if (alias) return alias;

  if (manufacturer && !BAD_BRANDS.includes(manufacturer)) return manufacturer;
  if (brand && !BAD_BRANDS.includes(brand)) return brand;

  return null;
}

function removeKnownNoiseFromCharacter(
  value: string,
  franchise: string | null,
  number: string | null,
  popStyle: string | null,
  exclusivity: string | null,
  setName: string | null,
): string {
  let cleaned = value;

  const removableTerms = [
    "SW",
    "Fallout TV Series",
    "Fallout",
    "TV Series",
    "Not Mint",
    "Funko Gifts",
    "Gifts",
    "Mystery",

    "Movies",
    "Movie",
    "Television",
    "TV",
    "Animation",
    "Animación",
    "Games",
    "Game",
    "Comics",
    "Comic",
    "Heroes",
    "Super Heroes",
    "Universe",
    "Cinematic Universe",
    "Cinematic Universe Arc",
    "Movies Vinyl",
    "Rocks",
    "Figur",
    "Figures",
    "Bobble Head",
    "Bobble-Head",
    "Bobblehead",
    "Vinyl Bobble Head",
    "Vinyl Bobble-Head",
    "Vinilo Bobble Head",

    "Marvel",
    "DC",
    "Star Wars",
    "Justice League",
    "Captain America Brave New World",
    "Captain America: Brave New World",
    "Shazam Fury Of The Gods",
    "Shazam! Fury Of The Gods",
    "Zack Snyder's",
    "Zack Snyder",
    "Wayne S World",
    "Wayne's World",
    "Fantastic Beasts",
    "Wizarding World",
    "Harry Potter",
    "Rick & Morty",
    "Rick And Morty",
    "Rick and Morty",
    "The Office",
    "Sherlock",
    "The Good Dinosaur",
    "The Umbrella Academy",
    "Legends Of Tomorrow",
    "Thor Ragnarok",
    "Thor: Ragnarok",
    "Thor Love And Thunder",
    "Thor Love & Thunder",
    "Avengers Infinity War",
    "Avengers 4 Endgame",
    "Avengers Endgame",
    "Ant-Man And The Wasp Quantumania",
    "Ant-Man & The Wasp Quantumania",
    "Guardians Of The Galaxy 3",
    "Guardians Of The Galaxy Vol 3",
    "Guardians Of The Galaxy Vol. 3",
    "Doctor Strange In The Multiverse Of Madness",
    "Shang Chi And The Legend Of Ten Rings",
    "Shang-Chi And The Legend Of Ten Rings",
    "Fantastic Four First Steps",
    "Fantastic Four: First Steps",
    "The Fantastic Four First Steps",
    "The Fantastic Four: First Steps",
    "The Fantastic 4",
    "Fantastic 4",
    "Lord Of The Rings",
    "The Lord Of The Rings",
    "Office Space",
    "Psych",
    "Born Again",
    "Daredevil Born Again",
    "Five Nights At Freddy's",
    "Five Nights At Freddy’s",
    "Five Nights At Freddys",
    "Security Breach",
    "Help Wanted 2",
    "Peacemaker S3",
    "The Big Bang Theory",
    "Ben 10",
    "Blue Beetle",
    "Free Guy",
    "The Nightmare Before Christmas",
    "Duck Tales",
    "DuckTales",
    "Avengers Age Of Ultron",
    "Avengers Endgame",
    "Guardians Of The Galaxy Vol. 2",
    "Guardians Of The Galaxy Vol 2",
    "Guardians Of The Galaxy",
    "Mech Strike",
    "Monster Hunters",
    "Wandavision",
    "Loki Season 2",
    "Loki",
    "The Princess Bride",
    "Animaniacs",
    "Pinky & The Brain",
    "Pinky And The Brain",
    "The Little Mermaid",
    "Lilo & Stitch",
    "Lilo And Stitch",
    "Pinocchio",
    "The Emperor's New Groove",
    "Emperors New Groove",
    "Aladdin",
    "Monsters Inc",
    "Monsters, Inc",
    "Toy Story 5",
    "Toy Story 4",
    "Toy Story",
    "Finding Dory",
    "The Jungle Book",
    "Jungle Book",
    "Incredibles 2",
    "Disney Villains",
    "Disney Pixar",
    "Disney",
    "Pixar",
    "Coco",
    "Dumb & Dumber",
    "Dumb And Dumber",
    "Duck Dodgers",
    "Looney Tunes",
    "Jurassic Park",
    "Jurassic World Dominion",
    "Jurassic World 3 Dominion",
    "Cuphead",
    "IT",
    "Lost",
    "Tombstone",
    "An American Tail",
    "An American Tail Goes West",
    "Spring Convention",
    "Summer Convention",
    "Wondrous Convention",
    "NYCC",
    "SDCC",

    "Alliance Entertainment",
    "IEWAREHOUSE",
    "DreamBone",
    "Grappiq",
    "Box Damage",
    "US Exclusive",
    "Exclusive",
    "Convention",
    "Walmart",
    "Target",
    "GameStop",
    "Hot Topic",
    "BoxLunch",
    "Entertainment Earth",
    "Shop Exclusive",
    "Specialty Series",
    "With Protector",
    "MCC",
    "Toy",
    "PCS",
  ];

  for (const term of removableTerms) {
    cleaned = cleaned.replace(new RegExp(`\\b${escapeRegex(term)}\\b\\s*:?`, "gi"), " ");
  }

  if (franchise) {
    cleaned = cleaned.replace(new RegExp(`\\b${escapeRegex(franchise)}\\b\\s*:?`, "gi"), " ");
  }

  if (exclusivity) {
    cleaned = cleaned.replace(new RegExp(`\\b${escapeRegex(exclusivity)}\\b\\s*:?`, "gi"), " ");
  }

  if (setName) {
    cleaned = cleaned.replace(new RegExp(`\\b${escapeRegex(setName)}\\b\\s*:?`, "gi"), " ");
    cleaned = cleaned.replace(new RegExp(`\\b${escapeRegex(setName.replace(/:/g, ""))}\\b\\s*:?`, "gi"), " ");
  }

  if (number) {
    cleaned = cleaned
      .replace(new RegExp(`#\\s?${escapeRegex(number)}\\b`, "gi"), " ")
      .replace(new RegExp(`^\\s*${escapeRegex(number)}\\s*:\\s*`, "gi"), " ")
      .replace(new RegExp(`^\\s*${escapeRegex(number)}\\s+(?!\\()`, "gi"), " ");
  }

  const stylesToRemove = [
    "2-Pack",
    "3-Pack",
    "4-Pack",
    "5-Pack",
    "Jumbo",
    "Movie Moment",
    "Moment",
    "Ride",
    "Deluxe",
    "Bitty Pop",
    "Bitty",
    "Home",
    "Boxes",
    "Town",
    "Album",
    "Comic Cover",
    "Art Cover",
    "Poster",
    "Keychain",
    "Pop & Tee",
  ];

  for (const style of stylesToRemove) {
    cleaned = cleaned.replace(new RegExp(`\\b${escapeRegex(style)}\\b`, "gi"), " ");
  }

  if (popStyle && popStyle !== "Standard") {
    cleaned = cleaned.replace(new RegExp(`\\b${escapeRegex(popStyle)}\\b`, "gi"), " ");
  }

  return normalizeWhitespace(cleaned);
}

function cleanupCharacterName(
  rawTitle: string,
  franchise: string | null,
  number: string | null,
  popStyle: string | null,
  exclusivity: string | null,
  setName: string | null,
): string | null {
  let cleaned = stripLeadingCatalogNumber(stripUniversalNoise(rawTitle));
  const originalCleanTitle = cleaned;

  if (/peacemaker\s+with\s+peace\s+sign/i.test(originalCleanTitle) || (/^With\s+Peace\s+Sign\b/i.test(cleaned) && /peacemaker/i.test(rawTitle))) {
    return "Peacemaker with Peace Sign";
  }

  if (/justice\s+league\s+and\s+sonic\s+shadow\s*\/\s*batman/i.test(originalCleanTitle)) {
    return "Shadow/Batman";
  }

  if (/jla\s*&\s*sonic\s*[-:]\s*sonic\s*\/\s*flash/i.test(originalCleanTitle)) {
    return "Sonic/Flash";
  }

  if (/sonic\s+the\s+hedgehog.*amy\s+as\s+wonder\s+woman/i.test(originalCleanTitle)) {
    return "Amy as Wonder Woman";
  }

  if (/knuckles\s+as\s+superman/i.test(originalCleanTitle)) {
    return "Knuckles as Superman";
  }

  if (/tails\s+as\s+cyborg/i.test(originalCleanTitle)) {
    return "Tails as Cyborg";
  }

  if (/harry\s+potter\s+triwizard/i.test(originalCleanTitle)) {
    return "Harry Potter Triwizard";
  }

  if (/^harry\s+potter\s*#\d+\b/i.test(originalCleanTitle) || /^harry\s+potter\s*#\d+\b/i.test(cleaned)) {
    return "Harry Potter";
  }

  if (/harry\s+potter\s+on\s+broom/i.test(originalCleanTitle)) {
    return "Harry Potter on Broom";
  }

  if (/harry\s+potter\s+with\s+hourglass/i.test(originalCleanTitle)) {
    return "Harry Potter with Hourglass";
  }

  if (/undesirable\s+(?:no\.?\s*)?1\s+harry\s+potter/i.test(originalCleanTitle)) {
    return "Harry Potter Undesirable No. 1";
  }

  if (/gingerbread\s+superman/i.test(originalCleanTitle)) {
    return "Gingerbread Superman";
  }

  if (/^Logan\s+And\s+Digital\b/i.test(cleaned)) {
    cleaned = "Logan";
  }

  if (/^D\*?Ck\s+In\s+A\s+Box\b/i.test(cleaned) || /^D\s*Ck\s+In\s+A\s+Box\b/i.test(cleaned)) {
    cleaned = "D*ck in a Box";
  }

  if (/^Doctor\s+Phosphorous\b/i.test(cleaned)) {
    cleaned = cleaned.replace(/^Doctor\s+Phosphorous\b/i, "Doctor Phosphorus");
  }

  if (/^Redhood\b/i.test(cleaned)) {
    cleaned = cleaned.replace(/^Redhood\b/i, "Red Hood");
  }

  if (/^Wonder\s+Woman\s+Docteur\s+Mary\b/i.test(cleaned)) {
    cleaned = "Wonder Woman";
  }

  if (/^Cyborg\s+Silhouette\b/i.test(cleaned)) {
    cleaned = "Cyborg Silhouette";
  }

  if (/^Mr\.?\s+Freeze\s+Glitter\s+Version\b/i.test(cleaned)) {
    cleaned = "Mr. Freeze";
  }

  if (/^Glow\s+In\s+The\s+Dark\b/i.test(cleaned) && /wonder\s+woman\s+black\s+lantern/i.test(rawTitle)) {
    cleaned = "Wonder Woman Black Lantern";
  }

  cleaned = removeKnownNoiseFromCharacter(cleaned, franchise, number, popStyle, exclusivity, setName);

  if (!cleaned && /^Logan\s+And\s+Digital\b/i.test(originalCleanTitle)) {
    cleaned = "Logan";
  }

  // Targeted cleanup: only remove The Mandalorian when it is prefix noise before Grogu.
  // Do not remove it from names like "The Mandalorian & N-1 Starfighter".
  cleaned = cleaned
    .replace(/^SW\s+The Mandalorian\s+Grogu\b/i, "Grogu")
    .replace(/^The Mandalorian\s+Grogu\b/i, "Grogu")
    .replace(/^SW\s+/i, "");

  cleaned = cleaned.replace(/^Sayings\s*[-–—]\s*/i, "");
  cleaned = cleaned.replace(/\bVenom\s+Venomized\b/gi, "Venomized");

  cleaned = cleaned
    .replace(/\s*[-–—]{1,2}\s*\d{4}\s*Con\b/gi, "")
    .replace(/\s*[-–—]{1,2}\s*\d{4}\s*Convention\b/gi, "")
    .replace(/\b\d{4}\s*Con\b/gi, "")
    .replace(/\b\d{4}\s*Convention\b/gi, "");

  cleaned = cleaned.replace(/\((?:NYCC|SDCC|Fall Convention|Spring Convention|Summer Convention)\s*\d{4}\s*\)/gi, "");

  cleaned = cleaned.replace(/^Batman\s*:\s*/i, "");

  cleaned = cleaned.replace(/^Funko\s*[-:]?\s*/i, "");

  cleaned = cleaned
    .replace(/^Oliver\s+(?:&|And)\s+Company\s*(?:\(\d{4}\))?\s*[-:]?\s*/i, "")
    .replace(/^Logan\s+And\s+Digital\b/i, "Logan")
    .replace(/^Superman\s+Krypto\b/i, "Krypto")
    .replace(/^Loki\s+/i, "")
    .replace(/^Captain\s+America\s*:?\s+Brave\s+New\s+World\s+/i, "")
    .replace(/^Shazam!?\s*:?\s+Fury\s+Of\s+The\s+Gods\s+/i, "")
    .replace(/^The\s+Princess\s+Bride\s+/i, "")
    .replace(/^Animaniacs\s+/i, "")
    .replace(/^Disney\s+Pixar\s+Coco\s+/i, "")
    .replace(/^Disney\s+Villains\s+/i, "")
    .replace(/^Pinocchio\s+80th\s+/i, "")
    .replace(/^Pinocchio\s+/i, "")
    .replace(/^Blue\s+Fairy\s+9\s*Cm\b/i, "Blue Fairy")
    .replace(/^Disney\s+Pinocchio\b/i, "Pinocchio")
    .replace(/^Pinocchio\s+Geppetto\b/i, "Geppetto")
    .replace(/^Disney\s+Pixar\s+Coco\s+Miguel\b/i, "Miguel")
    .replace(/^Disney\s+Monsters\s+Inc\s+Sulley\s+With\s+Lid\s+20th\s+Anniv\b/i, "Sulley with Lid")
    .replace(/^Disney\s+Story\s+4\s+Buzz\s+Lightyear\b/i, "Buzz Lightyear")
    .replace(/^Disney\s+Story\s+4\s+Combat\s+Carl\s+Jr\b/i, "Combat Carl Jr.")
    .replace(/^Disney\s+Story\s+Bullseye\s+As\s+Buzz\s+Lightyear\b/i, "Bullseye as Buzz Lightyear")
    .replace(/^Disney\s*\/\s*Pixar\s+Ad\s+Icons\s+Bullseye\s+As\s+Woody\b/i, "Bullseye as Woody")
    .replace(/^Premium\s+Disney\s+Story\s+5\s+Bullseye\b/i, "Bullseye")
    .replace(/^Story\s+Mrs\.?\s+Nesbit\b/i, "Mrs. Nesbit")
    .replace(/^The\s+Jungle\s+Book\s+Disney\s+Bagheera\s+W\/Basket\b/i, "Bagheera with Basket")
    .replace(/^Фигура\s+Disney:\s+Finding\s+Dory:\s+Dory,?$/i, "Dory")
    .replace(/^Disney\s+Kronk\s+/i, "Kronk ")
    .replace(/^Kronk\s+\d{3,5}\s+Wondrous\s+Limited\b/i, "Kronk")
    .replace(/^Home\s+Bitty\s+Boxes\b/i, "Lilo's Home")
    .replace(/^The\s+Little\s+Mermaid\s+/i, "")
    .replace(/^Disney\s+Duck\s+Tales\s+/i, "")
    .replace(/^Disney\s+DuckTales\s+/i, "")
    .replace(/^Duck\s+Tales\s+/i, "")
    .replace(/^DuckTales\s+/i, "")
    .replace(/^Lilo\s+(?:&|And)\s+Stitch\s+/i, "")
    .replace(/^Dumb\s+(?:&|And)\s+Dumber\s+/i, "")
    .replace(/^Duck\s+Dodgers\s+/i, "")
    .replace(/^Looney\s+Tunes\s+/i, "")
    .replace(/^Jurassic\s+World\s+3:?\s+Dominion\s*[-:]?\s*/i, "")
    .replace(/^Jurassic\s+World\s+Dominion\s*[-:]?\s*/i, "")
    .replace(/^Jurassic\s+Park\s+/i, "")
    .replace(/^Cuphead\s+/i, "")
    .replace(/^IT\s*[-:]?\s*/i, "")
    .replace(/^Lost\s+/i, "")
    .replace(/^Tombstone\s*[-:]?\s*/i, "")
    .replace(/^An\s+American\s+Tail(?:\s+Goes\s+West)?\s+/i, "")
    .replace(/^ECHO\s*[-:]\s*Echo\b/i, "Echo")
    .replace(/^Lord\s+Of\s+Rings\s+/i, "")
    .replace(/^Thrones\s+/i, "")
    .replace(/^Jack\s+Skellington\s+As\s+The\s+King\s+Nightmare\s+Before\s+Christmas\s+Disney\b/i, "Jack Skellington as the King")
    .replace(/^Marvel['’]s\s+/i, "")
    .replace(/^Daredevil\s+Daredevil\s*:\s*Born Again\b/i, "Daredevil")
    .replace(/^Daredevil\s*:\s*Born Again\s*[-â€“â€”]\s*/i, "")
    .replace(/^Daredevil\s+Born Again\s+/i, "")
    .replace(/^Moon Knight\s+/i, "")
    .replace(/^Thor\s*:?\s*Ragnarok\s+/i, "")
    .replace(/^Ragnarok\s+Thor\s+/i, "Thor ")
    .replace(/^Avengers\s+Infinity\s+War\s+/i, "")
    .replace(/^Avengers(?:\s+4)?\s+Endgame\s+/i, "")
    .replace(/^Ant[- ]Man\s+(?:&|And)\s+The\s+Wasp:?\s+Quantumania\s+/i, "")
    .replace(/^Guardians\s+Of\s+The\s+Galaxy(?::?\s+Vol\.?\s*3|\s+3)?\s+/i, "")
    .replace(/^Thor\s+Love\s+(?:And|&)\s+Thunder\s+/i, "")
    .replace(/^Stranger Things\s+\d+\s*[-â€“â€”]\s*/i, "")
    .replace(/^Stranger Things\s+S\d+\s*[-â€“â€”]\s*/i, "")
    .replace(/^S\d+\s+/i, "")
    .replace(/^Season\s+\d+\s+/i, "")
    .replace(/\s+Season\s+\d+\s*$/i, "")
    .replace(/\s+S\d+\s*$/i, "");

  const dashParts = cleaned
    .split(/\s[-–—]{1,2}\s/)
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean);

  if (dashParts.length > 1) {
    const meaningfulParts = dashParts.filter((part) => {
      const normalized = normalizeWhitespace(part);
      return (
        normalized.length > 1 &&
        !/^\d{1,5}$/i.test(normalized) &&
        !/^FUN\d+$/i.test(normalized) &&
        !/^RS$/i.test(normalized) &&
        !/^OE$/i.test(normalized)
      );
    });

    if (meaningfulParts.length > 0) {
      cleaned = meaningfulParts[meaningfulParts.length - 1];
    }
  }
cleaned = cleaned
  .replace(/\(Flocked\)/gi, "")
  .replace(/\(Glow\)/gi, "")
  .replace(/\(Metallic\)/gi, "")
  .replace(/\(Chase\)/gi, "")
  .replace(/\(Diamond\)/gi, "")
  .replace(/\(Blacklight\)/gi, "")
  .replace(/\(Bloody\)/gi, "");
  
  cleaned = cleaned
    .replace(/!/g, "")
    .replace(/~/g, "")
    .replace(/\bNot Mint\b/gi, "")
    .replace(/\bFunko Gifts\b/gi, "")
    .replace(/\bGifts\b/gi, "")
    .replace(/^['’`s\s:]+/, "")
    .replace(/\bWith\s+A(?:\s+Pop)?$/i, "")
    .replace(/^[!¡\s:–—-]+/, "")
    .replace(/[\s:–—-]+$/, "")
    .replace(/\s+/g, " ")
    .trim();

  cleaned = cleaned
    .replace(/\(Chance\s+of\s+Chase\)/gi, "")
  .replace(/\bChance\s+of\s+Chase\b/gi, "")
  .replace(/\bPossible\s+Chase\b/gi, "")
  .replace(/\bChase\s+Possible\b/gi, "")
  .replace(/\bMay\s+Receive\s+Chase\b/gi, "")
  .replace(/\bFlocked\b/gi, "")
  .replace(/\bFrodo\s+Baggings\b/gi, "Frodo Baggins")
  .replace(/^Superman\s+2025\s+Super\s+Sized\b/i, "Superman")
  .replace(/^Jumbo\s*:\s*Moon Knight\s*[-–—]\s*/i, "")
  .replace(/^Marvel\s*:\s*Fantastic Four\s+/i, "")
  .replace(/^Marvel\s+The Fantastic 4\s+/i, "")
  .replace(/^Guardians\s+Of\s+The\s+Galaxy\s+Vol\.?\s*2\s+/i, "")
  .replace(/^Fantastic Four\s*:\s*First Steps\s*:?\s*/i, "")
  .replace(/^The Fantastic Four\s*:?\s*First Steps\s*:?\s*/i, "")
  .replace(/^Fantastic Four\s+/i, "")
  .replace(/^The Fantastic Four\s+/i, "")
  .replace(/^Marvel['’]s\s+/i, "")
  .replace(/^['’`s\s:]+/, "")
  .replace(/\bWith\s+A(?:\s+Pop)?$/i, "")
  .replace(/^Marvel\s+Doctor Strange\s+Multiverse\s+Of\s+Madness\s+N[°ºo]?\s+\d+\s*[–—-]\s*/i, "")
  .replace(/^Of\s+/i, "")
  .replace(/\bUS\s*$/i, "")
  .replace(/\bRS\s*$/i, "")
  .replace(/\bOE\s*$/i, "")
  .replace(/\bVinyl\s+Bobble[- ]?Head\b/gi, "")
  .replace(/\bBobble[- ]?Head\b/gi, "")
  .replace(/\bBobblehead\b/gi, "")
  .replace(/\bVinilo\s+Bobble\s+Head\b/gi, "")
  .replace(/\b\d+\s*cm\b/gi, "")
  .replace(/\bVinyl\b/gi, "")
  .replace(/\bFigurine\b/gi, "")
  .replace(/\bN[°ºo]?\b/gi, "")
  .replace(/\b[2-5]\s*pk\b/gi, "")
  .replace(/\bLE\s+\d+\s+PCS\b/gi, "")
  .replace(/\b\d+\s+PCS\b/gi, "")
  .replace(/\s+\d+\s+\d{3,5}\s*$/i, "")
  .replace(/\s+\d{3,5}\s*$/i, "")
  .replace(/\s+/g, " ")
  .trim();

  cleaned = cleaned
    .replace(/^Figura\s+Doctor\s+Strange\s+Multiverse\s+Of\s+Madness\b/i, "Doctor Strange")
    .replace(/^Doctor\s+Strange\s+Multiverse\s+Of\s+Madness\b/i, "Doctor Strange")
    .replace(/^Civil\s+War\s+\d{1,5}\s+Winter\s+Soldier\b/i, "Winter Soldier")
    .replace(/^1978\s+Lois\s+Lane\b/i, "Lois Lane")
    .replace(/^In\s+Holiday\s+Sweater\b/i, "Superman In Holiday Sweater")
    .replace(/^Ant[- ]Man\s+Ant\s+Man\b/i, "Ant-Man")
    .replace(/^Thor\s+MCC\s+With\s+Protector\b/i, "Thor")
    .replace(/^Gorr\s+Specialty\s+Series\b/i, "Gorr")
    .replace(/^80th\s+Anniversary\s+Thanos\b/i, "Thanos")
    .replace(/\s+/g, " ")
    .trim();

  const supermanColorMatch = originalCleanTitle.match(/^Superman\s+(Red|Blue)\b/i);
  if (supermanColorMatch) {
    return `Superman ${titleCaseLoose(supermanColorMatch[1])}`;
  }

  if (/^Superman\s+And\s+The\s+Fortress\s+Of\s+Solitude\b/i.test(originalCleanTitle)) {
    return "Superman And The Fortress Of Solitude";
  }

  if (/^Bizarro\s+Superman\b/i.test(originalCleanTitle)) {
    return "Bizarro Superman";
  }

  if (/^Superman\s+Brainiac\b/i.test(originalCleanTitle)) {
    return "Brainiac";
  }

  if (/^Classic\s+Superman\b/i.test(originalCleanTitle)) {
    return "Classic Superman";
  }

  if (/^Cyborg\s+Superman\b/i.test(originalCleanTitle)) {
    return "Cyborg Superman";
  }

  if (/^Bugs\s+Bunny\s+En\s+Superman\b/i.test(originalCleanTitle)) {
    return "Bugs Bunny as Superman";
  }

  if (/^Bugs\s+As\s+Superman\b/i.test(originalCleanTitle)) {
    return "Bugs Bunny as Superman";
  }

  if (/^Superman\b.*\bFrom\s+Flashpoint\b/i.test(originalCleanTitle)) {
    return "Flashpoint Superman";
  }

  if (/^Lex\s+Luther\s+Superman\b/i.test(originalCleanTitle)) {
    return "Lex Luthor";
  }

  if (
    (!cleaned || /^\d{1,5}$/.test(cleaned) || /^man\s+of\s+steel$/i.test(cleaned)) &&
    /^(?:man\s+of\s+steel|superman\b)/i.test(originalCleanTitle)
  ) {
    return "Superman";
  }
  if (!cleaned) return null;

  return titleCaseLoose(cleaned);
}

function estimateValueFromStores(product: any): number | null {
  const stores = Array.isArray(product?.stores) ? product.stores : [];

  const usdPrices = stores
    .filter((store: any) => String(store?.currency ?? "").toUpperCase() === "USD")
    .map((store: any) => Number(store?.sale_price || store?.price))
    .filter((price: number) => Number.isFinite(price) && price > 0);

  if (usdPrices.length === 0) return null;

  usdPrices.sort((a: number, b: number) => a - b);

  return Number(usdPrices[0].toFixed(2));
}

function scoreParse(parsed: Omit<ParsedFunko, "parse_confidence" | "needs_review" | "warnings">): {
  parse_confidence: number;
  needs_review: boolean;
  warnings: ParseWarning[];
} {
  let score = 0.45;
  const warnings: ParseWarning[] = [];

  if (!parsed.raw_title) warnings.push("missing_title");
  else score += 0.1;

  if (!parsed.franchise) warnings.push("missing_franchise");
  else score += 0.15;

  if (!parsed.character) warnings.push("missing_character");
  else score += 0.15;

  if (!parsed.number) warnings.push("missing_number");
  else score += 0.1;

  if (!parsed.estimated_value) warnings.push("estimated_value_missing");
  else score += 0.05;

  if (parsed.pop_name && parsed.raw_title && parsed.pop_name.length >= parsed.raw_title.length - 3) {
    warnings.push("weak_name_cleanup");
    score -= 0.1;
  }

  score = Math.max(0, Math.min(1, Number(score.toFixed(2))));

  return {
    parse_confidence: score,
    needs_review: score < 0.7,
    warnings,
  };
}

function parseFunkoProduct(product: any): ParsedFunko {
  const rawTitle = normalizeWhitespace(product?.title ?? "");
  const cleanTitle = stripUniversalNoise(rawTitle);

  const number = extractNumber(`${cleanTitle} ${product?.description ?? ""}`);
  const variant = extractVariant(product, cleanTitle);
  const popStyle = extractPopStyle(product, cleanTitle);
  const setName = extractSetName(product, cleanTitle);
  const exclusivity = extractExclusivity(product);
  const vaultStatus = extractVaultStatus(product, cleanTitle);
  const limitedEdition = extractLimitedEdition(product, cleanTitle);
  const franchise = guessFranchise(product, cleanTitle);
  const character = cleanupCharacterName(cleanTitle, franchise, number, popStyle, exclusivity, setName);
  const estimatedValue = estimateValueFromStores(product);
  const description = cleanDescription(product?.description);

  const partial: Omit<ParsedFunko, "parse_confidence" | "needs_review" | "warnings"> = {
    raw_title: rawTitle || null,
    clean_title: cleanTitle || null,
    pop_name: character || cleanTitle || null,
    character,
    franchise,
    number,
    variant,
    exclusivity,
    pop_type: "Pop",
    pop_style: popStyle,
    set_name: setName,
    vault_status: vaultStatus,
    limited_edition: limitedEdition.limited_edition,
    limited_count: limitedEdition.limited_count,
    edition_notes: limitedEdition.edition_notes,
    description,
    display_description: null,
    estimated_value: estimatedValue,
  };

  partial.display_description = buildDisplayDescription(partial);

  const score = scoreParse(partial);

  return {
    ...partial,
    ...score,
  };
}

function applyCatalogOverride(parsed: ParsedFunko, barcode: string): ParsedFunko {
  const override = CATALOG_OVERRIDES_BY_UPC[barcode];

  if (!override) return parsed;

  const next: ParsedFunko = {
    ...parsed,
    ...override,
    warnings: override.warnings ?? parsed.warnings,
    parse_confidence: Math.max(parsed.parse_confidence, override.parse_confidence ?? 0),
    needs_review: override.needs_review ?? parsed.needs_review,
  };

  next.display_description = override.display_description ?? buildDisplayDescription(next);

  return next;
}

function shouldUpdate(existing: any, parsed: ParsedFunko): Record<string, unknown> {
  const updates: Record<string, unknown> = {};

  if ((!existing.raw_title || existing.raw_title === "") && parsed.raw_title) {
    updates.raw_title = parsed.raw_title;
  }

  if ((!existing.clean_title || existing.clean_title === "") && parsed.clean_title) {
    updates.clean_title = parsed.clean_title;
  }

  if ((!existing.character || existing.character === existing.pop_name) && parsed.character) {
    updates.character = parsed.character;
  }

  if ((!existing.number || existing.number === "") && parsed.number) {
    updates.number = parsed.number;
  }

  if ((!existing.variant || existing.variant === "") && parsed.variant) {
    updates.variant = parsed.variant;
  }

  if ((!existing.number || existing.number === "") && parsed.number) {
    updates.number = parsed.number;
  }

  if (
    parsed.set_name &&
    (
      !existing.set_name ||
      existing.set_name === "" ||
      descriptionMismatchesProduct(existing.display_description, parsed)
    )
  ) {
    updates.set_name = parsed.set_name;
  }

  if (
    parsed.pop_style &&
    (
      !existing.pop_style ||
      existing.pop_style === "" ||
      (existing.pop_style === "Standard" && parsed.pop_style !== "Standard")
    )
  ) {
    updates.pop_style = parsed.pop_style;
  }

  if ((!existing.exclusivity || existing.exclusivity === "") && parsed.exclusivity) {
    updates.exclusivity = parsed.exclusivity;
  }

  if ((!existing.vault_status || existing.vault_status === "") && parsed.vault_status) {
    updates.vault_status = parsed.vault_status;
  }

  if (parsed.limited_edition && existing.limited_edition !== true) {
    updates.limited_edition = true;
  }

  if (parsed.limited_count != null && existing.limited_count == null) {
    updates.limited_count = parsed.limited_count;
  }

  if ((!existing.edition_notes || existing.edition_notes === "") && parsed.edition_notes) {
    updates.edition_notes = parsed.edition_notes;
  }

  if (
    parsed.description &&
    (
      !existing.description ||
      existing.description === "" ||
      String(existing.description).match(/^no description found\.?$/i)
    )
  ) {
    updates.description = parsed.description;
  }

  if (
    parsed.display_description &&
    (
      isWeakDisplayDescription(existing.display_description) ||
      descriptionMismatchesProduct(existing.display_description, parsed)
    )
  ) {
    updates.display_description = parsed.display_description;
  }

  const badFranchises = [
    "IEWAREHOUSE",
    "Generic",
    "Unknown",
    "",
    "Funko",
    "Funko LLC",
    "Funko, LLC",
    "Funko Pop",
    "Pop! Vinyl",
    "POP",
    "Alliance Entertainment",
    "DreamBone",
    "Grappiq",
  ];

  if (
    parsed.franchise &&
    (
      !existing.franchise ||
      badFranchises.includes(String(existing.franchise)) ||
      descriptionMismatchesProduct(existing.display_description, parsed)
    )
  ) {
    updates.franchise = parsed.franchise;
  }

if (
  parsed.pop_name &&
  existing.pop_name &&
  (
    String(existing.pop_name).length > parsed.pop_name.length + 10 ||
    String(existing.pop_name).match(/\bVinyl\b/i) ||
    String(existing.pop_name).match(/\bBobble\s*Head\b/i) ||
    String(existing.pop_name).match(/\bBobblehead\b/i) ||
    String(existing.pop_name).match(/\bFunko Pop\b/i) ||
    String(existing.pop_name).match(/\bMovies?\b/i) ||
    String(existing.pop_name).match(/\bGames?\b/i) ||
    String(existing.pop_name).match(/^[!¡]/) ||
    String(existing.pop_name).match(/^Sayings\s*[-–—]/i) ||
    String(existing.pop_name).match(/\bNot Mint\b/i) ||
    String(existing.pop_name).match(/\bGifts\b/i) ||
    String(existing.pop_name).match(/\bGlow\b/i) ||
    String(existing.pop_name).match(/\bWith\b$/i) ||
    String(existing.pop_name).match(/^['’`s\s:]+/i) ||
    String(existing.pop_name).match(/\bFantastic\s+Four\b/i) ||
    String(existing.pop_name).match(/\bChance\s+of\s+Chase\b/i)
  )
) {
  updates.pop_name = parsed.pop_name;
}

  if ((existing.estimated_value == null || Number(existing.estimated_value) === 0) && parsed.estimated_value != null) {
    updates.estimated_value = parsed.estimated_value;
  }

  if (existing.parse_confidence == null || Number(existing.parse_confidence) < parsed.parse_confidence) {
    updates.parse_confidence = parsed.parse_confidence;
  }

  if (existing.needs_review == null || existing.needs_review === true) {
    updates.needs_review = parsed.needs_review;
  }

  if (Object.keys(updates).length > 0) {
    updates.api_last_updated = new Date().toISOString();
  }

  return updates;
}

function getImageExtension(contentType: string | null, imageUrl: string): string {
  const lowerUrl = imageUrl.toLowerCase();

  if (contentType?.includes("png") || lowerUrl.endsWith(".png")) return "png";
  if (contentType?.includes("webp") || lowerUrl.endsWith(".webp")) return "webp";
  if (contentType?.includes("gif") || lowerUrl.endsWith(".gif")) return "gif";

  return "jpg";
}

async function uploadImageToStorage(
  supabase: any,
  imageUrl: string | null,
  upc: string,
): Promise<string | null> {
  if (!imageUrl) return null;

  try {
    // Already stored in Supabase Storage.
    if (imageUrl.includes("/storage/v1/object/public/")) {
      return imageUrl;
    }

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      console.warn(`Image fetch failed for ${imageUrl}: ${imageResponse.status}`);
      return imageUrl;
    }

    const contentType = imageResponse.headers.get("content-type");
    const extension = getImageExtension(contentType, imageUrl);
    const imageBytes = await imageResponse.arrayBuffer();

    const filePath = `${upc}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(filePath, imageBytes, {
        contentType: contentType ?? `image/${extension}`,
        upsert: true,
      });

    if (uploadError) {
      console.warn(`Image upload failed for ${upc}:`, uploadError.message);
      return imageUrl;
    }

    const { data } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(filePath);

    return data?.publicUrl ?? imageUrl;
  } catch (error) {
    console.warn(`Image processing failed for ${upc}:`, error);
    return imageUrl;
  }
}


type ExternalProductLookup = {
  source: "go-upc" | "barcodelookup" | "pricecharting";
  raw: any;
  product: any;
};

type PriceChartingValueLookup = {
  source: "pricecharting";
  estimated_value: number;
  price_field: string;
  raw: any;
};

function normalizeGoUpcCategory(category: any): string {
  if (!category) return "";
  if (typeof category === "string") return category;
  if (Array.isArray(category)) {
    return category
      .map((item) => typeof item === "string" ? item : (item?.name ?? item?.title ?? ""))
      .filter(Boolean)
      .join(" > ");
  }
  return category?.name ?? category?.title ?? JSON.stringify(category);
}

function normalizeGoUpcImage(product: any): string | null {
  const imageCandidates = [
    product?.imageUrl,
    product?.image_url,
    product?.["image-url"],
    product?.image,
    Array.isArray(product?.images) ? product.images?.[0] : null,
  ];

  const found = imageCandidates.find((value) => typeof value === "string" && value.trim());
  return found ? String(found).trim() : null;
}

function firstProductImage(product: any): string | null {
  const imageCandidates = [
    product?.imageUrl,
    product?.image_url,
    product?.["image-url"],
    product?.image,
    product?.thumbnail,
    Array.isArray(product?.images) ? product.images?.[0] : null,
  ];

  const found = imageCandidates.find((value) => typeof value === "string" && value.trim());
  return found ? String(found).trim() : null;
}

async function fetchGoUpcProduct(apiKey: string, barcode: string): Promise<ExternalProductLookup | null> {
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://go-upc.com/api/v1/code/${encodeURIComponent(barcode)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json",
        },
      },
    );

    if (response.status === 404) return null;

    if (!response.ok) {
      console.warn(`Go-UPC lookup failed for ${barcode}: ${response.status}`);
      return null;
    }

    const raw = await response.json();
    const goProduct = raw?.product;

    if (!goProduct) return null;

    const imageUrl = normalizeGoUpcImage(goProduct);
    const normalizedProduct = {
      title: goProduct?.name ?? goProduct?.title ?? "",
      description: goProduct?.description ?? "",
      brand: goProduct?.brand ?? "",
      manufacturer: goProduct?.brand ?? goProduct?.manufacturer ?? "",
      category: normalizeGoUpcCategory(goProduct?.category),
      images: imageUrl ? [imageUrl] : [],
      stores: [],
      size: goProduct?.size ?? "",
      model: goProduct?.model ?? "",
      mpn: goProduct?.mpn ?? "",
      barcode_number: String(raw?.code ?? goProduct?.upc ?? goProduct?.ean ?? barcode),
      source: "go-upc",
    };

    return {
      source: "go-upc",
      raw: {
        source: "go-upc",
        code: raw?.code ?? barcode,
        product: goProduct,
        products: [normalizedProduct],
      },
      product: normalizedProduct,
    };
  } catch (error) {
    console.warn(`Go-UPC lookup failed for ${barcode}:`, error);
    return null;
  }
}

async function fetchBarcodeLookupProduct(apiKey: string, barcode: string): Promise<ExternalProductLookup | null> {
  if (!apiKey) return null;

  try {
    const apiUrl =
      `https://api.barcodelookup.com/v3/products?barcode=${encodeURIComponent(barcode)}&formatted=y&key=${apiKey}`;

    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      console.warn(`BarcodeLookup failed for ${barcode}: ${apiResponse.status}`);
      return null;
    }

    const raw = await apiResponse.json();
    const product = raw?.products?.[0];

    if (!product) return null;

    return {
      source: "barcodelookup",
      raw,
      product,
    };
  } catch (error) {
    console.warn(`BarcodeLookup failed for ${barcode}:`, error);
    return null;
  }
}

async function fetchPrimaryProduct(
  goUpcApiKey: string,
  barcodeLookupApiKey: string,
  barcode: string,
): Promise<ExternalProductLookup | null> {
  const goUpcResult = await fetchGoUpcProduct(goUpcApiKey, barcode);
  if (goUpcResult) return goUpcResult;

  return await fetchBarcodeLookupProduct(barcodeLookupApiKey, barcode);
}

function centsToDollars(value: unknown): number | null {
  const cents = Number(value);
  if (!Number.isFinite(cents) || cents <= 0) return null;
  return Number((cents / 100).toFixed(2));
}

function pickPriceChartingValue(raw: any): { estimated_value: number; price_field: string } | null {
  for (const field of ["new-price", "cib-price", "loose-price"]) {
    const dollars = centsToDollars(raw?.[field]);
    if (dollars != null) {
      return {
        estimated_value: dollars,
        price_field: field,
      };
    }
  }

  return null;
}

function stripPriceChartingBracketNotes(value: string): string {
  return normalizeWhitespace(value.replace(/\[[^\]]+\]/g, " ").replace(/\([^)]*exclusive[^)]*\)/gi, " "));
}

function stripLeadingCatalogNumber(value: string): string {
  const cleaned = normalizeWhitespace(value);
  if (/^(?:60s|70s|80s|90s)\b/i.test(cleaned)) return cleaned;
  return normalizeWhitespace(cleaned.replace(/^\d{1,5}(?:st|nd|rd|th)?\s+(?=[A-Za-z])/, ""));
}

function inferFranchiseFromKnownText(value: unknown): string | null {
  const text = normalizeMatchText(value);
  if (!text) return null;

  if (/\bsteve aoki\b/.test(text)) return "Music";
  if (/\b(marvel|deadpool|adam warlock|daredevil|doctor strange|spider man|spiderman|captain america|fantastic four|thor|loki|hulk|x men|wolverine)\b/.test(text)) return "Marvel";
  if (/\b(dc|superman|batman|joker|harley quinn|aquaman|black adam|justice league|man of steel|suicide squad|doom patrol|smallville|creature commandos|doctor phosphorus|doctor phosphorous|gotham knights|arrow|titans|deathstroke|nightwing|starfire|beast boy|black canary|robotman|negative man|krypto|black lantern|red hood)\b/.test(text)) return "DC";
  if (/\b(star wars|mandalorian|grogu|obi wan|darth vader|n 1 starfighter|force ghost)\b/.test(text)) return "Star Wars";
  if (/\b(disney|pixar|ducktales|duck tales|oliver company|who framed roger rabbit|roger rabbit|lilo stitch|pinocchio|aladdin|coco|toy story|monsters inc|little mermaid|jungle book|emperor s new groove)\b/.test(text)) return "Disney";
  if (/\b(fantastic beasts|grindelwald|chupacabra|harry potter|wizarding world)\b/.test(text)) return "Wizarding World";
  if (/\b(g i joe|gi joe|cobra commander|snake eyes|storm shadow|zartan|baroness|serpentor|destro)\b/.test(text)) return "G.I. Joe";
  if (/\bstar trek\b/.test(text)) return "Star Trek";
  if (/\bmean girls\b/.test(text)) return "Mean Girls";
  if (/\bclueless\b/.test(text)) return "Clueless";
  if (/\blegally blonde\b/.test(text)) return "Legally Blonde";
  if (/\bedward scissorhands\b/.test(text)) return "Edward Scissorhands";
  if (/\bsupernatural\b/.test(text)) return "Supernatural";
  if (/\bwillow\b/.test(text)) return "Willow";
  if (/\bpet sematary\b/.test(text)) return "Pet Sematary";
  if (/\bsaved by the bell\b/.test(text)) return "Saved by the Bell";
  if (/\bbeavis (and|butt) head\b/.test(text) || /\bbeavis and butt head\b/.test(text)) return "Beavis and Butt-Head";
  if (/\bboyz ii men\b/.test(text)) return "Boyz II Men";
  if (/\bnew kids on the block\b/.test(text)) return "New Kids on the Block";
  if (/\bdolly parton\b/.test(text)) return "Dolly Parton";
  if (/\belvis presley\b/.test(text)) return "Elvis Presley";
  if (/\bpink\b|\bpnk\b/.test(text)) return "Pink";
  if (/\be t\b/.test(text)) return "E.T.";
  if (/\bchilly willy\b/.test(text)) return "Chilly Willy";
  if (/\bcrash bandicoot\b/.test(text)) return "Crash Bandicoot";
  if (/\bdespicable me\b/.test(text)) return "Despicable Me";
  if (/\bforrest gump\b/.test(text)) return "Forrest Gump";
  if (/\bash vs evil dead\b/.test(text)) return "Ash vs. Evil Dead";
  if (/\bannabelle\b/.test(text)) return "Annabelle";
  if (/\bsaturday night live\b|\bdick in a box\b|\bd ck in a box\b/.test(text)) return "Saturday Night Live";
  if (/\bthe witcher\b|\bciri\b/.test(text)) return "The Witcher";
  if (/\bpoltergeist\b|\bcarol anne freeling\b/.test(text)) return "Poltergeist";
  if (/\bexorcist believer\b|\bthe exorcist\b/.test(text)) return "The Exorcist";
  if (/\bgregory house\b|\bhouse md\b/.test(text)) return "House";
  if (/\blouis litt\b|\bsuits\b/.test(text)) return "Suits";
  if (/\bbob ross\b|\bjoy of painting\b/.test(text)) return "Bob Ross";
  if (/\bbrandalised\b|\bbanksy\b/.test(text)) return "Brandalised";
  if (/\b1883\b|\bdutton\b/.test(text)) return "Yellowstone";

  return null;
}

function extractPriceChartingNumber(raw: any): string | null {
  const productName = String(raw?.["product-name"] ?? "");
  const match = productName.match(/#\s?(\d{1,5})\b/) ?? productName.match(/(?:^|\s)(\d{1,5})(?=\s+[A-Za-z])/);
  return match ? match[1] : null;
}

function extractPriceChartingName(raw: any): string | null {
  const productName = String(raw?.["product-name"] ?? "");
  if (!productName) return null;

  if (/peacemaker\s+with\s+peace\s+sign/i.test(productName)) return "Peacemaker with Peace Sign";
  if (/justice\s+league\s+and\s+sonic\s+shadow\s*\/\s*batman/i.test(productName)) return "Shadow/Batman";
  if (/jla\s*&\s*sonic\s*[-:]\s*sonic\s*\/\s*flash/i.test(productName)) return "Sonic/Flash";
  if (/sonic\s+the\s+hedgehog.*amy\s+as\s+wonder\s+woman/i.test(productName)) return "Amy as Wonder Woman";
  if (/knuckles\s+as\s+superman/i.test(productName)) return "Knuckles as Superman";
  if (/tails\s+as\s+cyborg/i.test(productName)) return "Tails as Cyborg";
  if (/harry\s+potter\s+triwizard/i.test(productName)) return "Harry Potter Triwizard";
  if (/^harry\s+potter\s*#\d+\b/i.test(productName)) return "Harry Potter";
  if (/harry\s+potter\s+on\s+broom/i.test(productName)) return "Harry Potter on Broom";
  if (/harry\s+potter\s+with\s+hourglass/i.test(productName)) return "Harry Potter with Hourglass";
  if (/undesirable\s+(?:no\.?\s*)?1\s+harry\s+potter/i.test(productName)) return "Harry Potter Undesirable No. 1";
  if (/gingerbread\s+superman/i.test(productName)) return "Gingerbread Superman";

  const cleaned = stripLeadingCatalogNumber(stripPriceChartingBracketNotes(productName)
    .replace(/#\s?\d{1,5}\b/g, " ")
    .replace(/\bFunko\b/gi, " ")
    .replace(/\bPOP!?\b/gi, " ")
    .replace(/\bEE\s+Glows?\s+Dark\b/gi, " ")
    .replace(/\bGlitter\s+Version\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim());

  if (/wonder\s+woman\s+black\s+lantern/i.test(productName)) return "Wonder Woman Black Lantern";
  if (/wonder\s+woman\s+docteur\s+mary/i.test(productName)) return "Wonder Woman";
  if (/mr\.?\s+freeze\s+glitter\s+version/i.test(productName)) return "Mr. Freeze";
  if (/cyborg\s+silhouette/i.test(productName)) return "Cyborg Silhouette";
  if (/doctor\s+phosphorous/i.test(cleaned)) return "Doctor Phosphorus";
  if (/^redhood$/i.test(cleaned)) return "Red Hood";

  return cleaned ? titleCaseLoose(cleaned) : null;
}

function extractPriceChartingVariant(raw: any): string | null {
  const productName = String(raw?.["product-name"] ?? "");
  const bracket = productName.match(/\[([^\]]+)\]/);
  const haystack = `${productName} ${raw?.["genre"] ?? ""}`.toLowerCase();
  const bracketValue = bracket ? bracket[1].trim().toLowerCase() : "";

  if (bracketValue === "gitd" || haystack.includes("glow in the dark") || haystack.includes("gitd")) return "Glow in the Dark";
  if (bracketValue === "diy" || haystack.includes(" diy")) return "DIY";
  if (bracketValue === "wood" || haystack.includes(" wood")) return "Wood Deco";
  if (bracketValue === "metallic" || haystack.includes("metallic")) return "Metallic";
  if (bracketValue === "flocked" || haystack.includes("flocked")) return "Flocked";
  if (bracketValue === "glitter" || haystack.includes("glitter version") || haystack.includes(" glitter")) return "Glitter";
  if (bracketValue === "chase" || /\bchase\b/i.test(productName)) return "Chase";
  if (bracketValue === "convention" || haystack.includes("convention")) return "Convention";
  if (haystack.includes("bloody")) return "Bloody";

  return bracket ? titleCaseLoose(bracket[1]) : null;
}

function normalizePriceChartingSet(value: unknown): string | null {
  const raw = normalizeWhitespace(String(value ?? ""));
  if (!raw) return null;
  const rawMatch = normalizeMatchText(raw);

  if (/\bsteve aoki\b/.test(rawMatch)) return "Steve Aoki";
  if (/\b(peacemaker|wondercon peacemaker)\b/.test(rawMatch)) return "Peacemaker";
  if (/\b(justice league x sonic|jla sonic|dc sonic)\b/.test(rawMatch)) return "Justice League x Sonic";

  let cleaned = raw
    .replace(/^Pop!?\s+(Television|Movies|Marvel|Heroes|Animation|Ad Icons|Asia)\s*,?\s*/i, " ")
    .replace(/^(Fall|Spring|Summer|Winter)\s+Convention\.?\s*/i, " ")
    .replace(/^Entertainment\s+Earth\.?\s*/i, " ")
    .replace(/^EE\s+/i, " ")
    .replace(/\s*[.,]\s*(Australia|Canada|Funko|Flocked|GITD|Glow in the Dark|SDCC|NYCC|Convention|Summer Convention Exclusive|Fall Convention Exclusive)\b.*$/i, " ")
    .replace(/\s*[.,]\s*(Limited Edition|Summer Virtual FunKon|Glitter Version|Glows Dark|Glow in the Dark)\b.*$/i, " ")
    .replace(/\b(FYE|Hot Topic|Target|Walmart|Walgreens|GameStop|BoxLunch|Amazon|Funko Shop|Specialty Series)\s*(Exclusive)?\.?\s*/gi, " ")
    .replace(/\bExclusive\b/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/[\s,.]+$/, "")
    .trim();

  if (!cleaned) return null;
  if (/five night'?s at freddy'?s/i.test(cleaned)) return "Five Nights at Freddy's";
  return titleCaseLoose(cleaned.replace(/&/g, "and"));
}

function extractPriceChartingFranchise(raw: any, currentFranchise: string | null): string | null {
  const consoleName = normalizeMatchText(raw?.["console-name"]);
  const genre = normalizeMatchText(raw?.["genre"]);
  const productName = normalizeMatchText(raw?.["product-name"]);
  const combined = `${consoleName} ${genre} ${productName}`;

  const inferred = inferFranchiseFromKnownText(combined);
  if (inferred) return inferred;

  if (combined.includes("marvel")) return "Marvel";
  if (combined.includes("dc") || combined.includes("heroes") || combined.includes("superman") || combined.includes("batman")) return "DC";
  if (combined.includes("star wars") || combined.includes("mandalorian")) return "Star Wars";
  if (combined.includes("disney") || combined.includes("pixar")) return "Disney";
  if (combined.includes("jurassic")) return "Jurassic Park";
  if (combined.includes("simpsons")) return "The Simpsons";
  if (combined.includes("ghostbusters")) return "Ghostbusters";
  if (combined.includes("futurama")) return "Futurama";
  if (combined.includes("preacher")) return "Preacher";
  if (combined.includes("fallout")) return "Fallout";
  if (combined.includes("coca cola")) return "Coca-Cola";

  return currentFranchise;
}

function isWeakCatalogName(value: string | null): boolean {
  if (!value) return true;
  const lower = value.toLowerCase();
  return (
    lower === "unknown pop" ||
    lower === "barcode" ||
    lower.includes("vinyl") ||
    lower.includes("figurine") ||
    lower.includes("guardians of the galaxy vol. 2") ||
    lower.length > 44
  );
}

function applyPriceChartingCatalogInfo(parsed: ParsedFunko, raw: any): void {
  const pcName = extractPriceChartingName(raw);
  const pcNumber = extractPriceChartingNumber(raw);
  const pcVariant = extractPriceChartingVariant(raw);
  const pcSet = normalizePriceChartingSet(raw?.["genre"]);
  const pcFranchise = extractPriceChartingFranchise(raw, parsed.franchise);

  if (pcName && (isWeakCatalogName(parsed.pop_name) || pcName.length + 10 < String(parsed.pop_name ?? "").length)) {
    parsed.pop_name = pcName;
    parsed.character = pcName;
  }

  if (pcNumber && (!parsed.number || parsed.number.length > 5)) {
    parsed.number = pcNumber;
  }

  if (
    pcNumber &&
    parsed.number &&
    parsed.number !== pcNumber &&
    (/^(19|20)\d{2}$/.test(parsed.number) || parsed.number === String(raw?.["release-date"] ?? "").slice(0, 4))
  ) {
    parsed.number = pcNumber;
  }

  if (pcVariant && (!parsed.variant || parsed.variant === "Common")) {
    parsed.variant = pcVariant;
  }

  if (pcSet && (!parsed.set_name || parsed.set_name === parsed.franchise)) {
    parsed.set_name = pcSet;
  }

  if (pcFranchise && (!parsed.franchise || parsed.franchise === parsed.set_name || parsed.franchise === "One Piece")) {
    parsed.franchise = pcFranchise;
  }

  parsed.display_description = buildDisplayDescription(parsed);
  parsed.parse_confidence = Math.min(0.98, Math.max(parsed.parse_confidence, 0.82));
  parsed.needs_review = parsed.parse_confidence < 0.75;
  parsed.warnings = parsed.warnings.filter((warning) => {
    if (warning === "missing_number" && parsed.number) return false;
    if (warning === "missing_franchise" && parsed.franchise) return false;
    if (warning === "missing_character" && parsed.character) return false;
    if (warning === "weak_name_cleanup" && parsed.pop_name) return false;
    return true;
  });
}

function normalizeMatchText(value: unknown): string {
  return normalizeWhitespace(String(value ?? ""))
    .toLowerCase()
    .replace(/[^a-z0-9#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function meaningfulMatchTokens(value: unknown): string[] {
  const ignored = new Set([
    "and",
    "bobble",
    "common",
    "dark",
    "deluxe",
    "edition",
    "exclusive",
    "figure",
    "flocked",
    "funko",
    "gitd",
    "glow",
    "head",
    "limited",
    "metallic",
    "multicolor",
    "pop",
    "the",
    "vinyl",
    "with",
  ]);

  return normalizeMatchText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !ignored.has(token));
}

function hasMeaningfulOverlap(source: string, target: string): boolean {
  const targetTokens = meaningfulMatchTokens(target);
  if (targetTokens.length === 0) return true;

  const sourceTokens = new Set(meaningfulMatchTokens(source));
  const hits = targetTokens.filter((token) => sourceTokens.has(token)).length;
  return hits >= Math.min(2, targetTokens.length);
}

function hasExactNumberMatch(source: string, number: string): boolean {
  const cleanNumber = normalizeMatchText(number).replace(/^#/, "");
  if (!cleanNumber) return true;

  const tokens = normalizeMatchText(source)
    .split(" ")
    .map((token) => token.replace(/^#/, ""))
    .filter(Boolean);

  return tokens.includes(cleanNumber);
}

function isLikelyPriceChartingMatch(raw: any, parsed: ParsedFunko): boolean {
  const productName = normalizeMatchText(raw?.["product-name"]);
  const consoleName = normalizeMatchText(raw?.["console-name"]);
  const genre = normalizeMatchText(raw?.["genre"]);
  const combined = `${productName} ${consoleName} ${genre}`;
  const character = normalizeMatchText(parsed.character ?? parsed.pop_name);
  const franchise = normalizeMatchText(parsed.franchise);
  const setName = normalizeMatchText(parsed.set_name);
  const number = normalizeMatchText(parsed.number);

  if (!productName) return false;
  if (character && !hasMeaningfulOverlap(combined, character)) return false;
  if (franchise && setName && !combined.includes(franchise) && !combined.includes(setName)) return false;
  if (number && !hasExactNumberMatch(combined, number)) return false;

  return true;
}

async function fetchPriceChartingValue(
  token: string,
  barcode: string,
  parsed: ParsedFunko,
): Promise<PriceChartingValueLookup | null> {
  if (!token) return null;

  const requests: Array<{ url: string; requiresMatch: boolean }> = [
    {
      url: `https://www.pricecharting.com/api/product?t=${encodeURIComponent(token)}&upc=${encodeURIComponent(barcode)}`,
      requiresMatch: true,
    },
  ];

  const queryParts = [
    parsed.pop_name,
    parsed.franchise,
    parsed.number ? `#${parsed.number}` : null,
    parsed.variant && parsed.variant !== "Common" ? parsed.variant : null,
    "Funko Pop",
  ].filter(Boolean);

  if (queryParts.length > 1) {
    requests.push({
      url: `https://www.pricecharting.com/api/product?t=${encodeURIComponent(token)}&q=${encodeURIComponent(queryParts.join(" "))}`,
      requiresMatch: true,
    });
  }

  for (const request of requests) {
    try {
      const response = await fetch(request.url);

      if (!response.ok) {
        console.warn(`PriceCharting lookup failed for ${barcode}: ${response.status}`);
        continue;
      }

      const raw = await response.json();

      if (raw?.status !== "success") continue;
      if (request.requiresMatch && !isLikelyPriceChartingMatch(raw, parsed)) continue;

      const picked = pickPriceChartingValue(raw);
      if (!picked) continue;

      return {
        source: "pricecharting",
        estimated_value: picked.estimated_value,
        price_field: picked.price_field,
        raw,
      };
    } catch (error) {
      console.warn(`PriceCharting lookup failed for ${barcode}:`, error);
    }
  }

  return null;
}

function priceChartingRawToProductLookup(
  raw: any,
  barcode: string,
): ExternalProductLookup | null {
  const productName = normalizeWhitespace(String(raw?.["product-name"] ?? ""));
  if (!productName) return null;

  const picked = pickPriceChartingValue(raw);
  const imageUrl = firstProductImage(raw);

  const product = {
    title: productName,
    description: "",
    brand: "Funko",
    manufacturer: "Funko",
    category: normalizeWhitespace(String(raw?.genre ?? raw?.["console-name"] ?? "Collectibles")),
    images: imageUrl ? [imageUrl] : [],
    stores: picked
      ? [{
        name: "PriceCharting",
        price: String(picked.estimated_value),
        sale_price: "",
        currency: "USD",
        condition: "estimated",
      }]
      : [],
    size: "",
    model: raw?.["console-name"] ?? "",
    mpn: raw?.id ?? "",
    barcode_number: barcode,
    source: "pricecharting",
  };

  return {
    source: "pricecharting",
    raw: {
      source: "pricecharting",
      code: barcode,
      product,
      products: [product],
      pricecharting: {
        price_field: picked?.price_field ?? null,
        response: raw,
      },
    },
    product,
  };
}

async function fetchPriceChartingProduct(
  token: string,
  barcode: string,
): Promise<ExternalProductLookup | null> {
  if (!token) return null;

  try {
    const response = await fetch(
      `https://www.pricecharting.com/api/product?t=${encodeURIComponent(token)}&upc=${encodeURIComponent(barcode)}`,
    );

    if (!response.ok) {
      console.warn(`PriceCharting product fallback failed for ${barcode}: ${response.status}`);
      return null;
    }

    const raw = await response.json();
    if (raw?.status !== "success") return null;

    return priceChartingRawToProductLookup(raw, barcode);
  } catch (error) {
    console.warn(`PriceCharting product fallback failed for ${barcode}:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { barcode, forceRefresh = false } = await req.json();

    if (!barcode) {
      return new Response(
        JSON.stringify({ found: false, error: "Missing barcode" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanBarcode = String(barcode).trim();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const goUpcApiKey = Deno.env.get("GO_UPC_API_KEY") ?? "";
    const barcodeLookupApiKey = Deno.env.get("BARCODE_LOOKUP_API_KEY") ?? "";
    const priceChartingToken = Deno.env.get("PRICECHARTING_API_TOKEN") ?? "";

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: existing, error: existingError } = await supabase
      .from("pop_catalog")
      .select("*")
      .eq("upc", cleanBarcode)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing && !forceRefresh) {
      const rawProduct = existing?.raw_api_json?.products?.[0];

      if (rawProduct) {
        const parsed = applyCatalogOverride(parseFunkoProduct(rawProduct), cleanBarcode);
        const updates = shouldUpdate(existing, parsed);

        const rawImages = rawProduct.images ?? [];
        let remoteImageUrl = rawImages.length > 0 ? rawImages[0] : existing.image_url;

        if (!remoteImageUrl) {
          const imageFallback = await fetchPrimaryProduct(
            goUpcApiKey,
            barcodeLookupApiKey,
            cleanBarcode,
          );
          remoteImageUrl = firstProductImage(imageFallback?.product);
        }

        if (remoteImageUrl) {
          const storedImageUrl = await uploadImageToStorage(
            supabase,
            remoteImageUrl,
            cleanBarcode,
          );

          if (storedImageUrl && storedImageUrl !== existing.image_url) {
            updates.image_url = storedImageUrl;
          }
        }

        if (!String(existing.api_source ?? "").includes("pricecharting")) {
  const priceChartingValue = await fetchPriceChartingValue(
  priceChartingToken,
  cleanBarcode,
  parsed,
);

          if (priceChartingValue) {
            applyPriceChartingCatalogInfo(parsed, priceChartingValue.raw);
            Object.assign(updates, shouldUpdate(existing, parsed));
            updates.estimated_value = priceChartingValue.estimated_value;
            updates.api_source = `${existing.api_source ?? "catalog"}+pricecharting`;
            updates.api_last_updated = new Date().toISOString();
            updates.raw_api_json = {
              primary: existing.raw_api_json,
              pricecharting: {
                price_field: priceChartingValue.price_field,
                response: priceChartingValue.raw,
              },
            };
          }
        }

        if (Object.keys(updates).length > 0) {
          const { data: updated, error: updateError } = await supabase
            .from("pop_catalog")
            .update(updates)
            .eq("id", existing.id)
            .select("*")
            .single();

          if (updateError) throw updateError;

          return new Response(
            JSON.stringify({
              found: true,
              source: "catalog_updated",
              pop: updated,
              parse: {
                confidence: parsed.parse_confidence,
                needs_review: parsed.needs_review,
                warnings: parsed.warnings,
                updates,
              },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({
          found: true,
          source: "catalog",
          pop: existing,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let fetched = await fetchPriceChartingProduct(
      priceChartingToken,
      cleanBarcode,
    );

    if (!fetched?.product) {
      fetched = await fetchPrimaryProduct(
        goUpcApiKey,
        barcodeLookupApiKey,
        cleanBarcode,
      );
    }

    if (!fetched?.product) {
      return new Response(
        JSON.stringify({
          found: false,
          source: "external_lookup",
          message: "No product found from PriceCharting, Go-UPC, or BarcodeLookup",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { raw, product, source: apiSource } = fetched;
    let imageLookup: ExternalProductLookup | null = fetched;
    let remoteImageUrl = firstProductImage(product);

    if (!remoteImageUrl && apiSource === "pricecharting") {
      imageLookup = await fetchPrimaryProduct(
        goUpcApiKey,
        barcodeLookupApiKey,
        cleanBarcode,
      );
      remoteImageUrl = firstProductImage(imageLookup?.product);
    }

    const storedImageUrl = await uploadImageToStorage(
      supabase,
      remoteImageUrl,
      cleanBarcode,
    );

    const parsed = applyCatalogOverride(parseFunkoProduct(product), cleanBarcode);

let valueSource = fetched.source;
let valueRaw = imageLookup && imageLookup.source !== fetched.source
  ? {
    primary: fetched.raw,
    image_fallback: imageLookup.raw,
  }
  : fetched.raw;

if (parsed.estimated_value == null && barcodeLookupApiKey) {
  const fallbackFetched = await fetchBarcodeLookupProduct(
    barcodeLookupApiKey,
    cleanBarcode,
  );

  if (fallbackFetched?.product) {
    const fallbackParsed = applyCatalogOverride(
      parseFunkoProduct(fallbackFetched.product),
      cleanBarcode,
    );

    if (fallbackParsed.estimated_value != null) {
      parsed.estimated_value = fallbackParsed.estimated_value;
      valueSource = "go-upc+barcodelookup_value";
      valueRaw = {
        primary: fetched.raw,
        value_fallback: fallbackFetched.raw,
      };
    }
  }
}

const priceChartingValue = await fetchPriceChartingValue(
  priceChartingToken,
  cleanBarcode,
  parsed,
);

if (priceChartingValue) {
  applyPriceChartingCatalogInfo(parsed, priceChartingValue.raw);
  parsed.estimated_value = priceChartingValue.estimated_value;
  valueSource = valueSource === "pricecharting"
    ? "pricecharting"
    : valueSource === "go-upc+barcodelookup_value"
    ? "go-upc+barcodelookup_value+pricecharting"
    : `${valueSource}+pricecharting`;
  valueRaw = {
    primary: valueRaw,
    pricecharting: {
      price_field: priceChartingValue.price_field,
      response: priceChartingValue.raw,
    },
  };
}

const newPop = {
  upc: cleanBarcode,
  pop_name: parsed.pop_name,
  character: parsed.character,
  franchise: parsed.franchise,
  number: parsed.number,
  variant: parsed.variant,
  exclusivity: parsed.exclusivity,
  pop_type: parsed.pop_type,
  pop_style: parsed.pop_style,
  set_name: parsed.set_name,
  set_total: null,
  image_url: storedImageUrl ?? firstProductImage(priceChartingValue?.raw) ?? existing?.image_url ?? null,
  vault_status: parsed.vault_status,
  limited_edition: parsed.limited_edition,
  limited_count: parsed.limited_count,
  edition_notes: parsed.edition_notes,
  estimated_value: parsed.estimated_value,
  description: parsed.description ?? existing?.description ?? null,
  display_description: parsed.display_description ?? existing?.display_description ?? null,
  api_source: valueSource,
  api_last_updated: new Date().toISOString(),
  raw_api_json: valueRaw,
  raw_title: parsed.raw_title,
  clean_title: parsed.clean_title,
  parse_confidence: parsed.parse_confidence,
  needs_review: parsed.needs_review,
};

    if (existing) {
      const { data: refreshed, error: refreshError } = await supabase
        .from("pop_catalog")
        .update(newPop)
        .eq("id", existing.id)
        .select("*")
        .single();

      if (refreshError) throw refreshError;

      return new Response(
        JSON.stringify({
          found: true,
          source: "api_refreshed",
          pop: refreshed,
          parse: {
            confidence: parsed.parse_confidence,
            needs_review: parsed.needs_review,
            warnings: parsed.warnings,
            forceRefresh,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("pop_catalog")
      .insert(newPop)
      .select("*")
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        found: true,
        source: "api",
        pop: inserted,
        parse: {
          confidence: parsed.parse_confidence,
          needs_review: parsed.needs_review,
          warnings: parsed.warnings,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        found: false,
        error: String(error?.message ?? error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
