import { EARNINGS } from "../data";
import styles from "./page.module.css";

export const metadata = { title: "Earnings · Instructor · Thayya™" };

export default function InstructorEarnings() {
  const { overline, title, balance, year, commissionsLabel, commissions } = EARNINGS;

  return (
    <div className="p-wrap">
      <header className={styles.head}>
        <div className="p-overline">{overline}</div>
        <h1 className={`p-display ${styles.title}`}>{title}</h1>
      </header>

      <section className={styles.grid}>
        <div className={styles.balanceCard}>
          <div className={`p-grad-warm ${styles.blob}`} />
          <div className="grain" />
          <div className={styles.balanceInner}>
            <div className={styles.balanceLabel}>{balance.label}</div>
            <div className={`p-display ${styles.balanceAmount}`}>{balance.amount}</div>
            <div className={styles.balanceNote}>{balance.note}</div>
            {/* Payouts wired later via Razorpay — display-only pill */}
            <button type="button" className={`p-pill p-pill-primary ${styles.withdraw}`}>
              {balance.cta}
            </button>
          </div>
        </div>
        <div className={`p-card ${styles.yearCard}`}>
          <div className="p-overline">{year.label}</div>
          <div className={`p-display gradient-text ${styles.yearAmount}`}>{year.amount}</div>
          <div className={styles.yearDelta}>{year.delta}</div>
        </div>
      </section>

      <section className={`p-card ${styles.commList}`}>
        <div className={styles.commHead}>{commissionsLabel}</div>
        {commissions.map((c) => (
          <div key={`${c.name}-${c.date}`} className={styles.commRow}>
            <div>
              <div className={styles.commName}>{c.name}</div>
              <div className={styles.commDate}>{c.date}</div>
            </div>
            <div className={styles.commRight}>
              <div className={`p-display ${styles.commAmount}`}>{c.amount}</div>
              <div
                className={
                  c.status === "Pending" ? styles.statusPending : styles.statusCleared
                }
              >
                {c.status}
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
