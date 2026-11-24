import { AiConfig } from "../types";

export interface ChatTurnMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  messages: ChatTurnMessage[];
  temperature?: number;
  jsonMode?: boolean;
  useGoogleSearch?: boolean;
  timeoutMs?: number;
  maxTokens?: number;
  /**
   * "dynamic" = interactive grading/coaching (uses primary provider first).
   * "static" = cache pre-building / static explanations (uses secondary provider first when both Gemini & Groq keys are configured to protect primary quota!).
   */
  workload?: "dynamic" | "static";
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  label: string
): Promise<Response> {
  try {
    return await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    if (
      err instanceof Error &&
      (err.name === "TimeoutError" || err.name === "AbortError")
    ) {
      throw new Error(
        `${label} timed out after ${Math.round(
          timeoutMs / 1000
        )}s. This model may be overloaded or too slow for live voice coaching — try a fast Flash model like 'gemini-flash-latest' or 'gemini-2.5-flash'.`
      );
    }
    throw err;
  }
}

export interface GenerateResult {
  text: string;
  citations?: Array<{ title: string; url: string }>;
  usedSearch?: boolean;
  usedProvider?: "gemini" | "groq" | "ollama";
  usedModel?: string;
  failoverFrom?: string;
}

const GEMINI_HIGH_PRIORITY_FALLBACKS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemma-3-27b-it",
  "gemini-2.5-flash-lite",
  "gemini-3.5-flash",
  "gemma-3-12b-it",
  "gemini-flash-latest",
  "gemini-pro-latest",
];

export function getGeminiModelFamily(model: string): string {
  const m = model.toLowerCase();
  if (m.startsWith("gemma-") && m.includes("27b")) return "gemma-27b";
  if (m.startsWith("gemma-") && m.includes("12b")) return "gemma-12b";
  if (m.startsWith("gemma-")) return "gemma-other";
  if (m.includes("flash-lite")) return "flash-lite";
  if (m.includes("pro")) return "pro";
  if (m.includes("2.0-flash")) return "flash-20";
  if (m.includes("2.5-flash") || m === "gemini-flash-latest") return "flash-25";
  if (m.includes("3.5-flash") || m.includes("3-flash")) return "flash-35";
  return `other:${m}`;
}

/**
 * Interleaves models so failover jumps across DIFFERENT serving clusters/families
 * (e.g., flash-lite -> flash-25 -> pro -> flash-20 -> gemma-27b -> gemma-12b)
 * instead of burning all attempts on aliases of the same overloaded Flash cluster!
 */
export function interleaveByModelFamily(
  candidates: string[],
  deprioritizedFamilies: Set<string>
): string[] {
  const familyOrder = [
    "flash-25",
    "pro",
    "flash-20",
    "gemma-27b",
    "flash-35",
    "flash-lite",
    "gemma-12b",
    "gemma-other",
  ];

  const buckets = new Map<string, string[]>();
  for (const m of candidates) {
    const fam = getGeminiModelFamily(m);
    const list = buckets.get(fam) ?? [];
    if (!list.includes(m)) list.push(m);
    buckets.set(fam, list);
  }

  const orderedFamilies = [
    ...familyOrder.filter((f) => buckets.has(f) && !deprioritizedFamilies.has(f)),
    ...Array.from(buckets.keys()).filter(
      (f) => !familyOrder.includes(f) && !deprioritizedFamilies.has(f)
    ),
    ...familyOrder.filter((f) => buckets.has(f) && deprioritizedFamilies.has(f)),
    ...Array.from(buckets.keys()).filter(
      (f) => !familyOrder.includes(f) && deprioritizedFamilies.has(f)
    ),
  ];

  const result: string[] = [];
  let added = true;
  let round = 0;
  while (added) {
    added = false;
    for (const fam of orderedFamilies) {
      const list = buckets.get(fam);
      if (list && round < list.length) {
        result.push(list[round]);
        added = true;
      }
    }
    round += 1;
  }

  return result;
}

const GROQ_HIGH_PRIORITY_FALLBACKS = [
  "llama-3.3-70b-versatile",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "qwen/qwen3-32b",
  "llama-3.1-8b-instant",
];

