/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
} = require("docx");

// Helper styles
const FONT_FAMILY = "Calibri";
const COLOR_PRIMARY = "0F172A"; // Slate 900
const COLOR_BRAND = "059669";   // Emerald 600
const COLOR_TEXT = "334155";    // Slate 700
const COLOR_MUTED = "64748B";   // Slate 500
const COLOR_BG_HEADER = "0F172A"; // Header background
const COLOR_BG_ZEBRA = "F8FAFC";
const COLOR_BORDER = "CBD5E1";

function createHeaderCell(text, widthPercent) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { fill: COLOR_BG_HEADER },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            color: "FFFFFF",
            font: FONT_FAMILY,
            size: 20, // 10pt
          }),
        ],
      }),
    ],
  });
}

function createBodyCell(text, widthPercent, isZebra = false, isBold = false) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: isZebra ? { fill: COLOR_BG_ZEBRA } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: isBold,
            color: isBold ? COLOR_PRIMARY : COLOR_TEXT,
            font: FONT_FAMILY,
            size: 19, // 9.5pt
          }),
        ],
      }),
    ],
  });
}

function createHeading1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        font: FONT_FAMILY,
        size: 28, // 14pt
        color: COLOR_BRAND,
      }),
    ],
  });
}

function createHeading2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        font: FONT_FAMILY,
        size: 24, // 12pt
        color: COLOR_PRIMARY,
      }),
    ],
  });
}

function createParagraph(text, isBold = false) {
  return new Paragraph({
    spacing: { before: 60, after: 80 },
    children: [
      new TextRun({
        text,
        bold: isBold,
        font: FONT_FAMILY,
        size: 22, // 11pt
        color: COLOR_TEXT,
      }),
    ],
  });
}

