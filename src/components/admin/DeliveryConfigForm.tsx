/**
 * Delivery settings editor form with per-field independent save actions.
 * Updates delivery_radius_km, delivery_fee_kr, free_delivery_threshold_kr, min_order_kr via PATCH /api/admin/config.
 */

'use client';

import { useState, useEffect } from 'react';
import type { AppConfig } from '@/types/config';

type DeliveryConfigFormProps = {
  config: AppConfig;
  onConfigChange: () => void;
};

type FieldState = {
  value: string;
  isSaving: boolean;
  saved: boolean;
};

export function DeliveryConfigForm({ config, onConfigChange }: DeliveryConfigFormProps) {
  const [fields, setFields] = useState<Record<string, FieldState>>({
    delivery_radius_km: {
      value: String(config.deliveryRadiusKm ?? 10),
      isSaving: false,
      saved: false,
    },
    delivery_fee_kr: { value: String(config.deliveryFeeKr ?? 49), isSaving: false, saved: false },
    free_delivery_threshold_kr: {
      value: String(config.freeDeliveryThresholdKr ?? 400),
      isSaving: false,
      saved: false,
    },
    min_order_kr: { value: String(config.minOrderKr ?? 150), isSaving: false, saved: false },
  });

  useEffect(() => {
    setFields({
      delivery_radius_km: {
        value: String(config.deliveryRadiusKm ?? 10),
        isSaving: false,
        saved: false,
      },
      delivery_fee_kr: { value: String(config.deliveryFeeKr ?? 49), isSaving: false, saved: false },
      free_delivery_threshold_kr: {
        value: String(config.freeDeliveryThresholdKr ?? 400),
        isSaving: false,
        saved: false,
      },
      min_order_kr: { value: String(config.minOrderKr ?? 150), isSaving: false, saved: false },
    });
  }, [config]);

  async function saveField(key: string) {
    const val = fields[key]?.value;
    if (val === undefined) return;

    setFields((prev) => ({
      ...prev,
      [key]: { ...prev[key], isSaving: true, saved: false },
    }));

    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: val }),
      });

      if (res.ok) {
        setFields((prev) => ({
          ...prev,
          [key]: { ...prev[key], isSaving: false, saved: true },
        }));
        setTimeout(() => {
          setFields((prev) => ({
            ...prev,
            [key]: { ...prev[key], saved: false },
          }));
        }, 2500);
        onConfigChange();
      } else {
        setFields((prev) => ({
          ...prev,
          [key]: { ...prev[key], isSaving: false, saved: false },
        }));
      }
    } catch {
      setFields((prev) => ({
        ...prev,
        [key]: { ...prev[key], isSaving: false, saved: false },
      }));
    }
  }

  const fieldDefs = [
    { key: 'delivery_radius_km', label: 'Leveransradie (km)', step: '0.1' },
    { key: 'delivery_fee_kr', label: 'Leveransavgift (kr)', step: '1' },
    { key: 'free_delivery_threshold_kr', label: 'Gräns för fri leverans (kr)', step: '1' },
    { key: 'min_order_kr', label: 'Minsta orderbelopp (kr)', step: '1' },
  ];

  return (
    <div className="bg-[#141414] border border-white/10 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
          Leveransinställningar
        </h2>
        <p className="text-xs text-white/40 mt-0.5">Anpassa avgifter och gränser för hemleverans</p>
      </div>

      <div className="space-y-3 pt-2 border-t border-white/10">
        {fieldDefs.map(({ key, label, step }) => {
          const state = fields[key] || { value: '', isSaving: false, saved: false };
          return (
            <div
              key={key}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <label className="text-xs text-white/80 font-medium sm:w-1/2">{label}</label>
              <div className="flex items-center gap-2 sm:w-1/2">
                <input
                  type="number"
                  step={step}
                  value={state.value}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    setFields((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], value: newVal, saved: false },
                    }));
                  }}
                  className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:border-brand-gold font-mono"
                />
                <button
                  type="button"
                  onClick={() => saveField(key)}
                  disabled={state.isSaving}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 min-w-[70px]"
                >
                  {state.isSaving ? '...' : state.saved ? 'Sparad!' : 'Spara'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
