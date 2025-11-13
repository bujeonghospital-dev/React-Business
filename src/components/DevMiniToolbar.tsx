"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type MenuItem =
  | { type: "link"; label: string; href: string; right?: string }
  | { type: "action"; label: string; onClick: () => void; right?: string }
  | { type: "submenu"; label: string; items: MenuItem[] };

interface DevMiniToolbarProps {
  position?: "bottom-left" | "bottom-right";
  storageKey?: string; // key สำหรับจำค่าเปิด/ปิด
  items?: MenuItem[];
}

const DevMiniToolbar: React.FC<DevMiniToolbarProps> = ({
  position = "bottom-left",
  storageKey = "dev_toolbar_visible",
  items,
}) => {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [submenuIndex, setSubmenuIndex] = useState<number | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const path = usePathname();

  // ปิดเมนูเมื่อเปลี่ยน route
  useEffect(() => {
    setOpen(false);
    setSubmenuIndex(null);
  }, [path]);

  // โหลดสถานะแสดง/ซ่อนจาก localStorage
  useEffect(() => {
    const v = localStorage.getItem(storageKey);
    if (v === "hidden") setHidden(true);
  }, [storageKey]);

  // กดข้างนอกเพื่อปิด
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
      setSubmenuIndex(null);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // คีย์ลัด toggle (Ctrl+;)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === ";") {
        e.preventDefault();
        setHidden((h) => {
          const next = !h;
          localStorage.setItem(storageKey, next ? "hidden" : "visible");
          return next;
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [storageKey]);

  const defaultItems: MenuItem[] = [
    {
      type: "action",
      label: "Route",
      onClick: () => alert(`Route: ${path}`),
      right: "Static",
    },
    {
      type: "submenu",
      label: "Try Turbopack",
      items: [
        {
          type: "action",
          label: "Enable (mock)",
          onClick: () => alert("Enabled (mock)"),
        },
        {
          type: "action",
          label: "Docs",
          onClick: () => window.open("https://nextjs.org/docs", "_blank"),
        },
      ],
    },
    {
      type: "submenu",
      label: "Preferences",
      items: [
        {
          type: "action",
          label: "Hide Toolbar",
          onClick: () => {
            setHidden(true);
            localStorage.setItem(storageKey, "hidden");
          },
        },
        {
          type: "action",
          label: "Reset Position (mock)",
          onClick: () => alert("Position reset"),
        },
      ],
    },
  ];

  const data = items ?? defaultItems;

  if (hidden) return null;

  const containerPos =
    position === "bottom-left" ? "left-4 bottom-4" : "right-4 bottom-4";

  return (
    <div className={`fixed ${containerPos} z-[9999] select-none`}>
      {/* ปุ่มลอย */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-12 h-12 rounded-full shadow-lg border bg-white/90 backdrop-blur
                   flex items-center justify-center text-sm font-bold hover:shadow-xl
                   transition focus:outline-none"
        title="Dev Toolbar (Ctrl+; เพื่อซ่อน/แสดง)"
      >
        N
      </button>

      {/* เมนู */}
      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="mt-2 w-64 rounded-xl border bg-white shadow-xl overflow-hidden"
        >
          {data.map((item, idx) => {
            if (item.type === "link") {
              return (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                >
                  <span>{item.label}</span>
                  {item.right && (
                    <span className="text-gray-500 text-sm">{item.right}</span>
                  )}
                </a>
              );
            }
            if (item.type === "action") {
              return (
                <button
                  key={idx}
                  onClick={() => {
                    item.onClick();
                    setOpen(false);
                    setSubmenuIndex(null);
                  }}
                  className="w-full text-left flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                >
                  <span>{item.label}</span>
                  {item.right && (
                    <span className="text-gray-500 text-sm">{item.right}</span>
                  )}
                </button>
              );
            }
            // submenu
            return (
              <div key={idx} className="relative">
                <button
                  onClick={() =>
                    setSubmenuIndex(submenuIndex === idx ? null : idx)
                  }
                  className="w-full text-left flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                >
                  <span>{item.label}</span>
                  <span>›</span>
                </button>
                {submenuIndex === idx && (
                  <div
                    className={`absolute top-0 ${
                      position === "bottom-left"
                        ? "left-full ml-2"
                        : "right-full mr-2"
                    } w-60 rounded-xl border bg-white shadow-xl`}
                  >
                    {item.items.map((sub, sidx) =>
                      sub.type === "action" ? (
                        <button
                          key={sidx}
                          onClick={() => {
                            sub.onClick();
                            setOpen(false);
                            setSubmenuIndex(null);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50"
                        >
                          {sub.label}
                        </button>
                      ) : sub.type === "link" ? (
                        <a
                          key={sidx}
                          href={sub.href}
                          target="_blank"
                          rel="noreferrer"
                          className="block px-3 py-2 hover:bg-gray-50"
                        >
                          {sub.label}
                        </a>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DevMiniToolbar;
