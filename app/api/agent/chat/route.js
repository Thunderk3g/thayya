import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { chat, llmAvailable } from "../../../../lib/llm";
import { runTool, TOOL_DEFS } from "../../../../lib/agentTools";
import {
  SYSTEM_PROMPT,
  checkUserMessage,
  sanitizeOutput,
} from "../../../../lib/agentGuardrails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---- simple per-user in-memory rate limit (20 messages / 60s) ----
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const hits = new Map(); // userId -> number[] (timestamps)

function rateLimited(userId) {
  const now = Date.now();
  const arr = (hits.get(userId) || []).filter((t) => now - t < RATE_WINDOW_MS);
  arr.push(now);
  hits.set(userId, arr);
  return arr.length > RATE_LIMIT;
}

const MAX_TOOL_ROUNDS = 2;

// ---- helpers shared by LLM + fallback paths ----
function actionSummary(name, result) {
  if (!result || typeof result !== "object") return null;
  if (name === "create_booking" && result.booked) {
    return result.alreadyBooked
      ? `Already booked: ${result.title}`
      : `Booked: ${result.title}`;
  }
  if (name === "list_classes" && Array.isArray(result.classes)) {
    return `Looked up ${result.classes.length} classes`;
  }
  if (name === "list_my_bookings" && Array.isArray(result.bookings)) {
    return `Looked up your ${result.bookings.length} bookings`;
  }
  if (name === "get_membership" && result.name) {
    return `Checked your membership`;
  }
  return null;
}

function rupees(n) {
  return `₹${n}`;
}

function formatClasses(classes) {
  if (!classes || !classes.length) return "There are no classes listed right now.";
  const lines = classes.map(
    (c) => `${c.title} with ${c.instructor}, ${c.date} at ${c.time} (${rupees(c.price)}, ${c.spotsLeft} spots left)`
  );
  return "Here's what's on:\n" + lines.join("\n");
}

function formatBookings(bookings) {
  if (!bookings || !bookings.length)
    return "You haven't booked any classes yet. Want me to show you what's on?";
  const lines = bookings.map(
    (b) => `${b.title} with ${b.instructor}, ${b.date} at ${b.time} — ${b.status}`
  );
  return "Your bookings:\n" + lines.join("\n");
}

function formatBookingResult(result) {
  if (result.error === "No matching class") {
    return (
      "I couldn't find that class. Here are the ones you can book:\n" +
      (result.validClasses || []).join("\n")
    );
  }
  if (result.error) {
    return result.error + (result.validClasses ? "\n" + result.validClasses.join("\n") : "");
  }
  if (result.alreadyBooked) {
    return `You're already booked into ${result.title} (${result.date} at ${result.time}). See you there!`;
  }
  return `Done! You're booked into ${result.title} with ${result.instructor}, ${result.date} at ${result.time}. Move. Rise. Shine.`;
}

function formatMembership(result) {
  if (result.error) return result.error;
  return `Hi ${result.name}! You have ${result.points} points in your Thayya membership.`;
}

