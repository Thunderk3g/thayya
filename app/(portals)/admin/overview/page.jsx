import { Users, TrendingUp, IndianRupee, Sparkles, PartyPopper } from "lucide-react";
import { MILESTONE, OVERVIEW_HEADER, KPIS, REVENUE_CHART, TOP_EARNERS } from "../data";
import styles from "./page.module.css";

const KPI_ICONS = {
  users: Users,
  "trending-up": TrendingUp,
  "indian-rupee": IndianRupee,
  sparkles: Sparkles,
};

export const metadata = { title: "Admin · Overview — Thayya™" };

export default function AdminOverviewPage() {
  const pts = REVENUE_CHART.points;
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const fillPath = `${linePath} L ${pts[pts.length - 1].x} 180 L ${pts[0].x} 180 Z`;

  return (
    <div className="p-wrap">
      {/* Milestone celebration banner */}
      <div className={styles.banner}>
        <div className={`${styles.blob} ${styles.blobGold}`} />
        <div className={`${styles.blob} ${styles.blobSaffron}`} />
        <div className={`${styles.spark} ${styles.spark1}`} />
        <div className={`${styles.spark} ${styles.spark2}`} />
        <div className={`${styles.spark} ${styles.spark3}`} />

        <div className={styles.bannerInner}>
          <div>
            <div className={styles.milestoneBadge}>
              <PartyPopper size={14} /> {MILESTONE.badge}
            </div>
            <h2 className={`p-display ${styles.bannerTitle}`}>
              <span className={styles.goldText}>{MILESTONE.numberAccent}</span> {MILESTONE.numberWord}
            </h2>
            <h3 className={`p-display ${styles.bannerSubtitle}`}>{MILESTONE.subtitle}</h3>
            <p className={`p-display display-italic gradient-text ${styles.bannerBrush}`}>{MILESTONE.brush}</p>
            <p className={styles.bannerBody}>{MILESTONE.body}</p>
          </div>
          <div className={styles.bannerFigure}>
            <div className={styles.figureGlow} />
            <div className={`p-display ${styles.bigNumber}`}>{MILESTONE.bigNumber}</div>
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

      {/* KPIs */}
      <div className={styles.kpis}>
        {KPIS.map((kpi) => {
          const Icon = KPI_ICONS[kpi.icon];
          return (
            <div key={kpi.label} className={`p-card p-lift ${styles.kpi}`}>
              <div className={styles.kpiTop}>
                <Icon size={16} className={styles.kpiIcon} />
                <span className={styles.delta}>{kpi.delta}</span>
              </div>
              <div className={`p-display ${styles.kpiValue}`}>{kpi.value}</div>
              <div className={styles.kpiLabel}>{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Revenue chart + Top earners */}
      <div className={styles.panels}>
        <div className={`p-card ${styles.panel}`}>
          <div className={styles.panelHead}>
            <div className="p-overline">{REVENUE_CHART.overline}</div>
            <h3 className={`p-display ${styles.panelTitle}`}>{REVENUE_CHART.title}</h3>
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
              <path d={fillPath} fill="url(#admRevFill)" />
              <path
                d={linePath}
                stroke="url(#admRevLine)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {pts.map((p) => (
                <circle key={p.month} cx={p.x} cy={p.y} r="5" style={{ fill: p.dot }} />
              ))}
              {pts.map((p, i) => (
                <text
                  key={p.month}
                  x={p.x}
                  y="195"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={i === pts.length - 1 ? "600" : "400"}
                  style={{ fill: "var(--ink-muted)" }}
                >
                  {p.month}
                </text>
              ))}
            </svg>
          </div>
        </div>

        <div className={`p-card ${styles.panel}`}>
          <div className={styles.panelHead}>
            <div className="p-overline">{TOP_EARNERS.overline}</div>
            <h3 className={`p-display ${styles.panelTitle}`}>{TOP_EARNERS.title}</h3>
          </div>
          <div className={styles.earners}>
            {TOP_EARNERS.rows.map((row) => (
              <div key={row.rank} className={styles.earner}>
                <div className={`p-display ${styles.rank}`}>{row.rank}</div>
                <div className={`p-av-${row.av} ${styles.avatar}`}>{row.initials}</div>
                <div className={styles.earnerInfo}>
                  <div className={styles.earnerName}>{row.name}</div>
                  <div className={styles.earnerCity}>{row.city}</div>
                </div>
                <div className={`p-display ${styles.earnerAmt}`}>{row.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
