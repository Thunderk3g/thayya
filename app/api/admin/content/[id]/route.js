import { NextResponse } from "next/server";
import { requireUser } from "../../../../../lib/auth";
import { updateContentDrop, deleteContentDrop } from "../../../../../lib/db";

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

  const drop = await updateContentDrop(id, body || {});
  if (!drop) return NextResponse.json({ error: "Drop not found." }, { status: 404 });

  return NextResponse.json({ drop });
}

export async function DELETE(req, { params }) {
  const { error } = await requireUser(["admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { id } = await params;
  const removed = await deleteContentDrop(id);
  if (!removed) return NextResponse.json({ error: "Drop not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
