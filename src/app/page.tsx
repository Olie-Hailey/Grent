import Link from "next/link";
import { PhoneCard } from "@/components/PhoneCard";
import { UseCasesSection } from "@/components/UseCasesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FaqSection } from "@/components/FaqSection";
import { StoreLocationSection } from "@/components/StoreLocationSection";
import { ActiveRentalNote } from "@/components/ActiveRentalNote";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Ambil beberapa gadget terpopuler untuk preview di beranda
  const [featuredGadgets, totalGadgets] = await Promise.all([
    prisma.phone.findMany({
      where: { isActive: true },
      take: 3,
      orderBy: { dailyPrice: "desc" },
    }),
    prisma.phone.count({ where: { isActive: true } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 space-y-16">
      {/* 1. Hero Section */}
      <section className="border-b border-[var(--line)] pb-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1.5 text-xs font-semibold text-[var(--ink)] mb-5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Grent · Sewa Gadget Siap Pakai di Depok &amp; Jabodetabek</span>
            </div>

            <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--ink)] leading-[1.15]">
              Sewa Gadget Cepat, Hemat &amp; Tanpa Ribet.
            </h1>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[var(--muted)] max-w-xl">
              Butuh laptop untuk kerja, iPhone untuk liburan, atau tablet untuk presentasi? Grent menyediakan unit terawat dan siap pakai dengan tarif harian, mingguan, maupun bulanan.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/katalog"
                className="bg-[var(--ink)] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent)]"
              >
                Buka Katalog Gadget →
              </Link>
              <a
                href="https://wa.me/62895622996629?text=Halo%20Admin%20Grent%2C%20saya%20mau%20konsultasi%20sewa%20gadget"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[var(--line)] bg-[var(--surface)] px-6 py-3.5 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Chat CS WhatsApp
              </a>
            </div>

            {/* Trust Points */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> Unit Bersih &amp; Terawat
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> Syarat Jaminan Mudah
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> Bisa Diantar ke Lokasi
              </span>
            </div>
          </div>

          {/* Quick Highlight Card */}
          <div className="border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
            <div className="border-b border-[var(--line)] pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                Layanan Terpercaya
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--ink)] mt-1">
                Kenapa Memilih Grent?
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="border border-[var(--line)] bg-[#fafbfc] p-3.5">
                <p className="text-2xl font-bold text-[var(--ink)]">4.9 ★</p>
                <p className="text-[11px] text-[var(--muted)] mt-1">Rating Google Review</p>
              </div>
              <div className="border border-[var(--line)] bg-[#fafbfc] p-3.5">
                <p className="text-2xl font-bold text-emerald-600">10 Menit</p>
                <p className="text-[11px] text-[var(--muted)] mt-1">Proses Serah Terima</p>
              </div>
              <div className="border border-[var(--line)] bg-[#fafbfc] p-3.5">
                <p className="text-2xl font-bold text-[var(--ink)]">{totalGadgets}+ Unit</p>
                <p className="text-[11px] text-[var(--muted)] mt-1">Gadget Tersedia</p>
              </div>
              <div className="border border-[var(--line)] bg-[#fafbfc] p-3.5">
                <p className="text-2xl font-bold text-indigo-600">100%</p>
                <p className="text-[11px] text-[var(--muted)] mt-1">Deposit Kembali Utuh</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/katalog"
                className="block text-center bg-[#f3f6f8] py-2.5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--ink)] hover:text-white transition"
              >
                Cek Ketersediaan Unit Hari Ini →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Note Status Rental Aktif Pelanggan */}
      <ActiveRentalNote />

      {/* 2. Section Promo & Paket Spesial */}
      <section id="promo" className="scroll-mt-20">
        <div className="mb-8 text-center max-w-xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Penawaran Spesial
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--ink)]">
            Promo Sewa Gadget Hemat
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Pilih paket durasi yang sesuai untuk mendapatkan potongan harga spesial dari Grent.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col justify-between border border-[var(--line)] bg-[var(--surface)] p-6 transition hover:border-[var(--accent)] hover:shadow-md">
            <div>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded mb-3">
                HEMAT 15%
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)]">
                Paket Mingguan
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                Sewa unit minimal 7 hari otomatis mendapatkan potongan 15%. Pilihan pas untuk liburan, liputan, atau seminar seminggu.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--line)]">
              <Link
                href="/katalog"
                className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
              >
                Pilih Unit Mingguan →
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between border border-[var(--line)] bg-[var(--surface)] p-6 transition hover:border-[var(--accent)] hover:shadow-md">
            <div>
              <span className="inline-block bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2 py-0.5 rounded mb-3">
                HEMAT S/D 35%
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)]">
                Paket Bulanan (WFH &amp; Kantor)
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                Sewa 30 hari ke atas lebih terjangkau. Sudah termasuk garansi unit pengganti gratis jika ada kendala perangkat.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--line)]">
              <Link
                href="/katalog"
                className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
              >
                Pilih Unit Bulanan →
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between border border-[var(--line)] bg-[var(--surface)] p-6 transition hover:border-[var(--accent)] hover:shadow-md">
            <div>
              <span className="inline-block bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded mb-3">
                GRATIS ONGKIR
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)]">
                Free Antar-Jemput
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                Khusus sewa minimal 3 hari untuk area Depok &amp; sekitarnya, unit bisa langsung diantar dan dijemput tanpa biaya kurir.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--line)]">
              <Link
                href="/katalog"
                className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
              >
                Lihat Ketentuan →
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between border border-[var(--line)] bg-[var(--surface)] p-6 transition hover:border-[var(--accent)] hover:shadow-md">
            <div>
              <span className="inline-block bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded mb-3">
                DISKON KORPORAT
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)]">
                Sewa Multi-Unit (Event)
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                Butuh 5 hingga 50+ laptop/iPad untuk pelatihan kantor atau expo? Dapatkan penawaran invoice dan harga grosir khusus.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--line)]">
              <a
                href="https://wa.me/62895622996629?text=Halo%20Admin%20Grent%2C%20saya%20mau%20minta%20penawaran%20sewa%20banyak%20unit%20(Corporate)"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
              >
                Minta Penawaran WA →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section Kategori Gadget Populer */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Pilihan Perangkat
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--ink)] mt-1">
              Kategori Gadget
            </h2>
          </div>
          <Link
            href="/katalog"
            className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition"
          >
            Buka Katalog Lengkap →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/katalog?category=Laptop"
            className="group border border-[var(--line)] bg-[var(--surface)] p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-md"
          >
            <span className="text-xs font-bold tracking-wider uppercase text-[var(--accent)] bg-emerald-50 px-2.5 py-1 rounded-md mb-3 inline-block">Laptop</span>
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition">
              Laptop &amp; PC
            </h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              MacBook Pro, MacBook Air, ThinkPad, ASUS ROG
            </p>
            <p className="mt-4 text-xs font-semibold text-[var(--accent)]">
              Mulai Rp 100.000 /hari →
            </p>
          </Link>

          <Link
            href="/katalog?category=Smartphone"
            className="group border border-[var(--line)] bg-[var(--surface)] p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-md"
          >
            <span className="text-xs font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md mb-3 inline-block">Smartphone</span>
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition">
              Smartphone Flagship
            </h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              iPhone 16 Pro Max, iPhone 15, Galaxy S24 Ultra
            </p>
            <p className="mt-4 text-xs font-semibold text-[var(--accent)]">
              Mulai Rp 85.000 /hari →
            </p>
          </Link>

          <Link
            href="/katalog?category=Tablet"
            className="group border border-[var(--line)] bg-[var(--surface)] p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-md"
          >
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md mb-3 inline-block">Tablet</span>
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition">
              Tablet &amp; iPad
            </h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              iPad Pro 11 M4, iPad Air 5 + Apple Pencil
            </p>
            <p className="mt-4 text-xs font-semibold text-[var(--accent)]">
              Mulai Rp 90.000 /hari →
            </p>
          </Link>

          <Link
            href="/katalog?category=Aksesoris"
            className="group border border-[var(--line)] bg-[var(--surface)] p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-md"
          >
            <span className="text-xs font-bold tracking-wider uppercase text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md mb-3 inline-block">Aksesoris</span>
            <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition">
              Aksesoris Tambahan
            </h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Charger Fast Charging, Mouse, Dongle HDMI, Case
            </p>
            <p className="mt-4 text-xs font-semibold text-[var(--accent)]">
              Pelengkap Kebutuhan Sewa →
            </p>
          </Link>
        </div>
      </section>

      {/* 4. Section Preview Gadget Terpopuler */}
      <section className="border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Paling Banyak Disewa
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-[var(--ink)] mt-1">
              Rekomendasi Gadget Terpopuler
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Unit terfavorit untuk presentasi, konten kreator, dan pekerjaan profesional.
            </p>
          </div>
          <Link
            href="/katalog"
            className="bg-[var(--ink)] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[var(--accent)] transition"
          >
            Lihat Semua {totalGadgets} Unit di Katalog →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredGadgets.map((phone) => (
            <PhoneCard key={phone.id} phone={phone} />
          ))}
        </div>
      </section>

      {/* 5. Section Butuh Gadget untuk Kebutuhan Apa? */}
      <UseCasesSection />

      {/* 6. Section Cara Sewa & Syarat (S&K) */}
      <div id="cara-sewa" className="scroll-mt-20">
        <HowItWorksSection />
      </div>

      {/* 7. Section FAQ */}
      <FaqSection />

      {/* 8. Section Lokasi Toko & Kontak */}
      <div id="lokasi" className="scroll-mt-20">
        <StoreLocationSection />
      </div>
    </div>
  );
}
