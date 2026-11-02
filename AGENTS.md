<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

## Gambaran Proyek
Aplikasi web rental gadget (nama paket: `iphone-rental`) yang dibuat untuk memenuhi tugas kuliah. Fitur utama:
- Katalog gadget dengan detail, harga sewa per hari, dan status ketersediaan
- Pemesanan/penyewaan (pilih tanggal mulai dan selesai, total biaya dihitung otomatis)
- Login pengguna (email/JWT dan Google OAuth) dengan peran customer dan admin
- Dashboard admin untuk mengelola gadget, pesanan, dan pengguna
- Upload file (misalnya foto gadget)

Prioritas: aplikasi berjalan stabil dan mudah didemokan. Utamakan kode sederhana dan mudah dijelaskan daripada solusi rumit.

## Tech Stack
- Framework: Next.js 16.3.8 dengan App Router (`src/app/`)
- UI: React 19.2.8
- Bahasa: TypeScript 5 (strict). Path alias `@/*` mengarah ke `src/*`
- Styling: Tailwind CSS v4 (via `@tailwindcss/postcss`). Tidak ada `tailwind.config.js` klasik, konfigurasi lewat CSS.
- Database: SQLite (`prisma/dev.db`)
- ORM: Prisma 6.19.3
- Autentikasi: JWT kustom memakai `jose`, ditambah Google OAuth (`/api/auth/google`)
- Library lain: `docx` dan `mammoth` (membuat/membaca file Word). Cek `src/lib/` sebelum menambah library serupa.
- Package manager: npm. Jangan mencampur dengan pnpm/yarn.

## Struktur Folder
```
src/app/         -> halaman dan API route (App Router)
src/components/  -> komponen UI React yang dipakai ulang
src/lib/         -> utilitas: koneksi database, auth, upload file, logika data
prisma/          -> schema.prisma, seed.ts, dev.db
public/          -> aset statis
```

## Perintah Penting
- Install dependensi: `npm install`
- Dev server: `npm run dev` (http://localhost:3000)
- Build produksi: `npm run build` (otomatis menjalankan `prisma generate`)
- Jalankan hasil build: `npm run start`
- Lint: `npm run lint`
- Sinkronkan skema ke database: `npm run db:push`
- Isi data contoh: `npm run db:seed`
- Lihat isi database: `npm run db:studio`

Jalankan `npm run lint` dan `npm run build` sebelum menyatakan pekerjaan selesai.

## Konvensi Kode
- Komponen React: PascalCase (`GadgetCard.tsx`). File lain: kebab-case. Variabel dan fungsi: camelCase.
- Gunakan Server Component secara default. Tambahkan `"use client"` hanya jika butuh state, event handler, atau browser API.
- Impor memakai alias `@/` (contoh: `@/lib/db`), bukan path relatif panjang seperti `../../../`.
- Akses database lewat satu instance Prisma Client bersama di `src/lib/`. Jangan membuat `new PrismaClient()` baru di tempat lain.
- Hindari tipe `any`. Definisikan tipe yang jelas.
- Komentar kode dalam bahasa Indonesia, singkat, hanya untuk logika yang tidak jelas.
- Teks yang tampil ke pengguna memakai bahasa Indonesia.
- Pecah komponen yang lebih dari sekitar 200 baris.

## Catatan Versi (Penting)
Next.js 16 dan React 19 sudah berbeda dari versi lama yang banyak ada di contoh internet. Jangan menebak dari ingatan:
- Gunakan App Router, bukan Pages Router. Jangan membuat folder `pages/`.
- Di versi baru, API seperti `params`, `searchParams`, `cookies()`, dan `headers()` bersifat asinkron, jadi harus di-`await`.
- Jika ragu soal API atau konvensi Next.js 16 (misalnya middleware/proxy, caching), cek dokumentasi resmi atau file yang sudah ada di proyek sebelum menulis kode baru.
- Tailwind v4: gunakan sintaks v4, bukan direktif `@tailwind base/components/utilities` versi lama.

## Database (Prisma + SQLite)
- Sumber kebenaran skema ada di `prisma/schema.prisma`.
- Proyek ini memakai `prisma db push` (bukan `migrate`). Setelah mengubah skema, jalankan `npm run db:push`, lalu `npx prisma generate` jika tipe belum berubah.
- Perbarui `prisma/seed.ts` jika skema berubah supaya data contoh tetap valid.
- Jangan menghapus atau mereset `prisma/dev.db` tanpa konfirmasi.

## Autentikasi dan Keamanan
- Token JWT dibuat dan diverifikasi dengan `jose`. Letakkan logikanya di `src/lib/` (auth), jangan menyebar di banyak file.
- Cek peran (customer/admin) di sisi server pada setiap API route dan halaman admin. Jangan hanya menyembunyikan tombol di UI.
- Secret JWT, Google client ID, dan Google client secret hanya dari `.env`. Jangan ditulis di kode.
- Validasi semua input di API route (tipe, panjang, format). Validasi upload file: tipe dan ukuran dibatasi.

## Aturan Domain (Rental)
- Satu gadget tidak boleh disewa dua kali pada rentang tanggal yang bertumpuk. Validasi di server.
- Total biaya = harga sewa per hari x jumlah hari. Hitung ulang di server, jangan percaya angka dari client.
- Tanggal selesai harus lebih besar atau sama dengan tanggal mulai.
- Status pesanan mengikuti alur yang sudah didefinisikan di skema Prisma. Jangan menambah status baru tanpa konfirmasi.

## Alur Kerja
- Kerjakan perubahan kecil dan fokus, satu fitur per langkah.
- Pesan commit singkat dalam bahasa Indonesia, awali dengan jenis perubahan: `fitur:`, `perbaikan:`, `refaktor:`, `dokumen:`.
- Jangan commit atau push tanpa diminta.

## Batasan (Jangan Dilakukan)
- Jangan membaca, mengubah, atau menampilkan isi `.env`.
- Jangan mengedit `node_modules/`, `.next/`, atau file generated Prisma.
- Jangan menambah dependensi baru tanpa konfirmasi.
- Jangan menjalankan perintah destruktif (`rm -rf`, reset database, hapus data) tanpa konfirmasi.
- Jangan merombak struktur proyek besar-besaran tanpa izin.
- Jangan meng-commit `prisma/dev.db` atau file upload pengguna jika sudah masuk `.gitignore`.

## Catatan Khusus
- Zona waktu: Asia/Jakarta (WIB). Format mata uang: Rupiah, contoh `Rp 150.000`.
- Jika port 3000 bentrok: `npm run dev -- -p 3001`.
- Redirect URI Google OAuth harus sama persis dengan yang terdaftar di Google Cloud Console (termasuk port).

## Cara Berkomunikasi
- Jawab dalam bahasa Indonesia.
- Setelah selesai, sebutkan file apa saja yang diubah dan alasannya secara singkat.
- Jika permintaan ambigu, ajukan satu pertanyaan klarifikasi sebelum mengerjakan.
- Jelaskan kode dengan bahasa sederhana, karena pemilik proyek perlu memahaminya untuk presentasi ke dosen.
