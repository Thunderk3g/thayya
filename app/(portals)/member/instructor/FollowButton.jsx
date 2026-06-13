"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function FollowButton({ instructorId, initialFollowing }) {
  const [following, setFollowing] = useState(Boolean(initialFollowing));
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !following;
    setFollowing(next); // optimistic
    setBusy(true);
    try {
      const res = await fetch("/api/member/follows", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId }),
      });
      if (!res.ok) setFollowing(!next); // revert
    } catch {
      setFollowing(!next); // revert
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={
        following
          ? "p-pill p-pill-ghost"
          : `p-pill p-grad-warm ${styles.followBtn}`
      }
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
