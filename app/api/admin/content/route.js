import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { listContentDrops, createContentDrop } from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireUser(["admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  return NextResponse.json({ drops: await listContentDrops() });
}

export async function POST(req) {
  const { error } = await requireUser(["admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, note, videosCount, audioCount, status } = body || {};
  if (!name || !String(name).trim()) {
    return NextResponse.json({ error: "A drop name is required." }, { status: 400 });
  }

  const drop = await createContentDrop({ name, note, videosCount, audioCount, status });
  return NextResponse.json({ drop });
}
