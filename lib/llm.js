// LLM client for the Thayya assistant — talks to xAI (Grok), which exposes an
// OpenAI-compatible chat-completions API. Config comes from SERVER env vars
// (never NEXT_PUBLIC): LLM_API_KEY (your xAI key), LLM_BASE_URL, LLM_MODEL.
//
// This module NEVER throws: chat() returns a normalized { text, toolCalls } on
// success or null on any failure, so app/api/agent/chat can fall back to its
// deterministic intent layer (and the guardrails + tool execution there are the
// real trust boundary regardless of the model).
//
// (A Supabase Edge Function alternative still exists under
// supabase/functions/assistant-llm but is no longer wired — the app calls xAI
// directly so the provider is configured entirely through Vercel/.env vars.)

const TIMEOUT_MS = 30000;
const DEFAULT_BASE = "https://api.x.ai/v1/chat/completions";
const DEFAULT_MODEL = "grok-4"; // override via LLM_MODEL (e.g. grok-3, grok-2-latest)

function env(name) {
  return process.env[name];
}

// True when an xAI key is configured. The route uses this to decide whether to
// attempt the LLM path at all; the deterministic fallback handles the rest.
export async function llmAvailable() {
  return Boolean(env("LLM_API_KEY"));
}

function buildBody({ model, system, messages, tools }) {
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

function parseArgs(raw) {
  if (raw == null) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// OpenAI/xAI chat-completions shape → { text, toolCalls }.
function normalize(data) {
  const result = { text: "", toolCalls: [] };
  if (!data || typeof data !== "object") return result;
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

export async function chat({ system, messages, tools }) {
  const apiKey = env("LLM_API_KEY");
  if (!apiKey) return null; // no key → caller uses deterministic fallback
  const baseUrl = env("LLM_BASE_URL") || DEFAULT_BASE;
  const model = env("LLM_MODEL") || DEFAULT_MODEL;

  const body = buildBody({ model, system, messages, tools });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let res;
    try {
      res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch {
      return null;
    }
    if (!res.ok) return null;
    let data;
    try {
      data = await res.json();
    } catch {
      return null;
    }
    return normalize(data);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
