import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  isValidStaffAdminLogin,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!isValidStaffAdminLogin(username, password)) {
      return NextResponse.json(
        { error: "Email Staff atau password salah. Pastikan menggunakan akun @staffadmin.id" },
        { status: 401 },
      );
    }

    const token = await createSessionToken({
      role: "admin",
      username,
    });

    const response = NextResponse.json({ ok: true, username });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Gagal login admin" }, { status: 500 });
  }
}
