import { NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { listBookingsForUser, createBooking } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return NextResponse.json({ error }, { status: 401 });
  return NextResponse.json({ bookings: listBookingsForUser(user.id) });
}

export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return NextResponse.json({ error }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { workshopId } = body || {};
  if (!workshopId) {
    return NextResponse.json({ error: "workshopId is required." }, { status: 400 });
  }
  try {
    const { booking, alreadyBooked } = createBooking({ userId: user.id, workshopId });
    return NextResponse.json({ booking, alreadyBooked });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Could not book." }, { status: 400 });
  }
}
