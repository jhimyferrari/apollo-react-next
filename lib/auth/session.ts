import { removeToken } from "./token";

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

const USER_KEY = "apollo_auth_user";

export function getUserSession(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setUserSession(user: SessionUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  removeToken();
  localStorage.removeItem(USER_KEY);
}
