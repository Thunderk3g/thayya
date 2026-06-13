import { BadgeCheck } from "lucide-react";
import { listInstructors } from "../../../../lib/db";
import Avatar from "../../../components/art/Avatar";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Instructors — Thayya™" };

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
          rows.map((row) => (
            <div key={row.id} className={styles.row}>
              <Avatar seed={row.instructorId || row.id} name={row.name} size={48} />
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
