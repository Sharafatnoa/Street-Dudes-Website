/**
 * Layout for /admin section.
 * Provides Swedish i18n context and AdminAuthGate wrapper.
 */

import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AdminAuthGate } from '@/components/admin/AdminAuthGate';
import '../globals.css';

export const metadata = {
  title: 'Admindashboard — Street Dudes',
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages({ locale: 'sv' });

  return (
    <html lang="sv">
      <body className="bg-black text-white antialiased">
        <NextIntlClientProvider locale="sv" messages={messages}>
          <AdminAuthGate>{children}</AdminAuthGate>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
