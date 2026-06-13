import { Award, Heart, Sparkles } from "lucide-react";
import { MEMBERSHIP } from "../data";
import { getCurrentUser } from "../../../../lib/auth";
import { referralCode } from "../../../../lib/db";
import ReferCodeButton from "./ReferCodeButton";
import UpgradeButton from "./UpgradeButton";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Membership · Thayya™",
};

// ₹0.5 of redeemable credit per loyalty point.
const CREDIT_PER_POINT = 0.5;

// Ascending tiers; a member sits in the highest tier whose `min` they have met.
const TIERS = [
  { name: "Anklet Tier", min: 0 },
  { name: "Marigold Tier", min: 1000 },
  { name: "Tabla Tier", min: 2000 },
  { name: "Maestro Tier", min: 4000 },
];

function tierFor(points) {
  let current = TIERS[0];
  let next = null;
  for (let i = 0; i < TIERS.length; i++) {
    if (points >= TIERS[i].min) {
      current = TIERS[i];
      next = TIERS[i + 1] || null;
    }
  }
  if (!next) {
    return { current, next: null, progress: 100, toNext: 0 };
  }
  const span = next.min - current.min;
  const into = points - current.min;
  const progress = span > 0 ? Math.min(100, Math.round((into / span) * 100)) : 0;
  return { current, next, progress, toNext: Math.max(0, next.min - points) };
}

function rupees(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export default async function MembershipPage() {
  const m = MEMBERSHIP;
  const user = await getCurrentUser();
  const points = Number(user?.points || 0);
  const credit = Math.round(points * CREDIT_PER_POINT);
  const { current, next, progress, toNext } = tierFor(points);
  const code = referralCode(user);

  return (
    <div className="p-wrap">
      <header className={styles.head}>
        <div className={`p-overline ${styles.kicker}`}>{m.kicker}</div>
        <h1 className={`p-display ${styles.title}`}>{m.title}</h1>
      </header>

      {/* Loyalty card */}
      <div className={styles.loyaltyCard}>
        <span className="grain" aria-hidden="true" />
        <div className={`p-grad ${styles.loyaltyGlow}`} aria-hidden="true" />
        <div className={styles.loyaltyInner}>
          <div className={styles.loyaltyTop}>
            <div>
              <div className={styles.loyaltyTier}>
                Thayya Member · {current.name}
              </div>
              <div
                className={`p-display display-italic gradient-text ${styles.loyaltyTagline}`}
              >
                {m.loyalty.tagline}
              </div>
            </div>
            <Award className={styles.awardIcon} aria-hidden="true" />
          </div>
          <div className={`p-display ${styles.points}`}>
            {points.toLocaleString("en-IN")}
          </div>
          <div className={styles.pointsNote}>
            loyalty points · {rupees(credit)} redeemable credit
          </div>
          <div className={styles.progressTrack}>
            <div
              className={`p-grad ${styles.progressFill}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.nextTier}>
            {next ? (
              <>
                <strong>{toNext.toLocaleString("en-IN")} points</strong> to{" "}
                <strong>{next.name}</strong>
              </>
            ) : (
              <strong>Top tier reached — enjoy the perks.</strong>
            )}
          </div>
        </div>
      </div>

      {/* Refer / Upgrade */}
      <div className={styles.cards}>
        <div className={`p-card p-lift ${styles.card}`}>
          <Heart size={24} className={styles.heartIcon} aria-hidden="true" />
          <div className={`p-display ${styles.cardTitle}`}>{m.refer.title}</div>
          <div className={styles.cardBody}>{m.refer.body}</div>
          <ReferCodeButton code={code} />
        </div>

        <div className={`p-grad-border p-lift ${styles.card} ${styles.cardUpgrade}`}>
          <Sparkles size={24} className={styles.sparklesIcon} aria-hidden="true" />
          <div className={`p-display ${styles.cardTitle}`}>
            {m.upgrade.title}
          </div>
          <div className={styles.cardBody}>{m.upgrade.body}</div>
          <UpgradeButton />
        </div>
      </div>
    </div>
  );
}
