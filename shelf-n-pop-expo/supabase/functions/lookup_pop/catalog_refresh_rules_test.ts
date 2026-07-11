import {
  BATMAN_1989_REFRESH_REGRESSION_OVERRIDES,
  BLOCKED_IMAGE_UPCS,
  buildCatalogCollisionKey,
  buildCatalogRefreshUpdate,
  buildTrustedOverrideUpdate,
  canonicalizeSetLabel,
  getSetTotalOverride,
  getExplicitProductClassification,
  GAME_OF_THRONES_60_REFRESH_REGRESSION_OVERRIDES,
  GAME_OF_THRONES_67_REFRESH_REGRESSION_OVERRIDES,
  getStaticCatalogOverride,
  HARRY_POTTER_175_REFRESH_REGRESSION_OVERRIDES,
  mergeNeedsReview,
  normalizeMultipackNumber,
  shouldPromoteSpecificSet,
  shouldWarnMissingNumber,
  STAR_WARS_REFRESH_REGRESSION_OVERRIDES,
} from "./catalog_refresh_rules.ts";

function assertEquals(actual: unknown, expected: unknown, message: string): void {
  if (Object.is(actual, expected)) return;
  throw new Error(`${message}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}

Deno.test("generic franchise set names promote to specific sets", () => {
  assertEquals(
    shouldPromoteSpecificSet("Star Wars", "Star Wars: Attack of the Clones"),
    true,
    "Star Wars should promote",
  );
  assertEquals(
    shouldPromoteSpecificSet("Star Wars: Attack of the Clones", "Star Wars"),
    false,
    "specific set should not be downgraded",
  );
});

Deno.test("needs_review remains sticky during refresh", () => {
  assertEquals(mergeNeedsReview(true, false), true, "existing review flag should survive");
  assertEquals(mergeNeedsReview(false, true), true, "new review flag should escalate");
  assertEquals(mergeNeedsReview(false, false), false, "clean rows should remain clean");
});

Deno.test("trusted overrides replace populated identity fields and clear stale warnings", () => {
  const updates = buildTrustedOverrideUpdate(
    {
      franchise: "Target",
      set_name: "Ad Icons",
      number: "249",
      pop_type: "Pop! Ad Icons",
      needs_review: false,
    },
    {
      franchise: "Target",
      set_name: "Ad Icons",
      number: "249",
      pop_type: "Pop! Ad Icons",
      parse_confidence: 0.98,
    },
  );

  assertEquals(updates.franchise, "Target", "trusted franchise should be authoritative");
  assertEquals(updates.set_name, "Ad Icons", "trusted set should be authoritative");
  assertEquals(updates.number, "249", "trusted number should be authoritative");
  assertEquals(updates.pop_type, "Pop! Ad Icons", "trusted Pop line should be authoritative");
  assertEquals(updates.needs_review, false, "resolved review flag should clear");
  assertEquals(JSON.stringify(updates.parse_reason_codes), "[]", "resolved warning codes should clear");
});

Deno.test("trusted overrides can explicitly clear a stale optional field", () => {
  const updates = buildTrustedOverrideUpdate(
    { variant: null },
    { variant: null, parse_confidence: 0.98 },
  );

  assertEquals(updates.variant, null, "explicit null should clear a stale variant");
});

Deno.test("explicit specialty product labels prevent Standard-style drift", () => {
  assertEquals(getExplicitProductClassification("POP Mug: IT- Pennywise 16 Oz")?.pop_style, "Mug", "mugs should be classified as mugs");
  assertEquals(getExplicitProductClassification("Funko Pop! Premium Spider-Man")?.pop_type, "Pop! Premium", "premium Pops should keep their product line");
  assertEquals(getExplicitProductClassification("Bitty POP! Arcade Wolverine")?.pop_style, "Bitty Pop Arcade", "Bitty Arcade should keep its specialty style");
  assertEquals(getExplicitProductClassification("POP! Moment: WWE Cena vs Rock")?.pop_style, "Moment", "Pop Moments should keep their specialty style");
});

Deno.test("specialty unnumbered products do not receive missing-number warnings", () => {
  assertEquals(shouldWarnMissingNumber(null, "Standard"), true, "standard Pops should still require a box number");
  assertEquals(shouldWarnMissingNumber(null, "Mug"), false, "mugs can be unnumbered");
  assertEquals(shouldWarnMissingNumber(null, "2-Pack"), false, "multipacks can be unnumbered");
  assertEquals(shouldWarnMissingNumber(null, "Moment"), false, "moments can be unnumbered");
  assertEquals(shouldWarnMissingNumber("573", "Standard"), false, "numbered standard Pops should remain clean");
});

Deno.test("multipacks do not inherit an unmarked single-box number", () => {
  assertEquals(
    normalizeMultipackNumber("337", "2-Pack", "Batman & The Joker 2-Pack 337"),
    null,
    "an unmarked trailing number should not become a multipack box number",
  );
  assertEquals(
    normalizeMultipackNumber("337", "2-Pack", "Batman & The Joker 2-Pack #337"),
    "337",
    "an explicitly marked box number should be preserved",
  );
  assertEquals(
    normalizeMultipackNumber("337", "Standard", "The Joker #337"),
    "337",
    "standard Pop numbers should be unchanged",
  );
});

Deno.test("Batman 1989 collision UPCs keep their reviewed identities and values", () => {
  const common = BATMAN_1989_REFRESH_REGRESSION_OVERRIDES["889698477093"];
  const metallic = BATMAN_1989_REFRESH_REGRESSION_OVERRIDES["889698495776"];
  const twoPack = BATMAN_1989_REFRESH_REGRESSION_OVERRIDES["889698584470"];

  assertEquals(common.variant, null, "chance-of-Chase UPC should keep a common catalog baseline");
  assertEquals(common.exclusivity, null, "chance-of-Chase UPC should not inherit GameStop exclusivity");
  assertEquals(common.estimated_value, 10, "common catalog baseline should remain pinned");
  assertEquals(metallic.pop_name, "The Joker (Batman 1989)", "metallic should not duplicate its variant in the name");
  assertEquals(metallic.exclusivity, "GameStop", "metallic release should keep GameStop exclusivity");
  assertEquals(metallic.estimated_value, 15.24, "metallic value should remain pinned");
  assertEquals(twoPack.number, null, "Batman and Joker 2-Pack should remain unnumbered");
  assertEquals(twoPack.pop_style, "2-Pack", "Batman and Joker should remain a 2-Pack");
  assertEquals(twoPack.estimated_value, 18.4, "2-Pack value should remain pinned");
});

Deno.test("Game of Thrones #67 keeps distinct Standard and Ride identities", () => {
  const bran = GAME_OF_THRONES_67_REFRESH_REGRESSION_OVERRIDES["889698346184"];
  const ride = GAME_OF_THRONES_67_REFRESH_REGRESSION_OVERRIDES["889698444484"];

  assertEquals(bran.variant, "Three-Eyed Raven", "Bran should keep the checklist variant");
  assertEquals(bran.release_date, "2018-10-01", "Bran should keep the reviewed release date");
  assertEquals(bran.estimated_value, 5.75, "Bran should keep the current common value");
  assertEquals(ride.pop_style, "Ride", "Jon Snow and Rhaegal should remain a Ride");
  assertEquals(ride.estimated_value, 44.5, "Jon Snow and Rhaegal should keep the current Ride value");
  assertEquals(
    buildCatalogCollisionKey(bran) === buildCatalogCollisionKey(ride),
    false,
    "different product lines should not share a collision key",
  );
});

Deno.test("Game of Thrones #60 keeps distinct Jumbo and glow Ride identities", () => {
  const giant = GAME_OF_THRONES_60_REFRESH_REGRESSION_OVERRIDES["889698285001"];
  const mountedGlow = GAME_OF_THRONES_60_REFRESH_REGRESSION_OVERRIDES["889698376693"];

  assertEquals(giant.pop_style, "Jumbo", "Giant Wight should remain the 6-inch Jumbo release");
  assertEquals(giant.exclusivity, "Emerald City Comic Con / FYE", "Giant Wight should retain the shared retailer");
  assertEquals(giant.estimated_value, 16.99, "Giant Wight should keep its reviewed value");
  assertEquals(mountedGlow.variant, "Glow in the Dark", "the Amazon Ride should keep its glow variant");
  assertEquals(mountedGlow.vault_status, "Vaulted", "the official Funko vault status should be preserved");
  assertEquals(mountedGlow.estimated_value, 29.99, "the glow Ride should keep its reviewed value");
  assertEquals(
    buildCatalogCollisionKey(giant) === buildCatalogCollisionKey(mountedGlow),
    false,
    "Jumbo and Ride releases should not share a collision key",
  );
});

Deno.test("Harry Potter #175 keeps distinct Standard and Movie Poster identities", () => {
  const gingerbread = HARRY_POTTER_175_REFRESH_REGRESSION_OVERRIDES["889698800181"];
  const poster = HARRY_POTTER_175_REFRESH_REGRESSION_OVERRIDES["889698816885"];

  assertEquals(gingerbread.variant, "Gingerbread", "Gingerbread Harry should keep its product variant");
  assertEquals(gingerbread.release_date, "2024-12-01", "Gingerbread Harry should keep its December release");
  assertEquals(gingerbread.estimated_value, 14, "Gingerbread Harry should keep its reviewed value");
  assertEquals(poster.pop_type, "Pop! Movie Posters", "Undesirable No. 1 should keep the official Funko subtype");
  assertEquals(poster.exclusivity, "Amazon", "Undesirable No. 1 should keep Amazon exclusivity");
  assertEquals(poster.estimated_value, 15.02, "Undesirable No. 1 should keep its reviewed value");
  assertEquals(
    buildCatalogCollisionKey(gingerbread) === buildCatalogCollisionKey(poster),
    false,
    "Standard and Movie Poster releases should not share a collision key",
  );
});

Deno.test("known set aliases normalize to one catalog label", () => {
  assertEquals(canonicalizeSetLabel("DC Superheroes"), "DC Super Heroes", "DC spacing alias");
  assertEquals(canonicalizeSetLabel("What If"), "What If...?", "What If punctuation alias");
  assertEquals(canonicalizeSetLabel("Shazam! Fury Of The Gods"), "Shazam! Fury of the Gods", "Shazam title case alias");
  assertEquals(canonicalizeSetLabel("Star Wars: Retro Series. Targer"), "Star Wars: Retro Series", "Retro typo alias");
  assertEquals(canonicalizeSetLabel("Nightmare Before Christmas"), "The Nightmare Before Christmas", "Nightmare article alias");
  assertEquals(canonicalizeSetLabel("A Distinct Verified Set"), "A Distinct Verified Set", "unknown labels should be preserved");
});

const expectedRefreshResults = {
  "889698818667": { value: 26.49, vault_status: "Active" },
  "889698918008": { value: 48.67, vault_status: "Active" },
  "889698585019": { value: 7.15, vault_status: "Vaulted" },
  "889698608527": { value: 7.93, vault_status: "Active" },
  "889698829878": { value: 62.7, vault_status: "Active" },
  "889698546485": { value: 12.36, vault_status: "Vaulted" },
  "889698160162": { value: 13.99, vault_status: "Vaulted" },
  "849803087159": { value: 19.3, vault_status: "Active" },
  "889698430180": { value: 13.87, vault_status: "Active" },
  "889698430203": { value: 21.17, vault_status: "Vaulted" },
};

Deno.test("Ben Kenobi image is not blocked", () => {
  assertEquals(BLOCKED_IMAGE_UPCS.has("889698160162"), false, "Ben Kenobi image should remain available");
  assertEquals(BLOCKED_IMAGE_UPCS.has("889698430210"), true, "remaining image block should stay active");
});

Deno.test("Doctor Strange comic cover pins audited value", () => {
  assertEquals(
    getStaticCatalogOverride("889698608527")?.estimated_value,
    7.93,
    "Doctor Strange #4 should keep the audited public PriceCharting value",
  );
});

Deno.test("Lucky Cat #190 keeps the confirmed silver metallic variant", () => {
  assertEquals(
    getStaticCatalogOverride("889698829878")?.variant,
    "Silver Metallic",
    "Lucky Cat #190 should keep the confirmed Silver Metallic variant",
  );
  assertEquals(
    getStaticCatalogOverride("889698829878")?.estimated_value,
    62.7,
    "Lucky Cat #190 should keep the higher silver metallic value",
  );
});

Deno.test("specific set total overrides fill known small buckets", () => {
  assertEquals(getSetTotalOverride("300"), 6, "300 should tolerate the shorter movie set label");
  assertEquals(getSetTotalOverride("300 Movie"), 6, "300 Movie should use the full 2023 movie release total");
  assertEquals(getSetTotalOverride("Animaniacs"), 8, "Animaniacs should use three original Pops, four 2025 character releases, and the Water Tower deluxe");
  assertEquals(getSetTotalOverride("Ant-Man and the Wasp: Quantumania"), 13, "Quantumania should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("Aquaman And The Lost Kingdom"), 13, "Aquaman and the Lost Kingdom should use the full checklist total");
  assertEquals(getSetTotalOverride("Arrow"), 13, "Arrow should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("Black Clover"), 35, "Black Clover should use the full checklist total");
  assertEquals(getSetTotalOverride("Black Lanterns"), 1, "Black Lanterns should use the one figure subline total");
  assertEquals(getSetTotalOverride("Black Panther"), 31, "Black Panther should use the full checklist total");
  assertEquals(getSetTotalOverride("Black Panther: Wakanda Forever"), 36, "Wakanda Forever should use the full checklist total");
  assertEquals(getSetTotalOverride("Birds of Prey"), 11, "Birds of Prey should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("Brandalised. Banksy"), 2, "Brandalised Banksy should use the two item art cover checklist total");
  assertEquals(getSetTotalOverride("Brave"), 1, "Brave should use the one figure checklist total");
  assertEquals(getSetTotalOverride("Bullet Train"), 4, "Bullet Train should use the full movie checklist total");
  assertEquals(getSetTotalOverride("Caddyshack"), 11, "Caddyshack should use the full Funko checklist total");
  assertEquals(getSetTotalOverride("Captain America: The First Avenger"), 3, "Captain America: The First Avenger should use the full First Avenger Pop checklist total");
  assertEquals(getSetTotalOverride("Captain Planet"), 9, "Captain Planet should use the full New Adventures of Captain Planet Pop checklist total");
  assertEquals(getSetTotalOverride("Cast Away"), 2, "Cast Away should use the two Chuck Noland releases");
  assertEquals(getSetTotalOverride("Cartoon Network"), 8, "Cartoon Network should use the Pop-only checklist total");
  assertEquals(getSetTotalOverride("Chilly Willy"), 4, "Chilly Willy should use the full Funko checklist total");
  assertEquals(getSetTotalOverride("Clerks III"), 6, "Clerks III should use the full six figure movie checklist total");
  assertEquals(getSetTotalOverride("Cocaine Bear"), 2, "Cocaine Bear should use the two figure movie checklist total");
  assertEquals(getSetTotalOverride("Coca-Cola"), 14, "Coca-Cola should use the full Pop Ad Icons checklist total");
  assertEquals(getSetTotalOverride("Coco"), 13, "Coco should use the full checklist total");
  assertEquals(getSetTotalOverride("Crash Bandicoot"), 13, "Crash Bandicoot should use the Pop vinyl checklist total");
  assertEquals(getSetTotalOverride("Cuphead"), 30, "Cuphead should use the full checklist total");
  assertEquals(getSetTotalOverride("Deadpool The Duck"), 1, "Deadpool The Duck should use the one figure subline total");
  assertEquals(getSetTotalOverride("Despicable Me 2"), 10, "Despicable Me 2 should use the full movie checklist total");
  assertEquals(getSetTotalOverride("Dexter"), 3, "Dexter should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("Disney 90th Anniversary"), 4, "Disney 90th Anniversary should use the four figure Donald Duck anniversary total");
  assertEquals(getSetTotalOverride("Disney Land : 65th Anniversary"), 20, "Disney Land punctuation variant should use the Disneyland Resort 65th Anniversary total");
  assertEquals(getSetTotalOverride("Disney Archives"), 8, "Disney Archives should use the Disney Archives Pop checklist total");
  assertEquals(getSetTotalOverride("Disturbed"), 1, "Disturbed should use the one figure checklist total");
  assertEquals(getSetTotalOverride("Dolly Parton"), 6, "Dolly Parton should use the full Funko checklist total");
  assertEquals(getSetTotalOverride("Duck Dodgers"), 12, "Duck Dodgers should use the Pop vinyl subset checklist total");
  assertEquals(getSetTotalOverride("Dumb And Dumber"), 14, "Dumb And Dumber title-case variant should use the full Funko checklist total");
  assertEquals(getSetTotalOverride("Dumb and Dumber"), 14, "Dumb and Dumber should use the full Funko checklist total");
  assertEquals(getSetTotalOverride("Dumbo"), 7, "Dumbo should use the full Disney checklist total");
  assertEquals(getSetTotalOverride("Disneyland Resort 65th Anniversary"), 20, "Disneyland Resort 65th Anniversary should use the full 65th Anniversary Pop checklist total");
  assertEquals(getSetTotalOverride("E.T. 40th Anniversary"), 10, "E.T. 40th Anniversary should use eight 2022 vinyl figures plus the Movie Moment and 3-pack");
  assertEquals(getSetTotalOverride("Echo"), 2, "Echo should use the two figure Marvel Studios release total");
  assertEquals(getSetTotalOverride("Elvis Presley"), 18, "Elvis Presley should use the full checklist total");
  assertEquals(getSetTotalOverride("Eternals"), 23, "Eternals should use the full Pop vinyl checklist total");
  assertEquals(getSetTotalOverride("Evil Dead 40th Anniversary"), 2, "Evil Dead 40th Anniversary should use the common plus chase total");
  assertEquals(getSetTotalOverride("Fantasia"), 12, "Fantasia should use the full Disney checklist total");
  assertEquals(getSetTotalOverride("Fantastik Plastik"), 73, "Fantastik Plastik should use the full Pop vinyl checklist total");
  assertEquals(getSetTotalOverride("Fantastic Beasts: The Crimes of Grindelwald"), 40, "Fantastic Beasts should use the full checklist total");
  assertEquals(getSetTotalOverride("Finding Dory"), 2, "Finding Dory should use the two figure Finding Dory Pop subset total");
  assertEquals(getSetTotalOverride("Fortnite"), 64, "Fortnite should use the Pop vinyl checklist total");
  assertEquals(getSetTotalOverride("Free Guy"), 1, "Free Guy should use the one figure checklist total");
  assertEquals(getSetTotalOverride("Frozen"), 26, "Frozen should use the Pop vinyl subset checklist total");
  assertEquals(getSetTotalOverride("G.I. Joe"), 25, "G.I. Joe should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("Get Out"), 3, "Get Out should use the three Chris Washington releases");
  assertEquals(getSetTotalOverride("Grey's Anatomy"), 4, "Grey's Anatomy should use the full television checklist total");
  assertEquals(getSetTotalOverride("Guardians of the Galaxy Holiday Special"), 5, "Guardians Holiday Special should use the five figure holiday release total");
  assertEquals(getSetTotalOverride("The Guardians of the Galaxy Holiday Special"), 5, "Guardians Holiday Special should tolerate the leading The alias");
  assertEquals(getSetTotalOverride("Gwen-Verse"), 4, "Gwen-Verse should use the four figure lineup total");
  assertEquals(getSetTotalOverride("Hall of Armor"), 4, "Hall of Armor should use the four deluxe armor release total");
  assertEquals(getSetTotalOverride("Hellboy"), 16, "Hellboy should use the full checklist total");
  assertEquals(getSetTotalOverride("Hercules"), 8, "Hercules should use the full Disney checklist total");
  assertEquals(getSetTotalOverride("Hobbs And Shaw"), 4, "Hobbs And Shaw should use the full movie checklist total");
  assertEquals(getSetTotalOverride("House"), 1, "House should use the one figure checklist total");
  assertEquals(getSetTotalOverride("I Am Groot"), 26, "I Am Groot should use the full checklist total");
  assertEquals(getSetTotalOverride("Indiana Jones"), 28, "Indiana Jones should use the full checklist total");
  assertEquals(getSetTotalOverride("Indiana Jones and the Last Crusade"), 3, "Indiana Jones Last Crusade should use the scoped movie release total");
  assertEquals(getSetTotalOverride("Ironheart"), 2, "Ironheart should use the two figure Marvel Studios checklist total");
  assertEquals(getSetTotalOverride("Infinity Warps"), 15, "Infinity Warps should use the full Infinity Warps Pop checklist total");
  assertEquals(getSetTotalOverride("It's A Small World"), 6, "It's A Small World should use the Pop vinyl subset checklist total");
  assertEquals(getSetTotalOverride("Jingle All the Way"), 5, "Jingle All the Way should use the full movie checklist total");
  assertEquals(getSetTotalOverride("Jungle Cruise"), 1, "Jungle Cruise should use the one figure checklist total");
  assertEquals(getSetTotalOverride("Jurassic Park: 25th Anniversary"), 7, "Jurassic Park 25th Anniversary should use the numbered 545-551 wave total");
  assertEquals(getSetTotalOverride("Jessica Jones"), 2, "Jessica Jones should use the two figure checklist total");
  assertEquals(getSetTotalOverride("Krypto The Superdog"), 1, "Krypto The Superdog should use the one figure Specialty Series release total");
  assertEquals(getSetTotalOverride("Married With Children"), 6, "Married With Children should use the full television checklist total");
  assertEquals(getSetTotalOverride("Make A Wish"), 9, "Make A Wish should use the full Pops With Purpose assortment total");
  assertEquals(getSetTotalOverride("Make-A-Wish"), 9, "Make-A-Wish hyphen variant should use the full Pops With Purpose assortment total");
  assertEquals(getSetTotalOverride("Mark Hamill"), 2, "Mark Hamill should use the two DesignerCon Pop checklist total");
  assertEquals(getSetTotalOverride("Marvel Street Art"), 7, "Marvel Street Art should use the full Street Art Collection total");
  assertEquals(getSetTotalOverride("Marvel Zombies"), 34, "Marvel Zombies should use the full checklist total");
  assertEquals(getSetTotalOverride("Mike Tyson"), 1, "Mike Tyson should use the one figure checklist total");
  assertEquals(getSetTotalOverride("Monster At Work"), 2, "Monster At Work should use the two figure Monsters at Work subset total");
  assertEquals(getSetTotalOverride("Monsters, Inc"), 18, "Monsters Inc should use the full checklist total");
  assertEquals(getSetTotalOverride("Monsters, Inc."), 18, "Monsters Inc punctuation variant should use the full checklist total");
  assertEquals(getSetTotalOverride("Nacho Libre"), 2, "Nacho Libre should use the common plus chase total");
  assertEquals(getSetTotalOverride("Nope"), 1, "Nope should use the single OJ Haywood Pop release total");
  assertEquals(getSetTotalOverride("Onward"), 7, "Onward should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("Pinky and the Brain"), 1, "Pinky and the Brain should use the one 2-pack catalog item total");
  assertEquals(getSetTotalOverride("Poltergeist II: The Other Side"), 1, "Poltergeist II should use the one figure checklist total");
  assertEquals(getSetTotalOverride("Post Malone"), 3, "Post Malone should use the three figure Pop Rocks checklist total");
  assertEquals(getSetTotalOverride("Pirates Of The Caribbean Dead Men Tell No Tales"), 5, "Pirates Dead Men Tell No Tales should use the movie subset total");
  assertEquals(getSetTotalOverride("Psych"), 1, "Psych should use the one 2-pack catalog item total");
  assertEquals(getSetTotalOverride("Ren And Stimpy"), 8, "Ren And Stimpy should use the Pop entries and exclude Dorbz");
  assertEquals(getSetTotalOverride("Robocop"), 5, "Robocop should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("Rocky: 45th Anniversary"), 4, "Rocky 45th Anniversary should use the four figure anniversary lineup");
  assertEquals(getSetTotalOverride("Runaways"), 6, "Runaways should use the full Marvel Runaways checklist total");
  assertEquals(getSetTotalOverride("RUN-DMC"), 10, "RUN-DMC should use the full checklist total");
  assertEquals(getSetTotalOverride("Saturday Night Live"), 9, "Saturday Night Live should use the six single releases plus three multipack releases");
  assertEquals(getSetTotalOverride("Justice League Comics"), 7, "Justice League Comics should use the 461-467 subset total");
  assertEquals(getSetTotalOverride("Sherlock"), 6, "Sherlock should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("She-Hulk: Attorney at Law"), 10, "She-Hulk should use the full She-Hulk Pop checklist total");
  assertEquals(getSetTotalOverride("Preacher"), 6, "Preacher should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("Shazam!"), 7, "Shazam should use the full 2019 Pop checklist total");
  assertEquals(getSetTotalOverride("Sleepy Hollow (1999)"), 5, "Sleepy Hollow should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("Sleeping Beauty 65th Anniversary"), 10, "Sleeping Beauty 65th Anniversary should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("Split"), 2, "Split should use the Beast and Hedwig Pop vinyl checklist total");
  assertEquals(getSetTotalOverride("Spider-Man 2"), 10, "Spider-Man 2 should use the full game Pop checklist total");
  assertEquals(getSetTotalOverride("Spider-Man: Far From Home"), 15, "Far From Home should use the full movie Pop checklist total");
  assertEquals(getSetTotalOverride("Spider-Man: Into The Spider-Verse"), 11, "Into The Spider-Verse should use the full movie Pop checklist total");
  assertEquals(getSetTotalOverride("Spider-Man: Maximum Venom"), 9, "Maximum Venom should use the full subseries checklist total");
  assertEquals(getSetTotalOverride("Spider-Man: Miles Morales"), 16, "Miles Morales should use the full Pop vinyl checklist total");
  assertEquals(getSetTotalOverride("Spellbound"), 1, "Spellbound should use the one Pop and Buddy release total");
  assertEquals(getSetTotalOverride("Spyro Reignited Trilogy (2018)"), 5, "Spyro Reignited Trilogy should use four standard releases plus the 10-inch Spyro release");
  assertEquals(getSetTotalOverride("Stargate SG-1"), 7, "Stargate SG-1 should use the full Stargate Pop checklist total");
  assertEquals(getSetTotalOverride("Star Trek II: The Wrath of Khan"), 2, "Wrath of Khan should use the two exclusive Pop releases");
  assertEquals(getSetTotalOverride("Star Trek The Next Generation"), 5, "Star Trek The Next Generation should use the five digital Pop release total");
  assertEquals(getSetTotalOverride("Star Trek Transporter"), 3, "Star Trek Transporter should use the three glitter transporter Pop Plus releases");
  assertEquals(getSetTotalOverride("Suits (2011)"), 2, "Suits should use the Louis Litt single and Harvey Specter and Michael Ross 2-pack total");
  assertEquals(getSetTotalOverride("Ted 2"), 3, "Ted 2 should use Ted with remote, flocked Ted with remote, and Ted with beer bottle");
  assertEquals(getSetTotalOverride("Ted Lasso"), 23, "Ted Lasso should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("The Adventures Of Jimmy Neutron Boy Genius"), 4, "Jimmy Neutron should use the four Pop vinyl release total");
  assertEquals(getSetTotalOverride("The Batman"), 15, "The Batman should use the full subseries checklist total");
  assertEquals(getSetTotalOverride("The Exorcist: Believer"), 2, "The Exorcist Believer should use the Angela and Katherine release total");
  assertEquals(getSetTotalOverride("The Flash (TV Series)"), 21, "The Flash TV series should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("The Godfather Part II"), 4, "The Godfather Part II should use the four figure Part II release total");
  assertEquals(getSetTotalOverride("The Godfather: 50 Years"), 3, "The Godfather 50 Years should use the three figure anniversary total");
  assertEquals(getSetTotalOverride("The Good Dinosaur (2015)"), 2, "The Good Dinosaur should use the Spot and Arlo release total");
  assertEquals(getSetTotalOverride("The Incredibles 20th Anniversary"), 6, "The Incredibles 20th Anniversary should use four numbered Pops plus two chase variants");
  assertEquals(getSetTotalOverride("The Jungle Book"), 6, "The Jungle Book should use the five vinyl/deluxe entries plus the Baloo and Mowgli Pop Moment");
  assertEquals(getSetTotalOverride("The Tick"), 2, "The Tick should use the standard and glow-in-the-dark release total");
  assertEquals(getSetTotalOverride("Tombstone"), 6, "Tombstone should use the six figure Pop Movies checklist total");
  assertEquals(getSetTotalOverride("Trigun"), 13, "Trigun should use the Pop vinyl checklist total excluding the Pocket Keychain");
  assertEquals(getSetTotalOverride("Us"), 7, "Us should use the full Pop Movies checklist including chase and later Red release");
  assertEquals(getSetTotalOverride("Wallace & Gromit: Vengeance Most Fowl"), 4, "Vengeance Most Fowl should tolerate the ampersand set alias");
  assertEquals(getSetTotalOverride("Wallace And Gromit: Vengeance Most Fowl"), 4, "Vengeance Most Fowl should use the four figure wave total");
  assertEquals(getSetTotalOverride("Who Framed Roger Rabbit"), 1, "Who Framed Roger Rabbit should use the one Roger Rabbit Pop release total");
  assertEquals(getSetTotalOverride("Wondla"), 3, "Wondla should use the three figure Pop checklist total");
  assertEquals(getSetTotalOverride("Wolverine 50th Anniversary"), 4, "Wolverine 50th Anniversary should use the four figure 1371-1374 release total");
  assertEquals(getSetTotalOverride(" Shazam! Fury of the Gods "), 10, "Shazam Fury of the Gods should normalize spacing");
  assertEquals(getSetTotalOverride("Shazam! Fury Of The Gods"), 10, "Shazam Fury of the Gods should tolerate title-case Of");
  assertEquals(getSetTotalOverride("DC Super Heroes"), null, "broad buckets should not receive guessed totals");
});

for (const [upc, override] of Object.entries(STAR_WARS_REFRESH_REGRESSION_OVERRIDES)) {
  Deno.test(`${upc} keeps its corrected identity during forced refresh`, () => {
    const expected = expectedRefreshResults[upc as keyof typeof expectedRefreshResults];
    const existing = {
      pop_name: "Legacy API title",
      character: "Legacy character",
      franchise: "Star Wars",
      number: null,
      variant: null,
      exclusivity: null,
      pop_type: "Pop! Star Wars",
      pop_style: "Standard",
      set_name: "Star Wars",
      set_total: null,
      vault_status: "Active",
      limited_edition: false,
      limited_count: null,
      edition_notes: null,
      estimated_value: expected.value,
      description: null,
      display_description: null,
      api_source: "legacy",
      raw_api_json: null,
      image_url: "https://example.invalid/pop.png",
      release_date: null,
      raw_title: null,
      clean_title: null,
      parse_confidence: 0.75,
      parse_reason_codes: [],
      needs_review: false,
    };
    const newPop = {
      ...override,
      api_source: "catalog_override",
      api_last_updated: "2026-07-10T00:00:00.000Z",
      raw_api_json: { products: [] },
      parse_reason_codes: [],
    };

    const refreshed = buildCatalogRefreshUpdate(existing, newPop, {
      forceRefresh: true,
      hasExclusivityOverride: false,
      imageBlocked: false,
      resolvedRefreshEstimatedValue: expected.value,
    });
    const overrideRecord = override as Record<string, unknown>;

    for (const field of ["pop_name", "character", "franchise", "number", "variant", "exclusivity", "pop_type", "pop_style", "set_name"] as const) {
      assertEquals(refreshed[field] ?? null, overrideRecord[field] ?? null, `${upc} ${field}`);
    }
    assertEquals(refreshed.vault_status, expected.vault_status, `${upc} vault_status`);
    assertEquals(refreshed.estimated_value, expected.value, `${upc} estimated_value`);
    assertEquals(refreshed.needs_review, false, `${upc} needs_review`);
    assertEquals(refreshed.parse_confidence, 0.98, `${upc} parse_confidence`);
  });
}

Deno.test("forced refresh preserves an existing review flag", () => {
  const refreshed = buildCatalogRefreshUpdate(
    { needs_review: true, parse_confidence: 0.9 },
    { needs_review: false, parse_confidence: 0.98 },
    {
      forceRefresh: true,
      hasExclusivityOverride: false,
      imageBlocked: false,
      resolvedRefreshEstimatedValue: null,
    },
  );

  assertEquals(refreshed.needs_review, true, "forced refresh should not clear review");
});
