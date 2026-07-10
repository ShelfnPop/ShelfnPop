import {
  BLOCKED_IMAGE_UPCS,
  buildCatalogRefreshUpdate,
  getSetTotalOverride,
  getStaticCatalogOverride,
  mergeNeedsReview,
  shouldPromoteSpecificSet,
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

const expectedRefreshResults = {
  "889698818667": { value: 26.49, vault_status: "Active" },
  "889698918008": { value: 48.67, vault_status: "Active" },
  "889698585019": { value: 7.15, vault_status: "Vaulted" },
  "889698608527": { value: 7.93, vault_status: "Active" },
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

Deno.test("specific set total overrides fill known small buckets", () => {
  assertEquals(getSetTotalOverride("300 Movie"), 6, "300 Movie should use the full 2023 movie release total");
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
  assertEquals(getSetTotalOverride("Cartoon Network"), 8, "Cartoon Network should use the Pop-only checklist total");
  assertEquals(getSetTotalOverride("Chilly Willy"), 4, "Chilly Willy should use the full Funko checklist total");
  assertEquals(getSetTotalOverride("Cocaine Bear"), 2, "Cocaine Bear should use the two figure movie checklist total");
  assertEquals(getSetTotalOverride("Coco"), 13, "Coco should use the full checklist total");
  assertEquals(getSetTotalOverride("Crash Bandicoot"), 13, "Crash Bandicoot should use the Pop vinyl checklist total");
  assertEquals(getSetTotalOverride("Cuphead"), 30, "Cuphead should use the full checklist total");
  assertEquals(getSetTotalOverride("Deadpool The Duck"), 1, "Deadpool The Duck should use the one figure subline total");
  assertEquals(getSetTotalOverride("Despicable Me 2"), 10, "Despicable Me 2 should use the full movie checklist total");
  assertEquals(getSetTotalOverride("Dexter"), 3, "Dexter should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("Disney Archives"), 8, "Disney Archives should use the Disney Archives Pop checklist total");
  assertEquals(getSetTotalOverride("Disturbed"), 1, "Disturbed should use the one figure checklist total");
  assertEquals(getSetTotalOverride("Dolly Parton"), 6, "Dolly Parton should use the full Funko checklist total");
  assertEquals(getSetTotalOverride("Duck Dodgers"), 12, "Duck Dodgers should use the Pop vinyl subset checklist total");
  assertEquals(getSetTotalOverride("Dumb And Dumber"), 14, "Dumb And Dumber title-case variant should use the full Funko checklist total");
  assertEquals(getSetTotalOverride("Dumb and Dumber"), 14, "Dumb and Dumber should use the full Funko checklist total");
  assertEquals(getSetTotalOverride("Dumbo"), 7, "Dumbo should use the full Disney checklist total");
  assertEquals(getSetTotalOverride("Disneyland Resort 65th Anniversary"), 20, "Disneyland Resort 65th Anniversary should use the full 65th Anniversary Pop checklist total");
  assertEquals(getSetTotalOverride("Echo"), 2, "Echo should use the two figure Marvel Studios release total");
  assertEquals(getSetTotalOverride("Elvis Presley"), 18, "Elvis Presley should use the full checklist total");
  assertEquals(getSetTotalOverride("Evil Dead 40th Anniversary"), 2, "Evil Dead 40th Anniversary should use the common plus chase total");
  assertEquals(getSetTotalOverride("Fantasia"), 12, "Fantasia should use the full Disney checklist total");
  assertEquals(getSetTotalOverride("Fantastik Plastik"), 73, "Fantastik Plastik should use the full Pop vinyl checklist total");
  assertEquals(getSetTotalOverride("Fantastic Beasts: The Crimes of Grindelwald"), 40, "Fantastic Beasts should use the full checklist total");
  assertEquals(getSetTotalOverride("Finding Dory"), 2, "Finding Dory should use the two figure Finding Dory Pop subset total");
  assertEquals(getSetTotalOverride("Fortnite"), 64, "Fortnite should use the Pop vinyl checklist total");
  assertEquals(getSetTotalOverride("Free Guy"), 1, "Free Guy should use the one figure checklist total");
  assertEquals(getSetTotalOverride("Frozen"), 26, "Frozen should use the Pop vinyl subset checklist total");
  assertEquals(getSetTotalOverride("G.I. Joe"), 25, "G.I. Joe should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("Grey's Anatomy"), 4, "Grey's Anatomy should use the full television checklist total");
  assertEquals(getSetTotalOverride("Guardians of the Galaxy Holiday Special"), 5, "Guardians Holiday Special should use the five figure holiday release total");
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
  assertEquals(getSetTotalOverride("Onward"), 7, "Onward should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("Pinky and the Brain"), 1, "Pinky and the Brain should use the one 2-pack catalog item total");
  assertEquals(getSetTotalOverride("Poltergeist II: The Other Side"), 1, "Poltergeist II should use the one figure checklist total");
  assertEquals(getSetTotalOverride("Pirates Of The Caribbean Dead Men Tell No Tales"), 5, "Pirates Dead Men Tell No Tales should use the movie subset total");
  assertEquals(getSetTotalOverride("Psych"), 1, "Psych should use the one 2-pack catalog item total");
  assertEquals(getSetTotalOverride("Robocop"), 5, "Robocop should use the full Pop checklist total");
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
  assertEquals(getSetTotalOverride("Spider-Man 2"), 10, "Spider-Man 2 should use the full game Pop checklist total");
  assertEquals(getSetTotalOverride("Spider-Man: Far From Home"), 15, "Far From Home should use the full movie Pop checklist total");
  assertEquals(getSetTotalOverride("Spider-Man: Into The Spider-Verse"), 11, "Into The Spider-Verse should use the full movie Pop checklist total");
  assertEquals(getSetTotalOverride("Spider-Man: Maximum Venom"), 9, "Maximum Venom should use the full subseries checklist total");
  assertEquals(getSetTotalOverride("Spider-Man: Miles Morales"), 16, "Miles Morales should use the full Pop vinyl checklist total");
  assertEquals(getSetTotalOverride("Spellbound"), 1, "Spellbound should use the one Pop and Buddy release total");
  assertEquals(getSetTotalOverride("Stargate SG-1"), 7, "Stargate SG-1 should use the full Stargate Pop checklist total");
  assertEquals(getSetTotalOverride("Star Trek II: The Wrath of Khan"), 2, "Wrath of Khan should use the two exclusive Pop releases");
  assertEquals(getSetTotalOverride("Star Trek The Next Generation"), 5, "Star Trek The Next Generation should use the five digital Pop release total");
  assertEquals(getSetTotalOverride("Star Trek Transporter"), 3, "Star Trek Transporter should use the three glitter transporter Pop Plus releases");
  assertEquals(getSetTotalOverride("Ted Lasso"), 23, "Ted Lasso should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("The Batman"), 15, "The Batman should use the full subseries checklist total");
  assertEquals(getSetTotalOverride("The Flash (TV Series)"), 21, "The Flash TV series should use the full Pop checklist total");
  assertEquals(getSetTotalOverride("The Godfather: 50 Years"), 3, "The Godfather 50 Years should use the three figure anniversary total");
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
