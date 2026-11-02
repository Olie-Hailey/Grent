"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RentalPackage,
  buildWhatsAppBookingMessage,
  calculateRentalPrice,
  daysBetween,
  formatIDR,
  toDateInputValue,
  WHATSAPP_NUMBER,
} from "@/lib/utils";
import type { CustomerProfileData } from "@/lib/customer-profile";

type Phone = {
  id: string;
  model: string;
  category?: string;
  imageEmoji?: string | null;
  storage: string;
  color: string;
  dailyPrice: number;
  weeklyPrice?: number | null;
  monthlyPrice?: number | null;
  stock: number;
};

type Props = {
  phone: Phone;
  initialCustomer?: { name: string; email: string } | null;
  initialProfile?: CustomerProfileData | null;
  isAdmin?: boolean;
  bookedRanges?: Array<{ startDate: string; endDate: string }>;
};

export function BookingForm({
  phone,
  initialCustomer,
  initialProfile,
  isAdmin,
  bookedRanges = [],
}: Props) {
  const today = toDateInputValue(new Date());
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = toDateInputValue(tomorrowDate);

  const [customerUser, setCustomerUser] = useState<{ name: string; email: string } | null>(
    initialCustomer ?? null
  );
  const [customerProfile, setCustomerProfile] = useState<CustomerProfileData | null>(
    initialProfile ?? null
  );

  const [customerName, setCustomerName] = useState(
    initialProfile?.name || initialCustomer?.name || ""
  );
  const [customerPhone, setCustomerPhone] = useState(initialProfile?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(
    initialProfile?.email || initialCustomer?.email || ""
  );
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [rentalPackage, setRentalPackage] = useState<RentalPackage>("HARIAN");
  const [deliveryMethod, setDeliveryMethod] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [deliveryAddress, setDeliveryAddress] = useState(initialProfile?.address || "");
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "CASH">("QRIS");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk Pop-up Ketentuan, Syarat & Denda
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Result state
  const [bookingResult, setBookingResult] = useState<{
    id: string;
    totalPrice: number;
    days: number;
    paymentMethod: "QRIS" | "CASH";
  } | null>(null);
  const [qrisPaid, setQrisPaid] = useState(false);
  const [verifyingQris, setVerifyingQris] = useState(false);

  useEffect(() => {
    fetch("/api/auth/customer/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.customer) {
          setCustomerUser(data.customer);
          setCustomerName((prev) => prev || data.customer.name);
          setCustomerEmail((prev) => prev || data.customer.email);
        }
        if (data.profile) {
          setCustomerProfile(data.profile);
          setCustomerName((prev) => prev || data.profile.name);
          setCustomerPhone((prev) => prev || data.profile.phone);
          setDeliveryAddress((prev) => prev || data.profile.address);
        }
      })
      .catch(() => {});
  }, []);

  const estimate = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return null;
    }
    const days = daysBetween(start, end);

    let effectivePkg = rentalPackage;
    if (days >= 30 && rentalPackage === "HARIAN") {
      effectivePkg = "BULANAN";
    } else if (days >= 7 && days < 30 && rentalPackage === "HARIAN") {
      effectivePkg = "MINGGUAN";
    }

    const { total, discountPercent, effectiveDaily } = calculateRentalPrice(
      phone.dailyPrice,
      days,
      effectivePkg,
      phone.weeklyPrice,
      phone.monthlyPrice
    );

    return {
      days,
      total,
      discountPercent,
      effectiveDaily,
      package: effectivePkg,
    };
  }, [startDate, endDate, rentalPackage, phone.dailyPrice, phone.weeklyPrice, phone.monthlyPrice]);

  // Cek apakah rentang tanggal yang dipilih bertumpuk dengan pesanan aktif lain (Ide 4)
  const overlappingBooking = useMemo(() => {
    if (!bookedRanges || bookedRanges.length === 0) return null;
    const reqStart = new Date(startDate);
    const reqEnd = new Date(endDate);
    if (isNaN(reqStart.getTime()) || isNaN(reqEnd.getTime()) || reqEnd <= reqStart) return null;

    const reqStartDay = new Date(reqStart.getFullYear(), reqStart.getMonth(), reqStart.getDate()).getTime();
    const reqEndDay = new Date(reqEnd.getFullYear(), reqEnd.getMonth(), reqEnd.getDate()).getTime();

    for (const b of bookedRanges) {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      const bStartDay = new Date(bStart.getFullYear(), bStart.getMonth(), bStart.getDate()).getTime();
      const bEndDay = new Date(bEnd.getFullYear(), bEnd.getMonth(), bEnd.getDate()).getTime();

      if (reqStartDay < bEndDay && reqEndDay > bStartDay) {
        return b;
      }
    }
    return null;
  }, [startDate, endDate, bookedRanges]);

  // Cek apakah customer sudah menyelesaikan profil wajibnya
  const isProfileComplete = Boolean(
    customerProfile?.isCompleted ||
    (customerProfile?.name &&
      customerProfile?.phone &&
      customerProfile?.address &&
      customerProfile?.birthInfo &&
      customerProfile?.idCardUrl)
  );

  // 1. Validasi Awal & Buka Pop-up Syarat, Ketentuan & Denda
  function handleInitiateBooking(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!customerUser && !isAdmin) {
      setError("Silakan masuk akun Google terlebih dahulu.");
      return;
    }

    if (!isAdmin && !isProfileComplete) {
      setError("Profil Anda belum lengkap. Silakan lengkapi data diri dan foto KTP sebelum memesan.");
      return;
    }

    if (!estimate) {
      setError("Pilih tanggal sewa yang valid.");
      return;
    }

    if (overlappingBooking) {
      const bStart = new Date(overlappingBooking.startDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const bEnd = new Date(overlappingBooking.endDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      setError(`Jadwal sewa bertabrakan: Unit ini telah terisi pesanan lain pada periode ${bStart} s.d. ${bEnd}. Silakan pilih tanggal lain.`);
      return;
    }

    if (deliveryMethod === "DELIVERY" && !deliveryAddress.trim()) {
      setError("Silakan isi alamat lengkap untuk layanan pengantaran.");
      return;
    }

    // Buka Pop-up Modal Ketentuan & Denda
    setAgreeTerms(false);
    setShowTermsModal(true);
  }

  // 2. Eksekusi Order Setelah Customer Menyetujui Ketentuan & Denda
  async function executeBookingOrder() {
    if (!agreeTerms) {
      setError("Anda wajib mencentang persetujuan syarat, ketentuan, dan denda peminjaman.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneId: phone.id,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          startDate,
          endDate,
          rentalPackage: estimate?.package || rentalPackage,
          deliveryMethod,
          deliveryAddress: deliveryMethod === "DELIVERY" ? deliveryAddress.trim() : null,
          paymentMethod,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Booking gagal");
      }

      setBookingResult({
        id: data.id,
        totalPrice: data.totalPrice,
        days: estimate ? estimate.days : 1,
        paymentMethod,
      });

      setShowTermsModal(false);

      // Simpan catatan sewa aktif di localStorage
      try {
        const rentalData = {
          id: data.id,
          gadgetModel: phone.model,
          category: phone.category || "Gadget",
          storage: phone.storage,
          color: phone.color,
          startDate,
          endDate,
          totalPrice: data.totalPrice,
          customerName: customerName.trim(),
          createdAt: data.createdAt || new Date().toISOString(),
        };
        localStorage.setItem("grent_active_rental", JSON.stringify(rentalData));
        window.dispatchEvent(new Event("grent_rental_updated"));
      } catch {
        // fallback silent
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses booking");
      setShowTermsModal(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmQrisPayment() {
    if (!bookingResult) return;
    setVerifyingQris(true);
    try {
      const res = await fetch(`/api/rentals/${bookingResult.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_qris_payment" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memverifikasi pembayaran QRIS");
      }
      setQrisPaid(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal konfirmasi");
    } finally {
      setVerifyingQris(false);
    }
  }

  // ================= TAMPILAN SETELAH BOOKING BERHASIL =================
  if (bookingResult) {
    const waText = buildWhatsAppBookingMessage({
      bookingId: bookingResult.id,
      customerName,
      gadgetModel: `${phone.model} (${phone.storage} · ${phone.color})`,
      startDate,
      endDate,
      days: bookingResult.days,
      rentalPackage: estimate?.package || rentalPackage,
      deliveryMethod,
      deliveryAddress,
      totalPrice: bookingResult.totalPrice,
    });
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

    return (
      <div className="border border-emerald-500/40 bg-white p-6 sm:p-8 shadow-lg rounded-2xl space-y-6 animate-in fade-in">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-lg">
            ✓
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Pesanan Berhasil Dicatat
            </span>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--ink)] mt-1">
              Booking {phone.model} Sukses!
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              ID Booking: <strong className="font-mono text-[var(--ink)]">{bookingResult.id}</strong> · Batas Pengambilan: 24 Jam
            </p>
          </div>
        </div>

        {/* ALUR 1: Jika Pelanggan Memilih QRIS */}
        {bookingResult.paymentMethod === "QRIS" && (
          <div className="rounded-2xl border border-[var(--line)] bg-[#f8fafc] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">Metode Pembayaran</span>
                <p className="font-bold text-sm text-[var(--ink)]">QRIS Instan Resmi Grent</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md">
                Kadaluarsa: 24 Jam
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center py-2">
              <div className="flex flex-col items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <div className="h-44 w-44 bg-white flex items-center justify-center border-2 border-gray-800 rounded-lg p-2">
                  <svg className="w-full h-full text-[var(--ink)]" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,10 h10 v10 h-10 z M50,20 h10 v10 h-10 z M10,40 h10 v10 h-10 z M30,40 h20 v20 h-20 z M70,40 h10 v10 h-10 z M80,50 h20 v10 h-20 z M40,70 h10 v20 h-10 z M60,70 h20 v10 h-20 z M80,80 h20 v20 h-20 z M60,90 h10 v10 h-10 z" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-gray-500 mt-1.5 uppercase tracking-widest">QRIS GRENT GADGET</span>
              </div>

              <div className="text-center sm:text-left space-y-1.5">
                <p className="text-xs text-[var(--muted)]">Total yang harus dibayar:</p>
                <p className="text-2xl font-black text-emerald-700">{formatIDR(bookingResult.totalPrice)}</p>
                <p className="text-[11px] text-[var(--muted)] max-w-xs leading-relaxed">
                  Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (GoPay, OVO, ShopeePay, Dana) lalu scan kode QR di samping.
                </p>
                <p className="text-[11px] text-amber-800 font-semibold pt-1">
                  Masa berlaku QRIS ini aktif selama 24 jam ke depan.
                </p>
              </div>
            </div>

            {!qrisPaid ? (
              <button
                type="button"
                onClick={handleConfirmQrisPayment}
                disabled={verifyingQris}
                className="w-full rounded-xl bg-emerald-600 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
              >
                {verifyingQris ? "Memverifikasi..." : "Saya Sudah Menyelesaikan Pembayaran QRIS"}
              </button>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="rounded-xl bg-emerald-100/90 border border-emerald-300 p-3 text-center text-xs font-bold text-emerald-800">
                  Pembayaran Berhasil Diverifikasi! Status: Lunas
                </div>
                <Link
                  href={`/invoice/${bookingResult.id}`}
                  className="block text-center w-full rounded-xl bg-[var(--ink)] py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[var(--accent)] transition"
                >
                  Buka &amp; Cetak Lembar Invoice Resmi →
                </Link>
                <p className="text-center text-[11px] text-[var(--muted)]">
                  Serahkan / tunjukkan invoice ini kepada pegawai toko saat serah terima gadget.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ALUR 2: Jika Pelanggan Memilih CASH */}
        {bookingResult.paymentMethod === "CASH" && (
          <div className="rounded-2xl border border-[var(--line)] bg-[#f8fafc] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">Metode Pembayaran</span>
                <p className="font-bold text-sm text-[var(--ink)]">Cash (Bayar Tunai di Tempat)</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md">
                Menunggu Pembayaran
              </span>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs space-y-2 text-amber-900">
              <p className="font-bold">Langkah Selanjutnya untuk Pengambilan Unit:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                <li>Datang ke toko rental Grent (Jl. Margonda Raya No. 525, Depok) maksimal dalam 24 jam.</li>
                <li>Tunjukkan lembar invoice / bukti booking ini kepada petugas kasir.</li>
                <li>Bayarkan uang tunai sejumlah <strong>{formatIDR(bookingResult.totalPrice)}</strong> kepada petugas.</li>
                <li>Petugas akan mengonfirmasi pembayaran di sistem menjadi <strong>LUNAS</strong> dan unit diserahkan.</li>
              </ol>
            </div>

            <Link
              href={`/invoice/${bookingResult.id}`}
              className="block text-center w-full rounded-xl bg-[var(--ink)] py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[var(--accent)] transition"
            >
              Lihat Lembar Invoice Pemesanan Cash →
            </Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl bg-emerald-600 py-3 text-center text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            Hubungi WhatsApp Admin Toko
          </a>
          <Link
            href="/katalog"
            className="rounded-xl border border-[var(--line)] bg-white px-5 py-3 text-center text-xs sm:text-sm font-semibold text-[var(--ink)] hover:bg-gray-50 transition"
          >
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  // ================= GATE 1: WAJIB LOGIN GOOGLE =================
  if (!customerUser && !isAdmin) {
    return (
      <div className="border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 rounded-2xl shadow-sm text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
          <svg className="h-7 w-7" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
            Verifikasi Pelanggan
          </span>
          <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--ink)] mt-2">
            Wajib Masuk Akun Google untuk Menyewa
          </h3>
          <p className="mt-2 text-xs text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
            Untuk menjaga keamanan transaksi dan menghindari pemesanan fiktif, pelanggan wajib masuk dengan akun Google terlebih dahulu sebelum melakukan sewa.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={`/login?next=/rent/${phone.id}`}
            className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[var(--ink)] px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-[var(--accent)] shadow-md transition active:scale-[0.99]"
          >
            <span>Masuk Akun Google untuk Lanjut Booking →</span>
          </Link>
        </div>
      </div>
    );
  }

  // ================= GATE 2: WAJIB MELENGKAPI PROFIL (KTP, NAMA, ALAMAT, TTL, NO HP) =================
  if (!isAdmin && !isProfileComplete) {
    return (
      <div className="border border-amber-300 bg-amber-50/70 p-6 sm:p-8 rounded-2xl shadow-sm text-center space-y-4 animate-in fade-in">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-sm border border-amber-200">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
            Verifikasi Identitas Wajib
          </span>
          <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--ink)] mt-2">
            Lengkapi Profil Anda untuk Melanjutkan Sewa
          </h3>
          <p className="mt-2 text-xs text-[var(--muted)] max-w-md mx-auto leading-relaxed">
            Halo <strong>{customerUser?.name}</strong>, sesuai ketentuan resmi rental gadget Grent, setiap pelanggan wajib melengkapi data profil diri dan mengunggah foto e-KTP asli sebelum dapat melakukan pemesanan.
          </p>
        </div>

        {/* Checklist kelengkapan data diri */}
        <div className="rounded-xl border border-amber-200 bg-white p-4 text-xs text-left max-w-md mx-auto space-y-2">
          <p className="font-bold text-[var(--ink)] text-[11px] uppercase tracking-wider mb-1">
            Status Kelengkapan Data Profil Anda:
          </p>
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-[var(--muted)]">Foto e-KTP Fisik Asli:</span>
            {customerProfile?.idCardUrl ? (
              <span className="font-bold text-emerald-700">Sudah Diunggah</span>
            ) : (
              <span className="font-bold text-red-600">Belum Ada (Wajib)</span>
            )}
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-[var(--muted)]">Nama Lengkap (Sesuai KTP):</span>
            {customerProfile?.name ? (
              <span className="font-bold text-emerald-700">Sudah Terisi</span>
            ) : (
              <span className="font-bold text-red-600">Belum Ada (Wajib)</span>
            )}
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-[var(--muted)]">Tempat, Tanggal Lahir (TTL):</span>
            {customerProfile?.birthInfo ? (
              <span className="font-bold text-emerald-700">Sudah Terisi</span>
            ) : (
              <span className="font-bold text-red-600">Belum Ada (Wajib)</span>
            )}
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-[var(--muted)]">Alamat Lengkap Domisili:</span>
            {customerProfile?.address ? (
              <span className="font-bold text-emerald-700">Sudah Terisi</span>
            ) : (
              <span className="font-bold text-red-600">Belum Ada (Wajib)</span>
            )}
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-[var(--muted)]">Nomor HP / WhatsApp Aktif:</span>
            {customerProfile?.phone ? (
              <span className="font-bold text-emerald-700">Sudah Terisi</span>
            ) : (
              <span className="font-bold text-red-600">Belum Ada (Wajib)</span>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Link
            href={`/profile?next=/rent/${phone.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700 shadow-md transition active:scale-[0.99]"
          >
            <span>Lengkapi Profil Saya Sekarang →</span>
          </Link>
        </div>
      </div>
    );
  }

  // ================= FORM BOOKING GADGET (JIKA PROFIL LENGKAP) =================
  return (
    <>
      <form onSubmit={handleInitiateBooking} className="space-y-5 border border-[var(--line)] bg-[var(--surface)] p-6 rounded-2xl shadow-sm">
        {/* Banner Profil Terverifikasi */}
        <div className="flex items-center justify-between rounded-xl bg-emerald-50/80 border border-emerald-200/80 px-3.5 py-2.5 text-xs text-emerald-900">
          <div>
            <p className="font-bold">Penyewa: {customerName}</p>
            <p className="text-[11px] text-emerald-700">{customerEmail} · {customerPhone || "Profil Terverifikasi"}</p>
          </div>
          <Link
            href={`/profile?next=/rent/${phone.id}`}
            className="text-[10px] bg-emerald-200/70 hover:bg-emerald-300 text-emerald-800 font-bold px-2 py-1 rounded-md transition"
          >
            Edit Profil
          </Link>
        </div>

        {/* Input Tanggal Sewa */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-[var(--muted)] uppercase">
              Mulai Sewa
            </label>
            <input
              type="date"
              required
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-[var(--line)] bg-white px-3 py-2 text-xs rounded-xl outline-none focus:border-[var(--accent)] font-semibold"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-[var(--muted)] uppercase">
              Selesai Sewa
            </label>
            <input
              type="date"
              required
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-[var(--line)] bg-white px-3 py-2 text-xs rounded-xl outline-none focus:border-[var(--accent)] font-semibold"
            />
          </div>
        </div>

        {/* Indikator Jadwal Terisi & Validasi Overlapping (Ide 4) */}
        {bookedRanges.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-700 text-[11px] block mb-1.5">
              Jadwal Sewa Unit Terisi Saat Ini:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {bookedRanges.map((b, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold"
                >
                  {new Date(b.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} –{" "}
                  {new Date(b.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} (Terisi)
                </span>
              ))}
            </div>
          </div>
        )}

        {overlappingBooking && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <p className="font-bold">Perhatian: Tanggal Sewa Bertabrakan</p>
            <p className="mt-0.5 text-[11px] leading-relaxed">
              Unit gadget ini sudah dipesan pada periode{" "}
              <strong>
                {new Date(overlappingBooking.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} s.d.{" "}
                {new Date(overlappingBooking.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </strong>
              . Silakan pilih rentang tanggal setelah unit tersebut kembali.
            </p>
          </div>
        )}

        {/* Pilihan Paket Sewa */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase">
            Pilihan Paket Sewa
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {(["HARIAN", "MINGGUAN", "BULANAN"] as const).map((pkg) => (
              <button
                type="button"
                key={pkg}
                onClick={() => setRentalPackage(pkg)}
                className={`py-2 px-2 text-center rounded-xl border transition ${
                  rentalPackage === pkg
                    ? "border-[var(--ink)] bg-[var(--ink)] text-white font-bold shadow-xs"
                    : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-gray-400"
                }`}
              >
                {pkg === "HARIAN" && "Harian"}
                {pkg === "MINGGUAN" && "Mingguan (-15%)"}
                {pkg === "BULANAN" && "Bulanan (-35%)"}
              </button>
            ))}
          </div>
        </div>

        {/* Metode Pengambilan */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase">
            Metode Pengambilan Unit
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDeliveryMethod("PICKUP")}
              className={`py-2 px-3 text-center rounded-xl border transition ${
                deliveryMethod === "PICKUP"
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white font-bold"
                  : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-gray-400"
              }`}
            >
              Ambil di Toko Grent
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMethod("DELIVERY")}
              className={`py-2 px-3 text-center rounded-xl border transition ${
                deliveryMethod === "DELIVERY"
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white font-bold"
                  : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-gray-400"
              }`}
            >
              Antar ke Alamat Domisili
            </button>
          </div>
        </div>

        {deliveryMethod === "DELIVERY" && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase">
              Alamat Lengkap Pengantaran
            </label>
            <textarea
              required
              rows={2}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full border border-[var(--line)] bg-white px-3 py-2 text-xs rounded-xl outline-none focus:border-[var(--accent)]"
              placeholder="Tuliskan alamat lengkap beserta nomor rumah dan patokan..."
            />
          </div>
        )}

        {/* Pilihan Metode Pembayaran (QRIS / CASH) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[var(--muted)] uppercase">
              Metode Pembayaran
            </label>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Masa Berlaku 24 Jam
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setPaymentMethod("QRIS")}
              className={`p-3 text-left border rounded-xl transition cursor-pointer ${
                paymentMethod === "QRIS"
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white font-semibold shadow-sm"
                  : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-gray-400"
              }`}
            >
              <p className="font-bold">QRIS Instan</p>
              <p className={`text-[10px] mt-0.5 ${paymentMethod === "QRIS" ? "text-gray-300" : "text-emerald-700 font-medium"}`}>
                Langsung dapat invoice resmi
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`p-3 text-left border rounded-xl transition cursor-pointer ${
                paymentMethod === "CASH"
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white font-semibold shadow-sm"
                  : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-gray-400"
              }`}
            >
              <p className="font-bold">Cash (Tunai)</p>
              <p className={`text-[10px] mt-0.5 ${paymentMethod === "CASH" ? "text-gray-300" : "text-[var(--muted)]"}`}>
                Bayar saat ambil di toko
              </p>
            </button>
          </div>

          {paymentMethod === "CASH" && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span>Panduan Pembayaran Cash:</span>
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                Pemesanan dicatat dalam status <strong>Menunggu Pembayaran Cash</strong>. Anda dapat membayar tunai kepada petugas saat serah terima unit di toko (Jl. Margonda Raya No. 525, Depok).
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-[var(--line)] bg-white px-3 py-2 text-xs rounded-xl outline-none focus:border-[var(--accent)]"
            placeholder="Misal: install software khusus, jam serah terima..."
          />
        </div>

        {estimate && (
          <div className="rounded-xl border border-[var(--line)] bg-[#f8fafc] p-4 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Durasi Sewa:</span>
              <span className="font-semibold text-[var(--ink)]">{estimate.days} hari</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Paket:</span>
              <span className="font-semibold text-emerald-700">
                {estimate.package} {estimate.discountPercent > 0 && `(Hemat ${estimate.discountPercent}%)`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Metode Pembayaran:</span>
              <span className="font-semibold text-[var(--ink)]">
                {paymentMethod === "QRIS" ? "QRIS (Berlaku 24 Jam)" : "Cash / Tunai di Tempat"}
              </span>
            </div>
            <div className="flex justify-between border-t border-[var(--line)] pt-2 text-sm font-bold text-[var(--ink)]">
              <span>Total Biaya Sewa:</span>
              <span className="text-emerald-700">{formatIDR(estimate.total)}</span>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

        <button
          type="submit"
          disabled={loading || !estimate || Boolean(overlappingBooking)}
          className="w-full rounded-xl bg-[var(--ink)] py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[var(--accent)] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading
            ? "Memproses..."
            : overlappingBooking
            ? "Jadwal Bertabrakan (Silakan Pilih Tanggal Lain)"
            : "Lanjutkan Pemesanan Gadget →"}
        </button>
      </form>

      {/* ================= MODAL POP-UP KETENTUAN, SYARAT & KEBIJAKAN DENDA ================= */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            {/* Header Modal */}
            <div className="p-4 sm:p-5 border-b border-[var(--line)] bg-[#f8fafc] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Persetujuan Wajib Pelanggan
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-bold text-[var(--ink)] mt-1">
                  Syarat, Ketentuan &amp; Kebijakan Denda Rental
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-black transition"
              >
                ✕
              </button>
            </div>

            {/* Isi Ketentuan & Denda (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs leading-relaxed text-[var(--ink)]">
              {/* Ringkasan Singkat Pesanan */}
              {estimate && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">Unit yang Disewa</span>
                    <p className="font-bold text-[var(--ink)]">{phone.model} ({phone.storage})</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">Durasi</span>
                    <p className="font-bold text-[var(--ink)]">{estimate.days} Hari ({startDate} s/d {endDate})</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">Total Biaya</span>
                    <p className="font-bold text-emerald-700">{formatIDR(estimate.total)}</p>
                  </div>
                </div>
              )}

              {/* Bagian 1: Syarat & Ketentuan Pokok */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-[var(--ink)] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  1. Ketentuan Pokok Peminjaman Unit:
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-[var(--muted)] pl-2">
                  <li>
                    <strong>Jaminan Identitas Fisik:</strong> Penyewa wajib menyerahkan e-KTP fisik asli saat serah terima unit di toko / pengantaran sebagai jaminan keamanan resmi selama masa sewa.
                  </li>
                  <li>
                    <strong>Waktu Sewa Realtime:</strong> Sisa masa sewa berjalan secara realtime tepat sesuai durasi hari sejak waktu pemesanan / serah terima unit dilakukan.
                  </li>
                  <li>
                    <strong>Penggunaan Wajar:</strong> Unit hanya diperbolehkan untuk keperluan legal dan wajar. Dilarang keras melakukan modifikasi hardware, pembongkaran casing, root, jailbreak, atau penghapusan label garansi resmi.
                  </li>
                  <li>
                    <strong>Batas Pembayaran:</strong> Pembayaran (QRIS atau Cash) harus diselesaikan dalam batas kadaluarsa 24 jam sebelum unit dapat diserahkan.
                  </li>
                </ul>
              </div>

              {/* Bagian 2: Rincian Kebijakan Denda Pelanggaran Resmi Grent */}
              <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                <h4 className="font-bold text-sm text-red-700 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-600"></span>
                  2. Kebijakan Denda &amp; Sanksi Pelanggaran:
                </h4>
                <p className="text-[11px] text-[var(--muted)]">
                  Apabila penyewa melanggar ketentuan atau terjadi kerusakan/keterlambatan, penyewa bersedia membayar denda sesuai tarif resmi berikut:
                </p>

                <div className="rounded-xl border border-red-200 bg-red-50/40 divide-y divide-red-200/80 text-[11px]">
                  <div className="p-3">
                    <p className="font-bold text-red-900">A. Keterlambatan Pengembalian (Late Return)</p>
                    <p className="text-red-800/90 mt-0.5">
                      Dikenakan biaya sewa harian berjalan + <strong>denda Rp 50.000 / hari keterlambatan</strong> jika terlambat tanpa konfirmasi perpanjangan minimal 6 jam sebelum masa sewa berakhir.
                    </p>
                  </div>

                  <div className="p-3">
                    <p className="font-bold text-red-900">B. Kerusakan Fisik Ringan (Body Lecet / Baret Dalam / Dent)</p>
                    <p className="text-red-800/90 mt-0.5">
                      Dikenakan biaya kompensasi rekondisi sebesar <strong>Rp 100.000 s/d Rp 350.000</strong> per titik kerusakan sesuai evaluasi fisik saat unit kembali.
                    </p>
                  </div>

                  <div className="p-3">
                    <p className="font-bold text-red-900">C. Kerusakan Fisik Berat / Fungsi (Layar Pecah, Terkena Air, Mati Total)</p>
                    <p className="text-red-800/90 mt-0.5">
                      Dikenakan biaya penggantian suku cadang resmi di <strong>Official Service Center</strong> sesuai nota tagihan servis aktual + biaya operasional penanganan unit.
                    </p>
                  </div>

                  <div className="p-3">
                    <p className="font-bold text-red-900">D. Kehilangan / Kerusakan Aksesoris Unit</p>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-red-800/90">
                      <li>Charger / Adaptor Original Laptop: Denda <strong>Rp 450.000 - Rp 850.000</strong></li>
                      <li>Kabel Data / Charger Smartphone: Denda <strong>Rp 150.000 - Rp 350.000</strong></li>
                      <li>Tas Laptop / Sleeve Case: Denda <strong>Rp 150.000 - Rp 300.000</strong></li>
                      <li>Apple Pencil / Stylus S-Pen: Denda <strong>Rp 800.000 - Rp 1.800.000</strong></li>
                    </ul>
                  </div>

                  <div className="p-3 bg-red-100/60">
                    <p className="font-bold text-red-950">E. Kehilangan Total Unit / Penggelapan Barang</p>
                    <p className="text-red-900 mt-0.5 leading-relaxed">
                      Penyewa <strong>wajib mengganti 100% harga pasar unit baru</strong> yang setara, serta akan langsung dilaporkan dan diproses ke pihak berwajib sesuai <strong>KUHP Pasal 372 (Tindak Pidana Penggelapan)</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkbox Persetujuan Wajib */}
              <div className="pt-2">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-emerald-950 leading-snug">
                    Saya telah membaca, memahami, dan menyetujui seluruh ketentuan peminjaman serta bersedia membayar konsekuensi denda yang berlaku apabila terjadi pelanggaran.
                  </span>
                </label>
              </div>
            </div>

            {/* Footer Modal: Tombol Aksi */}
            <div className="p-4 sm:p-5 border-t border-[var(--line)] bg-[#f8fafc] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-[var(--line)] bg-white text-[var(--muted)] hover:text-[var(--ink)] hover:bg-gray-50 transition"
              >
                Batal / Periksa Kembali
              </button>

              <button
                type="button"
                disabled={!agreeTerms || loading}
                onClick={executeBookingOrder}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Memproses..." : "Saya Setuju & Konfirmasi Pesanan →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
