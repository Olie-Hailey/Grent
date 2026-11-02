"use client";

import { FormEvent, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  resultCount: number;
};

export function CatalogFilters({ resultCount }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const category = searchParams.get("category") || "";
  const q = searchParams.get("q") || "";
  const available = searchParams.get("available") === "1";

  const categories = [
    { value: "", label: "Semua Gadget (All)" },
    { value: "Tablet", label: "Tablet & iPad (Tab)" },
    { value: "Laptop", label: "Laptop & MacBook" },
    { value: "Smartphone", label: "Smartphone & HP" },
    { value: "Lainnya", label: "Gadget Lainnya" },
  ];

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const nextCategory = String(formData.get("category") || "").trim();
    const nextQ = String(formData.get("q") || "").trim();
    const nextAvailable = formData.get("available") === "on";

    if (nextCategory) params.set("category", nextCategory);
    if (nextQ) params.set("q", nextQ);
    if (nextAvailable) params.set("available", "1");

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/katalog?${query}` : "/katalog");
    });
  }

  function handleCategoryChange(selectedCategory: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCategory) {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/katalog?${query}` : "/katalog");
    });
  }

  function resetFilters() {
    startTransition(() => {
      router.push("/katalog");
    });
  }

  return (
    <div className="mb-8">
      <form
        onSubmit={applyFilters}
        className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 items-end">
          {/* 1. Listbox Opsi Kategori (All / Tab / Laptop / HP / Lainnya) */}
          <div className="lg:col-span-4">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Pilih Kategori Gadget
            </label>
            <div className="relative">
              <select
                name="category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full appearance-none rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm font-semibold text-[var(--ink)] outline-none focus:border-[var(--accent)] transition cursor-pointer pr-10 shadow-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--muted)]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 2. Cari Gadget / Tipe / Warna */}
          <div className="lg:col-span-5">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Cari Gadget / Model / Warna
            </label>
            <div className="relative">
              <input
                name="q"
                defaultValue={q}
                placeholder="Contoh: MacBook M3, iPad Pro, iPhone 16..."
                className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)] transition shadow-sm placeholder:text-gray-400"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("q");
                    router.push(params.toString() ? `/katalog?${params.toString()}` : "/katalog");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 3. Tombol Aksi & Stok */}
          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap sm:flex-nowrap items-center gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-xl bg-[var(--ink)] py-2.5 px-4 text-xs sm:text-sm font-bold text-white hover:bg-[var(--accent)] shadow-sm transition disabled:opacity-50"
            >
              {pending ? "Memuat..." : "Cari Unit"}
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl border border-[var(--line)] bg-white py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:border-gray-400 transition shadow-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Footer Filter: Status ketersediaan & jumlah hasil */}
        <div className="mt-4 pt-3.5 border-t border-[var(--line)]/70 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-[var(--ink)] hover:text-[var(--accent)]">
            <input
              name="available"
              type="checkbox"
              defaultChecked={available}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.checked) {
                  params.set("available", "1");
                } else {
                  params.delete("available");
                }
                router.push(params.toString() ? `/katalog?${params.toString()}` : "/katalog");
              }}
              className="accent-[var(--accent)] h-4 w-4 rounded cursor-pointer"
            />
            <span>Hanya tampilkan unit yang stoknya tersedia</span>
          </label>

          <p className="font-medium">
            Menampilkan <strong className="text-[var(--ink)] font-bold">{resultCount}</strong> unit gadget
          </p>
        </div>
      </form>
    </div>
  );
}
