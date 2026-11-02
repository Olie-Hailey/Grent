"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatIDR, WHATSAPP_NUMBER } from "@/lib/utils";

export type StoredRental = {
  id: string;
  gadgetModel: string;
  category?: string;
  storage?: string;
  color?: string;
  startDate: string;
  endDate: string;
  totalPrice?: number;
  customerName?: string;
  createdAt?: string;
  status?: string;
};

export function ActiveRentalNote() {
  const [rental, setRental] = useState<StoredRental | null>(null);
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());
  const [showCheckInput, setShowCheckInput] = useState(false);
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Interval detak waktu realtime setiap 1 detik (1000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function loadRentalFromStorage() {
    try {
      const saved = localStorage.getItem("grent_active_rental");
      if (saved) {
        setRental(JSON.parse(saved));
      } else {
        setRental(null);
      }
    } catch {
      setRental(null);
    }
  }

  useEffect(() => {
    setMounted(true);
    loadRentalFromStorage();

    // Sinkronisasi otomatis jika pelanggan telah login dan memiliki pesanan aktif di database
    fetch("/api/auth/customer/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.activeRental) {
          const ar = data.activeRental;
          const synced: StoredRental = {
            id: ar.id,
            gadgetModel: ar.phone?.model || "Gadget",
            category: ar.phone?.category || "Gadget",
            storage: ar.phone?.storage,
            color: ar.phone?.color,
            startDate: new Date(ar.startDate).toISOString().slice(0, 10),
            endDate: new Date(ar.endDate).toISOString().slice(0, 10),
            totalPrice: ar.totalPrice,
            customerName: ar.customerName,
            createdAt: ar.createdAt,
            status: ar.status,
          };
          localStorage.setItem("grent_active_rental", JSON.stringify(synced));
          setRental(synced);
        }
      })
      .catch(() => {});

    const handleStorageChange = () => loadRentalFromStorage();
    window.addEventListener("grent_rental_updated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("grent_rental_updated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Jika rental yang tersimpan belum memiliki timestamp createdAt yang presisi, fetch otomatis dari API
  useEffect(() => {
    if (rental?.id && !rental.createdAt) {
      fetch(`/api/rentals/${rental.id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && data.createdAt) {
            const updated: StoredRental = {
              ...rental,
              createdAt: data.createdAt,
              totalPrice: data.totalPrice,
              status: data.status,
            };
            localStorage.setItem("grent_active_rental", JSON.stringify(updated));
            setRental(updated);
          }
        })
        .catch(() => {});
    }
  }, [rental]);

  async function handleLookupBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingIdInput.trim()) return;

    setCheckLoading(true);
    setCheckError(null);

    try {
      const res = await fetch(`/api/rentals/${bookingIdInput.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "ID Booking tidak ditemukan");
      }

      const newRental: StoredRental = {
        id: data.id,
        gadgetModel: data.phone?.model || "Gadget",
        category: data.phone?.category || "Gadget",
        storage: data.phone?.storage,
        color: data.phone?.color,
        startDate: new Date(data.startDate).toISOString().slice(0, 10),
        endDate: new Date(data.endDate).toISOString().slice(0, 10),
        totalPrice: data.totalPrice,
        customerName: data.customerName,
        createdAt: data.createdAt,
        status: data.status,
      };

      localStorage.setItem("grent_active_rental", JSON.stringify(newRental));
      setRental(newRental);
      setShowCheckInput(false);
      setBookingIdInput("");
    } catch (err) {
      setCheckError(err instanceof Error ? err.message : "Gagal mengecek booking");
    } finally {
      setCheckLoading(false);
    }
  }

  function handleSetDemoRental() {
    const today = new Date();
    const end = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 hari dari sekarang

    const demo: StoredRental = {
      id: "DEMO-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
      gadgetModel: "MacBook Pro 14\" M3 Pro",
      category: "Laptop",
      storage: "18GB RAM · 512GB SSD",
      color: "Space Black",
      startDate: today.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      totalPrice: 1000000,
      customerName: "Pelanggan Grent",
      createdAt: today.toISOString(),
      status: "APPROVED",
    };

    localStorage.setItem("grent_active_rental", JSON.stringify(demo));
    setRental(demo);
  }

  function handleClearRental() {
    localStorage.removeItem("grent_active_rental");
    setRental(null);
    setShowDetails(false);
  }

  if (!mounted) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 animate-pulse">
        <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-72 bg-gray-100 rounded"></div>
      </div>
    );
  }

  // Hitung sisa waktu sewa secara REALTIME sejak waktu pemesanan (createdAt)
  let daysLeft = 0;
  let hoursLeft = 0;
  let minutesLeft = 0;
  let secondsLeft = 0;
  let isExpired = false;
  let formattedEndDate = "";
  let formattedEndTime = "";
  let formattedCreatedTime = "";

  if (rental) {
    try {
      // Waktu awal pemesanan (createdAt presisi)
      const startTimestamp = rental.createdAt
        ? new Date(rental.createdAt).getTime()
        : new Date(rental.startDate).getTime();

      // Durasi hari sewa yang dipesan (misal 4 hari, 7 hari, 30 hari)
      const sDate = new Date(rental.startDate);
      const eDate = new Date(rental.endDate);
      const totalDays = Math.max(
        1,
        Math.round((eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24))
      );

      // Target berakhir dihitung presisi realtime sejak pemesanan dibuat
      const targetEndTime = startTimestamp + totalDays * 24 * 60 * 60 * 1000;
      const diffMs = targetEndTime - now;

      const endTargetDate = new Date(targetEndTime);
      formattedEndDate = endTargetDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      formattedEndTime = endTargetDate.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const createdDate = new Date(startTimestamp);
      formattedCreatedTime = `${createdDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}, ${createdDate.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })} WIB`;

      if (diffMs <= 0) {
        isExpired = true;
      } else {
        daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        hoursLeft = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        secondsLeft = Math.floor((diffMs % (1000 * 60)) / 1000);
      }
    } catch {
      isExpired = true;
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300">
      {/* Keadaan 1: Ada rental yang sedang aktif */}
      {rental && !isExpired ? (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/60 via-white to-white border-l-4 border-l-emerald-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-800 shadow-sm">
                UNIT
              </span>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Masa Sewa Sedang Berjalan
                  </span>
                  <span className="text-xs text-[var(--muted)] font-mono">
                    ID: {rental.id}
                  </span>
                </div>

                <h3 className="font-[family-name:var(--font-display)] text-base sm:text-lg font-bold text-[var(--ink)] mt-1">
                  {rental.gadgetModel}
                  {rental.storage && (
                    <span className="text-xs font-normal text-[var(--muted)] ml-2">
                      ({rental.storage} · {rental.color})
                    </span>
                  )}
                </h3>

                {/* Sisa Masa Sewa Realtime */}
                <div className="mt-1.5 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-emerald-800">
                    <span className="font-semibold text-emerald-900">Sisa masa sewa:</span>
                    <span className="font-bold font-mono tracking-tight text-emerald-950 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                      {daysLeft > 0 && `${daysLeft} hari `}
                      {hoursLeft} jam {minutesLeft} menit {secondsLeft} detik lagi
                    </span>
                    <span className="text-[11px] font-normal text-[var(--muted)]">
                      (berlaku s/d {formattedEndDate}, {formattedEndTime} WIB)
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                    <svg className="h-3 w-3 text-emerald-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Dihitung realtime sejak pemesanan: <strong>{formattedCreatedTime}</strong></span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:self-center">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] hover:bg-gray-50 transition cursor-pointer"
              >
                {showDetails ? "Tutup Rincian" : "Rincian Sewa"}
              </button>

              <Link
                href={`/invoice/${rental.id}`}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] hover:bg-gray-50 transition"
              >
                Cek Invoice
              </Link>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Halo Admin Grent, saya ingin konsultasi / perpanjang masa sewa untuk booking ID: ${rental.id} (${rental.gadgetModel}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition inline-flex items-center gap-1"
              >
                <span>Perpanjang Sewa</span>
              </a>

              <button
                type="button"
                onClick={handleClearRental}
                title="Selesaikan atau hapus catatan sewa ini"
                className="px-2 py-1.5 text-xs text-gray-400 hover:text-red-600 transition cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Rincian Sewa Tambahan (Collapsible) */}
          {showDetails && (
            <div className="mt-4 pt-3 border-t border-[var(--line)]/70 text-xs text-[var(--muted)] grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/70 p-3 rounded-lg">
              <div>
                <span className="block text-[11px] text-gray-400">Penyewa</span>
                <strong className="text-[var(--ink)]">{rental.customerName || "Penyewa"}</strong>
              </div>
              <div>
                <span className="block text-[11px] text-gray-400">Waktu Pemesanan</span>
                <strong className="text-[var(--ink)]">{formattedCreatedTime}</strong>
              </div>
              <div>
                <span className="block text-[11px] text-gray-400">Batas Waktu Berakhir</span>
                <strong className="text-[var(--ink)]">{formattedEndDate}, {formattedEndTime} WIB</strong>
              </div>
              <div>
                <span className="block text-[11px] text-gray-400">Total Biaya</span>
                <strong className="text-emerald-700 font-bold">
                  {rental.totalPrice ? formatIDR(rental.totalPrice) : "-"}
                </strong>
              </div>
            </div>
          )}
        </div>
      ) : rental && isExpired ? (
        /* Keadaan 2: Sewa telah selesai / expired */
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/50 border-l-4 border-l-amber-500">
          <div>
            <p className="font-bold text-sm text-[var(--ink)]">
              Masa Sewa {rental.gadgetModel} Telah Berakhir
            </p>
            <p className="text-xs text-[var(--muted)]">
              Masa rental kamu telah selesai pada {formattedEndDate}, {formattedEndTime} WIB. Terima kasih telah menyewa di Grent.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/katalog"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--ink)] text-white hover:bg-[var(--accent)] transition"
            >
              <span>Sewa Unit Baru</span>
            </Link>
            <button
              type="button"
              onClick={handleClearRental}
              className="px-2.5 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              Tutup Note
            </button>
          </div>
        </div>
      ) : (
        /* Keadaan 3: Belum ada rental apapun */
        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs font-bold text-[var(--muted)]">
              INFO
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--ink)]">
                  Kamu belum rental apapun
                </h3>
                <span className="text-[10px] font-semibold bg-gray-100 text-[var(--muted)] px-2 py-0.5 rounded-full">
                  Status: Nonaktif
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Sedang butuh laptop, smartphone, atau tablet? Manfaatkan penawaran di bawah ini atau sewa unit di katalog.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/katalog"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-[var(--ink)] text-white hover:bg-[var(--accent)] shadow-sm transition"
            >
              <span>Mulai Sewa Sekarang</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowCheckInput(!showCheckInput)}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-[var(--line)] bg-white text-[var(--muted)] hover:text-[var(--ink)] hover:border-gray-400 transition cursor-pointer"
            >
              {showCheckInput ? "Tutup" : "Cek ID Booking"}
            </button>

            <button
              type="button"
              onClick={handleSetDemoRental}
              title="Klik untuk mencoba simulasi tampilan saat sedang menyewa"
              className="px-2.5 py-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition cursor-pointer"
            >
              Simulasi Sewa
            </button>
          </div>
        </div>
      )}

      {/* Input untuk cek ID Booking jika customer menyewa lewat device lain */}
      {showCheckInput && !rental && (
        <form
          onSubmit={handleLookupBooking}
          className="border-t border-[var(--line)] bg-[#f8fafc] p-3.5 flex flex-wrap items-center gap-2.5 text-xs animate-in fade-in"
        >
          <span className="text-[var(--muted)] font-medium">Masukkan ID Booking kamu:</span>
          <input
            type="text"
            required
            placeholder="Contoh: cm1..."
            value={bookingIdInput}
            onChange={(e) => setBookingIdInput(e.target.value)}
            className="flex-1 min-w-[180px] max-w-xs border border-[var(--line)] bg-white px-3 py-1.5 rounded-lg outline-none focus:border-[var(--accent)] text-xs"
          />
          <button
            type="submit"
            disabled={checkLoading}
            className="bg-[var(--ink)] text-white px-3.5 py-1.5 rounded-lg font-semibold hover:bg-[var(--accent)] transition disabled:opacity-50 cursor-pointer"
          >
            {checkLoading ? "Mengecek..." : "Tampilkan Status"}
          </button>
          {checkError && <span className="text-red-600 font-medium">{checkError}</span>}
        </form>
      )}
    </div>
  );
}
