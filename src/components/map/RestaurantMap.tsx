'use client';

import React from 'react';
import { useLocale } from 'next-intl';

/**
 * RestaurantMap component renders an interactive Google Maps iframe
 * or a styled fallback card if the API key is not present.
 *
 * WHY: Provides standard map visualization with zero runtime crashes in missing credential situations.
 */
export function RestaurantMap() {
  const locale = useLocale();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  // If API key is missing or not configured, render the premium fallback placeholder
  if (!apiKey || apiKey.trim() === '') {
    const openText = locale === 'sv' ? 'Öppna i Google Maps ↗' : 'Open in Google Maps ↗';
    return (
      <div
        data-testid="map-placeholder"
        className="relative flex flex-col items-center justify-center p-6 min-h-[160px] bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl text-center overflow-hidden"
      >
        <style>{`
          @keyframes pin-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
          .animate-pin-pulse {
            display: inline-block;
            animation: pin-pulse 1.5s infinite ease-in-out;
          }
        `}</style>

        {/* Pulsing Pin */}
        <span className="text-3xl animate-pin-pulse select-none" role="img" aria-label="pin">
          📍
        </span>

        {/* Gold Chip */}
        <div className="mt-3 text-[10px] font-bold tracking-widest text-[#F5A500] border border-[#F5A500]/30 bg-[#F5A500]/5 px-2.5 py-0.5 rounded-full font-display uppercase">
          STREET DUDES BORÅS
        </div>

        {/* Bottom Right Corner Anchor */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Street Dudes, Alingsåsvägen, Borås')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 text-[10px] text-[rgba(255,255,255,0.5)] hover:text-white transition-colors font-body"
        >
          {openText}
        </a>
      </div>
    );
  }

  const MAP_URL =
    `https://www.google.com/maps/embed/v1/place` +
    `?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}` +
    `&q=Street+Dudes+Bor%C3%A5s` +
    `&center=57.7213,13.0173` +
    `&zoom=17` +
    `&language=sv`;

  return (
    <div
      data-testid="map-iframe-container"
      className="relative w-full h-64 bg-[#141414] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:border-[#F5A500]/30"
    >
      <iframe
        title="Street Dudes Borås på Google Maps"
        src={MAP_URL}
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: '200px' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
      />
    </div>
  );
}
