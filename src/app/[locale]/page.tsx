import React from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/Navbar';
import { MenuPage } from '@/components/MenuPage';
import { Footer } from '@/components/layout/Footer';

import { getConfig } from '@/lib/getConfig';

type PageProps = {
  params: { locale: string };
};

/**
 * HomePage renders the root landing, header navigation, hero details, and menu presentation.
 *
 * @param props - Page route params including locale.
 *
 * WHY: Orchestrates the core landing layout without housing internal component logic.
 */
export default async function HomePage({ params: { locale } }: PageProps) {
  // Enable localization context for page rendering
  setRequestLocale(locale);

  const t = await getTranslations({ locale });
  let onlineOrderingEnabled = true;
  try {
    const config = await getConfig();
    onlineOrderingEnabled = config.onlineOrderingEnabled;
  } catch {
    // Default to true if config fetch fails
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Sticky Main Header Navigation */}
      <Navbar onlineOrderingEnabled={onlineOrderingEnabled} />

      {/* Hero Presentation Header */}
      <section className="bg-zinc-950/40 border-b border-zinc-900/50 pt-20 pb-8 px-4 text-center flex flex-col justify-center items-center gap-6">
        <h1
          className="font-display font-bold text-[#F5A500] tracking-[5px] leading-[0.88] uppercase select-none flex flex-col items-center"
          style={{ fontSize: 'clamp(64px, 10vw, 96px)' }}
        >
          <span>STREET</span>
          <span>DUDES</span>
        </h1>

        <div className="flex flex-col items-center gap-4">
          <h2
            className="text-lg md:text-xl font-bold tracking-tight text-zinc-400 font-body max-w-2xl italic"
            data-testid="hero-tagline"
          >
            {t('hero.tagline')}
          </h2>
          <hr className="w-[160px] h-[1px] bg-[#F5A500] border-none opacity-50" />
        </div>

        <div className="border border-[rgba(245,165,0,0.4)] py-[6px] px-[20px] font-display text-[rgba(245,165,0,0.6)] uppercase tracking-[2px] rounded-[4px] select-none">
          {t('hero.loveBadge')}
        </div>
      </section>

      {/* Main Menu Page Coordinator Layer */}
      <div className="py-4 flex-grow">
        <MenuPage />
      </div>

      {/* Localized Location & Contacts Footer */}
      <Footer />
    </main>
  );
}
