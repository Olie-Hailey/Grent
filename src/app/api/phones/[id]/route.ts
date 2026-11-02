import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const phone = await prisma.phone.findUnique({ where: { id } });

  if (!phone || !phone.isActive) {
    return NextResponse.json({ error: "iPhone tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(phone);
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof Response) return auth;

  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const data: Record<string, string | number | boolean | null> = {};

      for (const key of ["model", "category", "storage", "color", "description", "imageEmoji"] as const) {
        const value = form.get(key);
        if (value != null && String(value) !== "") {
          data[key] = String(value);
        }
      }
      if (form.get("dailyPrice") != null) data.dailyPrice = Number(form.get("dailyPrice"));
      if (form.get("weeklyPrice") != null) data.weeklyPrice = form.get("weeklyPrice") ? Number(form.get("weeklyPrice")) : null;
      if (form.get("monthlyPrice") != null) data.monthlyPrice = form.get("monthlyPrice") ? Number(form.get("monthlyPrice")) : null;
      if (form.get("stock") != null) data.stock = Number(form.get("stock"));
      if (form.get("isActive") != null) data.isActive = String(form.get("isActive")) === "true";

      const file = form.get("image");
      if (file instanceof File && file.size > 0) {
        data.imageUrl = await saveUploadedImage(file);
      }

      const phone = await prisma.phone.update({ where: { id }, data });
      return NextResponse.json(phone);
    }

    const body = await request.json();
    const phone = await prisma.phone.update({
      where: { id },
      data: {
        model: body.model !== undefined ? String(body.model) : undefined,
        category: body.category !== undefined ? String(body.category) : undefined,
        storage: body.storage !== undefined ? String(body.storage) : undefined,
        color: body.color !== undefined ? String(body.color) : undefined,
        dailyPrice:
          body.dailyPrice !== undefined ? Number(body.dailyPrice) : undefined,
        weeklyPrice:
          body.weeklyPrice !== undefined ? (body.weeklyPrice ? Number(body.weeklyPrice) : null) : undefined,
        monthlyPrice:
          body.monthlyPrice !== undefined ? (body.monthlyPrice ? Number(body.monthlyPrice) : null) : undefined,
        stock: body.stock !== undefined ? Number(body.stock) : undefined,
        description:
          body.description !== undefined ? String(body.description) : undefined,
        imageEmoji:
          body.imageEmoji !== undefined ? String(body.imageEmoji) : undefined,
        imageUrl: body.imageUrl !== undefined ? String(body.imageUrl) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      },
    });

    return NextResponse.json(phone);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui gadget";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof Response) return auth;

  try {
    const { id } = await params;
    const phone = await prisma.phone.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json(phone);
  } catch {
    return NextResponse.json({ error: "Gagal menghapus iPhone" }, { status: 500 });
  }
}
