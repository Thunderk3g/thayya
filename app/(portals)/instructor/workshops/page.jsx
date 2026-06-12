import { Plus, Clock, MapPin } from "lucide-react";
import { WORKSHOPS } from "../data";
import styles from "./page.module.css";

export const metadata = { title: "My Workshops · Instructor · Thayya™" };

const TONE_CLASS = {
  hot: "p-badge-hot",
  warn: "p-badge-warn",
  cool: "p-badge-cool",
};

export default function InstructorWorkshops() {
  const { overline, title, cta, items } = WORKSHOPS;

  return (
    <div className="p-wrap">
      <header className={styles.head}>
        <div>
          <div className="p-overline">{overline}</div>
          <h1 className={`p-display ${styles.title}`}>{title}</h1>
        </div>
        <button type="button" className={`p-pill p-pill-primary ${styles.newBtn}`}>
          <Plus size={16} /> {cta}
        </button>
      </header>

      <div className={styles.list}>
        {items.map((w) => (
          <article key={`${w.day}-${w.title}`} className={`p-card p-lift ${styles.item}`}>
            <div className={styles.date}>
              <div className={`p-display gradient-text ${styles.day}`}>{w.day}</div>
              <div className={styles.month}>{w.month}</div>
            </div>
            <div className={styles.divider} />
            <div className={styles.info}>
              <div className={`p-display ${styles.itemTitle}`}>{w.title}</div>
              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  <Clock size={12} /> {w.time}
                </span>
                <span className={styles.metaItem}>
                  <MapPin size={12} /> {w.venue}
                </span>
              </div>
            </div>
            <div className={styles.right}>
              <div className={`p-display ${styles.booked}`}>{w.booked}</div>
              <span className={`p-badge ${TONE_CLASS[w.tone]}`}>{w.status}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
