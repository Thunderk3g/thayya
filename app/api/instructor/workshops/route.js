import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { listWorkshopsForInstructor, createWorkshop } from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { user, error } = await requireUser(["instructor", "admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const instructorId = user.instructorId;
  if (!instructorId) return NextResponse.json({ error: "No instructor profile." }, { status: 403 });

  return NextResponse.json({ workshops: await listWorkshopsForInstructor(instructorId) });
}

export async function POST(req) {
  const { user, error } = await requireUser(["instructor", "admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const instructorId = user.instructorId;
  if (!instructorId) return NextResponse.json({ error: "No instructor profile." }, { status: 403 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { title, date, time, venue, price, capacity, startsAt } = body || {};
  if (!title || !String(title).trim()) {
    return NextResponse.json({ error: "A workshop title is required." }, { status: 400 });
  }
  const priceNum = Number(price);
  if (!Number.isFinite(priceNum) || priceNum < 0) {
    return NextResponse.json({ error: "A valid price is required." }, { status: 400 });
  }

  // Compute a real future timestamp. Accept an explicit startsAt (ms) from the
  // client; otherwise derive one from an ISO/date string + optional time.
  let when = Number(startsAt);
  if (!Number.isFinite(when)) {
    const parsed = date ? Date.parse(`${date}${time ? ` ${time}` : ""}`) : NaN;
    when = Number.isFinite(parsed) ? parsed : Date.now() + 7 * 24 * 60 * 60 * 1000;
  }

  const workshop = await createWorkshop(instructorId, {
    title: String(title).trim(),
    date: date ? String(date) : "",
    time: time ? String(time) : "",
    venue,
    price: priceNum,
    capacity,
    startsAt: when,
  });
  return NextResponse.json({ workshop });
}
