/**
 * Single order card for kitchen dashboard.
 * Supports status progression on tap, recall confirmation in completed tab,
 * card printing, and per-item completion checkmarks.
 *
 * @param props.order - The order data object
 * @param props.thresholdMins - Optional age warning threshold in minutes
 * @param props.onStatusChange - Callback when order status advances
 * @param props.onPrint - Optional callback to trigger printing
 */

'use client';

import { useState } from 'react';
import type { Order, OrderStatus, PrintStatus } from '@/types/order';
import { formatItemSummary } from '@/lib/formatItemSummary';
import { OrderAgeIndicator } from './OrderAgeIndicator';

type OrderCardProps = {
  order: Order;
  thresholdMins?: number;
  onStatusChange: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
  onPrint?: (order: Order) => void;
};

const STATUS_NEXT: Record<OrderStatus, OrderStatus | null> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  completed: null,
};

const CARD_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-[#181818] border-white/20 hover:border-white/40',
  preparing: 'bg-[#261c02] border-brand-gold/60 hover:border-brand-gold',
  ready: 'bg-[#062412] border-green-500/60 hover:border-green-400',
  completed: 'bg-[#111111] border-white/10 opacity-80',
};

const STATUS_BADGE: Record<OrderStatus, { label: string; cls: string }> = {
  pending: { label: 'INKOMMEN', cls: 'bg-white/10 text-white' },
  preparing: { label: 'TILLAGAS', cls: 'bg-brand-gold text-brand-black font-bold' },
  ready: { label: 'KLAR', cls: 'bg-green-500 text-black font-bold' },
  completed: { label: 'SLUTFÖRD', cls: 'bg-white/20 text-white/60' },
};

