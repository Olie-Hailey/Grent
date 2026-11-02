import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Format gambar harus JPG, PNG, WEBP, atau GIF");
  }

  if (file.size > MAX_SIZE) {
    throw new Error("Ukuran gambar maksimal 5MB");
  }

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/${filename}`;
}
