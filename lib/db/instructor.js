// Instructor-portal repository — Drizzle queries over Supabase Postgres.
// Workshops, students, earnings, payouts, and today-dashboard stats.

import crypto from "node:crypto";
import { eq, and, desc, asc, sql, count } from "drizzle-orm";
import { getDb } from "./client";
import { users, workshops, bookings, payouts } from "./schema";
import { findUserById } from "./index";

// local id helper (avoids a circular import with ./index)
function newId(prefix = "id") {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

// ---- workshops ----
export async function createWorkshop(
  instructorId,
  { title, date, time, venue, price, capacity, startsAt }
) {
  const instructor = await findUserById(instructorId);
  const name = instructor?.name || "Instructor";
  const cap = Number.isFinite(Number(capacity)) ? Number(capacity) : 25;
  const workshop = {
    id: newId("wsh"),
    title: String(title || "Untitled workshop").slice(0, 160),
    instructor: name,
    instructorId,
    date: String(date || "").slice(0, 40),
    time: String(time || "").slice(0, 40),
    venue: venue ? String(venue).slice(0, 160) : null,
    price: Number.isFinite(Number(price)) ? Number(price) : 0,
    spotsLeft: cap,
    capacity: cap,
    startsAt: Number.isFinite(Number(startsAt)) ? Number(startsAt) : null,
    createdAt: Date.now(),
  };
  await getDb().insert(workshops).values(workshop);
  return workshop;
}

export async function listWorkshopsForInstructor(instructorId) {
  return getDb()
    .select()
    .from(workshops)
    .where(eq(workshops.instructorId, instructorId))
    .orderBy(asc(workshops.startsAt));
}

// map of workshopId -> booked count, across this instructor's workshops
export async function bookedCountsForInstructor(instructorId) {
  const rows = await getDb()
    .select({ workshopId: bookings.workshopId, c: count() })
    .from(bookings)
    .where(eq(bookings.instructorId, instructorId))
    .groupBy(bookings.workshopId);
  const map = {};
  for (const r of rows) map[r.workshopId] = Number(r.c) || 0;
  return map;
}

// ---- students (instructor CRM) ----
export async function listStudentsForInstructor(instructorId) {
  const rows = await getDb()
    .select({
      userId: bookings.userId,
      name: users.name,
      classes: count(),
      totalSpend: sql`coalesce(sum(${bookings.price}), 0)`,
      lastAt: sql`max(${bookings.createdAt})`,
    })
    .from(bookings)
    .innerJoin(workshops, eq(bookings.workshopId, workshops.id))
    .leftJoin(users, eq(bookings.userId, users.id))
    .where(eq(workshops.instructorId, instructorId))
    .groupBy(bookings.userId, users.name)
    .orderBy(desc(sql`coalesce(sum(${bookings.price}), 0)`));
  return rows.map((r) => ({
    userId: r.userId,
    name: r.name || "Member",
    classes: Number(r.classes) || 0,
    totalSpend: Number(r.totalSpend) || 0,
    lastAt: r.lastAt != null ? Number(r.lastAt) : null,
  }));
}

// ---- earnings ----
const INSTRUCTOR_SHARE = 0.7;

export async function getInstructorEarnings(instructorId) {
  const now = Date.now();
  const rows = await getDb()
    .select()
    .from(bookings)
    .where(eq(bookings.instructorId, instructorId))
    .orderBy(desc(bookings.createdAt));

  let gross = 0;
  let unclearedGross = 0;
  for (const b of rows) {
    const price = Number(b.price) || 0;
    gross += price;
    // uncleared = upcoming / future-dated bookings (not yet settled)
    if (b.startsAt == null || Number(b.startsAt) >= now) unclearedGross += price;
  }

  const year = Math.round(gross * INSTRUCTOR_SHARE);
  const balance = Math.round(unclearedGross * INSTRUCTOR_SHARE);

  const commissions = rows.slice(0, 6).map((b) => ({
    title: b.title,
    date: b.date,
    amount: Math.round((Number(b.price) || 0) * INSTRUCTOR_SHARE),
    status: b.startsAt != null && Number(b.startsAt) < now ? "Cleared" : "Pending",
  }));

  return { balance, year, gross, commissions };
}

// ---- today dashboard ----
function monthStart(now) {
  const d = new Date(now);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}
function monthEnd(now) {
  const d = new Date(now);
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
}

export async function getInstructorToday(instructorId) {
  const dbi = getDb();
  const now = Date.now();
  const mStart = monthStart(now);
  const mEnd = monthEnd(now);

  const myWorkshops = await dbi
    .select()
    .from(workshops)
    .where(eq(workshops.instructorId, instructorId))
    .orderBy(asc(workshops.startsAt));

  const myBookings = await dbi
    .select()
    .from(bookings)
    .where(eq(bookings.instructorId, instructorId));

  // earliest upcoming workshop
  const upcoming = myWorkshops.filter(
    (w) => w.startsAt != null && Number(w.startsAt) >= now
  );
  let nextWorkshop = null;
  if (upcoming.length) {
    const w = upcoming[0];
    const bookedCount = myBookings.filter((b) => b.workshopId === w.id).length;
    const capacity = Number(w.capacity) || 0;
    const fillPct = capacity > 0 ? Math.round((bookedCount / capacity) * 100) : 0;
    nextWorkshop = {
      id: w.id,
      title: w.title,
      venue: w.venue,
      date: w.date,
      time: w.time,
      bookedCount,
      capacity,
      fillPct,
    };
  }

  // this-month instructor-share earnings (bookings created this month)
  const monthGross = myBookings
    .filter((b) => {
      const c = Number(b.createdAt);
      return c >= mStart && c < mEnd;
    })
    .reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  const monthEarnings = Math.round(monthGross * INSTRUCTOR_SHARE);

  // distinct booking userIds
  const activeStudents = new Set(myBookings.map((b) => b.userId)).size;

  // workshops scheduled this month
  const workshopsThisMonth = myWorkshops.filter((w) => {
    const s = w.startsAt != null ? Number(w.startsAt) : null;
    return s != null && s >= mStart && s < mEnd;
  }).length;

  return { nextWorkshop, monthEarnings, activeStudents, workshopsThisMonth };
}

// ---- payouts ----
export async function createPayout(instructorId, amount) {
  const instructor = await findUserById(instructorId);
  const payout = {
    id: newId("pay"),
    instructorId,
    instructorName: instructor?.name || "Instructor",
    amount: Number.isFinite(Number(amount)) ? Math.round(Number(amount)) : 0,
    status: "pending",
    note: "Withdrawal requested",
    createdAt: Date.now(),
    settledAt: null,
  };
  await getDb().insert(payouts).values(payout);
  return payout;
}

export async function listPayoutsForInstructor(instructorId) {
  return getDb()
    .select()
    .from(payouts)
    .where(eq(payouts.instructorId, instructorId))
    .orderBy(desc(payouts.createdAt));
}
