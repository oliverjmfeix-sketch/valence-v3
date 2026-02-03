import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";

const app = new Hono();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EXTERNAL_API = "https://valencev3-production.up.railway.app";
const MAX_CONCURRENCY = 4;

interface DealStatus {
  deal_id: string;
  status: string;
  progress?: number;
  current_step?: string;
  error_message?: string;
  error?: string;
}

// Fetch a single deal status with timeout
async function fetchDealStatus(dealId: string): Promise<DealStatus> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${EXTERNAL_API}/api/deals/${dealId}/status`, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error(`Failed to fetch status for ${dealId}: ${response.status}`);
      return { deal_id: dealId, status: "pending" };
    }

    const data = await response.json();
    return { deal_id: dealId, ...data };
  } catch (error) {
    console.error(`Error fetching status for ${dealId}:`, error);
    return { deal_id: dealId, status: "pending" };
  } finally {
    clearTimeout(timeout);
  }
}

// Process deal IDs in batches with concurrency limit
async function fetchStatusesBatched(dealIds: string[]): Promise<Record<string, DealStatus>> {
  const results: Record<string, DealStatus> = {};

  // Process in chunks of MAX_CONCURRENCY
  for (let i = 0; i < dealIds.length; i += MAX_CONCURRENCY) {
    const chunk = dealIds.slice(i, i + MAX_CONCURRENCY);
    const chunkResults = await Promise.all(chunk.map(fetchDealStatus));

    for (const result of chunkResults) {
      results[result.deal_id] = result;
    }
  }

  return results;
}

// Handle all routes - Supabase edge functions use the function name as base path
app.all("*", async (c) => {
  // Handle CORS preflight
  if (c.req.method === "OPTIONS") {
    return c.text("ok", 200, corsHeaders);
  }

  // Only accept POST
  if (c.req.method !== "POST") {
    return c.json({ error: "Method not allowed" }, 405, corsHeaders);
  }

  try {
    const body = await c.req.json();
    const dealIds: string[] = body.deal_ids;

    if (!Array.isArray(dealIds) || dealIds.length === 0) {
      return c.json({ error: "deal_ids must be a non-empty array" }, 400, corsHeaders);
    }

    console.log(`Fetching statuses for ${dealIds.length} deals`);

    const statuses = await fetchStatusesBatched(dealIds);

    console.log(`Fetched ${Object.keys(statuses).length} statuses`);

    return c.json({ statuses }, 200, corsHeaders);
  } catch (error) {
    console.error("Error in deal-statuses:", error);
    return c.json({ error: "Internal server error" }, 500, corsHeaders);
  }
});

Deno.serve(app.fetch);
