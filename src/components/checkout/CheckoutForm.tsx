/**
 * The main checkout form.
 * Collects fulfillment type, split delivery address,
 * customer details, delivery instructions, and allergy notes.
 * Submits to POST /api/orders on confirmation.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCart } from '@/context/CartContext';
import DeliveryAddressInput from './DeliveryAddressInput';
import CheckoutSummary from './CheckoutSummary';
import type { CheckoutFormData, DeliveryCheckResult } from '@/types/checkout';
import { EMPTY_FORM, buildFullAddress } from '@/types/checkout';

export default function CheckoutForm() {
  const { cart, emptyCart } = useCart();
  const router = useRouter();
  const locale = useLocale();

  const [form, setForm] = useState<CheckoutFormData>(EMPTY_FORM);
  const [deliveryResult, setDeliveryResult] = useState<DeliveryCheckResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const deliveryFee = form.fulfillmentType === 'delivery' ? (deliveryResult?.deliveryFee ?? 0) : 0;

  const total = cart.subtotal + deliveryFee;

  /** Updates a single string form field */
  function updateField(field: keyof CheckoutFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  /**
   * Validates the form before submission.
   * Returns an error message or null if valid.
   */
  function validateForm(): string | null {
    if (!form.customerName.trim()) {
      return 'Ange ditt namn';
    }
    if (!form.customerEmail.trim() || !form.customerEmail.includes('@')) {
      return 'Ange en giltig e-postadress';
    }
    if (form.fulfillmentType === 'delivery') {
      if (!form.streetAddress.trim()) {
        return 'Ange din gatuadress';
      }
      if (!form.postalCode.trim()) {
        return 'Ange ditt postnummer';
      }
      if (!deliveryResult?.eligible) {
        return 'Kontrollera leverans till din adress';
      }
      if (!form.customerPhone.trim()) {
        return 'Ange ditt telefonnummer för leverans';
      }
    }
    return null;
  }

  /** Submits the order to the API */
  async function handleSubmit() {
    const error = validateForm();
    if (error) {
      setSubmitError(error);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          customerEmail: form.customerEmail.trim(),
          customerPhone: form.customerPhone.trim(),
          fulfillmentType: form.fulfillmentType,
          deliveryAddress: form.fulfillmentType === 'delivery' ? buildFullAddress(form) : null,
          deliveryApartment: form.apartment.trim() || null,
          deliveryPostalCode: form.postalCode.trim() || null,
          deliveryCity: form.city.trim() || null,
          deliveryLat: form.deliveryLat,
          deliveryLng: form.deliveryLng,
          items: cart.items,
          deliveryNotes: form.deliveryNotes.trim(),
          allergyNotes: form.allergyNotes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Surface the specific error from the API (restaurant closed,
        // outside radius, etc.) rather than a generic message
        setSubmitError(data.error || 'Något gick fel. Försök igen.');
        return;
      }

      // Clear cart and redirect to confirmation page
      emptyCart();
      router.push(`/${locale}/order-confirmation/${data.orderNumber}`);
    } catch {
      // Only hits here if the network request itself failed
      setSubmitError('Kunde inte nå servern. Kontrollera din internetanslutning och försök igen.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Section 1 — Fulfillment type */}
      <section>
        <h2
          className="font-display text-white text-lg
                       uppercase tracking-widest mb-3"
        >
          Hur vill du ha din mat?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {(['delivery', 'pickup'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                updateField('fulfillmentType', type);
                setDeliveryResult(null);
              }}
              className={`py-4 rounded-sm border text-sm
                          font-display uppercase tracking-widest
                          transition-colors
                          ${
                            form.fulfillmentType === type
                              ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                              : 'border-white/10 text-white/50 hover:border-white/30'
                          }`}
            >
              {type === 'delivery' ? '🛵 Leverans' : '🏪 Upphämtning'}
            </button>
          ))}
        </div>
      </section>

      {/* Section 2 — Delivery address (delivery only) */}
      {form.fulfillmentType === 'delivery' && (
        <section>
          <h2
            className="font-display text-white text-lg
                         uppercase tracking-widest mb-3"
          >
            Leveransadress
          </h2>
          <DeliveryAddressInput
            form={form}
            subtotal={cart.subtotal}
            onFieldChange={updateField}
            onCoordinatesChange={(lat, lng) => {
              setForm((prev) => ({
                ...prev,
                deliveryLat: lat,
                deliveryLng: lng,
              }));
            }}
            onValidationResult={setDeliveryResult}
          />
        </section>
      )}

      {/* Section 3 — Customer details */}
      <section>
        <h2
          className="font-display text-white text-lg
                       uppercase tracking-widest mb-3"
        >
          Dina uppgifter
        </h2>
        <div className="flex flex-col gap-3">
          {/* Name */}
          <div>
            <label
              className="text-xs text-white/40 uppercase
                              tracking-widest mb-1.5 block"
            >
              Namn *
            </label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => updateField('customerName', e.target.value)}
              placeholder="För- och efternamn"
              autoComplete="name"
              className="w-full bg-black/40 border border-white/10
                         rounded-sm px-3 py-3 text-sm text-white
                         placeholder:text-white/25
                         focus:outline-none focus:border-brand-gold/40"
            />
          </div>

          {/* Email */}
          <div>
            <label
              className="text-xs text-white/40 uppercase
                              tracking-widest mb-1.5 block"
            >
              E-post *
            </label>
            <input
              type="email"
              value={form.customerEmail}
              onChange={(e) => updateField('customerEmail', e.target.value)}
              placeholder="din@email.com"
              autoComplete="email"
              className="w-full bg-black/40 border border-white/10
                         rounded-sm px-3 py-3 text-sm text-white
                         placeholder:text-white/25
                         focus:outline-none focus:border-brand-gold/40"
            />
          </div>

          {/* Phone */}
          <div>
            <label
              className="text-xs text-white/40 uppercase
                              tracking-widest mb-1.5 block"
            >
              Telefon
              {form.fulfillmentType === 'delivery' ? ' *' : ' (valfritt)'}
            </label>
            <input
              type="tel"
              value={form.customerPhone}
              onChange={(e) => updateField('customerPhone', e.target.value)}
              placeholder="07XX-XXX XXX"
              autoComplete="tel"
              className="w-full bg-black/40 border border-white/10
                         rounded-sm px-3 py-3 text-sm text-white
                         placeholder:text-white/25
                         focus:outline-none focus:border-brand-gold/40"
            />
            {form.fulfillmentType === 'delivery' && (
              <p className="text-xs text-white/25 mt-1">Leveransföraren kan behöva kontakta dig</p>
            )}
          </div>
        </div>
      </section>

      {/* Section 4 — Delivery notes */}
      <section>
        <h2
          className="font-display text-white text-lg
                       uppercase tracking-widest mb-1"
        >
          Leveransanteckningar
        </h2>
        <p className="text-white/30 text-xs mb-3">Instruktioner till leveransföraren</p>
        <textarea
          value={form.deliveryNotes}
          onChange={(e) => updateField('deliveryNotes', e.target.value)}
          placeholder="T.ex. Lämna utanför dörren, ring på 1302..."
          rows={2}
          className="w-full bg-black/40 border border-white/10
                     rounded-sm px-3 py-3 text-sm text-white
                     placeholder:text-white/25 resize-none
                     focus:outline-none focus:border-brand-gold/40"
        />
      </section>

      {/* Section 5 — Allergy and special requests */}
      <section>
        <h2
          className="font-display text-white text-lg
                       uppercase tracking-widest mb-1"
        >
          Allergier &amp; specialönskemål
        </h2>
        <p className="text-white/30 text-xs mb-3">Viktigt för köket att veta</p>
        <textarea
          value={form.allergyNotes}
          onChange={(e) => updateField('allergyNotes', e.target.value)}
          placeholder="T.ex. Jordnötsallergi, utan lök..."
          rows={2}
          className="w-full bg-black/40 border border-white/10
                     rounded-sm px-3 py-3 text-sm text-white
                     placeholder:text-white/25 resize-none
                     focus:outline-none focus:border-red-500/40"
        />
        {form.allergyNotes && (
          <div
            className="mt-2 flex items-center gap-2
                          text-amber-400 text-xs"
          >
            <span>⚠</span>
            <span>Allergiinformation skickas till köket</span>
          </div>
        )}
      </section>

      {/* Summary on mobile — shown between notes and submit */}
      <div className="lg:hidden">
        <CheckoutSummary deliveryFee={deliveryFee} fulfillmentType={form.fulfillmentType} />
      </div>

      {/* Error message */}
      {submitError && (
        <div
          className="px-4 py-3 bg-red-500/10
                        border border-red-500/20 rounded-sm"
        >
          <p className="text-red-400 text-sm">{submitError}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || (form.fulfillmentType === 'delivery' && !deliveryResult?.eligible)}
        className="w-full py-4 bg-brand-gold text-brand-black
                   font-display text-xl uppercase tracking-widest
                   rounded-sm hover:bg-yellow-400
                   transition-colors disabled:opacity-40
                   disabled:cursor-not-allowed"
      >
        {submitting ? 'Bearbetar...' : `Beställ nu — ${total} kr`}
      </button>

      <p className="text-center text-xs text-white/25">
        Betalning sker vid leverans eller upphämtning
      </p>
    </div>
  );
}
