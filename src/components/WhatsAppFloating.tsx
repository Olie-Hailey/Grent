"use client";

import { useState } from "react";
import { WHATSAPP_NUMBER } from "@/lib/utils";

export function WhatsAppFloating() {
  const [isOpen, setIsOpen] = useState(false);

  const defaultMessage = encodeURIComponent(
    "Halo Admin Grent, saya ingin konsultasi sewa gadget (cek unit / harga / ketersediaan)."
  );
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-80 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-2xl transition animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <p className="font-semibold text-sm text-[var(--ink)]">CS Grent Gadget</p>
                <p className="text-xs text-[var(--muted)]">Online 09.30 – 19.30 WIB</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-[var(--muted)] hover:text-[var(--ink)]"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>

          <div className="my-3 space-y-2 text-xs text-[var(--muted)] leading-relaxed">
            <p>
              Halo! Butuh sewa laptop, smartphone, atau tablet untuk hari ini atau acara mendatang?
            </p>
            <p className="rounded-lg bg-[#f3f6f8] p-2.5 text-[var(--ink)]">
              <strong>Respon Cepat:</strong> Konsultasi unit, sewa banyak (kantor/event), atau minta antar ke lokasi.
            </p>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <span>Chat via WhatsApp</span>
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-13 w-13 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700 active:scale-95"
        aria-label="Buka Chat WhatsApp"
      >
        <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
        </svg>
      </button>
    </div>
  );
}
