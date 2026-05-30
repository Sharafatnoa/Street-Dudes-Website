'use client';

import React, { useState } from 'react';

/**
 * Props for the CategoryTabs component.
 */
export type CategoryTabsProps = {
  categories: { id: string; label: string }[];
};

/**
 * CategoryTabs renders a sticky horizontal navigation bar enabling users to scroll dynamically to sections.
 *
 * @param props - Component props containing categories list.
 *
 * WHY: Delivers premium interactive micro-navigation using smooth-scroll integrations and responsive layouts.
 */
export function CategoryTabs({ categories }: CategoryTabsProps) {
  const [activeTab, setActiveTab] = useState(categories[0]?.id || '');

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-[#0e0e0e] backdrop-blur-md border-b border-zinc-900 overflow-x-auto whitespace-nowrap scrollbar-none">
      <div className="max-w-4xl mx-auto px-4 flex gap-6">
        {categories.map((category) => {
          const isActive = activeTab === category.id;
          return (
            <button
              key={category.id}
              onClick={() => handleTabClick(category.id)}
              className={`py-4 px-1 text-sm font-bold font-display uppercase tracking-[2px] transition-all duration-200 focus:outline-none ${
                isActive
                  ? 'text-[#F5A500] border-b-2 border-[#F5A500]'
                  : 'text-[rgba(255,255,255,0.35)] hover:text-[#F5A500]/80 border-b-2 border-transparent'
              }`}
              data-testid={`tab-${category.id}`}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
