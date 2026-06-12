import { Filter } from "lucide-react";
import { STUDENTS } from "../data";
import styles from "./page.module.css";

export const metadata = { title: "My Students · Instructor · Thayya™" };

export default function InstructorStudents() {
  const { overline, title, filter, rows } = STUDENTS;

  return (
    <div className="p-wrap">
      <header className={styles.head}>
        <div>
          <div className="p-overline">{overline}</div>
          <h1 className={`p-display ${styles.title}`}>{title}</h1>
        </div>
        <button type="button" className={`p-pill p-pill-ghost ${styles.filterBtn}`}>
          <Filter size={14} /> {filter}
        </button>
      </header>

      <div className={`p-card ${styles.list}`}>
        {rows.map((s) => (
          <div key={s.initials} className={styles.row}>
            <span className={`p-av-${s.av} ${styles.avatar}`}>{s.initials}</span>
            <div className={styles.info}>
              <div className={styles.name}>{s.name}</div>
              <div className={styles.last}>{s.last}</div>
            </div>
            <div className={styles.right}>
              <div className={`p-display ${styles.total}`}>{s.total}</div>
              <div className={styles.classes}>{s.classes}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
