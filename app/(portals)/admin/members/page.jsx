import { UsersRound } from "lucide-react";
import { MEMBERS } from "../data";
import styles from "./page.module.css";

export const metadata = { title: "Admin · Members — Thayya™" };

export default function AdminMembersPage() {
  const { overline, title, count, note } = MEMBERS;

  return (
    <div className="p-wrap">
      <div className={styles.head}>
        <div className="p-overline">{overline}</div>
        <h1 className={`p-display ${styles.h1}`}>{title}</h1>
      </div>

      <div className={`p-card ${styles.empty}`}>
        <UsersRound size={40} className={styles.icon} />
        <div className={`p-display ${styles.count}`}>{count}</div>
        <div className={styles.note}>{note}</div>
      </div>
    </div>
  );
}
