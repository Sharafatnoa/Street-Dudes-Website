import React from 'react';

/**
 * Props for the FlashingLabel component.
 */
export type FlashingLabelProps = {
  label: string;
  intervalMs?: number;
};

/**
 * FlashingLabel renders a border and background that flashes at a customizable interval.
 *
 * @param props - Component props including text label and flashing interval in milliseconds.
 *
 * WHY: Attracts user attention for upcoming features like "COMING SOON" using the brand design tokens.
 */
export function FlashingLabel({ label, intervalMs = 500 }: FlashingLabelProps) {
  // Uses custom CSS animation defined in globals.css, override duration inline to support custom intervalMs.
  // We multiply by 2 because a single full keyframe cycle covers both State A and State B.
  const animationStyle = {
    animationDuration: `${intervalMs * 2}ms`,
  };

  return (
    <span
      className="inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-bold border-2 border-[#F5A500] animate-flash-label"
      style={animationStyle}
      data-testid="flashing-label"
    >
      {label}
    </span>
  );
}
