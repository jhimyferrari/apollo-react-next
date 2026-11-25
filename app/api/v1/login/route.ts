import { NextResponse, type NextRequest } from "next/server";
import {
  getApiInternalUrl,
  getSessionMaxAgeSeconds,
  UPSTREAM_TIMEOUT_MS,
} from "@/lib/bff/config";
import { setAuthTokenCookie } from "@/lib/bff/cookies";
import {
  buildProxyResponse,
  buildUpstreamHeaders,
  NO_CACHE_HEADERS,
} from "@/lib/bff/proxy";
import { validateCsrfRequest } from "@/lib/bff/security";
import { sanitizeSessionUser } from "@/lib/bff/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const headers = buildUpstreamHeaders(request, null);
  const rawBody = await request.arrayBuffer();

  try {
    const upstream = await fetch(`${getApiInternalUrl()}/v1/login`, {
      method: "POST",
      headers,
      body: rawBody.byteLength > 0 ? rawBody : undefined,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (!upstream.ok) {
      return await buildProxyResponse(upstream, { clearCookieOn401: false });
    }

    const payload = (await upstream.json()) as {
      message?: string | number;
      data?: {
        token?: unknown;
        expires_at?: unknown;
        user?: unknown;
      };
    };

    const token =
      typeof payload?.data?.token === "string" && payload.data.token.length > 0
        ? payload.data.token
        : null;

    if (!token) {
      return NextResponse.json(
        {
          error: {
            code: "UPSTREAM_INVALID_RESPONSE",
            message: "Resposta de autenticação inválida.",
          },
        },
        { status: 502, headers: NO_CACHE_HEADERS }
      );
    }

    const user = sanitizeSessionUser(payload?.data?.user);

    let maxAge = getSessionMaxAgeSeconds();
    if (typeof payload?.data?.expires_at === "string") {
      const expiresAtMs = Date.parse(payload.data.expires_at);
      if (Number.isFinite(expiresAtMs) && expiresAtMs > Date.now()) {
        maxAge = Math.max(60, Math.floor((expiresAtMs - Date.now()) / 1000));
      }
    }

    const response = NextResponse.json(
      {
        message: payload?.message ?? "",
        data: {
          user,
        },
      },
      { status: upstream.status, headers: NO_CACHE_HEADERS }
    );

    setAuthTokenCookie(response, token, maxAge);
    return response;
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
