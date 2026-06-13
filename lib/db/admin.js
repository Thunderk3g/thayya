// Admin-portal repository — Drizzle queries over Supabase Postgres.
// KPIs/aggregates, instructors roster, members list, content drops CRUD,
// commission config, payout queue.

import crypto from "node:crypto";
import { eq, and, desc, asc, sql, count } from "drizzle-orm";
import { getDb } from "./client";
import { users, workshops, bookings, payouts, contentDrops, settings } from "./schema";

// local id helper (avoids a circular import with ./index)
function newId(prefix = "id") {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

const INSTRUCTOR_SHARE = 0.7;

// ---- KPIs / aggregates ----

// Counts + revenue. Money is INTEGER rupees. gmvThisMonth uses bookings.createdAt
// (epoch-ms) bucketed into the current calendar month; gmvAllTime sums everything.
export async function getAdminKpis() {
  const dbi = getDb();

  const [instructorRow] = await dbi
    .select({ n: count() })
    .from(users)
    .where(eq(users.role, "instructor"));
  const [memberRow] = await dbi
    .select({ n: count() })
    .from(users)
    .where(eq(users.role, "member"));
  const [workshopRow] = await dbi.select({ n: count() }).from(workshops);

  // Pull bookings (createdAt, price) once and bucket in JS — DB-portable.
  const rows = await dbi
    .select({ createdAt: bookings.createdAt, price: bookings.price })
    .from(bookings);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();

  let gmvThisMonth = 0;
  let gmvAllTime = 0;
  for (const r of rows) {
    const price = Number(r.price) || 0;
    gmvAllTime += price;
    const t = Number(r.createdAt) || 0;
    if (t >= monthStart && t < nextMonthStart) gmvThisMonth += price;
  }

  return {
    instructors: Number(instructorRow?.n) || 0,
    members: Number(memberRow?.n) || 0,
    workshops: Number(workshopRow?.n) || 0,
    gmvThisMonth,
    gmvAllTime,
  };
}

// Revenue bucketed by calendar month for the last n months, oldest→newest.
// Computes buckets in JS from a single bookings query.
export async function getRevenueByMonth(n = 6) {
  const dbi = getDb();
  const rows = await dbi
    .select({ createdAt: bookings.createdAt, price: bookings.price })
    .from(bookings);

  const now = new Date();
  const buckets = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      label: d.toLocaleString("en-US", { month: "short" }),
      start: d.getTime(),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime(),
      total: 0,
    });
  }

  for (const r of rows) {
    const t = Number(r.createdAt) || 0;
    const price = Number(r.price) || 0;
    for (const b of buckets) {
      if (t >= b.start && t < b.end) {
        b.total += price;
        break;
      }
    }
  }

  return buckets.map((b) => ({ label: b.label, total: b.total }));
}

// Top earners by instructor share (70% of summed booking price), joined to
// users for name/city. Ordered by share desc.
export async function getTopEarners(limit = 5) {
  const dbi = getDb();
  const rows = await dbi
    .select({ instructorId: bookings.instructorId, price: bookings.price })
    .from(bookings);

  const byInstructor = new Map();
  for (const r of rows) {
    if (!r.instructorId) continue;
    const prev = byInstructor.get(r.instructorId) || 0;
    byInstructor.set(r.instructorId, prev + (Number(r.price) || 0));
  }

  const instructors = await dbi
    .select({ instructorId: users.instructorId, name: users.name, city: users.city })
    .from(users)
    .where(eq(users.role, "instructor"));
  const nameById = new Map();
  for (const u of instructors) {
    if (u.instructorId) nameById.set(u.instructorId, u);
  }

  const earners = [];
  for (const [instructorId, gmv] of byInstructor.entries()) {
    const u = nameById.get(instructorId);
    earners.push({
      instructorId,
      name: u?.name || "Unknown",
      city: u?.city || "",
      share: Math.round(gmv * INSTRUCTOR_SHARE),
    });
  }

  earners.sort((a, b) => b.share - a.share);
  return earners.slice(0, limit);
}

// ---- instructors roster ----

// Instructors with a real student count = distinct booking userIds over their
// workshops (bookings carry instructorId).
export async function listInstructors() {
  const dbi = getDb();
  const rows = await dbi
    .select({
      id: users.id,
      instructorId: users.instructorId,
      name: users.name,
      style: users.style,
      city: users.city,
      rating: users.rating,
      verified: users.verified,
      active: users.active,
    })
    .from(users)
    .where(eq(users.role, "instructor"))
    .orderBy(asc(users.name));

  const bookingRows = await dbi
    .select({ instructorId: bookings.instructorId, userId: bookings.userId })
    .from(bookings);

  const studentsByInstructor = new Map();
  for (const b of bookingRows) {
    if (!b.instructorId) continue;
    let set = studentsByInstructor.get(b.instructorId);
    if (!set) {
      set = new Set();
      studentsByInstructor.set(b.instructorId, set);
    }
    set.add(b.userId);
  }

  return rows.map((r) => ({
    ...r,
    students: studentsByInstructor.get(r.instructorId)?.size || 0,
  }));
}

