/**
 * Gerenciamento do Token de Autenticação Bearer.
 * Utiliza localStorage e cookies para compatibilidade com Next.js.
 */

const TOKEN_KEY = "apollo_auth_token";
export const AUTH_CHANGE_EVENT = "apollo-auth-change";

export function notifyAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function subscribeAuthChange(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);

  // Define cookie para acessibilidade em middlewares/SSR caso necessário
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(
    token
  )}; path=/; max-age=604800; SameSite=Lax`;
  notifyAuthChange();
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  notifyAuthChange();
}
