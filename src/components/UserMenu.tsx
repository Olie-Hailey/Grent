"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CustomerPayload } from "@/lib/auth";

export function UserMenu({ customer }: { customer: CustomerPayload | null }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/customer/logout", { method: "POST" });
      router.refresh();
      setDropdownOpen(false);
    } finally {
      setLoggingOut(false);
    }
  }

  if (!customer) {
    return (
      <Link
        href="/login?tab=customer"
        className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--ink)] shadow-sm hover:border-gray-400 hover:bg-gray-50 transition"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
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
        <span className="hidden sm:inline">Masuk Google</span>
      </Link>
    );
  }

  // Initials for avatar fallback
  const initials = customer.name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "C";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white p-1 pr-2.5 text-xs font-semibold text-[var(--ink)] shadow-sm hover:border-gray-400 transition"
      >
        {customer.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={customer.image}
            alt={customer.name}
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
            {initials}
          </span>
        )}
        <span className="max-w-[90px] truncate text-xs font-bold sm:max-w-[120px]">
          {customer.name.split(" ")[0]}
        </span>
        <svg
          className={`h-3 w-3 text-gray-500 transition-transform ${
            dropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--line)] bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-bold text-[var(--ink)] truncate">{customer.name}</p>
            <p className="text-[11px] text-[var(--muted)] truncate">{customer.email}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Penyewa Terverifikasi
            </span>
          </div>

          <div className="py-1">
            <Link
              href="/pesanan-saya"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--ink)] hover:bg-gray-50 transition"
            >
              <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Pesanan Saya</span>
            </Link>
            <Link
              href="/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--ink)] hover:bg-gray-50 transition"
            >
              <svg className="h-3.5 w-3.5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profil Saya (e-KTP)</span>
            </Link>
            <Link
              href="/katalog"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--ink)] hover:bg-gray-50 transition"
            >
              <svg className="h-3.5 w-3.5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Sewa Gadget Baru</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <svg className="h-3.5 w-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Beralih ke Panel Admin</span>
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-1">
            <button
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50"
            >
              {loggingOut ? "Keluar..." : "Keluar Akun Google"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