// ---- members ----

// Members with optional name/email substring filter (case-insensitive).
export async function listMembers(q) {
  const dbi = getDb();
  const rows = await dbi
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      points: users.points,
      city: users.city,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "member"))
    .orderBy(desc(users.createdAt));

  const term = String(q || "").trim().toLowerCase();
  if (!term) return rows;
  return rows.filter(
    (r) =>
      (r.name || "").toLowerCase().includes(term) ||
      (r.email || "").toLowerCase().includes(term)
  );
}

// ---- content drops CRUD ----

export async function listContentDrops() {
  return getDb().select().from(contentDrops).orderBy(desc(contentDrops.createdAt));
}

const DROP_STATUSES = ["Live", "In Review", "Planning"];

export async function createContentDrop({ name, note, videosCount, audioCount, status }) {
  const drop = {
    id: newId("drop"),
    name: String(name || "Untitled drop").slice(0, 120),
    note: String(note || "").slice(0, 240),
    videosCount: Number.isFinite(Number(videosCount)) ? Number(videosCount) : 0,
    audioCount: Number.isFinite(Number(audioCount)) ? Number(audioCount) : 0,
    status: DROP_STATUSES.includes(status) ? status : "Planning",
    createdAt: Date.now(),
  };
  await getDb().insert(contentDrops).values(drop);
  return drop;
}

export async function updateContentDrop(id, fields) {
  const dbi = getDb();
  const updates = {};
  if (typeof fields.name === "string") updates.name = fields.name.slice(0, 120);
  if (typeof fields.note === "string") updates.note = fields.note.slice(0, 240);
  if (fields.videosCount !== undefined && Number.isFinite(Number(fields.videosCount)))
    updates.videosCount = Number(fields.videosCount);
  if (fields.audioCount !== undefined && Number.isFinite(Number(fields.audioCount)))
    updates.audioCount = Number(fields.audioCount);
  if (typeof fields.status === "string" && DROP_STATUSES.includes(fields.status))
    updates.status = fields.status;

  if (Object.keys(updates).length === 0) {
    const cur = (await dbi.select().from(contentDrops).where(eq(contentDrops.id, id)).limit(1))[0];
    return cur || null;
  }
  const res = await dbi
    .update(contentDrops)
    .set(updates)
    .where(eq(contentDrops.id, id))
    .returning();
  return res[0] || null;
}

export async function deleteContentDrop(id) {
  const deleted = await getDb()
    .delete(contentDrops)
    .where(eq(contentDrops.id, id))
    .returning({ id: contentDrops.id });
  return deleted.length > 0;
}

// ---- commission config ----

const DEFAULT_SPLIT = { instructor: 70, platform: 30 };
const DEFAULT_CADENCE = { label: "Weekly · Friday", automated: true };

async function readSetting(key, fallback) {
  const rows = await getDb().select().from(settings).where(eq(settings.key, key)).limit(1);
  return rows[0]?.value ?? fallback;
}

export async function getCommissionConfig() {
  const split = await readSetting("commission_split", DEFAULT_SPLIT);
  const cadence = await readSetting("payout_cadence", DEFAULT_CADENCE);
  return {
    split: {
      instructor: Number(split?.instructor ?? DEFAULT_SPLIT.instructor),
      platform: Number(split?.platform ?? DEFAULT_SPLIT.platform),
    },
    cadence: {
      label: cadence?.label ?? DEFAULT_CADENCE.label,
      automated: cadence?.automated ?? DEFAULT_CADENCE.automated,
    },
  };
}

export async function updateCommissionSplit({ instructor, platform }) {
  const i = Number(instructor);
  const p = Number(platform);
  if (!Number.isFinite(i) || !Number.isFinite(p)) {
    throw new Error("Both shares must be numbers.");
  }
  if (i + p !== 100) {
    throw new Error("Instructor and platform shares must add up to 100.");
  }
  const value = { instructor: i, platform: p };
  const dbi = getDb();
  await dbi
    .insert(settings)
    .values({ key: "commission_split", value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
  return value;
}

// ---- payout queue ----

export async function listPayouts() {
  return getDb().select().from(payouts).orderBy(desc(payouts.createdAt));
}

const ALLOWED_TRANSITIONS = {
  pending: ["approved", "settled"],
  approved: ["settled"],
  settled: [],
};

// Transition a payout's status. Returns updated row, or null if not found.
// Throws on an invalid transition so the route can return 400.
export async function transitionPayout(id, to) {
  const dbi = getDb();
  const cur = (await dbi.select().from(payouts).where(eq(payouts.id, id)).limit(1))[0];
  if (!cur) return null;

  const allowed = ALLOWED_TRANSITIONS[cur.status] || [];
  if (!allowed.includes(to)) {
    throw new Error(`Cannot move a payout from ${cur.status} to ${to}.`);
  }

  const updates = { status: to };
  if (to === "settled") updates.settledAt = Date.now();

  const res = await dbi.update(payouts).set(updates).where(eq(payouts.id, id)).returning();
  return res[0] || null;
}
