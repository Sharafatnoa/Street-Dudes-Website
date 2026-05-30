'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';

/**
 * LanguageToggle renders SV / EN buttons to switch the active locale.
 *
 * WHY: Delivers premium accessible locale switching using next-intl router transitions.
 */
export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations('a11y');
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (nextLocale: 'sv' | 'en') => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <div
      className="flex gap-1.5 items-center bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full shadow-inner"
      aria-label={t('languageToggle')}
    >
      <button
        onClick={() => switchLocale('sv')}
        className={`px-1.5 py-0.5 text-xs font-bold font-display uppercase tracking-wider transition-colors duration-200 focus:outline-none ${
          locale === 'sv' ? 'text-[#F5A500]' : 'text-zinc-500 hover:text-zinc-300'
        }`}
        aria-label="Svenska"
      >
        SV
      </button>
      <span className="text-zinc-800 text-xs">|</span>
      <button
        onClick={() => switchLocale('en')}
        className={`px-1.5 py-0.5 text-xs font-bold font-display uppercase tracking-wider transition-colors duration-200 focus:outline-none ${
          locale === 'en' ? 'text-[#F5A500]' : 'text-zinc-500 hover:text-zinc-300'
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
