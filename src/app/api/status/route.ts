/**
 * GET /api/status
 *
 * Returns the current restaurant status.
 * Called by the order page on load and every
 * 60 seconds to keep the status banner current.
 *
 * Also returns item availability so the order
 * page knows which items to grey out.
 *
 * Response is cached for 30 seconds to avoid
 * hammering Supabase on every page load.
 */

import { NextResponse } from 'next/server'
import { getConfig } from '@/lib/getConfig'
import { getRestaurantStatus } from '@/lib/openingHours'
import { getServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const [config, supabase] = await Promise.all([
      getConfig(),
      Promise.resolve(getServerClient()),
    ])

    const status = getRestaurantStatus(config)

    // Fetch unavailable items
    const { data: unavailableItems } = await supabase
      .from('item_availability')
      .select('menu_item_id')
      .eq('available', false)

    const unavailableIds = (unavailableItems ?? [])
      .map(row => row.menu_item_id)

    return NextResponse.json({
      state: status.state,
      message: status.message,
      nextOpenTime: status.nextOpenTime,
      estimatedDeliveryMins: status.estimatedDeliveryMins,
      estimatedPickupMins: status.estimatedPickupMins,
      unavailableItemIds: unavailableIds,
      deliveryEnabled: config.deliveryEnabled,
      pickupEnabled: config.pickupEnabled,
    }, {
      headers: {
        // Cache for 30 seconds
        'Cache-Control': 'public, s-maxage=30',
      }
    })
  } catch (error) {
    console.error('Status API error:', error)
    return NextResponse.json(
      { error: 'Could not fetch restaurant status' },
      { status: 500 }
    )
  }
}