// ---- deterministic fallback intent parser (LLM unavailable) ----
async function fallbackReply(message, user) {
  const text = String(message || "").toLowerCase();
  const actions = [];

  const pushAction = (name, result) => {
    const s = actionSummary(name, result);
    if (s) actions.push(s);
  };

  // greeting
  if (/^(?:hi|hey|hello|yo|namaste|hola|howdy|good\s+(?:morning|afternoon|evening))\b/.test(text.trim())) {
    return {
      reply: sanitizeOutput(
        "Namaste! I'm the Thayya assistant. I can show you what classes are on, check your bookings or points, and book you into a class. What would you like to do?"
      ),
      actions,
    };
  }

  // booking intent
  if (/\b(book|reserve|sign\s*me\s*up|enroll|register)\b/.test(text)) {
    const name = extractClassName(message);
    const result = await runTool("create_booking", { workshop: name }, user);
    pushAction("create_booking", result);
    return { reply: sanitizeOutput(formatBookingResult(result)), actions };
  }

  // my bookings
  if (/\b(my\s+bookings?|my\s+classes|booked|reservations?|what\s+(?:have|did)\s+i\s+book)\b/.test(text)) {
    const result = await runTool("list_my_bookings", {}, user);
    pushAction("list_my_bookings", result);
    return { reply: sanitizeOutput(formatBookings(result.bookings)), actions };
  }

  // points / membership
  if (/\b(points?|membership|tier|loyalty|how\s+many\s+points)\b/.test(text)) {
    const result = await runTool("get_membership", {}, user);
    pushAction("get_membership", result);
    return { reply: sanitizeOutput(formatMembership(result)), actions };
  }

  // classes / schedule
  if (/\b(class(?:es)?|workshops?|schedule|what'?s\s+on|timetable|sessions?|whats\s+on)\b/.test(text)) {
    const result = await runTool("list_classes", {}, user);
    pushAction("list_classes", result);
    return { reply: sanitizeOutput(formatClasses(result.classes)), actions };
  }

  // default
  return {
    reply: sanitizeOutput(
      "I can help you find classes, check your bookings or points, or book you in — what would you like?"
    ),
    actions,
  };
}

// Pull a likely class name out of a booking request.
function extractClassName(message) {
  let s = String(message || "");
  // remove leading booking verbs and filler
  s = s.replace(
    /\b(can\s+you\s+)?(please\s+)?(book|reserve|sign\s*me\s*up\s*(for|into|to)?|enroll\s*(me)?\s*(in|into|for)?|register\s*(me)?\s*(for|into|in)?|get\s+me\s+(in|into))\b/gi,
    " "
  );
  s = s.replace(/\b(me|my\s+self|myself|into|in|for|to|the|a|an|please|class|workshop|session)\b/gi, " ");
  return s.replace(/\s+/g, " ").trim();
}

// ---- LLM path: chat, run tool calls (max 2 rounds), final answer ----
async function llmReply(history, user) {
  const messages = history.map((m) => ({ role: m.role, content: m.content }));
  const actions = [];

  let response = await chat({ system: SYSTEM_PROMPT, messages, tools: TOOL_DEFS });
  if (!response) return null; // signal fallback

  let rounds = 0;
  while (response.toolCalls && response.toolCalls.length && rounds < MAX_TOOL_ROUNDS) {
    rounds += 1;
    const toolResultsText = [];
    for (const call of response.toolCalls) {
      const result = await runTool(call.name, call.arguments || {}, user);
      const s = actionSummary(call.name, result);
      if (s) actions.push(s);
      toolResultsText.push(
        `Tool ${call.name} returned: ${JSON.stringify(result)}`
      );
    }
    // feed tool results back as a user turn and ask for the final answer
    messages.push({
      role: "user",
      content:
        "Tool results (use these to answer; do not invent data):\n" +
        toolResultsText.join("\n"),
    });
    response = await chat({ system: SYSTEM_PROMPT, messages, tools: TOOL_DEFS });
    if (!response) return null;
  }

  const reply = sanitizeOutput(response.text || "");
  return { reply, actions };
}

export async function POST(req) {
  try {
    const { user, error } = await requireUser();
    if (error) return NextResponse.json({ error }, { status: 401 });

    if (rateLimited(user.id)) {
      return NextResponse.json(
        { error: "You're sending messages a little fast — give me a moment and try again." },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastUser = [...messages].reverse().find((m) => m && m.role === "user");
    const latest = lastUser ? String(lastUser.content || "") : "";

    // Guardrail: block before any model call.
    const verdict = checkUserMessage(latest);
    if (!verdict.allowed) {
      return NextResponse.json({ reply: verdict.reason, blocked: true });
    }

    // Try the LLM path.
    if (await llmAvailable()) {
      const llm = await llmReply(messages, user);
      if (llm) {
        return NextResponse.json({ reply: llm.reply, actions: llm.actions });
      }
    }

    // Fallback: deterministic intent parser (LLM unavailable).
    const fb = await fallbackReply(latest, user);
    return NextResponse.json({ reply: fb.reply, actions: fb.actions, degraded: true });
  } catch {
    return NextResponse.json({
      reply:
        "Something tripped on my end, but I'm still here. Ask me about classes, your bookings, or your points.",
      degraded: true,
    });
  }
}
