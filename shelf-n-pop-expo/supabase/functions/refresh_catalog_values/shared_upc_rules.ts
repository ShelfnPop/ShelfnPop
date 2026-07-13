export const PROTECTED_SHARED_UPC_FAMILIES = new Set([
  "849803047825", // Vision #71: Common, Metallic, and Faded share the manufacturer UPC.
  "849803055790", // Hulk #68: Common, Rampaging, and Glow in the Dark share the manufacturer UPC.
]);

export function isProtectedSharedUpcFamily(upc: unknown): boolean {
  return PROTECTED_SHARED_UPC_FAMILIES.has(String(upc ?? "").trim());
}

export function sharedUpcProtectionMessage(upc: unknown): string | null {
  if (!isProtectedSharedUpcFamily(upc)) return null;
  return "Shared manufacturer UPC is protected; use lookup_pop for a controlled neutral-family refresh.";
}
