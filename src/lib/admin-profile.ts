import { prisma } from "@/lib/prisma";
import { getAdminCredentials } from "@/lib/auth";

export type AdminProfileData = {
  id: string;
  username: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  branch: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
};

let tableEnsured = false;

export async function ensureAdminProfileTable() {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS AdminProfile (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'Staff Admin Operasional',
        branch TEXT DEFAULT 'Grent Margonda Depok',
        avatarUrl TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    tableEnsured = true;
  } catch (err) {
    console.error("Failed to ensure AdminProfile table:", err);
  }
}

export async function getAdminProfile(username = "admin"): Promise<AdminProfileData> {
  await ensureAdminProfileTable();
  const creds = getAdminCredentials();

  try {
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT * FROM AdminProfile WHERE username = ? LIMIT 1`,
      username
    )) as Array<{
      id: string;
      username: string;
      email: string;
      name: string;
      phone: string | null;
      role: string | null;
      branch: string | null;
      avatarUrl: string | null;
      createdAt: string;
      updatedAt: string;
    }>;

    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        id: r.id,
        username: r.username,
        email: r.email,
        name: r.name,
        phone: r.phone || "",
        role: r.role || "Staff Admin Operasional",
        branch: r.branch || "Grent Margonda Depok",
        avatarUrl: r.avatarUrl || "",
        createdAt: String(r.createdAt),
        updatedAt: String(r.updatedAt),
      };
    }
  } catch {
    // ignore
  }

  // Jika belum ada di database, buat profil default dari kredensial admin
  const defaultProfile: AdminProfileData = {
    id: "admin_default",
    username: creds.username || "admin",
    email: creds.email || "admin@staffadmin.id",
    name: "Petugas Admin Grent",
    phone: "0895-6229-96629",
    role: "Super Admin Operasional",
    branch: "Grent Margonda Raya, Depok",
    avatarUrl: "/logo.png",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO AdminProfile (id, username, email, name, phone, role, branch, avatarUrl, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      defaultProfile.id,
      defaultProfile.username,
      defaultProfile.email,
      defaultProfile.name,
      defaultProfile.phone,
      defaultProfile.role,
      defaultProfile.branch,
      defaultProfile.avatarUrl,
      defaultProfile.createdAt,
      defaultProfile.updatedAt
    );
  } catch {
    // fallback silent
  }

  return defaultProfile;
}

export async function updateAdminProfile({
  username = "admin",
  name,
  email,
  phone,
  role,
  branch,
  avatarUrl,
}: {
  username?: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  branch?: string;
  avatarUrl?: string;
}): Promise<AdminProfileData> {
  await ensureAdminProfileTable();
  const current = await getAdminProfile(username);
  const nowStr = new Date().toISOString();

  const finalName = (name || current.name).trim();
  const finalEmail = (email || current.email).trim();
  const finalPhone = (phone ?? current.phone).trim();
  const finalRole = (role ?? current.role).trim();
  const finalBranch = (branch ?? current.branch).trim();
  const finalAvatar = (avatarUrl ?? current.avatarUrl).trim();

  await prisma.$executeRawUnsafe(
    `UPDATE AdminProfile
     SET name = ?, email = ?, phone = ?, role = ?, branch = ?, avatarUrl = ?, updatedAt = ?
     WHERE username = ?`,
    finalName,
    finalEmail,
    finalPhone,
    finalRole,
    finalBranch,
    finalAvatar,
    nowStr,
    username
  );

  return getAdminProfile(username);
}
