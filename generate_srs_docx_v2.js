const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, AlignmentType,
  PageBreak, BorderStyle, ShadingType, ImageRun, Footer, PageNumber
} = require('docx');

// Helper for paragraphs
function p(text, opts = {}) {
  const runs = [];
  if (typeof text === 'string') {
    runs.push(new TextRun({
      text,
      font: opts.font || 'Calibri',
      size: opts.size || 22, // 11pt
      bold: opts.bold || false,
      italics: opts.italics || false,
      color: opts.color || '1A1A1A',
    }));
  } else if (Array.isArray(text)) {
    text.forEach(t => runs.push(new TextRun({
      font: 'Calibri',
      size: t.size || opts.size || 22,
      bold: t.bold || false,
      italics: t.italics || false,
      color: t.color || '1A1A1A',
      text: t.text,
      break: t.break,
    })));
  }
  return new Paragraph({
    alignment: opts.alignment || AlignmentType.LEFT,
    spacing: {
      before: opts.spaceBefore !== undefined ? opts.spaceBefore : 60,
      after: opts.spaceAfter !== undefined ? opts.spaceAfter : 80,
      line: 276, // 1.15 line spacing
    },
    indent: opts.indent ? { left: opts.indent } : undefined,
    children: runs,
    pageBreakBefore: opts.pageBreakBefore || false,
  });
}

function headingBab(title) {
  return new Paragraph({
    pageBreakBefore: true,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 180 },
    alignment: AlignmentType.LEFT,
    children: [
      new TextRun({
        text: title,
        bold: true,
        font: 'Calibri',
        size: 28, // 14pt
        color: '0F294A',
      }),
    ],
  });
}

function headingSub(title, level = 2) {
  return new Paragraph({
    heading: level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 100 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        font: 'Calibri',
        size: level === 2 ? 24 : 22,
        color: level === 2 ? '1E406B' : '2C5282',
      }),
    ],
  });
}

const noBorder = {
  style: BorderStyle.NONE,
  size: 0,
  color: 'FFFFFF',
};

const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: 'D0D7DE' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D0D7DE' },
  left: { style: BorderStyle.SINGLE, size: 4, color: 'D0D7DE' },
  right: { style: BorderStyle.SINGLE, size: 4, color: 'D0D7DE' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'E1E4E8' },
  insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'E1E4E8' },
};

function cell(text, opts = {}) {
  const contentRuns = [];
  if (typeof text === 'string') {
    contentRuns.push(new TextRun({
      text,
      bold: opts.bold || false,
      italics: opts.italics || false,
      font: 'Calibri',
      size: opts.size || 20, // 10pt
      color: opts.color || '1A1A1A',
    }));
  } else if (Array.isArray(text)) {
    text.forEach(t => contentRuns.push(new TextRun({
      text: t.text,
      bold: t.bold || false,
      italics: t.italics || false,
      font: 'Calibri',
      size: t.size || 20,
      color: t.color || '1A1A1A',
    })));
  }

  return new TableCell({
    shading: opts.fill ? { type: ShadingType.SOLID, fill: opts.fill, color: opts.fill } : undefined,
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    borders: opts.noBorder ? {
      top: noBorder, bottom: noBorder, left: noBorder, right: noBorder
    } : undefined,
    children: [new Paragraph({
      alignment: opts.alignment || AlignmentType.LEFT,
      spacing: { before: 0, after: 0, line: 240 },
      children: contentRuns,
    })],
  });
}

function styledTable(headers, rows, widths = null) {
  const headerRow = new TableRow({
    children: headers.map((h, i) => cell(h, {
      bold: true,
      fill: '1E3A5F',
      color: 'FFFFFF',
      width: widths ? widths[i] : Math.floor(100 / headers.length),
    })),
  });

  const dataRows = rows.map((row, rIdx) => new TableRow({
    children: row.map((c, cIdx) => cell(c, {
      fill: rIdx % 2 === 0 ? 'F8FAFC' : 'FFFFFF',
      width: widths ? widths[cIdx] : Math.floor(100 / row.length),
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorders,
    rows: [headerRow, ...dataRows],
  });
}

// ─────────────────────────────────────────────
// BUILD SECTION 1: COVER
// ─────────────────────────────────────────────
const coverChildren = [];

coverChildren.push(p('SPESIFIKASI KEBUTUHAN', {
  bold: true,
  size: 34,
  alignment: AlignmentType.CENTER,
  spaceBefore: 120,
  spaceAfter: 40,
  color: '0A192F',
}));
coverChildren.push(p('PERANGKAT LUNAK (SRS)', {
  bold: true,
  size: 34,
  alignment: AlignmentType.CENTER,
  spaceBefore: 0,
  spaceAfter: 200,
  color: '0A192F',
}));

coverChildren.push(p('RENTGADGET', {
  bold: true,
  size: 30,
  alignment: AlignmentType.CENTER,
  spaceBefore: 60,
  spaceAfter: 40,
  color: '1E406B',
}));
coverChildren.push(p('Sistem Informasi dan Manajemen Rental Gadget Berbasis Web', {
  italics: true,
  size: 22,
  alignment: AlignmentType.CENTER,
  spaceBefore: 0,
  spaceAfter: 260,
  color: '4A5568',
}));

// Logo Gunadarma
const logoPath = path.join(__dirname, 'logo_gunadarma.png');
if (fs.existsSync(logoPath)) {
  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 260 },
    children: [
      new ImageRun({
        data: fs.readFileSync(logoPath),
        transformation: {
          width: 175,
          height: 175,
        },
      }),
    ],
  }));
} else {
  coverChildren.push(p('[ LOGO UNIVERSITAS GUNADARMA ]', {
    alignment: AlignmentType.CENTER,
    bold: true,
    spaceBefore: 200,
    spaceAfter: 200,
  }));
}

coverChildren.push(p('Disusun oleh:', {
  bold: true,
  size: 22,
  alignment: AlignmentType.CENTER,
  spaceBefore: 140,
  spaceAfter: 80,
}));

// Table of authors (matching friend's style)
const authorRows = [
  ['ADLI ENDRA ESTIAWAN', '10124038'],
  ['ALFIAN P. NAFITHORIQ', '10124101'],
  ['RAFI ERBAKTI', '11124118'],
  ['RAZZAN RAFIFUDIN MUTHI', '11124191'],
  ['RIZKY BAGUS PAMBUDI', '11124244'],
];

const authorTable = new Table({
  width: { size: 75, type: WidthType.PERCENTAGE },
  alignment: AlignmentType.CENTER,
  borders: {
    top: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' },
    left: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' },
    right: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' },
  },
  rows: authorRows.map(row => new TableRow({
    children: [
      cell(row[0], { bold: true, width: 65, size: 21 }),
      cell(row[1], { alignment: AlignmentType.CENTER, width: 35, size: 21 }),
    ],
  })),
});
coverChildren.push(authorTable);

