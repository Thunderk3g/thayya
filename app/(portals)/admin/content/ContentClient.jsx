"use client";

import { useState } from "react";
import { Upload, ArrowRight, X, Check, Trash2 } from "lucide-react";
import styles from "./page.module.css";

const STATUSES = ["Live", "In Review", "Planning"];

const TONE_CLASS = {
  Live: "badgeLive",
  "In Review": "badgeReview",
  Planning: "badgePlanning",
};

const EMPTY_FORM = { name: "", note: "", videosCount: "", audioCount: "", status: "Planning" };

function badgeClass(status) {
  return styles[TONE_CLASS[status] || "badgePlanning"];
}

export default function ContentClient({ initialDrops }) {
  const [drops, setDrops] = useState(initialDrops || []);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  async function createDrop(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Give the drop a name first.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          note: form.note.trim(),
          videosCount: form.videosCount,
          audioCount: form.audioCount,
          status: form.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create the drop.");
        return;
      }
      setDrops((prev) => [data.drop, ...prev]);
      setForm(EMPTY_FORM);
      setShowNew(false);
    } catch {
      setError("Network hiccup. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(drop) {
    setEditingId(drop.id);
    setEditForm({
      name: drop.name,
      note: drop.note || "",
      videosCount: String(drop.videosCount ?? ""),
      audioCount: String(drop.audioCount ?? ""),
      status: drop.status,
    });
  }

  async function saveEdit(id) {
    const snapshot = drops;
    const fields = {
      name: editForm.name.trim(),
      note: editForm.note.trim(),
      videosCount: editForm.videosCount,
      audioCount: editForm.audioCount,
      status: editForm.status,
    };
    setDrops((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              name: fields.name || d.name,
              note: fields.note,
              videosCount: Number(fields.videosCount) || 0,
              audioCount: Number(fields.audioCount) || 0,
              status: fields.status,
            }
          : d
      )
    );
    setEditingId(null);
    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) {
        setDrops(snapshot);
        return;
      }
      setDrops((prev) => prev.map((d) => (d.id === id ? data.drop : d)));
    } catch {
      setDrops(snapshot);
    }
  }

  async function deleteDrop(id) {
    const snapshot = drops;
    setDrops((prev) => prev.filter((d) => d.id !== id));
    if (editingId === id) setEditingId(null);
    try {
      const res = await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      if (!res.ok) setDrops(snapshot);
    } catch {
      setDrops(snapshot);
    }
  }

  return (
    <div className="p-wrap">
      <div className={styles.head}>
        <div>
          <div className="p-overline">Choreography Library</div>
          <h1 className={`p-display ${styles.h1}`}>Monthly Drops</h1>
        </div>
        <button
          type="button"
          className={`p-pill p-grad-warm ${styles.newDrop}`}
          onClick={() => {
            setShowNew((v) => !v);
            setError("");
          }}
        >
          <Upload size={16} /> New Drop
        </button>
      </div>

      {showNew ? (
        <form className={`p-card ${styles.formCard}`} onSubmit={createDrop}>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Drop name</span>
              <input
                className={styles.input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="July 2026"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Note</span>
              <input
                className={styles.input}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Released first Friday"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Videos</span>
              <input
                className={styles.input}
                type="number"
                value={form.videosCount}
                onChange={(e) => setForm({ ...form, videosCount: e.target.value })}
                placeholder="0"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Audio</span>
              <input
                className={styles.input}
                type="number"
                value={form.audioCount}
                onChange={(e) => setForm({ ...form, audioCount: e.target.value })}
                placeholder="0"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Status</span>
              <select
                className={styles.input}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error ? <p className={styles.error}>{error}</p> : null}
          <button type="submit" className={`p-pill p-pill-primary ${styles.submit}`} disabled={busy}>
            <Check size={16} /> {busy ? "Saving…" : "Create drop"}
          </button>
        </form>
      ) : null}

      <div className={`p-card ${styles.tableCard}`}>
        <div className={`${styles.gridRow} ${styles.gridHead}`}>
          <div>Drop</div>
          <div className={styles.cellHide}>Videos</div>
          <div className={styles.cellHide}>Audio</div>
          <div>Status</div>
          <div className={styles.cellRight}>Actions</div>
        </div>

        {drops.length === 0 ? (
          <div className={styles.gridRow}>
            <div className={styles.dropNote}>No drops yet — create your first above.</div>
          </div>
        ) : (
          drops.map((row) =>
            editingId === row.id ? (
              <div key={row.id} className={styles.editRow}>
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Drop name</span>
                    <input
                      className={styles.input}
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Note</span>
                    <input
                      className={styles.input}
                      value={editForm.note}
                      onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Videos</span>
                    <input
                      className={styles.input}
                      type="number"
                      value={editForm.videosCount}
                      onChange={(e) => setEditForm({ ...editForm, videosCount: e.target.value })}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Audio</span>
                    <input
                      className={styles.input}
                      type="number"
                      value={editForm.audioCount}
                      onChange={(e) => setEditForm({ ...editForm, audioCount: e.target.value })}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Status</span>
                    <select
                      className={styles.input}
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className={styles.editActions}>
                  <button
                    type="button"
                    className={`p-pill p-pill-primary ${styles.submit}`}
                    onClick={() => saveEdit(row.id)}
                  >
                    <Check size={16} /> Save
                  </button>
                  <button
                    type="button"
                    className={`p-pill p-pill-ghost ${styles.ghostBtn}`}
                    onClick={() => setEditingId(null)}
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => deleteDrop(row.id)}
                    aria-label={`Delete ${row.name}`}
                    title="Delete drop"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ) : (
              <div key={row.id} className={styles.gridRow}>
                <div>
                  <div className={`p-display ${styles.dropName}`}>{row.name}</div>
                  <div className={styles.dropNote}>{row.note}</div>
                </div>
                <div className={`${styles.cellHide} ${styles.cellText}`}>{row.videosCount} clips</div>
                <div className={`${styles.cellHide} ${styles.cellText}`}>{row.audioCount} tracks</div>
                <div>
                  <span className={`p-badge ${badgeClass(row.status)}`}>{row.status}</span>
                </div>
                <div className={styles.cellRight}>
                  <button type="button" className={styles.manage} onClick={() => startEdit(row)}>
                    Manage <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
