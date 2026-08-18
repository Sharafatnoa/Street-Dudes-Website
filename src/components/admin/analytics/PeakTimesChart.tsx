/**
 * Recharts component for peak order times.
 * Displays two bar charts: orders by day of week and orders by hour of day.
 */

'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BRAND_GOLD } from '@/styles/brand';

type PeakTimesChartProps = {
  byDayOfWeek: Array<{ day: string; count: number }>;
  byHour: Array<{ hour: string; count: number }>;
};

export function PeakTimesChart({ byDayOfWeek, byHour }: PeakTimesChartProps) {
  return (
    <div className="bg-[#141414] border border-white/10 rounded-xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">
          Högtidstider & Mönster
        </h3>
        <p className="text-xs text-white/40">Fördelning över veckodagar och klockslag</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Day of week bar chart */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-white/60 uppercase">Per Veckodag</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDayOfWeek} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="day" stroke="#ffffff40" fontSize={10} />
                <YAxis stroke="#ffffff40" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0a0a',
                    borderColor: '#ffffff20',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" name="Ordrar" fill={BRAND_GOLD} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hour of day bar chart */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-white/60 uppercase">Per Klockslag (00-23)</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byHour} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis
                  dataKey="hour"
                  stroke="#ffffff40"
                  fontSize={9}
                  tickFormatter={(h) => (parseInt(h) % 3 === 0 ? h : '')}
                />
                <YAxis stroke="#ffffff40" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0a0a',
                    borderColor: '#ffffff20',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" name="Ordrar" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
