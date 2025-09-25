// components/Header/index.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Header/Logo";
import HeaderLink from "@/components/Navigation/HeaderLink";
import { headerData } from "@/components/Navigation/menuData";
import { usePathname } from "next/navigation";
import DrawerMenu from "@/components/Navigation/DrawerMenu";
import LanguageSwitch from "@/components/Header/LanguageSwitch";

const Header = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [submenuOpenId, setSubmenuOpenId] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const path = usePathname();

  useEffect(() => {
    setSubmenuOpenId(null);
    setNavbarOpen(false);
  }, [path]);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!navbarOpen) return;
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setNavbarOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavbarOpen(false);
    };
    if (navbarOpen) {
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [navbarOpen]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = navbarOpen ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [navbarOpen]);

  const menu1 = headerData.slice(0, 4);
  const menu2 = headerData.slice(4);

  return (
    <header
      data-site-header
      className={[
        "fixed top-0 left-0 right-0 z-50 isolate",
        "bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
        "after:content-[''] after:absolute after:inset-x-0",
        "after:-bottom-2 after:h-2 sm:after:-bottom-3 sm:after:h-3 md:after:-bottom-4 md:after:h-4",
        "after:pointer-events-none",
        "after:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0)_65%)]",
        "dark:after:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.30)_0%,rgba(0,0,0,0)_60%)]",
        "transition-[box-shadow] duration-300",
        scrolled ? "shadow-md" : "",
      ].join(" ")}>
      <div className="w-full">
        {/* Language Switcher Top Bar */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-screen-2xl mx-auto px-3 md:px-4 lg:px-6 py-0.5">
            <div className="flex justify-end">
              <LanguageSwitch className="lang-top" />
            </div>
          </div>
        </div>

        {/* Main Navigation Container */}
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center h-12 md:h-14 lg:h-16 px-3 md:px-4 lg:px-6">
            {/* Desktop Left Navigation - Hidden on mobile/tablet */}
            <nav className="hidden xl:flex flex-1 justify-end gap-1 xl:gap-2 2xl:gap-3 min-w-0 items-center">
              {menu1.map((item, i) => (
                <HeaderLink
                  key={i}
                  item={item}
                  index={i}
                  submenuOpenId={submenuOpenId}
                  setSubmenuOpenId={setSubmenuOpenId}
                  // className="text-sm lg:text-base"
                />
              ))}
            </nav>

            {/* Logo - Always visible, size responsive */}
            <div className="flex-1 xl:flex-none flex items-center xl:px-4 2xl:px-8">
              <Logo className="w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px] xl:w-[190px] h-auto" />
            </div>

            {/* Desktop Right Navigation - Hidden on mobile/tablet */}
            <nav className="hidden xl:flex flex-1 justify-start gap-1 xl:gap-2 2xl:gap-3 min-w-0 items-center">
              {menu2.map((item, i) => {
                const index = i + menu1.length;
                return (
                  <HeaderLink
                    key={index}
                    item={item}
                    index={index}
                    submenuOpenId={submenuOpenId}
                    setSubmenuOpenId={setSubmenuOpenId}
                    // className="text-sm lg:text-base"
                  />
                );
              })}
            </nav>

            {/* Mobile/Tablet Hamburger Menu */}
            <button
              className="flex xl:hidden p-2 -mr-1"
              onClick={() => setNavbarOpen((prev) => !prev)}
              aria-label={navbarOpen ? "Close menu" : "Open menu"}
              aria-expanded={navbarOpen}>
              <i className="bi bi-list text-2xl md:text-3xl"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <DrawerMenu
        ref={mobileMenuRef}
        isOpen={navbarOpen}
        onClose={() => setNavbarOpen(false)}
        items={headerData}
      />
    </header>
  );
};

export default Header;
