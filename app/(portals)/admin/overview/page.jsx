import { Users, TrendingUp, IndianRupee, Sparkles, PartyPopper } from "lucide-react";
import { getAdminKpis, getRevenueByMonth, getTopEarners } from "../../../../lib/db";
import { OVERVIEW_HEADER } from "../data";
import Avatar from "../../../components/art/Avatar";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Overview — Thayya™" };

function rupees(n) {
  return `₹${(Number(n) || 0).toLocaleString("en-IN")}`;
}

// Dot colour walks the brand palette like the prototype chart.
const DOT_COLORS = ["var(--saffron)", "var(--saffron)", "var(--vermilion)", "var(--vermilion)", "var(--rani)", "var(--teal)"];

export default async function AdminOverviewPage() {
  const [kpis, revenue, earners] = await Promise.all([
    getAdminKpis(),
    getRevenueByMonth(6),
    getTopEarners(4),
  ]);

  // KPI cards — real aggregates, no fabricated deltas.
  const kpiCards = [
    { Icon: Users, value: String(kpis.instructors), label: "Active Instructors" },
    { Icon: TrendingUp, value: rupees(kpis.gmvThisMonth), label: "Revenue · this month" },
    { Icon: IndianRupee, value: rupees(kpis.gmvAllTime), label: "GMV All Time" },
    { Icon: Sparkles, value: String(kpis.members), label: "End Users" },
  ];

  // Revenue chart geometry: map real monthly totals onto the existing SVG.
  // viewBox 0 0 600 200; x evenly spread, y from max total (higher = nearer top).
  const maxTotal = Math.max(1, ...revenue.map((r) => r.total));
  const stepX = revenue.length > 1 ? 540 / (revenue.length - 1) : 0;
  const pts = revenue.map((r, i) => ({
    x: 30 + i * stepX,
    y: 170 - (r.total / maxTotal) * 110,
    label: r.label,
    dot: DOT_COLORS[i] || "var(--teal)",
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const fillPath = pts.length
    ? `${linePath} L ${pts[pts.length - 1].x} 180 L ${pts[0].x} 180 Z`
    : "";

  return (
    <div className="p-wrap">
      {/* Milestone celebration banner — real instructor count */}
      <div className={styles.banner}>
        <div className={`${styles.blob} ${styles.blobGold}`} />
        <div className={`${styles.blob} ${styles.blobSaffron}`} />
        <div className={`${styles.spark} ${styles.spark1}`} />
        <div className={`${styles.spark} ${styles.spark2}`} />
        <div className={`${styles.spark} ${styles.spark3}`} />

        <div className={styles.bannerInner}>
          <div>
            <div className={styles.milestoneBadge}>
              <PartyPopper size={14} /> Network Milestone
            </div>
            <h2 className={`p-display ${styles.bannerTitle}`}>
              <span className={styles.goldText}>{kpis.instructors}</span> Instructors
            </h2>
            <h3 className={`p-display ${styles.bannerSubtitle}`}>Registered.</h3>
            <p className={`p-display display-italic gradient-text ${styles.bannerBrush}`}>
              The tribe is rising.
            </p>
            <p className={styles.bannerBody}>
              Trained instructors are now ready to move with their tribes across the country. Every
              new face grows the floor.
            </p>
          </div>
          <div className={styles.bannerFigure}>
            <div className={styles.figureGlow} />
            <div className={`p-display ${styles.bigNumber}`}>{kpis.instructors}</div>
          </div>
        </div>
      </div>

      {/* Section header */}
      <div className={styles.sectionHead}>
        <div className="p-overline">{OVERVIEW_HEADER.overline}</div>
        <h1 className={`p-display ${styles.h1}`}>
          {OVERVIEW_HEADER.headingPre}
          <span className="gradient-text">{OVERVIEW_HEADER.headingAccent}</span>
          {OVERVIEW_HEADER.headingPost}
        </h1>
      </div>

      {/* KPIs — real aggregates, delta pills dropped (not reliably computable) */}
      <div className={styles.kpis}>
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className={`p-card p-lift ${styles.kpi}`}>
            <div className={styles.kpiTop}>
              <kpi.Icon size={16} className={styles.kpiIcon} />
            </div>
            <div className={`p-display ${styles.kpiValue}`}>{kpi.value}</div>
            <div className={styles.kpiLabel}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart + Top earners */}
      <div className={styles.panels}>
        <div className={`p-card ${styles.panel}`}>
          <div className={styles.panelHead}>
            <div className="p-overline">Revenue · 6 months</div>
            <h3 className={`p-display ${styles.panelTitle}`}>Trajectory</h3>
          </div>
          <div className={styles.chartWrap}>
            <svg viewBox="0 0 600 200" className={styles.chartSvg} role="img" aria-label="Revenue over the last six months">
              <defs>
                <linearGradient id="admRevLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" style={{ stopColor: "var(--saffron)" }} />
                  <stop offset="33%" style={{ stopColor: "var(--vermilion)" }} />
                  <stop offset="66%" style={{ stopColor: "var(--rani)" }} />
                  <stop offset="100%" style={{ stopColor: "var(--teal)" }} />
                </linearGradient>
                <linearGradient id="admRevFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style={{ stopColor: "var(--vermilion)", stopOpacity: 0.18 }} />
                  <stop offset="100%" style={{ stopColor: "var(--vermilion)", stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              {fillPath ? <path d={fillPath} fill="url(#admRevFill)" /> : null}
              <path
                d={linePath}
                stroke="url(#admRevLine)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {pts.map((p) => (
                <circle key={p.label} cx={p.x} cy={p.y} r="5" style={{ fill: p.dot }} />
              ))}
              {pts.map((p, i) => (
                <text
                  key={p.label}
                  x={p.x}
                  y="195"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={i === pts.length - 1 ? "600" : "400"}
                  style={{ fill: "var(--ink-muted)" }}
                >
                  {p.label}
                </text>
              ))}
            </svg>
          </div>
        </div>

        <div className={`p-card ${styles.panel}`}>
          <div className={styles.panelHead}>
            <div className="p-overline">Top earners</div>
            <h3 className={`p-display ${styles.panelTitle}`}>All time</h3>
          </div>
          <div className={styles.earners}>
            {earners.length === 0 ? (
              <div className={styles.earnerCity}>No bookings yet.</div>
            ) : (
              earners.map((row, i) => (
                <div key={row.instructorId} className={styles.earner}>
                  <div className={`p-display ${styles.rank}`}>{i + 1}</div>
                  <Avatar seed={row.instructorId} name={row.name} size={40} />
                  <div className={styles.earnerInfo}>
                    <div className={styles.earnerName}>{row.name}</div>
                    <div className={styles.earnerCity}>{row.city}</div>
                  </div>
                  <div className={`p-display ${styles.earnerAmt}`}>{rupees(row.share)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
