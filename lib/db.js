// Tiny JSON-file data store behind a repository API. Node runtime only
// (uses fs + crypto). Chosen over a native DB driver so the prototype has
// zero compile/native-module risk on Windows; the repository surface is
// the swap point when a real database lands later.
//
// All writes go through writeStore() which does an atomic replace.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "thayya.db.json");

// ---- password hashing (scrypt; no native deps) ----
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(test, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function newId(prefix = "id") {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

// ---- seed (runs once, the first time the store is read) ----
function seed() {
  const pw = hashPassword("thayya123");

  const workshops = [
    { id: "aaja-nachle-intensive", title: "Aaja Nachle Intensive", instructor: "Anaya Krishnan", instructorId: "anaya", date: "Wed 29 Apr", time: "7:00 PM", venue: "Indiranagar Studio", price: 600, spotsLeft: 3 },
    { id: "bollywood-cardio-beginner", title: "Bollywood Cardio · Beginner", instructor: "Anaya Krishnan", instructorId: "anaya", date: "Mon 27 Apr", time: "6:30 PM", venue: "Whitefield Studio", price: 450, spotsLeft: 7 },
    { id: "saturday-morning-flow", title: "Saturday Morning Flow", instructor: "Anaya Krishnan", instructorId: "anaya", date: "Sat 02 May", time: "8:00 AM", venue: "Cubbon Park · Outdoor", price: 350, spotsLeft: 22 },
    { id: "bombay-bounce", title: "Bombay Bounce", instructor: "Rohan Mehta", instructorId: "rohan", date: "Tue 28 Apr", time: "7:00 PM", venue: "Bandra Studio", price: 500, spotsLeft: 3 },
    { id: "mohiniyattam-slow-flow", title: "Mohiniyattam Slow Flow", instructor: "Priya Nair", instructorId: "priya", date: "Wed 29 Apr", time: "8:00 AM", venue: "Mylapore Studio", price: 400, spotsLeft: 12 },
  ];

  const tracks = [
    { id: newId("trk"), instructorId: "anaya", title: "Saanson Ki Mala (remix)", artist: "Thayya Sessions", duration: "3:42", mood: "Warm-up", bpm: 96, source: "Thayya Library", createdAt: Date.now() },
    { id: newId("trk"), instructorId: "anaya", title: "Marigold Drums", artist: "Thayya Sessions", duration: "4:01", mood: "Peak", bpm: 128, source: "Thayya Library", createdAt: Date.now() },
    { id: newId("trk"), instructorId: "anaya", title: "Pichkari Bass", artist: "Thayya Sessions", duration: "3:28", mood: "Peak", bpm: 130, source: "Thayya Library", createdAt: Date.now() },
    { id: newId("trk"), instructorId: "anaya", title: "Kajra Re Reprise", artist: "Thayya Sessions", duration: "4:15", mood: "Groove", bpm: 112, source: "Thayya Library", createdAt: Date.now() },
    { id: newId("trk"), instructorId: "anaya", title: "Tabla Sunrise", artist: "Thayya Sessions", duration: "3:55", mood: "Cool-down", bpm: 84, source: "Thayya Library", createdAt: Date.now() },
    { id: newId("trk"), instructorId: "anaya", title: "Velvet Lehenga Theme", artist: "Thayya Sessions", duration: "4:00", mood: "Groove", bpm: 108, source: "Thayya Library", createdAt: Date.now() },
  ];

  const anayaPlaylist = {
    id: newId("pl"),
    instructorId: "anaya",
    name: "Friday Night Floor",
    trackIds: tracks.slice(0, 4).map((t) => t.id),
    createdAt: Date.now(),
  };

  const users = [
    { id: newId("usr"), email: "member@thayya.test", passwordHash: pw, role: "member", name: "Meera Pillai", instructorId: null, points: 1240, createdAt: Date.now() },
    { id: newId("usr"), email: "anaya@thayya.test", passwordHash: pw, role: "instructor", name: "Anaya Krishnan", instructorId: "anaya", points: 0, createdAt: Date.now() },
    { id: newId("usr"), email: "admin@thayya.test", passwordHash: pw, role: "admin", name: "Thayya Admin", instructorId: null, points: 0, createdAt: Date.now() },
  ];

  const memberId = users[0].id;
  const bookings = [
    { id: newId("bkg"), userId: memberId, workshopId: "aaja-nachle-intensive", title: "Aaja Nachle Intensive", instructor: "Anaya Krishnan", date: "Wed 29 Apr", time: "7:00 PM", price: 600, status: "upcoming", createdAt: Date.now() },
    { id: newId("bkg"), userId: memberId, workshopId: "saturday-morning-flow", title: "Saturday Morning Flow", instructor: "Anaya Krishnan", date: "Sat 02 May", time: "8:00 AM", price: 350, status: "upcoming", createdAt: Date.now() },
  ];

  return { users, bookings, tracks, playlists: [anayaPlaylist], workshops };
}

// ---- store I/O (module-cached, write-through, atomic replace) ----
let cache = null;

function readStore() {
  if (cache) return cache;
  try {
    if (fs.existsSync(DB_FILE)) {
      cache = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      return cache;
    }
  } catch {
    // fall through to reseed on a corrupt file
  }
  cache = seed();
  writeStore(cache);
  return cache;
}

function writeStore(data) {
  cache = data;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, DB_FILE);
}

// ---- users ----
export function findUserByEmail(email) {
  const db = readStore();
  const e = String(email || "").trim().toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === e) || null;
}

