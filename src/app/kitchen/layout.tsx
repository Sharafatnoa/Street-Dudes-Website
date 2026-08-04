/**
 * Layout for /kitchen section.
 * Provides Swedish i18n context and PIN authentication gate wrapper.
 */

import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { KitchenAuthGate } from '@/components/kitchen/KitchenAuthGate';
import '../globals.css';
import '@/styles/print.css';

export const metadata = {
  title: 'Köksdashboard — Street Dudes',
  robots: 'noindex, nofollow',
};

export default async function KitchenLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages({ locale: 'sv' });

  return (
    <html lang="sv">
      <body className="bg-black text-white antialiased">
        <NextIntlClientProvider locale="sv" messages={messages}>
          <KitchenAuthGate>{children}</KitchenAuthGate>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
