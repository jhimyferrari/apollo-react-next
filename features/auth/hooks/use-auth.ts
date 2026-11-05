"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "../services/auth.service";
import { getToken, subscribeAuthChange } from "@/lib/auth/token";
import { getUserSession } from "@/lib/auth/session";
import { parseApiError } from "@/lib/api/errors";
import type { LoginCredentials } from "../types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const token = useSyncExternalStore(
    subscribeAuthChange,
    getToken,
    () => undefined
  );
  const sessionUser = useSyncExternalStore(
    subscribeAuthChange,
    getUserSession,
    () => null
  );
  const isInitialized = useSyncExternalStore(
    subscribeAuthChange,
    () => true,
    () => false
  );

  const user = token ? sessionUser : null;

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: () => {
      queryClient.clear();
      toast.success("Login realizado com sucesso! Bem-vindo ao Apollo.");
      router.push("/");
    },
    onError: (error) => {
      const parsed = parseApiError(error);
      if (!parsed.isValidationError) {
        toast.error(parsed.message || "Credenciais inválidas. Verifique os dados informados.");
      }
    },
  });

  const logout = useCallback(async () => {
    toast.info("Encerrando sessão...");
    queryClient.clear();
    await authService.logout();
    router.replace("/login");
  }, [queryClient, router]);

  return {
    user,
    isAuthenticated: Boolean(user && token),
    isInitialized,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ? parseApiError(loginMutation.error) : null,
    logout,
  };
}
