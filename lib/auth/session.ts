import { removeToken, notifyAuthChange } from "./token";

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

let cachedRawUser: string | null = null;
let cachedParsedUser: SessionUser | null = null;

export function getUserSession(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    cachedRawUser = null;
    cachedParsedUser = null;
    return null;
  }
  if (raw === cachedRawUser) {
    return cachedParsedUser;
  }
  try {
    cachedRawUser = raw;
    cachedParsedUser = JSON.parse(raw) as SessionUser;
    return cachedParsedUser;
  } catch {
    cachedRawUser = null;
    cachedParsedUser = null;
    return null;
  }
}

export function setUserSession(user: SessionUser): void {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(user);
  cachedRawUser = serialized;
  cachedParsedUser = user;
  localStorage.setItem(USER_KEY, serialized);
  notifyAuthChange();
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  cachedRawUser = null;
  cachedParsedUser = null;
  localStorage.removeItem(USER_KEY);
  removeToken();
}
