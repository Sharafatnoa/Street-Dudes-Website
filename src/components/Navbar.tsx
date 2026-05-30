'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { LanguageToggle } from './ui/LanguageToggle';
import { OrderButton } from './OrderButton';

/**
 * Navbar component providing sticky primary header navigation and branding controls.
 *
 * WHY: Delivers central header responsive layout anchoring major viewport actions.
 */
export function Navbar() {
  const t = useTranslations();

  // Navigation target mappings scrolling to corresponding sections
  const navLinks = [
    { id: 'burgers', label: t('menu.burgers.title') },
    { id: 'tacosAndBurritos', label: t('menu.tacosAndBurritos.title') },
    { id: 'bowls', label: t('menu.bowls.title') },
    { id: 'sides', label: t('menu.sides.title') },
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
          <h1 className="text-2xl font-extrabold tracking-wider text-[#F5A500] font-display uppercase">
            STREET DUDES
          </h1>
        </div>

        {/* Central Nav Links - Hidden on mobile (< md), visible on desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleScroll(link.id)}
              className="text-xs font-bold text-zinc-400 hover:text-[#F5A500] tracking-wider font-display uppercase transition-colors focus:outline-none"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Action Controls - Right */}
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <div className="scale-90 md:scale-100 transform origin-right">
            <OrderButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
