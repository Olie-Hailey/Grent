"use client";

import { useState } from "react";
import Link from "next/link";
import { formatIDR, WHATSAPP_NUMBER } from "@/lib/utils";

type RentalWithPhone = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  startDate: Date | string;
  endDate: Date | string;
  rentalPackage: string;
  deliveryMethod: string;
  deliveryAddress: string | null;
  totalPrice: number;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  expiresAt?: Date | string | null;
  createdAt: Date | string;
  phone: {
    model: string;
    category?: string;
    storage: string;
    color: string;
  };
};

export function InvoiceView({ rental }: { rental: RentalWithPhone }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const isPaid =
    rental.paymentStatus === "PAID" ||
    rental.status === "APPROVED" ||
    rental.status === "ACTIVE";

  const formattedCreated = new Date(rental.createdAt).toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const formattedStart = new Date(rental.startDate).toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const formattedEnd = new Date(rental.endDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function handlePrint() {
    window.print();
  }

  // Load html2pdf bundle dynamically and trigger direct download
  async function handleDownloadPdf() {
    try {
      setIsDownloading(true);
      const invoiceElement = document.getElementById("invoice-sheet");
      if (!invoiceElement) {
        window.print();
        return;
      }

      // Check if html2pdf is already loaded
      const win = window as unknown as {
        html2pdf?: () => {
          set: (opt: unknown) => {
            from: (elem: HTMLElement) => {
              save: () => Promise<void>;
            };
          };
        };
      };

      if (!win.html2pdf) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.crossOrigin = "anonymous";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load PDF engine"));
          document.head.appendChild(script);
        });
      }

      if (win.html2pdf) {
        const opt = {
          margin: [8, 8, 8, 8],
          filename: `Invoice-Grent-${rental.id.slice(-8).toUpperCase()}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: "avoid-all" },
        };
        await win.html2pdf().set(opt).from(invoiceElement).save();
      } else {
        window.print();
      }
    } catch {
      // Fallback to native print dialog
      window.print();
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Action Bar (Hanya tampil di layar, disembunyikan saat dicetak) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)] bg-white px-3 py-2 rounded-lg shadow-xs transition hover:bg-slate-50"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tombol Simpan PDF (Langsung Terdownload) */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-xs font-bold text-white hover:opacity-90 shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Menyiapkan PDF...</span>
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Simpan PDF</span>
              </>
            )}
          </button>

          {/* Tombol Cetak Browser */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--ink)] px-3.5 py-2 text-xs font-bold text-white hover:bg-black shadow-xs transition cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Cetak</span>
          </button>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              `Halo Admin Grent, ini konfirmasi invoice sewa ID: ${rental.id} (${rental.phone.model}) a/n ${rental.customerName}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>WhatsApp Admin</span>
          </a>
        </div>
      </div>

      {/* Sheet Invoice Utama (Diformat agar presisi muat dalam 1 halaman A4) */}
      <div
        id="invoice-sheet"
        className="invoice-card rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-7 shadow-sm text-xs text-[var(--ink)]"
      >
        {/* Header Invoice */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl bg-white p-0.5 shadow-xs border border-[var(--line)] flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Grent Logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-display)] text-xl font-black text-[var(--ink)] tracking-tight">
                  GRENT GADGET
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                  OFFICIAL
                </span>
              </div>
              <p className="text-[11px] text-[var(--muted)]">Rental Laptop, MacBook, Smartphone &amp; Tablet</p>
              <p className="text-[10px] text-[var(--muted)]">Jl. Margonda Raya No. 525, Depok · WA: 0895-6229-96629</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--muted)] block">
              Bukti Pemesanan Resmi
            </span>
            <p className="font-mono text-sm font-bold text-[var(--ink)] mt-0.5">
              INV-{rental.id.slice(-8).toUpperCase()}
            </p>
            <div className="mt-1.5">
              {isPaid ? (
                <span className="inline-block rounded bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                  LUNAS / VERIFIED
                </span>
              ) : (
                <span className="inline-block rounded bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-300">
                  MENUNGGU PEMBAYARAN TUNAI (CASH)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Informasi Ringkas 2 Kolom */}
        <div className="grid grid-cols-2 gap-4 py-3.5 border-b border-[var(--line)] text-xs">
          <div>
            <h2 className="font-bold text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1.5">
              Data Pelanggan (Penyewa)
            </h2>
            <div className="space-y-0.5">
              <p><span className="text-[var(--muted)]">Nama: </span><strong>{rental.customerName}</strong></p>
              <p><span className="text-[var(--muted)]">No. Telepon / WA: </span><strong>{rental.customerPhone}</strong></p>
              <p><span className="text-[var(--muted)]">Email: </span><strong>{rental.customerEmail}</strong></p>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1.5">
              Detail Transaksi
            </h2>
            <div className="space-y-0.5">
              <p><span className="text-[var(--muted)]">Tanggal Pemesanan: </span><strong>{formattedCreated}</strong></p>
              <p>
                <span className="text-[var(--muted)]">Metode Pembayaran: </span>
                <strong>{rental.paymentMethod === "QRIS" ? "QRIS Instan" : "Cash (Tunai di Toko)"}</strong>
              </p>
              <p>
                <span className="text-[var(--muted)]">Batas Pengambilan: </span>
                <strong className="text-amber-800">24 Jam sejak pemesanan</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Tabel Rincian Gadget */}
        <div className="py-3.5 border-b border-[var(--line)]">
          <h2 className="font-bold text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">
            Rincian Unit Sewa
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-[var(--muted)] border-y border-[var(--line)]">
                <tr>
                  <th className="py-2 px-2.5 font-semibold">Perangkat</th>
                  <th className="py-2 px-2.5 font-semibold">Spesifikasi &amp; Warna</th>
                  <th className="py-2 px-2.5 font-semibold">Periode Sewa &amp; Metode</th>
                  <th className="py-2 px-2.5 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]/60">
                <tr>
                  <td className="py-2 px-2.5">
                    <p className="font-bold text-[var(--ink)]">{rental.phone.model}</p>
                    <span className="text-[10px] text-[var(--muted)] bg-gray-100 px-1.5 py-0.2 rounded">
                      {rental.phone.category || "Gadget"} · Paket {rental.rentalPackage}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-[var(--muted)]">
                    {rental.phone.storage} · {rental.phone.color}
                  </td>
                  <td className="py-2 px-2.5 text-[var(--muted)]">
                    <p>{formattedStart} s/d {formattedEnd}</p>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      {rental.deliveryMethod === "DELIVERY"
                        ? `Antar (${rental.deliveryAddress || "-"})`
                        : "Ambil di Toko Grent"}
                    </p>
                  </td>
                  <td className="py-2 px-2.5 font-bold text-[var(--ink)] text-right">
                    {formatIDR(rental.totalPrice)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-2.5 flex justify-end">
            <div className="w-60 space-y-1 text-xs">
              <div className="flex justify-between py-0.5 border-b border-gray-100">
                <span className="text-[var(--muted)]">Subtotal Sewa:</span>
                <span className="font-semibold">{formatIDR(rental.totalPrice)}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-gray-100">
                <span className="text-[var(--muted)]">Deposit Jaminan:</span>
                <span className="font-semibold text-emerald-700">Kembali 100% saat selesai</span>
              </div>
              <div className="flex justify-between py-1 border-t border-[var(--line)] text-xs font-bold">
                <span>Total Pembayaran:</span>
                <span className="text-emerald-700 text-sm">{formatIDR(rental.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Catatan Petunjuk Pengambilan Unit */}
        <div className="mt-3 rounded-lg bg-[#f8fafc] border border-[var(--line)] p-3 text-xs space-y-1.5">
          <p className="font-bold text-[11px] text-[var(--ink)]">
            Petunjuk Pengambilan Unit di Tempat Rental:
          </p>
          <ol className="list-decimal list-inside space-y-0.5 text-[var(--muted)] text-[10.5px] leading-relaxed">
            <li>Tunjukkan lembar Invoice ini (lewat layar HP atau hasil cetak/PDF) kepada petugas kasir Grent.</li>
            <li>Serahkan e-KTP fisik asli sebagai jaminan identitas selama masa sewa unit.</li>
            {rental.paymentMethod === "CASH" && (
              <li>
                <strong>Pembayaran Cash:</strong> Bayarkan uang tunai sejumlah <strong>{formatIDR(rental.totalPrice)}</strong> kepada petugas. Petugas akan mengonfirmasi status menjadi <strong>LUNAS</strong>.
              </li>
            )}
            <li>Lakukan pengecekan fisik unit bersama petugas toko sebelum serah terima dilakukan.</li>
          </ol>
        </div>

        {/* Tanda Tangan Serah Terima */}
        <div className="mt-3.5 pt-3 border-t border-[var(--line)] grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-[10px] text-[var(--muted)]">Petugas Toko Grent</p>
            <div className="h-10 flex items-end justify-center">
              <p className="font-bold text-[11px] text-[var(--ink)]">( ....................................... )</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted)]">Penyewa (Customer)</p>
            <div className="h-10 flex items-end justify-center">
              <p className="font-bold text-[11px] text-[var(--ink)]">( {rental.customerName} )</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
