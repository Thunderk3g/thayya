import { NextResponse } from "next/server";
import { createUser, publicUser } from "../../../../lib/db";
import { sessionCookie } from "../../../../lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { email, password, name, role } = body || {};
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (String(password).length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }
  // Only member / instructor accounts are self-serve; admin is provisioned.
  const safeRole = role === "instructor" ? "instructor" : "member";
  let user;
  try {
    user = createUser({ email, password, name, role: safeRole });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Could not create account." }, { status: 409 });
  }
  const cookie = await sessionCookie(user);
  const res = NextResponse.json({ user: publicUser(user) });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
