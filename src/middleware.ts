import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
    const isApiRoute = req.nextUrl.pathname.startsWith("/api")
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    const isHomePage = req.nextUrl.pathname === "/"

    // Allow public access to the home page
    if (isHomePage) {
      return null
    }

    // Handle auth error pages
    if (isAuthPage && !req.nextUrl.pathname.startsWith("/auth/error")) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/", req.url))
      }
      return null
    }

    // Protect API routes
    if (isApiRoute && !req.nextUrl.pathname.startsWith("/api/auth") && !isAuth) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Protect admin routes
    if (isAdminRoute && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return null
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Specify which routes to protect
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/((?!auth).)*", // Protect all API routes except /api/auth/*
    "/auth/:path*",
    "/upload",
    "/dashboard",
  ],
}