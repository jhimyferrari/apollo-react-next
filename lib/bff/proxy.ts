import { NextResponse, type NextRequest } from "next/server";
import {
  getApiInternalUrl,
  REPORTS_TIMEOUT_MS,
  UPSTREAM_TIMEOUT_MS,
} from "./config";
import { clearAuthTokenCookie, getAuthTokenFromRequest } from "./cookies";
import { validateCsrfRequest } from "./security";

export const NO_CACHE_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
  Vary: "Cookie",
};

const PASSTHROUGH_RESPONSE_HEADERS = [
  "content-type",
  "content-disposition",
  "retry-after",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
];

export function buildUpstreamHeaders(
  request: NextRequest,
  token: string | null
): Headers {
  const headers = new Headers();

  headers.set("Accept", request.headers.get("accept") || "application/json");

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    headers.set("Accept-Language", acceptLanguage);
  }

  const userAgent = request.headers.get("user-agent");
  if (userAgent) {
    headers.set("User-Agent", userAgent);
  }

  const idempotencyKey = request.headers.get("idempotency-key");
  if (idempotencyKey) {
    headers.set("Idempotency-Key", idempotencyKey);
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  if (forwardedFor) {
    headers.set("X-Forwarded-For", forwardedFor);
  } else if (realIp) {
    headers.set("X-Forwarded-For", realIp);
  }
  if (realIp) {
    headers.set("X-Real-IP", realIp);
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export async function buildProxyResponse(
  upstream: Response,
  options?: { clearCookieOn401?: boolean }
): Promise<NextResponse> {
  const headers = new Headers(NO_CACHE_HEADERS);

  for (const name of PASSTHROUGH_RESPONSE_HEADERS) {
    const val = upstream.headers.get(name);
    if (val) {
      headers.set(name, val);
    }
  }

  let response: NextResponse;
  if (
    upstream.status === 204 ||
    upstream.status === 205 ||
    upstream.status === 304
  ) {
    response = new NextResponse(null, {
      status: upstream.status,
      headers,
    });
  } else {
    const body = await upstream.arrayBuffer();
    response = new NextResponse(body, {
      status: upstream.status,
      headers,
    });
  }

  if ((options?.clearCookieOn401 ?? true) && upstream.status === 401) {
    clearAuthTokenCookie(response);
  }

  return response;
}

export async function forwardToBackend(
  request: NextRequest,
  normalizedPath: string,
  options?: { injectAuth?: boolean; clearCookieOn401?: boolean }
): Promise<NextResponse> {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const token =
    options?.injectAuth !== false ? getAuthTokenFromRequest(request) : null;
  const targetUrl = `${getApiInternalUrl()}${normalizedPath}${request.nextUrl.search}`;
  const method = request.method.toUpperCase();
  const headers = buildUpstreamHeaders(request, token);

  let body: ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const rawBody = await request.arrayBuffer();
    if (rawBody.byteLength > 0) {
      body = rawBody;
    }
  }

  const timeoutMs = normalizedPath.startsWith("/v1/reports")
    ? REPORTS_TIMEOUT_MS
    : UPSTREAM_TIMEOUT_MS;

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });

    return await buildProxyResponse(upstream, {
      clearCookieOn401: options?.clearCookieOn401 ?? true,
    });
  } catch (err) {
    const isTimeout =
      err instanceof Error &&
      (err.name === "TimeoutError" || err.name === "AbortError");

    if (isTimeout) {
      return NextResponse.json(
        {
          error: {
            code: "UPSTREAM_TIMEOUT",
            message: "Tempo limite excedido ao comunicar com o servidor.",
          },
        },
        { status: 504, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "UPSTREAM_UNAVAILABLE",
          message: "Serviço temporariamente indisponível. Tente novamente.",
        },
      },
      { status: 502, headers: NO_CACHE_HEADERS }
    );
  }
}
