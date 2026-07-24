/**
 * POST /api/delivery/validate
 *
 * Validates whether a customer address is within
 * the restaurant delivery radius and calculates
 * the delivery fee.
 *
 * Always called server-side before saving an order.
 * Client-side validation is for UX only —
 * this is the authoritative check.
 *
 * Request body:
 *   { address: string, subtotal: number }
 *
 * Response:
 *   { eligible, distanceKm, deliveryFee,
 *     isFreeDelivery, message }
 */

import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress } from '@/lib/geocode'
import { calculateDistanceKm } from '@/lib/haversine'
import { getConfig } from '@/lib/getConfig'
import type { DeliveryValidation } from '@/types/delivery'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, subtotal } = body

    // Validate required fields
    if (!address || typeof address !== 'string' || !address.trim()) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    if (typeof subtotal !== 'number' || subtotal < 0) {
      return NextResponse.json(
        { error: 'Valid subtotal is required' },
        { status: 400 }
      )
    }

    // Load config from Supabase
    const config = await getConfig()

    // Check if restaurant is accepting orders
    if (!config.isOpen) {
      return NextResponse.json(
        { error: 'Restaurant is currently closed' },
        { status: 503 }
      )
    }

    // Geocode the customer address
    const geocodeResult = await geocodeAddress(address)

    if (!geocodeResult.success) {
      return NextResponse.json(
        { error: geocodeResult.error },
        { status: 422 }
      )
    }

    // Calculate distance from restaurant
    const restaurantCoords = {
      lat: config.restaurantLat,
      lng: config.restaurantLng,
    }

    const distanceKm = calculateDistanceKm(
      restaurantCoords,
      geocodeResult.coordinates
    )

    // Check if within delivery radius
    if (distanceKm > config.deliveryRadiusKm) {
      const result: DeliveryValidation = {
        eligible: false,
        distanceKm: Math.round(distanceKm * 10) / 10,
        deliveryFee: 0,
        isFreeDelivery: false,
        message: `Tyvärr levererar vi inte till din adress. Du är ${
          Math.round(distanceKm * 10) / 10
        } km från oss och vi levererar inom ${config.deliveryRadiusKm} km.`,
      }
      return NextResponse.json(result)
    }

    // Calculate delivery fee
    const isFreeDelivery = subtotal >= config.freeDeliveryThresholdKr
    const deliveryFee = isFreeDelivery ? 0 : config.deliveryFeeKr

    const result: DeliveryValidation = {
      eligible: true,
      distanceKm: Math.round(distanceKm * 10) / 10,
      deliveryFee,
      isFreeDelivery,
      message: isFreeDelivery
        ? 'Gratis leverans på din beställning!'
        : `Leveransavgift: ${deliveryFee} kr`,
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Delivery validation error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
