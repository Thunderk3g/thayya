"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Play, PartyPopper } from "lucide-react";
import { BOOK_WORKSHOP } from "../data";
import styles from "./page.module.css";

export default function BookWorkshopPage() {
  const [step, setStep] = useState(1);
  const w = BOOK_WORKSHOP;

  return (
    <div className="p-wrap">
      <Link href="/member/instructor" className={styles.back}>
        <ChevronLeft size={16} /> Back to instructor
      </Link>

      <div className={styles.grid}>
        {/* Workshop details */}
        <div className={styles.details}>
          <div className={`p-overline ${styles.kicker}`}>{w.kicker}</div>
          <h1 className={`p-display ${styles.title}`}>
            {w.titleStart} <span className="gradient-text">{w.titleAccent}</span>
          </h1>
          <div className={styles.meta}>{w.meta}</div>

          <div className={`p-av-1 ${styles.preview}`}>
            <span className="grain" aria-hidden="true" />
            <span className={styles.playBtn}>
              <Play size={28} fill="#fff" className={styles.playIcon} />
            </span>
            <span className={styles.previewLabel}>{w.previewLabel}</span>
          </div>

          <p className={styles.description}>{w.description}</p>

          <div className={styles.tags}>
            {w.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Checkout card */}
        <div className={styles.checkoutCol}>
          <div className={`p-card ${styles.checkout}`}>
            {step === 1 ? (
              <div>
                <div className={styles.priceRow}>
                  <span className={`p-display ${styles.price}`}>{w.price}</span>
                  <span className={styles.spotsLeft}>{w.spotsLeft}</span>
                </div>
                <div className={styles.priceNote}>{w.priceNote}</div>

                <div className={`p-overline ${styles.summaryKicker}`}>
                  {w.summaryKicker}
                </div>
                <div className={styles.summary}>
                  {w.summary.map((line) => (
                    <div key={line.label} className={styles.summaryLine}>
                      <span>{line.label}</span>
                      <span className={styles.summaryValue}>{line.value}</span>
                    </div>
                  ))}
                  <div className={`${styles.summaryLine} ${styles.summaryTotal}`}>
                    <span>{w.summaryTotal.label}</span>
                    <span className={`p-display gradient-text ${styles.totalValue}`}>
                      {w.summaryTotal.value}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`p-grad-warm ${styles.confirmBtn}`}
                >
                  {w.confirmLabel}
                </button>
                <div className={styles.paymentNote}>{w.paymentNote}</div>
              </div>
            ) : (
              <div className={styles.confirmed}>
                <div className={`p-pulse-gold ${styles.confirmedIcon}`}>
                  <PartyPopper size={28} />
                </div>
                <div className={`p-display ${styles.confirmedTitle}`}>
                  {w.confirmation.title}
                </div>
                <div className={styles.confirmedSub}>
                  {w.confirmation.subtitle}
                </div>
                <div className={`gradient-text ${styles.confirmedPoints}`}>
                  {w.confirmation.points}
                </div>
                <Link href="/member/bookings" className={styles.viewBookingsBtn}>
                  {w.confirmation.cta}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
