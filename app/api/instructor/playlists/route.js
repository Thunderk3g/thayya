import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { listPlaylists, createPlaylist } from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { user, error } = await requireUser(["instructor", "admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });
  const instructorId = user.instructorId;
  if (!instructorId) return NextResponse.json({ error: "No instructor profile." }, { status: 403 });

  return NextResponse.json({ playlists: listPlaylists(instructorId) });
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

  const { name, trackIds } = body || {};
  const playlist = createPlaylist(instructorId, { name, trackIds });
  return NextResponse.json({ playlist });
}
