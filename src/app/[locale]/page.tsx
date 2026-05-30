import React from 'react';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/Navbar';
import { MenuPage } from '@/components/MenuPage';
import { Footer } from '@/components/layout/Footer';

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
export default function HomePage({ params: { locale } }: PageProps) {
  // Enable localization context for page rendering
  setRequestLocale(locale);

  const t = useTranslations();

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Sticky Main Header Navigation */}
      <Navbar />

      {/* Hero Presentation Header */}
      <section className="bg-zinc-950/40 border-b border-zinc-900/50 py-20 px-4 text-center flex flex-col justify-center items-center gap-6">
        <h1
          className="font-display font-bold text-[#F5A500] tracking-[5px] leading-[0.88] uppercase select-none flex flex-col items-center"
          style={{ fontSize: 'clamp(64px, 10vw, 96px)' }}
        >
          <span>STREET</span>
          <span>DUDES</span>
        </h1>

        <h2
          className="text-lg md:text-xl font-bold tracking-tight text-zinc-400 font-body max-w-2xl"
          data-testid="hero-tagline"
        >
          {t('hero.tagline')}
        </h2>

        <hr className="w-[160px] h-[1px] bg-[#F5A500] border-none opacity-50 mx-auto" />
      </section>

      {/* Main Menu Page Coordinator Layer */}
      <div className="py-12 flex-grow">
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <h2 className="text-3xl font-bold font-display uppercase tracking-wider text-white border-b border-zinc-800 pb-3">
            {t('menu.title')}
          </h2>
        </div>
        <MenuPage />
      </div>

      {/* Localized Location & Contacts Footer */}
      <Footer />
    </main>
  );
}
