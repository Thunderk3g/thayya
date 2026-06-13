"use client";

// Floating Thayya assistant. Renders nothing unless a user is signed in.
// Talks to /api/agent/chat; shows tool-action chips and a subtle "offline
// mode" tag when the server falls back to its deterministic path.

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, X } from "lucide-react";
import styles from "./AssistantWidget.module.css";

const GREETING = {
  role: "assistant",
  content:
    "Namaste! I'm the Thayya assistant. I can show you what classes are on, check your bookings or points, and book you into a class. What would you like to do?",
};

export default function AssistantWidget() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // session check on mount
  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => {
        if (!active) return;
        setUser(d?.user || null);
        setReady(true);
      })
      .catch(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // auto-scroll to newest
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // focus the input when the panel opens
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Escape closes the panel
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!ready || !user) return null;

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.status === 429) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              data.error ||
              "You're sending messages a little fast — give me a moment and try again.",
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              data.reply ||
              "I'm here for classes, bookings, and membership — what would you like?",
            actions: Array.isArray(data.actions) ? data.actions : [],
            degraded: Boolean(data.degraded),
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I couldn't reach the studio just now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          className={styles.fab}
          aria-label="Open the Thayya assistant"
          onClick={() => setOpen(true)}
        >
          <Sparkles size={22} aria-hidden="true" />
        </button>
      )}

      {open && (
        <section
          className={styles.panel}
          role="dialog"
          aria-modal="false"
          aria-label="Thayya assistant"
        >
          <header className={styles.head}>
            <span className={styles.headBadge} aria-hidden="true">
              <Sparkles size={16} />
            </span>
            <div className={styles.headText}>
              <strong className={styles.headTitle}>Thayya Assistant</strong>
              <span className={styles.headSub}>Move. Rise. Shine.</span>
            </div>
            <button
              type="button"
              className={styles.close}
              aria-label="Close the assistant"
              onClick={() => setOpen(false)}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className={styles.scroll} ref={scrollRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? `${styles.row} ${styles.rowUser}`
                    : styles.row
                }
              >
                <div
                  className={
                    m.role === "user"
                      ? `${styles.bubble} ${styles.bubbleUser}`
                      : `${styles.bubble} ${styles.bubbleBot}`
                  }
                >
                  {m.content.split("\n").map((line, j) => (
                    <span key={j} className={styles.line}>
                      {line}
                    </span>
                  ))}

                  {Array.isArray(m.actions) && m.actions.length > 0 && (
                    <span className={styles.chips}>
                      {m.actions.map((a, k) => (
                        <span key={k} className={styles.chip}>
                          ✓ {a}
                        </span>
                      ))}
                    </span>
                  )}

                  {m.degraded && (
                    <span className={styles.offline}>offline mode</span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className={styles.row}>
                <div className={`${styles.bubble} ${styles.bubbleBot}`}>
                  <span className={styles.typing} aria-label="Assistant is typing">
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.composer}>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              value={input}
              placeholder="Ask about classes or book a session…"
              aria-label="Message the Thayya assistant"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading}
            />
            <button
              type="button"
              className={styles.sendBtn}
              aria-label="Send message"
              onClick={send}
              disabled={loading || !input.trim()}
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </div>
        </section>
      )}
    </>
  );
}
