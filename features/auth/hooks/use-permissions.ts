"use client";

import { useCallback } from "react";
import { useAuth } from "./use-auth";
import { hasPermission } from "@/lib/auth/permissions";

/**
 * Hook central de controle de acesso e visibilidade baseado em permissões (RBAC).
 *
 * Uso:
 * ```tsx
 * const { can, isAdministrator } = usePermissions();
 *
 * {can("product.create") && <Button>Novo Produto</Button>}
 * {can("product.update") && <DropdownMenuItem>Editar</DropdownMenuItem>}
 * {can("product.delete") && <DropdownMenuItem>Excluir</DropdownMenuItem>}
 * ```
 */
export function usePermissions() {
  const { user, isInitialized } = useAuth();

  const can = useCallback(
    (permission?: string | string[] | null, mode: "all" | "any" = "any") => {
      return hasPermission(user, permission, mode);
    },
    [user]
  );

  return {
    user,
    can,
    isAdministrator: Boolean(user?.is_administrator),
    permissions: user?.permissions || [],
    isInitialized,
  };
}
