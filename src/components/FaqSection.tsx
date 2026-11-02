"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Apa saja syarat sewa gadget di Grent?",
    a: "Syarat sangat mudah: e-KTP asli penyewa sebagai jaminan identitas selama masa sewa, uang deposit (sesuai tipe gadget), dan penandatanganan surat perjanjian sewa. Bagi perusahaan/instansi, dapat menyertakan PO atau identitas PIC resmi.",
  },
  {
    q: "Berapa tarif sewa per hari, mingguan, dan bulanan?",
    a: "Tarif sewa gadget mulai dari Rp 85.000/hari tergantung model dan spesifikasi perangkat. Untuk sewa Mingguan (7+ hari) Anda otomatis mendapat diskon hemat sekitar 15%, dan sewa Bulanan (30+ hari) mendapat potongan hingga 35%. Semakin lama durasi sewa, semakin hemat biaya hariannya.",
  },
  {
    q: "Apakah ada layanan antar-jemput ke alamat rumah / kantor?",
    a: "Ya! Grent menyediakan opsi pengiriman antar-jemput langsung ke alamat Anda (wilayah Jabodetabek). Anda juga dipersilakan mengambil langsung unit di toko kami tanpa biaya tambahan.",
  },
  {
    q: "Berapa minimal durasi sewa di Grent?",
    a: "Minimal durasi sewa adalah 1 hari (24 jam). Tidak ada batas maksimal sewa — Anda dapat menyewa harian, mingguan, bulanan, bahkan tahunan untuk operasional perusahaan.",
  },
  {
    q: "Apakah bisa sewa banyak unit sekaligus untuk seminar atau pameran?",
    a: "Tentu saja! Grent melayani penyewaan puluhan unit laptop, smartphone, atau tablet untuk seminar, workshop, pameran expo, ujian, dan event instansi. Tersedia diskon khusus untuk pemesanan multi-unit skala besar.",
  },
  {
    q: "Kapan uang deposit dikembalikan?",
    a: "Uang deposit akan ditransfer kembali secara utuh (100%) ke rekening Anda segera setelah serah terima unit selesai dan perangkat diperiksa dalam kondisi baik sesuai perjanjian.",
  },
  {
    q: "Apakah perangkat sudah siap pakai saat diterima?",
    a: "Ya, semua gadget sudah melalui pengecekan QC ketat, baterai terisi penuh, sistem operasi bersih, dan terinstal aplikasi dasar. Anda tinggal login akun pribadi dan langsung siap bekerja.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggle(idx: number) {
    setOpenIndex(openIndex === idx ? null : idx);
  }

  return (
    <section className="my-16 border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-10">
      <div className="mb-10 text-center max-w-xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          FAQ
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl sm:text-3xl text-[var(--ink)]">
          Pertanyaan yang Sering Diajukan
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Punya pertanyaan seputar sewa gadget? Temukan jawaban praktisnya di bawah ini.
        </p>
      </div>

      <div className="max-w-3xl mx-auto divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-4">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between text-left gap-4 group"
              >
                <span className="font-[family-name:var(--font-display)] text-base font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] transition">
                  {faq.q}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-sm font-semibold text-[var(--muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="mt-3 text-sm leading-relaxed text-[var(--muted)] animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center text-sm text-[var(--muted)]">
        Masih punya pertanyaan lain?{" "}
        <a
          href="https://wa.me/62895622996629?text=Halo%20Admin%20Grent%2C%20saya%20punya%20pertanyaan%20seputar%20sewa%20gadget"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--accent)] hover:underline"
        >
          Tanya langsung ke CS WhatsApp →
        </a>
      </div>
    </section>
  );
}