// Keep cooldowns & discovered model lists in globalThis so they persist across hot reloads
const globalForAiRouter = globalThis as unknown as {
  __sprachcoachModelCooldowns?: Map<string, number>;
  __sprachcoachProviderCooldowns?: Map<string, number>;
  __sprachcoachDiscoveredGeminiModels?: {
    keyHash: string;
    fetchedAt: number;
    models: string[];
  };
  __sprachcoachDiscoveredGroqModels?: {
    keyHash: string;
    fetchedAt: number;
    models: string[];
  };
};

const modelCooldowns =
  globalForAiRouter.__sprachcoachModelCooldowns ??
  (globalForAiRouter.__sprachcoachModelCooldowns = new Map<string, number>());

const providerCooldowns =
  globalForAiRouter.__sprachcoachProviderCooldowns ??
  (globalForAiRouter.__sprachcoachProviderCooldowns = new Map<string, number>());

export function markModelCooldown(
  provider: string,
  model: string,
  durationMs: number
): void {
  modelCooldowns.set(`${provider}:${model}`, Date.now() + durationMs);
}

export function isModelOnCooldown(provider: string, model: string): boolean {
  const until = modelCooldowns.get(`${provider}:${model}`);
  if (!until) return false;
  if (Date.now() >= until) {
    modelCooldowns.delete(`${provider}:${model}`);
    return false;
  }
  return true;
}

export function markProviderCooldown(provider: string, durationMs: number): void {
  providerCooldowns.set(provider, Date.now() + durationMs);
}

export function isProviderOnCooldown(provider: string): boolean {
  const until = providerCooldowns.get(provider);
  if (!until) return false;
  if (Date.now() >= until) {
    providerCooldowns.delete(provider);
    return false;
  }
  return true;
}

async function getCachedAvailableGroqModels(apiKey: string): Promise<string[]> {
  const keyHash = `${apiKey.slice(0, 6)}:${apiKey.length}:${apiKey.slice(-4)}`;
  const cached = globalForAiRouter.__sprachcoachDiscoveredGroqModels;
  if (
    cached &&
    cached.keyHash === keyHash &&
    Date.now() - cached.fetchedAt < 10 * 60 * 1000
  ) {
    return cached.models;
  }
  try {
    const models = await listGroqModels(apiKey);
    globalForAiRouter.__sprachcoachDiscoveredGroqModels = {
      keyHash,
      fetchedAt: Date.now(),
      models,
    };
    return models;
  } catch {
    return [];
  }
}

class ModelRequestError extends Error {
  status?: number;
  retryableFailover: boolean;
  cooldownMs: number;

  constructor(
    message: string,
    opts: { status?: number; retryableFailover: boolean; cooldownMs?: number }
  ) {
    super(message);
    this.name = "ModelRequestError";
    this.status = opts.status;
    this.retryableFailover = opts.retryableFailover;
    this.cooldownMs = opts.cooldownMs ?? 90_000;
  }
}

async function getCachedAvailableGeminiModels(apiKey: string): Promise<string[]> {
  const keyHash = `${apiKey.slice(0, 6)}:${apiKey.length}:${apiKey.slice(-4)}`;
  const cached = globalForAiRouter.__sprachcoachDiscoveredGeminiModels;
  if (
    cached &&
    cached.keyHash === keyHash &&
    Date.now() - cached.fetchedAt < 10 * 60 * 1000
  ) {
    return cached.models;
  }
  try {
    const models = await listGeminiModels(apiKey);
    globalForAiRouter.__sprachcoachDiscoveredGeminiModels = {
      keyHash,
      fetchedAt: Date.now(),
      models,
    };
    return models;
  } catch {
    return [];
  }
}

export function extractJsonObject<T>(rawText: string): T | null {
  const trimmed = rawText.trim();
  const candidates: string[] = [trimmed];

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    candidates.unshift(fenceMatch[1].trim());
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // try next candidate
    }
  }
  return null;
}

