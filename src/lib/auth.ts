import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "irent_session";
export const CUSTOMER_COOKIE = "grent_customer_session";

export type SessionPayload = {
  role: "admin";
  username: string;
};

export type CustomerPayload = {
  role: "customer";
  sub: string;
  name: string;
  email: string;
  image?: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET harus di-set (min. 16 karakter)");
  }
  return new TextEncoder().encode(secret);
}

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || "admin@staffadmin.id",
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin123",
  };
}

export function isValidStaffAdminLogin(identifier: string, pass: string): boolean {
  const creds = getAdminCredentials();
  if (pass !== creds.password) return false;

  const clean = identifier.trim().toLowerCase();
  if (clean === creds.email.toLowerCase() || clean === creds.username.toLowerCase()) {
    return true;
  }

  // Izinkan format email staffadmin (misal: budi@staffadmin.id atau @staffadmin.grent.com)
  if (clean.endsWith("@staffadmin.id") || clean.endsWith("@staffadmin.com") || clean.endsWith("@staffadmin.grent.id")) {
    return true;
  }

  return false;
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "admin" || typeof payload.username !== "string") {
      return null;
    }
    return { role: "admin", username: payload.username };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdminApi(): Promise<SessionPayload | Response> {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

// ================= CUSTOMER GOOGLE AUTH =================

export async function createCustomerSessionToken(payload: CustomerPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyCustomerSessionToken(token: string): Promise<CustomerPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "customer" || typeof payload.email !== "string") {
      return null;
    }
    return {
      role: "customer",
      sub: String(payload.sub || ""),
      name: String(payload.name || "Customer"),
      email: String(payload.email || ""),
      image: typeof payload.image === "string" ? payload.image : undefined,
    };
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerSessionToken(token);
}
