import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  role: string;
  [key: string]: unknown;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/admin", "/sales", "/user", "/orders"];

  // If there's no token, redirect any protected route to login
  if (!token) {
    if (protectedRoutes.some(path => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const userRole = decoded.role;

    // Role-based redirection logic
    if (pathname.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
    }
    if (pathname.startsWith("/sales") && userRole !== "sales") {
      return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
    }
    if (pathname.startsWith("/user") && userRole !== "user") {
      return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
    }

  } catch (error) {
    // If token is invalid, clear it and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/sales/:path*", "/user/:path*", "/orders/:path*"],
};
