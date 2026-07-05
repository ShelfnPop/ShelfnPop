import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
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
  ["jumbo", "Jumbo"],
  ["super sized", "Jumbo"],
  ["supersized", "Jumbo"],
  ["10-inch", "Jumbo"],
  ["10 inch", "Jumbo"],
  ["10in", "Jumbo"],
  ["18-inch", "Jumbo"],
  ["18 inch", "Jumbo"],
  ["18in", "Jumbo"],

  ["2-pack", "2-Pack"],
  ["2 pack", "2-Pack"],
  ["two pack", "2-Pack"],

  ["3-pack", "3-Pack"],
  ["3 pack", "3-Pack"],
  ["three pack", "3-Pack"],

  ["4-pack", "4-Pack"],
  ["4 pack", "4-Pack"],
  ["four pack", "4-Pack"],

  ["5-pack", "5-Pack"],
  ["5 pack", "5-Pack"],
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

  ["san diego comic-con", "San Diego Comic-Con"],
  ["sdcc", "San Diego Comic-Con"],
  ["new york comic con", "New York Comic Con"],
  ["nycc", "New York Comic Con"],
  ["fall convention", "Fall Convention"],
  ["spring convention", "Spring Convention"],
  ["summer convention", "Summer Convention"],
  ["wondercon", "WonderCon"],

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

  ["zack snyder", "Justice League"],
  ["justice league", "Justice League"],
  ["diana with arrow", "Justice League"],

  ["wayne's world", "Wayne's World"],
  ["wayne s world", "Wayne's World"],
  ["wayne & garth", "Wayne's World"],
  ["wayne and garth", "Wayne's World"],

  ["she-hulk", "Marvel"],
  ["red she-hulk", "Marvel"],
  ["hulk", "Marvel"],
  ["hercules", "Marvel"],
  ["marvel", "Marvel"],
  ["venom", "Marvel"],
  ["ghost rider", "Marvel"],
  ["spider-man", "Marvel"],
  ["spiderman", "Marvel"],
  ["deadpool", "Marvel"],
  ["x-men", "Marvel"],
  ["wolverine", "Marvel"],
  ["moon knight", "Marvel"],
  ["daredevil", "Marvel"],

  ["star wars", "Star Wars"],
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
  ["superman", "DC"],
  ["wonder woman", "DC"],
  ["harley quinn", "DC"],
  ["joker", "DC"],

  ["fantastic beasts", "Wizarding World"],
  ["harry potter", "Wizarding World"],
  ["wizarding world", "Wizarding World"],
  ["zouwu", "Wizarding World"],

  ["the simpsons", "The Simpsons"],
  ["simpsons", "The Simpsons"],
  ["kearney", "The Simpsons"],
  ["zzyzwicz", "The Simpsons"],

  ["pokemon", "Pokémon"],
  ["pokémon", "Pokémon"],
  ["dragon ball", "Dragon Ball"],
  ["naruto", "Naruto"],
  ["one piece", "One Piece"],
  ["wwe", "WWE"],
  ["nba", "NBA"],
  ["nfl", "NFL"],
  ["mlb", "MLB"],
  ["fortnite", "Fortnite"],
  ["stranger things", "Stranger Things"],
  ["doc w/ helmet", "Back to the Future"],
["doc with helmet", "Back to the Future"],
["marty 1955", "Back to the Future"],
["marty in puffy vest", "Back to the Future"],
["emmet brown", "Back to the Future"],
["emmett brown", "Back to the Future"],
["lootcrate", "Back to the Future"],

["tallahassee", "Zombieland"],
["columbus", "Zombieland"],
["wichita", "Zombieland"],
["bill murray", "Zombieland"],

["preacher", "Preacher"],
["arseface", "Preacher"],
["cassidy", "Preacher"],
["jesse custer", "Preacher"],

["futurama", "Futurama"],
["robot devil", "Futurama"],

