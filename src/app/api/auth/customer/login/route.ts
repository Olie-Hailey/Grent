import { NextResponse } from "next/server";
import {
  CUSTOMER_COOKIE,
  createCustomerSessionToken,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "Customer Grent").trim();
    const image = body.image ? String(body.image) : undefined;
    const sub = body.sub ? String(body.sub) : `cust_${Date.now()}`;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email Google tidak valid" },
        { status: 400 },
      );
    }

    const token = await createCustomerSessionToken({
      role: "customer",
      sub,
      name,
      email,
      image,
    });

    const response = NextResponse.json({
      ok: true,
      customer: { name, email, image },
    });

    response.cookies.set(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses sesi login customer" },
      { status: 500 },
    );
  }
}
