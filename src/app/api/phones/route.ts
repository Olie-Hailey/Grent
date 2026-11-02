import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

export async function GET() {
  const phones = await prisma.phone.findMany({
    where: { isActive: true },
    orderBy: { dailyPrice: "desc" },
  });

  return NextResponse.json(phones);
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof Response) return auth;

  try {
    const contentType = request.headers.get("content-type") || "";
    let model: string;
    let category = "Smartphone";
    let storage: string;
    let color: string;
    let dailyPrice: number;
    let weeklyPrice: number | null = null;
    let monthlyPrice: number | null = null;
    let stock: number;
    let description: string;
    let imageEmoji = "📱";
    let imageUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      model = String(form.get("model") || "");
      category = String(form.get("category") || "Smartphone");
      storage = String(form.get("storage") || "");
      color = String(form.get("color") || "");
      dailyPrice = Number(form.get("dailyPrice"));
      weeklyPrice = form.get("weeklyPrice") ? Number(form.get("weeklyPrice")) : null;
      monthlyPrice = form.get("monthlyPrice") ? Number(form.get("monthlyPrice")) : null;
      stock = Number(form.get("stock") ?? 1);
      description = String(form.get("description") || "");
      imageEmoji = String(form.get("imageEmoji") || "📱");

      const file = form.get("image");
      if (file instanceof File && file.size > 0) {
        imageUrl = await saveUploadedImage(file);
      }
    } else {
      const body = await request.json();
      model = String(body.model || "");
      category = String(body.category || "Smartphone");
      storage = String(body.storage || "");
      color = String(body.color || "");
      dailyPrice = Number(body.dailyPrice);
      weeklyPrice = body.weeklyPrice != null ? Number(body.weeklyPrice) : null;
      monthlyPrice = body.monthlyPrice != null ? Number(body.monthlyPrice) : null;
      stock = Number(body.stock ?? 1);
      description = String(body.description || "");
      imageEmoji = String(body.imageEmoji || "📱");
      imageUrl = body.imageUrl ? String(body.imageUrl) : null;
    }

    if (!model || !storage || !color || Number.isNaN(dailyPrice) || !description) {
      return NextResponse.json(
        { error: "Field wajib: model, storage, color, dailyPrice, description" },
        { status: 400 },
      );
    }

    const phone = await prisma.phone.create({
      data: {
        model,
        category,
        storage,
        color,
        dailyPrice,
        weeklyPrice: weeklyPrice && !Number.isNaN(weeklyPrice) ? weeklyPrice : null,
        monthlyPrice: monthlyPrice && !Number.isNaN(monthlyPrice) ? monthlyPrice : null,
        stock: Number.isNaN(stock) ? 1 : stock,
        description,
        imageEmoji,
        imageUrl,
      },
    });

    return NextResponse.json(phone, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menambah iPhone";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
