import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const activeLocale = (await requestLocale) || 'sv';
  return {
    locale: activeLocale,
    messages: (await import(`./${activeLocale}.json`)).default,
  };
});
