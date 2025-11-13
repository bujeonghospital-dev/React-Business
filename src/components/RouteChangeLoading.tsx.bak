"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/components/LoadingContext";

/**
 * แสดง Loader สั้น ๆ ทุกครั้งที่มีการเปลี่ยนเส้นทาง (pathname หรือ query)
 * ปรับ minDuration เพื่อกันอาการกระพริบของ overlay
 */
export default function RouteChangeLoading({
  minDuration = 250,
}: {
  minDuration?: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showLoading, hideLoading } = useLoading();
  const tRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // เริ่มโชว์โหลดทันทีเมื่อเส้นทางเปลี่ยน (จะทำงานหลัง route commit)
    showLoading();

    // ให้แสดงอย่างน้อย minDuration ms กันกระพริบ
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => {
      hideLoading();
      tRef.current = null;
    }, minDuration);

    return () => {
      if (tRef.current) {
        clearTimeout(tRef.current);
        tRef.current = null;
      }
    };
    // รวม searchParams เพื่อให้จับ query string ด้วย
  }, [pathname, searchParams, showLoading, hideLoading, minDuration]);

  return null;
}
