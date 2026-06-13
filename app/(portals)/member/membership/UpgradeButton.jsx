"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import styles from "./page.module.css";

export default function UpgradeButton() {
  const [noted, setNoted] = useState(false);

  return (
    <button
      type="button"
      className={`p-grad-warm ${styles.upgradeBtn}`}
      onClick={() => setNoted(true)}
    >
      {noted ? (
        "Razorpay launching soon"
      ) : (
        <>
          Upgrade <ArrowRight size={16} />
        </>
      )}
    </button>
  );
}