coverChildren.push(p('', { spaceBefore: 280, spaceAfter: 0 }));
coverChildren.push(p('FAKULTAS ILMU KOMPUTER DAN TEKNOLOGI INFORMASI', {
  bold: true,
  size: 22,
  alignment: AlignmentType.CENTER,
  spaceBefore: 160,
  spaceAfter: 30,
}));
coverChildren.push(p('JURUSAN SISTEM INFORMASI – UNIVERSITAS GUNADARMA', {
  bold: true,
  size: 22,
  alignment: AlignmentType.CENTER,
  spaceBefore: 0,
  spaceAfter: 30,
}));
coverChildren.push(p('DEPOK', {
  bold: true,
  size: 22,
  alignment: AlignmentType.CENTER,
  spaceBefore: 0,
  spaceAfter: 30,
}));
coverChildren.push(p('2026', {
  bold: true,
  size: 22,
  alignment: AlignmentType.CENTER,
  spaceBefore: 0,
  spaceAfter: 60,
}));


// ─────────────────────────────────────────────
// BUILD SECTION 2: MAIN CONTENT (with page numbers)
// ─────────────────────────────────────────────
const bodyChildren = [];

// === DAFTAR ISI ===
bodyChildren.push(headingBab('DAFTAR ISI'));
const tocList = [
  ['BAB I PENDAHULUAN', '4'],
  ['  1.1  Tujuan', '4'],
  ['  1.2  Konvensi Dokumen', '4'],
  ['  1.3  Ruang Lingkup Proyek', '4'],
  ['  1.4  Referensi', '5'],
  ['  1.5  Metode dan Sintesis Pengumpulan Kebutuhan', '5'],
  ['BAB II GAMBARAN UMUM', '7'],
  ['  2.1  Perspektif Produk', '7'],
  ['  2.2  Kelompok Pengguna dan Karakteristiknya', '7'],
  ['  2.3  Lingkungan Operasional', '8'],
  ['  2.4  Batasan Desain dan Implementasi', '8'],
  ['  2.5  Asumsi dan Ketergantungan', '9'],
  ['BAB III FITUR SISTEM', '10'],
  ['  3.1  Penjelajahan Katalog dan Filter Kategori', '10'],
  ['  3.2  Kalkulasi Tarif Dinamis dan Pemesanan Rental', '11'],
  ['  3.3  Integrasi WhatsApp Booking', '13'],
  ['  3.4  Autentikasi Admin', '14'],
  ['  3.5  Manajemen Inventaris Gadget', '15'],
  ['  3.6  Pemrosesan Status Transaksi', '16'],
  ['BAB IV KEBUTUHAN DATA', '18'],
  ['  4.1  Model Data Logis', '18'],
  ['  4.2  Kamus Data', '19'],
  ['  4.3  Laporan', '21'],
  ['  4.4  Perolehan, Integritas, Penyimpanan, dan Penghapusan', '21'],
  ['BAB V ANTARMUKA EKSTERNAL', '22'],
  ['  5.1  Antarmuka Pengguna', '22'],
  ['  5.2  Antarmuka Perangkat Lunak', '22'],
  ['  5.3  Antarmuka Perangkat Keras', '23'],
  ['  5.4  Antarmuka Komunikasi', '23'],
  ['BAB VI ATRIBUT KUALITAS', '24'],
  ['  6.1  Kemudahan Penggunaan', '24'],
  ['  6.2  Kinerja', '24'],
  ['  6.3  Keamanan', '24'],
  ['  6.4  Ketersediaan dan Keandalan', '25'],
  ['  6.5  Keselamatan dan Kekokohan', '25'],
  ['BAB VII INTERNASIONALISASI DAN LOKALISASI', '26'],
  ['BAB VIII KEBUTUHAN LAINNYA', '27'],
  ['  8.1  Batasan Implementasi Tahap Prototipe', '27'],
  ['  8.2  Saran Pengembangan Lanjutan', '27'],
  ['LAMPIRAN A GLOSARIUM', '28'],
  ['LAMPIRAN B MODEL ANALISIS', '29'],
  ['LAMPIRAN C KEPUTUSAN YANG MEMERLUKAN KONFIRMASI', '30'],
];

tocList.forEach(([label, pageNum]) => {
  const isBab = label.startsWith('BAB') || label.startsWith('LAMPIRAN');
  bodyChildren.push(p([
    { text: label, bold: isBab, size: isBab ? 22 : 21, color: isBab ? '0F294A' : '333333' },
    { text: `\t${pageNum}`, bold: isBab, size: isBab ? 22 : 21, color: '666666' },
  ], {
    spaceBefore: isBab ? 80 : 30,
    spaceAfter: isBab ? 40 : 30,
    indent: isBab ? 0 : 320,
  }));
});

// === BAB I ===
bodyChildren.push(headingBab('BAB I PENDAHULUAN'));

bodyChildren.push(headingSub('1.1 Tujuan'));
bodyChildren.push(p('Dokumen ini menetapkan kebutuhan perangkat lunak RENTGADGET, platform web penyewaan gadget (laptop, smartphone, tablet, kamera, dan aksesoris penunjang). Pembacanya: tim pengembang sebagai acuan membangun sistem, dosen pembimbing dan penguji sebagai penilai kelengkapan analisis, serta tim penguji sebagai penyusun skenario uji.'));

bodyChildren.push(headingSub('1.2 Konvensi Dokumen'));
bodyChildren.push(p('Kebutuhan fungsional berkode REQ-F-xx, kebutuhan data REQ-D-xx, kebutuhan kualitas REQ-Q-xx. Nomor bersifat tetap. Setiap fitur pada Bab III dibuka dengan uraian singkat, prioritas, dan aksi pengguna beserta respons sistem, lalu daftar kebutuhannya. Kebutuhan normatif ditulis dengan pola \'Sistem harus ...\'. Catatan yang diawali \'Catatan Implementasi\' menggambarkan perilaku kode saat ini dan bukan kebutuhan. Hal yang belum diputuskan ditandai TBD dan dikumpulkan di Lampiran C.'));
bodyChildren.push(p([{ text: 'Wajib: ', bold: true }, { text: 'sistem tidak diterima tanpanya.' }], { indent: 240, spaceBefore: 20, spaceAfter: 20 }));
bodyChildren.push(p([{ text: 'Penting: ', bold: true }, { text: 'menunjang operasional harian, boleh tunda satu iterasi.' }], { indent: 240, spaceBefore: 20, spaceAfter: 20 }));
bodyChildren.push(p([{ text: 'Pendukung: ', bold: true }, { text: 'pelengkap, dikerjakan bila waktu tersedia.' }], { indent: 240, spaceBefore: 20, spaceAfter: 40 }));

