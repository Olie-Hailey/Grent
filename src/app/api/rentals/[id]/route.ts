import { NextResponse } from "next/server";
import { RentalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const allowedStatuses = new Set<string>(Object.values(RentalStatus));

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const rental = await prisma.rental.findUnique({
      where: { id },
      include: { phone: true },
    });
    if (!rental) {
      return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(rental);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data rental" }, { status: 500 });
  }
}

// Customer / Admin Konfirmasi Pembayaran QRIS
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    if (body.action === "confirm_qris_payment") {
      const existing = await prisma.rental.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
      }

      const updated = await prisma.rental.update({
        where: { id },
        data: {
          paymentStatus: "PAID",
          status: "APPROVED",
        },
        include: { phone: true },
      });

      return NextResponse.json({
        ok: true,
        message: "Pembayaran QRIS berhasil diverifikasi",
        rental: updated,
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Gagal memproses pembayaran" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth instanceof Response) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const status = body.status as string | undefined;
    const paymentStatus = body.paymentStatus as string | undefined;
    const notes = typeof body.notes === "string" ? body.notes : undefined;

    const existing = await prisma.rental.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Rental tidak ditemukan" }, { status: 404 });
    }

    const dataToUpdate: { status?: RentalStatus; paymentStatus?: string; notes?: string } = {};

    if (notes !== undefined) {
      dataToUpdate.notes = notes;
    }

    if (paymentStatus === "PAID") {
      dataToUpdate.paymentStatus = "PAID";
      // Otomatis ubah status menjadi APPROVED (Dibayar) jika sebelumnya PENDING
      if (existing.status === "PENDING") {
        dataToUpdate.status = "APPROVED";
      }
    } else if (paymentStatus === "UNPAID") {
      dataToUpdate.paymentStatus = "UNPAID";
    }

    if (status) {
      if (!allowedStatuses.has(status)) {
        return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
      }
      dataToUpdate.status = status as RentalStatus;
      if (status === "APPROVED" || status === "ACTIVE") {
        dataToUpdate.paymentStatus = "PAID";
      }
    }

    const rental = await prisma.$transaction(async (tx) => {
      const updated = await tx.rental.update({
        where: { id },
        data: dataToUpdate,
        include: { phone: true },
      });

      const nextStatus = dataToUpdate.status || existing.status;
      const shouldRestock =
        (nextStatus === "CANCELLED" || nextStatus === "COMPLETED") &&
        existing.status !== "CANCELLED" &&
        existing.status !== "COMPLETED";

      if (shouldRestock) {
        await tx.phone.update({
          where: { id: existing.phoneId },
          data: { stock: { increment: 1 } },
        });
      }

      return updated;
    });

    return NextResponse.json(rental);
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui status rental" }, { status: 500 });
  }
}
