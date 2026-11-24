import { createHash } from "node:crypto";

export const LEGACY_TOKEN_COOKIE_NAME = "apollo_auth_token";
export const UPSTREAM_TIMEOUT_MS = 15_000;
export const REPORTS_TIMEOUT_MS = 30_000;

const DEFAULT_SESSION_MAX_AGE_SECONDS = 28_800; // 8 horas
const DEV_FALLBACK_SECRET = "apollo-dev-bff-cookie-secret-change-in-production";

let devFallbackWarned = false;

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getTokenCookieName(): string {
  return isProduction() ? "__Host-apollo_token" : "apollo_token";
}

export function getApiInternalUrl(): string {
  return (process.env.API_INTERNAL_URL || "http://localhost:8000/api").replace(
    /\/+$/,
    ""
  );
}

export function getAllowedOrigins(): string[] {
  const raw = process.env.APP_ORIGIN || "http://localhost:3000";
  return raw
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

export function getSessionMaxAgeSeconds(): number {
  const raw = process.env.SESSION_MAX_AGE_SECONDS;
  if (!raw) return DEFAULT_SESSION_MAX_AGE_SECONDS;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_SESSION_MAX_AGE_SECONDS;
  }

  return parsed;
}

export function getCookieEncryptionKey(): Buffer {
  const secret = process.env.BFF_COOKIE_SECRET?.trim();

  if (!secret) {
    if (isProduction()) {
      throw new Error("BFF_COOKIE_SECRET is required in production.");
    }

    if (!devFallbackWarned) {
      devFallbackWarned = true;
      console.warn(
        "[BFF] BFF_COOKIE_SECRET não definido; usando chave determinística de desenvolvimento."
      );
    }

    return createHash("sha256").update(DEV_FALLBACK_SECRET).digest();
  }

  if (/^[0-9a-fA-F]{64}$/.test(secret)) {
    return Buffer.from(secret, "hex");
  }

  return createHash("sha256").update(secret).digest();
}
