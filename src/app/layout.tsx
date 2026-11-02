import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { WhatsAppFloating } from "@/components/WhatsAppFloating";
import { SiteShell } from "@/components/SiteShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grent — Rental Gadget (Laptop, Smartphone & Tablet)",
  description: "Sewa gadget berkualitas (Laptop, MacBook, iPhone, Tablet) harian, mingguan, dan bulanan dengan mudah, cepat, dan terpercaya.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <SiteShell
          navbar={<Navbar />}
          footer={
            <footer className="border-t border-[var(--line)] py-6 text-center text-sm text-[var(--muted)] print:hidden">
              Grent · Rental Gadget Harian, Mingguan &amp; Bulanan
            </footer>
          }
          whatsapp={<WhatsAppFloating />}
        >
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
