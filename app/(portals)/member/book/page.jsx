"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Play, PartyPopper } from "lucide-react";
import { BOOK_WORKSHOP } from "../data";
import styles from "./page.module.css";

// The static book page demos the flagship workshop; its stable catalog id
// lives in the data store (lib/db seed).
const WORKSHOP_ID = "aaja-nachle-intensive";

export default function BookWorkshopPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const w = BOOK_WORKSHOP;

  async function confirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workshopId: WORKSHOP_ID }),
      });
      if (res.status === 401) {
        // not signed in — send them to login, returning here afterwards
        window.location.href = "/login?next=/member/book";
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not complete the booking.");
      }
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

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
                  onClick={confirm}
                  disabled={submitting}
                  className={`p-grad-warm ${styles.confirmBtn}`}
                >
                  {submitting ? "Reserving…" : w.confirmLabel}
                </button>
                {error && <div className={styles.bookError}>{error}</div>}
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
