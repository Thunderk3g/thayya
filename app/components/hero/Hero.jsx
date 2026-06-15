"use client";

// THAYYA hero — UI-UX.md §10.1 + ADDENDUM A5/A6/A7 ("Utsav")
// h1 is server-renderable text (the LCP element); the canvas is
// dynamically imported so it never blocks paint. Behind it: the
// Digital Rangoli mandala, aurora atmosphere, a grain wash, an
// outlined type echo, and floating ornaments.

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO } from "../../content";
import Paisley from "../motifs/Paisley";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

const RibbonCanvas = dynamic(() => import("./RibbonCanvas"), { ssr: false });

const formatStat = (n) => n.toLocaleString("en-US");

// small kolam dot cluster — a pulli fragment used as a floating ornament
function KolamCluster() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" role="presentation" aria-hidden="true">
      <circle cx="17" cy="5" r="2.4" fill="currentColor" />
      <circle cx="7" cy="17" r="2.4" fill="currentColor" opacity="0.75" />
      <circle cx="27" cy="17" r="2.4" fill="currentColor" opacity="0.75" />
      <circle cx="17" cy="29" r="2.4" fill="currentColor" opacity="0.5" />
      <circle cx="17" cy="17" r="3.2" fill="currentColor" />
    </svg>
  );
}

export default function Hero() {
  const sectionRef = useRef(null);

  useEffect(() => {
    let play = null;

    const ctx = gsap.context(() => {
      const lines = "[data-hero-line]";
      const fades = "[data-hero-fade]";
      const ambient = "[data-hero-ambient]"; // echo + ornaments, last to arrive
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        gsap.set(lines, { clearProps: "transform", y: 0 });
        gsap.set(fades, { autoAlpha: 1 });
        gsap.set(ambient, { autoAlpha: 1 });
        return;
      }

      // initial hidden state comes from CSS (html.js .line-mask > *);
      // tween the parsed px value so transforms don't stack
      gsap.set(fades, { autoAlpha: 0, y: 24 });
      gsap.set(ambient, { autoAlpha: 0 });

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });

      // 1. h1 lines rise inside their .line-mask
      tl.to(lines, { y: 0, duration: 1.1, stagger: 0.12 });
      tl.addLabel("fade", "-=0.55");

      // 2. sub / CTAs / marginalia / stat strip / scroll cue fade up
      tl.to(fades, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.06 }, "fade");

      // 3. numeric stats counter-roll from 0 (the ∞ stat just fades)
      sectionRef.current.querySelectorAll("[data-counter]").forEach((el) => {
        const target = Number(el.dataset.target);
        const counter = { n: 0 };
        el.textContent = "0";
        tl.to(
          counter,
          {
            n: target,
            duration: 1.4,
            ease: "power2.out",
            onUpdate() {
              el.textContent = formatStat(Math.round(counter.n));
            },
          },
          "fade"
        );
      });

      // 4. the outlined echo + floating ornaments arrive last
      tl.to(
        ambient,
        { autoAlpha: 1, duration: 1.2, stagger: 0.15, ease: "power2.out" },
        "fade+=0.5"
      );

      play = () => tl.play();
    }, sectionRef);

    // reveal contract with the page loader
    if (play) {
      if (window.__thayyaRevealed) play();
      else window.addEventListener("thayya:reveal", play, { once: true });
    }

    return () => {
      if (play) window.removeEventListener("thayya:reveal", play);
      ctx.revert();
    };
  }, []);

  return (
    <section id="top" ref={sectionRef} className={styles.hero}>
      {/* atmosphere: aurora blobs under everything (A4/A5) */}
      <div className={`aurora ${styles.auroraSaffron}`} aria-hidden="true" />
      <div className={`aurora ${styles.auroraRani}`} aria-hidden="true" />

      {/* The Digital Rangoli — behind everything, right-weighted */}
      <div className={styles.canvasWrap} aria-hidden="true">
        <RibbonCanvas />
      </div>

      {/* far-left vertical marginalia (hidden below 1024px) */}
      <span className={`tamil ${styles.marginalia}`} data-hero-fade>
        {HERO.marginalia}
      </span>

      {/* floating ornaments (A7) — staggered float via CSS delays */}
      <span
        className={`float ${styles.ornament} ${styles.ornPaisley}`}
        data-hero-ambient
        aria-hidden="true"
      >
        <Paisley size={30} />
      </span>
      <span
        className={`float ${styles.ornament} ${styles.ornKolam}`}
        data-hero-ambient
        aria-hidden="true"
      >
        <KolamCluster />
      </span>
      <span
        className={`float glow ${styles.ornament} ${styles.ornDot}`}
        data-hero-ambient
        aria-hidden="true"
      />

      <div className={`wrap ${styles.inner}`}>

        <h1 className={`display ${styles.title}`}>
          {HERO.words.map((word, i) => (
            <span className="line-mask" key={word}>
              <span
                data-hero-line
                className={
                  i === HERO.gradientWordIndex
                    ? `display-italic gradient-text gradient-live ${styles.gradientWord}`
                    : undefined
                }
              >
                {word}
              </span>
            </span>
          ))}
        </h1>

        <p className={`lead ${styles.sub}`} data-hero-fade>
          {HERO.sub}
        </p>

        <div className={styles.ctas} data-hero-fade>
          <a className="btn" href={HERO.primaryCta.href}>
            {HERO.primaryCta.label}
          </a>
          <a className="link-sweep" href={HERO.secondaryCta.href}>
            {HERO.secondaryCta.label}
          </a>
        </div>
      </div>

      {/* scroll cue — marigold dot pulsing on the beat (~96 BPM) */}
      <div className={styles.scrollCue} data-hero-fade>
        <span className={styles.cueDot} aria-hidden="true" />
        <span className="label">scroll</span>
      </div>

      {/* bottom edge: kolam lattice fading up + stat strip on a hairline */}
      <div className={styles.bottom}>
        <div className={`kolam-field ${styles.kolam}`} aria-hidden="true" />
        <ul className={styles.stats} data-hero-fade>
          {HERO.stats.map((stat) => (
            <li key={stat.label} className={styles.stat}>
              <span className={`display ${styles.statValue}`}>
                {stat.value != null && (
                  <span data-counter data-target={stat.value}>
                    {formatStat(stat.value)}
                  </span>
                )}
                <span>{stat.suffix}</span>
              </span>
              <span className={`label ${styles.statLabel}`}>{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* filmic grain wash over the whole chapter (A4) */}
      <div className={`grain ${styles.grainLayer}`} aria-hidden="true" />
    </section>
  );
}
