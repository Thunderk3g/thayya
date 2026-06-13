"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import styles from "./page.module.css";

export default function CancelButton({ bookingId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onCancel() {
    if (!window.confirm("Cancel this booking?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } catch {
      /* leave the row in place on failure */
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onCancel}
      disabled={busy}
      className={`p-pill p-pill-ghost ${styles.cancelBtn}`}
      aria-label="Cancel booking"
    >
      <X size={14} /> {busy ? "Cancelling…" : "Cancel"}
    </button>
  );
}