bodyChildren.push(headingSub('1.3 Ruang Lingkup Proyek'));
bodyChildren.push(p('RENTGADGET adalah aplikasi web responsif lewat peramban, tanpa aplikasi mobile native. Sistem mendigitalkan proses penyewaan gadget yang selama ini masih memakai pencatatan manual (nota kertas, chat WhatsApp) yang rawan tercecer, salah hitung, dan bentrok jadwal sewa (double-booking).'));
bodyChildren.push(p('Cakupannya: katalog multi-kategori gadget dengan filter dan pencarian instan, kalkulator tarif otomatis (harian/mingguan/bulanan), formulir booking online, integrasi konfirmasi WhatsApp ke staf toko, autentikasi admin berbasis cookie HTTP-Only, dashboard manajemen inventaris (CRUD + upload foto), dan pemrosesan siklus status transaksi rental.'));
bodyChildren.push(p('Batasan sejak awal: pembayaran bersifat non-gateway (konfirmasi manual via WhatsApp dan admin approval); basis data SQLite file-based tanpa server database terpisah; dan demo berjalan pada Vercel atau Node.js VPS.'));
bodyChildren.push(p('Di luar lingkup tahap ini: verifikasi identitas KYC (KTP/KTM/selfie), payment gateway terintegrasi, notifikasi email/push, manajemen security deposit dan denda keterlambatan, serta aplikasi mobile native.'));

bodyChildren.push(headingSub('1.4 Referensi'));
const refList = [
  'Karl Wiegers dan Seilevel, Software Requirements Specification Template, struktur acuan dokumen ini.',
  'Laporan SDLC Tahap Perencanaan (Planning) Pengembangan Web Rental Gadget, Kelompok 5, Universitas Gunadarma, Oktober 2026.',
  'Dokumentasi Next.js 15 App Router (nextjs.org/docs).',
  'Dokumentasi Prisma ORM dan SQLite Engine (prisma.io/docs).',
  'Dokumentasi Tailwind CSS v4 (tailwindcss.com/docs).',
  'Undang-Undang Republik Indonesia No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.',
];
refList.forEach((r, idx) => {
  bodyChildren.push(p([{ text: `${idx + 1}. `, bold: true }, { text: r }], { indent: 240, spaceBefore: 30, spaceAfter: 30 }));
});

bodyChildren.push(headingSub('1.5 Metode dan Sintesis Pengumpulan Kebutuhan'));
bodyChildren.push(p('Kebutuhan dalam dokumen ini disusun dari analisis skenario penyewaan gadget dan permasalahan yang menjadi dasar pengembangan RENTGADGET. Empat instrumen berikut adalah rencana untuk memvalidasi kebutuhan. Pelaksanaan dan hasil metode ini belum terdokumentasi dalam bahan yang tersedia, sehingga dokumen ini tidak memuat temuan, tanggal, responden, maupun kutipan hasil.'));

bodyChildren.push(headingSub('Wawancara', 3));
bodyChildren.push(p('Wawancara (rencana): ditujukan untuk menggali pengalaman pemilik usaha rental gadget dan staf toko fisik di Depok dan sekitarnya dalam mengelola penyewaan. Pelaksanaan dan hasil metode ini belum terdokumentasi dalam bahan yang tersedia. Panduan pertanyaan yang disiapkan:'));
bodyChildren.push(p([
  { text: '1. ', bold: true }, { text: 'Bagaimana alur penyewaan gadget dari permintaan pelanggan sampai pengembalian unit?\n' },
  { text: '2. ', bold: true }, { text: 'Hambatan apa yang paling sering muncul saat pencatatan ketersediaan stok dan perhitungan tarif sewa?\n' },
  { text: '3. ', bold: true }, { text: 'Media komunikasi apa yang dipakai pelanggan untuk memesan, dan apa kendalanya?' }
], { indent: 240 }));
bodyChildren.push(p('Asumsi awal (belum divalidasi, bukan temuan wawancara): pencatatan sewa lewat nota kertas dan chat WhatsApp diasumsikan mudah tercecer dan sulit direkap, dan perhitungan tarif sewa paket mingguan/bulanan secara manual diasumsikan rawan salah hitung. Kebutuhan yang diturunkan dari asumsi tersebut: diperlukan katalog terpusat dengan kalkulator tarif otomatis dan formulir booking terstruktur.', { italics: true }));

bodyChildren.push(headingSub('Kuesioner', 3));
bodyChildren.push(p('Kuesioner (rencana): ditujukan untuk memetakan kebiasaan dan kesulitan calon penyewa (mahasiswa, freelancer, pelaku UMKM) yang pernah menyewa gadget, mencakup pengalaman mencari informasi ketersediaan, membandingkan harga paket, dan mengkonfirmasi pemesanan. Instrumen ini adalah rencana; kuesioner lengkap tidak dicantumkan dalam dokumen ini. Pelaksanaan dan hasil metode ini belum terdokumentasi dalam bahan yang tersedia.'));
bodyChildren.push(p('Asumsi awal (belum divalidasi): tidak adanya simulasi tarif paket (harian vs. mingguan vs. bulanan) diasumsikan membuat calon penyewa kesulitan memilih durasi sewa yang optimal. Kebutuhan yang diturunkan: diperlukan kalkulator sewa interaktif yang menampilkan perbandingan tarif dan diskon paket secara real-time.', { italics: true }));

bodyChildren.push(headingSub('Observasi', 3));
bodyChildren.push(p('Observasi (rencana): ditujukan untuk mencermati alur transaksi penyewaan gadget di toko fisik, mencatat urutan langkah dari penerimaan pelanggan hingga serah terima unit, serta titik yang menimbulkan antrean atau kebingungan. Pelaksanaan dan hasil metode ini belum terdokumentasi dalam bahan yang tersedia. Asumsi awal (belum divalidasi): pengecekan ketersediaan unit secara manual diasumsikan memakan waktu dan rawan bentrok jadwal sewa. Kebutuhan yang diturunkan: diperlukan dashboard admin dengan tampilan stok real-time dan daftar unit yang sedang disewa.', { italics: true }));

bodyChildren.push(headingSub('FGD (Focus Group Discussion)', 3));
bodyChildren.push(p('Diskusi kelompok terarah (rencana): ditujukan untuk menyepakati kebutuhan dari sudut pandang dua peran (penyewa dan admin toko), mencakup alur booking, metode konfirmasi pembayaran, pilihan pengambilan/pengantaran unit, dan siklus status transaksi. Pelaksanaan dan hasil metode ini belum terdokumentasi dalam bahan yang tersedia.'));
bodyChildren.push(p('Kebutuhan yang diturunkan dari skenario: metode penerimaan unit terdiri dari ambil di toko (PICKUP) dan antar-jemput (DELIVERY) dengan kolom alamat wajib untuk opsi antar; paket sewa otomatis direkomendasikan sesuai durasi (>=7 hari otomatis mingguan, >=30 hari otomatis bulanan); dan konfirmasi booking dapat langsung diteruskan ke WhatsApp staf toko melalui pesan terstruktur.', { italics: true }));

// === BAB II ===
bodyChildren.push(headingBab('BAB II GAMBARAN UMUM'));

bodyChildren.push(headingSub('2.1 Perspektif Produk'));
bodyChildren.push(p('RENTGADGET adalah produk mandiri yang baru dibangun sebagai aplikasi web full-stack. Sistem menggabungkan antarmuka frontend modern (Next.js React Server & Client Components) dan logika bisnis backend (Next.js Route Handlers) dalam satu arsitektur terpadu. Data operasional tersimpan di basis data SQLite milik aplikasi yang dikelola melalui Prisma ORM. Pihak eksternal: peramban pengguna dan WhatsApp API URL Scheme untuk konfirmasi booking ke staf toko fisik di Depok/Jabodetabek.'));
bodyChildren.push(p('Alur utama sistem: admin mengelola katalog gadget dan harga sewa, penyewa menjelajahi katalog dan memesan unit lewat formulir online, sistem mencatat pesanan dan menyediakan generator pesan WhatsApp terstruktur untuk konfirmasi, admin memproses dan mengubah status pesanan melalui dashboard.'));

