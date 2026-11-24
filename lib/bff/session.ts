import type { SessionUser } from "@/lib/auth/session";
import { getApiInternalUrl } from "./config";
import { getAuthTokenFromServerCookies } from "./cookies";

export interface ServerSessionResult {
  authenticated: boolean;
  user: SessionUser | null;
  invalidToken: boolean;
}

export function sanitizeSessionUser(raw: unknown): SessionUser | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const obj = raw as Record<string, unknown>;
  if (
    typeof obj.id !== "string" ||
    typeof obj.name !== "string" ||
    typeof obj.email !== "string"
  ) {
    return null;
  }

  let permissions: SessionUser["permissions"] = [];
  if (Array.isArray(obj.permissions)) {
    permissions = obj.permissions
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item === "object") {
          const permObj = item as Record<string, unknown>;
          if (typeof permObj.name === "string") {
            return {
              name: permObj.name,
              ...(typeof permObj.status === "string"
                ? { status: permObj.status }
                : {}),
            };
          }
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null) as SessionUser["permissions"];
  }

  return {
    id: obj.id,
    name: obj.name,
    email: obj.email,
    is_administrator: Boolean(obj.is_administrator),
    permissions,
    ...(typeof obj.created_at === "string" || obj.created_at === null
      ? { created_at: obj.created_at }
      : {}),
    ...(typeof obj.updated_at === "string" || obj.updated_at === null
      ? { updated_at: obj.updated_at }
      : {}),
  };
}

export async function fetchServerSession(): Promise<ServerSessionResult> {
  const token = await getAuthTokenFromServerCookies();
  if (!token) {
    return { authenticated: false, user: null, invalidToken: false };
  }

  try {
    const response = await fetch(`${getApiInternalUrl()}/v1/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 401) {
      return { authenticated: false, user: null, invalidToken: true };
    }

    if (!response.ok) {
      return { authenticated: false, user: null, invalidToken: false };
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const rawUser = payload?.data ?? payload;
    const user = sanitizeSessionUser(rawUser);

    if (!user) {
      return { authenticated: false, user: null, invalidToken: false };
    }

    return { authenticated: true, user, invalidToken: false };
  } catch {
    return { authenticated: false, user: null, invalidToken: false };
  }
}
