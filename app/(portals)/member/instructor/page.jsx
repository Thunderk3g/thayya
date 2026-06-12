import Link from "next/link";
import { ChevronLeft, Star, BadgeCheck } from "lucide-react";
import { INSTRUCTOR_PROFILE, PROFILE_WORKSHOPS } from "../data";
import styles from "./page.module.css";

export const metadata = {
  title: "Instructor · Thayya™",
};

export default function InstructorPage() {
  const p = INSTRUCTOR_PROFILE;

  return (
    <div className="p-wrap">
      <Link href="/member/discover" className={styles.back}>
        <ChevronLeft size={16} /> Back
      </Link>

      {/* Profile header */}
      <div className={styles.profile}>
        <div className={`p-av-${p.av} ${styles.portrait}`}>
          <span className="grain" aria-hidden="true" />
          <span className={`p-display ${styles.portraitInitials}`}>
            {p.initials}
          </span>
          <span className={styles.certified}>
            <BadgeCheck size={12} className={styles.certifiedIcon} /> Certified
          </span>
        </div>

        <div className={styles.profileBody}>
          <div className={`p-overline ${styles.kicker}`}>{p.kicker}</div>
          <h1 className={`p-display ${styles.name}`}>
            {p.firstName} <span className="gradient-text">{p.lastName}</span>
          </h1>
          <p className={styles.bio}>{p.bio}</p>
          <div className={styles.stats}>
            <span className={styles.stat}>
              <Star size={16} fill="currentColor" className={styles.starIcon} />{" "}
              {p.rating}
            </span>
            <span className={styles.dot}>·</span>
            <span className={styles.stat}>{p.students}</span>
          </div>
          <div className={styles.actions}>
            <button type="button" className={`p-pill p-grad-warm ${styles.followBtn}`}>
              Follow
            </button>
            <button type="button" className="p-pill p-pill-ghost">
              Refer a friend
            </button>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className={styles.scheduleHead}>
        <div className="p-overline">{p.scheduleKicker}</div>
        <h2 className={`p-display ${styles.scheduleTitle}`}>
          {p.scheduleTitle}
        </h2>
      </div>

      <div className={styles.workshopGrid}>
        {PROFILE_WORKSHOPS.map((w) => (
          <Link
            key={w.title}
            href="/member/book"
            className={`p-lift ${styles.workshopCard} ${
              w.featured ? `p-grad-border ${styles.workshopFeatured}` : "p-card"
            }`}
          >
            <span className={`p-display ${styles.workshopTitle}`}>
              {w.title}
            </span>
            <span className={styles.workshopDate}>{w.date}</span>
            <span className={styles.workshopFoot}>
              <span className={`p-display gradient-text ${styles.workshopPrice}`}>
                {w.price}
              </span>
              <span
                className={w.urgent ? styles.spotsUrgent : styles.spotsOk}
              >
                {w.spots}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
