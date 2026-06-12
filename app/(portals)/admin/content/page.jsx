import { Upload, ArrowRight } from "lucide-react";
import { CONTENT_DROPS } from "../data";
import styles from "./page.module.css";

export const metadata = { title: "Admin · Content Drops — Thayya™" };

const TONE_CLASS = {
  live: "badgeLive",
  review: "badgeReview",
  planning: "badgePlanning",
};

export default function AdminContentPage() {
  const { overline, title, action, columns, manageLabel, rows } = CONTENT_DROPS;

  return (
    <div className="p-wrap">
      <div className={styles.head}>
        <div>
          <div className="p-overline">{overline}</div>
          <h1 className={`p-display ${styles.h1}`}>{title}</h1>
        </div>
        <button type="button" className={`p-pill p-grad-warm ${styles.newDrop}`}>
          <Upload size={16} /> {action}
        </button>
      </div>

      <div className={`p-card ${styles.tableCard}`}>
        <div className={`${styles.gridRow} ${styles.gridHead}`}>
          <div>{columns.drop}</div>
          <div className={styles.cellHide}>{columns.videos}</div>
          <div className={styles.cellHide}>{columns.audio}</div>
          <div>{columns.status}</div>
          <div className={styles.cellRight}>{columns.actions}</div>
        </div>

        {rows.map((row) => (
          <div key={row.name} className={styles.gridRow}>
            <div>
              <div className={`p-display ${styles.dropName}`}>{row.name}</div>
              <div className={styles.dropNote}>{row.note}</div>
            </div>
            <div className={`${styles.cellHide} ${styles.cellText}`}>{row.videos}</div>
            <div className={`${styles.cellHide} ${styles.cellText}`}>{row.audio}</div>
            <div>
              <span className={`p-badge ${styles[TONE_CLASS[row.tone]]}`}>{row.status}</span>
            </div>
            <div className={styles.cellRight}>
              <button type="button" className={styles.manage}>
                {manageLabel} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