async function callGeminiSingleModel(
  apiKey: string,
  model: string,
  options: GenerateOptions
): Promise<GenerateResult> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const isGemma = model.toLowerCase().startsWith("gemma-");

  const systemMessages = options.messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const nonSystem = options.messages.filter((m) => m.role !== "system");
  const contents = nonSystem.map((m, idx) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [
      {
        text:
          isGemma && idx === 0 && systemMessages
            ? `${systemMessages}\n\n---\n\n${m.content}`
            : m.content,
      },
    ],
  }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.65,
      maxOutputTokens: options.maxTokens ?? (options.jsonMode ? 4096 : 2048),
      ...(options.jsonMode && !options.useGoogleSearch && !isGemma
        ? { responseMimeType: "application/json" }
        : {}),
    },
  };

  if (systemMessages && !isGemma) {
    body.systemInstruction = { parts: [{ text: systemMessages }] };
  }

  if (options.useGoogleSearch && !isGemma) {
    body.tools = [{ google_search: {} }];
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(
      endpoint,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      options.timeoutMs ?? 28000,
      `Gemini (${model})`
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ModelRequestError(msg, {
      retryableFailover: true,
      cooldownMs: 60_000,
    });
  }

  if (!res.ok) {
    const errText = await res.text();
    const isAuthError =
      res.status === 401 ||
      res.status === 403 ||
      /API_KEY_INVALID|API key not valid/i.test(errText);
    const isNotFound = res.status === 404;
    const isOverloadedOrQuota = res.status === 429 || res.status >= 500;
    const isModelFeatureUnsupported =
      res.status === 400 &&
      /not supported|not enabled|developer instruction|json mode/i.test(errText);

    throw new ModelRequestError(
      `Gemini API error (${res.status}) on ${model}: ${errText.slice(0, 300)}`,
      {
        status: res.status,
        retryableFailover:
          !isAuthError &&
          (isOverloadedOrQuota || isNotFound || isModelFeatureUnsupported),
        cooldownMs: isNotFound ? 30 * 60_000 : 90_000,
      }
    );
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      groundingMetadata?: {
        groundingChunks?: Array<{ web?: { title?: string; uri?: string } }>;
      };
    }>;
  };

  const candidate = data.candidates?.[0];
  const text =
    candidate?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

  if (!text.trim()) {
    throw new ModelRequestError(`Gemini (${model}) returned an empty response.`, {
      retryableFailover: true,
      cooldownMs: 30_000,
    });
  }

  const citations =
    candidate?.groundingMetadata?.groundingChunks
      ?.map((chunk) => ({
        title: chunk.web?.title ?? "Source",
        url: chunk.web?.uri ?? "",
      }))
      .filter((c) => Boolean(c.url)) ?? [];

  return {
    text,
    citations: citations.length > 0 ? citations : undefined,
    usedSearch: Boolean(options.useGoogleSearch && citations.length > 0),
    usedProvider: "gemini",
    usedModel: model,
  };
}

