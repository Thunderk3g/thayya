"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function WithdrawButton({ amount, label, className }) {
  const [state, setState] = useState("idle"); // idle | busy | done | error

  async function withdraw() {
    setState("busy");
    try {
      const res = await fetch("/api/instructor/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <button type="button" className={className} disabled>
        <Check size={16} /> Withdrawal requested
      </button>
    );
  }

  return (
    <button type="button" className={className} onClick={withdraw} disabled={state === "busy"}>
      {state === "busy" ? "Requesting…" : state === "error" ? "Try again" : label}
    </button>
  );
}
