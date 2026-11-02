"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function NavLinks({
  session,
  hasCustomer,
}: {
  session: boolean;
  hasCustomer?: boolean;
}) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    if (pathname !== "/") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    const promoEl = document.getElementById("promo");
    const caraSewaEl = document.getElementById("cara-sewa");
    const lokasiEl = document.getElementById("lokasi");

    if (promoEl) observer.observe(promoEl);
    if (caraSewaEl) observer.observe(caraSewaEl);
    if (lokasiEl) observer.observe(lokasiEl);

    const handleScroll = () => {
      if (window.scrollY < 200) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  const links = [
    {
      href: "/",
      label: "Beranda",
      isActive: pathname === "/" && !activeSection,
    },
    {
      href: "/katalog",
      label: "Katalog Gadget",
      isActive: pathname === "/katalog" || pathname.startsWith("/rent/"),
    },
    ...(hasCustomer
      ? [
          {
            href: "/pesanan-saya",
            label: "Pesanan Saya",
            isActive: pathname === "/pesanan-saya",
          },
        ]
      : []),
    {
      href: "/#promo",
      label: "Promo",
      isActive: pathname === "/" && activeSection === "#promo",
    },
    {
      href: "/#cara-sewa",
      label: "Cara Sewa",
      isActive: pathname === "/" && activeSection === "#cara-sewa",
    },
  ];

  return (
    <nav className="flex items-center gap-1.5 sm:gap-2.5">
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-all duration-200 ${
            link.isActive
              ? "bg-white text-[var(--ink)] shadow-[0_4px_14px_rgba(0,0,0,0.08)] border border-[var(--line)]/80 font-bold scale-[1.02]"
              : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-black/[0.04] font-medium"
          }`}
        >
          {link.label}
        </Link>
      ))}

      {!hasCustomer && (
        <Link
          href={session ? "/admin" : "/login"}
          className={`ml-1.5 sm:ml-2 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
            pathname.startsWith("/admin") || pathname === "/login"
              ? "bg-white text-[var(--ink)] shadow-[0_4px_14px_rgba(0,0,0,0.08)] border border-[var(--line)]/80 font-bold scale-[1.02]"
              : "border border-[var(--line)] text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)] font-semibold"
          }`}
        >
          {session ? "Dashboard Admin" : "Login"}
        </Link>
      )}
    </nav>
  );
}
