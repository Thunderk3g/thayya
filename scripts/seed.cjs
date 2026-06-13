// Seeds the Supabase Postgres database with demo data.
// Run AFTER the schema exists:  npx drizzle-kit push  then  node scripts/seed.cjs
// Reads DATABASE_URL from .env.local. Idempotent: clears all tables and
// re-inserts a deterministic demo set. Demo password for all accounts: thayya123
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const postgres = require("postgres");

let url = process.env.DATABASE_URL;
if (!url) {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*DATABASE_URL\s*=\s*(.*)\s*$/);
      if (m) url = m[1].replace(/^["']|["']$/g, "");
    }
  }
}
if (!url) {
  console.error("DATABASE_URL not set (add the Supabase pooler string to .env.local).");
  process.exit(1);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
const id = (p) => `${p}_${crypto.randomBytes(8).toString("hex")}`;
const now = Date.now();
const DAY = 86400000;
const fmtDate = (ms) =>
  new Date(ms)
    .toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })
    .replace(",", "");

(async () => {
  const sql = postgres(url, { ssl: "require", prepare: false });
  try {
    const pw = hashPassword("thayya123");

    // ---- users: 1 admin, 5 instructors, 4 members ----
    const instructorDefs = [
      { iid: "anaya", name: "Anaya Krishnan", style: "Bharatanatyam Fusion", city: "Bangalore", rating: "4.9", bio: "Twelve years of classical training meets the joy of a Friday-night dance floor.", verified: true },
      { iid: "rohan", name: "Rohan Mehta", style: "Bombay Bounce", city: "Mumbai", rating: "4.8", bio: "High-energy filmi choreography for every body.", verified: true },
      { iid: "priya", name: "Priya Nair", style: "Mohiniyattam Flow", city: "Chennai", rating: "5.0", bio: "Graceful, grounded movement rooted in Kerala's classical tradition.", verified: true },
      { iid: "karthik", name: "Karthik Iyer", style: "Kuchipudi Power", city: "Pune", rating: "4.7", bio: "Rhythm-forward sessions that build strength and stamina.", verified: false },
      { iid: "divya", name: "Divya Menon", style: "Folk Fusion", city: "Kochi", rating: "4.6", bio: "Joyful folk forms from across India, reimagined for the studio.", verified: false },
    ];
    const instructors = instructorDefs.map((d) => ({
      id: id("usr"), email: `${d.iid}@thayya.test`, password_hash: pw, role: "instructor",
      name: d.name, instructor_id: d.iid, points: 0, style: d.style, city: d.city,
      bio: d.bio, rating: d.rating, verified: d.verified, active: true, created_at: now,
    }));
    const byIid = Object.fromEntries(instructors.map((u) => [u.instructor_id, u]));

    const memberDefs = [
      { email: "member@thayya.test", name: "Meera Pillai", points: 1240, city: "Chennai" },
      { email: "vikram@thayya.test", name: "Vikram Shah", points: 560, city: "Mumbai" },
      { email: "sanjana@thayya.test", name: "Sanjana Rao", points: 1260, city: "Bangalore" },
      { email: "arjun@thayya.test", name: "Arjun Desai", points: 280, city: "Pune" },
    ];
    const members = memberDefs.map((d) => ({
      id: id("usr"), email: d.email, password_hash: pw, role: "member", name: d.name,
      instructor_id: null, points: d.points, style: null, city: d.city, bio: null,
      rating: null, verified: false, active: true, created_at: now,
    }));
    const memberByEmail = Object.fromEntries(members.map((u) => [u.email, u]));

    const admin = {
      id: id("usr"), email: "admin@thayya.test", password_hash: pw, role: "admin",
      name: "Thayya Admin", instructor_id: null, points: 0, style: null, city: null,
      bio: null, rating: null, verified: true, active: true, created_at: now,
    };
    const users = [admin, ...instructors, ...members];

    // ---- workshops: upcoming (bookable) + past (for history) ----
    const wDefs = [
      { id: "aaja-nachle-intensive", title: "Aaja Nachle Intensive", iid: "anaya", time: "7:00 PM", venue: "Indiranagar Studio", price: 600, cap: 25, left: 3, off: 3 * DAY },
      { id: "bollywood-cardio-beginner", title: "Bollywood Cardio · Beginner", iid: "anaya", time: "6:30 PM", venue: "Whitefield Studio", price: 450, cap: 25, left: 7, off: 1 * DAY },
      { id: "saturday-morning-flow", title: "Saturday Morning Flow", iid: "anaya", time: "8:00 AM", venue: "Cubbon Park · Outdoor", price: 350, cap: 30, left: 22, off: 6 * DAY },
      { id: "bombay-bounce", title: "Bombay Bounce", iid: "rohan", time: "7:00 PM", venue: "Bandra Studio", price: 500, cap: 25, left: 3, off: 2 * DAY },
      { id: "mohiniyattam-slow-flow", title: "Mohiniyattam Slow Flow", iid: "priya", time: "8:00 AM", venue: "Mylapore Studio", price: 400, cap: 40, left: 12, off: 4 * DAY },
      { id: "kuchipudi-power-lab", title: "Kuchipudi Power Lab", iid: "karthik", time: "6:00 PM", venue: "Koregaon Park Studio", price: 550, cap: 25, left: 10, off: 5 * DAY },
      { id: "folk-fusion-jam", title: "Folk Fusion Jam", iid: "divya", time: "5:30 PM", venue: "Fort Kochi Hall", price: 400, cap: 30, left: 18, off: 2 * DAY },
      { id: "past-bollywood-cardio", title: "Bollywood Cardio", iid: "anaya", time: "6:30 PM", venue: "Whitefield Studio", price: 450, cap: 25, left: 0, off: -7 * DAY },
      { id: "past-sunday-flow", title: "Sunday Slow Flow", iid: "anaya", time: "8:00 AM", venue: "Indiranagar Studio", price: 350, cap: 30, left: 0, off: -14 * DAY },
      { id: "past-bombay-bounce", title: "Bombay Bounce", iid: "rohan", time: "7:00 PM", venue: "Bandra Studio", price: 500, cap: 25, left: 0, off: -21 * DAY },
    ];
    const workshops = wDefs.map((w) => {
      const startsAt = now + w.off;
      return {
        id: w.id, title: w.title, instructor: byIid[w.iid].name, instructor_id: w.iid,
        date: fmtDate(startsAt), time: w.time, venue: w.venue, price: w.price,
        spots_left: w.left, capacity: w.cap, starts_at: startsAt, created_at: now,
      };
    });
    const wById = Object.fromEntries(workshops.map((w) => [w.id, w]));

    // ---- bookings spread across members ----
    const bk = (email, wid) => {
      const u = memberByEmail[email];
      const w = wById[wid];
      return {
        id: id("bkg"), user_id: u.id, workshop_id: w.id, title: w.title, instructor: w.instructor,
        instructor_id: w.instructor_id, date: w.date, time: w.time, price: w.price,
        status: w.starts_at >= now ? "upcoming" : "past", starts_at: w.starts_at, created_at: now,
      };
    };
    const bookings = [
      bk("member@thayya.test", "aaja-nachle-intensive"),
      bk("member@thayya.test", "saturday-morning-flow"),
      bk("member@thayya.test", "past-bollywood-cardio"),
      bk("member@thayya.test", "past-sunday-flow"),
      bk("vikram@thayya.test", "bombay-bounce"),
      bk("vikram@thayya.test", "past-bombay-bounce"),
      bk("sanjana@thayya.test", "mohiniyattam-slow-flow"),
      bk("sanjana@thayya.test", "aaja-nachle-intensive"),
      bk("sanjana@thayya.test", "past-bollywood-cardio"),
      bk("arjun@thayya.test", "kuchipudi-power-lab"),
      bk("arjun@thayya.test", "past-sunday-flow"),
    ];

    // ---- anaya's music tracks + a playlist ----
    const tracks = [
      { id: id("trk"), instructor_id: "anaya", title: "Saanson Ki Mala (remix)", artist: "Thayya Sessions", duration: "3:42", mood: "Warm-up", bpm: 96, source: "Thayya Library", created_at: now },
      { id: id("trk"), instructor_id: "anaya", title: "Marigold Drums", artist: "Thayya Sessions", duration: "4:01", mood: "Peak", bpm: 128, source: "Thayya Library", created_at: now },
      { id: id("trk"), instructor_id: "anaya", title: "Pichkari Bass", artist: "Thayya Sessions", duration: "3:28", mood: "Peak", bpm: 130, source: "Thayya Library", created_at: now },
      { id: id("trk"), instructor_id: "anaya", title: "Kajra Re Reprise", artist: "Thayya Sessions", duration: "4:15", mood: "Groove", bpm: 112, source: "Thayya Library", created_at: now },
      { id: id("trk"), instructor_id: "anaya", title: "Tabla Sunrise", artist: "Thayya Sessions", duration: "3:55", mood: "Cool-down", bpm: 84, source: "Thayya Library", created_at: now },
      { id: id("trk"), instructor_id: "anaya", title: "Velvet Lehenga Theme", artist: "Thayya Sessions", duration: "4:00", mood: "Groove", bpm: 108, source: "Thayya Library", created_at: now },
    ];
    const playlist = { id: id("pl"), instructor_id: "anaya", name: "Friday Night Floor", track_ids: tracks.slice(0, 4).map((t) => t.id), created_at: now };

    // ---- content drops (admin) ----
    const drops = [
      { id: id("drop"), name: "April 2026 Drop", note: "Aaja Nachle 2.0 + 7 more", videos_count: 8, audio_count: 12, status: "Live", created_at: now - 30 * DAY },
      { id: id("drop"), name: "March 2026 Drop", note: "Marigold series", videos_count: 8, audio_count: 10, status: "Live", created_at: now - 60 * DAY },
      { id: id("drop"), name: "May 2026 Drop", note: "Monsoon set", videos_count: 6, audio_count: 9, status: "In Review", created_at: now + 5 * DAY },
      { id: id("drop"), name: "June 2026 Drop", note: "Planning", videos_count: 0, audio_count: 0, status: "Planning", created_at: now + 35 * DAY },
    ];

    // ---- payout queue ----
    const payouts = [
      { id: id("pay"), instructor_id: "anaya", instructor_name: "Anaya Krishnan", amount: 68400, status: "pending", note: "Auto-release Friday", created_at: now - 2 * DAY, settled_at: null },
      { id: id("pay"), instructor_id: "rohan", instructor_name: "Rohan Mehta", amount: 54200, status: "approved", note: "Auto-release Friday", created_at: now - 3 * DAY, settled_at: null },
      { id: id("pay"), instructor_id: "priya", instructor_name: "Priya Nair", amount: 82000, status: "pending", note: "Manual review · over ₹50k", created_at: now - 1 * DAY, settled_at: null },
    ];

    await sql.begin(async (tx) => {
      await tx`delete from follows`;
      await tx`delete from payouts`;
      await tx`delete from content_drops`;
      await tx`delete from playlists`;
      await tx`delete from tracks`;
      await tx`delete from bookings`;
      await tx`delete from workshops`;
      await tx`delete from settings`;
      await tx`delete from users`;

      await tx`insert into users ${tx(users, "id", "email", "password_hash", "role", "name", "instructor_id", "points", "style", "city", "bio", "rating", "verified", "active", "created_at")}`;
      await tx`insert into workshops ${tx(workshops, "id", "title", "instructor", "instructor_id", "date", "time", "venue", "price", "spots_left", "capacity", "starts_at", "created_at")}`;
      await tx`insert into bookings ${tx(bookings, "id", "user_id", "workshop_id", "title", "instructor", "instructor_id", "date", "time", "price", "status", "starts_at", "created_at")}`;
      await tx`insert into tracks ${tx(tracks, "id", "instructor_id", "title", "artist", "duration", "mood", "bpm", "source", "created_at")}`;
      await tx`insert into playlists (id, instructor_id, name, track_ids, created_at)
               values (${playlist.id}, ${playlist.instructor_id}, ${playlist.name}, ${tx.json(playlist.track_ids)}, ${playlist.created_at})`;
      await tx`insert into content_drops ${tx(drops, "id", "name", "note", "videos_count", "audio_count", "status", "created_at")}`;
      await tx`insert into payouts ${tx(payouts, "id", "instructor_id", "instructor_name", "amount", "status", "note", "created_at", "settled_at")}`;
      await tx`insert into settings (key, value) values ('commission_split', ${tx.json({ instructor: 70, platform: 30 })})`;
      await tx`insert into settings (key, value) values ('payout_cadence', ${tx.json({ label: "Weekly · Friday", automated: true })})`;
    });

    console.log(`Seeded: ${users.length} users (5 instructors, 4 members, 1 admin), ${workshops.length} workshops, ${bookings.length} bookings, ${tracks.length} tracks, 1 playlist, ${drops.length} content drops, ${payouts.length} payouts, 2 settings.`);
    console.log("Demo logins (password thayya123): member@thayya.test, anaya@thayya.test, admin@thayya.test");
  } catch (e) {
    console.error("Seed failed:", e.message);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
})();
