import { NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE,
  createCustomerSessionToken,
} from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  let nextUrl = "/";
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
      if (decoded.next && typeof decoded.next === "string" && decoded.next.startsWith("/")) {
        nextUrl = decoded.next;
      }
    } catch {
      // ignore state parse error
    }
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=GoogleAuthFailed", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=GoogleNotConfigured", request.url));
  }

  try {
    const origin = new URL(request.url).origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    // 1. Tukar auth code dengan access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      throw new Error("Gagal menukar kode otorisasi Google");
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Ambil profil user Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      throw new Error("Gagal mengambil profil akun Google");
    }

    const profile = await userRes.json();
    // profile contains: sub, name, email, picture, etc.

    const sessionToken = await createCustomerSessionToken({
      role: "customer",
      sub: profile.sub || `google_${Date.now()}`,
      name: profile.name || "Customer Grent",
      email: profile.email,
      image: profile.picture,
    });

    const response = NextResponse.redirect(new URL(nextUrl, request.url));
    response.cookies.set(CUSTOMER_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=GoogleCallbackError", request.url));
  }
}