async function callGemini(
  config: AiConfig,
  options: GenerateOptions,
  maxAttempts = 8
): Promise<GenerateResult> {
  const apiKey = config.geminiApiKey.trim();
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Add it in Settings or switch provider.");
  }

  const primaryModel = config.geminiModel.trim() || "gemini-2.5-flash";

  // Build diverse high-priority candidate list: primary first, then interleaved across distinct families
  const fallbackPool: string[] = [];
  for (const fb of GEMINI_HIGH_PRIORITY_FALLBACKS) {
    if (fb !== primaryModel && !fallbackPool.includes(fb)) {
      fallbackPool.push(fb);
    }
  }

  const failedFamilies = new Set<string>();
  const triedModels = new Set<string>();

  const diverseBackups = interleaveByModelFamily(
    fallbackPool,
    new Set([getGeminiModelFamily(primaryModel)])
  );

  // If primary is healthy, try it first; if primary is already on cooldown, jump straight to healthy diverse backups
  const initialQueue = isModelOnCooldown("gemini", primaryModel)
    ? [
        ...diverseBackups.filter((m) => !isModelOnCooldown("gemini", m)),
        primaryModel,
        ...diverseBackups.filter((m) => isModelOnCooldown("gemini", m)),
      ]
    : [
        primaryModel,
        ...diverseBackups.filter((m) => !isModelOnCooldown("gemini", m)),
        ...diverseBackups.filter((m) => isModelOnCooldown("gemini", m)),
      ];

  let triedCount = 0;
  let quota429Hits = 0;
  let lastErr: Error | null = null;
  let firstFailedModel: string | null = null;
  let fetchedLiveList = false;

  const attemptQueue = [...initialQueue];

  while (attemptQueue.length > 0 && triedCount < maxAttempts) {
    const model = attemptQueue.shift()!;
    if (triedModels.has(model)) continue;
    triedModels.add(model);
    triedCount += 1;

    try {
      const res = await callGeminiSingleModel(apiKey, model, options);
      if (firstFailedModel || model !== primaryModel) {
        const from = firstFailedModel || primaryModel;
        console.warn(
          `[AI Failover] Gemini model '${from}' unavailable -> succeeded with backup '${model}'.`
        );
        return { ...res, failoverFrom: from };
      }
      return res;
    } catch (err) {
      const mErr =
        err instanceof ModelRequestError
          ? err
          : new ModelRequestError(
              err instanceof Error ? err.message : String(err),
              { retryableFailover: true }
            );
      lastErr = mErr;

      if (!mErr.retryableFailover) {
        throw mErr;
      }

      if (mErr.status === 429) {
        quota429Hits += 1;
      }
      if (!firstFailedModel) {
        firstFailedModel = model;
      }
      failedFamilies.add(getGeminiModelFamily(model));
      markModelCooldown("gemini", model, mErr.cooldownMs);
      console.warn(
        `[AI Failover] Gemini '${model}' failed (${mErr.status ?? "timeout"}). Switching to next diverse model family...`
      );

      // If 2 different Gemini families hit 429 quota exceeded and we have a backup provider,
      // cool down Gemini for 3 minutes and fail over immediately instead of burning more quota!
      if (quota429Hits >= 2 && Boolean(config.groqApiKey?.trim())) {
        markProviderCooldown("gemini", 3 * 60_000);
        throw mErr;
      }

      // On first failure, dynamically discover live available models on this API key
      // and interleave across DIFFERENT families (Pro, 2.0-Flash, Gemma-27B, etc.)!
      if (!fetchedLiveList) {
        fetchedLiveList = true;
        const discovered = await getCachedAvailableGeminiModels(apiKey);
        if (discovered.length > 0) {
          const remainingCandidates = Array.from(
            new Set([...discovered, ...attemptQueue])
          ).filter(
            (m) => !triedModels.has(m) && !isModelOnCooldown("gemini", m)
          );
          const reordered = interleaveByModelFamily(
            remainingCandidates,
            failedFamilies
          );
          attemptQueue.length = 0;
          attemptQueue.push(...reordered);
        }
      } else {
        // Re-sort remaining queue so any family that just failed drops to the back immediately
        const remaining = attemptQueue.filter((m) => !triedModels.has(m));
        const reordered = interleaveByModelFamily(remaining, failedFamilies);
        attemptQueue.length = 0;
        attemptQueue.push(...reordered);
      }
    }
  }

  throw lastErr ?? new Error("All Gemini models are currently unavailable.");
}

