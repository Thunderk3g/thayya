import { NextResponse } from "next/server";
import { requireUser } from "../../../../../lib/auth";
import { updatePlaylist, deletePlaylist } from "../../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  const { user, error } = await requireUser(["instructor", "admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const instructorId = user.instructorId;
  if (!instructorId) return NextResponse.json({ error: "No instructor profile." }, { status: 403 });

  const { id } = await params;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, trackIds } = body || {};
  const playlist = updatePlaylist(instructorId, id, { name, trackIds });
  if (!playlist) return NextResponse.json({ error: "Playlist not found." }, { status: 404 });

  return NextResponse.json({ playlist });
}

export async function DELETE(req, { params }) {
  const { user, error } = await requireUser(["instructor", "admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const instructorId = user.instructorId;
  if (!instructorId) return NextResponse.json({ error: "No instructor profile." }, { status: 403 });

  const { id } = await params;
  const removed = deletePlaylist(instructorId, id);
  if (!removed) return NextResponse.json({ error: "Playlist not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
