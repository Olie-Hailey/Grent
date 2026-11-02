import Link from "next/link";
import { PhoneImage } from "@/components/PhoneImage";
import { formatIDR } from "@/lib/utils";

export type PhoneCardData = {
  id: string;
  model: string;
  category?: string;
  storage: string;
  color: string;
  dailyPrice: number;
  weeklyPrice?: number | null;
  monthlyPrice?: number | null;
  stock: number;
  description: string;
  imageEmoji: string;
  imageUrl?: string | null;
};

export function PhoneCard({ phone }: { phone: PhoneCardData }) {
  const available = phone.stock > 0;

  return (
    <article className="group flex flex-col border border-[var(--line)] bg-[var(--surface)] p-5 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/40 hover:shadow-[0_20px_40px_-28px_rgba(15,20,25,0.45)]">
      <div className="mb-4 overflow-hidden transition duration-300 group-hover:scale-[1.02]">
        <PhoneImage
          imageUrl={phone.imageUrl}
          imageEmoji={phone.imageEmoji}
          alt={phone.model}
          className="h-36"
        />
      </div>

      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-block bg-[#eef2f5] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">
          {phone.category || "Gadget"}
        </span>
        <span
          className={`shrink-0 text-xs font-semibold uppercase tracking-wide ${
            available ? "text-[var(--accent)]" : "text-red-600"
          }`}
        >
          {available ? `${phone.stock} unit siap` : "Habis"}
        </span>
      </div>

      <h2 className="mb-1 font-[family-name:var(--font-display)] text-xl leading-tight text-[var(--ink)]">
        {phone.model}
      </h2>

      <p className="mb-3 text-sm text-[var(--muted)]">
        {phone.storage} · {phone.color}
      </p>

      <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">
        {phone.description}
      </p>

      <div className="mb-4 rounded-lg bg-[#f8fafc] border border-[var(--line)]/60 p-2.5 text-xs text-[var(--muted)] space-y-1">
        <div className="flex justify-between">
          <span>Harian:</span>
          <strong className="text-[var(--ink)]">{formatIDR(phone.dailyPrice)}</strong>
        </div>
        <div className="flex justify-between text-emerald-700">
          <span>Mingguan (~15% hemat):</span>
          <span>{formatIDR(phone.weeklyPrice || Math.round(phone.dailyPrice * 7 * 0.85))} /mgg</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">Mulai dari</p>
          <p className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
            {formatIDR(phone.dailyPrice)}
            <span className="text-xs font-normal text-[var(--muted)]">/hari</span>
          </p>
        </div>
        {available ? (
          <Link
            href={`/rent/${phone.id}`}
            className="bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent)]"
          >
            Sewa Unit
          </Link>
        ) : (
          <span className="bg-[var(--line)] px-4 py-2.5 text-sm font-semibold text-[var(--muted)]">
            Habis
          </span>
        )}
      </div>
    </article>
  );
}