async function callGroqSingleModel(
  apiKey: string,
  model: string,
  options: GenerateOptions
): Promise<GenerateResult> {
  const body: Record<string, unknown> = {
    model,
    messages: options.messages,
    temperature: options.temperature ?? 0.65,
  };

  if (options.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          ...body,
          ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
        }),
      },
      options.timeoutMs ?? 28000,
      `Groq (${model})`
    );
  } catch (err) {
    throw new ModelRequestError(
      err instanceof Error ? err.message : String(err),
      { retryableFailover: true, cooldownMs: 60_000 }
    );
  }

  if (!res.ok) {
    const errText = await res.text();
    const isAuthError = res.status === 401 || res.status === 403;
    throw new ModelRequestError(
      `Groq API error (${res.status}) on ${model}: ${errText.slice(0, 300)}`,
      {
        status: res.status,
        retryableFailover:
          !isAuthError &&
          (res.status === 404 || res.status === 429 || res.status >= 500),
        cooldownMs: res.status === 404 ? 30 * 60_000 : 90_000,
      }
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return {
    text: data.choices?.[0]?.message?.content ?? "",
    usedProvider: "groq",
    usedModel: model,
  };
}

async function callGroq(
  config: AiConfig,
  options: GenerateOptions,
  maxAttempts = 4
): Promise<GenerateResult> {
  const apiKey = config.groqApiKey.trim();
  if (!apiKey) {
    throw new Error("Groq API key is missing. Add it in Settings or switch provider.");
  }

  const primaryModel = config.groqModel.trim() || "llama-3.3-70b-versatile";
  const staticCandidates = Array.from(
    new Set([primaryModel, ...GROQ_HIGH_PRIORITY_FALLBACKS])
  );
  const attemptQueue = [
    ...staticCandidates.filter((m) => !isModelOnCooldown("groq", m)),
    ...staticCandidates.filter((m) => isModelOnCooldown("groq", m)),
  ];

  const triedModels = new Set<string>();
  let triedCount = 0;
  let quota429Hits = 0;
  let fetchedLiveList = false;
  let lastErr: Error | null = null;
  let firstFailed: string | null = null;

  while (attemptQueue.length > 0 && triedCount < maxAttempts) {
    const model = attemptQueue.shift()!;
    if (triedModels.has(model)) continue;
    triedModels.add(model);
    triedCount += 1;

    try {
      const res = await callGroqSingleModel(apiKey, model, options);
      if (firstFailed || model !== primaryModel) {
        console.warn(
          `[AI Failover] Groq model '${firstFailed || primaryModel}' unavailable -> succeeded with '${model}'.`
        );
        return { ...res, failoverFrom: firstFailed || primaryModel };
      }
      return res;
    } catch (err) {
      const mErr =
        err instanceof ModelRequestError
          ? err
          : new ModelRequestError(
              err instanceof Error ? err.message : String(err),
              { retryableFailover: true }
            );
      lastErr = mErr;
      if (!mErr.retryableFailover) throw mErr;
      if (mErr.status === 429) quota429Hits += 1;
      if (!firstFailed) firstFailed = model;
      markModelCooldown("groq", model, mErr.cooldownMs);

      if (quota429Hits >= 2 && Boolean(config.geminiApiKey?.trim())) {
        markProviderCooldown("groq", 2 * 60_000);
        throw mErr;
      }

      if (!fetchedLiveList) {
        fetchedLiveList = true;
        const discovered = await getCachedAvailableGroqModels(apiKey);
        for (const d of discovered) {
          if (!triedModels.has(d) && !attemptQueue.includes(d)) {
            attemptQueue.push(d);
          }
        }
      }
    }
  }

  throw lastErr ?? new Error("All Groq models are currently unavailable.");
}

async function callOllama(
  config: AiConfig,
  options: GenerateOptions
): Promise<GenerateResult> {
  const baseUrl = (config.ollamaBaseUrl.trim() || "http://localhost:11434").replace(
    /\/+$/,
    ""
  );
  const model = config.ollamaModel.trim() || "qwen2.5:7b";

  const body: Record<string, unknown> = {
    model,
    messages: options.messages,
    stream: false,
    options: {
      temperature: options.temperature ?? 0.65,
    },
  };

  if (options.jsonMode) {
    body.format = "json";
  }

  const res = await fetchWithTimeout(
    `${baseUrl}/api/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    options.timeoutMs ?? 60000,
    `Ollama (${model})`
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Ollama error (${res.status}): ${errText.slice(0, 260)}. Make sure Ollama is running and model '${model}' is pulled.`
    );
  }

  const data = (await res.json()) as { message?: { content?: string } };
  return {
    text: data.message?.content ?? "",
    usedProvider: "ollama",
    usedModel: model,
  };
}

