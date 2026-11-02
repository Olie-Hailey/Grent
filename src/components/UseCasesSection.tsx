
const useCases = [
  {
    icon: "🎤",
    title: "Seminar & Presentasi",
    desc: "Butuh unit laptop atau iPad untuk pemateri dan registrasi peserta seminar.",
  },
  {
    icon: "🏢",
    title: "Kebutuhan Kantor",
    desc: "Laptop cadangan untuk karyawan magang, proyek freelance, atau audit kantor.",
  },
  {
    icon: "🎪",
    title: "Pameran & Event Expo",
    desc: "Sewa gadget untuk booth pameran, display interaktif, dan demo produk.",
  },
  {
    icon: "🎓",
    title: "Kuliah & Ujian",
    desc: "Sewa harian atau mingguan untuk sidang skripsi, ujian online, dan tugas kuliah.",
  },
  {
    icon: "🚨",
    title: "Gadget Darurat",
    desc: "Solusi cepat saat perangkat utama rusak atau sedang masuk tempat servis.",
  },
  {
    icon: "✈️",
    title: "Liburan & Foto Konten",
    desc: "Sewa iPhone 16 Pro / S24 Ultra untuk hasil foto dan video konser/liburan terbaik.",
  },
  {
    icon: "⚡",
    title: "Gaming & Kompetisi",
    desc: "Laptop gaming spek tinggi (ROG/RTX) siap pakai untuk turnamen atau rendering.",
  },
  {
    icon: "🏠",
    title: "Work From Home (WFH)",
    desc: "Paket bulanan super hemat untuk kerja remote tanpa perlu keluar modal beli baru.",
  },
];

export function UseCasesSection() {
  return (
    <section className="my-16 border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-10">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Solusi Fleksibel
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl sm:text-3xl text-[var(--ink)]">
          Butuh Gadget untuk Kebutuhan Apa?
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[var(--muted)]">
          Grent siap melayani kebutuhan sewa personal, mahasiswa, profesional, hingga instansi & perusahaan.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {useCases.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-none border border-[var(--line)] bg-[#fafbfc] p-5 transition hover:border-[var(--accent)] hover:bg-white"
          >
            <span className="text-3xl mb-3">{item.icon}</span>
            <h3 className="font-[family-name:var(--font-display)] text-base font-bold text-[var(--ink)]">
              {item.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6 text-sm">
        <p className="text-[var(--muted)]">
          Butuh sewa banyak unit untuk korporat atau event skala besar?
        </p>
        <a
          href="https://wa.me/62895622996629?text=Halo%20Admin%20Grent%2C%20saya%20mau%20tanya%20penawaran%20sewa%20banyak%20unit%20(Corporate%20%2F%20Event)"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
        >
          Minta Penawaran Khusus Corporate →
        </a>
      </div>
    </section>
  );
}
