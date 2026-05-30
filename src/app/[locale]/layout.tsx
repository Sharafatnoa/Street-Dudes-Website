import React from 'react';
import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Bebas_Neue, Archivo } from 'next/font/google';
import { locales } from '@/navigation';
import '../globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
  display: 'swap',
});

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: { locale: string };
};

/**
 * Dynamic localized metadata generation for SEO compliance.
 */
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

/**
 * LocaleLayout wraps the page components to provide localization context.
 *
 * @param props - Component props containing children and route locale parameter.
 *
 * WHY: Validates locale segment, initializes Google Fonts, and delivers i18n messages to components.
 */
export default async function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  // Validate that the locale segment matches supported locales
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  // Set the request locale context so next-intl knows which language to load
  setRequestLocale(locale);

  // Retrieve translation messages server-side
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${archivo.variable} ${bebasNeue.variable} bg-zinc-950 text-white min-h-screen antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
