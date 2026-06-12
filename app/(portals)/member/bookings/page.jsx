import { BOOKINGS } from "../data";
import styles from "./page.module.css";

export const metadata = {
  title: "My Bookings · Thayya™",
};

export default function BookingsPage() {
  return (
    <div className="p-wrap">
      <header className={styles.head}>
        <div className={`p-overline ${styles.kicker}`}>{BOOKINGS.kicker}</div>
        <h1 className={`p-display ${styles.title}`}>{BOOKINGS.title}</h1>
      </header>

      {/* Upcoming */}
      <div className={styles.groupLabel}>{BOOKINGS.upcomingLabel}</div>
      <div className={styles.upcomingList}>
        {BOOKINGS.upcoming.map((b) => (
          <div key={b.title} className={`p-card p-lift ${styles.upcomingRow}`}>
            <div className={styles.dateBlock}>
              <div className={`p-display gradient-text ${styles.dateDay}`}>
                {b.day}
              </div>
              <div className={styles.dateMonth}>{b.month}</div>
            </div>
            <div className={styles.rowBody}>
              <div className={`p-display ${styles.rowTitle}`}>{b.title}</div>
              <div className={styles.rowMeta}>{b.meta}</div>
            </div>
            <div className={`p-display ${styles.rowPrice}`}>{b.price}</div>
          </div>
        ))}
      </div>

      {/* Past */}
      <div className={styles.groupLabel}>{BOOKINGS.pastLabel}</div>
      <div className={styles.pastList}>
        {BOOKINGS.past.map((b) => (
          <div key={b.title} className={`p-card ${styles.pastRow}`}>
            <div className={styles.pastDate}>{b.date}</div>
            <div className={styles.rowBody}>
              <div className={styles.pastTitle}>{b.title}</div>
              <div className={styles.rowMeta}>{b.instructor}</div>
            </div>
            <div className={styles.pastPrice}>{b.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
