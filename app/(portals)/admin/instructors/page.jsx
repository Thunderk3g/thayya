import { BadgeCheck } from "lucide-react";
import { INSTRUCTORS } from "../data";
import styles from "./page.module.css";

export const metadata = { title: "Admin · Instructors — Thayya™" };

export default function AdminInstructorsPage() {
  const { overline, title, studentsLabel, rows } = INSTRUCTORS;

  return (
    <div className="p-wrap">
      <div className={styles.head}>
        <div className="p-overline">{overline}</div>
        <h1 className={`p-display ${styles.h1}`}>{title}</h1>
      </div>

      <div className={`p-card ${styles.listCard}`}>
        {rows.map((row) => (
          <div key={row.name} className={styles.row}>
            <div className={`p-av-${row.av} ${styles.avatar}`}>{row.initials}</div>
            <div className={styles.info}>
              <div className={styles.nameRow}>
                <span className={styles.name}>{row.name}</span>
                <BadgeCheck size={14} className={styles.verified} />
              </div>
              <div className={styles.meta}>
                {row.style} · {row.city}
              </div>
            </div>
            <div className={styles.stats}>
              <div className={`p-display ${styles.statNum}`}>{row.students}</div>
              <div className={styles.statLabel}>{studentsLabel}</div>
            </div>
            <span className={`p-badge ${styles.badgeActive}`}>{row.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
