// Route protection for the portals. Runs on the edge runtime, so it only
// verifies the session JWT (lib/session is jose-only) and reads the role
// claim — it never touches the data store.

import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/session";

// path prefix -> roles allowed
const GUARDS = [
  { prefix: "/member", roles: ["member", "admin"] },
  { prefix: "/instructor", roles: ["instructor", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
];

const HOME_FOR = {
  member: "/member/discover",
  instructor: "/instructor/today",
  admin: "/admin/overview",
};

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const guard = GUARDS.find((g) => pathname === g.prefix || pathname.startsWith(g.prefix + "/"));
  if (!guard) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  // not signed in → login, remembering where they were headed
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // signed in but wrong role → send to their own portal home
  if (!guard.roles.includes(session.role)) {
    const url = req.nextUrl.clone();
    url.pathname = HOME_FOR[session.role] || "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/member/:path*", "/instructor/:path*", "/admin/:path*"],
};
