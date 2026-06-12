"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TRAININGS } from "../content";
import SectionHeader from "./ui/SectionHeader";
import styles from "./Trainings.module.css";

gsap.registerPlugin(ScrollTrigger);

/*
 * Trainings — "Upcoming trainings" (UI-UX.md §10.7)
 * Editorial table rows, not cards. Accent: vermilion (price/save tags).
 * Hairlines ink-draw, then row content fades up.
 */
export default function Trainings() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const titleLine = sectionRef.current.querySelector(".line-mask > span");
      if (reduce) {
        gsap.set(titleLine, { y: 0 });
      } else {
        gsap.to(titleLine, {
          y: 0,
          duration: 1.1,
          ease: "power4.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        });
      }

      const rows = gsap.utils.toArray(`.${styles.row}`);
      rows.forEach((row) => {
        if (reduce) {
          gsap.from(row, {
            autoAlpha: 0,
            duration: 0.6,
            scrollTrigger: { trigger: row, start: "top 88%" },
          });
          return;
        }
        const tl = gsap.timeline({
          scrollTrigger: { trigger: row, start: "top 85%" },
        });
        // hairline ink-draws on enter…
        tl.from(row.querySelector(`.${styles.rule}`), {
          scaleX: 0,
          duration: 1,
          ease: "power4.out",
        });
        // …followed by the row content fading up
        tl.from(
          row.querySelectorAll(`.${styles.grid} > *`),
          {
            y: 22,
            autoAlpha: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power4.out",
          },
          "-=0.6"
        );
      });

      // closing hairline under the last row
      gsap.from(`.${styles.endRule}`, {
        scaleX: reduce ? 1 : 0,
        autoAlpha: reduce ? 0 : 1,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: { trigger: `.${styles.endRule}`, start: "top 92%" },
      });

      // single low vermilion aurora drifts on parallax (transform-only)
      if (!reduce) {
        gsap.fromTo(
          `.${styles.orb}`,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="trainings" className={`chapter ${styles.section}`} ref={sectionRef}>
      {/* light, premium atmosphere — one low vermilion aurora + grain */}
      <div className={`${styles.orb} ${styles.orbA}`} aria-hidden="true">
        <span className="aurora" />
      </div>
      <div className="grain" aria-hidden="true" />
      <div className="wrap">
        <SectionHeader
          overline={TRAININGS.overline}
          tamil={TRAININGS.tamil}
          accent="var(--vermilion)"
        />
        <h2 className={`display ${styles.title}`}>
          <span className="line-mask">
            <span>{TRAININGS.title}</span>
          </span>
        </h2>

        <div className={styles.table}>
          {TRAININGS.rows.map((row, i) => (
            <article className={`glass ${styles.row}`} key={`${row.day}-${i}`}>
              <span className={styles.rule} aria-hidden="true" />
              <div className={styles.grid}>
                <div className={styles.date}>
                  <span className={styles.day}>{row.day}</span>
                  <span className={`label ${styles.monthYear}`}>
                    {row.monthYear}
                  </span>
                </div>

                <div className={styles.main}>
                  <h3 className={`display ${styles.rowTitle}`}>{row.title}</h3>
                  <p className={styles.meta}>
                    {row.host} · {row.dates}
                  </p>
                </div>

                <p className={styles.loc}>{row.loc}</p>

                <p className={styles.price}>
                  <s className={styles.old}>{row.old}</s>
                  <strong className={styles.now}>{row.now}</strong>
                </p>

                <span className={`tag-save ${styles.tag}`}>{row.save}</span>

                <a className={`btn ${styles.btnSmall}`} href="/member/book">
                  Reserve a spot
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            </article>
          ))}
          <span className={`${styles.rule} ${styles.endRule}`} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
