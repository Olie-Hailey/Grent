import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/auth";
import { formatIDR } from "@/lib/utils";
import { PhoneImage } from "@/components/PhoneImage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pesanan Saya — Grent Gadget Rental",
  description: "Daftar riwayat dan status aktif pemesanan sewa gadget Anda di Grent.",
};

export default async function PesananSayaPage() {
  const customer = await getCustomerSession();

  if (!customer) {
    redirect("/login?next=/pesanan-saya");
  }

  const rentals = await prisma.rental.findMany({
    where: { customerEmail: customer.email },
    include: { phone: true },
    orderBy: { createdAt: "desc" },
  });

  const activeRentals = rentals.filter(
    (r) => r.status === "ACTIVE" || r.status === "APPROVED" || r.status === "PENDING"
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-6 mb-8">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
            Akun Pelanggan Terverifikasi
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--ink)] mt-1.5">
            Pesanan &amp; Riwayat Sewa Saya
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Pantau status pesanan, sisa masa sewa unit gadget, dan buka kembali invoice digital Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/katalog"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            + Sewa Gadget Baru
          </Link>
          <Link
            href="/profile"
            className="px-3.5 py-2 border border-[var(--line)] bg-white hover:bg-gray-50 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Profil (e-KTP)
          </Link>
        </div>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-[var(--line)] shadow-xs">
          <span className="text-[var(--muted)]">Total Pesanan:</span>
          <p className="text-xl sm:text-2xl font-bold text-[var(--ink)] mt-1">{rentals.length} Transaksi</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[var(--line)] shadow-xs">
          <span className="text-emerald-700 font-semibold">Pesanan Aktif:</span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">{activeRentals.length} Unit</p>
        </div>
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white border border-[var(--line)] shadow-xs">
          <span className="text-[var(--muted)]">Email Akun:</span>
          <p className="text-xs font-bold text-[var(--ink)] truncate mt-1">{customer.email}</p>
        </div>
      </div>

      {/* Empty State jika belum ada pesanan */}
      {rentals.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[var(--line)] rounded-2xl shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3 font-bold text-lg">
            G
          </div>
          <h2 className="text-base font-bold text-[var(--ink)]">Belum Ada Riwayat Sewa</h2>
          <p className="text-xs text-[var(--muted)] max-w-md mx-auto mt-1 mb-5 leading-relaxed">
            Anda belum pernah melakukan pemesanan gadget. Jelajahi katalog kami untuk menemukan laptop, smartphone, atau tablet siap pakai untuk kebutuhan Anda.
          </p>
          <Link
            href="/katalog"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition inline-block"
          >
            Lihat Katalog Gadget Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rentals.map((rental) => {
            const startDate = new Date(rental.startDate);
            const endDate = new Date(rental.endDate);
            const now = new Date();

            // Hitung sisa hari sewa
            const diffMs = endDate.getTime() - now.getTime();
            const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            let statusLabel = "Menunggu Konfirmasi";
            let statusBadge = "bg-amber-100 text-amber-800";

            if (rental.status === "APPROVED") {
              statusLabel = "Disetujui / Siap Ambil";
              statusBadge = "bg-emerald-100 text-emerald-800";
            } else if (rental.status === "ACTIVE") {
              statusLabel = "Sedang Digunakan";
              statusBadge = "bg-indigo-100 text-indigo-800";
            } else if (rental.status === "COMPLETED") {
              statusLabel = "Selesai (Sudah Dikembalikan)";
              statusBadge = "bg-slate-100 text-slate-700";
            } else if (rental.status === "CANCELLED") {
              statusLabel = "Dibatalkan";
              statusBadge = "bg-rose-100 text-rose-700";
            }

            return (
              <div
                key={rental.id}
                className="bg-white border border-[var(--line)] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[var(--line)]/70">
                  <div className="flex items-center gap-3.5">
                    <div className="h-16 w-16 rounded-xl bg-slate-50 border border-[var(--line)] flex items-center justify-center overflow-hidden shrink-0">
                      <PhoneImage
                        imageUrl={rental.phone.imageUrl}
                        alt={rental.phone.model}
                        className="h-14 object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] bg-slate-100 px-2 py-0.5 rounded">
                          {rental.phone.category || "Gadget"}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-[var(--ink)] mt-1">
                        {rental.phone.model}
                      </h3>
                      <p className="text-xs text-[var(--muted)]">
                        {rental.phone.storage} · {rental.phone.color}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[11px] text-[var(--muted)]">Total Biaya Sewa:</span>
                    <p className="text-lg font-black text-slate-900 mt-0.5">
                      {formatIDR(rental.totalPrice)}
                    </p>
                    <div className="mt-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          rental.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {rental.paymentMethod || "CASH"} — {rental.paymentStatus === "PAID" ? "Lunas" : "Belum Bayar di Kasir"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[var(--muted)]">
                  <div>
                    <span className="font-semibold text-[var(--ink)] block">Periode Sewa:</span>
                    <p className="mt-0.5">
                      {startDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} –{" "}
                      {endDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Paket: {rental.rentalPackage || "HARIAN"}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-[var(--ink)] block">Metode Serah Terima:</span>
                    <p className="mt-0.5">
                      {rental.deliveryMethod === "DELIVERY"
                        ? `Antar ke Alamat: ${rental.deliveryAddress || "-"}`
                        : "Ambil Sendiri di Toko (Pickup)"}
                    </p>
                    {rental.status === "ACTIVE" && (
                      <p className="mt-1 text-[11px] font-bold text-indigo-700">
                        {daysLeft > 0 ? `Sisa Waktu Sewa: ${daysLeft} Hari Lagi` : "Masa Sewa Berakhir Hari Ini"}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right flex sm:flex-col justify-end items-end gap-2 pt-2 sm:pt-0">
                    <Link
                      href={`/invoice/${rental.id}`}
                      className="px-4 py-2 border border-slate-300 hover:border-slate-800 text-[var(--ink)] text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Lihat Lembar Invoice</span>
                      <span>↗</span>
                    </Link>
                  </div>
                </div>

                {rental.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
                    Catatan: {rental.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
