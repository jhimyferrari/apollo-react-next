import { NextResponse } from "next/server";
import { clearAuthTokenCookie } from "@/lib/bff/cookies";
import { NO_CACHE_HEADERS } from "@/lib/bff/proxy";
import { fetchServerSession } from "@/lib/bff/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const session = await fetchServerSession();

  if (session.transientError) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        transientError: true,
      },
      { status: 503, headers: NO_CACHE_HEADERS }
    );
  }

  const response = NextResponse.json(
    {
      authenticated: session.authenticated,
      user: session.user,
    },
    { status: 200, headers: NO_CACHE_HEADERS }
  );

  if (session.invalidToken) {
    clearAuthTokenCookie(response);
  }

  return response;
}
