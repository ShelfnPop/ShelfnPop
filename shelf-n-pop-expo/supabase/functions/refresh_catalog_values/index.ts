import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CatalogRow = {
  id: string;
  upc: string;
  pop_name: string | null;
  character: string | null;
  franchise: string | null;
  set_name: string | null;
  number: string | null;
  variant: string | null;
  image_url: string | null;
  release_date: string | null;
  estimated_value: number | string | null;
  api_source: string | null;
  raw_api_json: any;
};

type RefreshResult = {
  id: string;
  upc: string;
  pop_name: string | null;
  old_value: number | null;
  new_value: number | null;
  status: "updated" | "skipped" | "failed" | "review";
  message?: string;
  pricecharting_product_name?: string | null;
  price_field?: string | null;
};

const BLOCKED_IMAGE_UPCS = new Set([
  "889698160162",
  "889698430210",
  "889698217842",
]);

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function extractReleaseDate(raw: any): string | null {
  const dateText = String(raw?.["release-date"] ?? raw?.release_date ?? raw?.releaseDate ?? "").trim();
  if (/^(19|20)\d{2}-\d{2}-\d{2}$/.test(dateText)) return dateText;
  if (/^(19|20)\d{2}$/.test(dateText)) return `${dateText}-01-01`;
  return null;
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

function centsToDollars(value: unknown): number | null {
  const cents = Number(value);
  if (!Number.isFinite(cents) || cents <= 0) return null;
  return Number((cents / 100).toFixed(2));
}

function pickPriceChartingValue(raw: any): { value: number; field: string } | null {
  for (const field of ["new-price", "cib-price", "loose-price"]) {
    const value = centsToDollars(raw?.[field]);
    if (value != null) return { value, field };
  }

  return null;
}

function titleCaseLoose(value: string): string {
  return normalizeWhitespace(value)
    .split(" ")
    .map((part) => {
      if (!part) return part;
      if (part.length <= 4 && part === part.toUpperCase()) return part;
      if (part.includes("&")) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function stripBracketNotes(value: string): string {
  return normalizeWhitespace(value.replace(/\[[^\]]+\]/g, " ").replace(/\([^)]*exclusive[^)]*\)/gi, " "));
}

function extractPriceChartingNumber(raw: any): string | null {
  const productName = String(raw?.["product-name"] ?? "");
  const match = productName.match(/#\s?(\d{1,5})\b/);
  return match ? match[1] : null;
}

function extractPriceChartingName(raw: any): string | null {
  const productName = String(raw?.["product-name"] ?? "");
  if (!productName) return null;

  const cleaned = stripBracketNotes(productName)
    .replace(/#\s?\d{1,5}\b/g, " ")
    .replace(/\bFunko\b/gi, " ")
    .replace(/\bPOP!?\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

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
  if (bracketValue === "chase" || /\bchase\b/i.test(productName)) return "Chase";
  if (bracketValue === "convention" || haystack.includes("convention")) return "Convention";
  if (haystack.includes("bloody")) return "Bloody";

  return bracket ? titleCaseLoose(bracket[1]) : null;
}

function normalizePriceChartingSet(value: unknown): string | null {
  const raw = normalizeWhitespace(String(value ?? ""));
  if (!raw) return null;

  let cleaned = raw
    .replace(/^Pop!?\s+(Television|Movies|Marvel|Heroes|Animation|Ad Icons|Asia)\s*,?\s*/i, " ")
    .replace(/\s*[.,]\s*(Australia|Canada|Funko|Flocked|GITD|Glow in the Dark|SDCC|NYCC|Convention|Summer Convention Exclusive|Fall Convention Exclusive)\b.*$/i, " ")
    .replace(/\b(FYE|Hot Topic|Target|Walmart|Walgreens|GameStop|BoxLunch|Amazon|Funko Shop|Specialty Series)\s*(Exclusive)?\.?\s*/gi, " ")
    .replace(/\bExclusive\b/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/[\s,.]+$/, "")
    .trim();

  if (!cleaned) return null;
  if (/five night'?s at freddy'?s/i.test(cleaned)) return "Five Nights at Freddy's";
  return titleCaseLoose(cleaned.replace(/&/g, "and"));
}

function extractPriceChartingFranchise(raw: any, existing: CatalogRow): string | null {
  const consoleName = normalizeMatchText(raw?.["console-name"]);
  const genre = normalizeMatchText(raw?.["genre"]);
  const combined = `${consoleName} ${genre}`;

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

  return existing.franchise;
}

function isWeakName(value: string | null): boolean {
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

function buildPriceChartingEnrichment(row: CatalogRow, raw: any): Record<string, unknown> {
  const updates: Record<string, unknown> = {};
  const pcName = extractPriceChartingName(raw);
  const pcNumber = extractPriceChartingNumber(raw);
  const pcVariant = extractPriceChartingVariant(raw);
  const pcSet = normalizePriceChartingSet(raw?.["genre"]);
  const pcFranchise = extractPriceChartingFranchise(raw, row);
  const pcImage = typeof raw?.image === "string" ? raw.image : null;

  if (pcName && (isWeakName(row.pop_name) || pcName.length + 10 < String(row.pop_name ?? "").length)) {
    updates.pop_name = pcName;
    updates.character = pcName;
  }

  if (pcNumber && (!row.number || row.number.length > 5)) {
    updates.number = pcNumber;
  }

  if (
    pcNumber &&
    row.number &&
    row.number !== pcNumber &&
    (/^(19|20)\d{2}$/.test(row.number) || row.number === String(raw?.["release-date"] ?? "").slice(0, 4))
  ) {
    updates.number = pcNumber;
  }

  if (pcVariant && (!row.variant || row.variant === "Common")) {
    updates.variant = pcVariant;
  }

  if (pcSet && (!row.set_name || row.set_name === row.franchise)) {
    updates.set_name = pcSet;
  }

  if (pcFranchise && (!row.franchise || row.franchise === row.set_name || row.franchise === "One Piece")) {
    updates.franchise = pcFranchise;
  }

  if (BLOCKED_IMAGE_UPCS.has(row.upc)) {
    if (row.image_url) {
      updates.image_url = null;
      updates.image_source = null;
      updates.image_last_checked = new Date().toISOString();
    }
  } else if (pcImage && !row.image_url) {
    updates.image_url = pcImage;
    updates.image_source = "pricecharting";
    updates.image_last_checked = new Date().toISOString();
  }

  return updates;
}

function isLikelyMatch(raw: any, row: CatalogRow): boolean {
  const productName = normalizeMatchText(raw?.["product-name"]);
  const consoleName = normalizeMatchText(raw?.["console-name"]);
  const genre = normalizeMatchText(raw?.["genre"]);
  const combined = `${productName} ${consoleName} ${genre}`;
  const character = normalizeMatchText(row.character ?? row.pop_name);
  const franchise = normalizeMatchText(row.franchise);
  const setName = normalizeMatchText(row.set_name);
  const number = normalizeMatchText(row.number);

  if (!productName) return false;
  if (character && !hasMeaningfulOverlap(combined, character)) return false;
  if (franchise && setName && !combined.includes(franchise) && !combined.includes(setName)) return false;
  if (number && !hasExactNumberMatch(combined, number)) return false;

  return true;
}

function looksSuspicious(oldValue: number | null, newValue: number | null): boolean {
  if (newValue == null || newValue <= 0) return true;
  if (oldValue == null || oldValue <= 0) return false;

  const change = Math.abs(newValue - oldValue);
  const ratio = newValue / oldValue;
  return change >= 50 && (ratio >= 3 || ratio <= 0.34);
}

async function fetchPriceChartingValue(
  token: string,
  row: CatalogRow,
): Promise<{ value: number; field: string; raw: any } | null> {
  const requests: Array<{ url: string; requiresMatch: boolean }> = [
    {
      url: `https://www.pricecharting.com/api/product?t=${encodeURIComponent(token)}&upc=${encodeURIComponent(row.upc)}`,
      requiresMatch: true,
    },
  ];

  const queryParts = [
    row.pop_name,
    row.franchise,
    row.number ? `#${row.number}` : null,
    row.variant && row.variant !== "Common" ? row.variant : null,
    "Funko Pop",
  ].filter(Boolean);

  if (queryParts.length > 1) {
    requests.push({
      url: `https://www.pricecharting.com/api/product?t=${encodeURIComponent(token)}&q=${encodeURIComponent(queryParts.join(" "))}`,
      requiresMatch: true,
    });
  }

  for (const request of requests) {
    const response = await fetch(request.url);
    if (!response.ok) continue;

    const raw = await response.json();
    if (raw?.status !== "success") continue;
    if (request.requiresMatch && !isLikelyMatch(raw, row)) continue;

    const picked = pickPriceChartingValue(raw);
    if (!picked) continue;

    return {
      value: picked.value,
      field: picked.field,
      raw,
    };
  }

  return null;
}

async function requireAdmin(req: Request, supabase: any): Promise<boolean> {
  const maintenanceToken = Deno.env.get("MAINTENANCE_ADMIN_TOKEN") ?? "";
  const providedToken =
    req.headers.get("x-maintenance-token") ??
    req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");

  if (maintenanceToken && providedToken === maintenanceToken) return true;

  const allowedEmails = String(Deno.env.get("MAINTENANCE_ADMIN_EMAILS") ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length === 0) return false;

  const jwt = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!jwt) return false;

  const { data, error } = await supabase.auth.getUser(jwt);
  if (error || !data.user?.email) return false;

  return allowedEmails.includes(data.user.email.toLowerCase());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const priceChartingToken = Deno.env.get("PRICECHARTING_API_TOKEN") ?? "";
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (!priceChartingToken) {
      return new Response(
        JSON.stringify({ ok: false, error: "PRICECHARTING_API_TOKEN is not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!(await requireAdmin(req, supabase))) {
      return new Response(
        JSON.stringify({ ok: false, error: "Not authorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.max(1, Math.min(Number(body?.limit ?? 25), 50));
    const dryRun = Boolean(body?.dryRun ?? false);
    const staleBefore = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: rows, error } = await supabase
      .from("pop_catalog")
      .select("id,upc,pop_name,character,franchise,set_name,number,variant,image_url,release_date,estimated_value,api_source,raw_api_json")
      .not("upc", "is", null)
      .or(`api_source.is.null,api_source.not.ilike.%pricecharting%,api_last_updated.is.null,api_last_updated.lt.${staleBefore}`)
      .order("api_last_updated", { ascending: true, nullsFirst: true })
      .limit(limit);

    if (error) throw error;

    const results: RefreshResult[] = [];

    for (const row of (rows ?? []) as CatalogRow[]) {
      const oldValue = row.estimated_value == null ? null : Number(row.estimated_value);

      try {
        const priceChartingStatus = row.raw_api_json?.pricecharting?.status;
        const priceChartingReason = row.raw_api_json?.pricecharting?.reason;
        if (priceChartingStatus === "manual_skip") {
          results.push({
            id: row.id,
            upc: row.upc,
            pop_name: row.pop_name,
            old_value: oldValue,
            new_value: null,
            status: "skipped",
            message: priceChartingReason ?? "Manually skipped PriceCharting match",
          });
          continue;
        }

        const priceCharting = await fetchPriceChartingValue(priceChartingToken, row);

        if (!priceCharting) {
          if (!dryRun) {
            const { error: skipUpdateError } = await supabase
              .from("pop_catalog")
              .update({
                api_last_updated: new Date().toISOString(),
                raw_api_json: {
                  primary: row.raw_api_json,
                  pricecharting: {
                    skipped_at: new Date().toISOString(),
                    reason: "No safe PriceCharting match",
                  },
                },
              })
              .eq("id", row.id);

            if (skipUpdateError) throw skipUpdateError;
          }

          results.push({
            id: row.id,
            upc: row.upc,
            pop_name: row.pop_name,
            old_value: oldValue,
            new_value: null,
            status: "skipped",
            message: "No safe PriceCharting match",
          });
          continue;
        }

        const suspicious = looksSuspicious(oldValue, priceCharting.value);
        const nextRaw = {
          primary: row.raw_api_json,
          pricecharting: {
            price_field: priceCharting.field,
            response: priceCharting.raw,
          },
        };
        const releaseDate = extractReleaseDate(priceCharting.raw);

        if (!dryRun) {
          const { error: updateError } = await supabase
            .from("pop_catalog")
            .update({
              estimated_value: priceCharting.value,
              release_date: releaseDate ?? row.release_date,
              api_source: `${row.api_source ?? "catalog"}+pricecharting`,
              api_last_updated: new Date().toISOString(),
              raw_api_json: nextRaw,
            })
            .eq("id", row.id);

          if (updateError) throw updateError;
        }

        results.push({
          id: row.id,
          upc: row.upc,
          pop_name: row.pop_name,
          old_value: oldValue,
          new_value: priceCharting.value,
          status: suspicious ? "review" : "updated",
          pricecharting_product_name: priceCharting.raw?.["product-name"] ?? null,
          price_field: priceCharting.field,
        });
      } catch (error) {
        results.push({
          id: row.id,
          upc: row.upc,
          pop_name: row.pop_name,
          old_value: oldValue,
          new_value: null,
          status: "failed",
          message: errorMessage(error),
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1250));
    }

    return new Response(
      JSON.stringify({
        ok: true,
        dryRun,
        requested: limit,
        processed: results.length,
        updated: results.filter((result) => result.status === "updated").length,
        review: results.filter((result) => result.status === "review").length,
        skipped: results.filter((result) => result.status === "skipped").length,
        failed: results.filter((result) => result.status === "failed").length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: errorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
