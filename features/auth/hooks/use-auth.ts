"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "../services/auth.service";
import { getToken } from "@/lib/auth/token";
import { getUserSession, type SessionUser } from "@/lib/auth/session";
import { parseApiError } from "@/lib/api/errors";
import type { LoginCredentials } from "../types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = getToken();
    const sessionUser = getUserSession();
    if (token && sessionUser) {
      setUser(sessionUser);
    }
    setIsInitialized(true);
  }, []);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      queryClient.clear();
      if (data?.data?.user) {
        setUser(data.data.user);
      }
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
  }, [queryClient]);

  return {
    user,
    isAuthenticated: Boolean(user && getToken()),
    isInitialized,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ? parseApiError(loginMutation.error) : null,
    logout,
  };
}
