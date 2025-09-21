import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;

  // Public routes (accessible without login)
  const publicPaths = ["/login", "/"];

  if (!token && !publicPaths.includes(req.nextUrl.pathname)) {
    // Not logged in → redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If logged in and trying to access login page → redirect to dashboard
  if (token && req.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Apply to specific routes only
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
