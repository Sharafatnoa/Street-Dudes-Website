/**
 * Paginated order history table component.
 * Displays order records with date range filters, status filtering, pagination, and item details expansion.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatItemSummary } from '@/lib/formatItemSummary';
import type { CartItem } from '@/types/order';

type OrderRecord = {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: string;
  total: number;
  items: CartItem[];
  deliveryAddress?: string;
  deliveryNotes?: string;
  allergyNotes?: string;
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('sv-SE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function getDefaultFromDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
}

function getDefaultToDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function OrderHistoryTable() {
  const [fromDate, setFromDate] = useState(getDefaultFromDate());
  const [toDate, setToDate] = useState(getDefaultToDate());
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
        status,
        page: String(page),
        pageSize: String(pageSize),
      });
      const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // Handled silently
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, status, page, pageSize]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="bg-[#141414] border border-white/10 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
            Orderhistorik
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Sök och granska alla genomförda och aktiva ordrar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-gold"
          />
          <span className="text-xs text-white/40">till</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-gold"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-gold"
          >
            <option value="all">Alla statusar</option>
            <option value="pending">Väntar</option>
            <option value="preparing">Tillagas</option>
            <option value="ready">Redo</option>
            <option value="completed">Klar</option>
            <option value="cancelled">Avbruten</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-white/10 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/60 text-white/50 border-b border-white/10 font-mono uppercase">
            <tr>
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Datum</th>
              <th className="py-3 px-4">Kund</th>
              <th className="py-3 px-4">Typ</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Summa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-white/40">
                  Laddar ordrar...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-white/40">
                  Inga ordrar hittades för valda filter.
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const isExpanded = expandedId === o.id;
                return (
                  <tr key={o.id} onClick={() => setExpandedId(isExpanded ? null : o.id)}>
                    <td colSpan={6} className="p-0">
                      <div className="flex items-center hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 py-3 px-4">
                        <div className="w-1/6 font-mono font-bold text-brand-gold">
                          #{o.orderNumber}
                        </div>
                        <div className="w-1/6 text-white/70">{formatDate(o.createdAt)}</div>
                        <div className="w-1/4 text-white font-medium">
                          {o.customerName || 'Anonym'}
                        </div>
                        <div className="w-1/6 uppercase text-[10px] tracking-wider text-white/60">
                          {o.fulfillmentType === 'delivery' ? 'Leverans' : 'Avhämtning'}
                        </div>
                        <div className="w-1/6">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              o.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : o.status === 'ready'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : o.status === 'preparing'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : o.status === 'cancelled'
                                      ? 'bg-red-500/20 text-red-400'
                                      : 'bg-white/10 text-white/70'
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                        <div className="w-1/6 text-right font-mono font-bold text-white">
                          {o.total} kr
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="bg-black/40 border-b border-white/10 p-4 space-y-3">
                          <div className="text-xs text-white/80 font-semibold uppercase tracking-wider">
                            Orderdetaljer — #{o.orderNumber}
                          </div>
                          {o.deliveryAddress && (
                            <div className="text-xs text-white/60">
                              <span className="font-semibold text-white/80">Adress: </span>
                              {o.deliveryAddress}
                            </div>
                          )}
                          {o.allergyNotes && (
                            <div className="text-xs text-red-300 bg-red-950/30 border border-red-500/20 p-2 rounded">
                              <span className="font-bold">Allergi: </span>
                              {o.allergyNotes}
                            </div>
                          )}
                          <div className="space-y-1.5">
                            {o.items.map((item, idx) => {
                              const summary = formatItemSummary(item);
                              return (
                                <div
                                  key={idx}
                                  className="bg-white/5 p-2 rounded text-xs space-y-0.5"
                                >
                                  <div className="flex justify-between font-medium text-white">
                                    <span>
                                      {item.quantity}x {item.name}
                                    </span>
                                    <span>
                                      {(item.totalPrice ?? item.basePrice ?? 0) * item.quantity} kr
                                    </span>
                                  </div>
                                  {summary.proteinSwap && (
                                    <div className="text-[11px] text-brand-gold">
                                      · {summary.proteinSwap}
                                    </div>
                                  )}
                                  {summary.riceSwap && (
                                    <div className="text-[11px] text-amber-300">
                                      · {summary.riceSwap}
                                    </div>
                                  )}
                                  {summary.removed && (
                                    <div className="text-[11px] text-red-300">
                                      · {summary.removed}
                                    </div>
                                  )}
                                  {summary.addons.map((a, i) => (
                                    <div key={i} className="text-[11px] text-white/60">
                                      · {a}
                                    </div>
                                  ))}
                                  {summary.instructions && (
                                    <div className="text-[11px] text-white/50 italic">
                                      Notering: {summary.instructions}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 pt-2">
        <div>
          Visar {orders.length} av {totalCount} ordrar (sida {page} av {totalPages})
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-black/60 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono"
          >
            <option value={10}>10 / sida</option>
            <option value={25}>25 / sida</option>
            <option value={50}>50 / sida</option>
          </select>
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded font-medium disabled:opacity-30 transition-colors"
          >
            Föregående
          </button>
          <span className="font-mono text-white px-2">{page}</span>
          <button
            type="button"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded font-medium disabled:opacity-30 transition-colors"
          >
            Nästa
          </button>
        </div>
      </div>
    </div>
  );
}
