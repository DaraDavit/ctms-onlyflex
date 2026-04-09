export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import Link from "next/link";
import Background from "@/components/layout/Background";
import LoginForm from "./LoginForm";

interface PageProps {
  searchParams: Promise<{ secret?: string }>;
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { secret } = await searchParams;

  if (!secret || secret !== process.env.ADMIN_PORTAL_SECRET) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Background />
        <div className="relative max-w-md w-full p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white tracking-wider">
              ACCESS DENIED
            </h2>
            <p className="mt-2 text-xl text-white/80">
              Invalid or missing access token
            </p>
          </div>
          <div className="text-center">
            <Link href="/" className="text-sm text-white/60 hover:text-white transition-colors">
              ← Back to main site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <LoginForm />;
}