import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import {
  getSessionMaxAgeSeconds,
  getTokenCookieName,
  isProduction,
  LEGACY_TOKEN_COOKIE_NAME,
} from "./config";
import { decryptCookieValue, encryptCookieValue } from "./crypto";

export function setAuthTokenCookie(
  response: NextResponse,
  token: string,
  maxAgeSeconds?: number
): void {
  const encrypted = encryptCookieValue(token);

  response.cookies.set({
    name: getTokenCookieName(),
    value: encrypted,
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds ?? getSessionMaxAgeSeconds(),
  });
}

export function clearAuthTokenCookie(response: NextResponse): void {
  response.cookies.set({
    name: getTokenCookieName(),
    value: "",
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: LEGACY_TOKEN_COOKIE_NAME,
    value: "",
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });
}

export function getAuthTokenFromRequest(request: NextRequest): string | null {
  const raw = request.cookies.get(getTokenCookieName())?.value;
  if (!raw) {
    return null;
  }

  return decryptCookieValue(raw);
}

export async function getAuthTokenStateFromServerCookies(): Promise<{
  hasCookie: boolean;
  token: string | null;
}> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(getTokenCookieName())?.value;
  if (!raw) {
    return { hasCookie: false, token: null };
  }

  return {
    hasCookie: true,
    token: decryptCookieValue(raw),
  };
}

export async function getAuthTokenFromServerCookies(): Promise<string | null> {
  const { token } = await getAuthTokenStateFromServerCookies();
  return token;
}
