import { Disc3 } from "lucide-react";
import { getCurrentUser } from "../../../../lib/auth";
import { listTracks, listPlaylists } from "../../../../lib/db";
import MusicClient from "./MusicClient";
import styles from "./music.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Music Library · Instructor · Thayya™" };

export default async function InstructorMusic() {
  const user = await getCurrentUser();
  const instructorId = user?.instructorId;

  if (!instructorId) {
    return (
      <div className="p-wrap">
        <header className={styles.head}>
          <div>
            <div className="p-overline">Studio Sound</div>
            <h1 className={`p-display ${styles.title}`}>Music Library</h1>
          </div>
        </header>
        <div className={`p-card ${styles.emptyCard}`}>
          <span className={`p-av-4 ${styles.emptyIcon}`}>
            <Disc3 size={22} />
          </span>
          <div>
            <div className={styles.emptyTitle}>Switch to an instructor account to manage music</div>
            <p className={styles.emptyText}>
              Your music shelf and playlists live with your instructor profile. Sign in as an
              instructor to build the soundtrack for your classes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const initialTracks = listTracks(instructorId);
  const initialPlaylists = listPlaylists(instructorId);

  return <MusicClient initialTracks={initialTracks} initialPlaylists={initialPlaylists} />;
}
