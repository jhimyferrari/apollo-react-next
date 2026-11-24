import React from "react";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/providers/auth-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { fetchServerSession } from "@/lib/bff/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await fetchServerSession();

  if (session.invalidToken) {
    redirect("/api/auth/clear-session");
  }

  if (!session.authenticated || !session.user) {
    redirect("/login");
  }

  return (
    <AuthProvider initialUser={session.user} autoFetch={true}>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
