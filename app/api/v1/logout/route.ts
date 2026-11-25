import { NextResponse, type NextRequest } from "next/server";
import { getApiInternalUrl } from "@/lib/bff/config";
import {
  clearAuthTokenCookie,
  getAuthTokenFromRequest,
} from "@/lib/bff/cookies";
import { buildUpstreamHeaders, NO_CACHE_HEADERS } from "@/lib/bff/proxy";
import { validateCsrfRequest } from "@/lib/bff/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const csrfError = validateCsrfRequest(request);
  if (csrfError) {
    return csrfError;
  }

  const token = getAuthTokenFromRequest(request);

  if (token) {
    try {
      await fetch(`${getApiInternalUrl()}/v1/logout`, {
        method: "POST",
        headers: buildUpstreamHeaders(request, token),
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
    } catch {
      // Falha ao revogar no upstream não impede a limpeza determinística do cookie no navegador
    }
  }

  const response = new NextResponse(null, {
    status: 204,
    headers: NO_CACHE_HEADERS,
  });
  clearAuthTokenCookie(response);

  return response;
}
