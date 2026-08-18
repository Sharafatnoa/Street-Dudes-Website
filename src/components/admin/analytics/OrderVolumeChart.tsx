/**
 * Recharts component for order volume over time.
 * Uses BRAND_GOLD token for chart rendering.
 */

'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { BRAND_GOLD } from '@/styles/brand';

type OrderVolumeChartProps = {
  data: Array<{ date: string; count: number }>;
};

export function OrderVolumeChart({ data }: OrderVolumeChartProps) {
  return (
    <div className="bg-[#141414] border border-white/10 rounded-xl p-5 space-y-3">
      <div>
        <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">
          Ordervolym per dag
        </h3>
        <p className="text-xs text-white/40">Antal lagda beställningar över tid</p>
      </div>

      <div className="h-64 w-full pt-2">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-white/30">
            Ingen data tillgänglig
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BRAND_GOLD} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={BRAND_GOLD} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#ffffff40"
                fontSize={11}
                tickFormatter={(val) => val.slice(5)}
              />
              <YAxis stroke="#ffffff40" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0a0a',
                  borderColor: '#ffffff20',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Antal ordrar"
                stroke={BRAND_GOLD}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#goldGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
