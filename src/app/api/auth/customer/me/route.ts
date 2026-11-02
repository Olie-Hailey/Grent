import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCustomerProfileByEmail } from "@/lib/customer-profile";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customer = await getCustomerSession();
    if (!customer) {
      return NextResponse.json({ customer: null, profile: null, activeRental: null });
    }

    const [profile, activeRental] = await Promise.all([
      getCustomerProfileByEmail(customer.email),
      prisma.rental.findFirst({
        where: {
          customerEmail: customer.email,
          status: { in: ["PENDING", "APPROVED", "ACTIVE"] },
        },
        orderBy: { createdAt: "desc" },
        include: { phone: true },
      }),
    ]);

    return NextResponse.json({ customer, profile, activeRental });
  } catch {
    return NextResponse.json({ customer: null, profile: null, activeRental: null }, { status: 500 });
  }
}
