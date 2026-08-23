import { Resend } from 'resend';
import type { Order } from '@/types/order';
import { formatItemSummary } from '@/lib/formatItemSummary';

// TEMPORARY: using Resend's shared test domain until
// streetdudes.se DNS verification is complete (blocked
// on Loopia access — see project notes). Swap this one
// line to 'Street Dudes <orders@streetdudes.se>' once
// domain verification is done — no other code should
// need to change.
export const EMAIL_FROM_ADDRESS = 'Street Dudes <onboarding@resend.dev>';

// Restaurant contact details shown in the email footer. Kept here rather
// than inline in the template so changing them is a single edit.
export const RESTAURANT_CONTACT = {
  name: 'Street Dudes Borås',
  address: 'Alingsåsvägen 40, 504 38 Borås',
  phoneDisplay: '0705-937920',
  phoneHref: '+46705937920',
};

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export function buildOrderConfirmationEmail(
  order: Order,
  locale: 'sv' | 'en',
): { subject: string; html: string } {
  const isEn = locale === 'en';

  const subject = isEn
    ? `Your order #${order.orderNumber} is confirmed — Street Dudes`
    : `Din beställning #${order.orderNumber} är bekräftad — Street Dudes`;

  const brandGold = '#F5A500';
  const brandBlack = '#0b0b0b';

  // Build items HTML
  let itemsHtml = '';
  for (const item of order.items) {
    const summary = formatItemSummary(item);
    const details = [];
    if (summary.proteinSwap) details.push(summary.proteinSwap);
    if (summary.riceSwap) details.push(summary.riceSwap);
    if (summary.removed) details.push(summary.removed);
    if (summary.addedSauce) details.push(summary.addedSauce);
    if (summary.addons.length > 0) details.push(...summary.addons);
    if (summary.instructions) details.push(`"${summary.instructions}"`);

    const detailsHtml =
      details.length > 0
        ? `<div style="font-size: 13px; color: #666; margin-top: 4px;">${details.join(' &middot; ')}</div>`
        : '';

    itemsHtml += `
      <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #eaeaea;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="left" valign="top" style="font-weight: bold; padding-right: 16px;">${item.quantity}x ${item.name}</td>
            <td align="right" valign="top" style="font-weight: bold; white-space: nowrap;">${item.totalPrice} kr</td>
          </tr>
        </table>
        ${detailsHtml}
      </div>
    `;
  }

  const fulfillmentText =
    order.fulfillmentType === 'delivery'
      ? isEn
        ? 'Delivery to:'
        : 'Leverans till:'
      : isEn
        ? 'Pickup at restaurant'
        : 'Upphämtning i restaurangen';

  let addressHtml = '';
  if (order.fulfillmentType === 'delivery') {
    const apartment = String(order.deliveryApartment ?? '').trim();
    const address = String(order.deliveryAddress ?? '').trim();
    const showApartment = apartment !== '' && !address.includes(apartment);
    const aptLabel = isEn ? 'Apt' : 'Lgh';
    const aptHtml = showApartment ? `<br/>${aptLabel} ${apartment}` : '';
    addressHtml = `<div style="margin-top: 4px;">${address}${aptHtml}</div>`;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: sans-serif; line-height: 1.5; color: ${brandBlack}; margin: 0; padding: 0; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: ${brandGold}; font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 0;">Street Dudes</h1>
            <div style="font-size: 18px; margin-top: 8px; font-weight: bold;">${isEn ? 'Order Confirmed' : 'Order bekräftad'}</div>
            <div style="color: #666; margin-top: 4px;">#${order.orderNumber}</div>
          </div>

          <div style="margin-bottom: 32px;">
            <div style="font-weight: bold;">${isEn ? 'Customer Details' : 'Kunduppgifter'}</div>
            <div>${order.customerName}</div>
            <div>${order.customerEmail}</div>
            <div>${order.customerPhone}</div>
          </div>

          <div style="margin-bottom: 32px;">
            <div style="font-size: 14px; text-transform: uppercase; color: #666; letter-spacing: 1px; margin-bottom: 8px; border-bottom: 2px solid ${brandGold}; display: inline-block; padding-bottom: 4px;">${isEn ? 'Fulfillment' : 'Leveranssätt'}</div>
            <div style="font-weight: bold;">${fulfillmentText}</div>
            ${addressHtml}
            ${order.deliveryNotes ? `<div style="margin-top: 8px; font-style: italic;">"${order.deliveryNotes}"</div>` : ''}
          </div>

          <div style="margin-bottom: 32px;">
            <div style="font-size: 14px; text-transform: uppercase; color: #666; letter-spacing: 1px; margin-bottom: 8px; border-bottom: 2px solid ${brandGold}; display: inline-block; padding-bottom: 4px;">${isEn ? 'Order Summary' : 'Beställning'}</div>
            ${itemsHtml}
            
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
              <tr>
                <td width="50%"></td>
                <td width="50%">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="left" style="padding-bottom: 8px;">Subtotal</td>
                      <td align="right" style="padding-bottom: 8px;">${order.subtotal} kr</td>
                    </tr>
                    <tr>
                      <td align="left" style="padding-bottom: 8px;">${isEn ? 'Delivery Fee' : 'Utkörningsavgift'}</td>
                      <td align="right" style="padding-bottom: 8px;">${order.deliveryFee} kr</td>
                    </tr>
                    <tr>
                      <td align="left" style="font-weight: bold; font-size: 18px; padding-top: 16px; border-top: 2px solid ${brandBlack};">Total</td>
                      <td align="right" style="font-weight: bold; font-size: 18px; padding-top: 16px; border-top: 2px solid ${brandBlack};">${order.total} kr</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 48px; padding-top: 32px; border-top: 1px solid #eaeaea; font-size: 13px; color: #666;">
            <div style="font-weight: bold; color: ${brandBlack}; margin-bottom: 8px;">${RESTAURANT_CONTACT.name}</div>
            <div>${RESTAURANT_CONTACT.address}</div>
            <div style="margin-top: 4px;"><a href="tel:${RESTAURANT_CONTACT.phoneHref}" style="color: #666;">${RESTAURANT_CONTACT.phoneDisplay}</a></div>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
}

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  if (!resend) {
    console.log(
      '[email] RESEND_API_KEY is not set. Skipping order confirmation email for order:',
      order.orderNumber,
    );
    return;
  }

  const locale = order.locale || 'sv';
  const { subject, html } = buildOrderConfirmationEmail(order, locale);

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM_ADDRESS,
      to: order.customerEmail,
      subject,
      html,
    });

    if (error) {
      console.error(
        '[email] Failed to send order confirmation for order:',
        order.orderNumber,
        error,
      );
    } else {
      console.log('[email] Sent order confirmation for order:', order.orderNumber);
    }
  } catch (err) {
    console.error(
      '[email] Unexpected error sending order confirmation for order:',
      order.orderNumber,
      err,
    );
  }
}
