import Link from "next/link";
import { Search, Star, ArrowRight, ChevronRight } from "lucide-react";
import { DISCOVER, INSTRUCTORS, OPEN_SPOTS } from "../data";
import styles from "./page.module.css";

export const metadata = {
  title: "Discover · Thayya™",
};

export default function DiscoverPage() {
  return (
    <div className="p-wrap">
      {/* Hero */}
      <header className={styles.hero}>
        <div className={`p-overline ${styles.kicker}`}>{DISCOVER.kicker}</div>
        <h1 className={`p-display ${styles.heroTitle}`}>
          Find your <span className="gradient-text">rhythm</span>.
          <br />
          Move with your{" "}
          <span className="display-italic gradient-text">tribe</span>.
        </h1>
        <p className={styles.heroIntro}>{DISCOVER.intro}</p>
      </header>

      {/* Search */}
      <div className={styles.search} role="search">
        <Search size={20} className={styles.searchIcon} aria-hidden="true" />
        <input
          className={styles.searchInput}
          type="search"
          placeholder={DISCOVER.searchPlaceholder}
          aria-label={DISCOVER.searchPlaceholder}
        />
        <button type="button" className={`p-grad-warm ${styles.searchBtn}`}>
          Search
        </button>
      </div>

      {/* Featured instructors */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <div className="p-overline">{DISCOVER.featuredKicker}</div>
            <h2 className={`p-display ${styles.sectionTitle}`}>
              {DISCOVER.featuredTitle}
            </h2>
          </div>
          <Link href="/member/instructor" className={styles.viewAll}>
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.instructorGrid}>
          {INSTRUCTORS.map((person) => (
            <Link
              key={person.id}
              href="/member/instructor"
              className={`p-lift ${styles.instructorCard}`}
            >
              <span className={`p-av-${person.av} ${styles.tile}`}>
                <span className="grain" aria-hidden="true" />
                <span className={styles.tileTag}>{person.tag}</span>
                <span className={`p-display ${styles.tileInitials}`}>
                  {person.initials}
                </span>
                <span className={styles.tileMeta}>
                  <span className={styles.tileRating}>
                    <Star size={12} fill="currentColor" /> {person.rating}
                  </span>
                  <span>{person.city}</span>
                </span>
              </span>
              <span className={`p-display ${styles.instructorName}`}>
                {person.name}
              </span>
              <span className={styles.instructorStyle}>{person.style}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Open spots */}
      <section>
        <div className={styles.sectionHead}>
          <div>
            <div className="p-overline">{DISCOVER.openSpotsKicker}</div>
            <h2 className={`p-display ${styles.sectionTitle}`}>
              {DISCOVER.openSpotsTitle}
            </h2>
          </div>
        </div>

        <div className={styles.rows}>
          {OPEN_SPOTS.map((workshop) => (
            <Link
              key={workshop.title}
              href="/member/book"
              className={`p-card p-lift ${styles.row}`}
            >
              <span
                className={`p-av-${workshop.av} p-display ${styles.rowAvatar}`}
              >
                {workshop.initials}
              </span>
              <span className={styles.rowBody}>
                <span className={`p-display ${styles.rowTitle}`}>
                  {workshop.title}
                </span>
                <span className={styles.rowMeta}>{workshop.meta}</span>
              </span>
              <span className={styles.rowRight}>
                <span className={`p-display gradient-text ${styles.rowPrice}`}>
                  {workshop.price}
                </span>
                <span
                  className={
                    workshop.urgent ? styles.spotsUrgent : styles.spotsOk
                  }
                >
                  {workshop.spots}
                </span>
              </span>
              <ChevronRight
                size={16}
                className={styles.rowChevron}
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
