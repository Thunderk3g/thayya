import { ArrowRight } from "lucide-react";
import { COMMISSION } from "../data";
import styles from "./page.module.css";

export const metadata = { title: "Admin · Commission — Thayya™" };

export default function AdminCommissionPage() {
  const { overline, title, split, cadence, queue } = COMMISSION;

  return (
    <div className="p-wrap">
      <div className={styles.head}>
        <div className="p-overline">{overline}</div>
        <h1 className={`p-display ${styles.h1}`}>{title}</h1>
      </div>

      <div className={styles.cards}>
        <div className={`p-card ${styles.card}`}>
          <div className={styles.cardLabel}>{split.label}</div>
          <div className={`p-display ${styles.splitNum}`}>
            <span className="gradient-text">{split.instructorShare}</span>
            <span className={styles.splitMuted}>{split.platformShare}</span>
          </div>
          <p className={styles.desc}>{split.desc}</p>
          {/* Static display only — payout wiring comes later via Razorpay */}
          <button type="button" className={styles.adjust}>
            {split.action} <ArrowRight size={16} />
          </button>
        </div>

        <div className={`p-card ${styles.card}`}>
          <div className={styles.cardLabel}>{cadence.label}</div>
          <div className={`p-display ${styles.cadenceVal}`}>{cadence.value}</div>
          <p className={styles.desc}>{cadence.desc}</p>
          <span className={`p-badge ${styles.badgeAutomated}`}>{cadence.badge}</span>
        </div>
      </div>

      <div className={`p-card ${styles.queueCard}`}>
        <div className={styles.queueHead}>{queue.label}</div>
        {queue.rows.map((row) => (
          <div key={row.name} className={styles.queueRow}>
            <div className={styles.queueName}>{row.name}</div>
            <div className={styles.queueRight}>
              <div className={`p-display ${styles.amount}`}>{row.amount}</div>
              <div className={row.tone === "manual" ? styles.noteManual : styles.noteAuto}>{row.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
