import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminIndex() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(`/auth/portal/admin?secret=${process.env.ADMIN_PORTAL_SECRET}`);
  }

  redirect("/admin/dashboard");
}
