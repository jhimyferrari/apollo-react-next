import { NextResponse, type NextRequest } from "next/server";
import { getTokenCookieName } from "@/lib/bff/config";

const PUBLIC_ROUTES = new Set(["/login", "/register-organization"]);

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(
    request.cookies.get(getTokenCookieName())?.value
  );

  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  if (!isPublicRoute && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
