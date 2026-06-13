// Data repository — Drizzle queries against Supabase Postgres.
// Same function names the app already imported from "lib/db"; they are now
// async (Drizzle is async), so callers must await. Node runtime only.

import crypto from "node:crypto";
import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "./client";
import { users, workshops, bookings, tracks, playlists } from "./schema";

// ---- password hashing (scrypt; sync, no DB) ----
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

export function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

// ---- users ----
export async function findUserByEmail(email) {
  const e = String(email || "").trim().toLowerCase();
  if (!e) return null;
  const rows = await getDb().select().from(users).where(eq(users.email, e)).limit(1);
  return rows[0] || null;
}

export async function findUserById(id) {
  if (!id) return null;
  const rows = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] || null;
}

export async function createUser({ email, password, name, role = "member" }) {
  const e = String(email).trim().toLowerCase();
  const existing = await findUserByEmail(e);
  if (existing) throw new Error("An account with this email already exists.");
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
  await getDb().insert(users).values(user);
  return user;
}

// ---- workshops ----
export async function listWorkshops() {
  return getDb().select().from(workshops);
}

export async function findWorkshop(id) {
  const rows = await getDb().select().from(workshops).where(eq(workshops.id, id)).limit(1);
  return rows[0] || null;
}

// loose lookup used by the AI assistant: id, exact title, then substring
export async function findWorkshopByQuery(q) {
  const s = String(q || "").trim().toLowerCase();
  if (!s) return null;
  const all = await getDb().select().from(workshops);
  return (
    all.find((w) => w.id === s) ||
    all.find((w) => w.title.toLowerCase() === s) ||
    all.find((w) => w.title.toLowerCase().includes(s)) ||
    null
  );
}

// ---- bookings ----
export async function listBookingsForUser(userId) {
  return getDb()
    .select()
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt));
}

export async function createBooking({ userId, workshopId }) {
  const dbi = getDb();
  const w = (await dbi.select().from(workshops).where(eq(workshops.id, workshopId)).limit(1))[0];
  if (!w) throw new Error("Unknown workshop.");
  const existing = (
    await dbi
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, userId),
          eq(bookings.workshopId, workshopId),
          eq(bookings.status, "upcoming")
        )
      )
      .limit(1)
  )[0];
  if (existing) return { booking: existing, alreadyBooked: true };
  const booking = {
    id: newId("bkg"),
    userId,
    workshopId: w.id,
    title: w.title,
    instructor: w.instructor,
    instructorId: w.instructorId ?? null,
    date: w.date,
    time: w.time,
    price: w.price,
    status: "upcoming",
    startsAt: w.startsAt ?? null,
    createdAt: Date.now(),
  };
  await dbi.insert(bookings).values(booking);
  // award loyalty points for a confirmed (non-duplicate) booking
  await dbi
    .update(users)
    .set({ points: sql`${users.points} + 25` })
    .where(eq(users.id, userId));
  return { booking, alreadyBooked: false, pointsAwarded: 25 };
}

// ---- instructor music ----
export async function listTracks(instructorId) {
  return getDb()
    .select()
    .from(tracks)
    .where(eq(tracks.instructorId, instructorId))
    .orderBy(desc(tracks.createdAt));
}

export async function addTrack(instructorId, { title, artist, duration, mood, bpm, source }) {
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
  await getDb().insert(tracks).values(track);
  return track;
}

export async function removeTrack(instructorId, trackId) {
  const dbi = getDb();
  const deleted = await dbi
    .delete(tracks)
    .where(and(eq(tracks.id, trackId), eq(tracks.instructorId, instructorId)))
    .returning({ id: tracks.id });
  if (!deleted.length) return false;
  // drop the track from any of this instructor's playlists
  const pls = await dbi.select().from(playlists).where(eq(playlists.instructorId, instructorId));
  for (const p of pls) {
    const ids = Array.isArray(p.trackIds) ? p.trackIds : [];
    if (ids.includes(trackId)) {
      await dbi
        .update(playlists)
        .set({ trackIds: ids.filter((id) => id !== trackId) })
        .where(eq(playlists.id, p.id));
    }
  }
  return true;
}

export async function listPlaylists(instructorId) {
  return getDb()
    .select()
    .from(playlists)
    .where(eq(playlists.instructorId, instructorId))
    .orderBy(desc(playlists.createdAt));
}

export async function createPlaylist(instructorId, { name, trackIds = [] }) {
  const playlist = {
    id: newId("pl"),
    instructorId,
    name: String(name || "New playlist").slice(0, 80),
    trackIds: Array.isArray(trackIds) ? trackIds.slice(0, 200) : [],
    createdAt: Date.now(),
  };
  await getDb().insert(playlists).values(playlist);
  return playlist;
}

export async function updatePlaylist(instructorId, playlistId, { name, trackIds }) {
  const dbi = getDb();
  const updates = {};
  if (typeof name === "string") updates.name = name.slice(0, 80);
  if (Array.isArray(trackIds)) updates.trackIds = trackIds.slice(0, 200);
  if (Object.keys(updates).length === 0) {
    const cur = (
      await dbi
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.instructorId, instructorId)))
        .limit(1)
    )[0];
    return cur || null;
  }
  const res = await dbi
    .update(playlists)
    .set(updates)
    .where(and(eq(playlists.id, playlistId), eq(playlists.instructorId, instructorId)))
    .returning();
  return res[0] || null;
}

export async function deletePlaylist(instructorId, playlistId) {
  const deleted = await getDb()
    .delete(playlists)
    .where(and(eq(playlists.id, playlistId), eq(playlists.instructorId, instructorId)))
    .returning({ id: playlists.id });
  return deleted.length > 0;
}

// ---- domain repositories (member / instructor / admin features) ----
// These files are filled in by the per-portal build work; they import the
// drizzle client + schema directly and define their own helpers.
export * from "./member";
export * from "./instructor";
export * from "./admin";
