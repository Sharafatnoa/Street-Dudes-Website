import React from 'react';

/**
 * Props for the Button component.
 */
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

/**
 * Button component used for standard actions across the web application.
 *
 * @param props - Component props including HTML attributes and variant styles.
 *
 * WHY: Provides consistent, reusable button designs driven by Tailwind configurations.
 */
export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyle =
    'px-4 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none';
  const variantStyle =
    variant === 'primary'
      ? 'bg-amber-500 text-black hover:bg-amber-600'
      : 'bg-zinc-800 text-white hover:bg-zinc-700';

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
}
