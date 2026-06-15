"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Loader.module.css";

/**
 * First-visit overture (Thayya Loader.dc.html — A+B fusion).
 * A self-drawing gradient kolam (epitrochoid) draws itself while the count-in
 * rolls 1→100 (gradient numerals) and the beats pulse on the konnakol count.
 * On the "sam" (~1.6s) a 12-fold rangoli blooms, light + sparks burst, then the
 * cream curtain lifts away. Signals the hero via `window.__thayyaRevealed` and
 * the `thayya:reveal` event at the start of the lift, so the hero crosses in
 * underneath the rising curtain. Plays in full on every page load;
 * reduced-motion reveals instantly.
 */

// ---------- pure geometry (module scope, computed once) ----------
function gcd(a, b) { return b ? gcd(b, a % b) : a; }

function epitrochoid(R, r, d, fit, steps, rotDeg) {
  const close = 2 * Math.PI * (r / gcd(R, r));
  const max = R + r + d, k = fit / max;
  const rot = (rotDeg || 0) * Math.PI / 180, c = Math.cos(rot), s = Math.sin(rot);
  let path = "";
  for (let i = 0; i <= steps; i++) {
    const th = close * i / steps;
    let x = ((R + r) * Math.cos(th) - d * Math.cos((R + r) / r * th)) * k;
    let y = ((R + r) * Math.sin(th) - d * Math.sin((R + r) / r * th)) * k;
    if (rot) { const nx = x * c - y * s, ny = x * s + y * c; x = nx; y = ny; }
    path += (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2);
  }
  return path + "Z";
}

function buildRangoli() {
  let g = '<circle cx="0" cy="0" r="20" fill="none" stroke="url(#thyStroke)" stroke-width="1.1"></circle>';
  g += '<circle cx="0" cy="0" r="9" fill="none" stroke="url(#thyStroke)" stroke-width="1"></circle>';
  const petal = "M0 -22 C 10 -40 9 -64 0 -84 C -9 -64 -10 -40 0 -22 Z";
  for (let i = 0; i < 12; i++) {
    g += '<g transform="rotate(' + i * 30 + ')"><path d="' + petal + '" fill="none" stroke="url(#thyStroke)" stroke-width="1.3"></path><circle cx="0" cy="-92" r="2" fill="#bd23a2"></circle></g>';
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    g += '<circle cx="' + (Math.cos(a) * 104).toFixed(1) + '" cy="' + (Math.sin(a) * 104).toFixed(1) + '" r="1.3" fill="#9f26a7"></circle>';
  }
  return g;
}

function buildSparks() {
  let s = "";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const x = (Math.cos(a) * 120).toFixed(1), y = (Math.sin(a) * 120).toFixed(1), big = i % 2 === 0;
    s += '<circle cx="' + x + '" cy="' + y + '" r="' + (big ? 2.6 : 1.6) + '" fill="' + (big ? "#ffb627" : "#d4a437") + '"></circle>';
  }
  return s;
}

// ---------- easing (module scope) ----------
const clamp = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const p2io = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const expoIO = (t) => { if (t <= 0) return 0; if (t >= 1) return 1; return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2; };
function bez(x, x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const fx = (t) => ((ax * t + bx) * t + cx) * t, fy = (t) => ((ay * t + by) * t + cy) * t;
  let t0 = 0, t1 = 1, t = x;
  for (let i = 0; i < 24; i++) { const e = fx(t) - x; if (Math.abs(e) < 1e-4) break; if (e > 0) t1 = t; else t0 = t; t = (t0 + t1) / 2; }
  return fy(t);
}
const easeBeat = (t) => bez(clamp(t), 0.62, 0.05, 0.01, 0.99);

const T = { still: 190, countEnd: 1810, samEnd: 2130, total: 3000 };
const KOLAM1_D = epitrochoid(8, 3, 4.6, 150, 720, 0);
const RANGOLI_HTML = buildRangoli();
const SPARKS_HTML = buildSparks();
const GRAIN = `url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter%20id='g'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.85'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23g)'/%3E%3C/svg%3E")`;

