import { getCurrentUser } from "../../../../lib/auth";
import { getInstructorEarnings } from "../../../../lib/db";
import { EARNINGS } from "../data";
import WithdrawButton from "./WithdrawButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Earnings · Instructor · Thayya™" };

function fmtRupees(n) {
  return `₹${(Number(n) || 0).toLocaleString("en-IN")}`;
}

export default async function InstructorEarnings() {
  const { overline, title, balance, year, commissionsLabel } = EARNINGS;
  const user = await getCurrentUser();
  const instructorId = user?.instructorId;

  const earnings = instructorId
    ? await getInstructorEarnings(instructorId)
    : { balance: 0, year: 0, commissions: [] };

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
            <div className={`p-display ${styles.balanceAmount}`}>
              {fmtRupees(earnings.balance)}
            </div>
            <div className={styles.balanceNote}>{balance.note}</div>
            {/* Payouts wired later via Razorpay — records intent for now */}
            <WithdrawButton
              amount={earnings.balance}
              label={balance.cta}
              className={`p-pill p-pill-primary ${styles.withdraw}`}
            />
          </div>
        </div>
        <div className={`p-card ${styles.yearCard}`}>
          <div className="p-overline">{year.label}</div>
          <div className={`p-display gradient-text ${styles.yearAmount}`}>
            {fmtRupees(earnings.year)}
          </div>
          <div className={styles.yearDelta}>Your 70% share, all-time</div>
        </div>
      </section>

      <section className={`p-card ${styles.commList}`}>
        <div className={styles.commHead}>{commissionsLabel}</div>
        {earnings.commissions.length === 0 ? (
          <div className={styles.commRow}>
            <div className={styles.commName}>No commissions yet.</div>
          </div>
        ) : (
          earnings.commissions.map((c, i) => (
            <div key={`${c.title}-${i}`} className={styles.commRow}>
              <div>
                <div className={styles.commName}>{c.title}</div>
                <div className={styles.commDate}>{c.date}</div>
              </div>
              <div className={styles.commRight}>
                <div className={`p-display ${styles.commAmount}`}>{fmtRupees(c.amount)}</div>
                <div
                  className={
                    c.status === "Pending" ? styles.statusPending : styles.statusCleared
                  }
                >
                  {c.status}
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
