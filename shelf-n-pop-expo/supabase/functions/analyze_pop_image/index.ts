const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const OPENAI_TIMEOUT_MS = 25000;
const GEMINI_TIMEOUT_MS = 25000;

type CatalogPhotoDraft = {
  pop_name: string | null;
  character: string | null;
  franchise: string | null;
  set_name: string | null;
  number: string | null;
  variant: string | null;
  exclusivity: string | null;
  pop_type: string | null;
  pop_style: string | null;
  upc: string | null;
  confidence: number;
  needs_review: boolean;
  review_notes: string[];
};

type AnalyzeRequest = {
  imageBase64?: string;
  mimeType?: string;
};

const draftSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "pop_name",
    "character",
    "franchise",
    "set_name",
    "number",
    "variant",
    "exclusivity",
    "pop_type",
    "pop_style",
    "upc",
    "confidence",
    "needs_review",
    "review_notes",
  ],
  properties: {
    pop_name: { type: ["string", "null"] },
    character: { type: ["string", "null"] },
    franchise: { type: ["string", "null"] },
    set_name: { type: ["string", "null"] },
    number: { type: ["string", "null"] },
    variant: { type: ["string", "null"] },
    exclusivity: { type: ["string", "null"] },
    pop_type: { type: ["string", "null"] },
    pop_style: { type: ["string", "null"] },
    upc: { type: ["string", "null"] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    needs_review: { type: "boolean" },
    review_notes: {
      type: "array",
      items: { type: "string" },
    },
  },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanImageBase64(value: unknown) {
  const trimmed = typeof value === "string" ? value.trim() : String(value ?? "").trim();
  const dataUrlMatch = trimmed.match(/^data:([^;]+);base64,(.*)$/s);
  const base64 = dataUrlMatch ? dataUrlMatch[2] : trimmed;
  return base64.replace(/\s/g, "");
}

function normalizeMimeType(value?: string) {
  const normalized = (value || "image/jpeg").trim().toLowerCase();
  if (normalized === "image/jpg") return "image/jpeg";
  if (["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"].includes(normalized)) return normalized;
  return "image/jpeg";
}

function buildPrompt(provider: "gemini" | "openai") {
  const basePrompt = [
    "You are helping Shelf-n-Pop test a Funko Pop box photo reader.",
    "Read only visible box text and barcode/UPC text from the image.",
    "Return a cautious catalog draft. Do not invent fields that are not visible or strongly implied by the box.",
    "Do not use generic brand/category text like POP!, Funko, Vinyl Figure, Marvel, DC, Star Wars, Disney, Games, Animation, Television, or Movies as pop_name.",
    "pop_name should be the specific product/character name on the box, such as Spider-Man 2099, Batman, Captain Marvel, or Dead Strange.",
    "character should usually match the specific character name. If the box only shows one useful name, put it in both pop_name and character.",
    "franchise should be the broad property or brand family, such as Marvel, DC, Star Wars, Disney, Pokemon, or The Simpsons.",
    "set_name should be the specific line/subtitle when visible, such as Spider-Man: Across the Spider-Verse, Batman Returns, or Doctor Strange in the Multiverse of Madness.",
    "pop_type should be the printed Pop category only when useful, such as Pop! Marvel, Pop! Heroes, Pop! Animation, or Pop! Movies.",
    "pop_style should be a figure style or treatment only when visible, such as Chase, Glow in the Dark, Flocked, Metallic, Blacklight, Diamond Collection, or Vinyl Figure.",
    "If a field is inferred from category text instead of clearly visible product text, mention that in review_notes and lower confidence.",
    "Use null for unknown fields. Keep number without a leading #. Use review_notes to explain uncertainty.",
    "If the image is blurry, cropped, not a Funko Pop box, or a field needs human confirmation, set needs_review true.",
  ];

  if (provider === "gemini") {
    basePrompt.push(
      "Return only a JSON object with these exact keys: pop_name, character, franchise, set_name, number, variant, exclusivity, pop_type, pop_style, upc, confidence, needs_review, review_notes.",
      "confidence must be a number from 0 to 1. needs_review must be boolean. review_notes must be an array of strings.",
    );
  }

  return basePrompt.join(" ");
}

function getOutputText(result: Record<string, unknown>) {
  if (typeof result.output_text === "string") return result.output_text;

  const output = Array.isArray(result.output) ? result.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as { content?: unknown }).content) ? (item as { content: unknown[] }).content : [];
    for (const contentItem of content) {
      if (!contentItem || typeof contentItem !== "object") continue;
      const text = (contentItem as { text?: unknown }).text;
      if (typeof text === "string") return text;
    }
  }

  return null;
}

function getGeminiOutputText(result: Record<string, unknown>) {
  const candidates = Array.isArray(result.candidates) ? result.candidates : [];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const content = (candidate as { content?: unknown }).content;
    if (!content || typeof content !== "object") continue;
    const parts = Array.isArray((content as { parts?: unknown }).parts) ? (content as { parts: unknown[] }).parts : [];
    for (const part of parts) {
      if (!part || typeof part !== "object") continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string") return text;
    }
  }

  return null;
}

function parseDraftText(text: string): CatalogPhotoDraft {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned) as CatalogPhotoDraft;
}

