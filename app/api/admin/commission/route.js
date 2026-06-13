import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { getCommissionConfig, updateCommissionSplit } from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireUser(["admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  return NextResponse.json({ config: await getCommissionConfig() });
}

export async function PATCH(req) {
  const { error } = await requireUser(["admin"]);
  if (error) return NextResponse.json({ error }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const split = await updateCommissionSplit({
      instructor: body?.instructor,
      platform: body?.platform,
    });
    return NextResponse.json({ split });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Could not update the split." }, { status: 400 });
  }
}
