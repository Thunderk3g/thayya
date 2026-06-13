// Drizzle schema for the Thayya data model (Supabase Postgres).
// createdAt / startsAt are epoch-ms (bigint). New columns are nullable or
// defaulted so `drizzle-kit push` can ALTER existing rows safely.

import {
  pgTable,
  text,
  integer,
  bigint,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("member"), // member | instructor | admin
  name: text("name").notNull(),
  instructorId: text("instructor_id"), // null unless an instructor profile
  points: integer("points").notNull().default(0),
  // instructor profile fields (denormalized; null for members/admins)
  style: text("style"),
  city: text("city"),
  bio: text("bio"),
  rating: text("rating"),
  verified: boolean("verified").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const workshops = pgTable("workshops", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  instructor: text("instructor").notNull(),
  instructorId: text("instructor_id"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  venue: text("venue"),
  price: integer("price").notNull().default(0),
  spotsLeft: integer("spots_left").notNull().default(0),
  capacity: integer("capacity").notNull().default(25),
  startsAt: bigint("starts_at", { mode: "number" }), // epoch ms; null = undated
  createdAt: bigint("created_at", { mode: "number" }),
});

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  workshopId: text("workshop_id").notNull(),
  title: text("title").notNull(),
  instructor: text("instructor").notNull(),
  instructorId: text("instructor_id"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  price: integer("price").notNull().default(0),
  status: text("status").notNull().default("upcoming"),
  startsAt: bigint("starts_at", { mode: "number" }), // copied from workshop
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const tracks = pgTable("tracks", {
  id: text("id").primaryKey(),
  instructorId: text("instructor_id").notNull(),
  title: text("title").notNull(),
  artist: text("artist"),
  duration: text("duration"),
  mood: text("mood"),
  bpm: integer("bpm"),
  source: text("source"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const playlists = pgTable("playlists", {
  id: text("id").primaryKey(),
  instructorId: text("instructor_id").notNull(),
  name: text("name").notNull(),
  trackIds: jsonb("track_ids").notNull().default([]),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

// ---- features added for end-to-end functionality ----

// members following instructors (member portal "Follow")
export const follows = pgTable("follows", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  instructorId: text("instructor_id").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

// instructor payout requests + admin payout queue (no provider yet — records intent)
export const payouts = pgTable("payouts", {
  id: text("id").primaryKey(),
  instructorId: text("instructor_id").notNull(),
  instructorName: text("instructor_name"),
  amount: integer("amount").notNull().default(0),
  status: text("status").notNull().default("pending"), // pending | approved | settled
  note: text("note"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  settledAt: bigint("settled_at", { mode: "number" }),
});

// admin monthly choreography drops
export const contentDrops = pgTable("content_drops", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  note: text("note"),
  videosCount: integer("videos_count").notNull().default(0),
  audioCount: integer("audio_count").notNull().default(0),
  status: text("status").notNull().default("Planning"), // Live | In Review | Planning
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

// key/value app settings (commission split, payout cadence, …)
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});