export function OrderCard({ order, thresholdMins, onStatusChange, onPrint }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReprinting, setIsReprinting] = useState(false);
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(new Set());
  const [currentKey, setCurrentKey] = useState<string>(`${order.id}-${order.status}`);

  // Reset item checkmarks if the order's id or status changes
  if (currentKey !== `${order.id}-${order.status}`) {
    setCurrentKey(`${order.id}-${order.status}`);
    setCheckedIndices(new Set());
  }

  const items = order.items || [];
  const totalItems = items.length;
  const isAllChecked = totalItems > 0 && checkedIndices.size === totalItems;

  const nextStatus = STATUS_NEXT[order.status];
  const badge = STATUS_BADGE[order.status] || STATUS_BADGE.pending;
  const isDelivery = order.fulfillmentType === 'delivery';

  function toggleItemCheck(e: React.MouseEvent, index: number) {
    e.stopPropagation();
    setCheckedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  async function handleCardClick() {
    if (!nextStatus || isUpdating) return;
    setIsUpdating(true);
    try {
      await onStatusChange(order.id, nextStatus);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRecall(e: React.MouseEvent) {
    e.stopPropagation();
    if (isUpdating) return;

    const confirmed = window.confirm(
      'Är du säker? Ordern flyttas tillbaka till aktiva som "Tillagas".',
    );
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      await onStatusChange(order.id, 'preparing');
    } finally {
      setIsUpdating(false);
    }
  }

  function handlePrintClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (onPrint) onPrint(order);
  }

  async function handleReprintRequest(e: React.MouseEvent) {
    e.stopPropagation();
    if (isReprinting) return;
    setIsReprinting(true);
    try {
      const res = await fetch('/api/kitchen/print-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (!res.ok) {
        alert('Kunde inte köa utskrift.');
      }
    } catch {
      alert('Nätverksfel vid utskrift.');
    } finally {
      setIsReprinting(false);
    }
  }

  const printStatus: PrintStatus = order.printStatus || 'none';

  return (
    <div
      onClick={handleCardClick}
      data-order-card-id={order.id}
      className={`rounded-lg border p-4 shadow-lg flex flex-col justify-between transition-all select-none ${
        nextStatus ? 'cursor-pointer' : ''
      } ${CARD_STYLES[order.status]} ${
        isAllChecked ? 'ring-2 ring-green-500/60 border-green-500/80 shadow-green-950/40' : ''
      }`}
    >
      <div>
        {/* Header: Order Number + Fulfillment + Age */}
        <div className="flex justify-between items-center pb-2 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-white">#{order.orderNumber}</span>
            <span className="text-sm px-2 py-0.5 rounded bg-white/10 text-white font-medium">
              {isDelivery ? '🛵 Leverans' : '🏪 Upphämtning'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider ${badge.cls}`}>
              {badge.label}
            </span>
            {isAllChecked && (
              <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/40 font-bold flex items-center gap-1">
                ✓ Alla klara
              </span>
            )}
            {order.status !== 'completed' && (
              <OrderAgeIndicator createdAt={order.createdAt} thresholdMins={thresholdMins} />
            )}
          </div>
        </div>

        {/* Allergy Warning Box (impossible to miss) */}
        {/* Kitchen printer status indicator */}
        {printStatus !== 'none' && (
          <div className="mb-3 flex items-center gap-2">
            {(printStatus === 'pending' || printStatus === 'printing') && (
              <span className="text-xs text-white/40 italic flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-white/30 animate-pulse" />
                Skriver ut…
              </span>
            )}
            {printStatus === 'printed' && (
              <span className="text-xs text-green-400 flex items-center gap-1 font-medium">
                ✓ Utskriven
              </span>
            )}
            {printStatus === 'failed' && (
              <button
                onClick={handleReprintRequest}
                className="text-xs text-red-400 font-bold flex items-center gap-1 hover:text-red-300 transition-colors"
              >
                ⚠ Utskrift misslyckades
              </button>
            )}
          </div>
        )}

        {/* Print error detail (shown only on failure) */}
        {printStatus === 'failed' && order.printError && (
          <p className="mb-3 text-xs text-white/40 italic">Fel: {order.printError}</p>
        )}

        {order.allergyNotes && (
          <div className="mb-3 p-2.5 rounded border-2 border-red-500 bg-red-500/20 text-red-300 animate-pulse">
            <p className="font-bold text-xs uppercase tracking-wider flex items-center gap-1">
              <span>⚠️ ALLERGI / SPECIALÖNSKEMÅL:</span>
            </p>
            <p className="font-bold text-sm text-red-200 mt-0.5">{order.allergyNotes}</p>
          </div>
        )}

        {/* Customer info & Delivery Notes */}
        <div className="mb-3 text-xs text-white/60">
          <p className="text-white font-medium">{order.customerName}</p>
          {order.customerPhone && <p className="text-white/70 mt-0.5">📞 {order.customerPhone}</p>}
          {isDelivery && order.deliveryAddress && (
            <p className="text-white/70 mt-1">
              📍 {order.deliveryAddress}{' '}
              {order.deliveryApartment ? `(${order.deliveryApartment})` : ''}
            </p>
          )}
          {isDelivery && order.deliveryNotes && (
            <p className="italic text-yellow-300/80 mt-1">Anteckning: {order.deliveryNotes}</p>
          )}
        </div>

        {/* Items List */}
        <div className="space-y-2 mb-4">
          {items.map((item, idx) => {
            const summary = formatItemSummary(item);
            const isChecked = checkedIndices.has(idx);
            return (
              <div
                key={idx}
                onClick={(e) => toggleItemCheck(e, idx)}
                className={`p-2 rounded border transition-all cursor-pointer select-none ${
                  isChecked
                    ? 'bg-black/20 border-white/5 opacity-50'
                    : 'bg-black/30 border-white/5 hover:bg-black/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`font-bold text-sm text-white ${
                      isChecked ? 'line-through text-white/50' : ''
                    }`}
                  >
                    {item.quantity}×{' '}
                    {item.selectedVariant
                      ? `${item.name} (${item.selectedVariant.name})`
                      : item.name}
                  </p>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-bold transition-colors ${
                      isChecked
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'text-white/30 border border-white/10'
                    }`}
                  >
                    {isChecked ? '✓' : '○'}
                  </span>
                </div>

                {/* Customizations */}
                <div
                  className={`text-xs space-y-0.5 mt-1 ${
                    isChecked ? 'line-through text-white/40' : ''
                  }`}
                >
                  {summary.proteinSwap && (
                    <p className={isChecked ? 'text-white/40' : 'text-brand-gold font-medium'}>
                      ({summary.proteinSwap})
                    </p>
                  )}
                  {summary.riceSwap && (
                    <p className={isChecked ? 'text-white/40' : 'text-brand-gold font-medium'}>
                      ({summary.riceSwap})
                    </p>
                  )}
                  {summary.removed && (
                    <p className={isChecked ? 'text-white/40' : 'text-red-400 font-medium'}>
                      {summary.removed}
                    </p>
                  )}
                  {summary.addedSauce && (
                    <p className={isChecked ? 'text-white/40' : 'text-yellow-400 font-medium'}>
                      {summary.addedSauce}
                    </p>
                  )}
                  {summary.addons.map((a, i) => (
                    <p key={i} className={isChecked ? 'text-white/40' : 'text-white/80'}>
                      +{a}
                    </p>
                  ))}
                  {summary.instructions && (
                    <p className={isChecked ? 'text-white/40' : 'italic text-white/50'}>
                      &quot;{summary.instructions}&quot;
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Controls: Tap hint / Recall / Print */}
      <div className="pt-2 border-t border-white/10 flex justify-between items-center">
        {order.status === 'completed' ? (
          <button
            onClick={handleRecall}
            disabled={isUpdating}
            className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors"
          >
            ÅTERKALLA
          </button>
        ) : (
          <span className="text-xs text-white/40 italic">
            {nextStatus === 'preparing' && 'Tryck för att starta tillagning →'}
            {nextStatus === 'ready' && 'Tryck för att markera klar →'}
            {nextStatus === 'completed' && 'Tryck för att slutföra →'}
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleReprintRequest}
            disabled={isReprinting}
            className="px-3 py-1 bg-brand-gold/20 hover:bg-brand-gold/30 text-brand-gold rounded text-xs transition-colors flex items-center gap-1 font-medium disabled:opacity-50"
          >
            🖨️ Skriv ut igen
          </button>
          <button
            onClick={handlePrintClick}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition-colors flex items-center gap-1 font-medium"
          >
            🖨️ Skriv ut
          </button>
        </div>
      </div>
    </div>
  );
}
