SPESIFIKASI KEBUTUHAN
PERANGKAT LUNAK (SRS)



RENTGADGET
Sistem Informasi dan Manajemen Rental Gadget Berbasis Web




Disusun oleh:


ADLI ENDRA ESTIAWAN                    10124038
ALFIAN P. NAFITHORIQ                    10124101
RAFI ERBAKTI                            11124118
RAZZAN RAFIFUDIN MUTHI                  11124191
RIZKY BAGUS PAMBUDI                     11124244




FAKULTAS ILMU KOMPUTER DAN TEKNOLOGI INFORMASI
UNIVERSITAS GUNADARMA
DEPOK
2026


DAFTAR ISI

BAB I PENDAHULUAN                                                    4
  1.1  Tujuan                                                        4
  1.2  Konvensi Dokumen                                              4
  1.3  Ruang Lingkup Proyek                                          4
  1.4  Referensi                                                     5
  1.5  Metode dan Sintesis Pengumpulan Kebutuhan                     5

BAB II GAMBARAN UMUM                                                 7
  2.1  Perspektif Produk                                             7
  2.2  Kelompok Pengguna dan Karakteristiknya                        7
  2.3  Lingkungan Operasional                                        8
  2.4  Batasan Desain dan Implementasi                               8
  2.5  Asumsi dan Ketergantungan                                     9

BAB III FITUR SISTEM                                                10
  3.1  Penjelajahan Katalog dan Filter Kategori                     10
  3.2  Kalkulasi Tarif Dinamis dan Pemesanan Rental                 11
  3.3  Integrasi WhatsApp Booking                                   13
  3.4  Autentikasi Admin                                            14
  3.5  Manajemen Inventaris Gadget                                  15
  3.6  Pemrosesan Status Transaksi                                  16

BAB IV KEBUTUHAN DATA                                               18
  4.1  Model Data Logis                                             18
  4.2  Kamus Data                                                   19
  4.3  Laporan                                                      21
  4.4  Perolehan, Integritas, Penyimpanan, dan Penghapusan          21

BAB V ANTARMUKA EKSTERNAL                                           22
  5.1  Antarmuka Pengguna                                           22
  5.2  Antarmuka Perangkat Lunak                                    22
  5.3  Antarmuka Perangkat Keras                                    23
  5.4  Antarmuka Komunikasi                                         23

BAB VI ATRIBUT KUALITAS                                             24
  6.1  Kemudahan Penggunaan                                         24
  6.2  Kinerja                                                      24
  6.3  Keamanan                                                     24
  6.4  Ketersediaan dan Keandalan                                   25
  6.5  Keselamatan dan Kekokohan                                    25

BAB VII INTERNASIONALISASI DAN LOKALISASI                           26

BAB VIII KEBUTUHAN LAINNYA                                          27
  8.1  Batasan Implementasi Tahap Prototipe                         27
  8.2  Saran Pengembangan Lanjutan                                  27

LAMPIRAN A GLOSARIUM                                                28

LAMPIRAN B MODEL ANALISIS                                           29

LAMPIRAN C KEPUTUSAN YANG MEMERLUKAN KONFIRMASI                     30


================================================================================

BAB I PENDAHULUAN

1.1 Tujuan

Dokumen ini menetapkan kebutuhan perangkat lunak RENTGADGET, platform web penyewaan gadget (laptop, smartphone, tablet, kamera, dan aksesoris penunjang). Pembacanya: tim pengembang sebagai acuan membangun sistem, dosen pembimbing dan penguji sebagai penilai kelengkapan analisis, serta tim penguji sebagai penyusun skenario uji.

1.2 Konvensi Dokumen

Kebutuhan fungsional berkode REQ-F-xx, kebutuhan data REQ-D-xx, kebutuhan kualitas REQ-Q-xx. Nomor bersifat tetap. Setiap fitur pada Bab III dibuka dengan uraian singkat, prioritas, dan aksi pengguna beserta respons sistem, lalu daftar kebutuhannya. Kebutuhan normatif ditulis dengan pola 'Sistem harus ...'. Catatan yang diawali 'Catatan Implementasi' menggambarkan perilaku kode saat ini dan bukan kebutuhan. Hal yang belum diputuskan ditandai TBD dan dikumpulkan di Lampiran C.

Wajib: sistem tidak diterima tanpanya.

Penting: menunjang operasional harian, boleh tunda satu iterasi.

Pendukung: pelengkap, dikerjakan bila waktu tersedia.

1.3 Ruang Lingkup Proyek

RENTGADGET adalah aplikasi web responsif lewat peramban, tanpa aplikasi mobile native. Sistem mendigitalkan proses penyewaan gadget yang selama ini masih memakai pencatatan manual (nota kertas, chat WhatsApp) yang rawan tercecer, salah hitung, dan bentrok jadwal sewa (double-booking).

Cakupannya: katalog multi-kategori gadget dengan filter dan pencarian instan, kalkulator tarif otomatis (harian/mingguan/bulanan), formulir booking online, integrasi konfirmasi WhatsApp ke staf toko, autentikasi admin berbasis cookie HTTP-Only, dashboard manajemen inventaris (CRUD + upload foto), dan pemrosesan siklus status transaksi rental.

Batasan sejak awal: pembayaran bersifat non-gateway (konfirmasi manual via WhatsApp dan admin approval); basis data SQLite file-based tanpa server database terpisah; dan demo berjalan pada Vercel atau Node.js VPS.

Di luar lingkup tahap ini: verifikasi identitas KYC (KTP/KTM/selfie), payment gateway terintegrasi, notifikasi email/push, manajemen security deposit dan denda keterlambatan, serta aplikasi mobile native.

1.4 Referensi

1. Karl Wiegers dan Seilevel, Software Requirements Specification Template, struktur acuan dokumen ini.
2. Laporan SDLC Tahap Perencanaan (Planning) Pengembangan Web Rental Gadget, Kelompok 5, Universitas Gunadarma, Oktober 2026.
3. Dokumentasi Next.js 15 App Router (nextjs.org/docs).
4. Dokumentasi Prisma ORM dan SQLite Engine (prisma.io/docs).
5. Dokumentasi Tailwind CSS v4 (tailwindcss.com/docs).
6. Undang-Undang Republik Indonesia No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.

