"use client";
import ScaledCanvas from "./ScaledCanvas";
import { usePathname } from "next/navigation";

export default function HomeBackground() {
  const path = usePathname();
  if (path !== "/") return null; // แสดงเฉพาะหน้า Home

  return (
    <ScaledCanvas>
      (
      <div className="home-bg" aria-hidden>
        {/* ถ้าต้องการฟิลเตอร์/ทับสีให้ใส่ overlay ได้ */}
        <div className="home-bg__overlay" />
      </div>
      )
    </ScaledCanvas>
  );
}
