import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

function needsAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return true;
  }

  if (pathname === "/api/upload" && method === "POST") {
    return true;
  }

  if (pathname === "/api/phones" && method !== "GET") {
    return true;
  }

  if (pathname.startsWith("/api/phones/") && method !== "GET") {
    return true;
  }

  if (pathname === "/api/rentals" && method === "GET") {
    return true;
  }

  if (pathname.startsWith("/api/rentals/") && method === "PATCH") {
    return true;
  }

  return false;
}

export async function proxy(request: NextRequest) {
  if (!needsAuth(request)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (session) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/phones",
    "/api/phones/:path*",
    "/api/rentals",
    "/api/rentals/:path*",
    "/api/upload",
  ],
};
