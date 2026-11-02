import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { getCustomerProfileByEmail, upsertCustomerProfile } from "@/lib/customer-profile";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customer = await getCustomerSession();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getCustomerProfileByEmail(customer.email);
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data profil" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const customer = await getCustomerSession();
    if (!customer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address, birthInfo, idCardUrl, avatarUrl } = body;

    const profile = await upsertCustomerProfile({
      email: customer.email,
      name: name || customer.name,
      phone,
      address,
      birthInfo,
      idCardUrl,
      avatarUrl: avatarUrl || customer.image || "",
    });

    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
