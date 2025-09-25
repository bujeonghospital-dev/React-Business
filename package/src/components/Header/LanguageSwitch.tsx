// components/Header/LanguageSwitch.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const SUPPORTED = ["th", "en"] as const;
type Locale = (typeof SUPPORTED)[number];

function normalize(path: string) {
  const p = path.startsWith("/") ? path : "/" + path;
  // Remove trailing slash (except for "/")
  return p.replace(/\/+$/g, "") || "/";
}

function getLocale(path: string): Locale | null {
  const seg = path.split("/")[1];
  return (SUPPORTED as readonly string[]).includes(seg)
    ? (seg as Locale)
    : null;
}

function withLocale(path: string, locale: Locale) {
  const clean = normalize(path);
  const parts = clean.split("/");
  // If locale prefix exists -> replace
  if (SUPPORTED.includes(parts[1] as Locale)) {
    parts[1] = locale;
    const joined = parts.join("/");
    return joined || `/${locale}`;
  }
  // If no locale prefix -> add it
  return `/${locale}${clean === "/" ? "" : clean}`;
}

export default function LanguageSwitch({
  className = "",
}: {
  className?: string;
}) {
  const pathname = usePathname() || "/";
  const current = getLocale(pathname);
  const thHref = withLocale(pathname, "th");
  const enHref = withLocale(pathname, "en");

  return (
    <div className={`flex items-center ${className}`}>
      {/* Desktop view (1600px+) with text */}
      <div className="hidden [@media(min-width:1600px)]:flex gap-3 items-center">
        <Link
          href={enHref}
          aria-current={current === "en" ? "true" : undefined}
          className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 ${
            current === "en" ? "opacity-60 pointer-events-none" : ""
          }`}>
          <Image
            src="/images/icons/us.svg"
            width={20}
            height={14}
            alt="English"
            className="w-5 h-auto"
          />
          <span className="text-xs font-medium">English</span>
        </Link>

        <span className="text-gray-300">|</span>

        <Link
          href={thHref}
          aria-current={current === "th" ? "true" : undefined}
          className={`flex items-center gap-1.5 transition-opacity hover:opacity-80 ${
            current === "th" ? "opacity-60 pointer-events-none" : ""
          }`}>
          <Image
            src="/images/icons/th.svg"
            width={20}
            height={14}
            alt="Thai"
            className="w-5 h-auto"
          />
          <span className="text-xs font-medium">ไทย</span>
        </Link>
      </div>

      {/* Mobile/Tablet view (<1600px) - compact flags only */}
      <div className="flex [@media(min-width:1600px)]:hidden gap-2 items-center">
        <Link
          href={enHref}
          aria-current={current === "en" ? "true" : undefined}
          className={`transition-opacity hover:opacity-80 p-1 ${
            current === "en" ? "opacity-50 pointer-events-none" : ""
          }`}
          aria-label="Switch to English">
          <Image
            src="/images/icons/us.svg"
            width={20}
            height={14}
            alt="EN"
            className="w-5 h-auto"
          />
        </Link>

        <span className="text-gray-300 text-xs">|</span>

        <Link
          href={thHref}
          aria-current={current === "th" ? "true" : undefined}
          className={`transition-opacity hover:opacity-80 p-1 ${
            current === "th" ? "opacity-50 pointer-events-none" : ""
          }`}
          aria-label="Switch to Thai">
          <Image
            src="/images/icons/th.svg"
            width={20}
            height={14}
            alt="TH"
            className="w-5 h-auto"
          />
        </Link>
      </div>
    </div>
  );
}