bodyChildren.push(headingSub('2.2 Kelompok Pengguna dan Karakteristiknya'));
bodyChildren.push(p([{ text: 'Tabel 2.1 Kelompok Pengguna', bold: true, italics: true }], { spaceAfter: 40 }));
bodyChildren.push(styledTable(
  ['Kelompok', 'Karakteristik dan frekuensi pakai'],
  [
    ['Penyewa / Customer (prioritas)', 'Mahasiswa, freelancer, kreator konten, pelaku UMKM, dan masyarakat umum. Terbiasa memakai peramban ponsel. Pakai insidental: mencari gadget, melihat spesifikasi dan harga, simulasi biaya sewa, mengisi formulir booking, dan mengkonfirmasi pesanan via WhatsApp.'],
    ['Admin / Staf Toko', '1-3 orang staf operasional toko rental fisik. Pakai harian: mengelola katalog unit (tambah, edit, hapus, upload foto), memantau pesanan masuk, memperbarui status sewa, dan melihat ringkasan pendapatan.'],
    ['Pengunjung Tamu', 'Belum melakukan pemesanan. Hanya melihat katalog, detail spesifikasi, simulasi harga, halaman FAQ, dan informasi lokasi toko.'],
  ],
  [30, 70]
));

bodyChildren.push(headingSub('2.3 Lingkungan Operasional'));
bodyChildren.push(p([{ text: 'Tabel 2.2 Lingkungan Operasional', bold: true, italics: true }], { spaceAfter: 40 }));
bodyChildren.push(styledTable(
  ['Aspek', 'Keterangan'],
  [
    ['Server', 'Vercel Cloud Platform atau Node.js VPS (self-hosted).'],
    ['Backend', 'Next.js 15 App Router, TypeScript, Node.js v18+.'],
    ['Frontend', 'Next.js React Components + Tailwind CSS, SSR dan CSR hybrid.'],
    ['Basis data', 'SQLite satu berkas (prisma/dev.db) dikelola Prisma ORM.'],
    ['Klien', 'Peramban modern (Chrome, Firefox, Safari, Edge) di ponsel dan desktop, JavaScript aktif.'],
    ['Konfirmasi', 'WhatsApp URL Scheme (https://wa.me/) untuk pesan booking terstruktur ke staf toko.'],
  ],
  [25, 75]
));

bodyChildren.push(headingSub('2.4 Batasan Desain dan Implementasi'));
const batasanList = [
  'Antarmuka dan logika wajib dibangun dengan Next.js (TypeScript) dan Tailwind CSS.',
  'Basis data wajib SQLite, tanpa server basis data terpisah.',
  'Autentikasi admin memakai cookie HTTP-Only (admin_session) dengan flag SameSite=Lax.',
  'Konfirmasi pembayaran bersifat manual (via WhatsApp dan admin approval); tidak ada payment gateway terintegrasi pada tahap ini.',
  'Penyimpanan berkas gambar gadget pada direktori lokal server (/public/uploads).',
  'Seluruh rahasia (ADMIN_PASSWORD, DATABASE_URL) hanya lewat variabel lingkungan server (.env yang di-gitignore).',
];
batasanList.forEach((b, i) => {
  bodyChildren.push(p([{ text: `${i + 1}. `, bold: true }, { text: b }], { indent: 240, spaceBefore: 20, spaceAfter: 20 }));
});

bodyChildren.push(headingSub('2.5 Asumsi dan Ketergantungan'));
const asumsiList = [
  'Pengguna memiliki koneksi internet dan peramban modern dengan JavaScript aktif.',
  'Untuk konfirmasi booking via WhatsApp, pengguna diasumsikan telah memiliki aplikasi WhatsApp atau WhatsApp Web.',
  'Kelangsungan demo bergantung pada ketersediaan hosting Vercel (free tier) atau VPS.',
  'Admin toko memasukkan data gadget dengan benar; sistem memvalidasi format input tetapi tidak memverifikasi kebenaran isi deskripsi.',
  'Zona waktu tampilan WIB (Asia/Jakarta).',
];
asumsiList.forEach((a, i) => {
  bodyChildren.push(p([{ text: `${i + 1}. `, bold: true }, { text: a }], { indent: 240, spaceBefore: 20, spaceAfter: 20 }));
});

// === BAB III ===
bodyChildren.push(headingBab('BAB III FITUR SISTEM'));
bodyChildren.push(p('Bab ini menguraikan enam fitur sistem dengan pola yang sama: deskripsi dan prioritas, aksi pengguna dan respons sistem, lalu kebutuhan fungsional normatif. Penomoran kebutuhan fungsional (REQ-F) dipertahankan berurutan.'));

// 3.1
bodyChildren.push(headingSub('3.1 Penjelajahan Katalog dan Filter Kategori'));
bodyChildren.push(p([{ text: 'Deskripsi dan prioritas: ', bold: true }, { text: 'Halaman beranda dan halaman katalog (/katalog) menampilkan daftar gadget aktif lengkap dengan pencarian teks model, filter kategori (Semua, Laptop, Smartphone, Tablet, Aksesoris), dan kartu perangkat berisi gambar/emoji, spesifikasi ringkas, serta tarif harian. Prioritas: Wajib.' }]));
bodyChildren.push(p([{ text: 'Aksi pengguna dan respons sistem: ', bold: true }, { text: 'Pengunjung membuka beranda atau halaman katalog; sistem menampilkan daftar kartu gadget aktif (isActive: true). Pengunjung memilih tombol kategori atau mengetik kata kunci pencarian; sistem memfilter daftar secara instan di sisi klien tanpa muat ulang halaman. Pengunjung mengeklik salah satu kartu; sistem mengarahkan ke halaman formulir booking unit tersebut (/rent/[id]). Bila tidak ada gadget yang cocok, sistem menampilkan daftar kosong dengan keterangan.' }]));
bodyChildren.push(p([{ text: 'REQ-F-01 (Wajib): ', bold: true }, { text: 'Sistem harus menampilkan daftar seluruh gadget berstatus isActive: true beserta kategori, spesifikasi penyimpanan, warna, dan harga sewa harian.' }]));
bodyChildren.push(p([{ text: 'REQ-F-02 (Wajib): ', bold: true }, { text: 'Sistem harus menyediakan pencarian model dan filter kategori (Semua, Laptop, Smartphone, Tablet, Aksesoris) yang bekerja secara instan di sisi klien.' }]));
bodyChildren.push(p([{ text: 'REQ-F-03 (Penting): ', bold: true }, { text: 'Sistem harus menampilkan informasi stok tersedia pada setiap kartu gadget.' }]));
bodyChildren.push(p([{ text: 'REQ-F-04 (Penting): ', bold: true }, { text: 'Bila gadget tidak memiliki foto asli (imageUrl null), sistem harus menampilkan ikon emoji representatif (imageEmoji) sebagai fallback visual.' }]));

