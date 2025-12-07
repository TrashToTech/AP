// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const pathname = request.nextUrl.pathname;

  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/member")

  const isProtected =
    pathname.startsWith("/ai")

  // 보호 페이지인데 refresh 토큰 없으면 → 홈으로 리다이렉트
  if (isProtected && !refreshToken) {
    return NextResponse.redirect(new URL("/member/login", request.url));
  }

  // 홈("/")인데 refresh 토큰 있으면 → /ai/script 페이지로
  if (pathname === "/" && refreshToken) {
    return NextResponse.redirect(new URL("/ai/script", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/ai/:path*"
  ],
};
