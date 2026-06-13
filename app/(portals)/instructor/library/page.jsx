import { Check } from "lucide-react";
import { LIBRARY } from "../data";
import LibraryClient from "./LibraryClient";
import styles from "./page.module.css";

export const metadata = { title: "Content Library · Instructor · Thayya™" };

export default function InstructorLibrary() {
  const { overline, title, badge, blurb, videos, audio } = LIBRARY;

  return (
    <div className="p-wrap">
      <header className={styles.head}>
        <div>
          <div className="p-overline">{overline}</div>
          <h1 className={`p-display ${styles.title}`}>{title}</h1>
        </div>
        <span className={`p-badge p-badge-cool ${styles.subBadge}`}>
          <Check size={12} /> {badge}
        </span>
      </header>
      <p className={styles.blurb}>{blurb}</p>

      <LibraryClient videos={videos} audio={audio} />
    </div>
  );
}
