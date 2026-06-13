"use client";

import { useState } from "react";
import { Filter, Search } from "lucide-react";
import styles from "./page.module.css";

function initialsOf(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "··";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function lastAttended(ms) {
  if (ms == null) return "No classes yet";
  const diff = Date.now() - Number(ms);
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "Last attended today";
  const days = Math.floor(diff / day);
  if (days === 1) return "Last attended 1 day ago";
  if (days < 14) return `Last attended ${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `Last attended ${weeks} weeks ago`;
}

function fmtRupees(n) {
  return `₹${(Number(n) || 0).toLocaleString("en-IN")}`;
}

export default function StudentsClient({ rows, overline, title, filterLabel }) {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const all = rows || [];
  const q = query.trim().toLowerCase();
  const filtered = q ? all.filter((s) => (s.name || "").toLowerCase().includes(q)) : all;

  return (
    <div className="p-wrap">
      <header className={styles.head}>
        <div>
          <div className="p-overline">{overline}</div>
          <h1 className={`p-display ${styles.title}`}>{title}</h1>
        </div>
        <button
          type="button"
          className={`p-pill p-pill-ghost ${styles.filterBtn}`}
          onClick={() => setShowSearch((v) => !v)}
        >
          <Filter size={14} /> {filterLabel}
        </button>
      </header>

      {showSearch ? (
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter students by name…"
            autoFocus
          />
        </div>
      ) : null}

      <div className={`p-card ${styles.list}`}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            {all.length === 0 ? "No students have booked your workshops yet." : "No matching students."}
          </div>
        ) : (
          filtered.map((s, i) => (
            <div key={s.userId} className={styles.row}>
              <span className={`p-av-${(i % 6) + 1} ${styles.avatar}`}>{initialsOf(s.name)}</span>
              <div className={styles.info}>
                <div className={styles.name}>{s.name}</div>
                <div className={styles.last}>{lastAttended(s.lastAt)}</div>
              </div>
              <div className={styles.right}>
                <div className={`p-display ${styles.total}`}>{fmtRupees(s.totalSpend)}</div>
                <div className={styles.classes}>
                  {s.classes} {s.classes === 1 ? "class" : "classes"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
