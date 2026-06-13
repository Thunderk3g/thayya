export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import {
  followInstructor,
  unfollowInstructor,
  listFollows,
} from "../../../../lib/db";

export async function GET() {
  const { user, error } = await requireUser(["member", "admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });
  return NextResponse.json({ follows: await listFollows(user.id) });
}

export async function POST(req) {
  const { user, error } = await requireUser(["member", "admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { instructorId } = body || {};
  if (!instructorId) {
    return NextResponse.json({ error: "instructorId is required." }, { status: 400 });
  }
  const added = await followInstructor(user.id, instructorId);
  return NextResponse.json({ following: true, added });
}

export async function DELETE(req) {
  const { user, error } = await requireUser(["member", "admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { instructorId } = body || {};
  if (!instructorId) {
    return NextResponse.json({ error: "instructorId is required." }, { status: 400 });
  }
  const removed = await unfollowInstructor(user.id, instructorId);
  return NextResponse.json({ following: false, removed });
}
