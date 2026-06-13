"use client";

import { useState } from "react";
import { Play, Check } from "lucide-react";
import ClassArt from "../../../components/art/ClassArt";
import styles from "./page.module.css";

export default function LibraryClient({ videos, audio }) {
  const [hint, setHint] = useState(null); // id of the item showing the hint

  function flash(id) {
    setHint(id);
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setHint((cur) => (cur === id ? null : cur)), 1800);
  }

  return (
    <>
      {/* Video grid */}
      <div className={styles.videoGrid}>
        {videos.map((v) => {
          const id = `v-${v.title}`;
          return (
            <button
              key={v.title}
              type="button"
              className={`p-lift ${styles.videoCard}`}
              onClick={() => flash(id)}
            >
              <div className={styles.thumb}>
                <ClassArt seed={v.title} label={v.title} play className={styles.thumbArt} />
                <div className="grain" />
                <div className={styles.thumbMeta}>
                  <span className={styles.levelBadge}>{v.level}</span>
                  <span className={styles.duration}>{v.duration}</span>
                </div>
              </div>
              <div className={`p-display ${styles.videoTitle}`}>{v.title}</div>
              {hint === id ? <div className={styles.comingSoon}>Streaming coming soon</div> : null}
            </button>
          );
        })}
      </div>

      {/* Audio library */}
      <div className={styles.audioHead}>
        <div className="p-overline">{audio.overline}</div>
        <h2 className={`p-display ${styles.audioTitle}`}>{audio.title}</h2>
      </div>
      <div className={`p-card ${styles.trackList}`}>
        {audio.tracks.map((t) => {
          const id = `a-${t.title}`;
          return (
            <button
              key={t.title}
              type="button"
              className={styles.track}
              onClick={() => flash(id)}
            >
              <span className={styles.trackIcon}>
                <ClassArt seed={t.title} play />
              </span>
              <span className={styles.trackInfo}>
                <span className={styles.trackName}>{t.title}</span>
                <span className={styles.trackDuration}>
                  {hint === id ? "Streaming coming soon" : t.duration}
                </span>
              </span>
              {hint === id ? (
                <Check size={16} className={styles.trackPlay} />
              ) : (
                <Play size={16} className={styles.trackPlay} />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
