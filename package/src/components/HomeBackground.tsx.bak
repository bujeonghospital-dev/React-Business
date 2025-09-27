"use client";
import { usePathname } from "next/navigation";

export default function HomeBackground() {
  const path = usePathname();
  if (path !== "/") return null; // แสดงเฉพาะหน้า Home

  return (
    <div className="home-bg" aria-hidden>
      {/* ถ้าต้องการฟิลเตอร์/ทับสีให้ใส่ overlay ได้ */}
      <div className="home-bg__overlay" />
    </div>
  );
}
