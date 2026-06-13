// Node-runtime auth helpers: bridges the edge-safe session JWT (lib/session)
// with the Node data store (lib/db). Server components and route handlers
// call getCurrentUser(); login/logout routes call the cookie helpers.

import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_MAX_AGE_S, signSession, verifySession } from "./session";
import { findUserById, publicUser } from "./db";

// Returns the public user record for the active session, or null.
export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const payload = await verifySession(token);
  if (!payload?.sub) return null;
  const user = findUserById(payload.sub);
  return publicUser(user);
}

// Builds the Set-Cookie options for a signed session token.
export async function sessionCookie(user) {
  const token = await signSession({
    sub: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    instructorId: user.instructorId || null,
  });
  return {
    name: SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_S,
    },
  };
}

export function clearedCookie() {
  return {
    name: SESSION_COOKIE,
    value: "",
    options: { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 },
  };
}

// Convenience for route handlers that must 401 unless a role matches.
export async function requireUser(roles = null) {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: "Not signed in." };
  if (roles && !roles.includes(user.role)) {
    return { user, error: "You don't have access to this." };
  }
  return { user, error: null };
}
