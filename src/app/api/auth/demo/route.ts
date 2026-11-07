import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE, createCustomerSessionToken } from "@/lib/auth";
import { getCustomerProfileByEmail } from "@/lib/customer-profile";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") || "/katalog";

  const email = "rafierbakti17@gmail.com";
  const name = "Rafi Erbakti";
  const image = "https://api.dicebear.com/7.x/avataaars/svg?seed=RafiErbakti&backgroundColor=1a73e8";

  // Pastikan profil terverifikasi e-KTP sudah aktif di database
  await getCustomerProfileByEmail(email);

  const token = await createCustomerSessionToken({
    role: "customer",
    sub: "tester_rafi_erbakti",
    name,
    email,
    image,
  });

  const redirectUrl = new URL(next.startsWith("/") ? next : "/katalog", request.url);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 hari
  });

  return response;
}
