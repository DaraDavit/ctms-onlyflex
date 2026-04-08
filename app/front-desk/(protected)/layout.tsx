import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Link from "next/link";

interface FrontDeskLayoutProps {
  children: ReactNode;
}

export default async function FrontDeskLayout({
  children,
}: FrontDeskLayoutProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "FRONT_DESK") {
    redirect("/front-desk/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#030712]">
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Front Desk
              </h1>
              <nav className="flex space-x-4">
                <Link
                  href="/front-desk"
                  className="px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                >
                  Dashboard
                </Link>
                <Link
                  href="/front-desk/bookings"
                  className="px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                >
                  Bookings
                </Link>
                <Link
                  href="/front-desk/schedule"
                  className="px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                >
                  Schedule
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {session.user.name || session.user.email}
              </span>
              <form action={async () => {
                "use server";
                const { signOut } = await import("@/auth");
                await signOut({ redirect: true, redirectTo: "/front-desk/login" });
              }}>
                <button
                  type="submit"
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}