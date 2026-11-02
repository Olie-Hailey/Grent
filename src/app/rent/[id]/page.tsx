import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/BookingForm";
import { PhoneImage } from "@/components/PhoneImage";
import { prisma } from "@/lib/prisma";
import { formatIDR } from "@/lib/utils";
import { getCustomerSession, getSession } from "@/lib/auth";
import { getCustomerProfileByEmail } from "@/lib/customer-profile";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function RentPage({ params }: Props) {
  const { id } = await params;
  const [phone, customer, session, activeBookings] = await Promise.all([
    prisma.phone.findUnique({ where: { id } }),
    getCustomerSession(),
    getSession(),
    prisma.rental.findMany({
      where: {
        phoneId: id,
        status: { in: ["PENDING", "APPROVED", "ACTIVE"] },
        endDate: { gte: new Date() },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
      },
      orderBy: { startDate: "asc" },
    }),
  ]);

  if (!phone || !phone.isActive) {
    notFound();
  }

  const profile = customer ? await getCustomerProfileByEmail(customer.email) : null;

  const bookedRanges = activeBookings.map((b) => ({
    startDate: b.startDate.toISOString().slice(0, 10),
    endDate: b.endDate.toISOString().slice(0, 10),
  }));

  const weeklyRate =
    phone.weeklyPrice || Math.round(phone.dailyPrice * 7 * 0.85);
  const monthlyRate =
    phone.monthlyPrice || Math.round(phone.dailyPrice * 30 * 0.65);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[0.9fr_1.1fr]">
      {/* Kolom Kiri: Detail Gadget */}
      <section>
        <Link
          href="/katalog"
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
        >
          ← Kembali ke katalog gadget
        </Link>

        <div className="mt-5 border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm rounded-2xl">
          <div className="mb-5 overflow-hidden">
            <PhoneImage
              imageUrl={phone.imageUrl}
              alt={phone.model}
              className="h-48"
            />
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="bg-[#eef2f5] px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)] rounded-md">
              {phone.category || "Gadget"}
            </span>
            <span className="text-xs font-semibold text-[var(--accent)]">
              Stok Tersedia: {phone.stock} Unit
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--ink)]">
            {phone.model}
          </h1>

          <p className="mt-1 font-medium text-sm text-[var(--muted)]">
            {phone.storage} · {phone.color}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            {phone.description}
          </p>

          {/* Pricing Breakdown Card */}
          <div className="mt-6 rounded-xl border border-[var(--line)] bg-[#f8fafc] p-4 text-xs space-y-2">
            <p className="font-semibold text-[var(--ink)] uppercase tracking-wider text-[11px]">
              Pilihan Tarif Sewa Fleksibel:
            </p>
            <div className="flex justify-between items-center py-1 border-b border-[var(--line)]/60">
              <span className="text-[var(--muted)]">Paket Harian:</span>
              <strong className="text-sm text-[var(--ink)]">
                {formatIDR(phone.dailyPrice)}
                <span className="text-xs font-normal text-[var(--muted)]"> /hari</span>
              </strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[var(--line)]/60 text-emerald-700">
              <span>Paket Mingguan (Hemat ~15%):</span>
              <strong className="text-sm">
                {formatIDR(weeklyRate)}
                <span className="text-xs font-normal"> /minggu</span>
              </strong>
            </div>
            <div className="flex justify-between items-center py-1 text-indigo-700">
              <span>Paket Bulanan (Hemat ~35%):</span>
              <strong className="text-sm">
                {formatIDR(monthlyRate)}
                <span className="text-xs font-normal"> /bulan</span>
              </strong>
            </div>
          </div>

          {/* Syarat Singkat */}
          <div className="mt-5 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)] space-y-1.5">
            <p className="font-semibold text-[var(--ink)]">Jaminan &amp; Fasilitas:</p>
            <p>• e-KTP asli sebagai jaminan sewa (aman &amp; terpercaya)</p>
            <p>• Uang deposit dikembalikan 100% setelah unit kembali</p>
            <p>• Siap pakai (baterai terisi, OS bersih, QC lolos)</p>
            <p>• Tersedia layanan antar-jemput ke alamat rumah / kantor</p>
          </div>
        </div>
      </section>

      {/* Kolom Kanan: Form Booking */}
      <section>
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--ink)]">
          Formulir Booking Gadget
        </h2>
        <BookingForm
          phone={phone}
          initialCustomer={customer}
          initialProfile={profile}
          isAdmin={Boolean(session)}
          bookedRanges={bookedRanges}
        />
      </section>
    </div>
  );
}
