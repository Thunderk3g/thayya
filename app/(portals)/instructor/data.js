// ============================================================
// Instructor portal — all copy & data
// Source: thayya-prototype.html lines 508–1019 (instructor portal)
// ============================================================

export const TODAY = {
  dateline: "Monday, 27 April · Bangalore",
  greeting: { lead: "Good morning,", name: "Anaya", brush: "let's move" },
  drop: {
    badge: "New · April Drop",
    title: "Aaja Nachle",
    titleAccent: "2.0",
    blurb:
      "Eight new choreographies. Twelve curated tracks. Released first Friday of every month — yours to teach for life.",
    cta: { label: "Open Library", href: "/instructor/library" },
    numeral: "04",
  },
  nextWorkshop: {
    label: "Next Workshop",
    badge: "In 4 hours",
    title: "Bollywood Cardio · Beginner",
    meta: "6:30 PM at Whitefield Studio · 18 of 25 booked",
    fillPct: 72,
  },
  month: {
    label: "This Month",
    amount: "₹68,400",
    delta: "+22% vs March",
  },
  stats: [
    { value: "142", label: "Active students" },
    { value: "9", label: "Workshops · Apr" },
    { value: "4.9", label: "Avg rating", star: true },
  ],
};

export const LIBRARY = {
  overline: "April 2026 Drop · Yours forever",
  title: "Choreography Library",
  badge: "Subscription Active",
  blurb:
    "Eight choreographies. Twelve tracks. Stream, download to mobile, or rehearse offline.",
  videos: [
    { title: "Aaja Nachle 2.0", level: "Intermediate", duration: "4:12", av: 1 },
    { title: "Marigold Steps", level: "Beginner", duration: "3:48", av: 2 },
    { title: "Tabla Storm", level: "Advanced", duration: "5:20", av: 3 },
    { title: "Velvet Lehenga", level: "Intermediate", duration: "4:00", av: 4 },
    { title: "Saawan Rains", level: "Beginner", duration: "3:30", av: 5 },
    { title: "Kathak Sunrise", level: "Advanced", duration: "5:55", av: 1 },
  ],
  audio: {
    overline: "12 tracks · curated for this month",
    title: "Audio Library",
    tracks: [
      { title: "Saanson Ki Mala (remix)", duration: "3:42", av: 1 },
      { title: "Marigold Drums", duration: "4:01", av: 2 },
      { title: "Pichkari Bass", duration: "3:28", av: 3 },
      { title: "Kajra Re Reprise", duration: "4:15", av: 4 },
      { title: "Tabla Sunrise", duration: "3:55", av: 5 },
    ],
  },
};

export const WORKSHOPS = {
  overline: "Schedule",
  title: "My Workshops",
  cta: "New Workshop",
  items: [
    {
      day: "27",
      month: "APR",
      title: "Bollywood Cardio · Beginner",
      time: "6:30 PM",
      venue: "Whitefield Studio",
      booked: "18/25",
      status: "Today",
      tone: "hot",
    },
    {
      day: "29",
      month: "APR",
      title: "Aaja Nachle Choreo Intensive",
      time: "7:00 PM",
      venue: "Indiranagar Studio",
      booked: "22/25",
      status: "Almost full",
      tone: "warn",
    },
    {
      day: "02",
      month: "MAY",
      title: "Saturday Morning Flow",
      time: "8:00 AM",
      venue: "Cubbon Park · Outdoor",
      booked: "8/30",
      status: "Open",
      tone: "cool",
    },
    {
      day: "04",
      month: "MAY",
      title: "Bharatanatyam Fusion · All Levels",
      time: "6:00 PM",
      venue: "Whitefield Studio",
      booked: "14/25",
      status: "Open",
      tone: "cool",
    },
  ],
};

export const STUDENTS = {
  overline: "Your CRM",
  title: "Students",
  filter: "Filter",
  rows: [
    {
      initials: "MP",
      name: "Meera Pillai",
      last: "Last attended 2 days ago",
      total: "₹8,400",
      classes: "12 classes",
      av: 1,
    },
    {
      initials: "VS",
      name: "Vikram Shah",
      last: "Last attended 5 days ago",
      total: "₹5,600",
      classes: "8 classes",
      av: 2,
    },
    {
      initials: "SR",
      name: "Sanjana Rao",
      last: "Last attended Today",
      total: "₹12,600",
      classes: "18 classes",
      av: 3,
    },
    {
      initials: "AD",
      name: "Arjun Desai",
      last: "Last attended 2 weeks ago",
      total: "₹2,800",
      classes: "4 classes",
      av: 4,
    },
    {
      initials: "KM",
      name: "Kavya Menon",
      last: "Last attended Today",
      total: "₹15,400",
      classes: "22 classes",
      av: 5,
    },
  ],
};

export const EARNINGS = {
  overline: "Wallet",
  title: "Earnings & Payouts",
  balance: {
    label: "Available Balance",
    amount: "₹68,400",
    note: "Auto-payout this Friday · HDFC ••4521",
    cta: "Withdraw now",
  },
  year: {
    label: "This Year",
    amount: "₹6,24,800",
    delta: "+38% YoY",
  },
  commissionsLabel: "Recent commissions",
  commissions: [
    { name: "Bollywood Cardio", date: "27 Apr", amount: "₹4,200", status: "Pending" },
    { name: "Bharatanatyam Fusion", date: "25 Apr", amount: "₹3,800", status: "Cleared" },
    { name: "Saturday Flow", date: "22 Apr", amount: "₹2,400", status: "Cleared" },
    { name: "Aaja Nachle Intensive", date: "20 Apr", amount: "₹5,600", status: "Cleared" },
  ],
};

export const PUBLIC_PAGE = {
  overlinePrefix: "Preview · thayya.com/",
  handle: "anaya",
  title: "How members see you",
  url: "thayya.com/anaya",
  profile: {
    initials: "AK",
    overline: "Bangalore · Bharatanatyam Fusion",
    first: "Anaya",
    lastAccent: "Krishnan",
    bio: "Twelve years of classical training meets the joy of a Friday-night dance floor.",
    rating: "4.9 · 142 reviews",
    taught: "1,400+ taught",
  },
  bookTitle: "Book a workshop",
  workshops: [
    { title: "Bollywood Cardio · Beginner", when: "Mon 27 Apr · 6:30 PM", price: "₹450" },
    { title: "Aaja Nachle Intensive", when: "Wed 29 Apr · 7:00 PM", price: "₹600" },
    { title: "Saturday Morning Flow", when: "Sat 02 May · 8:00 AM", price: "₹350" },
  ],
};