export async function generateWithAi(
  config: AiConfig,
  options: GenerateOptions
): Promise<GenerateResult> {
  if (config.provider === "demo") {
    throw new Error("DEMO_MODE");
  }

  const hasGemini = Boolean(config.geminiApiKey?.trim());
  const hasGroq = Boolean(config.groqApiKey?.trim());
  const hasDualCloud = hasGemini && hasGroq;

  // Build dynamic provider routing order:
  // 1) If Google Search grounding is requested, Gemini must go first.
  // 2) For "static" background/cache tasks when BOTH Gemini & Groq keys exist,
  //    prefer the SECONDARY provider first so static work never eats your primary dynamic quota!
  // 3) Any provider currently on 429/503 cooldown is automatically moved to the back!
  let baseOrder: Array<"gemini" | "groq" | "ollama"> = [];
  if (options.useGoogleSearch && hasGemini) {
    baseOrder = hasGroq ? ["gemini", "groq"] : ["gemini"];
  } else if (options.workload === "static" && hasDualCloud) {
    baseOrder =
      config.provider === "groq" ? ["gemini", "groq"] : ["groq", "gemini"];
  } else if (config.provider === "gemini") {
    baseOrder = hasGroq ? ["gemini", "groq"] : ["gemini"];
  } else if (config.provider === "groq") {
    baseOrder = hasGemini ? ["groq", "gemini"] : ["groq"];
  } else {
    baseOrder = ["ollama"];
    if (hasGroq) baseOrder.push("groq");
    if (hasGemini) baseOrder.push("gemini");
  }

  const providerOrder = [
    ...baseOrder.filter((p) => !isProviderOnCooldown(p)),
    ...baseOrder.filter((p) => isProviderOnCooldown(p)),
  ];

  // When a backup provider exists, fail over faster (max 3 models on primary) so response stays snappy!
  const hasBackup = providerOrder.length > 1;
  let lastErr: Error | null = null;

  for (let idx = 0; idx < providerOrder.length; idx++) {
    const prov = providerOrder[idx];
    const isPrimaryTry = idx === 0 && hasBackup;
    try {
      if (prov === "gemini") {
        return await callGemini(config, options, isPrimaryTry ? 3 : 6);
      }
      if (prov === "groq") {
        return await callGroq(config, options, isPrimaryTry ? 3 : 5);
      }
      if (prov === "ollama") {
        return await callOllama(config, options);
      }
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `[AI Failover] Provider '${prov}' exhausted (${lastErr.message.slice(0, 140)}). Switching to backup provider...`
      );
    }
  }

  throw lastErr ?? new Error("All configured AI models are temporarily unavailable.");
}

