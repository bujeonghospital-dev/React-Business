import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// Supported locales
const locales = ["th", "en"];
const defaultLocale = "th";
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Check authentication for protected routes
  const token = request.cookies.get("authToken")?.value;

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/register", "/forgot-password", "/"];

  const isPublicPath =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/downloads") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/share/video") || // LINE video share pages (public)
    pathname.includes(".");

  // If accessing any path without token (except public paths), redirect to login
  if (!isPublicPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and trying to access login page, redirect to home
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/home", request.url));
  }
  // ตรวจสอบว่า URL มี locale prefix หรือไม่
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (pathnameHasLocale) {
    // ถ้ามี locale prefix (เช่น /th/contact-inquiry)
    // ให้ rewrite ไปยัง path จริงโดยไม่มี locale prefix
    const locale = pathname.split("/")[1];
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    // Rewrite URL
    const url = request.nextUrl.clone();
    url.pathname = pathWithoutLocale;
    // เก็บ locale ไว้ใน header
    const response = NextResponse.rewrite(url);
    response.headers.set("x-locale", locale);
    return response;
  }
  // ถ้าไม่มี locale prefix ให้ทำงานปกติ
  return NextResponse.next();
}
export const config = {
  // กำหนด path ที่ต้องการให้ middleware ทำงาน
  matcher: [
    // ไม่รวม static files และ API routes
    "/((?!api|_next/static|_next/image|favicon.ico|images|downloads|TPP.ico).*)",
  ],
};
