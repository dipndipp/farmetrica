"use client";

import { useState } from "react";
import Image from "next/image";

const links = [
  { label: "Dashboard", href: "#" },
  { label: "Map", href: "#" },
  { label: "Insight", href: "#" },
  { label: "Contact", href: "#" },
];

export function Navbar() {
  const [active, setActive] = useState("Dashboard");

  return (
    <header className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/50 bg-white/80 px-6 py-4 text-sm text-slate-900 shadow-lg shadow-slate-500/10 backdrop-blur">
      <div className="flex items-center gap-3 text-base font-semibold">
        <div className="relative">
          <Image
            src="/farmetricaLogo.svg"
            alt="Farmetrica Logo"
            width={200}
            height={20}
            className="object-contain"
          />
        </div>
      </div>
      <nav className="flex flex-wrap items-center gap-3 text-[var(--muted)]">
        {links.map((link) => (
          <button
            key={link.label}
            onClick={() => setActive(link.label)}
            className={`rounded-full px-4 py-2 transition ${
              active === link.label
                ? "bg-[var(--accent)] text-white shadow-lg shadow-[rgba(0,168,107,0.25)]"
                : "hover:bg-white hover:text-slate-900"
            }`}
          >
            {link.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