["toy story", "Toy Story"],
["woody", "Toy Story"],
["buzz lightyear", "Toy Story"],

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
  ];

  if (rejectPatterns.some((pattern) => pattern.test(cleaned))) {
    return null;
  }

  const withoutBoilerplate = cleaned
    .replace(/\s*China Safety Warning:.*$/i, "")
    .replace(/\s*WARNING:.*$/i, "")
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
  ];

  if (cleaned && !genericPatterns.some((pattern) => pattern.test(cleaned))) {
    return cleaned;
  }

  const name = parsed.character || parsed.pop_name;
  if (!name) return null;

  return `${name}${parsed.franchise ? ` is a ${parsed.franchise} Funko Pop` : " is a Funko Pop"}${parsed.number ? ` #${parsed.number}` : ""}${parsed.variant ? ` (${parsed.variant})` : ""}.`;
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
    .replace(/\b\d+(\.\d+)?\s*[- ]?cm\b/gi, " ")
    .replace(/\b\d+(\.\d+)?\s*[- ]?in(ch)?\b/gi, " ");

  const hashMatch = titleForNumber.match(/#\s?(\d{1,5})\b/);
  if (hashMatch) return hashMatch[1];

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

  return findAlias(haystack, VARIANT_ALIASES);
}

function extractPopStyle(product: any, cleanTitle: string): string {
  const haystack = `${product?.title ?? ""} ${cleanTitle} ${product?.size ?? ""}`;
  return findAlias(haystack, POP_STYLE_ALIASES) ?? "Standard";
}

function extractVaultStatus(product: any, cleanTitle: string): string | null {
  const haystack = `${product?.title ?? ""} ${cleanTitle}`;
  if (/\bvaulted\b/i.test(haystack)) return "Vaulted";
  return null;
}

