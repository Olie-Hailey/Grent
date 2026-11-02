export function StoreLocationSection() {
  return (
    <section className="my-16 border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-10">
      <div className="mb-8 text-center max-w-xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Toko Fisik &amp; Layanan
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl sm:text-3xl text-[var(--ink)]">
          Lokasi &amp; Kontak Grent
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Kunjungi toko kami langsung atau pesan online dengan layanan antar-jemput ke alamat Anda.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="border border-[var(--line)] bg-[#fafbfc] p-5">
          <span className="text-2xl mb-2 block">📍</span>
          <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--ink)]">
            Alamat Toko
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
            Rukan Grand Taman Melati, Jl. Margonda Raya No. 525, Pondok Cina, Kota Depok, Jawa Barat 16423.
          </p>
          <div className="mt-4">
            <a
              href="https://maps.google.com/?q=Margonda+Raya+Depok"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              Buka di Google Maps ↗
            </a>
          </div>
        </div>

        <div className="border border-[var(--line)] bg-[#fafbfc] p-5">
          <span className="text-2xl mb-2 block">⏰</span>
          <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--ink)]">
            Jam Operasional
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
            <strong>Senin – Minggu:</strong> 09.30 – 19.30 WIB
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            ✓ Buka setiap hari termasuk tanggal merah &amp; hari libur.
          </p>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Tersedia area parkir motor &amp; mobil yang luas dan aman.
          </p>
        </div>

        <div className="border border-[var(--line)] bg-[#fafbfc] p-5">
          <span className="text-2xl mb-2 block">💬</span>
          <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--ink)]">
            Customer Care (WhatsApp)
          </h3>
          <div className="mt-2 space-y-2 text-xs">
            <div>
              <p className="font-semibold text-[var(--ink)]">0895-6229-96629 (CS Utama)</p>
              <p className="text-emerald-600">🟢 Online 09.30 – 19.30 WIB</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--ink)]">0812-8021-5558 (CS Malam)</p>
              <p className="text-indigo-600">🌙 Online s/d 23.00 WIB</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="https://wa.me/62895622996629"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[var(--ink)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--accent)] transition"
            >
              Hubungi Sekarang
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
