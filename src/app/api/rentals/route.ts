import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, getCustomerSession, getSession } from "@/lib/auth";
import { calculateRentalPrice, daysBetween } from "@/lib/utils";
import { getCustomerProfileByEmail } from "@/lib/customer-profile";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof Response) return auth;

  const rentals = await prisma.rental.findMany({
    include: { phone: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rentals);
}

export async function POST(request: Request) {
  try {
    // Wajib Login untuk Menghindari Pemesanan Iseng/Fiktif
    const [customer, adminSession] = await Promise.all([
      getCustomerSession(),
      getSession(),
    ]);

    if (!customer && !adminSession) {
      return NextResponse.json(
        {
          error:
            "Pemesanan gagal: Pelanggan wajib login akun Google terlebih dahulu untuk mencegah pemesanan fiktif.",
        },
        { status: 401 }
      );
    }

    // Wajib melengkapi data profil diri & foto KTP sebelum memesan
    if (customer) {
      const profile = await getCustomerProfileByEmail(customer.email);
      if (!profile || !profile.isCompleted) {
        return NextResponse.json(
          {
            error:
              "Profil Anda belum lengkap. Sesuai ketentuan, Anda wajib melengkapi data diri (Foto KTP, Nama, Alamat, TTL, No HP) sebelum memesan.",
          },
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const {
      phoneId,
      customerName,
      customerPhone,
      customerEmail,
      startDate,
      endDate,
      rentalPackage = "HARIAN",
      deliveryMethod = "PICKUP",
      deliveryAddress,
      paymentMethod = "CASH",
      notes,
    } = body;

    if (
      !phoneId ||
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        { error: "Lengkapi semua field wajib booking" },
        { status: 400 }
      );
    }

    const phone = await prisma.phone.findUnique({ where: { id: phoneId } });
    if (!phone || !phone.isActive) {
      return NextResponse.json({ error: "Gadget tidak ditemukan" }, { status: 404 });
    }

    if (phone.stock < 1) {
      return NextResponse.json({ error: "Stok gadget habis" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 });
    }

    if (end <= start) {
      return NextResponse.json(
        { error: "Tanggal selesai harus setelah tanggal mulai" },
        { status: 400 }
      );
    }

    const days = daysBetween(start, end);
    const { total: totalPrice } = calculateRentalPrice(
      phone.dailyPrice,
      days,
      rentalPackage as "HARIAN" | "MINGGUAN" | "BULANAN",
      phone.weeklyPrice,
      phone.monthlyPrice
    );

    // Masa kadaluarsa pembayaran: 24 jam dari pemesanan
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const rental = await prisma.$transaction(async (tx) => {
      const created = await tx.rental.create({
        data: {
          phoneId,
          customerName: String(customerName).trim(),
          customerPhone: String(customerPhone).trim(),
          customerEmail: String(customerEmail).trim(),
          startDate: start,
          endDate: end,
          rentalPackage: String(rentalPackage),
          deliveryMethod: String(deliveryMethod),
          deliveryAddress: deliveryAddress ? String(deliveryAddress).trim() : null,
          paymentMethod: paymentMethod === "QRIS" ? "QRIS" : "CASH",
          paymentStatus: "UNPAID",
          expiresAt,
          totalPrice,
          notes: notes ? String(notes).trim() : null,
          status: "PENDING",
        },
        include: { phone: true },
      });

      await tx.phone.update({
        where: { id: phoneId },
        data: { stock: { decrement: 1 } },
      });

      return created;
    });

    return NextResponse.json(rental, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat booking" }, { status: 500 });
  }
}
