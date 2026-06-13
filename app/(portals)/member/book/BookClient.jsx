"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, PartyPopper } from "lucide-react";
import ClassArt from "../../../components/art/ClassArt";
import styles from "./page.module.css";

const TAGS = ["90 minutes", "All levels", "Bring water", "AC studio"];

function rupees(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

export default function BookClient({ workshop }) {
  const w = workshop;
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [points, setPoints] = useState(25);
  const [previewNote, setPreviewNote] = useState(false);

  async function confirm() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workshopId: w.id }),
      });
      if (res.status === 401) {
        window.location.href = `/login?next=/member/book?workshopId=${w.id}`;
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not complete the booking.");
      }
      if (typeof data.pointsAwarded === "number") setPoints(data.pointsAwarded);
      else if (data.alreadyBooked) setPoints(0);
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-wrap">
      <Link href="/member/discover" className={styles.back}>
        <ChevronLeft size={16} /> Back to Discover
      </Link>

      <div className={styles.grid}>
        {/* Workshop details */}
        <div className={styles.details}>
          <div className={`p-overline ${styles.kicker}`}>Workshop</div>
          <h1 className={`p-display ${styles.title}`}>
            <span className="gradient-text">{w.title}</span>
          </h1>
          <div className={styles.meta}>
            With {w.instructor} · {w.date} · {w.time}
            {w.venue ? ` · ${w.venue}` : ""}
          </div>

          <button
            type="button"
            className={styles.preview}
            onClick={() => setPreviewNote(true)}
            aria-label="Workshop preview"
          >
            <ClassArt seed={w.id} label={w.title} play />
            <span className="grain" aria-hidden="true" />
            <span className={styles.previewLabel}>
              {previewNote ? "Preview coming soon" : "Preview"}
            </span>
          </button>

          <p className={styles.description}>
            A high-energy session with {w.instructor}. We will break down the
            choreography section by section, drill the formations, then end with
            a full run-through. Open to all levels with prior dance experience.
          </p>

          <div className={styles.tags}>
            {TAGS.map((tag) => (
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
                  <span className={`p-display ${styles.price}`}>
                    {rupees(w.price)}
                  </span>
                  <span className={styles.spotsLeft}>
                    {w.spotsLeft} spots left
                  </span>
                </div>
                <div className={styles.priceNote}>
                  per person · all taxes included
                </div>

                <div className={`p-overline ${styles.summaryKicker}`}>
                  Order summary
                </div>
                <div className={styles.summary}>
                  <div className={styles.summaryLine}>
                    <span>{w.title} × 1</span>
                    <span className={styles.summaryValue}>{rupees(w.price)}</span>
                  </div>
                  <div className={styles.summaryLine}>
                    <span>Taxes &amp; fees</span>
                    <span className={styles.summaryValue}>Included</span>
                  </div>
                  <div className={`${styles.summaryLine} ${styles.summaryTotal}`}>
                    <span>Total due today</span>
                    <span className={`p-display gradient-text ${styles.totalValue}`}>
                      {rupees(w.price)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={confirm}
                  disabled={submitting || w.spotsLeft <= 0}
                  className={`p-grad-warm ${styles.confirmBtn}`}
                >
                  {submitting
                    ? "Reserving…"
                    : w.spotsLeft <= 0
                    ? "Sold out"
                    : "Confirm booking"}
                </button>
                {error && <div className={styles.bookError}>{error}</div>}
                <div className={styles.paymentNote}>
                  Online payments via Razorpay are launching soon — your spot is
                  reserved instantly.
                </div>
              </div>
            ) : (
              <div className={styles.confirmed}>
                <div className={`p-pulse-gold ${styles.confirmedIcon}`}>
                  <PartyPopper size={28} />
                </div>
                <div className={`p-display ${styles.confirmedTitle}`}>
                  You're in!
                </div>
                <div className={styles.confirmedSub}>
                  Confirmation sent via WhatsApp
                </div>
                <div className={`gradient-text ${styles.confirmedPoints}`}>
                  {points > 0
                    ? `+${points} loyalty points earned`
                    : "Already in your bookings"}
                </div>
                <Link href="/member/bookings" className={styles.viewBookingsBtn}>
                  View my bookings
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