export default function Loader() {
  const [active, setActive] = useState(true);
  const root = useRef(null);
  const counter = useRef(null);
  const kolam1 = useRef(null), kolamSvg = useRef(null);
  const auroraA = useRef(null), auroraB = useRef(null);
  const bloom = useRef(null), rangoli = useRef(null), sparks = useRef(null);

  useEffect(() => {
    const reveal = () => {
      window.__thayyaRevealed = true;
      window.dispatchEvent(new CustomEvent("thayya:reveal"));
    };

    // Plays on every page load — no first-visit gate. Reduced-motion still
    // reveals instantly (no count, no curtain) for accessibility.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { reveal(); setActive(false); return; }

    const el = {
      root: root.current, counter: counter.current,
      kolam1: kolam1.current, kolamSvg: kolamSvg.current,
      auroraA: auroraA.current, auroraB: auroraB.current,
      bloom: bloom.current, rangoli: rangoli.current, sparks: sparks.current,
    };
    if (!el.root) return;

    let fired = false, raf = null;

    const apply = (t) => {
      const C = clamp;
      // count-in / kolam draw
      const cp = C((t - T.still) / (T.countEnd - T.still));
      const draw = p2io(cp);
      el.kolam1.style.strokeDashoffset = String(1 - draw);
      el.auroraA.style.opacity = String(0.6 * C((t - T.still) / 520));
      el.auroraB.style.opacity = String(0.5 * C((t - T.still) / 720));

      // konnakol beats (4 strikes across the build)
      const span = T.countEnd - T.still; let beat = 0;
      for (let k = 0; k < 4; k++) { const tb = T.still + k * span / 4; if (t >= tb) { const e = Math.exp(-(t - tb) / 150); if (e > beat) beat = e; } }
      el.counter.textContent = Math.round(1 + 99 * draw);
      el.counter.style.transform = "scale(" + (1 + 0.06 * beat) + ")";

      // the sam (strike)
      const sam = C((t - T.countEnd) / (T.samEnd - T.countEnd));
      const samE = easeBeat(sam);
      const arc = Math.sin(Math.PI * sam);
      el.bloom.setAttribute("opacity", String(arc * 0.92));
      el.bloom.style.transform = "scale(" + (0.2 + 1.05 * samE) + ")";
      el.rangoli.setAttribute("opacity", String(samE));
      el.rangoli.style.transform = "rotate(" + (-18 * (1 - samE)) + "deg) scale(" + (0.82 + 0.18 * samE) + ")";
      el.kolamSvg.style.filter = "saturate(" + (1 + 0.85 * arc) + ") brightness(" + (1 + 0.16 * arc) + ")";
      const twinkle = Math.max(beat, arc);
      el.sparks.style.opacity = String(C((t - T.still) / 420) * (0.22 + 0.78 * twinkle));
      el.sparks.style.transform = "scale(" + (1 + 0.6 * samE) + ")";

      // curtain lift + handoff
      const cl = C((t - T.samEnd) / (T.total - T.samEnd));
      el.root.style.transform = "translateY(" + (-100 * expoIO(cl)) + "%)";
      if (!fired && t >= T.samEnd) { fired = true; reveal(); }
    };

    const startTime = performance.now();
    const loop = (now) => {
      let t = now - startTime;
      if (t >= T.total) { apply(T.total); raf = null; setActive(false); return; }
      apply(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // timeout-safe backstop: never let a stalled frame trap the curtain
    const safety = setTimeout(() => { if (!fired) reveal(); setActive(false); }, T.total + 1500);

    return () => { if (raf) cancelAnimationFrame(raf); clearTimeout(safety); };
  }, []);

  if (!active) return null;

  return (
    <div className={styles.loader} ref={root} aria-hidden="true">
      {/* kolam dot lattice */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, zIndex: 0, opacity: 0.9,
          backgroundImage: "radial-gradient(var(--kolam-dot) 1.4px, transparent 1.6px)",
          backgroundSize: "30px 30px", backgroundPosition: "center",
        }}
      />

      {/* aurora blooms (opacity driven by JS) */}
      <div
        ref={auroraA}
        aria-hidden="true"
        style={{
          position: "absolute", zIndex: 1, width: "78vmin", height: "78vmin", left: "8%", top: "6%",
          borderRadius: "50%", pointerEvents: "none", filter: "blur(56px)", opacity: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(246,105,23,0.62), rgba(240,66,38,0.2) 52%, transparent 72%)",
          animation: "thy-aurora-a 11s ease-in-out infinite",
        }}
      />
      <div
        ref={auroraB}
        aria-hidden="true"
        style={{
          position: "absolute", zIndex: 1, width: "70vmin", height: "70vmin", right: "6%", bottom: "4%",
          borderRadius: "50%", pointerEvents: "none", filter: "blur(58px)", opacity: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(159,38,167,0.5), rgba(7,174,174,0.2) 55%, transparent 74%)",
          animation: "thy-aurora-b 13s ease-in-out infinite",
        }}
      />

      {/* the self-drawing kolam */}
      <svg
        ref={kolamSvg}
        viewBox="-160 -160 320 320"
        style={{
          position: "absolute", zIndex: 2, width: "min(88vmin,580px)", height: "min(88vmin,580px)",
          left: "50%", top: "50%", transform: "translate(-50%,-50%)", overflow: "visible",
        }}
      >
        <defs>
          <linearGradient id="thyStroke" x1="0" y1="0" x2="1" y2="0.35">
            <stop offset="0" stopColor="#f66917" />
            <stop offset="0.25" stopColor="#f04226" />
            <stop offset="0.5" stopColor="#bd23a2" />
            <stop offset="0.72" stopColor="#9f26a7" />
            <stop offset="1" stopColor="#07aeae" />
          </linearGradient>
          <radialGradient id="thyBloom" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffb627" stopOpacity="0.95" />
            <stop offset="0.4" stopColor="#f66917" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f66917" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle ref={bloom} cx="0" cy="0" r="150" fill="url(#thyBloom)" opacity="0" style={{ mixBlendMode: "multiply" }} />
        <g ref={rangoli} opacity="0" dangerouslySetInnerHTML={{ __html: RANGOLI_HTML }} />
        <path ref={kolam1} d={KOLAM1_D} fill="none" stroke="url(#thyStroke)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset="1" />
        <g ref={sparks} style={{ opacity: 0 }} dangerouslySetInnerHTML={{ __html: SPARKS_HTML }} />
      </svg>

      {/* count-in numerals (1 → 100) */}
      <div
        style={{
          position: "absolute", zIndex: 3, left: "50%", top: "50%", transform: "translate(-50%,-50%)",
          display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", pointerEvents: "none",
        }}
      >
        <span
          ref={counter}
          style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(72px,10vw,140px)", lineHeight: 1,
            letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", background: "var(--thayya-gradient)",
            backgroundSize: "300% 100%", WebkitBackgroundClip: "text", backgroundClip: "text",
            WebkitTextFillColor: "transparent", animation: "thy-flow 4.5s linear infinite",
          }}
        >
          1
        </span>
      </div>

      {/* motto */}
      <div style={{ position: "absolute", zIndex: 5, left: 0, right: 0, bottom: "clamp(26px,5vh,52px)", textAlign: "center", pointerEvents: "none" }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "clamp(11px,1.2vw,14px)", letterSpacing: "0.46em", textTransform: "uppercase", color: "var(--ink-soft)" }}>
          Move.&nbsp;&nbsp;Rise.&nbsp;&nbsp;Shine.
        </span>
      </div>

      {/* filmic grain */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: "-30%", zIndex: 6, pointerEvents: "none", opacity: 0.4,
          mixBlendMode: "overlay", backgroundImage: GRAIN, animation: "thy-grain 6s steps(6) infinite",
        }}
      />
    </div>
  );
}
