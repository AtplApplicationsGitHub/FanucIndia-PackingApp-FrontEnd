import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  role: string;
  [key: string]: unknown;
}

const ROLE_DASHBOARD_PATH: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  SALES: "/sales/dashboard",
  USER: "/user/dashboard",
  SUPER_ADMIN: "/super-admin/dashboard",
};

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/admin", "/sales", "/user", "/orders", "/super-admin"];

  if (!token) {
    if (protectedRoutes.some(path => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const userRole = decoded.role;
    const ownDashboard = ROLE_DASHBOARD_PATH[userRole] ?? "/login";

    // Role-based redirection logic
    if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL(ownDashboard, request.url));
    }
    if (pathname.startsWith("/sales") && userRole !== "SALES") {
      return NextResponse.redirect(new URL(ownDashboard, request.url));
    }
    if (pathname.startsWith("/user") && userRole !== "USER") {
      return NextResponse.redirect(new URL(ownDashboard, request.url));
    }
    if (pathname.startsWith("/super-admin") && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL(ownDashboard, request.url));
    }

  } catch {
    // If token is invalid, clear it and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/sales/:path*", "/user/:path*", "/orders/:path*", "/super-admin/:path*"],
};