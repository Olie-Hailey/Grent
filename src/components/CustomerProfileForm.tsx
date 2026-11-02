"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CustomerPayload } from "@/lib/auth";
import type { CustomerProfileData } from "@/lib/customer-profile";

type Props = {
  customer: CustomerPayload;
  initialProfile: CustomerProfileData | null;
  nextUrl?: string;
};

export function CustomerProfileForm({
  customer,
  initialProfile,
  nextUrl,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState(initialProfile?.name || customer.name || "");
  const [phone, setPhone] = useState(initialProfile?.phone || "");
  const [address, setAddress] = useState(initialProfile?.address || "");
  const [birthInfo, setBirthInfo] = useState(initialProfile?.birthInfo || "");
  const [idCardUrl, setIdCardUrl] = useState(initialProfile?.idCardUrl || "");
  const [avatarUrl, setAvatarUrl] = useState(
    initialProfile?.avatarUrl || customer.image || ""
  );

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingKtp, setUploadingKtp] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const ktpInputRef = useRef<HTMLInputElement>(null);

  // Cek apakah profil sudah memenuhi 6 syarat wajib
  const isNameFilled = Boolean(name.trim());
  const isPhoneFilled = Boolean(phone.trim());
  const isAddressFilled = Boolean(address.trim());
  const isBirthFilled = Boolean(birthInfo.trim());
  const isKtpFilled = Boolean(idCardUrl.trim());
  const isAllFilled =
    isNameFilled && isPhoneFilled && isAddressFilled && isBirthFilled && isKtpFilled;

  async function handleFileUpload(file: File, type: "avatar" | "ktp") {
    const formData = new FormData();
    formData.append("file", file);

    if (type === "avatar") setUploadingAvatar(true);
    if (type === "ktp") setUploadingKtp(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah file gambar");
      }

      if (type === "avatar") {
        setAvatarUrl(data.url);
      } else {
        setIdCardUrl(data.url);
      }
      setMessage({ type: "success", text: `${type === "avatar" ? "Foto profil" : "Foto KTP"} berhasil diunggah.` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Gagal mengunggah gambar" });
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      if (type === "ktp") setUploadingKtp(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          birthInfo: birthInfo.trim(),
          idCardUrl,
          avatarUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan profil");
      }

      setMessage({
        type: "success",
        text: isAllFilled
          ? "Profil Anda berhasil disimpan dan terverifikasi lengkap!"
          : "Profil berhasil disimpan. Harap lengkapi semua data wajib agar dapat menyewa gadget.",
      });

      router.refresh();

      if (isAllFilled && nextUrl) {
        setTimeout(() => {
          router.push(nextUrl);
        }, 1200);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold border flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-gray-400 hover:text-gray-600 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid 2 Kolom seperti pada Referensi Desain */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
        {/* ================= KOLOM KIRI: FOTO PROFIL & DATA IDENTITAS ================= */}
        <div className="space-y-6">
          {/* Card 1: Foto Profil */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
              <svg className="h-4 w-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Foto Profil</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative mb-3">
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm bg-gray-100 flex items-center justify-center">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-gray-400">
                      {name ? name.slice(0, 2).toUpperCase() : "CU"}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white border border-[var(--line)] shadow-sm flex items-center justify-center text-[var(--ink)] hover:bg-gray-50 transition cursor-pointer"
                  title="Ganti Foto Profil"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "avatar");
                  }}
                />
              </div>

              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)] uppercase">
                {name || "Customer Grent"}
              </h3>
              <p className="text-xs text-[var(--muted)]">{customer.email}</p>

              <div className="mt-2">
                {isAllFilled ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Akun Terverifikasi Lengkap
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Profil Belum Lengkap
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="mt-3 text-xs font-semibold text-[var(--ink)] border border-[var(--line)] bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                {uploadingAvatar ? "Mengunggah..." : "Ganti Foto"}
              </button>
              <span className="text-[10px] text-gray-400 mt-1">JPG, PNG, WebP - maks. 2MB</span>
            </div>
          </div>

          {/* Card 2: Data Pribadi Penyewa */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--line)] pb-3">
              <svg className="h-4 w-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Data Pribadi Penyewa (Wajib Diisi)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                Nama Lengkap (Sesuai KTP) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Rafi Erbakti"
                className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                Tempat, Tanggal Lahir (TTL) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={birthInfo}
                onChange={(e) => setBirthInfo(e.target.value)}
                placeholder="Contoh: Depok, 17 Mei 2003"
                className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                Alamat Lengkap Domisili <span className="text-red-600">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Contoh: Jl. Margonda Raya No. 525 RT 02 / RW 07, Beji, Depok"
                className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
              />
            </div>

            {/* Unggah Foto KTP Wajib */}
            <div className="pt-2 border-t border-[var(--line)]/70">
              <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1">
                Foto e-KTP Fisik Asli <span className="text-red-600">*</span>
              </label>
              <p className="text-[11px] text-[var(--muted)] mb-3 leading-relaxed">
                Wajib mengunggah foto e-KTP asli yang jelas dan terbaca untuk verifikasi jaminan keamanan unit rental.
              </p>

              <input
                type="file"
                ref={ktpInputRef}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "ktp");
                }}
              />

              {idCardUrl ? (
                <div className="relative rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50/40 p-3 flex flex-col items-center">
                  <div className="relative h-36 w-full max-w-xs overflow-hidden rounded-lg border border-emerald-200 shadow-xs bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={idCardUrl}
                      alt="Foto e-KTP"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between w-full max-w-xs text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Foto KTP Tersimpan
                    </span>
                    <button
                      type="button"
                      onClick={() => ktpInputRef.current?.click()}
                      disabled={uploadingKtp}
                      className="text-xs font-bold text-[var(--accent)] hover:underline cursor-pointer"
                    >
                      {uploadingKtp ? "Mengunggah..." : "Ganti Foto KTP"}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => ktpInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-gray-300 hover:border-[var(--accent)] bg-[#f8fafc] p-6 text-center cursor-pointer transition"
                >
                  <svg className="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p className="text-xs font-bold text-[var(--ink)]">
                    {uploadingKtp ? "Sedang Mengunggah Foto KTP..." : "Klik untuk Unggah Foto KTP Asli"}
                  </p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">Format JPG, PNG, atau WebP (Maks. 5MB)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= KOLOM KANAN: KONTAK & STATUS KELENGKAPAN ================= */}
        <div className="space-y-6">
          {/* Card: Informasi Kontak */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--line)] pb-3">
              <svg className="h-4 w-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Informasi Kontak (Wajib Diisi)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                Nomor HP / WhatsApp Aktif <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081212233020"
                  className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                />
              </div>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                Gunakan nomor aktif yang terhubung dengan WhatsApp untuk koordinasi pengambilan dan pengembalian unit.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                Email Akun Google <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                disabled
                value={customer.email}
                className="w-full rounded-xl border border-[var(--line)] bg-gray-100 px-3.5 py-2.5 text-xs font-semibold text-gray-500 cursor-not-allowed outline-none"
              />
              <p className="text-[11px] text-[var(--muted)] mt-1">
                Terhubung dengan akun Google Anda saat ini.
              </p>
            </div>
          </div>

          {/* Card: Status Verifikasi & Checklist */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-3.5">
            <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
              Syarat Verifikasi Akun Rental
            </h4>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Semua data di bawah wajib dipenuhi sebelum Anda dapat melakukan booking gadget:
            </p>

            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-[var(--muted)]">1. Email Akun Google:</span>
                <span className="font-bold text-emerald-700">Terverifikasi</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-[var(--muted)]">2. Nama Lengkap:</span>
                {isNameFilled ? (
                  <span className="font-bold text-emerald-700">Sudah Terisi</span>
                ) : (
                  <span className="font-bold text-amber-700">Belum Terisi</span>
                )}
              </li>
              <li className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-[var(--muted)]">3. Nomor HP / WhatsApp:</span>
                {isPhoneFilled ? (
                  <span className="font-bold text-emerald-700">Sudah Terisi</span>
                ) : (
                  <span className="font-bold text-amber-700">Belum Terisi</span>
                )}
              </li>
              <li className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-[var(--muted)]">4. Tempat, Tanggal Lahir (TTL):</span>
                {isBirthFilled ? (
                  <span className="font-bold text-emerald-700">Sudah Terisi</span>
                ) : (
                  <span className="font-bold text-amber-700">Belum Terisi</span>
                )}
              </li>
              <li className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-[var(--muted)]">5. Alamat Lengkap Domisili:</span>
                {isAddressFilled ? (
                  <span className="font-bold text-emerald-700">Sudah Terisi</span>
                ) : (
                  <span className="font-bold text-amber-700">Belum Terisi</span>
                )}
              </li>
              <li className="flex items-center justify-between py-1">
                <span className="text-[var(--muted)]">6. Foto e-KTP Fisik Asli:</span>
                {isKtpFilled ? (
                  <span className="font-bold text-emerald-700">Sudah Diunggah</span>
                ) : (
                  <span className="font-bold text-amber-700">Belum Diunggah</span>
                )}
              </li>
            </ul>

            {/* Tombol Simpan Profil */}
            <div className="pt-3 border-t border-[var(--line)]">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-[var(--ink)] py-3 text-xs sm:text-sm font-bold text-white hover:bg-[var(--accent)] shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Menyimpan Data..." : "Simpan Profil Saya"}
              </button>
            </div>

            {/* Tombol Balik ke Sewa Gadget jika datang dari flow booking */}
            {nextUrl && isAllFilled && (
              <div className="pt-2">
                <Link
                  href={nextUrl}
                  className="block text-center w-full rounded-xl bg-emerald-600 py-3 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700 shadow-sm transition"
                >
                  Lanjut ke Pemesanan Gadget →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
