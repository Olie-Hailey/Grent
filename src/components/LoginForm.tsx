"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

  // Customer Google form state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [customerEmailInput, setCustomerEmailInput] = useState("");
  const [customerNameInput, setCustomerNameInput] = useState("");
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

  async function handleSimulatedGoogleLogin(presetName?: string, presetEmail?: string) {
    const name = presetName || customerNameInput.trim() || "Penyewa Grent";
    const email = presetEmail || customerEmailInput.trim() || "customer@gmail.com";

    setGoogleLoading(true);
    try {
      const res = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0f9f8a`,
        }),
      });

      if (!res.ok) throw new Error("Gagal login dengan akun Google");

      setShowSimulatedModal(false);
      router.replace(nextPath === "/admin" ? "/" : nextPath);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setGoogleLoading(false);
    }
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
          Login
        </h1>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Masuk ke akun Grent untuk sewa gadget atau kelola sistem.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-6">
        {/* 1. Tombol Utama: Login Google untuk Customer */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLoginClick}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-[var(--line)] bg-white py-3 px-4 text-sm font-bold text-[var(--ink)] shadow-sm hover:bg-gray-50 hover:border-gray-400 active:scale-[0.99] transition"
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
        </div>

        {/* 2. Benefit-Benefit Sewa di Grent (Menggantikan notifikasi lama) */}
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

        {/* 3. Divider & Section Staff Admin */}
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

      {/* Modal Simulasi / Quick Sign-In Google (untuk development/testing jika belum ada GOOGLE_CLIENT_ID) */}
      {showSimulatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
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
                <h3 className="text-sm font-bold text-[var(--ink)]">Pilih Akun Google</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulatedModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--muted)]">
              Pilih akun demo untuk langsung mencoba masuk dengan Google, atau masukkan email kamu sendiri:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSimulatedGoogleLogin("Budi Santoso", "budisantoso@gmail.com")}
                className="w-full flex items-center gap-3 rounded-xl border border-gray-200 p-2.5 text-left hover:bg-gray-50 transition"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                  BS
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-[var(--ink)]">Budi Santoso</p>
                  <p className="text-[11px] text-[var(--muted)]">budisantoso@gmail.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSimulatedGoogleLogin("Siti Rahma", "sitirahma@gmail.com")}
                className="w-full flex items-center gap-3 rounded-xl border border-gray-200 p-2.5 text-left hover:bg-gray-50 transition"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                  SR
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-[var(--ink)]">Siti Rahma</p>
                  <p className="text-[11px] text-[var(--muted)]">sitirahma@gmail.com</p>
                </div>
              </button>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-[11px] font-bold text-[var(--muted)] mb-2">Atau gunakan nama/email lain:</p>
              <div className="space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={customerNameInput}
                  onChange={(e) => setCustomerNameInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 outline-none focus:border-[var(--accent)]"
                />
                <input
                  type="email"
                  placeholder="Email (@gmail.com)"
                  value={customerEmailInput}
                  onChange={(e) => setCustomerEmailInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="button"
                  onClick={() => handleSimulatedGoogleLogin()}
                  className="w-full rounded-lg bg-[var(--ink)] py-2 font-bold text-white hover:bg-[var(--accent)] transition"
                >
                  Masuk dengan Akun Ini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
