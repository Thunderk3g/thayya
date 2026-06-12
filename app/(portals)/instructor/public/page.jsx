import { Star } from "lucide-react";
import { PUBLIC_PAGE } from "../data";
import styles from "./page.module.css";

export const metadata = { title: "Public Page · Instructor · Thayya™" };

export default function InstructorPublic() {
  const { overlinePrefix, handle, title, url, profile, bookTitle, workshops } =
    PUBLIC_PAGE;

  return (
    <div className="p-wrap">
      <header className={styles.head}>
        <div className="p-overline">
          {overlinePrefix}
          <span className={`gradient-text ${styles.handle}`}>{handle}</span>
        </div>
        <h1 className={`p-display ${styles.title}`}>{title}</h1>
      </header>

      {/* Browser-chrome preview frame */}
      <div className={styles.frame}>
        <div className={styles.chrome}>
          <div className={styles.dots}>
            <span className={styles.dot} style={{ background: "#e5816c" }} />
            <span className={styles.dot} style={{ background: "#e5b470" }} />
            <span className={styles.dot} style={{ background: "#9cb48a" }} />
          </div>
          <div className={styles.url}>{url}</div>
        </div>

        <div className={styles.preview}>
          <div className="grain" />
          <div className={styles.profileGrid}>
            <div className={`p-av-1 ${styles.avatar}`}>
              <div className="grain" />
              <span className={`p-display ${styles.initials}`}>{profile.initials}</span>
            </div>
            <div className={styles.profileInfo}>
              <div className="p-overline">{profile.overline}</div>
              <h2 className={`p-display ${styles.name}`}>
                {profile.first}{" "}
                <span className="gradient-text">{profile.lastAccent}</span>
              </h2>
              <p className={styles.bio}>{profile.bio}</p>
              <div className={styles.statsRow}>
                <span className={styles.rating}>
                  <Star size={16} fill="currentColor" className={styles.star} />{" "}
                  {profile.rating}
                </span>
                <span className={styles.dotSep}>·</span>
                <span className={styles.taught}>{profile.taught}</span>
              </div>
            </div>
          </div>

          <div className={`p-display ${styles.bookTitle}`}>{bookTitle}</div>
          <div className={styles.bookGrid}>
            {workshops.map((w) => (
              <div key={w.title} className={styles.bookCard}>
                <div className={`p-display ${styles.bookCardTitle}`}>{w.title}</div>
                <div className={styles.bookWhen}>{w.when}</div>
                <div className={styles.bookFoot}>
                  <span className={`p-display gradient-text ${styles.price}`}>
                    {w.price}
                  </span>
                  <span className={`p-grad-warm ${styles.bookChip}`}>Book</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
