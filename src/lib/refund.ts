/**
 * Refund processing helper for admin dashboard.
 * Encapsulates order refund execution and database persistence.
 *
 * NOTE: This is where a real Swedbank Pay refund API call (e.g., POST /psp/swish/payments/{id}/refunds)
 * will be placed once payment gateway integration is active.
 */

import { getServerClient } from '@/lib/supabase';
import type { RefundStatus } from '@/types/order';

export type ExecuteRefundInput = {
  orderId: string;
  refundStatus: RefundStatus;
  refundAmountKr: number;
  refundReason: string;
};

export type ExecuteRefundResult = {
  success: boolean;
  orderId: string;
  refundStatus: RefundStatus;
  refundAmountKr: number;
  refundedAt: string;
};

/**
 * Executes a refund on a given order in the Supabase database.
 * Updates refund_status, refund_amount_kr, refund_reason, and refunded_at.
 */
export async function executeRefund(input: ExecuteRefundInput): Promise<ExecuteRefundResult> {
  const { orderId, refundStatus, refundAmountKr, refundReason } = input;
  const refundedAt = new Date().toISOString();

  // ---------------------------------------------------------------------------
  // TODO: Swedbank Pay API Integration point
  // await swedbankPayClient.refundPayment({ orderId, amount: refundAmountKr });
  // ---------------------------------------------------------------------------

  const supabase = getServerClient();
  const { error } = await supabase
    .from('orders')
    .update({
      refund_status: refundStatus,
      refund_amount_kr: refundAmountKr,
      refund_reason: refundReason.trim(),
      refunded_at: refundedAt,
    })
    .eq('id', orderId);

  if (error) {
    console.error('[refund] Supabase update error:', error);
    throw new Error('Kunde inte spara återbetalning i databasen');
  }

  return {
    success: true,
    orderId,
    refundStatus,
    refundAmountKr,
    refundedAt,
  };
}