// 3.2
bodyChildren.push(headingSub('3.2 Kalkulasi Tarif Dinamis dan Pemesanan Rental (Booking Online)'));
bodyChildren.push(p([{ text: 'Deskripsi dan prioritas: ', bold: true }, { text: 'Halaman detail perangkat (/rent/[id]) menyediakan kalkulator sewa otomatis dan formulir reservasi online. Sistem menghitung durasi hari, menerapkan tarif paket (Harian, Mingguan, Bulanan) beserta persentase diskon, dan mencatat pesanan ke basis data. Satu pesanan berisi satu unit gadget. Prioritas: Wajib.' }]));
bodyChildren.push(p([{ text: 'Aksi pengguna dan respons sistem: ', bold: true }, { text: 'Penyewa membuka halaman booking unit yang dipilih; sistem menampilkan spesifikasi gadget di satu sisi dan formulir kalkulator di sisi lainnya. Penyewa memilih tanggal mulai sewa (startDate) dan tanggal selesai sewa (endDate); sistem langsung menghitung jumlah hari, merekomendasikan paket otomatis (>=7 hari mingguan, >=30 hari bulanan), menampilkan persentase diskon dan total biaya sewa dalam format Rupiah. Penyewa memilih metode penerimaan (PICKUP atau DELIVERY); bila DELIVERY, kolom alamat wajib diisi. Penyewa melengkapi data diri (Nama Lengkap, Nomor WhatsApp, Email, Catatan) lalu mengirim; sistem memvalidasi, menyimpan ke tabel Rental dengan status PENDING, dan menampilkan konfirmasi berisi ID booking dan rincian transaksi.' }]));
bodyChildren.push(p([{ text: 'REQ-F-05 (Wajib): ', bold: true }, { text: 'Sistem harus menolak pengajuan bila tanggal selesai sewa sama dengan atau mendahului tanggal mulai sewa.' }]));
bodyChildren.push(p([{ text: 'REQ-F-06 (Wajib): ', bold: true }, { text: 'Sistem harus menghitung total harga sewa secara dinamis di sisi klien berdasarkan durasi hari dan paket yang dipilih.' }]));
bodyChildren.push(p([{ text: 'REQ-F-07 (Wajib): ', bold: true }, { text: 'Sistem harus merekomendasikan paket secara otomatis berdasarkan durasi: >=30 hari Bulanan, >=7 hari Mingguan, <7 hari Harian.' }]));
bodyChildren.push(p([{ text: 'REQ-F-08 (Wajib): ', bold: true }, { text: 'Sistem harus mewajibkan pengisian nama, nomor telepon/WhatsApp, dan email sebelum formulir dapat dikirim.' }]));
bodyChildren.push(p([{ text: 'REQ-F-09 (Wajib): ', bold: true }, { text: 'Sistem harus mewajibkan pengisian alamat lengkap bila metode pengiriman adalah DELIVERY.' }]));
bodyChildren.push(p([{ text: 'REQ-F-10 (Wajib): ', bold: true }, { text: 'Sistem harus menyimpan pesanan baru ke tabel Rental dengan status default PENDING dan mengembalikan ID transaksi unik (CUID) kepada penyewa.' }]));

// 3.3
bodyChildren.push(headingSub('3.3 Integrasi WhatsApp Booking'));
bodyChildren.push(p([{ text: 'Deskripsi dan prioritas: ', bold: true }, { text: 'Setelah formulir booking berhasil dikirim, sistem menyediakan tombol untuk meneruskan konfirmasi ke WhatsApp staf toko. Selain itu, widget WhatsApp mengambang tersedia di setiap halaman publik untuk konsultasi umum. Prioritas: Penting.' }]));
bodyChildren.push(p([{ text: 'REQ-F-11 (Penting): ', bold: true }, { text: 'Sistem harus menyediakan generator pesan WhatsApp ter-encode URI yang mencakup rincian lengkap pesanan setelah booking berhasil.' }]));
bodyChildren.push(p([{ text: 'REQ-F-12 (Penting): ', bold: true }, { text: 'Sistem harus menyediakan komponen mengambang (floating widget) WhatsApp di setiap halaman publik dengan nomor kontak toko yang terkonfigurasi.' }]));

// 3.4
bodyChildren.push(headingSub('3.4 Autentikasi Admin'));
bodyChildren.push(p([{ text: 'Deskripsi dan prioritas: ', bold: true }, { text: 'Akses panel administrasi (/admin) dan operasi perubahan data reservasi dibatasi hanya kepada staf admin yang terautentikasi. Login memakai kata sandi admin tunggal tanpa sistem peran ganda. Prioritas: Wajib.' }]));
bodyChildren.push(p([{ text: 'REQ-F-13 (Wajib): ', bold: true }, { text: 'Sistem harus menolak akses ke endpoint /api/rentals (operasi perubahan status) dan halaman /admin bagi pengguna tanpa cookie sesi admin yang valid (HTTP 401 Unauthorized).' }]));
bodyChildren.push(p([{ text: 'REQ-F-14 (Wajib): ', bold: true }, { text: 'Sistem harus menyimpan sesi admin dalam cookie HttpOnly untuk mencegah pencurian token melalui skrip XSS di peramban.' }]));
bodyChildren.push(p([{ text: 'REQ-F-15 (Wajib): ', bold: true }, { text: 'Sistem harus menyediakan fitur logout yang menghapus cookie sesi.' }]));

// 3.5
bodyChildren.push(headingSub('3.5 Manajemen Inventaris Gadget (CRUD dan Upload Foto)'));
bodyChildren.push(p([{ text: 'Deskripsi dan prioritas: ', bold: true }, { text: 'Admin mengelola katalog gadget: menambah unit baru, mengubah spesifikasi dan tarif sewa, mengunggah foto unit, serta menonaktifkan atau menghapus unit. Prioritas: Wajib.' }]));
bodyChildren.push(p([{ text: 'REQ-F-16 (Wajib): ', bold: true }, { text: 'Sistem harus menyediakan bagi admin kemampuan menambah unit gadget baru beserta seluruh atributnya (model, kategori, spesifikasi, tarif, stok, deskripsi, emoji).' }]));
bodyChildren.push(p([{ text: 'REQ-F-17 (Penting): ', bold: true }, { text: 'Sistem harus mendukung pengunggahan berkas gambar format JPEG, PNG, dan WebP ke folder penyimpanan server.' }]));
bodyChildren.push(p([{ text: 'REQ-F-18 (Wajib): ', bold: true }, { text: 'Sistem harus menyediakan bagi admin kemampuan memperbarui data unit, termasuk stok, tarif harian/mingguan/bulanan, dan status aktif/non-aktif.' }]));
bodyChildren.push(p([{ text: 'REQ-F-19 (Penting): ', bold: true }, { text: 'Sistem harus menyediakan bagi admin kemampuan menghapus unit dari katalog. Catatan Implementasi: saat ini penghapusan bersifat hard delete; penahan penghapusan untuk unit yang memiliki rental aktif belum diterapkan (lihat Lampiran C, TBD-01).' }]));

