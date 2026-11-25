import { NextResponse, type NextRequest } from "next/server";
import { clearAuthTokenCookie } from "@/lib/bff/cookies";
import { NO_CACHE_HEADERS } from "@/lib/bff/proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.redirect(new URL("/login", request.url));

  for (const [key, value] of Object.entries(NO_CACHE_HEADERS)) {
    response.headers.set(key, value);
  }

  clearAuthTokenCookie(response);
  return response;
}
