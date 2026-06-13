// Member-portal repository — Drizzle queries over Supabase Postgres.
// Add member-feature functions here (follows, referral, cancel booking, …).
// The core user/workshop/booking functions live in ./index.

import crypto from "node:crypto";
import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "./client";
import { users, workshops, bookings, follows } from "./schema";

// local id helper (avoids a circular import with ./index)
function newId(prefix = "id") {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

// A workshop counts as "upcoming" when it has no start time yet, or its
// start time is now or in the future.
function isUpcoming(startsAt, now) {
  return startsAt == null || startsAt >= now;
}

// ---- instructor discovery / profile ----

// The instructor user row plus their upcoming workshops, or null.
export async function getInstructorProfile(instructorId) {
  if (!instructorId) return null;
  const dbi = getDb();
  const row = (
    await dbi
      .select()
      .from(users)
      .where(and(eq(users.instructorId, instructorId), eq(users.role, "instructor")))
      .limit(1)
  )[0];
  if (!row) return null;

  const now = Date.now();
  const all = await dbi
    .select()
    .from(workshops)
    .where(eq(workshops.instructorId, instructorId))
    .orderBy(workshops.startsAt);
  const upcoming = all
    .filter((w) => isUpcoming(w.startsAt, now))
    .sort((a, b) => (a.startsAt ?? Infinity) - (b.startsAt ?? Infinity));

  return { ...row, workshops: upcoming };
}

// Workshops with a null or future start time, ordered by start time.
export async function listUpcomingWorkshops() {
  const now = Date.now();
  const all = await getDb().select().from(workshops);
  return all
    .filter((w) => isUpcoming(w.startsAt, now))
    .sort((a, b) => (a.startsAt ?? Infinity) - (b.startsAt ?? Infinity));
}

// Same as listUpcomingWorkshops but filtered by a case-insensitive substring
// match on title or instructor name.
export async function searchUpcomingWorkshops(q) {
  const needle = String(q || "").trim().toLowerCase();
  const upcoming = await listUpcomingWorkshops();
  if (!needle) return upcoming;
  return upcoming.filter(
    (w) =>
      String(w.title || "").toLowerCase().includes(needle) ||
      String(w.instructor || "").toLowerCase().includes(needle)
  );
}

// Active instructors for the Discover grid.
export async function listInstructorsForDiscover() {
  const rows = await getDb()
    .select()
    .from(users)
    .where(and(eq(users.role, "instructor"), eq(users.active, true)));
  return rows.map((u) => ({
    instructorId: u.instructorId,
    name: u.name,
    style: u.style,
    city: u.city,
    rating: u.rating,
    verified: u.verified,
  }));
}

// ---- follows ----

export async function isFollowing(userId, instructorId) {
  if (!userId || !instructorId) return false;
  const row = (
    await getDb()
      .select()
      .from(follows)
      .where(and(eq(follows.userId, userId), eq(follows.instructorId, instructorId)))
      .limit(1)
  )[0];
  return Boolean(row);
}

export async function followInstructor(userId, instructorId) {
  if (await isFollowing(userId, instructorId)) return false;
  await getDb().insert(follows).values({
    id: newId("flw"),
    userId,
    instructorId,
    createdAt: Date.now(),
  });
  return true;
}

export async function unfollowInstructor(userId, instructorId) {
  const deleted = await getDb()
    .delete(follows)
    .where(and(eq(follows.userId, userId), eq(follows.instructorId, instructorId)))
    .returning({ id: follows.id });
  return deleted.length > 0;
}

export async function listFollows(userId) {
  if (!userId) return [];
  return getDb()
    .select()
    .from(follows)
    .where(eq(follows.userId, userId))
    .orderBy(desc(follows.createdAt));
}

export async function countFollowing(userId) {
  if (!userId) return 0;
  const rows = await getDb()
    .select({ n: sql`count(*)` })
    .from(follows)
    .where(eq(follows.userId, userId));
  return Number(rows[0]?.n || 0);
}

// ---- bookings ----

// Delete a booking only if it belongs to the user; returns whether a row went.
export async function cancelBooking(userId, bookingId) {
  if (!userId || !bookingId) return false;
  const deleted = await getDb()
    .delete(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
    .returning({ id: bookings.id });
  return deleted.length > 0;
}

// ---- referral ----

// Deterministic uppercase referral code from a user: first name + last 4 of id.
// Pure helper — no DB access.
export function referralCode(user) {
  if (!user) return "THAYYA";
  const first = String(user.name || "")
    .trim()
    .split(/\s+/)[0]
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
  const id = String(user.id || "").replace(/[^A-Za-z0-9]/g, "");
  const tail = id.slice(-4).toUpperCase();
  const base = (first || "THAYYA").slice(0, 8);
  return `${base}${tail}`;
}
