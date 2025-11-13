// components/InvestorInfo/InvestorInfoGrid.jsx
"use client";
import React from "react";

const items = [
  {
    label: "ราคาหลักทรัพย์",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="11" width="4" height="7" rx="1" />
        <rect x="9" y="7" width="4" height="11" rx="1" />
        <rect x="15" y="3" width="4" height="15" rx="1" />
      </svg>
    ),
  },
  {
    label: "ข่าวแจ้งตลาดหลักทรัพย์",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="M8 10h8" />
        <path d="M8 14h4" />
      </svg>
    ),
  },
  {
    label: "ข้อมูลทางการเงิน",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 9h8M8 13h6M8 17h4" />
      </svg>
    ),
  },
  {
    label: "รายงานประจำปี",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h6" />
      </svg>
    ),
  },
  {
    label: "รายงานการพัฒนาอย่างยั่งยืน",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 3v18M9 6h6M9 18h6" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    label: "คำถามที่พบบ่อย",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 1 1 2.91 4v1" />
        <rect x="11" y="17" width="2" height="2" rx="1" />
      </svg>
    ),
  },
];

export default function InvestorInfoGrid() {
  return (
    <div className="investor-bg">
      <h2 className="investor-title">ข้อมูลสำหรับนักลงทุน</h2>
      <div className="investor-grid">
        {items.map((item, idx) => (
          <button type="button" key={idx} className="investor-btn">
            <span className="icon-bg">
              {React.cloneElement(item.icon, { className: "icon-svg" })}
            </span>
            <span className="label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
