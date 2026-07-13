import {
  AVENGERS_REFRESH_REGRESSION_OVERRIDES,
  BATMAN_1989_REFRESH_REGRESSION_OVERRIDES,
  BLOCKED_IMAGE_UPCS,
  buildCatalogCollisionKey,
  buildCatalogRefreshUpdate,
  buildTrustedOverrideUpdate,
  CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES,
  canonicalizeFranchiseLabel,
  canonicalizeSetLabel,
  getSetTotalOverride,
  getExplicitProductClassification,
  GAME_OF_THRONES_60_REFRESH_REGRESSION_OVERRIDES,
  GAME_OF_THRONES_67_REFRESH_REGRESSION_OVERRIDES,
  getStaticCatalogOverride,
  HARRY_POTTER_175_REFRESH_REGRESSION_OVERRIDES,
  mergeNeedsReview,
  MIXED_CATALOG_CLEANUP_REFRESH_REGRESSION_OVERRIDES,
  NIGHTMARE_BEFORE_CHRISTMAS_REFRESH_REGRESSION_OVERRIDES,
  normalizeMultipackNumber,
  POKEMON_REFRESH_REGRESSION_OVERRIDES,
  PIXAR_UP_HOUSE_OF_THE_DRAGON_REFRESH_REGRESSION_OVERRIDES,
  RECENT_SCAN_DATA_QUALITY_OVERRIDES,
  SET_LABEL_AND_NO_SET_REFRESH_REGRESSION_OVERRIDES,
  shouldFlagNeedsReview,
  shouldPromoteSpecificSet,
  shouldWarnMissingNumber,
  STAR_WARS_REFRESH_REGRESSION_OVERRIDES,
  SUPERMAN_REFRESH_REGRESSION_OVERRIDES,
  VENOM_REFRESH_REGRESSION_OVERRIDES,
  WHAT_IF_REFRESH_REGRESSION_OVERRIDES,
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

Deno.test("multiple parse warnings require review even at the confidence floor", () => {
  assertEquals(
    shouldFlagNeedsReview(0.7, ["missing_franchise", "missing_set", "missing_number", "estimated_value_missing"]),
    true,
    "many warnings should be reviewable even when confidence is clamped to 0.70",
  );
  assertEquals(shouldFlagNeedsReview(0.85, ["missing_set", "estimated_value_missing"]), false, "two routine warnings should not force review");
  assertEquals(shouldFlagNeedsReview(0.69, []), true, "low confidence should still force review");
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
  assertEquals(getExplicitProductClassification("Marvel Avengers Hulkbuster Super-Sized 6 inch")?.pop_style, "Jumbo", "Marvel super-sized Pops should be classified as Jumbo");
  assertEquals(getExplicitProductClassification("Generic Super-Sized 6 inch")?.pop_style ?? null, null, "non-Marvel super-sized text should not force a Marvel classification");
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

Deno.test("Pokemon labels normalize messy source text", () => {
  assertEquals(canonicalizeFranchiseLabel("PokÃ©mon"), "Pokémon", "mojibake Pokemon should normalize to the display franchise");
  assertEquals(canonicalizeFranchiseLabel("Pokemon"), "Pokémon", "unaccented Pokemon should normalize to the display franchise");
  assertEquals(canonicalizeSetLabel("Pokemon, Pokémon, Premium"), "Pokemon", "premium detail should not become part of the set label");
  assertEquals(canonicalizeSetLabel("Pokemon. Spring Convention"), "Pokemon", "convention detail should not become part of the set label");
});

Deno.test("Pokemon cleanup UPCs keep reviewed identity fields", () => {
  const premiumPikachu = POKEMON_REFRESH_REGRESSION_OVERRIDES["889698916622"];
  const springBulbasaur = POKEMON_REFRESH_REGRESSION_OVERRIDES["889698459204"];
  const pearlescentEevee = POKEMON_REFRESH_REGRESSION_OVERRIDES["889698765350"];
  const pearlescentLapras = POKEMON_REFRESH_REGRESSION_OVERRIDES["889698622653"];
  const softColorPikachu = POKEMON_REFRESH_REGRESSION_OVERRIDES["889698878760"];

  assertEquals(premiumPikachu.pop_type, "Pop! Premium", "Pikachu #1127 should keep Pop! Premium product type");
  assertEquals(premiumPikachu.set_name, "Pokemon", "Pikachu #1127 should not keep a combined premium set label");
  assertEquals(springBulbasaur.exclusivity, "Spring Convention", "Bulbasaur #453 should keep convention exclusivity");
  assertEquals(springBulbasaur.variant, "Flocked", "Bulbasaur #453 should keep Flocked variant");
  assertEquals(pearlescentEevee.variant, "Pearlescent", "Eevee #577 should keep Pearlescent variant");
  assertEquals(pearlescentEevee.exclusivity, "Pokemon Center", "Eevee #577 should keep Pokemon Center exclusivity");
  assertEquals(pearlescentLapras.pop_name, "Lapras", "Lapras #864 should not include the franchise in the name");
  assertEquals(pearlescentLapras.variant, "Pearlescent", "Lapras #864 should keep Pearlescent variant");
  assertEquals(softColorPikachu.variant, "Soft Color", "Pikachu #353 should not keep generic Other variant");
  assertEquals(softColorPikachu.exclusivity, "Pokemon Center", "Pikachu #353 Soft Color should keep Pokemon Center exclusivity");
});

Deno.test("recent scan cleanup UPCs keep reviewed identity, image, and value fields", () => {
  const hulk = RECENT_SCAN_DATA_QUALITY_OVERRIDES["830395022758"];
  const dusk = RECENT_SCAN_DATA_QUALITY_OVERRIDES["889698622820"];
  const bagMan = RECENT_SCAN_DATA_QUALITY_OVERRIDES["889698429764"];
  const captainUniverse = RECENT_SCAN_DATA_QUALITY_OVERRIDES["889698470643"];
  const scarletWitch = RECENT_SCAN_DATA_QUALITY_OVERRIDES["889698922081"];
  const grootAsLoki = RECENT_SCAN_DATA_QUALITY_OVERRIDES["889698795173"];

  assertEquals(hulk.pop_name, "The Hulk", "Hulk #8 should keep the reviewed name");
  assertEquals(hulk.image_url, "https://storage.googleapis.com/images.pricecharting.com/d72s6boepnwncb3i/1600.jpg", "Hulk #8 should not inherit a Deadpool image");
  assertEquals(dusk.set_name, "Marvel: Year of the Spider", "Dusk #1109 should not use The Suicide Squad set");
  assertEquals(dusk.exclusivity, "Amazon", "Dusk #1109 should keep Amazon exclusivity");
  assertEquals(bagMan.pop_name, "Spider-Man (Bombastic Bag-Man)", "Bombastic Bag-Man #522 should keep the full reviewed name");
  assertEquals(bagMan.exclusivity, "Walgreens", "Bombastic Bag-Man #522 should keep Walgreens exclusivity");
  assertEquals(bagMan.image_url, "https://storage.googleapis.com/images.pricecharting.com/x3vy7rexkq3t6nxl/1600.jpg", "Bombastic Bag-Man #522 should not use a Spider-Man goggles image");
  assertEquals(captainUniverse.pop_name, "Spider-Man (Captain Universe)", "Captain Universe #614 should not truncate to Spider-Man Captain");
  assertEquals(captainUniverse.exclusivity, "Entertainment Earth", "Captain Universe #614 should keep Entertainment Earth exclusivity");
  assertEquals(scarletWitch.pop_name, "Scarlet Witch (Sketched Deco)", "Scarlet Witch #1575 should keep Sketched Deco identity");
  assertEquals(scarletWitch.estimated_value, 24.99, "Scarlet Witch #1575 should not remain value-missing");
  assertEquals(grootAsLoki.pop_name, "Groot as Loki", "Groot as Loki #1394 should not truncate to Groot As");
  assertEquals(grootAsLoki.set_name, "We Are Groot", "Groot as Loki #1394 should not use Loki as the set");
});

Deno.test("Venom cleanup UPCs keep reviewed identity fields", () => {
  const venomComicCover = VENOM_REFRESH_REGRESSION_OVERRIDES["889698637435"];
  const venomizedCap = VENOM_REFRESH_REGRESSION_OVERRIDES["889698326865"];
  const venomizedLoki = VENOM_REFRESH_REGRESSION_OVERRIDES["889698326889"];
  const ghostRider = VENOM_REFRESH_REGRESSION_OVERRIDES["889698326896"];
  const ironheart = VENOM_REFRESH_REGRESSION_OVERRIDES["889698556446"];
  const poisonCap = VENOM_REFRESH_REGRESSION_OVERRIDES["889698562768"];
  const venomGlow = VENOM_REFRESH_REGRESSION_OVERRIDES["889698682473"];
  const venomOoze = VENOM_REFRESH_REGRESSION_OVERRIDES["8969884452"];

  assertEquals(venomComicCover.set_name, "Marvel Comics", "Venom #10 should not keep the underscored Marvel Comics set");
  assertEquals(venomComicCover.pop_type, "Pop! Comic Covers", "Venom #10 should keep Comic Cover product type");
  assertEquals(venomComicCover.exclusivity, "PX Previews", "Venom #10 should keep PX Previews exclusivity");
  assertEquals(venomizedCap.pop_name, "Venomized Captain America", "Venomized Captain America should not collapse to Venomized");
  assertEquals(venomizedCap.set_name, "Venom", "Venomized Captain America should not use Captain America as the set");
  assertEquals(venomizedLoki.pop_name, "Venomized Loki", "Venomized Loki should not collapse to Venomized");
  assertEquals(venomizedLoki.exclusivity, "Target", "Venomized Loki #368 should keep Target exclusivity");
  assertEquals(ghostRider.variant, "Blue", "blue Venomized Ghost Rider should not be upgraded to Glow in the Dark");
  assertEquals(ghostRider.pop_type, "Pop! Rides", "Venomized Ghost Rider should keep the Ride product line");
  assertEquals(ironheart.variant, "Glow in the Dark", "Venomized Ironheart #842 should keep Glow in the Dark");
  assertEquals(ironheart.exclusivity, "Pop In A Box", "Venomized Ironheart #842 should keep Pop In A Box");
  assertEquals(poisonCap.character, "Poison Captain America", "Poison Captain America should not be reduced to Captain America");
  assertEquals(poisonCap.exclusivity, "Pop In A Box", "Poison Captain America #856 should keep Pop In A Box");
  assertEquals(venomGlow.exclusivity, "Funko Shop", "Venom #1141 should use Funko Shop exclusivity");
  assertEquals(venomOoze.character, "Venom", "Venom with Ooze character should not include variant text");
});

Deno.test("Venom batch 2 UPCs keep reviewed character and exclusivity fields", () => {
  const ironMan = VENOM_REFRESH_REGRESSION_OVERRIDES["889698326872"];
  const agentAntiVenom = VENOM_REFRESH_REGRESSION_OVERRIDES["889698412391"];
  const captainMarvel = VENOM_REFRESH_REGRESSION_OVERRIDES["889698464567"];
  const invisibleGirlCommon = VENOM_REFRESH_REGRESSION_OVERRIDES["889698510684"];
  const invisibleGirlChase = VENOM_REFRESH_REGRESSION_OVERRIDES["889698510691"];
  const wingedVenom = VENOM_REFRESH_REGRESSION_OVERRIDES["889698537896"];
  const doctorStrange = VENOM_REFRESH_REGRESSION_OVERRIDES["889698537926"];
  const jackOLantern = VENOM_REFRESH_REGRESSION_OVERRIDES["889698581851"];
  const poisonSpiderMan = VENOM_REFRESH_REGRESSION_OVERRIDES["889698607094"];
  const groot = VENOM_REFRESH_REGRESSION_OVERRIDES["889698821285"];

  assertEquals(ironMan.character, "Venomized Iron Man", "Venomized Iron Man should not reduce character to Iron Man");
  assertEquals(agentAntiVenom.pop_name, "Agent Anti-Venom", "Agent Venom #507 chase should keep Agent Anti-Venom identity");
  assertEquals(agentAntiVenom.exclusivity, "Pop In A Box", "Agent Anti-Venom #507 should keep Pop In A Box exclusivity");
  assertEquals(captainMarvel.character, "Venomized Captain Marvel", "Venomized Captain Marvel should not reduce character to Captain Marvel");
  assertEquals(invisibleGirlCommon.variant, null, "common Venomized Invisible Girl should not inherit translucent chase variant");
  assertEquals(invisibleGirlCommon.exclusivity, "GameStop", "Venomized Invisible Girl common should keep GameStop exclusivity");
  assertEquals(invisibleGirlChase.variant, "Translucent Chase", "Venomized Invisible Girl chase should keep Translucent Chase");
  assertEquals(invisibleGirlChase.exclusivity, "GameStop", "Venomized Invisible Girl chase should keep GameStop exclusivity");
  assertEquals(wingedVenom.variant, "Glow in the Dark Chase", "Winged Venom #749 should keep GITD Chase variant");
  assertEquals(wingedVenom.exclusivity, "Pop In A Box", "Winged Venom #749 should keep Pop In A Box exclusivity");
  assertEquals(doctorStrange.character, "Venomized Doctor Strange", "Venomized Doctor Strange should not reduce character to Doctor Strange");
  assertEquals(doctorStrange.exclusivity, "BoxLunch", "Venomized Doctor Strange #750 should keep BoxLunch exclusivity");
  assertEquals(jackOLantern.character, "Venomized Jack O' Lantern", "Venomized Jack O' Lantern should not reduce character to Jack O' Lantern");
  assertEquals(poisonSpiderMan.variant, "Glow in the Dark Chase", "Poison Spider-Man #966 should keep GITD Chase");
  assertEquals(groot.pop_name, "We Are Groot as Venom", "Groot as Venom #1415 should keep reviewed checklist name");
  assertEquals(groot.exclusivity, "Marvel Collector Corps", "Groot as Venom #1415 should keep Marvel Collector Corps exclusivity");
});

Deno.test("mixed cleanup UPCs keep reviewed identities", () => {
  const cluelessCher = MIXED_CATALOG_CLEANUP_REFRESH_REGRESSION_OVERRIDES["889698836081"];
  const cluelessDionne = MIXED_CATALOG_CLEANUP_REFRESH_REGRESSION_OVERRIDES["889698836098"];
  const cluelessTai = MIXED_CATALOG_CLEANUP_REFRESH_REGRESSION_OVERRIDES["889698836104"];
  const cluelessSaying = MIXED_CATALOG_CLEANUP_REFRESH_REGRESSION_OVERRIDES["889698838733"];
  const daredevilBlackSuit = MIXED_CATALOG_CLEANUP_REFRESH_REGRESSION_OVERRIDES["889698918497"];
  const punisher = MIXED_CATALOG_CLEANUP_REFRESH_REGRESSION_OVERRIDES["889698758635"];
  const daredevilBattleDamaged = MIXED_CATALOG_CLEANUP_REFRESH_REGRESSION_OVERRIDES["889698918503"];
  const daredevilUnmasked = MIXED_CATALOG_CLEANUP_REFRESH_REGRESSION_OVERRIDES["889698872492"];
  const countChocula = MIXED_CATALOG_CLEANUP_REFRESH_REGRESSION_OVERRIDES["889698438001"];
  const frankenBerry = MIXED_CATALOG_CLEANUP_REFRESH_REGRESSION_OVERRIDES["889698439626"];
  const bullseyeSuperman = MIXED_CATALOG_CLEANUP_REFRESH_REGRESSION_OVERRIDES["889698871877"];

  assertEquals(cluelessCher.number, "1807", "30th Anniversary Cher should keep #1807");
  assertEquals(cluelessDionne.number, "1808", "30th Anniversary Dionne should keep #1808");
  assertEquals(cluelessTai.number, "1809", "30th Anniversary Tai should keep #1809");
  assertEquals(cluelessSaying.pop_type, "Pop! Sayings", "Cher As If should keep Pop! Sayings product type");
  assertEquals(cluelessSaying.variant, "As If", "Cher #1810 should keep As If variant");
  assertEquals(daredevilBlackSuit.number, "1578", "black suit Daredevil should not stay #1");
  assertEquals(daredevilBlackSuit.variant, "Black Suit", "black suit Daredevil should keep Black Suit variant");
  assertEquals(punisher.number, "1545", "Punisher should not stay #3");
  assertEquals(daredevilBattleDamaged.pop_name, "Daredevil (Battle Damaged)", "battle damaged Daredevil should use reviewed name");
  assertEquals(daredevilBattleDamaged.variant, "Battle Damaged", "battle damaged Daredevil should keep variant");
  assertEquals(daredevilUnmasked.pop_type, "Pop! Marvel", "Daredevil Unmasked should use Pop! Marvel consistently");
  assertEquals(countChocula.franchise, "General Mills", "Count Chocula should not use Target as franchise");
  assertEquals(countChocula.pop_style, "Jumbo", "Count Chocula #60 should keep Jumbo style");
  assertEquals(frankenBerry.pop_name, "Franken Berry", "Franken Berry should use spaced checklist name");
  assertEquals(frankenBerry.pop_type, "Pop! Ad Icons", "Franken Berry should use Pop! Ad Icons");
  assertEquals(bullseyeSuperman.set_name, "Ad Icons", "Bullseye as Superman should stay in Ad Icons");
  assertEquals(bullseyeSuperman.exclusivity, "Target", "Bullseye as Superman should keep Target exclusivity");
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
  assertEquals(canonicalizeSetLabel("Avengers Age Of Ultron"), "Avengers: Age of Ultron", "Age of Ultron casing and punctuation alias");
  assertEquals(canonicalizeSetLabel("Star Wars: Retro Series. Targer"), "Star Wars: Retro Series", "Retro typo alias");
  assertEquals(canonicalizeSetLabel("Nightmare Before Christmas"), "The Nightmare Before Christmas", "Nightmare article alias");
  assertEquals(canonicalizeSetLabel("A Distinct Verified Set"), "A Distinct Verified Set", "unknown labels should be preserved");
});

const expectedRefreshResults = {
  "889698312608": { value: 10, vault_status: "Active" },
  "889698558198": { value: 14.23, vault_status: "Active" },
  "889698881289": { value: 16.99, vault_status: "Active" },
  "889698398916": { value: 7.49, vault_status: "Active" },
  "889698398909": { value: 4.11, vault_status: "Active" },
  "889698430913": { value: 5.75, vault_status: "Active" },
  "889698398800": { value: 6.5, vault_status: "Active" },
  "889698472418": { value: 8.74, vault_status: "Active" },
  "889698398794": { value: 10.08, vault_status: "Active" },
  "889698399036": { value: 5.74, vault_status: "Active" },
  "889698472456": { value: 10, vault_status: "Active" },
  "889698439954": { value: 5.5, vault_status: "Active" },
  "889698514804": { value: 12.11, vault_status: "Active" },
  "889698514828": { value: 11.44, vault_status: "Active" },
  "889698317993": { value: 14.92, vault_status: "Active" },
  "889698317948": { value: 20.02, vault_status: "Active" },
  "889698317955": { value: 10.07, vault_status: "Active" },
  "889698520232": { value: 7.25, vault_status: "Active" },
  "889698520256": { value: 10.9, vault_status: "Active" },
  "889698520263": { value: 4.55, vault_status: "Active" },
  "889698523523": { value: 5.69, vault_status: "Active" },
  "889698523547": { value: 10.35, vault_status: "Active" },
  "889698567909": { value: 9.48, vault_status: "Active" },
  "889698603362": { value: 10.08, vault_status: "Active" },
  "889698917803": { value: 14.99, vault_status: "Active" },
  "889698743280": { value: 17, vault_status: "Active" },
  "889698740869": { value: 18.75, vault_status: "Active" },
  "889698721752": { value: 9.99, vault_status: "Active" },
  "889698721776": { value: 14.95, vault_status: "Active" },
  "889698721783": { value: 12.85, vault_status: "Active" },
  "889698746113": { value: 10.45, vault_status: "Active" },
  "889698743990": { value: 129.95, vault_status: "Active" },
  "889698765404": { value: 8.25, vault_status: "Active" },
  "889698765442": { value: 10.67, vault_status: "Active" },
  "889698816663": { value: 49.99, vault_status: "Active" },
  "889698846028": { value: 10.4, vault_status: "Active" },
  "889698509640": { value: 191.58, vault_status: "Active" },
  "889698431118": { value: 52.74, vault_status: "Active" },
  "889698460927": { value: 20, vault_status: "Active" },
  "889698526968": { value: 12.99, vault_status: "Active" },
  "889698606547": { value: 10.95, vault_status: "Active" },
  "889698460941": { value: 15.49, vault_status: "Active" },
  "889698582858": { value: 9.45, vault_status: "Active" },
  "889698937900": { value: 15.67, vault_status: "Active" },
  "889698487399": { value: 8.13, vault_status: "Active" },
  "889698608176": { value: 3.36, vault_status: "Active" },
  "889698545228": { value: 9.53, vault_status: "Active" },
  "889698768283": { value: 5.64, vault_status: "Active" },
  "889698509619": { value: 15.49, vault_status: "Active" },
  "830395023243": { value: 733.61, vault_status: "Active" },
  "889698554831": { value: 6.82, vault_status: "Active" },
  "849803065744": { value: 10.49, vault_status: "Active" },
  "849803087166": { value: 14.05, vault_status: "Active" },
  "889698161688": { value: 18.39, vault_status: "Active" },
  "849803060442": { value: 13.89, vault_status: "Active" },
  "849803093471": { value: 13.89, vault_status: "Active" },
  "889698101059": { value: 8.89, vault_status: "Active" },
  "889698430180": { value: 13.87, vault_status: "Active" },
  "849803101008": { value: 10.5, vault_status: "Active" },
  "889698216463": { value: 14.48, vault_status: "Active" },
  "889698467681": { value: 12.12, vault_status: "Active" },
  "889698561051": { value: 10.44, vault_status: "Active" },
  "889698149570": { value: 10.88, vault_status: "Active" },
  "849803055400": { value: 13.29, vault_status: "Active" },
  "849803055295": { value: 181.3, vault_status: "Active" },
  "849803057091": { value: 7.93, vault_status: "Active" },
  "889698375276": { value: 6.66, vault_status: "Active" },
  "889698375917": { value: 8.56, vault_status: "Active" },
  "889698375894": { value: 9.98, vault_status: "Active" },
  "889698514835": { value: 12.97, vault_status: "Active" },
  "889698641210": { value: 20.02, vault_status: "Active" },
  "889698797559": { value: 13.22, vault_status: "Active" },
  "889698797566": { value: 10.34, vault_status: "Active" },
  "889698797573": { value: 10.99, vault_status: "Active" },
  "889698797580": { value: 10.86, vault_status: "Active" },
  "889698797597": { value: 9.97, vault_status: "Active" },
  "889698448086": { value: 24.41, vault_status: "Active" },
  "889698632775": { value: 19.22, vault_status: "Vaulted" },
  "889698632782": { value: 17.48, vault_status: "Vaulted" },
  "849803096267": { value: 6.8, vault_status: "Active" },
  "889698455282": { value: 13.45, vault_status: "Active" },
  "889698104654": { value: 24.58, vault_status: "Active" },
  "889698641241": { value: 6.15, vault_status: "Active" },
  "889698269759": { value: 8.59, vault_status: "Active" },
  "889698270304": { value: 8.02, vault_status: "Active" },
  "830395023908": { value: 12.39, vault_status: "Vaulted" },
  "889698760218": { value: 7.19, vault_status: "Active" },
  "889698147989": { value: 17.95, vault_status: "Active" },
  "889698376662": { value: 12.5, vault_status: "Active" },
  "889698406772": { value: 10, vault_status: "Active" },
  "889698407021": { value: 10, vault_status: "Active" },
  "889698760188": { value: 15.68, vault_status: "Active" },
  "889698650960": { value: 7.76, vault_status: "Vaulted" },
  "889698675864": { value: 9.58, vault_status: "Active" },
  "889698653336": { value: 8.23, vault_status: "Vaulted" },
  "889698871853": { value: 14.99, vault_status: "Active" },
  "889698201544": { value: 10.37, vault_status: "Vaulted" },
  "889698398862": { value: 5, vault_status: "Active" },
  "889698903264": { value: 14.99, vault_status: "Active" },
  "889698767347": { value: 4.99, vault_status: "Active" },
  "889698483285": { value: 10.53, vault_status: "Active" },
  "889698819459": { value: 10.27, vault_status: "Active" },
  "889698880879": { value: 33.76, vault_status: "Active" },
  "889698675345": { value: 15, vault_status: "Active" },
  "889698851954": { value: 29.33, vault_status: "Active" },
  "889698716123": { value: 28.46, vault_status: "Active" },
  "889698851923": { value: 25, vault_status: "Active" },
  "889698643368": { value: 6.54, vault_status: "Active" },
  "889698851893": { value: 19.37, vault_status: "Active" },
  "889698556248": { value: 23.49, vault_status: "Active" },
  "889698776011": { value: 31.9, vault_status: "Active" },
  "889698316811": { value: 32.93, vault_status: "Active" },
  "889698888158": { value: 14.99, vault_status: "Active" },
  "889698908238": { value: 14.99, vault_status: "Active" },
  "889698664851": { value: 16.98, vault_status: "Active" },
  "889698285452": { value: 9.09, vault_status: "Active" },
  "889698299640": { value: 10.87, vault_status: "Active" },
  "889698317887": { value: 10.87, vault_status: "Active" },
  "889698317894": { value: 8.45, vault_status: "Active" },
  "830395023007": { value: 15, vault_status: "Vaulted" },
  "889698239677": { value: 14.25, vault_status: "Active" },
  "889698835954": { value: 12, vault_status: "Active" },
  "849803057794": { value: 2.57, vault_status: "Vaulted" },
  "849803087173": { value: 14.08, vault_status: "Active" },
  "889698430166": { value: 7.26, vault_status: "Active" },
  "889698129084": { value: 14.04, vault_status: "Vaulted" },
  "889698430173": { value: 10.29, vault_status: "Active" },
  "889698390835": { value: 10.29, vault_status: "Active" },
  "889698475983": { value: 9.2, vault_status: "Active" },
  "889698641258": { value: 10, vault_status: "Active" },
  "889698675376": { value: 6.15, vault_status: "Active" },
  "889698675369": { value: 11.92, vault_status: "Active" },
  "889698864527": { value: 11.13, vault_status: "Active" },
  "830395023878": { value: 14.94, vault_status: "Vaulted" },
  "889698739078": { value: 10.54, vault_status: "Active" },
  "889698739085": { value: 12.35, vault_status: "Active" },
  "889698613484": { value: 14.97, vault_status: "Active" },
  "889698613507": { value: 7.38, vault_status: "Active" },
  "889698613491": { value: 7.38, vault_status: "Active" },
  "889698613521": { value: 13.01, vault_status: "Active" },
  "889698632935": { value: 10.5, vault_status: "Active" },
  "889698632942": { value: 11.41, vault_status: "Active" },
  "889698632966": { value: 8, vault_status: "Active" },
  "889698818667": { value: 26.49, vault_status: "Active" },
  "889698918008": { value: 48.67, vault_status: "Active" },
  "889698585019": { value: 7.15, vault_status: "Vaulted" },
  "889698608527": { value: 7.93, vault_status: "Active" },
  "889698829878": { value: 62.7, vault_status: "Active" },
  "889698546485": { value: 12.36, vault_status: "Vaulted" },
  "889698160162": { value: 13.99, vault_status: "Vaulted" },
  "849803087159": { value: 19.3, vault_status: "Active" },
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

Deno.test("recent scan data-quality UPCs keep reviewed English identities", () => {
  const timmy = RECENT_SCAN_DATA_QUALITY_OVERRIDES["889698835190"];
  const wonderWoman = RECENT_SCAN_DATA_QUALITY_OVERRIDES["889698585033"];

  assertEquals(timmy.pop_name, "Timmy Turner", "Timmy should not retain the localized source franchise in the name");
  assertEquals(timmy.franchise, "The Fairly OddParents", "Timmy should normalize the Spanish franchise label");
  assertEquals(timmy.number, "1690", "Timmy should keep the trailing box number");
  assertEquals(timmy.needs_review, false, "Timmy override is reviewed");

  assertEquals(wonderWoman.pop_name, "Bombshell Wonder Woman", "Wonder Woman should keep the character identity");
  assertEquals(wonderWoman.set_name, "DC Comics Bombshells", "Wonder Woman should keep the Bombshells set");
  assertEquals(wonderWoman.number, "167", "Wonder Woman should keep the verified box number");
  assertEquals(wonderWoman.description.includes("Another line of collectible figures"), false, "generic upstream text should not be pinned");
});

Deno.test("Star Wars broad-set cleanup UPCs keep specific identities", () => {
  const cadBane = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698312608"];
  const bobaFettRetro = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698558198"];
  const lothCat = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698881289"];
  const poe = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698398916"];
  const knightBlasterChrome = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698472418"];
  const knightWarClub = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698398794"];
  const reyYellow = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698514828"];
  const yodaCloneWars = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698317993"];
  const anakinCloneWars = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698317948"];
  const ahsoka272 = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698317955"];
  const ahsoka409 = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698520232"];
  const darthMaul410 = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698520256"];
  const boKatan = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698520263"];
  const ahsoka414 = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698523523"];
  const superCommando = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698523547"];
  const darthMaul450 = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698567909"];
  const jarJar = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698603362"];
  const cadBaneImpressions = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698917803"];
  const dookuAnakin = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698743280"];
  const maulGarSaxon = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698740869"];
  const ahsokaGreyHood = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698721752"];
  const marrok = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698721776"];
  const huyang = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698721783"];
  const sabine = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698746113"];
  const ahsokaCw20 = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698743990"];
  const morgan = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698765404"];
  const baylan = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698765442"];
  const thrawnDiamond = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698816663"];
  const ezraDisguise = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698846028"];
  const mandoD23 = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698509640"];
  const mandoPistol = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698431118"];
  const mandoHelmetChrome = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698460927"];
  const mandoRedChrome = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698526968"];
  const mandoHologramGlow = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698606547"];
  const caraFye = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698460941"];
  const ahsokaMandalorian = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698582858"];
  const groguSnack = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698937900"];
  const moffGlow = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698487399"];
  const bobaRedChrome = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698608176"];
  const cobbChase = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698545228"];
  const boKatanShield = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698768283"];
  const caraCommon = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698509619"];
  const chewbaccaFlocked = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["830395023243"];
  const hothLukePin = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698554831"];
  const atAtDriver = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["849803065744"];
  const bespinLuke = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["849803087166"];
  const zuckussCommon = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["849803060442"];
  const zuckussToyWars = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["849803093471"];
  const dagobahYoda = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698101059"];
  const goldYoda = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698430180"];
  const darthVaderBespin = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["849803101008"];
  const wedgeRide = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698216463"];
  const lukeYoda = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698467681"];
  const dengarDeluxe = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698561051"];
  const cloudCityPack = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698149570"];
  const spiritYoda = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["849803055400"];
  const unmaskedVader = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["849803055295"];
  const leiaBoushh = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["849803057091"];
  const electrocutedVader = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698375276"];
  const rotjPalpatine289 = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698375917"];
  const babyNippet = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698375894"];
  const rotjPalpatine433 = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698514835"];
  const landoFalcon = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698641210"];
  const acolyteOsha = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698797559"];
  const acolyteQimir = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698797566"];
  const acolyteYord = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698797573"];
  const acolyteSol = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698797580"];
  const acolyteBazil = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698797597"];
  const artBoba = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698448086"];
  const artMustafar = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698632775"];
  const artHoth = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698632782"];
  const forceHan = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["849803096267"];
  const futuraC3po = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698455282"];
  const chromeDeathTrooper = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698104654"];
  const squadLeaderScarif = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698641241"];
  const soloChewbaccaFlocked = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698269759"];
  const soloFightingDroids = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698270304"];
  const phantomMaul = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["830395023908"];
  const phantomWatto = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698760218"];
  const phantomYoungAnakin = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698147989"];
  const phantomGoldMaul = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698430203"];
  const obiWanArtSeries = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698650960"];
  const nedB = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698675864"];
  const cassianAndor = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698653336"];
  const imperialRangeTrooper = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698871853"];
  const kyloTieFighter = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698201544"];
  const riseBb8 = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698398862"];
  const retroDooku = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698903264"];
  const skeletonWim = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698767347"];
  const hanCarbonite = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698483285"];
  const maceWindu172 = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698127493"];
  const shadowStormtrooper = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698496308"];
  const darthMalak = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698496285"];
  const nightbrother = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698560962"];
  const idenVersio = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698560986"];
  const hk47 = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698819459"];
  const supremeGrievous = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698880879"];
  const newClassicsVader = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698675345"];
  const deletedScenesLuke = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698851954"];
  const diamondVader = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698716123"];
  const dieCastYoda = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698851923"];
  const snowmanVader = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698643368"];
  const impressionsKylo = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698851893"];
  const forceGhostPack = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698556248"];
  const quiGonMaul = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698776011"];
  const darkSideAnakin = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698316811"];
  const rebuildVader = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698845304"];
  const echoBaseWampa = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698475266"];
  const echoBaseHan = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698497565"];
  const echoBaseProbeDroid = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698466820"];
  const firstOrderKylo = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698888158"];
  const rottaGlow = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698908238"];
  const lifeDayChewbacca = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698664851"];
  const holdo = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698285452"];
  const redStormtrooper = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698239677"];
  const nalanCheel = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["849803057794"];
  const ceremonyLuke = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["849803087173"];
  const goldLuke = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698430166"];
  const muftak = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698129084"];
  const leiaGold = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698390835"];
  const jawaClassic = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698475983"];
  const conventionLuke = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698641258"];
  const binarySunsetLuke = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698675369"];
  const deletedScenesSandtrooper = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698864527"];
  const c3poFacet = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["830395023878"];
  const fixerGaming = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698739078"];
  const battalionTrooper = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698739085"];
  const visionsRoninB5 = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698613484"];
  const visionsAm = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698613507"];
  const visionsKarre = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698613491"];
  const visionsRonin = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698613521"];
  const redSaberSidious = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698632935"];
  const redSaberMaul = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698632942"];
  const redSaberTyranus = STAR_WARS_REFRESH_REGRESSION_OVERRIDES["889698632966"];

  assertEquals(cadBane.set_name, "Star Wars: The Clone Wars", "Cad Bane #262 should not remain in broad Star Wars");
  assertEquals(cadBane.variant, null, "Cad Bane #262 should keep convention text out of variant");
  assertEquals(cadBane.exclusivity, "Summer Convention / Hot Topic", "Cad Bane #262 should keep shared convention exclusivity");
  assertEquals(cadBane.estimated_value, 10, "Cad Bane #262 should keep the refreshed market value");

  assertEquals(bobaFettRetro.set_name, "Star Wars: Retro Series", "Boba Fett #297 should move out of broad Star Wars");
  assertEquals(bobaFettRetro.variant, "Retro", "Boba Fett #297 should keep Retro variant");
  assertEquals(bobaFettRetro.exclusivity, "BAIT", "Boba Fett #297 should keep BAIT exclusivity");

  assertEquals(lothCat.set_name, "Ahsoka", "Loth Cat #799 should link to the reviewed Ahsoka set");
  assertEquals(lothCat.pop_name, "Loth Cat (Diamond Collection)", "Loth Cat #799 should keep Diamond Collection detail");
  assertEquals(lothCat.variant, "Diamond Collection", "Loth Cat #799 should keep Diamond variant");
  assertEquals(lothCat.exclusivity, "Fall Convention", "Loth Cat #799 should keep Fall Convention exclusivity");

  assertEquals(poe.set_name, "Star Wars: The Rise of Skywalker", "Rise of Skywalker should keep lowercase of");
  assertEquals(knightBlasterChrome.pop_name, "Knight of Ren (Blaster Rifle) (Hematite Chrome)", "Knight #331 should keep weapon and chrome detail");
  assertEquals(knightBlasterChrome.variant, "Hematite Chrome", "Knight #331 should keep Hematite Chrome as variant");
  assertEquals(knightWarClub.pop_name, "Knight of Ren (War Club)", "Knight #332 should keep War Club in the name");
  assertEquals(knightWarClub.variant, null, "common Knight #332 should not duplicate War Club as variant");
  assertEquals(reyYellow.pop_name, "Rey (Yellow Lightsaber)", "Rey #432 should keep Yellow Lightsaber detail");
  assertEquals(reyYellow.variant, null, "Rey #432 should not duplicate Yellow Lightsaber as variant");

  assertEquals(darthMaul410.set_name, "Star Wars: The Clone Wars", "Darth Maul #410 should not remain in short The Clone Wars");
  assertEquals(yodaCloneWars.number, "269", "Yoda should keep the Clone Wars checklist box number");
  assertEquals(anakinCloneWars.number, "271", "Anakin should keep the Clone Wars checklist box number");
  assertEquals(ahsoka272.pop_name, "Ahsoka", "Ahsoka #272 should not keep the box number in the display name");
  assertEquals(ahsoka272.exclusivity, "Hot Topic", "Ahsoka #272 should keep Hot Topic exclusivity");
  assertEquals(ahsoka409.pop_name, "Ahsoka Tano", "Ahsoka Tano #409 should stay distinct from Ahsoka #414");
  assertEquals(darthMaul410.number, "410", "common Darth Maul should stay #410");
  assertEquals(boKatan.number, "412", "Bo-Katan Kryze should keep the Clone Wars checklist box number");
  assertEquals(ahsoka414.pop_type, "Pop! Star Wars", "Ahsoka #414 should not drift into Pop! Games");
  assertEquals(superCommando.pop_name, "Mandalorian (Super Commando)", "Mandalorian #415 should keep Super Commando detail");
  assertEquals(superCommando.exclusivity, "Funko Shop", "Mandalorian #415 should keep Funko Shop exclusivity");
  assertEquals(darthMaul450.number, "450", "Darth Maul with Darksaber should not collide with common #410");
  assertEquals(darthMaul450.variant, "Darksaber", "Darth Maul #450 should keep Darksaber variant");
  assertEquals(jarJar.exclusivity, "GameStop", "Jar Jar Binks #500 should keep GameStop exclusivity");
  assertEquals(cadBaneImpressions.set_name, "Star Wars: Impressions", "Cad Bane #816 should not collide with Clone Wars #262");
  assertEquals(cadBaneImpressions.number, "816", "Cad Bane Impressions should keep its verified box number");
  assertEquals(cadBaneImpressions.exclusivity, "Target Con / Target", "Cad Bane Impressions should keep Target Con / Target exclusivity");
  assertEquals(dookuAnakin.pop_style, "2-Pack", "Count Dooku vs. Anakin should remain a 2-Pack");
  assertEquals(maulGarSaxon.variant, "Glow in the Dark", "Darth Maul and Gar Saxon should keep the glow variant");
  assertEquals(maulGarSaxon.exclusivity, "Target Con", "Darth Maul and Gar Saxon should keep Target Con exclusivity");
  assertEquals(ahsokaGreyHood.pop_name, "Ahsoka Tano (Grey Hood)", "Ahsoka #650 should not lose the Ahsoka name");
  assertEquals(ahsokaGreyHood.variant, "Grey Hood", "Ahsoka #650 should keep Grey Hood detail");
  assertEquals(marrok.number, "651", "Marrok should keep the Ahsoka checklist number");
  assertEquals(huyang.number, "652", "Professor Huyang should keep the Ahsoka checklist number");
  assertEquals(sabine.number, "655", "Sabine Wren should keep the Ahsoka checklist number");
  assertEquals(ahsokaCw20.pop_name, "Ahsoka Tano (CW20)", "Ahsoka #658 should not be shortened to Tano CW20");
  assertEquals(ahsokaCw20.exclusivity, "Target", "Ahsoka #658 should keep Target exclusivity");
  assertEquals(morgan.number, "684", "Morgan Elsbeth should keep the Ahsoka checklist number");
  assertEquals(baylan.number, "688", "Baylan Skoll should keep the Ahsoka checklist number");
  assertEquals(thrawnDiamond.variant, "Diamond Glitter", "Thrawn #697 should keep Diamond Glitter detail");
  assertEquals(thrawnDiamond.limited_count, 3000, "Thrawn #697 should keep the SDCC limited count");
  assertEquals(ezraDisguise.pop_name, "Ezra Bridger (In Disguise)", "Target Ezra #753 should not collide with Ezra #752");
  assertEquals(ezraDisguise.exclusivity, "Target", "Target Ezra #753 should keep Target exclusivity");
  assertEquals(mandoD23.estimated_value, 191.58, "D23 First to Market Mandalorian #326 should keep the corrected value");
  assertEquals(mandoPistol.variant, "Pistol", "Fall Convention Mandalorian #330 should keep Pistol detail");
  assertEquals(mandoHelmetChrome.variant, "Helmet Chrome", "Mandalorian #345 Helmet Chrome should stay distinct from red and hologram variants");
  assertEquals(mandoRedChrome.variant, "Red Chrome", "Mandalorian #345 Target Con UPC should keep Red Chrome detail");
  assertEquals(mandoRedChrome.exclusivity, "Target Con / Target", "Mandalorian #345 Red Chrome should keep shared Target exclusivity");
  assertEquals(mandoHologramGlow.variant, "Glow in the Dark; Hologram", "Mandalorian #345 Entertainment Earth UPC should keep hologram glow detail");
  assertEquals(caraFye.pop_name, "Cara Dune (Blasters)", "Cara Dune #403 FYE should keep Blasters in the name");
  assertEquals(ahsokaMandalorian.character, "Ahsoka Tano", "Mandalorian Ahsoka #467 should use the full character name");
  assertEquals(groguSnack.pop_name, "Grogu with Snack (Flocked)", "Grogu #825 should keep snack and flocked detail");
  assertEquals(moffGlow.variant, "Glow in the Dark", "Moff Gideon #380 should link to the glow checklist slot");
  assertEquals(bobaRedChrome.exclusivity, "Target Con / Target", "Boba Fett #462 Red Chrome should normalize Target Con exclusivity");
  assertEquals(cobbChase.variant, "Chase", "Cobb Vanth #484 should stay distinct from the common checklist slot");
  assertEquals(boKatanShield.pop_name, "Bo-Katan Kryze (with Shield and Darksaber)", "Bo-Katan #693 should keep Shield and Darksaber detail");
  assertEquals(caraCommon.variant, null, "common Cara Dune #403 should not inherit the FYE Blasters variant");
  assertEquals(chewbaccaFlocked.variant, "Flocked", "Chewbacca #06 should keep the rare flocked identity");
  assertEquals(hothLukePin.pop_name, "Luke Skywalker (Hoth) (with Pin)", "Hoth Luke #34 should keep the pin detail");
  assertEquals(atAtDriver.exclusivity, "Walgreens", "AT-AT Driver #92 should keep Walgreens exclusivity");
  assertEquals(bespinLuke.variant, null, "Bespin Encounter Luke #94 should keep convention in exclusivity, not variant");
  assertEquals(zuckussCommon.exclusivity, null, "common Zuckuss #122 should not inherit Toy Wars exclusivity");
  assertEquals(zuckussToyWars.exclusivity, "Toy Wars", "Toy Wars Zuckuss #122 should remain distinct from common");
  assertEquals(dagobahYoda.pop_name, "Dagobah Yoda", "common Dagobah Yoda #124 should remain distinct from gold metallic");
  assertEquals(goldYoda.pop_name, "Yoda (Gold Metallic)", "Walmart Yoda #124 should keep gold metallic detail");
  assertEquals(darthVaderBespin.pop_name, "Darth Vader (Bespin)", "Darth Vader #158 should keep Bespin detail in parentheses");
  assertEquals(wedgeRide.pop_style, "Ride", "Wedge Antilles #219 should remain a Ride");
  assertEquals(lukeYoda.pop_name, "Luke Skywalker & Yoda", "Training Luke #363 should normalize to Luke Skywalker & Yoda");
  assertEquals(dengarDeluxe.pop_type, "Pop! Deluxe", "Dengar #440 should keep Bounty Hunters Deluxe classification");
  assertEquals(cloudCityPack.pop_style, "3-Pack", "Cloud City pack should remain a 3-Pack");
  assertEquals(spiritYoda.exclusivity, "Walgreens", "Spirit Yoda #02 should keep Walgreens exclusivity");
  assertEquals(unmaskedVader.variant, "Unmasked", "Darth Vader #43 should keep Unmasked as variant");
  assertEquals(leiaBoushh.pop_name, "Princess Leia (Boushh)", "Leia #50 should keep Boushh detail");
  assertEquals(electrocutedVader.variant, "Electrocuted", "Darth Vader #288 should not collapse into the glow checklist slot");
  assertEquals(rotjPalpatine289.number, "289", "ROTJ Palpatine #289 should keep its original box number");
  assertEquals(babyNippet.pop_name, "Baby Nippet (Flocked)", "Baby Nippet #292 should keep flocked detail in the name");
  assertEquals(rotjPalpatine433.number, "433", "ROTJ Palpatine #433 should stay separate from #289");
  assertEquals(landoFalcon.pop_name, "Lando Calrissian in the Millennium Falcon", "Lando #514 should use the correct Millennium spelling");
  assertEquals(landoFalcon.pop_style, "Ride", "Lando #514 should remain a Ride");
  assertEquals(acolyteOsha.number, "722", "Osha Aniseya should keep The Acolyte box number");
  assertEquals(acolyteQimir.number, "723", "Qimir should be scan-ready as the missing Acolyte checklist row");
  assertEquals(acolyteQimir.set_name, "The Acolyte", "Qimir should not fall into the broad Star Wars set");
  assertEquals(acolyteYord.number, "724", "Yord Fandar should keep The Acolyte box number");
  assertEquals(acolyteSol.number, "725", "Jedi Master Sol should keep The Acolyte box number");
  assertEquals(acolyteBazil.number, "726", "Bazil should keep The Acolyte box number");
  assertEquals(artBoba.pop_name, "Boba Fett (Futura Black)", "Boba Fett #297 should keep Futura Black Art Series identity");
  assertEquals(artBoba.exclusivity, "Target", "Boba Fett #297 Futura Black should keep Target exclusivity");
  assertEquals(artBoba.set_total, 4, "Star Wars Art Series should use the four reviewed owned Art Series rows");
  assertEquals(artMustafar.pop_name, "Darth Vader (Mustafar)", "Mustafar #515 should keep Darth Vader in the display name");
  assertEquals(artMustafar.pop_style, "Art Series", "Mustafar #515 should remain Art Series");
  assertEquals(artMustafar.vault_status, "Vaulted", "Mustafar #515 should keep Funko vaulted status");
  assertEquals(artHoth.pop_name, "Darth Vader (Hoth)", "Hoth #516 should keep Darth Vader in the display name");
  assertEquals(artHoth.pop_style, "Art Series", "Hoth #516 should not drift to Standard");
  assertEquals(artHoth.vault_status, "Vaulted", "Hoth #516 should keep Funko vaulted status");
  assertEquals(forceHan.set_name, "Star Wars: The Force Awakens", "Han Solo #115 should remain in The Force Awakens");
  assertEquals(forceHan.variant, null, "Han Solo #115 should keep convention text out of variant");
  assertEquals(forceHan.exclusivity, "Summer Convention", "Han Solo #115 should keep Summer Convention exclusivity");
  assertEquals(futuraC3po.pop_name, "C-3PO (Futura)", "UPC 889698455282 should resolve to C-3PO Futura, not a bare box number");
  assertEquals(futuraC3po.set_name, "Star Wars Art Series", "C-3PO Futura #64 should move out of The Force Awakens");
  assertEquals(futuraC3po.pop_style, "Art Series", "C-3PO Futura #64 should retain Art Series style");
  assertEquals(chromeDeathTrooper.pop_name, "Imperial Death Trooper (Metallic Chrome)", "Death Trooper #154 should keep chrome detail in the name");
  assertEquals(chromeDeathTrooper.exclusivity, "Walmart", "Death Trooper #154 chrome should keep Walmart exclusivity");
  assertEquals(squadLeaderScarif.pop_name, "Scarif Stormtrooper (Squad Leader)", "Scarif #156 should not collapse to plain Stormtrooper");
  assertEquals(squadLeaderScarif.exclusivity, "Walgreens", "Scarif #156 Squad Leader should keep Walgreens exclusivity");
  assertEquals(soloChewbaccaFlocked.pop_name, "Chewbacca (Flocked)", "Solo Chewbacca #239 should keep flocked detail in the name");
  assertEquals(soloChewbaccaFlocked.exclusivity, "BoxLunch", "Solo Chewbacca #239 flocked should keep BoxLunch exclusivity");
  assertEquals(soloFightingDroids.pop_style, "2-Pack", "Fighting Droids should stay a 2-Pack");
  assertEquals(soloFightingDroids.number, null, "Fighting Droids 2-Pack should not inherit a single-box number");
  assertEquals(phantomMaul.vault_status, "Vaulted", "Darth Maul #9 should keep vaulted status");
  assertEquals(phantomWatto.number, "702", "25th Anniversary Watto should keep box number #702");
  assertEquals(phantomWatto.set_total, 30, "Phantom Menace should use the full FigureRealm Pop checklist total");
  assertEquals(phantomYoungAnakin.variant, "Podracer", "Young Anakin #231 should keep Podracer detail");
  assertEquals(phantomGoldMaul.variant, "Metallic Gold", "Gold Darth Maul #9 should remain distinct from the common #9");
  assertEquals(obiWanArtSeries.pop_style, "Art Series", "Obi-Wan #536 should stay an Art Series release");
  assertEquals(obiWanArtSeries.vault_status, "Vaulted", "Obi-Wan #536 Art Series should keep Funko vaulted status");
  assertEquals(nedB.variant, null, "NED-B #634 should not keep a placeholder Common variant");
  assertEquals(cassianAndor.pop_name, "Cassian Andor", "Cassian #534 should keep the full character name");
  assertEquals(cassianAndor.exclusivity, "Summer Convention / Target", "Cassian #534 should keep convention and retailer context");
  assertEquals(imperialRangeTrooper.pop_name, "Imperial Range Trooper", "Range Trooper #787 should keep the official Imperial name");
  assertEquals(imperialRangeTrooper.exclusivity, "Target", "Range Trooper #787 should not drift to Funko Shop");
  assertEquals(kyloTieFighter.pop_type, "Pop! Deluxe", "Kylo Ren with TIE Fighter #215 should keep Deluxe product type");
  assertEquals(kyloTieFighter.vault_status, "Vaulted", "Kylo Ren with TIE Fighter #215 should keep vaulted status");
  assertEquals(riseBb8.estimated_value, 5, "BB-8 #314 should keep the refreshed PriceCharting value");
  assertEquals(riseBb8.variant, null, "BB-8 #314 should not keep a placeholder Common variant");
  assertEquals(retroDooku.pop_name, "Count Dooku (Retro)", "Count Dooku #833 should keep Retro detail in the name");
  assertEquals(retroDooku.variant, "Retro", "Count Dooku #833 should not collapse to common Count Dooku");
  assertEquals(skeletonWim.estimated_value, 4.99, "Wim #699 should keep the refreshed PriceCharting value");
  assertEquals(skeletonWim.variant, null, "Wim #699 should not keep a placeholder Common variant");
  assertEquals(hanCarbonite.pop_name, "Han Solo (Carbonite)", "Han Solo #364 should keep Carbonite detail in the name");
  assertEquals(hanCarbonite.variant, "Carbonite", "Han Solo #364 should keep Carbonite variant detail");
  assertEquals(hanCarbonite.set_name, "Star Wars: The Empire Strikes Back", "Han Solo #364 should not stay in the Echo Base/40th denominator bucket");
  assertEquals(hanCarbonite.set_total, 61, "Han Solo #364 should inherit the reviewed Empire Strikes Back denominator");
  assertEquals(maceWindu172.set_name, "Star Wars", "Mace Windu #172 should not be counted inside Revenge of the Sith");
  assertEquals(shadowStormtrooper.set_name, "Star Wars: Gaming Greats", "Shadow Stormtrooper #394 should move out of the false KOTOR set");
  assertEquals(darthMalak.set_total, 25, "Darth Malak #395 should use the Gaming Greats denominator");
  assertEquals(nightbrother.set_name, "Star Wars: Gaming Greats", "Nightbrother #457 should use the Gaming Greats set");
  assertEquals(idenVersio.set_name, "Star Wars: Gaming Greats", "Iden Versio #460 should use the Gaming Greats set");
  assertEquals(fixerGaming.set_name, "Star Wars: Gaming Greats", "Fixer #644 should normalize the no-colon Gaming Greats alias");
  assertEquals(battalionTrooper.pop_name, "13th Battalion Trooper", "13th Battalion Trooper #645 should not keep the shortened Battalion Trooper name");
  assertEquals(battalionTrooper.set_total, 25, "Gaming Greats alias rows should use the full 25-item total");
  assertEquals(hk47.set_name, "Star Wars: Gaming Greats", "HK-47 #730 should not stay in a generic Legends set");
  assertEquals(hk47.variant, "Legends", "HK-47 #730 should retain Legends detail");
  assertEquals(supremeGrievous.exclusivity, "Supreme", "General Grievous #796 should keep Supreme exclusivity");
  assertEquals(supremeGrievous.limited_count, 9500, "General Grievous #796 should keep the limited run");
  assertEquals(newClassicsVader.number, "597", "New Classics Darth Vader should not be misread as box #1");
  assertEquals(newClassicsVader.set_name, "Star Wars: New Classics", "New Classics Darth Vader should keep the normalized set");
  assertEquals(deletedScenesLuke.pop_name, "Luke Skywalker (Deleted Scenes)", "Luke #800 should fix Delete Scenes typo");
  assertEquals(deletedScenesLuke.exclusivity, "Target", "Luke #800 Deleted Scenes should keep Target exclusivity");
  assertEquals(diamondVader.estimated_value, 28.46, "Darth Vader #626 Diamond should keep refreshed market value");
  assertEquals(dieCastYoda.exclusivity, "Funko Shop", "Die-Cast Yoda #3 should keep Funko Shop exclusivity");
  assertEquals(snowmanVader.variant, "Snowman", "Holiday Darth Vader #556 should keep Snowman detail");
  assertEquals(impressionsKylo.variant, "Impressions", "Kylo Ren #773 should keep Impressions detail");
  assertEquals(forceGhostPack.pop_style, "3-Pack", "Force Ghost Anakin/Yoda/Obi-Wan should remain a 3-Pack");
  assertEquals(forceGhostPack.variant, "Glow in the Dark", "Force Ghost 3-Pack should keep glow detail");
  assertEquals(quiGonMaul.pop_name, "Qui-Gon Jinn vs. Darth Maul 2-Pack", "Qui-Gon vs Darth Maul should fix Dark Maul typo");
  assertEquals(quiGonMaul.pop_style, "2-Pack", "Qui-Gon vs Darth Maul should not use Standard style");
  assertEquals(darkSideAnakin.variant, "Dark Side", "Anakin #281 should keep Dark Side detail");
  assertEquals(darkSideAnakin.set_total, 13, "Anakin #281 should use the reviewed Revenge of the Sith denominator");
  assertEquals(rebuildVader.set_name, "Star Wars: Revenge of the Sith", "Darth Vader #757 should stay in Revenge of the Sith");
  assertEquals(rebuildVader.set_total, 13, "Darth Vader #757 should use the reviewed Revenge of the Sith denominator");
  assertEquals(echoBaseWampa.set_name, "Battle at Echo Base", "Echo Base Wampa #372 should use the six-piece Echo Base set");
  assertEquals(echoBaseWampa.pop_style, "Deluxe", "Echo Base Wampa #372 should remain Deluxe");
  assertEquals(echoBaseHan.set_total, 6, "Echo Base Han #373 should use the six-piece Echo Base denominator");
  assertEquals(echoBaseProbeDroid.set_name, "Battle at Echo Base", "Probe Droid #375 should use the Echo Base subseries");
  assertEquals(visionsRoninB5.set_total, 4, "Visions should use the four-item reviewed checklist total");
  assertEquals(visionsAm.set_name, "Star Wars: Visions", "Am #503 should stay in Star Wars: Visions");
  assertEquals(visionsKarre.variant, "Glow in the Dark", "Karre #504 should keep Glow in the Dark detail");
  assertEquals(visionsRonin.number, "505", "The Ronin should keep Visions box number #505");
  assertEquals(redSaberSidious.set_total, 5, "Red Saber Series should use the five-volume checklist total");
  assertEquals(redSaberMaul.set_name, "Star Wars: Red Saber Series", "Darth Maul #520 should stay in Red Saber Series");
  assertEquals(redSaberTyranus.number, "522", "Darth Tyranus should keep Red Saber box number #522");
  assertEquals(firstOrderKylo.exclusivity, "Target", "Kylo Ren #806 should keep Target exclusivity");
  assertEquals(rottaGlow.set_name, "Star Wars: The Mandalorian & Grogu", "Rotta #843 should keep the Mandalorian & Grogu set");
  assertEquals(rottaGlow.exclusivity, "Target", "Rotta #843 glow should keep Target exclusivity");
  assertEquals(lifeDayChewbacca.exclusivity, "Disney Parks", "Chewbacca #576 should keep Disney Parks exclusivity");
  assertEquals(lifeDayChewbacca.estimated_value, 16.98, "Chewbacca #576 should keep refreshed market value");
  assertEquals(holdo.set_name, "Star Wars: The Last Jedi", "The Last Jedi rows should not use the Episode VIII duplicate label");

  assertEquals(redStormtrooper.pop_name, "Stormtrooper (in Red Armor)", "red Stormtrooper #5 should not link as common Stormtrooper");
  assertEquals(redStormtrooper.exclusivity, "Target", "red Stormtrooper #5 should keep Target exclusivity");
  assertEquals(nalanCheel.vault_status, "Vaulted", "Nalan Cheel #52 should keep vaulted status");
  assertEquals(ceremonyLuke.variant, "Ceremony", "Luke #90 should keep Ceremony detail");
  assertEquals(goldLuke.pop_name, "Luke Skywalker (Bespin) (Gold Metallic)", "Luke #93 should keep Gold Metallic detail");
  assertEquals(goldLuke.variant, "Gold Metallic", "Luke #93 should not collapse to plain Bespin");
  assertEquals(muftak.exclusivity, "Spring Convention", "Muftak #173 should keep convention exclusivity");
  assertEquals(leiaGold.exclusivity, "Galactic Convention", "Princess Leia #295 linked UPC should keep Galactic Convention");
  assertEquals(jawaClassic.pop_name, "Jawa (Classic)", "Jawa #371 should keep Classic detail");
  assertEquals(conventionLuke.exclusivity, "Galactic Convention / BoxLunch", "Luke #511 should keep shared convention retailer");
  assertEquals(binarySunsetLuke.pop_name, "Luke Skywalker (Binary Sunset)", "Luke #764 should keep Binary Sunset detail");
  assertEquals(deletedScenesSandtrooper.pop_name, "Sandtrooper (Deleted Scenes)", "Sandtrooper #803 should keep Deleted Scenes detail");
  assertEquals(c3poFacet.set_name, "Disney 100", "C-3PO #638 Facet should not stay in A New Hope");
  assertEquals(c3poFacet.variant, "Facet", "C-3PO #638 should keep Facet variant");
  assertEquals(c3poFacet.exclusivity, "Funko Shop", "C-3PO #638 should keep Funko Shop exclusivity");
});

Deno.test("Avengers movie cleanup UPCs keep reviewed identities", () => {
  const cap = AVENGERS_REFRESH_REGRESSION_OVERRIDES["849803047788"];
  const hulkbuster = AVENGERS_REFRESH_REGRESSION_OVERRIDES["849803047740"];
  const bucky = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698357753"];
  const thor = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698366625"];
  const antMan = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698398008"];
  const ironPatriot = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698512831"];
  const green = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698413503"];
  const red = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698413565"];
  const purple = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698413589"];
  const thanos = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698366724"];
  const nebula = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698366670"];
  const hawkeye = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698366694"];
  const warMachine = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698366731"];
  const capBrokenShield = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698451376"];
  const hulkTaco = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698451390"];
  const korgGamer = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698451406"];
  const broThor = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698451420"];
  const thanosGarden = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698451413"];
  const loki = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698512886"];
  const ironSpider = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698688956"];
  const thorThunder = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698649063"];
  const morganTony = AVENGERS_REFRESH_REGRESSION_OVERRIDES["889698543279"];

  assertEquals(cap.set_name, "Avengers: Age of Ultron", "Captain America #67 should not fall into the broad Captain America set");
  assertEquals(cap.character, "Captain America", "Captain America #67 should have a character");
  assertEquals(hulkbuster.pop_style, "Jumbo", "Hulkbuster #73 should keep the 6-inch Jumbo classification");
  assertEquals(bucky.pop_name, "Bucky Barnes", "Infinity War #418 should not keep a product-line placeholder name");
  assertEquals(thor.variant, null, "Thor #452 common should not inherit the GITD variant");
  assertEquals(thor.exclusivity, null, "Thor #452 common should not inherit Entertainment Earth or GameStop");
  assertEquals(antMan.variant, "Collectible Card", "Ant-Man #455 card UPC should keep its package variant");
  assertEquals(antMan.exclusivity, "Entertainment Earth", "Ant-Man #455 card UPC should keep its retailer");
  assertEquals(ironPatriot.variant, "Metallic", "Iron Patriot #868 should keep Metallic");
  assertEquals(ironPatriot.exclusivity, "Funko Shop", "Iron Patriot #868 should keep Funko Shop");
  assertEquals(green.variant, "Green Chrome", "green Hulk chrome UPC should not remain generic Chrome");
  assertEquals(red.exclusivity, "Walmart", "red Hulk chrome UPC should keep Walmart");
  assertEquals(purple.pop_name, "Hulk (Purple Chrome)", "purple Hulk chrome UPC should use the checklist family naming");
  assertEquals(thanos.exclusivity, null, "common Thanos #453 should not inherit Entertainment Earth");
  assertEquals(nebula.exclusivity, null, "common Nebula #456 should not inherit Entertainment Earth");
  assertEquals(hawkeye.exclusivity, null, "common Hawkeye #457 should not inherit Entertainment Earth");
  assertEquals(warMachine.exclusivity, null, "common War Machine #458 should not inherit Entertainment Earth");
  assertEquals(capBrokenShield.pop_name, "Captain America with Broken Shield", "Captain America #573 should retain the checklist detail");
  assertEquals(hulkTaco.pop_name, "Hulk with Taco", "Hulk #575 should retain the taco detail");
  assertEquals(korgGamer.pop_name, "Korg Gamer", "Korg #577 should retain the gamer detail");
  assertEquals(broThor.pop_name, "Bro Thor with Pizza", "Bro Thor #578 should retain the pizza detail");
  assertEquals(thanosGarden.pop_name, "Thanos in the Garden", "Thanos #579 should keep in the Garden as name detail");
  assertEquals(thanosGarden.exclusivity, null, "Thanos in the Garden should not treat in the Garden as exclusivity");
  assertEquals(loki.variant, "Glow in the Dark", "Loki #747 should keep GITD");
  assertEquals(loki.exclusivity, "Funko Shop", "Loki #747 should keep Funko Shop");
  assertEquals(ironSpider.number, "574", "Iron Spider with Nano Gauntlet should not drift to #1141");
  assertEquals(ironSpider.variant, "Glow in the Dark", "Iron Spider #574 should keep GITD");
  assertEquals(ironSpider.exclusivity, "Chalice Collectibles", "Iron Spider #574 should keep Chalice");
  assertEquals(thorThunder.number, "1117", "Thor with Thunder should not drift to Thor: Love and Thunder #1261");
  assertEquals(thorThunder.variant, "Glow in the Dark", "Thor with Thunder should keep GITD");
  assertEquals(thorThunder.exclusivity, "Chalice Collectibles", "Thor with Thunder should keep Chalice");
  assertEquals(morganTony.pop_style, "2-Pack", "Morgan Stark and Tony Stark should remain a 2-Pack");
  assertEquals(morganTony.exclusivity, "Pop In A Box", "Morgan Stark and Tony Stark should keep Pop In A Box");
});

Deno.test("Thor Love and Thunder cleanup UPCs keep reviewed identities", () => {
  const goatBoat = getStaticCatalogOverride("889698624206");

  assertEquals(goatBoat?.set_name, "Thor: Love and Thunder", "Goat Boat should use the normalized Love and Thunder set");
  assertEquals(goatBoat?.set_total, 18, "Goat Boat should keep the reviewed Thor Love and Thunder set total");
  assertEquals(goatBoat?.pop_type, "Pop! Rides", "Goat Boat should not scan as a standard Pop! Marvel row");
  assertEquals(goatBoat?.pop_style, "Super Deluxe Ride", "Goat Boat should keep Super Deluxe Ride style");
  assertEquals(goatBoat?.estimated_value, 13.63, "Goat Boat should keep the refreshed PriceCharting value");
});

Deno.test("Justice League x Sonic cleanup UPCs keep reviewed identities", () => {
  const silverGreenLantern = getStaticCatalogOverride("889698889049");

  assertEquals(silverGreenLantern?.pop_name, "Silver as the Green Lantern", "Silver should keep the source-backed display name");
  assertEquals(silverGreenLantern?.franchise, "DC", "Silver should stay grouped with the DC crossover set");
  assertEquals(silverGreenLantern?.set_name, "Justice League x Sonic", "Silver should use the normalized crossover set name");
  assertEquals(silverGreenLantern?.number, "592", "Silver should keep box number 592");
  assertEquals(silverGreenLantern?.exclusivity, "Target", "Silver should keep Target exclusivity");
  assertEquals(silverGreenLantern?.set_total, 6, "Silver should keep the six-pop crossover set total");
});

Deno.test("What If cleanup UPCs keep reviewed identities", () => {
  const killmongerJumbo = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698628143"];
  const metallicSpidey = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698582056"];
  const zombieCap = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698582544"];
  const strangeUnleashed = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698555296"];
  const carterHydra = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698554800"];
  const kingKillmonger = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698562645"];
  const ironManMech = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698866521"];
  const avengerMech = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698872799"];
  const kahhori = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698680424"];
  const killmongerBlacklight = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698633123"];
  const captainCarter = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698558112"];
  const metallicTchalla = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698567886"];
  const commonTchalla = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698558129"];
  const gamora = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698558143"];
  const captainCarterGameStop = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698559676"];
  const partyThor = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698562409"];
  const watcher = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698585996"];
  const zombieIronManGlow = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698581783"];
  const zombieIronManJumbo = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698582063"];
  const ravagerThanos = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698586559"];
  const infinityUltronGameStop = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698603386"];
  const hydraStomper = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698558136"];
  const fyeTchalla = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698561181"];
  const collector = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698559515"];
  const zombieFalcon = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698573771"];
  const zombieScarletWitch = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698573788"];
  const zombieIronManCommon = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698573795"];
  const zombieHunterSpideyCommon = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698573801"];
  const zombieStrange = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698573764"];
  const unmaskedSpidey = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698582537"];
  const stealthCaptainCarter = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698586535"];
  const infinityKillmonger969 = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698586528"];
  const gamoraBlade = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698586511"];
  const ramonda = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698586504"];
  const infinityUltron973 = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698586481"];
  const infinityKillmonger976 = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698589574"];
  const goliath = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698680448"];
  const captainCarter1602 = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698680400"];
  const sakaarianIronMan = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698586474"];
  const captainAmericaMech = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698866538"];
  const blackWidowPostApocalyptic = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698559522"];
  const zombieCaptainAmericaCommon = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698573757"];
  const zombieCaptainAmericaJumbo = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698584494"];
  const zolavision = WHAT_IF_REFRESH_REGRESSION_OVERRIDES["889698586566"];

  assertEquals(killmongerJumbo.set_name, "What If...?", "Infinity Killmonger #1058 should not remain missing its set");
  assertEquals(killmongerJumbo.variant, "Blacklight", "Infinity Killmonger #1058 should keep Blacklight");
  assertEquals(killmongerJumbo.pop_style, "Jumbo", "Infinity Killmonger #1058 should remain the oversized release");
  assertEquals(metallicSpidey.set_name, "What If...?", "metallic Zombie Hunter Spidey should not drift into Marvel Zombies");
  assertEquals(metallicSpidey.variant, "Metallic", "metallic Zombie Hunter Spidey should keep Metallic");
  assertEquals(zombieCap.pop_name, "Zombie Captain America", "Zombie Captain America #948 should not collapse to generic Zombie");
  assertEquals(zombieCap.exclusivity, "Funko Shop", "Zombie Captain America #948 should keep Funko Shop");
  assertEquals(strangeUnleashed.pop_name, "Doctor Strange Supreme Unleashed", "Doctor Strange #884 should keep Unleashed detail");
  assertEquals(strangeUnleashed.pop_style, "Jumbo", "Doctor Strange Supreme Unleashed should keep oversized style");
  assertEquals(carterHydra.pop_name, "Captain Carter and The Hydra Stomper", "Captain Carter #885 should keep the deluxe title");
  assertEquals(carterHydra.pop_style, "Deluxe", "Captain Carter and The Hydra Stomper should remain Deluxe");
  assertEquals(kingKillmonger.variant, null, "King Killmonger should not store Special Edition as a variant");
  assertEquals(kingKillmonger.exclusivity, "Target", "King Killmonger #878 should keep Target exclusivity");
  assertEquals(ironManMech.set_name, "What If...?", "Iron Man Mech should keep canonical What If punctuation");
  assertEquals(ironManMech.character, "Iron Man", "Iron Man Mech should keep character separate from product name");
  assertEquals(avengerMech.set_name, "What If...?", "Avenger Mech should keep canonical What If punctuation");
  assertEquals(avengerMech.pop_style, "Jumbo", "Avenger Mech should keep oversized style");
  assertEquals(kahhori.number, "1466", "Kahhori should keep the What If wave box number");
  assertEquals(killmongerBlacklight.variant, "Blacklight", "Infinity Killmonger #989 should keep Blacklight");
  assertEquals(killmongerBlacklight.exclusivity, "Target", "Infinity Killmonger #989 should keep Target exclusivity");
  assertEquals(captainCarter.number, "870", "Captain Carter common should keep #870");
  assertEquals(metallicTchalla.variant, "Metallic", "T'Challa Star-Lord BoxLunch UPC should keep Metallic");
  assertEquals(metallicTchalla.exclusivity, "BoxLunch", "T'Challa Star-Lord metallic should keep BoxLunch");
  assertEquals(commonTchalla.variant, null, "common T'Challa Star-Lord should not inherit Metallic");
  assertEquals(commonTchalla.exclusivity, null, "common T'Challa Star-Lord should not inherit BoxLunch");
  assertEquals(gamora.pop_name, "Gamora, Daughter of Thanos", "Gamora #873 should keep canonical casing");
  assertEquals(captainCarterGameStop.exclusivity, "GameStop", "Captain Carter #875 should keep GameStop exclusivity");
  assertEquals(partyThor.exclusivity, "Walmart", "Party Thor #877 should keep Walmart exclusivity");
  assertEquals(watcher.exclusivity, "Funko Shop", "The Watcher #928 should keep Funko Shop exclusivity");
  assertEquals(zombieIronManGlow.variant, "Glow in the Dark", "Zombie Iron Man #944 Amazon UPC should keep GITD");
  assertEquals(zombieIronManGlow.exclusivity, "Amazon", "Zombie Iron Man #944 GITD should keep Amazon exclusivity");
  assertEquals(zombieIronManJumbo.number, "948", "Zombie Iron Man Jumbo should keep #948");
  assertEquals(zombieIronManJumbo.pop_style, "Jumbo", "Zombie Iron Man #948 should not remain Standard");
  assertEquals(zombieIronManJumbo.exclusivity, "Walmart", "Zombie Iron Man #948 Jumbo should keep Walmart exclusivity");
  assertEquals(ravagerThanos.exclusivity, "Target", "Ravager Thanos #974 should keep Target exclusivity");
  assertEquals(infinityUltronGameStop.exclusivity, "GameStop", "Infinity Ultron #977 should keep GameStop exclusivity");
  assertEquals(hydraStomper.pop_style, "Deluxe", "Hydra Stomper #872 should keep Deluxe style");
  assertEquals(fyeTchalla.exclusivity, "FYE", "T'Challa Star-Lord #876 should keep FYE exclusivity");
  assertEquals(collector.exclusivity, "Marvel Collector Corps", "The Collector #893 should keep Collector Corps exclusivity");
  assertEquals(zombieFalcon.number, "942", "Zombie Falcon should keep #942");
  assertEquals(zombieScarletWitch.number, "943", "Zombie Scarlet Witch should keep #943");
  assertEquals(zombieIronManCommon.variant, null, "common Zombie Iron Man #944 should not inherit GITD");
  assertEquals(zombieIronManCommon.exclusivity, null, "common Zombie Iron Man #944 should not inherit Amazon");
  assertEquals(zombieHunterSpideyCommon.variant, null, "common Zombie Hunter Spidey #945 should not inherit Metallic");
  assertEquals(zombieHunterSpideyCommon.exclusivity, null, "common Zombie Hunter Spidey #945 should not inherit Walmart or Hot Topic");
  assertEquals(zombieStrange.exclusivity, "Target", "Zombie Strange #946 should keep Target exclusivity");
  assertEquals(unmaskedSpidey.pop_name, "Zombie Hunter Spidey (Unmasked)", "unmasked Spidey #947 should keep name detail");
  assertEquals(unmaskedSpidey.exclusivity, "Hot Topic", "unmasked Spidey #947 should keep Hot Topic exclusivity");
  assertEquals(stealthCaptainCarter.pop_name, "Captain Carter (Stealth Suit)", "Captain Carter #968 should keep Stealth Suit detail");
  assertEquals(infinityKillmonger969.number, "969", "Infinity Killmonger #969 should stay distinct from #976 and #989");
  assertEquals(gamoraBlade.pop_name, "Gamora (with Blade of Thanos)", "Gamora #970 should keep Blade of Thanos detail");
  assertEquals(ramonda.number, "971", "Queen General Ramonda should keep #971");
  assertEquals(infinityUltron973.number, "973", "Infinity Ultron #973 should stay distinct from GameStop #977");
  assertEquals(infinityKillmonger976.exclusivity, "Funko Shop", "Infinity Killmonger #976 should keep Funko Shop exclusivity");
  assertEquals(goliath.number, "1467", "Goliath should keep #1467");
  assertEquals(captainCarter1602.pop_name, "Captain Carter (1602)", "Captain Carter #1468 should keep 1602 detail");
  assertEquals(captainCarter1602.exclusivity, "Target", "Captain Carter 1602 should keep Target exclusivity");
  assertEquals(sakaarianIronMan.set_name, "What If...?", "Sakaarian Iron Man #1463 should not remain missing its set");
  assertEquals(sakaarianIronMan.pop_style, "Jumbo", "Sakaarian Iron Man #1463 should keep the oversized style");
  assertEquals(captainAmericaMech.pop_name, "Captain America Mech", "Captain America Mech #1569 should not collapse to Mech");
  assertEquals(captainAmericaMech.set_name, "What If...?", "Captain America Mech #1569 should not use Captain America as the set");
  assertEquals(blackWidowPostApocalyptic.pop_name, "Black Widow (Post-Apocalyptic)", "Black Widow #894 should keep Post-Apocalyptic detail");
  assertEquals(blackWidowPostApocalyptic.variant, null, "Black Widow #894 should not duplicate Post-Apocalyptic as a variant");
  assertEquals(blackWidowPostApocalyptic.exclusivity, "Marvel Collector Corps", "Black Widow #894 should keep Collector Corps exclusivity");
  assertEquals(zombieCaptainAmericaCommon.number, "941", "common Zombie Captain America should keep #941");
  assertEquals(zombieCaptainAmericaCommon.pop_style, "Standard", "common Zombie Captain America should remain Standard");
  assertEquals(zombieCaptainAmericaJumbo.number, "949", "GameStop Zombie Captain America should keep #949");
  assertEquals(zombieCaptainAmericaJumbo.pop_style, "Jumbo", "Zombie Captain America #949 should keep Jumbo style");
  assertEquals(zombieCaptainAmericaJumbo.exclusivity, "GameStop", "Zombie Captain America #949 should keep GameStop exclusivity");
  assertEquals(zolavision.number, "975", "Zolavision should keep #975");
  assertEquals(zolavision.exclusivity, "Target", "Zolavision should keep Target exclusivity");
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
  assertEquals(getSetTotalOverride("Captain America: Brave New World"), 10, "Brave New World should use the reviewed ten-item Pop checklist total");
  assertEquals(getSetTotalOverride("Captain America: Civil War"), 30, "Civil War should use the full thirty-item Pop checklist total");
  assertEquals(getSetTotalOverride("Captain America: Civil War Die-Cast"), 1, "Civil War Die-Cast should use the one-item Die-Cast checklist total");
  assertEquals(getSetTotalOverride("Captain America: The First Avenger"), 3, "Captain America: The First Avenger should use the full First Avenger Pop checklist total");
  assertEquals(getSetTotalOverride("Captain America: The Winter Soldier"), 9, "Winter Soldier should use the full nine-item Pop checklist total");
  assertEquals(getSetTotalOverride("Captain Planet"), 9, "Captain Planet should use the full New Adventures of Captain Planet Pop checklist total");
  assertEquals(getSetTotalOverride("Avengers: Infinity War"), 51, "Avengers Infinity War should use the full Figure Realm Pop checklist total");
  assertEquals(getSetTotalOverride("Cast Away"), 2, "Cast Away should use the two Chuck Noland releases");
  assertEquals(getSetTotalOverride("Cartoon Network"), 8, "Cartoon Network should use the Pop-only checklist total");
  assertEquals(getSetTotalOverride("Chilly Willy"), 4, "Chilly Willy should use the full Funko checklist total");
  assertEquals(getSetTotalOverride("Clueless"), 7, "Clueless should use the full reviewed FigureRealm checklist total");
  assertEquals(getSetTotalOverride("Clerks III"), 6, "Clerks III should use the full six figure movie checklist total");
  assertEquals(getSetTotalOverride("Cocaine Bear"), 2, "Cocaine Bear should use the two figure movie checklist total");
  assertEquals(getSetTotalOverride("Coca-Cola"), 14, "Coca-Cola should use the full Pop Ad Icons checklist total");
  assertEquals(getSetTotalOverride("Coco"), 13, "Coco should use the full checklist total");
  assertEquals(getSetTotalOverride("Crash Bandicoot"), 13, "Crash Bandicoot should use the Pop vinyl checklist total");
  assertEquals(getSetTotalOverride("Cuphead"), 30, "Cuphead should use the full checklist total");
  assertEquals(getSetTotalOverride("Daredevil: Born Again"), 7, "Daredevil: Born Again should use the reviewed seven-item checklist total");
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
  assertEquals(getSetTotalOverride("House of the Dragon"), 5, "House of the Dragon should use the scoped current-catalog checklist total");
  assertEquals(getSetTotalOverride("I Am Groot"), 26, "I Am Groot should use the full checklist total");
  assertEquals(getSetTotalOverride("Indiana Jones"), 28, "Indiana Jones should use the full checklist total");
  assertEquals(getSetTotalOverride("Indiana Jones and the Last Crusade"), 3, "Indiana Jones Last Crusade should use the scoped movie release total");
  assertEquals(getSetTotalOverride("Ironheart"), 2, "Ironheart should use the two figure Marvel Studios checklist total");
  assertEquals(getSetTotalOverride("Infinity Warps"), 15, "Infinity Warps should use the full Infinity Warps Pop checklist total");
  assertEquals(getSetTotalOverride("It's A Small World"), 6, "It's A Small World should use the Pop vinyl subset checklist total");
  assertEquals(getSetTotalOverride("Jingle All the Way"), 5, "Jingle All the Way should use the full movie checklist total");
  assertEquals(getSetTotalOverride("Jungle Cruise"), 1, "Jungle Cruise should use the one figure checklist total");
  assertEquals(getSetTotalOverride("Justice League x Sonic"), 6, "Justice League x Sonic should use the six figure crossover checklist total");
  assertEquals(getSetTotalOverride("Justice League x Sonic the Hedgehog"), 6, "Justice League x Sonic the Hedgehog should normalize to the six figure crossover checklist total");
  assertEquals(getSetTotalOverride("Justice League of America #217"), 1, "Justice League of America comic cover should use the single cover total");
  assertEquals(getSetTotalOverride("Jurassic Park: 25th Anniversary"), 7, "Jurassic Park 25th Anniversary should use the numbered 545-551 wave total");
  assertEquals(getSetTotalOverride("Jessica Jones"), 2, "Jessica Jones should use the two figure checklist total");
  assertEquals(getSetTotalOverride("Krypto The Superdog"), 1, "Krypto The Superdog should use the one figure Specialty Series release total");
  assertEquals(getSetTotalOverride("Married With Children"), 6, "Married With Children should use the full television checklist total");
  assertEquals(getSetTotalOverride("Make A Wish"), 9, "Make A Wish should use the full Pops With Purpose assortment total");
  assertEquals(getSetTotalOverride("Make-A-Wish"), 9, "Make-A-Wish hyphen variant should use the full Pops With Purpose assortment total");
  assertEquals(getSetTotalOverride("Mark Hamill"), 2, "Mark Hamill should use the two DesignerCon Pop checklist total");
  assertEquals(getSetTotalOverride("Marvel Street Art"), 7, "Marvel Street Art should use the full Street Art Collection total");
  assertEquals(getSetTotalOverride("Marvel Studios: The First Ten Years"), 10, "Marvel Studios First Ten Years should use the scoped ten-item checklist total");
  assertEquals(getSetTotalOverride("Marvel Zombies"), 34, "Marvel Zombies should use the full checklist total");
  assertEquals(getSetTotalOverride("Mike Tyson"), 1, "Mike Tyson should use the one figure checklist total");
  assertEquals(getSetTotalOverride("Monster At Work"), 2, "Monster At Work should use the two figure Monsters at Work subset total");
  assertEquals(getSetTotalOverride("Monster Cereals"), 20, "Monster Cereals should use the reviewed General Mills monster cereal Pop total");
  assertEquals(getSetTotalOverride("Monsters, Inc"), 18, "Monsters Inc should use the full checklist total");
  assertEquals(getSetTotalOverride("Monsters, Inc."), 18, "Monsters Inc punctuation variant should use the full checklist total");
  assertEquals(getSetTotalOverride("Nacho Libre"), 2, "Nacho Libre should use the common plus chase total");
  assertEquals(getSetTotalOverride("Nope"), 1, "Nope should use the single OJ Haywood Pop release total");
  assertEquals(getSetTotalOverride("Onward"), 7, "Onward should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("Pinky and the Brain"), 1, "Pinky and the Brain should use the one 2-pack catalog item total");
  assertEquals(getSetTotalOverride("Pixar Up"), 8, "Pixar Up should use the full Figure Realm Up checklist total");
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
  assertEquals(getSetTotalOverride("Battle at Echo Base"), 6, "Battle at Echo Base should use the six-piece deluxe subseries total");
  assertEquals(getSetTotalOverride("Star Wars: Attack of the Clones"), 4, "Attack of the Clones should use the scoped reviewed catalog total for this batch");
  assertEquals(getSetTotalOverride("Star Wars Art Series"), 4, "Star Wars Art Series should use the reviewed owned Art Series total");
  assertEquals(getSetTotalOverride("Star Wars Gaming Greats"), 25, "Star Wars Gaming Greats should normalize the no-colon alias");
  assertEquals(getSetTotalOverride("Star Wars: Gaming Greats"), 25, "Gaming Greats should use the full FigureRealm Gaming Greats Pop checklist total");
  assertEquals(getSetTotalOverride("Star Wars: Red Saber Series"), 5, "Red Saber Series should use the five-volume checklist total");
  assertEquals(getSetTotalOverride("Star Wars: Retro Series"), 6, "Retro Series should use the scoped reviewed catalog total for this batch");
  assertEquals(getSetTotalOverride("Star Wars: Revenge of the Sith"), 13, "Revenge of the Sith should use the full FigureRealm Pop checklist total");
  assertEquals(getSetTotalOverride("Star Wars: The Phantom Menace"), 30, "Phantom Menace should use the full FigureRealm Pop checklist total");
  assertEquals(getSetTotalOverride("Star Wars: Visions"), 4, "Visions should use the four reviewed Pop checklist rows");
  assertEquals(getSetTotalOverride("Star Wars: The Last Jedi"), 22, "The Last Jedi should use the reviewed catalog checklist total");
  assertEquals(getSetTotalOverride("Suits (2011)"), 2, "Suits should use the Louis Litt single and Harvey Specter and Michael Ross 2-pack total");
  assertEquals(getSetTotalOverride("Superman"), 14, "broad Superman should use the scoped reviewed denominator after moving 1978 and DC Heroes rows out");
  assertEquals(getSetTotalOverride("Action Comics #644"), 1, "Action Comics comic cover should use a one-item checklist");
  assertEquals(getSetTotalOverride("Superman Vol. 2 #204"), 1, "Superman Vol. 2 comic cover should use a one-item checklist");
  assertEquals(getSetTotalOverride("Superman: Ghosts of Krypton"), 1, "Ghosts of Krypton should use a one-item checklist");
  assertEquals(getSetTotalOverride("Superman: Reign of the Supermen"), 1, "Reign of the Supermen comic cover should use a one-item checklist");
  assertEquals(getSetTotalOverride("Superman/Batman"), 1, "Superman/Batman should use a one-item checklist");
  assertEquals(getSetTotalOverride("Ted 2"), 3, "Ted 2 should use Ted with remote, flocked Ted with remote, and Ted with beer bottle");
  assertEquals(getSetTotalOverride("Ted Lasso"), 23, "Ted Lasso should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("The Adventures Of Jimmy Neutron Boy Genius"), 4, "Jimmy Neutron should use the four Pop vinyl release total");
  assertEquals(getSetTotalOverride("The Batman"), 15, "The Batman should use the full subseries checklist total");
  assertEquals(getSetTotalOverride("The Exorcist: Believer"), 2, "The Exorcist Believer should use the Angela and Katherine release total");
  assertEquals(getSetTotalOverride("The Flash (TV Series)"), 21, "The Flash TV series should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("The Godfather Part II"), 4, "The Godfather Part II should use the four figure Part II release total");
  assertEquals(getSetTotalOverride("The Godfather: 50 Years"), 3, "The Godfather 50 Years should use the three figure anniversary total");
  assertEquals(getSetTotalOverride("The Good Dinosaur (2015)"), 2, "The Good Dinosaur should use the Spot and Arlo release total");
  assertEquals(getSetTotalOverride("The Falcon and the Winter Soldier"), 15, "Falcon and the Winter Soldier should use the full fifteen-item Pop checklist total");
  assertEquals(getSetTotalOverride("The Incredibles 20th Anniversary"), 6, "The Incredibles 20th Anniversary should use four numbered Pops plus two chase variants");
  assertEquals(getSetTotalOverride("The Jungle Book"), 6, "The Jungle Book should use the five vinyl/deluxe entries plus the Baloo and Mowgli Pop Moment");
  assertEquals(getSetTotalOverride("The Nightmare Before Christmas"), 9, "Nightmare Before Christmas should use the reviewed in-catalog scoped checklist total");
  assertEquals(getSetTotalOverride("The Tick"), 2, "The Tick should use the standard and glow-in-the-dark release total");
  assertEquals(getSetTotalOverride("Tombstone"), 6, "Tombstone should use the six figure Pop Movies checklist total");
  assertEquals(getSetTotalOverride("Thor: Love and Thunder"), 18, "Thor Love and Thunder should use the reviewed checklist total");
  assertEquals(getSetTotalOverride("Trigun"), 13, "Trigun should use the Pop vinyl checklist total excluding the Pocket Keychain");
  assertEquals(getSetTotalOverride("Us"), 7, "Us should use the full Pop Movies checklist including chase and later Red release");
  assertEquals(getSetTotalOverride("Wallace & Gromit: Vengeance Most Fowl"), 4, "Vengeance Most Fowl should tolerate the ampersand set alias");
  assertEquals(getSetTotalOverride("Wallace And Gromit: Vengeance Most Fowl"), 4, "Vengeance Most Fowl should use the four figure wave total");
  assertEquals(getSetTotalOverride("Victory Shawarma"), 6, "Victory Shawarma should use the six-character Avengers shawarma set total");
  assertEquals(getSetTotalOverride("Who Framed Roger Rabbit"), 1, "Who Framed Roger Rabbit should use the one Roger Rabbit Pop release total");
  assertEquals(getSetTotalOverride("Winnie the Pooh"), 31, "Winnie the Pooh should use the reviewed Pop vinyl/VHS checklist total");
  assertEquals(getSetTotalOverride("Winnie The Pooh"), 31, "Winnie The Pooh casing variant should use the reviewed checklist total");
  assertEquals(getSetTotalOverride("Winnie the Pooh VHS Covers"), 1, "Winnie the Pooh VHS Covers should use the single VHS cover item total");
  assertEquals(getSetTotalOverride("Wondla"), 3, "Wondla should use the three figure Pop checklist total");
  assertEquals(getSetTotalOverride("Wolverine 50th Anniversary"), 4, "Wolverine 50th Anniversary should use the four figure 1371-1374 release total");
  assertEquals(getSetTotalOverride(" Shazam! Fury of the Gods "), 10, "Shazam Fury of the Gods should normalize spacing");
  assertEquals(getSetTotalOverride("Shazam! Fury Of The Gods"), 10, "Shazam Fury of the Gods should tolerate title-case Of");
  assertEquals(getSetTotalOverride("DC Super Heroes"), null, "broad buckets should not receive guessed totals");
});

Deno.test("Winnie the Pooh cleanup overrides keep set names and variants out of parser drift", () => {
  const bedtimePooh = getStaticCatalogOverride("889698587860");
  assertEquals(bedtimePooh?.set_name, "Winnie the Pooh", "BoxLunch Pooh should not create a separate Box Lunch set");
  assertEquals(bedtimePooh?.variant, "Bedtime", "BoxLunch Pooh should keep Bedtime as the variant");
  assertEquals(bedtimePooh?.exclusivity, "BoxLunch", "BoxLunch Pooh should keep exclusivity separate from set");

  const metallicHeffalump = getStaticCatalogOverride("889698112635");
  assertEquals(metallicHeffalump?.set_name, "Winnie the Pooh", "Metallic Heffalump should stay in the core Winnie the Pooh set");
  assertEquals(metallicHeffalump?.variant, "Metallic Chase", "Metallic Heffalump should preserve the chase detail");

  const vhsPooh = getStaticCatalogOverride("889698632676");
  assertEquals(vhsPooh?.franchise, "Disney", "VHS Pooh should not lose Disney franchise");
  assertEquals(vhsPooh?.set_name, "Winnie the Pooh VHS Covers", "VHS Pooh should use the VHS Covers set");
  assertEquals(vhsPooh?.pop_type, "Pop! VHS Covers", "VHS Pooh should not fall back to plain Pop!");

  assertEquals(canonicalizeSetLabel("Winnie The Pooh. Box Lunch"), "Winnie the Pooh", "Box Lunch suffix should not split the set");
  assertEquals(canonicalizeSetLabel("Winnie The Pooh. Metallic"), "Winnie the Pooh", "Metallic suffix should not split the set");
  assertEquals(canonicalizeSetLabel("Winnie The Pooh. VHS Series"), "Winnie the Pooh VHS Covers", "VHS suffix should become the VHS Covers set");
  assertEquals(canonicalizeSetLabel("Disney. Valentines Day"), "Disney Valentine's Day", "Disney Valentines label should normalize punctuation");
});

Deno.test("polluted set labels move sticker and store details out of set names", () => {
  assertEquals(canonicalizeSetLabel("Brandalised. Banksy"), "Brandalised", "Banksy detail should not split Brandalised");
  assertEquals(canonicalizeSetLabel("Breast Cancer Awareness. Pink. Bombshells"), "DC Comics Bombshells", "BCA/pink detail should not split Bombshells");
  assertEquals(canonicalizeSetLabel("Chiefs. NFL"), "NFL: Kansas City Chiefs", "Chiefs NFL suffix should become the team set");
  assertEquals(canonicalizeSetLabel("DC Heroes. DC Super Heroes"), "DC Super Heroes", "DC Heroes prefix should not split DC Super Heroes");
  assertEquals(canonicalizeSetLabel("Deadpool And Wolverine. April Pool’s Day Sticker"), "Deadpool & Wolverine", "April Pool's Day sticker should not split Deadpool and Wolverine");
  assertEquals(canonicalizeSetLabel("Diamond Collection. The Queen's Gambit"), "The Queen's Gambit", "Diamond Collection should not split Queen's Gambit");
  assertEquals(canonicalizeSetLabel("Loki, Winter Convention"), "Spider-Man", "misparsed Loki/Winter Convention label should become Spider-Man");
  assertEquals(canonicalizeSetLabel("Macy's Thanksgiving Day Parade With Handlers. The Mandalorian"), "Star Wars: The Mandalorian", "Macy's parade detail should not split Mandalorian");
  assertEquals(canonicalizeSetLabel("Marvel. Hawkeye"), "Hawkeye", "Marvel prefix should not split Hawkeye");
  assertEquals(canonicalizeSetLabel("NYCC. Ted Lasso"), "Ted Lasso", "NYCC sticker should not split Ted Lasso");
  assertEquals(canonicalizeSetLabel("Shop. The Office"), "The Office", "Shop prefix should not split The Office");
  assertEquals(canonicalizeSetLabel("Special Edition. Guardians Of The Galaxy Vol. 3"), "Guardians of the Galaxy Vol. 3", "Special Edition should not split Guardians Vol. 3");
  assertEquals(canonicalizeSetLabel("Star Wars Diamond Collection"), "Star Wars", "Diamond Collection should not split broad Star Wars");
  assertEquals(canonicalizeSetLabel("Star Wars. Disney. Entertainment Earth"), "Star Wars: Rebels", "store/source prefixes should not split Star Wars Rebels");
  assertEquals(canonicalizeSetLabel("WWE. Dr. Of Thuganomics"), "WWE", "gimmick detail should not split WWE");
});

Deno.test("set label and no-set override batch fills durable UPC identities", () => {
  const bugEyesSpidey = SET_LABEL_AND_NO_SET_REFRESH_REGRESSION_OVERRIDES["889698653657"];
  assertEquals(bugEyesSpidey.set_name, "Spider-Man", "Spider-Man #1067 should not remain Loki");
  assertEquals(bugEyesSpidey.variant, "Bug-Eyes Armor", "Spider-Man #1067 should preserve armor detail");

  const blade = SET_LABEL_AND_NO_SET_REFRESH_REGRESSION_OVERRIDES["889698848473"];
  assertEquals(blade.set_name, "Deadpool & Wolverine", "Blade #1495 should gain Deadpool and Wolverine set");

  const aquaman = SET_LABEL_AND_NO_SET_REFRESH_REGRESSION_OVERRIDES["889698336789"];
  assertEquals(aquaman.pop_name, "Arthur Curry as Gladiator", "Aquaman chrome row should clean the title");
  assertEquals(aquaman.variant, "Gold Chrome", "Aquaman chrome row should preserve Gold Chrome variant");
  assertEquals(aquaman.exclusivity, "Target", "Aquaman chrome row should preserve Target exclusivity");

  const rhaenyra = SET_LABEL_AND_NO_SET_REFRESH_REGRESSION_OVERRIDES["889698665940"];
  assertEquals(rhaenyra.franchise, "Game of Thrones", "Rhaenyra should gain Game of Thrones franchise");
  assertEquals(rhaenyra.set_name, "House of the Dragon", "Rhaenyra should gain House of the Dragon set");

  const joey = SET_LABEL_AND_NO_SET_REFRESH_REGRESSION_OVERRIDES["889698801867"];
  assertEquals(joey.franchise, "Friends", "Joey should gain Friends franchise");
  assertEquals(joey.variant, "Superman Costume", "Joey should keep Superman Costume as variant detail");
});

Deno.test("Nightmare Before Christmas overrides preserve reviewed variants and franchise", () => {
  const gitdJack = NIGHTMARE_BEFORE_CHRISTMAS_REFRESH_REGRESSION_OVERRIDES["830395024684"];
  assertEquals(gitdJack.franchise, "The Nightmare Before Christmas", "Jack #15 should not fall back to broad Disney franchise");
  assertEquals(gitdJack.variant, "Glow in the Dark", "Jack #15 should keep GITD from source title");
  assertEquals(gitdJack.set_total, 9, "Nightmare rows should carry the scoped reviewed total");

  const zeroChase = NIGHTMARE_BEFORE_CHRISTMAS_REFRESH_REGRESSION_OVERRIDES["830395034065"];
  assertEquals(zeroChase.variant, "Chase", "Zero #71 should use Chase instead of Blacklight");

  const jackPink = NIGHTMARE_BEFORE_CHRISTMAS_REFRESH_REGRESSION_OVERRIDES["889698603133"];
  assertEquals(jackPink.variant, "Pink Suit", "Jack #1168 should preserve Pink Suit detail");
  assertEquals(jackPink.exclusivity, "Hot Topic Expo 2022", "Jack #1168 should use the specific Hot Topic Expo label");

  const oogieWheel = NIGHTMARE_BEFORE_CHRISTMAS_REFRESH_REGRESSION_OVERRIDES["889698405911"];
  assertEquals(oogieWheel.pop_name, "Oogie Boogie with Wheel", "Oogie #811 should protect the corrected title spelling");
  assertEquals(oogieWheel.exclusivity, "BoxLunch", "Oogie #811 should keep BoxLunch exclusivity");
});

Deno.test("Pixar Up and House of the Dragon scoped checklist overrides stay durable", () => {
  const russellSash = PIXAR_UP_HOUSE_OF_THE_DRAGON_REFRESH_REGRESSION_OVERRIDES["889698791588"];
  assertEquals(russellSash.set_name, "Pixar Up", "Russell with Sash should stay in Pixar Up");
  assertEquals(russellSash.set_total, 8, "Pixar Up rows should carry the full eight-item checklist total");
  assertEquals(russellSash.variant, "Sash", "Russell with Sash should keep Sash as variant detail");
  assertEquals(russellSash.exclusivity, "BoxLunch", "Russell with Sash should keep BoxLunch exclusivity");

  const daemon = PIXAR_UP_HOUSE_OF_THE_DRAGON_REFRESH_REGRESSION_OVERRIDES["889698797245"];
  assertEquals(daemon.pop_name, "Daemon Targaryen (Dark Sister)", "Daemon #17 should protect Dark Sister identity");
  assertEquals(daemon.variant, "Dark Sister", "Daemon #17 should keep Dark Sister as variant detail");
  assertEquals(daemon.set_total, 5, "House of the Dragon rows should carry the scoped current-catalog checklist total");

  const alicent = PIXAR_UP_HOUSE_OF_THE_DRAGON_REFRESH_REGRESSION_OVERRIDES["889698839761"];
  assertEquals(alicent.pop_name, "Alicent Hightower (Teal Cloak)", "Alicent #24 should keep Teal Cloak in display name");
  assertEquals(alicent.variant, "Teal Cloak", "Alicent #24 should keep Teal Cloak variant");
});

Deno.test("Superman cleanup keeps 1978 and DC Heroes rows out of broad Superman", () => {
  const flyingPack = SUPERMAN_REFRESH_REGRESSION_OVERRIDES["889698601627"];
  assertEquals(flyingPack.set_name, "Superman (1978)", "Superman and Lois Flying should move to Superman 1978");
  assertEquals(flyingPack.set_total, 7, "Superman 1978 rows should keep reviewed total");
  assertEquals(flyingPack.exclusivity, "Special Edition / Pop In A Box", "Flying 2-pack should keep source exclusivity");

  const metallicSeven = SUPERMAN_REFRESH_REGRESSION_OVERRIDES["830395022505"];
  const blackWhiteSeven = SUPERMAN_REFRESH_REGRESSION_OVERRIDES["849803076122"];
  assertEquals(metallicSeven.set_name, "DC Super Heroes", "Superman #7 Metallic should be DC Super Heroes");
  assertEquals(blackWhiteSeven.set_name, "DC Super Heroes", "Superman #7 Black and White should be DC Super Heroes");

  const blackSuit = SUPERMAN_REFRESH_REGRESSION_OVERRIDES["889698871884"];
  assertEquals(blackSuit.set_name, "Superman", "Black Suit Superman should remain in broad Superman");
  assertEquals(blackSuit.set_total, 14, "broad Superman rows should use scoped total 14");
  assertEquals(blackSuit.exclusivity, "Funko Shop", "Black Suit Superman should not keep generic Exclusive");

  const comicCover = SUPERMAN_REFRESH_REGRESSION_OVERRIDES["889698844314"];
  assertEquals(comicCover.set_total, 1, "Superman Vol. 2 comic cover should use a one-item total");
});

Deno.test("Captain America batch 1 moves obvious rows out of broad Captain America", () => {
  const redSkullMoment = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698328807"];
  assertEquals(redSkullMoment.pop_name, "Red Skull vs. Captain America", "Red Skull moment should keep both characters in the title");
  assertEquals(redSkullMoment.set_name, "Marvel Studios: The First Ten Years", "Red Skull moment should move to First Ten Years");
  assertEquals(redSkullMoment.pop_style, "Movie Moment", "Red Skull moment should keep Movie Moment style");

  const zombieCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698866507"];
  assertEquals(zombieCap.pop_name, "Zombie Captain America", "Zombie Captain America should not collapse to Zombie");
  assertEquals(zombieCap.set_name, "Marvel Zombies", "Zombie Captain America #675 should move to Marvel Zombies");

  const shawarmaCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698548977"];
  assertEquals(shawarmaCap.set_name, "Victory Shawarma", "Victory Shawarma Captain America should not remain broad Captain America");
  assertEquals(shawarmaCap.set_total, 6, "Victory Shawarma should carry six-item total");

  const usAgent = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698516310"];
  assertEquals(usAgent.set_name, "The Falcon and the Winter Soldier", "US Agent should move to Falcon and Winter Soldier");

  const samWilson = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698759939"];
  assertEquals(samWilson.set_name, "Captain America: Brave New World", "Sam Wilson Captain America #1364 should move to Brave New World");
  assertEquals(samWilson.variant, "Sam Wilson", "Sam Wilson identity should be variant detail");

  const grootCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698795159"];
  assertEquals(grootCap.pop_name, "Groot as Captain America", "Groot as Captain America should keep full crossover title");
  assertEquals(grootCap.set_name, "We Are Groot", "Groot as Captain America should move to We Are Groot");
});

Deno.test("Captain America batch 2 cleans movie/show rows and scoped set totals", () => {
  const flyingCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698768849"];
  assertEquals(flyingCap.set_name, "Captain America: Brave New World", "Flying Captain America should move to Brave New World");
  assertEquals(flyingCap.set_total, 10, "Brave New World rows should carry the reviewed ten-item total");
  assertEquals(flyingCap.variant, "Flying", "Flying Captain America should keep pose detail as variant");

  const shieldWinterSoldier = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698554794"];
  assertEquals(shieldWinterSoldier.pop_name, "Winter Soldier (Shield)", "Winter Soldier #838 should preserve shield identity");
  assertEquals(shieldWinterSoldier.set_name, "Captain America: The Winter Soldier", "Winter Soldier #838 should stay in its movie set");
  assertEquals(shieldWinterSoldier.set_total, 9, "Winter Soldier movie rows should carry the reviewed nine-item total");

  const prototypeCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698632164"];
  assertEquals(prototypeCap.pop_name, "Captain America with Prototype Shield", "Captain America #999 should preserve Prototype Shield identity");
  assertEquals(prototypeCap.set_name, "Captain America: The First Avenger", "Prototype Shield Captain America should move to First Avenger");
  assertEquals(prototypeCap.set_total, 3, "First Avenger rows should keep the reviewed three-item total");

  const blackLightCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698627559"];
  assertEquals(blackLightCap.set_name, "The Falcon and the Winter Soldier", "Black Light Captain America #987 should move to Falcon and Winter Soldier");
  assertEquals(blackLightCap.set_total, 15, "Falcon and Winter Soldier rows should carry the full fifteen-item total");
  assertEquals(blackLightCap.variant, "Black Light", "Black Light Captain America should keep black light as variant detail");
  assertEquals(blackLightCap.exclusivity, "Target", "Black Light Captain America should preserve Target exclusivity");

  const wwiiCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698559386"];
  assertEquals(wwiiCap.pop_name, "WWII Ultimate Captain America", "WWII Ultimates row should clean the product name");
  assertEquals(wwiiCap.set_name, "Captain America", "WWII Ultimate Captain America remains in broad Captain America until the comics bucket is reviewed");

  const unmaskedPanther = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["849803077198"];
  assertEquals(unmaskedPanther.pop_name, "Black Panther (Unmasked)", "Civil War Black Panther #138 should preserve unmasked identity");
  assertEquals(unmaskedPanther.exclusivity, "Walgreens", "Civil War Black Panther #138 should replace generic exclusive with Walgreens");
  assertEquals(unmaskedPanther.set_total, 30, "Civil War rows should carry the reviewed thirty-item total");

  const civilWarIronMan = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["849803072247"];
  const civilWarWinterSoldier = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["849803072339"];
  assertEquals(civilWarIronMan.set_total, 30, "Civil War Iron Man should carry the reviewed total");
  assertEquals(civilWarWinterSoldier.set_total, 30, "Civil War Winter Soldier should carry the reviewed total");
});

Deno.test("Captain America batch 3 moves remaining high-confidence scoped rows", () => {
  const dieCastCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698565592"];
  assertEquals(dieCastCap.pop_name, "Die-Cast Captain America", "Captain America #1 should preserve Die-Cast identity");
  assertEquals(dieCastCap.set_name, "Captain America: Civil War Die-Cast", "Die-Cast Captain America should not stay in broad Captain America");
  assertEquals(dieCastCap.pop_type, "Pop! Die-Cast", "Die-Cast Captain America should keep product type");
  assertEquals(dieCastCap.set_total, 1, "Die-Cast Captain America should carry one-item Die-Cast total");

  const artSeriesCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698561532"];
  assertEquals(artSeriesCap.set_name, "The Falcon and the Winter Soldier", "Art Series #33 should move to Falcon and Winter Soldier");
  assertEquals(artSeriesCap.variant, "Art Series", "Art Series #33 should keep Art Series variant detail");
  assertEquals(artSeriesCap.set_total, 15, "Art Series #33 should carry the Falcon and Winter Soldier total");

  const winterSoldierCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["849803037871"];
  assertEquals(winterSoldierCap.set_name, "Captain America: The Winter Soldier", "Captain America #41 should move to Winter Soldier");
  assertEquals(winterSoldierCap.set_total, 9, "Captain America #41 should carry the Winter Soldier total");

  const blueCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698576147"];
  assertEquals(blueCap.set_name, "Marvel Studios: The Infinity Saga", "Blue Art Series #46 should move to Infinity Saga");
  assertEquals(blueCap.variant, "Blue / Art Series", "Blue Art Series #46 should preserve color and line detail");

  const infinityWarCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698264662"];
  assertEquals(infinityWarCap.set_name, "Avengers: Infinity War", "Captain America #288 should move to Infinity War");

  const streetArtCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698496360"];
  assertEquals(streetArtCap.set_name, "Marvel Street Art", "Captain America #752 should move to Marvel Street Art");
  assertEquals(streetArtCap.pop_style, "Deluxe", "Street Art Captain America should keep Deluxe style");
  assertEquals(streetArtCap.set_total, 7, "Street Art Captain America should carry the Marvel Street Art total");

  const walker = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698516273"];
  const commonCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698516303"];
  assertEquals(walker.set_total, 15, "John F. Walker should carry the Falcon and Winter Soldier total");
  assertEquals(commonCap.variant, null, "Captain America #814 should not store Common as variant detail");
  assertEquals(commonCap.set_total, 15, "Captain America #814 should carry the Falcon and Winter Soldier total");
});

Deno.test("Captain America batch 4 protects adjacent Infinity Saga rows and Infinity War identities", () => {
  const wwiiCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698559386"];
  assertEquals(wwiiCap.set_name, "Captain America", "WWII Ultimate Captain America should remain a reviewed broad-set exception");
  assertEquals(wwiiCap.set_total, null, "WWII Ultimate Captain America should not receive a guessed broad Captain America total");

  const infinitySagaCap = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698576147"];
  const infinitySagaIronMan = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698576178"];
  const infinitySagaThor = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698576185"];
  const infinitySagaHawkeye = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698576154"];
  assertEquals(infinitySagaCap.pop_name, "Captain America (Art Series)", "Infinity Saga Captain America #46 should use Art Series identity");
  assertEquals(infinitySagaCap.set_total, null, "Infinity Saga owned rows should wait for a full denominator pass");
  assertEquals(infinitySagaIronMan.variant, "Yellow / Art Series", "Infinity Saga Iron Man should preserve yellow Art Series detail");
  assertEquals(infinitySagaThor.pop_style, "Art Series", "Infinity Saga Thor should use Art Series style");
  assertEquals(infinitySagaHawkeye.variant, "Orange / Art Series", "Infinity Saga Hawkeye should preserve orange Art Series detail");

  const infinityWarIronMan = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698264631"];
  const infinityWarThor = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698264648"];
  const infinityWarGitdThor = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698297738"];
  const infinityWarThanos = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698362184"];
  const infinityWarThanos415 = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698362177"];
  const infinityWarGroot = CAPTAIN_AMERICA_REFRESH_REGRESSION_OVERRIDES["889698357739"];
  assertEquals(infinityWarIronMan.pop_name, "Iron Man (Mark L)", "Infinity War Iron Man #285 should preserve Mark L identity");
  assertEquals(infinityWarThor.pop_name, "Thor (Stormbreaker)", "Infinity War Thor #286 should preserve Stormbreaker identity");
  assertEquals(infinityWarThor.set_total, 51, "Infinity War rows should carry the verified fifty-one-item denominator");
  assertEquals(infinityWarGitdThor.exclusivity, "Asia Exclusive", "Glow Thor should preserve Asia Exclusive detail");
  assertEquals(infinityWarGitdThor.set_total, 51, "Glow Thor should carry the verified Infinity War denominator");
  assertEquals(infinityWarThanos.pop_name, "Thanos (Gauntlet)", "Chrome Thanos rows should preserve Gauntlet identity");
  assertEquals(infinityWarThanos415.pop_name, "Thanos (Purple Chrome)", "Thanos #415 should not inherit the Gauntlet #289 identity");
  assertEquals(infinityWarGroot.variant, "Stormbreaker", "Groot #416 should keep Stormbreaker detail");
  assertEquals(infinityWarGroot.set_total, 51, "Groot #416 should carry the verified Infinity War denominator");
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
