"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminProfileData } from "@/lib/admin-profile";

export function AdminMenu({ admin }: { admin: AdminProfileData | null }) {
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
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
      router.replace("/login");
      setDropdownOpen(false);
    } finally {
      setLoggingOut(false);
    }
  }

  const name = admin?.name || "Staff Admin";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AD";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-full border border-gray-800 bg-[var(--ink)] p-1 pr-2.5 text-xs font-semibold text-white shadow-xs hover:opacity-90 transition cursor-pointer"
      >
        {admin?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={admin.avatarUrl}
            alt={name}
            className="h-6 w-6 rounded-full object-cover border border-white/20 bg-white"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
            {initials}
          </span>
        )}
        <span className="max-w-[90px] truncate text-xs font-bold sm:max-w-[120px]">
          {name.split(" ")[0]}
        </span>
        <span className="hidden sm:inline-block text-[9px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
          Staff
        </span>
        <svg
          className={`h-3 w-3 text-gray-300 transition-transform ${
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
            <p className="text-xs font-bold text-[var(--ink)] truncate">{name}</p>
            <p className="text-[11px] text-[var(--muted)] truncate">{admin?.email || "admin@staffadmin.id"}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {admin?.role || "Staff Admin Operasional"}
            </span>
          </div>

          <div className="py-1">
            <Link
              href="/admin?tab=profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--ink)] hover:bg-gray-50 transition"
            >
              <svg className="h-3.5 w-3.5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profil Admin</span>
            </Link>

            <Link
              href="/admin?tab=rentals"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--ink)] hover:bg-gray-50 transition"
            >
              <svg className="h-3.5 w-3.5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Kelola Booking</span>
            </Link>

            <Link
              href="/admin?tab=phones"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[var(--ink)] hover:bg-gray-50 transition"
            >
              <svg className="h-3.5 w-3.5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Kelola Katalog Gadget</span>
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-1">
            <button
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{loggingOut ? "Keluar..." : "Logout Admin"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
