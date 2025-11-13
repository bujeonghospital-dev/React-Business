import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Supported locales
const locales = ["th", "en"];
const defaultLocale = "th";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
