// app/not-found.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function NotFound() {
  const [minH, setMinH] = useState<number>();

  const measure = useCallback(() => {
    const vv = (window as any).visualViewport;
    const vh = Math.round(vv?.height ?? window.innerHeight);

    const header = document.querySelector("header") as HTMLElement | null;
    const footer = document.querySelector("footer") as HTMLElement | null;

    const headerH = header?.getBoundingClientRect().height ?? 0;
    const footerH = footer?.getBoundingClientRect().height ?? 0;

    const h = Math.max(0, vh - headerH - footerH);
    setMinH(h);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [measure]);

  return (
    <section className="min-h-[80vh] grid place-items-center px-4 py-16">
      <div className="w-full max-w-4xl grid md:grid-cols-2 items-center gap-10">
        <div className="flex justify-center">
          <Image
            src="/images/404.svg"
            alt="404"
            width={320}
            height={340}
            className="object-contain"
            priority
          />
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Oops! The page you are looking for does not exist.
            <br />
            It might have been moved or deleted.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-blue-600 px-7 py-3 text-base font-semibold text-white shadow hover:bg-blue-700 transition"
          >
            Go To Home
          </Link>
        </div>
      </div>
    </section>
  );
}
