"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import styles from "./page.module.css";

export default function ReferCodeButton({ code }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  async function onClick() {
    if (!revealed) {
      setRevealed(true);
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — code stays visible for manual copy */
    }
  }

  return (
    <button type="button" className={styles.referBtn} onClick={onClick}>
      {!revealed ? (
        <>
          Get my code <ArrowRight size={16} />
        </>
      ) : copied ? (
        "Copied!"
      ) : (
        <>Copy code · {code}</>
      )}
    </button>
  );
}
