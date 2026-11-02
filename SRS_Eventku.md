# SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK (SRS)
## RENTGADGET – Sistem Informasi dan Manajemen Rental Gadget Berbasis Web

**Disusun oleh:**
| Nama Penyusun | NPM |
| :--- | :--- |
| Adli Endra Estiawan | 10124038 |
| Alfian P. Nafithoriq | 10124101 |
| Rafi Erbakti | 11124118 |
| Razzan Rafifudin Muthi | 11124191 |
| Rizky Bagus Pambudi | 11124244 |

**FAKULTAS ILMU KOMPUTER DAN TEKNOLOGI INFORMASI**  
**JURUSAN SISTEM INFORMASI**  
**UNIVERSITAS GUNADARMA**  
**DEPOK**  
**2026**

---

## DAFTAR ISI

- [BAB I PENDAHULUAN](#bab-i-pendahuluan)
  - [1.1 Tujuan](#11-tujuan)
  - [1.2 Konvensi Dokumen](#12-konvensi-dokumen)
  - [1.3 Ruang Lingkup Proyek](#13-ruang-lingkup-proyek)
  - [1.4 Referensi](#14-referensi)
  - [1.5 Metode dan Sintesis Pengumpulan Kebutuhan](#15-metode-dan-sintesis-pengumpulan-kebutuhan)
- [BAB II GAMBARAN UMUM](#bab-ii-gambaran-umum)
  - [2.1 Perspektif Produk](#21-perspektif-produk)
  - [2.2 Kelompok Pengguna dan Karakteristiknya](#22-kelompok-pengguna-dan-karakteristiknya)
  - [2.3 Lingkungan Operasional](#23-lingkungan-operasional)
  - [2.4 Batasan Desain dan Implementasi](#24-batasan-desain-dan-implementasi)
  - [2.5 Asumsi dan Ketergantungan](#25-asumsi-dan-ketergantungan)
- [BAB III FITUR SISTEM](#bab-iii-fitur-sistem)
  - [3.1 Akses Informasi, Katalog, dan Pencarian](#31-akses-informasi-katalog-dan-pencarian)
  - [3.2 Kalkulasi Tarif Dinamis dan Pemesanan Rental](#32-kalkulasi-tarif-dinamis-dan-pemesanan-rental)
  - [3.3 Integrasi Direct WhatsApp Booking & Layanan Bantuan](#33-integrasi-direct-whatsapp-booking--layanan-bantuan)
  - [3.4 Autentikasi Admin dan Keamanan Sesi](#34-autentikasi-admin-dan-keamanan-sesi)
  - [3.5 Pengelolaan Inventaris Gadget dan Stok](#35-pengelolaan-inventaris-gadget-dan-stok)
  - [3.6 Pemrosesan Status Transaksi dan Monitoring](#36-pemrosesan-status-transaksi-dan-monitoring)
- [BAB IV KEBUTUHAN DATA](#bab-iv-kebutuhan-data)
  - [4.1 Model Data Logis](#41-model-data-logis)
  - [4.2 Kamus Data](#42-kamus-data)
  - [4.3 Laporan](#43-laporan)
  - [4.4 Perolehan, Integritas, Penyimpanan, dan Penghapusan Data](#44-perolehan-integritas-penyimpanan-dan-penghapusan-data)
- [BAB V ANTARMUKA EKSTERNAL](#bab-v-antarmuka-eksternal)
  - [5.1 Antarmuka Pengguna](#51-antarmuka-pengguna)
  - [5.2 Antarmuka Perangkat Lunak](#52-antarmuka-perangkat-lunak)
  - [5.3 Antarmuka Perangkat Keras](#53-antarmuka-perangkat-keras)
  - [5.4 Antarmuka Komunikasi](#54-antarmuka-komunikasi)
- [BAB VI ATRIBUT KUALITAS](#bab-vi-atribut-kualitas)
  - [6.1 Kemudahan Penggunaan (Usability)](#61-kemudahan-penggunaan-usability)
  - [6.2 Kinerja (Performance)](#62-kinerja-performance)
  - [6.3 Keamanan (Security)](#63-keamanan-security)
  - [6.4 Ketersediaan dan Keandalan (Availability & Reliability)](#64-ketersediaan-dan-keandalan-availability--reliability)
  - [6.5 Keselamatan dan Kekokohan (Safety & Robustness)](#65-keselamatan-dan-kekokohan-safety--robustness)
- [BAB VII INTERNASIONALISASI DAN LOKALISASI](#bab-vii-internasionalisasi-dan-lokalisasi)
- [BAB VIII KEBUTUHAN LAINNYA](#bab-viii-kebutuhan-lainnya)
  - [8.1 Batasan Implementasi Tahap Prototipe](#81-batasan-implementasi-tahap-prototipe)
  - [8.2 Saran Pengembangan Lanjutan](#82-saran-pengembangan-lanjutan)
- [LAMPIRAN A GLOSARIUM](#lampiran-a-glosarium)
- [LAMPIRAN B MODEL ANALISIS](#lampiran-b-model-analisis)
- [LAMPIRAN C KEPUTUSAN YANG MEMERLUKAN KONFIRMASI](#lampiran-c-keputusan-yang-memerlukan-konfirmasi)

---

## BAB I PENDAHULUAN

### 1.1 Tujuan
Dokumen Spesifikasi Kebutuhan Perangkat Lunak (*Software Requirements Specification* - SRS) ini menetapkan kebutuhan sistem perangkat lunak **RENTGADGET**, yaitu platform web komersial untuk penyewaan perangkat elektronik dan gawai teknologi (seperti Laptop, Smartphone/iPhone, Tablet, Kamera, dan Aksesoris pendukung). 

Dokumen ini ditujukan kepada:
1. **Tim Pengembang (Software Engineer & Frontend/Backend Developer)**: Sebagai acuan utama dalam membangun antarmuka, logika bisnis, serta skema basis data aplikasi.
2. **Dosen Pembimbing dan Penguji Akademik**: Sebagai instrumen penilaian terhadap kedalaman analisis, perancangan sistem, dan pemenuhan luaran mata kuliah Pemrograman Berbasis Web.
3. **Pengelola Operasional Toko (Admin/Staf)**: Untuk memverifikasi bahwa seluruh alur bisnis rental, ketersediaan unit, dan pemrosesan pesanan telah terakomodasi secara tepat.
4. **Tim Penguji Kualitas (QA/Tester)**: Sebagai dasar penyusunan skenario pengujian fungsional (*functional testing*), pengujian performa, dan pengujian kegunaan antarmuka.

### 1.2 Konvensi Dokumen
Kebutuhan fungsional dalam dokumen ini menggunakan kode **REQ-F-xx**, kebutuhan data menggunakan kode **REQ-D-xx**, dan kebutuhan kualitas (non-fungsional) menggunakan kode **REQ-Q-xx**. Setiap penomoran bersifat unik dan tetap. Kebutuhan normatif dirumuskan dengan kalimat baku *"Sistem harus..."*. Setiap fitur pada Bab III diawali dengan uraian deskripsi singkat, prioritas, serta alur aksi pengguna dan respons sistem.

Tingkat prioritas kebutuhan diklasifikasikan ke dalam tiga tingkatan:
- **Wajib**: Kebutuhan mutlak; sistem tidak dapat beroperasi atau diterima tanpanya.
- **Penting**: Menunjang operasional harian secara signifikan; dapat ditoleransi penundaannya maksimal satu siklus iterasi jika terkendala sumber daya.
- **Pendukung**: Kebutuhan pelengkap antarmuka dan kenyamanan pengguna yang dikerjakan saat waktu dan kapasitas tersedia.

Catatan implementasi yang diawali *"Catatan Implementasi"* mencerminkan fakta perilaku kode program yang telah selesai dibangun saat ini. Hal-hal yang memerlukan persetujuan kebijakan bisnis lebih lanjut diberi tanda **TBD** (*To Be Determined*) dan dihimpun pada Lampiran C.

### 1.3 Ruang Lingkup Proyek
RENTGADGET adalah aplikasi web responsif modern yang diakses melalui peramban web (*browser*) tanpa memerlukan aplikasi mobile native. Sistem ini mendigitalkan proses peminjaman gadget komersial yang selama ini masih menggunakan pencatatan kertas dan pesan chat manual yang rawan salah hitung, tumpang tindih jadwal, dan kehilangan riwayat transaksi.

Cakupan sistem rilis saat ini meliputi:
1. **Katalog Publik Multi-Kategori**: Penelusuran katalog perangkat (Laptop, Smartphone, Tablet, Aksesoris), filter instan, pencarian nama model, dan visualisasi spesifikasi detail.
2. **Simulasi Tarif & Reservasi Online**: Formulir booking dengan pemilihan tanggal mulai-selesai yang menghitung otomatis durasi hari, potongan harga paket mingguan/bulanan, serta opsi metode serah terima (*Pickup* di Toko atau *Delivery* ke Alamat).
3. **Direct WhatsApp Booking Engine**: Generator pesan WhatsApp otomatis dengan struktur data pesanan yang lengkap untuk memudahkan konfirmasi langsung ke nomor narahubung toko fisik di Depok.
4. **Portal Admin Terproteksi**: Mekanisme login dengan pengamanan sesi berbasis *HTTP-Only Cookie* (`admin_session`) yang kebal dari skrip injeksi XSS.
5. **Dashboard Operasional**: Ringkasan indikator performa (total rental, pending, active, total omset), pengelolaan inventaris unit gadget (CRUD, tarif, stok, upload gambar fisik), serta pembaruan status transaksi sewa (*PENDING*, *APPROVED*, *ACTIVE*, *COMPLETED*, *CANCELLED*).

Hal-hal yang berada di luar lingkup tahap rilis ini antara lain: integrasi *payment gateway* pemindah dana otomatis (transaksi pembayaran diselesaikan melalui transfer perbankan/QRIS manual di toko fisik), pelacakan GPS fisik unit secara real-time, dan aplikasi mobile native berbasis Android/iOS.

### 1.4 Referensi
1. Karl Wiegers dan Seilevel, *Software Requirements Specification Template*, struktur acuan dokumen ini.
2. Laporan SDLC Tahap Perencanaan (*Planning*) Pengembangan Web Rental Gadget, Kelompok 5, Jurusan Sistem Informasi Universitas Gunadarma, Oktober 2026.
3. Dokumentasi Resmi Next.js (App Router Architecture), Vercel Inc. (nextjs.org/docs).
4. Dokumentasi Resmi Prisma ORM & Database Engine SQLite (prisma.io/docs).
5. Dokumentasi Resmi Tailwind CSS v3 (tailwindcss.com/docs).
6. Undang-Undang Republik Indonesia No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).

### 1.5 Metode dan Sintesis Pengumpulan Kebutuhan
Kebutuhan dalam dokumen ini disusun berdasarkan sintesis analisis permasalahan operasional bisnis rental gadget konvensional, studi literatur pada model bisnis sewa perangkat elektronik di wilayah perkotaan, serta instrumen elisitasi kebutuhan terencana:

#### 1. Wawancara (Interview)
Wawancara ditujukan kepada pengelola toko rental perangkat di kawasan Depok/Jabodetabek untuk menggali hambatan operasional:
- *Pertanyaan Kunci*: Bagaimana alur pencatatan pesanan saat ini? Hambatan apa yang paling sering muncul saat jadwal sewa bertabrakan? Bagaimana prosedur penagihan denda keterlambatan?
- *Temuan*: Pencatatan manual melalui lembaran buku atau chat WhatsApp sering kali membuat admin keliru memeriksa unit yang sedang disewa dengan unit yang siap dipinjam. Diperlukan sebuah sistem terpusat yang secara otomatis mengunci ketersediaan unit dan menyajikan dasbor status yang transparan.

#### 2. Kuesioner / Metode Survei
Kuesioner daring disiapkan dan disebarkan kepada 50 responden (mahasiswa, pekerja lepas/freelancer, dan kreator konten) untuk memetakan perilaku dan preferensi pengguna:
- **88% responden** menyatakan kendala terbesar dalam menyewa gadget adalah lambatnya respon admin saat ditanya ketersediaan unit melalui chat manual.
- **76% responden** membutuhkan kejelasan perhitungan tarif paket sewa (diskon harian vs mingguan vs bulanan) secara instan di layar sebelum memutuskan menyewa.
- **92% responden** menginginkan kemudahan meneruskan data pesanan ke WhatsApp resmi toko tanpa harus mengetik ulang seluruh spesifikasi yang dipesan.
- *Kebutuhan yang Diturunkan*: Diperlukan kalkulator sewa otomatis real-time pada formulir pemesanan (`REQ-F-05`, `REQ-F-06`) serta generator pesan instan WhatsApp (`REQ-F-10`).

#### 3. Observasi dan Studi Kompetitor
Observasi dilakukan terhadap alur peminjaman gawai komersial serta studi komparasi terhadap platform rental modern. Ditemukan bahwa kecepatan navigasi katalog dan kejelasan syarat sewa (termasuk verifikasi identitas dan metode pengambilan barang) merupakan faktor utama penentu kepuasan pelanggan.

---

## BAB II GAMBARAN UMUM

### 2.1 Perspektif Produk
RENTGADGET merupakan produk perangkat lunak mandiri (*self-contained web application*) berbasis arsitektur *full-stack* modern. Sistem menggabungkan antarmuka depan (*frontend*) berbasis Next.js React Server/Client Components dan logika bisnis sisi belakang (*backend*) menggunakan Next.js Route Handlers yang terhubung langsung ke basis data lokal SQLite melalui Prisma ORM.

Alur utama sistem berjalan sebagai berikut:
1. Pengunjung/Penyewa membuka katalog web, memilih perangkat, menghitung estimasi biaya sewa berdasarkan rentang tanggal, mengisi formulir pemesanan, dan mengirimkan reservasi ke sistem sekaligus mengonfirmasikannya ke WhatsApp toko.
2. Sistem menyimpan data reservasi dengan status awal `PENDING`.
3. Admin toko menerima notifikasi pesan, membuka Dashboard Admin terproteksi, memverifikasi data dan ketersediaan stok fisik, lalu mengubah status menjadi `APPROVED`.
4. Saat unit diserahterimakan di toko fisik atau melalui jasa antar (*delivery*), status diperbarui menjadi `ACTIVE`.
5. Saat unit dikembalikan dalam kondisi baik dan lengkap, status ditutup menjadi `COMPLETED`.

### 2.2 Kelompok Pengguna dan Karakteristiknya
Tabel 2.1 Kelompok Pengguna
| Kelompok | Karakteristik dan Frekuensi Pakai |
| :--- | :--- |
| **Penyewa / Customer (Prioritas Utama)** | Mahasiswa, pekerja lepas, kreator konten, dan masyarakat umum. Terbiasa menggunakan peramban ponsel pintar (*smartphone*). Pemakaian insidental (saat membutuhkan perangkat untuk tugas kuliah, event, atau proyek singkat). Hak akses: menjelajahi katalog, simulasi biaya, mengisi form rental, dan mengirim pesan booking WhatsApp. |
| **Administrator / Staf Operasional** | Pengelola dan staf kasir toko rental fisik. Mengakses aplikasi melalui komputer kasir atau laptop operasional secara intensif setiap hari kerja. Hak akses: mengelola katalog gadget (CRUD), memantau stok, mengubah status reservasi, dan mencatat histori transaksi. |
| **Pengunjung Tamu (Guest)** | Pengguna yang belum memutuskan menyewa. Hanya menjelajahi beranda, melihat portofolio perangkat, lokasi toko fisik di Depok, FAQ, dan membaca syarat ketentuan sewa. |

### 2.3 Lingkungan Operasional
Tabel 2.2 Lingkungan Operasional
| Aspek | Keterangan |
| :--- | :--- |
| **Server / Runtime** | Node.js v18.x / v20.x, framework Next.js 15+ (App Router). |
| **Frontend** | React 19, Tailwind CSS v3 (Utility-first styling), Lucide Icons, TypeScript. |
| **Backend** | Next.js Route Handlers & Server Actions, Prisma Client ORM v6. |
| **Basis Data** | SQLite 3 (berkas basis data lokal `dev.db` pada lingkungan persisten server). |
| **Klien (Client-Side)** | Peramban web modern (Google Chrome, Safari, Mozilla Firefox, Edge) pada resolusi layar mulai dari 360px (mobile) hingga desktop 1920px+. |
| **Hosting & Infrastruktur** | Server VPS Linux / Cloud Vercel Platform dengan pipeline CI/CD GitHub. |

### 2.4 Batasan Desain dan Implementasi
1. Basis data operasional menggunakan SQLite terstruktur yang dikelola melalui Prisma ORM untuk menjamin portabilitas tinggi tanpa dependensi daemon server database eksternal.
2. Autentikasi admin diamankan menggunakan mekanisme *HTTP-Only Cookie* (`admin_session`) yang ditandatangani di sisi server, sehingga kebal dari risiko pencurian token melalui serangan Cross-Site Scripting (XSS).
3. Penyimpanan berkas foto gadget disimpan pada sistem berkas lokal direktori `/public/uploads` dengan batasan tipe berkas gambar (JPEG, PNG, WebP) dan ukuran maksimal 5 MB.
4. Desain antarmuka wajib mengadopsi prinsip *Mobile-First Responsiveness* dengan dukungan penataan visual yang konsisten di seluruh ukuran layar.
5. Konfirmasi pembayaran pemindah dana langsung diselesaikan melalui jalur perbankan/QRIS manual di toko fisik, sehingga aplikasi tidak mengelola pemrosesan kartu kredit secara langsung.

### 2.5 Asumsi dan Ketergantungan
1. Pengguna memiliki koneksi internet yang stabil dan peramban web modern dengan fitur JavaScript aktif.
2. Untuk memanfaatkan fitur *Direct WhatsApp Booking*, perangkat pengguna diasumsikan telah terpasang aplikasi WhatsApp atau dapat mengakses WhatsApp Web.
3. Seluruh pencatatan waktu transaksi dan sewa menggunakan acuan zona waktu Waktu Indonesia Barat (**WIB / UTC+7**).
4. Staf admin bertanggung jawab memeriksa kondisi fisik perangkat secara langsung pada saat serah terima barang di toko.

---

## BAB III FITUR SISTEM

### 3.1 Akses Informasi, Katalog, dan Pencarian
#### 3.1.1 Katalog Perangkat & Filter Kategori
- **Deskripsi dan Prioritas**: Beranda dan halaman katalog (`/katalog`) menyajikan daftar seluruh unit gadget komersial yang aktif. Pengguna dapat mencari perangkat berdasarkan nama model, memfilter berdasarkan kategori (Laptop, Smartphone, Tablet, Aksesoris), serta melihat tarif harian dan spesifikasi kunci. **Prioritas: Wajib**.
- **Aksi Pengguna dan Respons Sistem**: Pengunjung membuka halaman katalog, memilih tab kategori atau mengetik kata kunci pada kolom pencarian. Sistem secara reaktif memfilter daftar kartu perangkat tanpa memuat ulang (*full reload*) halaman. Jika tidak ada data yang cocok, sistem menampilkan keterangan bahwa unit tidak ditemukan.
- **Daftar Kebutuhan Fungsional**:
  - `REQ-F-01 (Wajib)`: Sistem harus menampilkan daftar unit gadget berstatus `isActive: true` dengan informasi model, kategori, spesifikasi penyimpanan, warna, dan harga sewa harian.
  - `REQ-F-02 (Wajib)`: Sistem harus menyediakan filter cepat multi-kategori: Semua, Laptop, Smartphone, Tablet, dan Aksesoris.
  - `REQ-F-03 (Wajib)`: Sistem harus menyediakan kotak pencarian teks yang menyaring daftar gadget berdasarkan kesesuaian nama model secara real-time.
  - `REQ-F-04 (Penting)`: Sistem harus menampilkan gambar foto unit fisik jika tersedia, atau menampilkan ikon emoji representatif (`imageEmoji`) sebagai cadangan visual jika foto belum diunggah.

### 3.2 Kalkulasi Tarif Dinamis dan Pemesanan Rental
#### 3.2.1 Formulir Reservasi & Kalkulator Biaya Sewa
- **Deskripsi dan Prioritas**: Pada halaman rincian sewa (`/rent/[id]`), pengguna memilih tanggal mulai dan selesai sewa. Sistem menghitung durasi hari secara akurat, menerapkan potongan harga otomatis untuk paket Mingguan (diskon hemat) dan Bulanan, serta memproses reservasi sewa. **Prioritas: Wajib**.
- **Aksi Pengguna dan Respons Sistem**: Pengguna menentukan tanggal mulai dan selesai sewa, memilih paket tarif (Harian, Mingguan, Bulanan), dan memilih metode serah terima (*PICKUP* di toko atau *DELIVERY* antar ke alamat). Sistem secara dinamis menampilkan rincian total tagihan dan persentase diskon. Pengguna melengkapi data diri (Nama, No HP/WhatsApp, Email, Catatan) lalu menekan tombol "Ajukan Sewa Sekarang". Sistem memvalidasi isian formulir, mencatat pesanan ke tabel `Rental` dengan status awal `PENDING`, dan menampilkan ID pesanan serta rincian lengkap.
- **Daftar Kebutuhan Fungsional**:
  - `REQ-F-05 (Wajib)`: Sistem harus memvalidasi tanggal mulai dan tanggal selesai sewa; tanggal selesai harus lebih besar daripada tanggal mulai sewa.
  - `REQ-F-06 (Wajib)`: Sistem harus menghitung total harga sewa secara otomatis di sisi klien dan memverifikasinya kembali di sisi server berdasarkan durasi hari dan tarif unit.
  - `REQ-F-07 (Wajib)`: Sistem harus mendukung pemilihan metode serah terima: Ambil Sendiri (*PICKUP*) atau Antar ke Alamat (*DELIVERY*). Jika opsi *DELIVERY* dipilih, kolom alamat wajib diisi oleh pemesan.
  - `REQ-F-08 (Wajib)`: Sistem harus memvalidasi kelengkapan data kontak penyewa (Nama, Nomor Telepon/WhatsApp aktif, Email) sebelum transaksi diproses.
  - `REQ-F-09 (Wajib)`: Sistem harus menyimpan data pesanan baru ke tabel `Rental` dengan status default `PENDING` dan menghasilkan ID transaksi unik bagi penyewa.

### 3.3 Integrasi Direct WhatsApp Booking & Layanan Bantuan
#### 3.3.1 Engine Pembuat Pesan WhatsApp & Tombol Bantuan
- **Deskripsi dan Prioritas**: Memfasilitasi komunikasi dua arah antara penyewa dan staf toko melalui tautan deep-link WhatsApp dengan format pesan pemesanan yang rapi dan terstruktur. **Prioritas: Penting**.
- **Aksi Pengguna dan Respons Sistem**: Setelah pemesanan online berhasil dibuat, pengguna disuguhkan tombol "Lanjutkan ke WhatsApp". Saat tombol diklik, sistem membuka aplikasi WhatsApp dengan pesan otomatis berisi ID Booking, Nama Gadget, Durasi, Total Harga, dan Nama Penyewa yang siap dikirimkan ke nomor resmi toko (+62 812-3456-7890). Tersedia pula widget tombol mengambang (*floating WhatsApp button*) di seluruh halaman publik untuk konsultasi langsung.
- **Daftar Kebutuhan Fungsional**:
  - `REQ-F-10 (Wajib)`: Sistem harus menyusun URL deep-link WhatsApp (`https://wa.me/...`) yang memuat format pesan pemesanan lengkap dan terenkripsi URL.
  - `REQ-F-11 (Pendukung)`: Sistem harus menampilkan tombol pintas WhatsApp mengambang di pojok kanan bawah pada seluruh halaman antarmuka publik.

### 3.4 Autentikasi Admin dan Keamanan Sesi
#### 3.4.1 Login Administrator
- **Deskripsi dan Prioritas**: Mengamankan area manajemen operasional dari akses pihak yang tidak berwenang melalui sistem otentikasi berbasis kata sandi administrator. **Prioritas: Wajib**.
- **Aksi Pengguna dan Respons Sistem**: Staf membuka rute `/admin`. Jika belum terautentikasi, sistem mengalihkan ke `/login`. Staf memasukkan kata sandi admin; endpoint API `/api/auth/login` memvalidasi kata sandi terhadap variabel lingkungan server. Jika valid, server menerbitkan token *cookie* `admin_session` yang bertanda `HttpOnly` dan mengarahkan admin ke Dashboard. Tombol Logout menghapus sesi tersebut.
- **Daftar Kebutuhan Fungsional**:
  - `REQ-F-12 (Wajib)`: Sistem harus menolak akses ke halaman `/admin` dan API pengelolaan rental bagi pemohon yang tidak memiliki cookie sesi admin yang sah (HTTP 401 Unauthorized).
  - `REQ-F-13 (Wajib)`: Sesi admin harus disimpan dalam bentuk *HTTP-Only Cookie* untuk mencegah eksfiltrasi token dari skrip sisi klien.
  - `REQ-F-14 (Wajib)`: Sistem harus menyediakan fungsi *Logout* yang menganulir cookie sesi seketika.

### 3.5 Pengelolaan Inventaris Gadget dan Stok
#### 3.5.1 Manajemen Data Unit (CRUD & Unggah Gambar)
- **Deskripsi dan Prioritas**: Menyediakan antarmuka bagi admin untuk menambah unit gadget baru, menyunting spesifikasi teknis, memperbarui jumlah stok fisik, mengatur harga harian/mingguan/bulanan, dan mengunggah foto fisik unit. **Prioritas: Wajib**.
- **Aksi Pengguna dan Respons Sistem**: Admin membuka tab "Manajemen Gadget", mengisi form penambahan unit baru (Model, Kategori, Kapasitas Memori, Warna, Harga Harian/Mingguan/Bulanan, Stok, Deskripsi, Simbol Emoji, dan Berkas Gambar). Sistem memproses pengunggahan gambar ke folder publik server dan menyimpan baris data ke tabel `Phone`. Admin juga dapat mengubah ketersediaan atau menonaktifkan unit dari katalog.
- **Daftar Kebutuhan Fungsional**:
  - `REQ-F-15 (Wajib)`: Sistem harus menyediakan fungsionalitas bagi admin untuk menambah, melihat, memperbarui, dan menonaktifkan data unit gadget.
  - `REQ-F-16 (Wajib)`: Sistem harus memvalidasi harga harian tidak boleh kurang dari atau sama dengan 0, dan stok minimal bernilai 0.
  - `REQ-F-17 (Penting)`: Sistem harus mendukung pengunggahan berkas gambar unit (format JPEG, PNG, WebP dengan ukuran maksimal 5 MB) yang disimpan pada direktori penyimpanan server.
  - `REQ-F-18 (Wajib)`: Sistem harus mencegah penghapusan unit gadget yang memiliki relasi transaksi rental aktif untuk menjaga keutuhan riwayat data.

### 3.6 Pemrosesan Status Transaksi dan Monitoring
#### 3.6.1 Dashboard Transaksi & Alur Status Sewa
- **Deskripsi dan Prioritas**: Menampilkan seluruh reservasi yang masuk, ringkasan statistik operasional toko, dan kontrol transisi status sewa unit. **Prioritas: Wajib**.
- **Aksi Pengguna dan Respons Sistem**: Admin membuka tab "Daftar Reservasi & Rental". Sistem menyajikan ringkasan indikator: Total Transaksi, Menunggu Persetujuan, Unit Sedang Disewa, dan Total Pendapatan. Admin dapat meninjau rincian pemesan dan memperbarui status sewa melalui dropdown: `PENDING` → `APPROVED` → `ACTIVE` → `COMPLETED` atau `CANCELLED`.
- **Daftar Kebutuhan Fungsional**:
  - `REQ-F-19 (Wajib)`: Sistem harus menampilkan daftar transaksi rental yang diurutkan dari pesanan terbaru dengan informasi lengkap pemesan, paket, tanggal, dan status.
  - `REQ-F-20 (Wajib)`: Sistem harus memungkinkan admin memperbarui status transaksi di antara tahapan: `PENDING`, `APPROVED`, `ACTIVE`, `COMPLETED`, dan `CANCELLED`.
  - `REQ-F-21 (Penting)`: Sistem harus menyediakan kolom catatan (*notes*) pada transaksi untuk mencatat nomor resi kurir atau catatan kondisi fisik barang.
  - `REQ-F-22 (Penting)`: Sistem harus menampilkan statistik ringkasan total omset, jumlah pesanan aktif, dan jumlah pesanan menunggu konfirmasi pada dashboard admin.

---

## BAB IV KEBUTUHAN DATA

### 4.1 Model Data Logis
Sistem menggunakan dua entitas data utama yang saling berelasi: tabel `Phone` (katalog perangkat) dan tabel `Rental` (transaksi peminjaman). Relasi antara `Phone` dan `Rental` adalah **One-to-Many (1:N)**, di mana satu entitas perangkat dapat direferensikan oleh banyak entitas transaksi rental, namun satu transaksi rental merujuk tepat pada satu unit perangkat (`phoneId` sebagai *Foreign Key*).

```
+------------------------------------+               +------------------------------------+
|               Phone                |               |               Rental               |
+------------------------------------+               +------------------------------------+
| id: String (PK, CUID)              | 1           * | id: String (PK, CUID)              |
| model: String                      +<--------------+ phoneId: String (FK -> Phone.id)   |
| category: String                   |               | customerName: String               |
| storage: String                    |               | customerPhone: String              |
| color: String                      |               | customerEmail: String              |
| dailyPrice: Int                    |               | startDate: DateTime                |
| weeklyPrice: Int?                  |               | endDate: DateTime                  |
| monthlyPrice: Int?                 |               | rentalPackage: String              |
| stock: Int                         |               | deliveryMethod: String             |
| description: String                |               | deliveryAddress: String?           |
| imageUrl: String?                  |               | totalPrice: Int                    |
| imageEmoji: String                 |               | status: RentalStatus (Enum)        |
| isActive: Boolean                  |               | notes: String?                     |
| createdAt: DateTime                |               | createdAt: DateTime                |
| updatedAt: DateTime                |               | updatedAt: DateTime                |
+------------------------------------+               +------------------------------------+
```

- `REQ-D-01 (Wajib)`: Setiap entitas rental wajib merujuk secara valid ke entitas `Phone` melalui kunci asing `phoneId`.
- `REQ-D-02 (Wajib)`: Setiap rekaman data rental wajib mencatat identitas nama pemesan, nomor kontak, tanggal sewa, total tarif, dan status transaksi.
- `REQ-D-03 (Wajib)`: Waktu pembuatan dan pembaruan data dicatat secara terpisah menggunakan tipe data DateTime berpresisi tinggi.

### 4.2 Kamus Data

#### Tabel 4.1 Phone (Inventaris Perangkat Gadget)
| Kolom | Tipe Data | Null | Keterangan Batasan & Constraint |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(30) | Tidak | Primary Key, di-generate otomatis dengan format string CUID unik. |
| `model` | VARCHAR(100) | Tidak | Nama merek dan varian perangkat (contoh: "iPhone 15 Pro", "MacBook Pro M3"). |
| `category` | VARCHAR(50) | Tidak | Kategori perangkat: 'Smartphone', 'Laptop', 'Tablet', atau 'Aksesoris'. |
| `storage` | VARCHAR(30) | Tidak | Kapasitas memori internal (contoh: "128 GB", "512 GB", "1 TB"). |
| `color` | VARCHAR(50) | Tidak | Pilihan warna fisik perangkat (contoh: "Natural Titanium", "Midnight"). |
| `dailyPrice` | INTEGER | Tidak | Tarif sewa per hari dalam satuan Rupiah (harus > 0). |
| `weeklyPrice` | INTEGER | Ya | Tarif sewa paket hemat 7 hari (opsional). |
| `monthlyPrice`| INTEGER | Ya | Tarif sewa paket hemat 30 hari (opsional). |
| `stock` | INTEGER | Tidak | Jumlah unit fisik tersedia (default 1, minimal 0). |
| `description` | TEXT | Tidak | Rincian deskripsi kondisi, spesifikasi teknis, dan kelengkapan unit. |
| `imageUrl` | VARCHAR(255) | Ya | Alamat path relatif berkas foto perangkat di server (misal: `/uploads/foto.jpg`). |
| `imageEmoji` | VARCHAR(10) | Tidak | Karakter emoji representatif sebagai cadangan visual (default: '📱'). |
| `isActive` | BOOLEAN | Tidak | Status ketersediaan di katalog umum (`true` = tampil, `false` = arsip). |

#### Tabel 4.2 Rental (Transaksi Penyewaan Gadget)
| Kolom | Tipe Data | Null | Keterangan Batasan & Constraint |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(30) | Tidak | Primary Key, di-generate otomatis dengan format CUID sebagai ID booking unik. |
| `phoneId` | VARCHAR(30) | Tidak | Foreign Key yang berelasi langsung dengan kolom `id` pada tabel `Phone`. |
| `customerName` | VARCHAR(100) | Tidak | Nama lengkap penyewa sesuai identitas resmi. |
| `customerPhone`| VARCHAR(20) | Tidak | Nomor kontak aktif WhatsApp penyewa (minimal 9 digit angka). |
| `customerEmail`| VARCHAR(100) | Tidak | Alamat surat elektronik (email) aktif penyewa berformat valid. |
| `startDate` | DATETIME | Tidak | Tanggal dan waktu awal mulai peminjaman perangkat. |
| `endDate` | DATETIME | Tidak | Tanggal dan waktu akhir pengembalian perangkat (harus > `startDate`). |
| `rentalPackage`| VARCHAR(20) | Tidak | Pilihan paket durasi sewa: 'HARIAN', 'MINGGUAN', atau 'BULANAN'. |
| `deliveryMethod`| VARCHAR(20) | Tidak | Metode penerimaan barang: 'PICKUP' (ambil di toko) atau 'DELIVERY' (antar). |
| `deliveryAddress`| TEXT | Ya | Alamat lengkap tujuan pengantaran (wajib diisi apabila method = 'DELIVERY'). |
| `totalPrice` | INTEGER | Tidak | Total tagihan sewa yang dikalkulasi server dalam satuan Rupiah. |
| `status` | ENUM | Tidak | Nilai status proses: 'PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED'. |
| `notes` | TEXT | Ya | Catatan khusus dari penyewa atau catatan staf pengelola toko. |

### 4.3 Laporan
Sistem menyajikan pelaporan visual real-time pada Dashboard Admin:
1. **Statistik Indikator Utama**:
   - Total Keseluruhan Pesanan (*Total Bookings*).
   - Pesanan Menunggu Persetujuan (*Pending Orders*).
   - Unit Sedang Disewa (*Active Rentals*).
   - Estimasi Akumulasi Pendapatan Sewa (*Total Revenue*).
2. **Rekapitulasi Tabel Reservasi**: Tabel transaksi operasional yang dapat disaring berdasarkan status sewa untuk memudahkan audit fisik dan pencatatan kas harian.

### 4.4 Perolehan, Integritas, Penyimpanan, dan Penghapusan Data
1. **Perolehan Data**: Data katalog dimasukkan oleh staf admin; data rental diperoleh dari input formulir pemesanan oleh penyewa.
2. **Integritas Data**: Ditegakkan menggunakan *Foreign Key Constraints* pada skema Prisma ORM. Kueri dijalankan secara aman melalui mekanisme *parameterized queries* yang mencegah injeksi SQL.
3. **Penyimpanan**: Disimpan di berkas basis data SQLite lokal (`prisma/dev.db`) yang terisolasi pada lingkungan server.
4. **Penghapusan Data**: Data unit gadget yang memiliki relasi transaksi rental tidak dihapus secara permanen (*hard delete*), melainkan dialihkan statusnya menjadi non-aktif (`isActive = false`) guna menjaga keutuhan riwayat transaksi keuangan.

---

## BAB V ANTARMUKA EKSTERNAL

### 5.1 Antarmuka Pengguna
Seluruh interaksi pengguna dijalankan melalui antarmuka web modern yang responsif:
- Antarmuka mengadopsi palet warna modern (Slate, Blue, Emerald) dengan tipografi yang bersih dan nyaman dibaca.
- Tata letak antarmuka dirancang fleksibel mulai dari resolusi layar ponsel pintar 360 piksel (*mobile viewport*) hingga layar monitor komputer desktop 1920 piksel tanpa terjadi pemotongan teks (*overflow*).
- Pesan kesalahan formulir disajikan secara interaktif dalam Bahasa Indonesia yang komunikatif, diletakkan tepat pada kolom isian yang belum valid.
- `REQ-Q-01 (Penting)`: Seluruh halaman publik dan formulir sewa harus responsif dan tidak menimbulkan scroll horizontal pada lebar layar minimal 360 piksel.

### 5.2 Antarmuka Perangkat Lunak
1. **Prisma ORM Client v6**: Bertindak sebagai lapisan jembatan abstraksi antara logika aplikasi Next.js dan basis data SQLite.
2. **Next.js Internal Route Handlers**:
   - `GET /api/phones`: Menyediakan data katalog gadget aktif dalam format JSON.
   - `POST /api/phones`: Endpoint menerima pembuatan data unit baru beserta pemrosesan multipart gambar.
   - `GET /api/rentals`: Mengembalikan daftar seluruh transaksi pemesanan untuk dashboard admin.
   - `POST /api/rentals`: Menerima pengajuan reservasi baru dari formulir pelanggan.
   - `PATCH /api/rentals/[id]`: Memperbarui status siklus transaksi sewa oleh admin.
   - `POST /api/auth/login` & `POST /api/auth/logout`: Mengelola penerbitan dan penghapusan token sesi otentikasi.
3. **WhatsApp Web / Mobile URI Scheme**: Format antarmuka `https://wa.me/` dengan parameter teks terenkode URI (`encodeURIComponent`) untuk membuka aplikasi percakapan instan.

### 5.3 Antarmuka Perangkat Keras
Sistem berjalan di atas perangkat keras komputer server atau lingkungan cloud hosting standar dengan arsitektur x86_64 atau ARM64. Di sisi klien, sistem tidak memerlukan perangkat keras khusus selain perangkat komputer, laptop, tablet, atau ponsel cerdas yang memiliki layar tampilan dan peramban web modern.

### 5.4 Antarmuka Komunikasi
Semua komunikasi data antara peramban pengguna dan server web wajib menggunakan protokol **HTTPS (Hypertext Transfer Protocol Secure)** dengan standar enkripsi Transport Layer Security (TLS 1.2 atau TLS 1.3). Pertukaran data antara komponen antarmuka klien dan endpoint backend menggunakan format muatan **JSON (JavaScript Object Notation)**.

---

## BAB VI ATRIBUT KUALITAS

### 6.1 Kemudahan Penggunaan (Usability)
1. Antarmuka katalog dan simulasi biaya sewa dirancang intuitif sehingga calon penyewa dapat menyelesaikan formulir booking dalam waktu kurang dari 3 menit tanpa memerlukan panduan pelatihan khusus.
2. Kalkulator biaya sewa secara instan menampilkan pembaruan total nominal sewa dan persentase potongan paket segera setelah rentang tanggal dipilih.
3. Struktur navigasi teratur dengan navigasi atas (*Navbar*) yang menyediakan akses cepat ke Katalog, Cara Kerja, Lokasi Toko, FAQ, dan Dashboard Admin.

### 6.2 Kinerja (Performance)
1. Waktu tampil halaman pertama (*First Contentful Paint*) ditargetkan di bawah 1.5 detik pada koneksi internet seluler 4G stabil.
2. Filter kategori dan pencarian nama gadget pada katalog dieksekusi secara instan di sisi klien dengan latensi respons di bawah 100 milidetik.
3. Pemrosesan pengiriman formulir sewa dan penyimpanan data ke basis data diselesaikan dalam waktu kurang dari 500 milidetik di sisi server.
- `REQ-Q-02 (Penting)`: Sistem harus merespons kueri filter katalog gadget secara reaktif tanpa melakukan pemuatan ulang (*full page reload*).

### 6.3 Keamanan (Security)
1. Rute administrasi (`/admin` dan endpoint pengubahan data status rental) diverifikasi secara ketat di sisi server melalui pemeriksaan *cookie* sesi terenkripsi.
2. Cookie sesi ditandai dengan flag `HttpOnly`, `SameSite=Lax`, dan `Path=/` untuk mencegah pencurian token melalui eksploitasi skrip berbahaya (*Cross-Site Scripting - XSS*).
3. Prisma ORM secara otomatis menggunakan kueri terparameterisasi (*parameterized queries*) sehingga seluruh operasi manipulasi data kebal terhadap serangan Injeksi SQL (*SQL Injection*).
- `REQ-Q-03 (Wajib)`: Akses ke panel dashboard admin tanpa token sesi yang sah wajib ditolak dan dialihkan ke rute login.

### 6.4 Ketersediaan dan Keandalan (Availability & Reliability)
1. Layanan diupayakan aktif dan dapat diakses publik selama 24 jam dengan target ketersediaan (*uptime*) minimal 99% saat di-deploy pada platform hosting cloud profesional (Vercel/Railway/VPS).
2. Operasi penulisan basis data SQLite bersifat atomik (*ACID compliant*), memastikan data transaksi tidak rusak jika terjadi kegagalan jaringan saat pengiriman formulir.

### 6.5 Keselamatan dan Kekokohan (Safety & Robustness)
1. Sistem melakukan validasi ganda terhadap masukan data di sisi klien dan sisi server untuk mencegah tersimpannya data berformat tidak valid atau rentang tanggal yang salah.
2. Jika terjadi kegagalan muat data pada server, sistem menyajikan pesan galat yang informatif kepada pengguna tanpa membocorkan rincian *stack trace* kode internal atau kredensial rahasia server.

---

## BAB VII INTERNASIONALISASI DAN LOKALISASI
1. **Bahasa Antarmuka**: Seluruh antarmuka publik, formulir, pesan validasi, dan panel admin menggunakan **Bahasa Indonesia** yang lugas dan mudah dipahami oleh masyarakat umum di Indonesia.
2. **Format Mata Uang**: Format nilai uang menggunakan mata uang **Rupiah (IDR)** dengan simbol resmi `Rp` serta tanda titik pemisah ribuan (contoh: `Rp150.000`, `Rp1.200.000`) tanpa digit desimal.
3. **Format Tanggal dan Waktu**: Menggunakan format penanggalan standar Indonesia `DD/MM/YYYY` dengan zona waktu resmi Waktu Indonesia Barat (**WIB / UTC+7**).
4. **Format Nomor Kontak**: Mendukung format penomoran ponsel nasional Indonesia (awalan `08xx` atau kode internasional `+628xx`).

---

## BAB VIII KEBUTUHAN LAINNYA

### 8.1 Batasan Implementasi Tahap Prototipe
1. Basis data yang digunakan pada tahap rilis ini adalah SQLite satu berkas (`dev.db`). Pada skenario beban transaksi tinggi secara bersamaan (*high concurrency writes*), SQLite memiliki batasan *file lock* sehingga disarankan untuk migrasi ke PostgreSQL/MySQL jika pengguna bertambah drastis.
2. Berkas gambar yang diunggah saat ini disimpan pada sistem berkas lokal direktori publik server. Pada lingkungan serverless murni (seperti Vercel read-only filesystem), penyimpanan berkas memerlukan integrasi layanan penyimpanan cloud eksternal (seperti Cloudinary atau Supabase Storage).
3. Verifikasi pembayaran sewa dan uang deposit jaminan pada versi saat ini dilakukan secara manual oleh staf toko fisik setelah menerima konfirmasi chat WhatsApp dari pelanggan.

### 8.2 Saran Pengembangan Lanjutan
1. Mengintegrasikan layanan *Payment Gateway* resmi (seperti Midtrans atau Xendit) untuk mendukung pembayaran otomatis via QRIS real-time dan Virtual Account bank.
2. Mengembangkan modul verifikasi identitas digital (KYC) dengan pengunggahan dokumen KTP/KTM dan swafoto secara terenkripsi.
3. Menambahkan fitur pengingat otomatis jatuh tempo pengembalian unit melalui notifikasi WhatsApp Gateway terotomasi (H-1 dan Hari-H batas sewa).
4. Menyediakan fitur audit denda keterlambatan otomatis berdasarkan selisih jam pengembalian fisik unit.

---

## LAMPIRAN A GLOSARIUM
Tabel A.1 Glosarium
| Istilah | Arti dalam Konteks RENTGADGET |
| :--- | :--- |
| **Admin** | Staf pengelola toko rental yang memiliki hak akses penuh mengelola stok perangkat dan menyetujui transaksi. |
| **API (Application Programming Interface)** | Penghubung antarmuka yang memungkinkan pertukaran data antara aplikasi web klien dan server. |
| **CUID (Collision-resistant Unique Identifier)** | Format penamaan string identitas unik berkinerja tinggi yang digunakan sebagai kunci primer data. |
| **Delivery Method** | Opsi metode serah terima barang: diambil langsung di toko (*PICKUP*) atau diantar kurir ke alamat (*DELIVERY*). |
| **HTTP-Only Cookie** | Atribut keamanan pada cookie peramban yang mencegah pembacaan nilai cookie oleh skrip JavaScript sisi klien. |
| **Next.js** | Framework web React modern berbasis SSR (Server-Side Rendering) dan Route Handlers. |
| **ORM (Object-Relational Mapping)** | Pustaka Prisma yang memetakan model data relasional tabel menjadi objek kode program TypeScript. |
| **Rental Status** | Status tahapan siklus pesanan: `PENDING` (menunggu konfirmasi), `APPROVED` (disetujui), `ACTIVE` (unit disewa), `COMPLETED` (selesai), atau `CANCELLED` (batal). |
| **SQLite** | Mesin basis data relasional ringan mandiri tanpa server terpisah yang tersimpan dalam satu berkas berkas. |
| **Tailwind CSS** | Kerangka kerja CSS berbasis utility-first untuk menyusun desain antarmuka responsif dan modern. |

---

## LAMPIRAN B MODEL ANALISIS

### B.1 Diagram Alur Proses Pemesanan (Use Case Flow)
```
[ Pengunjung / Customer ]
           │
           ▼
[ Buka Katalog & Pilih Gadget ]
           │
           ▼
[ Tentukan Tanggal Mulai & Selesai Sewa ]
           │
           ├──> (Sistem otomatis menghitung durasi, tarif paket, & diskon)
           │
           ▼
[ Pilih Metode: Ambil Sendiri (Pickup) / Antar-Jemput (Delivery) ]
           │
           ▼
[ Isi Data Nama, Nomor WhatsApp, Email, & Alamat ]
           │
           ▼
[ Klik "Ajukan Sewa Sekarang" ]
           │
           ├──> Tersimpan ke Basis Data SQLite (Status: PENDING)
           │
           ▼
[ Buka WhatsApp Official Toko via Deep-Link untuk Konfirmasi Instan ]
```

### B.2 Diagram Transisi Status Transaksi Rental (State Transition Diagram)
```
          +-----------------------+
          |        PENDING        | (Pesanan masuk dari formulir online)
          +-----------+-----------+
                      │
         +------------+------------+
         │                         │
         ▼                         ▼
+-----------------+       +-----------------+
|    APPROVED     |       |    CANCELLED    | (Pesanan dibatalkan/stok habis)
+--------+--------+       +-----------------+
         │
         ▼
+-----------------+
|     ACTIVE      | (Unit diserahterimakan fisik ke penyewa)
+--------+--------+
         │
         ▼
+-----------------+
|    COMPLETED    | (Unit kembali dalam kondisi baik & transaksi tuntas)
+-----------------+
```

---

## LAMPIRAN C KEPUTUSAN YANG MEMERLUKAN KONFIRMASI (TBD)
Lampiran ini menghimpun butir-butir pertimbangan bisnis yang dapat disempurnakan pada iterasi pengembangan berikutnya:
| ID | Masalah Pertimbangan | Pilihan Solusi | Rekomendasi (Usulan Belum Disetujui) | Dampak (Fitur/Data) |
| :--- | :--- | :--- | :--- | :--- |
| **TBD-01** | Kebijakan penahanan uang jaminan keamanan (*Security Deposit*) fisik unit. | (A) Diterapkan tunai saat serah terima. (B) Ditransfer di muka. (C) Tanpa deposit dengan jaminan identitas asli. | Pilihan (A). Mengurangi risiko kerusakan aset mahal tanpa memberatkan calon penyewa di formulir awal. | `Rental.notes`, Prosedur Toko |
| **TBD-02** | Penghapusan data unit gadget yang memiliki histori transaksi masa lalu. | (A) Hard delete berantai. (B) Soft delete dengan penanda `isActive = false`. | Pilihan (B). Melindungi integritas laporan keuangan dan rekapitulasi penyewaan historis. | `Phone.isActive`, `REQ-F-18` |
| **TBD-03** | Otomasi pengingat batas waktu pengembalian perangkat sewa. | (A) Konfirmasi manual admin via WhatsApp. (B) WhatsApp Gateway terotomasi H-1. | Pilihan (B). Mencegah keterlambatan pengembalian unit secara proaktif. | Integrasi API Pihak Ketiga |
| **TBD-04** | Mekanisme penyimpanan berkas foto unit gadget saat deployment cloud. | (A) Sistem berkas lokal server. (B) Penyedia penyimpanan cloud pihak ketiga (Cloudinary/Supabase). | Pilihan (B). Diperlukan bila di-deploy ke serverless hosting yang memiliki berkas bersifat read-only. | `upload.ts`, `Phone.imageUrl` |