// 3.6
bodyChildren.push(headingSub('3.6 Pemrosesan Status Transaksi dan Approval Rental'));
bodyChildren.push(p([{ text: 'Deskripsi dan prioritas: ', bold: true }, { text: 'Admin memantau pesanan sewa masuk, mengevaluasi kelengkapan, dan memperbarui status tahapan sewa unit melalui siklus: PENDING → APPROVED → ACTIVE → COMPLETED, dengan kemungkinan CANCELLED di tahap PENDING atau APPROVED. Prioritas: Wajib.' }]));
bodyChildren.push(p([{ text: 'REQ-F-20 (Wajib): ', bold: true }, { text: 'Sistem harus menampilkan daftar seluruh transaksi pemesanan beserta status terkininya, diurutkan dari terbaru.' }]));
bodyChildren.push(p([{ text: 'REQ-F-21 (Wajib): ', bold: true }, { text: 'Sistem harus memungkinkan admin mengubah status transaksi sesuai siklus: PENDING, APPROVED, ACTIVE, COMPLETED, dan CANCELLED.' }]));
bodyChildren.push(p([{ text: 'REQ-F-22 (Penting): ', bold: true }, { text: 'Sistem harus menyediakan fasilitas pencatatan catatan khusus (notes) pada tiap transaksi sewa.' }]));

// === BAB IV ===
bodyChildren.push(headingBab('BAB IV KEBUTUHAN DATA'));

bodyChildren.push(headingSub('4.1 Model Data Logis'));
bodyChildren.push(p('Sistem menggunakan dua tabel utama: Phone dan Rental. Rantai transaksi utama: Phone 1-N Rental (satu unit gadget dapat memiliki banyak transaksi rental). Satu relasi kunci asing menghubungkan kedua tabel: Rental.phoneId → Phone.id. Seluruh kolom kunci asing bersifat wajib terisi (tidak nullable), sehingga setiap baris Rental merujuk tepat satu baris Phone.'));
bodyChildren.push(p([{ text: 'REQ-D-01 (Wajib): ', bold: true }, { text: 'Setiap rental wajib merujuk satu unit gadget (phoneId), nama penyewa, nomor telepon, email, tanggal mulai, tanggal selesai, paket sewa, metode pengambilan, total harga, dan status.' }]));
bodyChildren.push(p([{ text: 'REQ-D-02 (Wajib): ', bold: true }, { text: 'Setiap gadget wajib memiliki model, kategori, kapasitas penyimpanan, warna, harga harian, stok, deskripsi, dan emoji.' }]));
bodyChildren.push(p([{ text: 'REQ-D-03 (Wajib): ', bold: true }, { text: 'Waktu pembuatan dan pembaruan data disimpan sebagai kolom terpisah (createdAt, updatedAt) pada kedua tabel.' }]));

bodyChildren.push(headingSub('4.2 Kamus Data'));
bodyChildren.push(p('Kamus data menggunakan tipe logis migrasi Prisma. Pada SQLite, String terpetakan ke TEXT, Int ke INTEGER, Boolean ke INTEGER (0/1), DateTime ke teks tanggal-waktu, dan Enum ke TEXT dengan batasan nilai yang dijaga Prisma.'));

bodyChildren.push(p([{ text: 'Tabel 4.1 Phone', bold: true, italics: true }], { spaceBefore: 120, spaceAfter: 40 }));
bodyChildren.push(styledTable(
  ['Kolom', 'Tipe', 'Null', 'Constraint'],
  [
    ['id', 'String (CUID)', 'tidak', 'PK, digenerate otomatis'],
    ['model', 'String', 'tidak', 'Nama merek dan model seri'],
    ['category', 'String', 'tidak', 'Default "Smartphone"; isi: Laptop, Smartphone, Tablet, Aksesoris'],
    ['storage', 'String', 'tidak', 'Kapasitas penyimpanan (contoh: "256 GB")'],
    ['color', 'String', 'tidak', 'Varian warna (contoh: "Natural Titanium")'],
    ['dailyPrice', 'Int', 'tidak', 'Tarif sewa per hari (Rupiah), > 0'],
    ['weeklyPrice', 'Int', 'ya', 'Tarif paket 7 hari, nullable'],
    ['monthlyPrice', 'Int', 'ya', 'Tarif paket 30 hari, nullable'],
    ['stock', 'Int', 'tidak', 'Default 1, jumlah unit >= 0'],
    ['description', 'String (Text)', 'tidak', 'Deskripsi kondisi dan spesifikasi'],
    ['imageUrl', 'String', 'ya', 'Path relatif berkas foto'],
    ['imageEmoji', 'String', 'tidak', 'Default "📱", emoji representasi'],
    ['isActive', 'Boolean', 'tidak', 'Default true, status tampil di katalog'],
  ],
  [18, 20, 12, 50]
));

bodyChildren.push(p([{ text: 'Tabel 4.2 Rental', bold: true, italics: true }], { spaceBefore: 160, spaceAfter: 40 }));
bodyChildren.push(styledTable(
  ['Kolom', 'Tipe', 'Null', 'Constraint'],
  [
    ['id', 'String (CUID)', 'tidak', 'PK, identitas nomor booking'],
    ['phoneId', 'String (CUID)', 'tidak', 'FK → Phone.id'],
    ['customerName', 'String', 'tidak', 'Nama lengkap penyewa'],
    ['customerPhone', 'String', 'tidak', 'Nomor WhatsApp, format 08xx atau +628xx'],
    ['customerEmail', 'String', 'tidak', 'Alamat email valid'],
    ['startDate', 'DateTime', 'tidak', 'Tanggal mulai sewa'],
    ['endDate', 'DateTime', 'tidak', 'Harus setelah startDate'],
    ['rentalPackage', 'String', 'tidak', 'Default "HARIAN"; isi: HARIAN, MINGGUAN, BULANAN'],
    ['deliveryMethod', 'String', 'tidak', 'Default "PICKUP"; isi: PICKUP, DELIVERY'],
    ['deliveryAddress', 'String (Text)', 'ya', 'Wajib bila deliveryMethod = DELIVERY'],
    ['totalPrice', 'Int', 'tidak', 'Dihitung server, harga x durasi'],
    ['status', 'Enum (RentalStatus)', 'tidak', 'Default PENDING; isi: PENDING, APPROVED, ACTIVE, COMPLETED, CANCELLED'],
    ['notes', 'String (Text)', 'ya', 'Catatan admin atau preferensi penyewa'],
  ],
  [22, 20, 10, 48]
));

bodyChildren.push(headingSub('4.3 Laporan'));
bodyChildren.push(p('Admin memperoleh ringkasan operasional pada dashboard berupa empat indikator: total keseluruhan transaksi rental, jumlah pesanan menunggu konfirmasi (PENDING), jumlah unit sedang disewa (ACTIVE), dan total estimasi pendapatan sewa (dalam Rupiah). Laporan tampil di layar dashboard; ekspor berkas terpisah bukan kebutuhan wajib tahap ini.'));

