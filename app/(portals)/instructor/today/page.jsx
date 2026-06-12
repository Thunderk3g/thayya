import Link from "next/link";
import { Play, ArrowUpRight, Star } from "lucide-react";
import { TODAY } from "../data";
import styles from "./page.module.css";

export const metadata = { title: "Today · Instructor · Thayya™" };

export default function InstructorToday() {
  const { dateline, greeting, drop, nextWorkshop, month, stats } = TODAY;

  return (
    <div className="p-wrap">
      <header className={styles.head}>
        <div className="p-overline">{dateline}</div>
        <h1 className={`p-display ${styles.title}`}>
          {greeting.lead} <span className="gradient-text">{greeting.name}</span>.
          <br />
          <span className={`display-italic gradient-text ${styles.brush}`}>
            {greeting.brush}
          </span>
          .
        </h1>
      </header>

      {/* April Drop hero */}
      <section className={styles.hero}>
        <div className={styles.heroTint} />
        <div className="grain" />
        <div className={styles.heroGrid}>
          <div className={styles.heroLeft}>
            <span className={styles.dropBadge}>{drop.badge}</span>
            <h2 className={`p-display ${styles.heroTitle}`}>
              {drop.title}{" "}
              <span className="display-italic gradient-text">{drop.titleAccent}</span>
            </h2>
            <p className={styles.heroBlurb}>{drop.blurb}</p>
            <Link href={drop.cta.href} className={`p-pill p-pill-primary ${styles.heroCta}`}>
              <Play size={16} fill="currentColor" /> {drop.cta.label}
            </Link>
          </div>
          <div className={styles.heroRight}>
            <div className={`p-grad-vivid ${styles.heroPanel}`} />
            <div className={`p-display ${styles.heroNumeral}`}>{drop.numeral}</div>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section className={styles.statsGrid}>
        <div className={`p-card ${styles.nextCard}`}>
          <div className={styles.nextHead}>
            <div className="p-overline">{nextWorkshop.label}</div>
            <span className="p-badge p-badge-hot">{nextWorkshop.badge}</span>
          </div>
          <div className={`p-display ${styles.nextTitle}`}>{nextWorkshop.title}</div>
          <div className={styles.nextMeta}>{nextWorkshop.meta}</div>
          <div className={styles.track}>
            <div
              className={`p-grad-warm ${styles.fill}`}
              style={{ width: `${nextWorkshop.fillPct}%` }}
            />
          </div>
        </div>
        <div className={`p-card ${styles.monthCard}`}>
          <div className="p-overline">{month.label}</div>
          <div className={`p-display gradient-text ${styles.monthAmount}`}>{month.amount}</div>
          <div className={styles.monthDelta}>
            <ArrowUpRight size={12} /> {month.delta}
          </div>
        </div>
      </section>

      {/* Quick stat tiles */}
      <section className={styles.tiles}>
        {stats.map((s) => (
          <div key={s.label} className={`p-card ${styles.tile}`}>
            <div className={`p-display ${styles.tileValue}`}>
              {s.value}
              {s.star && <Star size={20} fill="currentColor" className={styles.star} />}
            </div>
            <div className={styles.tileLabel}>{s.label}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
