/**
 * Address input for delivery orders.
 * Two methods:
 * 1. GPS button — browser gets location, 
 *    API reverse geocodes to address
 * 2. Manual text input
 *
 * After address is set (either way), delivery
 * validation runs automatically against the API.
 */

'use client'

import { useState } from 'react'
import type { DeliveryCheckResult } from '@/types/checkout'

type DeliveryAddressInputProps = {
  address: string
  subtotal: number
  onAddressChange: (address: string) => void
  onValidationResult: (
    result: DeliveryCheckResult | null,
    lat?: number,
    lng?: number
  ) => void
}

type GpsState = 'idle' | 'loading' | 'success' | 'error'

export default function DeliveryAddressInput({
  address,
  subtotal,
  onAddressChange,
  onValidationResult,
}: DeliveryAddressInputProps) {
  const [gpsState, setGpsState] = useState<GpsState>('idle')
  const [gpsError, setGpsError] = useState('')
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] =
    useState<DeliveryCheckResult | null>(null)

  /**
   * Gets the device GPS location and reverse geocodes
   * it to a street address via our API.
   * Only works on HTTPS or localhost.
   */
  async function handleUseLocation() {
    if (!navigator.geolocation) {
      setGpsError('Din enhet stöder inte platstjänster.')
      return
    }

    setGpsState('loading')
    setGpsError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Reverse geocode the coordinates server-side
          const response = await fetch('/api/geocode/reverse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: latitude,
              lng: longitude,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error)
          }

          setGpsState('success')
          onAddressChange(data.address)

          // Auto-validate delivery with the GPS coordinates
          await validateDelivery(
            data.address,
            latitude,
            longitude
          )
        } catch (error) {
          setGpsState('error')
          setGpsError('Kunde inte hämta din adress.')
        }
      },
      (error) => {
        setGpsState('error')
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError(
            'Platstillstånd nekades. Ange adressen manuellt.'
          )
        } else {
          setGpsError('Kunde inte hämta din plats.')
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  /**
   * Validates the address against the delivery radius API.
   * Called after GPS success or when manual address is submitted.
   */
  async function validateDelivery(
    addressToValidate: string,
    lat?: number,
    lng?: number
  ) {
    if (!addressToValidate.trim()) return

    setValidating(true)
    setValidationResult(null)
    onValidationResult(null)

    try {
      const response = await fetch('/api/delivery/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: addressToValidate,
          subtotal,
        }),
      })

      const result: DeliveryCheckResult = await response.json()
      setValidationResult(result)
      onValidationResult(result, lat, lng)
    } catch {
      setValidationResult({
        eligible: false,
        distanceKm: 0,
        deliveryFee: 0,
        isFreeDelivery: false,
        message: 'Kunde inte kontrollera leverans. Försök igen.',
      })
    } finally {
      setValidating(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">

      {/* GPS button */}
      <button
        type="button"
        onClick={handleUseLocation}
        disabled={gpsState === 'loading'}
        className="flex items-center gap-3 px-4 py-3
                   border border-brand-gold/30 rounded-sm
                   text-brand-gold/80 text-sm
                   hover:border-brand-gold/60
                   hover:text-brand-gold
                   transition-colors disabled:opacity-50
                   disabled:cursor-not-allowed"
      >
        <span className="text-lg">
          {gpsState === 'loading' ? '⏳' : '📍'}
        </span>
        <div className="text-left">
          <p className="font-display text-sm uppercase
                        tracking-widest">
            {gpsState === 'loading'
              ? 'Hämtar din plats...'
              : 'Använd min plats'}
          </p>
          <p className="text-xs text-white/30 mt-0.5 normal-case
                        tracking-normal font-body">
            Automatisk adressfyllning
          </p>
        </div>
      </button>

      {gpsError && (
        <p className="text-red-400 text-xs">{gpsError}</p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/25 text-xs">eller</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Manual address input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={e => {
            onAddressChange(e.target.value)
            setValidationResult(null)
            onValidationResult(null)
          }}
          placeholder="Din gatuadress, Borås"
          className="flex-1 bg-black/40 border border-white/10
                     rounded-sm px-3 py-3 text-sm text-white
                     placeholder:text-white/25
                     focus:outline-none focus:border-brand-gold/40"
        />
        <button
          type="button"
          onClick={() => validateDelivery(address)}
          disabled={!address.trim() || validating}
          className="px-4 py-3 bg-brand-gold/10 text-brand-gold
                     border border-brand-gold/30 rounded-sm
                     text-sm font-display uppercase tracking-wide
                     hover:bg-brand-gold/20 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed
                     whitespace-nowrap"
        >
          {validating ? '...' : 'Kontrollera'}
        </button>
      </div>

      {/* Validation result */}
      {validationResult && (
        <div className={`px-4 py-3 rounded-sm text-sm
                         flex items-start gap-2
                         ${validationResult.eligible
                           ? 'bg-green-500/10 border border-green-500/20'
                           : 'bg-red-500/10 border border-red-500/20'
                         }`}>
          <span>{validationResult.eligible ? '✓' : '✕'}</span>
          <div>
            <p className={validationResult.eligible
              ? 'text-green-400'
              : 'text-red-400'}>
              {validationResult.message}
            </p>
            {validationResult.eligible &&
             validationResult.isFreeDelivery && (
              <p className="text-green-300/70 text-xs mt-0.5">
                Gratis leverans på din beställning!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
