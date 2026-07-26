import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-maintenance-token",
};

const MAINTENANCE_TOKEN_SHA256 = "faefa8f0d36a84b624a0c337160432534c7f9999e983f138a4bd507936daff5b";

type RefreshWindow = {
  since: string;
  until: string;
};

type CatalogRow = {
  id: string;
  upc: string | null;
  pop_name: string | null;
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function previousUtcDayWindow(): RefreshWindow {
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return {
    since: new Date(todayUtc - 24 * 60 * 60 * 1000).toISOString(),
    until: new Date(todayUtc).toISOString(),
  };
}

function parseRefreshWindow(body: any): RefreshWindow {
  const fallback = previousUtcDayWindow();
  const since = typeof body?.since === "string" && body.since.trim() ? body.since.trim() : fallback.since;
  const until = typeof body?.until === "string" && body.until.trim() ? body.until.trim() : fallback.until;

  if (Number.isNaN(new Date(since).getTime()) || Number.isNaN(new Date(until).getTime())) {
    throw new Error("Invalid refresh window. Use ISO strings for since and until.");
  }

  return { since, until };
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function requireMaintenance(req: Request): Promise<boolean> {
  const envToken = Deno.env.get("MAINTENANCE_ADMIN_TOKEN");
  const provided = req.headers.get("x-maintenance-token") ?? req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!provided) return false;
  if (envToken && provided === envToken) return true;
  return (await sha256(provided)) === MAINTENANCE_TOKEN_SHA256;
}

async function loadCatalogRowsForWindow(
  supabase: any,
  window: RefreshWindow,
  limit: number,
): Promise<{ addedCount: number; rows: CatalogRow[] }> {
  const { data: additions, error: additionsError } = await supabase
    .from("user_collection_items")
    .select("pop_catalog_id,created_at")
    .not("pop_catalog_id", "is", null)
    .gte("created_at", window.since)
    .lt("created_at", window.until)
    .order("created_at", { ascending: false })
    .limit(500);

  if (additionsError) throw additionsError;

  const catalogIds = Array.from(
    new Set(
      ((additions ?? []) as Array<{ pop_catalog_id: string | null }>)
        .map((row) => row.pop_catalog_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ).slice(0, limit);

  if (catalogIds.length === 0) return { addedCount: additions?.length ?? 0, rows: [] };

  const { data: catalogRows, error } = await supabase
    .from("pop_catalog")
    .select("id,upc,pop_name")
    .in("id", catalogIds)
    .not("upc", "is", null);

  if (error) throw error;

  const rowsById = new Map(((catalogRows ?? []) as CatalogRow[]).map((row) => [row.id, row]));
  return {
    addedCount: additions?.length ?? 0,
    rows: catalogIds.map((id) => rowsById.get(id)).filter((row): row is CatalogRow => Boolean(row?.upc)),
  };
}

async function syncBlankCollectionValuesForWindow(
  supabase: any,
  catalogId: string,
  value: number | null,
  window: RefreshWindow,
): Promise<void> {
  if (value == null || value <= 0) return;

  const { error } = await supabase
    .from("user_collection_items")
    .update({ current_value: value })
    .eq("pop_catalog_id", catalogId)
    .gte("created_at", window.since)
    .lt("created_at", window.until)
    .or("current_value.is.null,current_value.eq.0");

  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (!(await requireMaintenance(req))) {
      return new Response(JSON.stringify({ ok: false, error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.max(1, Math.min(Number(body?.limit ?? 50), 50));
    const dryRun = Boolean(body?.dryRun ?? false);
    const window = parseRefreshWindow(body);
    const loaded = await loadCatalogRowsForWindow(supabase, window, limit);
    const results: Array<Record<string, unknown>> = [];

    for (const row of loaded.rows) {
      try {
        if (dryRun) {
          results.push({ id: row.id, upc: row.upc, pop_name: row.pop_name, status: "dry_run" });
          continue;
        }

        const { data, error } = await supabase.functions.invoke("lookup_pop", {
          body: { barcode: row.upc, forceRefresh: true },
        });

        if (error) throw error;

        const refreshed = data?.pop ?? null;
        await syncBlankCollectionValuesForWindow(
          supabase,
          row.id,
          refreshed?.estimated_value == null ? null : Number(refreshed.estimated_value),
          window,
        );

        results.push({
          id: row.id,
          upc: row.upc,
          pop_name: refreshed?.pop_name ?? row.pop_name,
          status: "checked",
          estimated_value: refreshed?.estimated_value ?? null,
          needs_review: refreshed?.needs_review ?? null,
        });
      } catch (error) {
        results.push({ id: row.id, upc: row.upc, pop_name: row.pop_name, status: "failed", message: errorMessage(error) });
      }

      await new Promise((resolve) => setTimeout(resolve, 1250));
    }

    return new Response(
      JSON.stringify({
        ok: true,
        dryRun,
        since: window.since,
        until: window.until,
        added: loaded.addedCount,
        processed: results.length,
        checked: results.filter((result) => result.status === "checked").length,
        failed: results.filter((result) => result.status === "failed").length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: errorMessage(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