1.5 Metode dan Sintesis Pengumpulan Kebutuhan

Kebutuhan dalam dokumen ini disusun dari analisis skenario penyewaan gadget dan permasalahan yang menjadi dasar pengembangan RENTGADGET. Empat instrumen berikut adalah rencana untuk memvalidasi kebutuhan. Pelaksanaan dan hasil metode ini belum terdokumentasi dalam bahan yang tersedia, sehingga dokumen ini tidak memuat temuan, tanggal, responden, maupun kutipan hasil.

Wawancara

Wawancara (rencana): ditujukan untuk menggali pengalaman pemilik usaha rental gadget dan staf toko fisik di Depok dan sekitarnya dalam mengelola penyewaan. Pelaksanaan dan hasil metode ini belum terdokumentasi dalam bahan yang tersedia. Panduan pertanyaan yang disiapkan:

1. Bagaimana alur penyewaan gadget dari permintaan pelanggan sampai pengembalian unit?
2. Hambatan apa yang paling sering muncul saat pencatatan ketersediaan stok dan perhitungan tarif sewa?
3. Media komunikasi apa yang dipakai pelanggan untuk memesan, dan apa kendalanya?

Asumsi awal (belum divalidasi, bukan temuan wawancara): pencatatan sewa lewat nota kertas dan chat WhatsApp diasumsikan mudah tercecer dan sulit direkap, dan perhitungan tarif sewa paket mingguan/bulanan secara manual diasumsikan rawan salah hitung. Kebutuhan yang diturunkan dari asumsi tersebut: diperlukan katalog terpusat dengan kalkulator tarif otomatis dan formulir booking terstruktur.

Kuesioner

Kuesioner (rencana): ditujukan untuk memetakan kebiasaan dan kesulitan calon penyewa (mahasiswa, freelancer, pelaku UMKM) yang pernah menyewa gadget, mencakup pengalaman mencari informasi ketersediaan, membandingkan harga paket, dan mengkonfirmasi pemesanan. Instrumen ini adalah rencana; kuesioner lengkap tidak dicantumkan dalam dokumen ini. Pelaksanaan dan hasil metode ini belum terdokumentasi dalam bahan yang tersedia.

Asumsi awal (belum divalidasi): tidak adanya simulasi tarif paket (harian vs. mingguan vs. bulanan) diasumsikan membuat calon penyewa kesulitan memilih durasi sewa yang optimal. Kebutuhan yang diturunkan: diperlukan kalkulator sewa interaktif yang menampilkan perbandingan tarif dan diskon paket secara real-time.

Observasi

Observasi (rencana): ditujukan untuk mencermati alur transaksi penyewaan gadget di toko fisik, mencatat urutan langkah dari penerimaan pelanggan hingga serah terima unit, serta titik yang menimbulkan antrean atau kebingungan. Pelaksanaan dan hasil metode ini belum terdokumentasi dalam bahan yang tersedia. Asumsi awal (belum divalidasi): pengecekan ketersediaan unit secara manual diasumsikan memakan waktu dan rawan bentrok jadwal sewa. Kebutuhan yang diturunkan: diperlukan dashboard admin dengan tampilan stok real-time dan daftar unit yang sedang disewa.

FGD (Focus Group Discussion)

Diskusi kelompok terarah (rencana): ditujukan untuk menyepakati kebutuhan dari sudut pandang dua peran (penyewa dan admin toko), mencakup alur booking, metode konfirmasi pembayaran, pilihan pengambilan/pengantaran unit, dan siklus status transaksi. Pelaksanaan dan hasil metode ini belum terdokumentasi dalam bahan yang tersedia.

Kebutuhan yang diturunkan dari skenario: metode penerimaan unit terdiri dari ambil di toko (PICKUP) dan antar-jemput (DELIVERY) dengan kolom alamat wajib untuk opsi antar; paket sewa otomatis direkomendasikan sesuai durasi (>=7 hari otomatis mingguan, >=30 hari otomatis bulanan); dan konfirmasi booking dapat langsung diteruskan ke WhatsApp staf toko melalui pesan terstruktur.


================================================================================

BAB II GAMBARAN UMUM

2.1 Perspektif Produk

RENTGADGET adalah produk mandiri yang baru dibangun sebagai aplikasi web full-stack. Sistem menggabungkan antarmuka frontend modern (Next.js React Server & Client Components) dan logika bisnis backend (Next.js Route Handlers) dalam satu arsitektur terpadu. Data operasional tersimpan di basis data SQLite milik aplikasi yang dikelola melalui Prisma ORM. Pihak eksternal: peramban pengguna dan WhatsApp API URL Scheme untuk konfirmasi booking ke staf toko fisik di Depok/Jabodetabek.

Alur utama sistem: admin mengelola katalog gadget dan harga sewa, penyewa menjelajahi katalog dan memesan unit lewat formulir online, sistem mencatat pesanan dan menyediakan generator pesan WhatsApp terstruktur untuk konfirmasi, admin memproses dan mengubah status pesanan melalui dashboard.

2.2 Kelompok Pengguna dan Karakteristiknya

Tabel 2.1 Kelompok Pengguna

+-------------------+---------------------------------------------------------------+
| Kelompok          | Karakteristik dan frekuensi pakai                             |
+-------------------+---------------------------------------------------------------+
| Penyewa/Customer  | Mahasiswa, freelancer, kreator konten, pelaku UMKM, dan       |
| (prioritas)       | masyarakat umum. Terbiasa memakai peramban ponsel. Pakai      |
|                   | insidental: mencari gadget, melihat spesifikasi dan harga,    |
|                   | simulasi biaya sewa, mengisi formulir booking, dan            |
|                   | mengkonfirmasi pesanan via WhatsApp.                          |
+-------------------+---------------------------------------------------------------+
| Admin/Staf Toko   | 1-3 orang staf operasional toko rental fisik. Pakai harian:   |
|                   | mengelola katalog unit (tambah, edit, hapus, upload foto),    |
|                   | memantau pesanan masuk, memperbarui status sewa, dan melihat  |
|                   | ringkasan pendapatan.                                         |
+-------------------+---------------------------------------------------------------+
| Pengunjung Tamu   | Belum melakukan pemesanan. Hanya melihat katalog, detail      |
|                   | spesifikasi, simulasi harga, halaman FAQ, dan informasi       |
|                   | lokasi toko.                                                  |
+-------------------+---------------------------------------------------------------+