bodyChildren.push(headingSub('4.4 Perolehan, Integritas, Penyimpanan, dan Penghapusan'));
bodyChildren.push(p('Data gadget dibuat lewat formulir admin tervalidasi. Data rental diperoleh dari formulir booking penyewa yang divalidasi di sisi klien dan server. Integritas dijaga kunci asing Prisma ORM (Rental.phoneId → Phone.id) dan transaksi basis data SQLite (ACID compliance). Basis data disimpan sebagai berkas tunggal (prisma/dev.db) yang dapat diduplikasi untuk pencadangan.'));
bodyChildren.push(p('Retensi data operasional, frekuensi pencadangan, dan prosedur penghapusan berkala belum ditetapkan pada tahap ini (lihat Lampiran C, TBD-02). Perilaku hapus saat ini: hapus gadget bersifat hard delete berantai; penonaktifan (isActive: false) disarankan sebagai alternatif (lihat Lampiran C, TBD-01).'));

// === BAB V ===
bodyChildren.push(headingBab('BAB V ANTARMUKA EKSTERNAL'));

bodyChildren.push(headingSub('5.1 Antarmuka Pengguna'));
bodyChildren.push(p('Seluruh interaksi berjalan di peramban lewat halaman responsif yang nyaman mulai lebar 360 piksel hingga desktop 1920 piksel. Tampilan menggunakan tema modern berbasis Tailwind CSS. Pesan kesalahan berbahasa Indonesia dan ditampilkan dengan penanda visual warna merah.'));
bodyChildren.push(p([{ text: 'REQ-Q-01 (Penting): ', bold: true }, { text: 'Halaman beranda, katalog, dan formulir booking tetap terbaca dan tidak melebar melampaui layar ponsel 360 px.' }]));

bodyChildren.push(headingSub('5.2 Antarmuka Perangkat Lunak'));
bodyChildren.push(p('Next.js Route Handlers menyediakan endpoint REST API: GET/POST /api/phones, GET/PUT/DELETE /api/phones/[id], GET/POST /api/rentals, PATCH /api/rentals/[id], POST /api/auth/login, POST /api/auth/logout. Prisma Client diakses eksklusif oleh aplikasi sebagai layer ORM ke SQLite. WhatsApp URL Scheme (https://wa.me/) dipakai untuk memicu pembukaan aplikasi chat.'));

bodyChildren.push(headingSub('5.3 Antarmuka Perangkat Keras'));
bodyChildren.push(p('Sistem adalah perangkat lunak berbasis web yang tidak berinteraksi langsung dengan perangkat keras khusus. Server berupa Vercel serverless functions atau Node.js VPS standar. Di sisi pengguna, hanya diperlukan ponsel, tablet, atau laptop/PC dengan peramban modern.'));

bodyChildren.push(headingSub('5.4 Antarmuka Komunikasi'));
bodyChildren.push(p('Semua lalu lintas antara peramban dan server memakai HTTPS (TLS 1.2+). Pertukaran data internal menggunakan format JSON melalui metode HTTP RESTful. Autentikasi sesi dikirimkan melalui header HTTP Cookie.'));

// === BAB VI ===
bodyChildren.push(headingBab('BAB VI ATRIBUT KUALITAS'));

bodyChildren.push(headingSub('6.1 Kemudahan Penggunaan'));
bodyChildren.push(p('Alur katalog → detail → kalkulator → booking memakai label Indonesia yang lugas. Kalkulator sewa memperbarui total secara instan saat tanggal berubah. Pengunjung baru ditargetkan menyelesaikan booking dalam waktu kurang dari 3 menit tanpa pelatihan formal. Rencana pemeriksaan dan parameternya belum ditetapkan (Lampiran C, TBD-03).'));

bodyChildren.push(headingSub('6.2 Kinerja'));
bodyChildren.push(p([{ text: 'REQ-Q-02 (Penting): ', bold: true }, { text: 'Halaman beranda dan katalog ditargetkan tampil (First Contentful Paint) di bawah 2 detik pada koneksi 4G stabil.' }]));
bodyChildren.push(p([{ text: 'REQ-Q-03 (Penting): ', bold: true }, { text: 'Transisi filter kategori gadget bekerja secara instan di sisi klien (render latency di bawah 100 milidetik).' }]));
bodyChildren.push(p([{ text: 'REQ-Q-04 (Penting): ', bold: true }, { text: 'Permintaan API penyimpanan reservasi diselesaikan di bawah 500 milidetik pada sisi server.' }]));

bodyChildren.push(headingSub('6.3 Keamanan'));
bodyChildren.push(p([{ text: 'REQ-Q-05 (Wajib): ', bold: true }, { text: 'Rute /admin dan endpoint perubahan data rental menolak akses tanpa cookie sesi admin yang valid.' }]));
bodyChildren.push(p([{ text: 'REQ-Q-06 (Wajib): ', bold: true }, { text: 'Cookie sesi admin bertanda HttpOnly sehingga tidak dapat dibaca oleh skrip sisi klien (pencegahan XSS).' }]));
bodyChildren.push(p([{ text: 'REQ-Q-07 (Wajib): ', bold: true }, { text: 'Variabel lingkungan sensitif (ADMIN_PASSWORD, DATABASE_URL) tercantum dalam .gitignore dan tidak terpublikasi ke repositori.' }]));

bodyChildren.push(headingSub('6.4 Ketersediaan dan Keandalan'));
bodyChildren.push(p('Kriteria tahap prototipe: layanan diupayakan aktif selama periode penilaian, tanpa jaminan SLA formal. Tidak ada klaim uptime untuk tahap demo.'));

bodyChildren.push(headingSub('6.5 Keselamatan dan Kekokohan'));
bodyChildren.push(p('Basis data SQLite menjamin atomisitas transaksi (ACID) sehingga tidak terjadi data setengah tersimpan. Konfirmasi ulang sebelum operasi berisiko belum diterapkan seragam (Lampiran C, TBD-04).'));

// === BAB VII ===
bodyChildren.push(headingBab('BAB VII INTERNASIONALISASI DAN LOKALISASI'));
bodyChildren.push(p('Bahasa antarmuka Bahasa Indonesia, dan istilah teknis (booking, checkout, deploy) dipertahankan agar selaras dengan dokumentasi framework. Nilai uang format Rupiah (Rp150.000) dengan titik pemisah ribuan, tanpa desimal. Format tanggal DD/MM/YYYY dengan zona waktu WIB (UTC+7). Nomor telepon mendukung konvensi Indonesia (08xx atau +628xx). Kolom nama menerima nama satu kata yang umum di Indonesia.'));

// === BAB VIII ===
bodyChildren.push(headingBab('BAB VIII KEBUTUHAN LAINNYA'));

bodyChildren.push(headingSub('8.1 Batasan Implementasi Tahap Prototipe'));
bodyChildren.push(p('Basis data SQLite satu berkas membatasi konkurensi tinggi; cocok untuk demo dan volume toko kecil-menengah. Konfirmasi pembayaran bersifat manual via WhatsApp dan admin approval. Penyimpanan gambar pada direktori lokal (/public/uploads) membatasi skalabilitas. Autentikasi admin memakai kata sandi tunggal tanpa sistem peran multi-level. Data demo dibatasi pada data sintetis atau uji.'));

