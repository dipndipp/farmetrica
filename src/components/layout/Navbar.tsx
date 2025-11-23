"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Map", href: "/map" },
  { label: "Insight", href: "/insight" },
  { label: "About Us", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const prevPathnameRef = useRef(pathname);

  // Animate navbar on route change using CSS classes
  useEffect(() => {
    if (prevPathnameRef.current !== pathname && headerRef.current) {
      headerRef.current.classList.add("navbar-animate");
      const timer = setTimeout(() => {
        headerRef.current?.classList.remove("navbar-animate");
      }, 300);
      prevPathnameRef.current = pathname;
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest("header")) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header
      ref={headerRef}
      className="mb-10 rounded-2xl border border-white/50 bg-white/80 px-6 py-4 text-sm text-slate-900 shadow-lg shadow-slate-500/10 backdrop-blur transition-all duration-300 ease-in-out"
    >
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-base font-semibold transition-transform duration-200 hover:scale-105"
        >
          <div className="relative">
            <Image
              src="/farmetricaLogo.svg"
              alt="Farmetrica Logo"
              width={200}
              height={20}
              className="object-contain"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3 text-[var(--muted)]">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === "/" && (pathname === "/home" || pathname === "/"));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-full px-4 py-2 transition-all duration-300 ease-in-out relative ${
                  isActive
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[rgba(0,168,107,0.25)] scale-105"
                    : "hover:bg-white hover:text-slate-900 hover:scale-105"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Burger Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-6 bg-slate-700 transition-all duration-300 ${
              isMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-slate-700 transition-all duration-300 ${
              isMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-slate-700 transition-all duration-300 ${
              isMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <nav
        className={`md:hidden mt-4 overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-2 py-2">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === "/" && (pathname === "/home" || pathname === "/"));
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-base font-medium transition-all duration-300 ease-in-out ${
                  isActive
                    ? "bg-[var(--accent)] text-white shadow-md shadow-[rgba(0,168,107,0.25)] scale-105"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
