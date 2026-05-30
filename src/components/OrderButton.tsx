import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from './ui/Button';
import { FlashingLabel } from './ui/FlashingLabel';

/**
 * Props for the OrderButton component.
 */
export type OrderButtonProps = {
  href?: string;
  disabled?: boolean;
};

/**
 * OrderButton component that prompts users to order dishes.
 *
 * @param props - Component props including href and active state overrides.
 *
 * WHY: Supports disabled and flashing COMING SOON labels for Phase 1, and activates href links in Phase 2.
 */
export function OrderButton({ href, disabled }: OrderButtonProps) {
  const t = useTranslations('nav');

  // Determine active state based on whether href is provided and disabled is explicitly toggled or false
  const isCurrentlyDisabled = disabled !== undefined ? disabled : !href;

  if (isCurrentlyDisabled) {
    return (
      <div className="flex flex-col items-center gap-4" data-testid="order-button-wrapper">
        <button
          disabled
          className="border border-dashed border-[rgba(245,165,0,0.3)] text-[rgba(245,165,0,0.4)] bg-[rgba(245,165,0,0.08)] cursor-not-allowed px-8 py-3.5 rounded-xl font-display text-lg uppercase tracking-wider transition-all duration-200 focus:outline-none"
        >
          {t('orderButton')}
        </button>
        <FlashingLabel label={t('comingSoon')} />
      </div>
    );
  }

  // Active state for Phase 2 integration
  return (
    <a href={href} className="inline-block" data-testid="order-button-wrapper">
      <Button
        variant="primary"
        className="px-8 py-3.5 rounded-xl font-display text-lg uppercase tracking-wider bg-[#F5A500] text-[#0b0b0b] hover:bg-[#F5A500]/90 transition-all duration-200"
      >
        {t('orderButton')}
      </Button>
    </a>
  );
}
