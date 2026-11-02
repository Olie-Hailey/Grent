import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Login — Grent",
  description: "Masuk ke akun Grent untuk sewa gadget atau kelola sistem.",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Suspense fallback={<p className="text-center text-[var(--muted)]">Memuat form login...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
