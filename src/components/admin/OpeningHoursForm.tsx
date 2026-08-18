/**
 * Opening hours editor form with per-field independent save actions.
 * Updates weekday_open, weekday_break_start, weekday_break_end, weekday_close, weekend_open, weekend_close via PATCH /api/admin/config.
 */

'use client';

import { useState, useEffect } from 'react';
import type { AppConfig } from '@/types/config';

type OpeningHoursFormProps = {
  config: AppConfig;
  onConfigChange: () => void;
};

type FieldState = {
  value: string;
  isSaving: boolean;
  saved: boolean;
};

export function OpeningHoursForm({ config, onConfigChange }: OpeningHoursFormProps) {
  const [fields, setFields] = useState<Record<string, FieldState>>({
    weekday_open: { value: config.weekdayOpen || '11:00', isSaving: false, saved: false },
    weekday_break_start: {
      value: config.weekdayBreakStart || '14:00',
      isSaving: false,
      saved: false,
    },
    weekday_break_end: { value: config.weekdayBreakEnd || '16:00', isSaving: false, saved: false },
    weekday_close: { value: config.weekdayClose || '21:00', isSaving: false, saved: false },
    weekend_open: { value: config.weekendOpen || '12:00', isSaving: false, saved: false },
    weekend_close: { value: config.weekendClose || '22:00', isSaving: false, saved: false },
  });

  useEffect(() => {
    setFields({
      weekday_open: { value: config.weekdayOpen || '11:00', isSaving: false, saved: false },
      weekday_break_start: {
        value: config.weekdayBreakStart || '14:00',
        isSaving: false,
        saved: false,
      },
      weekday_break_end: {
        value: config.weekdayBreakEnd || '16:00',
        isSaving: false,
        saved: false,
      },
      weekday_close: { value: config.weekdayClose || '21:00', isSaving: false, saved: false },
      weekend_open: { value: config.weekendOpen || '12:00', isSaving: false, saved: false },
      weekend_close: { value: config.weekendClose || '22:00', isSaving: false, saved: false },
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
    { key: 'weekday_open', label: 'Vardagar: Öppnar' },
    { key: 'weekday_break_start', label: 'Vardagar: Rast start' },
    { key: 'weekday_break_end', label: 'Vardagar: Rast slut' },
    { key: 'weekday_close', label: 'Vardagar: Stänger' },
    { key: 'weekend_open', label: 'Helger: Öppnar' },
    { key: 'weekend_close', label: 'Helger: Stänger' },
  ];

  return (
    <div className="bg-[#141414] border border-white/10 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">Öppettider</h2>
        <p className="text-xs text-white/40 mt-0.5">
          Ändra ordinarie öppettider för vardagar och helger
        </p>
      </div>

      <div className="space-y-3 pt-2 border-t border-white/10">
        {fieldDefs.map(({ key, label }) => {
          const state = fields[key] || { value: '00:00', isSaving: false, saved: false };
          return (
            <div
              key={key}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <label className="text-xs text-white/80 font-medium sm:w-1/2">{label}</label>
              <div className="flex items-center gap-2 sm:w-1/2">
                <input
                  type="time"
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
