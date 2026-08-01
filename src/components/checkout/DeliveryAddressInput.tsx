/**
 * Address input for delivery orders.
 *
 * Two entry methods:
 * 1. GPS button — browser gets location, API reverse geocodes
 *    to fill all address fields automatically.
 * 2. Manual split fields — street, apartment, postal code, city.
 *
 * After address is confirmed, delivery validation runs against
 * the API and a live map preview appears on success.
 *
 * @param form - Full form state, used to read address fields.
 * @param onFieldChange - Updates a single form field.
 * @param onCoordinatesChange - Called with lat/lng from GPS.
 * @param onValidationResult - Passes delivery check result up.
 * @param subtotal - Current cart subtotal for fee calculation.
 */

'use client';

import { useState } from 'react';
import type { CheckoutFormData, DeliveryCheckResult } from '@/types/checkout';
import { buildFullAddress } from '@/types/checkout';

type DeliveryAddressInputProps = {
  form: CheckoutFormData;
  onFieldChange: (field: keyof CheckoutFormData, value: string) => void;
  onCoordinatesChange: (lat: number, lng: number) => void;
  onValidationResult: (result: DeliveryCheckResult | null) => void;
  subtotal: number;
};

type GpsState = 'idle' | 'loading' | 'success' | 'error';

export default function DeliveryAddressInput({
  form,
  onFieldChange,
  onCoordinatesChange,
  onValidationResult,
  subtotal,
}: DeliveryAddressInputProps) {
  const [gpsState, setGpsState] = useState<GpsState>('idle');
  const [gpsError, setGpsError] = useState('');
  const [gpsImprecise, setGpsImprecise] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<DeliveryCheckResult | null>(null);
  const [mapCoords, setMapCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  /**
   * Gets GPS location and calls the reverse geocode API
   * which returns structured address fields (not a formatted string).
   */
  async function handleUseLocation() {
    if (!navigator.geolocation) {
      setGpsError('Din enhet stöder inte platstjänster.');
      return;
    }
    setGpsState('loading');
    setGpsError('');
    setGpsImprecise(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch('/api/geocode/reverse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lng: longitude }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);

          if (data.imprecise) {
            // Google only resolved an approximate area (Plus Code etc.).
            // Leave fields empty; show a neutral prompt to fill manually.
            setGpsState('success');
            setGpsImprecise(true);
            return;
          }

          // Fill only the fields that were resolved; leave the rest for the
          // customer to complete (e.g. postalCode or city may be missing)
          if (data.streetAddress) onFieldChange('streetAddress', data.streetAddress);
          if (data.postalCode) onFieldChange('postalCode', data.postalCode);
          if (data.city) onFieldChange('city', data.city);

          setGpsState('success');
          onCoordinatesChange(latitude, longitude);
          setMapCoords({ lat: latitude, lng: longitude });

          // Auto-validate using the resolved address string
          const resolvedAddress = [
            data.streetAddress,
            data.postalCode && data.city
              ? `${data.postalCode} ${data.city}`
              : data.city || data.postalCode,
            'Sverige',
          ]
            .filter(Boolean)
            .join(', ');

          await validateDelivery(resolvedAddress, subtotal, latitude, longitude);
        } catch {
          setGpsState('error');
          setGpsError('Kunde inte hämta din adress.');
        }
      },
      (error) => {
        setGpsState('error');
        // PERMISSION_DENIED is the only case with a user-actionable message
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError('Platstillstånd nekades. Fyll i adressen manuellt.');
        } else {
          setGpsError('Kunde inte hämta din plats.');
        }
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }

  /**
   * Validates the full address against the delivery radius API.
   * Called after GPS success or when the customer clicks Kontrollera.
   */
  async function validateDelivery(
    fullAddress: string,
    orderSubtotal: number,
    lat?: number,
    lng?: number,
  ) {
    if (!fullAddress.trim()) return;
    setValidating(true);
    setValidationResult(null);
    onValidationResult(null);

    try {
      const response = await fetch('/api/delivery/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: fullAddress,
          subtotal: orderSubtotal,
        }),
      });
      const result: DeliveryCheckResult = await response.json();
      setValidationResult(result);
      onValidationResult(result);

      // Show map pin only after a successful validation
      if (result.eligible && lat && lng) {
        setMapCoords({ lat, lng });
        onCoordinatesChange(lat, lng);
      }
    } catch {
      setValidationResult({
        eligible: false,
        distanceKm: 0,
        deliveryFee: 0,
        isFreeDelivery: false,
        message: 'Kunde inte kontrollera leverans.',
      });
    } finally {
      setValidating(false);
    }
  }

  function handleCheckDelivery() {
    const fullAddress = buildFullAddress(form);
    validateDelivery(fullAddress, subtotal);
  }

  const canCheck = form.streetAddress.trim().length > 0 && form.postalCode.trim().length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* GPS button */}
      <button
        type="button"
        onClick={handleUseLocation}
        disabled={gpsState === 'loading'}
        className="flex items-center gap-3 px-4 py-3
                   border border-brand-gold/30 rounded-sm
                   text-brand-gold/80 text-sm
                   hover:border-brand-gold/60 hover:text-brand-gold
                   transition-colors disabled:opacity-50
                   disabled:cursor-not-allowed"
      >
        <span className="text-xl">{gpsState === 'loading' ? '⏳' : '📍'}</span>
        <div className="text-left">
          <p
            className="font-display text-sm uppercase
                        tracking-widest"
          >
            {gpsState === 'loading' ? 'Hämtar din plats...' : 'Använd min plats'}
          </p>
          <p
            className="text-xs text-white/30 mt-0.5
                        normal-case tracking-normal font-body"
          >
            Fyll i adressfälten automatiskt
          </p>
        </div>
      </button>

      {gpsError && <p className="text-red-400 text-xs">{gpsError}</p>}
      {gpsImprecise && !gpsError && (
        <p className="text-white/40 text-xs">
          Kunde inte hitta en exakt adress. Vänligen fyll i adressen manuellt.
        </p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/25 text-xs">eller fyll i manuellt</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Split address fields */}
      <div className="flex flex-col gap-3">
        {/* Street address */}
        <div>
          <label
            className="text-xs text-white/40 uppercase
                            tracking-widest mb-1.5 block"
          >
            Gatuadress *
          </label>
          <input
            type="text"
            value={form.streetAddress}
            onChange={(e) => {
              onFieldChange('streetAddress', e.target.value);
              setValidationResult(null);
              onValidationResult(null);
              setMapCoords(null);
            }}
            placeholder="Bohustgatan 12"
            autoComplete="street-address"
            className="w-full bg-black/40 border border-white/10
                       rounded-sm px-3 py-3 text-sm text-white
                       placeholder:text-white/25
                       focus:outline-none focus:border-brand-gold/40"
          />
        </div>

        {/* Apartment / floor — optional */}
        <div>
          <label
            className="text-xs text-white/40 uppercase
                            tracking-widest mb-1.5 block"
          >
            Lägenhet / Våning
            <span
              className="text-white/20 normal-case
                             tracking-normal ml-1"
            >
              (valfritt)
            </span>
          </label>
          <input
            type="text"
            value={form.apartment}
            onChange={(e) => onFieldChange('apartment', e.target.value)}
            placeholder="Lägenhet 1302, 4 tr"
            autoComplete="address-line2"
            className="w-full bg-black/40 border border-white/10
                       rounded-sm px-3 py-3 text-sm text-white
                       placeholder:text-white/25
                       focus:outline-none focus:border-brand-gold/40"
          />
        </div>

        {/* Postal code + city on same row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="text-xs text-white/40 uppercase
                              tracking-widest mb-1.5 block"
            >
              Postnummer *
            </label>
            <input
              type="text"
              value={form.postalCode}
              onChange={(e) => {
                onFieldChange('postalCode', e.target.value);
                setValidationResult(null);
                onValidationResult(null);
                setMapCoords(null);
              }}
              placeholder="504 35"
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={6}
              className="w-full bg-black/40 border border-white/10
                         rounded-sm px-3 py-3 text-sm text-white
                         placeholder:text-white/25
                         focus:outline-none focus:border-brand-gold/40"
            />
          </div>
          <div>
            <label
              className="text-xs text-white/40 uppercase
                              tracking-widest mb-1.5 block"
            >
              Stad
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => onFieldChange('city', e.target.value)}
              placeholder="Borås"
              autoComplete="address-level2"
              className="w-full bg-black/40 border border-white/10
                         rounded-sm px-3 py-3 text-sm text-white
                         placeholder:text-white/25
                         focus:outline-none focus:border-brand-gold/40"
            />
          </div>
        </div>

        {/* Check delivery button */}
        <button
          type="button"
          onClick={handleCheckDelivery}
          disabled={!canCheck || validating}
          className="w-full py-3 border border-brand-gold/30
                     text-brand-gold font-display text-sm
                     uppercase tracking-widest rounded-sm
                     hover:bg-brand-gold/10 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {validating ? 'Kontrollerar...' : 'Kontrollera leverans'}
        </button>
      </div>

      {/* Validation result */}
      {validationResult && (
        <div
          className={`px-4 py-3 rounded-sm text-sm
                         flex items-start gap-2
                         ${
                           validationResult.eligible
                             ? 'bg-green-500/10 border border-green-500/20'
                             : 'bg-red-500/10 border border-red-500/20'
                         }`}
        >
          <span className="shrink-0">{validationResult.eligible ? '✓' : '✕'}</span>
          <div>
            <p className={validationResult.eligible ? 'text-green-400' : 'text-red-400'}>
              {validationResult.message}
            </p>
            {validationResult.eligible && !validationResult.isFreeDelivery && (
              <p className="text-white/40 text-xs mt-0.5">
                Avstånd: {validationResult.distanceKm} km
              </p>
            )}
          </div>
        </div>
      )}

      {/* Live map preview — shown after successful validation */}
      {mapCoords && validationResult?.eligible && MAPS_KEY && (
        <div
          className="rounded-sm overflow-hidden
                        border border-white/10"
        >
          <div
            className="px-3 py-2 bg-white/5 flex items-center
                          gap-2 border-b border-white/10"
          >
            <span
              className="text-xs text-white/40 uppercase
                             tracking-widest"
            >
              📍 Din leveransplats
            </span>
          </div>
          <iframe
            title="Din leveransadress på kartan"
            width="100%"
            height="200"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={
              `https://www.google.com/maps/embed/v1/place` +
              `?key=${MAPS_KEY}` +
              `&q=${mapCoords.lat},${mapCoords.lng}` +
              `&center=${mapCoords.lat},${mapCoords.lng}` +
              `&zoom=17`
            }
          />
        </div>
      )}
    </div>
  );
}
