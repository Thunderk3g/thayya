import Link from "next/link";
import { ChevronLeft, Star, BadgeCheck } from "lucide-react";
import { getCurrentUser } from "../../../../lib/auth";
import {
  getInstructorProfile,
  listInstructorsForDiscover,
  isFollowing,
  referralCode,
} from "../../../../lib/db";
import FollowButton from "./FollowButton";
import ReferButton from "./ReferButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Instructor · Thayya™",
};

function initialsOf(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();
}

function splitName(name) {
  const parts = String(name || "").trim().split(/\s+/);
  if (parts.length <= 1) return { first: parts[0] || "Instructor", last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

export default async function InstructorPage({ searchParams }) {
  const sp = (await searchParams) || {};
  let id = typeof sp.id === "string" ? sp.id : "";

  let profile = id ? await getInstructorProfile(id) : null;

  // Fall back to the first discoverable instructor when no/unknown id.
  if (!profile) {
    const list = await listInstructorsForDiscover();
    if (list[0]?.instructorId) {
      id = list[0].instructorId;
      profile = await getInstructorProfile(id);
    }
  }

  if (!profile) {
    return (
      <div className="p-wrap">
        <Link href="/member/discover" className={styles.back}>
          <ChevronLeft size={16} /> Back
        </Link>
        <div className="p-card" style={{ padding: 24 }}>
          <div className={`p-display ${styles.scheduleTitle}`}>
            Instructor not found
          </div>
          <p className={styles.bio}>
            That instructor is no longer listed. Head back to Discover to find
            your next class.
          </p>
        </div>
      </div>
    );
  }

  const { first, last } = splitName(profile.name);
  const user = await getCurrentUser();
  const following = user ? await isFollowing(user.id, profile.instructorId) : false;
  const code = referralCode(user);
  const ws = profile.workshops || [];

  return (
    <div className="p-wrap">
      <Link href="/member/discover" className={styles.back}>
        <ChevronLeft size={16} /> Back
      </Link>

      {/* Profile header */}
      <div className={styles.profile}>
        <div className={`p-av-1 ${styles.portrait}`}>
          <span className="grain" aria-hidden="true" />
          <span className={`p-display ${styles.portraitInitials}`}>
            {initialsOf(profile.name)}
          </span>
          {profile.verified ? (
            <span className={styles.certified}>
              <BadgeCheck size={12} className={styles.certifiedIcon} /> Certified
            </span>
          ) : null}
        </div>

        <div className={styles.profileBody}>
          <div className={`p-overline ${styles.kicker}`}>
            {[profile.city, profile.style].filter(Boolean).join(" · ")}
          </div>
          <h1 className={`p-display ${styles.name}`}>
            {first} <span className="gradient-text">{last}</span>
          </h1>
          <p className={styles.bio}>{profile.bio}</p>
          <div className={styles.stats}>
            {profile.rating ? (
              <>
                <span className={styles.stat}>
                  <Star size={16} fill="currentColor" className={styles.starIcon} />{" "}
                  {profile.rating}
                </span>
                <span className={styles.dot}>·</span>
              </>
            ) : null}
            <span className={styles.stat}>{profile.style}</span>
          </div>
          <div className={styles.actions}>
            <FollowButton
              instructorId={profile.instructorId}
              initialFollowing={following}
            />
            <ReferButton code={code} />
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className={styles.scheduleHead}>
        <div className="p-overline">Schedule</div>
        <h2 className={`p-display ${styles.scheduleTitle}`}>
          Upcoming workshops
        </h2>
      </div>

      {ws.length === 0 ? (
        <div className="p-card" style={{ padding: 20 }}>
          <span className={styles.workshopDate}>
            No upcoming workshops scheduled right now — check back soon.
          </span>
        </div>
      ) : (
        <div className={styles.workshopGrid}>
          {ws.map((w, i) => (
            <Link
              key={w.id}
              href={`/member/book?workshopId=${w.id}`}
              className={`p-lift ${styles.workshopCard} ${
                i === 0 ? `p-grad-border ${styles.workshopFeatured}` : "p-card"
              }`}
            >
              <span className={`p-display ${styles.workshopTitle}`}>
                {w.title}
              </span>
              <span className={styles.workshopDate}>
                {w.date} · {w.time}
              </span>
              <span className={styles.workshopFoot}>
                <span className={`p-display gradient-text ${styles.workshopPrice}`}>
                  ₹{w.price.toLocaleString("en-IN")}
                </span>
                <span className={w.spotsLeft <= 5 ? styles.spotsUrgent : styles.spotsOk}>
                  {w.spotsLeft} spots
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
