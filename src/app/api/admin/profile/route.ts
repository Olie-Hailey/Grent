import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { getAdminProfile, updateAdminProfile } from "@/lib/admin-profile";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAdminApi();
    if (auth instanceof Response) return auth;

    const profile = await getAdminProfile(auth.username);
    return NextResponse.json({ ok: true, profile });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil profil admin" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminApi();
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { name, email, phone, role, branch, avatarUrl } = body;

    const updated = await updateAdminProfile({
      username: auth.username,
      name,
      email,
      phone,
      role,
      branch,
      avatarUrl,
    });

    return NextResponse.json({ ok: true, profile: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memperbarui profil admin" },
      { status: 500 }
    );
  }
}
