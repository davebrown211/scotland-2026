"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COURSES } from "@/data/courses";
import { useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="bg-[#1a3c2b] text-white shadow-lg sticky top-0 z-50">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Home */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-[#F5C842] text-2xl">⛳</span>
            <span className="font-serif text-xl font-semibold tracking-wide group-hover:text-[#F5C842] transition-colors">
              Scotland 2026
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" label="Home" active={pathname === "/"} />
            <NavLink href="/gallery" label="Gallery" active={isActive("/gallery")} />
            <NavLink href="/map" label="Map" active={isActive("/map")} />
            <NavLink href="/admin" label="Admin" active={isActive("/admin")} />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded hover:bg-[#2d6147]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white" />
          </button>
        </div>
      </div>

      {/* Course links row */}
      <div className="bg-[#143020] border-t border-white/10 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-0 min-w-max">
            {COURSES.map((course, i) => {
              const href = `/course/${course.slug}`;
              const active = isActive(href);
              return (
                <Link
                  key={course.slug}
                  href={href}
                  className={`flex flex-col items-center px-3 py-1.5 text-xs border-b-2 transition-colors whitespace-nowrap ${
                    active
                      ? "border-[#F5C842] text-[#F5C842]"
                      : "border-transparent text-white/70 hover:text-white hover:border-white/30"
                  }`}
                >
                  <span className="font-semibold">Round {i + 1}</span>
                  <span className="hidden sm:block opacity-80">
                    {course.name.replace(" Golf Course", "").replace(" Golf Links", "").replace(" Links", "")}
                  </span>
                  <span className="text-white/50">
                    {new Date(course.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1a3c2b] border-t border-white/10 px-4 py-2">
          <MobileNavLink href="/" label="Home" onClick={() => setMenuOpen(false)} />
          <MobileNavLink href="/gallery" label="Gallery" onClick={() => setMenuOpen(false)} />
          <MobileNavLink href="/map" label="Map" onClick={() => setMenuOpen(false)} />
          <MobileNavLink href="/admin" label="Admin" onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? "bg-[#F5C842] text-[#1a3c2b]"
          : "text-white/80 hover:text-white hover:bg-[#2d6147]"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block py-2 text-white/80 hover:text-white border-b border-white/10 last:border-0"
    >
      {label}
    </Link>
  );
}
