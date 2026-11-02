import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const auth = await requireAdminApi();
    if (auth instanceof Response) return auth;

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File gambar tidak ditemukan" }, { status: 400 });
    }

    const url = await saveUploadedImage(file);
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal mengunggah foto profil admin" },
      { status: 500 }
    );
  }
}
