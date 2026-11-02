import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth";
import { getCustomerProfileByEmail } from "@/lib/customer-profile";
import { CustomerProfileForm } from "@/components/CustomerProfileForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profil Saya — Grent",
  description: "Kelola data profil dan identitas akun penyewa gadget Grent.",
};

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function ProfilePage({ searchParams }: Props) {
  const customer = await getCustomerSession();
  const { next: nextUrl } = await searchParams;

  if (!customer) {
    redirect(`/login?next=${encodeURIComponent(nextUrl || "/profile")}`);
  }

  const profile = await getCustomerProfileByEmail(customer.email);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-black tracking-tight text-[var(--ink)]">
          Profil Saya
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
          Kelola informasi dan keamanan akun Anda
        </p>
      </div>

      <CustomerProfileForm
        customer={customer}
        initialProfile={profile}
        nextUrl={nextUrl}
      />
    </div>
  );
}
