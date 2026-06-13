import { BOOKINGS } from "../data";
import { getCurrentUser } from "../../../../lib/auth";
import { listBookingsForUser } from "../../../../lib/db";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Bookings · Thayya™",
};

// store dates read like "Wed 29 Apr" → { day: "29", month: "APR" }.
// The numeric token is the day; the last 3-letter word is the month
// (the leading weekday, e.g. "Wed", is skipped because the month always
// comes after the day).
function splitDate(date) {
  const tokens = String(date || "").split(/\s+/);
  const day = tokens.find((t) => /^\d{1,2}$/.test(t)) || "—";
  const month = tokens.filter((t) => /^[A-Za-z]{3}$/.test(t)).pop() || "";
  return { day, month: month.toUpperCase() };
}

export default async function BookingsPage() {
  const user = await getCurrentUser();
  const live = user ? listBookingsForUser(user.id) : [];

  const upcoming = live
    .filter((b) => b.status === "upcoming")
    .map((b) => {
      const { day, month } = splitDate(b.date);
      return {
        key: b.id,
        day,
        month,
        title: b.title,
        meta: `${b.instructor} · ${b.time}`,
        price: `₹${b.price}`,
      };
    });

  // past stays from the seeded demo set (no attendance tracking yet)
  const past = BOOKINGS.past;

  return (
    <div className="p-wrap">
      <header className={styles.head}>
        <div className={`p-overline ${styles.kicker}`}>{BOOKINGS.kicker}</div>
        <h1 className={`p-display ${styles.title}`}>{BOOKINGS.title}</h1>
      </header>

      {/* Upcoming */}
      <div className={styles.groupLabel}>{BOOKINGS.upcomingLabel}</div>
      {upcoming.length === 0 ? (
        <div className={`p-card ${styles.empty}`}>
          No upcoming workshops yet — book one from Discover or ask the Thayya
          assistant to reserve a spot for you.
        </div>
      ) : (
        <div className={styles.upcomingList}>
          {upcoming.map((b) => (
            <div key={b.key} className={`p-card p-lift ${styles.upcomingRow}`}>
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
      )}

      {/* Past */}
      <div className={styles.groupLabel}>{BOOKINGS.pastLabel}</div>
      <div className={styles.pastList}>
        {past.map((b) => (
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
