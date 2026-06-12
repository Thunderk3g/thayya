import { Award, Heart, Sparkles, ArrowRight } from "lucide-react";
import { MEMBERSHIP } from "../data";
import styles from "./page.module.css";

export const metadata = {
  title: "Membership · Thayya™",
};

export default function MembershipPage() {
  const m = MEMBERSHIP;

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
              <div className={styles.loyaltyTier}>{m.loyalty.tier}</div>
              <div
                className={`p-display display-italic gradient-text ${styles.loyaltyTagline}`}
              >
                {m.loyalty.tagline}
              </div>
            </div>
            <Award className={styles.awardIcon} aria-hidden="true" />
          </div>
          <div className={`p-display ${styles.points}`}>{m.loyalty.points}</div>
          <div className={styles.pointsNote}>{m.loyalty.pointsNote}</div>
          <div className={styles.progressTrack}>
            <div
              className={`p-grad ${styles.progressFill}`}
              style={{ width: `${m.loyalty.progress}%` }}
            />
          </div>
          <div className={styles.nextTier}>
            <strong>{m.loyalty.nextTierPoints}</strong> to{" "}
            <strong>{m.loyalty.nextTierName}</strong>
          </div>
        </div>
      </div>

      {/* Refer / Upgrade */}
      <div className={styles.cards}>
        <div className={`p-card p-lift ${styles.card}`}>
          <Heart size={24} className={styles.heartIcon} aria-hidden="true" />
          <div className={`p-display ${styles.cardTitle}`}>{m.refer.title}</div>
          <div className={styles.cardBody}>{m.refer.body}</div>
          <button type="button" className={styles.referBtn}>
            {m.refer.cta} <ArrowRight size={16} />
          </button>
        </div>

        <div className={`p-grad-border p-lift ${styles.card} ${styles.cardUpgrade}`}>
          <Sparkles size={24} className={styles.sparklesIcon} aria-hidden="true" />
          <div className={`p-display ${styles.cardTitle}`}>
            {m.upgrade.title}
          </div>
          <div className={styles.cardBody}>{m.upgrade.body}</div>
          <button type="button" className={`p-grad-warm ${styles.upgradeBtn}`}>
            {m.upgrade.cta} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
