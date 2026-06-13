"use client";

import { useState } from "react";

export default function ReferButton({ code }) {
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
      // clipboard blocked — the code stays visible for manual copy
    }
  }

  return (
    <button type="button" onClick={onClick} className="p-pill p-pill-ghost">
      {!revealed ? "Refer a friend" : copied ? "Copied!" : `Copy code · ${code}`}
    </button>
  );
}
