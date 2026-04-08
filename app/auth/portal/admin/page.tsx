import { redirect } from "next/navigation";
import { signIn } from "next-auth/react";
import Background from "@/components/layout/Background";

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
            <a href="/" className="text-sm text-white/60 hover:text-white transition-colors">
              ← Back to main site
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <LoginForm />;
}

function LoginForm() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Background />
      <div className="relative max-w-md w-full p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-wider">
            ADMIN PORTAL
          </h2>
          <p className="mt-2 text-xl text-white/80">
            Only<span className="text-red-500 font-bold">Flex</span> 
          </p>
        </div>

        <form className="space-y-5" action={async (formData) => {
          "use server";
          
          const email = formData.get("email") as string;
          const password = formData.get("password") as string;

          if (!email || !email.includes("@")) {
            return;
          }

          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (result?.error) {
            return;
          } else {
            redirect("/admin/dashboard");
          }
        }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                placeholder="admin@example.com"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-white/30 bg-white/10 text-red-500 focus:ring-red-500/50 focus:ring-offset-0"
              />
              <span className="ml-2 text-sm text-white/70">Remember me</span>
            </label>
            <span className="text-sm text-white/60">
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-red-600/25"
          >
            Sign In
          </button>

          <div className="text-center">
            <a href="/" className="text-sm text-white/60 hover:text-white transition-colors">
              ← Back to main site
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}