"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/components/LoadingContext";

/**
 * แสดง loader เมื่อ "กำลังจะ" นำทาง (คลิก <a>, กด Back/Forward)
 * และซ่อนเมื่อ URL เปลี่ยน (pathname/search) พร้อม minDuration กันกระพริบ
 */
export default function NavProgress({
  minDuration = 300,
  killMs = 10000,
}: {
  minDuration?: number;
  killMs?: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showLoading, hideLoading } = useLoading();
  const minTimer = useRef<NodeJS.Timeout | null>(null);
  const killTimer = useRef<NodeJS.Timeout | null>(null);

  // เรียกตอน "เริ่มจะไปหน้าใหม่"
  useEffect(() => {
    const showNow = () => {
      showLoading();
      if (killTimer.current) clearTimeout(killTimer.current);
      // กันค้างหากนำทางล้มเหลว
      killTimer.current = setTimeout(hideLoading, killMs);
    };

    // ดักคลิก link ภายในเว็บ (capture เพื่อมาก่อน Next จัดการ)
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return; // เฉพาะซ้าย
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // เปิดแท็บใหม่/ฯลฯ
      let el = e.target as HTMLElement | null;
      while (el && el.tagName !== "A") el = el.parentElement;
      if (!el) return;

      const a = el as HTMLAnchorElement;
      if (a.target && a.target !== "_self") return;
      const href = a.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return; // ข้ามโดเมนไม่ต้องโชว์

      const current = window.location.pathname + window.location.search;
      const nextPath = url.pathname + url.search;
      if (current === nextPath) return; // ลิงก์ไปที่เดิม

      showNow();
    };

    // ดัก Back/Forward
    const onPopState = () => showNow();

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [showLoading, hideLoading, killMs]);

  // ซ่อนหลัง URL เปลี่ยน (ถือเป็น "นำทางเสร็จ")
  useEffect(() => {
    if (minTimer.current) clearTimeout(minTimer.current);
    minTimer.current = setTimeout(() => hideLoading(), minDuration);
    return () => {
      if (minTimer.current) clearTimeout(minTimer.current);
    };
  }, [pathname, searchParams, hideLoading, minDuration]);

  return null;
}
