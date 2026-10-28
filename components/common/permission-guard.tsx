"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/features/auth/hooks/use-permissions";

interface PermissionGuardProps {
  permission: string | string[];
  mode?: "all" | "any";
  title?: string;
  description?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Guarda de permissão para proteção de páginas ou blocos inteiros.
 * Caso o usuário não tenha o privilégio exigido, renderiza uma tela elegante
 * de "Acesso Não Autorizado" impedindo visualização indevida.
 */
export function PermissionGuard({
  permission,
  mode = "any",
  title = "Acesso Restrito",
  description = "Você não possui a permissão necessária para acessar ou executar esta função.",
  children,
  fallback,
}: PermissionGuardProps) {
  const { can } = usePermissions();

  if (!can(permission, mode)) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center max-w-lg mx-auto my-12 shadow-xs">
        <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-foreground text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
