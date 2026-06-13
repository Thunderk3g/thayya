import { NextResponse } from "next/server";
import { findUserByEmail, verifyPassword, publicUser } from "../../../../lib/db";
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
  const { email, password } = body || {};
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }
  const cookie = await sessionCookie(user);
  const res = NextResponse.json({ user: publicUser(user) });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
}