bodyChildren.push(headingSub('8.2 Saran Pengembangan Lanjutan'));
const saranList = [
  'Integrasi payment gateway (Midtrans/Xendit) untuk verifikasi pembayaran otomatis.',
  'Implementasi verifikasi identitas KYC (KTP/KTM, selfie, kontak darurat).',
  'Penambahan sistem notifikasi otomatis (email/push) untuk pengingat jatuh tempo pengembalian.',
  'Migrasi basis data ke PostgreSQL atau MySQL untuk konkurensi tinggi.',
  'Integrasi penyimpanan media ke Cloudinary atau Supabase Storage.',
  'Penambahan manajemen security deposit dan kalkulasi denda otomatis.',
  'Penambahan kalender ketersediaan real-time per unit.',
  'Pengembangan sistem peran admin multi-level.',
];
saranList.forEach((s, i) => {
  bodyChildren.push(p([{ text: `${i + 1}. `, bold: true }, { text: s }], { indent: 240, spaceBefore: 20, spaceAfter: 20 }));
});

// === LAMPIRAN A ===
bodyChildren.push(headingBab('LAMPIRAN A GLOSARIUM'));
bodyChildren.push(p([{ text: 'Tabel A.1 Glosarium', bold: true, italics: true }], { spaceAfter: 40 }));
bodyChildren.push(styledTable(
  ['Istilah', 'Arti dalam RENTGADGET'],
  [
    ['API', 'Antarmuka pertukaran data antar komponen perangkat lunak melalui HTTP.'],
    ['Booking', 'Pemesanan sewa gadget oleh penyewa melalui formulir online.'],
    ['CRUD', 'Empat fungsi dasar manipulasi data: Create, Read, Update, Delete.'],
    ['CUID', 'Algoritma pembuat string identitas unik untuk kunci primer data.'],
    ['Delivery Method', 'Metode serah terima gadget: PICKUP (ambil toko) atau DELIVERY (antar alamat).'],
    ['HTTP-Only Cookie', 'Atribut keamanan cookie yang mencegah akses oleh skrip sisi klien.'],
    ['ORM', 'Object-Relational Mapping; teknik memetakan tabel ke objek kode (Prisma).'],
    ['Rental Package', 'Paket durasi sewa: HARIAN, MINGGUAN, atau BULANAN.'],
    ['RentalStatus', 'Status siklus transaksi: PENDING, APPROVED, ACTIVE, COMPLETED, CANCELLED.'],
    ['SRS', 'Software Requirements Specification; dokumen spesifikasi kebutuhan perangkat lunak.'],
    ['SSR', 'Server-Side Rendering; render halaman web di server sebelum dikirim ke peramban.'],
  ],
  [25, 75]
));

// === LAMPIRAN B ===
bodyChildren.push(headingBab('LAMPIRAN B MODEL ANALISIS'));
bodyChildren.push(p('Model visual tahap analisis:'));
bodyChildren.push(p([{ text: 'B.1 Diagram Alur Proses Pemesanan Rental', bold: true }], { spaceBefore: 120, spaceAfter: 40 }));
bodyChildren.push(p('Pengunjung → Buka Katalog & Pilih Gadget → Tentukan Tanggal & Paket (sistem hitung tarif otomatis) → Pilih Metode Pickup/Delivery → Isi Data & Ajukan Sewa → Tersimpan ke Database (PENDING) → Konfirmasi via WhatsApp Admin', { indent: 240 }));

bodyChildren.push(p([{ text: 'B.2 Diagram Siklus Status Transaksi Rental (State Transition)', bold: true }], { spaceBefore: 160, spaceAfter: 40 }));
bodyChildren.push(p('PENDING → APPROVED → ACTIVE → COMPLETED\nPENDING / APPROVED → CANCELLED', { indent: 240 }));

// === LAMPIRAN C ===
bodyChildren.push(headingBab('LAMPIRAN C KEPUTUSAN YANG MEMERLUKAN KONFIRMASI'));
bodyChildren.push(p('Lampiran ini memuat pertanyaan bisnis yang ditemukan saat penyusunan dan belum diputuskan. Tidak ada butir di bawah yang menjadi kebutuhan; setiap butir menunggu keputusan pemilik produk dan/atau dosen pembimbing. Status semua butir: TBD (belum diputuskan).'));
bodyChildren.push(styledTable(
  ['ID', 'Masalah', 'Pilihan', 'Rekomendasi & Alasan', 'Dampak (REQ/Data)'],
  [
    ['TBD-01', 'Penghapusan gadget saat ini hard delete berantai (rental terkait ikut terhapus).', '(A) Pertahankan hard delete. (B) Tolak hapus bila sudah ada rental. (C) Soft delete / isActive.', 'Pilihan (B). Melindungi riwayat transaksi dan keutuhan laporan keuangan.', 'Phone, Rental, REQ-F-19, REQ-D-01'],
    ['TBD-02', 'Kebijakan retensi, pencadangan, dan penghapusan data belum diatur.', '(A) Simpan tanpa pembersihan. (B) Tetapkan periode retensi dan pencadangan berkala.', 'Pilihan (B). Menertibkan retensi data; periode konkret belum ditetapkan.', 'Semua tabel, REQ-D-01..03, Bab IV 4.4'],
    ['TBD-03', 'Parameter uji kualitas belum baku: perangkat, cache, beban, batas waktu.', '(A) Pertahankan target tanpa metodologi baku. (B) Tetapkan parameter uji spesifik.', 'Pilihan (B). Menjadikan target terukur dan dapat direplikasi.', 'REQ-Q-01..07, Bab VI'],
    ['TBD-04', 'Konfirmasi ulang sebelum operasi berisiko (hapus unit, batalkan pesanan) belum diterapkan.', '(A) Pertahankan tanpa konfirmasi. (B) Tambahkan dialog konfirmasi.', 'Pilihan (B). Mencegah kesalahan operasional yang tidak dapat dibatalkan.', 'REQ-F-19, REQ-F-21'],
  ],
  [12, 25, 23, 25, 15]
));
bodyChildren.push(p('Butir TBD di atas bukan kebutuhan dan tidak boleh dijadikan dasar pengujian sebelum disahkan.', { italics: true, spaceBefore: 80 }));

// ─────────────────────────────────────────────
// DOCUMENT CREATION (Section 1: Cover, Section 2: Body)
// ─────────────────────────────────────────────
const doc = new Document({
  sections: [
    {
      // Section 1: Cover Page (no header / footer)
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      children: coverChildren,
    },
    {
      // Section 2: Main Document (with page number in footer)
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  font: 'Calibri',
                  size: 18,
                  color: '888888',
                }),
              ],
            }),
          ],
        }),
      },
      children: bodyChildren,
    },
  ],
});

Packer.toBuffer(doc).then(buffer => {
  const targetPath = path.join(__dirname, 'SRS_Web_Rental_Gadget.docx');
  fs.writeFileSync(targetPath, buffer);
  console.log('SUCCESS! Generated formatted SRS_Web_Rental_Gadget.docx, size:', buffer.length, 'bytes');
}).catch(err => {
  console.error('ERROR:', err);
});
