"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { AuthScreen } from "@/components/auth/AuthScreen";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/customer/bookings";

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
