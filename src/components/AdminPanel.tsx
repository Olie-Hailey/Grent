"use client";

import { FormEvent, useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PhoneImage } from "@/components/PhoneImage";
import { formatIDR, toDateInputValue } from "@/lib/utils";

type Phone = {
  id: string;
  model: string;
  category?: string;
  storage: string;
  color: string;
  dailyPrice: number;
  weeklyPrice?: number | null;
  monthlyPrice?: number | null;
  stock: number;
  description: string;
  imageEmoji: string;
  imageUrl?: string | null;
  isActive: boolean;
};

type Rental = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  startDate: string;
  endDate: string;
  rentalPackage?: string;
  deliveryMethod?: string;
  deliveryAddress?: string | null;
  paymentMethod?: string;
  paymentStatus?: string;
  expiresAt?: string | null;
  totalPrice: number;
  status: string;
  notes?: string | null;
  phone: Phone;
};

type TabType = "rentals" | "phones" | "profile";

const statuses = ["PENDING", "APPROVED", "ACTIVE", "COMPLETED", "CANCELLED"] as const;

export function AdminPanel({ initialTab = "rentals" }: { initialTab?: TabType }) {
  const router = useRouter();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [tab, setTab] = useState<TabType>(initialTab);
  const [message, setMessage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // State untuk Profil Admin
  const [adminProfile, setAdminProfile] = useState<{
    name: string;
    username: string;
    email: string;
    phone: string;
    role: string;
    branch: string;
    avatarUrl: string;
  }>({
    name: "Petugas Admin Grent",
    username: "admin",
    email: "admin@staffadmin.id",
    phone: "0895-6229-96629",
    role: "Super Admin Operasional",
    branch: "Grent Margonda Raya No. 525, Depok",
    avatarUrl: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Form tambah unit baru
  const [form, setForm] = useState({
    model: "",
    category: "Laptop",
    storage: "",
    color: "",
    dailyPrice: "",
    weeklyPrice: "",
    monthlyPrice: "",
    stock: "1",
    description: "",
  });

  // State untuk Edit Etalase Unit yang sudah ada
  const [editingPhone, setEditingPhone] = useState<Phone | null>(null);
  const [editForm, setEditForm] = useState({
    model: "",
    category: "Laptop",
    storage: "",
    color: "",
    dailyPrice: "",
    weeklyPrice: "",
    monthlyPrice: "",
    stock: "1",
    description: "",
    isActive: true,
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // State untuk Modal Pengembalian Unit & Inspeksi Fisik (Ide 1)
  const [returnModalRental, setReturnModalRental] = useState<Rental | null>(null);
  const [returnForm, setReturnForm] = useState({
    actualReturnDate: toDateInputValue(new Date()),
    chargerStatus: "LENGKAP" as "LENGKAP" | "HILANG",
    bodyCondition: "MULUS" as "MULUS" | "BARET" | "RUSAK_BERAT",
    customPenalty: 0,
    returnNotes: "",
  });
  const [processingReturn, setProcessingReturn] = useState(false);

  function openReturnModal(rental: Rental) {
    setReturnModalRental(rental);
    setReturnForm({
      actualReturnDate: toDateInputValue(new Date()),
      chargerStatus: "LENGKAP",
      bodyCondition: "MULUS",
      customPenalty: 0,
      returnNotes: "",
    });
  }

  // Hitung denda keterlambatan pengembalian
  const lateDays = useMemo(() => {
    if (!returnModalRental) return 0;
    const targetEnd = new Date(returnModalRental.endDate);
    const actual = new Date(returnForm.actualReturnDate);
    if (isNaN(targetEnd.getTime()) || isNaN(actual.getTime())) return 0;
    const targetDay = new Date(targetEnd.getFullYear(), targetEnd.getMonth(), targetEnd.getDate()).getTime();
    const actualDay = new Date(actual.getFullYear(), actual.getMonth(), actual.getDate()).getTime();
    const diff = Math.ceil((actualDay - targetDay) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [returnModalRental, returnForm.actualReturnDate]);

  const latePenalty = lateDays * 50000;
  const chargerPenalty = returnForm.chargerStatus === "HILANG" ? 250000 : 0;
  const bodyPenalty =
    returnForm.bodyCondition === "BARET"
      ? 150000
      : returnForm.bodyCondition === "RUSAK_BERAT"
      ? Number(returnForm.customPenalty || 0)
      : 0;

  const totalPenalty = latePenalty + chargerPenalty + bodyPenalty;

  async function handleCompleteReturn() {
    if (!returnModalRental) return;
    setProcessingReturn(true);
    try {
      const penaltySummary =
        totalPenalty > 0
          ? `Denda Total: ${formatIDR(totalPenalty)} (Telat: ${lateDays} hari = ${formatIDR(latePenalty)}, Charger: ${returnForm.chargerStatus}, Fisik: ${returnForm.bodyCondition})`
          : "Tidak ada denda (Pengembalian tepat waktu & unit mulus)";

      const fullNotes = [
        returnModalRental.notes ? `Catatan Booking: ${returnModalRental.notes}` : null,
        `[Pengembalian Selesai ${returnForm.actualReturnDate}] ${penaltySummary}${returnForm.returnNotes ? `. Keterangan: ${returnForm.returnNotes}` : ""}`,
      ]
        .filter(Boolean)
        .join(" | ");

      const res = await fetch(`/api/rentals/${returnModalRental.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          paymentStatus: "PAID",
          notes: fullNotes,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyelesaikan pengembalian gadget");
      }

      setMessage(
        `Pengembalian unit ${returnModalRental.phone.model} (${returnModalRental.customerName}) berhasil diselesaikan. Status pesanan menjadi COMPLETED dan stok unit otomatis dikembalikan ke etalase.`
      );
      setReturnModalRental(null);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pengembalian");
    } finally {
      setProcessingReturn(false);
    }
  }

  // Fungsi Ekspor Data Laporan ke File CSV (Ide 2)
  function exportRentalsToCSV() {
    if (rentals.length === 0) {
      alert("Belum ada data transaksi booking untuk diekspor.");
      return;
    }

    const headers = [
      "ID Booking",
      "Nama Pelanggan",
      "No Telepon / WA",
      "Email Pelanggan",
      "Model Gadget",
      "Kategori",
      "Paket Sewa",
      "Metode Serah",
      "Alamat Kirim",
      "Tanggal Mulai",
      "Tanggal Selesai",
      "Metode Pembayaran",
      "Status Pembayaran",
      "Total Biaya (IDR)",
      "Status Sewa",
      "Catatan",
    ];

    const escapeCSV = (str: string | number | null | undefined) => {
      if (str == null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = rentals.map((r) => [
      escapeCSV(r.id),
      escapeCSV(r.customerName),
      escapeCSV(r.customerPhone),
      escapeCSV(r.customerEmail),
      escapeCSV(r.phone.model),
      escapeCSV(r.phone.category || "Gadget"),
      escapeCSV(r.rentalPackage || "HARIAN"),
      escapeCSV(r.deliveryMethod || "PICKUP"),
      escapeCSV(r.deliveryAddress || "-"),
      escapeCSV(new Date(r.startDate).toLocaleDateString("id-ID")),
      escapeCSV(new Date(r.endDate).toLocaleDateString("id-ID")),
      escapeCSV(r.paymentMethod || "CASH"),
      escapeCSV(r.paymentStatus || "UNPAID"),
      escapeCSV(r.totalPrice),
      escapeCSV(r.status),
      escapeCSV(r.notes || "-"),
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const todayStr = toDateInputValue(new Date());
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan-sewa-grent-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function loadData() {
    try {
      const [phonesRes, rentalsRes] = await Promise.all([
        fetch("/api/phones"),
        fetch("/api/rentals"),
      ]);

      if (rentalsRes.status === 401) {
        router.replace("/login?next=/admin");
        return;
      }

      const [phonesData, rentalsData] = await Promise.all([
        phonesRes.json(),
        rentalsRes.json(),
      ]);

      setPhones(phonesData);
      setRentals(rentalsData);
    } catch {
      setMessage("Gagal memuat data dari server");
    }
  }

  useEffect(() => {
    let ignore = false;

    async function init() {
      try {
        const [phonesRes, rentalsRes, profileRes] = await Promise.all([
          fetch("/api/phones"),
          fetch("/api/rentals"),
          fetch("/api/admin/profile"),
        ]);

        if (rentalsRes.status === 401) {
          router.replace("/login?next=/admin");
          return;
        }

        const [phonesData, rentalsData, profileData] = await Promise.all([
          phonesRes.json(),
          rentalsRes.json(),
          profileRes.ok ? profileRes.json() : null,
        ]);

        if (!ignore) {
          setPhones(phonesData);
          setRentals(rentalsData);
          if (profileData?.profile) {
            setAdminProfile(profileData.profile);
          }
        }
      } catch {
        if (!ignore) {
          setMessage("Gagal memuat data awal");
        }
      }
    }

    void init();

    return () => {
      ignore = true;
    };
  }, [router]);

  async function handleAvatarUpload(file: File) {
    setUploadingAvatar(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/profile/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah foto profil admin");
      }
      setAdminProfile((prev) => ({ ...prev, avatarUrl: data.url }));
      setMessage("Foto profil admin berhasil diunggah.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal mengunggah foto profil");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSaveAdminProfile(e: FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminProfile),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan profil admin");
      }
      setAdminProfile(data.profile);
      setMessage("Profil Admin berhasil disimpan!");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal memperbarui profil admin");
    } finally {
      setSavingProfile(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    setMessage(null);
    const res = await fetch(`/api/rentals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Gagal update status");
      return;
    }
    setMessage(`Status rental diperbarui ke ${status}`);
    await loadData();
  }

  async function confirmPaymentAsPaid(id: string) {
    setMessage(null);
    const res = await fetch(`/api/rentals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: "PAID", status: "APPROVED" }),
    });
    if (!res.ok) {
      setMessage("Gagal mengonfirmasi pembayaran");
      return;
    }
    setMessage("Pembayaran dikonfirmasi! Status otomatis berubah menjadi Dibayar/Lunas.");
    await loadData();
  }

  async function addPhone(event: FormEvent) {
    event.preventDefault();
    setMessage(null);

    const body = new FormData();
    body.set("model", form.model);
    body.set("category", form.category);
    body.set("storage", form.storage);
    body.set("color", form.color);
    body.set("dailyPrice", form.dailyPrice);
    if (form.weeklyPrice) body.set("weeklyPrice", form.weeklyPrice);
    if (form.monthlyPrice) body.set("monthlyPrice", form.monthlyPrice);
    body.set("stock", form.stock);
    body.set("description", form.description);
    body.set("imageEmoji", "📱");
    if (imageFile) {
      body.set("image", imageFile);
    }

    const res = await fetch("/api/phones", {
      method: "POST",
      body,
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Gagal menambah gadget");
      return;
    }
    setMessage(`Gadget ${data.model} ditambahkan`);
    setForm({
      model: "",
      category: "Laptop",
      storage: "",
      color: "",
      dailyPrice: "",
      weeklyPrice: "",
      monthlyPrice: "",
      stock: "1",
      description: "",
    });
    setImageFile(null);
    await loadData();
  }

  function openEditPhone(p: Phone) {
    setEditingPhone(p);
    setEditForm({
      model: p.model,
      category: p.category || "Laptop",
      storage: p.storage,
      color: p.color,
      dailyPrice: String(p.dailyPrice),
      weeklyPrice: p.weeklyPrice ? String(p.weeklyPrice) : "",
      monthlyPrice: p.monthlyPrice ? String(p.monthlyPrice) : "",
      stock: String(p.stock),
      description: p.description,
      isActive: p.isActive,
    });
    setEditImageFile(null);
  }

  async function handleUpdatePhone(e: FormEvent) {
    e.preventDefault();
    if (!editingPhone) return;
    setEditLoading(true);
    setMessage(null);

    try {
      const body = new FormData();
      body.set("model", editForm.model);
      body.set("category", editForm.category);
      body.set("storage", editForm.storage);
      body.set("color", editForm.color);
      body.set("dailyPrice", editForm.dailyPrice);
      if (editForm.weeklyPrice) body.set("weeklyPrice", editForm.weeklyPrice);
      if (editForm.monthlyPrice) body.set("monthlyPrice", editForm.monthlyPrice);
      body.set("stock", editForm.stock);
      body.set("description", editForm.description);
      body.set("isActive", String(editForm.isActive));
      if (editImageFile) {
        body.set("image", editImageFile);
      }

      const res = await fetch(`/api/phones/${editingPhone.id}`, {
        method: "PUT",
        body,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memperbarui etalase gadget");
      }

      setMessage(`Etalase ${editForm.model} berhasil diperbarui!`);
      setEditingPhone(null);
      await loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal update etalase");
    } finally {
      setEditLoading(false);
    }
  }

  async function togglePhoneStatus(p: Phone) {
    setMessage(null);
    const nextActive = !p.isActive;
    const res = await fetch(`/api/phones/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: nextActive }),
    });
    if (res.ok) {
      setMessage(`Status ${p.model} diubah menjadi ${nextActive ? "Aktif" : "Nonaktif"}`);
      await loadData();
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("rentals")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
              tab === "rentals"
                ? "bg-[var(--ink)] text-white shadow-sm"
                : "border border-[var(--line)] bg-white text-[var(--muted)]"
            }`}
          >
            Booking ({rentals.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("phones")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
              tab === "phones"
                ? "bg-[var(--ink)] text-white shadow-sm"
                : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-gray-400"
            }`}
          >
            Katalog Gadget ({phones.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              tab === "profile"
                ? "bg-[var(--ink)] text-white shadow-sm"
                : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-gray-400"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Profil Admin</span>
          </button>
        </div>
        <button
          type="button"
          onClick={logout}
          className="border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] rounded-lg transition"
        >
          Logout
        </button>
      </div>

      {message && (
        <div className="border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 rounded-xl font-medium">
          {message}
        </div>
      )}

      {tab === "rentals" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--surface)] p-4 rounded-2xl border border-[var(--line)] shadow-xs">
            <div>
              <h2 className="text-base font-bold text-[var(--ink)]">Daftar Transaksi Penyewaan</h2>
              <p className="text-xs text-[var(--muted)]">Kelola status pesanan, konfirmasi pembayaran tunai kasir, dan inspeksi pengembalian unit</p>
            </div>
            <button
              type="button"
              onClick={exportRentalsToCSV}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="h-4 w-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Unduh Rekap Laporan (CSV)</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-[var(--line)] bg-[var(--surface)] rounded-2xl shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] bg-[#f3f6f8] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Pelanggan</th>
                <th className="px-4 py-3 font-medium">Gadget</th>
                <th className="px-4 py-3 font-medium">Paket &amp; Pengiriman</th>
                <th className="px-4 py-3 font-medium">Periode</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Pembayaran</th>
                <th className="px-4 py-3 font-medium">Status &amp; Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rentals.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted)]">
                    Belum ada booking.
                  </td>
                </tr>
              )}
              {rentals.map((rental) => (
                <tr key={rental.id} className="border-b border-[var(--line)] last:border-0 hover:bg-[#fafbfc]">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--ink)]">{rental.customerName}</p>
                    <a
                      href={`https://wa.me/${rental.customerPhone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:underline block"
                    >
                      WA: {rental.customerPhone}
                    </a>
                    <p className="text-xs text-[var(--muted)]">{rental.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--ink)]">{rental.phone.model}</p>
                    <span className="text-[11px] bg-gray-100 text-[var(--muted)] px-1.5 py-0.5 rounded">
                      {rental.phone.category || "Gadget"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className="font-semibold text-[var(--ink)]">{rental.rentalPackage || "HARIAN"}</p>
                    <p className="text-[var(--muted)]">
                      {rental.deliveryMethod === "DELIVERY"
                        ? `Antar: ${rental.deliveryAddress || "-"}`
                        : "Ambil di Toko"}
                    </p>
                    {rental.notes && (
                      <p className="mt-1 text-gray-500 italic">&ldquo;{rental.notes}&rdquo;</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">
                    {new Date(rental.startDate).toLocaleDateString("id-ID")} –{" "}
                    {new Date(rental.endDate).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--ink)]">
                    {formatIDR(rental.totalPrice)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[var(--ink)]">
                          {rental.paymentMethod || "CASH"}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            rental.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {rental.paymentStatus === "PAID" ? "Lunas" : "Belum Bayar"}
                        </span>
                      </div>

                      {rental.paymentStatus !== "PAID" && (
                        <button
                          type="button"
                          onClick={() => confirmPaymentAsPaid(rental.id)}
                          className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-0.5 rounded transition shadow-sm w-fit"
                        >
                          Konfirmasi Lunas
                        </button>
                      )}

                      <a
                        href={`/invoice/${rental.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[var(--accent)] hover:underline font-semibold"
                      >
                        Lihat Invoice ↗
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={rental.status}
                      onChange={(e) => updateStatus(rental.id, e.target.value)}
                      className="border border-[var(--line)] bg-white px-2 py-1 text-xs font-semibold outline-none rounded w-full"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    {(rental.status === "ACTIVE" || rental.status === "APPROVED") && (
                      <button
                        type="button"
                        onClick={() => openReturnModal(rental)}
                        className="mt-1.5 w-full text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Proses Pengembalian</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Modal Inspeksi Pengembalian Gadget (Ide 1) */}
          {returnModalRental && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="relative w-full max-w-xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                <div className="p-4 sm:p-5 border-b border-[var(--line)] bg-[#f8fafc] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      Operasional Serah Terima Unit
                    </span>
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)] mt-1">
                      Inspeksi Pengembalian &amp; Cek Denda
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReturnModalRental(null)}
                    className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-black transition cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-[var(--ink)]">
                  {/* Info Ringkas Pesanan */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <p className="font-bold text-sm text-[var(--ink)]">
                      {returnModalRental.phone.model} ({returnModalRental.phone.storage})
                    </p>
                    <p className="text-[var(--muted)]">
                      Penyewa: <span className="font-semibold text-[var(--ink)]">{returnModalRental.customerName}</span> ({returnModalRental.customerPhone})
                    </p>
                    <p className="text-[var(--muted)]">
                      Batas Jadwal Sewa Seharusnya:{" "}
                      <span className="font-semibold text-[var(--ink)]">
                        {new Date(returnModalRental.endDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Input Tanggal Aktual Pengembalian */}
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Tanggal Aktual Unit Dikembalikan ke Toko
                    </label>
                    <input
                      type="date"
                      value={returnForm.actualReturnDate}
                      onChange={(e) =>
                        setReturnForm((prev) => ({ ...prev, actualReturnDate: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-[var(--line)] rounded-xl outline-none font-medium bg-white"
                    />
                    <div className="mt-1.5">
                      {lateDays > 0 ? (
                        <p className="text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-lg font-medium">
                          Terlambat: <strong>{lateDays} Hari</strong> (Denda Keterlambatan: <strong>{formatIDR(latePenalty)}</strong>)
                        </p>
                      ) : (
                        <p className="text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg font-medium">
                          Pengembalian Tepat Waktu (Tidak ada denda keterlambatan).
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Checklist Kelengkapan Aksesoris */}
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1.5">
                      Kelengkapan Aksesoris Bawaan (Charger &amp; Kabel Asli):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="border border-gray-200 p-2.5 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-gray-50 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50/40">
                        <input
                          type="radio"
                          name="chargerStatus"
                          value="LENGKAP"
                          checked={returnForm.chargerStatus === "LENGKAP"}
                          onChange={() =>
                            setReturnForm((prev) => ({ ...prev, chargerStatus: "LENGKAP" }))
                          }
                          className="text-emerald-600"
                        />
                        <span className="font-medium text-xs">Lengkap &amp; Berfungsi (+Rp 0)</span>
                      </label>
                      <label className="border border-gray-200 p-2.5 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-gray-50 has-[:checked]:border-rose-600 has-[:checked]:bg-rose-50/40">
                        <input
                          type="radio"
                          name="chargerStatus"
                          value="HILANG"
                          checked={returnForm.chargerStatus === "HILANG"}
                          onChange={() =>
                            setReturnForm((prev) => ({ ...prev, chargerStatus: "HILANG" }))
                          }
                          className="text-rose-600"
                        />
                        <span className="font-medium text-xs text-rose-700">Hilang / Rusak (+Rp 250.000)</span>
                      </label>
                    </div>
                  </div>

                  {/* Kondisi Fisik Unit */}
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1.5">
                      Kondisi Fisik Layar &amp; Bodi Gadget:
                    </label>
                    <div className="space-y-2">
                      <label className="border border-gray-200 p-2.5 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-gray-50 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50/40">
                        <input
                          type="radio"
                          name="bodyCondition"
                          value="MULUS"
                          checked={returnForm.bodyCondition === "MULUS"}
                          onChange={() =>
                            setReturnForm((prev) => ({ ...prev, bodyCondition: "MULUS" }))
                          }
                          className="text-emerald-600"
                        />
                        <span className="font-medium text-xs">Mulus / Pemakaian Wajar Normal (+Rp 0)</span>
                      </label>
                      <label className="border border-gray-200 p-2.5 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-gray-50 has-[:checked]:border-amber-600 has-[:checked]:bg-amber-50/40">
                        <input
                          type="radio"
                          name="bodyCondition"
                          value="BARET"
                          checked={returnForm.bodyCondition === "BARET"}
                          onChange={() =>
                            setReturnForm((prev) => ({ ...prev, bodyCondition: "BARET" }))
                          }
                          className="text-amber-600"
                        />
                        <span className="font-medium text-xs text-amber-800">Ada Baret / Lecet Kasar Penggunaan (+Rp 150.000)</span>
                      </label>
                      <label className="border border-gray-200 p-2.5 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-gray-50 has-[:checked]:border-rose-600 has-[:checked]:bg-rose-50/40">
                        <input
                          type="radio"
                          name="bodyCondition"
                          value="RUSAK_BERAT"
                          checked={returnForm.bodyCondition === "RUSAK_BERAT"}
                          onChange={() =>
                            setReturnForm((prev) => ({ ...prev, bodyCondition: "RUSAK_BERAT" }))
                          }
                          className="text-rose-600"
                        />
                        <span className="font-medium text-xs text-rose-700">Kerusakan Layar / Komponen Fisik</span>
                      </label>
                    </div>

                    {returnForm.bodyCondition === "RUSAK_BERAT" && (
                      <div className="mt-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                        <label className="font-semibold text-rose-900 block mb-1">
                          Nominal Biaya Perbaikan Resmi / Ganti Rugi:
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="50000"
                          value={returnForm.customPenalty}
                          onChange={(e) =>
                            setReturnForm((prev) => ({ ...prev, customPenalty: Number(e.target.value) }))
                          }
                          placeholder="Masukkan nominal biaya service"
                          className="w-full px-3 py-1.5 border border-rose-300 rounded-lg outline-none bg-white font-bold"
                        />
                      </div>
                    )}
                  </div>

                  {/* Catatan Tambahan Inspeksi */}
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Catatan Petugas Pemeriksa (Opsional):
                    </label>
                    <textarea
                      rows={2}
                      value={returnForm.returnNotes}
                      onChange={(e) =>
                        setReturnForm((prev) => ({ ...prev, returnNotes: e.target.value }))
                      }
                      placeholder="Contoh: Baterai sehat 98%, akun iCloud/Google sudah di-logout oleh penyewa."
                      className="w-full px-3 py-2 border border-[var(--line)] rounded-xl outline-none"
                    />
                  </div>

                  {/* Ringkasan Total Denda */}
                  <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Total Sanksi Denda:</span>
                      <p className="text-xs text-[var(--muted)]">
                        {totalPenalty > 0 ? "Harus dilunasi pelanggan di kasir toko" : "Unit kembali dalam kondisi prima"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-base font-extrabold ${totalPenalty > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                        {formatIDR(totalPenalty)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 border-t border-[var(--line)] bg-[#f8fafc] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReturnModalRental(null)}
                    className="px-4 py-2 border border-[var(--line)] bg-white text-[var(--muted)] font-semibold rounded-xl hover:bg-gray-50 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={processingReturn}
                    onClick={handleCompleteReturn}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    {processingReturn ? "Menyimpan..." : "Selesaikan Pengembalian & Terima Unit"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profil Admin */}
      {tab === "profile" && (
        <form onSubmit={handleSaveAdminProfile} className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
            {/* Kolom Kiri: Foto Petugas & Identitas Kerja */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                  <svg className="h-4 w-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Foto Profil Staff Admin</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center">
                  <div className="relative mb-3">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm bg-gray-100 flex items-center justify-center">
                      {adminProfile.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={adminProfile.avatarUrl}
                          alt={adminProfile.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-black text-gray-400">
                          {adminProfile.name ? adminProfile.name.slice(0, 2).toUpperCase() : "AD"}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white border border-[var(--line)] shadow-sm flex items-center justify-center text-[var(--ink)] hover:bg-gray-50 transition cursor-pointer"
                      title="Ganti Foto Profil Staff"
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
                        if (file) handleAvatarUpload(file);
                      }}
                    />
                  </div>

                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)] uppercase">
                    {adminProfile.name || "Petugas Admin"}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">{adminProfile.email}</p>

                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Staff Admin Aktif &amp; Terverifikasi
                    </span>
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

              {/* Data Identitas Petugas */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--line)] pb-3">
                  <svg className="h-4 w-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Identitas Petugas Admin</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Nama Lengkap Petugas
                  </label>
                  <input
                    type="text"
                    required
                    value={adminProfile.name}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Username Sistem
                  </label>
                  <input
                    type="text"
                    disabled
                    value={adminProfile.username}
                    className="w-full rounded-xl border border-[var(--line)] bg-gray-100 px-3.5 py-2.5 text-xs font-semibold text-gray-500 cursor-not-allowed outline-none font-mono"
                  />
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    Username digunakan untuk login ke panel admin Grent.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Jabatan / Role Operasional
                  </label>
                  <input
                    type="text"
                    required
                    value={adminProfile.role}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="Contoh: Super Admin Operasional"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Cabang / Lokasi Penugasan
                  </label>
                  <input
                    type="text"
                    required
                    value={adminProfile.branch}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, branch: e.target.value }))}
                    placeholder="Contoh: Grent Margonda Raya No. 525, Depok"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Kontak Resmi & Hak Akses */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--line)] pb-3">
                  <svg className="h-4 w-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Kontak Resmi Staff</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Email Staff Admin
                  </label>
                  <input
                    type="email"
                    required
                    value={adminProfile.email}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@staffadmin.id"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    Email resmi petugas untuk notifikasi sistem dan login staff.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp / Hotline Toko
                  </label>
                  <input
                    type="tel"
                    required
                    value={adminProfile.phone}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="0895-6229-96629"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    Nomor WhatsApp yang digunakan untuk verifikasi pesanan dan dihubungi oleh pelanggan.
                  </p>
                </div>
              </div>

              {/* Hak Akses Sistem */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-3.5">
                <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
                  Hak Akses &amp; Wewenang Petugas
                </h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Akun ini memiliki hak akses administratif penuh pada operasional rental Grent:
                </p>

                <ul className="space-y-2 text-xs">
                  <li className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[var(--muted)]">1. Manajemen Booking &amp; Konfirmasi:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[var(--muted)]">2. Verifikasi Pembayaran Cash &amp; QRIS:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[var(--muted)]">3. Tambah &amp; Edit Etalase Gadget:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[var(--muted)]">4. Cetak &amp; Verifikasi Invoice Resmi:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5">
                    <span className="text-[var(--muted)]">5. Pengecekan Foto e-KTP Pelanggan:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                </ul>

                <div className="pt-3 border-t border-[var(--line)]">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full rounded-xl bg-[var(--ink)] py-3 text-xs sm:text-sm font-bold text-white hover:bg-[var(--accent)] shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {savingProfile ? "Menyimpan Data..." : "Simpan Perubahan Profil Admin"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {tab === "phones" && (
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          {/* Form Tambah Unit Gadget Baru */}
          <form
            onSubmit={addPhone}
            className="space-y-4 border border-[var(--line)] bg-[var(--surface)] p-6 rounded-2xl shadow-sm self-start"
          >
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)]">
              Tambah Unit Gadget ke Etalase
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] rounded-lg font-medium"
                >
                  <option value="Laptop">Laptop &amp; MacBook</option>
                  <option value="Smartphone">Smartphone &amp; HP</option>
                  <option value="Tablet">Tablet &amp; iPad</option>
                  <option value="Lainnya">Gadget Lainnya</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase">Stok Awal</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                  className="w-full border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase">Nama Model Perangkat</label>
              <input
                required
                value={form.model}
                onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
                className="w-full border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] rounded-lg"
                placeholder="MacBook Pro 14 M3 / iPhone 16 Pro"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase">Spesifikasi / Storage</label>
                <input
                  required
                  value={form.storage}
                  onChange={(e) => setForm((prev) => ({ ...prev, storage: e.target.value }))}
                  className="w-full border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] rounded-lg"
                  placeholder="16GB RAM · 512GB SSD"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase">Warna / Varian</label>
                <input
                  required
                  value={form.color}
                  onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                  className="w-full border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] rounded-lg"
                  placeholder="Space Black"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[var(--muted)] uppercase">Harga/Hari (Rp)</label>
                <input
                  required
                  type="number"
                  value={form.dailyPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, dailyPrice: e.target.value }))}
                  className="w-full border border-[var(--line)] bg-white px-2.5 py-2 text-xs outline-none focus:border-[var(--accent)] rounded-lg"
                  placeholder="150000"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[var(--muted)] uppercase">Mingguan</label>
                <input
                  type="number"
                  value={form.weeklyPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, weeklyPrice: e.target.value }))}
                  className="w-full border border-[var(--line)] bg-white px-2.5 py-2 text-xs outline-none focus:border-[var(--accent)] rounded-lg"
                  placeholder="890000"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[var(--muted)] uppercase">Bulanan</label>
                <input
                  type="number"
                  value={form.monthlyPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, monthlyPrice: e.target.value }))}
                  className="w-full border border-[var(--line)] bg-white px-2.5 py-2 text-xs outline-none focus:border-[var(--accent)] rounded-lg"
                  placeholder="2800000"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase">Foto Gadget (Opsional)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs rounded-lg file:mr-2 file:border-0 file:bg-[var(--ink)] file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white file:rounded"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--muted)] uppercase">Deskripsi Perangkat</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full border border-[var(--line)] bg-white px-3 py-2 text-xs outline-none focus:border-[var(--accent)] rounded-lg"
                placeholder="Keunggulan unit, processor, kelengkapan, dsb..."
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--ink)] py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[var(--accent)] transition shadow-sm"
            >
              Simpan Gadget Baru
            </button>
          </form>

          {/* Daftar Etalase Sewa Gadget & Fitur Edit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)]">
                Daftar Etalase Unit Sewa ({phones.length})
              </h2>
              <span className="text-xs text-[var(--muted)]">Klik Edit untuk ubah harga/stok</span>
            </div>

            {phones.map((phone) => (
              <div
                key={phone.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border bg-[var(--surface)] p-4 rounded-xl shadow-sm transition ${
                  phone.isActive ? "border-[var(--line)]" : "border-gray-200 bg-gray-50 opacity-70"
                }`}
              >
                <div className="flex gap-3.5 items-center">
                  <div className="w-16 h-16 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-white">
                    <PhoneImage
                      imageUrl={phone.imageUrl}
                      alt={phone.model}
                      className="h-full w-full"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[var(--ink)] text-sm">{phone.model}</p>
                      <span className="text-[10px] font-semibold bg-gray-100 text-[var(--muted)] px-1.5 py-0.5 rounded">
                        {phone.category || "Gadget"}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          phone.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {phone.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      {phone.storage} · {phone.color} · <strong>Stok: {phone.stock} unit</strong>
                    </p>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      {formatIDR(phone.dailyPrice)}/hari
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => openEditPhone(phone)}
                    className="px-3 py-1.5 text-xs font-bold bg-white text-[var(--ink)] border border-[var(--line)] rounded-lg hover:border-gray-400 hover:bg-gray-50 shadow-sm transition"
                  >
                    Edit Etalase
                  </button>

                  <button
                    type="button"
                    onClick={() => togglePhoneStatus(phone)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                      phone.isActive
                        ? "text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
                        : "text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200"
                    }`}
                  >
                    {phone.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Profil Admin */}
      {tab === "profile" && (
        <form onSubmit={handleSaveAdminProfile} className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
            {/* Kolom Kiri: Foto Petugas & Identitas Kerja */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                  <svg className="h-4 w-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Foto Profil Staff Admin</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center">
                  <div className="relative mb-3">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm bg-gray-100 flex items-center justify-center">
                      {adminProfile.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={adminProfile.avatarUrl}
                          alt={adminProfile.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-black text-gray-400">
                          {adminProfile.name ? adminProfile.name.slice(0, 2).toUpperCase() : "AD"}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white border border-[var(--line)] shadow-sm flex items-center justify-center text-[var(--ink)] hover:bg-gray-50 transition cursor-pointer"
                      title="Ganti Foto Profil Staff"
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
                        if (file) handleAvatarUpload(file);
                      }}
                    />
                  </div>

                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)] uppercase">
                    {adminProfile.name || "Petugas Admin"}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">{adminProfile.email}</p>

                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Staff Admin Aktif &amp; Terverifikasi
                    </span>
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

              {/* Data Identitas Petugas */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--line)] pb-3">
                  <svg className="h-4 w-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Identitas Petugas Admin</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Nama Lengkap Petugas
                  </label>
                  <input
                    type="text"
                    required
                    value={adminProfile.name}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Username Sistem
                  </label>
                  <input
                    type="text"
                    disabled
                    value={adminProfile.username}
                    className="w-full rounded-xl border border-[var(--line)] bg-gray-100 px-3.5 py-2.5 text-xs font-semibold text-gray-500 cursor-not-allowed outline-none font-mono"
                  />
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    Username digunakan untuk login ke panel admin Grent.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Jabatan / Role Operasional
                  </label>
                  <input
                    type="text"
                    required
                    value={adminProfile.role}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="Contoh: Super Admin Operasional"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Cabang / Lokasi Penugasan
                  </label>
                  <input
                    type="text"
                    required
                    value={adminProfile.branch}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, branch: e.target.value }))}
                    placeholder="Contoh: Grent Margonda Raya No. 525, Depok"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Kontak Resmi & Hak Akses */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--line)] pb-3">
                  <svg className="h-4 w-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Kontak Resmi Staff</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Email Staff Admin
                  </label>
                  <input
                    type="email"
                    required
                    value={adminProfile.email}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@staffadmin.id"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    Email resmi petugas untuk notifikasi sistem dan login staff.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp / Hotline Toko
                  </label>
                  <input
                    type="tel"
                    required
                    value={adminProfile.phone}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="0895-6229-96629"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    Nomor WhatsApp yang digunakan untuk verifikasi pesanan dan dihubungi oleh pelanggan.
                  </p>
                </div>
              </div>

              {/* Hak Akses Sistem */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-3.5">
                <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
                  Hak Akses &amp; Wewenang Petugas
                </h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Akun ini memiliki hak akses administratif penuh pada operasional rental Grent:
                </p>

                <ul className="space-y-2 text-xs">
                  <li className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[var(--muted)]">1. Manajemen Booking &amp; Konfirmasi:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[var(--muted)]">2. Verifikasi Pembayaran Cash &amp; QRIS:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[var(--muted)]">3. Tambah &amp; Edit Etalase Gadget:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[var(--muted)]">4. Cetak &amp; Verifikasi Invoice Resmi:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5">
                    <span className="text-[var(--muted)]">5. Pengecekan Foto e-KTP Pelanggan:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                </ul>

                <div className="pt-3 border-t border-[var(--line)]">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full rounded-xl bg-[var(--ink)] py-3 text-xs sm:text-sm font-bold text-white hover:bg-[var(--accent)] shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {savingProfile ? "Menyimpan Data..." : "Simpan Perubahan Profil Admin"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Modal / Dialog Edit Etalase Sewa */}
      {editingPhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[var(--ink)]">
                  Edit Etalase Gadget
                </h3>
                <p className="text-xs text-[var(--muted)]">Ubah data unit, tarif sewa, stok, dan spesifikasi.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPhone(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePhone} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-bold text-[var(--muted)] uppercase">Nama Model Perangkat</label>
                <input
                  required
                  value={editForm.model}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, model: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)] font-medium text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-[var(--muted)] uppercase">Kategori</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 outline-none focus:border-[var(--accent)] font-medium text-xs"
                  >
                    <option value="Laptop">Laptop &amp; MacBook</option>
                    <option value="Smartphone">Smartphone &amp; HP</option>
                    <option value="Tablet">Tablet &amp; iPad</option>
                    <option value="Lainnya">Gadget Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-[var(--muted)] uppercase">Stok Tersedia</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, stock: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-[var(--muted)] uppercase">Spesifikasi / Storage</label>
                  <input
                    required
                    value={editForm.storage}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, storage: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)] text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-[var(--muted)] uppercase">Warna / Varian</label>
                  <input
                    required
                    value={editForm.color}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-1 block font-bold text-[var(--muted)] uppercase">Harga/Hari (Rp)</label>
                  <input
                    required
                    type="number"
                    value={editForm.dailyPrice}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, dailyPrice: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--line)] px-2.5 py-1.5 outline-none focus:border-[var(--accent)] text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-[var(--muted)] uppercase">Mingguan (Rp)</label>
                  <input
                    type="number"
                    value={editForm.weeklyPrice}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, weeklyPrice: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--line)] px-2.5 py-1.5 outline-none focus:border-[var(--accent)] text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-[var(--muted)] uppercase">Bulanan (Rp)</label>
                  <input
                    type="number"
                    value={editForm.monthlyPrice}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, monthlyPrice: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--line)] px-2.5 py-1.5 outline-none focus:border-[var(--accent)] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-[var(--muted)] uppercase">Ganti Foto Gadget (Opsional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setEditImageFile(e.target.files?.[0] ?? null)}
                  className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs file:mr-2 file:border-0 file:bg-[var(--ink)] file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white file:rounded"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-[var(--muted)] uppercase">Deskripsi Perangkat</label>
                <textarea
                  required
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--line)] px-3 py-2 outline-none focus:border-[var(--accent)] text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="accent-[var(--accent)] h-4 w-4 rounded"
                  />
                  <span>Tampilkan di etalase katalog publik (Status: Aktif)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingPhone(null)}
                  className="px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)] rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-[var(--ink)] hover:bg-[var(--accent)] rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {editLoading ? "Menyimpan..." : "Simpan Perubahan Etalase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Profil Admin */}
      {tab === "profile" && (
        <form onSubmit={handleSaveAdminProfile} className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
            {/* Kolom Kiri: Foto Petugas & Identitas Kerja */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                  <svg className="h-4 w-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Foto Profil Staff Admin</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center">
                  <div className="relative mb-3">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm bg-gray-100 flex items-center justify-center">
                      {adminProfile.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={adminProfile.avatarUrl}
                          alt={adminProfile.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-black text-gray-400">
                          {adminProfile.name ? adminProfile.name.slice(0, 2).toUpperCase() : "AD"}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white border border-[var(--line)] shadow-sm flex items-center justify-center text-[var(--ink)] hover:bg-gray-50 transition cursor-pointer"
                      title="Ganti Foto Profil Staff"
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
                        if (file) handleAvatarUpload(file);
                      }}
                    />
                  </div>

                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--ink)] uppercase">
                    {adminProfile.name || "Petugas Admin"}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">{adminProfile.email}</p>

                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Staff Admin Aktif &amp; Terverifikasi
                    </span>
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

              {/* Data Identitas Petugas */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--line)] pb-3">
                  <svg className="h-4 w-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Identitas Petugas Admin</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Nama Lengkap Petugas
                  </label>
                  <input
                    type="text"
                    required
                    value={adminProfile.name}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Username Sistem
                  </label>
                  <input
                    type="text"
                    disabled
                    value={adminProfile.username}
                    className="w-full rounded-xl border border-[var(--line)] bg-gray-100 px-3.5 py-2.5 text-xs font-semibold text-gray-500 cursor-not-allowed outline-none font-mono"
                  />
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    Username digunakan untuk login ke panel admin Grent.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Jabatan / Role Operasional
                  </label>
                  <input
                    type="text"
                    required
                    value={adminProfile.role}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="Contoh: Super Admin Operasional"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Cabang / Lokasi Penugasan
                  </label>
                  <input
                    type="text"
                    required
                    value={adminProfile.branch}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, branch: e.target.value }))}
                    placeholder="Contoh: Grent Margonda Raya No. 525, Depok"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Kontak Resmi & Hak Akses */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--line)] pb-3">
                  <svg className="h-4 w-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Kontak Resmi Staff</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Email Staff Admin
                  </label>
                  <input
                    type="email"
                    required
                    value={adminProfile.email}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@staffadmin.id"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    Email resmi petugas untuk notifikasi sistem dan login staff.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp / Hotline Toko
                  </label>
                  <input
                    type="tel"
                    required
                    value={adminProfile.phone}
                    onChange={(e) => setAdminProfile((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="0895-6229-96629"
                    className="w-full rounded-xl border border-[var(--line)] bg-[#f8fafc] px-3.5 py-2.5 text-xs font-semibold text-[var(--ink)] focus:bg-white focus:border-[var(--accent)] outline-none transition"
                  />
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    Nomor WhatsApp yang digunakan untuk verifikasi pesanan dan dihubungi oleh pelanggan.
                  </p>
                </div>
              </div>

              {/* Hak Akses Sistem */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm space-y-3.5">
                <h4 className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
                  Hak Akses &amp; Wewenang Petugas
                </h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Akun ini memiliki hak akses administratif penuh pada operasional rental Grent:
                </p>

                <ul className="space-y-2 text-xs">
                  <li className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[var(--muted)]">1. Manajemen Booking &amp; Konfirmasi:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[var(--muted)]">2. Verifikasi Pembayaran Cash &amp; QRIS:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[var(--muted)]">3. Tambah &amp; Edit Etalase Gadget:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-[var(--muted)]">4. Cetak &amp; Verifikasi Invoice Resmi:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                  <li className="flex items-center justify-between py-1.5">
                    <span className="text-[var(--muted)]">5. Pengecekan Foto e-KTP Pelanggan:</span>
                    <span className="font-bold text-emerald-700">Aktif Penuh</span>
                  </li>
                </ul>

                <div className="pt-3 border-t border-[var(--line)]">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full rounded-xl bg-[var(--ink)] py-3 text-xs sm:text-sm font-bold text-white hover:bg-[var(--accent)] shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {savingProfile ? "Menyimpan Data..." : "Simpan Perubahan Profil Admin"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
