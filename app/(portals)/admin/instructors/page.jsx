import { BadgeCheck } from "lucide-react";
import { listInstructors } from "../../../../lib/db";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Instructors — Thayya™" };

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "—";
}

export default async function AdminInstructorsPage() {
  const rows = await listInstructors();

  return (
    <div className="p-wrap">
      <div className={styles.head}>
        <div className="p-overline">Network · {rows.length} strong</div>
        <h1 className={`p-display ${styles.h1}`}>Instructors</h1>
      </div>

      <div className={`p-card ${styles.listCard}`}>
        {rows.length === 0 ? (
          <div className={styles.row}>
            <div className={styles.meta}>No instructors registered yet.</div>
          </div>
        ) : (
          rows.map((row, i) => (
            <div key={row.id} className={styles.row}>
              <div className={`p-av-${(i % 6) + 1} ${styles.avatar}`}>{initials(row.name)}</div>
              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{row.name}</span>
                  {row.verified ? <BadgeCheck size={14} className={styles.verified} /> : null}
                </div>
                <div className={styles.meta}>
                  {[row.style, row.city].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
              <div className={styles.stats}>
                <div className={`p-display ${styles.statNum}`}>{row.students}</div>
                <div className={styles.statLabel}>students</div>
              </div>
              <span className={`p-badge ${styles.badgeActive}`}>
                {row.active ? "Active" : "Paused"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
