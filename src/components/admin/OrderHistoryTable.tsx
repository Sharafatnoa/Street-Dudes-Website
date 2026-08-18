/**
 * Paginated order history table component.
 * Displays order records with date range filters, status filtering, refund filtering, pagination, item details expansion, and refund trigger modal.
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
  refundStatus: string;
  refundAmountKr?: number | null;
  refundReason?: string | null;
  refundedAt?: string | null;
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
  const [refundStatusFilter, setRefundStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Refund Modal state
  const [refundOrder, setRefundOrder] = useState<OrderRecord | null>(null);
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState<string>('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
        status,
        refundStatus: refundStatusFilter,
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
  }, [fromDate, toDate, status, refundStatusFilter, page, pageSize]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function openRefundModal(e: React.MouseEvent, order: OrderRecord) {
    e.stopPropagation();
    setRefundOrder(order);
    setRefundType('full');
    setRefundAmount(String(order.total));
    setRefundReason('');
    setRefundError(null);
    setShowConfirm(false);
  }

  function closeRefundModal() {
    setRefundOrder(null);
    setRefundError(null);
    setShowConfirm(false);
  }

  async function handleRefundSubmit() {
    if (!refundOrder || isSubmittingRefund) return;
    if (!refundReason.trim()) {
      setRefundError('Vänligen ange en orsak till återbetalningen.');
      return;
    }

    const numericAmount = refundType === 'partial' ? Number(refundAmount) : refundOrder.total;
    if (
      refundType === 'partial' &&
      (isNaN(numericAmount) || numericAmount <= 0 || numericAmount > refundOrder.total)
    ) {
      setRefundError(`Ange ett belopp mellan 1 och ${refundOrder.total} kr.`);
      return;
    }

    setIsSubmittingRefund(true);
    setRefundError(null);

    try {
      const res = await fetch(`/api/admin/orders/${refundOrder.id}/refund`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: refundType,
          amountKr: numericAmount,
          reason: refundReason.trim(),
        }),
      });

      if (res.ok) {
        closeRefundModal();
        loadOrders();
      } else {
        const data = await res.json().catch(() => ({}));
        setRefundError(data.error || 'Återbetalning misslyckades');
      }
    } catch {
      setRefundError('Nätverksfel vid återbetalning');
    } finally {
      setIsSubmittingRefund(false);
    }
  }

  return (
    <div className="bg-[#141414] border border-white/10 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
            Orderhistorik
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Sök, granska och hantera återbetalningar för ordrar
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
          <select
            value={refundStatusFilter}
            onChange={(e) => {
              setRefundStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-gold"
          >
            <option value="all">Alla återbetalningar</option>
            <option value="none">Ej återbetalda</option>
            <option value="refunded">Återbetalda (Alla)</option>
            <option value="partial">Delvis återbetalda</option>
            <option value="full">Helt återbetalda</option>
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
              <th className="py-3 px-4">Återbetalning</th>
              <th className="py-3 px-4 text-right">Summa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-white/40">
                  Laddar ordrar...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-white/40">
                  Inga ordrar hittades för valda filter.
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const isExpanded = expandedId === o.id;
                const isRefunded = o.refundStatus && o.refundStatus !== 'none';
                return (
                  <tr key={o.id} onClick={() => setExpandedId(isExpanded ? null : o.id)}>
                    <td colSpan={7} className="p-0">
                      <div className="flex items-center hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 py-3 px-4">
                        <div className="w-1/6 font-mono font-bold text-brand-gold">
                          #{o.orderNumber}
                        </div>
                        <div className="w-1/6 text-white/70">{formatDate(o.createdAt)}</div>
                        <div className="w-1/5 text-white font-medium">
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
                        <div className="w-1/5">
                          {isRefunded ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                o.refundStatus === 'full'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              }`}
                            >
                              {o.refundStatus === 'full'
                                ? 'Helt återbetald'
                                : `Delvis (${o.refundAmountKr} kr)`}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => openRefundModal(e, o)}
                              className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-[10px] font-semibold uppercase tracking-wider rounded border border-red-500/20 transition-colors"
                            >
                              Återbetala
                            </button>
                          )}
                        </div>
                        <div className="w-1/6 text-right font-mono font-bold text-white">
                          {o.total} kr
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="bg-black/40 border-b border-white/10 p-4 space-y-3">
                          <div className="text-xs text-white/80 font-semibold uppercase tracking-wider flex justify-between items-center">
                            <span>Orderdetaljer — #{o.orderNumber}</span>
                            {isRefunded && (
                              <span className="text-[11px] text-purple-300 font-normal">
                                Återbetalningsorsak: {o.refundReason || 'Ingen angiven'} (
                                {o.refundAmountKr} kr)
                              </span>
                            )}
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

      {/* Refund Trigger Modal */}
      {refundOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div>
              <h3 className="font-display text-xl font-bold text-brand-gold uppercase tracking-wider">
                Återbetalning — Order #{refundOrder.orderNumber}
              </h3>
              <p className="text-xs text-white/50 mt-1">Totalbelopp: {refundOrder.total} kr</p>
            </div>

            {refundError && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded font-semibold animate-pulse">
                {refundError}
              </div>
            )}

            {!showConfirm ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/70 block">
                    Typ av återbetalning
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRefundType('full')}
                      className={`p-2.5 text-xs font-bold rounded-lg border text-center transition-colors ${
                        refundType === 'full'
                          ? 'bg-brand-gold text-brand-black border-brand-gold'
                          : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Hel återbetalning ({refundOrder.total} kr)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefundType('partial')}
                      className={`p-2.5 text-xs font-bold rounded-lg border text-center transition-colors ${
                        refundType === 'partial'
                          ? 'bg-brand-gold text-brand-black border-brand-gold'
                          : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Delvis återbetalning
                    </button>
                  </div>
                </div>

                {refundType === 'partial' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white/70 block">
                      Återbetalningsbelopp (kr)
                    </label>
                    <input
                      type="number"
                      max={refundOrder.total}
                      min={1}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder={`Max ${refundOrder.total} kr`}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/70 block">
                    Orsak (krävs) <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="t.ex. Saknade ingredienser / felaktig tillagning"
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={closeRefundModal}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Avbryt
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!refundReason.trim()) {
                        setRefundError('Vänligen ange en orsak till återbetalningen.');
                        return;
                      }
                      setRefundError(null);
                      setShowConfirm(true);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                  >
                    Fortsätt
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-lg space-y-2">
                  <p className="text-xs text-amber-200 font-semibold">Bekräfta återbetalning</p>
                  <p className="text-xs text-white/80">
                    Är du säker på att du vill genomföra en{' '}
                    {refundType === 'full' ? 'hel' : 'delvis'} återbetalning på{' '}
                    <strong className="text-brand-gold font-mono font-bold">
                      {refundType === 'full' ? refundOrder.total : refundAmount} kr
                    </strong>{' '}
                    för Order #{refundOrder.orderNumber}?
                  </p>
                  <p className="text-[11px] text-white/40 italic">
                    Orsak: &quot;{refundReason}&quot;
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    disabled={isSubmittingRefund}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    Tillbaka
                  </button>
                  <button
                    type="button"
                    onClick={handleRefundSubmit}
                    disabled={isSubmittingRefund}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 min-w-[100px]"
                  >
                    {isSubmittingRefund ? 'Bearbetar...' : 'Verkställ'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
