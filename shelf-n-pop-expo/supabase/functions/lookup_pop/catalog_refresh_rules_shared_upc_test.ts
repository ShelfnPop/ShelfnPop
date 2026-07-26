import {
  APPROVED_CATALOG_CLEANUP_OVERRIDES,
  buildCatalogRefreshUpdate,
  getStaticCatalogOverride,
  resolveLookupEstimatedValues,
} from "./catalog_refresh_rules.ts";

function assertEquals(
  actual: unknown,
  expected: unknown,
  message: string,
): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${message}\nexpected: ${JSON.stringify(expected)}\nactual: ${
        JSON.stringify(actual)
      }`,
    );
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const BATCH_3_4_UPCS = [
  "889698579261",
  "889698548984",
  "889698264648",
  "889698297738",
  "889698264655",
  "889698269018",
  "889698269049",
  "889698357746",
  "849803055790",
  "849803047825",
  "849803056063",
] as const;

Deno.test("all Batch 3 and Batch 4 identities are durable and do not pin prices", () => {
  for (const upc of BATCH_3_4_UPCS) {
    const override = APPROVED_CATALOG_CLEANUP_OVERRIDES[upc];
    assert(override, `missing approved override for ${upc}`);
    assert(
      !Object.prototype.hasOwnProperty.call(override, "estimated_value"),
      `${upc} pins estimated_value`,
    );
    assertEquals(
      getStaticCatalogOverride(upc),
      override,
      `${upc} must have final static precedence`,
    );
  }
});

Deno.test("Batch 3 identity corrections remain intact", () => {
  const expected = {
    "889698579261": [
      "Thanos",
      "Avengers: Endgame",
      "909",
      "Blacklight",
      "Target",
      "Standard",
    ],
    "889698548984": [
      "Victory Shawarma: Black Widow",
      "Victory Shawarma",
      "759",
      null,
      "Amazon",
      "Deluxe",
    ],
    "889698264648": [
      "Thor (Stormbreaker)",
      "Avengers: Infinity War",
      "286",
      "Stormbreaker",
      null,
      "Standard",
    ],
    "889698297738": [
      "Thor",
      "Avengers: Infinity War",
      "286",
      "Glow in the Dark",
      "Asia Exclusive",
      "Standard",
    ],
    "889698264655": [
      "Iron Spider",
      "Avengers: Infinity War",
      "287",
      null,
      null,
      "Standard",
    ],
    "889698269018": [
      "Ebony Maw",
      "Avengers: Infinity War",
      "291",
      null,
      null,
      "Standard",
    ],
    "889698269049": [
      "Teen Groot with Gun",
      "Avengers: Infinity War",
      "293",
      null,
      null,
      "Standard",
    ],
    "889698357746": [
      "Young Gamora",
      "Avengers: Infinity War",
      "417",
      null,
      null,
      "Standard",
    ],
  } as const;

  for (const [upc, identity] of Object.entries(expected)) {
    const override =
      APPROVED_CATALOG_CLEANUP_OVERRIDES[upc as keyof typeof expected];
    assertEquals(
      [
        override.pop_name,
        override.set_name,
        override.number,
        override.variant,
        override.exclusivity,
        override.pop_style,
      ],
      identity,
      `${upc} identity drifted`,
    );
  }
});

Deno.test("Hulk, Vision, and Grinning Ultron keep approved shared-UPC identities", () => {
  const hulk = APPROVED_CATALOG_CLEANUP_OVERRIDES["849803055790"];
  const vision = APPROVED_CATALOG_CLEANUP_OVERRIDES["849803047825"];
  const ultron = APPROVED_CATALOG_CLEANUP_OVERRIDES["849803056063"];
  assertEquals([hulk.pop_name, hulk.number, hulk.variant, hulk.exclusivity], [
    "Hulk",
    "68",
    null,
    null,
  ], "Hulk identity");
  assertEquals(
    [vision.pop_name, vision.number, vision.variant, vision.exclusivity],
    ["Vision", "71", null, null],
    "Vision identity",
  );
  assertEquals(
    [
      ultron.pop_name,
      ultron.character,
      ultron.number,
      ultron.variant,
      ultron.exclusivity,
      ultron.vault_status,
    ],
    ["Grinning Ultron", "Ultron", "83", null, "Summer Convention", "Vaulted"],
    "Grinning Ultron identity",
  );
});

Deno.test("trusted explicit nulls clear stale variant and exclusivity on force refresh", () => {
  const refreshed = buildCatalogRefreshUpdate(
    { variant: "Savage", exclusivity: "Exclusive", needs_review: false },
    {
      variant: null,
      exclusivity: null,
      parse_confidence: 0.98,
      needs_review: false,
    },
    {
      forceRefresh: true,
      hasExclusivityOverride: false,
      imageBlocked: false,
      resolvedRefreshEstimatedValue: 9.5,
      forcedFields: { variant: null, exclusivity: null },
    },
  );
  assertEquals(refreshed.variant, null, "explicit null variant was lost");
  assertEquals(
    refreshed.exclusivity,
    null,
    "explicit null exclusivity was lost",
  );
});

Deno.test("absent trusted fields preserve existing identity fields", () => {
  const refreshed = buildCatalogRefreshUpdate(
    { variant: "Metallic", exclusivity: "Target", needs_review: false },
    {
      variant: null,
      exclusivity: null,
      parse_confidence: 0.9,
      needs_review: false,
    },
    {
      forceRefresh: true,
      hasExclusivityOverride: false,
      imageBlocked: false,
      resolvedRefreshEstimatedValue: null,
      forcedFields: { pop_name: "Example" },
    },
  );
  assertEquals([refreshed.variant, refreshed.exclusivity], [
    "Metallic",
    "Target",
  ], "unowned fields were cleared");
});

Deno.test("request exclusivity has precedence over trusted and parsed values", () => {
  const refreshed = buildCatalogRefreshUpdate(
    { exclusivity: "Existing", needs_review: false },
    { exclusivity: "Trusted", parse_confidence: 0.9, needs_review: false },
    {
      forceRefresh: true,
      hasExclusivityOverride: true,
      exclusivityOverride: "Requested",
      imageBlocked: false,
      resolvedRefreshEstimatedValue: null,
      forcedFields: { exclusivity: "Trusted" },
    },
  );
  assertEquals(
    refreshed.exclusivity,
    "Requested",
    "request exclusivity did not win",
  );
});

Deno.test("request variant pricing stays response-only and never changes catalog variant", () => {
  const refreshed = buildCatalogRefreshUpdate(
    { variant: null, estimated_value: 9.5, needs_review: false },
    {
      variant: null,
      estimated_value: 12.48,
      parse_confidence: 0.98,
      needs_review: false,
    },
    {
      forceRefresh: true,
      hasExclusivityOverride: false,
      imageBlocked: false,
      resolvedRefreshEstimatedValue: 9.5,
      forcedFields: { variant: null },
    },
  );
  assertEquals(
    refreshed.variant,
    null,
    "owned variant leaked into catalog identity",
  );
  assertEquals(
    resolveLookupEstimatedValues(9.5, 12.48, 19.57),
    { catalogEstimatedValue: 9.5, lookupEstimatedValue: 19.57 },
    "owned variant leaked into catalog pricing",
  );
});

Deno.test("normal, force-refresh, and insert value resolution keep catalog and response values separate", () => {
  assertEquals(
    resolveLookupEstimatedValues(9.5, 9.5, 19.57),
    { catalogEstimatedValue: 9.5, lookupEstimatedValue: 19.57 },
    "normal lookup separation",
  );
  assertEquals(
    resolveLookupEstimatedValues(9.5, 12.48, 19.57),
    { catalogEstimatedValue: 9.5, lookupEstimatedValue: 19.57 },
    "force-refresh separation",
  );
  assertEquals(
    resolveLookupEstimatedValues(null, 9.5, 19.57),
    { catalogEstimatedValue: 9.5, lookupEstimatedValue: 19.57 },
    "insert separation",
  );
  assertEquals(
    resolveLookupEstimatedValues(9.5, 11.85, null),
    { catalogEstimatedValue: 11.85, lookupEstimatedValue: 11.85 },
    "ordinary exact-UPC catalog refresh",
  );
});
