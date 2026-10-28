"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { hasPermission } from "@/lib/auth/permissions";
import { setUserSession } from "@/lib/auth/session";
import { userService } from "@/features/users/services/user.service";

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
  const { user } = useAuth();

  // Se o usuário estiver autenticado, não for admin e não tiver permissões carregadas,
  // busca do endpoint de detalhes do usuário
  const shouldSync = Boolean(
    user?.id &&
    !user.is_administrator &&
    (!user.permissions || user.permissions.length === 0)
  );

  const { data: syncedUser } = useQuery({
    queryKey: ["current-user-permissions", user?.id],
    queryFn: async () => {
      try {
        const res = await userService.getById(user!.id);
        if (res?.data?.permissions && user) {
          const updated = {
            ...user,
            permissions: res.data.permissions,
          };
          setUserSession(updated);
          return updated;
        }
      } catch {
        // Falha de rede não quebra a renderização
      }
      return user;
    },
    enabled: shouldSync,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });

  const activeUser = syncedUser || user;

  const can = useCallback(
    (permission?: string | string[] | null, mode: "all" | "any" = "any") => {
      return hasPermission(activeUser, permission, mode);
    },
    [activeUser]
  );

  return {
    user: activeUser,
    can,
    isAdministrator: Boolean(activeUser?.is_administrator),
    permissions: activeUser?.permissions || [],
  };
}
