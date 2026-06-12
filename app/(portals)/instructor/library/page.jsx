import { Play, Music, Check } from "lucide-react";
import { LIBRARY } from "../data";
import styles from "./page.module.css";

export const metadata = { title: "Content Library · Instructor · Thayya™" };

export default function InstructorLibrary() {
  const { overline, title, badge, blurb, videos, audio } = LIBRARY;

  return (
    <div className="p-wrap">
      <header className={styles.head}>
        <div>
          <div className="p-overline">{overline}</div>
          <h1 className={`p-display ${styles.title}`}>{title}</h1>
        </div>
        <span className={`p-badge p-badge-cool ${styles.subBadge}`}>
          <Check size={12} /> {badge}
        </span>
      </header>
      <p className={styles.blurb}>{blurb}</p>

      {/* Video grid */}
      <div className={styles.videoGrid}>
        {videos.map((v) => (
          <button key={v.title} type="button" className={`p-lift ${styles.videoCard}`}>
            <div className={`p-av-${v.av} ${styles.thumb}`}>
              <div className="grain" />
              <div className={styles.playWrap}>
                <span className={styles.playCircle}>
                  <Play size={20} fill="currentColor" />
                </span>
              </div>
              <div className={styles.thumbMeta}>
                <span className={styles.levelBadge}>{v.level}</span>
                <span className={styles.duration}>{v.duration}</span>
              </div>
            </div>
            <div className={`p-display ${styles.videoTitle}`}>{v.title}</div>
          </button>
        ))}
      </div>

      {/* Audio library */}
      <div className={styles.audioHead}>
        <div className="p-overline">{audio.overline}</div>
        <h2 className={`p-display ${styles.audioTitle}`}>{audio.title}</h2>
      </div>
      <div className={`p-card ${styles.trackList}`}>
        {audio.tracks.map((t) => (
          <button key={t.title} type="button" className={styles.track}>
            <span className={`p-av-${t.av} ${styles.trackIcon}`}>
              <Music size={16} />
            </span>
            <span className={styles.trackInfo}>
              <span className={styles.trackName}>{t.title}</span>
              <span className={styles.trackDuration}>{t.duration}</span>
            </span>
            <Play size={16} className={styles.trackPlay} />
          </button>
        ))}
      </div>
    </div>
  );
}
