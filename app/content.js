// All site copy lives here (UI-UX.md §14 conventions) so a future CMS
// migration is a single-file swap.

export const HERO = {
  words: ["Move.", "Rise.", "Shine."],
  gradientWordIndex: 1,
  sub: "Movement rooted in Indian rhythms. Find your beat, your people, your power — one class at a time.",
  primaryCta: { label: "Book a class", href: "/member/discover" },
  secondaryCta: { label: "Become an instructor", href: "/signup?role=instructor" },
  marginalia: "தை யா — rhythm of the south",
  stats: [
    { value: 40, suffix: "+", label: "cities" },
    { value: 1200, suffix: "+", label: "certified instructors" },
    { value: null, suffix: "∞", label: "rhythm" },
  ],
};

export const MARQUEE = ["MOVE", "RISE", "SHINE", "தை யா"];

export const MANIFESTO = {
  overline: "The movement",
  tamil: "தக",
  // "belong" is the italic gradient word — marked with *asterisks*
  text: "Thayya is not a workout. It's a homecoming. Movement built on the talas of Indian dance — folk, filmi, classical — where every body is welcome and every beat is an invitation. You don't perform. You *belong*.",
};

export const CLASSES = {
  overline: "Classes",
  tamil: "திமி",
  title: "Six ways to move",
  items: [
    { num: "01", title: "Bolly Groove", sub: "Filmi-fired dance party", accent: "var(--saffron)" },
    { num: "02", title: "Dance Flow", sub: "Choreo-driven energy", accent: "var(--rani)" },
    { num: "03", title: "Rhythm Strength", sub: "Beats + resistance", accent: "var(--violet)" },
    { num: "04", title: "Low Impact", sub: "Joint-friendly flow", accent: "var(--teal)" },
    { num: "05", title: "Beat Burst", sub: "Interval afterburn", accent: "var(--vermilion)" },
    { num: "06", title: "Kids Move", sub: "Family dance jams", accent: "var(--marigold)" },
  ],
};

export const PATHWAYS = {
  overline: "Pathways",
  tamil: "தா",
  title: "Where do you stand?",
  columns: [
    {
      overline: "For students",
      accent: "var(--rani)",
      title: "Discover & thrive",
      items: [
        "Book classes by location & goal",
        "Track progress & streaks",
        "Join challenges, earn badges",
        "Move with your crew",
      ],
      cta: { label: "Start moving", href: "#classes" },
    },
    {
      overline: "For instructors",
      accent: "var(--violet)",
      title: "Teach & earn",
      items: [
        "Get certified by master trainers",
        "Original choreography & music library",
        "Manage schedule & bookings",
        "Earnings tracked in real time",
      ],
      cta: { label: "Apply to teach", href: "#journey" },
    },
    {
      overline: "For studio owners",
      accent: "var(--teal)",
      title: "Launch & grow",
      items: [
        "Open under the Thayya brand",
        "Onboard & approve your team",
        "Payments & analytics built in",
        "Grow a sustainable business",
      ],
      cta: { label: "Open a studio", href: "#trainings" },
    },
  ],
};

export const JOURNEY = {
  overline: "The journey",
  tamil: "தை",
  title: "From first beat to your own studio",
  steps: [
    { n: "1", title: "Train", text: "Enroll in structured programs led by master trainers." },
    { n: "2", title: "Certify", text: "Earn recognized certifications and teaching credentials." },
    { n: "3", title: "Mentor", text: "Get matched with mentors and grow your personal brand." },
    { n: "4", title: "Launch", text: "Open and manage your own movement studio." },
  ],
};

export const TRAININGS = {
  overline: "Trainings",
  tamil: "யா",
  title: "Upcoming trainings",
  rows: [
    {
      day: "13",
      monthYear: "Jun 2026",
      dates: "Jun 13–14 · 9:00 AM – 5:00 PM",
      title: "THAYYA™ Level 1 Instructor Training",
      host: "Hosted by Abdul",
      loc: "Black Bull Studio, West Mambalam · Chennai",
      old: "₹18,000",
      now: "₹10,800",
      save: "Save 40%",
    },
    {
      day: "20",
      monthYear: "Jun 2026",
      dates: "Jun 20–21 · 9:00 AM – 5:00 PM",
      title: "THAYYA™ Level 1 Instructor Training",
      host: "Hosted by Abdul",
      loc: "Panjim · Goa",
      old: "₹18,000",
      now: "₹10,800",
      save: "Save 40%",
    },
    {
      day: "04",
      monthYear: "Jul 2026",
      dates: "Jul 4–6 · 10:00 AM – 6:00 PM",
      title: "THAYYA™ Level 2 Master Training",
      host: "Hosted by Priya Nair",
      loc: "Pulse Dance Arena, Koramangala · Bengaluru",
      old: "₹26,000",
      now: "₹18,200",
      save: "Save 30%",
    },
  ],
};

export const FILM = {
  caption: "Shot at Thayya trainings across India.",
  src: "/hero.mp4",
};

export const COMMUNITY = {
  overline: "The tribe",
  tamil: "தக",
  quotes: [
    {
      text: "I came for the cardio. I stayed because for one hour a week, I'm fully myself.",
      name: "Meera",
      city: "Chennai",
      accent: "var(--rani)",
    },
    {
      text: "Teaching Thayya turned my evenings into a livelihood — and my students into family.",
      name: "Abdul",
      city: "Goa",
      accent: "var(--violet)",
    },
    {
      text: "No mirrors, no judgement. Just the beat and forty people finding it together.",
      name: "Priya",
      city: "Bengaluru",
      accent: "var(--teal)",
    },
  ],
  instagram: { label: "@thayyaofficial", href: "https://www.instagram.com/thayyaofficial/" },
};

export const FOOTER = {
  cta: {
    pre: "Find your ",
    gradientWord: "rhythm",
    post: ".",
    sub: "Your first class is waiting.",
    button: { label: "Book a class", href: "/member/discover" },
  },
  links: [
    { label: "Classes", href: "#classes" },
    { label: "Pathways", href: "#pathways" },
    { label: "Trainings", href: "#trainings" },
    { label: "Become an instructor", href: "#journey" },
    { label: "Community", href: "#community" },
  ],
  copyright: "© 2026 Thayya™ · Made in India",
  motto: "MOVE. RISE. SHINE.",
};

export const NAV = {
  links: [
    { label: "Classes", href: "#classes" },
    { label: "Pathways", href: "#pathways" },
    { label: "Trainings", href: "#trainings" },
    { label: "Community", href: "#community" },
  ],
  cta: { label: "Book a class", href: "/member/discover" },
};
