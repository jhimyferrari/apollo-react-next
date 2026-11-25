import type { NextRequest, NextResponse } from "next/server";
import { forwardToBackend } from "@/lib/bff/proxy";
import { validateProxyPath } from "@/lib/bff/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

async function handleProxy(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { path } = await context.params;
  const validation = validateProxyPath(path);

  if (!validation.ok) {
    return validation.response;
  }

  return forwardToBackend(request, validation.normalizedPath);
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PATCH = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
