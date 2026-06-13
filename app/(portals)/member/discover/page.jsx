import Link from "next/link";
import { Search, Star, ArrowRight, ChevronRight } from "lucide-react";
import { DISCOVER } from "../data";
import {
  listUpcomingWorkshops,
  searchUpcomingWorkshops,
  listInstructorsForDiscover,
} from "../../../../lib/db";
import Avatar from "../../../components/art/Avatar";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Discover · Thayya™",
};

export default async function DiscoverPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const q = typeof sp.q === "string" ? sp.q : "";

  const workshops = q ? await searchUpcomingWorkshops(q) : await listUpcomingWorkshops();
  const instructors = await listInstructorsForDiscover();

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
      <form className={styles.search} role="search" method="get">
        <Search size={20} className={styles.searchIcon} aria-hidden="true" />
        <input
          className={styles.searchInput}
          type="search"
          name="q"
          defaultValue={q}
          placeholder={DISCOVER.searchPlaceholder}
          aria-label={DISCOVER.searchPlaceholder}
        />
        <button type="submit" className={`p-grad-warm ${styles.searchBtn}`}>
          Search
        </button>
      </form>

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
          {instructors.map((person) => (
            <Link
              key={person.instructorId}
              href={`/member/instructor?id=${person.instructorId}`}
              className={`p-lift ${styles.instructorCard}`}
            >
              <span className={styles.tile}>
                <Avatar
                  fill
                  seed={person.instructorId}
                  name={person.name}
                  rounded="squircle"
                />
                <span className="grain" aria-hidden="true" />
                <span className={styles.tileTag}>{person.style}</span>
                <span className={styles.tileMeta}>
                  <span className={styles.tileRating}>
                    <Star size={12} fill="currentColor" /> {person.rating || "—"}
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
              {q ? `Results for “${q}”` : DISCOVER.openSpotsTitle}
            </h2>
          </div>
        </div>

        {workshops.length === 0 ? (
          <div className={`p-card ${styles.row}`}>
            <span className={styles.rowBody}>
              <span className={styles.rowMeta}>
                No workshops match that search yet — try a different name or
                style.
              </span>
            </span>
          </div>
        ) : (
          <div className={styles.rows}>
            {workshops.map((w) => (
              <Link
                key={w.id}
                href={`/member/book?workshopId=${w.id}`}
                className={`p-card p-lift ${styles.row}`}
              >
                <span className={styles.rowAvatar}>
                  <Avatar
                    seed={w.instructor || w.title}
                    name={w.instructor}
                    size={48}
                  />
                </span>
                <span className={styles.rowBody}>
                  <span className={`p-display ${styles.rowTitle}`}>
                    {w.title}
                  </span>
                  <span className={styles.rowMeta}>
                    {w.instructor} · {w.date} · {w.time}
                  </span>
                </span>
                <span className={styles.rowRight}>
                  <span className={`p-display gradient-text ${styles.rowPrice}`}>
                    ₹{w.price.toLocaleString("en-IN")}
                  </span>
                  <span
                    className={w.spotsLeft <= 5 ? styles.spotsUrgent : styles.spotsOk}
                  >
                    {w.spotsLeft} spots left
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
        )}
      </section>
    </div>
  );
}
