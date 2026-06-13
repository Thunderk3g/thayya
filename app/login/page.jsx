"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";

const ROLE_HOME = {
  member: "/member/discover",
  instructor: "/instructor/today",
  admin: "/admin/overview",
};

const DEMO_ACCOUNTS = [
  { label: "Member", email: "member@thayya.test" },
  { label: "Instructor", email: "anaya@thayya.test" },
  { label: "Admin", email: "admin@thayya.test" },
];

const DEMO_PASSWORD = "thayya123";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only honor internal paths — a "next" of "//evil.com" or an absolute
  // URL must never become a redirect target (open-redirect guard).
  const rawNext = searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not sign you in. Check your details and try again.");
        setLoading(false);
        return;
      }
      const home = ROLE_HOME[data.user?.role] || "/member/discover";
      router.push(next || home);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function useDemo(demoEmail) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError("");
  }

  const signupHref = next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className={styles.input}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className={styles.input}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? "Stepping in…" : "Step into the rhythm"}
        </button>
      </form>

      <p className={styles.switch}>
        New here?{" "}
        <Link href={signupHref} className="link-sweep">
          Create an account
        </Link>
      </p>

      <div className={styles.demo}>
        <p className={styles.demoTitle}>Demo accounts</p>
        <ul className={styles.demoList}>
          {DEMO_ACCOUNTS.map((acct) => (
            <li key={acct.email} className={styles.demoRow}>
              <span className={styles.demoInfo}>
                <span className={styles.demoRole}>{acct.label}</span>
                <span className={styles.demoEmail}>{acct.email}</span>
              </span>
              <button
                type="button"
                className={styles.demoBtn}
                onClick={() => useDemo(acct.email)}
              >
                Use
              </button>
            </li>
          ))}
        </ul>
        <p className={styles.demoHint}>
          All demo logins use the password <code>{DEMO_PASSWORD}</code>.
        </p>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.aurora} aria-hidden="true" />
      <div className={styles.aurora2} aria-hidden="true" />
      <section className={styles.card}>
        <Link href="/" className={`display gradient-text ${styles.wordmark}`}>
          Thayya<span className={styles.tm}>™</span>
        </Link>
        <p className={styles.overline}>Welcome back</p>
        <h1 className={styles.heading}>Find your beat again</h1>

        <Suspense fallback={<div className={styles.formFallback} />}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
