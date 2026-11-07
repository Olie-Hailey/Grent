"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleAccountPicker } from "@/components/GoogleAccountPicker";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";

  // Admin form state
  const [adminEmail, setAdminEmail] = useState("admin@staffadmin.id");
  const [password, setPassword] = useState("admin123");
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

  // Customer form state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [customerEmailInput, setCustomerEmailInput] = useState("");
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);

  async function onAdminSubmit(event: FormEvent) {
    event.preventDefault();
    setAdminLoading(true);
    setAdminError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login gagal");
      }
      router.replace(nextPath.startsWith("/") ? nextPath : "/admin");
      router.refresh();
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleGoogleLoginClick() {
    setGoogleLoading(true);
    try {
      const checkRes = await fetch(
        `/api/auth/google?next=${encodeURIComponent(nextPath === "/admin" ? "/" : nextPath)}`
      );
      if (checkRes.redirected) {
        window.location.href = checkRes.url;
        return;
      }
      const data = await checkRes.json();
      if (data.configured === false) {
        setShowSimulatedModal(true);
      }
    } catch {
      setShowSimulatedModal(true);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleCustomerLogin(name: string, email: string, image?: string) {
    setGoogleLoading(true);
    try {
      const res = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          image:
            image ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0f9f8a`,
        }),
      });

      if (!res.ok) throw new Error("Gagal memproses sesi login");

      setShowSimulatedModal(false);
      router.replace(nextPath === "/admin" ? "/" : nextPath);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    const email = customerEmailInput.trim();
    if (!email || !email.includes("@")) {
      setShowSimulatedModal(true);
      return;
    }
    const name = email.split("@")[0].replace(/[._-]/g, " ");
    handleCustomerLogin(name, email);
  }

  function handleAppleLogin() {
    handleCustomerLogin("Apple User", "customer.apple@icloud.com");
  }

  const grentBenefits = [
    { title: "Unit Terawat & QC Ketat", desc: "Perangkat bersih, baterai sehat, dan siap pakai langsung." },
    { title: "Durasi Fleksibel", desc: "Pilihan sewa harian, mingguan hemat ~15%, atau bulanan hemat ~35%." },
    { title: "Proses Cepat 10 Menit", desc: "Serah terima unit cepat tanpa alur verifikasi yang berbelit." },
    { title: "Deposit Kembali Utuh 100%", desc: "Dana jaminan langsung dicairkan utuh setelah unit dikembalikan." },
  ];

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Brand Logo & Clean Title */}
      <div className="text-center mb-6">
        <div className="inline-flex h-14 w-14 overflow-hidden rounded-2xl bg-white p-2 shadow-sm border border-[var(--line)] mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Grent Logo"
            width={56}
            height={56}
            className="h-full w-full object-contain"
          />
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold text-[var(--ink)]">
          Login ke Grent
        </h1>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Masuk ke akun Grent untuk sewa gadget atau kelola sistem.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-5">
        {/* Modern Auth Buttons matching the reference (Image 2) */}
        <div className="space-y-3">
          {/* Button 1: Google */}
          <button
            type="button"
            onClick={handleGoogleLoginClick}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#252528] hover:bg-[#323338] active:scale-[0.99] py-3 px-4 text-sm font-semibold text-white shadow-sm border border-white/5 transition"
          >
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
            <span>{googleLoading ? "Menghubungkan..." : "Lanjutkan dengan Google"}</span>
          </button>

          {/* Button 2: Apple */}
          <button
            type="button"
            onClick={handleAppleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#252528] hover:bg-[#323338] active:scale-[0.99] py-3 px-4 text-sm font-semibold text-white shadow-sm border border-white/5 transition"
          >
            <svg className="h-5 w-5 shrink-0 fill-current text-white" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.85-11.96-14.42-7.53-11.66-13.06-25.04-16.59-40.14-3.53-15.1-5.3-28.77-5.3-41.01 0-14.15 3.73-25.75 11.2-34.81 7.47-9.06 16.71-13.68 27.72-13.88 4.35 0 9.24 1.13 14.67 3.39 5.43 2.26 9.4 3.44 11.92 3.53 2.12-.1 6.22-1.33 12.3-3.68 6.08-2.36 10.99-3.4 14.73-3.13 11.45.65 20.82 4.96 28.1 12.92-9.98 6.09-14.86 14.54-14.64 25.35.22 8.37 3.45 15.42 9.7 21.16 6.25 5.74 13.78 9.07 22.58 10-1.63 5.01-3.69 10.15-6.18 15.42zm-35.34-106.6c.11-6.85 2.58-13.3 7.42-19.35 4.84-6.05 10.9-10.14 18.17-12.28-.11 6.85-2.69 13.19-7.74 19.03-5.05 5.84-11.02 9.87-17.85 12.6z" />
            </svg>
            <span>Lanjutkan dengan Apple</span>
          </button>

          {/* Separator ATAU */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[var(--line)]"></div>
            <span className="flex-shrink mx-4 text-[11px] font-bold text-[var(--muted)] tracking-wider">
              ATAU
            </span>
            <div className="flex-grow border-t border-[var(--line)]"></div>
          </div>

          {/* Form Email */}
          <form onSubmit={handleEmailSubmit} className="space-y-2.5">
            <input
              type="email"
              value={customerEmailInput}
              onChange={(e) => setCustomerEmailInput(e.target.value)}
              placeholder="Masukkan email Anda"
              className="w-full rounded-xl border border-[var(--line)] bg-[#191a1d] text-white placeholder-gray-400 px-4 py-3 text-sm outline-none focus:border-[var(--accent)] font-medium transition"
            />
            <button
              type="submit"
              disabled={googleLoading}
              className="w-full rounded-xl bg-white text-black py-3 text-sm font-semibold shadow hover:bg-gray-100 active:scale-[0.99] transition border border-gray-200"
            >
              Lanjutkan dengan email
            </button>
          </form>
        </div>

        {/* Benefit-Benefit Sewa di Grent */}
        <div className="rounded-xl bg-[#f8fafc] border border-[var(--line)]/80 p-4">
          <p className="text-xs font-bold text-[var(--ink)] mb-2.5">
            Keuntungan Sewa di Grent
          </p>
          <div className="grid gap-2 text-xs">
            {grentBenefits.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <div>
                  <span className="font-semibold text-[var(--ink)]">{item.title}: </span>
                  <span className="text-[var(--muted)] text-[11px]">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider & Section Staff Admin */}
        <div className="border-t border-[var(--line)] pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--muted)]">
              Staff Internal Grent?
            </span>
            <button
              type="button"
              onClick={() => setShowAdminForm(!showAdminForm)}
              className="text-xs font-bold text-[var(--accent)] hover:underline"
            >
              {showAdminForm ? "Tutup Form Staff" : "Login Staff Admin →"}
            </button>
          </div>

          {showAdminForm && (
            <form onSubmit={onAdminSubmit} className="mt-4 space-y-3.5 animate-in fade-in">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Email Staff Admin
                </label>
                <input
                  required
                  type="text"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="nama@staffadmin.id"
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[var(--accent)] font-medium"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Password
                </label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-xs outline-none focus:border-[var(--accent)]"
                  autoComplete="current-password"
                />
              </div>

              {adminError && (
                <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 border border-red-100 font-medium">
                  {adminError}
                </div>
              )}

              <button
                type="submit"
                disabled={adminLoading}
                className="w-full rounded-xl bg-[var(--ink)] py-2.5 text-xs font-bold text-white transition hover:bg-[var(--accent)] shadow-sm disabled:opacity-50"
              >
                {adminLoading ? "Memverifikasi..." : "Masuk Staff"}
              </button>

              <p className="text-center text-[10px] text-[var(--muted)]">
                Default demo: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">admin@staffadmin.id</code> / <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">admin123</code>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Modal Autentik Akun Google (Ref: Image 1 Google Account Chooser) */}
      {showSimulatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <GoogleAccountPicker
            loading={googleLoading}
            onClose={() => setShowSimulatedModal(false)}
            onSelectAccount={(name, email, image) => handleCustomerLogin(name, email, image)}
          />
        </div>
      )}
    </div>
  );
}