function createCallout(title, body) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BRAND },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BRAND },
      left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_BRAND },
      right: { style: BorderStyle.SINGLE, size: 8, color: COLOR_BRAND },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: "ECFDF5" },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: title + ": ",
                    bold: true,
                    font: FONT_FAMILY,
                    size: 21,
                    color: "065F46",
                  }),
                  new TextRun({
                    text: body,
                    font: FONT_FAMILY,
                    size: 20,
                    color: "047857",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// Data Kamus Data
const phoneRows = [
  ["id_phone", "String (PK)", "Wajib", "ID unik unit gadget (CUID)"],
  ["model", "String", "Wajib", "Nama tipe / seri gadget (contoh: MacBook Pro M3)"],
  ["category", "String", "Wajib", "Kategori produk: Laptop | Smartphone | Tablet"],
  ["storage", "String", "Wajib", "Kapasitas RAM, ROM, atau SSD unit"],
  ["color", "String", "Wajib", "Varian warna unit gadget"],
  ["dailyPrice", "Integer", "Wajib", "Tarif sewa per hari dalam mata uang Rupiah"],
  ["weeklyPrice", "Integer", "Opsional", "Tarif sewa mingguan (diskon sekitar 15%)"],
  ["monthlyPrice", "Integer", "Opsional", "Tarif sewa bulanan (diskon sekitar 35%)"],
  ["stock", "Integer", "Wajib (Dflt: 1)", "Jumlah stok unit fisik yang tersedia"],
  ["description", "String", "Wajib", "Ulasan spesifikasi dan deskripsi unit"],
  ["imageUrl", "String", "Opsional", "Path berkas foto unit di penyimpanan lokal"],
  ["imageEmoji", "String", "Wajib", "Ikon visual cadangan gadget"],
  ["isActive", "Boolean", "Wajib (Dflt: true)", "Status tampil di etalase sewa publik"],
  ["createdAt_phone", "DateTime", "Wajib", "Timestamp waktu pencatatan unit gadget"],
  ["updatedAt_phone", "DateTime", "Wajib", "Timestamp waktu terakhir unit diperbarui"],
];

const rentalRows = [
  ["id_rental", "String (PK)", "Wajib", "ID unik transaksi penyewaan (CUID)"],
  ["phoneId", "String (FK)", "Wajib", "Kunci tamu yang mereferensi ke id_phone"],
  ["customerName_rental", "String", "Wajib", "Nama lengkap pelanggan saat memesan sewa"],
  ["customerPhone_rental", "String", "Wajib", "Nomor telepon kontak aktif pelanggan"],
  ["customerEmail_rental", "String", "Wajib", "Email Google terdaftar pelanggan"],
  ["startDate", "DateTime", "Wajib", "Tanggal dan waktu mulai sewa"],
  ["endDate", "DateTime", "Wajib", "Tanggal dan waktu batas pengembalian sewa"],
  ["rentalPackage", "String", "Wajib", "Paket sewa: HARIAN | MINGGUAN | BULANAN"],
  ["deliveryMethod", "String", "Wajib", "Metode serah terima: PICKUP | DELIVERY"],
  ["deliveryAddress", "String", "Opsional", "Alamat kirim jika memilih delivery"],
  ["paymentMethod", "String", "Wajib", "Pilihan pembayaran: QRIS | CASH"],
  ["paymentStatus", "String", "Wajib", "Status pembayaran: UNPAID | PAID"],
  ["expiresAt", "DateTime", "Opsional", "Batas waktu kedaluwarsa pembayaran (24 jam)"],
  ["totalPrice", "Integer", "Wajib", "Total biaya sewa yang dihitung otomatis di server"],
  ["status", "Enum", "Wajib", "Status sewa: PENDING | APPROVED | ACTIVE | COMPLETED | CANCELLED"],
  ["notes", "String", "Opsional", "Catatan khusus atau permintaan pemesan"],
  ["createdAt_rental", "DateTime", "Wajib", "Waktu saat pemesanan dibuat pelanggan"],
  ["updatedAt_rental", "DateTime", "Wajib", "Waktu terakhir saat status sewa diperbarui"],
];

const customerRows = [
  ["id_customer", "String (PK)", "Wajib", "ID unik entitas profil pelanggan (UUID)"],
  ["email_customer", "String (Unique)", "Wajib", "Email unik dari akun Google autentikasi"],
  ["name_customer", "String", "Wajib", "Nama lengkap pemesan sesuai identitas e-KTP"],
  ["phone_customer", "String", "Wajib", "Nomor telepon / WhatsApp resmi pelanggan"],
  ["address_customer", "String", "Wajib", "Alamat domisili tempat tinggal pelanggan"],
  ["birthInfo_customer", "String", "Wajib", "Tempat dan tanggal lahir penyewa (TTL)"],
  ["idCardUrl_customer", "String", "Wajib", "URL file foto dokumen e-KTP fisik asli"],
  ["avatarUrl_customer", "String", "Opsional", "URL foto profil akun pelanggan"],
  ["isCompleted_customer", "Boolean", "Wajib", "Flag status apakah verifikasi KYC sudah tuntas"],
  ["createdAt_customer", "DateTime", "Wajib", "Waktu pertama kali akun melengkapi profil"],
  ["updatedAt_customer", "DateTime", "Wajib", "Waktu terakhir data profil diperbarui"],
];

const adminRows = [
  ["id_admin", "String (PK)", "Wajib", "ID unik profil staff operasional (UUID)"],
  ["username_admin", "String (Unique)", "Wajib", "Username autentikasi login petugas admin"],
  ["email_admin", "String", "Wajib", "Alamat email resmi operasional toko Grent"],
  ["name_admin", "String", "Wajib", "Nama lengkap petugas staff yang bertugas"],
  ["phone_admin", "String", "Wajib", "Nomor hotline operasional toko cabang"],
  ["role_admin", "String", "Wajib", "Wewenang operasional (Super Admin Operasional)"],
  ["branch_admin", "String", "Wajib", "Cabang toko penugasan (contoh: Margonda Depok)"],
  ["avatarUrl_admin", "String", "Opsional", "URL foto profil / avatar petugas staff"],
  ["createdAt_admin", "DateTime", "Wajib", "Waktu akun staff admin didaftarkan"],
  ["updatedAt_admin", "DateTime", "Wajib", "Waktu terakhir data profil admin diperbarui"],
];

const mappingRows = [
  ["id", "id_phone", "PHONE", "Kunci utama unik unit gadget"],
  ["id", "id_rental", "RENTAL", "Kunci utama transaksi pemesanan sewa"],
  ["id", "id_customer", "CUSTOMER_PROFILE", "Kunci utama profil data diri pelanggan"],
  ["id", "id_admin", "ADMIN_PROFILE", "Kunci utama profil identitas staff admin"],
  ["name / nama", "name_customer", "CUSTOMER_PROFILE", "Nama pelanggan terverifikasi sesuai e-KTP"],
  ["name / nama", "name_admin", "ADMIN_PROFILE", "Nama lengkap petugas operasional toko"],
  ["name / nama", "customerName_rental", "RENTAL", "Nama pemesan tercatat pada transaksi"],
  ["email", "email_customer", "CUSTOMER_PROFILE", "Email Google milik akun pelanggan"],
  ["email", "email_admin", "ADMIN_PROFILE", "Email operasional resmi cabang toko"],
  ["email", "customerEmail_rental", "RENTAL", "Email kontak saat transaksi sewa"],
  ["phone", "phone_customer", "CUSTOMER_PROFILE", "Nomor WhatsApp pelanggan terverifikasi"],
  ["phone", "phone_admin", "ADMIN_PROFILE", "Nomor kontak hotline operasional toko"],
  ["phone", "customerPhone_rental", "RENTAL", "Nomor telepon kontak tujuan rental"],
  ["avatarUrl", "avatarUrl_customer", "CUSTOMER_PROFILE", "Foto avatar / profil pelanggan"],
  ["avatarUrl", "avatarUrl_admin", "ADMIN_PROFILE", "Foto identitas staff operasional toko"],
  ["createdAt", "createdAt_phone", "PHONE", "Timestamp pembuatan unit gadget"],
  ["createdAt", "createdAt_rental", "RENTAL", "Timestamp pembuatan transaksi sewa"],
  ["createdAt", "createdAt_customer", "CUSTOMER_PROFILE", "Timestamp verifikasi profil customer"],
  ["createdAt", "createdAt_admin", "ADMIN_PROFILE", "Timestamp pembuatan akun admin"],
  ["updatedAt", "updatedAt_phone", "PHONE", "Timestamp update data unit gadget"],
  ["updatedAt", "updatedAt_rental", "RENTAL", "Timestamp perubahan status transaksi sewa"],
  ["updatedAt", "updatedAt_customer", "CUSTOMER_PROFILE", "Timestamp update profil pelanggan"],
  ["updatedAt", "updatedAt_admin", "ADMIN_PROFILE", "Timestamp update profil staff admin"],
];

function buildTable(headers, rows, widths) {
  const headerRow = new TableRow({
    children: headers.map((h, idx) => createHeaderCell(h, widths[idx])),
  });

  const bodyRows = rows.map((r, rowIdx) => {
    const isZebra = rowIdx % 2 === 1;
    return new TableRow({
      children: r.map((cellText, cellIdx) =>
        createBodyCell(cellText, widths[cellIdx], isZebra, cellIdx === 0)
      ),
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
    },
    rows: [headerRow, ...bodyRows],
  });
}

async function generate() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            color: COLOR_TEXT,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // Header Judul
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({
                text: "DOKUMEN SPESIFIKASI DAN DIAGRAM DATABASE",
                bold: true,
                font: FONT_FAMILY,
                size: 32, // 16pt
                color: COLOR_PRIMARY,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 280 },
            children: [
              new TextRun({
                text: "SISTEM APLIKASI WEB RENTAL GADGET (GRENT)",
                bold: true,
                font: FONT_FAMILY,
                size: 24, // 12pt
                color: COLOR_BRAND,
              }),
            ],
          }),

          createCallout(
            "Informasi Dokumen & Metadata Teknis",
            "Nama Proyek: Grent Gadget Rental (iphone-rental) | Database: SQLite (prisma/dev.db) | ORM: Prisma 6.19.3 | Framework: Next.js 16 App Router | Zona Waktu: Asia/Jakarta (WIB) | Mata Uang: Rupiah (IDR)."
          ),

          new Paragraph({ spacing: { before: 180, after: 120 }, children: [] }),

          // Bab 1
          createHeading1("1. Pendahuluan & Aturan Penamaan Variabel Unik"),
          createParagraph(
            "Dalam perancangan basis data relasional untuk aplikasi Grent, terdapat beberapa entitas yang memiliki nama kolom/variabel identik seperti 'id', 'name', 'email', 'phone', 'avatarUrl', 'createdAt', dan 'updatedAt'. Jika nama variabel tersebut dibiarkan sama secara generik, dapat menimbulkan ambiguitas data saat melakukan query SQL kompleks, pembuatan laporan, maupun ketika operasi penggabungan (JOIN) antartabel dijalankan."
          ),
          createParagraph(
            "Oleh karena itu, sesuai dengan instruksi yang ditetapkan, seluruh variabel yang memiliki nama sama di lebih dari satu tabel telah disesuaikan menggunakan konvensi: nama_namatabel (seperti id_phone, name_customer, email_admin, createdAt_rental). Langkah ini memastikan setiap atribut memiliki identitas yang unik, jelas, dan mudah dijelaskan dalam laporan tugas kuliah maupun saat presentasi kepada dosen."
          ),

          // Tabel Pemetaan Variabel
          createHeading2("Tabel 1.1: Pemetaan Variabel Disambiguasi (nama_namatabel)"),
          buildTable(
            ["Variabel Asal", "Nama Variabel Unik", "Tabel Asosiasi", "Fungsi dan Keterangan"],
            mappingRows,
            [20, 25, 25, 30]
          ),

          new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

          // Bab 2
          createHeading1("2. Diagram Entity-Relationship (ERD) & Struktur Hubungan"),
          createParagraph(
            "Sistem basis data Grent tersusun atas 4 entitas utama yang saling terhubung untuk mendukung siklus penyewaan gadget, verifikasi identitas pengguna (KYC), dan verifikasi pembayaran oleh admin toko:"
          ),
          createParagraph(
            "1. PHONE: Menyimpan katalog unit fisik gadget (Laptop, Smartphone, Tablet) beserta tarif harian, mingguan, bulanan, stok fisik, dan spesifikasi unit.",
            true
          ),
          createParagraph(
            "2. RENTAL: Menyimpan seluruh riwayat dan transaksi aktif pemesanan sewa, tanggal peminjaman, durasi hari, metode pembayaran (QRIS/Cash), total harga, dan status pesanan.",
            true
          ),
          createParagraph(
            "3. CUSTOMER_PROFILE: Menyimpan identitas resmi pelanggan terverifikasi akun Google yang mencakup Nama KTP, NIK, Tempat Tanggal Lahir (TTL), No. WhatsApp, Alamat Domisili, dan foto e-KTP asli.",
            true
          ),
          createParagraph(
            "4. ADMIN_PROFILE: Menyimpan profil staff operasional cabang yang berwenang mengonfirmasi pembayaran tunai (Cash) dan memverifikasi invoice serah terima unit di toko.",
            true
          ),

          // Representasi Struktur ERD
          createHeading2("Bagan Relasi Antar-Entitas (ERD Model):"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
              left: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
              right: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    shading: { fill: "F8FAFC" },
                    margins: { top: 140, bottom: 140, left: 160, right: 160 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "[ PHONE ] (1) ------------ (N) [ RENTAL ]",
                            bold: true,
                            font: "Consolas",
                            size: 20,
                            color: COLOR_PRIMARY,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "  Relasi: Satu unit gadget dapat disewa dalam banyak transaksi rental di tanggal berbeda.",
                            font: FONT_FAMILY,
                            size: 19,
                            color: COLOR_MUTED,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 80 },
                        children: [
                          new TextRun({
                            text: "[ CUSTOMER_PROFILE ] (1) -- (N) [ RENTAL ]",
                            bold: true,
                            font: "Consolas",
                            size: 20,
                            color: COLOR_PRIMARY,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "  Relasi: Satu customer terverifikasi e-KTP (KYC) dapat melakukan pemesanan sewa berkali-kali.",
                            font: FONT_FAMILY,
                            size: 19,
                            color: COLOR_MUTED,
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 80 },
                        children: [
                          new TextRun({
                            text: "[ ADMIN_PROFILE ] (1) ----- (N) [ RENTAL ]",
                            bold: true,
                            font: "Consolas",
                            size: 20,
                            color: COLOR_PRIMARY,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "  Relasi: Petugas admin memvalidasi pembayaran tunai (Cash) dan status serah terima unit di toko.",
                            font: FONT_FAMILY,
                            size: 19,
                            color: COLOR_MUTED,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

          // Bab 3: Kamus Data Lengkap
          createHeading1("3. Kamus Data (Data Dictionary) Entitas Sistem"),

          createHeading2("3.1 Entitas Tabel: PHONE (Katalog Gadget)"),
          createParagraph(
            "Tabel ini merepresentasikan data etalase dan stok fisik gadget rental yang tersedia di toko Grent (Laptop MacBook/ThinkPad/ROG, Smartphone iPhone, dan Tablet iPad)."
          ),
          buildTable(
            ["Nama Variabel Unik", "Tipe Data", "Sifat Kolom", "Keterangan Atribut"],
            phoneRows,
            [26, 20, 20, 34]
          ),

          new Paragraph({ spacing: { before: 200, after: 100 }, children: [] }),

          createHeading2("3.2 Entitas Tabel: RENTAL (Transaksi Penyewaan)"),
          createParagraph(
            "Tabel ini merepresentasikan seluruh siklus transaksi pemesanan sewa gadget, mulai dari pemilihan durasi hari, opsi paket, metode bayar (QRIS/Cash), hingga status penyelesaian unit."
          ),
          buildTable(
            ["Nama Variabel Unik", "Tipe Data", "Sifat Kolom", "Keterangan Atribut"],
            rentalRows,
            [26, 20, 20, 34]
          ),

          new Paragraph({ spacing: { before: 200, after: 100 }, children: [] }),

          createHeading2("3.3 Entitas Tabel: CUSTOMER_PROFILE (Data Diri & Verifikasi KYC)"),
          createParagraph(
            "Tabel ini menyimpan data pribadi dan berkas e-KTP pelanggan yang telah login melalui Google OAuth. Pelanggan wajib melengkapi data ini sebelum diperbolehkan menyewa gadget."
          ),
          buildTable(
            ["Nama Variabel Unik", "Tipe Data", "Sifat Kolom", "Keterangan Atribut"],
            customerRows,
            [26, 20, 20, 34]
          ),

          new Paragraph({ spacing: { before: 200, after: 100 }, children: [] }),

          createHeading2("3.4 Entitas Tabel: ADMIN_PROFILE (Identitas Staff Operasional)"),
          createParagraph(
            "Tabel ini mencatat profil petugas staff operasional toko cabang yang memegang hak akses verifikasi sistem, konfirmasi pembayaran fisik di kasir toko, dan pemantauan rental realtime."
          ),
          buildTable(
            ["Nama Variabel Unik", "Tipe Data", "Sifat Kolom", "Keterangan Atribut"],
            adminRows,
            [26, 20, 20, 34]
          ),

          new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

          // Bab 4: Aturan Bisnis & Integritas Data
          createHeading1("4. Aturan Bisnis & Integritas Basis Data (Domain Rules)"),
          createParagraph(
            "Untuk menjamin konsistensi data pada saat aplikasi didemokan di hadapan dosen penguji, sistem menerapkan aturan integritas database berikut:"
          ),
          createParagraph(
            "1. Validasi Overlapping Jadwal Sewa: Sistem di sisi server memeriksa bahwa satu unit gadget (phoneId) tidak dapat disewa dua kali pada rentang tanggal yang bertumpuk (startDate hingga endDate). Jika tanggal bertabrakan, sistem akan menolak pemesanan.",
            true
          ),
          createParagraph(
            "2. Integritas Perhitungan Biaya (Server-side Calculation): Nilai totalPrice dihitung ulang sepenuhnya di server dengan rumus (Tarif Harian x Jumlah Hari) setelah dikurangi diskon paket mingguan (15%) atau bulanan (35%). Angka dari client tidak dipercaya secara mentah untuk mencegah manipulasi harga.",
            true
          ),
          createParagraph(
            "3. Proteksi Wajib Verifikasi KYC: Kolom isCompleted_customer pada CUSTOMER_PROFILE harus bernilai True sebelum pesanan sewa dapat disimpan ke dalam tabel RENTAL. Jika belum lengkap, sistem akan menampilkan pop-up formulir pengisian e-KTP.",
            true
          ),
          createParagraph(
            "4. Alur Pembayaran Tunai (Cash): Pesanan dengan paymentMethod = CASH akan tersimpan dengan status UNPAID dan status sewa PENDING. Gadget baru dapat diserahkan setelah petugas Admin mengklik tombol 'Konfirmasi Pembayaran Cash' pada dashboard yang mengubah status menjadi PAID dan APPROVED.",
            true
          ),
          createParagraph(
            "5. Alur Pembayaran Digital (QRIS): Pesanan QRIS dilengkapi atribut expiresAt yang berlaku selama 24 jam realtime sejak pemesanan dibuat. Pelanggan yang telah membayar akan langsung memperoleh lembar invoice resmi untuk ditunjukkan kepada petugas toko saat pengambilan unit.",
            true
          ),

          new Paragraph({ spacing: { before: 300, after: 100 }, children: [] }),

          // Penutup
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "--- Akhir Dokumen Spesifikasi Database Grent ---",
                italics: true,
                font: FONT_FAMILY,
                size: 20,
                color: COLOR_MUTED,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath1 = path.join(process.cwd(), "Diagram_Database_Grent.docx");
  const outPath2 = path.join(process.cwd(), "public", "Diagram_Database_Grent.docx");

  fs.writeFileSync(outPath1, buffer);
  fs.writeFileSync(outPath2, buffer);
  console.log("Successfully generated:", outPath1);
  console.log("Successfully generated:", outPath2);
}

generate().catch(console.error);
