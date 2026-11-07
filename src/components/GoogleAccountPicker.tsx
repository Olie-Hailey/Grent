"use client";

import { useState } from "react";

export type GoogleAccount = {
  name: string;
  email: string;
  avatarText?: string;
  avatarBg?: string;
  imageUrl?: string;
};

const DEFAULT_ACCOUNTS: GoogleAccount[] = [
  {
    name: "Rafi",
    email: "backlegaming17@gmail.com",
    avatarText: "R",
    avatarBg: "bg-[#494c50]",
  },
  {
    name: "MI F7",
    email: "fml062334@gmail.com",
    avatarText: "MI",
    avatarBg: "bg-[#6a1b9a]",
  },
  {
    name: "Rafi Erbakti",
    email: "rafierbakti17@gmail.com",
    avatarText: "RE",
    avatarBg: "bg-[#137333]",
    imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=RafiErbakti&backgroundColor=1a73e8",
  },
  {
    name: "Budi Santoso",
    email: "budisantoso@gmail.com",
    avatarText: "BS",
    avatarBg: "bg-[#1a73e8]",
  },
];

interface GoogleAccountPickerProps {
  onSelectAccount: (name: string, email: string, image?: string) => void;
  onClose?: () => void;
  loading?: boolean;
  isStandalone?: boolean;
}

export function GoogleAccountPicker({
  onSelectAccount,
  onClose,
  loading = false,
  isStandalone = false,
}: GoogleAccountPickerProps) {
  const [showOtherAccount, setShowOtherAccount] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    const email = customEmail.trim();
    if (!email || !email.includes("@")) return;
    const name = customName.trim() || email.split("@")[0];
    onSelectAccount(
      name,
      email,
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0f9f8a`
    );
  }

  const containerClasses = isStandalone
    ? "min-h-screen bg-[#131314] flex items-center justify-center p-4 font-sans text-[#e3e3e3]"
    : "w-full max-w-[460px] bg-[#131314] rounded-[28px] border border-[#303134] text-[#e3e3e3] p-6 sm:p-8 shadow-2xl relative font-sans animate-in fade-in zoom-in-95 duration-200";

  return (
    <div className={isStandalone ? containerClasses : undefined}>
      <div className={!isStandalone ? containerClasses : "w-full max-w-[460px] bg-[#131314] rounded-[28px] border border-[#303134] p-6 sm:p-8 shadow-2xl relative"}>
        {/* Header Bar: Google Logo + Login dengan Google + Close Button */}
        <div className="flex items-center justify-between pb-5 border-b border-[#303134]/60">
          <div className="flex items-center gap-2.5">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
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
            <span className="text-sm font-medium text-[#c4c7c5]">Login dengan Google</span>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-[#9aa0a6] hover:text-white p-1 rounded-full hover:bg-white/10 transition"
              aria-label="Tutup"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Brand Icon: Grent App Icon */}
        <div className="pt-6 pb-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-2 shadow-lg flex items-center justify-center border border-emerald-400/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Grent" className="h-full w-full object-contain filter drop-shadow brightness-0 invert" />
          </div>
        </div>

        {/* Titles */}
        <div className="mb-5">
          <h2 className="text-[26px] font-normal sm:font-medium text-white tracking-tight">Pilih akun</h2>
          <p className="text-sm text-[#c4c7c5] mt-1">
            Lanjutkan ke <span className="text-[#8ab4f8] font-medium hover:underline cursor-pointer">Grent Gadget</span>
          </p>
        </div>

        {/* List of Accounts with Horizontal Dividers */}
        <div className="border-t border-[#303134]">
          {DEFAULT_ACCOUNTS.map((acc) => (
            <div key={acc.email} className="border-b border-[#303134]">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  onSelectAccount(
                    acc.name,
                    acc.email,
                    acc.imageUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(acc.name)}&backgroundColor=0f9f8a`
                  )
                }
                className="w-full flex items-center gap-3.5 py-3.5 px-2 hover:bg-[#202124] active:bg-[#282a2c] rounded-xl transition text-left group"
              >
                {acc.imageUrl ? (
                  <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-[#5f6368]/40 shadow-sm bg-[#303134]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={acc.imageUrl} alt={acc.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div
                    className={`h-10 w-10 shrink-0 rounded-full ${acc.avatarBg} text-white font-medium text-sm flex items-center justify-center shadow-sm`}
                  >
                    {acc.avatarText}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#e8eaed] group-hover:text-white truncate">
                    {acc.name}
                  </p>
                  <p className="text-xs text-[#9aa0a6] truncate">{acc.email}</p>
                </div>
              </button>
            </div>
          ))}

          {/* Gunakan Akun Lain */}
          <div className="border-b border-[#303134]">
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowOtherAccount(!showOtherAccount)}
              className="w-full flex items-center gap-3.5 py-3.5 px-2 hover:bg-[#202124] active:bg-[#282a2c] rounded-xl transition text-left group"
            >
              <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-[#9aa0a6] group-hover:text-white transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#e8eaed] group-hover:text-white">
                Gunakan akun lain
              </p>
            </button>

            {/* Expandable Form for Other Account */}
            {showOtherAccount && (
              <form onSubmit={handleCustomSubmit} className="p-3 bg-[#1e1f20] rounded-xl mb-3 space-y-3 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-medium text-[#9aa0a6] mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full rounded-lg bg-[#131314] border border-[#3c4043] px-3 py-2 text-xs text-white placeholder-[#5f6368] outline-none focus:border-[#8ab4f8] transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#9aa0a6] mb-1">
                    Email (@gmail.com)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full rounded-lg bg-[#131314] border border-[#3c4043] px-3 py-2 text-xs text-white placeholder-[#5f6368] outline-none focus:border-[#8ab4f8] transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[#8ab4f8] hover:bg-[#a8c7fa] active:bg-[#8ab4f8] text-[#131314] py-2 text-xs font-semibold transition"
                >
                  {loading ? "Memproses..." : "Masuk dengan Akun Ini"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <p className="text-[12px] text-[#9aa0a6] mt-6 leading-relaxed">
          Sebelum menggunakan aplikasi ini, Anda dapat meninjau{" "}
          <span className="text-[#8ab4f8] hover:underline cursor-pointer">Kebijakan Privasi</span> dan{" "}
          <span className="text-[#8ab4f8] hover:underline cursor-pointer">Persyaratan Layanan</span> Grent Gadget.
        </p>
      </div>
    </div>
  );
}
