"use client";

import { useState } from "react";
import { Plus, Clock, MapPin, X } from "lucide-react";
import styles from "./page.module.css";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const EMPTY = { title: "", date: "", time: "", venue: "", price: "", capacity: "25" };

function dateParts(w) {
  // prefer the real timestamp; fall back to the display date string
  let d = null;
  if (w.startsAt != null) d = new Date(Number(w.startsAt));
  else if (w.date) {
    const parsed = Date.parse(w.date);
    if (Number.isFinite(parsed)) d = new Date(parsed);
  }
  if (!d || Number.isNaN(d.getTime())) {
    return { day: "—", month: "" };
  }
  return { day: String(d.getDate()).padStart(2, "0"), month: MONTHS[d.getMonth()] };
}

function statusFor(bookedCount, capacity) {
  const cap = Number(capacity) || 0;
  if (cap > 0 && bookedCount >= cap) return { label: "Full", tone: "p-badge-hot" };
  if (cap > 0 && bookedCount / cap >= 0.85) return { label: "Almost full", tone: "p-badge-warn" };
  return { label: "Open", tone: "p-badge-cool" };
}

export default function WorkshopsClient({ initialItems, overline, title, cta }) {
  const [items, setItems] = useState(initialItems || []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("Give the workshop a title first.");
      return;
    }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid price.");
      return;
    }
    // build a real future timestamp from the date (and time, if given)
    let startsAt = NaN;
    if (form.date) {
      startsAt = Date.parse(`${form.date}${form.time ? ` ${form.time}` : ""}`);
    }
    if (!Number.isFinite(startsAt)) {
      startsAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/instructor/workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          date: form.date,
          time: form.time,
          venue: form.venue.trim(),
          price,
          capacity: Number(form.capacity) || 25,
          startsAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create the workshop.");
        return;
      }
      setItems((prev) => [{ ...data.workshop, bookedCount: 0 }, ...prev]);
      setForm(EMPTY);
      setOpen(false);
    } catch {
      setError("Network hiccup. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-wrap">
      <header className={styles.head}>
        <div>
          <div className="p-overline">{overline}</div>
          <h1 className={`p-display ${styles.title}`}>{title}</h1>
        </div>
        <button
          type="button"
          className={`p-pill p-pill-primary ${styles.newBtn}`}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={16} /> : <Plus size={16} />} {open ? "Close" : cta}
        </button>
      </header>

      {open ? (
        <section className={`p-card ${styles.formCard}`}>
          <form className={styles.form} onSubmit={submit}>
            <div className={styles.fieldGrid}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Title</span>
                <input
                  className={styles.input}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Saturday Morning Flow"
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Date</span>
                <input
                  className={styles.input}
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Time</span>
                <input
                  className={styles.input}
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Venue</span>
                <input
                  className={styles.input}
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="Whitefield Studio"
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Price (₹)</span>
                <input
                  className={styles.input}
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="450"
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Capacity</span>
                <input
                  className={styles.input}
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  placeholder="25"
                />
              </label>
            </div>
            {error ? <p className={styles.error}>{error}</p> : null}
            <button
              type="submit"
              className={`p-pill p-pill-primary ${styles.submit}`}
              disabled={busy}
            >
              <Plus size={16} /> {busy ? "Creating…" : "Create workshop"}
            </button>
          </form>
        </section>
      ) : null}

      <div className={styles.list}>
        {items.length === 0 ? (
          <div className={`p-card ${styles.empty}`}>
            No workshops yet — create your first with the button above.
          </div>
        ) : (
          items.map((w) => {
            const { day, month } = dateParts(w);
            const st = statusFor(w.bookedCount || 0, w.capacity);
            return (
              <article key={w.id} className={`p-card p-lift ${styles.item}`}>
                <div className={styles.date}>
                  <div className={`p-display gradient-text ${styles.day}`}>{day}</div>
                  <div className={styles.month}>{month}</div>
                </div>
                <div className={styles.divider} />
                <div className={styles.info}>
                  <div className={`p-display ${styles.itemTitle}`}>{w.title}</div>
                  <div className={styles.meta}>
                    {w.time ? (
                      <span className={styles.metaItem}>
                        <Clock size={12} /> {w.time}
                      </span>
                    ) : null}
                    {w.venue ? (
                      <span className={styles.metaItem}>
                        <MapPin size={12} /> {w.venue}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className={styles.right}>
                  <div className={`p-display ${styles.booked}`}>
                    {w.bookedCount || 0}/{w.capacity}
                  </div>
                  <span className={`p-badge ${st.tone}`}>{st.label}</span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
