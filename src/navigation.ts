import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['sv', 'en'] as const;

export const routing = defineRouting({
  locales,
  defaultLocale: 'sv',
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
