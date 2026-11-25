import { NextResponse, type NextRequest } from "next/server";
import { getAllowedOrigins } from "./config";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function forbiddenResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "FORBIDDEN",
        message,
      },
    },
    { status: 403 }
  );
}

function badRequestResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "BAD_REQUEST",
        message,
      },
    },
    { status: 400 }
  );
}

export function validateCsrfRequest(request: NextRequest): NextResponse | null {
  if (!MUTATING_METHODS.has(request.method.toUpperCase())) {
    return null;
  }

  const secFetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (secFetchSite === "cross-site") {
    return forbiddenResponse("Requisição cross-site não permitida.");
  }

  const acceptedOrigins = new Set<string>(getAllowedOrigins());
  acceptedOrigins.add(request.nextUrl.origin);

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    acceptedOrigins.add(`${forwardedProto}://${forwardedHost}`);
  }

  let requestOrigin: string | null = request.headers.get("origin");
  if (!requestOrigin) {
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        requestOrigin = new URL(referer).origin;
      } catch {
        requestOrigin = null;
      }
    }
  }

  if (!requestOrigin || !acceptedOrigins.has(requestOrigin.replace(/\/+$/, ""))) {
    return forbiddenResponse("Origem da requisição não autorizada.");
  }

  const xRequestedWith = request.headers.get("x-requested-with")?.toLowerCase();
  if (xRequestedWith !== "xmlhttprequest") {
    return forbiddenResponse("Cabeçalho de segurança ausente na requisição.");
  }

  return null;
}

const UNSAFE_SEGMENT_PATTERN = /[\x00-\x1f\x7f/\\]|%2e|%2f|%5c/i;

export function validateProxyPath(
  segments: string[]
): { ok: true; normalizedPath: string } | { ok: false; response: NextResponse } {
  if (!Array.isArray(segments) || segments.length < 2 || segments[0] !== "v1") {
    return {
      ok: false,
      response: badRequestResponse("Caminho de API inválido."),
    };
  }

  for (const segment of segments) {
    if (
      !segment ||
      segment === "." ||
      segment === ".." ||
      UNSAFE_SEGMENT_PATTERN.test(segment) ||
      /^https?:/i.test(segment)
    ) {
      return {
        ok: false,
        response: badRequestResponse("Segmento de rota inválido."),
      };
    }
  }

  const normalizedPath = `/${segments.map((s) => encodeURIComponent(s)).join("/")}`;
  return { ok: true, normalizedPath };
}
