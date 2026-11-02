import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") || "/";

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    // Belum dikonfigurasi Google Client ID di .env
    return NextResponse.json({
      configured: false,
      message: "GOOGLE_CLIENT_ID belum diset di .env",
    });
  }

  const redirectUri = `${new URL(request.url).origin}/api/auth/google/callback`;
  const state = Buffer.from(JSON.stringify({ next })).toString("base64url");

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "online");
  googleAuthUrl.searchParams.set("state", state);
  googleAuthUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(googleAuthUrl.toString());
}
