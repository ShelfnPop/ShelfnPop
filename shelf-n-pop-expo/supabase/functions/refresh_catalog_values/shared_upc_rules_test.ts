import {
  isProtectedSharedUpcFamily,
  PROTECTED_SHARED_UPC_FAMILIES,
  sharedUpcProtectionMessage,
} from "./shared_upc_rules.ts";

function assertEquals(
  actual: unknown,
  expected: unknown,
  message: string,
): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${message}: expected ${JSON.stringify(expected)}, got ${
        JSON.stringify(actual)
      }`,
    );
  }
}

Deno.test("Hulk and Vision shared UPC families are excluded from bulk value refresh", () => {
  assertEquals(
    isProtectedSharedUpcFamily("849803055790"),
    true,
    "Hulk must be protected",
  );
  assertEquals(
    isProtectedSharedUpcFamily("849803047825"),
    true,
    "Vision must be protected",
  );
  assertEquals(
    PROTECTED_SHARED_UPC_FAMILIES.size,
    2,
    "unexpected protected UPC count",
  );
});

Deno.test("Grinning Ultron remains eligible because its UPC identifies the convention product", () => {
  assertEquals(
    isProtectedSharedUpcFamily("849803056063"),
    false,
    "Ultron should remain eligible",
  );
  assertEquals(
    sharedUpcProtectionMessage("849803056063"),
    null,
    "Ultron should not have a protection message",
  );
});

Deno.test("shared UPC matching normalizes surrounding whitespace", () => {
  assertEquals(
    isProtectedSharedUpcFamily(" 849803055790 "),
    true,
    "whitespace normalization failed",
  );
  assertEquals(
    Boolean(sharedUpcProtectionMessage("849803055790")),
    true,
    "missing protection reason",
  );
});