export async function listOllamaModels(baseUrlInput: string): Promise<string[]> {
  const baseUrl = (baseUrlInput.trim() || "http://localhost:11434").replace(
    /\/+$/,
    ""
  );
  const res = await fetch(`${baseUrl}/api/tags`, {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(`Could not connect to Ollama at ${baseUrl} (HTTP ${res.status})`);
  }
  const data = (await res.json()) as {
    models?: Array<{ name: string }>;
  };
  return (data.models ?? []).map((m) => m.name);
}

export async function listGeminiModels(apiKeyInput: string): Promise<string[]> {
  const apiKey = apiKeyInput.trim();
  if (!apiKey) {
    throw new Error("Paste your Gemini API key first to fetch available models.");
  }

  const res = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models?pageSize=100&key=${encodeURIComponent(
      apiKey
    )}`,
    { method: "GET" },
    12000,
    "Gemini model list"
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API key check failed (${res.status}): ${errText.slice(0, 260)}`);
  }

  const data = (await res.json()) as {
    models?: Array<{
      name?: string;
      supportedGenerationMethods?: string[];
    }>;
  };

  const excludedFragments = [
    "embedding",
    "imagen",
    "veo",
    "tts",
    "aqa",
    "robotics",
    "computer-use",
    "audio",
    "image",
    "nano-banana",
    "customtools",
    "bisociate",
  ];

  const ids = (data.models ?? [])
    .filter((m) =>
      (m.supportedGenerationMethods ?? []).includes("generateContent")
    )
    .map((m) => (m.name ?? "").replace(/^models\//, ""))
    .filter(
      (id) =>
        Boolean(id) &&
        (id.startsWith("gemini-") || id.startsWith("gemma-")) &&
        !excludedFragments.some((frag) => id.toLowerCase().includes(frag))
    );

  // Rank fast, stable, free-tier-friendly voice coaching models at the very top
  const rankModel = (id: string) => {
    const lower = id.toLowerCase();
    if (lower === "gemini-flash-latest") return 1000;
    if (lower === "gemini-2.5-flash") return 960;
    if (lower === "gemini-3.5-flash") return 950;
    if (lower === "gemini-flash-lite-latest") return 930;
    if (lower === "gemini-3.5-flash-lite") return 920;
    if (lower === "gemini-2.5-pro") return 860;
    if (lower === "gemini-pro-latest") return 840;

    let score = 500;
    if (lower.startsWith("gemma-")) score = 620;
    if (lower.includes("flash")) score += 120;
    if (lower.includes("flash-lite")) score -= 10;
    if (lower.includes("pro")) score += 60;
    if (lower.includes("omni")) score -= 80;
    if (lower.includes("preview") || lower.includes("exp")) score -= 120;
    if (lower.includes("-001") || lower.includes("-002")) score -= 100;
    return score;
  };

  return Array.from(new Set(ids)).sort((a, b) => rankModel(b) - rankModel(a));
}

export async function listGroqModels(apiKeyInput: string): Promise<string[]> {
  const apiKey = apiKeyInput.trim();
  if (!apiKey) {
    throw new Error("Paste your Groq API key first to fetch available models.");
  }

  const res = await fetch("https://api.groq.com/openai/v1/models", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API key check failed (${res.status}): ${errText.slice(0, 260)}`);
  }

  const data = (await res.json()) as {
    data?: Array<{ id?: string; active?: boolean }>;
  };

  const excluded = ["whisper", "tts", "guard", "safeguard", "playai", "distil-whisper"];
  const ids = (data.data ?? [])
    .filter((m) => m.active !== false)
    .map((m) => m.id ?? "")
    .filter(
      (id) =>
        Boolean(id) && !excluded.some((frag) => id.toLowerCase().includes(frag))
    );

  const rankGroq = (id: string) => {
    const lower = id.toLowerCase();
    let score = 0;
    if (lower.includes("llama-3.3-70b")) score += 100;
    if (lower.includes("llama-4")) score += 95;
    if (lower.includes("qwen")) score += 80;
    if (lower.includes("70b")) score += 30;
    if (lower.includes("8b-instant")) score += 25;
    return score;
  };

  return Array.from(new Set(ids)).sort((a, b) => rankGroq(b) - rankGroq(a));
}

export async function discoverProviderModels(config: AiConfig): Promise<{
  ok: boolean;
  models: string[];
  recommended?: string;
  message: string;
}> {
  if (config.provider === "demo") {
    return {
      ok: true,
      models: [],
      message: "Demo Coach runs locally with no external model needed.",
    };
  }

  if (config.provider === "gemini") {
    const models = await listGeminiModels(config.geminiApiKey);
    return {
      ok: models.length > 0,
      models,
      recommended: models[0],
      message:
        models.length > 0
          ? `Found ${models.length} Gemini models available for your API key. Pick any below and click Test AI Connection.`
          : "API key is valid, but no generateContent models were returned.",
    };
  }

  if (config.provider === "groq") {
    const models = await listGroqModels(config.groqApiKey);
    return {
      ok: models.length > 0,
      models,
      recommended: models[0],
      message:
        models.length > 0
          ? `Found ${models.length} Groq models available for your API key.`
          : "API key is valid, but no chat models were returned.",
    };
  }

  const models = await listOllamaModels(config.ollamaBaseUrl);
  return {
    ok: models.length > 0,
    models,
    recommended: models[0],
    message:
      models.length > 0
        ? `Found ${models.length} locally installed Ollama models.`
        : "Connected to Ollama, but no models are pulled yet. Run 'ollama pull qwen2.5:7b'.",
  };
}

export async function testAiProvider(config: AiConfig): Promise<{
  ok: boolean;
  message: string;
  models?: string[];
  recommendedModel?: string;
}> {
  if (config.provider === "demo") {
    return {
      ok: true,
      message:
        "Built-in Offline Demo Coach is active. Connect Gemini (free), Groq (free), or local Ollama anytime for full dynamic AI coaching.",
    };
  }

  if (config.provider === "ollama") {
    const models = await listOllamaModels(config.ollamaBaseUrl);
    if (models.length === 0) {
      return {
        ok: false,
        message:
          "Connected to Ollama, but no models are pulled yet. Run 'ollama pull qwen2.5:7b' in your terminal.",
        models: [],
      };
    }
    const chosen = config.ollamaModel.trim();
    const hasChosen = models.some(
      (m) => m === chosen || m.startsWith(`${chosen}:`)
    );
    return {
      ok: true,
      message: hasChosen
        ? `Connected to Ollama! Model '${chosen}' is ready.`
        : `Connected to Ollama (${models.length} models found). Select one of your installed models below.`,
      models,
      recommendedModel: hasChosen ? chosen : models[0],
    };
  }

  try {
    const reply = await generateWithAi(config, {
      messages: [
        { role: "system", content: "Reply with a short German greeting (max 8 words)." },
        { role: "user", content: "Hallo!" },
      ],
      temperature: 0.2,
      timeoutMs: 15000,
      maxTokens: 64,
    });

    return {
      ok: true,
      message: `Connected successfully! Sample reply: "${reply.text.trim()}"`,
    };
  } catch (err) {
    const baseMsg = err instanceof Error ? err.message : "Connection test failed";

    // On failure, check which models ARE available for this key so user can switch in 1 click
    let availableModels: string[] = [];
    try {
      availableModels =
        config.provider === "gemini"
          ? await listGeminiModels(config.geminiApiKey)
          : await listGroqModels(config.groqApiKey);
    } catch {
      // key itself may be invalid
    }

    if (availableModels.length > 0) {
      return {
        ok: false,
        message: `${baseMsg} — Try selecting '${availableModels[0]}' below and testing again.`,
        models: availableModels,
        recommendedModel: availableModels[0],
      };
    }

    return {
      ok: false,
      message: baseMsg,
    };
  }
}

export async function transcribeWithGroqWhisper(
  apiKey: string,
  audioBlob: Blob,
  filename = "speech.webm"
): Promise<string> {
  if (!apiKey.trim()) {
    throw new Error("Groq API key required for Whisper transcription.");
  }

  const form = new FormData();
  form.append("file", audioBlob, filename);
  form.append("model", "whisper-large-v3-turbo");
  form.append("language", "de");
  form.append("response_format", "json");

  const res = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq Whisper error (${res.status}): ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}

export async function transcribeWithGeminiAudio(
  apiKey: string,
  modelInput: string,
  audioBlob: Blob,
  mimeTypeInput?: string
): Promise<string> {
  const key = apiKey.trim();
  if (!key) {
    throw new Error("Gemini API key required for audio transcription.");
  }

  const model = modelInput.trim() || "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(key)}`;

  const buffer = Buffer.from(await audioBlob.arrayBuffer());
  const base64Audio = buffer.toString("base64");
  const rawMime = (mimeTypeInput || audioBlob.type || "audio/mp4")
    .split(";")[0]
    .trim()
    .toLowerCase();
  const mimeType = rawMime.startsWith("audio/") ? rawMime : "audio/mp4";

  const res = await fetchWithTimeout(
    endpoint,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Transcribe this spoken German learner audio verbatim in German. Keep the learner's exact words and grammar (do NOT silently fix their mistakes, because the coach needs to see them). Return ONLY the German transcript text with no quotes or extra commentary. If the audio is silent or unintelligible, return an empty string.",
              },
              {
                inlineData: {
                  mimeType,
                  data: base64Audio,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 256,
        },
      }),
    },
    25000,
    `Gemini Audio (${model})`
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Gemini audio transcription error (${res.status}): ${errText.slice(0, 220)}`
    );
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  return (
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? ""
  ).trim();
}
