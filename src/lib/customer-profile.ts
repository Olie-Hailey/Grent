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
  try {
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT * FROM CustomerProfile WHERE email = ? LIMIT 1`,
      email
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

  const existing = await getCustomerProfileByEmail(email);
  const nowStr = new Date().toISOString();

  const finalName = (name || existing?.name || "Customer Grent").trim();
  const finalPhone = (phone ?? existing?.phone ?? "").trim();
  const finalAddress = (address ?? existing?.address ?? "").trim();
  const finalBirthInfo = (birthInfo ?? existing?.birthInfo ?? "").trim();
  const finalIdCardUrl = (idCardUrl ?? existing?.idCardUrl ?? "").trim();
  const finalAvatarUrl = (avatarUrl ?? existing?.avatarUrl ?? "").trim();

  // Wajib isi: Foto KTP, Nama, Alamat, TTL, Email dan nomor telepon
  const isCompleted = Boolean(
    finalName &&
    email.trim() &&
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
      email
    );
  } else {
    const id = `cp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO CustomerProfile (id, email, name, phone, address, birthInfo, idCardUrl, avatarUrl, isCompleted, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      email,
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

  const updated = await getCustomerProfileByEmail(email);
  if (!updated) {
    throw new Error("Gagal menyimpan profil customer");
  }
  return updated;
}
