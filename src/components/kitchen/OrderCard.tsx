/**
 * Single order card for kitchen dashboard.
 * Supports status progression on tap, recall confirmation in completed tab, and card printing.
 */

'use client';

import { useState } from 'react';
import type { Order, OrderStatus } from '@/types/order';
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

  const nextStatus = STATUS_NEXT[order.status];
  const badge = STATUS_BADGE[order.status] || STATUS_BADGE.pending;
  const isDelivery = order.fulfillmentType === 'delivery';

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

  return (
    <div
      onClick={handleCardClick}
      data-order-card-id={order.id}
      className={`rounded-lg border p-4 shadow-lg flex flex-col justify-between transition-all select-none ${
        nextStatus ? 'cursor-pointer' : ''
      } ${CARD_STYLES[order.status]}`}
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
            {order.status !== 'completed' && (
              <OrderAgeIndicator createdAt={order.createdAt} thresholdMins={thresholdMins} />
            )}
          </div>
        </div>

        {/* Allergy Warning Box (impossible to miss) */}
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
          {isDelivery && order.deliveryAddress && (
            <p className="text-white/70">
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
          {(order.items || []).map((item, idx) => {
            const summary = formatItemSummary(item);
            return (
              <div key={idx} className="bg-black/30 p-2 rounded border border-white/5">
                <p className="font-bold text-sm text-white">
                  {item.quantity}× {item.name}
                </p>

                {/* Customizations */}
                <div className="text-xs space-y-0.5 mt-1">
                  {summary.proteinSwap && (
                    <p className="text-brand-gold font-medium">({summary.proteinSwap})</p>
                  )}
                  {summary.riceSwap && (
                    <p className="text-brand-gold font-medium">({summary.riceSwap})</p>
                  )}
                  {summary.removed && <p className="text-red-400 font-medium">{summary.removed}</p>}
                  {summary.addedSauce && (
                    <p className="text-yellow-400 font-medium">{summary.addedSauce}</p>
                  )}
                  {summary.addons.map((a, i) => (
                    <p key={i} className="text-white/80">
                      +{a}
                    </p>
                  ))}
                  {summary.instructions && (
                    <p className="italic text-white/50">&quot;{summary.instructions}&quot;</p>
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

        <button
          onClick={handlePrintClick}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition-colors flex items-center gap-1 font-medium ml-auto"
        >
          🖨️ Skriv ut
        </button>
      </div>
    </div>
  );
}
