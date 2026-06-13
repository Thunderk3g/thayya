"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FILM } from "../content";
import styles from "./Film.module.css";

gsap.registerPlugin(ScrollTrigger);

/*
 * Film — "Feel it" (UI-UX.md §10.8)
 * The v1 film inside a gopuram-stepped frame; the frame's clip expands
 * 62% → 100% width on scrub. Video is lazy: src is only attached when the
 * section nears the viewport; playback pauses out of view.
 */
export default function Film() {
  const sectionRef = useRef(null);
  const clipRef = useRef(null);
  const videoRef = useRef(null);
  const [showPlay, setShowPlay] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const video = videoRef.current;

    // lazy load + autoplay-on-intersect, pause when out of view
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (reduce) {
              // poster-style first frame, paused, with a play button
              video.autoplay = false;
              video.preload = "auto";
              setShowPlay(true);
            }
            if (!video.src) {
              video.src = FILM.src;
              video.load();
            }
            if (!reduce) {
              video.play().catch(() => {});
            }
          } else if (!video.paused) {
            video.pause();
          }
        });
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(sectionRef.current);

    const ctx = gsap.context(() => {
      if (!reduce) {
        // frame expands while scrolling through (clip-path for performance)
        gsap.fromTo(
          clipRef.current,
          { clipPath: "inset(0 19% 0 19%)" },
          {
            clipPath: "inset(0 0% 0 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
              end: "top 15%",
              scrub: 1,
            },
          }
        );
      }

      gsap.from(`.${styles.caption}`, {
        autoAlpha: 0,
        y: reduce ? 0 : 14,
        duration: 0.8,
        ease: "power4.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 60%" },
      });

      // rani + violet ambient auroras drift on parallax (transform-only)
      if (!reduce) {
        gsap.utils.toArray(`.${styles.orb}`).forEach((orb, i) => {
          gsap.fromTo(
            orb,
            { yPercent: i % 2 ? 8 : -8 },
            {
              yPercent: i % 2 ? -8 : 8,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
              },
            }
          );
        });
      }
    }, sectionRef);

    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, []);

  const handlePlay = () => {
    videoRef.current.play().catch(() => {});
    setShowPlay(false);
  };

  return (
    <section className={`chapter ${styles.section}`} ref={sectionRef}>
      <div className="wrap">
        <div className={styles.stage}>
          {/* ambient auroras + rani/violet halo behind the gopuram frame */}
          <div className={`${styles.orb} ${styles.orbA}`} aria-hidden="true">
            <span className="aurora" />
          </div>
          <div className={`${styles.orb} ${styles.orbB}`} aria-hidden="true">
            <span className="aurora" />
          </div>
          <div className={styles.frameGlow} aria-hidden="true" />
          <div className={styles.clip} ref={clipRef}>
            <div className={`gopuram-corner ${styles.frame}`}>
              {/* branded poster shown until the film actually plays */}
              <img
                src="/film-poster.svg"
                alt=""
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: playing ? 0 : 1,
                  transition: "opacity 0.6s ease",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
              <video
                ref={videoRef}
                className={styles.video}
                muted
                loop
                playsInline
                autoPlay
                preload="none"
                onPlaying={() => setPlaying(true)}
              />
              {showPlay && (
                <button
                  type="button"
                  className={styles.playBtn}
                  onClick={handlePlay}
                  aria-label="Play video"
                >
                  <span className={styles.playGlyph} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
        <p className={`label ${styles.caption}`}>{FILM.caption}</p>
      </div>
    </section>
  );
}
