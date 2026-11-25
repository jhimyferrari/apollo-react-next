"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth.service";
import type { AuthSessionResponse } from "@/features/auth/types";
import {
  clearLegacyClientAuthStorage,
  type SessionUser,
} from "@/lib/auth/session";
import { broadcastAuthEvent, subscribeAuthEvents } from "@/lib/auth/sync";

export const AUTH_SESSION_QUERY_KEY = ["auth", "session"] as const;

interface AuthContextValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setSessionUser: (user: SessionUser | null) => void;
  clearSessionState: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: SessionUser | null;
  autoFetch?: boolean;
}

export function AuthProvider({
  children,
  initialUser,
  autoFetch = false,
}: AuthProviderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    clearLegacyClientAuthStorage();
  }, []);

  const hasInitialUser = initialUser !== undefined;
  const hasHandledExpiryRef = useRef(false);

  const { data, isFetched } = useQuery<AuthSessionResponse>({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: () => authService.getSession(),
    enabled: autoFetch,
    initialData: hasInitialUser
      ? {
          authenticated: Boolean(initialUser),
          user: initialUser ?? null,
        }
      : undefined,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: autoFetch,
    retry: false,
  });

  const setSessionUser = useCallback(
    (nextUser: SessionUser | null) => {
      queryClient.setQueryData<AuthSessionResponse>(AUTH_SESSION_QUERY_KEY, {
        authenticated: Boolean(nextUser),
        user: nextUser,
      });
    },
    [queryClient]
  );

  const clearSessionState = useCallback(() => {
    queryClient.setQueryData<AuthSessionResponse>(AUTH_SESSION_QUERY_KEY, {
      authenticated: false,
      user: null,
    });
  }, [queryClient]);

  useEffect(() => {
    return subscribeAuthEvents((type) => {
      if (type === "logout") {
        clearSessionState();
        queryClient.removeQueries({
          predicate: (query) => query.queryKey[0] !== "auth",
        });

        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register-organization")
        ) {
          router.replace("/login");
        }
        return;
      }

      if (type === "login" || type === "session-updated") {
        queryClient.invalidateQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
      }
    });
  }, [clearSessionState, queryClient, router]);

  useEffect(() => {
    if (autoFetch && isFetched && data && data.authenticated === false) {
      if (!hasHandledExpiryRef.current) {
        hasHandledExpiryRef.current = true;
        queryClient.removeQueries({
          predicate: (query) => query.queryKey[0] !== "auth",
        });
        broadcastAuthEvent("logout");

        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register-organization")
        ) {
          router.replace("/login");
        }
      }
    } else if (data?.authenticated) {
      hasHandledExpiryRef.current = false;
    }
  }, [autoFetch, isFetched, data, queryClient, router]);

  const user = data?.authenticated ? (data.user ?? null) : null;
  const isAuthenticated = Boolean(data?.authenticated && user);
  const isInitialized = hasInitialUser || !autoFetch || isFetched;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isInitialized,
        setSessionUser,
        clearSessionState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider.");
  }
  return ctx;
}
