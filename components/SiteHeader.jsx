'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SECTIONS } from '../lib/sections';

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (slug) => pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
  const linkClass = (active) =>
    `text-sm font-medium transition ${active ? 'text-[#2F241D] underline underline-offset-4 decoration-2' : 'text-[#4A3B32] hover:text-[#2F241D]'}`;

  return (
    <header className="sticky top-0 z-50 bg-[#FF9CCB] border-b border-[#EFECE6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3">
          <img src="/logo.png" alt="L'Atelier de l'Aloès" className="h-16 w-auto object-cover rounded-xl shadow-xs" />
        </Link>

        {/* Menu desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {SECTIONS.map((s) => (
            <Link key={s.slug} href={`/${s.slug}`} className={linkClass(isActive(s.slug))}>
              {s.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="text-sm font-semibold bg-[#5A3E36] hover:bg-[#4A3B32] text-white px-4 py-2 rounded-xl transition"
          >
            Contact
          </Link>
        </nav>

        {/* Bouton burger mobile */}
        <button
          type="button"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="md:hidden w-11 h-11 rounded-xl bg-white/60 flex items-center justify-center text-[#5A3E36] text-xl"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <nav className="md:hidden bg-[#FF9CCB] border-t border-[#EFECE6] px-4 py-4 flex flex-col gap-3">
          {SECTIONS.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              onClick={() => setOpen(false)}
              className={`${linkClass(isActive(s.slug))} py-1`}
            >
              {s.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="text-sm font-semibold bg-[#5A3E36] text-white px-4 py-2.5 rounded-xl text-center"
          >
            Contact
          </Link>
        </nav>
      )}
    </header>
  );
}
