"use client";

import React, { forwardRef, useEffect, useRef } from "react";
import Link from "next/link";
import "./TopMenu.css";

type SubItem = { label: string; href: string };
type MenuItem = { label: string; href?: string; submenu?: SubItem[] };

type TopMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
};

const TopMenu = forwardRef<HTMLDivElement, TopMenuProps>(
  ({ isOpen, onClose, items }, extRef) => {
    const panelRef = useRef<HTMLDivElement>(null);

    // sync external ref
    const setRefs = (el: HTMLDivElement | null) => {
      panelRef.current = el;
      if (typeof extRef === "function") {
        extRef(el);
      } else if (extRef && "current" in (extRef as any)) {
        (extRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }
    };

    // reset state when close
    useEffect(() => {
      if (isOpen) return;
      const root = panelRef.current;
      if (!root) return;
      root
        .querySelectorAll("details[open]")
        .forEach((d) => d.removeAttribute("open"));
      (root.querySelector(".tmenu-nav") as HTMLElement | null)?.scrollTo({
        top: 0,
        behavior: "auto",
      });
      (document.activeElement as HTMLElement | null)?.blur?.();
    }, [isOpen]);

    // open-one-at-a-time accordion
    useEffect(() => {
      const root = panelRef.current;
      if (!root) return;
      const detailsEls = Array.from(
        root.querySelectorAll<HTMLDetailsElement>(".tmenu-details")
      );
      const onToggle = (e: Event) => {
        const cur = e.currentTarget as HTMLDetailsElement;
        if (cur.open)
          detailsEls.forEach(
            (d) => d !== cur && d.open && d.removeAttribute("open")
          );
      };
      detailsEls.forEach((d) => d.addEventListener("toggle", onToggle));
      return () =>
        detailsEls.forEach((d) => d.removeEventListener("toggle", onToggle));
    }, [isOpen, items]);

    // ESC + lock body scroll
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      if (isOpen) {
        document.addEventListener("keydown", onKey);
        document.body.classList.add("overflow-hidden");
      }
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.classList.remove("overflow-hidden");
      };
    }, [isOpen, onClose]);

    return (
      <>
        {/* Backdrop */}
        <div
          aria-hidden="true"
          onClick={onClose}
          className={`tmenu-backdrop transition-opacity duration-300 ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        />

        {/* Top sheet panel */}
        <div
          ref={setRefs}
          className={`tmenu-panel fixed inset-x-0 top-0 z-[9999] transition-transform duration-300 ${
            isOpen ? "translate-y-0" : "-translate-y-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="เมนู">
          <div className="grid h-[100dvh] grid-rows-[auto_1fr_auto]">
            {/* Header */}
            <div className="tmenu-header">
              <h2 className="tmenu-title">เมนู</h2>
              <button
                onClick={onClose}
                aria-label="ปิดเมนู"
                className="tmenu-close">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Nav */}
            <nav className="tmenu-nav">
              {items.map((item, i) => (
                <div
                  key={i}
                  className={isOpen ? "tmenu-anim" : ""}
                  style={
                    isOpen ? { animationDelay: `${i * 60 + 80}ms` } : undefined
                  }>
                  {item.submenu ? (
                    <details className="tmenu-details">
                      <summary className="group">
                        <span>{item.label}</span>
                        <svg
                          className="tmenu-chev"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          aria-hidden="true">
                          <path
                            d="M6 9l6 6 6-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                          />
                        </svg>
                      </summary>

                      <div className="tmenu-sub">
                        <div className="tmenu-sub-inner">
                          <ul className="space-y-1.5 pl-2">
                            {item.submenu.map((sub, j) => (
                              <li key={j}>
                                <Link
                                  href={sub.href}
                                  onClick={onClose}
                                  className={`tmenu-item ${
                                    isOpen ? "tmenu-anim" : ""
                                  }`}
                                  style={
                                    isOpen
                                      ? {
                                          animationDelay: `${
                                            (i + j + 1) * 50 + 120
                                          }ms`,
                                        }
                                      : undefined
                                  }>
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </details>
                  ) : item.href ? (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="tmenu-item">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="tmenu-item">{item.label}</span>
                  )}
                </div>
              ))}
            </nav>

            {/* Footer: language */}
            <div
              className="tmenu-lang tmenu-anim"
              style={isOpen ? { animationDelay: "120ms" } : undefined}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">
                  Language
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href="/th"
                    onClick={onClose}
                    className="px-2 py-1.5 rounded-md text-[13px] font-medium hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                    TH
                  </Link>
                  <Link
                    href="/en"
                    onClick={onClose}
                    className="px-2 py-1.5 rounded-md text-[13px] font-medium hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                    EN
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);

TopMenu.displayName = "TopMenu";
export default TopMenu;
