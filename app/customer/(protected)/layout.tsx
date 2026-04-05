import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";

export default async function ProtectedCustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
