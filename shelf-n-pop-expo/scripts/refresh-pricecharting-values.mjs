import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env");

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && !process.env[key]) process.env[key] = value;
  }
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY;

const batchSize = Number(process.env.BATCH_SIZE ?? process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] ?? 25);
const delayMs = Number(process.env.DELAY_MS ?? process.argv.find((arg) => arg.startsWith("--delay="))?.split("=")[1] ?? 1250);
const forceRefresh = process.argv.includes("--force");
const includeAll = process.argv.includes("--all");
const upcArg = process.argv.find((arg) => arg.startsWith("--upcs="))?.split("=")[1] ?? "";

if (!supabaseUrl || !anonKey) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.");
  process.exit(1);
}

const headers = {
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
  "Content-Type": "application/json",
};

const money = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? `$${number.toFixed(2)}` : "--";
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchCatalogRows() {
  if (upcArg) {
    return upcArg
      .split(",")
      .map((upc) => upc.trim())
      .filter(Boolean)
      .map((upc) => ({
        id: null,
        upc,
        pop_name: "",
        estimated_value: null,
        api_source: "",
        api_last_updated: null,
      }));
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/pop_catalog?select=id,upc,pop_name,estimated_value,api_source,api_last_updated&order=api_last_updated.asc.nullsfirst&limit=1000`,
    { headers },
  );

  if (!response.ok) {
    throw new Error(`Could not fetch catalog rows: ${response.status} ${await response.text()}`);
  }

  return await response.json();
}

function needsPriceCharting(row) {
  if (includeAll) return true;
  return !String(row.api_source ?? "").includes("pricecharting");
}

function isSuspicious(before, after) {
  const oldValue = Number(before.estimated_value ?? 0);
  const newValue = Number(after.estimated_value ?? 0);

  if (!Number.isFinite(newValue) || newValue <= 0) return true;
  if (!oldValue || oldValue <= 0) return false;

  const ratio = newValue / oldValue;
  const absoluteChange = Math.abs(newValue - oldValue);
  return absoluteChange >= 50 && (ratio >= 3 || ratio <= 0.34);
}

async function refreshRow(row) {
  const response = await fetch(`${supabaseUrl}/functions/v1/lookup_pop`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      barcode: row.upc,
      forceRefresh,
    }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body?.found || !body?.pop) {
    return {
      ok: false,
      row,
      message: body?.error ?? body?.message ?? `HTTP ${response.status}`,
    };
  }

  return {
    ok: true,
    row,
    pop: body.pop,
    suspicious: isSuspicious(row, body.pop),
  };
}

const rows = (await fetchCatalogRows()).filter(needsPriceCharting).slice(0, batchSize);

console.log(`Found ${rows.length} catalog rows to refresh in this batch.`);
console.log(`Delay: ${delayMs}ms. Force refresh: ${forceRefresh ? "yes" : "no"}. Include all: ${includeAll ? "yes" : "no"}.`);

let updated = 0;
let failed = 0;
const suspicious = [];

for (const [index, row] of rows.entries()) {
  const label = `${index + 1}/${rows.length} ${row.upc} ${row.pop_name ?? ""}`.trim();

  try {
    const result = await refreshRow(row);

    if (!result.ok) {
      failed += 1;
      console.log(`FAILED ${label}: ${result.message}`);
    } else {
      updated += 1;
      const source = result.pop.api_source ?? "";
      const line = `${label}: ${money(row.estimated_value)} -> ${money(result.pop.estimated_value)} [${source}]`;
      console.log(result.suspicious ? `CHECK ${line}` : `OK ${line}`);
      if (result.suspicious) suspicious.push({ row, pop: result.pop });
    }
  } catch (error) {
    failed += 1;
    console.log(`FAILED ${label}: ${error?.message ?? error}`);
  }

  if (index < rows.length - 1) await sleep(delayMs);
}

console.log("");
console.log(`Done. Updated: ${updated}. Failed: ${failed}. Needs review: ${suspicious.length}.`);

if (suspicious.length > 0) {
  console.log("Review these value jumps before running a large batch:");
  for (const item of suspicious.slice(0, 20)) {
    console.log(`- ${item.row.upc} ${item.row.pop_name}: ${money(item.row.estimated_value)} -> ${money(item.pop.estimated_value)}`);
  }
}