2.3 Lingkungan Operasional

Tabel 2.2 Lingkungan Operasional

+-------------------+---------------------------------------------------------------+
| Aspek             | Keterangan                                                    |
+-------------------+---------------------------------------------------------------+
| Server            | Vercel Cloud Platform atau Node.js VPS (self-hosted).         |
+-------------------+---------------------------------------------------------------+
| Backend           | Next.js 15 App Router, TypeScript, Node.js v18+.              |
+-------------------+---------------------------------------------------------------+
| Frontend          | Next.js React Components + Tailwind CSS, SSR dan CSR hybrid.  |
+-------------------+---------------------------------------------------------------+
| Basis data        | SQLite satu berkas (prisma/dev.db) dikelola Prisma ORM.       |
+-------------------+---------------------------------------------------------------+
| Klien             | Peramban modern (Chrome, Firefox, Safari, Edge) di ponsel     |
|                   | dan desktop, JavaScript aktif.                                |
+-------------------+---------------------------------------------------------------+
| Konfirmasi        | WhatsApp URL Scheme (https://wa.me/) untuk pesan booking      |
|                   | terstruktur ke staf toko.                                     |
+-------------------+---------------------------------------------------------------+

2.4 Batasan Desain dan Implementasi

1. Antarmuka dan logika wajib dibangun dengan Next.js (TypeScript) dan Tailwind CSS.
2. Basis data wajib SQLite, tanpa server basis data terpisah.
3. Autentikasi admin memakai cookie HTTP-Only (admin_session) dengan flag SameSite=Lax.
4. Konfirmasi pembayaran bersifat manual (via WhatsApp dan admin approval); tidak ada payment gateway terintegrasi pada tahap ini.
5. Penyimpanan berkas gambar gadget pada direktori lokal server (/public/uploads).
6. Seluruh rahasia (ADMIN_PASSWORD, DATABASE_URL) hanya lewat variabel lingkungan server (.env yang di-gitignore).

2.5 Asumsi dan Ketergantungan

1. Pengguna memiliki koneksi internet dan peramban modern dengan JavaScript aktif.
2. Untuk konfirmasi booking via WhatsApp, pengguna diasumsikan telah memiliki aplikasi WhatsApp atau WhatsApp Web.
3. Kelangsungan demo bergantung pada ketersediaan hosting Vercel (free tier) atau VPS.
4. Admin toko memasukkan data gadget dengan benar; sistem memvalidasi format input tetapi tidak memverifikasi kebenaran isi deskripsi.
5. Zona waktu tampilan WIB (Asia/Jakarta).


================================================================================

BAB III FITUR SISTEM

Bab ini menguraikan enam fitur sistem dengan pola yang sama: deskripsi dan prioritas, aksi pengguna dan respons sistem, lalu kebutuhan fungsional normatif. Penomoran kebutuhan fungsional (REQ-F) dipertahankan berurutan.

3.1 Penjelajahan Katalog dan Filter Kategori

Deskripsi dan prioritas: Halaman beranda dan halaman katalog (/katalog) menampilkan daftar gadget aktif lengkap dengan pencarian teks model, filter kategori (Semua, Laptop, Smartphone, Tablet, Aksesoris), dan kartu perangkat berisi gambar/emoji, spesifikasi ringkas, serta tarif harian. Prioritas: Wajib.

Aksi pengguna dan respons sistem: Pengunjung membuka beranda atau halaman katalog; sistem menampilkan daftar kartu gadget aktif (isActive: true). Pengunjung memilih tombol kategori atau mengetik kata kunci pencarian; sistem memfilter daftar secara instan di sisi klien tanpa muat ulang halaman. Pengunjung mengeklik salah satu kartu; sistem mengarahkan ke halaman formulir booking unit tersebut (/rent/[id]). Bila tidak ada gadget yang cocok, sistem menampilkan daftar kosong dengan keterangan.

REQ-F-01 (Wajib): Sistem harus menampilkan daftar seluruh gadget berstatus isActive: true beserta kategori, spesifikasi penyimpanan, warna, dan harga sewa harian.

REQ-F-02 (Wajib): Sistem harus menyediakan pencarian model dan filter kategori (Semua, Laptop, Smartphone, Tablet, Aksesoris) yang bekerja secara instan di sisi klien.

REQ-F-03 (Penting): Sistem harus menampilkan informasi stok tersedia pada setiap kartu gadget.

REQ-F-04 (Penting): Bila gadget tidak memiliki foto asli (imageUrl null), sistem harus menampilkan ikon emoji representatif (imageEmoji) sebagai fallback visual.

3.2 Kalkulasi Tarif Dinamis dan Pemesanan Rental (Booking Online)

Deskripsi dan prioritas: Halaman detail perangkat (/rent/[id]) menyediakan kalkulator sewa otomatis dan formulir reservasi online. Sistem menghitung durasi hari, menerapkan tarif paket (Harian, Mingguan, Bulanan) beserta persentase diskon, dan mencatat pesanan ke basis data. Satu pesanan berisi satu unit gadget. Prioritas: Wajib.

Aksi pengguna dan respons sistem: Penyewa membuka halaman booking unit yang dipilih; sistem menampilkan spesifikasi gadget di satu sisi dan formulir kalkulator di sisi lainnya. Penyewa memilih tanggal mulai sewa (startDate) dan tanggal selesai sewa (endDate); sistem langsung menghitung jumlah hari, merekomendasikan paket otomatis (>=7 hari → mingguan, >=30 hari → bulanan), menampilkan persentase diskon dan total biaya sewa dalam format Rupiah. Penyewa memilih metode penerimaan (PICKUP atau DELIVERY); bila DELIVERY, kolom alamat wajib diisi. Penyewa melengkapi data diri (Nama Lengkap, Nomor WhatsApp, Email, Catatan) lalu mengirim; sistem memvalidasi, menyimpan ke tabel Rental dengan status PENDING, dan menampilkan konfirmasi berisi ID booking dan rincian transaksi. Bila tanggal tidak valid, sistem menolak dengan pesan kesalahan.

REQ-F-05 (Wajib): Sistem harus menolak pengajuan bila tanggal selesai sewa sama dengan atau mendahului tanggal mulai sewa.

REQ-F-06 (Wajib): Sistem harus menghitung total harga sewa secara dinamis di sisi klien berdasarkan durasi hari dan paket yang dipilih, dengan formula: harga harian x jumlah hari (Harian), harga mingguan / 7 x jumlah hari (Mingguan), atau harga bulanan / 30 x jumlah hari (Bulanan).

REQ-F-07 (Wajib): Sistem harus merekomendasikan paket secara otomatis berdasarkan durasi: >=30 hari → Bulanan, >=7 hari → Mingguan, <7 hari → Harian.

REQ-F-08 (Wajib): Sistem harus mewajibkan pengisian nama, nomor telepon/WhatsApp, dan email sebelum formulir dapat dikirim.

REQ-F-09 (Wajib): Sistem harus mewajibkan pengisian alamat lengkap bila metode pengiriman adalah DELIVERY.

REQ-F-10 (Wajib): Sistem harus menyimpan pesanan baru ke tabel Rental dengan status default PENDING dan mengembalikan ID transaksi unik (CUID) kepada penyewa.

3.3 Integrasi WhatsApp Booking

Deskripsi dan prioritas: Setelah formulir booking berhasil dikirim, sistem menyediakan tombol untuk meneruskan konfirmasi ke WhatsApp staf toko. Selain itu, widget WhatsApp mengambang tersedia di setiap halaman publik untuk konsultasi umum. Prioritas: Penting.

Aksi pengguna dan respons sistem: Setelah booking berhasil, penyewa mengeklik tombol "Konfirmasi via WhatsApp"; sistem menyusun tautan https://wa.me/[Nomor]?text=... berisi rincian: ID Booking, Nama Gadget, Tanggal Sewa, Durasi, Total Biaya, Nama dan Nomor Penyewa; aplikasi WhatsApp terbuka dengan draf pesan siap kirim. Di setiap halaman publik, pengunjung dapat mengeklik ikon WhatsApp mengambang di pojok kanan bawah untuk langsung menghubungi staf toko.

REQ-F-11 (Penting): Sistem harus menyediakan generator pesan WhatsApp ter-encode URI yang mencakup rincian lengkap pesanan setelah booking berhasil.

REQ-F-12 (Penting): Sistem harus menyediakan komponen mengambang (floating widget) WhatsApp di setiap halaman publik dengan nomor kontak toko yang terkonfigurasi.

3.4 Autentikasi Admin

Deskripsi dan prioritas: Akses panel administrasi (/admin) dan operasi perubahan data reservasi dibatasi hanya kepada staf admin yang terautentikasi. Login memakai kata sandi admin tunggal tanpa sistem peran ganda. Prioritas: Wajib.

Aksi pengguna dan respons sistem: Staf membuka /admin atau endpoint terproteksi; bila belum memiliki sesi, sistem mengalihkan ke halaman login (/login). Staf memasukkan kata sandi admin; endpoint /api/auth/login memvalidasi kredensial terhadap variabel lingkungan ADMIN_PASSWORD. Bila valid, server menerbitkan cookie admin_session dengan flag HttpOnly, SameSite=Lax, Path=/; pengguna dialihkan ke dashboard admin. Bila tidak valid, sistem menampilkan pesan kesalahan. Tombol "Keluar" menghapus cookie dan mengembalikan ke halaman login.

REQ-F-13 (Wajib): Sistem harus menolak akses ke endpoint /api/rentals (operasi perubahan status) dan halaman /admin bagi pengguna tanpa cookie sesi admin yang valid (HTTP 401 Unauthorized).

REQ-F-14 (Wajib): Sistem harus menyimpan sesi admin dalam cookie HttpOnly untuk mencegah pencurian token melalui skrip XSS di peramban.

REQ-F-15 (Wajib): Sistem harus menyediakan fitur logout yang menghapus cookie sesi.

3.5 Manajemen Inventaris Gadget (CRUD dan Upload Foto)

Deskripsi dan prioritas: Admin mengelola katalog gadget: menambah unit baru, mengubah spesifikasi dan tarif sewa, mengunggah foto unit, serta menonaktifkan atau menghapus unit. Prioritas: Wajib.

Aksi pengguna dan respons sistem: Admin membuka tab "Manajemen Gadget" pada dashboard; sistem menampilkan daftar seluruh unit beserta kategori, tarif, stok, dan status. Admin mengisi formulir penambahan: Model, Kategori (Laptop/Smartphone/Tablet/Aksesoris), Penyimpanan, Warna, Harga Harian/Mingguan/Bulanan, Stok, Deskripsi, Emoji, dan Berkas Gambar lalu menyimpan; sistem memvalidasi, menyimpan gambar ke /public/uploads, dan mencatat entitas ke tabel Phone. Admin dapat mengubah data unit atau menonaktifkan unit dari katalog publik. Bila validasi gagal, sistem menampilkan pesan kesalahan.

REQ-F-16 (Wajib): Sistem harus menyediakan bagi admin kemampuan menambah unit gadget baru beserta seluruh atributnya (model, kategori, spesifikasi, tarif, stok, deskripsi, emoji).

REQ-F-17 (Penting): Sistem harus mendukung pengunggahan berkas gambar format JPEG, PNG, dan WebP ke folder penyimpanan server.

REQ-F-18 (Wajib): Sistem harus menyediakan bagi admin kemampuan memperbarui data unit, termasuk stok, tarif harian/mingguan/bulanan, dan status aktif/non-aktif.

REQ-F-19 (Penting): Sistem harus menyediakan bagi admin kemampuan menghapus unit dari katalog. Catatan Implementasi: saat ini penghapusan bersifat hard delete; penahan penghapusan untuk unit yang memiliki rental aktif belum diterapkan (lihat Lampiran C, TBD-01).

3.6 Pemrosesan Status Transaksi dan Approval Rental

Deskripsi dan prioritas: Admin memantau pesanan sewa masuk, mengevaluasi kelengkapan, dan memperbarui status tahapan sewa unit melalui siklus: PENDING → APPROVED → ACTIVE → COMPLETED, dengan kemungkinan CANCELLED di tahap PENDING atau APPROVED. Prioritas: Wajib.

Aksi pengguna dan respons sistem: Admin membuka tab "Daftar Reservasi & Rental" di dashboard; sistem menampilkan tabel seluruh reservasi diurutkan dari terbaru. Admin memeriksa rincian pesanan (nama, telepon, email, paket, tanggal, metode pengantaran, alamat) lalu memilih aksi perubahan status melalui dropdown; sistem memperbarui status di basis data dan menampilkan status terbaru. Transisi yang diperbolehkan: PENDING → APPROVED (pesanan disetujui), APPROVED → ACTIVE (unit diserahterimakan), ACTIVE → COMPLETED (unit dikembalikan, transaksi selesai), PENDING/APPROVED → CANCELLED (pesanan dibatalkan).

REQ-F-20 (Wajib): Sistem harus menampilkan daftar seluruh transaksi pemesanan beserta status terkininya, diurutkan dari terbaru.

REQ-F-21 (Wajib): Sistem harus memungkinkan admin mengubah status transaksi sesuai siklus: PENDING, APPROVED, ACTIVE, COMPLETED, dan CANCELLED.

REQ-F-22 (Penting): Sistem harus menyediakan fasilitas pencatatan catatan khusus (notes) pada tiap transaksi sewa.


================================================================================

BAB IV KEBUTUHAN DATA

4.1 Model Data Logis

Sistem menggunakan dua tabel utama: Phone dan Rental. Rantai transaksi utama: Phone 1-N Rental (satu unit gadget dapat memiliki banyak transaksi rental). Satu relasi kunci asing menghubungkan kedua tabel: Rental.phoneId → Phone.id.

Seluruh kolom kunci asing bersifat wajib terisi (tidak nullable), sehingga setiap baris Rental merujuk tepat satu baris Phone.

Diagram ERD:

+-----------------------------------+             +-----------------------------------+
|               Phone               |             |              Rental               |
+-----------------------------------+             +-----------------------------------+
| id: String (CUID, PK)             | 1         * | id: String (CUID, PK)             |
| model: String                     |<------------| phoneId: String (FK → Phone.id)   |
| category: String                  |             | customerName: String              |
| storage: String                   |             | customerPhone: String             |
| color: String                     |             | customerEmail: String             |
| dailyPrice: Int                   |             | startDate: DateTime               |
| weeklyPrice: Int?                 |             | endDate: DateTime                 |
| monthlyPrice: Int?                |             | rentalPackage: String             |
| stock: Int                        |             | deliveryMethod: String            |
| description: String               |             | deliveryAddress: String?          |
| imageUrl: String?                 |             | totalPrice: Int                   |
| imageEmoji: String                |             | status: RentalStatus (Enum)       |
| isActive: Boolean                 |             | notes: String?                    |
| createdAt: DateTime               |             | createdAt: DateTime               |
| updatedAt: DateTime               |             | updatedAt: DateTime               |
+-----------------------------------+             +-----------------------------------+

REQ-D-01 (Wajib): Setiap rental wajib merujuk satu unit gadget (phoneId), nama penyewa, nomor telepon, email, tanggal mulai, tanggal selesai, paket sewa, metode pengambilan, total harga, dan status.

REQ-D-02 (Wajib): Setiap gadget wajib memiliki model, kategori, kapasitas penyimpanan, warna, harga harian, stok, deskripsi, dan emoji.

REQ-D-03 (Wajib): Waktu pembuatan dan pembaruan data disimpan sebagai kolom terpisah (createdAt, updatedAt) pada kedua tabel.

4.2 Kamus Data

Kamus data menggunakan tipe logis migrasi Prisma. Pada SQLite, String terpetakan ke TEXT, Int ke INTEGER, Boolean ke INTEGER (0/1), DateTime ke teks tanggal-waktu, dan Enum ke TEXT dengan batasan nilai yang dijaga Prisma. Kolom bertanda FK merujuk primary key tabel induknya.

Setiap tabel memiliki createdAt (default now()) dan updatedAt (auto-update) yang tidak diulang dalam tabel berikut.

Tabel 4.1 Phone

+---------------+-----------------------+-------+----------------------------------------------+
| Kolom         | Tipe                  | Null  | Constraint                                   |
+---------------+-----------------------+-------+----------------------------------------------+
| id            | String (CUID)         | tidak | PK, digenerate otomatis                      |
| model         | String                | tidak | Nama merek dan model seri                    |
| category      | String                | tidak | Default "Smartphone"; isi: Laptop,           |
|               |                       |       | Smartphone, Tablet, Aksesoris                |
| storage       | String                | tidak | Kapasitas penyimpanan (contoh: "256 GB")     |
| color         | String                | tidak | Varian warna (contoh: "Natural Titanium")    |
| dailyPrice    | Int                   | tidak | Tarif sewa per hari (Rupiah), > 0            |
| weeklyPrice   | Int                   | ya    | Tarif paket 7 hari, nullable                 |
| monthlyPrice  | Int                   | ya    | Tarif paket 30 hari, nullable                |
| stock         | Int                   | tidak | Default 1, jumlah unit tersedia >= 0         |
| description   | String (Text)         | tidak | Deskripsi kondisi dan spesifikasi            |
| imageUrl      | String                | ya    | Path relatif berkas foto                     |
| imageEmoji    | String                | tidak | Default "📱", emoji representasi              |
| isActive      | Boolean               | tidak | Default true, status tampil di katalog       |
+---------------+-----------------------+-------+----------------------------------------------+

Tabel 4.2 Rental

+------------------+-----------------------+-------+----------------------------------------------+
| Kolom            | Tipe                  | Null  | Constraint                                   |
+------------------+-----------------------+-------+----------------------------------------------+
| id               | String (CUID)         | tidak | PK, identitas nomor booking                 |
| phoneId          | String (CUID)         | tidak | FK → Phone.id                               |
| customerName     | String                | tidak | Nama lengkap penyewa                        |
| customerPhone    | String                | tidak | Nomor WhatsApp, format 08xx atau +628xx      |
| customerEmail    | String                | tidak | Alamat email valid                           |
| startDate        | DateTime              | tidak | Tanggal mulai sewa                           |
| endDate          | DateTime              | tidak | Harus setelah startDate                      |
| rentalPackage    | String                | tidak | Default "HARIAN"; isi: HARIAN, MINGGUAN,    |
|                  |                       |       | BULANAN                                      |
| deliveryMethod   | String                | tidak | Default "PICKUP"; isi: PICKUP, DELIVERY      |
| deliveryAddress  | String (Text)         | ya    | Wajib bila deliveryMethod = DELIVERY         |
| totalPrice       | Int                   | tidak | Dihitung server, harga x durasi              |
| status           | Enum (RentalStatus)   | tidak | Default PENDING; isi: PENDING, APPROVED,     |
|                  |                       |       | ACTIVE, COMPLETED, CANCELLED                 |
| notes            | String (Text)         | ya    | Catatan admin atau preferensi penyewa        |
+------------------+-----------------------+-------+----------------------------------------------+

4.3 Laporan

Admin memperoleh ringkasan operasional pada dashboard berupa empat indikator:

1. Total keseluruhan transaksi rental.
2. Jumlah pesanan menunggu konfirmasi (status PENDING).
3. Jumlah unit sedang disewa (status ACTIVE).
4. Total estimasi pendapatan sewa (jumlah totalPrice dari transaksi berstatus APPROVED + ACTIVE + COMPLETED, dalam Rupiah).

Laporan tampil di layar dashboard; ekspor berkas terpisah bukan kebutuhan wajib tahap ini.

4.4 Perolehan, Integritas, Penyimpanan, dan Penghapusan

Data gadget dibuat lewat formulir admin tervalidasi. Data rental diperoleh dari formulir booking penyewa yang divalidasi di sisi klien dan server. Integritas dijaga kunci asing Prisma ORM (Rental.phoneId → Phone.id) dan transaksi basis data SQLite (ACID compliance). Basis data disimpan sebagai berkas tunggal (prisma/dev.db) yang dapat diduplikasi untuk pencadangan.

Retensi data operasional, frekuensi pencadangan, dan prosedur penghapusan berkala belum ditetapkan pada tahap ini (lihat Lampiran C, TBD-02).

Perilaku hapus yang berlaku saat ini: hapus gadget bersifat hard delete berantai (rental terkait ikut terhapus); penonaktifan (isActive: false) disarankan sebagai alternatif untuk menjaga riwayat transaksi. Kebijakan ini belum disahkan; lihat Lampiran C (TBD-01).


================================================================================

BAB V ANTARMUKA EKSTERNAL

5.1 Antarmuka Pengguna

Seluruh interaksi berjalan di peramban lewat halaman responsif yang nyaman mulai lebar 360 piksel hingga layar desktop 1920 piksel. Tampilan menggunakan tema modern dan konsisten berbasis Tailwind CSS. Setiap halaman publik memiliki bilah navigasi (Navbar) di bagian atas dan widget WhatsApp mengambang di pojok kanan bawah. Pesan kesalahan formulir berbahasa Indonesia dan ditampilkan dengan penanda visual warna merah di bawah kolom isian yang bermasalah.

Halaman utama mencakup: hero section, kategori perangkat interaktif, daftar gadget unggulan, alur cara menyewa (How It Works), skenario penggunaan (Use Cases), lokasi toko fisik beserta peta dan jam operasional, dan bagian FAQ. Halaman katalog (/katalog) menyediakan filter kategori dan grid kartu gadget. Halaman booking (/rent/[id]) menampilkan dua kolom: spesifikasi gadget dan formulir kalkulator. Dashboard admin (/admin) menyajikan tab navigasi, kartu statistik, tabel manajemen, dan formulir CRUD.

REQ-Q-01 (Penting): Halaman beranda, katalog, dan formulir booking tetap terbaca dan tidak melebar melampaui layar ponsel 360 px.

5.2 Antarmuka Perangkat Lunak

Next.js Route Handlers menyediakan endpoint REST API:
- GET, POST /api/phones: pengambilan katalog dan pembuatan unit baru.
- GET, PUT, DELETE /api/phones/[id]: detail, pembaruan, dan penghapusan unit.
- GET, POST /api/rentals: daftar reservasi dan penerimaan pesanan baru.
- PATCH /api/rentals/[id]: pembaruan status pesanan oleh admin.
- POST /api/auth/login dan POST /api/auth/logout: pengelolaan sesi admin.

Prisma Client diakses eksklusif oleh aplikasi Next.js sebagai layer ORM ke SQLite. WhatsApp URL Scheme (https://wa.me/) dipakai untuk memicu pembukaan aplikasi chat dengan pesan parameter ter-encode.

5.3 Antarmuka Perangkat Keras

Sistem adalah perangkat lunak berbasis web yang tidak berinteraksi langsung dengan perangkat keras khusus. Server berupa Vercel serverless functions atau Node.js VPS standar. Di sisi pengguna, hanya diperlukan ponsel, tablet, atau laptop/PC dengan peramban modern.

5.4 Antarmuka Komunikasi

Semua lalu lintas antara peramban dan server memakai HTTPS (TLS 1.2+). Pertukaran data internal antara frontend dan backend menggunakan format JSON melalui metode HTTP RESTful (GET, POST, PUT, PATCH, DELETE). Autentikasi sesi dikirimkan melalui header HTTP Cookie.


================================================================================

BAB VI ATRIBUT KUALITAS

6.1 Kemudahan Penggunaan

Alur katalog → detail → kalkulator → booking memakai label Indonesia yang lugas. Kalkulator sewa memperbarui total secara instan saat tanggal berubah, tanpa tombol hitung terpisah. Pengunjung baru ditargetkan dapat menyelesaikan simulasi harga dan pengiriman formulir booking dalam waktu kurang dari 3 menit tanpa pelatihan formal.

Rencana pemeriksaan: lima pengguna baru diminta menyelesaikan pemesanan sampai konfirmasi WhatsApp dalam satu sesi uji terpandu per pengguna; hasil yang diamati adalah penyelesaian tiap peserta beserta titik kegagalannya. Perangkat, jaringan, dan cara pengukuran belum ditetapkan (lihat Lampiran C, TBD-03).

6.2 Kinerja

REQ-Q-02 (Penting): Halaman beranda dan katalog ditargetkan tampil (First Contentful Paint) di bawah 2 detik pada koneksi 4G stabil.

REQ-Q-03 (Penting): Transisi filter kategori gadget bekerja secara instan di sisi klien (render latency di bawah 100 milidetik).

REQ-Q-04 (Penting): Permintaan API penyimpanan reservasi diselesaikan di bawah 500 milidetik pada sisi server.

Rencana pemeriksaan: memuat halaman katalog dan mengukur waktu tampil. Kondisi pengukuran (alat ukur, cache, perangkat) belum ditetapkan (lihat Lampiran C, TBD-03).

6.3 Keamanan

Autentikasi admin berbasis cookie HTTP-Only dengan flag SameSite=Lax menjadi lapis dasar. Kredensial admin dan konfigurasi basis data hanya hidup di variabel lingkungan server (.env). Penggunaan Prisma ORM memitigasi risiko SQL injection melalui parameterized queries.

REQ-Q-05 (Wajib): Rute /admin dan endpoint perubahan data rental menolak akses tanpa cookie sesi admin yang valid.

REQ-Q-06 (Wajib): Cookie sesi admin bertanda HttpOnly sehingga tidak dapat dibaca oleh skrip sisi klien (pencegahan XSS).

REQ-Q-07 (Wajib): Variabel lingkungan sensitif (ADMIN_PASSWORD, DATABASE_URL) tercantum dalam .gitignore dan tidak terpublikasi ke repositori.

6.4 Ketersediaan dan Keandalan

Kriteria tahap prototipe: layanan diupayakan aktif selama periode penilaian, tanpa jaminan SLA formal. Saat di-deploy ke Vercel, ketersediaan bergantung pada infrastruktur Vercel. Saat self-hosted, ketersediaan bergantung pada VPS yang digunakan. Target ketersediaan 99.5% per bulan pada infrastruktur produksi, namun tidak ada klaim uptime untuk tahap demo.

6.5 Keselamatan dan Kekokohan

Basis data SQLite menjamin atomisitas transaksi (ACID) sehingga tidak terjadi data setengah tersimpan bila koneksi terputus saat proses booking. Konfirmasi ulang sebelum operasi berisiko (hapus unit, batalkan pesanan) belum diterapkan seragam; lihat Lampiran C (TBD-04).


================================================================================

BAB VII INTERNASIONALISASI DAN LOKALISASI

Bahasa antarmuka Bahasa Indonesia, dan istilah teknis (booking, checkout, deploy) dipertahankan agar selaras dengan dokumentasi framework. Nilai uang format Rupiah (Rp150.000) dengan titik pemisah ribuan, tanpa desimal. Format tanggal DD/MM/YYYY dengan zona waktu WIB (UTC+7). Nomor telepon mendukung konvensi Indonesia (awalan 08xx atau +628xx). Kolom nama menerima nama satu kata yang umum di Indonesia.


================================================================================

BAB VIII KEBUTUHAN LAINNYA

8.1 Batasan Implementasi Tahap Prototipe

Basis data SQLite satu berkas membatasi konkurensi tinggi; cocok untuk demo dan volume toko kecil-menengah. Konfirmasi pembayaran bersifat manual via WhatsApp dan admin approval; tidak ada verifikasi otomatis settlement. Penyimpanan gambar pada direktori lokal server (/public/uploads) membatasi skalabilitas; belum ada integrasi CDN atau cloud storage. Autentikasi admin memakai kata sandi tunggal tanpa sistem peran multi-level. Data demo dibatasi pada data sintetis atau uji.

8.2 Saran Pengembangan Lanjutan

1. Integrasi payment gateway (Midtrans/Xendit) untuk verifikasi pembayaran otomatis dan pengurangan intervensi manual.
2. Implementasi verifikasi identitas KYC (unggah KTP/KTM, selfie, kontak darurat) untuk meningkatkan keamanan aset.
3. Penambahan sistem notifikasi otomatis (email/push) untuk pengingat jatuh tempo pengembalian unit.
4. Migrasi basis data ke PostgreSQL atau MySQL untuk mendukung konkurensi tinggi dan volume transaksi besar.
5. Integrasi penyimpanan media ke Cloudinary atau Supabase Storage untuk skalabilitas berkas gambar.
6. Penambahan manajemen security deposit dan kalkulasi denda keterlambatan otomatis.
7. Penambahan kalender ketersediaan real-time per unit untuk mencegah double-booking.
8. Pengembangan sistem peran admin multi-level (super admin, staf operasional).


================================================================================

LAMPIRAN A GLOSARIUM

Tabel A.1 Glosarium

+----------------------------+----------------------------------------------------------+
| Istilah                    | Arti dalam RENTGADGET                                    |
+----------------------------+----------------------------------------------------------+
| API (Application           | Antarmuka pertukaran data antar komponen perangkat lunak |
| Programming Interface)     | melalui protokol HTTP.                                   |
+----------------------------+----------------------------------------------------------+
| Booking                    | Proses pemesanan sewa gadget oleh penyewa melalui        |
|                            | formulir online.                                         |
+----------------------------+----------------------------------------------------------+
| CRUD (Create, Read,        | Empat fungsi dasar manipulasi data persisten pada basis  |
| Update, Delete)            | data.                                                    |
+----------------------------+----------------------------------------------------------+
| CUID (Collision-resistant  | Algoritma pembuat string identitas unik untuk kunci      |
| Unique Identifier)         | primer data.                                             |
+----------------------------+----------------------------------------------------------+
| Delivery Method            | Metode serah terima gadget: PICKUP (ambil di toko) atau  |
|                            | DELIVERY (antar ke alamat penyewa).                      |
+----------------------------+----------------------------------------------------------+
| HTTP-Only Cookie           | Atribut keamanan cookie yang mencegah akses oleh skrip   |
|                            | sisi klien (pencegahan XSS).                             |
+----------------------------+----------------------------------------------------------+
| ORM (Object-Relational     | Teknik memetakan skema tabel basis data ke objek kode    |
| Mapping)                   | (Prisma).                                                |
+----------------------------+----------------------------------------------------------+
| Rental Package             | Paket durasi sewa: HARIAN, MINGGUAN, atau BULANAN.       |
+----------------------------+----------------------------------------------------------+
| RentalStatus               | Status siklus transaksi sewa: PENDING, APPROVED, ACTIVE, |
|                            | COMPLETED, CANCELLED.                                    |
+----------------------------+----------------------------------------------------------+
| SDLC (System Development   | Siklus hidup pengembangan sistem informasi.              |
| Life Cycle)                |                                                          |
+----------------------------+----------------------------------------------------------+
| SRS (Software Requirements | Dokumen spesifikasi kebutuhan perangkat lunak.           |
| Specification)             |                                                          |
+----------------------------+----------------------------------------------------------+
| SSR (Server-Side           | Proses render halaman web di server sebelum dikirim ke   |
| Rendering)                 | peramban.                                                |
+----------------------------+----------------------------------------------------------+


================================================================================

LAMPIRAN B MODEL ANALISIS

Model visual tahap analisis:

B.1 Diagram Alur Proses Pemesanan Rental (Use Case Flow)

[ Pengunjung / Customer ]
         │
         ▼
[ Buka Katalog & Pilih Gadget ]
         │
         ▼
[ Tentukan Tanggal Sewa & Paket ] ──→ (Sistem hitung otomatis tarif & diskon)
         │
         ▼
[ Pilih Metode: Pickup / Delivery ]
         │
         ▼
[ Isi Data Identitas & Ajukan Sewa ]
         │
         ├──→ Tersimpan ke Database (Status: PENDING)
         │
         ▼
[ Teruskan Konfirmasi Otomatis ke WhatsApp Admin ]


B.2 Diagram Siklus Status Transaksi Rental (State Transition)

          +-----------------------+
          |        PENDING        |  (Pesanan masuk dari formulir)
          +-----------+-----------+
                      │
         +------------+------------+
         │                         │
         ▼                         ▼
+-----------------+       +-----------------+
|    APPROVED     |       |    CANCELLED    |  (Dibatalkan admin/penyewa)
+--------+--------+       +-----------------+
         │
         ▼
+-----------------+
|     ACTIVE      |  (Unit diserahkan ke penyewa)
+--------+--------+
         │
         ▼
+-----------------+
|    COMPLETED    |  (Unit kembali, transaksi selesai)
+-----------------+


================================================================================

LAMPIRAN C KEPUTUSAN YANG MEMERLUKAN KONFIRMASI

Lampiran ini memuat pertanyaan bisnis yang ditemukan saat penyusunan dan belum diputuskan. Tidak ada butir di bawah yang menjadi kebutuhan; setiap butir menunggu keputusan pemilik produk dan/atau dosen pembimbing. Status semua butir: TBD (belum diputuskan).

+--------+-----------------------------------+------------------------------------+------------------------------------+---------------------+
| ID     | Masalah                           | Pilihan                            | Rekomendasi & Alasan               | Dampak (REQ/Data)   |
+--------+-----------------------------------+------------------------------------+------------------------------------+---------------------+
| TBD-01 | Penghapusan gadget saat ini       | (A) Pertahankan hard delete.       | Pilihan (B). Melindungi riwayat    | Phone, Rental,      |
|        | bersifat hard delete berantai     | (B) Tolak hapus bila sudah ada     | transaksi yang sudah tercatat dan  | REQ-F-19, REQ-D-01  |
|        | (rental terkait ikut terhapus).   | rental. (C) Soft delete / isActive.| menjaga keutuhan laporan keuangan. |                     |
+--------+-----------------------------------+------------------------------------+------------------------------------+---------------------+
| TBD-02 | Kebijakan retensi, pencadangan,   | (A) Simpan tanpa pembersihan.      | Pilihan (B). Menertibkan retensi   | Semua tabel,        |
|        | dan penghapusan data operasional  | (B) Tetapkan periode retensi dan   | data; periode konkret belum        | REQ-D-01..03,       |
|        | belum diatur.                     | prosedur pencadangan berkala.       | ditetapkan.                        | Bab IV 4.4          |
+--------+-----------------------------------+------------------------------------+------------------------------------+---------------------+
| TBD-03 | Parameter uji kualitas belum      | (A) Pertahankan target tanpa       | Pilihan (B). Menjadikan target     | REQ-Q-01..07,       |
|        | baku: perangkat, cache, beban,    | metodologi baku. (B) Tetapkan      | terukur dan dapat direplikasi.     | Bab VI              |
|        | dan batas waktu uji usability.    | parameter uji yang spesifik.       |                                    |                     |
+--------+-----------------------------------+------------------------------------+------------------------------------+---------------------+
| TBD-04 | Konfirmasi ulang sebelum operasi  | (A) Pertahankan tanpa konfirmasi.  | Pilihan (B). Mencegah kesalahan    | REQ-F-19, REQ-F-21  |
|        | berisiko (hapus unit, batalkan    | (B) Tambahkan dialog konfirmasi    | operasional yang tidak dapat       |                     |
|        | pesanan) belum diterapkan         | sebelum aksi krusial.              | dibatalkan.                        |                     |
|        | seragam.                          |                                    |                                    |                     |
+--------+-----------------------------------+------------------------------------+------------------------------------+---------------------+

Butir TBD di atas bukan kebutuhan dan tidak boleh dijadikan dasar pengujian sebelum disahkan.
