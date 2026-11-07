"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleAccountPicker } from "@/components/GoogleAccountPicker";

function GoogleLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const [loading, setLoading] = useState(false);

  async function handleSelectAccount(name: string, email: string, image?: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, image }),
      });

      if (!res.ok) {
        throw new Error("Gagal login dengan akun Google");
      }

      router.replace(nextPath.startsWith("/") ? nextPath : "/");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat login");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#131314] flex items-center justify-center p-4">
      <GoogleAccountPicker
        isStandalone={true}
        loading={loading}
        onSelectAccount={handleSelectAccount}
        onClose={() => router.push("/login")}
      />
    </div>
  );
}

export default function GoogleLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#131314] flex items-center justify-center text-[#9aa0a6] text-sm">
          Memuat akun Google...
        </div>
      }
    >
      <GoogleLoginContent />
    </Suspense>
  );
}
