import { AdminPanel } from "@/components/AdminPanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Panel — Grent",
  description: "Kelola booking rental, katalog etalase gadget, dan profil staf admin Grent.",
};

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function AdminPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const initialTab =
    tab === "profile" ? "profile" : tab === "phones" ? "phones" : "rentals";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-black text-[var(--ink)] tracking-tight">
          Admin Grent
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
          Kelola booking rental, katalog etalase gadget, dan profil staf admin Grent.
        </p>
      </div>
      <AdminPanel initialTab={initialTab} />
    </div>
  );
}
