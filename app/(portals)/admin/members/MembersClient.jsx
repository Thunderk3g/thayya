"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import styles from "./page.module.css";

function joined(ms) {
  const t = Number(ms);
  if (!Number.isFinite(t) || t <= 0) return "—";
  return new Date(t).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export default function MembersClient({ initialMembers }) {
  const [members] = useState(initialMembers || []);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return members;
    return members.filter(
      (m) =>
        (m.name || "").toLowerCase().includes(term) ||
        (m.email || "").toLowerCase().includes(term)
    );
  }, [q, members]);

  return (
    <div className="p-wrap">
      <div className={styles.head}>
        <div className="p-overline">End Users</div>
        <h1 className={`p-display ${styles.h1}`}>Members</h1>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.count}>
          {members.length} {members.length === 1 ? "member" : "members"}
          {q.trim() ? ` · ${filtered.length} matching` : ""}
        </div>
        <label className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email"
          />
        </label>
      </div>

      <div className={`p-card ${styles.tableCard}`}>
        <div className={`${styles.gridRow} ${styles.gridHead}`}>
          <div>Member</div>
          <div className={styles.cellHide}>Email</div>
          <div className={styles.cellRight}>Points</div>
          <div className={styles.cellHide}>City</div>
          <div className={styles.cellRight}>Joined</div>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.gridRow}>
            <div className={styles.metaText}>No members match that search.</div>
          </div>
        ) : (
          filtered.map((m) => (
            <div key={m.id} className={styles.gridRow}>
              <div className={styles.nameCell}>{m.name}</div>
              <div className={`${styles.cellHide} ${styles.metaText}`}>{m.email}</div>
              <div className={`p-display ${styles.cellRight} ${styles.points}`}>{m.points}</div>
              <div className={`${styles.cellHide} ${styles.metaText}`}>{m.city || "—"}</div>
              <div className={`${styles.cellRight} ${styles.metaText}`}>{joined(m.createdAt)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
