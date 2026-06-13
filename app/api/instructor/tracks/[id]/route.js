import { NextResponse } from "next/server";
import { requireUser } from "../../../../../lib/auth";
import { removeTrack } from "../../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req, { params }) {
  const { user, error } = await requireUser(["instructor", "admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const instructorId = user.instructorId;
  if (!instructorId) return NextResponse.json({ error: "No instructor profile." }, { status: 403 });

  const { id } = await params;
  const removed = removeTrack(instructorId, id);
  if (!removed) return NextResponse.json({ error: "Track not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
