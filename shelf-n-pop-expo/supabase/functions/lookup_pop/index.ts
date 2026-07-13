import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import {
  APPROVED_CATALOG_CLEANUP_OVERRIDES,
  AVENGERS_REFRESH_REGRESSION_OVERRIDES,
  BATMAN_1989_REFRESH_REGRESSION_OVERRIDES,
  BLOCKED_IMAGE_UPCS,
  buildCatalogRefreshUpdate,
  buildTrustedOverrideUpdate,
  canonicalizeFranchiseLabel,
  canonicalizeSetLabel,
  GAME_OF_THRONES_60_REFRESH_REGRESSION_OVERRIDES,
  GAME_OF_THRONES_67_REFRESH_REGRESSION_OVERRIDES,
  getSetTotalOverride,
  getExplicitProductClassification,
  getStaticCatalogOverride,
  HARRY_POTTER_175_REFRESH_REGRESSION_OVERRIDES,
  MIXED_CATALOG_CLEANUP_REFRESH_REGRESSION_OVERRIDES,
  normalizeMultipackNumber,
  POKEMON_REFRESH_REGRESSION_OVERRIDES,
  RECENT_SCAN_DATA_QUALITY_OVERRIDES,
  resolveLookupEstimatedValues,
  shouldFlagNeedsReview,
  shouldPromoteSpecificSet,
  shouldWarnMissingNumber,
  STAR_WARS_REFRESH_REGRESSION_OVERRIDES,
  VENOM_REFRESH_REGRESSION_OVERRIDES,
  WHAT_IF_REFRESH_REGRESSION_OVERRIDES,
} from "./catalog_refresh_rules.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ParseWarning =
  | "missing_title"
  | "missing_franchise"
  | "missing_character"
  | "missing_number"
  | "missing_set"
  | "weak_name_cleanup"
  | "variant_or_exclusive_title_noise"
  | "confidence_floor_070"
  | "reseller_brand_detected"
  | "estimated_value_missing";

type ParsedFunko = {
  image_url?: string | null;
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
  release_date: string | null;
  limited_edition: boolean;
  limited_count: number | null;
  edition_notes: string | null;
  description: string | null;
  display_description: string | null;
  estimated_value: number | null;
  parse_confidence: number;
  parse_reason_codes: ParseWarning[];
  needs_review: boolean;
  warnings: ParseWarning[];
};

const CATALOG_OVERRIDES_BY_UPC: Record<string, Partial<ParsedFunko>> = {
  ...STAR_WARS_REFRESH_REGRESSION_OVERRIDES,
  ...WHAT_IF_REFRESH_REGRESSION_OVERRIDES,
  ...POKEMON_REFRESH_REGRESSION_OVERRIDES,
  ...VENOM_REFRESH_REGRESSION_OVERRIDES,
  ...MIXED_CATALOG_CLEANUP_REFRESH_REGRESSION_OVERRIDES,
  ...RECENT_SCAN_DATA_QUALITY_OVERRIDES,
  "889698613491": {
    pop_name: "Karre",
    character: "Karre",
    franchise: "Star Wars",
    set_name: "Star Wars: Visions",
    number: "504",
    variant: "Glow in the Dark",
    exclusivity: "Target",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    release_date: "2022-01-01",
    description: "Karre is a Target exclusive Pop! Star Wars release #504 from Star Wars: Visions, Glow in the Dark.",
    display_description: "From Star Wars: Visions, Karre is a Pop! Star Wars release #504, Glow in the Dark, Target.",
    parse_confidence: 0.94,
    needs_review: false,
  },
  "889698862981": {
    pop_name: "Yakko",
    character: "Yakko",
    franchise: "Animaniacs",
    set_name: "Animaniacs",
    number: "2066",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    release_date: "2025-01-01",
    description: "Yakko is an Animaniacs Pop! Animation release #2066.",
    display_description: "From Animaniacs, Yakko is a Pop! Animation release #2066.",
    parse_confidence: 0.94,
    needs_review: false,
  },
  "889698478687": {
    pop_name: "Mr. Freeze (Glitter)",
    character: "Mr. Freeze",
    franchise: "DC",
    set_name: "Batman & Robin",
    number: "342",
    variant: "Glitter",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    release_date: "2020-01-01",
    description: "Mr. Freeze (Glitter) is a Summer Convention Pop! Heroes release #342 from Batman & Robin.",
    display_description: "From Batman & Robin, Mr. Freeze is a Pop! Heroes release #342, Glitter, Summer Convention.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698829878": {
    variant: "Silver Metallic",
    limited_edition: true,
    limited_count: 900,
    edition_notes: "Production run 900",
    estimated_value: 62.7,
    image_url: "https://i.ebayimg.com/images/g/osoAAeSwvthpRiCH/s-l500.jpg",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698477086": {
    pop_name: "Penguin",
    character: "Penguin",
    franchise: "DC",
    set_name: "Batman Returns",
    number: "339",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    release_date: "2020-01-01",
    description: "Penguin is a Pop! Heroes release #339 from Batman Returns.",
    display_description: "From Batman Returns, Penguin is a Pop! Heroes release #339.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698372145": {
    pop_name: "Batman (First Appearance)",
    character: "Batman",
    franchise: "DC",
    set_name: "Batman: 80th Anniversary",
    number: "270",
    variant: "First Appearance",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    release_date: "2019-01-01",
    description: "Batman (First Appearance) is a Pop! Heroes release #270 from Batman: 80th Anniversary.",
    display_description: "From Batman: 80th Anniversary, Batman is a Pop! Heroes release #270, First Appearance.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698423366": {
    pop_name: "Joker (Green Chrome)",
    character: "Joker",
    franchise: "DC",
    set_name: "Batman: Arkham Asylum",
    number: "53",
    variant: "Green Chrome",
    exclusivity: "Target",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    release_date: "2014-01-01",
    description: "Joker (Green Chrome) is a Target Pop! Heroes release #53 from Batman: Arkham Asylum.",
    display_description: "From Batman: Arkham Asylum, Joker is a Pop! Heroes release #53, Green Chrome, Target.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698293754": {
    pop_name: "Aladdin's First Wish",
    character: "Aladdin & Genie",
    franchise: "Disney",
    set_name: "Aladdin: Movie Moments",
    number: "409",
    variant: "Movie Moments",
    pop_type: "Pop! Moments",
    pop_style: "Movie Moments",
    release_date: "2018-01-01",
    description: "Aladdin's First Wish is a Pop! Moments release #409 from Aladdin: Movie Moments.",
    display_description: "From Aladdin: Movie Moments, Aladdin's First Wish is a Pop! Moments release #409, Movie Moments.",
    parse_confidence: 0.9,
    needs_review: false,
  },
  "849803049638": {
    pop_name: "Ant-Man",
    character: "Ant-Man",
    franchise: "Marvel",
    set_name: "Ant-Man",
    number: "85",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    release_date: "2015-01-01",
    description: "Ant-Man is a Pop! Marvel release #85 from Ant-Man.",
    display_description: "From Ant-Man, Ant-Man is a Pop! Marvel release #85.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "849803059712": {
    pop_name: "Ant-Man (Black Out)",
    character: "Ant-Man",
    franchise: "Marvel",
    set_name: "Ant-Man",
    number: "85",
    variant: "Black Out",
    exclusivity: "Exclusive",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    release_date: "2015-01-01",
    description: "Ant-Man (Black Out) is a Pop! Marvel release #85 from Ant-Man.",
    display_description: "From Ant-Man, Ant-Man is a Pop! Marvel release #85, Black Out.",
    parse_confidence: 0.94,
    needs_review: false,
  },
  "849803049621": {
    pop_name: "Yellowjacket",
    character: "Yellowjacket",
    franchise: "Marvel",
    set_name: "Ant-Man",
    number: "86",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    release_date: "2015-01-01",
    description: "Yellowjacket is a Pop! Marvel release #86 from Ant-Man.",
    display_description: "From Ant-Man, Yellowjacket is a Pop! Marvel release #86.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698307475": {
    pop_name: "Ghost (Invisible)",
    character: "Ghost",
    franchise: "Marvel",
    set_name: "Ant-Man and the Wasp",
    number: "345",
    variant: "Invisible",
    exclusivity: "Walmart",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    release_date: "2018-01-01",
    description: "Ghost (Invisible) is a Pop! Marvel release #345 from Ant-Man and the Wasp.",
    display_description: "From Ant-Man and the Wasp, Ghost is a Pop! Marvel release #345, Invisible.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698918275": {
    pop_name: "Allen the Alien (Bloody)",
    character: "Allen the Alien",
    franchise: "Invincible",
    set_name: "Invincible (TV Series)",
    number: "1863",
    variant: "Bloody",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    release_date: "2025-01-01",
    description: "Allen the Alien (Bloody) is a Pop! Television release #1863 from Invincible.",
    display_description: "From Invincible (TV Series), Allen the Alien is a Pop! Television release #1863, Bloody.",
    parse_confidence: 0.94,
    needs_review: false,
  },
  "849803055790": {
    pop_name: "Hulk",
    character: "Hulk",
    franchise: "Marvel",
    set_name: "Avengers: Age of Ultron",
    number: "68",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    release_date: "2015-01-01",
    description: "Hulk is a Pop! Marvel release #68 from Avengers: Age of Ultron. This UPC is shared by multiple legitimate variants.",
    display_description: "From Avengers: Age of Ultron, Hulk is a Pop! Marvel release #68. Variant identity is stored on each owned collection item.",
    parse_confidence: 0.94,
    needs_review: false,
  },
  "889698552363": {
    pop_name: "Doctor Strange",
    character: "Doctor Strange",
    franchise: "Marvel",
    set_name: "Avengers: Mech Strike",
    number: "832",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    release_date: "2021-01-01",
    description: "Doctor Strange is a Pop! Marvel release #832 from Avengers: Mech Strike.",
    display_description: "From Avengers: Mech Strike, Doctor Strange is a Pop! Marvel release #832.",
    parse_confidence: 0.9,
    needs_review: false,
  },
  "889698850827": {
    pop_name: "Butt-Head (Ghost)",
    character: "Butt-Head",
    franchise: "Beavis and Butt-Head",
    set_name: "Beavis and Butt-Head",
    number: "1594",
    variant: "Ghost",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    release_date: "2024-01-01",
    description: "Butt-Head (Ghost) is a Funko Shop Pop! Television release #1594 from Beavis and Butt-Head.",
    display_description: "From Beavis and Butt-Head, Butt-Head is a Pop! Television release #1594, Ghost, Funko Shop.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698862950": {
    pop_name: "Heatblast",
    character: "Heatblast",
    franchise: "Ben 10",
    set_name: "Ben 10",
    number: "1772",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    release_date: "2025-01-01",
    description: "Heatblast is a Pop! Television release #1772 from Ben 10.",
    display_description: "From Ben 10, Heatblast is a Pop! Television release #1772.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698809481": {
    pop_name: "JJ & Syndrome (20th Anniversary)",
    character: "JJ & Syndrome",
    franchise: "Disney",
    set_name: "The Incredibles 20th Anniversary",
    number: "1506",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    release_date: "2024-01-01",
    description: "JJ & Syndrome (20th Anniversary) is a Disney Pop! release #1506 from The Incredibles 20th Anniversary.",
    display_description: "From The Incredibles 20th Anniversary, JJ & Syndrome is a Pop! Disney release #1506.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698292009": {
    pop_name: "Mr. Incredible",
    character: "Mr. Incredible",
    franchise: "Disney",
    set_name: "Incredibles 2",
    number: "363",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    release_date: "2018-01-01",
    description: "Mr. Incredible is a Disney Pop! release #363 from Incredibles 2.",
    display_description: "From Incredibles 2, Mr. Incredible is a Pop! Disney release #363.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698291996": {
    pop_name: "Elastigirl",
    character: "Elastigirl",
    franchise: "Disney",
    set_name: "Incredibles 2",
    number: "364",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    release_date: "2018-01-01",
    description: "Elastigirl is a Disney Pop! release #364 from Incredibles 2.",
    display_description: "From Incredibles 2, Elastigirl is a Pop! Disney release #364.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698292016": {
    pop_name: "Violet",
    character: "Violet",
    franchise: "Disney",
    set_name: "Incredibles 2",
    number: "365",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    release_date: "2018-01-01",
    description: "Violet is a Disney Pop! release #365 from Incredibles 2.",
    display_description: "From Incredibles 2, Violet is a Pop! Disney release #365.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698292023": {
    pop_name: "Dash",
    character: "Dash",
    franchise: "Disney",
    set_name: "Incredibles 2",
    number: "366",
    exclusivity: null,
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    release_date: "2018-01-01",
    description: "Dash is a Disney Pop! release #366 from Incredibles 2.",
    display_description: "From Incredibles 2, Dash is a Pop! Disney release #366.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698314329": {
    pop_name: "Jack-Jack (Metallic Chrome)",
    character: "Jack-Jack",
    franchise: "Disney",
    set_name: "Incredibles 2",
    number: "367",
    variant: "Metallic Chrome",
    exclusivity: "Exclusive",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    release_date: "2018-01-01",
    description: "Jack-Jack (Metallic Chrome) is a Disney Pop! release #367 from Incredibles 2.",
    display_description: "From Incredibles 2, Jack-Jack is a Pop! Disney release #367, Metallic Chrome.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698292030": {
    pop_name: "Jack-Jack",
    character: "Jack-Jack",
    franchise: "Disney",
    set_name: "Incredibles 2",
    number: "367",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    release_date: "2018-01-01",
    description: "Jack-Jack is a Disney Pop! release #367 from Incredibles 2.",
    display_description: "From Incredibles 2, Jack-Jack is a Pop! Disney release #367.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698292085": {
    pop_name: "Underminer",
    character: "Underminer",
    franchise: "Disney",
    set_name: "Incredibles 2",
    number: "370",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    release_date: "2018-01-01",
    description: "Underminer is a Disney Pop! release #370 from Incredibles 2.",
    display_description: "From Incredibles 2, Underminer is a Pop! Disney release #370.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698292054": {
    pop_name: "Monster Jack-Jack",
    character: "Jack-Jack",
    franchise: "Disney",
    set_name: "Incredibles 2",
    number: "401",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    release_date: "2018-01-01",
    description: "Monster Jack-Jack is a Disney Pop! release #401 from Incredibles 2.",
    display_description: "From Incredibles 2, Monster Jack-Jack is a Pop! Disney release #401.",
    parse_confidence: 0.93,
    needs_review: false,
  },
  "889698299541": {
    pop_name: "Jack-Jack (Edna)",
    character: "Jack-Jack",
    franchise: "Disney",
    set_name: "Incredibles 2",
    number: "404",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    release_date: "2018-01-01",
    description: "Jack-Jack (Edna) is a Disney Pop! release #404 from Incredibles 2.",
    display_description: "From Incredibles 2, Jack-Jack is a Pop! Disney release #404 with Edna styling.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698291989": {
    pop_name: "Elastigirl (Outfit Upgrade)",
    character: "Elastigirl",
    franchise: "Disney",
    set_name: "Incredibles 2",
    number: "403",
    exclusivity: "Exclusive",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    release_date: "2018-01-01",
    description: "Elastigirl (Outfit Upgrade) is a Disney Pop! release #403 from Incredibles 2.",
    display_description: "From Incredibles 2, Elastigirl is a Pop! Disney release #403, Outfit Upgrade.",
    parse_confidence: 0.94,
    needs_review: false,
  },
  "889698370202": {
    pop_name: "Voyd",
    character: "Voyd",
    franchise: "Disney",
    set_name: "Incredibles 2",
    number: "509",
    exclusivity: "Emerald City Comic Con",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    release_date: "2019-01-01",
    description: "Voyd is a Disney Pop! release #509 from Incredibles 2.",
    display_description: "From Incredibles 2, Voyd is a Pop! Disney release #509.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698581868": {
    pop_name: "Gage & Church",
    character: "Gage & Church",
    franchise: "Pet Sematary",
    set_name: "Pet Sematary",
    number: "729",
    variant: "Glow in the Dark",
    exclusivity: "Exclusive",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2021-01-01",
    description: "Gage & Church is a Glow in the Dark Pop! Movies release #729 from Pet Sematary.",
    display_description: "From Pet Sematary, Gage & Church is a Pop! Movies release #729, Glow in the Dark.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698807128": {
    pop_name: "Gage Creed",
    character: "Gage Creed",
    franchise: "Pet Sematary",
    set_name: "Pet Sematary",
    number: "1585",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2024-01-01",
    description: "Gage Creed is a Pop! Movies release #1585 from Pet Sematary.",
    display_description: "From Pet Sematary, Gage Creed is a Pop! Movies release #1585.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698807135": {
    pop_name: "Victor Pascow",
    character: "Victor Pascow",
    franchise: "Pet Sematary",
    set_name: "Pet Sematary",
    number: "1586",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2024-01-01",
    description: "Victor Pascow is a Pop! Movies release #1586 from Pet Sematary.",
    display_description: "From Pet Sematary, Victor Pascow is a Pop! Movies release #1586.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698552509": {
    pop_name: "Rick with Glorzo",
    character: "Rick",
    franchise: "Rick and Morty",
    set_name: "Rick and Morty",
    number: "956",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    release_date: "2021-01-01",
    description: "Rick with Glorzo is a Pop! Animation release #956 from Rick and Morty.",
    display_description: "From Rick and Morty, Rick with Glorzo is a Pop! Animation release #956.",
    parse_confidence: 0.94,
    needs_review: false,
  },
  "889698477918": {
    pop_name: "Morty with Laptop",
    character: "Morty",
    franchise: "Rick and Morty",
    set_name: "Rick and Morty",
    number: "742",
    exclusivity: "GameStop",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    release_date: "2020-01-01",
    description: "Morty with Laptop is a GameStop exclusive Pop! Animation release #742 from Rick and Morty.",
    display_description: "From Rick and Morty, Morty with Laptop is a Pop! Animation release #742, GameStop exclusive.",
    parse_confidence: 0.93,
    needs_review: false,
  },
  "889698567947": {
    pop_name: "Drogon (Iron)",
    character: "Drogon",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "16",
    variant: "Iron",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Drogon (Iron) is a Game of Thrones Pop! Television release #16.",
    display_description: "Drogon (Iron) is a Game of Thrones Pop! Television release #16.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698567930": {
    pop_name: "Arya Stark",
    character: "Arya Stark",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "89",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Arya Stark is a Game of Thrones Pop! Television release #89.",
    display_description: "Arya Stark is a Game of Thrones Pop! Television release #89.",
    parse_confidence: 0.86,
    needs_review: false,
  },
  "889698567954": {
    pop_name: "Khal Drogo (with Daggers)",
    character: "Khal Drogo",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "90",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Khal Drogo (with Daggers) is a Game of Thrones Pop! Television release #90.",
    display_description: "Khal Drogo (with Daggers) is a Game of Thrones Pop! Television release #90.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698567961": {
    pop_name: "Robb Stark (with Sword)",
    character: "Robb Stark",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "91",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Robb Stark (with Sword) is a Game of Thrones Pop! Television release #91.",
    display_description: "Robb Stark (with Sword) is a Game of Thrones Pop! Television release #91.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "849803094836": {
    pop_name: "Mag the Mighty",
    character: "Mag the Mighty",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "48",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Television",
    pop_style: "Jumbo",
    description: "Mag the Mighty is a Game of Thrones Pop! Television 6-inch release #48, Summer Convention exclusive.",
    display_description: "Mag the Mighty is a Game of Thrones Pop! Television 6-inch release #48, Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698799348": {
    pop_name: "The Mandalorian (Holiday)",
    character: "The Mandalorian",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "732",
    variant: "Holiday",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "The Mandalorian (Holiday) is a Star Wars Pop! Star Wars release #732 from The Mandalorian.",
    display_description: "The Mandalorian (Holiday) is a Star Wars Pop! Star Wars release #732 from The Mandalorian.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698799355": {
    pop_name: "Grogu (Holiday)",
    character: "Grogu",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "733",
    variant: "Holiday",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Grogu (Holiday) is a Star Wars Pop! Star Wars release #733 from The Mandalorian.",
    display_description: "Grogu (Holiday) is a Star Wars Pop! Star Wars release #733 from The Mandalorian.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698686549": {
    pop_name: "The Mandalorian (with Pouch)",
    character: "The Mandalorian",
    franchise: "Star Wars",
    set_name: "The Book of Boba Fett",
    number: "585",
    variant: "With Pouch",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    release_date: "2022-01-01",
    description: "The Mandalorian (with Pouch) is a Star Wars Pop! Star Wars release #585 from The Book of Boba Fett.",
    display_description: "The Mandalorian belongs to The Book of Boba Fett Pop! Star Wars line as #585. This catalog entry tracks the With Pouch variant. Released in 2022.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698650960": {
    pop_name: "Obi-Wan Kenobi",
    character: "Obi-Wan Kenobi",
    franchise: "Star Wars",
    set_name: "Obi-Wan Kenobi",
    number: "536",
    variant: "Art Series",
    exclusivity: "Target",
    pop_type: "Pop! Star Wars",
    pop_style: "Art Series",
    release_date: "2022-01-01",
    description: "Obi-Wan Kenobi is an Art Series Pop! Star Wars release #536 from Obi-Wan Kenobi, Target exclusive.",
    display_description: "Obi-Wan Kenobi belongs to the Obi-Wan Kenobi Pop! Star Wars line as #536. This catalog entry tracks the Art Series format, Target exclusive. Released in 2022.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698767347": {
    pop_name: "Wim",
    character: "Wim",
    franchise: "Star Wars",
    set_name: "Skeleton Crew",
    number: "699",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    release_date: "2024-01-01",
    description: "Wim is a Pop! Star Wars release #699 from Skeleton Crew.",
    display_description: "Wim belongs to the Skeleton Crew Pop! Star Wars line as #699. Released in 2024.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698768382": {
    pop_name: "Kh'ymm",
    character: "Kh'ymm",
    franchise: "Star Wars",
    set_name: "Skeleton Crew",
    number: "731",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    release_date: "2024-01-01",
    description: "Kh'ymm is a Pop! Star Wars release #731 from Skeleton Crew, Funko Shop exclusive.",
    display_description: "Kh'ymm belongs to the Skeleton Crew Pop! Star Wars line as #731. This catalog entry tracks the Funko Shop exclusive. Released in 2024.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698837620": {
    pop_name: "Ezra Bridger (Lightsaber)",
    character: "Ezra Bridger",
    franchise: "Star Wars",
    set_name: "Ahsoka",
    number: "752",
    variant: "Lightsaber",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    release_date: "2024-01-01",
    description: "Ezra Bridger (Lightsaber) is a Pop! Star Wars release #752 from Ahsoka.",
    display_description: "Ezra Bridger belongs to the Ahsoka Pop! Star Wars line as #752. This catalog entry tracks the Lightsaber variant. Released in 2024.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698509640": {
    pop_name: "The Mandalorian",
    character: "The Mandalorian",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "326",
    exclusivity: "D23 First to Market",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "The Mandalorian is a Star Wars Pop! Star Wars release #326 from The Mandalorian, D23 First to Market exclusive.",
    display_description: "The Mandalorian is a Star Wars Pop! Star Wars release #326 from The Mandalorian, D23 First to Market exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698460927": {
    pop_name: "The Mandalorian (Helmet Chrome)",
    character: "The Mandalorian",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "345",
    variant: "Helmet Chrome",
    exclusivity: "Amazon",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "The Mandalorian (Helmet Chrome) is a Star Wars Pop! Star Wars release #345 from The Mandalorian, Amazon exclusive.",
    display_description: "The Mandalorian (Helmet Chrome) is a Star Wars Pop! Star Wars release #345 from The Mandalorian, Amazon exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698606547": {
    pop_name: "The Mandalorian (Beskar Armor)",
    character: "The Mandalorian",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "345",
    variant: "Beskar Armor",
    exclusivity: "Entertainment Earth",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "The Mandalorian (Beskar Armor) is a Star Wars Pop! Star Wars release #345 from The Mandalorian, Entertainment Earth exclusive.",
    display_description: "The Mandalorian (Beskar Armor) is a Star Wars Pop! Star Wars release #345 from The Mandalorian, Entertainment Earth exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698487405": {
    pop_name: "The Child",
    character: "The Child",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "368",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "The Child is a Star Wars Pop! Star Wars release #368 from The Mandalorian.",
    display_description: "The Child is a Star Wars Pop! Star Wars release #368 from The Mandalorian.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698509626": {
    pop_name: "The Child (with Egg Canister)",
    character: "The Child",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "407",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "The Child (with Egg Canister) is a Star Wars Pop! Star Wars release #407 from The Mandalorian.",
    display_description: "The Child (with Egg Canister) is a Star Wars Pop! Star Wars release #407 from The Mandalorian.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698523738": {
    pop_name: "The Mandalorian & The Child on Bantha",
    character: "The Mandalorian & The Child",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "416",
    pop_type: "Pop! Deluxe",
    pop_style: "Deluxe",
    description: "The Mandalorian & The Child on Bantha is a Star Wars Pop! Deluxe release #416 from The Mandalorian.",
    display_description: "The Mandalorian & The Child on Bantha is a Star Wars Pop! Deluxe release #416 from The Mandalorian.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698559164": {
    pop_name: "Boba Fett (Tatooine)",
    character: "Boba Fett",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "478",
    exclusivity: "New York Comic-Con",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Boba Fett (Tatooine) is a Star Wars Pop! Star Wars release #478 from The Mandalorian, New York Comic-Con exclusive.",
    display_description: "Boba Fett (Tatooine) is a Star Wars Pop! Star Wars release #478 from The Mandalorian, New York Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698608176": {
    pop_name: "Boba Fett (Red Chrome)",
    character: "Boba Fett",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "462",
    variant: "Red Chrome",
    exclusivity: "TargetCon",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Boba Fett (Red Chrome) is a Star Wars Pop! Star Wars release #462 from The Mandalorian, TargetCon exclusive.",
    display_description: "Boba Fett (Red Chrome) is a Star Wars Pop! Star Wars release #462 from The Mandalorian, TargetCon exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698582889": {
    pop_name: "Boba Fett (Unmasked)",
    character: "Boba Fett",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "490",
    variant: "Unmasked",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Boba Fett (Unmasked) is a Star Wars Pop! Star Wars release #490 from The Mandalorian.",
    display_description: "Boba Fett (Unmasked) is a Star Wars Pop! Star Wars release #490 from The Mandalorian.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698587976": {
    pop_name: "The Mandalorian with Darksaber",
    character: "The Mandalorian",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "491",
    variant: "Glow in the Dark",
    exclusivity: "Box Warehouse",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "The Mandalorian with Darksaber is a Star Wars Pop! Star Wars release #491 from The Mandalorian, Glow in the Dark Box Warehouse exclusive.",
    display_description: "The Mandalorian with Darksaber is a Star Wars Pop! Star Wars release #491 from The Mandalorian, Glow in the Dark Box Warehouse exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698665704": {
    pop_name: "Death Watch Mandalorian (No Stripes)",
    character: "Death Watch Mandalorian",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "561",
    variant: "No Stripes",
    exclusivity: "GameStop",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Death Watch Mandalorian (No Stripes) is a Star Wars Pop! Star Wars release #561 from The Mandalorian, GameStop exclusive.",
    display_description: "Death Watch Mandalorian (No Stripes) is a Star Wars Pop! Star Wars release #561 from The Mandalorian, GameStop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698665728": {
    pop_name: "The Mandalorian (Mudhorn Battle)",
    character: "The Mandalorian",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "564",
    exclusivity: "GameStop",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "The Mandalorian (Mudhorn Battle) is a Star Wars Pop! Star Wars release #564 from The Mandalorian, GameStop exclusive.",
    display_description: "The Mandalorian (Mudhorn Battle) is a Star Wars Pop! Star Wars release #564 from The Mandalorian, GameStop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698765497": {
    pop_name: "The Mandalorian in N-1 Starfighter with R5-D4",
    character: "The Mandalorian & R5-D4",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "670",
    pop_type: "Pop! Rides",
    pop_style: "Super Deluxe Ride",
    description: "The Mandalorian in N-1 Starfighter with R5-D4 is a Star Wars Pop! Rides Super Deluxe release #670 from The Mandalorian.",
    display_description: "The Mandalorian in N-1 Starfighter with R5-D4 is a Star Wars Pop! Rides Super Deluxe release #670 from The Mandalorian.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698800044": {
    pop_name: "Din Grogu (with Armor)",
    character: "Din Grogu",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "712",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Din Grogu (with Armor) is a Star Wars Pop! Star Wars release #712 from The Mandalorian.",
    display_description: "Din Grogu (with Armor) is a Star Wars Pop! Star Wars release #712 from The Mandalorian.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698800051": {
    pop_name: "Moff Gideon (with Armor)",
    character: "Moff Gideon",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "713",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Moff Gideon (with Armor) is a Star Wars Pop! Star Wars release #713 from The Mandalorian.",
    display_description: "Moff Gideon (with Armor) is a Star Wars Pop! Star Wars release #713 from The Mandalorian.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698821124": {
    pop_name: "The Armorer (with Jetpack)",
    character: "The Armorer",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "717",
    exclusivity: "Target",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "The Armorer (with Jetpack) is a Star Wars Pop! Star Wars release #717 from The Mandalorian, Target exclusive.",
    display_description: "The Armorer (with Jetpack) is a Star Wars Pop! Star Wars release #717 from The Mandalorian, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698800020": {
    pop_name: "Grogu (Force Barrier)",
    character: "Grogu",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "719",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Grogu (Force Barrier) is a Star Wars Pop! Star Wars release #719 from The Mandalorian.",
    display_description: "Grogu (Force Barrier) is a Star Wars Pop! Star Wars release #719 from The Mandalorian.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698937900": {
    pop_name: "Grogu (with Snack)",
    character: "Grogu",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "825",
    variant: "Flocked",
    exclusivity: "Target",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Grogu (with Snack) is a Star Wars Pop! Star Wars release #825 from The Mandalorian, Flocked Target exclusive.",
    display_description: "Grogu (with Snack) is a Star Wars Pop! Star Wars release #825 from The Mandalorian, Flocked Target exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698641951": {
    pop_name: "Hawkman in Cruiser",
    character: "Hawkman",
    franchise: "DC",
    set_name: "Black Adam",
    number: "286",
    pop_type: "Pop! Rides",
    pop_style: "Ride",
    description: "Hawkman in Cruiser is a Black Adam Pop! Rides release #286.",
    display_description: "Hawkman in Cruiser is a Black Adam Pop! Rides release #286.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698641883": {
    pop_name: "Black Adam (Cape)",
    character: "Black Adam",
    franchise: "DC",
    set_name: "Black Adam",
    number: "1231",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Black Adam (Cape) is a Black Adam Pop! Heroes release #1231.",
    display_description: "Black Adam (Cape) is a Black Adam Pop! Heroes release #1231.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698641890": {
    pop_name: "Black Adam",
    character: "Black Adam",
    franchise: "DC",
    set_name: "Black Adam",
    number: "1232",
    variant: "Glow in the Dark Chase",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Black Adam is a Black Adam Pop! Heroes release #1232, Glow in the Dark Chase variant.",
    display_description: "Black Adam is a Black Adam Pop! Heroes release #1232, Glow in the Dark Chase variant.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698653435": {
    pop_name: "Black Adam (with Cloak)",
    character: "Black Adam",
    franchise: "DC",
    set_name: "Black Adam",
    number: "1251",
    exclusivity: "Winter Convention",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Black Adam (with Cloak) is a Black Adam Pop! Heroes release #1251, Winter Convention exclusive.",
    display_description: "Black Adam (with Cloak) is a Black Adam Pop! Heroes release #1251, Winter Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "849803047771": {
    pop_name: "Iron Man Mark 43",
    character: "Iron Man",
    franchise: "Marvel",
    set_name: "Avengers: Age of Ultron",
    number: "66",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Iron Man Mark 43 is a Marvel Pop! Marvel release #66 from Avengers: Age of Ultron.",
    display_description: "Iron Man Mark 43 is a Marvel Pop! Marvel release #66 from Avengers: Age of Ultron.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "849803047801": {
    pop_name: "Thor",
    character: "Thor",
    franchise: "Marvel",
    set_name: "Avengers: Age of Ultron",
    number: "69",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Thor is a Marvel Pop! Marvel release #69 from Avengers: Age of Ultron.",
    display_description: "Thor is a Marvel Pop! Marvel release #69 from Avengers: Age of Ultron.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698366755": {
    pop_name: "Captain Marvel",
    character: "Captain Marvel",
    franchise: "Marvel",
    set_name: "Avengers: Endgame",
    number: "459",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Captain Marvel is a Marvel Pop! Marvel release #459 from Avengers: Endgame.",
    display_description: "Captain Marvel is a Marvel Pop! Marvel release #459 from Avengers: Endgame.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698385909": {
    pop_name: "Valkyrie",
    character: "Valkyrie",
    franchise: "Marvel",
    set_name: "Avengers: Endgame",
    number: "483",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Valkyrie is a Marvel Pop! Marvel release #483 from Avengers: Endgame.",
    display_description: "Valkyrie is a Marvel Pop! Marvel release #483 from Avengers: Endgame.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698413503": {
    pop_name: "Hulk",
    character: "Hulk",
    franchise: "Marvel",
    set_name: "Avengers: Endgame",
    number: "499",
    variant: "Chrome",
    exclusivity: "Walmart",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Hulk is a Marvel Pop! Marvel release #499 from Avengers: Endgame, Chrome Walmart exclusive.",
    display_description: "Hulk is a Marvel Pop! Marvel release #499 from Avengers: Endgame, Chrome Walmart exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698451437": {
    pop_name: "Captain Marvel with New Hair",
    character: "Captain Marvel",
    franchise: "Marvel",
    set_name: "Avengers: Endgame",
    number: "576",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Captain Marvel with New Hair is a Marvel Pop! Marvel release #576 from Avengers: Endgame.",
    display_description: "Captain Marvel with New Hair is a Marvel Pop! Marvel release #576 from Avengers: Endgame.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698470964": {
    pop_name: "Iron Man (I Am Iron Man)",
    character: "Iron Man",
    franchise: "Marvel",
    set_name: "Avengers: Endgame",
    number: "580",
    variant: "Glow in the Dark",
    exclusivity: "PX Previews",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Iron Man (I Am Iron Man) is a Marvel Pop! Marvel release #580 from Avengers: Endgame, Glow in the Dark PX Previews exclusive.",
    display_description: "Iron Man (I Am Iron Man) is a Marvel Pop! Marvel release #580 from Avengers: Endgame, Glow in the Dark PX Previews exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698269049": {
    pop_name: "Teen Groot with Gun",
    character: "Groot",
    franchise: "Marvel",
    set_name: "Avengers: Infinity War",
    number: "293",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Teen Groot with Gun is a Marvel Pop! Marvel release #293 from Avengers: Infinity War.",
    display_description: "Teen Groot with Gun is a Marvel Pop! Marvel release #293 from Avengers: Infinity War.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698641593": {
    pop_name: "Mighty Thor",
    character: "Mighty Thor",
    franchise: "Marvel",
    set_name: "Thor: Love and Thunder",
    number: "1041",
    variant: "Glow in the Dark",
    exclusivity: "Collectors Corps",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Mighty Thor is a Marvel Pop! Marvel release #1041 from Thor: Love and Thunder, Glow in the Dark Collectors Corps exclusive.",
    display_description: "Mighty Thor is a Marvel Pop! Marvel release #1041 from Thor: Love and Thunder, Glow in the Dark Collectors Corps exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698631761": {
    pop_name: "Thor & Mighty Thor 2-Pack",
    character: "Thor & Mighty Thor",
    franchise: "Marvel",
    set_name: "Thor: Love and Thunder",
    exclusivity: "Target",
    pop_type: "Pop! Marvel",
    pop_style: "2-Pack",
    description: "Thor & Mighty Thor 2-Pack is a Marvel Pop! Marvel 2-Pack from Thor: Love and Thunder, Target exclusive.",
    display_description: "Thor & Mighty Thor 2-Pack is a Marvel Pop! Marvel 2-Pack from Thor: Love and Thunder, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698650861": {
    pop_name: "Thor, Mighty Thor, Valkyrie & Gorr 4-Pack",
    character: "Thor, Mighty Thor, Valkyrie & Gorr",
    franchise: "Marvel",
    set_name: "Thor: Love and Thunder",
    exclusivity: "Walmart",
    pop_type: "Pop! Marvel",
    pop_style: "4-Pack",
    description: "Thor, Mighty Thor, Valkyrie & Gorr 4-Pack is a Marvel Pop! Marvel 4-Pack from Thor: Love and Thunder, Walmart exclusive.",
    display_description: "Thor, Mighty Thor, Valkyrie & Gorr 4-Pack is a Marvel Pop! Marvel 4-Pack from Thor: Love and Thunder, Walmart exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698624220": {
    pop_name: "Mighty Thor",
    character: "Mighty Thor",
    franchise: "Marvel",
    set_name: "Thor: Love and Thunder",
    number: "1041",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Mighty Thor is a Marvel Pop! Marvel release #1041 from Thor: Love and Thunder.",
    display_description: "Mighty Thor is a Marvel Pop! Marvel release #1041 from Thor: Love and Thunder.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698641586": {
    pop_name: "Thor",
    character: "Thor",
    franchise: "Marvel",
    set_name: "Thor: Love and Thunder",
    number: "1071",
    exclusivity: "Collectors Corps",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Thor is a Marvel Pop! Marvel release #1071 from Thor: Love and Thunder, Collectors Corps exclusive.",
    display_description: "Thor is a Marvel Pop! Marvel release #1071 from Thor: Love and Thunder, Collectors Corps exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698648080": {
    pop_name: "Mighty Thor",
    character: "Mighty Thor",
    franchise: "Marvel",
    set_name: "Thor: Love and Thunder",
    number: "1046",
    variant: "Glow in the Dark",
    exclusivity: "Pop In A Box",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Mighty Thor is a Marvel Pop! Marvel release #1046 from Thor: Love and Thunder, Glow in the Dark Pop In A Box exclusive.",
    display_description: "Mighty Thor is a Marvel Pop! Marvel release #1046 from Thor: Love and Thunder, Glow in the Dark Pop In A Box exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698650120": {
    pop_name: "Mighty Thor (Metallic)",
    character: "Mighty Thor",
    franchise: "Marvel",
    set_name: "Thor: Love and Thunder",
    number: "1076",
    variant: "Metallic",
    exclusivity: "Books-A-Million",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Mighty Thor (Metallic) is a Marvel Pop! Marvel release #1076 from Thor: Love and Thunder, Books-A-Million exclusive.",
    display_description: "Mighty Thor (Metallic) is a Marvel Pop! Marvel release #1076 from Thor: Love and Thunder, Books-A-Million exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698649483": {
    pop_name: "Gorr (with Stormbreaker)",
    character: "Gorr",
    franchise: "Marvel",
    set_name: "Thor: Love and Thunder",
    number: "1092",
    exclusivity: "Specialty Series",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Gorr (with Stormbreaker) is a Marvel Pop! Marvel release #1092 from Thor: Love and Thunder, Specialty Series exclusive.",
    display_description: "Gorr (with Stormbreaker) is a Marvel Pop! Marvel release #1092 from Thor: Love and Thunder, Specialty Series exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698642088": {
    pop_name: "Gorr's Daughter",
    character: "Gorr's Daughter",
    franchise: "Marvel",
    set_name: "Thor: Love and Thunder",
    number: "1188",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    limited_edition: true,
    description: "Gorr's Daughter is a Marvel Pop! Marvel release #1188 from Thor: Love and Thunder, Summer Convention exclusive.",
    display_description: "Gorr's Daughter is a Marvel Pop! Marvel release #1188 from Thor: Love and Thunder, Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698717502": {
    pop_name: "Thor (In Toga)",
    character: "Thor",
    franchise: "Marvel",
    set_name: "Thor: Love and Thunder",
    number: "1261",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Thor (In Toga) is a Marvel Pop! Marvel release #1261 from Thor: Love and Thunder, Summer Convention exclusive.",
    display_description: "Thor (In Toga) is a Marvel Pop! Marvel release #1261 from Thor: Love and Thunder, Summer Convention exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698520461": {
    pop_name: "Wanda (Halloween)",
    character: "Wanda",
    franchise: "Marvel",
    set_name: "WandaVision",
    number: "715",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Wanda (Halloween) is a Marvel Pop! Marvel release #715 from WandaVision.",
    display_description: "Wanda (Halloween) is a Marvel Pop! Marvel release #715 from WandaVision.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698520454": {
    pop_name: "Vision (Halloween)",
    character: "Vision",
    franchise: "Marvel",
    set_name: "WandaVision",
    number: "716",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Vision (Halloween) is a Marvel Pop! Marvel release #716 from WandaVision.",
    display_description: "Vision (Halloween) is a Marvel Pop! Marvel release #716 from WandaVision.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698520430": {
    pop_name: "Vision (Halloween)",
    character: "Vision",
    franchise: "Marvel",
    set_name: "WandaVision",
    number: "716",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Vision (Halloween) is a Marvel Pop! Marvel release #716 from WandaVision.",
    display_description: "Vision (Halloween) is a Marvel Pop! Marvel release #716 from WandaVision.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698520478": {
    pop_name: "Vision (70s)",
    character: "Vision",
    franchise: "Marvel",
    set_name: "WandaVision",
    number: "718",
    exclusivity: "GameStop",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Vision (70s) is a Marvel Pop! Marvel release #718 from WandaVision, GameStop exclusive.",
    display_description: "Vision (70s) is a Marvel Pop! Marvel release #718 from WandaVision, GameStop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698623452": {
    pop_name: "Scarlet Witch",
    character: "Scarlet Witch",
    franchise: "Marvel",
    set_name: "WandaVision",
    number: "823",
    variant: "Glow in the Dark",
    exclusivity: "Entertainment Earth",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Scarlet Witch is a Marvel Pop! Marvel release #823 from WandaVision, Glow in the Dark Entertainment Earth exclusive.",
    display_description: "Scarlet Witch is a Marvel Pop! Marvel release #823 from WandaVision, Glow in the Dark Entertainment Earth exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698543248": {
    pop_name: "The Vision",
    character: "The Vision",
    franchise: "Marvel",
    set_name: "WandaVision",
    number: "824",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "The Vision is a Marvel Pop! Marvel release #824 from WandaVision.",
    display_description: "The Vision is a Marvel Pop! Marvel release #824 from WandaVision.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698544375": {
    pop_name: "Scarlet Witch (Flying)",
    character: "Scarlet Witch",
    franchise: "Marvel",
    set_name: "WandaVision",
    number: "828",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Scarlet Witch (Flying) is a Marvel Pop! Marvel release #828 from WandaVision, Hot Topic exclusive.",
    display_description: "Scarlet Witch (Flying) is a Marvel Pop! Marvel release #828 from WandaVision, Hot Topic exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698627467": {
    pop_name: "Scarlet Witch (Black Light)",
    character: "Scarlet Witch",
    franchise: "Marvel",
    set_name: "WandaVision",
    number: "986",
    variant: "Black Light",
    exclusivity: "Target",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Scarlet Witch (Black Light) is a Marvel Pop! Marvel release #986 from WandaVision, Target exclusive.",
    display_description: "Scarlet Witch (Black Light) is a Marvel Pop! Marvel release #986 from WandaVision, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698543156": {
    pop_name: "Billy and Tommy (Halloween)",
    character: "Billy and Tommy",
    franchise: "Marvel",
    set_name: "WandaVision",
    variant: "Halloween",
    exclusivity: "Spring Convention",
    pop_type: "Pop! Marvel",
    pop_style: "2-Pack",
    description: "Billy and Tommy (Halloween) is a Marvel Pop! Marvel 2-Pack from WandaVision, Spring Convention exclusive.",
    display_description: "Billy and Tommy (Halloween) is a Marvel Pop! Marvel 2-Pack from WandaVision, Spring Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698137706": {
    pop_name: "Valkyrie (Scavenger Suit)",
    character: "Valkyrie",
    franchise: "Marvel",
    set_name: "Thor: Ragnarok",
    number: "244",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Valkyrie (Scavenger Suit) is a Marvel Pop! Marvel release #244 from Thor: Ragnarok.",
    display_description: "Valkyrie (Scavenger Suit) is a Marvel Pop! Marvel release #244 from Thor: Ragnarok.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698307628": {
    pop_name: "Valkyrie",
    character: "Valkyrie",
    franchise: "Marvel",
    set_name: "Thor: Ragnarok",
    number: "336",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Valkyrie is a Marvel Pop! Marvel release #336 from Thor: Ragnarok, Summer Convention exclusive.",
    display_description: "Valkyrie is a Marvel Pop! Marvel release #336 from Thor: Ragnarok, Summer Convention exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "830395032276": {
    pop_name: "Thor",
    character: "Thor",
    franchise: "Marvel",
    set_name: "Thor: The Dark World",
    number: "35",
    exclusivity: "Gemini Collectibles",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Thor is a Marvel Pop! Marvel release #35 from Thor: The Dark World, Gemini Collectibles exclusive.",
    display_description: "Thor is a Marvel Pop! Marvel release #35 from Thor: The Dark World, Gemini Collectibles exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698413527": {
    pop_name: "Hulk (Yellow Chrome)",
    character: "Hulk",
    franchise: "Marvel",
    set_name: "Avengers: Endgame",
    number: "499",
    variant: "Yellow Chrome",
    exclusivity: "Walmart",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Hulk (Yellow Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame, Walmart exclusive.",
    display_description: "Hulk (Yellow Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame, Walmart exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698413558": {
    pop_name: "Hulk (Orange Chrome)",
    character: "Hulk",
    franchise: "Marvel",
    set_name: "Avengers: Endgame",
    number: "499",
    variant: "Orange Chrome",
    exclusivity: "Walmart",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Hulk (Orange Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame, Walmart exclusive.",
    display_description: "Hulk (Orange Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame, Walmart exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698413565": {
    pop_name: "Hulk (Red Chrome)",
    character: "Hulk",
    franchise: "Marvel",
    set_name: "Avengers: Endgame",
    number: "499",
    variant: "Red Chrome",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Hulk (Red Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame.",
    display_description: "Hulk (Red Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698413589": {
    pop_name: "Hulk with Gauntlet (Purple Chrome)",
    character: "Hulk",
    franchise: "Marvel",
    set_name: "Avengers: Endgame",
    number: "499",
    variant: "Purple Chrome",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Hulk with Gauntlet (Purple Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame.",
    display_description: "Hulk with Gauntlet (Purple Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698413534": {
    pop_name: "Hulk (Blue Chrome)",
    character: "Hulk",
    franchise: "Marvel",
    set_name: "Avengers: Endgame",
    number: "499",
    variant: "Blue Chrome",
    exclusivity: "Walmart",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Hulk (Blue Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame, Walmart exclusive.",
    display_description: "Hulk (Blue Chrome) is a Marvel Pop! Marvel release #499 from Avengers: Endgame, Walmart exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698556422": {
    pop_name: "Wanda Maximoff",
    character: "Wanda Maximoff",
    franchise: "Marvel",
    set_name: "Avengers: Endgame",
    number: "855",
    variant: "Glow in the Dark",
    exclusivity: "Pop In A Box",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Wanda Maximoff is a Marvel Pop! Marvel release #855 from Avengers: Endgame, Glow in the Dark Pop In A Box exclusive.",
    display_description: "Wanda Maximoff is a Marvel Pop! Marvel release #855 from Avengers: Endgame, Glow in the Dark Pop In A Box exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698543279": {
    pop_name: "Morgan Stark & Tony Stark",
    character: "Morgan Stark & Tony Stark",
    franchise: "Marvel",
    set_name: "Avengers: Endgame",
    variant: "Glow in the Dark",
    exclusivity: "Pop In A Box",
    pop_type: "Pop! Marvel",
    pop_style: "2-Pack",
    description: "Morgan Stark & Tony Stark is a Marvel Pop! Marvel 2-Pack from Avengers: Endgame, Glow in the Dark Pop In A Box exclusive.",
    display_description: "Morgan Stark & Tony Stark is a Marvel Pop! Marvel 2-Pack from Avengers: Endgame, Glow in the Dark Pop In A Box exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "849803058913": {
    pop_name: "Albus Dumbledore with Wand",
    character: "Albus Dumbledore",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "15",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Albus Dumbledore with Wand is a Harry Potter Pop! Movies release #15.",
    display_description: "Albus Dumbledore with Wand is a Harry Potter Pop! Movies release #15.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698800204": {
    pop_name: "Ron Weasley (Gingerbread)",
    character: "Ron Weasley",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "177",
    variant: "Gingerbread",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Ron Weasley (Gingerbread) is a Harry Potter Pop! Movies release #177.",
    display_description: "Ron Weasley (Gingerbread) is a Harry Potter Pop! Movies release #177.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698864343": {
    pop_name: "Harry Potter with Hourglass",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "180",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter with Hourglass is a Harry Potter Pop! Movies release #180.",
    display_description: "Harry Potter with Hourglass is a Harry Potter Pop! Movies release #180.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698864367": {
    pop_name: "Luna Lovegood (Party Dress)",
    character: "Luna Lovegood",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "182",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Luna Lovegood (Party Dress) is a Harry Potter Pop! Movies release #182.",
    display_description: "Luna Lovegood (Party Dress) is a Harry Potter Pop! Movies release #182.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698864374": {
    pop_name: "Puking Pastille Girl",
    character: "Puking Pastille Girl",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "185",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Puking Pastille Girl is a Harry Potter Pop! Movies release #185.",
    display_description: "Puking Pastille Girl is a Harry Potter Pop! Movies release #185.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698864381": {
    pop_name: "Horace Slughorn",
    character: "Horace Slughorn",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "186",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Horace Slughorn is a Wizarding World Pop! Movies release #186 from Harry Potter.",
    display_description: "Horace Slughorn is a Wizarding World Pop! Movies release #186 from Harry Potter.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698902670": {
    pop_name: "Aberforth Dumbledore",
    character: "Aberforth Dumbledore",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "190",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Aberforth Dumbledore is a Harry Potter Pop! Movies release #190.",
    display_description: "Aberforth Dumbledore is a Harry Potter Pop! Movies release #190.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698902700": {
    pop_name: "Helena Ravenclaw",
    character: "Helena Ravenclaw",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "192",
    variant: "Glow in the Dark",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Helena Ravenclaw is a Harry Potter Pop! Movies release #192, Glow in the Dark.",
    display_description: "Helena Ravenclaw is a Harry Potter Pop! Movies release #192, Glow in the Dark.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698871167": {
    pop_name: "Freddy Fazbear (10th Anniversary)",
    character: "Freddy Fazbear",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "1060",
    variant: "10th Anniversary",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Freddy Fazbear (10th Anniversary) is a Five Nights at Freddy's Pop! Games release #1060.",
    display_description: "Freddy Fazbear (10th Anniversary) is a Five Nights at Freddy's Pop! Games release #1060.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698862288": {
    pop_name: "Golden Age Superman",
    character: "Superman",
    franchise: "DC",
    set_name: "Superman: Shield Through the Ages",
    number: "609",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Golden Age Superman is a DC Pop! Heroes release #609 from Superman: Shield Through the Ages.",
    display_description: "Golden Age Superman is a DC Pop! Heroes release #609 from Superman: Shield Through the Ages.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698862295": {
    pop_name: "Superman '50",
    character: "Superman",
    franchise: "DC",
    set_name: "Superman: Shield Through the Ages",
    number: "610",
    variant: "Black & White",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Superman '50 is a DC Pop! Heroes release #610 from Superman: Shield Through the Ages.",
    display_description: "Superman '50 is a DC Pop! Heroes release #610 from Superman: Shield Through the Ages.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698862301": {
    pop_name: "Superman Fall of Sinestro",
    character: "Superman",
    franchise: "DC",
    set_name: "Superman: Shield Through the Ages",
    number: "611",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Superman Fall of Sinestro is a DC Pop! Heroes release #611 from Superman: Shield Through the Ages.",
    display_description: "Superman Fall of Sinestro is a DC Pop! Heroes release #611 from Superman: Shield Through the Ages.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698889551": {
    pop_name: "Superman Blackest Night",
    character: "Superman",
    franchise: "DC",
    set_name: "Superman: Shield Through the Ages",
    number: "612",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Superman Blackest Night is a DC Pop! Heroes release #612 from Superman: Shield Through the Ages.",
    display_description: "Superman Blackest Night is a DC Pop! Heroes release #612 from Superman: Shield Through the Ages.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698888165": {
    pop_name: "Superman (Breaking Chains)",
    character: "Superman",
    franchise: "DC",
    set_name: "Superman: Shield Through the Ages",
    number: "615",
    variant: "Glow in the Dark",
    exclusivity: "Target",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Superman (Breaking Chains) is a DC Pop! Heroes release #615 from Superman: Shield Through the Ages, Glow in the Dark Target exclusive.",
    display_description: "Superman (Breaking Chains) is a DC Pop! Heroes release #615 from Superman: Shield Through the Ages, Glow in the Dark Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698552905": {
    pop_name: "Atrociraptor (Panthera)",
    character: "Atrociraptor (Panthera)",
    franchise: "Jurassic Park",
    set_name: "Jurassic World: Dominion",
    number: "1216",
    exclusivity: "Target",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Atrociraptor (Panthera) is a Jurassic World: Dominion Pop! Movies release #1216, Target exclusive.",
    display_description: "Atrociraptor (Panthera) is a Jurassic World: Dominion Pop! Movies release #1216, Target exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698552912": {
    pop_name: "Atrociraptor (Red)",
    character: "Atrociraptor (Red)",
    franchise: "Jurassic Park",
    set_name: "Jurassic World: Dominion",
    number: "1217",
    exclusivity: "Books-A-Million",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Atrociraptor (Red) is a Jurassic World: Dominion Pop! Movies release #1217, Books-A-Million exclusive.",
    display_description: "Atrociraptor (Red) is a Jurassic World: Dominion Pop! Movies release #1217, Books-A-Million exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698622257": {
    pop_name: "Ellie Sattler",
    character: "Ellie Sattler",
    franchise: "Jurassic Park",
    set_name: "Jurassic World: Dominion",
    number: "1214",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Ellie Sattler is a Jurassic World: Dominion Pop! Movies release #1214.",
    display_description: "Ellie Sattler is a Jurassic World: Dominion Pop! Movies release #1214.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698622233": {
    pop_name: "Velociraptors (Blue & Beta)",
    character: "Velociraptors (Blue & Beta)",
    franchise: "Jurassic Park",
    set_name: "Jurassic World: Dominion",
    number: "1212",
    pop_type: "Pop! Movies",
    pop_style: "Pop! & Buddy",
    description: "Velociraptors (Blue & Beta) is a Jurassic World: Dominion Pop! Movies release #1212.",
    display_description: "Velociraptors (Blue & Beta) is a Jurassic World: Dominion Pop! Movies release #1212.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698632270": {
    pop_name: "Therizinosaurus, Giganotosaurus & T. Rex",
    character: "Therizinosaurus, Giganotosaurus & T. Rex",
    franchise: "Jurassic Park",
    set_name: "Jurassic World: Dominion",
    exclusivity: "Exclusive",
    pop_type: "Pop! Movies",
    pop_style: "3-Pack",
    description: "Therizinosaurus, Giganotosaurus & T. Rex is a Jurassic World: Dominion Pop! Movies 3-Pack exclusive.",
    display_description: "Therizinosaurus, Giganotosaurus & T. Rex is a Jurassic World: Dominion Pop! Movies 3-Pack exclusive.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698866583": {
    pop_name: "Aquilops",
    character: "Aquilops",
    franchise: "Jurassic Park",
    set_name: "Jurassic World: Rebirth",
    number: "1802",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Aquilops is a Jurassic World: Rebirth Pop! Movies release #1802.",
    display_description: "Aquilops is a Jurassic World: Rebirth Pop! Movies release #1802.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "849803057398": {
    pop_name: "Thanos",
    character: "Thanos",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy",
    number: "78",
    variant: "Glow in the Dark",
    exclusivity: "Entertainment Earth",
    pop_type: "Pop! Marvel",
    pop_style: "Jumbo",
    description: "Thanos is a Guardians of the Galaxy Pop! Marvel 6-inch release #78, Glow in the Dark Entertainment Earth exclusive.",
    display_description: "Thanos is a Guardians of the Galaxy Pop! Marvel 6-inch release #78, Glow in the Dark Entertainment Earth exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698344616": {
    pop_name: "Rocket Raccoon (Classic)",
    character: "Rocket Raccoon",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy",
    number: "396",
    variant: "Classic",
    exclusivity: "PX Previews",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Rocket Raccoon (Classic) is a Guardians of the Galaxy Pop! Marvel release #396, PX Previews exclusive.",
    display_description: "Rocket Raccoon (Classic) is a Guardians of the Galaxy Pop! Marvel release #396, PX Previews exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698736411": {
    pop_name: "Star-Lord",
    character: "Star-Lord",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 3",
    number: "1201",
    variant: "Glow in the Dark",
    exclusivity: "Funko",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Star-Lord is a Marvel Pop! Marvel release #1201 from Guardians of the Galaxy Vol. 3, Glow in the Dark Funko exclusive.",
    display_description: "Star-Lord is a Marvel Pop! Marvel release #1201 from Guardians of the Galaxy Vol. 3, Glow in the Dark Funko exclusive.",
    parse_confidence: 0.9,
    needs_review: false,
  },
  "889698710619": {
    pop_name: "Cosmo",
    character: "Cosmo",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 3",
    number: "1207",
    variant: "Flocked",
    exclusivity: "Funko",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Cosmo is a Marvel Pop! Marvel release #1207 from Guardians of the Galaxy Vol. 3, Flocked Funko exclusive.",
    display_description: "Cosmo is a Marvel Pop! Marvel release #1207 from Guardians of the Galaxy Vol. 3, Flocked Funko exclusive.",
    parse_confidence: 0.9,
    needs_review: false,
  },
  "889698669030": {
    pop_name: "Star-Lord with Groot",
    character: "Star-Lord",
    franchise: "Marvel",
    set_name: "The Guardians of the Galaxy Holiday Special",
    number: "1125",
    variant: "Holiday",
    exclusivity: "Funko",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Star-Lord with Groot is a Marvel Pop! Marvel release #1125 from The Guardians of the Galaxy Holiday Special, Funko exclusive.",
    display_description: "Star-Lord with Groot is a Marvel Pop! Marvel release #1125 from The Guardians of the Galaxy Holiday Special, Funko exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698649261": {
    pop_name: "Groot",
    character: "Groot",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy",
    number: "12",
    exclusivity: "Target",
    pop_type: "Pop! Marvel",
    pop_style: "Comic Cover",
    description: "Groot is a Guardians of the Galaxy Pop! Marvel Comic Cover release #12, Target exclusive.",
    display_description: "Groot is a Guardians of the Galaxy Pop! Marvel Comic Cover release #12, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698797665": {
    pop_name: "Deadpool with Swords",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool & Wolverine",
    number: "1362",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool with Swords is a Marvel Pop! Marvel release #1362 from Deadpool & Wolverine.",
    display_description: "Deadpool with Swords is a Marvel Pop! Marvel release #1362 from Deadpool & Wolverine.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698823821": {
    pop_name: "Wolverine (with Babypool)",
    character: "Wolverine",
    franchise: "Marvel",
    set_name: "Deadpool & Wolverine",
    number: "1403",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Wolverine (with Babypool) is a Marvel Pop! Marvel release #1403 from Deadpool & Wolverine.",
    display_description: "Wolverine (with Babypool) is a Marvel Pop! Marvel release #1403 from Deadpool & Wolverine.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698850742": {
    pop_name: "Ladypool",
    character: "Ladypool",
    franchise: "Marvel",
    set_name: "Deadpool & Wolverine",
    number: "1404",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Ladypool is a Marvel Pop! Marvel release #1404 from Deadpool & Wolverine.",
    display_description: "Ladypool is a Marvel Pop! Marvel release #1404 from Deadpool & Wolverine.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698852890": {
    pop_name: "Ladypool",
    character: "Ladypool",
    franchise: "Marvel",
    set_name: "Deadpool & Wolverine",
    number: "1404",
    variant: "Diamond Collection",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Ladypool is a Marvel Pop! Marvel release #1404 from Deadpool & Wolverine, Diamond Collection Funko Shop exclusive.",
    display_description: "Ladypool is a Marvel Pop! Marvel release #1404 from Deadpool & Wolverine, Diamond Collection Funko Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698849067": {
    pop_name: "Wade Wilson (Assistant to the Assistant Regional Manager, DriveMax)",
    character: "Wade Wilson",
    franchise: "Marvel",
    set_name: "Deadpool & Wolverine",
    number: "1470",
    exclusivity: "Target",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Wade Wilson is a Marvel Pop! Marvel release #1470 from Deadpool & Wolverine, Target exclusive.",
    display_description: "Wade Wilson is a Marvel Pop! Marvel release #1470 from Deadpool & Wolverine, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698848497": {
    pop_name: "X-23 (Sunglasses)",
    character: "X-23",
    franchise: "Marvel",
    set_name: "Deadpool & Wolverine",
    number: "1497",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "X-23 (Sunglasses) is a Marvel Pop! Marvel release #1497 from Deadpool & Wolverine.",
    display_description: "X-23 (Sunglasses) is a Marvel Pop! Marvel release #1497 from Deadpool & Wolverine.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698886444": {
    pop_name: "Elektra with Sai (Metallic)",
    character: "Elektra",
    franchise: "Marvel",
    set_name: "Deadpool & Wolverine",
    number: "1498",
    variant: "Metallic",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Elektra with Sai (Metallic) is a Marvel Pop! Marvel release #1498 from Deadpool & Wolverine, Funko Shop exclusive.",
    display_description: "Elektra with Sai (Metallic) is a Marvel Pop! Marvel release #1498 from Deadpool & Wolverine, Funko Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698893275": {
    pop_name: "Wolverine (Finale)",
    character: "Wolverine",
    franchise: "Marvel",
    set_name: "Deadpool & Wolverine",
    number: "1566",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Plus",
    pop_style: "Plus",
    description: "Wolverine (Finale) is a Marvel Pop! Plus release #1566 from Deadpool & Wolverine, Funko Shop exclusive.",
    display_description: "Wolverine (Finale) is a Marvel Pop! Plus release #1566 from Deadpool & Wolverine, Funko Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698565592": {
    pop_style: "Die-Cast",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698743013": {
    pop_style: "Die-Cast",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698851923": {
    pop_name: "Yoda with Lightsaber",
    character: "Yoda",
    franchise: "Star Wars",
    set_name: "Star Wars Die-Cast",
    number: "3",
    pop_type: "Pop! Die-Cast",
    pop_style: "Die-Cast",
    description: "Yoda with Lightsaber is a Star Wars Pop! Die-Cast release #3.",
    display_description: "Yoda with Lightsaber is a Star Wars Pop! Die-Cast release #3.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698715126": {
    pop_name: "Princess Leia, R2-D2, C-3PO and Mystery Bitty Pop! 4-Pack",
    character: "Princess Leia, R2-D2, C-3PO",
    franchise: "Star Wars",
    set_name: "Star Wars Bitty Pop!",
    number: "13",
    pop_type: "Bitty Pop!",
    pop_style: "Mini",
    description: "Princess Leia, R2-D2, C-3PO and Mystery Bitty Pop! 4-Pack is a Star Wars Bitty Pop! release.",
    display_description: "Princess Leia, R2-D2, C-3PO and Mystery Bitty Pop! 4-Pack is a Star Wars Bitty Pop! release.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698419048": {
    pop_name: "Yoda (Green Chrome)",
    character: "Yoda",
    franchise: "Star Wars",
    set_name: "Star Wars Chrome",
    number: "124",
    variant: "Green Chrome",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Yoda (Green Chrome) is a Star Wars Pop! Star Wars release #124, Summer Convention exclusive.",
    display_description: "Yoda (Green Chrome) is a Star Wars Pop! Star Wars release #124, Summer Convention exclusive.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698716123": {
    pop_name: "Darth Vader (Diamond Collection)",
    character: "Darth Vader",
    franchise: "Star Wars",
    set_name: "Star Wars Diamond Collection",
    number: "626",
    variant: "Diamond Collection",
    exclusivity: "Funko Hollywood",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Darth Vader (Diamond Collection) is a Star Wars Pop! Star Wars release #626, Funko Hollywood exclusive.",
    display_description: "Darth Vader (Diamond Collection) is a Star Wars Pop! Star Wars release #626, Funko Hollywood exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698123785": {
    pop_name: "Battle of the Bastards",
    character: "Jon Snow & Ramsay Bolton",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    pop_type: "Pop! Television",
    pop_style: "2-Pack",
    description: "Battle of the Bastards is a Game of Thrones Pop! Television 2-Pack featuring Jon Snow and Ramsay Bolton.",
    display_description: "Battle of the Bastards is a Game of Thrones Pop! Television 2-Pack featuring Jon Snow and Ramsay Bolton.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698355988": {
    pop_name: "J.D.",
    character: "J.D.",
    franchise: "Scrubs",
    set_name: "Scrubs",
    number: "737",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "From Scrubs, J.D. is a Pop! Television release #737.",
    display_description: "From Scrubs, J.D. is a Pop! Television release #737.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698416993": {
    pop_name: "Howard as Batman",
    character: "Howard Wolowitz",
    franchise: "The Big Bang Theory",
    set_name: "The Big Bang Theory",
    number: "834",
    variant: "Batman",
    exclusivity: "San Diego Comic-Con",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Howard as Batman is a The Big Bang Theory Pop! Television release #834, San Diego Comic-Con exclusive.",
    display_description: "Howard as Batman is a The Big Bang Theory Pop! Television release #834, San Diego Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698417037": {
    pop_name: "Sheldon Cooper as The Flash",
    character: "Sheldon Cooper",
    franchise: "The Big Bang Theory",
    set_name: "The Big Bang Theory",
    number: "833",
    variant: "The Flash",
    exclusivity: "San Diego Comic-Con",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Sheldon Cooper as The Flash is a The Big Bang Theory Pop! Television release #833, San Diego Comic-Con exclusive.",
    display_description: "Sheldon Cooper as The Flash is a The Big Bang Theory Pop! Television release #833, San Diego Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698417082": {
    pop_name: "Leonard as Green Lantern",
    character: "Leonard Hofstadter",
    franchise: "The Big Bang Theory",
    set_name: "The Big Bang Theory",
    number: "836",
    variant: "Green Lantern",
    exclusivity: "San Diego Comic-Con",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Leonard as Green Lantern is a The Big Bang Theory Pop! Television release #836, San Diego Comic-Con exclusive.",
    display_description: "Leonard as Green Lantern is a The Big Bang Theory Pop! Television release #836, San Diego Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698889049": {
    pop_name: "Silver as the Green Lantern",
    character: "Silver as the Green Lantern",
    franchise: "Sonic the Hedgehog",
    set_name: "Justice League x Sonic the Hedgehog",
    number: "592",
    exclusivity: "Target",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Silver as the Green Lantern is a Justice League x Sonic the Hedgehog Pop! Heroes release #592, Target exclusive.",
    display_description: "Silver as the Green Lantern is a Justice League x Sonic the Hedgehog Pop! Heroes release #592, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698560146": {
    pop_name: "Peacemaker",
    character: "Peacemaker",
    franchise: "DC",
    set_name: "The Suicide Squad",
    number: "1110",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Peacemaker is a DC Pop! Movies release #1110 from The Suicide Squad.",
    display_description: "Peacemaker is a DC Pop! Movies release #1110 from The Suicide Squad.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "849803086602": {
    pop_name: "The Joker (Boxer)",
    character: "The Joker",
    franchise: "DC",
    set_name: "Suicide Squad",
    number: "104",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "The Joker (Boxer) is a DC Pop! Movies release #104 from Suicide Squad.",
    display_description: "The Joker (Boxer) is a DC Pop! Movies release #104 from Suicide Squad.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "849803087418": {
    pop_name: "Harley Quinn (HQ Inmate)",
    character: "Harley Quinn",
    franchise: "DC",
    set_name: "Suicide Squad",
    number: "105",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harley Quinn (HQ Inmate) is a DC Pop! Movies release #105 from Suicide Squad.",
    display_description: "Harley Quinn (HQ Inmate) is a DC Pop! Movies release #105 from Suicide Squad.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "849803083601": {
    pop_name: "Deadshot (Masked)",
    character: "Deadshot",
    franchise: "DC",
    set_name: "Suicide Squad",
    number: "106",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Deadshot (Masked) is a DC Pop! Movies release #106 from Suicide Squad.",
    display_description: "Deadshot (Masked) is a DC Pop! Movies release #106 from Suicide Squad.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "849803086619": {
    pop_name: "The Joker (Suit)",
    character: "The Joker",
    franchise: "DC",
    set_name: "Suicide Squad",
    number: "107",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "The Joker (Suit) is a DC Pop! Movies release #107 from Suicide Squad.",
    display_description: "The Joker (Suit) is a DC Pop! Movies release #107 from Suicide Squad.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "849803086589": {
    pop_name: "Harley Quinn (Gown)",
    character: "Harley Quinn",
    franchise: "DC",
    set_name: "Suicide Squad",
    number: "108",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harley Quinn (Gown) is a DC Pop! Movies release #108 from Suicide Squad.",
    display_description: "Harley Quinn (Gown) is a DC Pop! Movies release #108 from Suicide Squad.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "849803096397": {
    pop_name: "Batman (Underwater)",
    character: "Batman",
    franchise: "DC",
    set_name: "Suicide Squad",
    number: "131",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Batman (Underwater) is a DC Pop! Movies release #131 from Suicide Squad.",
    display_description: "Batman (Underwater) is a DC Pop! Movies release #131 from Suicide Squad.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698114387": {
    pop_name: "Killer Croc (Hooded)",
    character: "Killer Croc",
    franchise: "DC",
    set_name: "Suicide Squad",
    number: "150",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Killer Croc (Hooded) is a DC Pop! Movies release #150 from Suicide Squad.",
    display_description: "Killer Croc (Hooded) is a DC Pop! Movies release #150 from Suicide Squad.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698144872": {
    pop_name: "Batman (Jokerized)",
    character: "Batman",
    franchise: "DC",
    set_name: "Suicide Squad",
    number: "188",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Batman (Jokerized) is a DC Pop! Movies release #188 from Suicide Squad.",
    display_description: "Batman (Jokerized) is a DC Pop! Movies release #188 from Suicide Squad.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698464567": {
    pop_name: "Venomized Captain Marvel",
    character: "Captain Marvel",
    franchise: "Marvel",
    set_name: "Spider-Man: Maximum Venom",
    number: "599",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Venomized Captain Marvel is a Marvel Pop! Marvel release #599 from Spider-Man: Maximum Venom.",
    display_description: "Venomized Captain Marvel is a Marvel Pop! Marvel release #599 from Spider-Man: Maximum Venom.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698537926": {
    pop_name: "Venomized Doctor Strange",
    character: "Doctor Strange",
    franchise: "Marvel",
    set_name: "Venom",
    number: "750",
    variant: "Glow in the Dark",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Venomized Doctor Strange is a Marvel Pop! Marvel release #750 from Venom, Glow in the Dark variant.",
    display_description: "Venomized Doctor Strange is a Marvel Pop! Marvel release #750 from Venom, Glow in the Dark variant.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698632577": {
    pop_name: "King Shark",
    character: "King Shark",
    franchise: "DC",
    set_name: "The Suicide Squad",
    number: "1114",
    variant: "Metallic",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "King Shark is a DC Pop! Movies release #1114 from The Suicide Squad, Metallic variant.",
    display_description: "King Shark is a DC Pop! Movies release #1114 from The Suicide Squad, Metallic variant.",
    parse_confidence: 0.86,
    needs_review: false,
  },
  "889698565547": {
    pop_name: "Bloodsport (Unmasked)",
    character: "Bloodsport",
    franchise: "DC",
    set_name: "The Suicide Squad",
    number: "1118",
    variant: "Unmasked",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Bloodsport (Unmasked) is a DC Pop! Movies release #1118 from The Suicide Squad.",
    display_description: "Bloodsport (Unmasked) is a DC Pop! Movies release #1118 from The Suicide Squad.",
    parse_confidence: 0.9,
    needs_review: false,
  },
  "889698326872": {
    pop_name: "Venomized Iron Man",
    character: "Iron Man",
    franchise: "Marvel",
    set_name: "Venom",
    number: "365",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Venomized Iron Man is a Marvel Pop! Marvel release #365 from Venom.",
    display_description: "Venomized Iron Man is a Marvel Pop! Marvel release #365 from Venom.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698326896": {
    pop_name: "Venomized Ghost Rider",
    character: "Ghost Rider",
    franchise: "Marvel",
    set_name: "Venom",
    number: "369",
    variant: "Blue",
    exclusivity: "Walmart",
    pop_type: "Pop! Rides",
    pop_style: "Ride",
    description: "Venomized Ghost Rider is a Marvel Pop! Rides release #369 from Venom, Blue Walmart variant.",
    display_description: "Venomized Ghost Rider is a Marvel Pop! Rides release #369 from Venom, Blue Walmart variant.",
    parse_confidence: 0.9,
    needs_review: false,
  },
  "889698562768": {
    pop_name: "Poison Captain America",
    character: "Captain America",
    franchise: "Marvel",
    set_name: "Venom",
    number: "856",
    exclusivity: "Exclusive",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Poison Captain America is a Marvel Pop! Marvel release #856 from Venom.",
    display_description: "Poison Captain America is a Marvel Pop! Marvel release #856 from Venom.",
    parse_confidence: 0.9,
    needs_review: false,
  },
  "889698581851": {
    pop_name: "Venomized Jack O' Lantern",
    character: "Jack O' Lantern",
    franchise: "Marvel",
    set_name: "Venom",
    number: "922",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Venomized Jack O' Lantern is a Marvel Pop! Marvel release #922 from Venom.",
    display_description: "Venomized Jack O' Lantern is a Marvel Pop! Marvel release #922 from Venom.",
    parse_confidence: 0.9,
    needs_review: false,
  },
  "8969814808": {
    pop_name: "Venom",
    character: "Venom",
    franchise: "Marvel",
    set_name: "Marvel Universe",
    number: "234",
    variant: "Blue",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Venom is a Marvel Universe Pop! Marvel release #234, Blue Hot Topic variant.",
    display_description: "Venom is a Marvel Universe Pop! Marvel release #234, Blue Hot Topic variant.",
    parse_confidence: 0.86,
    needs_review: false,
  },
  "889698365208": {
    pop_name: "Deadpool / Venom",
    character: "Deadpool / Venom",
    franchise: "Marvel",
    set_name: "Marvel Universe",
    number: "667",
    variant: "Metallic",
    exclusivity: "Pop In A Box",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool / Venom is a Marvel Universe Pop! Marvel release #667, Metallic Pop In A Box exclusive.",
    display_description: "Deadpool / Venom is a Marvel Universe Pop! Marvel release #667, Metallic Pop In A Box exclusive.",
    parse_confidence: 0.82,
    needs_review: false,
  },
  "889698682473": {
    pop_name: "Venom",
    character: "Venom",
    franchise: "Marvel",
    set_name: "Venom",
    number: "1141",
    variant: "Glow in the Dark",
    exclusivity: "Funko",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Venom is a Marvel Pop! Marvel release #1141 from Venom, Glow in the Dark Funko exclusive.",
    display_description: "Venom is a Marvel Pop! Marvel release #1141 from Venom, Glow in the Dark Funko exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "8969884452": {
    pop_name: "Venom with Ooze",
    character: "Venom",
    franchise: "Marvel",
    set_name: "Venom",
    number: "1469",
    variant: "Glow in the Dark",
    exclusivity: "Entertainment Earth",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Venom with Ooze is a Marvel Pop! Marvel release #1469 from Venom, Glow in the Dark Entertainment Earth exclusive.",
    display_description: "Venom with Ooze is a Marvel Pop! Marvel release #1469 from Venom, Glow in the Dark Entertainment Earth exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698469579": {
    pop_name: "Star-Lord with Power Stone",
    character: "Star-Lord",
    franchise: "Marvel",
    set_name: "The Infinity Saga",
    number: "611",
    variant: "Glow in the Dark",
    exclusivity: "Marvel Collector Corps",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Star-Lord with Power Stone is a Marvel Pop! Marvel release #611 from The Infinity Saga, Glow in the Dark Marvel Collector Corps exclusive.",
    display_description: "Star-Lord with Power Stone is a Marvel Pop! Marvel release #611 from The Infinity Saga, Glow in the Dark Marvel Collector Corps exclusive.",
    parse_confidence: 0.9,
    needs_review: false,
  },
  "889698127844": {
    pop_name: "Star-Lord (Masked)",
    character: "Star-Lord",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 2",
    number: "198",
    variant: "Chase",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Star-Lord (Masked) is a Marvel Pop! Marvel release #198 from Guardians of the Galaxy Vol. 2, Chase variant.",
    display_description: "Star-Lord (Masked) is a Marvel Pop! Marvel release #198 from Guardians of the Galaxy Vol. 2, Chase variant.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698132701": {
    pop_name: "Rocket (Jetpack)",
    character: "Rocket",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 2",
    number: "201",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Rocket (Jetpack) is a Marvel Pop! Marvel release #201 from Guardians of the Galaxy Vol. 2.",
    display_description: "Rocket (Jetpack) is a Marvel Pop! Marvel release #201 from Guardians of the Galaxy Vol. 2.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698131551": {
    pop_name: "Nebula",
    character: "Nebula",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 2",
    number: "203",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Nebula is a Marvel Pop! Marvel release #203 from Guardians of the Galaxy Vol. 2.",
    display_description: "Nebula is a Marvel Pop! Marvel release #203 from Guardians of the Galaxy Vol. 2.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698127806": {
    pop_name: "Taserface",
    character: "Taserface",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 2",
    number: "206",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Taserface is a Marvel Pop! Marvel release #206 from Guardians of the Galaxy Vol. 2.",
    display_description: "Taserface is a Marvel Pop! Marvel release #206 from Guardians of the Galaxy Vol. 2.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698127738": {
    pop_name: "Groot (Shield)",
    character: "Groot",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 2",
    number: "208",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Groot (Shield) is a Marvel Pop! Marvel release #208 from Guardians of the Galaxy Vol. 2.",
    display_description: "Groot (Shield) is a Marvel Pop! Marvel release #208 from Guardians of the Galaxy Vol. 2.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698214643": {
    pop_name: "Drax (with Groot)",
    character: "Drax",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 2",
    number: "262",
    exclusivity: "FYE",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Drax (with Groot) is a Marvel Pop! Marvel release #262 from Guardians of the Galaxy Vol. 2, FYE exclusive.",
    display_description: "Drax (with Groot) is a Marvel Pop! Marvel release #262 from Guardians of the Galaxy Vol. 2, FYE exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698248785": {
    pop_name: "Groot (Eye)",
    character: "Groot",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 2",
    number: "280",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Groot (Eye) is a Marvel Pop! Marvel release #280 from Guardians of the Galaxy Vol. 2.",
    display_description: "Groot (Eye) is a Marvel Pop! Marvel release #280 from Guardians of the Galaxy Vol. 2.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698708593": {
    pop_name: "Groot (with Bomb)",
    character: "Groot",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 2",
    number: "1222",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Groot (with Bomb) is a Marvel Pop! Marvel release #1222 from Guardians of the Galaxy Vol. 2.",
    display_description: "Groot (with Bomb) is a Marvel Pop! Marvel release #1222 from Guardians of the Galaxy Vol. 2.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698675109": {
    pop_name: "Groot",
    character: "Groot",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 3",
    number: "1203",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Groot is a Marvel Pop! Marvel release #1203 from Guardians of the Galaxy Vol. 3.",
    display_description: "Groot is a Marvel Pop! Marvel release #1203 from Guardians of the Galaxy Vol. 3.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698687263": {
    pop_name: "Groot (Wings)",
    character: "Groot",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 3",
    number: "1213",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Groot (Wings) is a Marvel Pop! Marvel release #1213 from Guardians of the Galaxy Vol. 3, Funko Shop exclusive.",
    display_description: "Groot (Wings) is a Marvel Pop! Marvel release #1213 from Guardians of the Galaxy Vol. 3, Funko Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698680509": {
    pop_name: "Mantis (Green Suit)",
    character: "Mantis",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 3",
    number: "1212",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Mantis (Green Suit) is a Marvel Pop! Marvel release #1212 from Guardians of the Galaxy Vol. 3.",
    display_description: "Mantis (Green Suit) is a Marvel Pop! Marvel release #1212 from Guardians of the Galaxy Vol. 3.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698675130": {
    pop_name: "Adam Warlock",
    character: "Adam Warlock",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 3",
    number: "1214",
    exclusivity: "Collectors Corps",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Adam Warlock is a Marvel Pop! Marvel release #1214 from Guardians of the Galaxy Vol. 3, Collectors Corps exclusive.",
    display_description: "Adam Warlock is a Marvel Pop! Marvel release #1214 from Guardians of the Galaxy Vol. 3, Collectors Corps exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698680547": {
    pop_name: "Ayesha",
    character: "Ayesha",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 3",
    number: "1215",
    exclusivity: "Collectors Corps",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Ayesha is a Marvel Pop! Marvel release #1215 from Guardians of the Galaxy Vol. 3, Collectors Corps exclusive.",
    display_description: "Ayesha is a Marvel Pop! Marvel release #1215 from Guardians of the Galaxy Vol. 3, Collectors Corps exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698740999": {
    pop_name: "The High Evolutionary",
    character: "The High Evolutionary",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Vol. 3",
    number: "1289",
    variant: "Metallic",
    exclusivity: "New York Comic Con",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "The High Evolutionary is a Marvel Pop! Marvel release #1289 from Guardians of the Galaxy Vol. 3, Metallic New York Comic Con exclusive.",
    display_description: "The High Evolutionary is a Marvel Pop! Marvel release #1289 from Guardians of the Galaxy Vol. 3, Metallic New York Comic Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698642552": {
    pop_name: "Mr. Knight",
    character: "Mr. Knight",
    franchise: "Marvel",
    set_name: "Moon Knight",
    number: "1048",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Mr. Knight is a Marvel Pop! Marvel release #1048 from Moon Knight.",
    display_description: "Mr. Knight is a Marvel Pop! Marvel release #1048 from Moon Knight.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698648974": {
    pop_name: "Mr. Knight",
    character: "Mr. Knight",
    franchise: "Marvel",
    set_name: "Moon Knight",
    number: "1048",
    variant: "Glow in the Dark",
    exclusivity: "Walmart",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Mr. Knight is a Marvel Pop! Marvel release #1048 from Moon Knight, Glow in the Dark Walmart exclusive.",
    display_description: "Mr. Knight is a Marvel Pop! Marvel release #1048 from Moon Knight, Glow in the Dark Walmart exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698642545": {
    pop_name: "Moon Knight (Kicking)",
    character: "Moon Knight",
    franchise: "Marvel",
    set_name: "Moon Knight",
    number: "1047",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Moon Knight (Kicking) is a Marvel Pop! Marvel release #1047 from Moon Knight.",
    display_description: "Moon Knight (Kicking) is a Marvel Pop! Marvel release #1047 from Moon Knight.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698648837": {
    pop_name: "Temple of Khonshu Statue",
    character: "Khonshu",
    franchise: "Marvel",
    set_name: "Moon Knight",
    number: "1053",
    exclusivity: "Target",
    pop_type: "Pop! Marvel",
    pop_style: "Jumbo",
    description: "Temple of Khonshu Statue is a Marvel Pop! Marvel Jumbo release #1053 from Moon Knight, Target exclusive.",
    display_description: "Temple of Khonshu Statue is a Marvel Pop! Marvel Jumbo release #1053 from Moon Knight, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698747745": {
    pop_name: "Moon Knight (Unmasked)",
    character: "Moon Knight",
    franchise: "Marvel",
    set_name: "Moon Knight",
    number: "1302",
    variant: "Glow in the Dark",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Moon Knight (Unmasked) is a Marvel Pop! Marvel release #1302 from Moon Knight, Glow in the Dark variant.",
    display_description: "Moon Knight (Unmasked) is a Marvel Pop! Marvel release #1302 from Moon Knight, Glow in the Dark variant.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698653329": {
    pop_name: "Scarlet Scarab",
    character: "Scarlet Scarab",
    franchise: "Marvel",
    set_name: "Moon Knight",
    number: "1093",
    exclusivity: "San Diego Comic-Con",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Scarlet Scarab is a Marvel Pop! Marvel release #1093 from Moon Knight, San Diego Comic-Con exclusive.",
    display_description: "Scarlet Scarab is a Marvel Pop! Marvel release #1093 from Moon Knight, San Diego Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698213783": {
    pop_name: "Moon Knight",
    character: "Moon Knight",
    franchise: "Marvel",
    set_name: "Moon Knight (Comics)",
    number: "266",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Moon Knight is a Marvel Pop! Marvel release #266 from Moon Knight (Comics), Hot Topic exclusive.",
    display_description: "Moon Knight is a Marvel Pop! Marvel release #266 from Moon Knight (Comics), Hot Topic exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698687300": {
    pop_name: "Mr. Knight",
    character: "Mr. Knight",
    franchise: "Marvel",
    set_name: "Moon Knight (Comics)",
    number: "1199",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Deluxe",
    pop_style: "Deluxe",
    description: "Mr. Knight is a Marvel Pop! Deluxe release #1199 from Moon Knight (Comics), Funko Shop exclusive.",
    display_description: "Mr. Knight is a Marvel Pop! Deluxe release #1199 from Moon Knight (Comics), Funko Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698615006": {
    pop_name: "Moon Knight",
    character: "Moon Knight",
    franchise: "Marvel",
    set_name: "Moon Knight (Comics)",
    number: "8",
    pop_type: "Pop! Comic Covers",
    pop_style: "Comic Cover",
    description: "Moon Knight is a Marvel Pop! Comic Covers release #8 from Moon Knight (Comics).",
    display_description: "Moon Knight is a Marvel Pop! Comic Covers release #8 from Moon Knight (Comics).",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698211116": {
    pop_name: "Moon Knight",
    character: "Moon Knight",
    franchise: "Marvel",
    set_name: "Moon Knight (Comics)",
    number: "272",
    exclusivity: "Walgreens",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Moon Knight is a Marvel Pop! Marvel release #272 from Moon Knight (Comics), Walgreens exclusive.",
    display_description: "Moon Knight is a Marvel Pop! Marvel release #272 from Moon Knight (Comics), Walgreens exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698692335": {
    pop_name: "Darkwing Duck",
    character: "Darkwing Duck",
    franchise: "Darkwing Duck",
    set_name: "Darkwing Duck",
    number: "1328",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Darkwing Duck is a Darkwing Duck Pop! Disney release #1328, Funko Shop exclusive.",
    display_description: "Darkwing Duck is a Darkwing Duck Pop! Disney release #1328, Funko Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698132619": {
    pop_name: "Launchpad McQuack",
    character: "Launchpad McQuack",
    franchise: "Darkwing Duck",
    set_name: "Darkwing Duck",
    number: "297",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Launchpad McQuack is a Darkwing Duck Pop! Disney release #297.",
    display_description: "Launchpad McQuack is a Darkwing Duck Pop! Disney release #297.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698136082": {
    pop_name: "Gosalyn Mallard",
    character: "Gosalyn Mallard",
    franchise: "Darkwing Duck",
    set_name: "Darkwing Duck",
    number: "298",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Gosalyn Mallard is a Darkwing Duck Pop! Disney release #298.",
    display_description: "Gosalyn Mallard is a Darkwing Duck Pop! Disney release #298.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698348256": {
    pop_name: "Megavolt",
    character: "Megavolt",
    franchise: "Darkwing Duck",
    set_name: "Darkwing Duck",
    number: "463",
    exclusivity: "GameStop",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Megavolt is a Darkwing Duck Pop! Disney release #463, GameStop exclusive.",
    display_description: "Megavolt is a Darkwing Duck Pop! Disney release #463, GameStop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698707282": {
    pop_name: "Shauna Sadecki",
    character: "Shauna Sadecki",
    franchise: "Yellowjackets",
    set_name: "Yellowjackets",
    number: "1449",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    release_date: "2023-01-01",
    description: "Shauna Sadecki is a Yellowjackets Pop! Television release #1449.",
    display_description: "Shauna Sadecki is a Yellowjackets Pop! Television release #1449.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698707244": {
    pop_name: "Jackie Taylor",
    character: "Jackie Taylor",
    franchise: "Yellowjackets",
    set_name: "Yellowjackets",
    number: "1450",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    release_date: "2023-01-01",
    description: "Jackie Taylor is a Yellowjackets Pop! Television release #1450.",
    display_description: "Jackie Taylor is a Yellowjackets Pop! Television release #1450.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698707268": {
    pop_name: "Misty Quigley",
    character: "Misty Quigley",
    franchise: "Yellowjackets",
    set_name: "Yellowjackets",
    number: "1451",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    release_date: "2023-01-01",
    description: "Misty Quigley is a Yellowjackets Pop! Television release #1451.",
    display_description: "Misty Quigley is a Yellowjackets Pop! Television release #1451.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698707299": {
    pop_name: "Taissa Turner",
    character: "Taissa Turner",
    franchise: "Yellowjackets",
    set_name: "Yellowjackets",
    number: "1452",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    release_date: "2023-01-01",
    description: "Taissa Turner is a Yellowjackets Pop! Television release #1452.",
    display_description: "Taissa Turner is a Yellowjackets Pop! Television release #1452.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698707275": {
    pop_name: "Natalie Scatorccio",
    character: "Natalie Scatorccio",
    franchise: "Yellowjackets",
    set_name: "Yellowjackets",
    number: "1453",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    release_date: "2023-01-01",
    description: "Natalie Scatorccio is a Yellowjackets Pop! Television release #1453.",
    display_description: "Natalie Scatorccio is a Yellowjackets Pop! Television release #1453.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698707251": {
    pop_name: "Lottie Matthews",
    character: "Lottie Matthews",
    franchise: "Yellowjackets",
    set_name: "Yellowjackets",
    number: "1454",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    release_date: "2023-01-01",
    description: "Lottie Matthews is a Yellowjackets Pop! Television release #1454.",
    display_description: "Lottie Matthews is a Yellowjackets Pop! Television release #1454.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698707305": {
    pop_name: "Van Palmer",
    character: "Van Palmer",
    franchise: "Yellowjackets",
    set_name: "Yellowjackets",
    number: "1455",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    release_date: "2023-01-01",
    description: "Van Palmer is a Yellowjackets Pop! Television release #1455.",
    display_description: "Van Palmer is a Yellowjackets Pop! Television release #1455.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698707237": {
    pop_name: "Ben Scott",
    character: "Ben Scott",
    franchise: "Yellowjackets",
    set_name: "Yellowjackets",
    number: "1456",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    release_date: "2023-01-01",
    description: "Ben Scott is a Yellowjackets Pop! Television release #1456.",
    display_description: "Ben Scott is a Yellowjackets Pop! Television release #1456.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698740869": {
    pop_name: "Darth Maul & Gar Saxon (Glows In The Dark)",
    character: "Darth Maul & Gar Saxon",
    franchise: "Star Wars",
    set_name: "Star Wars: The Clone Wars",
    number: null,
    variant: "Glow in the Dark",
    exclusivity: "Exclusive",
    pop_type: "Pop! Sets",
    pop_style: "2-Pack",
    description: "Darth Maul & Gar Saxon is a Star Wars Pop! Sets 2-Pack from Star Wars: The Clone Wars, Glow in the Dark exclusive.",
    display_description: "Darth Maul & Gar Saxon is a Star Wars Pop! Sets 2-Pack from Star Wars: The Clone Wars, Glow in the Dark exclusive.",
    parse_confidence: 0.90,
    needs_review: false,
  },
  "889698682831": {
    pop_name: "Obi-Wan Kenobi (Mandalorian Armor)",
    character: "Obi-Wan Kenobi",
    franchise: "Star Wars",
    set_name: "Star Wars: The Clone Wars",
    number: "599",
    variant: "Mandalorian Armor",
    exclusivity: "Entertainment Earth",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Obi-Wan Kenobi (Mandalorian Armor) is a Star Wars Pop! Star Wars release #599 from Star Wars: The Clone Wars, Entertainment Earth exclusive.",
    display_description: "Obi-Wan Kenobi (Mandalorian Armor) is a Star Wars Pop! Star Wars release #599 from Star Wars: The Clone Wars, Entertainment Earth exclusive.",
    parse_confidence: 0.90,
    needs_review: false,
  },
  "889698712521": {
    pop_name: "332nd Company Trooper",
    character: "332nd Company Trooper",
    franchise: "Star Wars",
    set_name: "Star Wars: The Clone Wars",
    number: "627",
    variant: null,
    exclusivity: "Books-A-Million",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "332nd Company Trooper is a Star Wars Pop! Star Wars release #627 from Star Wars: The Clone Wars, Books-A-Million exclusive.",
    display_description: "332nd Company Trooper is a Star Wars Pop! Star Wars release #627 from Star Wars: The Clone Wars, Books-A-Million exclusive.",
    parse_confidence: 0.90,
    needs_review: false,
  },
  "889698743280": {
    pop_name: "Count Dooku vs. Anakin Skywalker 2-Pack",
    character: "Count Dooku & Anakin Skywalker",
    franchise: "Star Wars",
    set_name: "Star Wars: The Clone Wars",
    number: null,
    variant: null,
    exclusivity: "GameStop",
    pop_type: "Pop! Multipack",
    pop_style: "2-Pack",
    description: "Count Dooku vs. Anakin Skywalker is a Star Wars Pop! Multipack 2-Pack from Star Wars: The Clone Wars, GameStop exclusive.",
    display_description: "Count Dooku vs. Anakin Skywalker is a Star Wars Pop! Multipack 2-Pack from Star Wars: The Clone Wars, GameStop exclusive.",
    parse_confidence: 0.90,
    needs_review: false,
  },
  "889698528801": {
    pop_name: "Wenwu",
    character: "Wenwu",
    franchise: "Marvel",
    set_name: "Shang-Chi and the Legend of the Ten Rings",
    number: "847",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Wenwu is a Marvel Pop! Marvel release #847 from Shang-Chi and the Legend of the Ten Rings.",
    display_description: "Wenwu is a Marvel Pop! Marvel release #847 from Shang-Chi and the Legend of the Ten Rings.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698528757": {
    pop_name: "Shang-Chi",
    character: "Shang-Chi",
    franchise: "Marvel",
    set_name: "Shang-Chi and the Legend of the Ten Rings",
    number: "844",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Shang-Chi is a Marvel Pop! Marvel release #844 from Shang-Chi and the Legend of the Ten Rings.",
    display_description: "Shang-Chi is a Marvel Pop! Marvel release #844 from Shang-Chi and the Legend of the Ten Rings.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698528788": {
    pop_name: "Katy",
    character: "Katy",
    franchise: "Marvel",
    set_name: "Shang-Chi and the Legend of the Ten Rings",
    number: "845",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Katy is a Marvel Pop! Marvel release #845 from Shang-Chi and the Legend of the Ten Rings.",
    display_description: "Katy is a Marvel Pop! Marvel release #845 from Shang-Chi and the Legend of the Ten Rings.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698528825": {
    pop_name: "The Great Protector (6\" Scale)",
    character: "The Great Protector",
    franchise: "Marvel",
    set_name: "Shang-Chi and the Legend of the Ten Rings",
    number: "850",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Super",
    pop_style: "Jumbo",
    description: "The Great Protector is a Marvel Pop! Super release #850 from Shang-Chi and the Legend of the Ten Rings.",
    display_description: "The Great Protector is a Marvel Pop! Super release #850 from Shang-Chi and the Legend of the Ten Rings.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698554213": {
    pop_name: "Shang-Chi",
    character: "Shang-Chi",
    franchise: "Marvel",
    set_name: "Shang-Chi and the Legend of the Ten Rings",
    number: "879",
    variant: null,
    exclusivity: "Marvel Collector Corps",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Shang-Chi is a Marvel Pop! Marvel release #879 from Shang-Chi and the Legend of the Ten Rings, Marvel Collector Corps exclusive.",
    display_description: "Shang-Chi is a Marvel Pop! Marvel release #879 from Shang-Chi and the Legend of the Ten Rings, Marvel Collector Corps exclusive.",
    parse_confidence: 0.88,
    needs_review: false,
  },
  "889698554220": {
    pop_name: "Xialing",
    character: "Xialing",
    franchise: "Marvel",
    set_name: "Shang-Chi and the Legend of the Ten Rings",
    number: "880",
    variant: null,
    exclusivity: "Marvel Collector Corps",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Xialing is a Marvel Pop! Marvel release #880 from Shang-Chi and the Legend of the Ten Rings, Marvel Collector Corps exclusive.",
    display_description: "Xialing is a Marvel Pop! Marvel release #880 from Shang-Chi and the Legend of the Ten Rings, Marvel Collector Corps exclusive.",
    parse_confidence: 0.88,
    needs_review: false,
  },
  "889698516365": {
    pop_name: "AWESOM-O (Masked)",
    character: "AWESOM-O",
    franchise: "South Park",
    set_name: "South Park",
    number: "25",
    variant: "Masked",
    exclusivity: null,
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "AWESOM-O (Masked) is a South Park Pop! Animation release #25.",
    display_description: "AWESOM-O (Masked) is a South Park Pop! Animation release #25.",
    parse_confidence: 0.90,
    needs_review: false,
  },
  "889698516358": {
    pop_name: "Kyle (Jersey)",
    character: "Kyle",
    franchise: "South Park",
    set_name: "South Park",
    number: "24",
    variant: "Jersey",
    exclusivity: null,
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Kyle (Jersey) is a South Park Pop! Animation release #24.",
    display_description: "Kyle (Jersey) is a South Park Pop! Animation release #24.",
    parse_confidence: 0.90,
    needs_review: false,
  },
  "889698518444": {
    pop_name: "AWESOM-O (Unmasked)",
    character: "AWESOM-O",
    franchise: "South Park",
    set_name: "South Park",
    number: "29",
    variant: "Unmasked",
    exclusivity: null,
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "AWESOM-O (Unmasked) is a South Park Pop! Animation release #29.",
    display_description: "AWESOM-O (Unmasked) is a South Park Pop! Animation release #29.",
    parse_confidence: 0.90,
    needs_review: false,
  },
  "889698465472": {
    pop_name: "Black Adam",
    character: "Black Adam",
    franchise: "DC",
    set_name: "DC Super Heroes",
    number: "348",
    variant: "Glow in the Dark",
    exclusivity: "Big Apple Collectibles",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Black Adam is a DC Pop! Heroes release #348 from DC Super Heroes, Glow in the Dark Big Apple Collectibles exclusive.",
    display_description: "Black Adam is a DC Pop! Heroes release #348 from DC Super Heroes, Glow in the Dark Big Apple Collectibles exclusive.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698581561": {
    pop_name: "Annihilus",
    character: "Annihilus",
    franchise: "Marvel",
    set_name: "Marvel Universe",
    number: "917",
    exclusivity: "Walgreens",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Annihilus is a Marvel Pop! Marvel release #917 from Marvel Universe, Walgreens exclusive.",
    display_description: "Annihilus is a Marvel Pop! Marvel release #917 from Marvel Universe, Walgreens exclusive.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698673105": {
    pop_name: "Eevee, Vaporeon, Jolteon, Flareon",
    character: "Eevee, Vaporeon, Jolteon, Flareon",
    franchise: "Pokemon",
    set_name: "Pokemon Pop! Sets",
    pop_type: "Pop! Games",
    pop_style: "4-Pack",
    description: "Eevee, Vaporeon, Jolteon, Flareon is a Pokemon Pop! Games 4-Pack from Pokemon Pop! Sets.",
    display_description: "Eevee, Vaporeon, Jolteon, Flareon is a Pokemon Pop! Games 4-Pack from Pokemon Pop! Sets.",
    parse_confidence: 0.96,
    needs_review: false,
  },
  "889698269759": {
    pop_name: "Chewbacca",
    character: "Chewbacca",
    franchise: "Star Wars",
    set_name: "Solo: A Star Wars Story",
    number: "239",
    variant: "Flocked",
    exclusivity: "BoxLunch",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Chewbacca is a Star Wars Pop! Star Wars release #239 from Solo: A Star Wars Story, Flocked BoxLunch exclusive.",
    display_description: "Chewbacca is a Star Wars Pop! Star Wars release #239 from Solo: A Star Wars Story, Flocked BoxLunch exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698269728": {
    pop_name: "Han Solo",
    character: "Han Solo",
    franchise: "Star Wars",
    set_name: "Solo: A Star Wars Story",
    number: "248",
    exclusivity: "Target",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Han Solo is a Star Wars Pop! Star Wars release #248 from Solo: A Star Wars Story, Target exclusive.",
    display_description: "Han Solo is a Star Wars Pop! Star Wars release #248 from Solo: A Star Wars Story, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698292474": {
    pop_name: "Mudtrooper",
    character: "Mudtrooper",
    franchise: "Star Wars",
    set_name: "Solo: A Star Wars Story",
    number: "248",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Mudtrooper is a Star Wars Pop! Star Wars release #248 from Solo: A Star Wars Story, Funko Shop exclusive.",
    display_description: "Mudtrooper is a Star Wars Pop! Star Wars release #248 from Solo: A Star Wars Story, Funko Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698270304": {
    pop_name: "Fighting Droids",
    character: "Fighting Droids",
    franchise: "Star Wars",
    set_name: "Solo: A Star Wars Story",
    number: null,
    exclusivity: "GameStop",
    pop_type: "Pop! Star Wars",
    pop_style: "2-Pack",
    description: "Fighting Droids is a Star Wars Pop! Star Wars 2-Pack from Solo: A Star Wars Story, GameStop exclusive.",
    display_description: "Fighting Droids is a Star Wars Pop! Star Wars 2-Pack from Solo: A Star Wars Story, GameStop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698557429": {
    pop_name: "Mobius",
    character: "Mobius",
    franchise: "Marvel",
    set_name: "Loki",
    number: "896",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Mobius is a Marvel Pop! Marvel release #896 from Loki.",
    display_description: "Mobius is a Marvel Pop! Marvel release #896 from Loki.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698559331": {
    pop_name: "Hunter B-15",
    character: "Hunter B-15",
    franchise: "Marvel",
    set_name: "Loki",
    number: "903",
    exclusivity: "Exclusive",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Hunter B-15 is a Marvel Pop! Marvel release #903 from Loki.",
    display_description: "Hunter B-15 is a Marvel Pop! Marvel release #903 from Loki.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698627061": {
    pop_name: "Loki (with Scepter)",
    character: "Loki",
    franchise: "Marvel",
    set_name: "Loki",
    number: "985",
    exclusivity: "Entertainment Earth",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Loki (with Scepter) is a Marvel Pop! Marvel release #985 from Loki, Entertainment Earth exclusive.",
    display_description: "Loki (with Scepter) is a Marvel Pop! Marvel release #985 from Loki, Entertainment Earth exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698631754": {
    pop_name: "Lady Loki",
    character: "Lady Loki",
    franchise: "Marvel",
    set_name: "Loki",
    number: "1029",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Lady Loki is a Marvel Pop! Marvel release #1029 from Loki.",
    display_description: "Lady Loki is a Marvel Pop! Marvel release #1029 from Loki.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698652056": {
    pop_name: "He Who Remains",
    character: "He Who Remains",
    franchise: "Marvel",
    set_name: "Loki",
    number: "1062",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "He Who Remains is a Marvel Pop! Marvel release #1062 from Loki, Summer Convention exclusive.",
    display_description: "He Who Remains is a Marvel Pop! Marvel release #1062 from Loki, Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698559300": {
    pop_name: "Frog of Thunder",
    character: "Frog of Thunder",
    franchise: "Marvel",
    set_name: "Loki",
    number: "983",
    exclusivity: "Target",
    pop_type: "Pop! Marvel",
    pop_style: "Deluxe",
    description: "Frog of Thunder is a Marvel Pop! Marvel Deluxe release #983 from Loki, Target exclusive.",
    display_description: "Frog of Thunder is a Marvel Pop! Marvel Deluxe release #983 from Loki, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698650304": {
    pop_name: "Loki & Sylvie",
    character: "Loki & Sylvie",
    franchise: "Marvel",
    set_name: "Loki",
    number: "1065",
    exclusivity: "Target",
    pop_type: "Pop! Marvel",
    pop_style: "Moment",
    description: "Loki & Sylvie is a Marvel Pop! Marvel Moment release #1065 from Loki, Target exclusive.",
    display_description: "Loki & Sylvie is a Marvel Pop! Marvel Moment release #1065 from Loki, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698710633": {
    pop_name: "Frost Giant Loki",
    character: "Loki",
    franchise: "Marvel",
    set_name: "Loki",
    number: "1269",
    variant: "Glow in the Dark",
    exclusivity: "US Exclusive",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Frost Giant Loki is a Marvel Pop! Marvel release #1269 from Loki, Glow in the Dark US Exclusive.",
    display_description: "Frost Giant Loki is a Marvel Pop! Marvel release #1269 from Loki, Glow in the Dark US Exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698721691": {
    pop_name: "Loki",
    character: "Loki",
    franchise: "Marvel",
    set_name: "Loki Season 2",
    number: "1312",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Loki is a Marvel Pop! Marvel release #1312 from Loki Season 2.",
    display_description: "Loki is a Marvel Pop! Marvel release #1312 from Loki Season 2.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698721714": {
    pop_name: "Sylvie",
    character: "Sylvie",
    franchise: "Marvel",
    set_name: "Loki Season 2",
    number: "1314",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Sylvie is a Marvel Pop! Marvel release #1314 from Loki Season 2.",
    display_description: "Sylvie is a Marvel Pop! Marvel release #1314 from Loki Season 2.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698552899": {
    pop_name: "Atrociraptor (Ghost)",
    character: "Atrociraptor (Ghost)",
    franchise: "Jurassic Park",
    set_name: "Jurassic World: Dominion",
    number: "1205",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Atrociraptor (Ghost) is a Jurassic World: Dominion Pop! Movies release #1205.",
    display_description: "Atrociraptor (Ghost) is a Jurassic World: Dominion Pop! Movies release #1205.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698552936": {
    pop_name: "Therizinosaurus",
    character: "Therizinosaurus",
    franchise: "Jurassic Park",
    set_name: "Jurassic World: Dominion",
    number: "1206",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Therizinosaurus is a Jurassic World: Dominion Pop! Movies release #1206.",
    display_description: "Therizinosaurus is a Jurassic World: Dominion Pop! Movies release #1206.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698622226": {
    pop_name: "T. Rex",
    character: "T. Rex",
    franchise: "Jurassic Park",
    set_name: "Jurassic World: Dominion",
    number: "1211",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "T. Rex is a Jurassic World: Dominion Pop! Movies release #1211.",
    display_description: "T. Rex is a Jurassic World: Dominion Pop! Movies release #1211.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698552929": {
    pop_name: "Atrociraptor (Tiger)",
    character: "Atrociraptor (Tiger)",
    franchise: "Jurassic Park",
    set_name: "Jurassic World: Dominion",
    number: "1218",
    exclusivity: "Specialty Series",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Atrociraptor (Tiger) is a Jurassic World: Dominion Pop! Movies release #1218, Specialty Series exclusive.",
    display_description: "Atrociraptor (Tiger) is a Jurassic World: Dominion Pop! Movies release #1218, Specialty Series exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698558433": {
    pop_name: "Atrociraptor (Ghost) (Lunging)",
    character: "Atrociraptor (Ghost)",
    franchise: "Jurassic Park",
    set_name: "Jurassic World: Dominion",
    number: "1219",
    exclusivity: "Target",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Atrociraptor (Ghost) (Lunging) is a Jurassic World: Dominion Pop! Movies release #1219, Target exclusive.",
    display_description: "Atrociraptor (Ghost) (Lunging) is a Jurassic World: Dominion Pop! Movies release #1219, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698653336": {
    pop_name: "Cassian",
    character: "Cassian",
    franchise: "Star Wars",
    set_name: "Andor",
    number: "534",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Cassian is a Andor Pop! Star Wars release #534.",
    display_description: "Cassian is a Andor Pop! Star Wars release #534.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698871853": {
    pop_name: "Range Trooper",
    character: "Range Trooper",
    franchise: "Star Wars",
    set_name: "Andor",
    number: "787",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Range Trooper is a Andor Pop! Star Wars release #787, Funko Shop exclusive.",
    display_description: "Range Trooper is a Andor Pop! Star Wars release #787, Funko Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698372503": {
    pop_name: "Batman vs. The Joker (Movie Moments)",
    character: "Batman vs. The Joker",
    franchise: "DC",
    set_name: "Batman: 80th Anniversary",
    number: "280",
    variant: "Movie Moments",
    pop_type: "Pop! Heroes",
    pop_style: "Moment",
    description: "Batman vs. The Joker (Movie Moments) is a Batman: 80th Anniversary Pop! Heroes release #280, Movie Moments variant.",
    display_description: "Batman vs. The Joker (Movie Moments) is a Batman: 80th Anniversary Pop! Heroes release #280, Movie Moments variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698372534": {
    pop_name: "Batman (Red Rain)",
    character: "Batman",
    franchise: "DC",
    set_name: "Batman: 80th Anniversary",
    number: "286",
    variant: "Red Rain",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Batman (Red Rain) is a Batman: 80th Anniversary Pop! Heroes release #286, Red Rain variant.",
    display_description: "Batman (Red Rain) is a Batman: 80th Anniversary Pop! Heroes release #286, Red Rain variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698555616": {
    pop_name: "Qui-Gon Jinn (Tatooine)",
    character: "Qui-Gon Jinn",
    franchise: "Star Wars",
    set_name: "Star Wars: Across the Galaxy",
    number: "422",
    variant: "Tatooine",
    exclusivity: "Amazon",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Qui-Gon Jinn (Tatooine) is a Star Wars: Across the Galaxy Pop! Star Wars release #422, Tatooine variant, Amazon exclusive.",
    display_description: "Qui-Gon Jinn (Tatooine) is a Star Wars: Across the Galaxy Pop! Star Wars release #422, Tatooine variant, Amazon exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698556248": {
    pop_name: "Force Ghost 3-Pack (Anakin, Yoda & Obi-Wan Kenobi)",
    character: "Anakin, Yoda & Obi-Wan Kenobi",
    franchise: "Star Wars",
    set_name: "Star Wars: Across the Galaxy",
    variant: "Glow in the Dark",
    exclusivity: "Amazon",
    pop_type: "Pop! Star Wars",
    pop_style: "3-Pack",
    description: "Force Ghost 3-Pack (Anakin, Yoda & Obi-Wan Kenobi) is a Star Wars: Across the Galaxy Pop! Star Wars release, Glow in the Dark variant, Amazon exclusive.",
    display_description: "Force Ghost 3-Pack (Anakin, Yoda & Obi-Wan Kenobi) is a Star Wars: Across the Galaxy Pop! Star Wars release, Glow in the Dark variant, Amazon exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698717519": {
    pop_name: "Captain Marvel (Fear Itself)",
    character: "Captain Marvel",
    franchise: "Marvel",
    set_name: "Captain Marvel",
    number: "1263",
    variant: "Fear Itself",
    exclusivity: "San Diego Comic-Con",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Captain Marvel (Fear Itself) is a Captain Marvel Pop! Marvel release #1263, Fear Itself variant, San Diego Comic-Con exclusive.",
    display_description: "Captain Marvel (Fear Itself) is a Captain Marvel Pop! Marvel release #1263, Fear Itself variant, San Diego Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698489027": {
    pop_name: "Dark Captain Marvel",
    character: "Captain Marvel",
    franchise: "Marvel",
    set_name: "Captain Marvel",
    number: "657",
    variant: "Dark",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Dark Captain Marvel is a Captain Marvel Pop! Marvel release #657, Dark variant, Summer Convention exclusive.",
    display_description: "Dark Captain Marvel is a Captain Marvel Pop! Marvel release #657, Dark variant, Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698881906": {
    pop_name: "Marty McFly (2015)",
    character: "Marty McFly",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "1847",
    variant: "2015",
    exclusivity: "Exclusive",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Marty McFly (2015) is a Back to the Future Pop! Movies release #1847, 2015 variant, exclusive.",
    display_description: "Marty McFly (2015) is a Back to the Future Pop! Movies release #1847, 2015 variant, exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698489072": {
    pop_name: "Marty Checking Watch",
    character: "Marty McFly",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "965",
    variant: "Checking Watch",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Marty Checking Watch is a Back to the Future Pop! Movies release #965, Checking Watch variant, Summer Convention exclusive.",
    display_description: "Marty Checking Watch is a Back to the Future Pop! Movies release #965, Checking Watch variant, Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803064778": {
    pop_name: "Dr. Emmett Brown (Jumper Cables)",
    character: "Dr. Emmett Brown",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "236",
    variant: "Jumper Cables",
    exclusivity: "Loot Crate",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Dr. Emmett Brown (Jumper Cables) is a Back to the Future Pop! Movies release #236, Jumper Cables variant, Loot Crate exclusive.",
    display_description: "Dr. Emmett Brown (Jumper Cables) is a Back to the Future Pop! Movies release #236, Jumper Cables variant, Loot Crate exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698469135": {
    pop_name: "Marty 1955",
    character: "Marty McFly",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "957",
    variant: "1955",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Marty 1955 is a Back to the Future Pop! Movies release #957, 1955 variant.",
    display_description: "Marty 1955 is a Back to the Future Pop! Movies release #957, 1955 variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698469142": {
    pop_name: "Doc with Helmet",
    character: "Doc Brown",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "959",
    variant: "with Helmet",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Doc with Helmet is a Back to the Future Pop! Movies release #959, with Helmet variant.",
    display_description: "Doc with Helmet is a Back to the Future Pop! Movies release #959, with Helmet variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "830395034003": {
    pop_name: "Marty McFly",
    character: "Marty McFly",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "49",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2013-01-01",
    description: "Marty McFly is a Pop! Movies release #49 from Back to the Future.",
    display_description: "From Back to the Future, Marty McFly is a Pop! Movies release #49.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "830395033990": {
    pop_name: "Dr. Emmett Brown",
    character: "Dr. Emmett Brown",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "50",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2013-01-01",
    description: "Dr. Emmett Brown is a Pop! Movies release #50 from Back to the Future.",
    display_description: "From Back to the Future, Dr. Emmett Brown is a Pop! Movies release #50.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698469128": {
    pop_name: "Marty with Glasses",
    character: "Marty McFly",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "958",
    variant: "with Glasses",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2020-01-01",
    description: "Marty with Glasses is a Pop! Movies release #958 from Back to the Future.",
    display_description: "From Back to the Future, Marty McFly is a Pop! Movies release #958, with Glasses.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698485159": {
    pop_name: "Biff Tannen",
    character: "Biff Tannen",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "963",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2020-01-01",
    description: "Biff Tannen is a Pop! Movies release #963 from Back to the Future.",
    display_description: "From Back to the Future, Biff Tannen is a Pop! Movies release #963.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698496858": {
    pop_name: "Doc & Einstein",
    character: "Doc & Einstein",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "972",
    exclusivity: "Walmart",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2020-01-01",
    description: "Doc & Einstein is a Walmart Pop! Movies release #972 from Back to the Future.",
    display_description: "From Back to the Future, Doc & Einstein is a Pop! Movies release #972, Walmart.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698635837": {
    pop_name: "Doc with Helmet (Glows In The Dark)",
    character: "Doc Brown",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "959",
    variant: "Helmet Glow in the Dark",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2022-01-01",
    description: "Doc with Helmet (Glows In The Dark) is a Pop! Movies release #959 from Back to the Future.",
    display_description: "From Back to the Future, Doc Brown is a Pop! Movies release #959, Helmet Glow in the Dark.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698487085": {
    pop_name: "Marty with Hoverboard",
    character: "Marty McFly",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "964",
    variant: "with Hoverboard",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2020-01-01",
    description: "Marty with Hoverboard is a Pop! Movies release #964 from Back to the Future.",
    display_description: "From Back to the Future, Marty McFly is a Pop! Movies release #964, with Hoverboard.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698469159": {
    pop_name: "Doc 2015",
    character: "Doc Brown",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "960",
    variant: "2015",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2020-01-01",
    description: "Doc 2015 is a Pop! Movies release #960 from Back to the Future.",
    display_description: "From Back to the Future, Doc Brown is a Pop! Movies release #960, 2015.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698487054": {
    pop_name: "Marty in Puffy Vest",
    character: "Marty McFly",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "961",
    variant: "Puffy Vest",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2020-01-01",
    description: "Marty in Puffy Vest is a Pop! Movies release #961 from Back to the Future.",
    display_description: "From Back to the Future, Marty McFly is a Pop! Movies release #961, Puffy Vest.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698430906": {
    pop_name: "Marty McFly (Cowboy)",
    character: "Marty McFly",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "816",
    variant: "Cowboy",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2019-01-01",
    description: "Marty McFly (Cowboy) is a Hot Topic Pop! Movies release #816 from Back to the Future.",
    display_description: "From Back to the Future, Marty McFly is a Pop! Movies release #816, Cowboy, Hot Topic.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "849803059071": {
    pop_name: "Marty McFly (Hoverboard)",
    character: "Marty McFly",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "245",
    variant: "Hoverboard",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2016-01-01",
    description: "Marty McFly (Hoverboard) is a Pop! Movies release #245 from Back to the Future.",
    display_description: "From Back to the Future, Marty McFly is a Pop! Movies release #245, Hoverboard.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698815185": {
    pop_name: "Doc 1885",
    character: "Doc Brown",
    franchise: "Back to the Future",
    set_name: "Back to the Future Digital",
    number: "219",
    variant: "1885",
    exclusivity: "Digital",
    pop_type: "Pop! Digital",
    pop_style: "Standard",
    release_date: "2023-10-17",
    limited_edition: true,
    limited_count: 1900,
    edition_notes: "Legendary Digital Pop! physical release, limited to 1,900 pieces.",
    description: "Doc 1885 is a limited Pop! Digital release #219 from Back to the Future Digital.",
    display_description: "From Back to the Future Digital, Doc Brown is a Pop! Digital release #219, 1885, limited to 1,900 pieces.",
    parse_confidence: 0.9,
    needs_review: false,
  },
  "889698765633": {
    pop_name: "Hoverboard Chase",
    character: "Marty McFly, Griff Tannen, Data, Whitey & Spike",
    franchise: "Back to the Future",
    set_name: "Back to the Future Part II: Deluxe Moment",
    pop_type: "Pop! Deluxe Moment",
    pop_style: "Moment",
    release_date: "2023-01-01",
    description: "Hoverboard Chase is a Pop! Deluxe Moment from Back to the Future Part II.",
    display_description: "From Back to the Future Part II: Deluxe Moment, Hoverboard Chase is a Pop! Deluxe Moment.",
    parse_confidence: 0.92,
    needs_review: false,
  },
  "889698903295": {
    pop_name: "Dodger (Glasses) with Oliver (Chase)",
    character: "Dodger with Oliver",
    franchise: "Disney",
    set_name: "Oliver & Company",
    number: "1705",
    variant: "Glasses Chase",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Dodger (Glasses) with Oliver (Chase) is a Oliver & Company Pop! Disney release #1705, Glasses Chase variant.",
    display_description: "Dodger (Glasses) with Oliver (Chase) is a Oliver & Company Pop! Disney release #1705, Glasses Chase variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698919098": {
    pop_name: "Dodger with Oliver",
    character: "Dodger with Oliver",
    franchise: "Disney",
    set_name: "Oliver & Company",
    number: "1705",
    variant: "Diamond Collection",
    exclusivity: "Exclusive",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Dodger with Oliver is a Oliver & Company Pop! Disney release #1705, Diamond Collection variant, exclusive.",
    display_description: "Dodger with Oliver is a Oliver & Company Pop! Disney release #1705, Diamond Collection variant, exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698903301": {
    pop_name: "Georgette with Tito",
    character: "Georgette with Tito",
    franchise: "Disney",
    set_name: "Oliver & Company",
    number: "1706",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Georgette with Tito is a Oliver & Company Pop! Disney release #1706.",
    display_description: "Georgette with Tito is a Oliver & Company Pop! Disney release #1706.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698724227": {
    pop_name: "King Magnifico",
    character: "King Magnifico",
    franchise: "Disney",
    set_name: "Wish",
    number: "1392",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "King Magnifico is a Wish Pop! Disney release #1392.",
    display_description: "King Magnifico is a Wish Pop! Disney release #1392.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698724203": {
    pop_name: "Asha with Star",
    character: "Asha",
    franchise: "Disney",
    set_name: "Wish",
    number: "1390",
    variant: "with Star",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Asha with Star is a Wish Pop! Disney release #1390, with Star variant.",
    display_description: "Asha with Star is a Wish Pop! Disney release #1390, with Star variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698849319": {
    pop_name: "Shaun (Pool Cue)",
    character: "Shaun",
    franchise: "Shaun Of The Dead",
    set_name: "Shaun Of The Dead",
    number: "1660",
    variant: "Pool Cue",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Shaun (Pool Cue) is a Shaun Of The Dead Pop! Movies release #1660, Pool Cue variant.",
    display_description: "Shaun (Pool Cue) is a Shaun Of The Dead Pop! Movies release #1660, Pool Cue variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803061319": {
    pop_name: "Ed (Bloody)",
    character: "Ed",
    franchise: "Shaun Of The Dead",
    set_name: "Shaun Of The Dead",
    number: "241",
    variant: "Bloody",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Ed (Bloody) is a Shaun Of The Dead Pop! Movies release #241, Bloody variant.",
    display_description: "Ed (Bloody) is a Shaun Of The Dead Pop! Movies release #241, Bloody variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803061326": {
    pop_name: "Ed (Zombie)",
    character: "Ed",
    franchise: "Shaun Of The Dead",
    set_name: "Shaun Of The Dead",
    number: "259",
    variant: "Zombie",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Ed (Zombie) is a Shaun Of The Dead Pop! Movies release #259, Zombie variant.",
    display_description: "Ed (Zombie) is a Shaun Of The Dead Pop! Movies release #259, Zombie variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698561662": {
    pop_name: "Andy (As Princess Rainbow Sparkle)",
    character: "Andy Dwyer",
    franchise: "Parks and Recreation",
    set_name: "Parks and Recreation",
    number: "1147",
    variant: "As Princess Rainbow Sparkle",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Andy (As Princess Rainbow Sparkle) is a Parks and Recreation Pop! Television release #1147, As Princess Rainbow Sparkle variant.",
    display_description: "Andy (As Princess Rainbow Sparkle) is a Parks and Recreation Pop! Television release #1147, As Princess Rainbow Sparkle variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698561693": {
    pop_name: "Janet Snakehole",
    character: "April Ludgate",
    franchise: "Parks and Recreation",
    set_name: "Parks and Recreation",
    number: "1148",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Janet Snakehole is a Parks and Recreation Pop! Television release #1148.",
    display_description: "Janet Snakehole is a Parks and Recreation Pop! Television release #1148.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698561679": {
    pop_name: "Duke Silver",
    character: "Duke Silver",
    franchise: "Parks and Recreation",
    set_name: "Parks and Recreation",
    number: "1149",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Duke Silver is a Parks and Recreation Pop! Television release #1149.",
    display_description: "Duke Silver is a Parks and Recreation Pop! Television release #1149.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698561686": {
    pop_name: "Hunter Ron (Hat)",
    character: "Ron Swanson",
    franchise: "Parks and Recreation",
    set_name: "Parks and Recreation",
    number: "1150",
    variant: "Hat",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Hunter Ron (Hat) is a Parks and Recreation Pop! Television release #1150, Hat variant.",
    display_description: "Hunter Ron (Hat) is a Parks and Recreation Pop! Television release #1150, Hat variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698652605": {
    pop_name: "Jeremy Jamm",
    character: "Jeremy Jamm",
    franchise: "Parks and Recreation",
    set_name: "Parks and Recreation",
    number: "1259",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Jeremy Jamm is a Parks and Recreation Pop! Television release #1259, Summer Convention exclusive.",
    display_description: "Jeremy Jamm is a Parks and Recreation Pop! Television release #1259, Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698726559": {
    pop_name: "Ann Perkins (Pawnee Goddesses)",
    character: "Ann Perkins",
    franchise: "Parks and Recreation",
    set_name: "Parks and Recreation",
    number: "1411",
    variant: "Pawnee Goddesses",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Ann Perkins (Pawnee Goddesses) is a Parks and Recreation Pop! Television release #1411, Pawnee Goddesses variant.",
    display_description: "Ann Perkins (Pawnee Goddesses) is a Parks and Recreation Pop! Television release #1411, Pawnee Goddesses variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698726566": {
    pop_name: "April Ludgate (Pawnee Goddesses)",
    character: "April Ludgate",
    franchise: "Parks and Recreation",
    set_name: "Parks and Recreation",
    number: "1412",
    variant: "Pawnee Goddesses",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "April Ludgate (Pawnee Goddesses) is a Parks and Recreation Pop! Television release #1412, Pawnee Goddesses variant.",
    display_description: "April Ludgate (Pawnee Goddesses) is a Parks and Recreation Pop! Television release #1412, Pawnee Goddesses variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698726580": {
    pop_name: "Ron Swanson (Pawnee Rangers)",
    character: "Ron Swanson",
    franchise: "Parks and Recreation",
    set_name: "Parks and Recreation",
    number: "1414",
    variant: "Pawnee Rangers",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Ron Swanson (Pawnee Rangers) is a Parks and Recreation Pop! Television release #1414, Pawnee Rangers variant.",
    display_description: "Ron Swanson (Pawnee Rangers) is a Parks and Recreation Pop! Television release #1414, Pawnee Rangers variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698744317": {
    pop_name: "Chris Traeger (with Champion)",
    character: "Chris Traeger",
    franchise: "Parks and Recreation",
    set_name: "Parks and Recreation",
    number: "1415",
    variant: "with Champion",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Chris Traeger (with Champion) is a Parks and Recreation Pop! Television release #1415, with Champion variant.",
    display_description: "Chris Traeger (with Champion) is a Parks and Recreation Pop! Television release #1415, with Champion variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698801720": {
    pop_name: "April Ludgate (Scissors)",
    character: "April Ludgate",
    franchise: "Parks and Recreation",
    set_name: "Parks and Recreation",
    number: "1568",
    variant: "Scissors",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "April Ludgate (Scissors) is a Parks and Recreation Pop! Television release #1568, Scissors variant.",
    display_description: "April Ludgate (Scissors) is a Parks and Recreation Pop! Television release #1568, Scissors variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698801751": {
    pop_name: "Ron Swanson (Pyramid of Greatness)",
    character: "Ron Swanson",
    franchise: "Parks and Recreation",
    set_name: "Parks and Recreation",
    number: "1569",
    variant: "Pyramid of Greatness",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Ron Swanson (Pyramid of Greatness) is a Parks and Recreation Pop! Television release #1569, Pyramid of Greatness variant.",
    display_description: "Ron Swanson (Pyramid of Greatness) is a Parks and Recreation Pop! Television release #1569, Pyramid of Greatness variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698808354": {
    pop_name: "Bilbo Baggins with Bag-End",
    character: "Bilbo Baggins",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "39",
    pop_type: "Pop! Town",
    pop_style: "Town",
    description: "Bilbo Baggins with Bag-End is a The Lord of the Rings Pop! Town release #39.",
    display_description: "Bilbo Baggins with Bag-End is a The Lord of the Rings Pop! Town release #39.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698135504": {
    pop_name: "Gandalf",
    character: "Gandalf",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "443",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Gandalf is a The Lord of the Rings Pop! Movies release #443.",
    display_description: "Gandalf is a The Lord of the Rings Pop! Movies release #443.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698135511": {
    pop_name: "Frodo Baggins (Invisible)",
    character: "Frodo Baggins",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "444",
    variant: "Invisible",
    exclusivity: "Barnes & Noble",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Frodo Baggins (Invisible) is a The Lord of the Rings Pop! Movies release #444, Barnes & Noble exclusive.",
    display_description: "Frodo Baggins (Invisible) is a The Lord of the Rings Pop! Movies release #444, Barnes & Noble exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698135535": {
    pop_name: "Samwise Gamgee",
    character: "Samwise Gamgee",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "445",
    variant: "Glow in the Dark",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Samwise Gamgee is a The Lord of the Rings Pop! Movies release #445, Glow in the Dark variant.",
    display_description: "Samwise Gamgee is a The Lord of the Rings Pop! Movies release #445, Glow in the Dark variant.",
    parse_confidence: 0.95,
    needs_review: false,
  },
  "889698332477": {
    pop_name: "Legolas",
    character: "Legolas",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "628",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Legolas is a The Lord of the Rings Pop! Movies release #628.",
    display_description: "Legolas is a The Lord of the Rings Pop! Movies release #628.",
    parse_confidence: 0.86,
    needs_review: false,
  },
  "889698332484": {
    pop_name: "Gimli",
    character: "Gimli",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "629",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Gimli is a The Lord of the Rings Pop! Movies release #629.",
    display_description: "Gimli is a The Lord of the Rings Pop! Movies release #629.",
    parse_confidence: 0.86,
    needs_review: false,
  },
  "889698135610": {
    pop_name: "Gollum (Invisible)",
    character: "Gollum",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "535",
    variant: "Invisible",
    exclusivity: "Barnes & Noble",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Gollum (Invisible) is a The Lord of the Rings Pop! Movies release #535, Barnes & Noble exclusive.",
    display_description: "Gollum (Invisible) is a The Lord of the Rings Pop! Movies release #535, Barnes & Noble exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698347129": {
    pop_name: "Grishnakh",
    character: "Grishnakh",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "636",
    exclusivity: "Spring Convention",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Grishnakh is a The Lord of the Rings Pop! Movies release #636, Spring Convention exclusive.",
    display_description: "Grishnakh is a The Lord of the Rings Pop! Movies release #636, Spring Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698747042": {
    pop_name: "Aragorn",
    character: "Aragorn",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1444",
    variant: "Glow in the Dark",
    exclusivity: "Specialty Series",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Aragorn is a The Lord of the Rings Pop! Movies release #1444, Glow in the Dark Specialty Series exclusive.",
    display_description: "Aragorn is a The Lord of the Rings Pop! Movies release #1444, Glow in the Dark Specialty Series exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698523431": {
    pop_name: "Frodo Baggins (Orc Helmet)",
    character: "Frodo Baggins",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1565",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Frodo Baggins (Orc Helmet) is a The Lord of the Rings Pop! Movies release #1565.",
    display_description: "Frodo Baggins (Orc Helmet) is a The Lord of the Rings Pop! Movies release #1565.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698808316": {
    pop_name: "Legolas Greenleaf (Bow & Arrow)",
    character: "Legolas Greenleaf",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1577",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Legolas Greenleaf (Bow & Arrow) is a The Lord of the Rings Pop! Movies release #1577.",
    display_description: "Legolas Greenleaf (Bow & Arrow) is a The Lord of the Rings Pop! Movies release #1577.",
    parse_confidence: 0.86,
    needs_review: false,
  },
  "889698808323": {
    pop_name: "Mouth of Sauron",
    character: "Mouth of Sauron",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1578",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Mouth of Sauron is a The Lord of the Rings Pop! Movies release #1578.",
    display_description: "Mouth of Sauron is a The Lord of the Rings Pop! Movies release #1578.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698808347": {
    pop_name: "Treebeard with Merry & Pippin",
    character: "Treebeard with Merry & Pippin",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1579",
    pop_type: "Pop! Deluxe",
    pop_style: "Deluxe",
    description: "Treebeard with Merry & Pippin is a The Lord of the Rings Pop! Deluxe release #1579.",
    display_description: "Treebeard with Merry & Pippin is a The Lord of the Rings Pop! Deluxe release #1579.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698810692": {
    pop_name: "Boromir (One Does Not Simply Meme)",
    character: "Boromir",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1709",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Boromir (One Does Not Simply Meme) is a The Lord of the Rings Pop! Movies release #1709.",
    display_description: "Boromir (One Does Not Simply Meme) is a The Lord of the Rings Pop! Movies release #1709.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698837842": {
    pop_name: "Gandalf at the Doors of Durin",
    character: "Gandalf",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1746",
    pop_type: "Pop! Deluxe",
    pop_style: "Deluxe",
    description: "Gandalf at the Doors of Durin is a The Lord of the Rings Pop! Deluxe release #1746.",
    display_description: "Gandalf at the Doors of Durin is a The Lord of the Rings Pop! Deluxe release #1746.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698837873": {
    pop_name: "Elrond with Rivendell",
    character: "Elrond",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1747",
    pop_type: "Pop! Town",
    pop_style: "Town",
    description: "Elrond with Rivendell is a The Lord of the Rings Pop! Town release #1747.",
    display_description: "Elrond with Rivendell is a The Lord of the Rings Pop! Town release #1747.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698837859": {
    pop_name: "Nazgul",
    character: "Nazgul",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1744",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Nazgul is a The Lord of the Rings Pop! Movies release #1744.",
    display_description: "Nazgul is a The Lord of the Rings Pop! Movies release #1744.",
    parse_confidence: 0.86,
    needs_review: false,
  },
  "889698837866": {
    pop_name: "Arwen (Coronation)",
    character: "Arwen",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1745",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Arwen (Coronation) is a The Lord of the Rings Pop! Movies release #1745.",
    display_description: "Arwen (Coronation) is a The Lord of the Rings Pop! Movies release #1745.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698515276": {
    pop_name: "Eowyn",
    character: "Eowyn",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1743",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Eowyn is a The Lord of the Rings Pop! Movies release #1743 with a possible masked Chase variant.",
    display_description: "Eowyn is a The Lord of the Rings Pop! Movies release #1743 with a possible masked Chase variant.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698864299": {
    pop_name: "Gollum (Glow)",
    character: "Gollum",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1831",
    variant: "Glow in the Dark",
    pop_type: "Pop! Plus",
    pop_style: "Plus",
    description: "Gollum (Glow) is a The Lord of the Rings Pop! Plus release #1831, Glow in the Dark variant.",
    display_description: "Gollum (Glow) is a The Lord of the Rings Pop! Plus release #1831, Glow in the Dark variant.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698864305": {
    pop_name: "Frodo Baggins (Glow)",
    character: "Frodo Baggins",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1832",
    variant: "Glow in the Dark",
    pop_type: "Pop! Plus",
    pop_style: "Plus",
    description: "Frodo Baggins (Glow) is a The Lord of the Rings Pop! Plus release #1832, Glow in the Dark variant.",
    display_description: "Frodo Baggins (Glow) is a The Lord of the Rings Pop! Plus release #1832, Glow in the Dark variant.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698903103": {
    pop_name: "Eomer",
    character: "Eomer",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1982",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Eomer is a The Lord of the Rings Pop! Movies release #1982.",
    display_description: "Eomer is a The Lord of the Rings Pop! Movies release #1982.",
    parse_confidence: 0.86,
    needs_review: false,
  },
  "889698903127": {
    pop_name: "Guritz",
    character: "Guritz",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1984",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Guritz is a The Lord of the Rings Pop! Movies release #1984.",
    display_description: "Guritz is a The Lord of the Rings Pop! Movies release #1984.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698903134": {
    pop_name: "Peregrin Took",
    character: "Peregrin Took",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1985",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Peregrin Took is a The Lord of the Rings Pop! Movies release #1985.",
    display_description: "Peregrin Took is a The Lord of the Rings Pop! Movies release #1985.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698849449": {
    pop_name: "Bilbo Baggins (Possessed)",
    character: "Bilbo Baggins",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1748",
    variant: "Chase",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Bilbo Baggins (Possessed) is a The Lord of the Rings Pop! Movies release #1748, Chase Funko Shop exclusive.",
    display_description: "Bilbo Baggins (Possessed) is a The Lord of the Rings Pop! Movies release #1748, Chase Funko Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698691901": {
    pop_name: "Smeagol",
    character: "Smeagol",
    franchise: "The Lord of the Rings",
    set_name: "The Lord of the Rings",
    number: "1295",
    exclusivity: "Special Edition",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Smeagol is a The Lord of the Rings Pop! Movies release #1295, Special Edition exclusive.",
    display_description: "Smeagol is a The Lord of the Rings Pop! Movies release #1295, Special Edition exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698657679": {
    pop_name: "Sorsha (Helmet)",
    character: "Sorsha",
    franchise: "Willow",
    set_name: "Willow",
    number: "1314",
    variant: "Chase",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Sorsha (Helmet) is a Willow Pop! Movies release #1314, Chase variant.",
    display_description: "Sorsha (Helmet) is a Willow Pop! Movies release #1314, Chase variant.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698357746": {
    pop_name: "Young Gamora",
    character: "Young Gamora",
    franchise: "Marvel",
    set_name: "Avengers: Infinity War",
    number: "417",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Young Gamora is a Marvel Pop! Marvel release #417 from Avengers: Infinity War.",
    display_description: "Young Gamora is a Marvel Pop! Marvel release #417 from Avengers: Infinity War.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698573702": {
    raw_title: "Ash #1142",
    clean_title: "Ash #1142",
    pop_name: "Ash",
    character: "Ash",
    franchise: "Evil Dead",
    set_name: "Evil Dead 40th Anniversary",
    number: "1142",
    variant: null,
    exclusivity: null,
    limited_edition: false,
    limited_count: null,
    edition_notes: null,
    description: "From Evil Dead 40th Anniversary, Ash is a Pop! Movies release #1142.",
    display_description: "From Evil Dead 40th Anniversary, Ash is a Pop! Movies release #1142.",
    parse_confidence: 0.99,
    needs_review: false,
    warnings: [],
  },
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
    set_name: "DC Super Heroes",
    number: "83",
    variant: "Gold",
    exclusivity: "GameStop",
    vault_status: "Vaulted",
    limited_edition: false,
    limited_count: null,
    edition_notes: "GameStop Exclusive",
    description: "Blackest Night Superman is a DC Super Heroes Pop! Heroes release #83, Gold GameStop exclusive.",
    display_description: "Blackest Night Superman is a DC Super Heroes Pop! Heroes release #83, Gold GameStop exclusive.",
    estimated_value: null,
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698810302": {
    raw_title: "Creature Commandos - The Bride #1478",
    clean_title: "Creature Commandos - The Bride #1478",
    pop_name: "The Bride",
    character: "The Bride",
    franchise: "DC",
    set_name: "Creature Commandos",
    number: "1478",
    variant: "Common",
    exclusivity: null,
    limited_edition: false,
    limited_count: null,
    edition_notes: null,
    estimated_value: null,
    description: "The Bride is a DC Funko Pop #1478 from Creature Commandos.",
    display_description: "The Bride is a DC Funko Pop #1478 from Creature Commandos.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698810340": {
    raw_title: "Creature Commandos - Weasel #1482",
    clean_title: "Creature Commandos - Weasel #1482",
    pop_name: "Weasel",
    character: "Weasel",
    franchise: "DC",
    set_name: "Creature Commandos",
    number: "1482",
    variant: "Common",
    exclusivity: null,
    limited_edition: false,
    limited_count: null,
    edition_notes: null,
    estimated_value: null,
    description: "Weasel is a DC Funko Pop #1482 from Creature Commandos.",
    display_description: "Weasel is a DC Funko Pop #1482 from Creature Commandos.",
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
    set_name: "Star Wars: Rogue One",
    number: "155",
    variant: "Toy Sapiens",
    exclusivity: "Toy Sapiens",
    limited_edition: false,
    limited_count: null,
    edition_notes: "Toy Sapiens",
    description: "Bistan is a Star Wars Pop! Star Wars release #155 from Star Wars: Rogue One, Toy Sapiens exclusive.",
    display_description: "Bistan is a Star Wars Pop! Star Wars release #155 from Star Wars: Rogue One, Toy Sapiens exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698339858": {
    raw_title: "Deadpool with Candy Canes #400",
    clean_title: "Deadpool with Candy Canes #400",
    pop_name: "Deadpool with Candy Canes",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Marvel Holiday",
    number: "400",
    variant: null,
    exclusivity: null,
    limited_edition: false,
    limited_count: null,
    edition_notes: null,
    description: "Deadpool with Candy Canes is a Marvel Funko Pop #400 from Marvel Holiday.",
    display_description: "Deadpool with Candy Canes is a Marvel Funko Pop #400 from Marvel Holiday.",
    estimated_value: null,
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698309691": {
    pop_name: "Deadpool on Scooter",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Rides",
    number: "48",
    pop_type: "Pop! Rides",
    pop_style: "Ride",
    description: "Deadpool on Scooter is a Marvel Pop! Rides release #48 from Deadpool Rides.",
    display_description: "Deadpool on Scooter is a Marvel Pop! Rides release #48 from Deadpool Rides.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803074869": {
    pop_name: "Deadpool (Two Swords)",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Classic",
    number: "111",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool (Two Swords) is a Marvel Pop! Marvel release #111 from Deadpool Classic.",
    display_description: "Deadpool (Two Swords) is a Marvel Pop! Marvel release #111 from Deadpool Classic.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803074890": {
    pop_name: "Deadpool (Two Swords)",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Classic",
    number: "111",
    variant: "X-Force",
    exclusivity: "2016 Convention",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool (Two Swords) is a Marvel Pop! Marvel release #111 from Deadpool Classic, X-Force 2016 Convention variant.",
    display_description: "Deadpool (Two Swords) is a Marvel Pop! Marvel release #111 from Deadpool Classic, X-Force 2016 Convention variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803074883": {
    pop_name: "Deadpool (Centers Up)",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Classic",
    number: "112",
    variant: "Blue / Yellow",
    exclusivity: "FYE",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool (Centers Up) is a Marvel Pop! Marvel release #112 from Deadpool Classic, Blue / Yellow FYE variant.",
    display_description: "Deadpool (Centers Up) is a Marvel Pop! Marvel release #112 from Deadpool Classic, Blue / Yellow FYE variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803074906": {
    pop_name: "Pirate Deadpool",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Classic",
    number: "113",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Pirate Deadpool is a Marvel Pop! Marvel release #113 from Deadpool Classic, Hot Topic exclusive.",
    display_description: "Pirate Deadpool is a Marvel Pop! Marvel release #113 from Deadpool Classic, Hot Topic exclusive.",
    parse_confidence: 0.92,
    needs_review: false,
    warnings: [],
  },
  "849803074937": {
    pop_name: "Cowboy Deadpool",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Classic",
    number: "117",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Cowboy Deadpool is a Marvel Pop! Marvel release #117 from Deadpool Classic.",
    display_description: "Cowboy Deadpool is a Marvel Pop! Marvel release #117 from Deadpool Classic.",
    parse_confidence: 0.86,
    needs_review: false,
    warnings: [],
  },
  "849803097479": {
    pop_name: "Deadpool (Dressed to Kill)",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Classic",
    number: "145",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool (Dressed to Kill) is a Marvel Pop! Marvel release #145 from Deadpool Classic.",
    display_description: "Deadpool (Dressed to Kill) is a Marvel Pop! Marvel release #145 from Deadpool Classic.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698443333": {
    pop_name: "Lady Deadpool",
    character: "Lady Deadpool",
    franchise: "Marvel",
    set_name: "Marvel 80th Anniversary",
    number: "549",
    exclusivity: "Retail Exclusive",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Lady Deadpool is a Marvel 80th Anniversary Pop! Marvel release #549, Retail Exclusive.",
    display_description: "Lady Deadpool is a Marvel 80th Anniversary Pop! Marvel release #549, Retail Exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698469524": {
    pop_name: "Spider-Man (1st Appearance)",
    character: "Spider-Man",
    franchise: "Marvel",
    set_name: "Marvel 80th Anniversary",
    number: "593",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Spider-Man (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #593.",
    display_description: "Spider-Man (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #593.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698407175": {
    pop_name: "Iceman (1st Appearance)",
    character: "Iceman",
    franchise: "Marvel",
    set_name: "Marvel 80th Anniversary",
    number: "504",
    variant: "Flocked",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Iceman (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #504, Flocked variant.",
    display_description: "Iceman (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #504, Flocked variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698407168": {
    pop_name: "Beast (1st Appearance)",
    character: "Beast",
    franchise: "Marvel",
    set_name: "Marvel 80th Anniversary",
    number: "505",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Beast (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #505.",
    display_description: "Beast (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #505.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698407151": {
    pop_name: "Angel (1st Appearance)",
    character: "Angel",
    franchise: "Marvel",
    set_name: "Marvel 80th Anniversary",
    number: "506",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Angel (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #506.",
    display_description: "Angel (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #506.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698412438": {
    pop_name: "Thanos (1st Appearance)",
    character: "Thanos",
    franchise: "Marvel",
    set_name: "Marvel 80th Anniversary",
    number: "509",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Thanos (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #509.",
    display_description: "Thanos (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #509.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698433624": {
    pop_name: "Captain Marvel (Mar-Vell) (1st Appearance)",
    character: "Captain Marvel",
    franchise: "Marvel",
    set_name: "Marvel 80th Anniversary",
    number: "526",
    exclusivity: "New York Comic-Con",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Captain Marvel (Mar-Vell) (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #526, New York Comic-Con exclusive.",
    display_description: "Captain Marvel (Mar-Vell) (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #526, New York Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698441544": {
    pop_name: "Deadpool (1st Appearance)",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Marvel 80th Anniversary",
    number: "546",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #546.",
    display_description: "Deadpool (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #546.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698441551": {
    pop_name: "Wolverine (1st Appearance)",
    character: "Wolverine",
    franchise: "Marvel",
    set_name: "Marvel 80th Anniversary",
    number: "547",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Wolverine (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #547.",
    display_description: "Wolverine (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #547.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698466318": {
    pop_name: "Beta Ray Bill (1st Appearance)",
    character: "Beta Ray Bill",
    franchise: "Marvel",
    set_name: "Marvel 80th Anniversary",
    number: "582",
    exclusivity: "Walgreens",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Beta Ray Bill (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #582, Walgreens exclusive.",
    display_description: "Beta Ray Bill (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #582, Walgreens exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698469531": {
    pop_name: "Vulture (1st Appearance)",
    character: "Vulture",
    franchise: "Marvel",
    set_name: "Marvel 80th Anniversary",
    number: "594",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Vulture (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #594.",
    display_description: "Vulture (1st Appearance) is a Marvel 80th Anniversary Pop! Marvel release #594.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698148672": {
    pop_name: "Aquaman and Motherbox",
    character: "Aquaman",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "199",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Aquaman and Motherbox is a DC Pop! Movies release #199 from Justice League (2017).",
    display_description: "Aquaman and Motherbox is a DC Pop! Movies release #199 from Justice League (2017).",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698137133": {
    pop_name: "Bruce Wayne",
    character: "Bruce Wayne",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "200",
    exclusivity: "San Diego Comic-Con",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Bruce Wayne is a DC Pop! Movies release #200 from Justice League (2017), San Diego Comic-Con exclusive.",
    display_description: "Bruce Wayne is a DC Pop! Movies release #200 from Justice League (2017), San Diego Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698147415": {
    pop_name: "The Flash (Unmasked)",
    character: "The Flash",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "201",
    variant: "Unmasked",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "The Flash (Unmasked) is a DC Pop! Movies release #201 from Justice League (2017), Unmasked variant.",
    display_description: "The Flash (Unmasked) is a DC Pop! Movies release #201 from Justice League (2017), Unmasked variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698134859": {
    pop_name: "Batman",
    character: "Batman",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "204",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Batman is a DC Pop! Movies release #204 from Justice League (2017).",
    display_description: "Batman is a DC Pop! Movies release #204 from Justice League (2017).",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698134866": {
    pop_name: "Aquaman",
    character: "Aquaman",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "205",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Aquaman is a DC Pop! Movies release #205 from Justice League (2017).",
    display_description: "Aquaman is a DC Pop! Movies release #205 from Justice League (2017).",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698137089": {
    pop_name: "Wonder Woman",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "206",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Wonder Woman is a DC Pop! Movies release #206 from Justice League (2017).",
    display_description: "Wonder Woman is a DC Pop! Movies release #206 from Justice League (2017).",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698137041": {
    pop_name: "Superman",
    character: "Superman",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "207",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Superman is a DC Pop! Movies release #207 from Justice League (2017).",
    display_description: "Superman is a DC Pop! Movies release #207 from Justice League (2017).",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698134880": {
    pop_name: "The Flash",
    character: "The Flash",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "208",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "The Flash is a DC Pop! Movies release #208 from Justice League (2017).",
    display_description: "The Flash is a DC Pop! Movies release #208 from Justice League (2017).",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698354547": {
    pop_name: "The Flash (Black Chrome)",
    character: "The Flash",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "208",
    variant: "Black Chrome",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "The Flash (Black Chrome) is a DC Pop! Movies release #208 from Justice League (2017), Black Chrome variant.",
    display_description: "The Flash (Black Chrome) is a DC Pop! Movies release #208 from Justice League (2017), Black Chrome variant.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698354714": {
    pop_name: "The Flash (Light Blue Chrome)",
    character: "The Flash",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "208",
    variant: "Light Blue Chrome",
    exclusivity: "Fugitive Toys",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "The Flash (Light Blue Chrome) is a DC Pop! Movies release #208 from Justice League (2017), Fugitive Toys exclusive.",
    display_description: "The Flash (Light Blue Chrome) is a DC Pop! Movies release #208 from Justice League (2017), Fugitive Toys exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698323314": {
    pop_name: "The Flash (Running)",
    character: "The Flash",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "208",
    variant: "Running",
    exclusivity: "San Diego Comic-Con",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "The Flash (Running) is a DC Pop! Movies release #208 from Justice League (2017), San Diego Comic-Con exclusive.",
    display_description: "The Flash (Running) is a DC Pop! Movies release #208 from Justice League (2017), San Diego Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698134873": {
    pop_name: "Cyborg",
    character: "Cyborg",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "209",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Cyborg is a DC Pop! Movies release #209 from Justice League (2017).",
    display_description: "Cyborg is a DC Pop! Movies release #209 from Justice League (2017).",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698137065": {
    pop_name: "Aquaman",
    character: "Aquaman",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "210",
    exclusivity: "Legion of Collectors",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Aquaman is a DC Pop! Movies release #210 from Justice League (2017), Legion of Collectors exclusive.",
    display_description: "Aquaman is a DC Pop! Movies release #210 from Justice League (2017), Legion of Collectors exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698148696": {
    pop_name: "Wonder Woman and Motherbox",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "211",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Wonder Woman and Motherbox is a DC Pop! Movies release #211 from Justice League (2017).",
    display_description: "Wonder Woman and Motherbox is a DC Pop! Movies release #211 from Justice League (2017).",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698148702": {
    pop_name: "Cyborg and Motherbox",
    character: "Cyborg",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "212",
    exclusivity: "Walmart",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Cyborg and Motherbox is a DC Pop! Movies release #212 from Justice League (2017), Walmart exclusive.",
    display_description: "Cyborg and Motherbox is a DC Pop! Movies release #212 from Justice League (2017), Walmart exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698137072": {
    pop_name: "Mera",
    character: "Mera",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "213",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Mera is a DC Pop! Movies release #213 from Justice League (2017).",
    display_description: "Mera is a DC Pop! Movies release #213 from Justice League (2017).",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698137034": {
    pop_name: "Steppenwolf",
    character: "Steppenwolf",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: "214",
    exclusivity: "Legion of Collectors",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Steppenwolf is a DC Pop! Movies release #214 from Justice League (2017), Legion of Collectors exclusive.",
    display_description: "Steppenwolf is a DC Pop! Movies release #214 from Justice League (2017), Legion of Collectors exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698212953": {
    pop_name: "Batman / Aquaman",
    character: "Batman / Aquaman",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: null,
    exclusivity: "FYE",
    pop_type: "Pop! Movies",
    pop_style: "2-Pack",
    description: "Batman / Aquaman is a DC Pop! Movies 2-pack from Justice League (2017), FYE exclusive.",
    display_description: "Batman / Aquaman is a DC Pop! Movies 2-pack from Justice League (2017), FYE exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698344210": {
    pop_name: "The Flash / Superman (Racing)",
    character: "The Flash / Superman",
    franchise: "DC",
    set_name: "Justice League (2017)",
    number: null,
    variant: "Racing",
    exclusivity: "New York Comic-Con",
    pop_type: "Pop! Movies",
    pop_style: "2-Pack",
    description: "The Flash / Superman (Racing) is a DC Pop! Movies 2-pack from Justice League (2017), New York Comic-Con exclusive.",
    display_description: "The Flash / Superman (Racing) is a DC Pop! Movies 2-pack from Justice League (2017), New York Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698308618": {
    pop_name: "Domino",
    character: "Domino",
    franchise: "Marvel",
    set_name: "Deadpool Parody",
    number: "315",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Domino is a Marvel Pop! Marvel release #315 from Deadpool Parody.",
    display_description: "Domino is a Marvel Pop! Marvel release #315 from Deadpool Parody.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698309721": {
    pop_name: "Deadpool vs. Cable",
    character: "Deadpool vs. Cable",
    franchise: "Marvel",
    set_name: "Deadpool Parody",
    number: "318",
    pop_type: "Pop! Moments",
    pop_style: "Moment",
    description: "Deadpool vs. Cable is a Marvel Pop! Moments release #318 from Deadpool Parody.",
    display_description: "Deadpool vs. Cable is a Marvel Pop! Moments release #318 from Deadpool Parody.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698308625": {
    pop_name: "Cable",
    character: "Cable",
    franchise: "Marvel",
    set_name: "Deadpool Parody",
    number: "314",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Cable is a Marvel Pop! Marvel release #314 from Deadpool Parody.",
    display_description: "Cable is a Marvel Pop! Marvel release #314 from Deadpool Parody.",
    parse_confidence: 0.94,
    needs_review: false,
    warnings: [],
  },
  "889698308632": {
    pop_name: "Colossus",
    character: "Colossus",
    franchise: "Marvel",
    set_name: "Deadpool Parody",
    number: "316",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Colossus is a Marvel Pop! Marvel release #316 from Deadpool Parody.",
    display_description: "Colossus is a Marvel Pop! Marvel release #316 from Deadpool Parody.",
    parse_confidence: 0.90,
    needs_review: false,
    warnings: [],
  },
  "889698308656": {
    pop_name: "Deadpool as Bob Ross",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Parody",
    number: "319",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool as Bob Ross is a Marvel Pop! Marvel release #319 from Deadpool Parody.",
    display_description: "Deadpool as Bob Ross is a Marvel Pop! Marvel release #319 from Deadpool Parody.",
    parse_confidence: 0.94,
    needs_review: false,
    warnings: [],
  },
  "889698308502": {
    pop_name: "Deadpool Parody",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Parody",
    number: "320",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool Parody is a Marvel Pop! Marvel release #320 from Deadpool Parody.",
    display_description: "Deadpool Parody is a Marvel Pop! Marvel release #320 from Deadpool Parody.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698325936": {
    pop_name: "Mermaid Deadpool",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Parody",
    number: "321",
    variant: "Metallic",
    exclusivity: null,
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Mermaid Deadpool is a Marvel Pop! Marvel release #321 from Deadpool Parody, Metallic variant.",
    display_description: "Mermaid Deadpool is a Marvel Pop! Marvel release #321 from Deadpool Parody, Metallic variant.",
    parse_confidence: 0.92,
    needs_review: false,
    warnings: [],
  },
  "889698311175": {
    pop_name: "Chicken Deadpool",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Parody",
    number: "323",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Chicken Deadpool is a Marvel Pop! Marvel release #323 from Deadpool Parody.",
    display_description: "Chicken Deadpool is a Marvel Pop! Marvel release #323 from Deadpool Parody.",
    parse_confidence: 0.94,
    needs_review: false,
    warnings: [],
  },
  "889698308687": {
    pop_name: "Wizard Deadpool",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Parody",
    number: "324",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Wizard Deadpool is a Marvel Pop! Marvel release #324 from Deadpool Parody.",
    display_description: "Wizard Deadpool is a Marvel Pop! Marvel release #324 from Deadpool Parody.",
    parse_confidence: 0.94,
    needs_review: false,
    warnings: [],
  },
  "889698311151": {
    pop_name: "Cheerleader Deadpool",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Parody",
    number: "325",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Cheerleader Deadpool is a Marvel Pop! Marvel release #325 from Deadpool Parody.",
    display_description: "Cheerleader Deadpool is a Marvel Pop! Marvel release #325 from Deadpool Parody.",
    parse_confidence: 0.94,
    needs_review: false,
    warnings: [],
  },
  "889698311168": {
    pop_name: "King Deadpool",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Parody",
    number: "326",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "King Deadpool is a Marvel Pop! Marvel release #326 from Deadpool Parody.",
    display_description: "King Deadpool is a Marvel Pop! Marvel release #326 from Deadpool Parody.",
    parse_confidence: 0.94,
    needs_review: false,
    warnings: [],
  },
  "889698311182": {
    pop_name: "Bedtime Deadpool",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Parody",
    number: "327",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Bedtime Deadpool is a Marvel Pop! Marvel release #327 from Deadpool Parody.",
    display_description: "Bedtime Deadpool is a Marvel Pop! Marvel release #327 from Deadpool Parody.",
    parse_confidence: 0.94,
    needs_review: false,
    warnings: [],
  },
  "889698311212": {
    pop_name: "Pandapool",
    character: "Pandapool",
    franchise: "Marvel",
    set_name: "Deadpool Parody",
    number: "328",
    variant: "Chase",
    exclusivity: null,
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Pandapool is a Marvel Pop! Marvel release #328 from Deadpool Parody, Chase variant.",
    display_description: "Pandapool is a Marvel Pop! Marvel release #328 from Deadpool Parody, Chase variant.",
    parse_confidence: 0.92,
    needs_review: false,
    warnings: [],
  },
  "889698311199": {
    pop_name: "Samurai Deadpool",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Parody",
    number: "329",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Samurai Deadpool is a Marvel Pop! Marvel release #329 from Deadpool Parody.",
    display_description: "Samurai Deadpool is a Marvel Pop! Marvel release #329 from Deadpool Parody.",
    parse_confidence: 0.94,
    needs_review: false,
    warnings: [],
  },
  "889698546539": {
    pop_name: "Barista Deadpool",
    character: "Barista Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool 30th",
    number: "775",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Barista Deadpool is a Marvel Pop! Marvel release #775 from Deadpool 30th.",
    display_description: "Barista Deadpool is a Marvel Pop! Marvel release #775 from Deadpool 30th.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698546546": {
    pop_name: "Deadpool In Cake",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool 30th",
    number: "776",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool In Cake is a Marvel Pop! Marvel release #776 from Deadpool 30th.",
    display_description: "Deadpool In Cake is a Marvel Pop! Marvel release #776 from Deadpool 30th.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698546553": {
    pop_name: "Dinopool",
    character: "Dinopool",
    franchise: "Marvel",
    set_name: "Deadpool 30th",
    number: "777",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Dinopool is a Marvel Pop! Marvel release #777 from Deadpool 30th.",
    display_description: "Dinopool is a Marvel Pop! Marvel release #777 from Deadpool 30th.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698552622": {
    pop_name: "Dinopool",
    character: "Dinopool",
    franchise: "Marvel",
    set_name: "Deadpool 30th",
    number: "777",
    variant: "Black",
    exclusivity: "Marvel Collector Corps",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Dinopool is a Marvel Pop! Marvel release #777 from Deadpool 30th, Black Marvel Collector Corps variant.",
    display_description: "Dinopool is a Marvel Pop! Marvel release #777 from Deadpool 30th, Black Marvel Collector Corps variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698546560": {
    pop_name: "Flamenco Deadpool",
    character: "Flamenco Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool 30th",
    number: "778",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Flamenco Deadpool is a Marvel Pop! Marvel release #778 from Deadpool 30th.",
    display_description: "Flamenco Deadpool is a Marvel Pop! Marvel release #778 from Deadpool 30th.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698546577": {
    pop_name: "Roman Senator Deadpool",
    character: "Roman Senator Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool 30th",
    number: "779",
    variant: null,
    exclusivity: "Walmart",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Roman Senator Deadpool is a Marvel Pop! Marvel release #779 from Deadpool 30th, Walmart exclusive.",
    display_description: "Roman Senator Deadpool is a Marvel Pop! Marvel release #779 from Deadpool 30th, Walmart exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698546980": {
    pop_name: "Ninja Deadpool",
    character: "Ninja Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool 30th",
    number: "785",
    exclusivity: "Marvel Collector Corps",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Ninja Deadpool is a Marvel Pop! Marvel release #785 from Deadpool 30th, Marvel Collector Corps exclusive.",
    display_description: "Ninja Deadpool is a Marvel Pop! Marvel release #785 from Deadpool 30th, Marvel Collector Corps exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698760768": {
    pop_name: "Lederhosen Deadpool",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Shenanigans",
    number: "1341",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Lederhosen Deadpool is a Marvel Pop! Marvel release #1341 from Deadpool Shenanigans.",
    display_description: "Lederhosen Deadpool is a Marvel Pop! Marvel release #1341 from Deadpool Shenanigans.",
    parse_confidence: 0.88,
    needs_review: false,
    warnings: [],
  },
  "889698839846": {
    pop_name: "Deadpool as Cthulhu",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Literary Classics",
    number: "1491",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Plus",
    pop_style: "Plus",
    description: "Deadpool as Cthulhu is a Marvel Pop! Plus release #1491 from Deadpool Literary Classics.",
    display_description: "Deadpool as Cthulhu is a Marvel Pop! Plus release #1491 from Deadpool Literary Classics.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698839853": {
    pop_name: "Deadpool as Don Quixote",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Literary Classics",
    number: "1492",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Plus",
    pop_style: "Plus",
    description: "Deadpool as Don Quixote is a Marvel Pop! Plus release #1492 from Deadpool Literary Classics.",
    display_description: "Deadpool as Don Quixote is a Marvel Pop! Plus release #1492 from Deadpool Literary Classics.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698839860": {
    pop_name: "Deadpool as Long John Silver",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Literary Classics",
    number: "1493",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Plus",
    pop_style: "Plus",
    description: "Deadpool as Long John Silver is a Marvel Pop! Plus release #1493 from Deadpool Literary Classics.",
    display_description: "Deadpool as Long John Silver is a Marvel Pop! Plus release #1493 from Deadpool Literary Classics.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698839877": {
    pop_name: "Deadpool as Jacob Marley",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Literary Classics",
    number: "1494",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Plus",
    pop_style: "Plus",
    description: "Deadpool as Jacob Marley is a Marvel Pop! Plus release #1494 from Deadpool Literary Classics.",
    display_description: "Deadpool as Jacob Marley is a Marvel Pop! Plus release #1494 from Deadpool Literary Classics.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698721875": {
    pop_name: "Holiday Deadpool in Ugly Sweater",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Marvel Holiday",
    number: "1283",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Holiday Deadpool in Ugly Sweater is a Marvel Pop! Marvel release #1283 from Marvel Holiday.",
    display_description: "Holiday Deadpool in Ugly Sweater is a Marvel Pop! Marvel release #1283 from Marvel Holiday.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698433372": {
    pop_name: "Holiday Deadpool (Supper Hero)",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Marvel Holiday",
    number: "534",
    variant: null,
    exclusivity: null,
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Holiday Deadpool (Supper Hero) is a Marvel Pop! Marvel release #534 from Marvel Holiday.",
    display_description: "Holiday Deadpool (Supper Hero) is a Marvel Pop! Marvel release #534 from Marvel Holiday.",
    parse_confidence: 0.92,
    needs_review: false,
    warnings: [],
  },
  "889698800358": {
    pop_name: "Deadpool with Hot Cocoa",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Marvel Holiday",
    number: "1442",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool with Hot Cocoa is a Marvel Pop! Marvel release #1442 from Marvel Holiday.",
    display_description: "Deadpool with Hot Cocoa is a Marvel Pop! Marvel release #1442 from Marvel Holiday.",
    parse_confidence: 0.90,
    needs_review: false,
    warnings: [],
  },
  "889698893268": {
    pop_name: "Deadpool (Finale)",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool & Wolverine",
    number: "1567",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Plus",
    pop_style: "Plus",
    description: "Deadpool (Finale) is a Marvel Pop! Plus release #1567 from Deadpool & Wolverine, Funko Shop exclusive.",
    display_description: "Deadpool (Finale) is a Marvel Pop! Plus release #1567 from Deadpool & Wolverine, Funko Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698808484": {
    pop_name: "Deadpool on Bridge",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Legacy Collection",
    number: "1580",
    pop_type: "Pop! Deluxe",
    pop_style: "Deluxe",
    description: "Deadpool on Bridge is a Marvel Pop! Deluxe release #1580 from the Deadpool Legacy Collection.",
    display_description: "Deadpool on Bridge is a Marvel Pop! Deluxe release #1580 from the Deadpool Legacy Collection.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698808538": {
    raw_title: "Wade Wilson (Baby Legs) #1581",
    clean_title: "Wade Wilson (Baby Legs) #1581",
    pop_name: "Wade Wilson (Baby Legs)",
    character: "Wade Wilson",
    franchise: "Marvel",
    set_name: "Deadpool Legacy Collection",
    number: "1581",
    variant: null,
    exclusivity: null,
    limited_edition: false,
    limited_count: null,
    edition_notes: null,
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Wade Wilson (Baby Legs) is a Marvel Pop! Marvel release #1581 from the Deadpool Legacy Collection.",
    display_description: "Wade Wilson (Baby Legs) is a Marvel Pop! Marvel release #1581 from the Deadpool Legacy Collection.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698836104": {
    pop_name: "Tai",
    character: "Tai",
    franchise: "Clueless",
    set_name: "Clueless",
    number: "1809",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Tai is a Clueless Pop! Movies release #1809 from Clueless.",
    display_description: "Tai is a Clueless Pop! Movies release #1809 from Clueless.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698838733": {
    pop_name: "Cher Horowitz",
    character: "Cher Horowitz",
    franchise: "Clueless",
    set_name: "Clueless",
    number: "1810",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Cher Horowitz is a Clueless Pop! Movies release #1810 from Clueless.",
    display_description: "Cher Horowitz is a Clueless Pop! Movies release #1810 from Clueless.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698838641": {
    pop_name: "Withered Bonnie",
    character: "Withered Bonnie",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "1083",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Withered Bonnie is a Five Nights at Freddy's Pop! Games release #1083.",
    display_description: "Withered Bonnie is a Five Nights at Freddy's Pop! Games release #1083.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698838658": {
    pop_name: "Withered Chica",
    character: "Withered Chica",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "1084",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Withered Chica is a Five Nights at Freddy's Pop! Games release #1084.",
    display_description: "Withered Chica is a Five Nights at Freddy's Pop! Games release #1084.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698838665": {
    pop_name: "Withered Foxy",
    character: "Withered Foxy",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "1085",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Withered Foxy is a Five Nights at Freddy's Pop! Games release #1085.",
    display_description: "Withered Foxy is a Five Nights at Freddy's Pop! Games release #1085.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698918213": {
    pop_name: "Tiger Rock",
    character: "Tiger Rock",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "1153",
    exclusivity: "TargetCon",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Tiger Rock is a Five Nights at Freddy's Pop! Games release #1153, TargetCon exclusive.",
    display_description: "Tiger Rock is a Five Nights at Freddy's Pop! Games release #1153, TargetCon exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698861175": {
    pop_name: "DJ Music Man",
    character: "DJ Music Man",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's: Help Wanted 2",
    number: "1131",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "DJ Music Man is a Five Nights at Freddy's Pop! Games release #1131 from Five Nights at Freddy's: Help Wanted 2.",
    display_description: "DJ Music Man is a Five Nights at Freddy's Pop! Games release #1131 from Five Nights at Freddy's: Help Wanted 2.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698885553": {
    pop_name: "Jack-O-Moon",
    character: "Jack-O-Moon",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's: Help Wanted 2",
    number: "1133",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Jack-O-Moon is a Five Nights at Freddy's Pop! Games release #1133 from Five Nights at Freddy's: Help Wanted 2, Hot Topic exclusive.",
    display_description: "Jack-O-Moon is a Five Nights at Freddy's Pop! Games release #1133 from Five Nights at Freddy's: Help Wanted 2, Hot Topic exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698907958": {
    pop_name: "Kara Zor-El with Cedric",
    character: "Kara Zor-El",
    franchise: "DC",
    set_name: "Supergirl",
    number: "634",
    pop_type: "Pop! Heroes",
    pop_style: "Pop! & Buddy",
    description: "Kara Zor-El with Cedric is a DC Pop! Heroes Pop! & Buddy release #634 from Supergirl.",
    display_description: "Kara Zor-El with Cedric is a DC Pop! Heroes Pop! & Buddy release #634 from Supergirl.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698908009": {
    pop_name: "Lobo",
    character: "Lobo",
    franchise: "DC",
    set_name: "Supergirl",
    number: "636",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Lobo is a DC Pop! Heroes release #636 from Supergirl.",
    display_description: "Lobo is a DC Pop! Heroes release #636 from Supergirl.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698908016": {
    pop_name: "Supergirl with Puppy Krypto",
    character: "Supergirl",
    franchise: "DC",
    set_name: "Supergirl",
    number: "633",
    pop_type: "Pop! Heroes",
    pop_style: "Pop! & Buddy",
    description: "Supergirl with Puppy Krypto is a DC Pop! Heroes Pop! & Buddy release #633 from Supergirl.",
    display_description: "Supergirl with Puppy Krypto is a DC Pop! Heroes Pop! & Buddy release #633 from Supergirl.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698641814": {
    pop_name: "Peacemaker with Eagly",
    character: "Peacemaker",
    franchise: "Peacemaker",
    set_name: "Peacemaker",
    number: "1232",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Peacemaker with Eagly is a Peacemaker Pop! Television release #1232.",
    display_description: "Peacemaker with Eagly is a Peacemaker Pop! Television release #1232.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698641821": {
    pop_name: "Peacemaker in Briefs",
    character: "Peacemaker",
    franchise: "Peacemaker",
    set_name: "Peacemaker",
    number: "1233",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Peacemaker in Briefs is a Peacemaker Pop! Television release #1233.",
    display_description: "Peacemaker in Briefs is a Peacemaker Pop! Television release #1233.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698652001": {
    pop_name: "Peacemaker with Peace Sign",
    character: "Peacemaker",
    franchise: "Peacemaker",
    set_name: "Peacemaker",
    number: "1260",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Peacemaker with Peace Sign is a Peacemaker Pop! Television release #1260, Summer Convention exclusive.",
    display_description: "Peacemaker with Peace Sign is a Peacemaker Pop! Television release #1260, Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698919913": {
    pop_name: "Peacemaker on Peacecycle",
    character: "Peacemaker",
    franchise: "Peacemaker",
    set_name: "Peacemaker",
    number: "146",
    pop_type: "Pop! Rides",
    pop_style: "Ride",
    description: "Peacemaker on Peacecycle is a Peacemaker Pop! Rides release #146.",
    display_description: "Peacemaker on Peacecycle is a Peacemaker Pop! Rides release #146.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698702607": {
    pop_name: "Peacemaker Introduction",
    character: "Peacemaker",
    franchise: "Peacemaker",
    set_name: "Peacemaker",
    number: null,
    exclusivity: "DC Shop",
    pop_type: "Pop! Moments Deluxe",
    pop_style: "Moment",
    description: "Peacemaker Introduction is a Peacemaker Pop! Moments Deluxe release.",
    display_description: "Peacemaker Introduction is a Peacemaker Pop! Moments Deluxe release.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698567916": {
    raw_title: "Ned Stark on Throne [SDCC] #93",
    clean_title: "Ned Stark on Throne [SDCC] #93",
    pop_name: "Ned Stark on Throne",
    character: "Ned Stark",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "93",
    variant: null,
    exclusivity: "San Diego Comic-Con",
    pop_type: "Pop! Deluxe",
    pop_style: "Deluxe",
    description: "Ned Stark on Throne is a Game of Thrones Pop! Deluxe release #93, San Diego Comic-Con exclusive.",
    display_description: "Ned Stark on Throne is a Game of Thrones Pop! Deluxe release #93, San Diego Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803040178": {
    pop_name: "Brienne of Tarth",
    character: "Brienne of Tarth",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "13",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Brienne of Tarth is a Game of Thrones Pop! Television release #13.",
    display_description: "Brienne of Tarth is a Game of Thrones Pop! Television release #13.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "849803072353": {
    pop_name: "Daenerys & Drogon",
    character: "Daenerys Targaryen",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "15",
    pop_type: "Pop! Rides",
    pop_style: "Ride",
    description: "Daenerys & Drogon is a Game of Thrones Pop! Rides release #15.",
    display_description: "Daenerys & Drogon is a Game of Thrones Pop! Rides release #15.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "849803037796": {
    pop_name: "Tyrion Lannister (Battle Armor)",
    character: "Tyrion Lannister",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "21",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Tyrion Lannister (Battle Armor) is a Game of Thrones Pop! Television release #21.",
    display_description: "Tyrion Lannister (Battle Armor) is a Game of Thrones Pop! Television release #21.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "849803063931": {
    pop_name: "Iron Throne",
    character: "Iron Throne",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "38",
    exclusivity: "New York Comic Con",
    pop_type: "Pop! Television",
    pop_style: "Jumbo",
    description: "Iron Throne is a Game of Thrones Pop! Television 6-inch release #38, New York Comic Con exclusive.",
    display_description: "Iron Throne is a Game of Thrones Pop! Television 6-inch release #38, New York Comic Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698122214": {
    pop_name: "The Mountain (Armored)",
    character: "The Mountain",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "54",
    exclusivity: "San Diego Comic-Con",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "The Mountain (Armored) is a Game of Thrones Pop! Television release #54, San Diego Comic-Con exclusive.",
    display_description: "The Mountain (Armored) is a Game of Thrones Pop! Television release #54, San Diego Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698151863": {
    pop_name: "Jaqen H'ghar",
    character: "Jaqen H'ghar",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "57",
    exclusivity: "New York Comic Con",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Jaqen H'ghar is a Game of Thrones Pop! Television release #57, New York Comic Con exclusive.",
    display_description: "Jaqen H'ghar is a Game of Thrones Pop! Television release #57, New York Comic Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698291644": {
    pop_name: "Davos Seaworth",
    character: "Davos Seaworth",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "62",
    exclusivity: "Walmart",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Davos Seaworth is a Game of Thrones Pop! Television release #62, Walmart exclusive.",
    display_description: "Davos Seaworth is a Game of Thrones Pop! Television release #62, Walmart exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698291651": {
    pop_name: "Daenerys Targaryen (Dragonstone Throne)",
    character: "Daenerys Targaryen",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "63",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Daenerys Targaryen (Dragonstone Throne) is a Game of Thrones Pop! Television release #63.",
    display_description: "Daenerys Targaryen (Dragonstone Throne) is a Game of Thrones Pop! Television release #63.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698374040": {
    pop_name: "Tyrion Lannister (Iron Throne)",
    character: "Tyrion Lannister",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "71",
    pop_type: "Pop! Deluxe",
    pop_style: "Deluxe",
    description: "Tyrion Lannister (Iron Throne) is a Game of Thrones Pop! Deluxe release #71.",
    display_description: "Tyrion Lannister (Iron Throne) is a Game of Thrones Pop! Deluxe release #71.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698377911": {
    pop_name: "Jon Snow (Iron Throne)",
    character: "Jon Snow",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "72",
    pop_type: "Pop! Deluxe",
    pop_style: "Deluxe",
    description: "Jon Snow (Iron Throne) is a Game of Thrones Pop! Deluxe release #72.",
    display_description: "Jon Snow (Iron Throne) is a Game of Thrones Pop! Deluxe release #72.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698377966": {
    pop_name: "Cersei Lannister (Iron Throne)",
    character: "Cersei Lannister",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "73",
    pop_type: "Pop! Deluxe",
    pop_style: "Deluxe",
    description: "Cersei Lannister (Iron Throne) is a Game of Thrones Pop! Deluxe release #73.",
    display_description: "Cersei Lannister (Iron Throne) is a Game of Thrones Pop! Deluxe release #73.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698377942": {
    pop_name: "Night King (Iron Throne)",
    character: "Night King",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "74",
    pop_type: "Pop! Deluxe",
    pop_style: "Deluxe",
    description: "Night King (Iron Throne) is a Game of Thrones Pop! Deluxe release #74.",
    display_description: "Night King (Iron Throne) is a Game of Thrones Pop! Deluxe release #74.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698377928": {
    pop_name: "Daenerys Targaryen (Iron Throne)",
    character: "Daenerys Targaryen",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "75",
    pop_type: "Pop! Deluxe",
    pop_style: "Deluxe",
    description: "Daenerys Targaryen (Iron Throne) is a Game of Thrones Pop! Deluxe release #75.",
    display_description: "Daenerys Targaryen (Iron Throne) is a Game of Thrones Pop! Deluxe release #75.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698428019": {
    pop_name: "The Mountain",
    character: "The Mountain",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "78",
    exclusivity: "Walmart",
    pop_type: "Pop! Television",
    pop_style: "Jumbo",
    description: "The Mountain is a Game of Thrones Pop! Television 6-inch release #78, Walmart exclusive.",
    display_description: "The Mountain is a Game of Thrones Pop! Television 6-inch release #78, Walmart exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698454292": {
    pop_name: "King Bran the Broken",
    character: "King Bran the Broken",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "83",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "King Bran the Broken is a Game of Thrones Pop! Television release #83.",
    display_description: "King Bran the Broken is a Game of Thrones Pop! Television release #83.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698452335": {
    pop_name: "Night King (Dark Crystal)",
    character: "Night King",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "84",
    variant: "Glow in the Dark",
    exclusivity: "HBO Shop",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Night King (Dark Crystal) is a Game of Thrones Pop! Television release #84, Glow in the Dark HBO Shop exclusive.",
    display_description: "Night King (Dark Crystal) is a Game of Thrones Pop! Television release #84, Glow in the Dark HBO Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698448246": {
    pop_name: "Daenerys & Jorah at the Battle of Winterfell",
    character: "Daenerys Targaryen",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "86",
    pop_type: "Pop! Moments",
    pop_style: "Moment",
    description: "Daenerys & Jorah at the Battle of Winterfell is a Game of Thrones Pop! Moments release #86.",
    display_description: "Daenerys & Jorah at the Battle of Winterfell is a Game of Thrones Pop! Moments release #86.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698450478": {
    pop_name: "Ser Brienne of Tarth",
    character: "Brienne of Tarth",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "87",
    exclusivity: "BoxLunch",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Ser Brienne of Tarth is a Game of Thrones Pop! Television release #87, BoxLunch exclusive.",
    display_description: "Ser Brienne of Tarth is a Game of Thrones Pop! Television release #87, BoxLunch exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698450539": {
    pop_name: "Hodor Holding the Door",
    character: "Hodor",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    number: "88",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Hodor Holding the Door is a Game of Thrones Pop! Television release #88.",
    display_description: "Hodor Holding the Door is a Game of Thrones Pop! Television release #88.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698343626": {
    pop_name: "The Creators",
    character: "The Creators",
    franchise: "Game of Thrones",
    set_name: "Game of Thrones",
    exclusivity: "New York Comic Con",
    pop_type: "Pop! Television",
    pop_style: "3-Pack",
    description: "The Creators is a Game of Thrones Pop! Television 3-Pack, New York Comic Con exclusive.",
    display_description: "The Creators is a Game of Thrones Pop! Television 3-Pack, New York Comic Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698603133": {
    pop_name: "Jack Skellington (with Flower)",
    character: "Jack Skellington",
    franchise: "The Nightmare Before Christmas",
    set_name: "The Nightmare Before Christmas",
    number: "1168",
    exclusivity: "2022 Expo",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Jack Skellington (with Flower) is a The Nightmare Before Christmas Pop! Disney release #1168, 2022 Expo exclusive.",
    display_description: "Jack Skellington (with Flower) is a The Nightmare Before Christmas Pop! Disney release #1168, 2022 Expo exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698663076": {
    pop_name: "Jack Skellington",
    character: "Jack Skellington",
    franchise: "The Nightmare Before Christmas",
    set_name: "The Nightmare Before Christmas",
    number: "1231",
    exclusivity: "Funko Hollywood",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Jack Skellington is a The Nightmare Before Christmas Pop! Disney release #1231, Funko Hollywood exclusive.",
    display_description: "Jack Skellington is a The Nightmare Before Christmas Pop! Disney release #1231, Funko Hollywood exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698747073": {
    pop_name: "Jack Skellington as the King",
    character: "Jack Skellington",
    franchise: "The Nightmare Before Christmas",
    set_name: "The Nightmare Before Christmas",
    number: "1401",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Jack Skellington as the King is a The Nightmare Before Christmas Pop! Disney release #1401, Hot Topic exclusive.",
    display_description: "Jack Skellington as the King is a The Nightmare Before Christmas Pop! Disney release #1401, Hot Topic exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698405911": {
    pop_name: "Oogie Boogie with Wheel",
    character: "Oogie Boogie",
    franchise: "The Nightmare Before Christmas",
    set_name: "The Nightmare Before Christmas",
    number: "811",
    variant: "Glow in the Dark",
    exclusivity: "BoxLunch",
    pop_type: "Pop! Deluxe",
    pop_style: "Deluxe",
    description: "Oogie Boogie with Wheel is a The Nightmare Before Christmas Pop! Deluxe release #811, Glow in the Dark BoxLunch exclusive.",
    display_description: "Oogie Boogie with Wheel is a The Nightmare Before Christmas Pop! Deluxe release #811, Glow in the Dark BoxLunch exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698506335": {
    pop_name: "Zero in Duck Cart",
    character: "Zero",
    franchise: "The Nightmare Before Christmas",
    set_name: "The Nightmare Before Christmas",
    number: "10",
    pop_type: "Pop! Trains",
    pop_style: "Train",
    description: "Zero in Duck Cart is a The Nightmare Before Christmas Pop! Trains release #10.",
    display_description: "Zero in Duck Cart is a The Nightmare Before Christmas Pop! Trains release #10.",
    parse_confidence: 0.98,
    needs_review: false,
  },
  "889698421355": {
    pop_name: "Sticky Note Man",
    character: "Sticky Note Man",
    franchise: "Office Space",
    set_name: "Office Space",
    number: "774",
    exclusivity: "Special Edition",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Sticky Note Man is an Office Space Pop! Movies release #774.",
    display_description: "Sticky Note Man is an Office Space Pop! Movies release #774.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698708678": {
    pop_name: "Barry Allen",
    character: "Barry Allen",
    franchise: "DC",
    set_name: "The Flash (2023)",
    number: "1413",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Barry Allen is a DC Pop! Movies release #1413 from The Flash (2023).",
    display_description: "Barry Allen is a DC Pop! Movies release #1413 from The Flash (2023).",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698485739": {
    pop_name: "Comic Book Guy",
    character: "Comic Book Guy",
    franchise: "The Simpsons",
    set_name: "The Simpsons",
    number: "832",
    exclusivity: "New York Comic-Con",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Comic Book Guy is a The Simpsons Pop! Animation release #832, New York Comic-Con exclusive.",
    display_description: "Comic Book Guy is a The Simpsons Pop! Animation release #832, New York Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698522533": {
    pop_name: "Mr. Plow Homer",
    character: "Mr. Plow Homer",
    franchise: "The Simpsons",
    set_name: "The Simpsons",
    number: "910",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Mr. Plow Homer is a The Simpsons Pop! Animation release #910, Hot Topic exclusive.",
    display_description: "Mr. Plow Homer is a The Simpsons Pop! Animation release #910, Hot Topic exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698768184": {
    pop_name: "Mr. Sparkle",
    character: "Mr. Sparkle",
    franchise: "The Simpsons",
    set_name: "The Simpsons",
    number: "1465",
    variant: "Diamond Collection",
    exclusivity: "PX Previews",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Mr. Sparkle is a The Simpsons Pop! Animation release #1465, Diamond Collection PX Previews exclusive.",
    display_description: "Mr. Sparkle is a The Simpsons Pop! Animation release #1465, Diamond Collection PX Previews exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698555609": {
    pop_name: "Belly Dancer Homer",
    character: "Belly Dancer Homer",
    franchise: "The Simpsons",
    set_name: "The Simpsons",
    number: "1144",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Belly Dancer Homer is a The Simpsons Pop! Animation release #1144, Summer Convention exclusive.",
    display_description: "Belly Dancer Homer is a The Simpsons Pop! Animation release #1144, Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698529631": {
    pop_name: "Lard Lad",
    character: "Lard Lad",
    franchise: "The Simpsons",
    set_name: "The Simpsons",
    number: "906",
    pop_type: "Pop! Animation",
    pop_style: "Jumbo",
    description: "Lard Lad is a The Simpsons Pop! Animation Jumbo release #906.",
    display_description: "Lard Lad is a The Simpsons Pop! Animation Jumbo release #906.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698459228": {
    pop_name: "Milhouse",
    character: "Milhouse",
    franchise: "The Simpsons",
    set_name: "The Simpsons",
    number: "765",
    exclusivity: "Emerald City Comic-Con",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Milhouse is a The Simpsons Pop! Animation release #765, Emerald City Comic-Con exclusive.",
    display_description: "Milhouse is a The Simpsons Pop! Animation release #765, Emerald City Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698581776": {
    pop_name: "Glowing Mr. Burns",
    character: "Glowing Mr. Burns",
    franchise: "The Simpsons",
    set_name: "The Simpsons",
    number: "1162",
    variant: "Glow in the Dark",
    exclusivity: "PX Previews",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Glowing Mr. Burns is a The Simpsons Pop! Animation release #1162, Glow in the Dark PX Previews exclusive.",
    display_description: "Glowing Mr. Burns is a The Simpsons Pop! Animation release #1162, Glow in the Dark PX Previews exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698623438": {
    pop_name: "Homer in Hedges",
    character: "Homer in Hedges",
    franchise: "The Simpsons",
    set_name: "The Simpsons",
    number: "1252",
    exclusivity: "Entertainment Earth",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Homer in Hedges is a The Simpsons Pop! Animation release #1252, Entertainment Earth exclusive.",
    display_description: "Homer in Hedges is a The Simpsons Pop! Animation release #1252, Entertainment Earth exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698800747": {
    pop_name: "Fallout Boy",
    character: "Fallout Boy",
    franchise: "The Simpsons",
    set_name: "The Simpsons",
    number: "1655",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Fallout Boy is a The Simpsons Pop! Animation release #1655.",
    display_description: "Fallout Boy is a The Simpsons Pop! Animation release #1655.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698741057": {
    pop_name: "Krusty Doll",
    character: "Krusty Doll",
    franchise: "The Simpsons",
    set_name: "The Simpsons: Treehouse of Horror",
    number: "1381",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Krusty Doll is a The Simpsons: Treehouse of Horror Pop! Animation release #1381, Funko Shop exclusive.",
    display_description: "Krusty Doll is a The Simpsons: Treehouse of Horror Pop! Animation release #1381, Funko Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698475617": {
    pop_name: "Sideshow Bob",
    character: "Sideshow Bob",
    franchise: "The Simpsons",
    set_name: "The Simpsons",
    number: "774",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Sideshow Bob is a The Simpsons Pop! Animation release #774, Funko Shop exclusive.",
    display_description: "Sideshow Bob is a The Simpsons Pop! Animation release #774, Funko Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698529587": {
    pop_name: "Itchy",
    character: "Itchy",
    franchise: "The Simpsons",
    set_name: "The Simpsons",
    number: "903",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Itchy is a The Simpsons Pop! Animation release #903.",
    display_description: "Itchy is a The Simpsons Pop! Animation release #903.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698529617": {
    pop_name: "Scratchy",
    character: "Scratchy",
    franchise: "The Simpsons",
    set_name: "The Simpsons",
    number: "904",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Scratchy is a The Simpsons Pop! Animation release #904.",
    display_description: "Scratchy is a The Simpsons Pop! Animation release #904.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698209298": {
    pop_name: "Eleven with Electrodes",
    character: "Eleven with Electrodes",
    franchise: "Stranger Things",
    set_name: "Stranger Things",
    number: "523",
    exclusivity: "GameStop",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Eleven with Electrodes is a Stranger Things Pop! Television release #523, GameStop exclusive.",
    display_description: "Eleven with Electrodes is a Stranger Things Pop! Television release #523, GameStop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698397261": {
    pop_name: "Evil Groundskeeper Willie",
    character: "Evil Groundskeeper Willie",
    franchise: "The Simpsons",
    set_name: "The Simpsons: Treehouse of Horror",
    number: "824",
    exclusivity: "New York Comic-Con",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Evil Groundskeeper Willie is a The Simpsons: Treehouse of Horror Pop! Animation release #824, New York Comic-Con exclusive.",
    display_description: "Evil Groundskeeper Willie is a The Simpsons: Treehouse of Horror Pop! Animation release #824, New York Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698501446": {
    pop_name: "Werewolf Bart",
    character: "Werewolf Bart",
    franchise: "The Simpsons",
    set_name: "The Simpsons: Treehouse of Horror",
    number: "1034",
    exclusivity: "New York Comic-Con",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Werewolf Bart is a The Simpsons: Treehouse of Horror Pop! Animation release #1034, New York Comic-Con exclusive.",
    display_description: "Werewolf Bart is a The Simpsons: Treehouse of Horror Pop! Animation release #1034, New York Comic-Con exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698397193": {
    pop_name: "Fly Boy Bart",
    character: "Fly Boy Bart",
    franchise: "The Simpsons",
    set_name: "The Simpsons: Treehouse of Horror",
    number: "820",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Fly Boy Bart is a The Simpsons: Treehouse of Horror Pop! Animation release #820.",
    display_description: "Fly Boy Bart is a The Simpsons: Treehouse of Horror Pop! Animation release #820.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698397216": {
    pop_name: "Demon Lisa",
    character: "Demon Lisa",
    franchise: "The Simpsons",
    set_name: "The Simpsons: Treehouse of Horror",
    number: "821",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Demon Lisa is a The Simpsons: Treehouse of Horror Pop! Animation release #821.",
    display_description: "Demon Lisa is a The Simpsons: Treehouse of Horror Pop! Animation release #821.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698397247": {
    pop_name: "King Homer",
    character: "King Homer",
    franchise: "The Simpsons",
    set_name: "The Simpsons: Treehouse of Horror",
    number: "822",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "King Homer is a The Simpsons: Treehouse of Horror Pop! Animation release #822.",
    display_description: "King Homer is a The Simpsons: Treehouse of Horror Pop! Animation release #822.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698513999": {
    pop_name: "Devil Flanders",
    character: "Devil Flanders",
    franchise: "The Simpsons",
    set_name: "The Simpsons: Treehouse of Horror",
    number: "1029",
    variant: "Glow in the Dark",
    exclusivity: "Amazon",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Devil Flanders is a The Simpsons: Treehouse of Horror Pop! Animation release #1029, Glow in the Dark Amazon exclusive.",
    display_description: "Devil Flanders is a The Simpsons: Treehouse of Horror Pop! Animation release #1029, Glow in the Dark Amazon exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698402071": {
    pop_name: "Forrest Gump",
    character: "Forrest Gump",
    franchise: "Forrest Gump",
    set_name: "Forrest Gump",
    number: "771",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Forrest Gump is a Forrest Gump Pop! Movies release #771.",
    display_description: "Forrest Gump is a Forrest Gump Pop! Movies release #771.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698586245": {
    pop_name: "Geralt",
    character: "Geralt",
    franchise: "The Witcher",
    set_name: "The Witcher",
    number: "1168",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Geralt is a The Witcher Pop! Television release #1168.",
    display_description: "Geralt is a The Witcher Pop! Television release #1168.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803094928": {
    pop_name: "Hawkgirl",
    character: "Hawkgirl",
    franchise: "DC",
    set_name: "DC's Legends of Tomorrow",
    number: "377",
    exclusivity: "New York Comic Con",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Hawkgirl is a DC Pop! Heroes release #377 from DC's Legends of Tomorrow, New York Comic Con exclusive.",
    display_description: "Hawkgirl is a DC Pop! Heroes release #377 from DC's Legends of Tomorrow, New York Comic Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698673488": {
    pop_name: "Kayla",
    character: "Kayla",
    franchise: "Jurassic Park",
    set_name: "Jurassic World: Dominion",
    number: "1268",
    exclusivity: "New York Comic Con",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Kayla is a Jurassic World: Dominion Pop! Movies release #1268, New York Comic Con exclusive.",
    display_description: "Kayla is a Jurassic World: Dominion Pop! Movies release #1268, New York Comic Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698670456": {
    pop_name: "Kearney Zzyzwicz",
    character: "Kearney Zzyzwicz",
    franchise: "The Simpsons",
    set_name: "The Simpsons",
    number: "1282",
    exclusivity: "Fall Convention",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Kearney Zzyzwicz is a The Simpsons Pop! Animation release #1282, Fall Convention exclusive.",
    display_description: "Kearney Zzyzwicz is a The Simpsons Pop! Animation release #1282, Fall Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698834827": {
    pop_name: "Kara Kent",
    character: "Kara Kent",
    franchise: "DC",
    set_name: "Smallville",
    number: "542",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Kara Kent is a Smallville Pop! Television release #542.",
    display_description: "Kara Kent is a Smallville Pop! Television release #542.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698834810": {
    pop_name: "Doomsday Max",
    character: "Doomsday Max",
    franchise: "DC",
    set_name: "Smallville",
    number: "541",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Doomsday Max is a Smallville Pop! Television release #541.",
    display_description: "Doomsday Max is a Smallville Pop! Television release #541.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698583961": {
    pop_name: "Catwoman (Pink) (Art Series)",
    character: "Catwoman",
    franchise: "DC",
    set_name: "Batman Returns",
    number: "62",
    variant: "Pink Art Series",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Catwoman (Pink) (Art Series) is a Batman Returns Pop! Heroes release #62, Pink Art Series variant.",
    display_description: "Catwoman (Pink) (Art Series) is a Batman Returns Pop! Heroes release #62, Pink Art Series variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698601016": {
    pop_name: "Penguin (Blue) (Art Series)",
    character: "Penguin",
    franchise: "DC",
    set_name: "Batman Returns",
    number: "63",
    variant: "Blue Art Series",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Penguin (Blue) (Art Series) is a Batman Returns Pop! Heroes release #63, Blue Art Series variant.",
    display_description: "Penguin (Blue) (Art Series) is a Batman Returns Pop! Heroes release #63, Blue Art Series variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698652148": {
    pop_name: "Penguin and Duck Ride",
    character: "Penguin",
    franchise: "DC",
    set_name: "Batman Returns",
    number: "288",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Heroes",
    pop_style: "Ride",
    description: "Penguin and Duck Ride is a Batman Returns Pop! Heroes release #288, Summer Convention exclusive.",
    display_description: "Penguin and Duck Ride is a Batman Returns Pop! Heroes release #288, Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698819480": {
    pop_name: "Ash Williams",
    character: "Ash Williams",
    franchise: "Army of Darkness",
    set_name: "Army of Darkness",
    number: "20",
    exclusivity: "GameStop",
    pop_type: "Pop! VHS Covers",
    pop_style: "VHS Cover",
    description: "Ash Williams is a Army of Darkness Pop! VHS Covers release #20, GameStop exclusive.",
    display_description: "Ash Williams is a Army of Darkness Pop! VHS Covers release #20, GameStop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698838405": {
    pop_name: "Ash (Army of Darkness)",
    character: "Ash",
    franchise: "Army of Darkness",
    set_name: "Army of Darkness",
    number: "53",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Ash (Army of Darkness) is a Army of Darkness Pop! Movies release #53.",
    display_description: "Ash (Army of Darkness) is a Army of Darkness Pop! Movies release #53.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "830395034072": {
    pop_name: "Ash (Army of Darkness)",
    character: "Ash",
    franchise: "Army of Darkness",
    set_name: "Army of Darkness",
    number: "53",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Ash (Army of Darkness) is a Army of Darkness Pop! Movies release #53.",
    display_description: "Ash (Army of Darkness) is a Army of Darkness Pop! Movies release #53.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803040536": {
    pop_name: "Agent Coulson",
    character: "Agent Coulson",
    franchise: "Marvel",
    set_name: "Agents Of S.H.I.E.L.D",
    number: "53",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Agent Coulson is a Agents Of S.H.I.E.L.D Pop! Marvel release #53.",
    display_description: "Agent Coulson is a Agents Of S.H.I.E.L.D Pop! Marvel release #53.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803051204": {
    pop_name: "Agent May",
    character: "Agent May",
    franchise: "Marvel",
    set_name: "Agents Of S.H.I.E.L.D",
    number: "88",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Agent May is a Agents Of S.H.I.E.L.D Pop! Marvel release #88.",
    display_description: "Agent May is a Agents Of S.H.I.E.L.D Pop! Marvel release #88.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698583954": {
    pop_name: "Riddler (Art Series)",
    character: "Riddler",
    franchise: "DC",
    set_name: "Batman Forever",
    number: "61",
    variant: "Art Series",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Riddler (Art Series) is a Batman Forever Pop! Heroes release #61, Art Series variant.",
    display_description: "Riddler (Art Series) is a Batman Forever Pop! Heroes release #61, Art Series variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698609357": {
    pop_name: "Two-Face (Art Series)",
    character: "Two-Face",
    franchise: "DC",
    set_name: "Batman Forever",
    number: "66",
    variant: "Art Series",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Two-Face (Art Series) is a Batman Forever Pop! Heroes release #66, Art Series variant.",
    display_description: "Two-Face (Art Series) is a Batman Forever Pop! Heroes release #66, Art Series variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698113434": {
    pop_name: "Beetlejuice (Adam's Clothes)",
    character: "Beetlejuice",
    franchise: "Beetlejuice",
    set_name: "Beetlejuice",
    number: "362",
    variant: "Adam's Clothes",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Beetlejuice (Adam's Clothes) is a Beetlejuice Pop! Movies release #362, Adam's Clothes variant.",
    display_description: "Beetlejuice (Adam's Clothes) is a Beetlejuice Pop! Movies release #362, Adam's Clothes variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698323192": {
    pop_name: "Beetlejuice (Guide Hat)",
    character: "Beetlejuice",
    franchise: "Beetlejuice",
    set_name: "Beetlejuice",
    number: "605",
    variant: "Guide Hat",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Beetlejuice (Guide Hat) is a Beetlejuice Pop! Movies release #605, Guide Hat variant.",
    display_description: "Beetlejuice (Guide Hat) is a Beetlejuice Pop! Movies release #605, Guide Hat variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803062477": {
    pop_name: "Harvey Bullock",
    character: "Harvey Bullock",
    franchise: "DC",
    set_name: "Gotham",
    number: "76",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Harvey Bullock is a Gotham Pop! Television release #76.",
    display_description: "Harvey Bullock is a Gotham Pop! Television release #76.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803062507": {
    pop_name: "Selina Kyle",
    character: "Selina Kyle",
    franchise: "DC",
    set_name: "Gotham",
    number: "79",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Selina Kyle is a Gotham Pop! Television release #79.",
    display_description: "Selina Kyle is a Gotham Pop! Television release #79.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803062460": {
    pop_name: "Fish Mooney",
    character: "Fish Mooney",
    franchise: "DC",
    set_name: "Gotham",
    number: "80",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Fish Mooney is a Gotham Pop! Television release #80.",
    display_description: "Fish Mooney is a Gotham Pop! Television release #80.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698904377": {
    pop_name: "Constantine (Deluxe)",
    character: "Constantine",
    franchise: "DC",
    set_name: "Justice League Dark",
    number: "616",
    pop_type: "Pop! Heroes",
    pop_style: "Deluxe",
    description: "Constantine (Deluxe) is a Justice League Dark Pop! Heroes release #616.",
    display_description: "Constantine (Deluxe) is a Justice League Dark Pop! Heroes release #616.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698904391": {
    pop_name: "Swamp Thing (Super)",
    character: "Swamp Thing",
    franchise: "DC",
    set_name: "Justice League Dark",
    number: "624",
    pop_type: "Pop! Heroes",
    pop_style: "Jumbo",
    description: "Swamp Thing (Super) is a Justice League Dark Pop! Heroes release #624.",
    display_description: "Swamp Thing (Super) is a Justice League Dark Pop! Heroes release #624.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698871464": {
    pop_name: "Ozymandias",
    character: "Ozymandias",
    franchise: "DC",
    set_name: "Watchmen",
    number: "1895",
    exclusivity: "Exclusive",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Ozymandias is a Watchmen Pop! Heroes release #1895, exclusive.",
    display_description: "Ozymandias is a Watchmen Pop! Heroes release #1895, exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698871471": {
    pop_name: "Rorschach",
    character: "Rorschach",
    franchise: "DC",
    set_name: "Watchmen",
    number: "1896",
    exclusivity: "Exclusive",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Rorschach is a Watchmen Pop! Heroes release #1896, exclusive.",
    display_description: "Rorschach is a Watchmen Pop! Heroes release #1896, exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698758963": {
    pop_name: "Robotman",
    character: "Robotman",
    franchise: "DC",
    set_name: "Doom Patrol",
    number: "1534",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Robotman is a Doom Patrol Pop! Television release #1534.",
    display_description: "Robotman is a Doom Patrol Pop! Television release #1534.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698758956": {
    pop_name: "Negative Man",
    character: "Negative Man",
    franchise: "DC",
    set_name: "Doom Patrol",
    number: "1535",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Negative Man is a Doom Patrol Pop! Television release #1535.",
    display_description: "Negative Man is a Doom Patrol Pop! Television release #1535.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698758918": {
    pop_name: "Mr. Nobody (Glow)",
    character: "Mr. Nobody",
    franchise: "DC",
    set_name: "Doom Patrol",
    number: "1536",
    variant: "Glow in the Dark",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Mr. Nobody (Glow) is a Doom Patrol Pop! Television release #1536, Glow in the Dark.",
    display_description: "Mr. Nobody (Glow) is a Doom Patrol Pop! Television release #1536, Glow in the Dark.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698797559": {
    pop_name: "Osha Aniseya",
    character: "Osha Aniseya",
    franchise: "Star Wars",
    set_name: "The Acolyte",
    number: "722",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Osha Aniseya is a The Acolyte Pop! Star Wars release #722.",
    display_description: "Osha Aniseya is a The Acolyte Pop! Star Wars release #722.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698797573": {
    pop_name: "Yord Fandar",
    character: "Yord Fandar",
    franchise: "Star Wars",
    set_name: "The Acolyte",
    number: "724",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Yord Fandar is a The Acolyte Pop! Star Wars release #724.",
    display_description: "Yord Fandar is a The Acolyte Pop! Star Wars release #724.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698797597": {
    pop_name: "Bazil",
    character: "Bazil",
    franchise: "Star Wars",
    set_name: "The Acolyte",
    number: "726",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Bazil is a The Acolyte Pop! Star Wars release #726.",
    display_description: "Bazil is a The Acolyte Pop! Star Wars release #726.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698594806": {
    pop_name: "Hawkeye",
    character: "Hawkeye",
    franchise: "Marvel",
    set_name: "Hawkeye",
    number: "1211",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Hawkeye is a Hawkeye Pop! Marvel release #1211.",
    display_description: "Hawkeye is a Hawkeye Pop! Marvel release #1211.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698594813": {
    pop_name: "Kate Bishop (with Lucky the Pizza Dog)",
    character: "Kate Bishop & Lucky the Pizza Dog",
    franchise: "Marvel",
    set_name: "Hawkeye",
    number: "1212",
    variant: "with Lucky the Pizza Dog",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Kate Bishop (with Lucky the Pizza Dog) is a Hawkeye Pop! Marvel release #1212, with Lucky the Pizza Dog.",
    display_description: "Kate Bishop (with Lucky the Pizza Dog) is a Hawkeye Pop! Marvel release #1212, with Lucky the Pizza Dog.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698594820": {
    pop_name: "Yelena (Masked) (Chase)",
    character: "Yelena",
    franchise: "Marvel",
    set_name: "Hawkeye",
    number: "1213",
    variant: "Masked Chase",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Yelena (Masked) (Chase) is a Hawkeye Pop! Marvel release #1213, Masked Chase.",
    display_description: "Yelena (Masked) (Chase) is a Hawkeye Pop! Marvel release #1213, Masked Chase.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698723503": {
    pop_name: "Blue Beetle (Crouching) (Glow in the Dark) (Chase)",
    character: "Blue Beetle",
    franchise: "DC",
    set_name: "Blue Beetle",
    number: "1403",
    variant: "Crouching Glow in the Dark Chase",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Blue Beetle (Crouching) (Glow in the Dark) (Chase) is a Blue Beetle Pop! Movies release #1403, Crouching Glow in the Dark Chase.",
    display_description: "Blue Beetle (Crouching) (Glow in the Dark) (Chase) is a Blue Beetle Pop! Movies release #1403, Crouching Glow in the Dark Chase.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698723510": {
    pop_name: "Jaime Reyes",
    character: "Jaime Reyes",
    franchise: "DC",
    set_name: "Blue Beetle",
    number: "1404",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Jaime Reyes is a Blue Beetle Pop! Movies release #1404.",
    display_description: "Jaime Reyes is a Blue Beetle Pop! Movies release #1404.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698723527": {
    pop_name: "Conrad Carapax",
    character: "Conrad Carapax",
    franchise: "DC",
    set_name: "Blue Beetle",
    number: "1405",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Conrad Carapax is a Blue Beetle Pop! Movies release #1405.",
    display_description: "Conrad Carapax is a Blue Beetle Pop! Movies release #1405.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698741392": {
    pop_name: "Blue Beetle",
    character: "Blue Beetle",
    franchise: "DC",
    set_name: "Blue Beetle",
    number: "1408",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Blue Beetle is a Blue Beetle Pop! Movies release #1408.",
    display_description: "Blue Beetle is a Blue Beetle Pop! Movies release #1408.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698733861": {
    pop_name: "Phoebe",
    character: "Phoebe",
    franchise: "Ghostbusters",
    set_name: "Ghostbusters: Frozen Empire",
    number: "1507",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Phoebe is a Ghostbusters: Frozen Empire Pop! Movies release #1507.",
    display_description: "Phoebe is a Ghostbusters: Frozen Empire Pop! Movies release #1507.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698789844": {
    pop_name: "Grooberson",
    character: "Grooberson",
    franchise: "Ghostbusters",
    set_name: "Ghostbusters: Frozen Empire",
    number: "1508",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Grooberson is a Ghostbusters: Frozen Empire Pop! Movies release #1508.",
    display_description: "Grooberson is a Ghostbusters: Frozen Empire Pop! Movies release #1508.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698733885": {
    pop_name: "Pukey",
    character: "Pukey",
    franchise: "Ghostbusters",
    set_name: "Ghostbusters: Frozen Empire",
    number: "1509",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Pukey is a Ghostbusters: Frozen Empire Pop! Movies release #1509.",
    display_description: "Pukey is a Ghostbusters: Frozen Empire Pop! Movies release #1509.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698733892": {
    pop_name: "Garraka",
    character: "Garraka",
    franchise: "Ghostbusters",
    set_name: "Ghostbusters: Frozen Empire",
    number: "1511",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Garraka is a Ghostbusters: Frozen Empire Pop! Movies release #1511.",
    display_description: "Garraka is a Ghostbusters: Frozen Empire Pop! Movies release #1511.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698349000": {
    pop_name: "Michael Scott",
    character: "Michael Scott",
    franchise: "The Office",
    set_name: "The Office",
    number: "869",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Michael Scott is a The Office Pop! Television release #869.",
    display_description: "Michael Scott is a The Office Pop! Television release #869.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698349031": {
    pop_name: "Jim Halpert (Chase)",
    character: "Jim Halpert",
    franchise: "The Office",
    set_name: "The Office",
    number: "870",
    variant: "Chase",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Jim Halpert (Chase) is a The Office Pop! Television release #870, Chase.",
    display_description: "Jim Halpert (Chase) is a The Office Pop! Television release #870, Chase.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698418843": {
    pop_name: "Kevin Malone",
    character: "Kevin Malone",
    franchise: "The Office",
    set_name: "The Office",
    number: "874",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Kevin Malone is a The Office Pop! Television release #874.",
    display_description: "Kevin Malone is a The Office Pop! Television release #874.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698434294": {
    pop_name: "Dwight Schrute (As Elf)",
    character: "Dwight Schrute",
    franchise: "The Office",
    set_name: "The Office",
    number: "905",
    variant: "As Elf",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Dwight Schrute (As Elf) is a The Office Pop! Television release #905, As Elf.",
    display_description: "Dwight Schrute (As Elf) is a The Office Pop! Television release #905, As Elf.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698459167": {
    pop_name: "Dwight Schrute (As Recyclops)",
    character: "Dwight Schrute",
    franchise: "The Office",
    set_name: "The Office",
    number: "938",
    variant: "As Recyclops",
    exclusivity: "Spring Convention",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Dwight Schrute (As Recyclops) is a The Office Pop! Television release #938, As Recyclops, Spring Convention exclusive.",
    display_description: "Dwight Schrute (As Recyclops) is a The Office Pop! Television release #938, As Recyclops, Spring Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698484978": {
    pop_name: "Michael Scott (Survivor)",
    character: "Michael Scott",
    franchise: "The Office",
    set_name: "The Office",
    number: "1005",
    variant: "Survivor",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Michael Scott (Survivor) is a The Office Pop! Television release #1005, Survivor.",
    display_description: "Michael Scott (Survivor) is a The Office Pop! Television release #1005, Survivor.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698484961": {
    pop_name: "Florida Stanley",
    character: "Florida Stanley",
    franchise: "The Office",
    set_name: "The Office",
    number: "1006",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Florida Stanley is a The Office Pop! Television release #1006.",
    display_description: "Florida Stanley is a The Office Pop! Television release #1006.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698485005": {
    pop_name: "Dwight Schrute (with Princess Unicorn Doll)",
    character: "Dwight Schrute",
    franchise: "The Office",
    set_name: "The Office",
    number: "1009",
    variant: "with Princess Unicorn Doll",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Dwight Schrute (with Princess Unicorn Doll) is a The Office Pop! Television release #1009, with Princess Unicorn Doll.",
    display_description: "Dwight Schrute (with Princess Unicorn Doll) is a The Office Pop! Television release #1009, with Princess Unicorn Doll.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698516150": {
    pop_name: "Jim Halpert (Last Nonsense)",
    character: "Jim Halpert",
    franchise: "The Office",
    set_name: "The Office",
    number: "1046",
    variant: "Last Nonsense",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Jim Halpert (Last Nonsense) is a The Office Pop! Television release #1046, Last Nonsense.",
    display_description: "Jim Halpert (Last Nonsense) is a The Office Pop! Television release #1046, Last Nonsense.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698520614": {
    pop_name: "Michael Scarn (Threat Level Midnight)",
    character: "Michael Scarn",
    franchise: "The Office",
    set_name: "The Office",
    number: "1060",
    variant: "Threat Level Midnight",
    exclusivity: "Go! Calendars",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Michael Scarn (Threat Level Midnight) is a The Office Pop! Television release #1060, Threat Level Midnight, Go! Calendars exclusive.",
    display_description: "Michael Scarn (Threat Level Midnight) is a The Office Pop! Television release #1060, Threat Level Midnight, Go! Calendars exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698530668": {
    pop_name: "Andy Bernard (Sumo Suit)",
    character: "Andy Bernard",
    franchise: "The Office",
    set_name: "The Office",
    number: "1061",
    variant: "Sumo Suit",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Andy Bernard (Sumo Suit) is a The Office Pop! Television release #1061, Sumo Suit.",
    display_description: "Andy Bernard (Sumo Suit) is a The Office Pop! Television release #1061, Sumo Suit.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698542593": {
    pop_name: "Dwight Schrute (As Kerrigan)",
    character: "Dwight Schrute",
    franchise: "The Office",
    set_name: "The Office",
    number: "1072",
    variant: "As Kerrigan",
    exclusivity: "Emerald City Comic Con",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Dwight Schrute (As Kerrigan) is a The Office Pop! Television release #1072, As Kerrigan, Emerald City Comic Con exclusive.",
    display_description: "Dwight Schrute (As Kerrigan) is a The Office Pop! Television release #1072, As Kerrigan, Emerald City Comic Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698425902": {
    pop_name: "Dwight Schrute (Blonde Hair)",
    character: "Dwight Schrute",
    franchise: "The Office",
    set_name: "The Office",
    number: "871",
    variant: "Blonde Hair",
    exclusivity: "Target",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Dwight Schrute (Blonde Hair) is a The Office Pop! Television release #871, Blonde Hair, Target exclusive.",
    display_description: "Dwight Schrute (Blonde Hair) is a The Office Pop! Television release #871, Blonde Hair, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698561495": {
    pop_name: "Ryan Howard (Blond)",
    character: "Ryan Howard",
    franchise: "The Office",
    set_name: "The Office",
    number: "1130",
    variant: "Blond",
    exclusivity: "Exclusive",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Ryan Howard (Blond) is a The Office Pop! Television release #1130, Blond, exclusive.",
    display_description: "Ryan Howard (Blond) is a The Office Pop! Television release #1130, Blond, exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698579506": {
    pop_name: "Dwight Schrute (As Elf) (D.I.Y.)",
    character: "Dwight Schrute",
    franchise: "The Office",
    set_name: "The Office",
    number: "1161",
    variant: "D.I.Y.",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Dwight Schrute (As Elf) (D.I.Y.) is a The Office Pop! Television release #1161, D.I.Y.",
    display_description: "Dwight Schrute (As Elf) (D.I.Y.) is a The Office Pop! Television release #1161, D.I.Y.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698573948": {
    pop_name: "Erin Hannon (with Happy Box & Champagne)",
    character: "Erin Hannon",
    franchise: "The Office",
    set_name: "The Office",
    number: "1174",
    variant: "with Happy Box & Champagne",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Erin Hannon (with Happy Box & Champagne) is a The Office Pop! Television release #1174, with Happy Box & Champagne.",
    display_description: "Erin Hannon (with Happy Box & Champagne) is a The Office Pop! Television release #1174, with Happy Box & Champagne.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698586276": {
    pop_name: "Mose Schrute",
    character: "Mose Schrute",
    franchise: "The Office",
    set_name: "The Office",
    number: "1179",
    exclusivity: "New York Comic Con",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Mose Schrute is a The Office Pop! Television release #1179, New York Comic Con exclusive.",
    display_description: "Mose Schrute is a The Office Pop! Television release #1179, New York Comic Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698657587": {
    pop_name: "Fun Run Andy",
    character: "Fun Run Andy",
    franchise: "The Office",
    set_name: "The Office",
    number: "1393",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Fun Run Andy is a The Office Pop! Television release #1393.",
    display_description: "Fun Run Andy is a The Office Pop! Television release #1393.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698503327": {
    pop_name: "Zombie Mysterio",
    character: "Mysterio",
    franchise: "Marvel",
    set_name: "Marvel Zombies",
    number: "660",
    variant: "Glow in the Dark",
    exclusivity: "US Exclusive",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Zombie Mysterio is a Marvel Zombies Pop! Marvel release #660, Glow in the Dark.",
    display_description: "Zombie Mysterio is a Marvel Zombies Pop! Marvel release #660, Glow in the Dark.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698652469": {
    pop_name: "Silk",
    character: "Silk",
    franchise: "Marvel",
    set_name: "Marvel Comics",
    number: "1064",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Silk is a Marvel Comics Pop! Marvel release #1064, Summer Convention exclusive.",
    display_description: "Silk is a Marvel Comics Pop! Marvel release #1064, Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698555166": {
    pop_name: "T.D.K.",
    character: "T.D.K.",
    franchise: "DC",
    set_name: "The Suicide Squad",
    number: "1122",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "T.D.K. is a DC Pop! Movies release #1122 from The Suicide Squad.",
    display_description: "T.D.K. is a DC Pop! Movies release #1122 from The Suicide Squad.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698879446": {
    pop_name: "Gambit",
    character: "Gambit",
    franchise: "Marvel",
    set_name: "X-Men",
    number: "1505",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Gambit is an X-Men Pop! Marvel release #1505, Summer Convention exclusive.",
    display_description: "Gambit is an X-Men Pop! Marvel release #1505, Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698105248": {
    pop_name: "Deadpool (Centers Up)",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Classic",
    number: "112",
    variant: "White",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool (Centers Up) is a Marvel Pop! Marvel release #112 from Deadpool Classic, White Summer Convention variant.",
    display_description: "Deadpool (Centers Up) is a Marvel Pop! Marvel release #112 from Deadpool Classic, White Summer Convention variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698102322": {
    pop_name: "Von Miller",
    character: "Von Miller",
    franchise: "NFL",
    set_name: "Denver Broncos",
    number: "60",
    variant: "Orange Jersey",
    pop_type: "Pop! Sports",
    pop_style: "Standard",
    description: "Von Miller is an NFL Pop! Sports release #60 for the Denver Broncos, Orange Jersey.",
    display_description: "Von Miller is an NFL Pop! Sports release #60 for the Denver Broncos, Orange Jersey.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698538787": {
    pop_name: "The Mandalorian Flying with Blaster",
    character: "The Mandalorian",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "408",
    variant: "Glow in the Dark",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    vault_status: "Vaulted",
    description: "The Mandalorian Flying with Blaster is a Star Wars Pop! Star Wars release #408 from The Mandalorian, Glow in the Dark.",
    display_description: "The Mandalorian Flying with Blaster is a Star Wars Pop! Star Wars release #408 from The Mandalorian, Glow in the Dark.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698688956": {
    pop_name: "Iron Spider with Gauntlet",
    character: "Iron Spider",
    franchise: "Marvel",
    set_name: "Avengers: Endgame",
    number: "1141",
    variant: "Glow in the Dark",
    exclusivity: "Chalice Collectibles",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Iron Spider with Gauntlet is an Avengers: Endgame Pop! Marvel release #1141, Glow in the Dark.",
    display_description: "Iron Spider with Gauntlet is an Avengers: Endgame Pop! Marvel release #1141, Glow in the Dark.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803053406": {
    pop_name: "Rocket & Potted Groot",
    character: "Rocket & Potted Groot",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy",
    number: "93",
    exclusivity: "2015 Summer Convention",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Rocket & Potted Groot is a Guardians of the Galaxy Pop! Marvel release #93, 2015 Summer Convention exclusive.",
    display_description: "Rocket & Potted Groot is a Guardians of the Galaxy Pop! Marvel release #93, 2015 Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698674461": {
    pop_name: "The Flash (Rebirth)",
    character: "The Flash",
    franchise: "DC",
    set_name: "DC Comics: The Flash",
    number: "42",
    variant: "Legendary",
    pop_type: "Pop! Digital",
    pop_style: "Standard",
    limited_edition: true,
    edition_notes: "Digital production run",
    description: "The Flash (Rebirth) is a DC Pop! Digital release #42 from DC Comics: The Flash.",
    display_description: "The Flash (Rebirth) is a DC Pop! Digital release #42 from DC Comics: The Flash.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698858540": {
    pop_name: "Two-Face",
    character: "Two-Face",
    franchise: "DC",
    set_name: "Batman 85 Years",
    number: "371",
    variant: "Ultra",
    exclusivity: "Droppp",
    pop_type: "Pop! Digital",
    pop_style: "Standard",
    limited_edition: true,
    limited_count: 5000,
    edition_notes: "Ultra rarity NFT release, limited to 5000 physical redeemables.",
    description: "Two-Face is a DC Pop! Digital release #371 from Batman 85 Years, Ultra rarity with a production run of 5000.",
    display_description: "Two-Face is a DC Pop! Digital release #371 from Batman 85 Years, Ultra rarity with a production run of 5000.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803058593": {
    pop_name: "Ron Weasley",
    character: "Ron Weasley",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "2",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Ron Weasley is a Harry Potter Pop! Movies release #2.",
    display_description: "Ron Weasley is a Harry Potter Pop! Movies release #2.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698917636": {
    pop_name: "Harry Potter (With Hedwig)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "197",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (With Hedwig) is a Harry Potter Pop! Movies release #197.",
    display_description: "Harry Potter (With Hedwig) is a Harry Potter Pop! Movies release #197.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698469951": {
    pop_name: "Patronus Ron Weasley",
    character: "Ron Weasley",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "105",
    variant: "Patronus",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Patronus Ron Weasley is a Harry Potter Pop! Movies release #105, Patronus variant.",
    display_description: "Patronus Ron Weasley is a Harry Potter Pop! Movies release #105, Patronus variant.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698300322": {
    pop_name: "Tom Riddle",
    character: "Tom Riddle",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "60",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Tom Riddle is a Harry Potter Pop! Movies release #60.",
    display_description: "Tom Riddle is a Harry Potter Pop! Movies release #60.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698556149": {
    pop_name: "Lilo (with Scrump)",
    character: "Lilo",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1043",
    variant: "With Scrump",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Lilo (with Scrump) is a Lilo & Stitch Pop! Disney release #1043.",
    display_description: "Lilo (with Scrump) is a Lilo & Stitch Pop! Disney release #1043.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698872003": {
    pop_name: "Luau Stitch (Flocked)",
    character: "Stitch",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1567",
    variant: "Flocked",
    exclusivity: "Target",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Luau Stitch (Flocked) is a Lilo & Stitch Pop! Disney release #1567, Target exclusive.",
    display_description: "Luau Stitch (Flocked) is a Lilo & Stitch Pop! Disney release #1567, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698862745": {
    pop_name: "Luau Angel",
    character: "Angel",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1568",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Luau Angel is a Lilo & Stitch Pop! Disney release #1568.",
    display_description: "Luau Angel is a Lilo & Stitch Pop! Disney release #1568.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698918336": {
    pop_name: "Devilish Stitch",
    character: "Stitch",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1701",
    exclusivity: "Entertainment Earth",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Devilish Stitch is a Lilo & Stitch Pop! Disney release #1701, Entertainment Earth exclusive.",
    display_description: "Devilish Stitch is a Lilo & Stitch Pop! Disney release #1701, Entertainment Earth exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698917858": {
    pop_name: "Stitch with Balloon",
    character: "Stitch",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1709",
    exclusivity: "Target",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Stitch with Balloon is a Lilo & Stitch Pop! Disney release #1709, Target exclusive.",
    display_description: "Stitch with Balloon is a Lilo & Stitch Pop! Disney release #1709, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698862769": {
    pop_name: "Gamer Stitch",
    character: "Stitch",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1566",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Gamer Stitch is a Lilo & Stitch Pop! Disney release #1566.",
    display_description: "Gamer Stitch is a Lilo & Stitch Pop! Disney release #1566.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698831123": {
    pop_name: "Stitch (Easter Bunny)",
    character: "Stitch",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1533",
    variant: "Easter Bunny",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Stitch (Easter Bunny) is a Lilo & Stitch Pop! Disney release #1533.",
    display_description: "Stitch (Easter Bunny) is a Lilo & Stitch Pop! Disney release #1533.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698736374": {
    pop_name: "Stitch with Plunger",
    character: "Stitch",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1354",
    exclusivity: "Entertainment Earth",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Stitch with Plunger is a Lilo & Stitch Pop! Disney release #1354, Entertainment Earth exclusive.",
    display_description: "Stitch with Plunger is a Lilo & Stitch Pop! Disney release #1354, Entertainment Earth exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698751629": {
    pop_name: "Stitch (As Beast)",
    character: "Stitch",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1459",
    variant: "As Beast",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Stitch (As Beast) is a Lilo & Stitch Pop! Disney release #1459.",
    display_description: "Stitch (As Beast) is a Lilo & Stitch Pop! Disney release #1459.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698751643": {
    pop_name: "Stitch as Simba",
    character: "Stitch",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1461",
    variant: "As Simba",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Stitch as Simba is a Lilo & Stitch Pop! Disney release #1461.",
    display_description: "Stitch as Simba is a Lilo & Stitch Pop! Disney release #1461.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698903431": {
    pop_name: "Snorkeling Stitch",
    character: "Stitch",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1742",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Snorkeling Stitch is a Lilo & Stitch Pop! Disney release #1742.",
    display_description: "Snorkeling Stitch is a Lilo & Stitch Pop! Disney release #1742.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698903455": {
    pop_name: "Stitch with Mood Chart",
    character: "Stitch",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1744",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Stitch with Mood Chart is a Lilo & Stitch Pop! Disney release #1744.",
    display_description: "Stitch with Mood Chart is a Lilo & Stitch Pop! Disney release #1744.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698844246": {
    pop_name: "Stitch (Concept Art)",
    character: "Stitch",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1538",
    variant: "Concept Art",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Stitch (Concept Art) is a Lilo & Stitch Pop! Disney release #1538, Funko Shop exclusive.",
    display_description: "Stitch (Concept Art) is a Lilo & Stitch Pop! Disney release #1538, Funko Shop exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698751650": {
    pop_name: "Stitch (As Pongo)",
    character: "Stitch",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1462",
    variant: "As Pongo",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Stitch (As Pongo) is a Lilo & Stitch Pop! Disney release #1462.",
    display_description: "Stitch (As Pongo) is a Lilo & Stitch Pop! Disney release #1462.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698849357": {
    pop_name: "Angel with Umbrella",
    character: "Angel",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1573",
    exclusivity: "Specialty Series",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Angel with Umbrella is a Lilo & Stitch Pop! Disney release #1573, Specialty Series exclusive.",
    display_description: "Angel with Umbrella is a Lilo & Stitch Pop! Disney release #1573, Specialty Series exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698855365": {
    pop_name: "Lilo's Home",
    character: "Lilo's Home",
    franchise: "Disney",
    set_name: "Lilo & Stitch Bitty Pop!",
    variant: "Bitty Box",
    pop_type: "Bitty Pop!",
    pop_style: "Bitty Box",
    description: "Lilo's Home is a Lilo & Stitch Bitty Pop! Bitty Box release.",
    display_description: "Lilo's Home is a Lilo & Stitch Bitty Pop! Bitty Box release.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698919074": {
    pop_name: "Stitch with Mood Chart (Angry) (Chase)",
    character: "Stitch",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "1744",
    variant: "Chase",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Stitch with Mood Chart (Angry) (Chase) is a Lilo & Stitch Pop! Disney release #1744.",
    display_description: "Stitch with Mood Chart (Angry) (Chase) is a Lilo & Stitch Pop! Disney release #1744.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698515344": {
    pop_name: "Jiminy Cricket (Green Jacket)",
    character: "Jiminy Cricket",
    franchise: "Disney",
    set_name: "Pinocchio",
    number: "1026",
    variant: "Green Jacket",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Jiminy Cricket (Green Jacket) is a Pinocchio Pop! Disney release #1026.",
    display_description: "Jiminy Cricket (Green Jacket) is a Pinocchio Pop! Disney release #1026.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698515351": {
    pop_name: "Blue Fairy",
    character: "Blue Fairy",
    franchise: "Disney",
    set_name: "Pinocchio",
    number: "1027",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Blue Fairy is a Pinocchio Pop! Disney release #1027.",
    display_description: "Blue Fairy is a Pinocchio Pop! Disney release #1027.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698673860": {
    pop_name: "Geppetto",
    character: "Geppetto",
    franchise: "Netflix's Pinocchio",
    set_name: "Netflix's Pinocchio",
    number: "1297",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2022-01-01",
    description: "Geppetto is a Netflix's Pinocchio Pop! Movies release #1297.",
    display_description: "Geppetto is a Netflix's Pinocchio Pop! Movies release #1297.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698721967": {
    pop_name: "Margaret Dutton",
    character: "Margaret Dutton",
    franchise: "Yellowstone",
    set_name: "1883",
    number: "1445",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    release_date: "2024-01-01",
    description: "Margaret Dutton is an 1883 Pop! Television release #1445.",
    display_description: "Margaret Dutton is an 1883 Pop! Television release #1445.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803053079": {
    pop_name: "Morton Schmidt",
    character: "Morton Schmidt",
    franchise: "21 Jump Street",
    set_name: "21 Jump Street",
    number: "173",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2015-01-01",
    description: "Morton Schmidt is a 21 Jump Street Pop! Movies release #173.",
    display_description: "Morton Schmidt is a 21 Jump Street Pop! Movies release #173.",
    parse_confidence: 0.96,
    needs_review: false,
    warnings: [],
  },
  "849803053086": {
    pop_name: "Greg Jenko",
    character: "Greg Jenko",
    franchise: "21 Jump Street",
    set_name: "21 Jump Street",
    number: "174",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2015-01-01",
    description: "Greg Jenko is a 21 Jump Street Pop! Movies release #174.",
    display_description: "Greg Jenko is a 21 Jump Street Pop! Movies release #174.",
    parse_confidence: 0.96,
    needs_review: false,
    warnings: [],
  },
  "889698903325": {
    pop_name: "Fievel Mousekewitz",
    character: "Fievel Mousekewitz",
    franchise: "An American Tail",
    set_name: "An American Tail: Fievel Goes West",
    number: "2000",
    variant: "Fievel Goes West",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Fievel Mousekewitz is an An American Tail: Fievel Goes West Pop! Movies release #2000.",
    display_description: "Fievel Mousekewitz is an An American Tail: Fievel Goes West Pop! Movies release #2000.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698104517": {
    pop_name: "Captain Cassian Andor",
    character: "Captain Cassian Andor",
    franchise: "Star Wars",
    set_name: "Star Wars: Rogue One",
    number: "151",
    exclusivity: "Target",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    release_date: "2016-01-01",
    description: "Captain Cassian Andor is a Star Wars: Rogue One Pop! Star Wars release #151, Target exclusive.",
    display_description: "Captain Cassian Andor is a Star Wars: Rogue One Pop! Star Wars release #151, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698419673": {
    pop_name: "Annabelle",
    character: "Annabelle",
    franchise: "Annabelle",
    set_name: "Annabelle",
    number: "790",
    variant: "In Chair",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2019-01-01",
    description: "Annabelle is an Annabelle Pop! Movies release #790, In Chair variant.",
    display_description: "Annabelle is an Annabelle Pop! Movies release #790, In Chair variant.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698828505": {
    pop_name: "Evil Ash (Sword)",
    character: "Evil Ash",
    franchise: "Army of Darkness",
    set_name: "Army of Darkness",
    number: "1671",
    variant: "Sword",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2024-01-01",
    description: "Evil Ash (Sword) is an Army of Darkness Pop! Movies release #1671, Hot Topic exclusive.",
    display_description: "Evil Ash (Sword) is an Army of Darkness Pop! Movies release #1671, Hot Topic exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698838429": {
    pop_name: "Evil Ash (Swords)",
    character: "Evil Ash",
    franchise: "Army of Darkness",
    set_name: "Army of Darkness",
    number: "1881",
    variant: "Swords",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    release_date: "2025-01-01",
    description: "Evil Ash (Swords) is an Army of Darkness Pop! Movies release #1881.",
    display_description: "Evil Ash (Swords) is an Army of Darkness Pop! Movies release #1881.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698311533": {
    pop_name: 'Dobby (10" Super Sized Pop)',
    character: "Dobby",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "63",
    exclusivity: "Target",
    pop_type: "Pop! Movies",
    pop_style: "Jumbo",
    description: 'Dobby (10" Super Sized Pop) is a Harry Potter Pop! Movies Jumbo release #63, Target exclusive.',
    display_description: 'Dobby (10" Super Sized Pop) is a Harry Potter Pop! Movies Jumbo release #63, Target exclusive.',
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698800266": {
    pop_name: "Regina",
    character: "Regina",
    franchise: "Mean Girls",
    set_name: "Mean Girls",
    number: "289",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Regina is a Mean Girls Pop! Movies release #289.",
    display_description: "Regina is a Mean Girls Pop! Movies release #289.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698800235": {
    pop_name: "Cady (20th Anniversary)",
    character: "Cady",
    franchise: "Mean Girls",
    set_name: "Mean Girls",
    number: "1703",
    variant: "20th Anniversary",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Cady (20th Anniversary) is a Mean Girls Pop! Movies release #1703.",
    display_description: "Cady (20th Anniversary) is a Mean Girls Pop! Movies release #1703.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698800242": {
    pop_name: "Janis (20th Anniversary)",
    character: "Janis",
    franchise: "Mean Girls",
    set_name: "Mean Girls",
    number: "1704",
    variant: "20th Anniversary",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Janis (20th Anniversary) is a Mean Girls Pop! Movies release #1704.",
    display_description: "Janis (20th Anniversary) is a Mean Girls Pop! Movies release #1704.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698800259": {
    pop_name: "Damian (20th Anniversary)",
    character: "Damian",
    franchise: "Mean Girls",
    set_name: "Mean Girls",
    number: "1705",
    variant: "20th Anniversary",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Damian (20th Anniversary) is a Mean Girls Pop! Movies release #1705.",
    display_description: "Damian (20th Anniversary) is a Mean Girls Pop! Movies release #1705.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698902779": {
    pop_name: "Dean Winchester",
    character: "Dean Winchester",
    franchise: "Supernatural",
    set_name: "Supernatural",
    number: "1836",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Dean Winchester is a Supernatural Pop! Television release #1836.",
    display_description: "Dean Winchester is a Supernatural Pop! Television release #1836.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698902762": {
    pop_name: "Death (Scythe)",
    character: "Death",
    franchise: "Supernatural",
    set_name: "Supernatural",
    number: "1837",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Death (Scythe) is a Supernatural Pop! Television release #1837.",
    display_description: "Death (Scythe) is a Supernatural Pop! Television release #1837.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698902755": {
    pop_name: "Bobby Singer",
    character: "Bobby Singer",
    franchise: "Supernatural",
    set_name: "Supernatural",
    number: "1838",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Bobby Singer is a Supernatural Pop! Television release #1838.",
    display_description: "Bobby Singer is a Supernatural Pop! Television release #1838.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "830395033723": {
    pop_name: "The Joker",
    character: "The Joker",
    franchise: "DC",
    set_name: "The Dark Knight Trilogy",
    number: "36",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "The Joker is a DC Pop! Heroes release #36 from The Dark Knight Trilogy.",
    display_description: "The Joker is a DC Pop! Heroes release #36 from The Dark Knight Trilogy.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803038991": {
    pop_name: "The Joker / Bank Robber Joker",
    character: "The Joker / Bank Robber Joker",
    franchise: "DC",
    set_name: "The Dark Knight Trilogy",
    number: null,
    variant: "Glow in the Dark",
    exclusivity: "Gemini Collectibles",
    pop_type: "Pop! Heroes",
    pop_style: "2-Pack",
    limited_edition: true,
    limited_count: 480,
    edition_notes: "Limited edition Glow in the Dark 2-pack, 480 pieces.",
    description: "The Joker / Bank Robber Joker is a The Dark Knight Trilogy Pop! Heroes 2-pack, Glow in the Dark Gemini Collectibles exclusive limited to 480 pieces.",
    display_description: "The Joker / Bank Robber Joker is a The Dark Knight Trilogy Pop! Heroes 2-pack, Glow in the Dark Gemini Collectibles exclusive limited to 480 pieces.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698674447": {
    pop_name: "The Eradicator",
    character: "The Eradicator",
    franchise: "DC",
    set_name: "DC Comics: Superman",
    number: "40",
    variant: "Legendary",
    exclusivity: "Droppp",
    pop_type: "Pop! Digital",
    pop_style: "Standard",
    limited_edition: true,
    limited_count: 2050,
    edition_notes: "Production run of 2050",
    description: "The Eradicator is a DC Pop! Digital release #40 from DC Comics: Superman, Legendary rarity with a production run of 2050.",
    display_description: "The Eradicator is a DC Pop! Digital release #40 from DC Comics: Superman, Legendary rarity with a production run of 2050.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698855532": {
    pop_name: "Flintheart Glomgold",
    character: "Flintheart Glomgold",
    franchise: "Disney",
    set_name: "DuckTales",
    number: "313",
    variant: "Ultra",
    exclusivity: "Droppp",
    pop_type: "Pop! Digital",
    pop_style: "Standard",
    limited_edition: true,
    limited_count: 5000,
    edition_notes: "Production run of 5000",
    description: "Flintheart Glomgold is a Disney Pop! Digital release #313 from DuckTales, Ultra rarity with a production run of 5000.",
    display_description: "Flintheart Glomgold is a Disney Pop! Digital release #313 from DuckTales, Ultra rarity with a production run of 5000.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698907811": {
    pop_name: "Hawkgirl",
    character: "Hawkgirl",
    franchise: "DC",
    set_name: "Superman (2025)",
    number: "579",
    variant: "Ultra",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    limited_edition: true,
    limited_count: 5000,
    edition_notes: "Limited Edition - Ultra, 5000 pieces",
    description: "Hawkgirl is a DC Pop! Movies release #579 from Superman (2025), Limited Edition - Ultra with a 5000-piece run.",
    display_description: "Hawkgirl is a DC Pop! Movies release #579 from Superman (2025), Limited Edition - Ultra with a 5000-piece run.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
};

Object.assign(CATALOG_OVERRIDES_BY_UPC, {
  ...BATMAN_1989_REFRESH_REGRESSION_OVERRIDES,
  ...GAME_OF_THRONES_60_REFRESH_REGRESSION_OVERRIDES,
  ...GAME_OF_THRONES_67_REFRESH_REGRESSION_OVERRIDES,
  ...HARRY_POTTER_175_REFRESH_REGRESSION_OVERRIDES,
  "830395023427": {
    pop_name: "Mickey Mouse",
    character: "Mickey Mouse",
    franchise: "Disney",
    set_name: "Mickey Mouse",
    number: "1",
    variant: "Metallic",
    exclusivity: "Disney Store",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Mickey Mouse is a Disney Pop! Disney release #1 from Mickey Mouse, Metallic Disney Store exclusive.",
    display_description: "Mickey Mouse is a Disney Pop! Disney release #1 from Mickey Mouse, Metallic Disney Store exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698291743": {
    pop_name: "Mickey Mouse",
    character: "Mickey Mouse",
    franchise: "Disney",
    set_name: "Mickey Mouse",
    number: "1",
    variant: "Diamond Collection",
    exclusivity: "Barnes & Noble",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Mickey Mouse is a Disney Pop! Disney release #1 from Mickey Mouse, Diamond Collection Barnes & Noble exclusive.",
    display_description: "Mickey Mouse is a Disney Pop! Disney release #1 from Mickey Mouse, Diamond Collection Barnes & Noble exclusive.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "830395023533": {
    pop_name: "Stitch",
    character: "Stitch",
    franchise: "Disney",
    set_name: "Lilo & Stitch",
    number: "12",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Stitch is a Disney Pop! Disney release #12 from Lilo & Stitch.",
    display_description: "Stitch is a Disney Pop! Disney release #12 from Lilo & Stitch.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "830395024769": {
    pop_name: "Minnie Mouse",
    character: "Minnie Mouse",
    franchise: "Disney",
    set_name: "Mickey Mouse",
    number: "23",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Minnie Mouse is a Disney Pop! Disney release #23 from Mickey Mouse.",
    display_description: "Minnie Mouse is a Disney Pop! Disney release #23 from Mickey Mouse.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698433273": {
    pop_name: "Holiday Mickey Mouse",
    character: "Mickey Mouse",
    franchise: "Disney",
    set_name: "Disney Holiday",
    number: "612",
    variant: "Holiday",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Holiday Mickey Mouse is a Disney Pop! Disney release #612 from Disney Holiday.",
    display_description: "Holiday Mickey Mouse is a Disney Pop! Disney release #612 from Disney Holiday.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698433310": {
    pop_name: "Minnie Mouse Holiday",
    character: "Minnie Mouse",
    franchise: "Disney",
    set_name: "Disney Holiday",
    number: "613",
    variant: "Holiday",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Minnie Mouse Holiday is a Disney Pop! Disney release #613 from Disney Holiday.",
    display_description: "Minnie Mouse Holiday is a Disney Pop! Disney release #613 from Disney Holiday.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698839815": {
    pop_name: "Minnie Mouse",
    character: "Minnie Mouse",
    franchise: "Disney",
    set_name: "Mickey Mouse",
    number: "1557",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Minnie Mouse is a Disney Pop! Disney release #1557 from Mickey Mouse.",
    display_description: "Minnie Mouse is a Disney Pop! Disney release #1557 from Mickey Mouse.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698641821": {
    pop_name: "Peacemaker (In Underwear)",
    character: "Peacemaker",
    franchise: "DC",
    set_name: "Peacemaker",
    number: "1233",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Peacemaker (In Underwear) is a DC Pop! Television release #1233 from Peacemaker.",
    display_description: "Peacemaker (In Underwear) is a DC Pop! Television release #1233 from Peacemaker.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698636810": {
    pop_name: "Peacemaker (Shield)",
    character: "Peacemaker",
    franchise: "DC",
    set_name: "Peacemaker",
    number: "1237",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Peacemaker (Shield) is a DC Pop! Television release #1237 from Peacemaker.",
    display_description: "Peacemaker (Shield) is a DC Pop! Television release #1237 from Peacemaker.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698116961": {
    pop_name: "Quicksilver",
    character: "Quicksilver",
    franchise: "Marvel",
    set_name: "X-Men",
    number: "179",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Quicksilver is a Marvel Pop! Marvel release #179 from X-Men.",
    display_description: "Quicksilver is a Marvel Pop! Marvel release #179 from X-Men.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698370639": {
    pop_name: "Dark Phoenix",
    character: "Dark Phoenix",
    franchise: "Marvel",
    set_name: "X-Men",
    number: "422",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Dark Phoenix is a Marvel Pop! Marvel release #422 from X-Men.",
    display_description: "Dark Phoenix is a Marvel Pop! Marvel release #422 from X-Men.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698580885": {
    pop_name: "Gambit",
    character: "Gambit",
    franchise: "Marvel",
    set_name: "X-Men",
    number: "904",
    exclusivity: "Exclusive",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Gambit is a Marvel Pop! Marvel release #904 from X-Men, exclusive.",
    display_description: "Gambit is a Marvel Pop! Marvel release #904 from X-Men, exclusive.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698841153": {
    pop_name: "Apocalypse",
    character: "Apocalypse",
    franchise: "Marvel",
    set_name: "X-Men: Age of Apocalypse",
    number: "1459",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Apocalypse is a Marvel Pop! Marvel release #1459 from X-Men: Age of Apocalypse.",
    display_description: "Apocalypse is a Marvel Pop! Marvel release #1459 from X-Men: Age of Apocalypse.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698841160": {
    pop_name: "Blink",
    character: "Blink",
    franchise: "Marvel",
    set_name: "X-Men: Age of Apocalypse",
    number: "1458",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Blink is a Marvel Pop! Marvel release #1458 from X-Men: Age of Apocalypse.",
    display_description: "Blink is a Marvel Pop! Marvel release #1458 from X-Men: Age of Apocalypse.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698879507": {
    pop_name: "Dazzler",
    character: "Dazzler",
    franchise: "Marvel",
    set_name: "X-Men",
    number: "1506",
    variant: "Diamond Collection",
    exclusivity: "San Diego Comic-Con",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Dazzler is a Marvel Pop! Marvel release #1506 from X-Men, Diamond Collection San Diego Comic-Con exclusive.",
    display_description: "Dazzler is a Marvel Pop! Marvel release #1506 from X-Men, Diamond Collection San Diego Comic-Con exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698920650": {
    pop_name: "Cyclops (Wasteland)",
    character: "Cyclops",
    franchise: "Marvel",
    set_name: "X-Men '97",
    number: "1596",
    variant: "Wasteland",
    exclusivity: "Target",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Cyclops (Wasteland) is a Marvel Pop! Marvel release #1596 from X-Men '97, Target exclusive.",
    display_description: "Cyclops (Wasteland) is a Marvel Pop! Marvel release #1596 from X-Men '97, Target exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698738897": {
    pop_name: "Jean Grey",
    character: "Jean Grey",
    franchise: "Marvel",
    set_name: "X-Men '97",
    number: "1287",
    exclusivity: "Marvel Collector Corps",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Jean Grey is a Marvel Pop! Marvel release #1287 from X-Men '97, Marvel Collector Corps exclusive.",
    display_description: "Jean Grey is a Marvel Pop! Marvel release #1287 from X-Men '97, Marvel Collector Corps exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698741019": {
    pop_name: "Goblin Queen",
    character: "Goblin Queen",
    franchise: "Marvel",
    set_name: "X-Men '97",
    number: "1304",
    exclusivity: "New York Comic-Con",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Goblin Queen is a Marvel Pop! Marvel release #1304 from X-Men '97, New York Comic-Con exclusive.",
    display_description: "Goblin Queen is a Marvel Pop! Marvel release #1304 from X-Men '97, New York Comic-Con exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698862387": {
    pop_name: "Jubilee",
    character: "Jubilee",
    franchise: "Marvel",
    set_name: "X-Men '97",
    number: "1536",
    variant: "Chase",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Jubilee is a Marvel Pop! Marvel release #1536 from X-Men '97, Chase.",
    display_description: "Jubilee is a Marvel Pop! Marvel release #1536 from X-Men '97, Chase.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698668798": {
    pop_name: "Jubilee",
    character: "Jubilee",
    franchise: "Marvel",
    set_name: "X-Men '97",
    number: "1536",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Jubilee is a Marvel Pop! Marvel release #1536 from X-Men '97.",
    display_description: "Jubilee is a Marvel Pop! Marvel release #1536 from X-Men '97.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698862417": {
    pop_name: "Storm",
    character: "Storm",
    franchise: "Marvel",
    set_name: "X-Men '97",
    number: "1539",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Storm is a Marvel Pop! Marvel release #1539 from X-Men '97.",
    display_description: "Storm is a Marvel Pop! Marvel release #1539 from X-Men '97.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698872218": {
    pop_name: "Bastion Nimrod",
    character: "Bastion Nimrod",
    franchise: "Marvel",
    set_name: "X-Men '97",
    number: "1541",
    variant: "Chase",
    pop_type: "Pop! Marvel",
    pop_style: "Plus",
    description: "Bastion Nimrod is a Marvel Pop! Marvel Plus release #1541 from X-Men '97, Chase.",
    display_description: "Bastion Nimrod is a Marvel Pop! Marvel Plus release #1541 from X-Men '97, Chase.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
});

Object.assign(CATALOG_OVERRIDES_BY_UPC, {
  "889698819411": {
    pop_name: "Bender (Burping)",
    character: "Bender",
    franchise: "Futurama",
    set_name: "Futurama",
    number: "1757",
    exclusivity: "Specialty Series",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Bender (Burping) is a Futurama Pop! Animation release #1757, Specialty Series.",
    display_description: "Bender (Burping) is a Futurama Pop! Animation release #1757, Specialty Series.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698800808": {
    pop_name: "Matador Bender",
    character: "Bender",
    franchise: "Futurama",
    set_name: "Futurama",
    number: "1756",
    variant: "Matador",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    description: "Matador Bender is a Futurama Pop! Animation release #1756.",
    display_description: "Matador Bender is a Futurama Pop! Animation release #1756.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "830395023502": {
    pop_name: "Maleficent",
    character: "Maleficent",
    franchise: "Disney",
    set_name: "Sleeping Beauty",
    number: "09",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Maleficent is a Disney Pop! Disney release #09 from Sleeping Beauty.",
    display_description: "Maleficent is a Disney Pop! Disney release #09 from Sleeping Beauty.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698902571": {
    pop_name: "Cruella De Vil (Phone)",
    character: "Cruella De Vil",
    franchise: "Disney",
    set_name: "Disney Villains",
    number: "1090",
    variant: "Phone",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Cruella De Vil (Phone) is a Disney Pop! Disney release #1090 from Disney Villains.",
    display_description: "Cruella De Vil (Phone) is a Disney Pop! Disney release #1090 from Disney Villains.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698650953": {
    pop_name: "Ursula in Cart",
    character: "Ursula",
    franchise: "Disney",
    set_name: "Disney Villains",
    number: "17",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Trains",
    pop_style: "Train",
    description: "Ursula in Cart is a Disney Pop! Trains release #17 from Disney Villains, Funko Shop exclusive.",
    display_description: "Ursula in Cart is a Disney Pop! Trains release #17 from Disney Villains, Funko Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698603959": {
    pop_name: "Captain Hook (Blacklight)",
    character: "Captain Hook",
    franchise: "Disney",
    set_name: "Disney Villains",
    number: "1081",
    variant: "Blacklight",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Captain Hook (Blacklight) is a Disney Pop! Disney release #1081 from Disney Villains, Hot Topic exclusive.",
    display_description: "Captain Hook (Blacklight) is a Disney Pop! Disney release #1081 from Disney Villains, Hot Topic exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698603942": {
    pop_name: "Dr. Facilier (Blacklight)",
    character: "Dr. Facilier",
    franchise: "Disney",
    set_name: "Disney Villains",
    number: "1084",
    variant: "Blacklight",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Dr. Facilier (Blacklight) is a Disney Pop! Disney release #1084 from Disney Villains, Hot Topic exclusive.",
    display_description: "Dr. Facilier (Blacklight) is a Disney Pop! Disney release #1084 from Disney Villains, Hot Topic exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698586399": {
    pop_name: "Hades (with Chess Board)",
    character: "Hades",
    franchise: "Disney",
    set_name: "Disney Villains",
    number: "1142",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Hades (with Chess Board) is a Disney Pop! Disney release #1142 from Disney Villains.",
    display_description: "Hades (with Chess Board) is a Disney Pop! Disney release #1142 from Disney Villains.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698809290": {
    pop_name: "Jafar (Sultan)",
    character: "Jafar",
    franchise: "Disney",
    set_name: "Disney Villains",
    number: "1519",
    variant: "Sultan",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Jafar (Sultan) is a Disney Pop! Disney release #1519 from Disney Villains.",
    display_description: "Jafar (Sultan) is a Disney Pop! Disney release #1519 from Disney Villains.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698809313": {
    pop_name: "Yzma (Potion)",
    character: "Yzma",
    franchise: "Disney",
    set_name: "Disney Villains",
    number: "1521",
    variant: "Potion",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Yzma (Potion) is a Disney Pop! Disney release #1521 from Disney Villains.",
    display_description: "Yzma (Potion) is a Disney Pop! Disney release #1521 from Disney Villains.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698767194": {
    pop_name: "Disguised Evil Queen (with Raven)",
    character: "Evil Queen",
    franchise: "Disney",
    set_name: "Disney Villains",
    number: "1426",
    variant: "Blacklight",
    exclusivity: "BoxLunch",
    pop_type: "Pop! & Buddy",
    pop_style: "Standard",
    description: "Disguised Evil Queen (with Raven) is a Disney Pop! & Buddy release #1426 from Disney Villains, Blacklight BoxLunch exclusive.",
    display_description: "Disguised Evil Queen (with Raven) is a Disney Pop! & Buddy release #1426 from Disney Villains, Blacklight BoxLunch exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698779920": {
    pop_name: "Ursula (Stained Glass)",
    character: "Ursula",
    franchise: "Disney",
    set_name: "Disney Villains",
    number: "1638",
    variant: "Stained Glass",
    pop_type: "Pop! Deluxe",
    pop_style: "Deluxe",
    description: "Ursula (Stained Glass) is a Disney Pop! Deluxe release #1638 from Disney Villains.",
    display_description: "Ursula (Stained Glass) is a Disney Pop! Deluxe release #1638 from Disney Villains.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698466585": {
    pop_name: "Wonder Woman (Golden Armor Metallic)",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "Wonder Woman 1984",
    number: "323",
    variant: "Metallic",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman (Golden Armor Metallic) is a DC Pop! Heroes release #323 from Wonder Woman 1984, Metallic.",
    display_description: "Wonder Woman (Golden Armor Metallic) is a DC Pop! Heroes release #323 from Wonder Woman 1984, Metallic.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698473736": {
    pop_name: "Wonder Woman (Flying)",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "Wonder Woman 1984",
    number: "322",
    variant: "Flying",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman (Flying) is a DC Pop! Heroes release #322 from Wonder Woman 1984.",
    display_description: "Wonder Woman (Flying) is a DC Pop! Heroes release #322 from Wonder Woman 1984.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698466646": {
    pop_name: "Diana Prince Gala",
    character: "Diana Prince",
    franchise: "DC",
    set_name: "Wonder Woman 1984",
    number: "325",
    variant: "Gala",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Diana Prince Gala is a DC Pop! Heroes release #325 from Wonder Woman 1984.",
    display_description: "Diana Prince Gala is a DC Pop! Heroes release #325 from Wonder Woman 1984.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698466592": {
    pop_name: "Wonder Woman (Golden Armor Shield)",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "Wonder Woman 1984",
    number: "329",
    variant: "Golden Armor Shield",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman (Golden Armor Shield) is a DC Pop! Heroes release #329 from Wonder Woman 1984.",
    display_description: "Wonder Woman (Golden Armor Shield) is a DC Pop! Heroes release #329 from Wonder Woman 1984.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698466615": {
    pop_name: "Wonder Woman (Golden Armor)",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "Wonder Woman 1984",
    number: "330",
    variant: "Golden Armor",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman (Golden Armor) is a DC Pop! Heroes release #330 from Wonder Woman 1984.",
    display_description: "Wonder Woman (Golden Armor) is a DC Pop! Heroes release #330 from Wonder Woman 1984.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698549769": {
    pop_name: "Wonder Woman (Superman: Red Son)",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "Wonder Woman 80th Anniversary",
    number: "392",
    variant: "Superman: Red Son",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman (Superman: Red Son) is a DC Pop! Heroes release #392 from Wonder Woman 80th Anniversary.",
    display_description: "Wonder Woman (Superman: Red Son) is a DC Pop! Heroes release #392 from Wonder Woman 80th Anniversary.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698569675": {
    pop_name: "Wonder Woman (Black Lantern)",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "Wonder Woman 80th Anniversary",
    number: "393",
    variant: "Glow in the Dark",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman (Black Lantern) is a DC Pop! Heroes release #393 from Wonder Woman 80th Anniversary, Glow in the Dark.",
    display_description: "Wonder Woman (Black Lantern) is a DC Pop! Heroes release #393 from Wonder Woman 80th Anniversary, Glow in the Dark.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698549905": {
    pop_name: "Wonder Woman (Odyssey)",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "Wonder Woman 80th Anniversary",
    number: "405",
    variant: "Odyssey",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman (Odyssey) is a DC Pop! Heroes release #405 from Wonder Woman 80th Anniversary.",
    display_description: "Wonder Woman (Odyssey) is a DC Pop! Heroes release #405 from Wonder Woman 80th Anniversary.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698549943": {
    pop_name: "Wonder Woman (Flashpoint)",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "Wonder Woman 80th Anniversary",
    number: "431",
    variant: "Flashpoint",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman (Flashpoint) is a DC Pop! Heroes release #431 from Wonder Woman 80th Anniversary.",
    display_description: "Wonder Woman (Flashpoint) is a DC Pop! Heroes release #431 from Wonder Woman 80th Anniversary.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698572705": {
    pop_name: "Wonder Woman (White Lantern)",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "Wonder Woman 80th Anniversary",
    number: "423",
    variant: "White Lantern",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman (White Lantern) is a DC Pop! Heroes release #423 from Wonder Woman 80th Anniversary.",
    display_description: "Wonder Woman (White Lantern) is a DC Pop! Heroes release #423 from Wonder Woman 80th Anniversary.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698143851": {
    pop_name: "Doctor Maru",
    character: "Doctor Maru",
    franchise: "DC",
    set_name: "Wonder Woman",
    number: "433",
    exclusivity: "Legion of Collectors",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Doctor Maru is a DC Pop! Heroes release #433 from Wonder Woman, Legion of Collectors exclusive.",
    display_description: "Doctor Maru is a DC Pop! Heroes release #433 from Wonder Woman, Legion of Collectors exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698506526": {
    pop_name: "Wonder Woman (with String Light Lasso)",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "DC Holiday",
    number: "354",
    variant: "Holiday",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman (with String Light Lasso) is a DC Pop! Heroes release #354 from DC Holiday.",
    display_description: "Wonder Woman (with String Light Lasso) is a DC Pop! Heroes release #354 from DC Holiday.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "830395030296": {
    pop_name: "Wonder Woman (DC New Classics)",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "DC New Classics",
    number: "600",
    variant: "DC New Classics",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman (DC New Classics) is a DC Pop! Heroes release #600 from DC New Classics.",
    display_description: "Wonder Woman (DC New Classics) is a DC Pop! Heroes release #600 from DC New Classics.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
});

Object.assign(CATALOG_OVERRIDES_BY_UPC, {
  "889698642323": {
    pop_name: "Freddy (Tie-Dye)",
    character: "Freddy",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "878",
    variant: "Tie-Dye",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Freddy (Tie-Dye) is a Five Nights at Freddy's Pop! Games release #878, Tie-Dye.",
    display_description: "Freddy (Tie-Dye) is a Five Nights at Freddy's Pop! Games release #878, Tie-Dye.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698676250": {
    pop_name: "Balloon Bonnie",
    character: "Balloon Bonnie",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "909",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Balloon Bonnie is a Five Nights at Freddy's Pop! Games release #909.",
    display_description: "Balloon Bonnie is a Five Nights at Freddy's Pop! Games release #909.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698724869": {
    pop_name: "Snow Chica",
    character: "Chica",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "939",
    variant: "Holiday",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Snow Chica is a Five Nights at Freddy's Pop! Games release #939, Holiday.",
    display_description: "Snow Chica is a Five Nights at Freddy's Pop! Games release #939, Holiday.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698724715": {
    pop_name: "Ruined Chica",
    character: "Chica",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "986",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Ruined Chica is a Five Nights at Freddy's Pop! Games release #986.",
    display_description: "Ruined Chica is a Five Nights at Freddy's Pop! Games release #986.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698830911": {
    pop_name: "Withered Golden Freddy",
    character: "Withered Golden Freddy",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "1033",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Withered Golden Freddy is a Five Nights at Freddy's Pop! Games release #1033.",
    display_description: "Withered Golden Freddy is a Five Nights at Freddy's Pop! Games release #1033.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698871167": {
    pop_name: "Freddy Fazbear (10th Anniversary)",
    character: "Freddy Fazbear",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "1060",
    variant: "10th Anniversary",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Freddy Fazbear (10th Anniversary) is a Five Nights at Freddy's Pop! Games release #1060.",
    display_description: "Freddy Fazbear (10th Anniversary) is a Five Nights at Freddy's Pop! Games release #1060.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698838641": {
    pop_name: "Withered Bonnie",
    character: "Withered Bonnie",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "1083",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Withered Bonnie is a Five Nights at Freddy's Pop! Games release #1083.",
    display_description: "Withered Bonnie is a Five Nights at Freddy's Pop! Games release #1083.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698838658": {
    pop_name: "Withered Chica",
    character: "Withered Chica",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "1084",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Withered Chica is a Five Nights at Freddy's Pop! Games release #1084.",
    display_description: "Withered Chica is a Five Nights at Freddy's Pop! Games release #1084.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698838665": {
    pop_name: "Withered Foxy",
    character: "Withered Foxy",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "1085",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Withered Foxy is a Five Nights at Freddy's Pop! Games release #1085.",
    display_description: "Withered Foxy is a Five Nights at Freddy's Pop! Games release #1085.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698883023": {
    pop_name: "Eclipse",
    character: "Eclipse",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "1109",
    variant: "Glow in the Dark",
    exclusivity: "GameStop",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Eclipse is a Five Nights at Freddy's Pop! Games release #1109, Glow in the Dark, GameStop exclusive.",
    display_description: "Eclipse is a Five Nights at Freddy's Pop! Games release #1109, Glow in the Dark, GameStop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698861175": {
    pop_name: "DJ Music Man",
    character: "DJ Music Man",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "1131",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "DJ Music Man is a Five Nights at Freddy's Pop! Games release #1131.",
    display_description: "DJ Music Man is a Five Nights at Freddy's Pop! Games release #1131.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698885553": {
    pop_name: "Jack-O-Moon",
    character: "Jack-O-Moon",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "1133",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Jack-O-Moon is a Five Nights at Freddy's Pop! Games release #1133, Hot Topic exclusive.",
    display_description: "Jack-O-Moon is a Five Nights at Freddy's Pop! Games release #1133, Hot Topic exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698918213": {
    pop_name: "Tiger Rock",
    character: "Tiger Rock",
    franchise: "Five Nights at Freddy's",
    set_name: "Five Nights at Freddy's",
    number: "1153",
    exclusivity: "TargetCon",
    pop_type: "Pop! Games",
    pop_style: "Standard",
    description: "Tiger Rock is a Five Nights at Freddy's Pop! Games release #1153, TargetCon exclusive.",
    display_description: "Tiger Rock is a Five Nights at Freddy's Pop! Games release #1153, TargetCon exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
});

Object.assign(CATALOG_OVERRIDES_BY_UPC, {
  "889698485654": {
    pop_name: "Stan Lee",
    character: "Stan Lee",
    franchise: "Marvel",
    set_name: "Thor: Ragnarok",
    number: "655",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Stan Lee is a Marvel Pop! Marvel release #655 from Thor: Ragnarok.",
    display_description: "Stan Lee is a Marvel Pop! Marvel release #655 from Thor: Ragnarok.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803049164": {
    pop_name: "Loki",
    character: "Loki",
    franchise: "Marvel",
    set_name: "Marvel Comics",
    number: "36",
    variant: "Black & White",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Loki is a Marvel Pop! Marvel release #36.",
    display_description: "Loki is a Marvel Pop! Marvel release #36.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698348836": {
    pop_name: "Hulk Smashing Loki",
    character: "Hulk & Loki",
    franchise: "Marvel",
    set_name: "Marvel Studios 10",
    number: "362",
    pop_type: "Pop! Movie Moments",
    pop_style: "Movie Moment",
    description: "Hulk Smashing Loki is a Marvel Studios 10 Pop! Movie Moments release #362.",
    display_description: "Hulk Smashing Loki is a Marvel Studios 10 Pop! Movie Moments release #362.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698718967": {
    pop_name: "Loki (Agent of Asgard)",
    character: "Loki",
    franchise: "Marvel",
    set_name: "Marvel Comics",
    number: "1247",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Loki (Agent of Asgard) is a Marvel Pop! Marvel release #1247.",
    display_description: "Loki (Agent of Asgard) is a Marvel Pop! Marvel release #1247.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698710633": {
    pop_name: "Frost Giant Loki",
    character: "Loki",
    franchise: "Marvel",
    set_name: "Marvel Comics",
    number: "1269",
    variant: "Glow in the Dark",
    exclusivity: "Entertainment Earth",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Frost Giant Loki is a Marvel Pop! Marvel release #1269, Glow in the Dark Entertainment Earth exclusive.",
    display_description: "Frost Giant Loki is a Marvel Pop! Marvel release #1269, Glow in the Dark Entertainment Earth exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698631754": {
    pop_name: "Lady Loki",
    character: "Lady Loki",
    franchise: "Marvel",
    set_name: "Marvel Comics",
    number: "1029",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Lady Loki is a Marvel Pop! Marvel release #1029.",
    display_description: "Lady Loki is a Marvel Pop! Marvel release #1029.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698512886": {
    pop_name: "Loki (with Tesseract)",
    character: "Loki",
    franchise: "Marvel",
    set_name: "Avengers: Endgame",
    number: "747",
    variant: "Glow in the Dark",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Loki (with Tesseract) is a Marvel Pop! Marvel release #747 from Avengers: Endgame, Glow in the Dark Funko Shop exclusive.",
    display_description: "Loki (with Tesseract) is a Marvel Pop! Marvel release #747 from Avengers: Endgame, Glow in the Dark Funko Shop exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698586498": {
    pop_name: "Frost Giant Loki",
    character: "Loki",
    franchise: "Marvel",
    set_name: "What If...?",
    number: "972",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Frost Giant Loki is a Marvel Pop! Marvel release #972 from What If...?.",
    display_description: "Frost Giant Loki is a Marvel Pop! Marvel release #972 from What If...?.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698627061": {
    pop_name: "Loki with Scepter",
    character: "Loki",
    franchise: "Marvel",
    set_name: "Avengers",
    number: "985",
    variant: "Glow in the Dark",
    exclusivity: "Entertainment Earth",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Loki with Scepter is a Marvel Pop! Marvel release #985 from Avengers, Glow in the Dark Entertainment Earth exclusive.",
    display_description: "Loki with Scepter is a Marvel Pop! Marvel release #985 from Avengers, Glow in the Dark Entertainment Earth exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698649261": {
    pop_name: "Groot",
    character: "Groot",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Comics",
    number: "12",
    exclusivity: "Target",
    pop_type: "Pop! Marvel",
    pop_style: "Comic Cover",
    description: "Groot is a Marvel Pop! Comic Covers release #12 from Guardians of the Galaxy Comics.",
    display_description: "Groot is a Marvel Pop! Comic Covers release #12 from Guardians of the Galaxy Comics.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698344616": {
    pop_name: "Rocket Raccoon (Classic)",
    character: "Rocket Raccoon",
    franchise: "Marvel",
    set_name: "Guardians of the Galaxy Comics",
    number: "396",
    variant: "Classic",
    exclusivity: "PX Previews",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Rocket Raccoon (Classic) is a Marvel Pop! Marvel release #396 from Guardians of the Galaxy Comics.",
    display_description: "Rocket Raccoon (Classic) is a Marvel Pop! Marvel release #396 from Guardians of the Galaxy Comics.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
});

Object.assign(CATALOG_OVERRIDES_BY_UPC, {
  "849803059026": {
    pop_name: "Harry Potter (Quidditch)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "8",
    exclusivity: "Hot Topic Pre-release",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (Quidditch) is a Wizarding World Pop! Movies release #8 from Harry Potter, Hot Topic Pre-release exclusive.",
    display_description: "Harry Potter (Quidditch) is a Wizarding World Pop! Movies release #8 from Harry Potter, Hot Topic Pre-release exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803065607": {
    pop_name: "Harry Potter (Triwizard Tournament)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "10",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (Triwizard Tournament) is a Wizarding World Pop! Movies release #10 from Harry Potter.",
    display_description: "Harry Potter (Triwizard Tournament) is a Wizarding World Pop! Movies release #10 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803065676": {
    pop_name: "Hermione Granger (Yule Ball)",
    character: "Hermione Granger",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "11",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Hermione Granger (Yule Ball) is a Wizarding World Pop! Movies release #11 from Harry Potter.",
    display_description: "Hermione Granger (Yule Ball) is a Wizarding World Pop! Movies release #11 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803068820": {
    pop_name: "Cedric Diggory",
    character: "Cedric Diggory",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "20",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Cedric Diggory is a Wizarding World Pop! Movies release #20 from Harry Potter, Hot Topic exclusive.",
    display_description: "Cedric Diggory is a Wizarding World Pop! Movies release #20 from Harry Potter, Hot Topic exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "849803061579": {
    pop_name: "Harry Potter (Sorting Hat)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "21",
    exclusivity: "B&N",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (Sorting Hat) is a Wizarding World Pop! Movies release #21 from Harry Potter, B&N exclusive.",
    display_description: "Harry Potter (Sorting Hat) is a Wizarding World Pop! Movies release #21 from Harry Potter, B&N exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698108652": {
    pop_name: "Harry Potter (Golden Egg)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "26",
    exclusivity: "Target",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (Golden Egg) is a Wizarding World Pop! Movies release #26 from Harry Potter, Target exclusive.",
    display_description: "Harry Potter (Golden Egg) is a Wizarding World Pop! Movies release #26 from Harry Potter, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698147330": {
    pop_name: "Harry Potter (On Broom)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "31",
    exclusivity: "2017 SDCC",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (On Broom) is a Wizarding World Pop! Movies release #31 from Harry Potter, 2017 SDCC exclusive.",
    display_description: "Harry Potter (On Broom) is a Wizarding World Pop! Movies release #31 from Harry Potter, 2017 SDCC exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698149365": {
    pop_name: "Harry Potter (Marauder's Map)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "42",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (Marauder's Map) is a Wizarding World Pop! Movies release #42 from Harry Potter.",
    display_description: "Harry Potter (Marauder's Map) is a Wizarding World Pop! Movies release #42 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698149440": {
    pop_name: "Luna Lovegood (Lion Hat)",
    character: "Luna Lovegood",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "47",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Luna Lovegood (Lion Hat) is a Wizarding World Pop! Movies release #47 from Harry Potter.",
    display_description: "Luna Lovegood (Lion Hat) is a Wizarding World Pop! Movies release #47 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698149495": {
    pop_name: "Harry Potter (Firebolt)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "51",
    exclusivity: "BoxLunch",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (Firebolt) is a Wizarding World Pop! Movies release #51 from Harry Potter, BoxLunch exclusive.",
    display_description: "Harry Potter (Firebolt) is a Wizarding World Pop! Movies release #51 from Harry Potter, BoxLunch exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698347648": {
    pop_name: "Hermione Granger (Sorting Hat)",
    character: "Hermione Granger",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "69",
    exclusivity: "2018 NYCC / B&N",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Hermione Granger (Sorting Hat) is a Wizarding World Pop! Movies release #69 from Harry Potter, 2018 NYCC / B&N exclusive.",
    display_description: "Hermione Granger (Sorting Hat) is a Wizarding World Pop! Movies release #69 from Harry Potter, 2018 NYCC / B&N exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698355148": {
    pop_name: "Sirius Black (As Dog)",
    character: "Sirius Black",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "73",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Sirius Black (As Dog) is a Wizarding World Pop! Movies release #73 from Harry Potter.",
    display_description: "Sirius Black (As Dog) is a Wizarding World Pop! Movies release #73 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698355131": {
    pop_name: "Bloody Baron",
    character: "Bloody Baron",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "74",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Bloody Baron is a Wizarding World Pop! Movies release #74 from Harry Potter.",
    display_description: "Bloody Baron is a Wizarding World Pop! Movies release #74 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698355094": {
    pop_name: "Hermione Granger (As Cat)",
    character: "Hermione Granger",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "77",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Hermione Granger (As Cat) is a Wizarding World Pop! Movies release #77 from Harry Potter.",
    display_description: "Hermione Granger (As Cat) is a Wizarding World Pop! Movies release #77 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698344241": {
    pop_name: "Harry Potter (Pyjamas/Broken Arm)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "79",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (Pyjamas/Broken Arm) is a Wizarding World Pop! Movies release #79 from Harry Potter.",
    display_description: "Harry Potter (Pyjamas/Broken Arm) is a Wizarding World Pop! Movies release #79 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698428460": {
    pop_name: "Parvati Patil (Yule Ball)",
    character: "Parvati Patil",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "100",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Parvati Patil (Yule Ball) is a Wizarding World Pop! Movies release #100 from Harry Potter.",
    display_description: "Parvati Patil (Yule Ball) is a Wizarding World Pop! Movies release #100 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698448673": {
    pop_name: "Buckbeak",
    character: "Buckbeak",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "104",
    variant: "Flocked",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Buckbeak is a Wizarding World Pop! Movies release #104 from Harry Potter, Flocked Hot Topic exclusive.",
    display_description: "Buckbeak is a Wizarding World Pop! Movies release #104 from Harry Potter, Flocked Hot Topic exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698511551": {
    pop_name: "Albus Dumbledore (Holiday)",
    character: "Albus Dumbledore",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "125",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Albus Dumbledore (Holiday) is a Wizarding World Pop! Movies release #125 from Harry Potter.",
    display_description: "Albus Dumbledore (Holiday) is a Wizarding World Pop! Movies release #125 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698902731": {
    pop_name: "Patronus Severus Snape",
    character: "Severus Snape",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "128",
    variant: "Patronus",
    exclusivity: "2021 Funko Fair / Wizarding World Pre-release",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Patronus Severus Snape is a Wizarding World Pop! Movies release #128 from Harry Potter, Patronus 2021 Funko Fair / Wizarding World Pre-release exclusive.",
    display_description: "Patronus Severus Snape is a Wizarding World Pop! Movies release #128 from Harry Potter, Patronus 2021 Funko Fair / Wizarding World Pre-release exclusive.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698538497": {
    pop_name: "Patronus Minerva McGonagall",
    character: "Minerva McGonagall",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "129",
    variant: "Patronus",
    exclusivity: "2021 Funko Fair / Wizarding World Pre-release",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Patronus Minerva McGonagall is a Wizarding World Pop! Movies release #129 from Harry Potter, Patronus 2021 Funko Fair / Wizarding World Pre-release exclusive.",
    display_description: "Patronus Minerva McGonagall is a Wizarding World Pop! Movies release #129 from Harry Potter, Patronus 2021 Funko Fair / Wizarding World Pre-release exclusive.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698670517": {
    pop_name: "Harry Potter (With Gryffindor Sword and Basilisk Fang)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "147",
    exclusivity: "2022 SDCC",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (With Gryffindor Sword and Basilisk Fang) is a Wizarding World Pop! Movies release #147 from Harry Potter, 2022 SDCC exclusive.",
    display_description: "Harry Potter (With Gryffindor Sword and Basilisk Fang) is a Wizarding World Pop! Movies release #147 from Harry Potter, 2022 SDCC exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698656535": {
    pop_name: "Hermione Granger (With Mirror)",
    character: "Hermione Granger",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "150",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Hermione Granger (With Mirror) is a Wizarding World Pop! Movies release #150 from Harry Potter.",
    display_description: "Hermione Granger (With Mirror) is a Wizarding World Pop! Movies release #150 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698767088": {
    pop_name: "Sirius Black (With Wormtail)",
    character: "Sirius Black",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "159",
    exclusivity: "BoxLunch",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Sirius Black (With Wormtail) is a Wizarding World Pop! Movies release #159 from Harry Potter, BoxLunch exclusive.",
    display_description: "Sirius Black (With Wormtail) is a Wizarding World Pop! Movies release #159 from Harry Potter, BoxLunch exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698760034": {
    pop_name: "Harry Potter (Quidditch Broom)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "165",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (Quidditch Broom) is a Wizarding World Pop! Movies release #165 from Harry Potter.",
    display_description: "Harry Potter (Quidditch Broom) is a Wizarding World Pop! Movies release #165 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698760065": {
    pop_name: "Ron Weasley (With Candy)",
    character: "Ron Weasley",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "166",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Ron Weasley (With Candy) is a Wizarding World Pop! Movies release #166 from Harry Potter.",
    display_description: "Ron Weasley (With Candy) is a Wizarding World Pop! Movies release #166 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698760102": {
    pop_name: "Hermione Granger (With Crookshanks)",
    character: "Hermione Granger",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "167",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Hermione Granger (With Crookshanks) is a Wizarding World Pop! Movies release #167 from Harry Potter.",
    display_description: "Hermione Granger (With Crookshanks) is a Wizarding World Pop! Movies release #167 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698760058": {
    pop_name: "Draco Malfoy (With Broken Arm)",
    character: "Draco Malfoy",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "168",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Draco Malfoy (With Broken Arm) is a Wizarding World Pop! Movies release #168 from Harry Potter.",
    display_description: "Draco Malfoy (With Broken Arm) is a Wizarding World Pop! Movies release #168 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698783040": {
    pop_name: "Harry Potter (Expecto Patronum)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "173",
    exclusivity: "2024 SDCC",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (Expecto Patronum) is a Wizarding World Pop! Movies release #173 from Harry Potter, 2024 SDCC exclusive.",
    display_description: "Harry Potter (Expecto Patronum) is a Wizarding World Pop! Movies release #173 from Harry Potter, 2024 SDCC exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698864343": {
    pop_name: "Harry Potter (With Hourglass)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "180",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (With Hourglass) is a Wizarding World Pop! Movies release #180 from Harry Potter.",
    display_description: "Harry Potter (With Hourglass) is a Wizarding World Pop! Movies release #180 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698902717": {
    pop_name: "Neville Longbottom (With Sword of Gryffindor)",
    character: "Neville Longbottom",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "194",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Neville Longbottom (With Sword of Gryffindor) is a Wizarding World Pop! Movies release #194 from Harry Potter.",
    display_description: "Neville Longbottom (With Sword of Gryffindor) is a Wizarding World Pop! Movies release #194 from Harry Potter.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698889780": {
    pop_name: "Harry Potter (Quidditch)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "188",
    exclusivity: "2025 Winter Convention / CCXP",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (Quidditch) is a Wizarding World Pop! Movies release #188 from Harry Potter, 2025 Winter Convention / CCXP exclusive.",
    display_description: "Harry Potter (Quidditch) is a Wizarding World Pop! Movies release #188 from Harry Potter, 2025 Winter Convention / CCXP exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698902670": {
    pop_name: "Aberforth Dumbledore (With Mirror Shard)",
    character: "Aberforth Dumbledore",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "190",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Aberforth Dumbledore (With Mirror Shard) is a Wizarding World Pop! Movies release #190 from Harry Potter.",
    display_description: "Aberforth Dumbledore (With Mirror Shard) is a Wizarding World Pop! Movies release #190 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698902724": {
    pop_name: "Harry Potter (With Resurrection Stone)",
    character: "Harry Potter",
    franchise: "Wizarding World",
    set_name: "Harry Potter",
    number: "196",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Harry Potter (With Resurrection Stone) is a Wizarding World Pop! Movies release #196 from Harry Potter.",
    display_description: "Harry Potter (With Resurrection Stone) is a Wizarding World Pop! Movies release #196 from Harry Potter.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
});

Object.assign(CATALOG_OVERRIDES_BY_UPC, {
  "849803060251": {
    pop_name: "Batman",
    character: "Batman",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    number: "84",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Batman is a DC Pop! Heroes release #84 from Batman v Superman: Dawn of Justice.",
    display_description: "Batman is a DC Pop! Heroes release #84 from Batman v Superman: Dawn of Justice.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803060268": {
    pop_name: "Superman",
    character: "Superman",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    number: "85",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Superman is a DC Pop! Heroes release #85 from Batman v Superman: Dawn of Justice.",
    display_description: "Superman is a DC Pop! Heroes release #85 from Batman v Superman: Dawn of Justice.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803060275": {
    pop_name: "Wonder Woman",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    number: "86",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman is a DC Pop! Heroes release #86 from Batman v Superman: Dawn of Justice.",
    display_description: "Wonder Woman is a DC Pop! Heroes release #86 from Batman v Superman: Dawn of Justice.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698115285": {
    pop_name: "Wonder Woman (Sepia)",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    number: "86",
    variant: "Sepia",
    exclusivity: "Walmart",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman (Sepia) is a DC Pop! Heroes release #86 from Batman v Superman: Dawn of Justice, Walmart exclusive.",
    display_description: "Wonder Woman (Sepia) is a DC Pop! Heroes release #86 from Batman v Superman: Dawn of Justice, Walmart exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "849803063429": {
    pop_name: "Aquaman",
    character: "Aquaman",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    number: "87",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Aquaman is a DC Pop! Heroes release #87 from Batman v Superman: Dawn of Justice.",
    display_description: "Aquaman is a DC Pop! Heroes release #87 from Batman v Superman: Dawn of Justice.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698102643": {
    pop_name: "Aquaman (Patina)",
    character: "Aquaman",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    number: "87",
    variant: "Patina",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Aquaman (Patina) is a DC Pop! Heroes release #87 from Batman v Superman: Dawn of Justice.",
    display_description: "Aquaman (Patina) is a DC Pop! Heroes release #87 from Batman v Superman: Dawn of Justice.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "849803075767": {
    pop_name: "Aquaman (Underwater)",
    character: "Aquaman",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    number: "87",
    variant: "Underwater",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Aquaman (Underwater) is a DC Pop! Heroes release #87 from Batman v Superman: Dawn of Justice.",
    display_description: "Aquaman (Underwater) is a DC Pop! Heroes release #87 from Batman v Superman: Dawn of Justice.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698106474": {
    pop_name: "Wonder Woman (Patina)",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    number: "86",
    variant: "Patina",
    exclusivity: "Books-A-Million",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman (Patina) is a DC Pop! Heroes release #86 from Batman v Superman: Dawn of Justice, Books-A-Million exclusive.",
    display_description: "Wonder Woman (Patina) is a DC Pop! Heroes release #86 from Batman v Superman: Dawn of Justice, Books-A-Million exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698060288": {
    pop_name: "Armored Batman",
    character: "Armored Batman",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    number: "88",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Armored Batman is a DC Pop! Heroes release #88 from Batman v Superman: Dawn of Justice.",
    display_description: "Armored Batman is a DC Pop! Heroes release #88 from Batman v Superman: Dawn of Justice.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803075781": {
    pop_name: "Knightmare Batman",
    character: "Knightmare Batman",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    number: "89",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Knightmare Batman is a DC Pop! Heroes release #89 from Batman v Superman: Dawn of Justice.",
    display_description: "Knightmare Batman is a DC Pop! Heroes release #89 from Batman v Superman: Dawn of Justice.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803098315": {
    pop_name: "Doomsday",
    character: "Doomsday",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    number: "129",
    variant: "6-inch",
    pop_type: "Pop! Heroes",
    pop_style: "Jumbo",
    description: "Doomsday is a DC Pop! Heroes 6-inch release #129 from Batman v Superman: Dawn of Justice.",
    display_description: "Doomsday is a DC Pop! Heroes 6-inch release #129 from Batman v Superman: Dawn of Justice.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803099312": {
    pop_name: "Superman (False God)",
    character: "Superman",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    number: "130",
    variant: "False God",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Superman (False God) is a DC Pop! Heroes release #130 from Batman v Superman: Dawn of Justice, Summer Convention exclusive.",
    display_description: "Superman (False God) is a DC Pop! Heroes release #130 from Batman v Superman: Dawn of Justice, Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803075798": {
    pop_name: "Superman Soldier",
    character: "Superman Soldier",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    number: "90",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Superman Soldier is a DC Pop! Heroes release #90 from Batman v Superman: Dawn of Justice.",
    display_description: "Superman Soldier is a DC Pop! Heroes release #90 from Batman v Superman: Dawn of Justice.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803065447": {
    pop_name: "Batman vs Superman",
    character: "Batman & Superman",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    variant: "Glow in the Dark",
    pop_type: "Pop! Heroes",
    pop_style: "Movie Moment",
    description: "Batman vs Superman is a DC Pop! Heroes release from Batman v Superman: Dawn of Justice, Glow in the Dark.",
    display_description: "Batman vs Superman is a DC Pop! Heroes release from Batman v Superman: Dawn of Justice, Glow in the Dark.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "849803070052": {
    pop_name: "Batman vs Superman",
    character: "Batman & Superman",
    franchise: "DC",
    set_name: "Batman v Superman: Dawn of Justice",
    variant: "Metallic",
    exclusivity: "Exclusive",
    pop_type: "Pop! Heroes",
    pop_style: "Movie Moment",
    description: "Batman vs Superman is a DC Pop! Heroes release from Batman v Superman: Dawn of Justice, Metallic exclusive.",
    display_description: "Batman vs Superman is a DC Pop! Heroes release from Batman v Superman: Dawn of Justice, Metallic exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698649278": {
    pop_name: "Superman",
    character: "Superman",
    franchise: "DC",
    set_name: "Zack Snyder's Justice League",
    number: "1123",
    exclusivity: "AAA Anime",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Superman is a DC Pop! Movies release #1123 from Zack Snyder's Justice League, AAA Anime exclusive.",
    display_description: "Superman is a DC Pop! Movies release #1123 from Zack Snyder's Justice League, AAA Anime exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698568012": {
    pop_name: "Superman",
    character: "Superman",
    franchise: "DC",
    set_name: "Zack Snyder's Justice League",
    number: "1123",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Superman is a DC Pop! Movies release #1123 from Zack Snyder's Justice League.",
    display_description: "Superman is a DC Pop! Movies release #1123 from Zack Snyder's Justice League.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698568357": {
    pop_name: "Superman Landing",
    character: "Superman",
    franchise: "DC",
    set_name: "Zack Snyder's Justice League",
    number: "1127",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Superman Landing is a DC Pop! Movies release #1127 from Zack Snyder's Justice League, Hot Topic exclusive.",
    display_description: "Superman Landing is a DC Pop! Movies release #1127 from Zack Snyder's Justice League, Hot Topic exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698569798": {
    pop_name: "Deadpool",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool",
    number: "320",
    variant: "Pride",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool is a Marvel Pop! Marvel release #320 from Deadpool, Pride variant.",
    display_description: "Deadpool is a Marvel Pop! Marvel release #320 from Deadpool, Pride variant.",
    parse_confidence: 0.92,
    needs_review: false,
    warnings: [],
  },
  "889698545501": {
    pop_name: "Deadpool With Teddy Pants",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool",
    number: "754",
    variant: "Teddy Pants",
    exclusivity: "Spring Convention",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool With Teddy Pants is a Marvel Pop! Marvel release #754 from Deadpool, Spring Convention exclusive.",
    display_description: "Deadpool With Teddy Pants is a Marvel Pop! Marvel release #754 from Deadpool, Spring Convention exclusive.",
    parse_confidence: 0.92,
    needs_review: false,
    warnings: [],
  },
  "889698584296": {
    pop_name: "Artist Deadpool",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Bucket List",
    number: "887",
    variant: "Blacklight",
    exclusivity: "GameStop",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Artist Deadpool is a Marvel Pop! Marvel release #887 from Deadpool Bucket List, Blacklight GameStop exclusive.",
    display_description: "Artist Deadpool is a Marvel Pop! Marvel release #887 from Deadpool Bucket List, Blacklight GameStop exclusive.",
    parse_confidence: 0.92,
    needs_review: false,
    warnings: [],
  },
  "889698584289": {
    pop_name: "Safari Deadpool",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Bucket List",
    number: "931",
    exclusivity: "GameStop",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Safari Deadpool is a Marvel Pop! Marvel release #931 from Deadpool Bucket List, GameStop exclusive.",
    display_description: "Safari Deadpool is a Marvel Pop! Marvel release #931 from Deadpool Bucket List, GameStop exclusive.",
    parse_confidence: 0.92,
    needs_review: false,
    warnings: [],
  },
  "889698745758": {
    pop_name: "Deadpool Bunny",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Seasons",
    number: "1298",
    exclusivity: "GameStop",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Deadpool Bunny is a Marvel Pop! Marvel release #1298 from Deadpool Seasons, GameStop exclusive.",
    display_description: "Deadpool Bunny is a Marvel Pop! Marvel release #1298 from Deadpool Seasons, GameStop exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698745789": {
    pop_name: "Pumpkin Spice Deadpool",
    character: "Deadpool",
    franchise: "Marvel",
    set_name: "Deadpool Seasons",
    number: "1299",
    exclusivity: "GameStop",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Pumpkin Spice Deadpool is a Marvel Pop! Marvel release #1299 from Deadpool Seasons, GameStop exclusive.",
    display_description: "Pumpkin Spice Deadpool is a Marvel Pop! Marvel release #1299 from Deadpool Seasons, GameStop exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698835886": {
    pop_name: "Galactus (Deluxe)",
    character: "Galactus",
    franchise: "Marvel",
    set_name: "Fantastic Four: First Steps",
    number: "1519",
    pop_type: "Pop! Marvel",
    pop_style: "Deluxe",
    description: "Galactus is a Fantastic Four: First Steps Pop! Marvel Deluxe release #1519.",
    display_description: "Galactus is a Fantastic Four: First Steps Pop! Marvel Deluxe release #1519.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698853576": {
    pop_name: "Mister Fantastic (Space Suit)",
    character: "Mister Fantastic",
    franchise: "Marvel",
    set_name: "Fantastic Four: First Steps",
    number: "1520",
    variant: "Space Suit",
    exclusivity: "Target",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Mister Fantastic (Space Suit) is a Fantastic Four: First Steps Pop! Marvel release #1520, Target exclusive.",
    display_description: "Mister Fantastic (Space Suit) is a Fantastic Four: First Steps Pop! Marvel release #1520, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698853583": {
    pop_name: "Human Torch (Space Suit)",
    character: "Human Torch",
    franchise: "Marvel",
    set_name: "Fantastic Four: First Steps",
    number: "1521",
    variant: "Space Suit",
    exclusivity: "Target",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Human Torch (Space Suit) is a Fantastic Four: First Steps Pop! Marvel release #1521, Target exclusive.",
    display_description: "Human Torch (Space Suit) is a Fantastic Four: First Steps Pop! Marvel release #1521, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698853590": {
    pop_name: "Invisible Woman (Space Suit)",
    character: "Invisible Woman",
    franchise: "Marvel",
    set_name: "Fantastic Four: First Steps",
    number: "1522",
    variant: "Space Suit",
    exclusivity: "Target",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Invisible Woman (Space Suit) is a Fantastic Four: First Steps Pop! Marvel release #1522, Target exclusive.",
    display_description: "Invisible Woman (Space Suit) is a Fantastic Four: First Steps Pop! Marvel release #1522, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698853606": {
    pop_name: "The Thing (Space Suit)",
    character: "The Thing",
    franchise: "Marvel",
    set_name: "Fantastic Four: First Steps",
    number: "1523",
    variant: "Space Suit",
    exclusivity: "Target",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "The Thing (Space Suit) is a Fantastic Four: First Steps Pop! Marvel release #1523, Target exclusive.",
    display_description: "The Thing (Space Suit) is a Fantastic Four: First Steps Pop! Marvel release #1523, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698849111": {
    pop_name: "The Thing (Trench Coat)",
    character: "The Thing",
    franchise: "Marvel",
    set_name: "Fantastic Four: First Steps",
    number: "1524",
    variant: "Trench Coat",
    exclusivity: "Exclusive",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "The Thing (Trench Coat) is a Fantastic Four: First Steps Pop! Marvel release #1524, exclusive.",
    display_description: "The Thing (Trench Coat) is a Fantastic Four: First Steps Pop! Marvel release #1524, exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698551656": {
    pop_name: "Galactus with Silver Surfer",
    character: "Galactus with Silver Surfer",
    franchise: "Marvel",
    set_name: "Fantastic Four",
    number: "809",
    variant: "Orange Chase",
    exclusivity: "PX Previews",
    pop_type: "Pop! Marvel",
    pop_style: "Jumbo",
    description: "Galactus with Silver Surfer is a Fantastic Four Pop! Marvel Jumbo release #809, Orange Chase PX Previews exclusive.",
    display_description: "Galactus with Silver Surfer is a Fantastic Four Pop! Marvel Jumbo release #809, Orange Chase PX Previews exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698639514": {
    pop_name: "Sox",
    character: "Sox",
    franchise: "Toy Story",
    set_name: "Lightyear",
    number: "1213",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Sox is a Toy Story Pop! Disney release #1213 from Lightyear.",
    display_description: "Sox is a Toy Story Pop! Disney release #1213 from Lightyear.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698907668": {
    pop_name: "Jessie",
    character: "Jessie",
    franchise: "Toy Story",
    set_name: "Toy Story 5",
    number: "1710",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Jessie is a Toy Story 5 Pop! Disney release #1710.",
    display_description: "Jessie is a Toy Story 5 Pop! Disney release #1710.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698907699": {
    pop_name: "Bullseye",
    character: "Bullseye",
    franchise: "Toy Story",
    set_name: "Toy Story 5",
    variant: "Flocked",
    pop_type: "Pop! Premium",
    pop_style: "Premium",
    description: "Bullseye is a Toy Story 5 Pop! Premium release, Flocked.",
    display_description: "Bullseye is a Toy Story 5 Pop! Premium release, Flocked.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698370110": {
    pop_name: "Mrs. Nesbit",
    character: "Buzz Lightyear",
    franchise: "Toy Story",
    set_name: "Toy Story",
    number: "518",
    variant: "Mrs. Nesbit",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Mrs. Nesbit is a Toy Story Pop! Disney release #518.",
    display_description: "Mrs. Nesbit is a Toy Story Pop! Disney release #518.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698401647": {
    pop_name: "Mr. Pricklepants",
    character: "Mr. Pricklepants",
    franchise: "Toy Story",
    set_name: "Toy Story 4",
    number: "562",
    exclusivity: "San Diego Comic-Con",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Mr. Pricklepants is a Toy Story 4 Pop! Disney release #562, San Diego Comic-Con exclusive.",
    display_description: "Mr. Pricklepants is a Toy Story 4 Pop! Disney release #562, San Diego Comic-Con exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698919845": {
    pop_name: "Woody on Bullseye",
    character: "Woody & Bullseye",
    franchise: "Toy Story",
    set_name: "Toy Story",
    number: "1597",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Rides",
    pop_style: "Ride",
    description: "Woody on Bullseye is a Toy Story Pop! Rides release #1597, Funko Shop exclusive.",
    display_description: "Woody on Bullseye is a Toy Story Pop! Rides release #1597, Funko Shop exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698919852": {
    pop_name: "Bullseye as Buzz Lightyear",
    character: "Bullseye as Buzz Lightyear",
    franchise: "Toy Story",
    set_name: "Toy Story",
    number: "1721",
    exclusivity: "Target",
    pop_type: "Pop! Disney",
    pop_style: "Standard",
    description: "Bullseye as Buzz Lightyear is a Toy Story Pop! Disney release #1721, Target exclusive.",
    display_description: "Bullseye as Buzz Lightyear is a Toy Story Pop! Disney release #1721, Target exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
});

Object.assign(CATALOG_OVERRIDES_BY_UPC, {
  "830395022482": {
    pop_name: "The Flash",
    character: "The Flash",
    franchise: "DC",
    set_name: "DC Super Heroes",
    number: "10",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "The Flash is a DC Super Heroes Pop! Heroes release #10.",
    display_description: "The Flash is a DC Super Heroes Pop! Heroes release #10.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "849803055653": {
    pop_name: "Thrillkiller Batman",
    character: "Batman",
    franchise: "DC",
    set_name: "DC Super Heroes",
    number: "69",
    exclusivity: "Exclusive",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Thrillkiller Batman is a DC Super Heroes Pop! Heroes release #69.",
    display_description: "Thrillkiller Batman is a DC Super Heroes Pop! Heroes release #69.",
    parse_confidence: 0.92,
    needs_review: false,
    warnings: [],
  },
  "849803071714": {
    pop_name: "Reverse-Flash",
    character: "Reverse-Flash",
    franchise: "DC",
    set_name: "DC Super Heroes",
    number: "81",
    variant: "New 52",
    exclusivity: "Exclusive",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Reverse-Flash (New 52) is a DC Super Heroes Pop! Heroes release #81.",
    display_description: "Reverse-Flash (New 52) is a DC Super Heroes Pop! Heroes release #81.",
    parse_confidence: 0.92,
    needs_review: false,
    warnings: [],
  },
  "889698144025": {
    pop_name: "The Joker (Martha Wayne)",
    character: "The Joker",
    franchise: "DC",
    set_name: "DC Super Heroes",
    number: "203",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "The Joker (Martha Wayne) is a DC Super Heroes Pop! Heroes release #203.",
    display_description: "The Joker (Martha Wayne) is a DC Super Heroes Pop! Heroes release #203.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698374873": {
    pop_name: "The Joker (Death in the Family)",
    character: "The Joker",
    franchise: "DC",
    set_name: "DC Super Heroes",
    number: "273",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "The Joker (Death in the Family) is a DC Super Heroes Pop! Heroes release #273.",
    display_description: "The Joker (Death in the Family) is a DC Super Heroes Pop! Heroes release #273.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698506410": {
    pop_name: "Superman in Holiday Sweater",
    character: "Superman",
    franchise: "DC",
    set_name: "DC Holiday",
    number: "353",
    variant: "Flocked",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Superman in Holiday Sweater is a DC Holiday Pop! Heroes release #353, Flocked.",
    display_description: "Superman in Holiday Sweater is a DC Holiday Pop! Heroes release #353, Flocked.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698579568": {
    pop_name: "Superman in Holiday Sweater",
    character: "Superman",
    franchise: "DC",
    set_name: "DC Holiday",
    number: "353",
    variant: "DIY",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Superman in Holiday Sweater is a DC Holiday Pop! Heroes release #353, DIY.",
    display_description: "Superman in Holiday Sweater is a DC Holiday Pop! Heroes release #353, DIY.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698506519": {
    pop_name: "Superman in Holiday Sweater",
    character: "Superman",
    franchise: "DC",
    set_name: "DC Holiday",
    number: "353",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Superman in Holiday Sweater is a DC Holiday Pop! Heroes release #353.",
    display_description: "Superman in Holiday Sweater is a DC Holiday Pop! Heroes release #353.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698506564": {
    pop_name: "Harley Quinn with Helper",
    character: "Harley Quinn",
    franchise: "DC",
    set_name: "DC Holiday",
    number: "357",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Harley Quinn with Helper is a DC Holiday Pop! Heroes release #357.",
    display_description: "Harley Quinn with Helper is a DC Holiday Pop! Heroes release #357.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698516747": {
    pop_name: "The Penguin Snowman",
    character: "The Penguin",
    franchise: "DC",
    set_name: "DC Holiday",
    number: "367",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "The Penguin Snowman is a DC Holiday Pop! Heroes release #367, Hot Topic exclusive.",
    display_description: "The Penguin Snowman is a DC Holiday Pop! Heroes release #367, Hot Topic exclusive.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698643214": {
    pop_name: "Gingerbread Aquaman",
    character: "Aquaman",
    franchise: "DC",
    set_name: "DC Gingerbread",
    number: "445",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Gingerbread Aquaman is a DC Gingerbread Pop! Heroes release #445.",
    display_description: "Gingerbread Aquaman is a DC Gingerbread Pop! Heroes release #445.",
    parse_confidence: 0.92,
    needs_review: false,
    warnings: [],
  },
  "889698643221": {
    pop_name: "Gingerbread Superman",
    character: "Superman",
    franchise: "DC",
    set_name: "DC Gingerbread",
    number: "443",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Gingerbread Superman is a DC Gingerbread Pop! Heroes release #443.",
    display_description: "Gingerbread Superman is a DC Gingerbread Pop! Heroes release #443.",
    parse_confidence: 0.92,
    needs_review: false,
    warnings: [],
  },
  "889698491631": {
    pop_name: "Bugs Bunny as Superman",
    character: "Bugs Bunny",
    franchise: "Looney Tunes",
    set_name: "DC Looney Tunes",
    number: "842",
    variant: "Superman",
    exclusivity: "FYE",
    pop_type: "Pop! Animation",
    pop_style: "Standard",
    release_date: "2020-01-01",
    description: "Bugs Bunny as Superman is a DC Looney Tunes Pop! Animation release #842, FYE exclusive.",
    display_description: "Bugs Bunny as Superman is a DC Looney Tunes Pop! Animation release #842, FYE exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698340724": {
    pop_name: "Superman on Gargoyle",
    character: "Superman",
    franchise: "DC",
    set_name: "DC Jim Lee Collection",
    number: "278",
    exclusivity: "GameStop",
    pop_type: "Pop! Heroes",
    pop_style: "Deluxe",
    vault_status: "Vaulted",
    description: "Superman on Gargoyle is a DC Jim Lee Collection Pop! Deluxe release #278.",
    display_description: "Superman on Gargoyle is a DC Jim Lee Collection Pop! Deluxe release #278.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698397742": {
    pop_name: "Superman on Gargoyle",
    character: "Superman",
    franchise: "DC",
    set_name: "DC Jim Lee Collection",
    number: "278",
    variant: "Black & White",
    exclusivity: "GameStop",
    pop_type: "Pop! Heroes",
    pop_style: "Deluxe",
    vault_status: "Vaulted",
    description: "Superman on Gargoyle is a DC Jim Lee Collection Pop! Deluxe release #278, Black & White.",
    display_description: "Superman on Gargoyle is a DC Jim Lee Collection Pop! Deluxe release #278, Black & White.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698299954": {
    pop_name: "Batman vs. The Penguin",
    character: "Batman & The Penguin",
    franchise: "DC",
    set_name: "Batman Classic TV Series",
    pop_type: "Pop! Heroes",
    pop_style: "2-Pack",
    description: "Batman vs. The Penguin is a Batman Classic TV Series Pop! Heroes 2-pack.",
    display_description: "Batman vs. The Penguin is a Batman Classic TV Series Pop! Heroes 2-pack.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698889032": {
    pop_name: "Shadow as Batman",
    character: "Shadow as Batman",
    franchise: "DC",
    set_name: "Justice League x Sonic",
    number: "591",
    exclusivity: "Target",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Shadow as Batman is a DC Pop! Heroes release #591 from Justice League x Sonic, Target exclusive.",
    display_description: "Shadow as Batman is a DC Pop! Heroes release #591 from Justice League x Sonic, Target exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698889056": {
    pop_name: "Sonic as The Flash",
    character: "Sonic as The Flash",
    franchise: "DC",
    set_name: "Justice League x Sonic",
    number: "593",
    exclusivity: "Target",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Sonic as The Flash is a DC Pop! Heroes release #593 from Justice League x Sonic, Target exclusive.",
    display_description: "Sonic as The Flash is a DC Pop! Heroes release #593 from Justice League x Sonic, Target exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698889063": {
    pop_name: "Tails as Cyborg",
    character: "Tails as Cyborg",
    franchise: "DC",
    set_name: "Justice League x Sonic",
    number: "594",
    exclusivity: "Target",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Tails as Cyborg is a DC Pop! Heroes release #594 from Justice League x Sonic, Target exclusive.",
    display_description: "Tails as Cyborg is a DC Pop! Heroes release #594 from Justice League x Sonic, Target exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698889070": {
    pop_name: "Amy as Wonder Woman",
    character: "Amy as Wonder Woman",
    franchise: "DC",
    set_name: "Justice League x Sonic",
    number: "595",
    exclusivity: "Target",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Amy as Wonder Woman is a DC Pop! Heroes release #595 from Justice League x Sonic, Target exclusive.",
    display_description: "Amy as Wonder Woman is a DC Pop! Heroes release #595 from Justice League x Sonic, Target exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698889087": {
    pop_name: "Knuckles as Superman",
    character: "Knuckles as Superman",
    franchise: "DC",
    set_name: "Justice League x Sonic",
    number: "596",
    exclusivity: "Target",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Knuckles as Superman is a DC Pop! Heroes release #596 from Justice League x Sonic, Target exclusive.",
    display_description: "Knuckles as Superman is a DC Pop! Heroes release #596 from Justice League x Sonic, Target exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698417044": {
    pop_name: "Raj Koothrappali as Aquaman",
    character: "Raj Koothrappali",
    franchise: "The Big Bang Theory",
    set_name: "The Big Bang Theory",
    number: "832",
    variant: "Aquaman",
    exclusivity: "San Diego Comic-Con",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Raj Koothrappali as Aquaman is a The Big Bang Theory Pop! Television release #832, San Diego Comic-Con exclusive.",
    display_description: "Raj Koothrappali as Aquaman is a The Big Bang Theory Pop! Television release #832, San Diego Comic-Con exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698650380": {
    pop_name: "Spider-Man (Unmasked)",
    character: "Spider-Man",
    franchise: "Marvel",
    set_name: "Spider-Man: No Way Home",
    number: "1073",
    exclusivity: "AAA Anime Exclusive",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Spider-Man (Unmasked) is a Spider-Man: No Way Home Pop! Marvel release #1073, AAA Anime Exclusive.",
    display_description: "Spider-Man (Unmasked) is a Spider-Man: No Way Home Pop! Marvel release #1073, AAA Anime Exclusive.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698670623": {
    pop_name: "Statue of Liberty",
    character: "Statue of Liberty",
    franchise: "Marvel",
    set_name: "Spider-Man: No Way Home",
    number: "1123",
    exclusivity: "New York Comic Con",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "Statue of Liberty is a Spider-Man: No Way Home Pop! Marvel release #1123, New York Comic Con exclusive.",
    display_description: "Statue of Liberty is a Spider-Man: No Way Home Pop! Marvel release #1123, New York Comic Con exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698683692": {
    pop_name: "The Amazing Spider-Man",
    character: "Spider-Man",
    franchise: "Marvel",
    set_name: "Spider-Man: No Way Home",
    number: "1171",
    variant: "Unmasked",
    exclusivity: "PX Previews",
    pop_type: "Pop! Marvel",
    pop_style: "Standard",
    description: "The Amazing Spider-Man is a Spider-Man: No Way Home Pop! Marvel release #1171, Unmasked PX Previews exclusive.",
    display_description: "The Amazing Spider-Man is a Spider-Man: No Way Home Pop! Marvel release #1171, Unmasked PX Previews exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
});

Object.assign(CATALOG_OVERRIDES_BY_UPC, {
  "889698520331": {
    pop_name: "Britney Spears (Toxic)",
    character: "Britney Spears",
    franchise: "Pop! Rocks",
    set_name: "Britney Spears",
    number: "208",
    variant: "Toxic",
    pop_type: "Pop! Rocks",
    pop_style: "Standard",
    description: "Britney Spears (Toxic) is a Pop! Rocks release #208 from Britney Spears.",
    display_description: "From Britney Spears, Britney Spears is a Pop! Rocks release #208, Toxic.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698614351": {
    pop_name: "Britney Spears (Ringleader)",
    character: "Britney Spears",
    franchise: "Pop! Rocks",
    set_name: "Britney Spears",
    number: "262",
    variant: "Ringleader",
    pop_type: "Pop! Rocks",
    pop_style: "Standard",
    description: "Britney Spears (Ringleader) is a Pop! Rocks release #262 from Britney Spears.",
    display_description: "From Britney Spears, Britney Spears is a Pop! Rocks release #262, Ringleader.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698570664": {
    pop_name: "Britney Spears (You Drive Me Crazy)",
    character: "Britney Spears",
    franchise: "Pop! Rocks",
    set_name: "Britney Spears",
    number: "292",
    variant: "You Drive Me Crazy",
    exclusivity: "New York Comic Con",
    pop_type: "Pop! Rocks",
    pop_style: "Standard",
    description: "Britney Spears (You Drive Me Crazy) is a Pop! Rocks release #292 from Britney Spears, New York Comic Con exclusive.",
    display_description: "From Britney Spears, Britney Spears is a Pop! Rocks release #292, You Drive Me Crazy, New York Comic Con exclusive.",
    parse_confidence: 0.94,
    needs_review: false,
    warnings: [],
  },
  "889698366519": {
    pop_name: "Britney Spears (I'm a Slave 4 U)",
    character: "Britney Spears",
    franchise: "Pop! Rocks",
    set_name: "Britney Spears",
    number: "98",
    variant: "I'm a Slave 4 U",
    pop_type: "Pop! Rocks",
    pop_style: "Standard",
    description: "Britney Spears (I'm a Slave 4 U) is a Pop! Rocks release #98 from Britney Spears.",
    display_description: "From Britney Spears, Britney Spears is a Pop! Rocks release #98, I'm a Slave 4 U.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698610087": {
    pop_name: "Britney Spears (I'm a Slave 4 U) (Metallic)",
    character: "Britney Spears",
    franchise: "Pop! Rocks",
    set_name: "Britney Spears",
    number: "98",
    variant: "I'm a Slave 4 U Metallic",
    exclusivity: "Barnes & Noble",
    pop_type: "Pop! Rocks",
    pop_style: "Standard",
    description: "Britney Spears (I'm a Slave 4 U) (Metallic) is a Pop! Rocks release #98 from Britney Spears, Barnes & Noble exclusive.",
    display_description: "From Britney Spears, Britney Spears is a Pop! Rocks release #98, I'm a Slave 4 U Metallic, Barnes & Noble exclusive.",
    parse_confidence: 0.94,
    needs_review: false,
    warnings: [],
  },
  "889698901369": {
    pop_name: "Britney Spears (...Baby One More Time)",
    character: "Britney Spears",
    franchise: "Pop! Rocks",
    set_name: "Britney Spears",
    number: "90",
    variant: "...Baby One More Time",
    pop_type: "Pop! Rocks",
    pop_style: "Standard",
    description: "Britney Spears (...Baby One More Time) is a Pop! Rocks release #90 from Britney Spears.",
    display_description: "From Britney Spears, Britney Spears is a Pop! Rocks release #90, ...Baby One More Time.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698838344": {
    pop_name: "Britney Spears (Stronger)",
    character: "Britney Spears",
    franchise: "Pop! Rocks",
    set_name: "Britney Spears",
    number: "461",
    variant: "Stronger",
    pop_type: "Pop! Rocks",
    pop_style: "Standard",
    description: "Britney Spears (Stronger) is a Pop! Rocks release #461 from Britney Spears.",
    display_description: "From Britney Spears, Britney Spears is a Pop! Rocks release #461, Stronger.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698838351": {
    pop_name: "Britney Spears (Oops! I Did It Again)",
    character: "Britney Spears",
    franchise: "Pop! Rocks",
    set_name: "Britney Spears",
    number: "462",
    variant: "Oops! I Did It Again",
    pop_type: "Pop! Rocks",
    pop_style: "Standard",
    description: "Britney Spears (Oops! I Did It Again) is a Pop! Rocks release #462 from Britney Spears.",
    display_description: "From Britney Spears, Britney Spears is a Pop! Rocks release #462, Oops! I Did It Again.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698844574": {
    pop_name: "Britney Spears Mini Vinyl Figure (Toxic)",
    character: "Britney Spears",
    franchise: "Pop! Rocks",
    set_name: "Britney Spears Minis",
    variant: "Toxic",
    exclusivity: "Five Below",
    pop_type: "Funko Minis",
    pop_style: "Mini",
    description: "Britney Spears Mini Vinyl Figure (Toxic) is a Funko Minis release from Britney Spears Minis, Five Below exclusive.",
    display_description: "From Britney Spears Minis, Britney Spears is a Funko Minis release, Toxic, Five Below exclusive.",
    parse_confidence: 0.9,
    needs_review: false,
    warnings: [],
  },
  "889698548205": {
    pop_name: "Batman (Imperial Palace) (Blue Metallic)",
    character: "Batman",
    franchise: "DC",
    set_name: "DC Imperial Palace",
    number: "374",
    variant: "Blue Metallic",
    exclusivity: "Popcultcha",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Batman (Imperial Palace) (Blue Metallic) is a DC Imperial Palace Pop! Heroes release #374, Popcultcha exclusive.",
    display_description: "From DC Imperial Palace, Batman is a Pop! Heroes release #374, Blue Metallic, Popcultcha exclusive.",
    parse_confidence: 0.94,
    needs_review: false,
    warnings: [],
  },
  "889698524308": {
    pop_name: "Robin (Imperial Palace)",
    character: "Robin",
    franchise: "DC",
    set_name: "DC Imperial Palace",
    number: "377",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Robin (Imperial Palace) is a DC Imperial Palace Pop! Heroes release #377.",
    display_description: "From DC Imperial Palace, Robin is a Pop! Heroes release #377.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698524339": {
    pop_name: "Superman (Imperial Palace)",
    character: "Superman",
    franchise: "DC",
    set_name: "DC Imperial Palace",
    number: "402",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Superman (Imperial Palace) is a DC Imperial Palace Pop! Heroes release #402.",
    display_description: "From DC Imperial Palace, Superman is a Pop! Heroes release #402.",
    parse_confidence: 0.94,
    needs_review: false,
    warnings: [],
  },
  "889698493710": {
    pop_name: "Concept Series Darth Vader",
    character: "Darth Vader",
    franchise: "Star Wars",
    set_name: "Star Wars Concept Series",
    number: "389",
    exclusivity: "Star Wars Celebration",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Concept Series Darth Vader is a Star Wars Concept Series Pop! Star Wars release #389, Star Wars Celebration exclusive.",
    display_description: "From Star Wars Concept Series, Darth Vader is a Pop! Star Wars release #389, Star Wars Celebration exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698501118": {
    pop_name: "Concept Series R2-D2",
    character: "R2-D2",
    franchise: "Star Wars",
    set_name: "Star Wars Concept Series",
    number: "424",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Concept Series R2-D2 is a Star Wars Concept Series Pop! Star Wars release #424.",
    display_description: "From Star Wars Concept Series, R2-D2 is a Pop! Star Wars release #424.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698501125": {
    pop_name: "Concept Series Yoda",
    character: "Yoda",
    franchise: "Star Wars",
    set_name: "Star Wars Concept Series",
    number: "425",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Concept Series Yoda is a Star Wars Concept Series Pop! Star Wars release #425.",
    display_description: "From Star Wars Concept Series, Yoda is a Pop! Star Wars release #425.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698567688": {
    pop_name: "Concept Series Snowtrooper",
    character: "Snowtrooper",
    franchise: "Star Wars",
    set_name: "Star Wars Concept Series",
    number: "471",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Concept Series Snowtrooper is a Star Wars Concept Series Pop! Star Wars release #471.",
    display_description: "From Star Wars Concept Series, Snowtrooper is a Pop! Star Wars release #471.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698567671": {
    pop_name: "Concept Series Han Solo",
    character: "Han Solo",
    franchise: "Star Wars",
    set_name: "Star Wars Concept Series",
    number: "472",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Concept Series Han Solo is a Star Wars Concept Series Pop! Star Wars release #472.",
    display_description: "From Star Wars Concept Series, Han Solo is a Pop! Star Wars release #472.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
  "889698572286": {
    pop_name: "Concept Series Stormtrooper (w/ Shield)",
    character: "Stormtrooper",
    franchise: "Star Wars",
    set_name: "Star Wars Concept Series",
    number: "473",
    variant: "w/ Shield",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Concept Series Stormtrooper (w/ Shield) is a Star Wars Concept Series Pop! Star Wars release #473, Funko Shop exclusive.",
    display_description: "From Star Wars Concept Series, Stormtrooper is a Pop! Star Wars release #473, w/ Shield, Funko Shop exclusive.",
    parse_confidence: 0.95,
    needs_review: false,
    warnings: [],
  },
});

const IMAGE_BUCKET = "pop-images";
function decodeJwtPayload(jwt: string): { sub?: string; role?: string; exp?: number } | null {
  try {
    const payload = jwt.split(".")[1];
    if (!payload) return null;
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function requireLookupAccess(req: Request): boolean {
  const maintenanceToken = Deno.env.get("MAINTENANCE_ADMIN_TOKEN") ?? "";
  const providedToken =
    req.headers.get("x-maintenance-token") ??
    req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");

  if (maintenanceToken && providedToken === maintenanceToken) return true;

  const jwt = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!jwt) return false;

  const payload = decodeJwtPayload(jwt);
  const expiresAt = Number(payload?.exp ?? 0);
  return payload?.role === "authenticated" && Boolean(payload.sub) && expiresAt > Math.floor(Date.now() / 1000);
}

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
  "Monster",
  "Monster Energy",
];

const VARIANT_ALIASES: Array<[string, string]> = [
  ["grail", "Grail"],
  ["legendary", "Legendary"],
  ["mythic", "Mythic"],
  ["royalty", "Royalty"],
  ["ultra", "Ultra"],
  ["glow in the dark chase", "Glow in the Dark Chase"],
  ["glow-in-the-dark chase", "Glow in the Dark Chase"],
  ["gitd chase", "Glow in the Dark Chase"],
  ["chase glow in the dark", "Glow in the Dark Chase"],
  ["chase glow", "Glow in the Dark Chase"],
  ["flocked chase", "Flocked Chase"],
  ["chase flocked", "Flocked Chase"],
  ["metallic chase", "Metallic Chase"],
  ["chase metallic", "Metallic Chase"],
  ["blacklight chase", "Blacklight Chase"],
  ["black light chase", "Blacklight Chase"],
  ["chase blacklight", "Blacklight Chase"],
  ["diamond collection chase", "Diamond Collection Chase"],
  ["diamond chase", "Diamond Collection Chase"],
  ["glitter chase", "Diamond Collection Chase"],
  ["green chrome", "Chrome"],
  ["black chrome", "Chrome"],
  ["blue chrome", "Chrome"],
  ["gold chrome", "Chrome"],
  ["orange chrome", "Chrome"],
  ["helmet chrome", "Chrome"],
  ["black and white", "Black & White"],
  ["black white", "Black & White"],
  ["black & white", "Black & White"],
  ["black out", "Black & White"],
  ["glow-in-the-dark", "Glow in the Dark"],
  ["glow in the dark", "Glow in the Dark"],
  ["glows in the dark", "Glow in the Dark"],
  ["gitd", "Glow in the Dark"],
  ["blacklight", "Blacklight"],
  ["black light", "Blacklight"],
  ["stained glass", "Stained Glass"],
  ["diamond collection", "Diamond Collection"],
  ["diamond", "Diamond Collection"],
  ["metallic", "Metallic"],
  ["flocked", "Flocked"],
  ["patina", "Patina"],
  ["diy", "DIY"],
  ["d.i.y", "DIY"],
  ["wood deco", "Wood Deco"],
  ["chrome", "Chrome"],
  ["chase", "Chase"],
  ["battle damaged", "Battle Damaged"],
  ["bloody", "Bloody"],
  ["glow", "Glow in the Dark"],
  ["glitter", "Glitter"],
  ["artist series", "Artist Series"],
  ["translucent", "Translucent"],
  ["invisible", "Translucent"],
  ["scented", "Scented"],
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

  ["die-cast", "Die-Cast"],
  ["die cast", "Die-Cast"],

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
  ["vhs cover", "VHS Cover"],
  ["game cover", "Game Cover"],
  ["movie poster", "Movie Poster"],
  ["poster", "Poster"],
  ["keychain", "Keychain"],
  ["pocket pop", "Keychain"],
  ["pop & tee", "Pop & Tee"],
  ["pop and tee", "Pop & Tee"],
  ["rewind", "Rewind"],
  ["6-inch", "Jumbo"],
  ["6 inch", "Jumbo"],
  ["6in", "Jumbo"],
];

const POP_TYPE_ALIASES: Array<[string, string]> = [
  ["digital pop", "Pop! Digital"],
  ["digital pops", "Pop! Digital"],
  ["pop digital", "Pop! Digital"],
  ["pop nft", "Pop! Digital"],
  ["funko nft", "Pop! Digital"],
  ["funko digital", "Pop! Digital"],
  ["digital collectible", "Pop! Digital"],
  ["nft", "Pop! Digital"],
  ["pop television", "Pop! Television"],
  ["pop tv", "Pop! Television"],
  ["television", "Pop! Television"],
  ["pop movies", "Pop! Movies"],
  ["pop movie", "Pop! Movies"],
  ["movies", "Pop! Movies"],
  ["movie", "Pop! Movies"],
  ["pop games", "Pop! Games"],
  ["pop game", "Pop! Games"],
  ["video games", "Pop! Games"],
  ["games", "Pop! Games"],
  ["pop rocks", "Pop! Rocks"],
  ["rocks", "Pop! Rocks"],
  ["pop animation", "Pop! Animation"],
  ["animation", "Pop! Animation"],
  ["pop disney", "Pop! Disney"],
  ["disney", "Pop! Disney"],
  ["pop marvel", "Pop! Marvel"],
  ["marvel", "Pop! Marvel"],
  ["pop heroes", "Pop! Heroes"],
  ["heroes", "Pop! Heroes"],
  ["dc comics", "Pop! Heroes"],
  ["dc super heroes", "Pop! Heroes"],
  ["pop star wars", "Pop! Star Wars"],
  ["star wars", "Pop! Star Wars"],
  ["pop icons", "Pop! Icons"],
  ["icons", "Pop! Icons"],
  ["pop ad icons", "Pop! Ad Icons"],
  ["ad icons", "Pop! Ad Icons"],
  ["pop sports", "Pop! Sports"],
  ["sports", "Pop! Sports"],
  ["pop wwe", "Pop! WWE"],
  ["wwe", "Pop! WWE"],
  ["pop retro toys", "Pop! Retro Toys"],
  ["retro toys", "Pop! Retro Toys"],
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
  ["funko exclusive", "Funko Shop"],
  ["fye", "FYE"],
  ["barnes & noble", "Barnes & Noble"],
  ["barnes and noble", "Barnes & Noble"],
  ["bam exclusive", "Books-A-Million"],
  ["books-a-million", "Books-A-Million"],
  ["books a million", "Books-A-Million"],
  ["dc shop", "DC Shop"],
  ["go! calendars", "Go! Calendars"],
  ["go calendars", "Go! Calendars"],
  ["south park shop", "South Park Shop"],
  ["target redcard", "Target REDcard"],
  ["redcard", "Target REDcard"],
  ["toy tokyo", "Toy Tokyo"],
  ["at&t", "AT&T"],
  ["att exclusive", "AT&T"],
  ["px previews", "PX Previews"],
  ["px exclusive", "PX Previews"],
  ["previews exclusive", "PX Previews"],
  ["us exclusive", "US Exclusive"],
  ["aaa anime exclusive", "AAA Anime Exclusive"],
  ["aaa exclusive", "AAA Exclusive"],
  ["aaa excl", "AAA Exclusive"],
  ["specialty series", "Specialty Series"],
  ["special edition", "Special Edition"],
  ["first to market", "First To Market"],
  ["collectors corps", "Collectors Corps"],
  ["collector corps", "Collectors Corps"],
  ["marvel collector corps", "Collectors Corps"],
  ["mcc", "Collectors Corps"],

  ["san diego comic-con", "San Diego Comic-Con"],
  ["san diego comic con", "San Diego Comic-Con"],
  ["sdcc", "San Diego Comic-Con"],
  ["new york comic con", "New York Comic Con"],
  ["nycc", "New York Comic Con"],
  ["emerald city comic con", "Emerald City Comic Con"],
  ["eccc", "Emerald City Comic Con"],
  ["los angeles comic con", "Los Angeles Comic Con"],
  ["la comic con", "Los Angeles Comic Con"],
  ["d23 expo", "D23"],
  ["d23 first to market", "D23 First To Market"],
  ["d23", "D23"],
  ["target con", "Target Con"],
  ["fall convention", "Fall Convention"],
  ["fall con", "Fall Convention"],
  ["spring convention", "Spring Convention"],
  ["spring con", "Spring Convention"],
  ["summer convention", "Summer Convention"],
  ["summer con", "Summer Convention"],
  ["winter convention", "Winter Convention"],
  ["winter con", "Winter Convention"],
  ["wondercon", "WonderCon"],
  ["wonder con", "WonderCon"],
  ["funkon london", "Funkon London"],
  ["wondrous convention", "Wondrous Convention"],

  ["2016 con", "2016 Convention"],
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
  ["pop asia", "Pop Asia"],

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
  ["britney spears", "Pop! Rocks"],
  ["rivers cuomo", "Pop! Rocks"],
  ["weezer", "Pop! Rocks"],
  ["disturbed", "Disturbed"],
  ["whitney houston", "Whitney Houston"],
  ["nsync", "*NSYNC"],

  ["she-hulk", "Marvel"],
  ["red she-hulk", "Marvel"],
  ["hulk", "Marvel"],
  ["hercules", "Marvel"],
  ["ms marvel", "Marvel"],
  ["knull", "Marvel"],
  ["gwen-verse", "Marvel"],
  ["gwen verse", "Marvel"],
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
  ["count dooku", "Star Wars"],
  ["darth maul", "Star Wars"],
  ["boba fett", "Star Wars"],
  ["skeleton crew", "Star Wars"],

  ["los padrinos mágicos", "The Fairly OddParents"],
  ["los padrinos magicos", "The Fairly OddParents"],
  ["fairly oddparents", "The Fairly OddParents"],
  ["fairly odd parents", "The Fairly OddParents"],

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
  ["itchy", "The Simpsons"],
  ["scratchy", "The Simpsons"],

  ["beetlejuice", "Beetlejuice"],
  ["tank girl", "Tank Girl"],
  ["zoolander", "Zoolander"],
  ["mugatu", "Zoolander"],
  ["army of darkness", "Army of Darkness"],
  ["parks and recreation", "Parks and Recreation"],
  ["parks & recreation", "Parks and Recreation"],
  ["pawnee goddesses", "Parks and Recreation"],
  ["pawnee goddess", "Parks and Recreation"],
  ["ted lasso", "Ted Lasso"],
  ["cocaine bear", "Cocaine Bear"],
  ["robocop", "RoboCop"],
  ["bullet train", "Bullet Train"],
  ["jingle all the way", "Jingle All the Way"],
  ["wallace and gromit", "Wallace and Gromit"],
  ["futurama", "Futurama"],
  ["ben 10", "Ben 10"],
  ["peacemaker", "Peacemaker"],
  ["kearney", "The Simpsons"],
  ["zzyzwicz", "The Simpsons"],

  ["pokemon", "PokÃ©mon"],
  ["pokÃ©mon", "PokÃ©mon"],
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
  ["caddyshack", "Caddyshack"],
  ["cartoon network", "Cartoon Network"],
  ["the goonies", "The Goonies"],
  ["goonies", "The Goonies"],
  ["grey's anatomy", "Grey's Anatomy"],
  ["greys anatomy", "Grey's Anatomy"],
  ["jujutsu kaisen", "Jujutsu Kaisen"],
  ["monty python", "Monty Python And The Holy Grail"],
  ["shaun of the dead", "Shaun Of The Dead"],
  ["south park", "South Park"],
  ["super troopers", "Super Troopers"],
  ["the tick", "The Tick"],
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
["smeagol", "The Lord of the Rings"],
["gollum", "The Lord of the Rings"],
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
  if (/^pop!\s+another line of collectible figures based on movies,\s*tv series,\s*video games and other pop culture themes/i.test(cleaned)) return null;

  // Keep normal Funko/product blurbs. Only reject strong foreign-store or price-comparison text.
  const rejectPatterns = [
    /\bdÃ©couvrez\b/i,
    /\bcomparez\b/i,
    /\bavant de l['â€™]acheter\b/i,
    /\brÃ©f\.?\b/i,
    /\bfigura\b/i,
    /\bvinilo\b/i,
    /\bvinyle\b/i,
    /\bcolecci[oÃ³]n\b/i,
    /\bpersonaje\b/i,
    /\bproducto\b/i,
    /\bdistribuidor autorizado\b/i,
    /\bnuestros productos son adquiridos\b/i,
    /\benv[iÃ­]os\b/i,
    /\bpulgadas\b/i,
    /\bhecho de\b/i,
    /\bempaque\b/i,
    /\bestoy viviendo\b/i,
    /\bde la exitosa serie\b/i,
    /\bdescubre\b/i,
    /\bdescrizione\b/i,
    /\btilaa\b/i,
    /\bkÃ¤rkkÃ¤iseltÃ¤\b/i,
    /\bsuomen suurimmassa\b/i,
    /\bverkkokaupassa\b/i,
    /\btuotetta\b/i,
    /\bgrÃ¶[ÃŸs]e\b/i,
    /\bsÃ¼ÃŸe\b/i,
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
    /\bfig[Ãºu]rka\b/i,
    /\bÅ¡peci[aÃ¡]lnej ed[iÃ­]ci/i,
    /\bsvieti v tme\b/i,
    /\btelevisi[oÃ³]n\b/i,
    /\balgunas de las\b/i,
    /\bpr[oÃƒÂ³]xima serie de televisi[oÃƒÂ³]n\b/i,
    /\bcadena abc\b/i,
    /\bfunko de la familia\b/i,
    /\bestrena este oto[ÃƒÂ±n]o\b/i,
    /\bspecial edition sticker on box\b/i,
    /\bpack med\b/i,
    /\bk[ÃƒÂ¶o]p och f[ÃƒÂ¶o]rs[ÃƒÂ¤a]ljning\b/i,
    /\bprodukter f[ÃƒÂ¶o]r\b/i,
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
  exclusivity?: string | null;
  pop_type?: string | null;
  pop_style?: string | null;
  vault_status?: string | null;
  release_date?: string | null;
  limited_edition?: boolean | null;
  limited_count?: number | null;
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
    /^pop!\s+another line of collectible figures based on movies,\s*tv series,\s*video games and other pop culture themes/i,
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
    /your favourite pops! have been shrunk into bitty pops/i,
    /your favorite pops! have been shrunk into bitty pops/i,
    /figura de vinilo/i,
    /figura viene/i,
    /vinilo/i,
    /poniewaÅ¼/i,
    /spÃ©cial/i,
    /matiÃ¨re/i,
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

  const setName = parsed.set_name && parsed.set_name !== parsed.franchise ? parsed.set_name : parsed.set_name || parsed.franchise;
  const type = parsed.pop_type && !/^pop!?$/i.test(parsed.pop_type) ? parsed.pop_type : "Funko Pop";
  const style = parsed.pop_style && !/^(standard|common|pop)$/i.test(parsed.pop_style) ? parsed.pop_style : null;
  const variant = parsed.variant && !/^common$/i.test(parsed.variant) ? parsed.variant : null;
  const numberText = parsed.number ? ` as #${parsed.number}` : "";
  const linePrefix = setName && /^(the|a|an)\s/i.test(setName) ? "" : "the ";
  const lineText = setName ? `${linePrefix}${setName} ${type} line` : `the ${type} line`;
  const exclusivity = parsed.exclusivity
    ? /^exclusive$/i.test(parsed.exclusivity)
      ? "exclusive release"
      : /exclusive/i.test(parsed.exclusivity)
        ? parsed.exclusivity
        : `${parsed.exclusivity} exclusive`
    : null;
  const detailParts = [
    style ? `${style} format` : null,
    variant ? `${variant} variant` : null,
    exclusivity,
  ].filter(Boolean);
  const releaseYear = parsed.release_date?.match(/^(\d{4})/)?.[1] ?? null;
  const vaultStatus =
    parsed.vault_status && !/^active$/i.test(parsed.vault_status)
      ? `currently ${parsed.vault_status.toLowerCase()}`
      : null;
  const statusParts = [
    releaseYear ? `released in ${releaseYear}` : null,
    vaultStatus,
    parsed.limited_edition
      ? parsed.limited_count
        ? `limited to ${parsed.limited_count.toLocaleString("en-US")} pieces`
        : "limited edition"
      : null,
  ].filter(Boolean);

  const sentences = [
    `${name} belongs to ${lineText}${numberText}.`,
    detailParts.length ? `This catalog entry tracks the ${detailParts.join(", ")}.` : null,
    statusParts.length ? `${statusParts.join("; ")}.` : null,
  ].filter(Boolean);

  return sentences.join(" ").replace(/\s+/g, " ");
}

function isWeakDisplayDescription(value: unknown): boolean {
  const text = normalizeWhitespace(String(value ?? ""));
  if (!text) return true;

  return [
    /^no description found\.?$/i,
    /^pop!\s+another line of collectible figures based on movies,\s*tv series,\s*video games and other pop culture themes/i,
    /\balgunas de las\b/i,
    /\bpr[oÃƒÂ³]xima serie de televisi[oÃƒÂ³]n\b/i,
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
    /\bis an?\s+.*funko pop\b/i,
    /\bfigura de vinilo\b/i,
    /\bfigura viene\b/i,
    /\bvinilo\b/i,
    /\bponiewaÅ¼\b/i,
    /\bspÃ©cial\b/i,
    /\bmatiÃ¨re\b/i,
    /\bfabricant\b/i,
    /\bdate de sortie\b/i,
    /^product details\b/i,
    /\bas a stylized pop vinyl\b/i,
    /\bas a stylized pop\b/i,
    /\byour favourite pops! have been shrunk into bitty pops\b/i,
    /\byour favorite pops! have been shrunk into bitty pops\b/i,
    /\bfigure stands\s+\d/i,
    /\bcheck out the other\b/i,
    /\bfrom .*, .* is an? .* release\b/i,
    /\bis an? .* release #[0-9]+\b/i,
    /\brelease #[0-9]+\b/i,
    /\bis an? .*funko pop\b/i,
    /\bexclusive exclusive\b/i,
    /^description:\s*pop television/i,
    /\bpack med\b/i,
    /\bk[ÃƒÂ¶o]p och f[ÃƒÂ¶o]rs[ÃƒÂ¤a]ljning\b/i,
    /\bprodukter f[ÃƒÂ¶o]r\b/i,
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

function normalizeSetName(value: string | null): string | null {
  if (!value) return null;

  const cleaned = normalizeWhitespace(value)
    .replace(/^(SDCC|NYCC|ECCC|WonderCon)\s*[.,]\s*/i, "")
    .replace(/^(Fall|Spring|Summer|Winter)\s+Convention\s*[.,]\s*/i, "")
    .replace(/\s*[.,]\s*(Fall|Spring|Summer|Winter)\s+Convention(?:\s+Exclusive)?$/i, "")
    .replace(/\s*[.,]\s*(SDCC|NYCC|ECCC|WonderCon)$/i, "")
    .replace(/\s*[.,]\s*Limited\s+Edition$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || /^(SDCC|NYCC|ECCC|WonderCon|Fall Convention|Spring Convention|Summer Convention|Winter Convention|Limited Edition)$/i.test(cleaned)) {
    return null;
  }

  if (/^Jurassic World(?: 3)?:? Dominion$/i.test(cleaned)) {
    return "Jurassic World: Dominion";
  }

  return canonicalizeSetLabel(cleaned);
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
    .replace(/\b3 Â¾\s*Inch\b/gi, "")
    .replace(/\b3\.75"\b/gi, "")
    .replace(/\b3 Â¾"\b/gi, "")
    .replace(/\b\d+(\.\d+)?\s*[- ]?in(ch)?\b/gi, "")
    .replace(/\b\d+(\.\d+)?["â€]\b/gi, "")
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

  const noMatch = titleForNumber.match(/\b(?:N[Â°Âºo]?|No\.?)\s*(\d{1,5})\b/i);
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
  const explicitClassification = getExplicitProductClassification(haystack);
  if (explicitClassification) return explicitClassification.pop_style;
  return findAlias(haystack, POP_STYLE_ALIASES) ?? "Standard";
}

function extractPopType(product: any, cleanTitle: string, franchise: string | null, setName: string | null): string {
  const haystack = normalizeWhitespace(
    [
      product?.title,
      product?.name,
      product?.description,
      product?.category,
      product?.model,
      product?.["console-name"],
      product?.genre,
      cleanTitle,
      franchise,
      setName,
    ]
      .filter(Boolean)
      .join(" "),
  );
  const normalizedHaystack = normalizeMatchText(haystack);
  const explicitClassification = getExplicitProductClassification(haystack);
  if (explicitClassification) return explicitClassification.pop_type;
  if (/\b(nft|digital\s+pop|digital\s+collectible|tokenhead|droppp)\b/i.test(haystack)) return "Pop! Digital";
  if (normalizedHaystack.includes("game of thrones")) return "Pop! Television";
  if (normalizedHaystack.includes("the suicide squad") || normalizedHaystack.includes("suicide squad")) return "Pop! Movies";
  if (normalizedHaystack.includes("birds of prey")) return "Pop! Movies";
  if (normalizedHaystack.includes("supergirl") || normalizedHaystack.includes("kara zor el")) return "Pop! Movies";

  const match = findAlias(haystack, POP_TYPE_ALIASES);
  if (match) return match;

  const normalizedFranchise = normalizeMatchText(franchise);
  const normalizedSet = normalizeMatchText(setName);
  const combined = `${normalizedFranchise} ${normalizedSet} ${normalizeMatchText(cleanTitle)}`;

  if (normalizedSet === "supergirl" || combined.includes("kara zor el")) return "Pop! Movies";
  if (
    [
      "batman v superman dawn of justice",
      "superman 1978",
      "superman 2025",
      "the flash 2023",
      "justice league 2017",
      "zack snyder s justice league",
    ].includes(normalizedSet)
  ) {
    return "Pop! Movies";
  }
  if (normalizedSet === "the flash tv series") return "Pop! Television";
  if (normalizedFranchise === "marvel") return "Pop! Marvel";
  if (normalizedFranchise === "dc") return "Pop! Heroes";
  if (normalizedFranchise === "star wars") return "Pop! Star Wars";
  if (normalizedFranchise === "disney" || normalizedFranchise === "toy story" || combined.includes("pixar")) return "Pop! Disney";
  if (normalizedFranchise === "wwe") return "Pop! WWE";
  if (normalizedFranchise === "nfl" || combined.includes("nba") || combined.includes("mlb")) return "Pop! Sports";
  if (normalizedFranchise.includes("pop rocks") || combined.includes("britney spears") || combined.includes("nsync")) return "Pop! Rocks";
  if (
    [
      "five nights at freddy s",
      "fallout",
      "pokemon",
      "spyro",
      "crash bandicoot",
      "cuphead",
    ].includes(normalizedFranchise)
  ) {
    return "Pop! Games";
  }
  if (
    [
      "stranger things",
      "game of thrones",
      "peacemaker",
      "the office",
      "scrubs",
      "lost",
      "supernatural",
      "saved by the bell",
      "grey s anatomy",
      "house",
      "psych",
      "suits",
      "ted lasso",
      "parks and recreation",
      "yellowstone",
      "the big bang theory",
      "the umbrella academy",
      "the walking dead",
      "ash vs evil dead",
      "beavis and butt head",
      "preacher",
    ].includes(normalizedFranchise)
  ) {
    return "Pop! Television";
  }
  if (
    [
      "the simpsons",
      "futurama",
      "south park",
      "rick and morty",
      "animaniacs",
      "looney tunes",
      "ben 10",
      "chilly willy",
      "cartoon network",
      "jujutsu kaisen",
      "invincible",
      "wondla",
    ].includes(normalizedFranchise)
  ) {
    return "Pop! Animation";
  }
  if (
    [
      "coca cola",
      "brandalised",
    ].includes(normalizedFranchise)
  ) {
    return "Pop! Ad Icons";
  }
  if (
    [
      "bob ross",
      "funko",
      "pop icons",
      "zodiac",
    ].includes(normalizedFranchise)
  ) {
    return "Pop! Icons";
  }
  if (["g i joe", "masters of the universe"].includes(normalizedFranchise)) return "Pop! Retro Toys";
  if (
    [
      "army of darkness",
      "cocaine bear",
      "robocop",
      "bullet train",
      "jingle all the way",
    ].includes(normalizedFranchise)
  ) {
    return "Pop! Movies";
  }

  return "Pop!";
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
  const haystack = normalizeWhitespace([
    product?.title,
    product?.name,
    product?.description,
    product?.category,
    product?.model,
    product?.specs ? JSON.stringify(product.specs) : "",
    cleanTitle,
  ].filter(Boolean).join(" "));

  const countMatch =
    haystack.match(/\bLE\s*[:#-]?\s*(\d{2,6})\b/i) ??
    haystack.match(/\b(?:LE|Limited(?: Edition)?(?: to)?)\s*[:#-]?\s*(\d{2,6})\s*(?:pcs|pieces|pc)\b/i) ??
    haystack.match(/\b(\d{2,6})\s*(?:pcs|pieces|pc)\b/i) ??
    haystack.match(/\b(?:production\s+run|edition\s+size|run\s+size|mint(?:ed)?|supply)\s*[:#-]?\s*(?:of\s*)?(\d{2,6})\b/i) ??
    haystack.match(/\b(\d{2,6})\s*(?:minted|tokens?|nfts?|digital\s+collectibles?)\b/i) ??
    haystack.match(/\b(?:1\s+of|of)\s+(\d{2,6})\b/i);
  const isDigital = /\b(nft|digital\s+pop|digital\s+collectible|tokenhead|droppp)\b/i.test(haystack);
  const limited =
    /\blimited(?: edition| run| production)?\b/i.test(haystack) ||
    isDigital ||
    !!countMatch;
  const limitedCount = countMatch ? Number(countMatch[1]) : null;

  return {
    limited_edition: limited,
    limited_count: limitedCount,
    edition_notes: limited
      ? limitedCount
        ? isDigital
          ? `Production run of ${limitedCount}`
          : `Limited to ${limitedCount} pieces`
        : isDigital
          ? "Digital production run"
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
  if (haystack.includes("justice league dark")) return "Justice League Dark";
  if (
    haystack.includes("zack snyder") ||
    haystack.includes("zach snyder") ||
    haystack.includes("snyder cut") ||
    (
      /\b(diana prince|desaad|darkseid|superman landing|landing pose)\b/.test(haystack) &&
      /#?\s*(1124|1125|1126|1127|1128)\b/.test(haystack)
    )
  ) {
    return "Zack Snyder's Justice League";
  }
  if (
    haystack.includes("justice league comic") ||
    (
      /\b(batman|green lantern|the flash|flash|aquaman|martian manhunter|superman|wonder woman)\b/.test(haystack) &&
      /#?\s*(461|462|463|464|465|466|467)\b/.test(haystack)
    )
  ) {
    return "Justice League Comics";
  }
  if (
    haystack.includes("justice league movie") ||
    haystack.includes("movies: dc - justice league") ||
    haystack.includes("justice league batman + aquaman") ||
    haystack.includes("justice league - flash & superman race") ||
    haystack.includes("motherbox") ||
    haystack.includes("mother box") ||
    (
      /\b(batman|bruce wayne|aquaman|wonder woman|flash|cyborg|mera|steppenwolf)\b/.test(haystack) &&
      /#?\s*(199|200|201|204|205|206|208|209|210|211|212|213|214)\b/.test(haystack)
    )
  ) {
    return "Justice League (2017)";
  }
  if (
    haystack.includes("batman v superman") ||
    haystack.includes("batman vs superman") ||
    haystack.includes("dawn of justice") ||
    (
      /\b(batman|wonder woman|aquaman|armored batman|knightmare batman|soldier|false god|doomsday)\b/.test(haystack) &&
      /#?\s*(84|86|87|88|89|90|129|130)\b/.test(haystack)
    )
  ) {
    return "Batman v Superman: Dawn of Justice";
  }
  if (
    haystack.includes("superman (1978)") ||
    haystack.includes("superman 1978") ||
    haystack.includes("superman the movie") ||
    (
      /\b(jor-el|jor el|lois lane|lex luthor|fortress of solitude)\b/.test(haystack) &&
      /#?\s*(537|538|539|540|1978)\b/.test(haystack)
    )
  ) {
    return "Superman (1978)";
  }
  if (
    haystack.includes("the flash movie") ||
    haystack.includes("movies: the flash") ||
    (
      /\b(the flash|barry allen|dark flash|supergirl|general zod|iris west|batman|wonder woman)\b/.test(haystack) &&
      /#?\s*(1333|1334|1335|1336|1337|1338|1339|1340|1341|1344|1345|1346|1349|1413)\b/.test(haystack)
    )
  ) {
    return "The Flash (2023)";
  }
  if (
    haystack.includes("pop! television: the flash") ||
    haystack.includes("television: the flash") ||
    haystack.includes("the flash tv") ||
    (
      /\b(the flash|reverse flash|captain cold|zoom|jay garrick|killer frost|bloodwork|godspeed)\b/.test(haystack) &&
      /#?\s*(213|215|216|352|716|1097|1098|1099|1100)\b/.test(haystack)
    )
  ) {
    return "The Flash (TV Series)";
  }
  if (haystack.includes("steve aoki")) return "Steve Aoki";
  if (haystack.includes("game of thrones")) return "Game of Thrones";
  if (haystack.includes("supergirl") || haystack.includes("kara zor-el") || haystack.includes("kara zor el")) return "Supergirl";
  if (haystack.includes("beetlejuice")) return "Beetlejuice";
  if (haystack.includes("tank girl")) return "Tank Girl";
  if (haystack.includes("zoolander") || haystack.includes("mugatu")) return "Zoolander";
  if (haystack.includes("army of darkness")) return "Army of Darkness";
  if (haystack.includes("parks & recreation") || haystack.includes("parks and recreation") || haystack.includes("pawnee goddess")) return "Parks and Recreation";
  if (haystack.includes("ted lasso")) return "Ted Lasso";
  if (haystack.includes("cocaine bear")) return "Cocaine Bear";
  if (haystack.includes("robocop")) return "RoboCop";
  if (haystack.includes("bullet train")) return "Bullet Train";
  if (haystack.includes("jingle all the way")) return "Jingle All the Way";
  if (haystack.includes("wallace and gromit")) return "Wallace and Gromit";
  if (haystack.includes("spellbound")) return "Spellbound";
  if (haystack.includes("sleeping beauty 65")) return "Sleeping Beauty 65th Anniversary";
  if (haystack.includes("disney 90th") || haystack.includes("dapper disney")) return "Disney 90th Anniversary";
  if (haystack.includes("disney halloween")) return "Disney Halloween";
  if (haystack.includes("maleficent")) return "Disney Villains";
  if (haystack.includes("elastigirl") || haystack.includes("violet suit")) return "Incredibles 2";
  if (haystack.includes("ben 10")) return "Ben 10";
  if (haystack.includes("futurama")) return "Futurama";
  if (haystack.includes("britney spears")) return "Britney Spears";
  if (haystack.includes("rivers cuomo") || haystack.includes("weezer")) return "Weezer";
  if (haystack.includes("disturbed")) return "Disturbed";
  if (haystack.includes("whitney houston")) return "Whitney Houston";
  if (haystack.includes("nsync") || haystack.includes("*nsync")) return "NSYNC";
  if (haystack.includes("star trek ii") || haystack.includes("wrath of khan")) return "Star Trek II: The Wrath of Khan";
  if (haystack.includes("wwe")) return "WWE";
  if (haystack.includes("nfl") || haystack.includes("adam thielen") || haystack.includes("justin herbert")) return "NFL";
  if (haystack.includes("peacemaker")) return "Peacemaker";
  if (haystack.includes("g.i. joe") || haystack.includes("gi joe")) return "G.I. Joe";
  if (haystack.includes("who framed roger rabbit") || haystack.includes("roger rabbit")) return "Who Framed Roger Rabbit";
  if (haystack.includes("aquaman and the lost kingdom")) return "Aquaman and the Lost Kingdom";
  if (
    haystack.includes("the suicide squad") ||
    /\b(1108|1109|1110|1111|1112|1113|1114|1115|1116|1117|1118|1122|1154)\b/.test(haystack)
  ) {
    return "The Suicide Squad";
  }
  if (haystack.includes("suicide squad")) return "Suicide Squad";
  if (haystack.includes("black adam")) return "Black Adam";
  if (haystack.includes("doom patrol")) return "Doom Patrol";
  if (haystack.includes("smallville")) return "Smallville";
  if (haystack.includes("creature commandos")) return "Creature Commandos";
  if (haystack.includes("doctor phosphorus") || haystack.includes("doctor phosphorous")) return "Creature Commandos";
  if (haystack.includes("gotham knights")) return "Gotham Knights";
  if (haystack.includes("cyborg silhouette") || haystack.includes("dc universe")) return "DC Universe";
  if (haystack.includes("dc super heroes") || haystack.includes("heroes dc")) return "DC Super Heroes";
  if (haystack.includes("superman: ghosts of krypton") || haystack.includes("ghosts of krypton")) return "Superman: Ghosts of Krypton";
  if (haystack.includes("the batman who laughs")) return "The Batman Who Laughs";
  if (haystack.includes("red hood")) return "DC Comics";
  if (haystack.includes("black lantern") || haystack.includes("wonder woman docteur mary")) return "Wonder Woman";
  if (haystack.includes("mr. freeze") || haystack.includes("mr freeze") || haystack.includes("batman & robin")) return "Batman & Robin";
  if (haystack.includes("deathstroke") || haystack.includes("black canary") || haystack.includes("the arrow")) return "Arrow";
  if (haystack.includes("starfire") || haystack.includes("nightwing") || haystack.includes("beast boy")) return "Titans";
  if (haystack.includes("dick in a box") || haystack.includes("d*ck in a box") || haystack.includes("d ck in a box")) return "Saturday Night Live";
  if (haystack.includes("fantastic beasts") || haystack.includes("crimes of grindelwald") || haystack.includes("chupacabra")) return "Fantastic Beasts: The Crimes of Grindelwald";
  if (haystack.includes("the witcher") || /\bciri\b/.test(haystack)) return "The Witcher";
  if (haystack.includes("caddyshack")) return "Caddyshack";
  if (haystack.includes("cartoon network")) return "Cartoon Network";
  if (haystack.includes("the goonies") || haystack.includes("goonies")) return "The Goonies";
  if (haystack.includes("grey's anatomy") || haystack.includes("greys anatomy")) return "Grey's Anatomy";
  if (haystack.includes("jujutsu kaisen")) return "Jujutsu Kaisen";
  if (haystack.includes("monty python")) return "Monty Python And The Holy Grail";
  if (haystack.includes("shaun of the dead")) return "Shaun Of The Dead";
  if (haystack.includes("south park")) return "South Park";
  if (haystack.includes("super troopers")) return "Super Troopers";
  if (haystack.includes("the tick")) return "The Tick";
  if (haystack.includes("carol anne freeling") || haystack.includes("poltergeist ii")) return "Poltergeist II: The Other Side";
  if (haystack.includes("exorcist believer")) return "The Exorcist: Believer";
  if (haystack.includes("gregory house") || haystack.includes("house md")) return "House";
  if (haystack.includes("wolverine finale") || haystack.includes("deadpool & wolverine") || haystack.includes("deadpool 3")) return "Deadpool & Wolverine";
  if (haystack.includes("deadpool legacy")) return "Deadpool Legacy Collection";
  if (haystack.includes("hall of armor") || haystack.includes("hall of armour")) return "Hall of Armor";
  if (haystack.includes("the infinity saga") || haystack.includes("infinity saga")) return "The Infinity Saga";
  if (haystack.includes("what if...?") || haystack.includes("what if...") || haystack.includes("what if?") || haystack.includes("what if")) return "What If...?";
  if (haystack.includes("spider-man 2") || haystack.includes("spider man 2") || haystack.includes("advanced suit 2.0")) return "Spider-Man 2";
  if (haystack.includes("deadpool") && haystack.includes("venom")) return "Marvel Universe";
  if (haystack.includes("venomized deadpool")) return "Marvel Universe";
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
  if (haystack.includes("gwen-verse") || haystack.includes("gwen verse") || /\b(cap-gwen|iron gwen|thorgwen)\b/.test(haystack)) return "Gwen-Verse";
  if (haystack.includes("marvel zombies") || /\bzombie\s+(morbius|mysterio|red hulk|wolverine|moon knight|deadpool|hunter spidey|silver surfer|magneto)\b/.test(haystack)) return "Marvel Zombies";
  if (haystack.includes("spider-man the animated series") || haystack.includes("spiderman the animated series") || haystack.includes("animated spiderman")) return "Spider-Man: The Animated Series";
  if (/\bmarvel\b/.test(haystack) && /\bholiday\b/.test(haystack)) return "Marvel Holiday";
  if (haystack.includes("marvel 80th anniversary") || haystack.includes("80 years")) return "Marvel 80th Anniversary";
  if (haystack.includes("marvel comics")) return "Marvel Comics";
  if (haystack.includes("ms marvel") || haystack.includes("ms. marvel")) return "Ms. Marvel";
  if (haystack.includes("iron man 2") || haystack.includes(" im2 ")) return "Iron Man 2";
  if (haystack.includes("iron man #2") && (haystack.includes("die-cast") || haystack.includes("die cast") || haystack.includes("avengers"))) return "Avengers";
  if (haystack.includes("black panther") && haystack.includes("wakanda forever")) return "Black Panther: Wakanda Forever";
  if (haystack.includes("captain america") && haystack.includes("brave new world")) return "Captain America: Brave New World";
  if (haystack.includes("civil war") && haystack.includes("winter soldier")) return "Captain America: Civil War";
  if (haystack.includes("captain marvel")) return "Captain Marvel";
  if (haystack.includes("shazam") && haystack.includes("fury of the gods")) return "Shazam! Fury of the Gods";
  if (haystack.includes("loki season 2")) return "Loki Season 2";
  if (haystack.includes("loki") && !haystack.includes("thor")) return "Loki";
  if (haystack.includes("justice league")) return "Justice League";
  if (haystack.includes("man of steel")) return "Man of Steel";
  if (
    haystack.includes("superman (2025)") ||
    haystack.includes("superman 2025") ||
    haystack.includes("dc studios superman") ||
    (
      /\b(superman|lois lane|lex luthor|krypto|hawkgirl|hammer of boravia|mr\.?\s*terrific|guy gardner|metamorpho|the engineer|ultraman)\b/.test(haystack) &&
      /#?\s*(562|563|564|565|566|579|582|583|584|585|586|587|588)\b/.test(haystack)
    )
  ) {
    return "Superman (2025)";
  }
  if (haystack.includes("superman")) return "Superman";
  if (haystack.includes("thunderbolts")) return "Thunderbolts";
  if (haystack.includes("doctor strange") && haystack.includes("multiverse of madness")) return "Doctor Strange in the Multiverse of Madness";
  if (haystack.includes("shang-chi") || haystack.includes("shang chi")) return "Shang-Chi and the Legend of the Ten Rings";
  if (haystack.includes("thor ragnarok")) return "Thor: Ragnarok";
  if (haystack.includes("thor love and thunder") || haystack.includes("thor love & thunder")) return "Thor: Love and Thunder";
  if (/\b(thor|mighty thor|ravager thor|valkyrie|gorr|korg|miek)\b/.test(haystack) && /\b10(40|41|42|43|44|45|76|85)\b/.test(haystack)) return "Thor: Love and Thunder";
  if (/\b(moon knight|arthur harrow|layla el-faouly|scarlet scarab)\b/.test(haystack)) return "Moon Knight";
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
  if (haystack.includes("treehouse of horror")) return "The Simpsons: Treehouse of Horror";
  if (haystack.includes("the simpsons") || haystack.includes("simpsons") || haystack.includes("itchy") || haystack.includes("scratchy")) return "The Simpsons";
  if (haystack.includes("five nights at freddy")) return "Five Nights at Freddy's";
  if (haystack.includes("security breach")) return "Five Nights at Freddy's: Security Breach";
  if (haystack.includes("help wanted 2")) return "Five Nights at Freddy's: Help Wanted 2";
  if (haystack.includes("avengers age of ultron")) return "Avengers: Age of Ultron";
  if (haystack.includes("avengers endgame")) return "Avengers: Endgame";
  if (haystack.includes("avengers")) return "Avengers";
  if (haystack.includes("black widow")) return "Black Widow";
  if (
    haystack.includes("fantastic four") &&
    (haystack.includes("first steps") || haystack.includes("(2025)") || haystack.includes("2025"))
  ) {
    return "Fantastic Four: First Steps";
  }
  if (haystack.includes("fantastic four")) return "Fantastic Four";
  if (haystack.includes("the lord of the rings") || haystack.includes("lord of the rings") || haystack.includes("smeagol") || haystack.includes("gollum")) return "The Lord of the Rings";
  if (haystack.includes("office space")) return "Office Space";
  if (haystack.includes("psych")) return "Psych";
  if (haystack.includes("guardians of the galaxy holiday special")) return "Guardians of the Galaxy Holiday Special";
  if (
    haystack.includes("guardians of the galaxy vol. 2") ||
    haystack.includes("guardians of the galaxy vol 2") ||
    haystack.includes("guardians of the galaxy 2")
  ) {
    return "Guardians of the Galaxy Vol. 2";
  }
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
  if (haystack.includes("x-men '97") || haystack.includes("x-men 97")) return "X-Men '97";
  if (haystack.includes("x-men") || haystack.includes("xmen")) return "X-Men";
  if (haystack.includes("spider-man maximum venom") || haystack.includes("spiderman maximum venom")) return "Spider-Man: Maximum Venom";
  if (haystack.includes("year of the spider")) return "Year of the Spider";
  if (haystack.includes("friendly neighborhood spider-man") || haystack.includes("spiderman last stand") || haystack.includes("spider-man last stand")) return "Spider-Man";
  if (haystack.includes("retro reimagined")) return "Retro Reimagined";
  if (haystack.includes("new classics")) return "New Classics";
  if (haystack.includes("star wars dark side") || haystack.includes("darkside") || haystack.includes("dark side")) return "Star Wars: Dark Side";
  if (haystack.includes("concept series")) return "Star Wars Concept Series";
  if (haystack.includes("red saber series")) return "Star Wars: Red Saber Series";
  if (haystack.includes("power of the galaxy")) return "Star Wars: Power of the Galaxy";
  if (haystack.includes("star wars holiday") || /\bholiday\b/.test(haystack)) return "Star Wars Holiday";
  if (haystack.includes("infinities")) return "Star Wars Infinities";
  if (haystack.includes("rey jakku")) return "Star Wars: The Force Awakens";
  if (haystack.includes("rise of skywalker")) return "Star Wars: The Rise of Skywalker";
  if (haystack.includes("rogue one")) return "Star Wars: Rogue One";
  if (haystack.includes("revenge of the sith") || haystack.includes("darth vader rebuild") || (haystack.includes("darth vader") && /\b757\b/.test(haystack)) || (haystack.includes("mace windu") && /\b172\b/.test(haystack))) return "Star Wars: Revenge of the Sith";
  if (haystack.includes("tpm25") || haystack.includes("phantom menace") || haystack.includes("watto") || haystack.includes("aurra sing")) return "Star Wars: The Phantom Menace";
  if (haystack.includes("attack of the clones") || haystack.includes("jango fett")) return "Star Wars: Attack of the Clones";
  if (haystack.includes("clone wars")) return "Star Wars: The Clone Wars";
  if (haystack.includes("luke ceremony") || haystack.includes("sandtrooper") || (haystack.includes("darth vader") && /\b1\b/.test(haystack)) || (haystack.includes("c-3po") && /\b13\b/.test(haystack)) || (haystack.includes("stormtrooper") && /\b5\b/.test(haystack)) || (haystack.includes("han solo") && /\b169\b/.test(haystack))) return "Star Wars: A New Hope";
  if (haystack.includes("yoda spirit") || haystack.includes("vader electrocuted") || haystack.includes("emperor palpatine") || haystack.includes("wicket w. warrick") || haystack.includes("lando calrissian general") || haystack.includes("lando calrissian in the millennium falcon")) return "Star Wars: Return of the Jedi";
  if (haystack.includes("hoth") || haystack.includes("bespin") || haystack.includes("training luke") || haystack.includes("luke training with yoda") || haystack.includes("empire strikes back")) return "Star Wars: The Empire Strikes Back";
  if ((haystack.includes("boba fett") && /\b102\b/.test(haystack)) || haystack.includes("ig-88") || haystack.includes("zuckuss")) return "Star Wars: The Empire Strikes Back";
  if (haystack.includes("ahsoka") || haystack.includes("ezra bridger")) return "Ahsoka";
  if (haystack.includes("skeleton crew") || haystack.includes("kh'ymm") || haystack.includes("khymm") || /\b(jod|fern)\b/.test(haystack)) return "Skeleton Crew";
  if (
    haystack.includes("mandalorian s3") ||
    haystack.includes("mandalorian season 3") ||
    haystack.includes("din grogu with armour") ||
    haystack.includes("din grogu with armor") ||
    haystack.includes("grogu force barrier") ||
    haystack.includes("moff gideon with armor") ||
    haystack.includes("peli motto with grogu") ||
    haystack.includes("n-1 starfighter") ||
    (/\b(665|668|670|712|713|714|717|719)\b/.test(haystack) && /\b(mandalorian|grogu|bo-katan|moff gideon|armorer|peli motto)\b/.test(haystack))
  ) {
    return "The Mandalorian";
  }
  if (haystack.includes("the mandalorian & grogu") || haystack.includes("the mandalorian and grogu") || haystack.includes("rotta the hutt")) return "The Mandalorian & Grogu";
  if (haystack.includes("the mandalorian")) return "The Mandalorian";
  if (haystack.includes("andor")) return "Andor";
  if (haystack.includes("episode viii") || haystack.includes("last jedi")) return "Star Wars: The Last Jedi";
  if (haystack.includes("solo") && haystack.includes("star wars")) return "Solo: A Star Wars Story";
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
    "AnimaciÃ³n",
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
    "Five Nights At Freddyâ€™s",
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

  if (/peacemaker\s+s3\s*[-:]\s*peacemaker\s+doppelganger/i.test(originalCleanTitle) || /peacemaker\s+doppelganger/i.test(originalCleanTitle)) {
    return "Peacemaker Doppelganger";
  }

  if (/peacemaker\s+with\s+peace\s+sign/i.test(originalCleanTitle) || (/^With\s+Peace\s+Sign\b/i.test(cleaned) && /peacemaker/i.test(rawTitle))) {
    return "Peacemaker with Peace Sign";
  }

  if (/britney\s+spears\s*[â€“â€”-]\s*lucky/i.test(originalCleanTitle) || /britney\s+spears.*\blucky\b/i.test(originalCleanTitle)) {
    return "Britney Spears (Lucky)";
  }

  if (/justice\s+league\s+and\s+sonic\s+shadow\s*\/\s*batman/i.test(originalCleanTitle)) {
    return "Shadow/Batman";
  }

  if (/^Supergirl\s+Kara\s+Zor[- ]El\s+With\s+Cedric\b/i.test(originalCleanTitle)) {
    return "Kara Zor-El With Cedric";
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

  cleaned = cleaned.replace(/^Sayings\s*[-â€“â€”]\s*/i, "");
  cleaned = cleaned.replace(/\bVenom\s+Venomized\b/gi, "Venomized");

  cleaned = cleaned
    .replace(/\s*[-â€“â€”]{1,2}\s*\d{4}\s*Con\b/gi, "")
    .replace(/\s*[-â€“â€”]{1,2}\s*\d{4}\s*Convention\b/gi, "")
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
    .replace(/^Ð¤Ð¸Ð³ÑƒÑ€Ð°\s+Disney:\s+Finding\s+Dory:\s+Dory,?$/i, "Dory")
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
    .replace(/^Marvel['â€™]s\s+/i, "")
    .replace(/^Daredevil\s+Daredevil\s*:\s*Born Again\b/i, "Daredevil")
    .replace(/^Daredevil\s*:\s*Born Again\s*[-Ã¢â‚¬â€œÃ¢â‚¬â€]\s*/i, "")
    .replace(/^Daredevil\s+Born Again\s+/i, "")
    .replace(/^Moon Knight\s+/i, "")
    .replace(/^Thor\s*:?\s*Ragnarok\s+/i, "")
    .replace(/^Ragnarok\s+Thor\s+/i, "Thor ")
    .replace(/^Avengers\s+Infinity\s+War\s+/i, "")
    .replace(/^Avengers(?:\s+4)?\s+Endgame\s+/i, "")
    .replace(/^Ant[- ]Man\s+(?:&|And)\s+The\s+Wasp:?\s+Quantumania\s+/i, "")
    .replace(/^Guardians\s+Of\s+The\s+Galaxy(?::?\s+Vol\.?\s*3|\s+3)?\s+/i, "")
    .replace(/^Thor\s+Love\s+(?:And|&)\s+Thunder\s+/i, "")
    .replace(/^Stranger Things\s+\d+\s*[-Ã¢â‚¬â€œÃ¢â‚¬â€]\s*/i, "")
    .replace(/^Stranger Things\s+S\d+\s*[-Ã¢â‚¬â€œÃ¢â‚¬â€]\s*/i, "")
    .replace(/^S\d+\s+/i, "")
    .replace(/^Season\s+\d+\s+/i, "")
    .replace(/\s+Season\s+\d+\s*$/i, "")
    .replace(/\s+S\d+\s*$/i, "");

  const dashParts = cleaned
    .split(/\s[-â€“â€”]{1,2}\s/)
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
    .replace(/^['â€™`s\s:]+/, "")
    .replace(/\bWith\s+A(?:\s+Pop)?$/i, "")
    .replace(/^[!Â¡\s:â€“â€”-]+/, "")
    .replace(/[\s:â€“â€”-]+$/, "")
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
  .replace(/^Jumbo\s*:\s*Moon Knight\s*[-â€“â€”]\s*/i, "")
  .replace(/^Marvel\s*:\s*Fantastic Four\s+/i, "")
  .replace(/^Marvel\s+The Fantastic 4\s+/i, "")
  .replace(/^Guardians\s+Of\s+The\s+Galaxy\s+Vol\.?\s*2\s+/i, "")
  .replace(/^Fantastic Four\s*:\s*First Steps\s*:?\s*/i, "")
  .replace(/^The Fantastic Four\s*:?\s*First Steps\s*:?\s*/i, "")
  .replace(/^Fantastic Four\s+/i, "")
  .replace(/^The Fantastic Four\s+/i, "")
  .replace(/^Marvel['â€™]s\s+/i, "")
  .replace(/^['â€™`s\s:]+/, "")
  .replace(/\bWith\s+A(?:\s+Pop)?$/i, "")
  .replace(/^Marvel\s+Doctor Strange\s+Multiverse\s+Of\s+Madness\s+N[Â°Âºo]?\s+\d+\s*[â€“â€”-]\s*/i, "")
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
  .replace(/\bN[Â°Âºo]?\b/gi, "")
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

function extractReleaseDate(product: any): string | null {
  const rawDate =
    product?.["release-date"] ??
    product?.release_date ??
    product?.releaseDate ??
    product?.raw?.["release-date"] ??
    null;
  const dateText = String(rawDate ?? "").trim();

  if (/^(19|20)\d{2}-\d{2}-\d{2}$/.test(dateText)) return dateText;
  if (/^(19|20)\d{2}$/.test(dateText)) return `${dateText}-01-01`;

  return null;
}

function scoreParse(parsed: Omit<ParsedFunko, "parse_confidence" | "parse_reason_codes" | "needs_review" | "warnings">): {
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

  if (!parsed.set_name) warnings.push("missing_set");

  if (!parsed.character) warnings.push("missing_character");
  else score += 0.15;

  if (shouldWarnMissingNumber(parsed.number, parsed.pop_style)) warnings.push("missing_number");
  else score += 0.1;

  if (!parsed.estimated_value) warnings.push("estimated_value_missing");
  else score += 0.05;

  if (parsed.pop_name && parsed.raw_title && parsed.pop_name.length >= parsed.raw_title.length - 3) {
    warnings.push("weak_name_cleanup");
    score -= 0.1;
  }

  if (
    parsed.raw_title &&
    /(exclusive|special edition|\bse\b|metallic|diamond|glitter|chase|flocked|glow|gitd)/i.test(parsed.raw_title) &&
    (!parsed.variant || !parsed.exclusivity)
  ) {
    warnings.push("variant_or_exclusive_title_noise");
  }

  score = Math.max(0, Math.min(1, Number(score.toFixed(2))));

  if (score < 0.75 && warnings.length === 0) {
    warnings.push("confidence_floor_070");
  }

  return {
    parse_confidence: score,
    needs_review: shouldFlagNeedsReview(score, warnings),
    warnings,
  };
}

function parseFunkoProduct(product: any): ParsedFunko {
  const rawTitle = normalizeWhitespace(product?.title ?? "");
  const cleanTitle = stripUniversalNoise(rawTitle);

  const variant = extractVariant(product, cleanTitle);
  const popStyle = extractPopStyle(product, cleanTitle);
  const numberSource = `${cleanTitle} ${product?.description ?? ""}`;
  const number = normalizeMultipackNumber(extractNumber(numberSource), popStyle, numberSource);
  const setName = normalizeSetName(extractSetName(product, cleanTitle));
  const exclusivity = extractExclusivity(product);
  const vaultStatus = extractVaultStatus(product, cleanTitle);
  const releaseDate = extractReleaseDate(product);
  const limitedEdition = extractLimitedEdition(product, cleanTitle);
  const franchise = guessFranchise(product, cleanTitle);
  const popType = extractPopType(product, cleanTitle, franchise, setName);
  const character = cleanupCharacterName(cleanTitle, franchise, number, popStyle, exclusivity, setName);
  const estimatedValue = estimateValueFromStores(product);
  const description = cleanDescription(product?.description);

  const partial: Omit<ParsedFunko, "parse_confidence" | "parse_reason_codes" | "needs_review" | "warnings"> = {
    raw_title: rawTitle || null,
    clean_title: cleanTitle || null,
    pop_name: character || cleanTitle || null,
    character,
    franchise,
    number,
    variant,
    exclusivity,
    pop_type: popType,
    pop_style: popStyle,
    set_name: setName,
    vault_status: vaultStatus,
    release_date: releaseDate,
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
    parse_reason_codes: score.warnings,
  };
}

function applyCatalogOverride(parsed: ParsedFunko, barcode: string): ParsedFunko {
  return applySingleCatalogOverride(parsed, CATALOG_OVERRIDES_BY_UPC[barcode]);
}

Object.assign(CATALOG_OVERRIDES_BY_UPC, {
  "889698147644": {
    pop_name: "Kylo Ren",
    character: "Kylo Ren",
    franchise: "Star Wars",
    set_name: "Star Wars: The Last Jedi",
    number: "203",
    exclusivity: "Toys R Us",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Kylo Ren is a Star Wars: The Last Jedi Pop! release #203, Toys R Us exclusive.",
    display_description: "Kylo Ren is a Star Wars: The Last Jedi Pop! release #203, Toys R Us exclusive.",
    parse_confidence: 0.98,
    needs_review: true,
    warnings: [],
  },
  "830395034003": {
    pop_name: "Marty McFly",
    character: "Marty McFly",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "49",
    exclusivity: "Plastic Empire",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    limited_edition: true,
    limited_count: 3000,
    description: "Marty McFly is a Back to the Future Pop! Movies release #49, Plastic Empire exclusive limited to 3,000 pieces.",
    display_description: "Marty McFly is a Back to the Future Pop! Movies release #49, Plastic Empire exclusive limited to 3,000 pieces.",
    parse_confidence: 0.98,
    needs_review: true,
    warnings: [],
  },
  "830395033990": {
    pop_name: "Dr. Emmett Brown",
    character: "Dr. Emmett Brown",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "50",
    variant: "Glow in the Dark",
    exclusivity: "Convention",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Dr. Emmett Brown (Glow in the Dark) is a Back to the Future Pop! Movies release #50, Convention exclusive.",
    display_description: "Dr. Emmett Brown (Glow in the Dark) is a Back to the Future Pop! Movies release #50, Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: true,
    warnings: [],
  },
  "889698816663": {
    pop_name: "Grand Admiral Thrawn (Diamond Glitter)",
    character: "Grand Admiral Thrawn",
    franchise: "Star Wars",
    set_name: "Ahsoka",
    number: "697",
    variant: "Diamond Glitter",
    exclusivity: "San Diego Comic-Con",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    limited_edition: true,
    limited_count: 3000,
    description: "Grand Admiral Thrawn (Diamond Glitter) is a Star Wars: Ahsoka Pop! release #697, San Diego Comic-Con exclusive limited to 3,000 pieces.",
    display_description: "Grand Admiral Thrawn (Diamond Glitter) is a Star Wars: Ahsoka Pop! release #697, San Diego Comic-Con exclusive limited to 3,000 pieces.",
    parse_confidence: 0.98,
    needs_review: true,
    warnings: [],
  },
  "889698717366": {
    pop_name: "Hatching Raptor",
    character: "Hatching Raptor",
    franchise: "Jurassic Park",
    set_name: "Jurassic Park",
    number: "1442",
    exclusivity: "Summer Convention / Target",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Hatching Raptor is a Jurassic Park Pop! Movies release #1442, 2023 Summer Convention exclusive shared with Target.",
    display_description: "Hatching Raptor is a Jurassic Park Pop! Movies release #1442, 2023 Summer Convention exclusive shared with Target.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698871877": {
    pop_name: "Bullseye as Superman",
    character: "Bullseye",
    franchise: "Target",
    set_name: "Ad Icons",
    number: "249",
    exclusivity: "Target",
    pop_type: "Pop! Ad Icons",
    pop_style: "Standard",
    vault_status: "Vaulted",
    description: "Bullseye as Superman is a Target Ad Icons Pop! Icons release #249, Target exclusive.",
    display_description: "Bullseye as Superman is a Target Ad Icons Pop! Icons release #249, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698496858": {
    pop_name: "Doc & Einstein",
    character: "Doc Brown & Einstein",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "972",
    exclusivity: "Walmart",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Doc & Einstein is a Back to the Future Pop! Movies release #972, Walmart exclusive.",
    display_description: "Doc & Einstein is a Back to the Future Pop! Movies release #972, Walmart exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698567718": {
    pop_name: "Andy with Leg Casts",
    character: "Andy Dwyer",
    franchise: "Parks and Recreation",
    set_name: "Parks and Recreation",
    number: "1155",
    exclusivity: "Calendar Club",
    pop_type: "Pop! Television",
    pop_style: "Standard",
    description: "Andy with Leg Casts is a Parks and Recreation Pop! Television release #1155, Calendar Club exclusive.",
    display_description: "Andy with Leg Casts is a Parks and Recreation Pop! Television release #1155, Calendar Club exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698147989": {
    pop_name: "Young Anakin Skywalker (Podracer)",
    character: "Anakin Skywalker",
    franchise: "Star Wars",
    set_name: "Star Wars: Episode I - The Phantom Menace",
    number: "231",
    exclusivity: "Walgreens",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Young Anakin Skywalker (Podracer) is a Star Wars Pop! release #231, Walgreens exclusive.",
    display_description: "Young Anakin Skywalker (Podracer) is a Star Wars Pop! release #231, Walgreens exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698430173": {
    pop_name: "Princess Leia",
    character: "Princess Leia",
    franchise: "Star Wars",
    set_name: "Star Wars",
    number: "295",
    variant: "Gold Chrome",
    exclusivity: "Galactic Convention / Hot Topic",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Princess Leia (Gold Chrome) is a Star Wars Pop! release #295, Galactic Convention shared exclusive.",
    display_description: "Princess Leia (Gold Chrome) is a Star Wars Pop! release #295, Galactic Convention shared exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698675376": {
    pop_name: "Stormtrooper",
    character: "Stormtrooper",
    franchise: "Star Wars",
    set_name: "Star Wars: Episode IV - A New Hope",
    number: "598",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Stormtrooper is a Star Wars: Episode IV - A New Hope Pop! release #598 from the Star Wars New Classics line.",
    display_description: "Stormtrooper is a Star Wars: Episode IV - A New Hope Pop! release #598 from the Star Wars New Classics line.",
    parse_confidence: 0.98,
    needs_review: true,
    warnings: [],
  },
  "889698704571": {
    pop_name: "Darth Vader on TIE Fighter",
    character: "Darth Vader",
    franchise: "Star Wars",
    set_name: "Disney 100",
    number: "20",
    exclusivity: "Amazon",
    pop_type: "Pop! Trains",
    pop_style: "Standard",
    description: "Darth Vader on TIE Fighter is a Disney 100 Star Wars Pop! Trains release #20, Amazon exclusive.",
    display_description: "Darth Vader on TIE Fighter is a Disney 100 Star Wars Pop! Trains release #20, Amazon exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698652568": {
    pop_name: "Krrsantan",
    character: "Krrsantan",
    franchise: "Star Wars",
    set_name: "The Book of Boba Fett",
    number: "548",
    variant: "Flocked",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Krrsantan (Flocked) is a Star Wars: The Book of Boba Fett Pop! release #548, Summer Convention exclusive.",
    display_description: "Krrsantan (Flocked) is a Star Wars: The Book of Boba Fett Pop! release #548, Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698837729": {
    pop_name: "Jean-Luc Picard (Transporter) (Glitter)",
    character: "Jean-Luc Picard",
    franchise: "Star Trek",
    set_name: "Star Trek Transporter",
    number: "1687",
    variant: "Glitter",
    pop_type: "Pop! Plus",
    pop_style: "Standard",
    description: "Jean-Luc Picard (Transporter) (Glitter) is a Star Trek Pop! Plus release #1687.",
    display_description: "Jean-Luc Picard (Transporter) (Glitter) is a Star Trek Pop! Plus release #1687.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698372480": {
    pop_name: "Batman (1989)",
    character: "Batman",
    franchise: "DC",
    set_name: "Batman 1989",
    number: "275",
    exclusivity: "Target",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Batman (1989) is a Batman: 80th Anniversary Pop! Heroes release #275, Target exclusive.",
    display_description: "Batman (1989) is a Batman: 80th Anniversary Pop! Heroes release #275, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: true,
    warnings: [],
  },
  "889698372541": {
    pop_name: "Batman Forever",
    character: "Batman",
    franchise: "DC",
    set_name: "Batman Forever",
    number: "289",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Batman Forever is a Pop! Heroes release #289.",
    display_description: "Batman Forever is a Pop! Heroes release #289.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698639880": {
    pop_name: "Sallah",
    character: "Sallah",
    franchise: "Indiana Jones",
    set_name: "Indiana Jones and the Last Crusade",
    number: "1352",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Sallah is an Indiana Jones and the Last Crusade Pop! Movies release #1352.",
    display_description: "Sallah is an Indiana Jones and the Last Crusade Pop! Movies release #1352.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698485159": {
    pop_name: "Biff Tannen",
    character: "Biff Tannen",
    franchise: "Back to the Future",
    set_name: "Back to the Future",
    number: "963",
    vault_status: "Vaulted",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Biff Tannen is a Pop! Movies release #963 from Back to the Future.",
    display_description: "From Back to the Future, Biff Tannen is a Pop! Movies release #963.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698744225": {
    pop_name: "Batman (Kingdom Come)",
    character: "Batman",
    franchise: "DC",
    set_name: "Kingdom Come",
    number: "569",
    exclusivity: "Summer Convention",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Batman (Kingdom Come) is a Pop! Heroes release #569, Summer Convention exclusive.",
    display_description: "Batman (Kingdom Come) is a Pop! Heroes release #569, Summer Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698818667": {
    pop_name: "Fear Gas Batman",
    character: "Batman",
    franchise: "DC",
    set_name: "Batman Begins",
    number: "532",
    exclusivity: "Funko Shop",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Fear Gas Batman is a Batman Begins Pop! Heroes release #532, Funko Shop exclusive.",
    display_description: "Fear Gas Batman is a Batman Begins Pop! Heroes release #532, Funko Shop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698866422": {
    pop_name: "Superman and the Fortress of Solitude",
    character: "Superman",
    franchise: "DC",
    set_name: "Superman (2025)",
    number: "582",
    pop_type: "Pop! Moment",
    pop_style: "Standard",
    description: "Superman and the Fortress of Solitude is a Superman (2025) Pop! Moment release #582.",
    display_description: "Superman and the Fortress of Solitude is a Superman (2025) Pop! Moment release #582.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698477055": {
    pop_name: "The Riddler",
    character: "The Riddler",
    franchise: "DC",
    set_name: "Batman Forever",
    number: "340",
    vault_status: "Vaulted",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "The Riddler is a Batman Forever Pop! Heroes release #340.",
    display_description: "The Riddler is a Batman Forever Pop! Heroes release #340.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698477062": {
    pop_name: "Two-Face",
    character: "Two-Face",
    franchise: "DC",
    set_name: "Batman Forever",
    number: "341",
    vault_status: "Vaulted",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Two-Face is a Batman Forever Pop! Heroes release #341.",
    display_description: "Two-Face is a Batman Forever Pop! Heroes release #341.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698863698": {
    pop_name: "Batman",
    character: "Batman",
    franchise: "DC",
    set_name: "DC New Classics",
    number: "598",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Batman is a DC New Classics Pop! Heroes release #598.",
    display_description: "Batman is a DC New Classics Pop! Heroes release #598.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698863704": {
    pop_name: "Superman",
    character: "Superman",
    franchise: "DC",
    set_name: "DC New Classics",
    number: "599",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Superman is a DC New Classics Pop! Heroes release #599.",
    display_description: "Superman is a DC New Classics Pop! Heroes release #599.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698863711": {
    pop_name: "Wonder Woman",
    character: "Wonder Woman",
    franchise: "DC",
    set_name: "DC New Classics",
    number: "600",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Wonder Woman is a DC New Classics Pop! Heroes release #600.",
    display_description: "Wonder Woman is a DC New Classics Pop! Heroes release #600.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698863728": {
    pop_name: "Green Lantern",
    character: "Green Lantern",
    franchise: "DC",
    set_name: "DC New Classics",
    number: "601",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Green Lantern is a DC New Classics Pop! Heroes release #601.",
    display_description: "Green Lantern is a DC New Classics Pop! Heroes release #601.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698862257": {
    pop_name: "Robin King",
    character: "Robin King",
    franchise: "DC",
    set_name: "Tales from the Dark Multiverse",
    number: "581",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Robin King is a Tales from the Dark Multiverse Pop! Heroes release #581.",
    display_description: "Robin King is a Tales from the Dark Multiverse Pop! Heroes release #581.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698862240": {
    pop_name: "Saint Batman",
    character: "Saint Batman",
    franchise: "DC",
    set_name: "Tales from the Dark Multiverse",
    number: "580",
    pop_type: "Pop! Heroes",
    pop_style: "Standard",
    description: "Saint Batman is a Tales from the Dark Multiverse Pop! Heroes release #580.",
    display_description: "Saint Batman is a Tales from the Dark Multiverse Pop! Heroes release #580.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698520232": {
    pop_name: "Ahsoka Tano",
    character: "Ahsoka Tano",
    franchise: "Star Wars",
    set_name: "The Clone Wars",
    number: "409",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Ahsoka Tano is a Star Wars: The Clone Wars Pop! release #409.",
    display_description: "Ahsoka Tano is a Star Wars: The Clone Wars Pop! release #409.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698107662": {
    pop_name: "Ahsoka Tano (Holographic)",
    character: "Ahsoka Tano",
    franchise: "Star Wars",
    set_name: "Star Wars Rebels",
    number: "130",
    variant: "Holographic",
    exclusivity: "Hot Topic",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Ahsoka Tano (Holographic) is a Star Wars Rebels Pop! release #130, Hot Topic exclusive.",
    display_description: "Ahsoka Tano (Holographic) is a Star Wars Rebels Pop! release #130, Hot Topic exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698759380": {
    pop_name: "Vito Corleone with Towel Silencer",
    character: "Vito Corleone",
    franchise: "The Godfather",
    set_name: "The Godfather Part II",
    number: "1525",
    pop_type: "Pop! Movies",
    pop_style: "Standard",
    description: "Vito Corleone with Towel Silencer is a The Godfather Part II Pop! Movies release #1525.",
    display_description: "Vito Corleone with Towel Silencer is a The Godfather Part II Pop! Movies release #1525.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698768283": {
    pop_name: "Bo-Katan Kryze",
    character: "Bo-Katan Kryze",
    franchise: "Star Wars",
    set_name: "The Mandalorian",
    number: "693",
    exclusivity: "Target",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Bo-Katan Kryze is a Star Wars: The Mandalorian Pop! release #693, Target exclusive.",
    display_description: "Bo-Katan Kryze is a Star Wars: The Mandalorian Pop! release #693, Target exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698430197": {
    pop_name: "Jango Fett",
    character: "Jango Fett",
    franchise: "Star Wars",
    set_name: "Star Wars: Attack of the Clones",
    number: "285",
    variant: "Metallic Gold",
    exclusivity: "Walmart",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Jango Fett is a Star Wars: Attack of the Clones Pop! release #285, Walmart exclusive, metallic gold.",
    display_description: "Jango Fett is a Star Wars: Attack of the Clones Pop! release #285, Walmart exclusive, metallic gold.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698407021": {
    pop_name: "Sebulba",
    character: "Sebulba",
    franchise: "Star Wars",
    set_name: "Star Wars: Episode I - The Phantom Menace",
    number: "304",
    exclusivity: "Smuggler's Bounty",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Sebulba is a Star Wars: Episode I - The Phantom Menace Pop! release #304, Smuggler's Bounty exclusive.",
    display_description: "Sebulba is a Star Wars: Episode I - The Phantom Menace Pop! release #304, Smuggler's Bounty exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "830395023908": {
    pop_name: "Darth Maul",
    character: "Darth Maul",
    franchise: "Star Wars",
    set_name: "Star Wars: The Phantom Menace",
    number: "9",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Darth Maul belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #9.",
    display_description: "Darth Maul belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #9.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "830395023243": {
    pop_name: "Chewbacca",
    character: "Chewbacca",
    franchise: "Star Wars",
    set_name: "Star Wars: The Empire Strikes Back",
    number: "06",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Chewbacca belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #06.",
    display_description: "Chewbacca belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #06.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698376662": {
    pop_name: "Watto",
    character: "Watto",
    franchise: "Star Wars",
    set_name: "Star Wars: The Phantom Menace",
    number: "298",
    exclusivity: "Star Wars Celebration",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Watto belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #298. This catalog entry tracks the Star Wars Celebration exclusive.",
    display_description: "Watto belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #298. This catalog entry tracks the Star Wars Celebration exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698406772": {
    pop_name: "Aurra Sing",
    character: "Aurra Sing",
    franchise: "Star Wars",
    set_name: "Star Wars: The Phantom Menace",
    number: "303",
    exclusivity: "Smuggler's Bounty",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Aurra Sing belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #303. This catalog entry tracks the Smuggler's Bounty exclusive.",
    display_description: "Aurra Sing belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #303. This catalog entry tracks the Smuggler's Bounty exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698760188": {
    pop_name: "Obi-Wan Kenobi (Padawan)",
    character: "Obi-Wan Kenobi",
    franchise: "Star Wars",
    set_name: "Star Wars: The Phantom Menace",
    number: "699",
    variant: "Padawan",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Obi-Wan Kenobi (Padawan) belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #699.",
    display_description: "Obi-Wan Kenobi (Padawan) belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #699.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698760218": {
    pop_name: "Watto",
    character: "Watto",
    franchise: "Star Wars",
    set_name: "Star Wars: The Phantom Menace",
    number: "702",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Watto belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #702.",
    display_description: "Watto belongs to the Star Wars: The Phantom Menace Pop! Star Wars line as #702.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803065744": {
    pop_name: "AT-AT Driver",
    character: "AT-AT Driver",
    franchise: "Star Wars",
    set_name: "Star Wars: The Empire Strikes Back",
    number: "92",
    exclusivity: "Walgreens",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "AT-AT Driver belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #92. This catalog entry tracks the Walgreens exclusive.",
    display_description: "AT-AT Driver belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #92. This catalog entry tracks the Walgreens exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698101059": {
    pop_name: "Dagobah Yoda",
    character: "Yoda",
    franchise: "Star Wars",
    set_name: "Star Wars: The Empire Strikes Back",
    number: "124",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Dagobah Yoda belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #124.",
    display_description: "Dagobah Yoda belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #124.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698561051": {
    pop_name: "Bounty Hunters Collection: Dengar",
    character: "Dengar",
    franchise: "Star Wars",
    set_name: "Star Wars: The Empire Strikes Back",
    number: "440",
    exclusivity: "GameStop",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Bounty Hunters Collection: Dengar belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #440. This catalog entry tracks the GameStop exclusive.",
    display_description: "Bounty Hunters Collection: Dengar belongs to the Star Wars: The Empire Strikes Back Pop! Star Wars line as #440. This catalog entry tracks the GameStop exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803057794": {
    pop_name: "Nalan Cheel",
    character: "Nalan Cheel",
    franchise: "Star Wars",
    set_name: "Star Wars: A New Hope",
    number: "52",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Nalan Cheel belongs to the Star Wars: A New Hope Pop! Star Wars line as #52.",
    display_description: "Nalan Cheel belongs to the Star Wars: A New Hope Pop! Star Wars line as #52.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698430166": {
    pop_name: "Luke Skywalker (Bespin)",
    character: "Luke Skywalker",
    franchise: "Star Wars",
    set_name: "Star Wars: A New Hope",
    number: "93",
    variant: "Metallic",
    exclusivity: "Walmart",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Luke Skywalker (Bespin) belongs to the Star Wars: A New Hope Pop! Star Wars line as #93. This catalog entry tracks the Metallic Walmart exclusive.",
    display_description: "Luke Skywalker (Bespin) belongs to the Star Wars: A New Hope Pop! Star Wars line as #93. This catalog entry tracks the Metallic Walmart exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698129084": {
    pop_name: "Muftak",
    character: "Muftak",
    franchise: "Star Wars",
    set_name: "Star Wars: A New Hope",
    number: "173",
    exclusivity: "Spring Convention",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Muftak belongs to the Star Wars: A New Hope Pop! Star Wars line as #173. This catalog entry tracks the Spring Convention exclusive.",
    display_description: "Muftak belongs to the Star Wars: A New Hope Pop! Star Wars line as #173. This catalog entry tracks the Spring Convention exclusive.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698390835": {
    pop_name: "Princess Leia (Gold Chrome)",
    character: "Princess Leia",
    franchise: "Star Wars",
    set_name: "Star Wars: A New Hope",
    number: "295",
    variant: "Gold Chrome",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Princess Leia (Gold Chrome) belongs to the Star Wars: A New Hope Pop! Star Wars line as #295.",
    display_description: "Princess Leia (Gold Chrome) belongs to the Star Wars: A New Hope Pop! Star Wars line as #295.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698475983": {
    pop_name: "Jawa",
    character: "Jawa",
    franchise: "Star Wars",
    set_name: "Star Wars: A New Hope",
    number: "371",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Jawa belongs to the Star Wars: A New Hope Pop! Star Wars line as #371.",
    display_description: "Jawa belongs to the Star Wars: A New Hope Pop! Star Wars line as #371.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "849803057091": {
    pop_name: "Princess Leia (Boushh)",
    character: "Princess Leia",
    franchise: "Star Wars",
    set_name: "Star Wars: Return of the Jedi",
    number: "50",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Princess Leia (Boushh) belongs to the Star Wars: Return of the Jedi Pop! Star Wars line as #50.",
    display_description: "Princess Leia (Boushh) belongs to the Star Wars: Return of the Jedi Pop! Star Wars line as #50.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
  "889698707480": {
    pop_name: "Princess Leia (Boushh)",
    character: "Princess Leia",
    franchise: "Star Wars",
    set_name: "Star Wars: Return of the Jedi 40th Anniversary",
    number: "606",
    variant: "Boushh",
    pop_type: "Pop! Star Wars",
    pop_style: "Standard",
    description: "Princess Leia (Boushh) belongs to the Star Wars: Return of the Jedi 40th Anniversary Pop! Star Wars line as #606.",
    display_description: "Princess Leia (Boushh) belongs to the Star Wars: Return of the Jedi 40th Anniversary Pop! Star Wars line as #606.",
    parse_confidence: 0.98,
    needs_review: false,
    warnings: [],
  },
});

Object.assign(
  CATALOG_OVERRIDES_BY_UPC,
  AVENGERS_REFRESH_REGRESSION_OVERRIDES,
  APPROVED_CATALOG_CLEANUP_OVERRIDES,
);

function applySingleCatalogOverride(parsed: ParsedFunko, override?: Partial<ParsedFunko> | null): ParsedFunko {
  if (!override) return parsed;

  const next: ParsedFunko = {
    ...parsed,
    ...override,
    warnings: override.warnings ?? parsed.warnings,
    parse_reason_codes: override.parse_reason_codes ?? override.warnings ?? parsed.parse_reason_codes,
    parse_confidence: Math.max(parsed.parse_confidence, override.parse_confidence ?? 0),
    needs_review: override.needs_review ?? parsed.needs_review,
  };

  next.display_description =
    override.display_description && !isWeakDisplayDescription(override.display_description)
      ? override.display_description
      : buildDisplayDescription(next);

  return next;
}

async function fetchLearnedCatalogOverride(supabase: any, barcode: string): Promise<Partial<ParsedFunko> | null> {
  const { data, error } = await supabase
    .from("catalog_parser_overrides")
    .select("override_data")
    .eq("upc", barcode)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.warn(`Parser override lookup failed for ${barcode}:`, error.message);
    return null;
  }

  return (data?.override_data ?? null) as Partial<ParsedFunko> | null;
}

type AppliedCatalogOverrides = {
  parsed: ParsedFunko;
  forcedFields: Partial<ParsedFunko> | null;
};

async function applyCatalogOverrides(
  supabase: any,
  parsed: ParsedFunko,
  barcode: string,
): Promise<AppliedCatalogOverrides> {
  const staticFields = CATALOG_OVERRIDES_BY_UPC[barcode] ?? null;
  const staticOverride = applyCatalogOverride(parsed, barcode);
  const learnedOverride = await fetchLearnedCatalogOverride(supabase, barcode);
  const learnedFields = learnedOverride ? {
    ...learnedOverride,
    parse_confidence: Math.max(Number(learnedOverride.parse_confidence ?? 0), 0.95),
    needs_review: learnedOverride.needs_review ?? false,
    parse_reason_codes: [],
    warnings: [],
  } : null;

  return {
    parsed: applySingleCatalogOverride(staticOverride, learnedFields),
    forcedFields: staticFields || learnedFields
      ? { ...(staticFields ?? {}), ...(learnedFields ?? {}) }
      : null,
  };
}

function shouldUpdate(
  existing: any,
  parsed: ParsedFunko,
  forcedFields?: Partial<ParsedFunko> | null,
): Record<string, unknown> {
  const updates: Record<string, unknown> = buildTrustedOverrideUpdate(forcedFields, parsed);

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
      shouldPromoteSpecificSet(existing.set_name, parsed.set_name) ||
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

  if ((!existing.release_date || existing.release_date === "") && parsed.release_date) {
    updates.release_date = parsed.release_date;
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
    "Monster",
    "Monster Energy",
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
    String(existing.pop_name).match(/^[!Â¡]/) ||
    String(existing.pop_name).match(/^Sayings\s*[-â€“â€”]/i) ||
    String(existing.pop_name).match(/\bNot Mint\b/i) ||
    String(existing.pop_name).match(/\bGifts\b/i) ||
    String(existing.pop_name).match(/\bGlow\b/i) ||
    String(existing.pop_name).match(/\bWith\b$/i) ||
    String(existing.pop_name).match(/^['â€™`s\s:]+/i) ||
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

  if (!Array.isArray(existing.parse_reason_codes) || existing.parse_reason_codes.length === 0 || parsed.parse_confidence >= Number(existing.parse_confidence ?? 0)) {
    updates.parse_reason_codes = parsed.parse_reason_codes ?? parsed.warnings;
  }

  if (existing.needs_review == null) {
    updates.needs_review = parsed.needs_review;
  } else if (parsed.needs_review && existing.needs_review !== true) {
    updates.needs_review = true;
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
  if (/\b(the big bang theory|leonard hofstadter|sheldon cooper|howard wolowitz|raj koothrappali)\b/.test(text)) {
    return "The Big Bang Theory";
  }
  if (
    /\b(sonic the hedgehog|justice league x sonic|jla\s*(?:&|and)\s*sonic|silver as the green lantern|sonic as the flash|shadow as batman|knuckles as superman|tails as cyborg|amy as wonder woman)\b/.test(text)
  ) {
    return "Sonic the Hedgehog";
  }
  if (/\b(target ad icons|pop ad icons|ad icons|bullseye as|target dog|target mascot)\b/.test(text)) return "Target";
  if (/\b(back to the future|marty mcfly|marty with glasses|marty 1955|marty with hoverboard|marty in puffy vest|marty checking watch|biff tannen|doc & einstein|doc and einstein|doc brown|dr emmett brown|emmett brown)\b/.test(text)) return "Back to the Future";
  if (/\b(jurassic park|jurassic world|jurassic world dominion|jurassic world rebirth|hatching raptor|atrociraptor|therizinosaurus|giganotosaurus|aquilops|ellie sattler|blue beta|velociraptor|t rex)\b/.test(text)) return "Jurassic Park";
  if (/\b(pop asia|asia collection|mindstyle|lucky cat)\b/.test(text)) return "Pop Asia";
  if (/\b(marvel|deadpool|adam warlock|daredevil|doctor strange|spider man|spiderman|captain america|fantastic four|thor|loki|hulk|x men|wolverine)\b/.test(text)) return "Marvel";
  if (/\b(dc|superman|batman|joker|harley quinn|aquaman|black adam|justice league|man of steel|suicide squad|doom patrol|smallville|creature commandos|doctor phosphorus|doctor phosphorous|gotham knights|arrow|titans|deathstroke|nightwing|starfire|beast boy|black canary|robotman|negative man|krypto|black lantern|red hood)\b/.test(text)) return "DC";
  if (/\b(star wars|mandalorian|grogu|obi wan|darth vader|n 1 starfighter|force ghost)\b/.test(text)) return "Star Wars";
  if (/\b(disney|pixar|ducktales|duck tales|oliver company|who framed roger rabbit|roger rabbit|lilo stitch|pinocchio|aladdin|coco|toy story|monsters inc|little mermaid|jungle book|emperor s new groove)\b/.test(text)) return "Disney";
  if (/\b(fantastic beasts|grindelwald|chupacabra|harry potter|wizarding world)\b/.test(text)) return "Wizarding World";
  if (/\b(g i joe|gi joe|cobra commander|snake eyes|storm shadow|zartan|baroness|serpentor|destro)\b/.test(text)) return "G.I. Joe";
  if (/\bstar trek\b/.test(text)) return "Star Trek";
  if (/\bparks (and|&) recreation\b|\bpawnee goddess(?:es)?\b/.test(text)) return "Parks and Recreation";
  if (/\bted lasso\b/.test(text)) return "Ted Lasso";
  if (/\barmy of darkness\b/.test(text)) return "Army of Darkness";
  if (/\bcocaine bear\b/.test(text)) return "Cocaine Bear";
  if (/\brobocop\b/.test(text)) return "RoboCop";
  if (/\bbullet train\b/.test(text)) return "Bullet Train";
  if (/\bjingle all the way\b/.test(text)) return "Jingle All the Way";
  if (/\bwallace and gromit\b/.test(text)) return "Wallace and Gromit";
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
  if (bracketValue === "collectible card" || bracketValue === "collector card" || haystack.includes("collectible card") || haystack.includes("collector card")) return "Collectible Card";
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
    .replace(/^(Con|Only\s+At)\.?\s*/i, " ")
    .replace(/^(SDCC|NYCC|ECCC|WonderCon|Fall|Spring|Summer|Winter)\s+(?:Convention)?\.?\s*/i, " ")
    .replace(/^San\s+Diego\s+Comic[- ]?Con\.?\s*/i, " ")
    .replace(/^Entertainment\s+Earth\.?\s*/i, " ")
    .replace(/^(BAM|Barnes\s+(?:&|And)\s+Noble|DC\s+Shop|Funko(?:n)?\s+London|Funko\s+Spring\s+Convention|Funko|Go!\s+Calendars|South\s+Park\s+Shop|Toy\s+Tokyo)\.?\s*/i, " ")
    .replace(/^EE\s+/i, " ")
    .replace(/\s*[.,]\s*(Australia|Canada|Funko|Flocked|GITD|Glow in the Dark|SDCC|NYCC|ECCC|Convention|Summer Convention Exclusive|Fall Convention Exclusive|First To Market D23|D23 First To Market)\b.*$/i, " ")
    .replace(/\s*[.,]\s*(Limited Edition|Special Edition|Summer Virtual FunKon|Glitter Version|Glows Dark|Glow in the Dark|Diamond Collection|REDcard|Target REDcard)\b.*$/i, " ")
    .replace(/\b(ATandT|AT&T|BAM|Barnes\s+(?:&|And)\s+Noble|Books-A-Million|DC Shop|FYE|Go!\s+Calendars|Hot Topic|Target|Walmart|Walgreens|GameStop|BoxLunch|Amazon|Funko Shop|South Park Shop|Specialty Series|Toy Tokyo)\s*(Exclusive)?\.?\s*/gi, " ")
    .replace(/\bOnly\s+At\b\.?/gi, " ")
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

  if (/\b(target ad icons|pop ad icons|ad icons|bullseye as|target dog|target mascot)\b/.test(combined)) return "Target";
  if (/\b(back to the future|marty mcfly|marty with glasses|marty 1955|marty with hoverboard|marty in puffy vest|marty checking watch|biff tannen|doc & einstein|doc and einstein|doc brown|dr emmett brown|emmett brown)\b/.test(combined)) return "Back to the Future";
  if (/\b(jurassic park|jurassic world|jurassic world dominion|jurassic world rebirth|hatching raptor|atrociraptor|therizinosaurus|giganotosaurus|aquilops|ellie sattler|blue beta|velociraptor|t rex)\b/.test(combined)) return "Jurassic Park";
  if (/\b(pop asia|asia collection|mindstyle|lucky cat)\b/.test(combined)) return "Pop Asia";
  const inferred = inferFranchiseFromKnownText(combined);
  if (inferred) return inferred;

  if (combined.includes("marvel")) return "Marvel";
  if (combined.includes("dc") || combined.includes("superman") || combined.includes("batman")) return "DC";
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

  parsed.pop_type = extractPopType(raw, String(raw?.["product-name"] ?? parsed.clean_title ?? ""), parsed.franchise, parsed.set_name);
  parsed.display_description = buildDisplayDescription(parsed);
  parsed.parse_confidence = Math.min(0.98, Math.max(parsed.parse_confidence, 0.82));
  parsed.needs_review = parsed.parse_confidence < 0.75;
  parsed.warnings = parsed.warnings.filter((warning) => {
    if (warning === "missing_number" && parsed.number) return false;
    if (warning === "missing_franchise" && parsed.franchise) return false;
    if (warning === "missing_character" && parsed.character) return false;
    if (warning === "missing_set" && parsed.set_name) return false;
    if (warning === "weak_name_cleanup" && parsed.pop_name) return false;
    return true;
  });
  parsed.needs_review = shouldFlagNeedsReview(parsed.parse_confidence, parsed.warnings);
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

function normalizeBarcodeForMatch(value: unknown): string {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length === 13 && digits.startsWith("0") ? digits.slice(1) : digits;
}

function hasMatchingPriceChartingUpc(raw: any, barcode: string): boolean {
  const expected = normalizeBarcodeForMatch(barcode);
  const received = normalizeBarcodeForMatch(raw?.upc);
  return Boolean(expected && received && expected === received);
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
  variantOverride?: string | null,
): Promise<PriceChartingValueLookup | null> {
  if (!token) return null;

  const queryParts = [
    parsed.pop_name,
    parsed.franchise,
    parsed.number ? `#${parsed.number}` : null,
    variantOverride && !/^common$/i.test(variantOverride) ? variantOverride : parsed.variant && parsed.variant !== "Common" ? parsed.variant : null,
    "Funko Pop",
  ].filter(Boolean);

  const requests: Array<{ url: string; requiresMatch: boolean }> = [{
    url: `https://www.pricecharting.com/api/product?t=${encodeURIComponent(token)}&upc=${encodeURIComponent(barcode)}`,
    requiresMatch: true,
  }];

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
      if (!hasMatchingPriceChartingUpc(raw, barcode)) continue;
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
    if (!hasMatchingPriceChartingUpc(raw, barcode)) return null;

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
    const requestBody = await req.json();
    const { barcode, forceRefresh = false } = requestBody;
    const hasExclusivityOverride = Object.prototype.hasOwnProperty.call(requestBody, "exclusivityOverride");
    const exclusivityOverride = hasExclusivityOverride
      ? normalizeWhitespace(String(requestBody.exclusivityOverride ?? "")).replace(/^None$/i, "") || null
      : undefined;
    const variantOverride = normalizeWhitespace(String(requestBody.variantOverride ?? "")).replace(/^Common$/i, "") || null;

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

    if (!requireLookupAccess(req)) {
      return new Response(
        JSON.stringify({ found: false, error: "Not authorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from("pop_catalog")
      .select("*")
      .eq("upc", cleanBarcode)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing && !forceRefresh) {
      const normalLookupVariantValue = variantOverride
        ? await fetchPriceChartingValue(priceChartingToken, cleanBarcode, existing as ParsedFunko, variantOverride)
        : null;
      const rawProduct = existing?.raw_api_json?.products?.[0];

      if (rawProduct) {
        const appliedOverrides = await applyCatalogOverrides(supabase, parseFunkoProduct(rawProduct), cleanBarcode);
        const parsed = appliedOverrides.parsed;
        const updates = shouldUpdate(existing, parsed, appliedOverrides.forcedFields);
        if (hasExclusivityOverride && (existing.exclusivity ?? null) !== exclusivityOverride) {
          updates.exclusivity = exclusivityOverride;
        }

        const imageBlocked = BLOCKED_IMAGE_UPCS.has(cleanBarcode);
        const rawImages = imageBlocked || existing.image_url ? [] : rawProduct.images ?? [];
        let remoteImageUrl = rawImages.length > 0 ? rawImages[0] : imageBlocked ? null : existing.image_url;

        if (imageBlocked && existing.image_url) {
          updates.image_url = null;
          updates.image_source = null;
          updates.image_last_checked = new Date().toISOString();
        }

        if (!remoteImageUrl && !imageBlocked) {
          const imageFallback = await fetchPrimaryProduct(
            goUpcApiKey,
            barcodeLookupApiKey,
            cleanBarcode,
          );
          remoteImageUrl = firstProductImage(imageFallback?.product);
        }

        if (remoteImageUrl && remoteImageUrl !== existing.image_url) {
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

        const existingMissingValue = existing.estimated_value == null || Number(existing.estimated_value) === 0;
        const stillMissingValue = updates.estimated_value == null || Number(updates.estimated_value) === 0;
        if (existingMissingValue && stillMissingValue && barcodeLookupApiKey) {
          const valueFallback = await fetchBarcodeLookupProduct(
            barcodeLookupApiKey,
            cleanBarcode,
          );

          if (valueFallback?.product) {
            const fallbackParsed = await applyCatalogOverrides(
              supabase,
              parseFunkoProduct(valueFallback.product),
              cleanBarcode,
            );

            if (fallbackParsed.parsed.estimated_value != null) {
              updates.estimated_value = fallbackParsed.parsed.estimated_value;
              updates.api_source = `${existing.api_source ?? "catalog"}+barcodelookup_value`;
              updates.api_last_updated = new Date().toISOString();
              updates.raw_api_json = {
                primary: existing.raw_api_json,
                value_fallback: valueFallback.raw,
              };
            }
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
              pop: normalLookupVariantValue
                ? { ...updated, estimated_value: normalLookupVariantValue.estimated_value }
                : updated,
              parse: {
                confidence: parsed.parse_confidence,
                needs_review: parsed.needs_review,
                warnings: parsed.warnings,
                updates,
                variant_value: normalLookupVariantValue
                  ? {
                    variant: variantOverride,
                    estimated_value: normalLookupVariantValue.estimated_value,
                    price_field: normalLookupVariantValue.price_field,
                  }
                  : null,
              },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      if (hasExclusivityOverride && (existing.exclusivity ?? null) !== exclusivityOverride) {
        const { data: updated, error: updateError } = await supabase
          .from("pop_catalog")
          .update({ exclusivity: exclusivityOverride })
          .eq("id", existing.id)
          .select("*")
          .single();

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({
            found: true,
            source: "catalog_updated",
            pop: normalLookupVariantValue
              ? { ...updated, estimated_value: normalLookupVariantValue.estimated_value }
              : updated,
            parse: {
              variant_value: normalLookupVariantValue
                ? {
                  variant: variantOverride,
                  estimated_value: normalLookupVariantValue.estimated_value,
                  price_field: normalLookupVariantValue.price_field,
                }
                : null,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          found: true,
          source: "catalog",
          pop: normalLookupVariantValue
            ? { ...existing, estimated_value: normalLookupVariantValue.estimated_value }
            : existing,
          parse: {
            variant_value: normalLookupVariantValue
              ? {
                variant: variantOverride,
                estimated_value: normalLookupVariantValue.estimated_value,
                price_field: normalLookupVariantValue.price_field,
              }
              : null,
          },
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
    const imageBlocked = BLOCKED_IMAGE_UPCS.has(cleanBarcode);
    let imageLookup: ExternalProductLookup | null = fetched;
    let remoteImageUrl = imageBlocked ? null : firstProductImage(product);
    let variantPriceChartingValue: PriceChartingValueLookup | null = null;

    if (!remoteImageUrl && apiSource === "pricecharting" && !imageBlocked) {
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

    let appliedOverrides = await applyCatalogOverrides(supabase, parseFunkoProduct(product), cleanBarcode);
    const parsed = appliedOverrides.parsed;

if (variantOverride) {
  variantPriceChartingValue = await fetchPriceChartingValue(
    priceChartingToken,
    cleanBarcode,
    parsed,
    variantOverride,
  );
}

let valueSource: string = fetched.source;
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
    const fallbackParsed = await applyCatalogOverrides(
      supabase,
      parseFunkoProduct(fallbackFetched.product),
      cleanBarcode,
    );

    if (fallbackParsed.parsed.estimated_value != null) {
      parsed.estimated_value = fallbackParsed.parsed.estimated_value;
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
  appliedOverrides = await applyCatalogOverrides(supabase, parsed, cleanBarcode);
  Object.assign(parsed, appliedOverrides.parsed);
  parsed.estimated_value = priceChartingValue.estimated_value;
  const staticOverride = getStaticCatalogOverride(cleanBarcode);
  if (typeof staticOverride?.estimated_value === "number") {
    parsed.estimated_value = staticOverride.estimated_value;
  }
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

const resolvedLookupValues = resolveLookupEstimatedValues(
  existing?.estimated_value,
  parsed.estimated_value,
  variantPriceChartingValue?.estimated_value,
);
const catalogEstimatedValue = resolvedLookupValues.catalogEstimatedValue;
parsed.franchise = canonicalizeFranchiseLabel(parsed.franchise);
parsed.set_name = canonicalizeSetLabel(parsed.set_name);
const resolvedSetTotal = getSetTotalOverride(parsed.set_name);

const newPop = {
  upc: cleanBarcode,
  pop_name: parsed.pop_name,
  character: parsed.character,
  franchise: parsed.franchise,
  number: parsed.number,
  variant: parsed.variant,
  exclusivity: hasExclusivityOverride ? exclusivityOverride : parsed.exclusivity,
  pop_type: parsed.pop_type,
  pop_style: parsed.pop_style,
  set_name: parsed.set_name,
  set_total: resolvedSetTotal,
  image_url: imageBlocked ? null : storedImageUrl ?? firstProductImage(priceChartingValue?.raw) ?? existing?.image_url ?? null,
  vault_status: parsed.vault_status,
  release_date: parsed.release_date,
  limited_edition: parsed.limited_edition,
  limited_count: parsed.limited_count,
  edition_notes: parsed.edition_notes,
  estimated_value: catalogEstimatedValue,
  description: parsed.description ?? existing?.description ?? null,
  display_description: parsed.display_description ?? existing?.display_description ?? null,
  api_source: valueSource,
  api_last_updated: new Date().toISOString(),
  raw_api_json: valueRaw,
  raw_title: parsed.raw_title,
  clean_title: parsed.clean_title,
  parse_confidence: parsed.parse_confidence,
  parse_reason_codes: parsed.parse_reason_codes ?? parsed.warnings,
  needs_review: parsed.needs_review,
};

    if (existing) {
      const resolvedRefreshEstimatedValue = catalogEstimatedValue ?? existing?.estimated_value ?? null;

      const refreshedPop = buildCatalogRefreshUpdate(existing, newPop, {
        forceRefresh,
        hasExclusivityOverride,
        exclusivityOverride,
        imageBlocked,
        resolvedRefreshEstimatedValue,
        forcedFields: appliedOverrides.forcedFields,
      });

      const { data: refreshed, error: refreshError } = await supabase
        .from("pop_catalog")
        .update(refreshedPop)
        .eq("id", existing.id)
        .select("*")
        .single();

      if (refreshError) throw refreshError;

      return new Response(
        JSON.stringify({
          found: true,
          source: "api_refreshed",
          pop: variantPriceChartingValue
            ? { ...refreshed, estimated_value: resolvedLookupValues.lookupEstimatedValue }
            : refreshed,
          parse: {
            confidence: parsed.parse_confidence,
            needs_review: parsed.needs_review,
            warnings: parsed.warnings,
            forceRefresh,
            variant_value: variantPriceChartingValue
              ? {
                variant: variantOverride,
                estimated_value: variantPriceChartingValue.estimated_value,
                price_field: variantPriceChartingValue.price_field,
              }
              : null,
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
        pop: variantPriceChartingValue
          ? { ...inserted, estimated_value: resolvedLookupValues.lookupEstimatedValue }
          : inserted,
        parse: {
          confidence: parsed.parse_confidence,
          needs_review: parsed.needs_review,
          warnings: parsed.warnings,
          variant_value: variantPriceChartingValue
            ? {
              variant: variantOverride,
              estimated_value: variantPriceChartingValue.estimated_value,
              price_field: variantPriceChartingValue.price_field,
            }
            : null,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        found: false,
        error: String(error instanceof Error ? error.message : error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
