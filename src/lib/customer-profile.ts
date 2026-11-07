import { prisma } from "@/lib/prisma";

export type CustomerProfileData = {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  birthInfo: string;
  idCardUrl: string;
  avatarUrl: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

let tableEnsured = false;

export const VERIFIED_TESTER_ACCOUNTS: Record<
  string,
  {
    name: string;
    phone: string;
    address: string;
    birthInfo: string;
    idCardUrl: string;
    avatarUrl: string;
  }
> = {
  "rafierbakti17@gmail.com": {
    name: "Rafi Erbakti",
    phone: "0812-9876-5432",
    address: "Jl. Margonda Raya No. 100, Beji, Depok, Jawa Barat 16424",
    birthInfo: "Jakarta, 17 Agustus 2002",
    idCardUrl: "/ktp-verified-demo.svg",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=RafiErbakti&backgroundColor=1a73e8",
  },
  "backlegaming17@gmail.com": {
    name: "Rafi",
    phone: "0812-3456-7890",
    address: "Jl. Margonda Raya No. 100, Depok, Jawa Barat",
    birthInfo: "Jakarta, 17 Agustus 2002",
    idCardUrl: "/ktp-verified-demo.svg",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Rafi&backgroundColor=494c50",
  },
  "budisantoso@gmail.com": {
    name: "Budi Santoso",
    phone: "0812-9876-5432",
    address: "Jl. Akses UI No. 45, Kelapa Dua, Depok",
    birthInfo: "Surabaya, 12 Mei 2001",
    idCardUrl: "/ktp-verified-demo.svg",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Budi%20Santoso&backgroundColor=0f9f8a",
  },
};

export async function ensureCustomerProfileTable() {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS CustomerProfile (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        birthInfo TEXT,
        idCardUrl TEXT,
        avatarUrl TEXT,
        isCompleted INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    tableEnsured = true;
  } catch (err) {
    console.error("Failed to ensure CustomerProfile table:", err);
  }
}

export async function getCustomerProfileByEmail(email: string): Promise<CustomerProfileData | null> {
  await ensureCustomerProfileTable();
  const cleanEmail = email.trim().toLowerCase();

  try {
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT * FROM CustomerProfile WHERE email = ? LIMIT 1`,
      cleanEmail
    )) as Array<{
      id: string;
      email: string;
      name: string;
      phone: string | null;
      address: string | null;
      birthInfo: string | null;
      idCardUrl: string | null;
      avatarUrl: string | null;
      isCompleted: number;
      createdAt: string;
      updatedAt: string;
    }>;

    // Jika belum ada atau belum lengkap tetapi termasuk akun tester khusus:
    if (!rows || rows.length === 0 || rows[0].isCompleted === 0) {
      const preset = VERIFIED_TESTER_ACCOUNTS[cleanEmail];
      if (preset) {
        return await upsertCustomerProfile({
          email: cleanEmail,
          name: preset.name,
          phone: preset.phone,
          address: preset.address,
          birthInfo: preset.birthInfo,
          idCardUrl: preset.idCardUrl,
          avatarUrl: preset.avatarUrl,
        });
      }
    }

    if (!rows || rows.length === 0) return null;
    const r = rows[0];

    const isFullyFilled = Boolean(
      r.name?.trim() &&
      r.phone?.trim() &&
      r.address?.trim() &&
      r.birthInfo?.trim() &&
      r.idCardUrl?.trim()
    );

    return {
      id: r.id,
      email: r.email,
      name: r.name,
      phone: r.phone || "",
      address: r.address || "",
      birthInfo: r.birthInfo || "",
      idCardUrl: r.idCardUrl || "",
      avatarUrl: r.avatarUrl || "",
      isCompleted: isFullyFilled,
      createdAt: String(r.createdAt),
      updatedAt: String(r.updatedAt),
    };
  } catch {
    return null;
  }
}

export async function upsertCustomerProfile({
  email,
  name,
  phone,
  address,
  birthInfo,
  idCardUrl,
  avatarUrl,
}: {
  email: string;
  name: string;
  phone?: string;
  address?: string;
  birthInfo?: string;
  idCardUrl?: string;
  avatarUrl?: string;
}): Promise<CustomerProfileData> {
  await ensureCustomerProfileTable();
  const cleanEmail = email.trim().toLowerCase();

  const existing = await (async () => {
    try {
      const r = (await prisma.$queryRawUnsafe(
        `SELECT * FROM CustomerProfile WHERE email = ? LIMIT 1`,
        cleanEmail
      )) as Array<Record<string, unknown>>;
      return r && r.length > 0 ? r[0] : null;
    } catch {
      return null;
    }
  })();

  const nowStr = new Date().toISOString();

  const finalName = (name || (existing?.name as string) || "Customer Grent").trim();
  const finalPhone = (phone ?? (existing?.phone as string) ?? "").trim();
  const finalAddress = (address ?? (existing?.address as string) ?? "").trim();
  const finalBirthInfo = (birthInfo ?? (existing?.birthInfo as string) ?? "").trim();
  const finalIdCardUrl = (idCardUrl ?? (existing?.idCardUrl as string) ?? "").trim();
  const finalAvatarUrl = (avatarUrl ?? (existing?.avatarUrl as string) ?? "").trim();

  // Wajib isi: Foto KTP, Nama, Alamat, TTL, Email dan nomor telepon
  const isCompleted = Boolean(
    finalName &&
    cleanEmail &&
    finalPhone &&
    finalAddress &&
    finalBirthInfo &&
    finalIdCardUrl
  );

  const isCompletedInt = isCompleted ? 1 : 0;

  if (existing) {
    await prisma.$executeRawUnsafe(
      `UPDATE CustomerProfile
       SET name = ?, phone = ?, address = ?, birthInfo = ?, idCardUrl = ?, avatarUrl = ?, isCompleted = ?, updatedAt = ?
       WHERE email = ?`,
      finalName,
      finalPhone,
      finalAddress,
      finalBirthInfo,
      finalIdCardUrl,
      finalAvatarUrl,
      isCompletedInt,
      nowStr,
      cleanEmail
    );
  } else {
    const id = `cp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO CustomerProfile (id, email, name, phone, address, birthInfo, idCardUrl, avatarUrl, isCompleted, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      cleanEmail,
      finalName,
      finalPhone,
      finalAddress,
      finalBirthInfo,
      finalIdCardUrl,
      finalAvatarUrl,
      isCompletedInt,
      nowStr,
      nowStr
    );
  }

  const updatedRows = (await prisma.$queryRawUnsafe(
    `SELECT * FROM CustomerProfile WHERE email = ? LIMIT 1`,
    cleanEmail
  )) as Array<{
    id: string;
    email: string;
    name: string;
    phone: string | null;
    address: string | null;
    birthInfo: string | null;
    idCardUrl: string | null;
    avatarUrl: string | null;
    isCompleted: number;
    createdAt: string;
    updatedAt: string;
  }>;

  if (!updatedRows || updatedRows.length === 0) {
    throw new Error("Gagal menyimpan profil customer");
  }

  const u = updatedRows[0];
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone || "",
    address: u.address || "",
    birthInfo: u.birthInfo || "",
    idCardUrl: u.idCardUrl || "",
    avatarUrl: u.avatarUrl || "",
    isCompleted: Boolean(u.isCompleted),
    createdAt: String(u.createdAt),
    updatedAt: String(u.updatedAt),
  };
}
