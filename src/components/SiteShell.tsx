"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type SiteShellProps = {
  navbar: ReactNode;
  footer: ReactNode;
  whatsapp: ReactNode;
  children: ReactNode;
};

export function SiteShell({
  navbar,
  footer,
  whatsapp,
  children,
}: SiteShellProps) {
  const pathname = usePathname();
  const isInvoice = pathname?.startsWith("/invoice");

  if (isInvoice) {
    return (
      <main className="min-h-screen w-full bg-slate-100/70 print:bg-white flex flex-col items-center justify-start py-4 sm:py-8 px-2 sm:px-4 print:p-0 print:m-0 print:block">
        {children}
      </main>
    );
  }

  return (
    <>
      {navbar}
      <main className="flex-1">{children}</main>
      {footer}
      {whatsapp}
    </>
  );
}
