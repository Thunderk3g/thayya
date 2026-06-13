// Minimal LLM provider client for the Thayya assistant.
//
// Talks to an Azure OpenAI endpoint. The base URL may be either a Responses
// API endpoint (".../openai/responses?api-version=...") or a chat-completions
// style endpoint — we build the request body accordingly.
//
// TLS: a corporate TLS-intercepting proxy presents a certificate Node won't
// trust. The PRODUCTION-safe fix is to add the proxy's CA to the trust store
// via NODE_EXTRA_CA_CERTS — no code path required. For local development only,
// setting LLM_INSECURE_TLS=true routes this one call through an undici
// dispatcher with verification off. That path is hard-gated to non-production
// (see insecureTls) so a leaked flag can never disable verification in prod,
// and it is scoped to a per-request dispatcher — we never mutate global TLS
// state.
//
// This module NEVER throws: chat() returns a normalized result on success or
// null on any failure, so the caller can fall back to a deterministic path.

const TIMEOUT_MS = 30000;

function env(name) {
  return process.env[name];
}

// True when an API key is configured. The route uses this to decide whether
// to attempt the LLM path at all.
export async function llmAvailable() {
  return Boolean(env("LLM_API_KEY"));
}

function insecureTls() {
  // Hard gate: never disable certificate verification in production, even if
  // the flag is set. The production path for a TLS-intercepting proxy is
  // NODE_EXTRA_CA_CERTS, not this.
  if (process.env.NODE_ENV === "production") return false;
  const flag = String(env("LLM_INSECURE_TLS") || "").toLowerCase();
  return flag === "true" || flag === "1" || flag === "yes";
}

// Build a per-request undici dispatcher that skips certificate verification
// (dev only — see insecureTls). Scoped to this single provider call; we never
// touch global TLS state. Returns null when not applicable or undici is
// unavailable, in which case the call proceeds with normal verification (and
// simply fails closed to the deterministic fallback if the proxy cert is
// untrusted).
async function insecureDispatcher() {
  if (!insecureTls()) return null;
  try {
    const undici = await import("undici");
    const Agent = undici.Agent || undici.default?.Agent;
    if (Agent) return new Agent({ connect: { rejectUnauthorized: false } });
  } catch {
    // undici not resolvable — proceed with normal TLS verification
  }
  return null;
}

// Build the request body. Responses API uses `input`; chat-completions uses
// `messages`. We detect via the URL.
function buildBody({ baseUrl, model, system, messages, tools }) {
  const isResponses = baseUrl.includes("/responses");

  if (isResponses) {
    const input = [];
    if (system) input.push({ role: "system", content: system });
    for (const m of messages || []) {
      input.push({ role: m.role, content: String(m.content ?? "") });
    }
    const body = { model, input };
    if (tools && tools.length) {
      // Responses API expects flat function tools.
      body.tools = tools.map((t) => ({
        type: "function",
        name: t.function.name,
        description: t.function.description,
        parameters: t.function.parameters,
      }));
      body.tool_choice = "auto";
    }
    return body;
  }

  // chat-completions style
  const msgs = [];
  if (system) msgs.push({ role: "system", content: system });
  for (const m of messages || []) {
    msgs.push({ role: m.role, content: String(m.content ?? "") });
  }
  const body = { model, messages: msgs };
  if (tools && tools.length) {
    body.tools = tools;
    body.tool_choice = "auto";
  }
  return body;
}

// Defensively normalize whichever response shape comes back into
// { text, toolCalls: [{ name, arguments }] }.
function normalize(data) {
  const result = { text: "", toolCalls: [] };
  if (!data || typeof data !== "object") return result;

  // ---- Responses API shape: top-level `output` array ----
  if (Array.isArray(data.output)) {
    const textParts = [];
    for (const item of data.output) {
      if (!item || typeof item !== "object") continue;
      // function calls surface as their own output items
      if (item.type === "function_call" || item.type === "tool_call") {
        result.toolCalls.push({
          name: item.name || item.function?.name,
          arguments: parseArgs(item.arguments ?? item.function?.arguments),
        });
        continue;
      }
      // message items carry a `content` array of parts
      if (Array.isArray(item.content)) {
        for (const part of item.content) {
          if (!part || typeof part !== "object") continue;
          if (typeof part.text === "string") textParts.push(part.text);
          if (part.type === "function_call" || part.type === "tool_call") {
            result.toolCalls.push({
              name: part.name || part.function?.name,
              arguments: parseArgs(part.arguments ?? part.function?.arguments),
            });
          }
        }
      }
    }
    if (typeof data.output_text === "string" && !textParts.length) {
      textParts.push(data.output_text);
    }
    result.text = textParts.join("\n").trim();
    return result;
  }

  // convenience field some Responses deployments include
  if (typeof data.output_text === "string") {
    result.text = data.output_text.trim();
  }

  // ---- chat-completions shape: choices[0].message ----
  if (Array.isArray(data.choices) && data.choices.length) {
    const msg = data.choices[0].message || {};
    if (typeof msg.content === "string") result.text = msg.content.trim();
    if (Array.isArray(msg.tool_calls)) {
      for (const tc of msg.tool_calls) {
        result.toolCalls.push({
          name: tc.function?.name || tc.name,
          arguments: parseArgs(tc.function?.arguments ?? tc.arguments),
        });
      }
    }
  }

  return result;
}

function parseArgs(raw) {
  if (raw == null) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Core call. Returns normalized { text, toolCalls } or null on any error.
export async function chat({ system, messages, tools }) {
  const baseUrl = env("LLM_BASE_URL");
  const apiKey = env("LLM_API_KEY");
  const model = env("LLM_MODEL");
  if (!baseUrl || !apiKey || !model) return null;

  const body = buildBody({ baseUrl, model, system, messages, tools });
  const dispatcher = await insecureDispatcher();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Azure prefers `api-key`; some gateways want a bearer token. Try api-key
  // first, then fall back to Authorization on a 401.
  const headerVariants = [
    { "api-key": apiKey },
    { Authorization: `Bearer ${apiKey}` },
  ];

  try {
    for (let i = 0; i < headerVariants.length; i++) {
      const fetchOpts = {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headerVariants[i] },
        body: JSON.stringify(body),
        signal: controller.signal,
      };
      if (dispatcher) fetchOpts.dispatcher = dispatcher;

      let res;
      try {
        res = await fetch(baseUrl, fetchOpts);
      } catch {
        // network/TLS failure — no point trying the other header
        return null;
      }

      if (res.status === 401 && i + 1 < headerVariants.length) {
        // try the next auth scheme
        continue;
      }
      if (!res.ok) return null;

      let data;
      try {
        data = await res.json();
      } catch {
        return null;
      }
      return normalize(data);
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
