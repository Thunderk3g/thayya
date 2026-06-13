import Link from "next/link";
import { Play, ArrowUpRight, Star } from "lucide-react";
import { getCurrentUser } from "../../../../lib/auth";
import { getInstructorToday } from "../../../../lib/db";
import { TODAY } from "../data";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Today · Instructor · Thayya™" };

function fmtRupees(n) {
  return `₹${(Number(n) || 0).toLocaleString("en-IN")}`;
}

export default async function InstructorToday() {
  const { dateline, greeting, drop } = TODAY;
  const user = await getCurrentUser();
  const instructorId = user?.instructorId;

  const data = instructorId
    ? await getInstructorToday(instructorId)
    : { nextWorkshop: null, monthEarnings: 0, activeStudents: 0, workshopsThisMonth: 0 };

  const firstName = (user?.name || greeting.name).split(" ")[0];
  const next = data.nextWorkshop;

  const tiles = [
    { value: String(data.activeStudents), label: "Active students" },
    { value: String(data.workshopsThisMonth), label: "Workshops this month" },
  ];
  if (user?.rating) {
    tiles.push({ value: String(user.rating), label: "Avg rating", star: true });
  }

  return (
    <div className="p-wrap">
      <header className={styles.head}>
        <div className="p-overline">{dateline}</div>
        <h1 className={`p-display ${styles.title}`}>
          {greeting.lead} <span className="gradient-text">{firstName}</span>.
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
            <div className="p-overline">Next Workshop</div>
            {next ? (
              <span className="p-badge p-badge-hot">{next.fillPct}% full</span>
            ) : null}
          </div>
          {next ? (
            <>
              <div className={`p-display ${styles.nextTitle}`}>{next.title}</div>
              <div className={styles.nextMeta}>
                {next.time}
                {next.venue ? ` at ${next.venue}` : ""} · {next.bookedCount} of{" "}
                {next.capacity} booked
              </div>
              <div className={styles.track}>
                <div
                  className={`p-grad-warm ${styles.fill}`}
                  style={{ width: `${next.fillPct}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className={`p-display ${styles.nextTitle}`}>No upcoming workshop</div>
              <div className={styles.nextMeta}>
                Schedule a new workshop to start filling seats.
              </div>
            </>
          )}
        </div>
        <div className={`p-card ${styles.monthCard}`}>
          <div className="p-overline">This Month</div>
          <div className={`p-display gradient-text ${styles.monthAmount}`}>
            {fmtRupees(data.monthEarnings)}
          </div>
          <div className={styles.monthDelta}>
            <ArrowUpRight size={12} /> Your 70% share
          </div>
        </div>
      </section>

      {/* Quick stat tiles */}
      <section className={styles.tiles}>
        {tiles.map((s) => (
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
