import Link from "next/link";
import { getSession, getCustomerSession } from "@/lib/auth";
import { getAdminProfile } from "@/lib/admin-profile";
import { NavLinks } from "@/components/NavLinks";
import { UserMenu } from "@/components/UserMenu";
import { AdminMenu } from "@/components/AdminMenu";

export async function Navbar() {
  const [session, customer] = await Promise.all([
    getSession(),
    getCustomerSession(),
  ]);

  const adminProfile = session ? await getAdminProfile(session.username) : null;

  return (
    <header className="border-b border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl font-black tracking-tight text-[var(--ink)] flex items-center gap-2.5 group"
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-white shadow-sm border border-[var(--line)]/60 transition group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Grent Logo"
              width={36}
              height={36}
              className="h-full w-full object-contain p-0.5"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="tracking-tight text-xl sm:text-2xl font-black">Grent</span>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
              Gadget
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <NavLinks session={Boolean(session)} hasCustomer={Boolean(customer)} />
          {customer && <UserMenu customer={customer} />}
          {session && !customer && <AdminMenu admin={adminProfile} />}
        </div>
      </div>
    </header>
  );
}
