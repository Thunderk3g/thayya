// Generated instructor/member avatar artwork — deterministic from a seed
// (id or name), so every person gets distinctive, on-brand vector art instead
// of a flat gradient. Indian motif: a kolam dot ring + a rosette behind the
// initials. Pure SVG, scales crisply, zero network cost.
//
// Brand colors come from CSS variables (tokens), referenced via inline
// stop-color so no hex is hardcoded in components.

const PAIRS = [
  ["--saffron", "--vermilion"],
  ["--vermilion", "--rani"],
  ["--rani", "--violet"],
  ["--violet", "--teal"],
  ["--teal", "--peacock"],
  ["--marigold", "--saffron"],
  ["--peacock", "--indigo"],
  ["--saffron", "--rani"],
];

function hash(str) {
  let h = 2166136261;
  const s = String(str || "");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function initialsOf(name) {
  if (!name) return "·";
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// petal rosette path around the center, n petals
function rosette(cx, cy, r, n) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    const cr = r * 0.42;
    d += `M ${cx} ${cy} Q ${cx + Math.cos(a - 0.25) * r * 0.7} ${cy + Math.sin(a - 0.25) * r * 0.7} ${x} ${y} Q ${cx + Math.cos(a + 0.25) * r * 0.7} ${cy + Math.sin(a + 0.25) * r * 0.7} ${cx} ${cy} Z`;
    void cr;
  }
  return d;
}

export default function Avatar({
  seed,
  name,
  size = 96,
  fill = false, // when true, fills the parent container (slice) at any aspect
  rounded = "circle", // "circle" | "squircle"
  className = "",
  showInitials = true,
}) {
  const h = hash(seed || name);
  const [from, to] = PAIRS[h % PAIRS.length];
  const petals = 6 + (h % 3) * 3; // 6 / 9 / 12
  const rot = (h % 24) * 15;
  const gid = `av${h.toString(36)}`;
  const initials = initialsOf(name);
  const radius = rounded === "circle" ? 50 : 24;

  return (
    <svg
      viewBox="0 0 100 100"
      width={fill ? "100%" : size}
      height={fill ? "100%" : size}
      preserveAspectRatio={fill ? "xMidYMid slice" : "xMidYMid meet"}
      className={className}
      role="img"
      aria-label={name ? `${name} avatar` : "avatar"}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: `var(${from})` }} />
          <stop offset="1" style={{ stopColor: `var(${to})` }} />
        </linearGradient>
        <radialGradient id={`${gid}s`} cx="0.32" cy="0.28" r="0.9">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${gid}c`}>
          <rect x="0" y="0" width="100" height="100" rx={radius} ry={radius} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${gid}c)`}>
        <rect x="0" y="0" width="100" height="100" fill={`url(#${gid})`} />
        {/* kolam dot ring */}
        <g transform={`rotate(${rot} 50 50)`} fill="#fff" opacity="0.16">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <circle key={i} cx={50 + Math.cos(a) * 38} cy={50 + Math.sin(a) * 38} r="2" />
            );
          })}
        </g>
        {/* rosette behind initials */}
        <path
          d={rosette(50, 50, 30, petals)}
          fill="#fff"
          opacity="0.12"
          transform={`rotate(${rot / 2} 50 50)`}
        />
        <rect x="0" y="0" width="100" height="100" fill={`url(#${gid}s)`} />
      </g>

      {showInitials && (
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontWeight: 500,
            fontSize: initials.length > 1 ? 34 : 44,
            letterSpacing: "-0.02em",
          }}
        >
          {initials}
        </text>
      )}
    </svg>
  );
}
