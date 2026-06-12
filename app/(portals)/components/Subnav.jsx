"use client";

// Sticky per-portal sub-nav (the prototype's nav-pill row).

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Subnav.module.css";

export default function Subnav({ items }) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.scroll}>
        <div className={styles.row}>
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.pill} ${active ? styles.active : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
