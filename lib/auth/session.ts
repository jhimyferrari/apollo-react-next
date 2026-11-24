export interface SessionUser {
  id: string;
  name: string;
  email: string;
  is_administrator?: boolean;
  organization_id?: string;
  permissions?: Array<{ name: string; status?: string }> | string[];
  created_at?: string | null;
  updated_at?: string | null;
}

const LEGACY_TOKEN_KEY = "apollo_auth_token";
const LEGACY_USER_KEY = "apollo_auth_user";

/**
 * Remove credenciais legadas de localStorage e cookie não-HttpOnly
 * durante a transição para o modelo BFF com cookie HttpOnly.
 */
export function clearLegacyClientAuthStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(LEGACY_TOKEN_KEY);
    window.localStorage.removeItem(LEGACY_USER_KEY);
  } catch {
    // Ignora caso localStorage esteja bloqueado
  }

  document.cookie = `${LEGACY_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}
