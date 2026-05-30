import React from 'react';

/**
 * Props for the Badge component.
 */
export type BadgeProps = {
  variant: 'favorite' | 'levelup';
  label: string;
};

/**
 * Reusable Badge component used to highlight menu items.
 *
 * @param props - Component props including variant type and text label.
 *
 * WHY: Renders custom promotional highlights (star prefixes for favorites, uppercase for levelups)
 * using brand token styling.
 */
export function Badge({ variant, label }: BadgeProps) {
  // Common styles driven by brand styling truth (Gold background, dark text)
  const baseStyle =
    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#F5A500] text-[#0b0b0b] tracking-wider';

  return (
    <span className={baseStyle} data-testid={`badge-${variant}`}>
      {variant === 'favorite' && <span className="mr-1">★</span>}
      {variant === 'levelup' ? label.toUpperCase() : label}
    </span>
  );
}
