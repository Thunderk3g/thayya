// Edge-safe session helpers — JWT only, no Node built-ins, so this module
// can be imported from middleware (edge runtime) AND from Node route
// handlers. Password hashing and the data store live in lib/auth.js /
// lib/db.js, which are Node-only.

import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "thayya_session";
const ISSUER = "thayya";
const MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    // A missing secret must fail loudly — never sign/verify with a blank key.
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(s);
}

// payload: { sub (userId), role, name, email, instructorId? }
export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_S}s`)
    .sign(secret());
}

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: ISSUER });
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE_S = MAX_AGE_S;
