/**
 * Three-tab navigation bar for kitchen dashboard:
 * - AKTIVA (N)
 * - MENY
 * - KLARA IDAG (N)
 */

'use client';

export type KitchenTabType = 'active' | 'menu' | 'completed';

type KitchenTabsProps = {
  activeTab: KitchenTabType;
  activeCount: number;
  completedCount: number;
  onSelectTab: (tab: KitchenTabType) => void;
};

export function KitchenTabs({
  activeTab,
  activeCount,
  completedCount,
  onSelectTab,
}: KitchenTabsProps) {
  return (
    <div className="flex border-b border-white/10 bg-[#111] px-4">
      <button
        onClick={() => onSelectTab('active')}
        className={`px-6 py-3 font-display text-sm uppercase tracking-wider font-bold border-b-2 transition-colors flex items-center gap-2 ${
          activeTab === 'active'
            ? 'border-brand-gold text-brand-gold'
            : 'border-transparent text-white/50 hover:text-white'
        }`}
      >
        <span>AKTIVA</span>
        <span className="px-2 py-0.5 rounded-full text-xs bg-brand-gold/20 text-brand-gold font-mono">
          {activeCount}
        </span>
      </button>

      <button
        onClick={() => onSelectTab('menu')}
        className={`px-6 py-3 font-display text-sm uppercase tracking-wider font-bold border-b-2 transition-colors ${
          activeTab === 'menu'
            ? 'border-brand-gold text-brand-gold'
            : 'border-transparent text-white/50 hover:text-white'
        }`}
      >
        MENY
      </button>

      <button
        onClick={() => onSelectTab('completed')}
        className={`px-6 py-3 font-display text-sm uppercase tracking-wider font-bold border-b-2 transition-colors flex items-center gap-2 ${
          activeTab === 'completed'
            ? 'border-brand-gold text-brand-gold'
            : 'border-transparent text-white/50 hover:text-white'
        }`}
      >
        <span>KLARA IDAG</span>
        <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/70 font-mono">
          {completedCount}
        </span>
      </button>
    </div>
  );
}
