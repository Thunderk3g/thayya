// ============================================================
// MEMBER portal copy & data — extracted from thayya-prototype.html
// (member pages, lines 113–507). Single source for all 5 pages.
// ============================================================

export const DISCOVER = {
  kicker: "Bangalore · This week",
  intro:
    "Indian dance movement, taught by India's best instructors. Book a workshop, sweat to a Bollywood beat, then do it again tomorrow.",
  searchPlaceholder: "Search instructors, styles, or workshops",
  featuredKicker: "Featured · April",
  featuredTitle: "Instructors near you",
  openSpotsKicker: "Open spots",
  openSpotsTitle: "Workshops this week",
};

export const INSTRUCTORS = [
  {
    id: "anaya",
    initials: "AK",
    av: 1,
    tag: "Bollywood",
    name: "Anaya Krishnan",
    style: "Bharatanatyam Fusion",
    rating: "4.9",
    city: "Bangalore",
  },
  {
    id: "rohan",
    initials: "RM",
    av: 2,
    tag: "Cardio",
    name: "Rohan Mehta",
    style: "Bombay Bounce",
    rating: "4.8",
    city: "Mumbai",
  },
  {
    id: "priya",
    initials: "PN",
    av: 3,
    tag: "Classical",
    name: "Priya Nair",
    style: "Mohiniyattam Flow",
    rating: "5.0",
    city: "Chennai",
  },
  {
    id: "karthik",
    initials: "KI",
    av: 4,
    tag: "Power",
    name: "Karthik Iyer",
    style: "Kuchipudi Power",
    rating: "4.7",
    city: "Pune",
  },
];

export const OPEN_SPOTS = [
  {
    initials: "AK",
    av: 1,
    title: "Bollywood Cardio · Beginner",
    meta: "Anaya Krishnan · Mon · 6:30 PM",
    price: "₹450",
    spots: "7 spots left",
    urgent: true,
  },
  {
    initials: "RM",
    av: 2,
    title: "Bombay Bounce",
    meta: "Rohan Mehta · Tue · 7:00 PM",
    price: "₹500",
    spots: "3 spots left",
    urgent: true,
  },
  {
    initials: "PN",
    av: 3,
    title: "Mohiniyattam Slow Flow",
    meta: "Priya Nair · Wed · 8:00 AM",
    price: "₹400",
    spots: "12 spots left",
    urgent: false,
  },
];

export const INSTRUCTOR_PROFILE = {
  initials: "AK",
  av: 1,
  kicker: "Bangalore · Bharatanatyam Fusion",
  firstName: "Anaya",
  lastName: "Krishnan",
  bio: "Twelve years of classical training meets the joy of a Friday-night dance floor. I teach in English, Tamil, and Hindi — bring your energy, leave with your tribe.",
  rating: "4.9 · 142 reviews",
  students: "1,400+ students taught",
  scheduleKicker: "Schedule",
  scheduleTitle: "Upcoming workshops",
};

export const PROFILE_WORKSHOPS = [
  {
    title: "Bollywood Cardio · Beginner",
    date: "Mon 27 Apr · 6:30 PM",
    price: "₹450",
    spots: "7 spots",
    urgent: true,
    featured: false,
  },
  {
    title: "Aaja Nachle Intensive",
    date: "Wed 29 Apr · 7:00 PM",
    price: "₹600",
    spots: "3 spots · almost full",
    urgent: true,
    featured: true,
  },
  {
    title: "Saturday Morning Flow",
    date: "Sat 02 May · 8:00 AM",
    price: "₹350",
    spots: "22 spots",
    urgent: false,
    featured: false,
  },
];

export const BOOK_WORKSHOP = {
  kicker: "Workshop",
  titleStart: "Aaja Nachle",
  titleAccent: "Intensive",
  meta: "With Anaya Krishnan · Wed 29 April · 7:00 PM · Indiranagar Studio",
  previewLabel: "2:14 preview",
  description:
    "A 90-minute deep dive into the April choreography drop. We'll break down each section, drill the formations, then end with a full run-through. Open to all levels with prior dance experience.",
  tags: ["90 minutes", "All levels", "Bring water", "AC studio"],
  price: "₹600",
  spotsLeft: "3 spots left",
  priceNote: "per person · all taxes included",
  summaryKicker: "Order summary",
  summary: [
    { label: "Aaja Nachle Intensive × 1", value: "₹600" },
    { label: "Taxes & fees", value: "Included" },
  ],
  summaryTotal: { label: "Total due today", value: "₹600" },
  paymentNote:
    "Online payments via Razorpay are launching soon — your spot is reserved instantly.",
  confirmLabel: "Confirm booking",
  confirmation: {
    title: "You're in!",
    subtitle: "Confirmation sent via WhatsApp",
    points: "+25 loyalty points earned",
    cta: "View my bookings",
  },
};

export const BOOKINGS = {
  kicker: "Yours",
  title: "My Bookings",
  upcomingLabel: "Upcoming",
  pastLabel: "Past",
  upcoming: [
    {
      day: "29",
      month: "APR",
      title: "Aaja Nachle Intensive",
      meta: "Anaya Krishnan · Wed · 7:00 PM",
      price: "₹600",
    },
    {
      day: "02",
      month: "MAY",
      title: "Saturday Morning Flow",
      meta: "Anaya Krishnan · Sat · 8:00 AM",
      price: "₹350",
    },
  ],
  past: [
    {
      date: "20 APR",
      title: "Bollywood Cardio",
      instructor: "Anaya Krishnan",
      price: "₹450",
    },
    {
      date: "12 APR",
      title: "Sunday Slow Flow",
      instructor: "Anaya Krishnan",
      price: "₹350",
    },
  ],
};

export const MEMBERSHIP = {
  kicker: "Your Tribe",
  title: "Membership",
  loyalty: {
    tier: "Thayya Member · Marigold Tier",
    tagline: "The tribe is rising",
    points: "1,240",
    pointsNote: "loyalty points · ₹620 redeemable credit",
    progress: 62,
    nextTierPoints: "760 points",
    nextTierName: "Tabla Tier",
  },
  refer: {
    title: "Refer a friend",
    body: "Both of you earn 200 points when they book their first workshop.",
    cta: "Get my code",
  },
  upgrade: {
    title: "Studio Membership",
    body: "₹1,999/month · 8 workshops + earn 2x points + priority booking.",
    cta: "Upgrade",
  },
};
