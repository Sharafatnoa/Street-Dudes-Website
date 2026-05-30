import React from 'react';

type RootLayoutProps = {
  children: React.ReactNode;
};

/**
 * RootLayout is a pass-through layout component.
 *
 * @param props - Layout props containing children.
 *
 * WHY: Required by Next.js App Router root layout standard, delegates layout rendering to the localized segment layout.
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}
