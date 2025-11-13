"use client";
import { useRef } from "react";
import Link from "next/link";
import { HeaderItem } from "../../types/menu";
import { usePathname } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/Style/style.css";
import "animate.css";

type SubMenuItem = {
  label: string;
  href: string;
  [key: string]: unknown;
};

const HeaderLink: React.FC<{
  item: HeaderItem;
  isFirst?: boolean;
  submenuOpenId: number | null;
  setSubmenuOpenId: React.Dispatch<React.SetStateAction<number | null>>;
  index: number;
}> = ({ item, submenuOpenId, setSubmenuOpenId, index }) => {
  const path = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const submenuOpen = submenuOpenId === index;
  const isParent = !!item.submenu;

  return (
    <div
      className="dropdown"
      ref={dropdownRef}
      onMouseEnter={() => isParent && setSubmenuOpenId(index)}
      onMouseLeave={() => isParent && setSubmenuOpenId(null)}
      tabIndex={-1}
      style={{ position: "relative" }}>
      {isParent ? (
        <span
          className={`btn btn-secondary dropdown-toggle${
            submenuOpen ? " btn-danger" : ""
          } menu-main-disabled`}
          role="button"
          aria-expanded={submenuOpen}
          tabIndex={-1}
          style={{
            cursor: "pointer",
            pointerEvents: "none",
            userSelect: "none",
          }}>
          {item.label}
        </span>
      ) : (
        <Link
          href={item.href}
          className={`btn btn-secondary ${
            path === item.href ? "btn-danger" : ""
          }`}>
          {item.label}
        </Link>
      )}

      {/* เมนูย่อย */}
      {isParent && (
        <ul
          className={`dropdown-menu ${submenuOpen ? "show" : ""}`}
          style={{ display: submenuOpen ? "block" : "none", zIndex: 1000 }}>
          {(item.submenu as SubMenuItem[] | undefined)?.map(
            (subItem: SubMenuItem, idx: number) => (
              <li key={idx}>
                <Link
                  href={subItem.href}
                  className={`dropdown-item${
                    submenuOpen ? " animate__animated animate__fadeInDown" : ""
                  }`}
                  style={{
                    ["--animate-duration" as any]: "160ms",
                    animationDelay: submenuOpen
                      ? `${idx * 0.015 + 0.005}s`
                      : "0s",
                  }}
                  onClick={() => {
                    setSubmenuOpenId(null);
                    if (document.activeElement instanceof HTMLElement)
                      document.activeElement.blur();
                  }}>
                  {subItem.label}
                </Link>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
};

export default HeaderLink;