export function findUserById(id) {
  const db = readStore();
  return db.users.find((u) => u.id === id) || null;
}

export function createUser({ email, password, name, role = "member" }) {
  const db = readStore();
  const e = String(email).trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === e)) {
    throw new Error("An account with this email already exists.");
  }
  const user = {
    id: newId("usr"),
    email: e,
    passwordHash: hashPassword(password),
    role: role === "instructor" ? "instructor" : "member",
    name: name || e.split("@")[0],
    instructorId: null,
    points: 0,
    createdAt: Date.now(),
  };
  db.users.push(user);
  writeStore(db);
  return user;
}

export function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

// ---- workshops ----
export function listWorkshops() {
  return readStore().workshops;
}
export function findWorkshop(id) {
  return readStore().workshops.find((w) => w.id === id) || null;
}
// loose lookup used by the AI agent: match by id or fuzzy title
export function findWorkshopByQuery(q) {
  const db = readStore();
  const s = String(q || "").trim().toLowerCase();
  if (!s) return null;
  return (
    db.workshops.find((w) => w.id === s) ||
    db.workshops.find((w) => w.title.toLowerCase() === s) ||
    db.workshops.find((w) => w.title.toLowerCase().includes(s)) ||
    null
  );
}

// ---- bookings ----
export function listBookingsForUser(userId) {
  return readStore()
    .bookings.filter((b) => b.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function createBooking({ userId, workshopId }) {
  const db = readStore();
  const w = db.workshops.find((x) => x.id === workshopId);
  if (!w) throw new Error("Unknown workshop.");
  const existing = db.bookings.find(
    (b) => b.userId === userId && b.workshopId === workshopId && b.status === "upcoming"
  );
  if (existing) return { booking: existing, alreadyBooked: true };
  const booking = {
    id: newId("bkg"),
    userId,
    workshopId: w.id,
    title: w.title,
    instructor: w.instructor,
    date: w.date,
    time: w.time,
    price: w.price,
    status: "upcoming",
    createdAt: Date.now(),
  };
  db.bookings.push(booking);
  writeStore(db);
  return { booking, alreadyBooked: false };
}

// ---- instructor music ----
export function listTracks(instructorId) {
  return readStore()
    .tracks.filter((t) => t.instructorId === instructorId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function addTrack(instructorId, { title, artist, duration, mood, bpm, source }) {
  const db = readStore();
  const track = {
    id: newId("trk"),
    instructorId,
    title: String(title || "Untitled").slice(0, 120),
    artist: String(artist || "Unknown").slice(0, 120),
    duration: String(duration || "—").slice(0, 12),
    mood: String(mood || "Groove").slice(0, 40),
    bpm: Number.isFinite(Number(bpm)) ? Number(bpm) : null,
    source: String(source || "Custom").slice(0, 60),
    createdAt: Date.now(),
  };
  db.tracks.push(track);
  writeStore(db);
  return track;
}

export function removeTrack(instructorId, trackId) {
  const db = readStore();
  const before = db.tracks.length;
  db.tracks = db.tracks.filter(
    (t) => !(t.id === trackId && t.instructorId === instructorId)
  );
  // also drop the track from any of this instructor's playlists
  db.playlists.forEach((p) => {
    if (p.instructorId === instructorId) {
      p.trackIds = p.trackIds.filter((id) => id !== trackId);
    }
  });
  const removed = db.tracks.length < before;
  if (removed) writeStore(db);
  return removed;
}

export function listPlaylists(instructorId) {
  return readStore()
    .playlists.filter((p) => p.instructorId === instructorId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function createPlaylist(instructorId, { name, trackIds = [] }) {
  const db = readStore();
  const playlist = {
    id: newId("pl"),
    instructorId,
    name: String(name || "New playlist").slice(0, 80),
    trackIds: Array.isArray(trackIds) ? trackIds.slice(0, 200) : [],
    createdAt: Date.now(),
  };
  db.playlists.push(playlist);
  writeStore(db);
  return playlist;
}

export function updatePlaylist(instructorId, playlistId, { name, trackIds }) {
  const db = readStore();
  const p = db.playlists.find(
    (x) => x.id === playlistId && x.instructorId === instructorId
  );
  if (!p) return null;
  if (typeof name === "string") p.name = name.slice(0, 80);
  if (Array.isArray(trackIds)) p.trackIds = trackIds.slice(0, 200);
  writeStore(db);
  return p;
}

export function deletePlaylist(instructorId, playlistId) {
  const db = readStore();
  const before = db.playlists.length;
  db.playlists = db.playlists.filter(
    (p) => !(p.id === playlistId && p.instructorId === instructorId)
  );
  const removed = db.playlists.length < before;
  if (removed) writeStore(db);
  return removed;
}
