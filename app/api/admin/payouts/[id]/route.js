import { NextResponse } from "next/server";
import { requireUser } from "../../../../../lib/auth";
import { transitionPayout } from "../../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  const { error } = await requireUser(["admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const to = body?.to;
  if (!["approved", "settled"].includes(to)) {
    return NextResponse.json({ error: "Unknown target status." }, { status: 400 });
  }

  try {
    const payout = await transitionPayout(id, to);
    if (!payout) return NextResponse.json({ error: "Payout not found." }, { status: 404 });
    return NextResponse.json({ payout });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Invalid transition." }, { status: 400 });
  }
}
