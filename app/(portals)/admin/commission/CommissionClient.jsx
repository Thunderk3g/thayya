"use client";

import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import styles from "./page.module.css";

function rupees(n) {
  return `₹${(Number(n) || 0).toLocaleString("en-IN")}`;
}

const STATUS_BADGE = {
  pending: styles.noteManual,
  approved: styles.noteAuto,
  settled: styles.noteAuto,
};

export default function CommissionClient({ initialConfig, initialPayouts }) {
  const [split, setSplit] = useState(initialConfig.split);
  const [cadence] = useState(initialConfig.cadence);
  const [payouts, setPayouts] = useState(initialPayouts || []);

  const [editing, setEditing] = useState(false);
  const [instructorPct, setInstructorPct] = useState(String(initialConfig.split.instructor));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const platformPct = 100 - Number(instructorPct || 0);

  async function saveSplit(e) {
    e.preventDefault();
    setError("");
    const instructor = Number(instructorPct);
    const platform = 100 - instructor;
    if (!Number.isFinite(instructor) || instructor < 0 || instructor > 100) {
      setError("Enter an instructor share between 0 and 100.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/commission", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructor, platform }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update the split.");
        return;
      }
      setSplit(data.split);
      setEditing(false);
    } catch {
      setError("Network hiccup. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function transition(id, to) {
    const snapshot = payouts;
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: to } : p))
    );
    try {
      const res = await fetch(`/api/admin/payouts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPayouts(snapshot);
        return;
      }
      setPayouts((prev) => prev.map((p) => (p.id === id ? data.payout : p)));
    } catch {
      setPayouts(snapshot);
    }
  }

  return (
    <div className="p-wrap">
      <div className={styles.head}>
        <div className="p-overline">Configuration</div>
        <h1 className={`p-display ${styles.h1}`}>Commission &amp; Payouts</h1>
      </div>

      <div className={styles.cards}>
        <div className={`p-card ${styles.card}`}>
          <div className={styles.cardLabel}>Default Split</div>
          <div className={`p-display ${styles.splitNum}`}>
            <span className="gradient-text">{split.instructor}</span>
            <span className={styles.splitMuted}>/{split.platform}</span>
          </div>
          <p className={styles.desc}>
            Instructor takes {split.instructor}% of every workshop booking. Thayya retains{" "}
            {split.platform}% to fund content and the platform.
          </p>

          {editing ? (
            <form className={styles.splitForm} onSubmit={saveSplit}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Instructor share (%)</span>
                <input
                  className={styles.input}
                  type="number"
                  min="0"
                  max="100"
                  value={instructorPct}
                  onChange={(e) => setInstructorPct(e.target.value)}
                />
              </label>
              <div className={styles.splitHint}>Platform share: {platformPct}%</div>
              {error ? <p className={styles.error}>{error}</p> : null}
              <div className={styles.splitActions}>
                <button
                  type="submit"
                  className={`p-pill p-pill-primary ${styles.submit}`}
                  disabled={busy}
                >
                  <Check size={16} /> {busy ? "Saving…" : "Save split"}
                </button>
                <button
                  type="button"
                  className={`p-pill p-pill-ghost ${styles.ghostBtn}`}
                  onClick={() => {
                    setEditing(false);
                    setInstructorPct(String(split.instructor));
                    setError("");
                  }}
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <button type="button" className={styles.adjust} onClick={() => setEditing(true)}>
              Adjust split <ArrowRight size={16} />
            </button>
          )}
        </div>

        <div className={`p-card ${styles.card}`}>
          <div className={styles.cardLabel}>Payout Cadence</div>
          <div className={`p-display ${styles.cadenceVal}`}>{cadence.label}</div>
          <p className={styles.desc}>
            Routed to verified instructor accounts on the published cadence. Payouts above the manual
            review threshold are held for an admin check.
          </p>
          {cadence.automated ? (
            <span className={`p-badge ${styles.badgeAutomated}`}>Automated</span>
          ) : null}
        </div>
      </div>

      <div className={`p-card ${styles.queueCard}`}>
        <div className={styles.queueHead}>Payout Queue</div>
        {payouts.length === 0 ? (
          <div className={styles.queueRow}>
            <div className={styles.queueName}>No payouts in the queue.</div>
          </div>
        ) : (
          payouts.map((row) => (
            <div key={row.id} className={styles.queueRow}>
              <div className={styles.queueName}>{row.instructorName || "Instructor"}</div>
              <div className={styles.queueRight}>
                <div className={`p-display ${styles.amount}`}>{rupees(row.amount)}</div>
                <div className={STATUS_BADGE[row.status] || styles.noteAuto}>{row.status}</div>
                <div className={styles.queueActions}>
                  {row.status === "pending" ? (
                    <button
                      type="button"
                      className={`p-pill p-pill-ghost ${styles.queueBtn}`}
                      onClick={() => transition(row.id, "approved")}
                    >
                      Approve
                    </button>
                  ) : null}
                  {row.status === "approved" ? (
                    <button
                      type="button"
                      className={`p-pill p-pill-primary ${styles.queueBtn}`}
                      onClick={() => transition(row.id, "settled")}
                    >
                      Settle
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
