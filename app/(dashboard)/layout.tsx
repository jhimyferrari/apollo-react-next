import React from "react";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/providers/auth-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
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

  if (session.transientError) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="rounded-lg border border-border bg-card p-8 text-center max-w-md w-full shadow-xs space-y-4">
          <h1 className="text-lg font-semibold text-foreground">
            Serviço temporariamente indisponível
          </h1>
          <p className="text-sm text-muted-foreground">
            Não foi possível validar sua sessão no momento devido a uma falha
            temporária de comunicação com o servidor.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <form method="GET">
              <Button type="submit">Tentar novamente</Button>
            </form>
            <form action="/api/auth/clear-session" method="GET">
              <Button type="submit" variant="outline">
                Ir para o login
              </Button>
            </form>
          </div>
        </div>
      </main>
    );
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
