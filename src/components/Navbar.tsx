'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { LanguageToggle } from './ui/LanguageToggle';
import Link from 'next/link';

type NavbarProps = {
  onlineOrderingEnabled?: boolean;
};

/**
 * Navbar component providing sticky primary header navigation, language toggle, and ORDER ONLINE action button.
 *
 * WHY: Delivers Phase 1 central header navigation layout linking to the dedicated order page.
 */
export function Navbar({ onlineOrderingEnabled = true }: NavbarProps) {
  const t = useTranslations();
  const locale = useLocale();

  // Navigation target mappings scrolling to corresponding sections
  const navLinks = [
    { id: 'burgers', label: t('menu.categories.burgers') },
    { id: 'tacos-burritos', label: t('menu.categories.tacosBurritos') },
    { id: 'bowls', label: t('menu.categories.bowls') },
    { id: 'sides', label: t('menu.categories.sides') },
  ];

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0b0b0b] border-b border-zinc-900 py-4 px-6 shadow-xl">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo - Left */}
        <div className="flex items-center">
          <Link
            href={`/${locale}`}
            className="text-2xl font-extrabold tracking-wider text-[#F5A500] font-display uppercase"
          >
            STREET DUDES
          </Link>
        </div>

        {/* Central Nav Links - Hidden on mobile (< md), visible on desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleScroll(link.id)}
              className="font-body text-xs font-normal uppercase tracking-widest text-white/55 hover:text-white/90 transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Action Controls - Right */}
        <div className="flex items-center gap-4">
          <LanguageToggle />
          {onlineOrderingEnabled && (
            <Link
              href={`/${locale}/order`}
              className="bg-brand-gold text-brand-black px-4 py-2 font-display text-sm uppercase tracking-widest rounded-sm hover:bg-yellow-400 transition-colors font-bold whitespace-nowrap"
            >
              {t('nav.orderOnline')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