async function analyzeWithGemini({
  apiKey,
  imageBase64,
  mimeType,
}: {
  apiKey: string;
  imageBase64: string;
  mimeType: string;
}) {
  const configuredModel = Deno.env.get("GEMINI_VISION_MODEL");
  const models = [
    configuredModel,
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
  ].filter((model, index, all): model is string => Boolean(model && all.indexOf(model) === index));
  let lastError: { message: string; status: number } | null = null;

  for (const model of models) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    let geminiResponse: Response;
    try {
      geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64,
                  },
                },
                { text: buildPrompt("gemini") },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });
    } catch (error) {
      clearTimeout(timeoutId);
      const message = error instanceof DOMException && error.name === "AbortError"
        ? `${model} timed out. Try a clearer, closer photo.`
        : `${model} failed before returning a response.`;
      lastError = { message, status: 504 };
      continue;
    } finally {
      clearTimeout(timeoutId);
    }

    const resultText = await geminiResponse.text();
    let result: Record<string, unknown>;
    try {
      result = JSON.parse(resultText) as Record<string, unknown>;
    } catch {
      lastError = { message: resultText || `${model} returned an unreadable response.`, status: geminiResponse.ok ? 502 : geminiResponse.status };
      continue;
    }

    if (!geminiResponse.ok) {
      const message =
        result && typeof result === "object" && "error" in result
          ? (result as { error?: { message?: string } }).error?.message
          : null;
      lastError = { message: message || `${model} image analysis failed.`, status: geminiResponse.status };
      if (geminiResponse.status === 429 || geminiResponse.status === 503) continue;
      break;
    }

    const outputText = getGeminiOutputText(result);
    if (!outputText) {
      lastError = { message: `${model} response did not include a draft.`, status: 502 };
      continue;
    }

    try {
      return jsonResponse({ draft: parseDraftText(outputText), provider: "gemini", model });
    } catch {
      lastError = { message: `${model} response was not valid catalog draft JSON.`, status: 502 };
    }
  }

  return jsonResponse({ error: lastError?.message || "Gemini image analysis failed." }, lastError?.status || 502);
}

async function analyzeWithOpenAi({
  apiKey,
  imageBase64,
  mimeType,
}: {
  apiKey: string;
  imageBase64: string;
  mimeType: string;
}) {
  if (mimeType === "image/heic" || mimeType === "image/heif") {
    return jsonResponse({ error: "This photo format is HEIC/HEIF. Please use Gemini, retake the photo in the browser camera, or upload a JPEG/PNG image." }, 415);
  }

  const model = Deno.env.get("OPENAI_VISION_MODEL") || "gpt-4.1-mini";
  const imageUrl = `data:${mimeType};base64,${imageBase64}`;
  const prompt = buildPrompt("openai");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
  let openAiResponse: Response;
  try {
    openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              { type: "input_image", image_url: imageUrl },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "funko_pop_photo_draft",
            strict: true,
            schema: draftSchema,
          },
        },
      }),
    });
  } catch (error) {
    const message = error instanceof DOMException && error.name === "AbortError"
      ? "OpenAI image analysis timed out. Try a clearer, closer photo."
      : "OpenAI image analysis failed before returning a response.";
    return jsonResponse({ error: message }, 504);
  } finally {
    clearTimeout(timeoutId);
  }

  const resultText = await openAiResponse.text();
  let result: Record<string, unknown>;
  try {
    result = JSON.parse(resultText) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: resultText || "OpenAI returned an unreadable response." }, openAiResponse.ok ? 502 : openAiResponse.status);
  }

  if (!openAiResponse.ok) {
    const message =
      result && typeof result === "object" && "error" in result
        ? (result as { error?: { message?: string } }).error?.message
        : null;
    return jsonResponse({ error: message || "OpenAI image analysis failed." }, openAiResponse.status);
  }

  const outputText = getOutputText(result as Record<string, unknown>);
  if (!outputText) {
    return jsonResponse({ error: "OpenAI response did not include a draft." }, 502);
  }

  try {
    return jsonResponse({ draft: parseDraftText(outputText), provider: "openai", model });
  } catch {
    return jsonResponse({ error: "OpenAI response was not valid catalog draft JSON." }, 502);
  }
}

Deno.serve(async (req) => {
  try {
    return await handleAnalyzeRequest(req);
  } catch (error) {
    console.error("analyze_pop_image unhandled error", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Photo analysis failed unexpectedly." },
      500,
    );
  }
});

async function handleAnalyzeRequest(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body: AnalyzeRequest;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const imageBase64 = body.imageBase64 ? cleanImageBase64(body.imageBase64) : "";
  const mimeType = normalizeMimeType(body.mimeType);
  if (!imageBase64) {
    return jsonResponse({ error: "imageBase64 is required." }, 400);
  }

  if (!mimeType) {
    return jsonResponse({ error: "This photo format is HEIC/HEIF. Please retake the photo in the browser camera or upload a JPEG/PNG image." }, 415);
  }

  if (imageBase64.length > 11_000_000) {
    return jsonResponse({ error: "Image is too large for this test. Try a smaller or lower-quality photo." }, 413);
  }

  const geminiKey =
    Deno.env.get("GEMINI_API_KEY") ||
    Deno.env.get("Gemini API") ||
    Deno.env.get("GOOGLE_API_KEY") ||
    Deno.env.get("GOOGLE_GEMINI_API_KEY");
  const openAiKey = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("OPEN_AI_API");
  const preferredProvider = (Deno.env.get("VISION_PROVIDER") || "").trim().toLowerCase();

  if (geminiKey && preferredProvider !== "openai") {
    return analyzeWithGemini({ apiKey: geminiKey, imageBase64, mimeType });
  }

  if (openAiKey) {
    return analyzeWithOpenAi({ apiKey: openAiKey, imageBase64, mimeType });
  }

  if (geminiKey) {
    return analyzeWithGemini({ apiKey: geminiKey, imageBase64, mimeType });
  }

  return jsonResponse({ error: "Add GEMINI_API_KEY or OPENAI_API_KEY to Supabase secrets for AI photo analysis. Free OCR still works without an AI key." }, 500);
}
