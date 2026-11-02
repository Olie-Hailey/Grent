export function HowItWorksSection() {
  const steps = [
    {
      num: "1",
      title: "Pilih Gadget",
      desc: "Pilih laptop, smartphone, atau tablet yang cocok dengan kebutuhan & spesifikasimu.",
    },
    {
      num: "2",
      title: "Pilih Paket Durasi",
      desc: "Tersedia paket Harian, Mingguan (lebih hemat), hingga Bulanan untuk WFH/kantor.",
    },
    {
      num: "3",
      title: "Isi Form & Syarat",
      desc: "Lengkapi identitas, siapkan KTP asli sebagai jaminan, dan konfirmasi ke admin.",
    },
    {
      num: "4",
      title: "Serah Terima Cepat",
      desc: "Bisa diambil langsung di toko atau gunakan opsi pengiriman antar-jemput ke alamatmu.",
    },
    {
      num: "5",
      title: "Selesai & Deposit Kembali",
      desc: "Kembalikan unit tepat waktu, dan deposit jaminan langsung dicairkan kembali 100%.",
    },
  ];

  const requirements = [
    {
      icon: "🪪",
      title: "KTP Asli Penyewa",
      desc: "KTP asli diserahkan sebagai jaminan identitas selama masa sewa berlangsung.",
    },
    {
      icon: "📄",
      title: "Surat Perjanjian Sewa",
      desc: "Tanda tangan perjanjian sewa resmi dan transparan demi keamanan kedua pihak.",
    },
    {
      icon: "💵",
      title: "Deposit Jaminan",
      desc: "Uang jaminan ringan yang akan dikembalikan penuh (100%) setelah serah terima selesai.",
    },
    {
      icon: "⚡",
      title: "Siap Pakai & Bergaransi",
      desc: "Semua unit sudah di-QC, baterai terisi, OS bersih, dan siap digunakan tanpa repot setting.",
    },
  ];

  return (
    <section className="my-16 space-y-12">
      {/* Cara Sewa */}
      <div className="border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-10">
        <div className="mb-10 text-center max-w-xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Alur Pemesanan
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl sm:text-3xl text-[var(--ink)]">
            Cara Sewa Gadget di Grent
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Mudah, cepat, dan transparan — gadget siap digunakan dalam hitungan menit.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative flex flex-col border border-[var(--line)] bg-white p-5 transition hover:border-[var(--accent)]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ink)] text-xs font-bold text-white mb-3">
                {step.num}
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--ink)]">
                {step.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Persyaratan Sewa (S&K) */}
      <div className="border border-[var(--line)] bg-[#12171c] p-6 sm:p-10 text-white">
        <div className="mb-8 text-center max-w-xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Transparan &amp; Aman
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl sm:text-3xl text-white">
            Persyaratan Sewa (S&amp;K)
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Syarat mudah tanpa prosedur berbelit. Kami mengutamakan kepercayaan dan keamanan bersama.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {requirements.map((req, idx) => (
            <div
              key={idx}
              className="border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
            >
              <span className="text-3xl mb-3 block">{req.icon}</span>
              <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-white">
                {req.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-300">
                {req.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
