import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import {
  listPayoutsForInstructor,
  createPayout,
  getInstructorEarnings,
} from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { user, error } = await requireUser(["instructor", "admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const instructorId = user.instructorId;
  if (!instructorId) return NextResponse.json({ error: "No instructor profile." }, { status: 403 });

  return NextResponse.json({ payouts: await listPayoutsForInstructor(instructorId) });
}

export async function POST(req) {
  const { user, error } = await requireUser(["instructor", "admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const instructorId = user.instructorId;
  if (!instructorId) return NextResponse.json({ error: "No instructor profile." }, { status: 403 });

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Never trust the client amount: derive from the server-computed balance and
  // cap any requested amount to it.
  const earnings = await getInstructorEarnings(instructorId);
  const requested = Number(body?.amount);
  const amount =
    Number.isFinite(requested) && requested > 0
      ? Math.min(requested, earnings.balance)
      : earnings.balance;
  if (amount <= 0) {
    return NextResponse.json({ error: "No balance available to withdraw." }, { status: 400 });
  }

  const payout = await createPayout(instructorId, amount);
  return NextResponse.json({ payout });
}