function extractLimitedEdition(product: any, cleanTitle: string): {
  limited_edition: boolean;
  limited_count: number | null;
  edition_notes: string | null;
} {
  const haystack = normalizeWhitespace(
    `${product?.title ?? ""} ${cleanTitle} ${product?.description ?? ""}`,
  );

  const countMatch =
    haystack.match(/\b(?:LE|Limited(?: Edition)?(?: to)?)\s*[:#-]?\s*(\d{2,6})\s*(?:pcs|pieces|pc)?\b/i) ??
    haystack.match(/\b(\d{2,6})\s*(?:pcs|pieces|pc)\b/i);
  const limited =
    /\blimited(?: edition| run| production)?\b/i.test(haystack) ||
    /\bLE\s*[:#-]?\s*\d{2,6}\b/i.test(haystack) ||
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

  if (haystack.includes("daredevil") && haystack.includes("born again")) return "Daredevil: Born Again";
  if (haystack.includes("superman")) return "Superman";
  if (haystack.includes("thunderbolts")) return "Thunderbolts";
  if (haystack.includes("thor ragnarok")) return "Thor: Ragnarok";
  if (haystack.includes("thor love and thunder") || haystack.includes("thor love & thunder")) return "Thor: Love and Thunder";
  if (haystack.includes("captain america the first avenger")) return "Captain America: The First Avenger";
  if (haystack.includes("rick") && haystack.includes("morty")) return "Rick and Morty";
  if (haystack.includes("stranger things")) return "Stranger Things";
  if (haystack.includes("five nights at freddy")) return "Five Nights at Freddy's";
  if (haystack.includes("security breach")) return "Five Nights at Freddy's: Security Breach";
  if (haystack.includes("help wanted 2")) return "Five Nights at Freddy's: Help Wanted 2";
  if (haystack.includes("avengers age of ultron")) return "Avengers: Age of Ultron";
  if (haystack.includes("avengers endgame")) return "Avengers: Endgame";
  if (haystack.includes("black widow")) return "Black Widow";
  if (haystack.includes("fantastic four")) return "Fantastic Four";
  if (haystack.includes("guardians of the galaxy vol. 2") || haystack.includes("guardians of the galaxy vol 2")) return "Guardians of the Galaxy Vol. 2";
  if (haystack.includes("guardians of the galaxy vol. 3") || haystack.includes("guardians of the galaxy vol 3")) return "Guardians of the Galaxy Vol. 3";
  if (haystack.includes("guardians of the galaxy")) return "Guardians of the Galaxy";
  if (haystack.includes("big bang theory")) return "The Big Bang Theory";
  if (haystack.includes("batman returns")) return "Batman Returns";
  if (haystack.includes("harry potter")) return "Harry Potter";
  if (haystack.includes("walking dead")) return "The Walking Dead";
  if (haystack.includes("blue beetle")) return "Blue Beetle";
  if (haystack.includes("free guy")) return "Free Guy";
  if (haystack.includes("nightmare before christmas")) return "The Nightmare Before Christmas";
  if (haystack.includes("mech strike")) return "Mech Strike";
  if (haystack.includes("wandavision")) return "WandaVision";

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
    "Bobblehead",
    "Vinyl Bobble Head",

    "Marvel",
    "DC",
    "Star Wars",
    "Justice League",
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
    "Thor Love And Thunder",
    "Thor Love & Thunder",
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
    "Avengers Age Of Ultron",
    "Avengers Endgame",
    "Guardians Of The Galaxy",
    "Mech Strike",
    "Monster Hunters",
    "Wandavision",
    "Spring Convention",
    "Summer Convention",
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
): string | null {
  let cleaned = stripUniversalNoise(rawTitle);

  cleaned = removeKnownNoiseFromCharacter(cleaned, franchise, number, popStyle, exclusivity);

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

  cleaned = cleaned.replace(/^Batman\s*:\s*/i, "");

  cleaned = cleaned
    .replace(/^Superman\s+Krypto\b/i, "Krypto")
    .replace(/^Daredevil\s+Daredevil\s*:\s*Born Again\b/i, "Daredevil")
    .replace(/^Daredevil\s*:\s*Born Again\s*[-â€“â€”]\s*/i, "")
    .replace(/^Daredevil\s+Born Again\s+/i, "")
    .replace(/^Moon Knight\s+/i, "")
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
    .replace(/\bNot Mint\b/gi, "")
    .replace(/\bFunko Gifts\b/gi, "")
    .replace(/\bGifts\b/gi, "")
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
  .replace(/^Of\s+/i, "")
  .replace(/\bUS\s*$/i, "")
  .replace(/\bRS\s*$/i, "")
  .replace(/\bOE\s*$/i, "")
  .replace(/\b\d+\s*cm\b/gi, "")
  .replace(/\bVinyl\b/gi, "")
  .replace(/\bFigurine\b/gi, "")
  .replace(/\bLE\s+\d+\s+PCS\b/gi, "")
  .replace(/\b\d+\s+PCS\b/gi, "")
  .replace(/\s+\d+\s+\d{3,5}\s*$/i, "")
  .replace(/\s+\d{3,5}\s*$/i, "")
  .replace(/\s+/g, " ")
  .trim();

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
  const character = cleanupCharacterName(cleanTitle, franchise, number, popStyle, exclusivity);
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

  if ((!existing.set_name || existing.set_name === "") && parsed.set_name) {
    updates.set_name = parsed.set_name;
  }

  if ((!existing.pop_style || existing.pop_style === "") && parsed.pop_style) {
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
      !existing.display_description ||
      existing.display_description === "" ||
      String(existing.display_description).match(/^no description found\.?$/i)
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

  if ((!existing.franchise || badFranchises.includes(String(existing.franchise))) && parsed.franchise) {
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
  source: "go-upc" | "barcodelookup";
  raw: any;
  product: any;
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
    product?.image,
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

serve(async (req) => {
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
        const parsed = parseFunkoProduct(rawProduct);
        const updates = shouldUpdate(existing, parsed);

        const rawImages = rawProduct.images ?? [];
        const remoteImageUrl = rawImages.length > 0 ? rawImages[0] : existing.image_url;

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

    const fetched = await fetchPrimaryProduct(
      goUpcApiKey,
      barcodeLookupApiKey,
      cleanBarcode,
    );

    if (!fetched?.product) {
      return new Response(
        JSON.stringify({
          found: false,
          source: "external_lookup",
          message: "No product found from Go-UPC or BarcodeLookup",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { raw, product, source: apiSource } = fetched;
    const images = product.images ?? [];
    const remoteImageUrl = images.length > 0 ? images[0] : null;
    const storedImageUrl = await uploadImageToStorage(
      supabase,
      remoteImageUrl,
      cleanBarcode,
    );

    const parsed = parseFunkoProduct(product);

let valueSource = fetched.source;
let valueRaw = fetched.raw;

if (parsed.estimated_value == null && barcodeLookupApiKey) {
  const fallbackFetched = await fetchBarcodeLookupProduct(
    barcodeLookupApiKey,
    cleanBarcode,
  );

  if (fallbackFetched?.product) {
    const fallbackParsed = parseFunkoProduct(fallbackFetched.product);

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
  image_url: storedImageUrl,
  vault_status: parsed.vault_status,
  limited_edition: parsed.limited_edition,
  limited_count: parsed.limited_count,
  edition_notes: parsed.edition_notes,
  estimated_value: parsed.estimated_value,
  description: parsed.description,
  display_description: parsed.display_description,
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
