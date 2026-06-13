export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { cancelBooking } from "../../../../lib/db";

export async function DELETE(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { id } = await params;
  const ok = await cancelBooking(user.id, id);
  if (!ok) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  return NextResponse.json({ cancelled: true });
}
