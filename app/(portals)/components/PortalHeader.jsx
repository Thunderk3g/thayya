"use client";

// Portal app shell header — role switcher mirrors the prototype's
// Member / Instructor / Admin toggle, as routes instead of JS state.

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./PortalHeader.module.css";

const ROLES = [
  { label: "Member", root: "/member", href: "/member/discover" },
  { label: "Instructor", root: "/instructor", href: "/instructor/today" },
  { label: "Admin", root: "/admin", href: "/admin/overview" },
];

export default function PortalHeader() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href="/" className={`p-display gradient-text ${styles.wordmark}`}>
          Thayya<span className={styles.tm}>™</span>
        </Link>
        <div className={styles.roles}>
          {ROLES.map((role) => {
            const active = pathname.startsWith(role.root);
            return (
              <Link
                key={role.label}
                href={role.href}
                className={`${styles.roleBtn} ${active ? styles.roleActive : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {role.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className={styles.strip}>
        <span>Move · Rise · Shine</span>
        <span className={styles.stripRight}>Switch portals to explore</span>
      </div>
    </header>
  );
}
