export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return Math.max(days, 1);
}

export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export type RentalPackage = "HARIAN" | "MINGGUAN" | "BULANAN";

export function calculateRentalPrice(
  dailyPrice: number,
  days: number,
  pkg: RentalPackage = "HARIAN",
  customWeekly?: number | null,
  customMonthly?: number | null
): { total: number; discountPercent: number; effectiveDaily: number } {
  if (pkg === "BULANAN" || days >= 30) {
    if (customMonthly) {
      const months = Math.ceil(days / 30);
      const total = months * customMonthly;
      return {
        total,
        discountPercent: Math.max(0, Math.round((1 - total / (days * dailyPrice)) * 100)),
        effectiveDaily: Math.round(total / days),
      };
    }
    // Diskon default bulanan 35%
    const total = Math.round(days * dailyPrice * 0.65);
    return {
      total,
      discountPercent: 35,
      effectiveDaily: Math.round(total / days),
    };
  }

  if (pkg === "MINGGUAN" || days >= 7) {
    if (customWeekly) {
      const weeks = Math.ceil(days / 7);
      const total = weeks * customWeekly;
      return {
        total,
        discountPercent: Math.max(0, Math.round((1 - total / (days * dailyPrice)) * 100)),
        effectiveDaily: Math.round(total / days),
      };
    }
    // Diskon default mingguan 15%
    const total = Math.round(days * dailyPrice * 0.85);
    return {
      total,
      discountPercent: 15,
      effectiveDaily: Math.round(total / days),
    };
  }

  return {
    total: days * dailyPrice,
    discountPercent: 0,
    effectiveDaily: dailyPrice,
  };
}

export const WHATSAPP_NUMBER = "62895622996629"; // Nomor CS Grent

export function buildWhatsAppBookingMessage(params: {
  bookingId?: string;
  customerName: string;
  gadgetModel: string;
  startDate: string;
  endDate: string;
  days: number;
  rentalPackage: string;
  deliveryMethod: string;
  deliveryAddress?: string | null;
  totalPrice: number;
}): string {
  const deliveryText =
    params.deliveryMethod === "DELIVERY"
      ? `Antar-Jemput ke Alamat (${params.deliveryAddress || "-"})`
      : "Ambil Sendiri di Toko";

  const lines = [
    `Halo Admin Grent 💬, saya ingin konfirmasi sewa gadget:`,
    params.bookingId ? `• *ID Booking:* ${params.bookingId}` : null,
    `• *Nama Penyewa:* ${params.customerName}`,
    `• *Unit Gadget:* ${params.gadgetModel}`,
    `• *Durasi:* ${params.days} Hari (${params.startDate} s/d ${params.endDate})`,
    `• *Paket Sewa:* ${params.rentalPackage}`,
    `• *Metode Serah Terima:* ${deliveryText}`,
    `• *Total Biaya:* ${formatIDR(params.totalPrice)}`,
    ``,
    `Mohon info ketersediaan & jadwal serah terima. Terima kasih!`,
  ].filter(Boolean);

  return encodeURIComponent(lines.join("\n"));
}
