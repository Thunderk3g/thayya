// ============================================================
// Admin portal — all copy/data for the 5 pages.
// Source of truth: thayya-prototype.html, admin section.
// Note: one instructor style name from the prototype was renamed
// to "Kuchipudi Power" (content naming policy).
// ============================================================

export const MILESTONE = {
  badge: "First Milestone Unlocked",
  numberAccent: "50",
  numberWord: "Instructors",
  subtitle: "Registered.",
  brush: "The tribe is rising.",
  body: "From Bangalore to Mumbai, Chennai to Pune — fifty trained instructors are now ready to move with their tribes. Onwards to a hundred.",
  bigNumber: "50",
};

export const OVERVIEW_HEADER = {
  overline: "Platform Overview · April 2026",
  headingPre: "The network is ",
  headingAccent: "thriving",
  headingPost: ".",
};

export const KPIS = [
  { icon: "users", delta: "+12%", value: "284", label: "Active Instructors" },
  { icon: "trending-up", delta: "+18%", value: "₹14.2L", label: "Monthly Recurring Rev" },
  { icon: "indian-rupee", delta: "+24%", value: "₹47.8L", label: "GMV This Month" },
  { icon: "sparkles", delta: "+31%", value: "9,412", label: "End Users" },
];

export const REVENUE_CHART = {
  overline: "Revenue · 6 months",
  title: "Trajectory",
  // viewBox 0 0 600 200 — points mirror the prototype SVG
  points: [
    { x: 30, y: 142, dot: "var(--saffron)", month: "Nov" },
    { x: 130, y: 130, dot: "var(--saffron)", month: "Dec" },
    { x: 230, y: 110, dot: "var(--vermilion)", month: "Jan" },
    { x: 330, y: 116, dot: "var(--vermilion)", month: "Feb" },
    { x: 430, y: 84, dot: "var(--rani)", month: "Mar" },
    { x: 530, y: 60, dot: "var(--teal)", month: "Apr" },
  ],
};

export const TOP_EARNERS = {
  overline: "Top earners",
  title: "This month",
  rows: [
    { rank: 1, initials: "AK", av: 1, name: "Anaya Krishnan", city: "Bangalore", amount: "₹80k" },
    { rank: 2, initials: "RM", av: 2, name: "Rohan Mehta", city: "Mumbai", amount: "₹68k" },
    { rank: 3, initials: "PN", av: 3, name: "Priya Nair", city: "Chennai", amount: "₹56k" },
    { rank: 4, initials: "KI", av: 4, name: "Karthik Iyer", city: "Pune", amount: "₹44k" },
  ],
};

export const CONTENT_DROPS = {
  overline: "Choreography Library",
  title: "Monthly Drops",
  action: "New Drop",
  columns: { drop: "Drop", videos: "Videos", audio: "Audio", status: "Status", actions: "Actions" },
  manageLabel: "Manage",
  rows: [
    { name: "April 2026", note: "Released first Friday", videos: "8 clips", audio: "12 tracks", status: "Live", tone: "live" },
    { name: "March 2026", note: "Released first Friday", videos: "8 clips", audio: "10 tracks", status: "Live", tone: "live" },
    { name: "May 2026", note: "Released first Friday", videos: "6 clips", audio: "9 tracks", status: "In Review", tone: "review" },
    { name: "June 2026", note: "Released first Friday", videos: "0 clips", audio: "0 tracks", status: "Planning", tone: "planning" },
  ],
};

export const INSTRUCTORS = {
  overline: "Network · 50 strong",
  title: "Instructors",
  studentsLabel: "students",
  rows: [
    { initials: "AK", av: 1, name: "Anaya Krishnan", style: "Bharatanatyam Fusion", city: "Bangalore", students: "142", status: "Active" },
    { initials: "RM", av: 2, name: "Rohan Mehta", style: "Bombay Bounce", city: "Mumbai", students: "218", status: "Active" },
    { initials: "PN", av: 3, name: "Priya Nair", style: "Mohiniyattam Flow", city: "Chennai", students: "96", status: "Active" },
    { initials: "KI", av: 4, name: "Karthik Iyer", style: "Kuchipudi Power", city: "Pune", students: "184", status: "Active" },
    { initials: "MS", av: 5, name: "Meera Subramaniam", style: "Bollywood Cardio", city: "Hyderabad", students: "156", status: "Active" },
  ],
};

export const COMMISSION = {
  overline: "Configuration",
  title: "Commission & Payouts",
  split: {
    label: "Default Split",
    instructorShare: "70",
    platformShare: "/30",
    desc: "Instructor takes 70% of every workshop booking. Thayya retains 30% to fund content and platform.",
    action: "Adjust split",
  },
  cadence: {
    label: "Payout Cadence",
    value: "Weekly · Friday",
    desc: "Auto-routed to verified bank accounts via Razorpay Route. No manual approval needed under ₹50,000.",
    badge: "Automated",
  },
  queue: {
    label: "Pending Payout Queue",
    rows: [
      { name: "Anaya Krishnan", amount: "₹68,400", note: "Auto-release Fri", tone: "auto" },
      { name: "Rohan Mehta", amount: "₹54,200", note: "Auto-release Fri", tone: "auto" },
      { name: "Priya Nair", amount: "₹82,000", note: "Manual review · over ₹50k", tone: "manual" },
    ],
  },
};

export const MEMBERS = {
  overline: "End Users",
  title: "Members",
  count: "9,412 active members",
  note: "Detailed CRM table goes here · search, filter, segment, export.",
};
