import { Suspense } from "react";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { CatalogFilters } from "@/components/CatalogFilters";
import { PhoneCard } from "@/components/PhoneCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Katalog Gadget — Grent",
  description: "Daftar unit laptop, MacBook, smartphone, dan tablet siap sewa harian, mingguan, dan bulanan.",
};

type SearchParams = Promise<{
  category?: string;
  q?: string;
  available?: string;
}>;

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const category = params.category?.trim() || "";
  const q = params.q?.trim() || "";
  const availableOnly = params.available === "1";

  const where: Prisma.PhoneWhereInput = {
    isActive: true,
  };

  if (category === "Lainnya") {
    where.category = {
      notIn: ["Laptop", "Smartphone", "Tablet"],
    };
  } else if (category) {
    where.category = category;
  }

  if (q) {
    where.OR = [
      { model: { contains: q } },
      { color: { contains: q } },
      { storage: { contains: q } },
      { category: { contains: q } },
    ];
  }

  if (availableOnly) {
    where.stock = { gt: 0 };
  }

  const phones = await prisma.phone.findMany({
    where,
    orderBy: { dailyPrice: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header Katalog */}
      <div className="mb-8 border-b border-[var(--line)] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] mb-2">
              Katalog Lengkap
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold text-[var(--ink)]">
              Pilihan Unit Gadget Siap Pakai
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[var(--muted)] max-w-2xl leading-relaxed">
              Tersedia Laptop kerja, MacBook Pro/Air, Smartphone flagship (iPhone &amp; Samsung), dan iPad. Unit bersih, bergaransi, dan bisa langsung disewa harian, mingguan, maupun bulanan.
            </p>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 rounded-lg transition"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>

      {/* Filter Katalog (1 Listbox Kategori & Tanpa Min/Max) */}
      <Suspense fallback={<div className="mb-8 h-24 rounded-2xl border border-[var(--line)] bg-[var(--surface)] animate-pulse" />}>
        <CatalogFilters resultCount={phones.length} />
      </Suspense>

      {/* Grid Unit */}
      {phones.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center">
          <p className="text-base font-semibold text-[var(--ink)]">Tidak ada gadget yang sesuai.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Coba ganti kata kunci atau pilih opsi kategori lain.</p>
          <div className="mt-5">
            <Link
              href="/katalog"
              className="inline-block bg-[var(--ink)] px-4 py-2 text-xs font-semibold text-white rounded-lg hover:bg-[var(--accent)] transition"
            >
              Reset Semua Filter
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {phones.map((phone) => (
            <PhoneCard key={phone.id} phone={phone} />
          ))}
        </div>
      )}
    </div>
  );
}
