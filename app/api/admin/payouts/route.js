import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { listPayouts } from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireUser(["admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  return NextResponse.json({ payouts: await listPayouts() });
}
