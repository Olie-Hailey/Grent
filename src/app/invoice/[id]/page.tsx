import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InvoiceView } from "@/components/InvoiceView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Invoice Sewa Gadget — Grent",
  description: "Lembar invoice resmi penyewaan gadget Grent untuk verifikasi serah terima unit di toko.",
};

type Params = { params: Promise<{ id: string }> };

export default async function InvoicePage({ params }: Params) {
  const { id } = await params;
  const rental = await prisma.rental.findUnique({
    where: { id },
    include: { phone: true },
  });

  if (!rental) {
    notFound();
  }

  return (
    <div className="w-full max-w-3xl mx-auto print:max-w-none print:w-full print:m-0 print:p-0">
      <InvoiceView rental={rental} />
    </div>
  );
}
