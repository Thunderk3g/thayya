// Generated cover artwork for workshops/classes and video posters —
// deterministic from a seed. A brand gradient with concentric "rhythm" arcs,
// a faint mandala rosette, and an optional ghost glyph; pass `play` to overlay
// a play affordance (used as a video poster / preview tile). Fills its
// container (slice), so it works at any aspect ratio. Tokens only, no hex.

const PAIRS = [
  ["--saffron", "--vermilion", "--rani"],
  ["--vermilion", "--rani", "--violet"],
  ["--rani", "--violet", "--teal"],
  ["--violet", "--peacock", "--teal"],
  ["--teal", "--peacock", "--indigo"],
  ["--marigold", "--saffron", "--vermilion"],
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

export default function ClassArt({
  seed,
  label = "",
  play = false,
  className = "",
  style,
}) {
  const h = hash(seed || label);
  const [a, b, c] = PAIRS[h % PAIRS.length];
  const gid = `ca${h.toString(36)}`;
  const rot = (h % 8) * 45;
  const cx = h % 2 ? 264 : 56; // arc origin corner
  const cy = (h >> 1) % 2 ? 150 : 30;

  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
      role="img"
      aria-label={label ? `${label} cover` : "cover art"}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: `var(${a})` }} />
          <stop offset="0.55" style={{ stopColor: `var(${b})` }} />
          <stop offset="1" style={{ stopColor: `var(${c})` }} />
        </linearGradient>
        <radialGradient id={`${gid}g`} cx="0.3" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="320" height="180" fill={`url(#${gid})`} />

      {/* concentric rhythm arcs from a corner */}
      <g fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="1.5">
        {[34, 64, 94, 124, 154, 184].map((r) => (
          <circle key={r} cx={cx} cy={cy} r={r} />
        ))}
      </g>

      {/* faint mandala rosette */}
      <g transform={`rotate(${rot} 160 90)`} fill="#fff" opacity="0.1">
        {Array.from({ length: 12 }).map((_, i) => {
          const ang = (i / 12) * Math.PI * 2;
          return (
            <ellipse
              key={i}
              cx={160 + Math.cos(ang) * 30}
              cy={90 + Math.sin(ang) * 30}
              rx="7"
              ry="22"
              transform={`rotate(${(ang * 180) / Math.PI} ${160 + Math.cos(ang) * 30} ${90 + Math.sin(ang) * 30})`}
            />
          );
        })}
      </g>

      {label ? (
        <text
          x="22"
          y="150"
          fill="#fff"
          fillOpacity="0.9"
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontWeight: 500,
            fontSize: 26,
            letterSpacing: "-0.02em",
          }}
        >
          {label}
        </text>
      ) : null}

      <rect x="0" y="0" width="320" height="180" fill={`url(#${gid}g)`} />

      {play ? (
        <g>
          <circle cx="160" cy="90" r="26" fill="#fff" fillOpacity="0.92" />
          <path d="M152 78 L152 102 L174 90 Z" fill="var(--ink)" />
        </g>
      ) : null}
    </svg>
  );
}
