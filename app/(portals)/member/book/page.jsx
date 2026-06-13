import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { findWorkshop } from "../../../../lib/db";
import BookClient from "./BookClient";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book a workshop · Thayya™",
};

const FALLBACK_ID = "aaja-nachle-intensive";

export default async function BookWorkshopPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const id = typeof sp.workshopId === "string" ? sp.workshopId : FALLBACK_ID;

  let workshop = await findWorkshop(id);
  if (!workshop && id !== FALLBACK_ID) {
    workshop = await findWorkshop(FALLBACK_ID);
  }

  if (!workshop) {
    return (
      <div className="p-wrap">
        <Link href="/member/discover" className={styles.back}>
          <ChevronLeft size={16} /> Back to Discover
        </Link>
        <div className="p-card" style={{ padding: 24 }}>
          <div className={`p-display ${styles.title}`}>Workshop not found</div>
          <p className={styles.description}>
            That workshop is no longer available. Browse Discover for the latest
            sessions.
          </p>
        </div>
      </div>
    );
  }

  return <BookClient workshop={workshop} />;
}
