/**
 * Promo codes placeholder component for Phase 3.
 * Displays a greyed-out disabled state for Rabattkoder / Promo Codes.
 */

'use client';

export function PromoCodesCard() {
  return (
    <div className="bg-[#141414]/50 border border-white/5 rounded-xl p-5 space-y-4 opacity-50 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">
            Rabattkoder / Promo Codes
          </h2>
          <p className="text-xs text-white/30 mt-0.5">
            Hantera kampanjer, rabattkoder och VIP-erbjudanden
          </p>
        </div>
        <span className="px-2.5 py-1 rounded bg-white/10 text-white/40 text-[10px] font-bold uppercase tracking-wider border border-white/10">
          Kommer snart (Fas 3)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5 pointer-events-none">
        <div className="bg-black/30 border border-white/5 p-3 rounded-lg space-y-2">
          <span className="text-xs font-semibold text-white/40 block">Skapa kampanjkod</span>
          <input
            type="text"
            disabled
            placeholder="t.ex. STREET20"
            className="w-full bg-black/50 border border-white/5 rounded p-2 text-xs text-white/30 cursor-not-allowed"
          />
        </div>
        <div className="bg-black/30 border border-white/5 p-3 rounded-lg space-y-2">
          <span className="text-xs font-semibold text-white/40 block">Rabattsats (%)</span>
          <input
            type="number"
            disabled
            placeholder="20%"
            className="w-full bg-black/50 border border-white/5 rounded p-2 text-xs text-white/30 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
