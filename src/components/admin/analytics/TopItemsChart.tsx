/**
 * Recharts component for top-ordered menu items.
 * Renders horizontal bar chart (item name vs quantity).
 */

'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BRAND_GOLD } from '@/styles/brand';

type TopItemsChartProps = {
  data: Array<{ menuItemId: string; name: string; totalQuantity: number }>;
};

export function TopItemsChart({ data }: TopItemsChartProps) {
  return (
    <div className="bg-[#141414] border border-white/10 rounded-xl p-5 space-y-3">
      <div>
        <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">
          Mest Populära Rätter
        </h3>
        <p className="text-xs text-white/40">Topp 10 sålda rätter i antal sålda enheter</p>
      </div>

      <div className="h-64 w-full pt-2">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-white/30">
            Inga rätter sålda i valt intervall
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" stroke="#ffffff40" fontSize={10} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#ffffff60"
                fontSize={11}
                width={100}
                tickFormatter={(val) => (val.length > 15 ? `${val.slice(0, 14)}…` : val)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0a0a',
                  borderColor: '#ffffff20',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Bar
                dataKey="totalQuantity"
                name="Antal sålda"
                fill={BRAND_GOLD}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
