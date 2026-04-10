"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthScreen } from "@/components/auth/AuthScreen";

function RegisterContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("redirect") || searchParams.get("callbackUrl") || "/";

  return <AuthScreen initialTab="register" callbackUrl={callbackUrl} />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-zinc-400">Loading...</div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
