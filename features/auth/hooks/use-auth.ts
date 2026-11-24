"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "../services/auth.service";
import { useAuthContext } from "@/components/providers/auth-provider";
import { broadcastAuthEvent } from "@/lib/auth/sync";
import { parseApiError } from "@/lib/api/errors";
import type { LoginCredentials } from "../types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    isAuthenticated,
    isInitialized,
    setSessionUser,
    clearSessionState,
  } = useAuthContext();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (response) => {
      queryClient.clear();
      setSessionUser(response.data?.user ?? null);
      broadcastAuthEvent("login");
      toast.success("Login realizado com sucesso! Bem-vindo ao Apollo.");
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      const parsed = parseApiError(error);
      if (!parsed.isValidationError) {
        toast.error(
          parsed.message || "Credenciais inválidas. Verifique os dados informados."
        );
      }
    },
  });

  const logout = useCallback(async () => {
    toast.info("Encerrando sessão...");
    await authService.logout();
    clearSessionState();
    queryClient.clear();
    broadcastAuthEvent("logout");
    router.replace("/login");
    router.refresh();
  }, [clearSessionState, queryClient, router]);

  return {
    user,
    isAuthenticated,
    isInitialized,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ? parseApiError(loginMutation.error) : null,
    logout,
  };
}
