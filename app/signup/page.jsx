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

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only honor internal paths (open-redirect guard).
  const rawNext = searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;
  const initialRole = searchParams.get("role") === "instructor" ? "instructor" : "member";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create your account. Please try again.");
        setLoading(false);
        return;
      }
      const home = ROLE_HOME[data.user?.role] || ROLE_HOME[role] || "/member/discover";
      router.push(next || home);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <span className={styles.label}>I want to join as</span>
          <div className={styles.toggle} role="radiogroup" aria-label="Account type">
            <button
              type="button"
              role="radio"
              aria-checked={role === "member"}
              className={`${styles.toggleBtn} ${role === "member" ? styles.toggleActive : ""}`}
              onClick={() => setRole("member")}
            >
              Member
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={role === "instructor"}
              className={`${styles.toggleBtn} ${role === "instructor" ? styles.toggleActive : ""}`}
              onClick={() => setRole("instructor")}
            >
              Instructor
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className={styles.input}
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            required
          />
        </div>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? "Creating your space…" : "Join the movement"}
        </button>
      </form>

      <p className={styles.switch}>
        Already moving with us?{" "}
        <Link href={loginHref} className="link-sweep">
          Log in
        </Link>
      </p>
    </>
  );
}

export default function SignupPage() {
  return (
    <main className={styles.page}>
      <div className={styles.aurora} aria-hidden="true" />
      <div className={styles.aurora2} aria-hidden="true" />
      <section className={styles.card}>
        <Link href="/" className={`display gradient-text ${styles.wordmark}`}>
          Thayya<span className={styles.tm}>™</span>
        </Link>
        <p className={styles.overline}>Join Thayya</p>
        <h1 className={styles.heading}>Step into the rhythm</h1>

        <Suspense fallback={<div className={styles.formFallback} />}>
          <SignupForm />
        </Suspense>
      </section>
    </main>
  );
}
