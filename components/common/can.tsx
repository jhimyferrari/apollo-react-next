"use client";

import React from "react";
import { usePermissions } from "@/features/auth/hooks/use-permissions";

interface CanProps {
  permission: string | string[];
  mode?: "all" | "any";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente declarativo para ocultação condicional de elementos com base em permissões.
 *
 * Exemplo:
 * ```tsx
 * <Can permission="product.create">
 *   <Button>Novo Produto</Button>
 * </Can>
 * ```
 */
export function Can({
  permission,
  mode = "any",
  children,
  fallback = null,
}: CanProps) {
  const { can } = usePermissions();

  if (!can(permission, mode)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
