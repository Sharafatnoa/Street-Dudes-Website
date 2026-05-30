'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { RestaurantMap } from '../map/RestaurantMap';

/**
 * Footer component providing site footer information including address,
 * opening hours, tagline, brand logo, and the interactive location map.
 *
 * WHY: Delivers high fidelity localized layout and navigation details at the viewport bottom.
 */
export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  const ratingLabel = locale === 'sv' ? '⭐ 5.0 Google-betyg' : '⭐ 5.0 Google Rating';

  return (
    <footer className="w-full bg-[#0b0b0b] border-t border-[#F5A500]/10 py-12 px-6 shadow-2xl mt-auto animate-none">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Column: Restaurant Map Embed */}
        <div className="w-full">
          <RestaurantMap />
        </div>

        {/* Right Column: Brand Details, Tagline, Address, Hours, Rating Chip */}
        <div className="flex flex-col gap-4 text-left">
          <div className="flex flex-col">
            <h3 className="text-2xl font-extrabold tracking-wider text-[#F5A500] font-display uppercase">
              STREET DUDES
            </h3>
            <p className="text-xs text-zinc-500 font-body italic mt-0.5">{t('tagline')}</p>
          </div>

          <div className="flex flex-col gap-2.5 font-body text-xs text-zinc-400">
            <div className="flex gap-2.5 items-start">
              <svg
                className="w-4 h-4 text-[#F5A500] shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{t('address')}</span>
            </div>

            <div className="flex gap-2.5 items-start">
              <svg
                className="w-4 h-4 text-[#F5A500] shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex flex-col">
                <span className="font-bold text-zinc-300 uppercase tracking-wider text-[10px] font-display">
                  Öppettider / Opening Hours
                </span>
                <span className="mt-0.5">{t('openingHours')}</span>
              </div>
            </div>
          </div>

          {/* ⭐ 5.0 Google Rating Chip */}
          <div className="flex mt-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold font-display uppercase tracking-widest border border-[#F5A500] text-[#F5A500] rounded-lg p-[6px] bg-[#F5A500]/5 select-none">
              {ratingLabel}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
